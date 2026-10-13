const Base_URL = "http://localhost:5000/api";

// Get HTML elements
const materialsContainer = document.getElementById("materials-container");
const locationDisplay = document.getElementById("location-display");
const useLocationBtn = document.getElementById("use-location-btn");
const nextBtn = document.getElementById("next-btn");



document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('materials-container');
  const cards = container.querySelectorAll('.material-card');

  // ---- CREATE BOX WITH JS ONLY (no HTML needed) ----
  const othersBox = document.createElement('div');
  othersBox.id = 'others-desc-box';
  othersBox.className = 'hidden mt-4 mb-4 w-full';

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Describe material';
  textarea.className = 'w-full h-[90px] p-3 text-[13px] border border-[hsl(150,19%,88%)] rounded-xl resize-none outline-none focus:border-gray-200 bg-white';
  othersBox.appendChild(textarea);

  // Put it in the gap between cards and Remember Me
  container.insertAdjacentElement('afterend', othersBox);

  cards.forEach(card => {
    card.addEventListener('click', () => {
      // 1. Your existing logic - Hide ALL check-marks first (KEPT)
      cards.forEach(c => {
        const mark = c.querySelector('.check-mark');
        mark.classList.add('hidden');
        mark.classList.remove('flex');
        c.classList.remove('border-2', 'border-[#0F6A3D]', 'bg-[#E9F5EC]');
        c.classList.add('border', 'border-[hsl(150,19%,88%)]', 'bg-white');
      });

      // 2. Your existing logic - Show only the clicked one (KEPT)
      const currentMark = card.querySelector('.check-mark');
      currentMark.classList.remove('hidden');
      currentMark.classList.add('flex');
      card.classList.add('border-2', 'border-[#0F6A3D]', 'bg-[#E9F5EC]');
      card.classList.remove('border', 'border-[hsl(150,19%,88%)]', 'bg-white');

      // 3. NEW - Only show box if it's Others
      const isOthers = card.dataset.material === 'others';

      if (isOthers) {
        othersBox.classList.remove('hidden');
        textarea.focus();
      } else {
        othersBox.classList.add('hidden');
      }
    });
  });
});
 