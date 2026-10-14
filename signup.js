// 1. Select the form and its elements
const signupForm = document.getElementById("signup-form");
const fullNameInput = document.getElementById("name");
const emailInput = document.getElementById("e-mail");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-pass");
const message = document.getElementById("signup-message");
const signupButton = document.getElementById("signup-button");

// 2. Deployed backend endpoint
const API_URL =
  "https://recycle-connect-m189.onrender.com/api/auth/household/register";

// 3. Check that required HTML elements exist
if (
  signupForm &&
  fullNameInput &&
  emailInput &&
  phoneInput &&
  passwordInput &&
  confirmPasswordInput &&
  message &&
  signupButton
) {
  // 4. Handle form submission
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    message.textContent = "";
    message.className = "text-sm";

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Check that passwords match
    if (password !== confirmPassword) {
      message.textContent = "Your passwords do not match.";
      message.classList.add("text-red-600");
      return;
    }

    // Prepare registration data
    const userData = new FormData();
    userData.append("fullName", fullName);
    userData.append("email", email);
    userData.append("phone", phone);
    userData.append("password", password);

    try {
      signupButton.disabled = true;
      signupButton.textContent = "Creating Account...";

      // Send registration request
      const response = await fetch(API_URL, {
        method: "POST",
        body: userData
      });

      // Read the server response
      const result = await response.json().catch(() => ({}));

      // Handle errors returned by the backend
      if (!response.ok) {
        let errorMessage =
          result.message ||
          result.error ||
          "Registration failed. Please try again.";

        if (Array.isArray(result.errors) && result.errors.length > 0) {
          errorMessage = result.errors
            .map(error => error.message || error.msg || String(error))
            .join(", ");
        }

        throw new Error(errorMessage);
      }

      // Show success message
      message.textContent =
        result.message ||
        "Account created successfully. Redirecting to sign in...";

      message.classList.add("text-green-700");

      // Clear the form
      signupForm.reset();

      // Redirect after successful registration
      setTimeout(function () {
        window.location.href = "Sign-in.html";
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof TypeError) {
        message.textContent =
          "Could not connect to the server. Check your internet connection and try again.";
      } else {
        message.textContent = error.message;
      }

      message.classList.add("text-red-600");

    } finally {
      signupButton.disabled = false;
      signupButton.textContent = "Create Account";
    }
  });

} else {
  console.error(
    "Sign-up setup failed: One or more required HTML elements are missing. Check the element IDs."
  );
}

// 5. Show and hide password fields
const toggleButtons = document.querySelectorAll(".toggle-password");

toggleButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.dataset.target;
    const passwordField = document.getElementById(targetId);
    const eyeIcon = button.querySelector("i");

    if (!passwordField || !eyeIcon) {
      console.error("Password toggle setup failed. Check data-target and the icon.");
      return;
    }

    if (passwordField.type === "password") {
      passwordField.type = "text";
      eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
      button.setAttribute("aria-label", "Hide password");
    } else {
      passwordField.type = "password";
      eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
      button.setAttribute("aria-label", "Show password");
    }
  });
});