// Order handling
document.addEventListener('tableSelected', event => {
    const tableNumber = event.detail.tableNumber;
    
    // Hide hotel scene and show order view
    document.getElementById('hotelScene').classList.add('hidden');
    document.getElementById('orderView').classList.remove('hidden');
    
    // Initialize menu system for the selected table
    initMenuSystem(tableNumber);
});



