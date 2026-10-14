
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-box input');
  const cards = document.querySelectorAll('.grid > div');

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(term)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});