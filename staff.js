// Staff dashboard functionality
let activeFilter = 'all';

// Initialize staff dashboard
function initStaffDashboard() {
    // Set up filter buttons
    setupFilterButtons();
    
    // Load initial orders
    loadOrders();
    
    // Set up periodic refresh
    setInterval(loadOrders, 10000); // Refresh every 10 seconds
    
    // Set up view toggle
    document.getElementById('guestViewBtn').addEventListener('click', () => {
        window.location.href = '/';
    });
}

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter
            activeFilter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Reload orders with the new filter
            loadOrders();
        });
    });
}

// Load orders from the server
async function loadOrders() {
    try {
        const response = await fetch('/api/all-orders');
        let orders = await response.json();
        
        // Apply filter if not 'all'
        if (activeFilter !== 'all') {
            orders = orders.filter(order => order.status === activeFilter);
        }
        
        // Sort orders by timestamp (newest first)
        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Display orders
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders. Please try again.', 'error');
    }
}

// Display orders in the dashboard
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center my-8">No orders found.</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

// Create an order card element
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    // Format timestamp
    const orderDate = new Date(order.timestamp);
    const formattedTime = orderDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const formattedDate = orderDate.toLocaleDateString();
    
    // Create item list HTML
    let itemsHTML = '';
    order.items.forEach(item => {
        itemsHTML += `
            <div class="order-card-item">
                <span>${item.name}</span>
                <span>KSh ${item.price}</span>
            </div>
        `;
    });
    
    // Create next status button
    let nextStatusButton = '';
    let nextStatus = '';
    
    switch (order.status) {
        case 'pending':
            nextStatus = 'preparing';
            nextStatusButton = '<button class="status-update-btn" data-next-status="preparing">Start Preparing</button>';
            break;
        case 'preparing':
            nextStatus = 'ready';
            nextStatusButton = '<button class="status-update-btn" data-next-status="ready">Mark as Ready</button>';
            break;
        case 'ready':
            nextStatus = 'served';
            nextStatusButton = '<button class="status-update-btn" data-next-status="served">Mark as Served</button>';
            break;
        case 'served':
            nextStatusButton = '<button class="status-update-btn" disabled>Completed</button>';
            break;
    }
    
    orderCard.innerHTML = `
        <div class="order-card-header ${order.status}">
            <h3>Table ${order.tableNumber}</h3>
            <span class="order-status">${capitalizeFirstLetter(order.status)}</span>
        </div>
        <div class="order-card-content">
            <div class="order-card-items">
                ${itemsHTML}
            </div>
            <div class="order-total">
                <strong>Total:</strong> KSh ${order.totalPrice}
            </div>
            <div class="order-timestamp">
                ${formattedDate} at ${formattedTime}
            </div>
            <div class="order-card-actions">
                <span class="order-id">Order #${order.id.substring(0, 8)}</span>
                ${nextStatusButton}
            </div>
        </div>
    `;
    
    // Add event listener to the status update button
    const statusBtn = orderCard.querySelector('.status-update-btn:not([disabled])');
    if (statusBtn) {
        statusBtn.addEventListener('click', async () => {
            const newStatus = statusBtn.getAttribute('data-next-status');
            await updateOrderStatus(order.id, newStatus);
        });
    }
    
    return orderCard;
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch('/api/update-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId,
                status: newStatus
            })
        });
        
        if (response.ok) {
            showToast(`Order status updated to ${capitalizeFirstLetter(newStatus)}`, 'success');
            loadOrders(); // Reload orders to reflect the change
        } else {
            showToast('Failed to update order status', 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initStaffDashboard);