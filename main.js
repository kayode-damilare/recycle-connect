const sidebarLinks = document.querySelectorAll("[data-href]");

const currentPage = window.location.pathname.split("/").pop();

sidebarLinks.forEach((link) => {
    const linkPage = link.dataset.href;

    // Active state
    if (linkPage === currentPage) {
        link.classList.add(
            "bg-[#D0F5DF]",
            "border",
            "border-[#087A55]"
        );
    }

    // Navigation
    link.addEventListener("click", () => {
        window.location.href = linkPage;
    });
});