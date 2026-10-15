/* Recycle Connect household dashboard API integration.
 * API base URL and routes follow the supplied API documentation.
 * The dashboard expects the login page to save its JWT in localStorage as `token`.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const API_BASE = 'https://recycle-connect-m189.onrender.com/api';
  const $ = (id) => document.getElementById(id);
  const state = {
    pickups: [],
    materials: [],
    rates: [],
    profile: null,
    dashboard: null,
    currentPickup: null,
    historyFilter: 'all'
  };

  const token = () =>
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('access_token');

  const notice = (message, type = 'info') => {
    const el = $('apiNotice');

    if (el) {
      el.textContent = message;
      el.style.display = 'block';
      el.style.background =
        type === 'error'
          ? '#fde8e7'
          : type === 'success'
            ? '#e4f7eb'
            : '#fff4d6';

      el.style.color =
        type === 'error'
          ? '#8b1e18'
          : type === 'success'
            ? '#14532d'
            : '#654d00';
    }

    toast(message, type);
  };

  function toast(message, type = 'info') {
    const host = $('toastContainer');

    if (!host) {
      if (type === 'error') console.error(message);
      return;
    }

    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    item.setAttribute('role', 'status');

    item.style.cssText = `
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 8px;
      background: ${
        type === 'error'
          ? '#fde8e7'
          : type === 'success'
            ? '#e4f7eb'
            : '#eef6f1'
      };
      color: #173d2e;
      box-shadow: 0 2px 10px #0001;
    `;

    host.appendChild(item);
    window.setTimeout(() => item.remove(), 4500);
  }

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const jwt = token();

    if (jwt) {
      headers.set('Authorization', `Bearer ${jwt}`);
    }

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json');
    }

    let response;

    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
      });
    } catch (err) {
      throw new Error(
        'Could not connect to the Recycle Connect API. Check your internet connection and confirm the deployed API is awake.'
      );
    }

    const raw = await response.text();
    let body = {};

    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = { message: raw };
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('access_token');

      throw new Error(
        'Your session has expired or you are not signed in. Please log in again.'
      );
    }

    if (!response.ok || body.success === false) {
      throw new Error(
        body.message ||
        body.error ||
        `API request failed (${response.status}).`
      );
    }

    return body;
  }

  function payload(response) {
    return response?.data ?? response?.result ?? response;
  }

  function listFrom(response) {
    const d = payload(response);

    if (Array.isArray(d)) return d;

    for (const k of [
      'pickups',
      'materials',
      'rates',
      'items',
      'results',
      'ratings',
      'history'
    ]) {
      if (Array.isArray(d?.[k])) return d[k];
    }

    return [];
  }

  function firstDefined(obj, keys, fallback = undefined) {
    for (const key of keys) {
      const value = key
        .split('.')
        .reduce((a, k) => a?.[k], obj);

      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        return value;
      }
    }

    return fallback;
  }

  function dateText(value) {
    if (!value) return 'Date not provided';

    const d = new Date(value);

    return Number.isNaN(d.getTime())
      ? String(value)
      : d.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
  }

  function normalizePickup(p) {
    const materials = Array.isArray(p.materials)
      ? p.materials
      : p.material
        ? [p.material]
        : [];

    const materialNames = materials.map(m =>
      typeof m === 'string'
        ? m
        : firstDefined(
            m,
            ['name', 'material.name', 'title'],
            'Recyclables'
          )
    );

    const weight =
      Number(
        firstDefined(
          p,
          [
            'actualWeight',
            'weight',
            'estimatedWeight',
            'totalWeight'
          ],
          0
        )
      ) || 0;

    const status = String(
      firstDefined(p, ['status', 'pickupStatus'], 'Pending')
    );

    return {
      raw: p,
      id: String(
        firstDefined(p, ['_id', 'id', 'pickupId'], '')
      ),
      material: materialNames.join(', ') || 'Recyclables',
      date: dateText(
        firstDefined(
          p,
          [
            'scheduledAt',
            'date',
            'pickupDate',
            'createdAt',
            'scheduledDate'
          ],
          ''
        )
      ),
      status,
      weight,
      collector: firstDefined(
        p,
        ['collector.fullName', 'collector.name', 'collectorName'],
        'Not assigned'
      ),
      ecoImpact: firstDefined(
        p,
        ['ecoImpact', 'impactSummary'],
        'Thank you for recycling with Recycle Connect.'
      )
    };
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[c]
    );
  }

  function materialIcon(material) {
    const m = String(material).toLowerCase();

    if (m.includes('plastic')) return '♻️';
    if (m.includes('paper')) return '📄';
    if (m.includes('glass')) return '🍾';

    if (
      m.includes('metal') ||
      m.includes('aluminium') ||
      m.includes('aluminum')
    ) {
      return '🥫';
    }

    return '♻️';
  }

  function renderPickups(items = state.pickups) {
    const list = $('pickupList');
    const empty = $('emptyState');

    if (!list) return;

    list.replaceChildren();

    if (!items.length) {
      list.style.display = 'none';

      if (empty) empty.style.display = 'block';
      return;
    }

    list.style.display = 'flex';

    if (empty) empty.style.display = 'none';

    items.slice(0, 5).forEach(item => {
      const card = document.createElement('button');

      card.type = 'button';
      card.className = 'pickup-card';
      card.setAttribute('role', 'listitem');

      card.innerHTML = `
        <div class="pickup-left">
          <div class="pickup-material-icon" aria-hidden="true">
            ${materialIcon(item.material)}
          </div>

          <div class="pickup-details">
            <h3 class="pickup-material-title">
              ${escapeHTML(item.material)}
            </h3>

            <span class="pickup-date-time">
              ${escapeHTML(item.date)}
            </span>
          </div>
        </div>

        <div class="pickup-right">
          <span class="pickup-status-badge">
            ${escapeHTML(item.status)}
          </span>

          <span class="pickup-weight">
            ${item.weight ? `${item.weight.toFixed(1)} kg` : '—'}
          </span>

          <span class="pickup-chevron">›</span>
        </div>
      `;

      card.addEventListener('click', () => openPickup(item));
      list.appendChild(card);
    });
  }

  function openPickup(item) {
    state.currentPickup = item;

    if ($('modalMaterial')) {
      $('modalMaterial').textContent = item.material;
    }

    if ($('modalStatus')) {
      $('modalStatus').textContent = item.status;
    }

    if ($('modalWeight')) {
      $('modalWeight').textContent = item.weight
        ? `${item.weight.toFixed(1)} kg`
        : 'Not recorded';
    }

    if ($('modalDate')) {
      $('modalDate').textContent = item.date;
    }

    if ($('modalEcoImpact')) {
      $('modalEcoImpact').textContent = item.ecoImpact;
    }

    openModal($('pickupModal'));
  }

  function openModal(el) {
    if (!el) return;

    $('modalBackdrop')?.classList.add('active');
    el.classList.add('active');
  }

  function closeModal(el) {
    if (!el) return;

    el.classList.remove('active');

    if (!document.querySelector('.modal-box.active')) {
      $('modalBackdrop')?.classList.remove('active');
    }
  }

  function closeAll() {
    document
      .querySelectorAll('.modal-box')
      .forEach(m => m.classList.remove('active'));

    $('modalBackdrop')?.classList.remove('active');
  }

  function updateStats() {
    const d = payload(state.dashboard) || {};

    const completed = state.pickups.filter(p =>
      /complete|collected|confirmed/i.test(p.status)
    );

    const computedWeight = completed.reduce(
      (sum, p) => sum + p.weight,
      0
    );

    const totalWeight =
      Number(
        firstDefined(
          d,
          [
            'totalRecycled',
            'totalWeightRecycled',
            'totalRecycledKg',
            'summary.totalRecycled',
            'stats.totalRecycled',
            'completedWeight'
          ],
          computedWeight
        )
      ) || 0;

    const co2 = firstDefined(d, [
      'co2Saved',
      'totalCo2Saved',
      'summary.co2Saved',
      'stats.co2Saved'
    ]);

    const rewards = firstDefined(d, [
      'rewardsEarned',
      'totalRewards',
      'summary.rewardsEarned',
      'stats.rewardsEarned'
    ]);

    const collections = firstDefined(
      d,
      [
        'collectionsCompleted',
        'completedCollections',
        'summary.collectionsCompleted',
        'stats.collectionsCompleted'
      ],
      completed.length
    );

    const set = (id, value) => {
      if ($(id)) $(id).textContent = value;
    };

    set('statTotalRecycled', `${totalWeight.toFixed(1)} kg`);
    set('rightTotalRecycled', `${totalWeight.toFixed(1)} kg`);

    if (co2 !== undefined) {
      set('statCo2Saved', `${Number(co2).toFixed(1)} kg`);
      set('rightCo2Saved', `${Number(co2).toFixed(1)} kg`);
    } else {
      set('statCo2Saved', '—');
      set('rightCo2Saved', '—');
    }

    set('statRewardsEarned', rewards ?? '—');
    set('statCollectionsCompleted', collections ?? completed.length);
  }

  function renderMaterials() {
    const select = $('materialSelect');

    if (!select) return;

    select.replaceChildren();

    state.materials.forEach(m => {
      const id = firstDefined(m, ['_id', 'id', 'materialId']);
      const name = firstDefined(
        m,
        ['name', 'materialName'],
        'Material'
      );

      if (!id) return;

      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = name;

      select.appendChild(opt);
    });

    if (!select.options.length) {
      const opt = document.createElement('option');

      opt.value = '';
      opt.textContent = 'Materials could not be loaded';
      opt.disabled = true;

      select.appendChild(opt);
    }
  }

  function renderProfile() {
    const p = payload(state.profile) || {};

    const fullName = firstDefined(
      p,
      ['fullName', 'name'],
      'Household'
    );

    const name =
      String(fullName).trim().split(/\s+/)[0] || 'Household';

    document
      .querySelectorAll('.welcome-name')
      .forEach(el => el.textContent = fullName);

    document
      .querySelectorAll('.profile-notification span')
      .forEach(el => el.textContent = name);
  }

  function renderHistoryModal(filter = 'all') {
    const host = $('modalHistoryList');

    if (!host) return;

    const items = state.pickups.filter(p =>
      filter === 'all' ||
      p.material.toLowerCase().includes(filter.toLowerCase())
    );

    host.replaceChildren();

    if (!items.length) {
      host.textContent = 'No pickup history available for this filter.';
      return;
    }

    items.forEach(p => {
      const row = document.createElement('div');

      row.className = 'pickup-card';

      row.innerHTML = `
        <div class="pickup-details">
          <h3 class="pickup-material-title">
            ${escapeHTML(p.material)}
          </h3>

          <span class="pickup-date-time">
            ${escapeHTML(p.date)}
          </span>
        </div>

        <div class="pickup-right">
          <span class="pickup-status-badge">
            ${escapeHTML(p.status)}
          </span>

          <span class="pickup-weight">
            ${p.weight ? `${p.weight.toFixed(1)} kg` : '—'}
          </span>
        </div>
      `;

      row.addEventListener('click', () => openPickup(p));
      host.appendChild(row);
    });
  }

  async function loadDashboard() {
    if (!token()) {
      notice(
        'Please sign in first. Your login page must save the API JWT in localStorage as “token”.',
        'error'
      );
      return;
    }

    try {
      const results = await Promise.allSettled([
        api('/households/dashboard'),
        api('/households/profile'),
        api('/pickups/'),
        api('/materials/'),
        api('/incentive-rates/')
      ]);

      const [
        dashboard,
        profile,
        pickups,
        materials,
        rates
      ] = results;

      if (dashboard.status === 'fulfilled') {
        state.dashboard = dashboard.value;
      } else {
        console.warn('Dashboard endpoint:', dashboard.reason);
      }

      if (profile.status === 'fulfilled') {
        state.profile = profile.value;
      } else {
        console.warn('Profile endpoint:', profile.reason);
      }

      if (pickups.status === 'fulfilled') {
        state.pickups = listFrom(pickups.value).map(normalizePickup);
      } else {
        console.warn('Pickup endpoint:', pickups.reason);
      }

      if (materials.status === 'fulfilled') {
        state.materials = listFrom(materials.value);
      } else {
        console.warn('Materials endpoint:', materials.reason);
      }

      if (rates.status === 'fulfilled') {
        state.rates = listFrom(rates.value);
      } else {
        console.warn('Rates endpoint:', rates.reason);
      }

      renderProfile();
      renderMaterials();
      renderPickups();
      updateStats();
      renderHistoryModal();

      const failures = results.filter(
        r => r.status === 'rejected'
      );

      if (failures.length) {
        notice(
          `Dashboard loaded with ${failures.length} API section(s) unavailable. Check the browser console for endpoint details.`,
          'error'
        );
      } else {
        const el = $('apiNotice');
        if (el) el.style.display = 'none';
      }
    } catch (err) {
      notice(err.message, 'error');
    }
  }

  const search = $('search') || $('searchInput');

  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();

      const filtered = state.pickups.filter(p =>
        `${p.material} ${p.date} ${p.status} ${p.collector}`
          .toLowerCase()
          .includes(q)
      );

      renderPickups(filtered);

      if ($('searchFilterStatus')) {
        $('searchFilterStatus').style.display = q ? 'flex' : 'none';
      }

      if ($('filterStatusText')) {
        $('filterStatusText').textContent =
          `Showing ${filtered.length} result(s)`;
      }
    });
  }

  ['resetFilterBtn', 'emptyClearBtn'].forEach(id =>
    $(id)?.addEventListener('click', () => {
      if (search) search.value = '';

      if ($('searchFilterStatus')) {
        $('searchFilterStatus').style.display = 'none';
      }

      renderPickups();
    })
  );

  document
    .querySelectorAll('[data-close-modal]')
    .forEach(btn =>
      btn.addEventListener('click', () =>
        closeModal(btn.closest('.modal-box'))
      )
    );

  $('modalBackdrop')?.addEventListener('click', closeAll);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
  });

  $('viewAllBtn')?.addEventListener('click', () => {
    renderHistoryModal(state.historyFilter);
    openModal($('historyModal'));
  });

  document
    .querySelectorAll('a[href="House-Request.html"]')
    .forEach(link =>
      link.addEventListener('click', e => {
        e.preventDefault();
        openModal($('requestPickupModal'));
      })
    );

  document
    .querySelectorAll('[data-filter]')
    .forEach(btn =>
      btn.addEventListener('click', () => {
        state.historyFilter = btn.dataset.filter || 'all';

        document
          .querySelectorAll('[data-filter]')
          .forEach(b => b.classList.toggle('active', b === btn));

        renderHistoryModal(state.historyFilter);
      })
    );

  $('reminderCard')?.addEventListener('click', () => {
    toast(
      'Your pickup reminders are based on scheduled pickup requests. Check your pickup history for the latest status.'
    );
  });

  $('reminderCard')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      toast(
        'Your pickup reminders are based on scheduled pickup requests. Check your pickup history for the latest status.'
      );
    }
  });

  $('learnMoreBtn')?.addEventListener('click', () => {
    toast(
      'Recycle Connect helps households schedule recyclable-material collections and track their environmental impact.'
    );
  });

  $('downloadReceiptBtn')?.addEventListener('click', () => {
    const p = state.currentPickup;

    if (!p) {
      return toast('Select a pickup first.', 'error');
    }

    const lines = [
      ['Pickup ID', p.id],
      ['Material', p.material],
      ['Status', p.status],
      ['Weight (kg)', p.weight || 'Not recorded'],
      ['Date', p.date],
      ['Collector', p.collector]
    ];

    const csv = lines
      .map(row =>
        row
          .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );

    const a = document.createElement('a');
    a.href = url;
    a.download = `recycle-connect-pickup-${p.id || 'receipt'}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  });

  $('exportHistoryBtn')?.addEventListener('click', () => {
    const rows = [
      [
        'Pickup ID',
        'Material',
        'Status',
        'Weight (kg)',
        'Date',
        'Collector'
      ],
      ...state.pickups.map(p => [
        p.id,
        p.material,
        p.status,
        p.weight || '',
        p.date,
        p.collector
      ])
    ];

    const csv = rows
      .map(row =>
        row
          .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );

    const a = document.createElement('a');
    a.href = url;
    a.download = 'recycle-connect-pickup-history.csv';
    a.click();

    URL.revokeObjectURL(url);
  });

  const form = $('pickupRequestForm');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const select = $('materialSelect');

      const materials = Array
        .from(select?.selectedOptions || [])
        .map(o => o.value)
        .filter(Boolean);

      const date = $('pickupDate')?.value;
      const time = $('pickupTime')?.value;

      const parts = [
        'pickupStreet',
        'pickupArea',
        'pickupCity',
        'pickupLga',
        'pickupState'
      ].map(id => $(id)?.value.trim() || '');

      const photo = $('pickupPhoto')?.files?.[0];

      if (!token()) {
        return notice(
          'Please sign in before requesting a pickup.',
          'error'
        );
      }

      if (!materials.length) {
        return notice('Select at least one material.', 'error');
      }

      if (parts.some(v => !v)) {
        return notice('Complete all five address fields.', 'error');
      }

      if (
        !date ||
        !time ||
        new Date(`${date}T${time}:00`) <= new Date()
      ) {
        return notice(
          'Choose a pickup date and time in the future.',
          'error'
        );
      }

      if (parts.join(',').split(',').length !== 5) {
        return notice(
          'Use a street, area, city, LGA, and state without extra commas.',
          'error'
        );
      }

      if (
        photo &&
        (
          !/^image\/(jpeg|jpg)$/i.test(photo.type) ||
          photo.size > 5 * 1024 * 1024
        )
      ) {
        return notice(
          'Photo must be a JPG/JPEG image no larger than 5 MB.',
          'error'
        );
      }

      const data = new FormData();

      data.append('materials', JSON.stringify(materials));
      data.append('location', parts.join(', '));
      data.append('date', date);
      data.append('time', time);
      data.append('timezone', 'Africa/Lagos');

      const note = $('pickupNote')?.value.trim();

      if (note) data.append('note', note);
      if (photo) data.append('pickupPhoto', photo);

      const submit = form.querySelector('button[type="submit"]');
      const oldText = submit?.textContent;

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Submitting…';
      }

      try {
        const result = await api('/pickups/', {
          method: 'POST',
          body: data
        });

        toast(
          payload(result)?.message ||
          result.message ||
          'Pickup request submitted successfully.',
          'success'
        );

        form.reset();
        closeModal($('requestPickupModal'));
        await loadDashboard();
      } catch (err) {
        notice(err.message, 'error');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = oldText || 'Confirm Pickup Request';
        }
      }
    });
  }

  // Use a future date as the initial date and prevent selecting past dates.
  const dateInput = $('pickupDate');

  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const localDate = new Date(
      tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    dateInput.min = localDate;
    dateInput.value = localDate;

    if ($('pickupTime')) {
      $('pickupTime').value = '10:00';
    }
  }

  loadDashboard();
});