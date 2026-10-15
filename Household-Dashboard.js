/* ==========================================================================
   Recycle Connect – Household Dashboard
   --------------------------------------------------------------------------
   Expected API (JSON, Bearer-token auth):

   GET  /household/dashboard
        -> { user: { name, avatarUrl },
             stats: { totalRecycledKg, co2SavedKg, rewardsEarned, collectionsCompleted },
             reminders: [ { title, message } ] }

   GET  /household/pickups?limit=100&sort=-date
        -> { data: [ { id, material, weightKg, status, date, ecoImpact? } ] }   (or a bare array)

   POST /household/pickups
        body: { material, weightKg, preferredDate }   (preferredDate = YYYY-MM-DD)
        -> the created pickup (same shape as above)

   GET  /household/pickups/:id/receipt
        -> file (PDF) as a binary response

   Field names are normalised in normalizePickup()/normalizeDashboard(), so
   small naming differences (weight_kg, scheduledAt, ...) are tolerated.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------------- *
   * 1. CONFIG
   * ---------------------------------------------------------------------- */
  const CONFIG = {
    API_BASE_URL: '/api/v1',          // <-- set to your backend, e.g. 'https://api.example.com/v1'
    TOKEN_KEY: 'rc_auth_token',       // localStorage key holding the user's JWT / access token
    LOGIN_URL: 'index.html',          // where to send the user if the token is rejected (401)
    LEARN_MORE_URL: 'index.html',
    REQUEST_TIMEOUT_MS: 10000,
    RECENT_COUNT: 5,
    // When true, a missing/unreachable backend (network error, 404, 405, 501)
    // falls back to in-memory demo data. Set to false in production.
    USE_MOCK_FALLBACK: true,
    CO2_KG_PER_KG: 2.5,               // only used to estimate impact when the API doesn't send one
  };

  const MATERIAL_ICONS = { Plastic: '♻️', Paper: '📄', Glass: '🍾', Metal: '🥫' };

  /* ---------------------------------------------------------------------- *
   * 2. SMALL HELPERS
   * ---------------------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const fmtKg = (n) => `${(Number(n) || 0).toFixed(1)} kg`;

  const dateFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
  };

  const debounce = (fn, ms = 200) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------------------------------------------------------------------- *
   * 3. TOASTS
   * ---------------------------------------------------------------------- */
  const toastContainer = $('#toastContainer');

  function toast(message, type = 'info', ms = 3500) {
    if (!toastContainer) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  /* ---------------------------------------------------------------------- *
   * 4. API LAYER
   * ---------------------------------------------------------------------- */
  class ApiError extends Error {
    constructor(message, status = 0, details = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.details = details;
    }
  }

  const getToken = () => {
    try { return localStorage.getItem(CONFIG.TOKEN_KEY); } catch { return null; }
  };

  async function request(path, { method = 'GET', body, query, raw = false } = {}) {
    const url = new URL(CONFIG.API_BASE_URL.replace(/\/$/, '') + path, window.location.origin);
    if (query) Object.entries(query).forEach(([k, v]) => v != null && url.searchParams.set(k, v));

    const headers = { Accept: raw ? '*/*' : 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

    let res;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        credentials: 'include',
      });
    } catch (err) {
      throw new ApiError(err.name === 'AbortError' ? 'The request timed out.' : 'Network error. Please check your connection.', 0);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      let payload = null;
      try { payload = await res.json(); } catch { /* non-JSON error body */ }
      const msg = payload?.message || payload?.error || `Request failed (${res.status})`;
      throw new ApiError(msg, res.status, payload);
    }

    if (raw) return res.blob();
    if (res.status === 204) return null;
    try { return await res.json(); } catch { throw new ApiError('Invalid response from server.', res.status); }
  }

  /* --- Normalisers: tolerate snake_case / alternate names from the backend --- */
  function normalizePickup(p) {
    const weightKg = Number(p.weightKg ?? p.weight_kg ?? p.weight ?? 0);
    return {
      id: String(p.id ?? p._id ?? ''),
      material: p.material ?? p.materialType ?? 'Plastic',
      weightKg,
      status: p.status ?? 'Completed',
      date: p.date ?? p.completedAt ?? p.scheduledAt ?? p.scheduled_at ?? p.createdAt ?? '',
      ecoImpact: p.ecoImpact ?? p.eco_impact ?? `${(weightKg * CONFIG.CO2_KG_PER_KG).toFixed(1)} kg CO₂ saved`,
    };
  }

  function normalizeDashboard(d) {
    const s = d?.stats ?? {};
    return {
      user: { name: d?.user?.name ?? d?.user?.firstName ?? '', avatarUrl: d?.user?.avatarUrl ?? d?.user?.avatar ?? '' },
      stats: {
        totalRecycledKg: Number(s.totalRecycledKg ?? s.total_recycled_kg ?? 0),
        co2SavedKg: Number(s.co2SavedKg ?? s.co2_saved_kg ?? 0),
        rewardsEarned: Number(s.rewardsEarned ?? s.rewards_earned ?? 0),
        collectionsCompleted: Number(s.collectionsCompleted ?? s.collections_completed ?? 0),
      },
      reminders: Array.isArray(d?.reminders) ? d.reminders : [],
    };
  }

  /* --- Demo backend (used only if the real API is unreachable) --- */
  const mock = (() => {
    const daysAgo = (n, h = 10) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 24, 0, 0); return d.toISOString(); };
    let pickups = [
      { id: 'RC-1006', material: 'Plastic', weightKg: 2.5, status: 'Completed', date: daysAgo(5) },
      { id: 'RC-1005', material: 'Paper', weightKg: 4.0, status: 'Completed', date: daysAgo(12, 14) },
      { id: 'RC-1004', material: 'Glass', weightKg: 6.0, status: 'Completed', date: daysAgo(19, 9) },
      { id: 'RC-1003', material: 'Metal', weightKg: 1.5, status: 'Completed', date: daysAgo(27, 16) },
      { id: 'RC-1002', material: 'Plastic', weightKg: 3.0, status: 'Completed', date: daysAgo(34, 11) },
      { id: 'RC-1001', material: 'Paper', weightKg: 2.0, status: 'Completed', date: daysAgo(41, 13) },
    ];
    const delay = (v) => new Promise((r) => setTimeout(() => r(v), 350));
    const computeStats = () => {
      const done = pickups.filter((p) => p.status === 'Completed');
      const total = done.reduce((s, p) => s + p.weightKg, 0);
      return {
        totalRecycledKg: total,
        co2SavedKg: total * CONFIG.CO2_KG_PER_KG,
        rewardsEarned: Math.floor(total / 2.5),
        collectionsCompleted: done.length,
      };
    };
    return {
      dashboard: () => delay({
        user: { name: 'Lillian' },
        stats: computeStats(),
        reminders: [{ title: 'Keep recycling!', message: "Your next collection is due soon. Let's keep the momentum going!" }],
      }),
      pickups: () => delay({ data: pickups.slice() }),
      create: ({ material, weightKg, preferredDate }) => {
        const p = { id: `RC-${Date.now().toString().slice(-6)}`, material, weightKg, status: 'Scheduled', date: `${preferredDate}T09:00:00` };
        pickups = [p, ...pickups];
        return delay(p);
      },
      receipt: (id) => {
        const p = pickups.find((x) => x.id === id);
        const text = [
          'RECYCLE CONNECT – PICKUP RECEIPT', '--------------------------------',
          `Reference : ${id}`, `Material  : ${p?.material}`, `Weight    : ${fmtKg(p?.weightKg)}`,
          `Status    : ${p?.status}`, `Date      : ${fmtDate(p?.date)}`, '', 'Thank you for recycling!',
        ].join('\n');
        return delay(new Blob([text], { type: 'text/plain' }));
      },
    };
  })();

  let usingMock = false;
  const shouldFallback = (err) => CONFIG.USE_MOCK_FALLBACK && err instanceof ApiError && [0, 404, 405, 501].includes(err.status);

  async function withFallback(realFn, mockFn) {
    if (usingMock) return mockFn();
    try {
      return await realFn();
    } catch (err) {
      if (shouldFallback(err)) {
        usingMock = true;
        console.warn('[Dashboard] API unreachable – using demo data.', err);
        toast('Backend not reachable – showing demo data.', 'info', 5000);
        return mockFn();
      }
      throw err;
    }
  }

  const api = {
    async getDashboard() {
      const raw = await withFallback(() => request('/household/dashboard'), mock.dashboard);
      return normalizeDashboard(raw);
    },
    async getPickups() {
      const raw = await withFallback(
        () => request('/household/pickups', { query: { limit: 100, sort: '-date' } }),
        mock.pickups
      );
      const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.pickups ?? [];
      return list.map(normalizePickup);
    },
    async createPickup(payload) {
      const raw = await withFallback(
        () => request('/household/pickups', { method: 'POST', body: payload }),
        () => mock.create(payload)
      );
      return normalizePickup(raw?.data ?? raw);
    },
    getReceipt(id) {
      return withFallback(
        () => request(`/household/pickups/${encodeURIComponent(id)}/receipt`, { raw: true }),
        () => mock.receipt(id)
      );
    },
  };

  function handleApiError(err, fallbackMsg) {
    console.error(err);
    if (err instanceof ApiError && err.status === 401) {
      toast('Your session has expired. Redirecting to sign in…', 'error');
      setTimeout(() => { window.location.href = CONFIG.LOGIN_URL; }, 1500);
      return;
    }
    toast(err?.message || fallbackMsg, 'error');
  }

  /* ---------------------------------------------------------------------- *
   * 5. STATE
   * ---------------------------------------------------------------------- */
  const state = {
    pickups: [],
    stats: null,
    reminders: [],
    query: '',
    historyFilter: 'all',
    selected: null,
  };

  const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

  /* ---------------------------------------------------------------------- *
   * 6. RENDERING
   * ---------------------------------------------------------------------- */
  const els = {
    list: $('#pickupList'),
    empty: $('#emptyState'),
    emptyDesc: $('#emptyDesc'),
    filterBar: $('#searchFilterStatus'),
    filterText: $('#filterStatusText'),
    historyList: $('#modalHistoryList'),
    search: $('#search'),
  };

  function pickupCardHTML(p) {
    return `
      <div class="pickup-card" role="listitem" tabindex="0" data-id="${esc(p.id)}">
        <div class="pickup-left">
          <div class="pickup-material-icon" aria-hidden="true">${MATERIAL_ICONS[p.material] || '♻️'}</div>
          <div>
            <div class="pickup-material-title">${esc(p.material)}</div>
            <div class="pickup-date-time">${esc(fmtDate(p.date))}</div>
          </div>
        </div>
        <div class="pickup-right">
          <span class="pickup-status-badge">${esc(p.status)}</span>
          <span class="pickup-weight">${esc(fmtKg(p.weightKg))}</span>
        </div>
      </div>`;
  }

  function matchesQuery(p, q) {
    if (!q) return true;
    const hay = [p.material, p.status, p.id, fmtDate(p.date), fmtKg(p.weightKg)].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every((term) => hay.includes(term));
  }

  function renderStats() {
    const s = state.stats;
    if (!s) return;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statTotalRecycled', fmtKg(s.totalRecycledKg));
    set('rightTotalRecycled', fmtKg(s.totalRecycledKg));
    set('statCo2Saved', fmtKg(s.co2SavedKg));
    set('rightCo2Saved', fmtKg(s.co2SavedKg));
    set('statRewardsEarned', s.rewardsEarned);
    set('statCollectionsCompleted', s.collectionsCompleted);
  }

  function renderPickupList() {
    const sorted = state.pickups.slice().sort(byDateDesc);
    const q = state.query.trim();
    const results = q ? sorted.filter((p) => matchesQuery(p, q)) : sorted.slice(0, CONFIG.RECENT_COUNT);

    els.list.innerHTML = results.map(pickupCardHTML).join('');
    els.list.style.display = results.length ? '' : 'none';

    const noResults = results.length === 0;
    els.empty.style.display = noResults ? '' : 'none';
    if (noResults) {
      els.emptyDesc.textContent = q
        ? `No recycling history matches "${q}".`
        : "You haven't scheduled any pickups yet.";
    }

    els.filterBar.style.display = q ? '' : 'none';
    if (q) els.filterText.textContent = `Showing ${results.length} result${results.length === 1 ? '' : 's'} for "${q}"`;
  }

  function renderHistoryModal() {
    const f = state.historyFilter;
    const rows = state.pickups.slice().sort(byDateDesc).filter((p) => f === 'all' || p.material === f);
    els.historyList.innerHTML = rows.length
      ? rows.map(pickupCardHTML).join('')
      : '<p class="empty-desc">No pickups for this material yet.</p>';
    $$('.filter-chip').forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === f));
  }

  function renderUser(user) {
    if (user.name) {
      const welcome = $('.welcome-name');
      const headerName = $('.profile-notification > span');
      if (welcome) welcome.textContent = user.name;
      if (headerName) headerName.textContent = user.name;
    }
    if (user.avatarUrl) {
      const pic = $('.prof-not-pic');
      if (pic) pic.src = user.avatarUrl;
    }
  }

  function renderReminders() {
    const r = state.reminders[0];
    if (!r) return;
    const h = $('.reminder-inner-heading');
    const t = $('.reminder-inner-text');
    if (h && r.title) h.textContent = r.title;
    if (t && r.message) t.textContent = r.message;
  }

  function renderLoading() {
    els.list.innerHTML = '<p class="pickup-date-time" aria-busy="true">Loading your pickups…</p>';
  }

  function renderLoadError() {
    els.list.innerHTML = `
      <div class="pickup-card" style="justify-content:space-between">
        <span class="pickup-date-time">We couldn't load your pickups.</span>
        <button class="btn btn-primary" id="retryLoadBtn">Retry</button>
      </div>`;
  }

  /* ---------------------------------------------------------------------- *
   * 7. MODALS
   * ---------------------------------------------------------------------- */
  const backdrop = $('#modalBackdrop');
  let activeModal = null;
  let lastFocused = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (activeModal) closeModal(false);
    lastFocused = document.activeElement;
    activeModal = modal;
    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const focusable = modal.querySelector('input, select, button:not([data-close-modal]), [data-close-modal]');
    focusable?.focus();
  }

  function closeModal(restoreFocus = true) {
    if (!activeModal) return;
    activeModal.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    activeModal = null;
    if (restoreFocus) lastFocused?.focus?.();
  }

  function openPickupDetails(id) {
    const p = state.pickups.find((x) => x.id === id);
    if (!p) return;
    state.selected = p;
    $('#modalMaterial').textContent = p.material;
    $('#modalStatus').textContent = p.status;
    $('#modalWeight').textContent = fmtKg(p.weightKg);
    $('#modalDate').textContent = fmtDate(p.date);
    $('#modalEcoImpact').textContent = p.ecoImpact;
    $('#pickupModalTitle').textContent = `Pickup ${p.id}`;
    const canDownload = p.status === 'Completed';
    const btn = $('#downloadReceiptBtn');
    btn.disabled = !canDownload;
    btn.title = canDownload ? '' : 'Receipts are available once a pickup is completed';
    openModal('pickupModal');
  }

  /* ---------------------------------------------------------------------- *
   * 8. ACTIONS
   * ---------------------------------------------------------------------- */
  async function loadDashboard() {
    renderLoading();
    try {
      const [dash, pickups] = await Promise.all([api.getDashboard(), api.getPickups()]);
      state.stats = dash.stats;
      state.reminders = dash.reminders;
      state.pickups = pickups;
      renderUser(dash.user);
      renderStats();
      renderReminders();
      renderPickupList();
    } catch (err) {
      handleApiError(err, 'Could not load your dashboard.');
      renderLoadError();
    }
  }

  async function refreshStats() {
    try {
      const dash = await api.getDashboard();
      state.stats = dash.stats;
      renderStats();
    } catch (err) {
      console.error(err); // non-critical – list is already up to date
    }
  }

  async function submitPickupRequest(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitBtn = $('button[type="submit"]', form);

    const material = $('#materialSelect').value;
    const weightKg = parseFloat($('#weightInput').value);
    const preferredDate = $('#pickupDate').value;

    if (!material || !preferredDate || Number.isNaN(weightKg)) {
      toast('Please fill in all required fields.', 'error');
      return;
    }
    if (weightKg < 0.5 || weightKg > 50) {
      toast('Weight must be between 0.5 kg and 50 kg.', 'error');
      return;
    }
    if (preferredDate < todayISO()) {
      toast('Please choose today or a future date.', 'error');
      return;
    }

    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    try {
      const created = await api.createPickup({ material, weightKg, preferredDate });
      state.pickups.unshift(created);
      renderPickupList();
      closeModal();
      form.reset();
      $('#weightInput').value = '2.0';
      toast(`Pickup requested for ${new Date(`${preferredDate}T00:00:00`).toLocaleDateString()}.`, 'success');
      refreshStats();
    } catch (err) {
      handleApiError(err, 'Could not submit your pickup request.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  }

  async function downloadReceipt() {
    const p = state.selected;
    if (!p) return;
    const btn = $('#downloadReceiptBtn');
    btn.disabled = true;
    try {
      const blob = await api.getReceipt(p.id);
      const ext = blob.type === 'application/pdf' ? 'pdf' : 'txt';
      downloadBlob(blob, `receipt-${p.id}.${ext}`);
      toast('Receipt downloaded.', 'success');
    } catch (err) {
      handleApiError(err, 'Could not download the receipt.');
    } finally {
      btn.disabled = false;
    }
  }

  function exportHistoryCSV() {
    const rows = state.pickups
      .slice()
      .sort(byDateDesc)
      .filter((p) => state.historyFilter === 'all' || p.material === state.historyFilter);
    if (!rows.length) { toast('Nothing to export.', 'info'); return; }

    // Prefix cells starting with = + - @ to prevent spreadsheet formula injection.
    const cell = (v) => {
      let s = String(v ?? '');
      if (/^[=+\-@]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = [['Reference', 'Material', 'Status', 'Weight (kg)', 'Date']]
      .concat(rows.map((p) => [p.id, p.material, p.status, p.weightKg.toFixed(1), fmtDate(p.date)]))
      .map((r) => r.map(cell).join(','));

    downloadBlob(new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }), 'recycling-history.csv');
    toast('History exported.', 'success');
  }

  function clearSearch() {
    state.query = '';
    if (els.search) els.search.value = '';
    renderPickupList();
  }

  /* ---------------------------------------------------------------------- *
   * 9. EVENT WIRING
   * ---------------------------------------------------------------------- */
  function bindEvents() {
    // Search (the input lives inside a <form>, so block the native submit)
    $('#login-form')?.addEventListener('submit', (e) => e.preventDefault());
    els.search?.addEventListener('input', debounce((e) => {
      state.query = e.target.value;
      renderPickupList();
    }, 200));
    $('#resetFilterBtn')?.addEventListener('click', clearSearch);
    $('#emptyClearBtn')?.addEventListener('click', clearSearch);

    // Pickup cards (event delegation for both lists)
    const openFromEvent = (e) => {
      const card = e.target.closest('.pickup-card[data-id]');
      if (!card) return;
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openPickupDetails(card.dataset.id);
    };
    [els.list, els.historyList].forEach((list) => {
      list?.addEventListener('click', openFromEvent);
      list?.addEventListener('keydown', openFromEvent);
    });
    els.list?.addEventListener('click', (e) => { if (e.target.id === 'retryLoadBtn') loadDashboard(); });

    // History modal
    const openHistory = () => { state.historyFilter = 'all'; renderHistoryModal(); openModal('historyModal'); };
    $('#viewAllBtn')?.addEventListener('click', openHistory);
    $('#statCardRecycled')?.addEventListener('click', openHistory);
    $('#statCardCollections')?.addEventListener('click', openHistory);
    $$('.filter-chip').forEach((chip) =>
      chip.addEventListener('click', () => { state.historyFilter = chip.dataset.filter; renderHistoryModal(); })
    );
    $('#exportHistoryBtn')?.addEventListener('click', exportHistoryCSV);

    // Pickup details modal
    $('#downloadReceiptBtn')?.addEventListener('click', downloadReceipt);

    // Request-pickup modal (opened from the reminder card)
    const openRequest = () => {
      const dateInput = $('#pickupDate');
      dateInput.min = todayISO();
      if (!dateInput.value) dateInput.value = todayISO();
      openModal('requestPickupModal');
    };
    const reminder = $('#reminderCard');
    reminder?.addEventListener('click', openRequest);
    reminder?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRequest(); }
    });
    $('#pickupRequestForm')?.addEventListener('submit', submitPickupRequest);

    // Notifications bell
    $('.profile-notification button[aria-label="Notifications"]')?.addEventListener('click', () => {
      const r = state.reminders[0];
      toast(r ? `${r.title}: ${r.message}` : 'You have no new notifications.', 'info');
    });

    // Community card
    $('#learnMoreBtn')?.addEventListener('click', () => { window.location.href = CONFIG.LEARN_MORE_URL; });

    // Generic modal closing
    document.addEventListener('click', (e) => { if (e.target.closest('[data-close-modal]')) closeModal(); });
    backdrop?.addEventListener('click', () => closeModal());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------------------------------------------------------------------- *
   * 10. INIT
   * ---------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    loadDashboard();
  });
})();
