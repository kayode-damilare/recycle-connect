
// // Get HTML elements
// const materialsContainer = document.getElementById("materials-container");
// const locationDisplay = document.getElementById("location-display");
// const useLocationBtn = document.getElementById("use-location-btn");
// const nextBtn = document.getElementById("next-btn");


// // const API_URL = "https://recycle-connect-m189.onrender.com/api/materials/";

// // const materialsContainer = document.getElementById("materials-container");

// // async function fetchMaterials() {
// //   materialsContainer.innerHTML = `
// //     <p class="col-span-full text-center text-gray-500">
// //       Loading materials...
// //     </p>
// //   `;

// //   try {
// //     const response = await fetch(API_URL, { method:"GET",});

// //     if (!response.ok) {
// //       throw new Error(`Request failed: ${response.status}`);
// //     }

// //     const data = await response.json();

// //     // Supports either an array or a paginated { results: [] } response
// //     const materials = Array.isArray(data) ? data : data.results;

// //     if (!Array.isArray(materials)) {
// //       throw new Error("Unexpected materials response format.");
// //     }

// //     materialsContainer.innerHTML = "";

// //     if (materials.length === 0) {
// //       materialsContainer.innerHTML = `
// //         <p class="col-span-full text-center text-gray-500">
// //           No materials available.
// //         </p>
// //       `;
// //       return;
// //     }

// //     materials.forEach((material) => {
// //       const card = document.createElement("button");

// //       card.type = "button";
// //       card.className =
// //         "material-card selected flex flex-col items-center justify-center gap-3 rounded-xl border border-purple-600 p-4 transition";

// //       card.dataset.materialId = material.id;

// //       card.innerHTML = `
// //         <span class="check-mark">✓</span>
// //         <span class="material-icon"></span>
// //         <span class="material-name"></span>
// //       `;

// //       // Use textContent for API-provided text
// //       card.querySelector(".material-name").textContent = material.name;

// //       // Add an icon if the API provides an image URL
// //       const iconElement = card.querySelector(".material-icon");

// //       if (material.icon || material.image || material.image_url) {
// //         const img = document.createElement("img");
// //         img.src = material.icon || material.image || material.image_url;
// //         img.alt = material.name;
// //         img.className = "h-10 w-10 object-contain";
// //         iconElement.appendChild(img);
// //       } else {
// //         iconElement.textContent = "♻️";
// //       }

// //       // Toggle selection
// //       card.addEventListener("click", () => {
// //         card.classList.toggle("selected");

// //         const checkMark = card.querySelector(".check-mark");
// //         checkMark.classList.toggle(
// //           "hidden",
// //           !card.classList.contains("selected")
// //         );
// //       });

// //       materialsContainer.appendChild(card);
// //     });
// //   } catch (error) {
// //     console.error("Error fetching materials:", error);

// //     materialsContainer.innerHTML = `
// //       <p class="col-span-full text-center text-red-500">
// //         Unable to load materials. Please refresh and try again.
// //       </p>
// //     `;
// //   }
// // }

// // fetchMaterials();

// // const BASE_URL = 'https://recycle-connect-m189.onrender.com';

// // const iconMap = {
// //   plastic: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Group_vnbhb6.png',
// //   paper: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Vector_mc2l36.png',
// //   metal: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/emojione-v1_oil-drum_yfnegm.png',
// //   glass: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Vector_1_nasga7.png',
// //   // ewaste: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Vector_2_wbozty.png',
// //   'e-waste': 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Vector_2_wbozty.png',
// //   others: 'https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Group_1_supxpn.png'
// // };

// // fetch(`${BASE_URL}/api/materials/`, {
// //   headers: {
// //     'Authorization': 'Bearer ' + localStorage.getItem('token')
// //   }
// // })
// // .then(res => res.json())
// // .then(data => {
// //   const materials = data.data || data;
// //   materialsContainer.innerHTML = '';

// //   materials.forEach(mat => {
// //     const key = mat.name.toLowerCase();
// //     const div = document.createElement('div');
// //     div.className = 'material-card selected relative flex flex-col h-[110px] md:h-[120px] lg:h-[130px] w-full rounded-xl shadow-sm bg-white items-center justify-center gap-2 border border-[hsl(150,19%,88%)] hover:border-2 hover:border-[hsl(161,88%,25%)] hover:bg-[hsl(146,44%,94%)] cursor-pointer';
// //     div.dataset.material = key;
// //     div.dataset.materialId = mat._id || mat.id;
// //     div.dataset.name = mat.name;
// //     div.dataset.description = mat.description;

