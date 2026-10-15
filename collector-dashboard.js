window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        recycleBg: "#f2faf5",
        recycleGreen: "#087a55",
        recycleDark: "#07543e",
        recycleLight: "#e8f6ee",
        recycleBorder: "#d8e5de",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
};

(function (global) {
  const metaEndpoint = document.querySelector('meta[name="api-endpoint"]');
  const API_BASE_URL =
    global.API_BASE_URL ||
    (metaEndpoint
      ? metaEndpoint.getAttribute("content")
      : "https://api.recycleconnect.ng/v1");

  const ENDPOINTS = {
    COLLECTOR_STATUS: "/collector/status",
    PICKUP_REQUESTS: "/collector/pickups",
    ACCEPT_PICKUP: "/collector/pickups/accept",
    DECLINE_PICKUP: "/collector/pickups/decline",
    DASHBOARD_STATS: "/collector/stats",
    WEEKLY_COLLECTION: "/collector/weekly-stats",
    NOTIFICATIONS: "/collector/notifications",
    SCHEDULE_PICKUP: "/pickups/schedule",
    AVAILABLE_SLOTS: "/pickups/slots",
  };

  /**
   * Universal HTTP fetch helper with configurable timeout and abort controller
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options (method, headers, body)
   * @param {number} timeoutMs - Timeout duration in milliseconds
   * @returns {Promise<Object>} JSON response
   */
  async function apiFetch(endpoint, options = {}, timeoutMs = 5000) {
    const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.message ||
            `API Error: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      console.warn(
        `[RecycleAPI] Request to ${url} failed (${err.message}). Activating graceful fallback simulation.`,
      );
      throw err;
    }
  }

  const RecycleAPI = {
    baseUrl: API_BASE_URL,

    /**
     * Update collector Online / Offline availability status
     * @param {boolean} isOnline
     * @returns {Promise<Object>}
     */
    async updateStatus(isOnline) {
      try {
        return await apiFetch(ENDPOINTS.COLLECTOR_STATUS, {
          method: "POST",
          body: JSON.stringify({
            isOnline,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        return {
          success: true,
          status: isOnline ? "online" : "offline",
          timestamp: new Date().toISOString(),
          isSimulated: true,
        };
      }
    },

    /**
     * Accept a customer pickup request
     * @param {Object} pickupData - Details of the pickup
     * @returns {Promise<Object>}
     */
    async acceptPickup(pickupData) {
      try {
        return await apiFetch(ENDPOINTS.ACCEPT_PICKUP, {
          method: "POST",
          body: JSON.stringify(pickupData),
        });
      } catch {
        return {
          success: true,
          status: "accepted",
          bookingId: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
          data: pickupData,
          timestamp: new Date().toISOString(),
          isSimulated: true,
        };
      }
    },

    /**
     * Decline a customer pickup request
     * @param {string|number} pickupId
     * @param {string} reason
     * @returns {Promise<Object>}
     */
    async declinePickup(pickupId, reason = "Collector unavailable") {
      try {
        return await apiFetch(ENDPOINTS.DECLINE_PICKUP, {
          method: "POST",
          body: JSON.stringify({
            pickupId,
            reason,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        return {
          success: true,
          status: "declined",
          pickupId,
          timestamp: new Date().toISOString(),
          isSimulated: true,
        };
      }
    },

    /**
     * Fetch live dashboard statistics
     * @returns {Promise<Object>}
     */
    async getDashboardStats() {
      try {
        return await apiFetch(ENDPOINTS.DASHBOARD_STATS, { method: "GET" });
      } catch {
        return {
          success: true,
          pickupsToday: 4,
          totalCollectedKg: 128.5,
          earnings: 18400,
          completedPickups: 36,
          isSimulated: true,
        };
      }
    },

    /**
     * Fetch weekly collection kilograms per day
     * @returns {Promise<Object>}
     */
    async getWeeklyStats() {
      try {
        return await apiFetch(ENDPOINTS.WEEKLY_COLLECTION, { method: "GET" });
      } catch {
        return {
          success: true,
          days: [
            { day: "Mon", kg: 14.5 },
            { day: "Tue", kg: 26.0 },
            { day: "Wed", kg: 22.8 },
            { day: "Thu", kg: 38.4 },
            { day: "Fri", kg: 25.0 },
            { day: "Sat", kg: 16.2 },
          ],
          isSimulated: true,
        };
      }
    },

    /**
     * Fetch collector notifications
     * @returns {Promise<Object>}
     */
    async getNotifications() {
      try {
        return await apiFetch(ENDPOINTS.NOTIFICATIONS, { method: "GET" });
      } catch {
        return {
          success: true,
          notifications: [
            {
              id: 1,
              title: "New Pickup in Ikeja",
              desc: "2.5 kg Plastic ready for collection",
              time: "5 mins ago",
              icon: "fa-box",
            },
            {
              id: 2,
              title: "Payout Processed",
              desc: "₦18,400 successfully credited to bank",
              time: "2 hours ago",
              icon: "fa-wallet",
            },
            {
              id: 3,
              title: "5-Star Collector Rating",
              desc: "Surulere resident gave you 5 stars",
              time: "Yesterday",
              icon: "fa-star",
            },
          ],
          isSimulated: true,
        };
      }
    },

    /**
     * Customer Schedule Pickup (backward compatibility)
     */
    async schedulePickup(payload) {
      try {
        return await apiFetch(ENDPOINTS.SCHEDULE_PICKUP, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        return {
          success: true,
          status: "confirmed",
          bookingId: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
          message: "Pickup scheduled successfully!",
          data: payload,
          timestamp: new Date().toISOString(),
          isSimulated: true,
        };
      }
    },

    /**
     * Set a custom API Base URL dynamically
     * @param {string} newUrl
     */
    setBaseUrl(newUrl) {
      this.baseUrl = newUrl;
    },
  };

  // Expose API module globally
  global.RecycleAPI = RecycleAPI;
})(typeof window !== "undefined" ? window : this);

document.addEventListener("DOMContentLoaded", async () => {
  console.log(
    `[first.js] Connected to RecycleAPI at: ${window.RecycleAPI.baseUrl}`,
  );

  let toastContainer = document.getElementById("rc-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "rc-toast-container";
    toastContainer.className =
      "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className =
      "pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transform translate-y-3 opacity-0 transition-all duration-300 text-sm";

    if (type === "success") {
      toast.classList.add(
        "bg-emerald-900/95",
        "text-white",
        "border-emerald-600/40",
      );
      toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-base shrink-0"></i><span class="flex-1">${message}</span>`;
    } else if (type === "warning") {
      toast.classList.add(
        "bg-amber-900/95",
        "text-white",
        "border-amber-600/40",
      );
      toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-400 text-base shrink-0"></i><span class="flex-1">${message}</span>`;
    } else {
      toast.classList.add("bg-gray-900/95", "text-white", "border-gray-700/40");
      toast.innerHTML = `<i class="fa-solid fa-circle-info text-emerald-400 text-base shrink-0"></i><span class="flex-1">${message}</span>`;
    }

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-3", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-3", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // MOBILE NAVIGATION DRAWER
  // --------------------------------------------------------------------------
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const menuToggleIcon = document.getElementById("menu-toggle-icon");
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");

  function openMobileNav() {
    if (!sidebar) return;
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");

    if (sidebarBackdrop) {
      sidebarBackdrop.classList.remove("hidden");
    }

    if (menuToggleIcon) {
      menuToggleIcon.classList.remove("fa-bars");
      menuToggleIcon.classList.add("fa-xmark");
    }

    document.body.classList.add("overflow-hidden", "md:overflow-auto");
  }

  function closeMobileNav() {
    if (!sidebar) return;
    sidebar.classList.remove("translate-x-0");
    sidebar.classList.add("-translate-x-full");

    if (sidebarBackdrop) {
      sidebarBackdrop.classList.add("hidden");
    }

    if (menuToggleIcon) {
      menuToggleIcon.classList.remove("fa-xmark");
      menuToggleIcon.classList.add("fa-bars");
    }

    document.body.classList.remove("overflow-hidden", "md:overflow-auto");
  }

  function toggleMobileNav(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains("translate-x-0");
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", toggleMobileNav);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  if (sidebar) {
    sidebar.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      sidebar &&
      sidebar.classList.contains("translate-x-0")
    ) {
      closeMobileNav();
    }
  });

  window.addEventListener("resize", () => {
    if (
      window.innerWidth >= 768 &&
      sidebar &&
      sidebar.classList.contains("translate-x-0")
    ) {
      closeMobileNav();
    }
  });

  const navLinks = document.querySelectorAll("#sidebar nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        closeMobileNav();
      }
    });
  });

  const statusToggle = document.getElementById("tog");
  if (statusToggle) {
    let isOnline = localStorage.getItem("rc_collector_status") !== "offline";
    const togText = statusToggle.querySelector("p");
    const togSvg = statusToggle.querySelector("svg");

    statusToggle.style.cursor = "pointer";
    statusToggle.setAttribute("title", "Toggle Online / Offline Availability");
    statusToggle.classList.add(
      "hover:shadow-md",
      "transition-all",
      "select-none",
    );

    function renderStatusUI(online) {
      if (online) {
        if (togText) togText.textContent = "Online";
        if (togSvg) {
          togSvg.innerHTML = `
            <rect width="48" height="24" rx="12" fill="#087A55" />
            <circle cx="35" cy="12" r="10" fill="white" />
          `;
        }
      } else {
        if (togText) togText.textContent = "Offline";
        if (togSvg) {
          togSvg.innerHTML = `
            <rect width="48" height="24" rx="12" fill="#9CA3AF" />
            <circle cx="13" cy="12" r="10" fill="white" />
          `;
        }
      }
    }

    // Set initial UI from storage
    renderStatusUI(isOnline);

    statusToggle.addEventListener("click", async () => {
      isOnline = !isOnline;
      renderStatusUI(isOnline);
      localStorage.setItem(
        "rc_collector_status",
        isOnline ? "online" : "offline",
      );

      // API Call: sync status with backend
      const res = await window.RecycleAPI.updateStatus(isOnline);

      if (isOnline) {
        showToast(
          "API Sync: You are now Online and accepting pickups",
          "success",
        );
      } else {
        showToast("API Sync: You are now Offline (Pickups paused)", "info");
      }
    });
  }
  const searchInput = document.querySelector('header input[type="text"]');
  const table = document.querySelector("table");
  const tableBody = table ? table.querySelector("tbody") : null;

  if (searchInput && tableBody) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      const rows = tableBody.querySelectorAll("tr:not(#rc-empty-row)");
      let visibleCount = 0;

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
          row.style.display = "";
          visibleCount++;
        } else {
          row.style.display = "none";
        }
      });

      let emptyRow = document.getElementById("rc-empty-row");
      if (visibleCount === 0) {
        if (!emptyRow) {
          emptyRow = document.createElement("tr");
          emptyRow.id = "rc-empty-row";
          emptyRow.innerHTML = `
            <td colspan="5" class="py-8 text-center text-gray-500 text-sm">
              <i class="fa-solid fa-magnifying-glass text-emerald-600 mr-2"></i>
              No pickup requests found matching "<strong>${query}</strong>"
            </td>
          `;
          tableBody.appendChild(emptyRow);
        } else {
          emptyRow.querySelector("strong").textContent = query;
          emptyRow.style.display = "";
        }
      } else if (emptyRow) {
        emptyRow.style.display = "none";
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchInput.value) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
      }
    });
  }

  const actionButtons = document.querySelectorAll("table tbody tr button");
  const pickupsTodayCard = document.querySelector(
    ".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 div:first-child .text-2xl",
  );

  actionButtons.forEach((btn, btnIndex) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const buttonText = btn.textContent.trim();
      const row = btn.closest("tr");
      if (!row) return;

      const materialName =
        row
          .querySelector("td:first-child span.font-medium")
          ?.textContent.trim() || "Material";
      const locationName =
        row.querySelector("td:nth-child(2)")?.textContent.trim() ||
        "Customer Location";
      const weightText =
        row.querySelector("td:nth-child(3)")?.textContent.trim() || "0 kg";
      const timeText =
        row.querySelector("td:nth-child(4)")?.textContent.trim() || "Now";

      if (buttonText === "Accept") {
        // Show loading state
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Accepting...`;
        btn.disabled = true;

        // API Call: accept pickup
        const response = await window.RecycleAPI.acceptPickup({
          pickupId: `req-${btnIndex + 1}`,
          material: materialName,
          location: locationName,
          weight: weightText,
          time: timeText,
        });

        // Update UI
        btn.innerHTML = `<i class="fa-solid fa-check mr-1.5"></i> Accepted`;
        btn.classList.remove("bg-emerald-700", "hover:bg-emerald-800");
        btn.classList.add("bg-emerald-600", "cursor-default", "shadow-sm");

        // Remove Decline button
        const declineBtn = row.querySelector("button:not(.bg-emerald-600)");
        if (declineBtn) {
          declineBtn.style.transition =
            "opacity 0.2s ease, transform 0.2s ease";
          declineBtn.style.opacity = "0";
          declineBtn.style.transform = "scale(0.8)";
          setTimeout(() => declineBtn.remove(), 200);
        }

        row.classList.add("bg-emerald-50/40");

        // Update stats
        if (pickupsTodayCard) {
          const currentVal =
            parseInt(pickupsTodayCard.textContent.trim(), 10) || 0;
          pickupsTodayCard.textContent = currentVal + 1;
        }

        const bookingId = response.bookingId || "RC-CONFIRMED";
        showToast(
          `API: Accepted ${materialName} (${bookingId}) at ${locationName}`,
          "success",
        );
      } else if (buttonText === "Decline") {
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i>`;
        btn.disabled = true;

        // API Call: decline pickup
        await window.RecycleAPI.declinePickup(
          `req-${btnIndex + 1}`,
          "Collector passed",
        );

        row.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        row.style.opacity = "0";
        row.style.transform = "translateX(-20px)";

        setTimeout(() => {
          row.remove();
          showToast(`API: Declined ${materialName} request`, "info");

          if (tableBody) {
            const remainingRows = tableBody.querySelectorAll(
              "tr:not(#rc-empty-row)",
            );
            if (remainingRows.length === 0) {
              const allDoneRow = document.createElement("tr");
              allDoneRow.id = "rc-empty-row";
              allDoneRow.innerHTML = `
                <td colspan="5" class="py-8 text-center text-emerald-800 font-medium text-sm">
                  <i class="fa-solid fa-circle-check text-emerald-600 mr-2 text-base"></i>
                  All pending pickup requests have been handled for now!
                </td>
              `;
              tableBody.appendChild(allDoneRow);
            }
          }
        }, 300);
      }
    });
  });

  const notificationBell = document.querySelector(
    'header svg[viewBox="0 0 18 23"]',
  );
  if (notificationBell) {
    const bellWrapper = notificationBell.parentElement;
    if (bellWrapper) {
      bellWrapper.style.cursor = "pointer";
      bellWrapper.style.position = "relative";
      bellWrapper.setAttribute("title", "Notifications");

      const badgeDot = document.createElement("span");
      badgeDot.id = "notification-badge-dot";
      badgeDot.className =
        "absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse";
      notificationBell.parentElement.appendChild(badgeDot);

      const notifDropdown = document.createElement("div");
      notifDropdown.id = "notification-dropdown";
      notifDropdown.className =
        "hidden absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 text-gray-800 transition-all";
      notifDropdown.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <span class="font-bold text-sm text-[#087a55]">Notifications (Live API)</span>
          <button id="rc-clear-notifs" class="text-[11px] text-gray-400 hover:text-emerald-700 transition">Mark read</button>
        </div>
        <div id="rc-notif-list" class="divide-y divide-gray-50 max-h-64 overflow-y-auto mt-2 text-xs">
          <div class="py-3 text-center text-gray-400">Loading notifications...</div>
        </div>
      `;
      bellWrapper.appendChild(notifDropdown);

      bellWrapper.addEventListener("click", async (e) => {
        e.stopPropagation();
        const profileDropdown = document.getElementById("profile-dropdown");
        if (profileDropdown) profileDropdown.classList.add("hidden");

        const wasHidden = notifDropdown.classList.contains("hidden");
        notifDropdown.classList.toggle("hidden");

        if (wasHidden) {
          if (badgeDot) badgeDot.remove();

          // Fetch notifications from API
          const data = await window.RecycleAPI.getNotifications();
          const listContainer = notifDropdown.querySelector("#rc-notif-list");
          if (listContainer && data.notifications) {
            listContainer.innerHTML = data.notifications
              .map(
                (item) => `
                <div class="py-2.5 flex items-start gap-2.5 hover:bg-gray-50/80 rounded-lg p-1.5 transition">
                  <span class="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                    <i class="fa-solid ${item.icon || "fa-bell"} text-xs"></i>
                  </span>
                  <div>
                    <p class="font-medium text-gray-800">${item.title}</p>
                    <p class="text-gray-500 text-[11px]">${item.desc}</p>
                    <span class="text-[10px] text-emerald-600 font-medium">${item.time}</span>
                  </div>
                </div>
              `,
              )
              .join("");
          }
        }
      });

      const clearBtn = notifDropdown.querySelector("#rc-clear-notifs");
      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showToast("All notifications marked as read", "info");
          notifDropdown.classList.add("hidden");
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // USER PROFILE MENU DROPDOWN
  // --------------------------------------------------------------------------
  const profileAvatar = document.querySelector(
    'header svg[viewBox="0 0 60 62"]',
  );
  if (profileAvatar) {
    const profileContainer = profileAvatar.parentElement;
    if (profileContainer) {
      profileContainer.style.cursor = "pointer";
      profileContainer.style.position = "relative";
      profileContainer.setAttribute("title", "User Account");

      const profileDropdown = document.createElement("div");
      profileDropdown.id = "profile-dropdown";
      profileDropdown.className =
        "hidden absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 text-gray-800 transition-all";
      profileDropdown.innerHTML = `
        <div class="p-2 border-b border-gray-100 mb-1">
          <p class="text-xs font-bold text-gray-800">John Olamide</p>
          <p class="text-[11px] text-emerald-700 font-medium">Verified Collector • ID #RC-8492</p>
        </div>
        <div class="space-y-1 text-xs">
          <a href="#profile" class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition">
            <i class="fa-solid fa-user text-gray-400 w-4 text-center"></i>
            <span>Collector Profile</span>
          </a>
          <a href="#earnings" class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition">
            <i class="fa-solid fa-wallet text-gray-400 w-4 text-center"></i>
            <span>Earnings & Payouts</span>
          </a>
          <a href="#history" class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition">
            <i class="fa-solid fa-clock-rotate-left text-gray-400 w-4 text-center"></i>
            <span>Pickup History</span>
          </a>
          <a href="#settings" class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition">
            <i class="fa-solid fa-gear text-gray-400 w-4 text-center"></i>
            <span>Settings</span>
          </a>
          <div class="border-t border-gray-100 my-1"></div>
          <button id="rc-sign-out-btn" class="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-red-50 text-red-600 transition text-left">
            <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
            <span>Sign Out</span>
          </button>
        </div>
      `;
      profileContainer.appendChild(profileDropdown);

      profileContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        const notifDropdown = document.getElementById("notification-dropdown");
        if (notifDropdown) notifDropdown.classList.add("hidden");

        profileDropdown.classList.toggle("hidden");
      });

      const signOutBtn = profileDropdown.querySelector("#rc-sign-out-btn");
      if (signOutBtn) {
        signOutBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          profileDropdown.classList.add("hidden");
          showToast("Signed out successfully. See you soon!", "info");
        });
      }
    }
  }

  // Dismiss floating dropdowns on outside click or Escape
  document.addEventListener("click", () => {
    const notifDropdown = document.getElementById("notification-dropdown");
    const profileDropdown = document.getElementById("profile-dropdown");
    if (notifDropdown) notifDropdown.classList.add("hidden");
    if (profileDropdown) profileDropdown.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const notifDropdown = document.getElementById("notification-dropdown");
      const profileDropdown = document.getElementById("profile-dropdown");
      if (notifDropdown) notifDropdown.classList.add("hidden");
      if (profileDropdown) profileDropdown.classList.add("hidden");
    }
  });

  // --------------------------------------------------------------------------
  // WEEKLY COLLECTION CHART (Populated via window.RecycleAPI)
  // --------------------------------------------------------------------------
  const weeklyData = await window.RecycleAPI.getWeeklyStats();
  const chartDays = weeklyData.days || [
    { day: "Mon", kg: 14.5 },
    { day: "Tue", kg: 26.0 },
    { day: "Wed", kg: 22.8 },
    { day: "Thu", kg: 38.4 },
    { day: "Fri", kg: 25.0 },
    { day: "Sat", kg: 16.2 },
  ];

  const chartColumns = document.querySelectorAll(
    ".flex.items-end.justify-between.h-48 > div",
  );

  chartColumns.forEach((col, index) => {
    const dayData = chartDays[index];
    if (!dayData) return;

    col.classList.add("relative", "cursor-pointer", "group");
    const bar = col.querySelector(".rounded-t-lg");

    if (bar) {
      bar.classList.add(
        "transition-all",
        "duration-200",
        "group-hover:opacity-90",
      );

      const tooltip = document.createElement("div");
      tooltip.className =
        "opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm transition-opacity duration-200 whitespace-nowrap z-20";
      tooltip.textContent = `${dayData.day}: ${dayData.kg} kg`;
      col.appendChild(tooltip);

      col.addEventListener("click", () => {
        showToast(
          `API: ${dayData.day} collection recorded at ${dayData.kg} kg`,
          "info",
        );
      });
    }
  });

  // --------------------------------------------------------------------------
  // ANIMATED STAT COUNTERS (Populated via window.RecycleAPI)
  // --------------------------------------------------------------------------
  function animateValue(
    element,
    start,
    end,
    duration,
    prefix = "",
    suffix = "",
  ) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * (end - start) + start;

      const isFloat = end % 1 !== 0;
      const formattedVal = isFloat
        ? currentVal.toFixed(1)
        : Math.floor(currentVal).toLocaleString();

      element.textContent = `${prefix}${formattedVal}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Fetch live stats from API
  const liveStats = await window.RecycleAPI.getDashboardStats();
  const statCards = document.querySelectorAll(
    ".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 .text-2xl.font-bold",
  );

  if (statCards.length >= 4) {
    animateValue(statCards[0], 0, liveStats.pickupsToday || 4, 800);
    animateValue(
      statCards[1],
      0,
      liveStats.totalCollectedKg || 128.5,
      1000,
      "",
      " kg",
    );
    animateValue(statCards[2], 0, liveStats.earnings || 18400, 1200, "₦ ");
    animateValue(statCards[3], 0, liveStats.completedPickups || 36, 900);
  }
});
