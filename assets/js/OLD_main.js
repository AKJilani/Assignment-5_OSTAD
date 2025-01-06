// Store for all products and categories
let allProducts = [];
let categories = new Set();
let cart = [];

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        allProducts = data.products;

        // Extract unique categories
        allProducts.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });

        // Populate category filter
        populateCategoryFilter();

        // Display products
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('productsContainer').innerHTML =
            '<div class="error">Error loading products. Please try again later.</div>';
    }
}

// Check Stock from the API

async function checkStockFromAPI(productId) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();
        return product.stock;
    } catch (error) {
        console.error('Error fetching stock from API:', error);
        return 0;  // Return 0 if there's an error fetching stock
    }
}


// Populate category filter dropdown
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}


// Display products
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = ''; // Clear container

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const discount = product.discountPercentage;
        const finalPrice = (product.price * (100 - discount) / 100).toFixed(2);

        // Calculate available stock considering items in cart
        const cartItem = cart.find(item => item.productId === product.id);
        const availableStock = product.stock - (cartItem?.quantity || 0);

        // Populate the card HTML
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <a class="product-details-link" style="text-decoration: underline; color: #4CAF50; cursor: pointer;">See Product Details</a>
                <div class="product-price">
                    ${discount > 0 ? `
                        <span class="original-price">Old Price: $${product.price}</span><br>
                        <span class="discount">Discount: -${discount}%</span><br>
                        <span class="final-price">New Price: $${finalPrice}</span><br>` :
                `<span class="final-price">$${product.price}</span>`}
                </div>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span class="rating-value">${product.rating}</span>
                    <div><small style="color: white;">Stock: ${availableStock} units</small></div>
                </div>
                ${availableStock > 0 ? `
                    <div class="product-action">
                        <label for="quantity-${product.id}" class="quantity-label">Quantity:</label>
                        <select id="quantity-${product.id}" class="quantity-select">
                            ${Array.from({ length: availableStock }, (_, i) =>
                    `<option value="${i + 1}">${i + 1}</option>`
                ).join('')}
                        </select>
                        <button class="add-to-cart btn btn-primary" data-product-id="${product.id}">Add to Cart</button>
                    </div>
                ` : `
                    <div class="product-action">
                        <p class="out-of-stock">Out of Stock</p>
                    </div>
                `}
            </div>
        `;

        // Add card to the container
        container.appendChild(card);

        // Add click event for "See Product Details" link
        const productDetailsLink = card.querySelector('.product-details-link');
        productDetailsLink.onclick = () => showProductDetails(product);
    });

    // Add to cart button clicks
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.getAttribute('data-product-id');
            const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);
            addToCart(parseInt(productId), quantity);
        });
    });
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

// Show product details in modal
function showProductDetails(product) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.querySelector('#productModal .modal-title');
    const modalBody = document.querySelector('#productModal .modal-body');

    modalTitle.textContent = product.title;
    modalBody.innerHTML = `
        <div class="product-details">
            <img src="${product.thumbnail}" alt="${product.title}">
            <div class="product-meta">
                <p>${product.description}</p>
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Price:</strong> $${product.price}</p>
                <p><strong>Stock:</strong> ${product.stock} units</p>
                <p><strong>Rating:</strong> ${generateStarRating(product.rating)} (${product.rating})</p>
            </div>
            
            <div class="reviews-section">
                <h4>Customer Reviews</h4>
                ${product.reviews ?
            product.reviews.map(review => `
                        <div class="review">
                            <div>${generateStarRating(review.rating)}</div>
                            <p>${review.comment}</p>
                            <small>By ${review.reviewerName}</small>
                        </div>
                    `).join('') :
            '<p>No reviews yet</p>'
        }
            </div>
        </div>
    `;

    modal.show();
}


// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;

    const filtered = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
}

// addToCart function

async function addToCart(productId, quantity) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const discount = product.discountPercentage;
    const finalPrice = (product.price * (100 - discount) / 100).toFixed(2);

    // Fetch the latest stock from the API
    const availableStock = await checkStockFromAPI(productId);

    if (quantity > availableStock) {
        alert(`Sorry, only ${availableStock} units available in stock.`);
        return;
    }

    // Check if product is already in the cart
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        // Update quantity for existing item in the cart
        if (existingItem.quantity + quantity > availableStock) {
            alert(`Sorry, cannot add more units. Stock limit reached.`);
            return;
        }
        existingItem.quantity += quantity;
    } else {
        // Add new product to the cart (ensure only once)
        cart.push({
            productId,
            quantity,
            price: finalPrice,
            title: product.title,
            image: product.thumbnail,
            maxStock: availableStock
        });
    }

    updateCartUI();
    saveCart();
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
        const product = allProducts.find(p => p.id === item.productId);
        const availableStock = await checkStockFromAPI(item.productId); // Fetch live stock

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


// removeFromCart function
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartUI();
    saveCart();
}

// Update cart quantity

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.productId === productId);

    if (item) {
        item.quantity = quantity;
        updateCartUI();
        saveCart();
    }
}

// Save the cart data
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateStockOnCartChange();
    allProducts.forEach(product => {
        const cartItem = cart.find(item => item.productId === product.id);
        product.stock = cartItem ? product.stock - cartItem.quantity : product.stock;
    });
}

// Load cart data on page load
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}


// Update stock on cart change

async function updateStockOnCartChange(productId, quantity) {
    try {
        await fetch(`https://dummyjson.com/products/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stock: quantity,
            }),
        });
    } catch (error) {
        console.error('Error updating stock:', error);
    }
}




// Add event listeners for cart item actions
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
}


document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    fetchProducts();

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
});