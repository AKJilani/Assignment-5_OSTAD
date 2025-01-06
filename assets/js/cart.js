// Initialize cart array
let cart = [];

// Check Stock from the API
async function checkStockFromAPI(productId) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();
        return product.stock;
    } catch (error) {
        console.error('Error fetching stock from API:', error);
        return 0;
    }
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }

    return stars;
}

// Update cart UI
async function updateCartUI() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    let total = 0;
    for (const item of cart) {
        const availableStock = await checkStockFromAPI(item.productId);

        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>Price: $${item.price}</p>
                    <div class="cart-item-quantity">
                        <label>Quantity: </label>
                        <select class="cart-quantity" data-product-id="${item.productId}">
                            ${Array.from({ length: availableStock }, (_, i) =>
            `<option value="${i + 1}" ${item.quantity === i + 1 ? 'selected' : ''}>${i + 1}</option>`
        ).join('')}
                        </select>
                        <button class="remove-from-cart btn btn-danger" data-product-id="${item.productId}">Remove</button>
                    </div>
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                    <p class="stock-info">Available Stock: ${availableStock - item.quantity}</p>
                </div>
            </div>
        `;
    }

    cartContainer.innerHTML += `
        <div class="cart-total">
            <h3>Total: $${total.toFixed(2)}</h3>
            <button class="btn btn-primary checkout-btn">Proceed to Checkout</button>
        </div>
    `;

    addCartEventListeners();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartUI();
}

// Update cart quantity
function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = quantity;
        saveCart();
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateStockOnCartChange();
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Update stock on cart change
async function updateStockOnCartChange() {
    for (const item of cart) {
        try {
            await fetch(`https://dummyjson.com/products/${item.productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stock: item.maxStock - item.quantity,
                }),
            });
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    }
}

// Add event listeners for cart items
function addCartEventListeners() {
    // Quantity change
    document.querySelectorAll('.cart-quantity').forEach(select => {
        select.addEventListener('change', (e) => {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            const quantity = parseInt(e.target.value);
            updateCartQuantity(productId, quantity);
        });
    });

    // Remove item
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            removeFromCart(productId);
        });
    });

    // Checkout button - Updated handler
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('Your cart is empty!');
            }
        });
    }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = '/checkout.html';
        });
    }
});