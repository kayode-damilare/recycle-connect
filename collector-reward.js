document.addEventListener('DOMContentLoaded', () => {
  const pointsDisplay = document.querySelector('h2');
  let points = 2450;

  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('Redeem')) {
      btn.addEventListener('click', () => {
        const cost = btn.closest('div').textContent.includes('1,000') ? 1000 : 2500;
        
        if (points >= cost) {
          points -= cost;
          // update both desktop + mobile banner
          document.querySelectorAll('h2').forEach(h2 => {
            if (h2.textContent.includes('points')) h2.textContent = `${points} points`;
          });
          btn.textContent = 'Redeemed!';
          btn.disabled = true;
          alert(`Redeemed! ${points} points left`);
        } else {
          alert('Not enough points!');
        }
      });
    }
  });
});