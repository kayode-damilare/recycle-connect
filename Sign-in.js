// 1. Select the form and its elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const householdBtn = document.querySelector(".household-btn");
const collectorBtn = document.querySelector(".collector-btn");

const loginButton = document.querySelector(".submit-btn");
const togglePasswordBtn = document.getElementById("toggle-password");

// 2. Deployed backend endpoints
const API_BASE_URL = "https://recycle-connect-m189.onrender.com/api/auth";

const LOGIN_ENDPOINTS = {
  household: `${API_BASE_URL}/household/login`,
  collector: `${API_BASE_URL}/collector/login`
};

// 3. Dashboard destinations
// Change these filenames if your actual dashboard pages differ.
const DASHBOARDS = {
  household: "./House-Dashboard.html",
  collector: "./collector-Dashboard.html"
};

// 4. Track the selected account type
let selectedRole = "household";

// 5. Check that required HTML elements exist
if (
  loginForm &&
  emailInput &&
  passwordInput &&
  householdBtn &&
  collectorBtn &&
  loginButton &&
  togglePasswordBtn
) {
  // 6. Create a message element
  const message = document.createElement("p");

  message.id = "login-message";
  message.className = "hidden text-sm mt-3";
  message.setAttribute("role", "alert");
  message.setAttribute("aria-live", "polite");

  loginForm.insertBefore(message, loginButton);

  // 7. Display messages
  function showMessage(text, type = "error") {
    message.textContent = text;

    message.className = "text-sm mt-3";

    if (type === "success") {
      message.classList.add("text-green-700");
    } else {
      message.classList.add("text-red-600");
    }
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "hidden text-sm mt-3";
  }

  // 8. Update the selected account type
  function selectRole(role) {
    selectedRole = role;

    clearMessage();

    const activeClasses = [
      "bg-[hsl(161,88%,25%)]",
      "text-white"
    ];

    const inactiveClasses = [
      "border-2",
      "border-[hsl(148,20%,87%)]",
      "bg-[hsl(146,44%,94%)]",
      "text-[hsl(163,85%,18%)]"
    ];

    const activeButton =
      role === "household" ? householdBtn : collectorBtn;

    const inactiveButton =
      role === "household" ? collectorBtn : householdBtn;

    inactiveButton.classList.remove(...activeClasses);
    inactiveButton.classList.add(...inactiveClasses);

    activeButton.classList.remove(...inactiveClasses);
    activeButton.classList.add(...activeClasses);
  }

  householdBtn.addEventListener("click", function () {
    selectRole("household");
  });

  collectorBtn.addEventListener("click", function () {
    selectRole("collector");
  });

  // 9. Show and hide password
  togglePasswordBtn.addEventListener("click", function () {
    const eyeIcon = togglePasswordBtn.querySelector("i");

    if (!eyeIcon) {
      console.error("Password toggle icon was not found.");
      return;
    }

    if (passwordInput.type === "password") {
      passwordInput.type = "text";

      eyeIcon.classList.replace("fa-eye", "fa-eye-slash");

      togglePasswordBtn.setAttribute(
        "aria-label",
        "Hide password"
      );
    } else {
      passwordInput.type = "password";

      eyeIcon.classList.replace("fa-eye-slash", "fa-eye");

      togglePasswordBtn.setAttribute(
        "aria-label",
        "Show password"
      );
    }
  });

  // 10. Handle login form submission
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessage();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate required fields
    if (!email || !password) {
      showMessage("Please enter your email address and password.");
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showMessage("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    // Select the correct endpoint
    const API_URL = LOGIN_ENDPOINTS[selectedRole];

    try {
      loginButton.disabled = true;
      loginButton.textContent = "Logging in...";

      // Send login request
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      // Read the backend response
      const result = await response.json().catch(() => ({}));

      // Handle login errors
      if (!response.ok) {
        let errorMessage =
          result.message ||
          result.error ||
          "Login failed. Please check your email and password.";

        if (Array.isArray(result.errors) && result.errors.length > 0) {
          errorMessage = result.errors
            .map(error => error.message || error.msg || String(error))
            .join(", ");
        }

        throw new Error(errorMessage);
      }

      // 11. Read the documented response structure
      const accountData = result.data;

      if (!accountData || !accountData.token) {
        throw new Error(
          "The server response did not contain an authentication token."
        );
      }

      const token = accountData.token;

      const user =
        selectedRole === "household"
          ? accountData.household
          : accountData.collector;

      if (!user) {
        throw new Error(
          "The server response did not contain the expected account details."
        );
      }

      // 12. Check Collector approval status
      // The backend must enforce these restrictions as well.
      if (selectedRole === "collector") {
        if (
          user.approvalStatus &&
          user.approvalStatus !== "APPROVED"
        ) {
          throw new Error(
            "Your Collector account has not been approved yet."
          );
        }

        if (user.isActive === false) {
          throw new Error(
            "Your Collector account is inactive. Please contact support."
          );
        }
      }

      // 13. Save authentication information
      localStorage.setItem("authToken", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem("userRole", selectedRole);

      // Display success message
      showMessage(
        result.message || "Login successful. Redirecting...",
        "success"
      );

      // 14. Redirect to the correct dashboard
      setTimeout(function () {
        window.location.href = DASHBOARDS[selectedRole];
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof TypeError) {
        showMessage(
          "Could not connect to the server. Check your internet connection and try again."
        );
      } else {
        showMessage(
          error.message || "Something went wrong. Please try again."
        );
      }

    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Log In";
    }
  });

} else {
  console.error(
    "Sign-in setup failed: One or more required HTML elements are missing. Check the element IDs and class names."
  );
}