// //     div.innerHTML = `
// //       <div class="check-mark hidden absolute top-3 right-3 w-5 h-5 bg-[hsl(161,88%,25%)] text-white rounded-full flex items-center justify-center text-[14px] font-bold">✓</div>
// //       <img src="${iconMap[key] || iconMap.others}" class="w-8 h-8 lg:w-12 lg:h-12 object-contain" />
// //       <p class="text-[13px] lg:text-base font-[600]">${mat.name}</p>
// //     `;
// //     materialsContainer.appendChild(div);
// //   });
// // })
// // .catch(err => {
// //   console.error(err);
// //   materialsContainer.innerHTML = '<p class="text-red-500 text-sm">Failed to load materials</p>';
// // });



// document.addEventListener('DOMContentLoaded', () => {
//   const container = document.getElementById('materials-container');
//   const cards = container.querySelectorAll('.material-card');

//   // ---- CREATE BOX WITH JS ONLY (no HTML needed) ----
//   const othersBox = document.createElement('div');
//   othersBox.id = 'others-desc-box';
//   othersBox.className = 'hidden mt-4 mb-4 w-full';

//   const textarea = document.createElement('textarea');
//   textarea.placeholder = 'Describe material';
//   textarea.className = 'w-full h-[90px] p-3 text-[13px] border border-[hsl(150,19%,88%)] rounded-xl resize-none outline-none focus:border-gray-200 bg-white';
//   othersBox.appendChild(textarea);

//   // Put it in the gap between cards and Remember Me
//   container.insertAdjacentElement('afterend', othersBox);

//   cards.forEach(card => {
//     card.addEventListener('click', () => {
//       // 1. Your existing logic - Hide ALL check-marks first (KEPT)
//       cards.forEach(c => {
//         const mark = c.querySelector('.check-mark');
//         mark.classList.add('hidden');
//         mark.classList.remove('flex');
//         c.classList.remove('border-2', 'border-[#0F6A3D]', 'bg-[#E9F5EC]');
//         c.classList.add('border', 'border-[hsl(150,19%,88%)]', 'bg-white');
//       });

//       // 2. Your existing logic - Show only the clicked one (KEPT)
//       const currentMark = card.querySelector('.check-mark');
//       currentMark.classList.remove('hidden');
//       currentMark.classList.add('flex');
//       card.classList.add('border-2', 'border-[#0F6A3D]', 'bg-[#E9F5EC]');
//       card.classList.remove('border', 'border-[hsl(150,19%,88%)]', 'bg-white');

//       // 3. NEW - Only show box if it's Others
//       const isOthers = card.dataset.material === 'others';

//       if (isOthers) {
//         othersBox.classList.remove('hidden');
//         textarea.focus();
//       } else {
//         othersBox.classList.add('hidden');
//       }
//     });
//   });


// // ===== 3 - USE MY CURRENT LOCATION =====
// const btn = document.getElementById('use-location-btn');
// const display = document.getElementById('location-display');

// btn.addEventListener('click', () => {
//   display.textContent = 'Locating...';
//   navigator.geolocation.getCurrentPosition(async (p) => {
//     const { latitude: lat, longitude: lon } = p.coords;
//     try {
//       const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
//       const d = await r.json();
//       const a = d.address || {};

//       // 1. Street part
//       let street = '';
//       if (a.house_number && a.road) street = `${a.house_number} ${a.road}`;
//       else street = a.road || a.neighbourhood || a.suburb || d.display_name.split(',')[0];

//       // 2. Place = city / LGA / area
//       const place = a.city || a.town || a.county || a.suburb || '';

//       // 3. State
//       const state = a.state || '';

//       // Build short display - MAX 3 parts
//       let shortDisplay = '';
//       if (a.house_number && a.road) {
//         // With number: Number, Street, Place, State -> but you want 3, so combine number+street
//         shortDisplay = `${street}, ${place}, ${state}`;
//       } else {
//         // Without number: Street, Place, State
//         shortDisplay = `${street}, ${place}, ${state}`;
//       }

