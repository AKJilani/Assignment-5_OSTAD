// Store for all products and categories
let allProducts = [];
let categories = new Set();

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

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProductDetails(product);
        
        const discount = product.discountPercentage;
        const finalPrice = (product.price * (100 - discount) / 100).toFixed(2);
        
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">
                    ${discount > 0 ? 
                        `<span class="original-price">$${product.price}</span>
                         <span class="final-price">$${finalPrice}</span>
                         <span class="discount">-${discount}%</span>` :
                        `<span class="final-price">$${product.price}</span>`
                    }
                </div>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span class="rating-value">${product.rating}</span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
});