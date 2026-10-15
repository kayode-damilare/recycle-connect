document.addEventListener('DOMContentLoaded', () => {
    // const householdBtn = document.getElementById('household-btn');
    // const collectorBtn = document.getElementById('collector-btn');
    // const togglePassword = document.getElementById('toggle-password');
    // const passwordInput = document.getElementById('password');

    // householdBtn.addEventListener('click', () => {
    //     householdBtn.classList.add('active');
    //     collectorBtn.classList.remove('active');
    // });

    // collectorBtn.addEventListener('click', () => {
    //     collectorBtn.classList.add('active');
    //     householdBtn.classList.remove('active');
    // });

    // togglePassword.addEventListener('click', () => {
    //     const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    //     passwordInput.setAttribute('type', type);

    //     if (type === 'text') {
    //         togglePassword.classList.remove('fa-eye');
    //         togglePassword.classList.add('fa-eye-slash');
    //     } else {
    //         togglePassword.classList.remove('fa-eye-slash');
    //         togglePassword.classList.add('fa-eye');
    //     }
    // });

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        // const password = document.getElementById('password').value;
        // const role = householdBtn.classList.contains('active') ? 'Household' : 'Collector';

        console.log(`Logging in as ${role} with email: ${email}`);

        alert(`Login button clicked! Role: ${role}`);
    });
});
