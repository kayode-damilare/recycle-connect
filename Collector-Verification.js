const BASE_URL = 'https://recycle-connect-m189.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const collectorEmail = localStorage.getItem('pendingCollectorEmail');
  const collectorToken = localStorage.getItem('collectorToken') || localStorage.getItem('token');

  function updateStatuses(approvalStatus){
    // Find badges by TEXT, not by class - this never crashes
    const allElements = document.querySelectorAll('span, div');
    const badges = Array.from(allElements).filter(el => {
      const t = el.textContent.trim();
      return t === 'Completed' || t === 'In Progress' || t === 'Pending';
    });

    console.log('Found badges:', badges.length);

    badges.forEach(badge => {
      if(approvalStatus === 'APPROVED' && (badge.textContent.includes('Pending') || badge.textContent.includes('In Progress'))){
        badge.textContent = 'Completed';
        // Just change style directly, don't touch className
        badge.style.backgroundColor = 'hsl(146,44%,94%)';
        badge.style.color = 'hsl(161,88%,25%)';
      }
      if(approvalStatus === 'REJECTED'){
        badge.textContent = 'Rejected';
        badge.style.backgroundColor = '#fee2e2';
        badge.style.color = '#dc2626';
      }
    });

    // Update notification box
    const notifyBoxes = Array.from(document.querySelectorAll('div')).filter(d => d.textContent.includes('You will be notified'));
    if(notifyBoxes.length > 0 && approvalStatus === 'APPROVED'){
      notifyBoxes[0].innerHTML = '✅ Verification Complete! You are now approved. <a href="Collector-Dashboard.html" class="underline font-bold">Go to Dashboard</a>';
    }
  }

  // Check status - for now just show pending (safe)
  updateStatuses('PENDING');

  // If you have email, try to auto-check if approved (optional)
  if(collectorEmail &&!collectorToken){
    try{
      // This will fail if still pending - that's expected
      const savedPassword = localStorage.getItem('collectorPassword');
      if(!savedPassword) return; // don't try without password

      const res = await fetch(`${BASE_URL}/api/auth/collector/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: collectorEmail, password: savedPassword })
      });
      const data = await res.json();
      if(res.ok && data.data?.token){
        localStorage.setItem('collectorToken', data.data.token);
        updateStatuses('APPROVED');
      }
    }catch(err){
      console.log('Still pending or CORS error:', err);
    }
  }

  // Update date
  const savedDate = localStorage.getItem('collectorSubmittedAt');
  if(savedDate){
    document.body.innerHTML = document.body.innerHTML.replaceAll('Sep 23, 2026', savedDate);
  }
});