
// Menu System
let currentCategory = 'drinks';
let menuData = {};
let orderItems = [];
let activeTableNumber = null;

// Initialize the menu system
async function initMenuSystem(tableNumber) {
    activeTableNumber = tableNumber;
    
    // Set table number in the UI
    document.getElementById('tableNumber').textContent = tableNumber;
    
    // Load menu data
    await loadMenuData();
    
    // Set up menu tabs
    setupMenuTabs();
    
    // Display menu items
    displayMenuItems(currentCategory);
    
    // Initialize empty order
    orderItems = [];
    updateOrderSummary();
    
    // Set up back button
    document.getElementById('backToTablesBtn').addEventListener('click', () => {
        document.getElementById('orderView').classList.add('hidden');
        document.getElementById('hotelScene').classList.remove('hidden');
    });
    
    // Set up place order button
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
}

// Load menu data from the server
async function loadMenuData() {
    try {
        const response = await fetch('/api/menu');
        menuData = await response.json();
    } catch (error) {
        console.error('Error loading menu data:', error);
        // Fallback to sample data if fetch fails
        menuData = {
            "drinks": [
                {"id": "d1", "name": "Kenyan Coffee", "price": 250, "description": "Rich and aromatic coffee from the Kenyan highlands", "image": "rich and aromatic coffee from kenya.jpg"},
                {"id": "d2", "name": "Dawa Tea", "price": 180, "description": "Traditional Kenyan tea with honey and ginger", "image": "traditional kenyan tea with honey and ginger.jpg"},
                {"id": "d3", "name": "Tropical Juice", "price": 200, "description": "Fresh blend of mango, passion fruit and pineapple", "image": "Fresh blend of mango, passion fruit and pineapple.jpg"},
                {"id": "d4", "name": "Safari Sunset", "price": 350, "description": "Signature cocktail with local spirits and fruits", "image": "Signature cocktail with local spirits and fruits.jpg"}
            ],
            "starters": [
                {"id": "s1", "name": "Samosa Platter", "price": 350, "description": "Crispy pastries filled with spiced meat or vegetables", "image": "Crispy pastries filled with spiced meat or vegetables.jpg"},
                {"id": "s2", "name": "Nyama Choma Bites", "price": 450, "description": "Small pieces of grilled meat marinated in local spices", "image": "Nyama Choma Bites.jpg"},
                {"id": "s3", "name": "Makai Soup", "price": 300, "description": "Creamy corn soup with a hint of local herbs", "image": "Creamy corn soup with a hint of local herbs.jpg"}
            ],
            "main": [
                {"id": "m1", "name": "Ugali with Sukuma Wiki", "price": 500, "description": "Traditional cornmeal dish served with sautéed greens", "image": "Traditional cornmeal dish served with sautéed greens.jpg"},
                {"id": "m2", "name": "Swahili Fish Curry", "price": 750, "description": "Fresh fish cooked in coconut and curry spices", "image": "Fresh fish cooked in coconut and curry spices.jpg"},
                {"id": "m3", "name": "Kenyan Biryani", "price": 650, "description": "Fragrant rice dish with meat and aromatic spices", "image": "Fragrant rice dish with meat and aromatic spices.jpg"},
                {"id": "m4", "name": "Pilau Rice", "price": 450, "description": "Spiced rice with meat and vegetables", "image": "Spiced rice with meat and vegetables.jpg"}
              
            ],
            "desserts": [
                {"id": "ds1", "name": "Mandazi", "price": 200, "description": "Sweet fried bread with a hint of cardamom", "image": "Mandazi.jpg"},
                {"id": "ds2", "name": "Tropical Fruit Platter", "price": 350, "description": "Selection of fresh seasonal Kenyan fruits", "image": "Selection of fresh seasonal Kenyan fruits.jpg"},
                {"id": "ds3", "name": "Coconut Mahamri", "price": 250, "description": "Coconut-flavored sweet fried pastries", "image": "Coconut Mahamri.jpg"}
            ]
        };
    }
}

// Setup menu category tabs
function setupMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Display menu items for the selected category
            const category = tab.getAttribute('data-category');
            currentCategory = category;
            displayMenuItems(category);
        });
    });
}

// Display menu items for a specific category
function displayMenuItems(category) {
    const menuItemsContainer = document.getElementById('menuItems');
    menuItemsContainer.innerHTML = '';
    
    if (!menuData[category]) {
        menuItemsContainer.innerHTML = '<p>No items available in this category.</p>';
        return;
    }
    
    menuData[category].forEach(item => {
        const itemElement = createMenuItemElement(item);
        menuItemsContainer.appendChild(itemElement);
    });
}

// Create a menu item element
function createMenuItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'menu-item';
    
    // Use a default image if the item image doesn't exist
    const imageUrl = item.image || 'static/images/placeholder.jpg';
    
    itemDiv.innerHTML = `
        <div class="menu-item-image">
            <img src="${imageUrl}" alt="${item.name}" onerror="this.src='static/images/placeholder.jpg'">
        </div>
        <div class="menu-item-info">
            <h3>${item.name}</h3>
            <p class="description">${item.description}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">KSh ${item.price}</span>
                <button class="add-to-order" data-id="${item.id}">Add to Order</button>
            </div>
        </div>
    `;
    
    // Add event listener for the "Add to Order" button
    const addButton = itemDiv.querySelector('.add-to-order');
    addButton.addEventListener('click', () => {
        addItemToOrder(item);
    });
    
    return itemDiv;
}

