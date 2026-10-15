
// Get HTML elements
const materialsContainer = document.getElementById("materials-container");
const locationDisplay = document.getElementById("location-display");
const useLocationBtn = document.getElementById("use-location-btn");
const nextBtn = document.getElementById("next-btn");


// const API_URL = "https://recycle-connect-m189.onrender.com/api/materials/";

// const materialsContainer = document.getElementById("materials-container");

// async function fetchMaterials() {
//   materialsContainer.innerHTML = `
//     <p class="col-span-full text-center text-gray-500">
//       Loading materials...
//     </p>
//   `;

//   try {
//     const response = await fetch(API_URL, { method:"GET",});

//     if (!response.ok) {
//       throw new Error(`Request failed: ${response.status}`);
//     }

//     const data = await response.json();

//     // Supports either an array or a paginated { results: [] } response
//     const materials = Array.isArray(data) ? data : data.results;

//     if (!Array.isArray(materials)) {
//       throw new Error("Unexpected materials response format.");
//     }

//     materialsContainer.innerHTML = "";

//     if (materials.length === 0) {
//       materialsContainer.innerHTML = `
//         <p class="col-span-full text-center text-gray-500">
//           No materials available.
//         </p>
//       `;
//       return;
//     }

//     materials.forEach((material) => {
//       const card = document.createElement("button");

//       card.type = "button";
//       card.className =
//         "material-card selected flex flex-col items-center justify-center gap-3 rounded-xl border border-purple-600 p-4 transition";

//       card.dataset.materialId = material.id;

//       card.innerHTML = `
//         <span class="check-mark">✓</span>
//         <span class="material-icon"></span>
//         <span class="material-name"></span>
//       `;

//       // Use textContent for API-provided text
//       card.querySelector(".material-name").textContent = material.name;

//       // Add an icon if the API provides an image URL
//       const iconElement = card.querySelector(".material-icon");

//       if (material.icon || material.image || material.image_url) {
//         const img = document.createElement("img");
//         img.src = material.icon || material.image || material.image_url;
//         img.alt = material.name;
//         img.className = "h-10 w-10 object-contain";
//         iconElement.appendChild(img);
//       } else {
//         iconElement.textContent = "♻️";
//       }

//       // Toggle selection
//       card.addEventListener("click", () => {
//         card.classList.toggle("selected");

//         const checkMark = card.querySelector(".check-mark");
//         checkMark.classList.toggle(
//           "hidden",
//           !card.classList.contains("selected")
//         );
//       });

//       materialsContainer.appendChild(card);
//     });
//   } catch (error) {
//     console.error("Error fetching materials:", error);

//     materialsContainer.innerHTML = `
//       <p class="col-span-full text-center text-red-500">
//         Unable to load materials. Please refresh and try again.
//       </p>
//     `;
//   }
// }

// fetchMaterials();

// const BASE_URL = 'https://recycle-connect-m189.onrender.com';

// const iconMap = {
//   plastic: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Group_vnbhb6.png',
//   paper: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Vector_mc2l36.png',
//   metal: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/emojione-v1_oil-drum_yfnegm.png',
//   glass: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Vector_1_nasga7.png',
//   ewaste: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Vector_2_wbozty.png',
//   'e-waste': 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Vector_2_wbozty.png',
//   others: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Group_1_supxpn.png'
// };

// fetch(`${BASE_URL}/api/materials/`, {
//   headers: {
//     'Authorization': 'Bearer ' + localStorage.getItem('token')
//   }
// })
// .then(res => res.json())
// .then(data => {
//   const materials = data.data || data;
//   materialsContainer.innerHTML = '';

//   materials.forEach(mat => {
//     const key = mat.name.toLowerCase();
//     const div = document.createElement('div');
//     div.className = 'material-card selected relative flex flex-col h-[110px] md:h-[120px] lg:h-[130px] w-full rounded-xl shadow-sm bg-white items-center justify-center gap-2 border border-[hsl(150,19%,88%)] hover:border-2 hover:border-[hsl(161,88%,25%)] hover:bg-[hsl(146,44%,94%)] cursor-pointer';
//     div.dataset.material = key;
//     div.dataset.materialId = mat._id || mat.id;
//     div.dataset.name = mat.name;
//     div.dataset.description = mat.description;

//     div.innerHTML = `
//       <div class="check-mark hidden absolute top-3 right-3 w-5 h-5 bg-[hsl(161,88%,25%)] text-white rounded-full flex items-center justify-center text-[14px] font-bold">✓</div>
//       <img src="${iconMap[key] || iconMap.others}" class="w-8 h-8 lg:w-12 lg:h-12 object-contain" />
//       <p class="text-[13px] lg:text-base font-[600]">${mat.name}</p>
//     `;
//     materialsContainer.appendChild(div);
//   });
// })
// .catch(err => {
//   console.error(err);
//   materialsContainer.innerHTML = '<p class="text-red-500 text-sm">Failed to load materials</p>';
// });



