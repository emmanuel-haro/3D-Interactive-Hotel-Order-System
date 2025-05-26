from flask import Flask, render_template, request, jsonify, session
import json
import os
import uuid
from datetime import datetime


app = Flask(__name__)
app.secret_key = 'smart_3d_hotel_order_system'

# Initialize data storage (in a real application, this would be a database)
if not os.path.exists('orders.json'):
    with open('orders.json', 'w') as f:
        json.dump([], f)

def load_orders():
    with open('orders.json', 'r') as f:
        return json.load(f)

def save_orders(orders):
    with open('orders.json', 'w') as f:
        json.dump(orders, f)

# Menu data
menu = {
    "drinks": [
        {"id": "d1", "name": "Kenyan Coffee", "price": 250, "description": "Rich and aromatic coffee from the Kenyan highlands", "image": "static/images/kenyan-coffee.jpg"},
        {"id": "d2", "name": "Dawa Tea", "price": 180, "description": "Traditional Kenyan tea with honey and ginger", "image": "static/images/dawa-tea.jpg"},
        {"id": "d3", "name": "Tropical Juice", "price": 200, "description": "Fresh blend of mango, passion fruit and pineapple", "image": "static/images/tropical-juice.jpg"},
        {"id": "d4", "name": "Safari Sunset", "price": 350, "description": "Signature cocktail with local spirits and fruits", "image": "static/images/safari-sunset.jpg"}
    ],
    "starters": [
        {"id": "s1", "name": "Samosa Platter", "price": 350, "description": "Crispy pastries filled with spiced meat or vegetables", "image": "static/images/samosa.jpg"},
        {"id": "s2", "name": "Nyama Choma Bites", "price": 450, "description": "Small pieces of grilled meat marinated in local spices", "image": "static/images/nyama-choma-bites.jpg"},
        {"id": "s3", "name": "Makai Soup", "price": 300, "description": "Creamy corn soup with a hint of local herbs", "image": "static/images/makai-soup.jpg"}
    ],
    "main": [
        {"id": "m1", "name": "Ugali with Sukuma Wiki", "price": 500, "description": "Traditional cornmeal dish served with sautéed greens", "image": "static/images/ugali-sukuma.jpg"},
        {"id": "m2", "name": "Swahili Fish Curry", "price": 750, "description": "Fresh fish cooked in coconut and curry spices", "image": "static/images/fish-curry.jpg"},
        {"id": "m3", "name": "Kenyan Biryani", "price": 650, "description": "Fragrant rice dish with meat and aromatic spices", "image": "static/images/biryani.jpg"},
        {"id": "m4", "name": "Pilau Rice", "price": 450, "description": "Spiced rice with meat and vegetables", "image": "static/images/pilau.jpg"}
    ],
    "desserts": [
        {"id": "ds1", "name": "Mandazi", "price": 200, "description": "Sweet fried bread with a hint of cardamom", "image": "static/images/mandazi.jpg"},
        {"id": "ds2", "name": "Tropical Fruit Platter", "price": 350, "description": "Selection of fresh seasonal Kenyan fruits", "image": "static/images/fruit-platter.jpg"},
        {"id": "ds3", "name": "Coconut Mahamri", "price": 250, "description": "Coconut-flavored sweet fried pastries", "image": "static/images/mahamri.jpg"}
    ]
}

# Routes
@app.route('/')
def index():
    # Generate a unique session ID for new users
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    return render_template('index.html')

@app.route('/menu/<int:table_number>')
def menu_page(table_number):
    return render_template('menu.html', table_number=table_number, menu=menu)

@app.route('/staff')
def staff_dashboard():
    orders = load_orders()
    return render_template('staff_dashboard.html', orders=orders)

@app.route('/api/menu')
def get_menu():
    return jsonify(menu)

@app.route('/api/order', methods=['POST'])
def place_order():
    data = request.json
    orders = load_orders()
    
    # Create order with status
    order = {
        'id': str(uuid.uuid4()),
        'tableNumber': data.get('tableNumber'),
        'items': data.get('items', []),
        'totalPrice': data.get('totalPrice', 0),
        'status': 'pending',
        'timestamp': datetime.now().isoformat(),
        'user_id': session.get('user_id')
    }
    
    orders.append(order)
    save_orders(orders)
    return jsonify({"success": True, "orderId": order['id']})

@app.route('/api/orders')
def get_orders():
    user_id = session.get('user_id')
    orders = [order for order in load_orders() if order.get('user_id') == user_id]
    return jsonify(orders)

@app.route('/api/all-orders')
def get_all_orders():
    return jsonify(load_orders())

@app.route('/api/update-status', methods=['POST'])
def update_status():
    data = request.json
    order_id = data.get('orderId')
    new_status = data.get('status')
    
    orders = load_orders()
    for order in orders:
        if order['id'] == order_id:
            order['status'] = new_status
    
    save_orders(orders)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)