//       // Clean: remove empty,, and duplicates
//       shortDisplay = [...new Set(shortDisplay.split(',').map(s=>s.trim()).filter(Boolean))].join(', ');

//       // Show SHORT to user
//       display.textContent = shortDisplay;

//       // For backend - save FULL real address (5 parts needed)
//       localStorage.setItem('pickupLocationDisplay', shortDisplay);
//       localStorage.setItem('pickupLocation', d.display_name);
//       localStorage.setItem('pickupCoords', JSON.stringify({ lat, lon }));

//       console.log('SHORT (3 parts):', shortDisplay);
//       console.log('FULL for API:', d.display_name);

//     } catch(e){
//       console.error(e);
//       display.textContent = 'Failed';
//     }
//   }, (e) => alert(e.message), { enableHighAccuracy: true });
// });



  

//   // ===== 4 - NEXT BUTTON VALIDATION =====
//   const nextBtn = document.getElementById('next-btn');
//   nextBtn.addEventListener('click', (e) => {
//     if (!selectedMaterial) {
//       e.preventDefault();
//       alert('Please select a material first');
//       container.scrollIntoView({ behavior: 'smooth' });
//       return;
//     }

//     // If Others, make sure they described it
//     if (selectedMaterial === 'others' &&!textarea.value.trim()) {
//       e.preventDefault();
//       alert('Please describe the material');
//       textarea.focus();
//       return;
//     }

//     // Save selection for Schedule-Pick.html
//     localStorage.setItem('selectedMaterial', selectedMaterial);
//     localStorage.setItem('othersDescription', textarea.value.trim());
//   });

//   // ===== 5 - SIDEBAR NAVIGATION =====
//   document.querySelectorAll('[data-href]').forEach(item => {
//     item.addEventListener('click', () => {
//       const href = item.getAttribute('data-href');
//       if (href) window.location.href = href;
//     });
//   });
// });
 



