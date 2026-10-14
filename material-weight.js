if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
  const tailwindScript = document.createElement("script");
  tailwindScript.src =
    "https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp,container-queries";
  document.head.appendChild(tailwindScript);
}

const API_CONFIG = {
  BASE_URL: "https://api.recycleconnect.com/api",
  ENDPOINTS: {
    PICKUP: (id) => `/pickups/${id}`,
    UPDATE_STATUS: (id) => `/pickups/${id}/status`,
    MATERIALS: (id) => `/pickups/${id}/materials`,
    PRICES: "/materials/prices",
  },
  TIMEOUT_MS: 4000,
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API] Request to ${url} failed:`, error.message);
    throw error;
  }
}

const ApiService = {
  async getPickup(pickupId) {
    return await apiRequest(API_CONFIG.ENDPOINTS.PICKUP(pickupId), {
      method: "GET",
    });
  },

  // Fetch current market prices per kg for materials
  async getMaterialPrices() {
    return await apiRequest(API_CONFIG.ENDPOINTS.PRICES, { method: "GET" });
  },

  // Save / Post a new weighed material record to the server
  async addMaterial(pickupId, materialData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.MATERIALS(pickupId), {
      method: "POST",
      body: JSON.stringify(materialData),
    });
  },

  // Update pickup status (e.g., 'Completed', 'In Progress')
  async updatePickupStatus(pickupId, status) {
    return await apiRequest(API_CONFIG.ENDPOINTS.UPDATE_STATUS(pickupId), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const pickupIdElem = document.getElementById("pickup-id");
  const customerNameElem = document.getElementById("customer-name");
  const dateElem = document.getElementById("date");
  const statusElem = document.getElementById("In-progress");

  const materialSelect = document.getElementById("material-select");
  const weightInput = document.getElementById("material-weight-input");
  const costInput = document.getElementById("cost-per-kg-input");

  const materialsTable = document.getElementById("materials-table");
  const totalWeightElem = document.getElementById("total-weight");
  const totalCostElem = document.getElementById("total-cost");
  const saveBtn = document.getElementById("save-continue-btn");
  const searchInput = document.getElementById("search-input");

  const navList = document.getElementById("nav-list");
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const sidebarList = document.getElementById("first-list");

  // --- Extract Current Pickup ID ---

  const urlParams = new URLSearchParams(window.location.search);
  const currentPickupId =
    urlParams.get("pickupId") ||
    (pickupIdElem ? pickupIdElem.textContent.replace(/[^0-9]/g, "") : "1024") ||
    "1024";

  // --- Default Price Map per Material (in Naira #) ---
  const DEFAULT_PRICES = {
    plastic: 500,
    paper: 300,
    bottle: 400,
  };

  // --- SVG Recycle Icon for Table Rows ---
  const RECYCLE_ICON_SVG = `
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M31.8193 17.5974L34.628 22.4576C35.1913 23.4333 35.4878 24.5401 35.4877 25.6668C35.4875 26.7934 35.1907 27.9002 34.6271 28.8757C34.0635 29.8513 33.253 30.6613 32.2771 31.2242C31.3011 31.7871 30.1942 32.0832 29.0675 32.0826H25.2908V35.7492L16.1242 29.3326L25.2908 22.9159V26.5826H29.0712C29.218 26.5826 29.3628 26.5473 29.4932 26.4797C29.6236 26.4121 29.7358 26.3142 29.8205 26.1941C29.9051 26.0741 29.9597 25.9355 29.9795 25.7899C29.9994 25.6444 29.984 25.4962 29.9347 25.3579L29.865 25.2076L27.06 20.3456L31.8193 17.5974ZM10.1402 12.6199L11.1137 23.7666L7.94017 21.9332L6.04817 25.2076C5.97467 25.3348 5.93282 25.4778 5.92614 25.6245C5.91947 25.7713 5.94815 25.9175 6.0098 26.0508C6.07144 26.1842 6.16422 26.3007 6.28034 26.3907C6.39645 26.4807 6.53249 26.5415 6.677 26.5679L6.842 26.5826H12.4575V32.0826H6.842C5.71565 32.0825 4.60916 31.786 3.63372 31.2228C2.65829 30.6596 1.84829 29.8496 1.28513 28.8742C0.721965 27.8987 0.425489 26.7922 0.425497 25.6659C0.425504 24.5395 0.721993 23.433 1.28517 22.4576L3.17717 19.1832L0 17.3499L10.1402 12.6199ZM21.1658 0.860893C22.1403 1.4238 22.9496 2.23309 23.5125 3.20756L25.4027 6.48189L28.5798 4.64856L27.6045 15.7952L17.4662 11.0652L20.6378 9.23189L18.7495 5.95756C18.6761 5.83034 18.5732 5.72262 18.4495 5.64347C18.3257 5.56433 18.1848 5.51608 18.0385 5.50278C17.8922 5.48948 17.7449 5.51153 17.6089 5.56706C17.4729 5.6226 17.3523 5.71 17.2572 5.82189L17.1618 5.95756L14.3568 10.8196L9.59383 8.06956L12.3988 3.20756C12.8203 2.47775 13.3815 1.83812 14.0502 1.3252C14.7189 0.812285 15.4821 0.436127 16.2962 0.218211C17.1104 0.000295445 17.9594 -0.055108 18.795 0.0551646C19.6305 0.165437 20.4361 0.439226 21.1658 0.860893Z" fill="#087A55"/>
    </svg>
  `;

  // --- Initial Data Store ---
  let materialsList = [
    {
      id: 1,
      name: "Plastic",
      weight: 12.5,
      costPerKg: 500,
      total: 6250,
    },
  ];

  // Load persisted materials from localStorage as cache/fallback
  const storedMaterials = localStorage.getItem(
    `rc_materials_${currentPickupId}`,
  );
  if (storedMaterials) {
    try {
      const parsed = JSON.parse(storedMaterials);
      if (Array.isArray(parsed) && parsed.length > 0) {
        materialsList = parsed;
      }
    } catch (e) {
      console.warn("Could not parse stored materials:", e);
    }
  }

  // Save current materials to localStorage
  function saveToStorage() {
    localStorage.setItem(
      `rc_materials_${currentPickupId}`,
      JSON.stringify(materialsList),
    );
  }

  // Format currency with Naira symbol (#6,250)
  function formatCurrency(amount) {
    return (
      "#" +
      Number(amount).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })
    );
  }

  // Format weight
  function formatWeight(weight) {
    return (
      Number(weight).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      }) + "kg"
    );
  }

  // --- Update UI Status ---
  function updateStatusBadge(status) {
    if (!statusElem) return;
    statusElem.textContent = status;
    if (status.toLowerCase() === "completed") {
      statusElem.classList.remove("text-[#2e9b63]");
      statusElem.classList.add("text-[#087a55]");
      if (statusElem.parentElement) {
        statusElem.parentElement.classList.remove("bg-[#b2e6c5]");
        statusElem.parentElement.classList.add("bg-[#a3e3ba]");
      }
    } else {
      statusElem.classList.add("text-[#2e9b63]");
      statusElem.classList.remove("text-[#087a55]");
      if (statusElem.parentElement) {
        statusElem.parentElement.classList.add("bg-[#b2e6c5]");
        statusElem.parentElement.classList.remove("bg-[#a3e3ba]");
      }
    }
  }

  // --- Recalculate and Render Table Rows and Totals ---
  function renderTable() {
    if (!materialsTable) return;

    // Keep the header row (first tr), remove existing data rows
    const rows = materialsTable.querySelectorAll("tr");
    for (let i = 1; i < rows.length; i++) {
      rows[i].remove();
    }

    let sumWeight = 0;
    let sumCost = 0;

    materialsList.forEach((item, index) => {
      sumWeight += Number(item.weight) || 0;
      sumCost += Number(item.total) || 0;

      const tr = document.createElement("tr");
      tr.id = `table-row-${item.id || index + 1}`;
      tr.className =
        "h-20 border-b border-[#e2ece6] hover:bg-[#f2faf5] transition-colors";

      tr.innerHTML = `
        <td class="flex gap-2 pt-6 justify-center items-center border-collapse text-[#07543e] text-lg font-medium">
          ${RECYCLE_ICON_SVG}
          <span>${item.name}</span>
        </td>
        <td class="border-r border-l border-collapse text-center text-[#07543e] text-lg font-medium">
          ${item.weight}Kg
        </td>
        <td class="border-r border-collapse text-center text-[#07543e] text-lg font-medium">
          #${Number(item.costPerKg).toLocaleString()}
        </td>
        <td class="text-center text-[#07543e] text-lg font-medium">
          #${Number(item.total).toLocaleString()}
        </td>
      `;

      materialsTable.appendChild(tr);
    });

    // Update total weight and cost cards
    if (totalWeightElem) {
      totalWeightElem.textContent = formatWeight(sumWeight);
    }
    if (totalCostElem) {
      totalCostElem.textContent = formatCurrency(sumCost);
    }

    saveToStorage();
  }

  // --- Fetch Initial Data from API on Page Load ---
  async function loadInitialData() {
    // 1. Fetch live market prices from API
    try {
      const prices = await ApiService.getMaterialPrices();
      if (prices && typeof prices === "object") {
        Object.assign(DEFAULT_PRICES, prices);
      }
    } catch (e) {}

    //  Fetch pickup record from API
    try {
      const pickupData = await ApiService.getPickup(currentPickupId);
      if (pickupData) {
        if (pickupData.customerName && customerNameElem) {
          customerNameElem.textContent = `Customer: ${pickupData.customerName}`;
        }
        if (pickupData.date && dateElem) {
          dateElem.textContent = `Date: ${pickupData.date}`;
        }
        if (pickupData.status) {
          updateStatusBadge(pickupData.status);
        }
        if (
          Array.isArray(pickupData.materials) &&
          pickupData.materials.length > 0
        ) {
          materialsList = pickupData.materials;
          renderTable();
          showNotification("Pickup data synced with API.", "success");
          return;
        }
      }
    } catch (e) {
      // Backend not running / offline - fallback cleanly to local state
      console.info("API offline or unreachable. Using cached/local data.");
    }

    // Render table from local state if API wasn't reached
    renderTable();
  }

  // --- Auto-fill Cost Per Kg when Material is Selected ---
  if (materialSelect) {
    materialSelect.addEventListener("change", () => {
      const selectedValue = materialSelect.value.toLowerCase();
      if (DEFAULT_PRICES[selectedValue] && costInput) {
        costInput.value = DEFAULT_PRICES[selectedValue];
      }
    });
  }

  // --- Add / Save Material with API Integration ---
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const selectedValue = materialSelect ? materialSelect.value.trim() : "";
      const weightVal = weightInput ? parseFloat(weightInput.value) : NaN;
      const costVal = costInput ? parseFloat(costInput.value) : NaN;

      // Case A: Form fields are filled -> Add or Update material
      if (
        selectedValue &&
        !isNaN(weightVal) &&
        weightVal > 0 &&
        !isNaN(costVal) &&
        costVal >= 0
      ) {
        const materialName =
          selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1);
        const itemTotal = parseFloat((weightVal * costVal).toFixed(2));

        const newMaterialItem = {
          id: Date.now(),
          name: materialName,
          weight: weightVal,
          costPerKg: costVal,
          total: itemTotal,
        };

        // Loading UI state on button
        const originalBtnHtml = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.classList.add("opacity-75", "cursor-not-allowed");

        try {
          // Attempt API submission
          await ApiService.addMaterial(currentPickupId, newMaterialItem);
          showNotification(
            `${materialName} (${weightVal}kg) synced with API!`,
            "success",
          );
        } catch (err) {
          // Fallback notice
          showNotification(
            `${materialName} (${weightVal}kg) saved locally (API offline)`,
            "info",
          );
        } finally {
          // Restore button
          saveBtn.disabled = false;
          saveBtn.classList.remove("opacity-75", "cursor-not-allowed");
          saveBtn.innerHTML = originalBtnHtml;
        }

        // Update local list
        const existingItem = materialsList.find(
          (m) => m.name.toLowerCase() === materialName.toLowerCase(),
        );

        if (existingItem) {
          existingItem.weight = parseFloat(
            (existingItem.weight + weightVal).toFixed(2),
          );
          existingItem.costPerKg = costVal;
          existingItem.total = parseFloat(
            (existingItem.weight * existingItem.costPerKg).toFixed(2),
          );
        } else {
          materialsList.push(newMaterialItem);
        }

        renderTable();

        // Reset inputs
        if (materialSelect) materialSelect.value = "";
        if (weightInput) weightInput.value = "";
        if (costInput) costInput.value = "";

        // Case B: Inputs empty, but table has items -> Mark pickup as Completed
      } else if (
        materialsList.length > 0 &&
        (!selectedValue || isNaN(weightVal))
      ) {
        const originalBtnHtml = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.classList.add("opacity-75", "cursor-not-allowed");

        try {
          await ApiService.updatePickupStatus(currentPickupId, "Completed");
          updateStatusBadge("Completed");
          showNotification("Status updated to Completed on server!", "success");
        } catch (err) {
          updateStatusBadge("Completed");
          showNotification(
            "Status updated to Completed (saved locally)",
            "info",
          );
        } finally {
          saveBtn.disabled = false;
          saveBtn.classList.remove("opacity-75", "cursor-not-allowed");
          saveBtn.innerHTML = originalBtnHtml;
        }

        // Case C: Missing inputs and no items
      } else {
        showNotification(
          "Please select a material and enter a valid weight and cost.",
          "error",
        );
      }
    });
  }

  // --- Real-time Search Table Filter ---
  if (searchInput && materialsTable) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      const rows = materialsTable.querySelectorAll("tr");

      // Start from index 1 to skip header row
      for (let i = 1; i < rows.length; i++) {
        const rowText = rows[i].textContent.toLowerCase();
        if (rowText.includes(query)) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    });
  }

  // --- Sidebar Navigation Handler (data-href) ---
  if (navList) {
    const navItems = navList.querySelectorAll("li[data-href]");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const href = item.getAttribute("data-href");
        if (href && href !== ".html" && href !== "#" && href.trim() !== "") {
          window.location.href = href;
        }
      });
    });
  }

  // --- Mobile Menu Toggle Handler ---
  if (menuToggleBtn && sidebarList) {
    menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = sidebarList.classList.contains("hidden");
      if (isHidden) {
        sidebarList.classList.remove("hidden");
        sidebarList.classList.add("flex");
        menuToggleBtn.setAttribute("aria-expanded", "true");
      } else {
        sidebarList.classList.add("hidden");
        sidebarList.classList.remove("flex");
        menuToggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Close menu when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth < 768) {
        if (
          !sidebarList.contains(e.target) &&
          !menuToggleBtn.contains(e.target)
        ) {
          sidebarList.classList.add("hidden");
          sidebarList.classList.remove("flex");
          menuToggleBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  // --- Top Navigation Quick Actions (prevent default page reloads) ---
  const notificationBtn = document.getElementById("notification-btn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("No new notifications.", "info");
    });
  }

  const profileAvatar = document.getElementById("profile-avatar");
  if (profileAvatar) {
    profileAvatar.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("Navigating to user profile...", "info");
    });
  }

  // --- Toast Notification Utility ---
  function showNotification(message, type = "success") {
    const existingToast = document.getElementById("rc-notification-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "rc-notification-toast";

    let bgColor = "bg-[#07543e]";
    let icon = "fa-check-circle";

    if (type === "error") {
      bgColor = "bg-red-600";
      icon = "fa-circle-exclamation";
    } else if (type === "info") {
      bgColor = "bg-[#0e7490]";
      icon = "fa-info-circle";
    }

    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl text-white font-[Inter] text-sm flex items-center gap-2 transition-all duration-300 transform translate-y-0 ${bgColor}`;
    toast.innerHTML = `<i class="fa ${icon}"></i> <span>${message}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Initial load
  loadInitialData();
});
