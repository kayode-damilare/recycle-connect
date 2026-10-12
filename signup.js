// 1. Select the form and its elements
const signupForm = document.getElementById("signup-form");
const fullNameInput = document.getElementById("name");
const emailInput = document.getElementById("e-mail");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-pass");
const message = document.getElementById("signup-message");
const signupButton = document.getElementById("signup-button");

// 2. Backend API endpoint
const API_URL = "http://localhost:5000/api/auth/household/register";

// 3. Listen for form submission
signupForm.addEventListener("submit", async function (event) {
  // Stop the browser from refreshing the page
  event.preventDefault();

  // Clear the previous message
  message.textContent = "";
  message.className = "";

  // 4. Get the values entered by the user
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // 5. Check whether the passwords match
  if (password !== confirmPassword) {
    message.textContent = "Your passwords do not match.";
    message.className = "text-red-600";
    return;
  }

  // 6. Prepare the data for the backend
  const userData = {
    fullName: fullName,
    email: email,
    phone: phone,
    password: password
  };

  try {
    // Prevent repeated submissions while the request is processing
    signupButton.disabled = true;
    signupButton.textContent = "Creating Account...";

    // 7. Send the registration request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    // 8. Read the backend response
    const result = await response.json();

    // 9. Handle errors returned by the backend
    if (!response.ok) {
      const errorMessage =
        result.message ||
        result.error ||
        (Array.isArray(result.errors)
          ? result.errors.map(error => error.message || error.msg).join(", ")
          : "") ||
        "Registration failed. Please try again.";

      throw new Error(errorMessage);
    }

    // 10. Show success message
    message.textContent =
      "Account created successfully. Redirecting to login...";

    message.className = "text-green-700";

    // Redirect to thr login page after 2 seconds
    setTimeout(() => {
      window.location.href = "Sign-in.html";
    }, 2000);

    // Clear the form after successful registration
    signupForm.reset();

  } catch (error) {
    // Handle connection problems and other errors
    message.textContent =
      error instanceof TypeError
        ? "Unable to connect to the server. Check that the backend is running."
        : error.message;

    message.className = "text-red-600";

  } finally {
    // Re-enable the button
    signupButton.disabled = false;
    signupButton.textContent = "Create Account";
  }
});

// Show and hide password fields
const toggleButtons = document.querySelectorAll(".toggle-password");

toggleButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // Find the password field associated with this button
    const targetId = button.dataset.target;
    const passwordField = document.getElementById(targetId);

    // Find the eye icon
    const eyeIcon = button.querySelector("i");

    // Toggle between hidden and visible
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