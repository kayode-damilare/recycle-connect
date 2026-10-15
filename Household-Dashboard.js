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
        return `<svg width="14" height="36" viewBox="0 0 14 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.3163 1.76045V5.56591H2.51367V1.76364C2.51367 1.56138 2.57998 1.36739 2.69805 1.22423C2.81612 1.08106 2.97631 1.00042 3.14346 1H10.6878C10.8543 1.00084 11.0137 1.08123 11.1314 1.22366C11.2491 1.36609 11.3156 1.55903 11.3163 1.76045Z" fill="white" stroke="#087A55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.3164 6.56433V7.08679C10.3164 7.6742 10.5437 8.35732 10.7754 8.96472C11.0171 9.59816 11.3498 10.3545 11.6504 11.0819C12.2848 12.6169 12.832 14.1572 12.832 15.455V34.4344C12.5509 34.533 12.1128 34.6345 11.5254 34.7206C10.2937 34.9012 8.6172 34.995 6.91602 34.995C5.21492 34.995 3.53833 34.9011 2.30664 34.7206C1.71947 34.6345 1.28113 34.533 1 34.4344V15.455C1.00001 14.1572 1.54725 12.6169 2.18164 11.0819C2.48227 10.3545 2.81495 9.59818 3.05664 8.96472C3.28838 8.35732 3.51562 7.6742 3.51562 7.08679V6.56433H10.3164Z" fill="white" stroke="#087A55" stroke-width="2"/>
                <path d="M12.832 34.4397C12.5509 34.5382 12.1127 34.6397 11.5254 34.7258C10.2937 34.9064 8.61718 35.0002 6.91602 35.0002C5.21495 35.0002 3.53833 34.9064 2.30664 34.7258C1.71956 34.6398 1.28114 34.5382 1 34.4397V25.3C1.43372 25.7354 1.90324 26.1256 2.40527 26.4622C3.77066 27.3774 5.32373 27.8671 6.91602 27.8665V27.8655C8.50801 27.8661 10.0606 27.3772 11.4258 26.4622C11.9281 26.1255 12.3981 25.7347 12.832 25.2991V34.4397Z" fill="#D1FFE3" stroke="#087A55" stroke-width="2"/>
                </svg>`;
      case 'paper':
        return `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.02175 20.3232C9.02175 20.1907 9.07449 20.0635 9.16838 19.9698C9.26226 19.8761 9.3896 19.8234 9.52237 19.8234H17.4922C17.6249 19.8234 17.7523 19.8761 17.8461 19.9698C17.94 20.0635 17.9928 20.1907 17.9928 20.3232C17.9928 20.4558 17.94 20.5829 17.8461 20.6767C17.7523 20.7704 17.6249 20.8231 17.4922 20.8231H9.52237C9.3896 20.8231 9.26226 20.7704 9.16838 20.6767C9.07449 20.5829 9.02175 20.4558 9.02175 20.3232ZM9.49233 16.8444C9.35956 16.8444 9.23222 16.8971 9.13834 16.9908C9.04446 17.0845 8.99171 17.2117 8.99171 17.3442C8.99171 17.4768 9.04446 17.6039 9.13834 17.6977C9.23222 17.7914 9.35956 17.8441 9.49233 17.8441H22.5283C22.6611 17.8441 22.7884 17.7914 22.8823 17.6977C22.9762 17.6039 23.029 17.4768 23.029 17.3442C23.029 17.2117 22.9762 17.0845 22.8823 16.9908C22.7884 16.8971 22.6611 16.8444 22.5283 16.8444H9.49233ZM8.99171 14.3252C8.99171 14.1927 9.04446 14.0655 9.13834 13.9718C9.23222 13.8781 9.35956 13.8254 9.49233 13.8254H22.5283C22.6611 13.8254 22.7884 13.8781 22.8823 13.9718C22.9762 14.0655 23.029 14.1927 23.029 14.3252C23.029 14.4578 22.9762 14.5849 22.8823 14.6787C22.7884 14.7724 22.6611 14.8251 22.5283 14.8251H9.49233C9.35956 14.8251 9.23222 14.7724 9.13834 14.6787C9.04446 14.5849 8.99171 14.4578 8.99171 14.3252ZM9.43226 10.8664C9.29948 10.8664 9.17215 10.9191 9.07827 11.0128C8.98438 11.1065 8.93164 11.2337 8.93164 11.3662C8.93164 11.4988 8.98438 11.6259 9.07827 11.7197C9.17215 11.8134 9.29948 11.8661 9.43226 11.8661H22.5283C22.6611 11.8661 22.7884 11.8134 22.8823 11.7197C22.9762 11.6259 23.029 11.4988 23.029 11.3662C23.029 11.2337 22.9762 11.1065 22.8823 11.0128C22.7884 10.9191 22.6611 10.8664 22.5283 10.8664H9.43226Z" fill="#087A55"/>
                <path d="M3.47968 0C1.67046 0 0.357844 1.47451 0.0294403 3.13496L0.028439 3.14495L0.0264366 3.15395C-0.048343 3.56503 0.0368915 3.98911 0.264729 4.33955C0.491007 4.68344 0.904515 4.99833 1.45619 4.99833H5.00455L4.95649 26.0593V26.0613C4.95782 27.1055 5.37386 28.1066 6.11338 28.8449C6.85289 29.5833 7.85551 29.9987 8.90134 30H24.5906C24.6707 30 24.7498 29.996 24.8279 29.988C28.6626 29.934 29.5737 28.4255 29.9612 26.931C30.0127 26.709 30.0129 26.4782 29.9618 26.2562C29.9106 26.0341 29.8094 25.8266 29.6659 25.6495C29.4829 25.43 29.2531 25.2543 28.9932 25.1353C28.7333 25.0162 28.4499 24.9569 28.164 24.9617H26.9836V4.44852C26.9836 3.27135 26.5152 2.14239 25.6815 1.31001C24.8478 0.477625 23.7171 0.00999666 22.5381 0.00999666H8.61098V0H3.47968ZM7.00701 4.99833H7.00902V3.99867C7.00888 3.30442 6.84637 2.6198 6.53443 1.99933H6.60852V2.00933H22.5381C23.186 2.00933 23.8074 2.26632 24.2656 2.72375C24.7237 3.18119 24.9811 3.8016 24.9811 4.44852V24.9617H13.4169C13.0156 24.944 12.6201 25.063 12.2954 25.2991C11.9707 25.5352 11.736 25.8745 11.6297 26.2612C11.5087 26.7011 11.2647 27.0974 10.9261 27.4037C10.5876 27.71 10.1686 27.9136 9.71834 27.9907V28.0007H8.90134C8.38677 27.9993 7.89363 27.7947 7.52968 27.4315C7.16572 27.0683 6.96054 26.5761 6.95895 26.0623L7.00701 5.00333V4.99833Z" fill="#087A55"/>
                </svg>`;
      case 'glass':
        return `<svg width="19" height="30" viewBox="0 0 19 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.83427 8.685C1.93047 9.53521 1.2144 10.5474 0.727807 11.6625C0.241216 12.7776 -0.0061565 13.9734 0.000116378 15.18V27C0.000116378 28.65 1.42511 30 3.16676 30H15.8334C17.575 30 19 28.65 19 27V15.18C19 12.72 17.9867 10.425 16.1658 8.685C15.5584 8.11311 15.0764 7.433 14.7476 6.68386C14.4188 5.93471 14.2497 5.13133 14.25 4.32V3H15.8334V0H3.16676V3H4.75009V4.32C4.75009 5.97 4.06926 7.53 2.83427 8.685ZM11.0834 3V4.32C11.0834 6.765 12.0967 9.075 13.9175 10.815C15.105 11.94 15.7542 13.425 15.8175 15H7.91673V24H15.8334V27H3.16676V15.18C3.16676 13.53 3.84759 11.97 5.08258 10.815C5.98638 9.96479 6.70245 8.95261 7.18904 7.83749C7.67564 6.72237 7.92301 5.52663 7.91673 4.32V3H11.0834Z" fill="#087A55"/>
                </svg>`;
      case 'metal':
        return `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.6374 27.7856C18.7745 27.7856 22.9389 26.5751 22.9389 25.0819C22.9389 23.5886 18.7745 22.3781 13.6374 22.3781C8.50035 22.3781 4.33594 23.5886 4.33594 25.0819C4.33594 26.5751 8.50035 27.7856 13.6374 27.7856Z" fill="#636666"/>
                <path d="M22.4009 2.95184C22.4009 1.89922 21.3689 1.04565 20.0969 1.04565H7.18052C5.90849 1.04565 4.87646 1.89922 4.87646 2.95184V23.7576C4.87646 23.8433 4.88627 23.9278 4.90034 24.0105C4.88535 24.067 4.87733 24.1252 4.87646 24.1837C4.87646 25.5855 8.78888 26.7234 13.614 26.7234C18.4391 26.7234 22.3506 25.5855 22.3506 24.1837C22.3506 24.1767 22.3489 24.1697 22.3489 24.1636C22.3826 24.0319 22.4022 23.8972 22.4022 23.7572V2.95184" fill="#087A55"/>
                <path d="M11.7447 24.2987C11.7447 24.248 11.7524 24.1986 11.7622 24.1491C11.7514 24.0772 11.7455 24.0045 11.7447 23.9317V6.05369C11.7447 5.14981 12.5457 4.41656 13.533 4.41656H9.34306C8.35707 4.41656 7.55566 5.14938 7.55566 6.05369V23.9317C7.55566 24.0061 7.56334 24.0778 7.57314 24.1491C7.5624 24.1983 7.55654 24.2484 7.55566 24.2987C7.55566 25.5032 10.5912 26.4792 14.3357 26.4792C15.0672 26.4792 15.7701 26.4421 16.4309 26.3734C13.7112 26.0899 11.7447 25.2678 11.7447 24.2987Z" fill="#C4C4C5"/>
                <path d="M13.637 4.41875C18.9278 4.41875 23.2168 3.42958 23.2168 2.20938C23.2168 0.989171 18.9278 0 13.637 0C8.34617 0 4.05713 0.989171 4.05713 2.20938C4.05713 3.42958 8.34617 4.41875 13.637 4.41875Z" fill="#636666"/>
                <path d="M13.6539 3.18192C18.4373 3.18192 22.3151 2.55257 22.3151 1.77623C22.3151 0.999892 18.4373 0.370544 13.6539 0.370544C8.87043 0.370544 4.99268 0.999892 4.99268 1.77623C4.99268 2.55257 8.87043 3.18192 13.6539 3.18192Z" fill="#D8E5DE"/>
                <path d="M9.71735 2.00373C9.71735 1.42711 10.0392 0.897295 10.5784 0.477295C7.31439 0.678982 4.99414 1.19086 4.99414 1.7898C4.99414 2.36161 7.0987 2.85336 10.1181 3.07342C9.86527 2.74967 9.71862 2.38698 9.71862 2.00242" fill="#B8B8BA"/>
                <path d="M16.9112 2.61274C18.1049 2.61274 19.0725 2.18534 19.0725 1.65812C19.0725 1.13089 18.1049 0.703491 16.9112 0.703491C15.7176 0.703491 14.75 1.13089 14.75 1.65812C14.75 2.18534 15.7176 2.61274 16.9112 2.61274Z" fill="#087A55"/>
                <path d="M13.6382 9.37825C9.41891 9.37825 5.8748 8.53825 4.87772 7.40118C4.69442 7.60987 4.59766 7.82818 4.59766 8.05306C4.59766 9.50425 8.64478 10.6824 13.6391 10.6824C18.6313 10.6824 22.6805 9.506 22.6805 8.05306C22.6805 7.82775 22.5833 7.60943 22.4005 7.40118C21.4038 8.53825 17.8606 9.37825 13.6408 9.37825M13.6382 16.9706C9.41891 16.9706 5.8748 16.1297 4.87772 14.9936C4.69442 15.2022 4.59766 15.4197 4.59766 15.6446C4.59766 17.0957 8.64478 18.2739 13.6391 18.2739C18.6313 18.2739 22.6805 17.0975 22.6805 15.6446C22.6805 15.4192 22.5833 15.2018 22.4005 14.9936C21.4038 16.1297 17.8606 16.9706 13.6408 16.9706" fill="#D8E5DE"/>
                </svg>`;
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