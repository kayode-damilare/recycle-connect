// ===== CONFIG =====
const API_BASE = "https://recycle-connect-m189.onrender.com/api";
const TOKEN_KEYS = ["token", "accessToken", "authToken"]; // the first one found is used
const LOGIN_PAGE = "login.html";
const REDIRECT_TO_LOGIN = false; // set to true once login.html exists
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg"];
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/hesd0s4y/image/upload/v1790869726/avatar_hnfqe5.png";
const STAR_URL =
  "https://res.cloudinary.com/hesd0s4y/image/upload/v1791256911/Star_1_ruqb1e.png";

// ===== HELPERS =====
const $ = (id) => document.getElementById(id);

function getToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

function clearToken() {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
}

function showToast(message, isError = false) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.toggle("bg-red-600", isError);
  toast.classList.toggle("bg-[#07543E]", !isError);
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3500);
}

function handleLoggedOut() {
  clearToken();
  if (REDIRECT_TO_LOGIN) {
    window.location.href = LOGIN_PAGE;
  }
}

// Turn whatever error format the server sends into one readable sentence
function formatErrors(errors) {
  if (!errors) return "";
  const list = Array.isArray(errors)
    ? errors
    : typeof errors === "object"
      ? Object.values(errors).flat()
      : [errors];
  return list
    .map((e) => (typeof e === "string" ? e : e?.message || ""))
    .filter(Boolean)
    .join(". ");
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    handleLoggedOut();
    const err = new Error("Please log in first");
    err.code = "NO_TOKEN";
    throw err;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type for FormData; the browser adds it automatically
      },
    });
  } catch (networkError) {
    throw new Error(
      "Cannot reach the server. It may be waking up, so wait a moment and try again."
    );
  }

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    handleLoggedOut();
    const err = new Error("Session expired. Please log in again.");
    err.code = "UNAUTHORIZED";
    throw err;
  }
  if (!res.ok) {
    const details = formatErrors(body.errors);
    const err = new Error(
      [body.message || "Something went wrong", details].filter(Boolean).join(": ")
    );
    err.errors = body.errors;
    throw err;
  }
  return body;
}

// ===== STATE =====
let currentProfile = null;

// ===== RENDER =====
// The API response may be wrapped in different ways; this finds the profile object
function unwrapProfile(body) {
  return (
    body?.data?.profile ||
    body?.data?.collector ||
    body?.data ||
    body?.profile ||
    body?.collector ||
    body
  );
}

function renderProfile(p) {
  const user = p.user && typeof p.user === "object" ? p.user : {};
  const pick = (...values) =>
    values.find((v) => v !== undefined && v !== null && v !== "");

  const name =
    pick(
      p.name,
      p.fullName,
      [p.firstName, p.lastName].filter(Boolean).join(" "),
      user.name,
      user.fullName,
      [user.firstName, user.lastName].filter(Boolean).join(" ")
    ) || "Collector";

  const photo = p.profilePhoto?.url || p.profilePhoto || user.profilePhoto;
  const route = p.route || {};
  const area = [route.state, route.lga, route.area].filter(Boolean).join(", ");
  const phone = pick(p.phone, user.phone);

  // Name, ID and photos
  $("profile-name").textContent = name;
  $("header-name").textContent = name.split(" ")[0];
  $("profile-code").textContent = pick(p.collectorId, p.collectorCode, p.code) || "";

  const avatarSrc = typeof photo === "string" && photo ? photo : DEFAULT_AVATAR;
  $("profile-avatar").src = avatarSrc;
  $("header-avatar").src = avatarSrc;

  // Verified badge only appears when the API says so
  const status = String(pick(p.verificationStatus, p.status) || "").toLowerCase();
  const verified =
    p.isVerified === true ||
    p.verified === true ||
    status === "verified" ||
    status === "approved";
  $("verified-badge").classList.toggle("hidden", !verified);
  $("verified-badge").classList.toggle("flex", verified);

  // Rating and stars
  const rating = Number(pick(p.rating, p.averageRating)) || 0;
  const reviewsRaw = pick(p.reviewCount, p.totalReviews, p.reviews);
  const reviews = Array.isArray(reviewsRaw) ? reviewsRaw.length : reviewsRaw ?? 0;

  const starsBox = $("profile-stars");
  starsBox.replaceChildren();
  for (let i = 0; i < Math.round(rating); i++) {
    const star = document.createElement("img");
    star.src = STAR_URL;
    star.alt = "star";
    star.className = "h-5 w-5";
    starsBox.appendChild(star);
  }
  $("profile-rating").textContent = rating
    ? `${rating} (${reviews} Reviews)`
    : "No reviews yet";

  // Stats
  const completed = pick(
    p.completedCollections,
    p.completedPickups,
    p.stats?.completedCollections
  );
  const onTime = pick(p.onTimeRate, p.stats?.onTimeRate);
  $("stat-completed").textContent = completed ?? 0;
  $("stat-ontime").textContent = onTime !== undefined ? `${onTime}%` : "0%";

  // Text sections (empty states are shown only when the user hasn't added anything)
  $("profile-about").textContent = pick(p.about, p.bio) || "No bio added yet.";
  $("profile-service-area").textContent = area || "Service area not set yet.";
  $("profile-phone").textContent = phone || "No phone number added yet.";

  // Availability: shown only if the API sends it, e.g. [{ day, startTime, endTime }]
  const slots = Array.isArray(p.availability) ? p.availability : [];
  const section = $("availability-section");
  const list = $("availability-list");
  list.replaceChildren();
  section.classList.toggle("hidden", slots.length === 0);

  slots.forEach((slot) => {
    const col = document.createElement("div");
    col.className = "flex flex-col gap-1";

    const day = document.createElement("p");
    day.className =
      "font-[Inter] text-[16px] font-bold text-[#07543E] sm:text-[20px] lg:text-[24px]";
    day.textContent = slot.day || "";

    const start = document.createElement("p");
    start.className =
      "font-[Inter] text-[11px] text-[#043C2D] sm:text-[14px] lg:text-[16px]";
    start.textContent = slot.startTime || slot.start || slot.from || "";

    const end = document.createElement("p");
    end.className = start.className;
    end.textContent = slot.endTime || slot.end || slot.to || "";

    col.append(day, start, end);
    list.appendChild(col);
  });
}

