// ========================================
// 1. API CONFIGURATION
// ========================================

const API_BASE_URL = "https://recycle-connect-m189.onrender.com";

const COLLECTOR_REGISTER_URL =
  `${API_BASE_URL}/api/auth/collector/register`;


// ========================================
// 2. SELECT EXISTING FORM ELEMENTS
// ========================================

const collectorForm = document.getElementById("collector-signup-form");

const fullNameInput = document.getElementById("collector-name");
const phoneInput = document.getElementById("collector-phone");
const emailInput = document.getElementById("collector-mail");

const addressInput = document.getElementById("collector-address");
const routeInput = document.getElementById("collector-route");
const passwordInput = document.getElementById("collector-password");

const identificationDocumentInput = document.getElementById(
  "collector-identification-document"
);

const submitButton = document.getElementById("collector-submit-button");
const messageElement = document.getElementById("collector-signup-message");


// ========================================
// 3. DISPLAY MESSAGES
// ========================================

function showMessage(message, type = "error") {
  messageElement.textContent = message;

  messageElement.classList.remove(
    "hidden",
    "bg-green-100",
    "text-green-800",
    "bg-red-100",
    "text-red-800"
  );

  if (type === "success") {
    messageElement.classList.add("bg-green-100", "text-green-800");
  } else {
    messageElement.classList.add("bg-red-100", "text-red-800");
  }
}


// ========================================
// 4. VALIDATE IDENTIFICATION DOCUMENT
// ========================================

function validateIdentificationDocument(file) {
  if (!file) {
    return "Please upload your identification document.";
  }

  const allowedExtensions = /\.(jpe?g|pdf)$/i;
  const allowedTypes = ["image/jpeg", "application/pdf"];
  const maxSize = 5 * 1024 * 1024;

  if (
    !allowedExtensions.test(file.name) ||
    !allowedTypes.includes(file.type)
  ) {
    return "Your identification document must be a JPEG, JPG, or PDF file.";
  }

  if (file.size === 0) {
    return "The selected identification document is empty.";
  }

  if (file.size > maxSize) {
    return "Your identification document must not exceed 5 MB.";
  }

  return null;
}


// ========================================
// 5. HANDLE FORM SUBMISSION
// ========================================

collectorForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Read the form values.

  const fullName = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  const address = addressInput.value.trim();
  const route = routeInput.value.trim();
  const password = passwordInput.value;

  const identificationDocument =
    identificationDocumentInput.files[0];


  // Validate the required fields.

  if (fullName.length < 2) {
    showMessage("Please enter your full name.");
    fullNameInput.focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Please enter a valid email address.");
    emailInput.focus();
    return;
  }

  if (phone.replace(/\D/g, "").length < 7) {
    showMessage("Please enter a valid phone number.");
    phoneInput.focus();
    return;
  }

  if (address.length < 3) {
    showMessage("Please enter your residential address.");
    addressInput.focus();
    return;
  }

  if (!route) {
    showMessage("Please enter your assigned collection route.");
    routeInput.focus();
    return;
  }

  if (password.length < 8) {
    showMessage("Your password must contain at least 8 characters.");
    passwordInput.focus();
    return;
  }


  // Validate the identification document.

  const documentError =
    validateIdentificationDocument(identificationDocument);

  if (documentError) {
    showMessage(documentError);
    identificationDocumentInput.focus();
    return;
  }


  // Prevent duplicate submissions.

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  let registrationSuccessful = false;


  try {
    // Create multipart form data.

    const formData = new FormData();

    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("address", address);
    formData.append("route", route);

    formData.append(
      "identificationDocument",
      identificationDocument
    );


    // Send the registration request.

    const response = await fetch(COLLECTOR_REGISTER_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json().catch(() => ({}));


    // Handle unsuccessful responses.

    if (!response.ok || result.success === false) {
      let errorMessage =
        result.message ||
        result.error ||
        "Registration failed. Please try again.";

      if (Array.isArray(result.errors) && result.errors.length > 0) {
        const validationMessages = result.errors
          .map((error) => {
            if (typeof error === "string") {
              return error;
            }

            return error.message || error.msg || "";
          })
          .filter(Boolean);

        if (validationMessages.length > 0) {
          errorMessage = validationMessages.join(" ");
        }
      }

      if (response.status === 409) {
        errorMessage =
          "An account with these details may already exist. " +
          "Check your email and phone number.";
      } else if (response.status === 413) {
        errorMessage =
          "The uploaded file is too large. Please select a smaller file.";
      } else if (response.status >= 500) {
        errorMessage =
          "The server encountered a problem. Please try again later.";
      }

      throw new Error(errorMessage);
    }


    // Handle successful registration.

    registrationSuccessful = true;

    showMessage(
      result.message ||
        "Registration submitted successfully. Your account is awaiting verification.",
      "success"
    );

    setTimeout(() => {
      window.location.href = "Collector-Verification.html";
    }, 1500);


  } catch (error) {
    console.error("Collector registration error:", error);

    if (error instanceof TypeError) {
      showMessage(
        "Unable to connect to the server. Check your internet connection and try again. If the problem continues, the server may be unavailable or blocking this request."
      );
    } else {
      showMessage(
        error.message || "Something went wrong. Please try again."
      );
    }

  } finally {
    if (!registrationSuccessful) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
  }
});