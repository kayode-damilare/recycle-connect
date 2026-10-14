document.addEventListener('DOMContentLoaded', () => {
  // Initial Record Data matching prompt specifications
  const pickupData = [
    {
      id: 'RC-2026-0910',
      material: 'Plastic',
      date: 'Sept 10, 2026, 10:24 AM',
      status: 'Completed',
      weight: 2.5,
      collector: 'EcoFleet Green Unit #12',
      ecoImpact: 'Prevented ~6.2 kg of CO₂ equivalent emissions.'
    },
    {
      id: 'RC-2026-0905',
      material: 'Paper',
      date: 'Sept 5, 2026, 2:15 PM',
      status: 'Completed',
      weight: 3.0,
      collector: 'North Hills Cycle Courier',
      ecoImpact: 'Saved ~0.05 mature trees and 120L of water.'
    },
    {
      id: 'RC-2026-0829',
      material: 'Glass',
      date: 'Aug 29, 2026, 11:40 AM',
      status: 'Completed',
      weight: 2.0,
      collector: 'City Glass Reclaim Unit',
      ecoImpact: 'Cut furnace emissions by ~4.8 kg CO₂.'
    },
    {
      id: 'RC-2026-0825',
      material: 'Metal',
      date: 'Aug 25, 2026, 9:30 AM',
      status: 'Completed',
      weight: 5.0,
      collector: 'Metals Express Truck #04',
      ecoImpact: 'Conserved 95% of virgin metal refining energy.'
    }
  ];

  let rewardsCount = 5;
  let collectionsCount = 3;

  // DOM Elements
  const pickupList = document.getElementById('pickupList');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const emptyState = document.getElementById('emptyState');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const pickupModal = document.getElementById('pickupModal');
  const requestPickupModal = document.getElementById('requestPickupModal');
  const historyModal = document.getElementById('historyModal');
  const reminderCard = document.getElementById('reminderCard');
  const learnMoreBtn = document.getElementById('learnMoreBtn');

  // SVG Helper
  function getMaterialIcon(material) {
    switch (material.toLowerCase()) {
      case 'plastic':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F5B" stroke-width="2.2"><path d="M7 2h10v3a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V2z"/><path d="M7 7h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7z"/></svg>`;
      case 'paper':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F5B" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
      case 'glass':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F5B" stroke-width="2.2"><path d="M8 2h8v4a3 3 0 0 1-1 2.2V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8.2A3 3 0 0 1 8 6V2z"/></svg>`;
      case 'metal':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F5B" stroke-width="2.2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/></svg>`;
      default:
        return `♻️`;
    }
  }

  // Render Pickup List
  function renderPickups(items) {
    if (!pickupList) return;
    if (items.length === 0) {
      pickupList.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    pickupList.style.display = 'flex';
    emptyState.style.display = 'none';
    pickupList.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'pickup-card';
      card.innerHTML = `
        <div class="pickup-left">
          <div class="pickup-material-icon">${getMaterialIcon(item.material)}</div>
          <div class="pickup-details">
            <h3 class="pickup-material-title">${item.material}</h3>
            <span class="pickup-date-time">${item.date}</span>
          </div>
        </div>
        <div class="pickup-right">
          <span class="pickup-status-badge">${item.status}</span>
          <span class="pickup-weight">${item.weight.toFixed(1)} kg</span>
          <span class="pickup-chevron">›</span>
        </div>
      `;
      card.addEventListener('click', () => openPickupModal(item));
      pickupList.appendChild(card);
    });
  }

  // Real-Time Search
  function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    clearSearchBtn.style.display = query ? 'flex' : 'none';

    const filtered = pickupData.filter(item => 
      item.material.toLowerCase().includes(query) ||
      item.date.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
    renderPickups(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      handleSearch();
    });
  }

  // Modal Management
  function openModal(el) {
    if (!el) return;
    modalBackdrop.classList.add('active');
    el.classList.add('active');
  }

  function closeModal(el) {
    if (!el) return;
    el.classList.remove('active');
    modalBackdrop.classList.remove('active');
  }

  function openPickupModal(item) {
    document.getElementById('modalMaterial').textContent = item.material;
    document.getElementById('modalStatus').textContent = item.status;
    document.getElementById('modalWeight').textContent = `${item.weight.toFixed(1)} kg`;
    document.getElementById('modalDate').textContent = item.date;
    document.getElementById('modalEcoImpact').textContent = item.ecoImpact;
    openModal(pickupModal);
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal-box'));
    });
  });

  modalBackdrop.addEventListener('click', () => {
    document.querySelectorAll('.modal-box').forEach(m => m.classList.remove('active'));
    modalBackdrop.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-box').forEach(m => m.classList.remove('active'));
      modalBackdrop.classList.remove('active');
    }
  });

  // Dynamic Statistics
  function updateStats() {
    const total = pickupData.reduce((acc, curr) => acc + curr.weight, 0);
    const co2 = (total * 2.496).toFixed(1);
    
    document.getElementById('statTotalRecycled').textContent = `${total.toFixed(1)} kg`;
    document.getElementById('statCo2Saved').textContent = `${co2} kg`;
    document.getElementById('statRewardsEarned').textContent = rewardsCount;
    document.getElementById('statCollectionsCompleted').textContent = collectionsCount;

    document.getElementById('rightTotalRecycled').textContent = `${total.toFixed(1)} kg`;
    document.getElementById('rightCo2Saved').textContent = `${co2} kg`;
  }

  // Pickup Request Submission
  const form = document.getElementById('pickupRequestForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const material = document.getElementById('materialSelect').value;
      const weight = parseFloat(document.getElementById('weightInput').value) || 2.0;
      
      pickupData.unshift({
        id: `RC-${Date.now().toString().slice(-4)}`,
        material,
        date: 'Today, Just now',
        status: 'Completed',
        weight,
        collector: 'EcoFleet Green Unit #15',
        ecoImpact: `Prevented ~${(weight * 2.5).toFixed(1)} kg CO₂ emissions.`
      });

      collectionsCount += 1;
      rewardsCount += 1;

      form.reset();
      closeModal(requestPickupModal);
      handleSearch();
      updateStats();
    });
  }

  // Initial Boot
  renderPickups(pickupData);
  updateStats();
});