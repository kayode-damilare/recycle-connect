// const BASE_URL = 'https://recycle-connect-m189.onrender.com';

// document.addEventListener('DOMContentLoaded', async () => {
//   const token = localStorage.getItem('collectorToken') || localStorage.getItem('Token');
//   const container = document.getElementById('directory-container'); // your grid/list div

//   // if(!token){
//   //   alert('Please login as Collector');
//   //   window.location.href = 'Collector-Login.html';
//   //   return;
//   // }

//   if(container) container.innerHTML = '<p class="text-sm text-gray-500">Loading recyclers...</p>';

//   try {
//     const res = await fetch(`${BASE_URL}/api/collector/recyclers`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     const payload = await res.json();
    
//     if(!res.ok){
//       throw new Error(payload.message || 'Failed to load directory');
//     }

//     const recyclers = payload.data || [];
//     console.log('Recyclers:', recyclers);

//     if(container){
//       if(recyclers.length === 0){
//         container.innerHTML = '<p class="text-sm">No recycler businesses found.</p>';
//         return;
//       }

//       container.innerHTML = '';
//       recyclers.forEach(r => {
//         const card = document.createElement('div');
//         card.className = 'bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex flex-col gap-1';
//         card.innerHTML = `
//           <h3 class="font-bold text-[16px] text-[hsl(163,53%,26%)]">${r.businessName}</h3>
//           <p class="text-[13px] text-gray-600">${r.businessAddress}, ${r.area}, ${r.cityTown}</p>
//           <p class="text-[13px] text-gray-600">${r.lga}, ${r.state}</p>
//           <p class="text-[13px] font-[600] mt-2">📞 ${r.phone}</p>
//           <p class="text-[13px] text-gray-500">✉️ ${r.email}</p>
//         `;
//         container.appendChild(card);
//       });
//     }

//   } catch(err){
//     console.error(err);
//     if(container) container.innerHTML = `<p class="text-red-500 text-sm">${err.message}</p>`;
//     // If you see CORS error again, it's the same backend fix:
//     // app.use(cors()) in server.js -> push to Render
//   }
// });



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


