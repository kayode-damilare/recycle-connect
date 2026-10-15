(function (global) {
  const metaEndpoint = document.querySelector('meta[name="api-endpoint"]');
  const API_BASE_URL =
    global.API_BASE_URL ||
    (metaEndpoint
      ? metaEndpoint.getAttribute("content")
      : "https://api.recycleconnect.ng/v1");

  const ENDPOINTS = {
    SCHEDULE_PICKUP: "/pickups/schedule",
    AVAILABLE_SLOTS: "/pickups/slots",
    CANCEL_PICKUP: "/pickups/cancel",
    USER_HISTORY: "/pickups/history",
  };

  /**
   * Helper function for standard HTTP requests with timeout
   */
  async function apiFetch(endpoint, options = {}, timeoutMs = 6000) {
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
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  }

  /**
   * RecycleConnect API Client
   */
  const RecycleAPI = {
    baseUrl: API_BASE_URL,
    endpoints: ENDPOINTS,

    /**
     * Submit a scheduled pickup
     * @param {Object} pickupData - { date, time, address, notes }
     * @returns {Promise<Object>}
     */
    async schedulePickup(pickupData) {
      const payload = {
        pickupDate: pickupData.date,
        timeSlot: pickupData.time,
        address: pickupData.address || "12 Greenview Estate, Lagos",
        termsAccepted: true,
        createdAt: new Date().toISOString(),
      };

      console.log("[RecycleAPI] Sending pickup schedule to API:", payload);

      try {
        const result = await apiFetch(ENDPOINTS.SCHEDULE_PICKUP, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        console.log("[RecycleAPI] Server responded with:", result);
        return result;
      } catch (err) {
        console.warn(
          `[RecycleAPI] Network request to ${API_BASE_URL} failed or is currently offline (${err.message}). Activating fallback mock response.`,
        );

        // Fallback simulated response so frontend testing works seamlessly without requiring an active backend
        const mockResponse = {
          success: true,
          status: "confirmed",
          bookingId: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
          message: "Pickup scheduled successfully!",
          data: payload,
          timestamp: new Date().toISOString(),
          isSimulated: true,
        };

        return mockResponse;
      }
    },

    /**
     * Get available pickup slots for a specific date
     * @param {string} dateString
     * @returns {Promise<Array<string>>}
     */
    async getAvailableSlots(dateString) {
      try {
        const query = encodeURIComponent(dateString);
        const result = await apiFetch(
          `${ENDPOINTS.AVAILABLE_SLOTS}?date=${query}`,
          {
            method: "GET",
          },
        );
        return result.slots || [];
      } catch (err) {
        console.warn(
          "[RecycleAPI] Using standard default slots (backend offline).",
        );
        return [
          "8:00 AM - 10:00 AM",
          "10:00 AM - 12:00 PM",
          "12:00 PM - 2:00 PM",
          "2:00 PM - 4:00 PM",
          "4:00 PM - 6:00 PM",
        ];
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

  // Expose to global window object
  global.RecycleAPI = RecycleAPI;
})(typeof window !== "undefined" ? window : this);

// ====================================================
// MODULE 2: Dashboard Page Controller & Live Map Logic
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[first.js] Initializing RecycleConnect dashboard logic...");

  // ----------------------------------------------------
  // 1. Mobile Navigation Drawer Toggle
  // ----------------------------------------------------
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const menuToggleIcon = document.getElementById("menu-toggle-icon");
  const sidebarNavContainer = document.getElementById("sidebar-nav-container");
  const sidebar = document.getElementById("sidebar");

  if (menuToggleBtn && sidebarNavContainer) {
    menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = sidebarNavContainer.classList.contains("hidden");

      if (isHidden) {
        sidebarNavContainer.classList.remove("hidden");
        if (menuToggleIcon) {
          menuToggleIcon.classList.remove("fa-bars");
          menuToggleIcon.classList.add("fa-times");
        }
        menuToggleBtn.classList.add("bg-[#087a55]", "text-white");
      } else {
        sidebarNavContainer.classList.add("hidden");
        if (menuToggleIcon) {
          menuToggleIcon.classList.remove("fa-times");
          menuToggleIcon.classList.add("fa-bars");
        }
        menuToggleBtn.classList.remove("bg-[#087a55]", "text-white");
      }
    });

    // Close mobile nav when clicking anywhere outside the sidebar
    document.addEventListener("click", (e) => {
      if (window.innerWidth < 768 && sidebar && !sidebar.contains(e.target)) {
        if (!sidebarNavContainer.classList.contains("hidden")) {
          sidebarNavContainer.classList.add("hidden");
          if (menuToggleIcon) {
            menuToggleIcon.classList.remove("fa-times");
            menuToggleIcon.classList.add("fa-bars");
          }
          menuToggleBtn.classList.remove("bg-[#087a55]", "text-white");
        }
      }
    });

    // Reset drawer state on screen resize to tablet/desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        sidebarNavContainer.classList.remove("hidden");
        if (menuToggleIcon) {
          menuToggleIcon.classList.remove("fa-times");
          menuToggleIcon.classList.add("fa-bars");
        }
        menuToggleBtn.classList.remove("bg-[#087a55]", "text-white");
      } else {
        sidebarNavContainer.classList.add("hidden");
      }
    });
  }

  // ----------------------------------------------------
  // 2. Navigation with data-href Links
  // ----------------------------------------------------
  const navItems = document.querySelectorAll("[data-href]");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const destination = item.getAttribute("data-href");
      if (
        destination &&
        destination.trim() !== "" &&
        destination.trim() !== ".html"
      ) {
        // Apply active visual state
        item.classList.add("bg-[#087a55]", "text-white");
        setTimeout(() => {
          window.location.href = destination;
        }, 150);
      }
    });
  });

  // ----------------------------------------------------
  // 3. Click Interactions: Green Background for All Interactive Inputs/Icons
  // ----------------------------------------------------
  const interactiveIcons = [
    document.getElementById("notification-btn"),
    document.getElementById("user-avatar-btn"),
    document.getElementById("user-dropdown-btn"),
    document.getElementById("step-1-icon"),
    document.getElementById("step-2-badge"),
    document.getElementById("step-3-badge"),
    document.getElementById("step-4-badge"),
    document.getElementById("map-pin"),
    document.getElementById("verified"),
  ];

  interactiveIcons.forEach((el) => {
    if (!el) return;
    el.addEventListener("click", (e) => {
      // Toggle or briefly highlight green on click
      el.classList.add(
        "bg-[#087a55]",
        "text-white",
        "transition-colors",
        "duration-200",
      );

      // For icons containing SVG paths, make SVG stroke/fill white when active
      const svgPaths = el.querySelectorAll("path");
      svgPaths.forEach((p) => {
        if (p.getAttribute("stroke") === "#087A55") {
          p.setAttribute("stroke", "#ffffff");
        }
      });

      // Brief pulse feedback if not a permanent button
      setTimeout(() => {
        if (el.id !== "verified") {
          el.classList.remove("text-white");
          svgPaths.forEach((p) => {
            if (p.getAttribute("stroke") === "#ffffff") {
              p.setAttribute("stroke", "#087A55");
            }
          });
        }
      }, 500);
    });
  });

  // Also apply green background to any generic input on focus/click
  const allInputs = document.querySelectorAll("input, select, textarea");
  allInputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.classList.add("ring-2", "ring-[#087a55]", "border-[#087a55]");
    });
    input.addEventListener("blur", () => {
      input.classList.remove("ring-2", "ring-[#087a55]", "border-[#087a55]");
    });
  });

  // ----------------------------------------------------
  // 4. Weekend Day Selector (Sat & Sun Exclusivity)
  // ----------------------------------------------------
  const daySatBtn = document.getElementById("day-sat");
  const daySunBtn = document.getElementById("day-sun");
  const dayIndicator = document.getElementById("selected-day-indicator");
  const etaTimeEl = document.getElementById("eta-time");

  let selectedWeekendDay = null;

  function updateDaySelection(day) {
    if (selectedWeekendDay === day) {
      // Deselect if already active
      selectedWeekendDay = null;
      daySatBtn.className =
        "day-btn weekend-btn px-3.5 py-1.5 rounded-lg border border-[#087a55] text-xs sm:text-sm font-semibold text-[#087a55] bg-white hover:bg-[#e8f6ee] cursor-pointer transition-all duration-200 shadow-sm";
      daySunBtn.className =
        "day-btn weekend-btn px-3.5 py-1.5 rounded-lg border border-[#087a55] text-xs sm:text-sm font-semibold text-[#087a55] bg-white hover:bg-[#e8f6ee] cursor-pointer transition-all duration-200 shadow-sm";
      if (dayIndicator) {
        dayIndicator.textContent = "";
        dayIndicator.classList.add("hidden");
      }
      return;
    }

    selectedWeekendDay = day;

    if (day === "Saturday") {
      // Select Saturday, deselect Sunday
      daySatBtn.className =
        "day-btn weekend-btn px-3.5 py-1.5 rounded-lg border border-[#087a55] text-xs sm:text-sm font-semibold text-white bg-[#087a55] hover:bg-[#07543e] cursor-pointer transition-all duration-200 shadow-md";
      daySunBtn.className =
        "day-btn weekend-btn px-3.5 py-1.5 rounded-lg border border-[#087a55] text-xs sm:text-sm font-semibold text-[#087a55] bg-white hover:bg-[#e8f6ee] cursor-pointer transition-all duration-200 shadow-sm";
    } else if (day === "Sunday") {
      // Select Sunday, deselect Saturday
      daySunBtn.className =
        "day-btn weekend-btn px-3.5 py-1.5 rounded-lg border border-[#087a55] text-xs sm:text-sm font-semibold text-white bg-[#087a55] hover:bg-[#07543e] cursor-pointer transition-all duration-200 shadow-md";
      daySatBtn.className =
        "day-btn weekend-btn px-3.5 py-1.5 rounded-lg border border-[#087a55] text-xs sm:text-sm font-semibold text-[#087a55] bg-white hover:bg-[#e8f6ee] cursor-pointer transition-all duration-200 shadow-sm";
    }

    if (dayIndicator) {
      dayIndicator.textContent = `Selected: ${day}`;
      dayIndicator.classList.remove("hidden");
    }

    // Connect with API to get available slots for selected weekend day
    fetchSlotsForDay(day);
  }

  if (daySatBtn) {
    daySatBtn.addEventListener("click", () => updateDaySelection("Saturday"));
  }

  if (daySunBtn) {
    daySunBtn.addEventListener("click", () => updateDaySelection("Sunday"));
  }

  // Provide friendly feedback if user clicks disabled weekday buttons
  const disabledDays = document.querySelectorAll(
    "#pickup-day-selector button[disabled]",
  );
  disabledDays.forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("Pickup is only available on Saturday and Sunday.");
    });
  });

  // ----------------------------------------------------
  // 5. API Integration with api.js (window.RecycleAPI)
  // ----------------------------------------------------
  async function fetchSlotsForDay(day) {
    if (
      typeof window.RecycleAPI !== "undefined" &&
      window.RecycleAPI.getAvailableSlots
    ) {
      console.log(`[first.js] Requesting slots from API for ${day}...`);
      try {
        const slots = await window.RecycleAPI.getAvailableSlots(day);
        console.log(`[first.js] Received slots from API:`, slots);

        if (slots && slots.length > 0) {
          const preferredSlot = slots[0];
          if (etaTimeEl) {
            etaTimeEl.textContent = `${preferredSlot} (${day})`;
          }
          if (dayIndicator) {
            dayIndicator.textContent = `Selected: ${day} • Available: ${preferredSlot}`;
          }
        }
      } catch (err) {
        console.warn("[first.js] API fetch slots error:", err);
      }
    } else {
      console.warn(
        "[first.js] RecycleAPI module not detected on window object.",
      );
    }
  }

  // ----------------------------------------------------
  // 6. Live Tracker Button with API Confirmation
  // ----------------------------------------------------
  const liveTrackerBtn = document.getElementById("live-tracker-btn");
  if (liveTrackerBtn) {
    liveTrackerBtn.addEventListener("click", async (e) => {
      const chosenDay = selectedWeekendDay || "Saturday";
      console.log(`[first.js] Confirming live tracker for ${chosenDay}...`);

      if (
        typeof window.RecycleAPI !== "undefined" &&
        window.RecycleAPI.schedulePickup
      ) {
        try {
          const response = await window.RecycleAPI.schedulePickup({
            date: chosenDay,
            time: etaTimeEl
              ? etaTimeEl.textContent.trim()
              : "10:20 AM - 10:30 AM",
            address: "12 Greenview Estate, Lagos",
          });

          showToast(
            `Pickup Status: ${response.status || "Active"} (${response.bookingId || "RC-Live"})`,
          );
        } catch (error) {
          console.warn("[first.js] schedulePickup error:", error);
        }
      }
    });
  }

  // ----------------------------------------------------
  // 7. Toast Notification Utility
  // ----------------------------------------------------
  function showToast(message) {
    let toast = document.getElementById("recycle-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "recycle-toast";
      toast.className =
        "fixed bottom-6 right-6 z-50 bg-[#07543e] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-2";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa fa-info-circle text-[#FFCD29]"></i> <span>${message}</span>`;
    toast.classList.remove("translate-y-12", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-12", "opacity-0");
    }, 3500);
  }

  // ----------------------------------------------------
  // 8. Zero-HTML-Change Live Interactive GPS Map Injector & Engine
  // ----------------------------------------------------
  async function setupLiveMap() {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) {
      console.warn("[first.js] #map-container not found in DOM.");
      return;
    }

    /**
     * Programmatically load Leaflet CSS and JS dependencies
     */
    function loadLeaflet() {
      return new Promise((resolve, reject) => {
        if (typeof window.L !== "undefined") {
          return resolve(window.L);
        }

        // 1. Inject Leaflet CSS
        if (!document.getElementById("leaflet-live-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-live-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }

        // 2. Inject custom CSS styles for pulse rings, animations, custom popups
        if (!document.getElementById("leaflet-custom-styles")) {
          const style = document.createElement("style");
          style.id = "leaflet-custom-styles";
          style.textContent = `
            .leaflet-container {
              font-family: 'Inter', sans-serif !important;
              width: 100% !important;
              height: 100% !important;
              border-radius: 0.75rem;
            }
            .collector-pulse-icon {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .pulse-ring {
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background-color: rgba(7, 84, 62, 0.35);
              animation: live-map-pulse 2s infinite ease-out;
              pointer-events: none;
            }
            @keyframes live-map-pulse {
              0% { transform: scale(0.4); opacity: 1; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            .destination-pulse-icon {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .dest-pulse {
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: rgba(234, 179, 8, 0.35);
              animation: dest-pulse-anim 2s infinite ease-out;
              pointer-events: none;
            }
            @keyframes dest-pulse-anim {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
            .custom-map-popup .leaflet-popup-content-wrapper {
              border-radius: 12px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
              border: 1px solid #d8e5de;
              padding: 4px;
              font-family: 'Inter', sans-serif;
            }
            .custom-map-popup .leaflet-popup-tip {
              background: white;
            }
          `;
          document.head.appendChild(style);
        }

        // 3. Inject Leaflet JS
        if (!document.getElementById("leaflet-live-js")) {
          const script = document.createElement("script");
          script.id = "leaflet-live-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.crossOrigin = "";
          script.onload = () => resolve(window.L);
          script.onerror = () => reject(new Error("Leaflet CDN load failed"));
          document.head.appendChild(script);
        } else {
          const timer = setInterval(() => {
            if (typeof window.L !== "undefined") {
              clearInterval(timer);
              resolve(window.L);
            }
          }, 50);
        }
      });
    }

    try {
      console.log("[first.js] Loading live map dependencies dynamically...");
      const L = await loadLeaflet();

      // Hide the initial static SVG map and pin gracefully
      const staticPin = document.getElementById("map-pin");
      const staticSvg = document.getElementById("map-svg");
      if (staticPin) staticPin.style.display = "none";
      if (staticSvg) staticSvg.style.display = "none";

      // Dynamically inject the Live Map Canvas inside #map-container
      let liveCanvas = document.getElementById("live-map-canvas");
      if (!liveCanvas) {
        liveCanvas = document.createElement("div");
        liveCanvas.id = "live-map-canvas";
        liveCanvas.className = "w-full h-[260px] sm:h-[288px] rounded-xl z-0";
        mapContainer.appendChild(liveCanvas);
      }

      // Dynamically inject Floating Live Status Badge (Top-Left)
      let liveBadge = document.getElementById("live-map-badge");
      if (!liveBadge) {
        liveBadge = document.createElement("div");
        liveBadge.id = "live-map-badge";
        liveBadge.className =
          "absolute top-3 left-3 z-[400] flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-md border border-[#087a55]/20 pointer-events-auto";
        liveBadge.innerHTML = `
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span class="text-[11px] sm:text-xs font-semibold text-[#07543e]">Live: Van En Route</span>
        `;
        mapContainer.appendChild(liveBadge);
      }

      // Dynamically inject Map Action Controls (Top-Right)
      let mapControls = document.getElementById("live-map-controls");
      if (!mapControls) {
        mapControls = document.createElement("div");
        mapControls.id = "live-map-controls";
        mapControls.className =
          "absolute top-3 right-3 z-[400] flex flex-col gap-1.5 pointer-events-auto";
        mapControls.innerHTML = `
          <button
            id="center-collector-btn"
            type="button"
            title="Center on Collector"
            class="w-8 h-8 bg-white/95 hover:bg-[#e8f6ee] text-[#07543e] rounded-lg shadow-md border border-[#087a55]/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <i class="fa fa-truck text-xs"></i>
          </button>
          <button
            id="toggle-route-btn"
            type="button"
            title="Fit Route View"
            class="w-8 h-8 bg-white/95 hover:bg-[#e8f6ee] text-[#07543e] rounded-lg shadow-md border border-[#087a55]/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <i class="fa fa-expand text-xs"></i>
          </button>
        `;
        mapContainer.appendChild(mapControls);
      }

      // Dynamically inject Live Telematics Bar (Bottom)
      let telematicsBar = document.getElementById("live-map-telematics");
      if (!telematicsBar) {
        telematicsBar = document.createElement("div");
        telematicsBar.id = "live-map-telematics";
        telematicsBar.className =
          "absolute bottom-2 inset-x-2 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-[#087a55]/20 flex items-center justify-between text-[11px] sm:text-xs text-[#07543e] pointer-events-auto";
        telematicsBar.innerHTML = `
          <div class="flex items-center gap-1.5">
            <i class="fa fa-user-circle text-emerald-600"></i>
            <span class="font-medium">John Olamide</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-600">EcoVan #04</span>
          </div>
          <div class="flex items-center gap-2 font-semibold">
            <span id="live-distance" class="text-emerald-700">1.8 km away</span>
            <span class="text-gray-400">•</span>
            <span id="live-speed" class="text-gray-500">28 km/h</span>
          </div>
        `;
        mapContainer.appendChild(telematicsBar);
      }

      const liveDistanceEl = document.getElementById("live-distance");
      const liveSpeedEl = document.getElementById("live-speed");
      const centerCollectorBtn = document.getElementById(
        "center-collector-btn",
      );
      const toggleRouteBtn = document.getElementById("toggle-route-btn");

      // Coordinates in Lagos, Nigeria (Victoria Island / Ikoyi eco-corridor)
      const DESTINATION_COORDS = [6.4528, 3.429]; // 12 Greenview Estate, Lagos
      const START_COORDS = [6.4385, 3.414]; // Starting depot / van origin

      // Road waypoints connecting collector to destination
      const routeWaypoints = [
        START_COORDS,
        [6.4402, 3.4162],
        [6.4421, 3.4188],
        [6.4445, 3.4215],
        [6.4468, 3.4239],
        [6.4491, 3.4262],
        [6.451, 3.4276],
        DESTINATION_COORDS,
      ];

      // Initialize Leaflet Map
      const map = L.map("live-map-canvas", {
        center: [6.4456, 3.4215],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);

      // Zoom control
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Destination Marker
      const destinationIcon = L.divIcon({
        className: "destination-pulse-icon",
        html: `
          <div class="dest-pulse"></div>
          <div class="w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
            <i class="fa fa-map-marker"></i>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const destinationMarker = L.marker(DESTINATION_COORDS, {
        icon: destinationIcon,
      }).addTo(map);
      destinationMarker.bindPopup(
        `<div class="p-1 text-center font-[inter]">
          <span class="inline-block px-2 py-0.5 mb-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">Destination</span>
          <h4 class="font-bold text-[#07543e] text-xs sm:text-sm">12 Greenview Estate</h4>
          <p class="text-[11px] text-gray-500 mt-0.5">Recycling Pickup Point</p>
        </div>`,
        { className: "custom-map-popup" },
      );

      // Collector Vehicle Marker
      const collectorIcon = L.divIcon({
        className: "collector-pulse-icon",
        html: `
          <div class="pulse-ring"></div>
          <div class="w-9 h-9 bg-[#07543e] rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-xs">
            <i class="fa fa-truck"></i>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
      });

      let currentWaypointIdx = 0;
      const collectorMarker = L.marker(START_COORDS, {
        icon: collectorIcon,
      }).addTo(map);
      collectorMarker.bindPopup(
        `<div class="p-1 font-[inter] min-w-[140px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">En Route</span>
          </div>
          <h4 class="font-bold text-gray-900 text-xs sm:text-sm">John Olamide</h4>
          <p class="text-[11px] text-gray-600">EcoVan #04 • 4.5 ⭐</p>
          <div class="mt-1.5 pt-1 border-t border-gray-100 text-[10px] text-emerald-800 font-medium">
            Waste: Plastic & Paper
          </div>
        </div>`,
        { className: "custom-map-popup" },
      );

      // Route Polyline
      const routeGlow = L.polyline(routeWaypoints, {
        color: "#087a55",
        weight: 6,
        opacity: 0.25,
        lineCap: "round",
      }).addTo(map);

      const routePolyline = L.polyline(routeWaypoints, {
        color: "#07543e",
        weight: 3.5,
        dashArray: "6, 8",
        lineCap: "round",
      }).addTo(map);

      map.fitBounds(routeGlow.getBounds(), { padding: [35, 35] });

      // Live Movement Simulation
      let isArrived = false;

      function calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
      }

      function advanceCollectorMovement() {
        if (isArrived) return;

        currentWaypointIdx++;
        if (currentWaypointIdx >= routeWaypoints.length) {
          currentWaypointIdx = routeWaypoints.length - 1;
          isArrived = true;

          if (liveBadge) {
            liveBadge.innerHTML = `
              <span class="relative flex h-2.5 w-2.5">
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span class="text-[11px] sm:text-xs font-semibold text-emerald-800">Arrived at Location!</span>
            `;
          }

          if (liveDistanceEl) liveDistanceEl.textContent = "Arrived";
          if (liveSpeedEl) liveSpeedEl.textContent = "0 km/h";
          if (etaTimeEl) etaTimeEl.textContent = "Arrived • EcoVan #04 Ready";

          collectorMarker.openPopup();
          showToast("EcoVan #04 has arrived at 12 Greenview Estate!");

          const step3Badge = document.getElementById("step-3-badge");
          if (step3Badge) {
            step3Badge.classList.add("ring-4", "ring-[#087a55]/30");
          }

          setTimeout(() => {
            isArrived = false;
            currentWaypointIdx = 0;
            collectorMarker.setLatLng(START_COORDS);
            if (liveBadge) {
              liveBadge.innerHTML = `
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span class="text-[11px] sm:text-xs font-semibold text-[#07543e]">Live: Van En Route</span>
              `;
            }
          }, 10000);
          return;
        }

        const nextPos = routeWaypoints[currentWaypointIdx];
        collectorMarker.setLatLng(nextPos);

        const distRemaining = calculateDistanceKm(
          nextPos[0],
          nextPos[1],
          DESTINATION_COORDS[0],
          DESTINATION_COORDS[1],
        );

        const randomSpeed = Math.floor(22 + Math.random() * 12);
        if (liveDistanceEl)
          liveDistanceEl.textContent = `${distRemaining} km away`;
        if (liveSpeedEl) liveSpeedEl.textContent = `${randomSpeed} km/h`;

        const minsRemaining = Math.max(
          1,
          Math.round((parseFloat(distRemaining) / randomSpeed) * 60),
        );
        if (etaTimeEl && !isArrived) {
          const now = new Date();
          const arrivalTime1 = new Date(now.getTime() + minsRemaining * 60000);
          const arrivalTime2 = new Date(
            now.getTime() + (minsRemaining + 8) * 60000,
          );
          const fmt = (d) =>
            d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          etaTimeEl.textContent = `${fmt(arrivalTime1)} - ${fmt(arrivalTime2)} (~${minsRemaining} mins)`;
        }
      }

      setInterval(advanceCollectorMovement, 2800);

      if (centerCollectorBtn) {
        centerCollectorBtn.addEventListener("click", () => {
          const pos = collectorMarker.getLatLng();
          map.flyTo(pos, 16, { duration: 1.2 });
          setTimeout(() => collectorMarker.openPopup(), 1200);
        });
      }

      if (toggleRouteBtn) {
        toggleRouteBtn.addEventListener("click", () => {
          map.fitBounds(routeGlow.getBounds(), { padding: [35, 35] });
        });
      }

      // Intercept #live-tracker-link click to prevent 404 navigation and focus on map
      const liveTrackerLink = document.getElementById("live-tracker-link");
      if (liveTrackerLink) {
        liveTrackerLink.addEventListener("click", (e) => {
          e.preventDefault();
        });
      }

      // Connect #live-tracker-btn to zoom & focus on the moving vehicle
      const liveTrackerBtn = document.getElementById("live-tracker-btn");
      if (liveTrackerBtn) {
        liveTrackerBtn.addEventListener("click", (e) => {
          e.preventDefault();
          liveCanvas.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            map.invalidateSize();
            const pos = collectorMarker.getLatLng();
            map.flyTo(pos, 16, { duration: 1.2 });
            setTimeout(() => collectorMarker.openPopup(), 1250);
          }, 300);
        });
      }

      window.addEventListener("resize", () => {
        map.invalidateSize();
      });

      console.log("[first.js] Live map successfully injected and active!");
    } catch (err) {
      console.warn(
        "[first.js] Live map initialization failed, preserving initial HTML view:",
        err,
      );
      // Fallback: Ensure initial static map elements remain visible
      const staticPin = document.getElementById("map-pin");
      const staticSvg = document.getElementById("map-svg");
      if (staticPin) staticPin.style.display = "flex";
      if (staticSvg) staticSvg.style.display = "block";
    }
  }

  // Trigger live map setup
  setupLiveMap();
});