// Add an item to the order
function addItemToOrder(item) {
    // Add the item to the order
    const orderItem = {
        ...item,
        orderItemId: Date.now() // Unique ID for this order item
    };
    orderItems.push(orderItem);
    
    // Update the order summary
    updateOrderSummary();
    
    // Show a confirmation message
    showToast(`Added "${item.name}" to your order!`);
}

// Update the order summary display
function updateOrderSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const emptyOrderMessage = document.getElementById('emptyOrder');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    // Show or hide empty order message
    if (orderItems.length === 0) {
        emptyOrderMessage.style.display = 'block';
        placeOrderBtn.disabled = true;
    } else {
        emptyOrderMessage.style.display = 'none';
        placeOrderBtn.disabled = false;
    }
    
    // Clear previous order items
    while (orderItemsContainer.firstChild !== emptyOrderMessage) {
        orderItemsContainer.removeChild(orderItemsContainer.firstChild);
    }
    
    // Add each order item
    let totalAmount = 0;
    orderItems.forEach(item => {
        const orderItemElement = document.createElement('div');
        orderItemElement.className = 'order-item';
        orderItemElement.innerHTML = `
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-price">KSh ${item.price}</div>
            </div>
            <button class="remove-item" data-id="${item.orderItemId}">×</button>
        `;
        
        // Add event listener for the remove button
        const removeButton = orderItemElement.querySelector('.remove-item');
        removeButton.addEventListener('click', () => {
            removeItemFromOrder(item.orderItemId);
        });
        
        orderItemsContainer.insertBefore(orderItemElement, emptyOrderMessage);
        totalAmount += item.price;
    });
    
    // Update total
    document.getElementById('orderTotal').textContent = `KSh ${totalAmount}`;
}

// Remove an item from the order
function removeItemFromOrder(orderItemId) {
    // Find the item in the order
    const index = orderItems.findIndex(item => item.orderItemId === orderItemId);
    
    if (index !== -1) {
        const removedItem = orderItems[index];
        
        // Remove the item
        orderItems.splice(index, 1);
        
        // Update the order summary
        updateOrderSummary();
        
        // Show confirmation message
        showToast(`Removed "${removedItem.name}" from your order.`);
    }
}

// Place the order
async function placeOrder() {
    if (orderItems.length === 0) {
        showToast('Please add items to your order first.');
        return;
    }
    
    // Prepare order data
    const orderData = {
        tableNumber: activeTableNumber,
        items: orderItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price
        })),
        totalPrice: orderItems.reduce((total, item) => total + item.price, 0)
    };
    
    try {
        // Submit order to the server
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Show order confirmation
            document.getElementById('orderView').classList.add('hidden');
            document.getElementById('orderConfirmation').classList.remove('hidden');
            
            // Set up status tracking
            trackOrderStatus(result.orderId);
            
            // Set up new order button
            document.getElementById('newOrderBtn').addEventListener('click', () => {
                document.getElementById('orderConfirmation').classList.add('hidden');
                document.getElementById('hotelScene').classList.remove('hidden');
                orderItems = [];
            });
            
            showToast('Order placed successfully!', 'success');
        } else {
            showToast('Error placing order. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Network error. Please try again later.', 'error');
    }
}

// Track order status
async function trackOrderStatus(orderId) {
    // Initial check
    updateOrderStatusUI('pending');
    
    // Set up interval to check status
    const statusCheck = async () => {
        try {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            
            const order = orders.find(o => o.id === orderId);
            
            if (order) {
                updateOrderStatusUI(order.status);
                
                // If order is served, we can stop checking
                if (order.status === 'served') {
                    clearInterval(statusInterval);
                }
            }
        } catch (error) {
            console.error('Error tracking order:', error);
        }
    };
    
    // Check status every 5 seconds
    const statusInterval = setInterval(statusCheck, 5000);
    
    // For demo purposes, simulate status updates
    setTimeout(() => updateOrderStatusUI('preparing'), 5000);
    setTimeout(() => updateOrderStatusUI('ready'), 10000);
    setTimeout(() => updateOrderStatusUI('served'), 15000);
}

// Update order status UI
function updateOrderStatusUI(status) {
    const statusSteps = document.querySelectorAll('.status-step');
    
    statusSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    const statuses = ['pending', 'preparing', 'ready', 'served'];
    const currentStatusIndex = statuses.indexOf(status);
    
    for (let i = 0; i <= currentStatusIndex; i++) {
        const step = document.querySelector(`.status-step[data-status="${statuses[i]}"]`);
        if (step) {
            step.classList.add('active');
        }
    }
}

// Show a toast message
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add it to the document
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add toast styles to the document
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        top: 1rem;
        right: 1rem;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 80%;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .toast-info {
        background-color: #552834;
    }
    
    .toast-success {
        background-color: #28a745;
    }
    
    .toast-error {
        background-color: #dc3545;
    }
`;
document.head.appendChild(toastStyles);