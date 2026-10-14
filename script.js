document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. SIDEBAR NAVIGATION ---------- */
  document.querySelectorAll('[data-href]').forEach((item) => {
    // Make the <li> items reachable and usable with the keyboard
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'link');

    const go = () => {
      const target = item.dataset.href;
      if (!target) return;

      const targetUrl = new URL(target, window.location.href);
      if (targetUrl.pathname !== window.location.pathname) {
        window.location.href = targetUrl.href;
      }
    };

    item.addEventListener('click', go);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  /* ---------- 2. FILTERS + SEARCH ---------- */
  const filterButtons = document.querySelectorAll('main button');
  const searchInput = document.querySelector('main input[type="text"]');
  const cards = document.querySelectorAll('main > .rounded-lg');

  // Same classes your HTML already uses for the two button states
  const ACTIVE = ['bg-[#077053]', 'text-white'];
  const INACTIVE = ['border', 'border-green-100', 'bg-white/60', 'text-[#077053]'];

  let activeFilter = 'all';
  let searchTerm = '';

 
  const emptyMessage = document.createElement('p');
  emptyMessage.textContent = 'No pickups found.';
  emptyMessage.className =
    'mt-6 text-center font-[Inter] text-[16px] text-[#898484]';
  emptyMessage.hidden = true;
  cards[cards.length - 1]?.after(emptyMessage);

  const applyFilters = () => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const status =
        card.querySelector('span.rounded-lg')?.textContent.trim().toLowerCase() ?? '';
      const text = card.textContent.toLowerCase();

      const matchesStatus = activeFilter === 'all' || status === activeFilter;
      const matchesSearch = text.includes(searchTerm);
      const show = matchesStatus && matchesSearch;

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    emptyMessage.hidden = visibleCount > 0;
  };

  const setActiveButton = (clicked) => {
    filterButtons.forEach((btn) => {
      const isActive = btn === clicked;
      btn.classList.remove(...(isActive ? INACTIVE : ACTIVE));
      btn.classList.add(...(isActive ? ACTIVE : INACTIVE));
    });
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.textContent.trim().toLowerCase();
      setActiveButton(btn);
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }
});