document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('materials-container');
  const cards = container.querySelectorAll('.material-card');

  // ---- CREATE BOX WITH JS ONLY (no HTML needed) ----
  const othersBox = document.createElement('div');
  othersBox.id = 'others-desc-box';
  othersBox.className = 'hidden mt-4 mb-4 w-full';

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Describe material';
  textarea.className = 'w-full h-[90px] p-3 text-[13px] border border-[hsl(150,19%,88%)] rounded-xl resize-none outline-none focus:border-gray-200 bg-white';
  othersBox.appendChild(textarea);

  // Put it in the gap between cards and Remember Me
  container.insertAdjacentElement('afterend', othersBox);

  cards.forEach(card => {
    card.addEventListener('click', () => {
      // 1. Your existing logic - Hide ALL check-marks first (KEPT)
      cards.forEach(c => {
        const mark = c.querySelector('.check-mark');
        mark.classList.add('hidden');
        mark.classList.remove('flex');
        c.classList.remove('border-2', 'border-[#0F6A3D]', 'bg-[#E9F5EC]');
        c.classList.add('border', 'border-[hsl(150,19%,88%)]', 'bg-white');
      });

      // 2. Your existing logic - Show only the clicked one (KEPT)
      const currentMark = card.querySelector('.check-mark');
      currentMark.classList.remove('hidden');
      currentMark.classList.add('flex');
      card.classList.add('border-2', 'border-[#0F6A3D]', 'bg-[#E9F5EC]');
      card.classList.remove('border', 'border-[hsl(150,19%,88%)]', 'bg-white');

      // 3. NEW - Only show box if it's Others
      const isOthers = card.dataset.material === 'others';

      if (isOthers) {
        othersBox.classList.remove('hidden');
        textarea.focus();
      } else {
        othersBox.classList.add('hidden');
      }
    });
  });

  
// ===== 3 - USE MY CURRENT LOCATION =====
const btn = document.getElementById('use-location-btn');
const display = document.getElementById('location-display');

btn.addEventListener('click', () => {
  display.textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(async (p) => {
    const { latitude: lat, longitude: lon } = p.coords;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
      const d = await r.json();
      const a = d.address || {};

      // 1. Street part
      let street = '';
      if (a.house_number && a.road) street = `${a.house_number} ${a.road}`;
      else street = a.road || a.neighbourhood || a.suburb || d.display_name.split(',')[0];

      // 2. Place = city / LGA / area
      const place = a.city || a.town || a.county || a.suburb || '';

      // 3. State
      const state = a.state || '';

      // Build short display - MAX 3 parts
      let shortDisplay = '';
      if (a.house_number && a.road) {
        // With number: Number, Street, Place, State -> but you want 3, so combine number+street
        shortDisplay = `${street}, ${place}, ${state}`;
      } else {
        // Without number: Street, Place, State
        shortDisplay = `${street}, ${place}, ${state}`;
      }

      // Clean: remove empty,, and duplicates
      shortDisplay = [...new Set(shortDisplay.split(',').map(s=>s.trim()).filter(Boolean))].join(', ');

      // Show SHORT to user
      display.textContent = shortDisplay;

      // For backend - save FULL real address (5 parts needed)
      localStorage.setItem('pickupLocationDisplay', shortDisplay);
      localStorage.setItem('pickupLocation', d.display_name);
      localStorage.setItem('pickupCoords', JSON.stringify({ lat, lon }));

      console.log('SHORT (3 parts):', shortDisplay);
      console.log('FULL for API:', d.display_name);

    } catch(e){
      console.error(e);
      display.textContent = 'Failed';
    }
  }, (e) => alert(e.message), { enableHighAccuracy: true });
});



  

  // ===== 4 - NEXT BUTTON VALIDATION =====
  const nextBtn = document.getElementById('next-btn');
  nextBtn.addEventListener('click', (e) => {
    if (!selectedMaterial) {
      e.preventDefault();
      alert('Please select a material first');
      container.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // If Others, make sure they described it
    if (selectedMaterial === 'others' &&!textarea.value.trim()) {
      e.preventDefault();
      alert('Please describe the material');
      textarea.focus();
      return;
    }

    // Save selection for Schedule-Pick.html
    localStorage.setItem('selectedMaterial', selectedMaterial);
    localStorage.setItem('othersDescription', textarea.value.trim());
  });

  // ===== 5 - SIDEBAR NAVIGATION =====
  document.querySelectorAll('[data-href]').forEach(item => {
    item.addEventListener('click', () => {
      const href = item.getAttribute('data-href');
      if (href) window.location.href = href;
    });
  });
});
 