document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. CONFIGURATION
  // ==========================================

  const BASE_URL = "https://recycle-connect-m189.onrender.com";
  const MATERIALS_API_URL = `${BASE_URL}/api/materials/`;

  // ==========================================
  // 2. HTML ELEMENTS
  // ==========================================

  const materialsContainer = document.getElementById("materials-container");
  const locationDisplay = document.getElementById("location-display");
  const useLocationBtn = document.getElementById("use-location-btn");
  const nextBtn = document.getElementById("next-btn");

  if (!materialsContainer || !locationDisplay || !useLocationBtn || !nextBtn) {
    console.error("Household request page is missing required HTML elements.");
    return;
  }

  // ==========================================
  // 3. MATERIAL ICONS
  // ==========================================

  const iconMap = {
    plastic:
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Group_vnbhb6.png",

    paper:
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Vector_mc2l36.png",

    metal:
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/emojione-v1_oil-drum_yfnegm.png",

    glass:
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676033/Vector_1_nasga7.png",

    ewaste:
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Vector_2_wbozty.png",

    "e-waste":
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Vector_2_wbozty.png",

    others:
      "https://res.cloudinary.com/pftvcaqk/image/upload/v1790676032/Group_1_supxpn.png",
  };

  // ==========================================
  // 4. PAGE STATE
  // ==========================================

  const selectedMaterials = new Map();

  let materials = [];

  let pickupLocation =
    localStorage.getItem("pickupLocation") || "";

  let pickupLocationDisplay =
    localStorage.getItem("pickupLocationDisplay") || "";

  let pickupCoords = null;

  try {
    const savedCoords = localStorage.getItem("pickupCoords");

    if (savedCoords) {
      pickupCoords = JSON.parse(savedCoords);
    }
  } catch (error) {
    console.error("Could not restore saved coordinates:", error);
  }

  if (pickupLocationDisplay) {
    locationDisplay.textContent = pickupLocationDisplay;
  }

  // ==========================================
  // 5. RESTORE PREVIOUS MATERIAL SELECTION
  // ==========================================

  function restoreSelectedMaterials() {
    try {
      const savedMaterials = JSON.parse(
        localStorage.getItem("selectedMaterials") || "[]"
      );

      if (Array.isArray(savedMaterials)) {
        savedMaterials.forEach((material) => {
          if (material.id !== undefined && material.id !== null) {
            selectedMaterials.set(String(material.id), material);
          }
        });
      }

      // Support data saved by the previous single-selection version.
      const oldSelection = localStorage.getItem("selectedMaterial");

      if (selectedMaterials.size === 0 && oldSelection) {
        const oldDescription =
          localStorage.getItem("othersDescription") || "";

        window.previousMaterial = {
          name: oldSelection,
          description: oldDescription,
        };
      }
    } catch (error) {
      console.error("Could not restore material selection:", error);
    }
  }

  // ==========================================
  // 6. FETCH MATERIALS
  // ==========================================

  async function fetchMaterials() {
    materialsContainer.innerHTML = `
      <p class="col-span-full text-center text-gray-500">
        Loading materials...
      </p>
    `;

    try {
      const token = localStorage.getItem("authToken");

      const headers = {
        Accept: "application/json",
      };

      // Send a token only when one exists.
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(MATERIALS_API_URL, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Materials request failed: ${response.status}`
        );
      }

      const data = await response.json();

      // Support common response formats.
      if (Array.isArray(data)) {
        materials = data;
      } else if (Array.isArray(data.results)) {
        materials = data.results;
      } else if (Array.isArray(data.data)) {
        materials = data.data;
      } else {
        throw new Error("Unexpected materials API response.");
      }

      renderMaterials();
    } catch (error) {
      console.error("Error fetching materials:", error);

      materialsContainer.innerHTML = `
        <div class="col-span-full text-center">
          <p class="text-sm text-red-500">
            Unable to load materials.
          </p>

          <button
            type="button"
            id="retry-materials-btn"
            class="mt-3 rounded-lg bg-[#087A55] px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      `;

      document
        .getElementById("retry-materials-btn")
        ?.addEventListener("click", fetchMaterials);
    }
  }

  // ==========================================
  // 7. RENDER MATERIAL CARDS
  // ==========================================

  function normalizeMaterialName(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function renderMaterials() {
    materialsContainer.innerHTML = "";

    if (materials.length === 0) {
      materialsContainer.innerHTML = `
        <p class="col-span-full text-center text-gray-500">
          No materials available.
        </p>
      `;
      return;
    }

    materials.forEach((material) => {
      const materialId = material.id ?? material._id;

      if (materialId === undefined || materialId === null) {
        console.warn("Material is missing its ID:", material);
        return;
      }

      const id = String(materialId);
      const name = material.name || "Unnamed material";
      const key = normalizeMaterialName(name);
      const isSelected = selectedMaterials.has(id);

      const card = document.createElement("button");

      card.type = "button";
      card.dataset.materialId = id;
      card.dataset.material = key;
      card.dataset.name = name;

      card.className = `
        material-card relative flex flex-col
        h-[110px] md:h-[120px] lg:h-[130px]
        w-full rounded-xl shadow-sm
        items-center justify-center gap-2
        border transition cursor-pointer
        ${
          isSelected
            ? "border-2 border-[#087A55] bg-[hsl(146,44%,94%)]"
            : "border-[hsl(150,19%,88%)] bg-white"
        }
        hover:border-2 hover:border-[#087A55]
      `;

      card.setAttribute("aria-pressed", String(isSelected));

      const checkMark = document.createElement("span");

      checkMark.className = `
        check-mark absolute top-3 right-3
        w-5 h-5 bg-[#087A55] text-white
        rounded-full items-center justify-center
        text-[14px] font-bold
        ${isSelected ? "flex" : "hidden"}
      `;

      checkMark.textContent = "✓";

      const icon = document.createElement("img");

      // Prefer an API-provided icon, then use the existing design icon.
      icon.src =
        material.icon ||
        material.image ||
        material.image_url ||
        iconMap[key] ||
        iconMap.others;

      icon.alt = `${name} icon`;
      icon.className = "w-8 h-8 lg:w-12 lg:h-12 object-contain";

      icon.onerror = () => {
        icon.onerror = null;
        icon.src = iconMap.others;
      };

      const label = document.createElement("p");

      label.className = "text-[13px] lg:text-base font-semibold";
      label.textContent = name;

      card.append(checkMark, icon, label);

      card.addEventListener("click", () => {
        toggleMaterial(material);
      });

      materialsContainer.appendChild(card);
    });

    updateSelectionDisplay();
  }

  // ==========================================
  // 8. SELECT ONE MATERIAL PER REQUEST
  // ==========================================

  function toggleMaterial(material) {
    const materialId = material.id ?? material._id;

    if (materialId === undefined || materialId === null) {
      return;
    }

    const id = String(materialId);

    // If the clicked material is already selected, deselect it.
    if (selectedMaterials.has(id)) {
      selectedMaterials.clear();
    } else {
      // Clear the previous selection before selecting another.
      selectedMaterials.clear();

      selectedMaterials.set(id, {
        id: materialId,
        name: material.name || "Unnamed material",
      });
    }

    updateSelectionDisplay();
    saveSelectedMaterials();
    updateOthersDescription();
  }

  function updateSelectionDisplay() {
    document.querySelectorAll(".material-card").forEach((card) => {
      const selected = selectedMaterials.has(card.dataset.materialId);

      const checkMark = card.querySelector(".check-mark");

      card.setAttribute("aria-pressed", String(selected));

      card.classList.toggle("border-2", selected);
      card.classList.toggle("border-[#087A55]", selected);
      card.classList.toggle("bg-[hsl(146,44%,94%)]", selected);

      card.classList.toggle(
        "border-[hsl(150,19%,88%)]",
        !selected
      );

      card.classList.toggle("bg-white", !selected);

      if (checkMark) {
        checkMark.classList.toggle("hidden", !selected);
        checkMark.classList.toggle("flex", selected);
      }
    });
  }

  function saveSelectedMaterials() {
    localStorage.setItem(
      "selectedMaterials",
      JSON.stringify(Array.from(selectedMaterials.values()))
    );

    // Keep the older selection key compatible with this page.
    localStorage.removeItem("selectedMaterial");

    if (
      !Array.from(selectedMaterials.values()).some(
        (material) =>
          normalizeMaterialName(material.name) === "others"
      )
    ) {
      localStorage.removeItem("othersDescription");
    }
  }

  // ==========================================
  // 9. OTHERS DESCRIPTION BOX
  // ==========================================

  const othersBox = document.createElement("div");

  othersBox.id = "others-desc-box";
  othersBox.className = "hidden mt-4 mb-4 w-full";

  const othersLabel = document.createElement("label");

  othersLabel.htmlFor = "others-description";
  othersLabel.className =
    "mb-2 block text-sm font-semibold text-[#07543E]";

  othersLabel.textContent = "Describe the other material";

  const textarea = document.createElement("textarea");

  textarea.id = "others-description";
  textarea.placeholder = "Describe the material you want to recycle";
  textarea.className =
    "w-full h-[90px] p-3 text-[13px] border border-[hsl(150,19%,88%)] rounded-xl resize-none outline-none focus:border-[#087A55] bg-white";

  textarea.value = localStorage.getItem("othersDescription") || "";

  othersBox.append(othersLabel, textarea);

  materialsContainer.insertAdjacentElement("afterend", othersBox);


function updateOthersDescription() {
  const othersSelected = Array.from(selectedMaterials.values()).some(
    (material) => {
      const name = normalizeMaterialName(material.name);
      return name === "others" || name === "other";
    }
  );

  othersBox.classList.toggle("hidden", !othersSelected);

  if (!othersSelected) {
    textarea.value = "";
    localStorage.removeItem("othersDescription");
  }
}



  textarea.addEventListener("input", () => {
    localStorage.setItem(
      "othersDescription",
      textarea.value
    );
  });

  // ==========================================
  // 10. USE MY CURRENT LOCATION
  // ==========================================

  useLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location services.");
      return;
    }

    const originalText = useLocationBtn.textContent;

    useLocationBtn.style.pointerEvents = "none";
    useLocationBtn.style.opacity = "0.6";
    locationDisplay.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        pickupCoords = { lat, lon };

        // Save coordinates immediately in case reverse geocoding fails.
        localStorage.setItem("pickupCoords", JSON.stringify(pickupCoords));

        try {
          const url =
            "https://nominatim.openstreetmap.org/reverse" +
            `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error("Reverse geocoding failed.");
          }

          const data = await response.json();
          const address = data.address || {};

          const street =
            address.house_number && address.road
              ? `${address.house_number} ${address.road}`
              : address.road ||
                address.neighbourhood ||
                address.suburb ||
                "";

          const place =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            address.suburb ||
            "";

          const state = address.state || "";

          const shortAddress = [
            ...new Set([street, place, state].filter(Boolean)),
          ].join(", ");

          pickupLocation = data.display_name || `${lat}, ${lon}`;
          pickupLocationDisplay = shortAddress || pickupLocation;

          locationDisplay.textContent = pickupLocationDisplay;

          localStorage.setItem("pickupLocation", pickupLocation);
          localStorage.setItem(
            "pickupLocationDisplay",
            pickupLocationDisplay
          );
        } catch (error) {
          console.error("Address lookup failed:", error);

          // Coordinates are still saved if an address cannot be retrieved.
          pickupLocation = `${lat}, ${lon}`;
          pickupLocationDisplay = "Current location coordinates";

          locationDisplay.textContent = pickupLocationDisplay;

          localStorage.setItem("pickupLocation", pickupLocation);
          localStorage.setItem(
            "pickupLocationDisplay",
            pickupLocationDisplay
          );

          alert(
            "Your coordinates were saved, but we could not retrieve your street address."
          );
        } finally {
          useLocationBtn.textContent = originalText;
          useLocationBtn.style.pointerEvents = "";
          useLocationBtn.style.opacity = "";
        }
      },
      (error) => {
        console.error("Location error:", error);

        let message = "Unable to retrieve your location.";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "The location request timed out. Please try again.";
        }

        alert(message);

        locationDisplay.textContent =
          pickupLocationDisplay || "Location not selected";

        useLocationBtn.textContent = originalText;
        useLocationBtn.style.pointerEvents = "";
        useLocationBtn.style.opacity = "";
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });

  // ==========================================
  // 11. NEXT BUTTON VALIDATION
  // ==========================================

  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (selectedMaterials.size === 0) {
      alert("Please select at least one recycling material.");
      materialsContainer.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const othersSelected = Array.from(selectedMaterials.values()).some(
      (material) => normalizeMaterialName(material.name) === "others"
    );

    if (othersSelected && !textarea.value.trim()) {
      alert("Please describe the other material you want to recycle.");
      othersBox.classList.remove("hidden");
      textarea.focus();
      return;
    }

    if (!pickupLocation) {
      alert("Please select your pickup location first.");
      locationDisplay.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    saveSelectedMaterials();

    localStorage.setItem("pickupLocation", pickupLocation);
    localStorage.setItem(
      "pickupLocationDisplay",
      pickupLocationDisplay
    );

    localStorage.setItem(
      "othersDescription",
      textarea.value.trim()
    );

    if (pickupCoords) {
      localStorage.setItem(
        "pickupCoords",
        JSON.stringify(pickupCoords)
      );
    }

    window.location.href = "Schedule-Pick.html";
  });

  // ==========================================
  // 12. SIDEBAR NAVIGATION
  // ==========================================

  document.querySelectorAll("[data-href]").forEach((item) => {
    item.addEventListener("click", () => {
      const href = item.getAttribute("data-href");

      if (href) {
        window.location.href = href;
      }
    });
  });

  // ==========================================
  // 13. INITIALIZE
  // ==========================================

  restoreSelectedMaterials();

  fetchMaterials().then(() => {
    updateOthersDescription();

    // Restore selection made using the previous version if possible.
    if (window.previousMaterial) {
      const previous = window.previousMaterial;

      const matchingMaterial = materials.find(
        (material) =>
          normalizeMaterialName(material.name) ===
          normalizeMaterialName(previous.name)
      );

      if (matchingMaterial) {
        const id = String(matchingMaterial.id ?? matchingMaterial._id);

        if (!selectedMaterials.has(id)) {
          selectedMaterials.set(id, {
            id: matchingMaterial.id ?? matchingMaterial._id,
            name: matchingMaterial.name,
          });
        }

        if (previous.description) {
          textarea.value = previous.description;
          localStorage.setItem(
            "othersDescription",
            previous.description
          );
        }

        saveSelectedMaterials();
        updateSelectionDisplay();
        updateOthersDescription();
      }
    }
  });
});