
const API_BASE_URL = "https://recycle-connect-m189.onrender.com";
const PICKUPS_URL = `${API_BASE_URL}/api/pickups/`;

document.addEventListener("DOMContentLoaded", () => {
  const pickupList = document.getElementById("pickup-list");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const searchInput = document.getElementById("pickup-search");

  let pickups = [];
  let activeFilter = "all";
  let searchTerm = "";

  if (!pickupList) {
    console.error("Pickup list container was not found.");
    return;
  }

  function getToken() {
    // Use the storage key actually set by your sign-in JavaScript.
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("householdToken") ||
      localStorage.getItem("jwt")
    );
  }

  function getStatus(pickup) {
    const value = String(
      pickup.status ?? pickup.pickupStatus ?? ""
    ).toLowerCase().replace(/[\s-]+/g, "_");

    // Treat backend statuses as groups for the two available filters.
    if (
      ["completed", "picked_up", "collected", "pickedup"].includes(value)
    ) {
      return "completed";
    }

    if (
      [
        "ongoing",
        "pending",
        "scheduled",
        "assigned",
        "accepted",
        "in_progress",
        "in_progress_pickup",
      ].includes(value)
    ) {
      return "ongoing";
    }

    // Unknown statuses remain visible under All, not under either group.
    return value || "unknown";
  }

  function getMaterials(pickup) {
    const value =
      pickup.materials ??
      pickup.materialDetails ??
      pickup.items ??
      pickup.material;

    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === "string") return item;

        return (
          item?.name ??
          item?.materialName ??
          item?.material?.name ??
          item?.material?.materialName ??
          "Material"
        );
      }).join(", ") || "Materials not specified";
    }

    if (typeof value === "string") return value;

    if (value && typeof value === "object") {
      return value.name ?? value.materialName ?? "Materials not specified";
    }

    return "Materials not specified";
  }

  function getDate(pickup) {
    const value =
      pickup.createdAt ??
      pickup.requestedAt ??
      pickup.scheduledDate ??
      pickup.pickupDate ??
      pickup.date;

    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getQuantity(pickup) {
    const quantity =
      pickup.quantity ??
      pickup.totalQuantity ??
      pickup.weight ??
      pickup.totalWeight;

    if (quantity === undefined || quantity === null) return "";

    const unit = pickup.unit ?? pickup.weightUnit ?? "KG";
    return `${quantity} ${unit}`;
  }

  function getAmount(pickup) {
    const amount =
      pickup.amount ??
      pickup.totalAmount ??
      pickup.price ??
      pickup.rewardAmount;

    if (amount === undefined || amount === null) return "";

    const number = Number(amount);

    return Number.isFinite(number)
      ? `₦${number.toLocaleString("en-NG")}`
      : String(amount);
  }

  function showMessage(message, isError = false) {
    pickupList.replaceChildren();
    pickupList.setAttribute("aria-busy", "false");

    const paragraph = document.createElement("p");
    paragraph.className =
      "mt-6 text-center font-[Inter] text-[16px] text-[#898484]";
    paragraph.setAttribute("role", isError ? "alert" : "status");
    paragraph.textContent = message;

    pickupList.appendChild(paragraph);
  }

  function createCard(pickup) {
    const status = getStatus(pickup);
    const isCompleted = status === "completed";

    const card = document.createElement("article");
    card.className =
      "mt-4 flex items-center justify-between gap-3 rounded-lg border border-green-100 bg-white/60 p-4 hover:shadow-md sm:px-6 sm:py-5 lg:px-8 lg:py-6";

    const left = document.createElement("div");
    left.className = "flex min-w-0 items-center gap-3 sm:gap-5";

    const iconWrapper = document.createElement("div");
    iconWrapper.className =
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D1FFE3] sm:h-12 sm:w-12";

    const icon = document.createElement("span");
    icon.className = "text-2xl text-[#087A55]";
    icon.textContent = "♻";
    iconWrapper.appendChild(icon);

    const details = document.createElement("div");
    details.className = "min-w-0";

    const materials = document.createElement("p");
    materials.className =
      "truncate font-[Inter] text-[16px] font-semibold text-[#07543E] sm:text-[20px] lg:text-[24px]";
    materials.textContent = getMaterials(pickup);

    const date = document.createElement("p");
    date.className =
      "font-[Inter] text-[12px] text-[#898484] sm:text-[16px] lg:text-[18px]";
    date.textContent = getDate(pickup);

    details.append(materials, date);
    left.append(iconWrapper, details);

    const right = document.createElement("div");
    right.className = "flex shrink-0 items-center gap-3 sm:gap-5";

    const summary = document.createElement("div");
    summary.className = "flex flex-col items-end gap-2 sm:gap-4";

    const badge = document.createElement("span");
    badge.className = isCompleted
      ? "rounded-lg bg-[#D1FFE3] px-3 py-1.5 text-center font-[Inter] text-[12px] font-semibold text-[#2E9B63] sm:px-5 sm:py-3 sm:text-[16px]"
      : "rounded-lg bg-[#D1E4FF] px-3 py-1.5 text-center font-[Inter] text-[12px] font-semibold capitalize text-[#0482EF] sm:px-5 sm:py-3 sm:text-[16px]";
    badge.textContent = status.replace(/_/g, " ");

    const amountRow = document.createElement("div");
    amountRow.className =
      "flex flex-wrap justify-end gap-3 text-[13px] font-semibold text-[#087A55] sm:gap-5 sm:text-[18px]";

    const quantity = getQuantity(pickup);
    const amount = getAmount(pickup);

    if (quantity) {
      const quantityElement = document.createElement("span");
      quantityElement.textContent = quantity;
      amountRow.appendChild(quantityElement);
    }

    if (amount) {
      const amountElement = document.createElement("span");
      amountElement.textContent = amount;
      amountRow.appendChild(amountElement);
    }

    summary.append(badge, amountRow);
    right.appendChild(summary);
    card.append(left, right);

    return card;
  }

  function applyFilters() {
    const filtered = pickups.filter((pickup) => {
      const status = getStatus(pickup);

      const matchesStatus =
        activeFilter === "all" || status === activeFilter;

      const searchText = [
        getMaterials(pickup),
        status,
        getDate(pickup),
        getQuantity(pickup),
        getAmount(pickup),
      ].join(" ").toLowerCase();

      const matchesSearch = searchText.includes(searchTerm);

      return matchesStatus && matchesSearch;
    });

    pickupList.replaceChildren();
    pickupList.setAttribute("aria-busy", "false");

    if (filtered.length === 0) {
      showMessage(
        pickups.length === 0
          ? "You don't have any pickup history yet."
          : "No pickups match your search or selected filter."
      );
      return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach((pickup) => {
      fragment.appendChild(createCard(pickup));
    });

    pickupList.appendChild(fragment);
  }

  // Filter buttons: only these three buttons are handled.
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const selected = item === button;

        item.setAttribute("aria-pressed", String(selected));
        item.classList.toggle("bg-[#077053]", selected);
        item.classList.toggle("text-white", selected);
        item.classList.toggle("border", !selected);
        item.classList.toggle("border-green-100", !selected);
        item.classList.toggle("bg-white/60", !selected);
        item.classList.toggle("text-[#077053]", !selected);
      });

      applyFilters();
    });
  });

  // Search works together with whichever status filter is selected.
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  async function loadPickupHistory() {
    const token = getToken();

    if (!token) {
      showMessage("Please sign in to view your pickup history.", true);
      console.error(
        "No token found. Check which localStorage key your sign-in code uses."
      );
      return;
    }

    pickupList.setAttribute("aria-busy", "true");
    showMessage("Loading pickup history...");

    try {
      const response = await fetch(PICKUPS_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session may have expired. Please sign in again.");
        }

        if (response.status === 403) {
          throw new Error("You don't have permission to view this history.");
        }

        throw new Error(
          result.message ||
          result.error ||
          `Unable to load pickup history (HTTP ${response.status}).`
        );
      }

      const data = result.data ?? result;
      const records = Array.isArray(data)
        ? data
        : data.pickups ?? data.requests ?? data.history ?? data.items;

      if (!Array.isArray(records)) {
        console.error("Unexpected API response:", result);
        throw new Error(
          "The API response format is different from what this page expects. Check the browser console."
        );
      }

      pickups = records;
      applyFilters();
    } catch (error) {
      console.error("Pickup history error:", error);

      showMessage(
        error instanceof TypeError
          ? "Could not connect to the server. Check your connection or the API's CORS settings."
          : error.message || "Could not load pickup history.",
        true
      );
    }
  }

  loadPickupHistory();
});
