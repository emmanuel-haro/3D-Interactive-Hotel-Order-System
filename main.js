// Main application script

// Setup view toggle
document.addEventListener('DOMContentLoaded', () => {
    const guestViewBtn = document.getElementById('guestViewBtn');
    const staffViewBtn = document.getElementById('staffViewBtn');
    

    if (guestViewBtn && staffViewBtn) {
        guestViewBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
        
        staffViewBtn.addEventListener('click', () => {
            window.location.href = '/staff';
        });
    }
});