// If an image link is broken, fall back to the default avatar
["profile-avatar", "header-avatar", "photo-preview"].forEach((id) => {
  $(id).addEventListener("error", () => {
    if ($(id).src !== DEFAULT_AVATAR) $(id).src = DEFAULT_AVATAR;
  });
});

// ===== GET PROFILE =====
async function loadProfile() {
  $("profile-name").textContent = "Loading...";
  try {
    const body = await apiRequest("/collectors/profile");
    console.log("GET /collectors/profile response:", body); // helps match field names
    currentProfile = unwrapProfile(body);
    renderProfile(currentProfile);
  } catch (err) {
    $("profile-name").textContent =
      err.code === "NO_TOKEN" || err.code === "UNAUTHORIZED"
        ? "Please log in"
        : "Could not load profile";
    showToast(err.message, true);
  }
}

// ===== EDIT MODAL =====
const modal = $("edit-modal");

function openModal() {
  if (!currentProfile) {
    showToast("Your profile hasn't loaded yet.", true);
    return;
  }
  const p = currentProfile;
  const user = p.user && typeof p.user === "object" ? p.user : {};
  const route = p.route || {};

  $("f-phone").value = p.phone || user.phone || "";
  $("f-address").value = p.address || "";
  $("f-state").value = route.state || "";
  $("f-lga").value = route.lga || "";
  $("f-area").value = route.area || "";
  $("profilePhoto").value = "";
  $("photo-preview").src = $("profile-avatar").src;
  $("form-error").classList.add("hidden");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

$("edit-profile-btn").addEventListener("click", openModal);
$("cancel-edit").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal(); // clicking the dark backdrop closes it
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ===== PHOTO VALIDATION + PREVIEW =====
$("profilePhoto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const errorEl = $("form-error");
  errorEl.classList.add("hidden");
  if (!file) return;

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorEl.textContent = "Photo must be a JPEG or JPG image.";
    errorEl.classList.remove("hidden");
    e.target.value = "";
    return;
  }
  if (file.size > MAX_PHOTO_SIZE) {
    errorEl.textContent = "Photo must be 5 MB or smaller.";
    errorEl.classList.remove("hidden");
    e.target.value = "";
    return;
  }
  $("photo-preview").src = URL.createObjectURL(file);
});

// ===== PATCH PROFILE =====
$("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = $("form-error");
  const saveBtn = $("save-btn");
  errorEl.classList.add("hidden");

  // Build the multipart body; only fields the user filled in are sent
  const formData = new FormData();
  const fields = {
    phone: $("f-phone").value.trim(),
    address: $("f-address").value.trim(),
    "route.state": $("f-state").value.trim(),
    "route.lga": $("f-lga").value.trim(),
    "route.area": $("f-area").value.trim(),
  };
  Object.entries(fields).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });

  const photo = $("profilePhoto").files[0];
  if (photo) formData.append("profilePhoto", photo);

  if ([...formData.keys()].length === 0) {
    errorEl.textContent = "Fill in at least one field before saving.";
    errorEl.classList.remove("hidden");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    await apiRequest("/collectors/profile", {
      method: "PATCH",
      body: formData,
    });
    closeModal();
    showToast("Profile updated successfully");
    await loadProfile(); // reload from the server so the page matches the database
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save changes";
  }
});

// ===== SIDEBAR NAVIGATION =====
// <li> can't have an href, so this makes the sidebar items clickable
document.querySelectorAll("aside li[href]").forEach((li) => {
  li.addEventListener("click", () => {
    window.location.href = li.getAttribute("href");
  });
});

// ===== INIT =====
loadProfile();