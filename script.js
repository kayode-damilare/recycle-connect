document.addEventListener('DOMContentLoaded', () => {
  const flashClasses = ['ring-2', 'ring-[#087A55]', 'ring-offset-2'];

  // Sidebar navigation
  document.querySelectorAll('[data-href]').forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.href;
      if (!target) return;

      const targetUrl = new URL(target, window.location.href);

      if (targetUrl.pathname !== window.location.pathname) {
        window.location.href = targetUrl.href;
      } else {
        item.classList.add(...flashClasses);
        setTimeout(() => item.classList.remove(...flashClasses), 250);
      }
    });
  });

  // Message button
  const messageButton = document.querySelector('#message-btn');
  if (messageButton) {
    messageButton.addEventListener('click', () => {
      const email = 'hello@recycleconnect.com';
      const subject = encodeURIComponent('Collector enquiry');
      const body = encodeURIComponent(
        'Hi John, I would like to learn more about your collection services.'
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });
  }
});