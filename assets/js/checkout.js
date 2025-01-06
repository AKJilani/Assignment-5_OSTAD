// Initialize checkout data
let checkoutData = {
    cart: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
};

// Load cart data and initialize checkout
async function initializeCheckout() {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
        window.location.href = 'cart.html';
        return;
    }

    checkoutData.cart = JSON.parse(savedCart);
    await calculateTotals();
    renderCheckoutPage();
    setupEventListeners();
}

// Calculate all totals
async function calculateTotals() {
    // Calculate subtotal
    checkoutData.subtotal = checkoutData.cart.reduce((total, item) => 
        total + (parseFloat(item.price) * item.quantity), 0);
    
    // Calculate tax (assuming 10% tax rate)
    checkoutData.tax = checkoutData.subtotal * 0.10;
    
    // Calculate shipping (base rate + additional per item)
    checkoutData.shipping = 5 + (checkoutData.cart.reduce((total, item) => 
        total + item.quantity, 0) - 1) * 0.5;
    
    // Calculate total
    checkoutData.total = checkoutData.subtotal + checkoutData.tax + checkoutData.shipping;
}

// Render the checkout page
function renderCheckoutPage() {
    const checkoutContainer = document.getElementById('checkoutContainer');
    if (!checkoutContainer) return;

    checkoutContainer.innerHTML = `
        <div class="row">
            <!-- Left Column - Order Summary -->
            <div class="col-md-5 order-md-2 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title mb-4">Order Summary</h4>
                        ${renderOrderSummary()}
                        ${renderPriceSummary()}
                    </div>
                </div>
            </div>

            <!-- Right Column - Checkout Form -->
            <div class="col-md-7 order-md-1">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title mb-4">Checkout Details</h4>
                        ${renderCheckoutForm()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render order summary section
function renderOrderSummary() {
    return `
        <div class="order-items mb-4">
            ${checkoutData.cart.map(item => `
                <div class="d-flex mb-4 border-bottom pb-3">
                    <img src="${item.image}" alt="${item.title}" class="me-3" style="width: 80px; height: 80px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.title}</h6>
                        <p class="text-muted mb-1">Quantity: ${item.quantity}</p>
                        <p class="text-muted mb-0">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render price summary section
function renderPriceSummary() {
    return `
        <div class="price-summary">
            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>$${checkoutData.subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>$${checkoutData.tax.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span>$${checkoutData.shipping.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between fw-bold border-top pt-3">
                <span>Total:</span>
                <span>$${checkoutData.total.toFixed(2)}</span>
            </div>
        </div>
    `;
}

// Render checkout form
function renderCheckoutForm() {
    return `
        <form id="checkoutForm">
            <!-- Shipping Information -->
            <div class="mb-4">
                <h5 class="mb-3">Shipping Information</h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="firstName" class="form-label">First Name</label>
                            <input type="text" class="form-control" id="firstName" name="firstName" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="lastName" class="form-label">Last Name</label>
                            <input type="text" class="form-control" id="lastName" name="lastName" required>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group">
                            <label for="address" class="form-label">Address</label>
                            <input type="text" class="form-control" id="address" name="address" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="city" class="form-label">City</label>
                            <input type="text" class="form-control" id="city" name="city" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="postalCode" class="form-label">Postal Code</label>
                            <input type="text" class="form-control" id="postalCode" name="postalCode" required>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment Information -->
            <div class="mb-4">
                <h5 class="mb-3">Payment Information</h5>
                <div class="row g-3">
                    <div class="col-12">
                        <div class="form-group">
                            <label for="cardNumber" class="form-label">Card Number</label>
                            <input type="text" class="form-control" id="cardNumber" name="cardNumber" 
                                required pattern="[0-9]{16}" placeholder="1234 5678 9012 3456">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="expiryDate" class="form-label">Expiry Date</label>
                            <input type="text" class="form-control" id="expiryDate" name="expiryDate" 
                                required pattern="(0[1-9]|1[0-2])\/([0-9]{2})" placeholder="MM/YY">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="cvv" class="form-label">CVV</label>
                            <input type="text" class="form-control" id="cvv" name="cvv" 
                                required pattern="[0-9]{3,4}" placeholder="123">
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2">
                Place Order - $${checkoutData.total.toFixed(2)}
            </button>
        </form>
    `;
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', handleCheckoutSubmission);

    // Add input validation listeners
    const cardInput = form.querySelector('[name="cardNumber"]');
    const expiryInput = form.querySelector('[name="expiryDate"]');
    const cvvInput = form.querySelector('[name="cvv"]');

    if (cardInput) {
        cardInput.addEventListener('input', formatCardNumber);
    }
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
    if (cvvInput) {
        cvvInput.addEventListener('input', formatCVV);
    }
}

// Format card number input
function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

// Format expiry date input
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

// Format CVV input
function formatCVV(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 4);
}

// Handle checkout submission
async function handleCheckoutSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const orderData = {
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            address: formData.get('address'),
            city: formData.get('city'),
            postalCode: formData.get('postalCode')
        },
        order: {
            items: checkoutData.cart,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
            total: checkoutData.total
        },
        payment: {
            cardNumber: formData.get('cardNumber').replace(/\s/g, ''),
            expiryDate: formData.get('expiryDate'),
            cvv: formData.get('cvv')
        }
    };

    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        // Simulate API call to process payment and create order
        await processOrder(orderData);
        
        // Clear cart and redirect to success page
        localStorage.removeItem('cart');
        window.location.href = 'order-success.html';
    } catch (error) {
        console.error('Error processing order:', error);
        alert('There was an error processing your order. Please try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = `Place Order - $${checkoutData.total.toFixed(2)}`;
    }
}

// Simulate order processing
async function processOrder(orderData) {
    // This is where you would integrate with your payment processor and backend
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, orderId: 'ORD' + Date.now() });
        }, 1500);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeCheckout);