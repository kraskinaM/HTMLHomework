const products = [
    { 
        id: 1, 
        name: 'Наушники Bose QuietComfort', 
        description: 'Беспроводные наушники с активным шумоподавлением, 20 часов работы',
        price: 29990, 
        image: '',
        category: 'Аудио'
    },
    { 
        id: 2, 
        name: 'Клавиатура Logitech MX Keys', 
        description: 'Беспроводная клавиатура для профессионалов, подсветка, USB-C',
        price: 10990, 
        image: '',
        category: 'Периферия'
    },
    { 
        id: 3, 
        name: 'Мышь Logitech MX Master 3S', 
        description: 'Эргономичная беспроводная мышь, 8K DPI, бесшумные клики',
        price: 8990, 
        image: '',
        category: 'Периферия'
    },
    { 
        id: 4, 
        name: 'Монитор Dell UltraSharp 27"', 
        description: '4K IPS, 100% sRGB, USB-C, для дизайнеров и профессионалов',
        price: 45990, 
        image: '',
        category: 'Мониторы'
    },
    { 
        id: 5, 
        name: 'Коврик для мыши SteelSeries QcK', 
        description: 'Игровой, большого размера 900x400мм, прорезиненная основа',
        price: 2990, 
        image: '',
        category: 'Аксессуары'
    },
    { 
        id: 6, 
        name: 'Колонки Audioengine A2+', 
        description: 'Активные студийные мониторы, Bluetooth, 60Вт',
        price: 18990, 
        image: '',
        category: 'Аудио'
    }
];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartPage();
    updateCatalogButtons();
}
function updateCartCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}
function getCartItemQty(productId) {
    const found = cart.find(i => i.id === productId);
    return found ? found.quantity : 0;
}
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
}
function changeQty(productId, delta) {
    const idx = cart.findIndex(i => i.id === productId);
    if (idx === -1) return;
    const newQty = cart[idx].quantity + delta;
    if (newQty <= 0) {
        cart.splice(idx, 1);
    } else {
        cart[idx].quantity = newQty;
    }
    saveCart();
}
function removeItem(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
}
function renderCatalog() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => {
        const inCartQty = getCartItemQty(p.id);
        const btnText = inCartQty > 0 ? `В корзине (${inCartQty})` : 'В корзину';
        return `
            <div class="product-card" data-id="${p.id}">
                <div class="product-image">${p.image}</div>
                <div class="product-title">${p.name}</div>
                <div class="product-description">${p.description}</div>
                <div class="product-price">${p.price.toLocaleString()} ₽</div>
                <button class="add-to-cart" data-id="${p.id}">${btnText}</button>
            </div>
        `;
    }).join('');
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pid = parseInt(btn.dataset.id);
            addToCart(pid);
        });
    });
}
function updateCatalogButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        if (!id) return;
        const qty = getCartItemQty(id);
        const btn = card.querySelector('.add-to-cart');
        if (btn) {
            btn.textContent = qty > 0 ? `В корзине (${qty})` : 'В корзину';
        }
    });
}
function renderCartPage() {
    const container = document.getElementById('cartContainer');
    const totalSpan = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!container) return;
    if (!cart.length) {
        container.innerHTML = '<div class="empty-cart-msg">Корзина пуста. Добавьте товары из каталога.</div>';
        totalSpan.textContent = '0 ₽';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    if (checkoutBtn) checkoutBtn.disabled = false;
    let html = '';
    let totalSum = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        const itemTotal = product.price * item.quantity;
        totalSum += itemTotal;
        html += `
            <div class="cart-row" data-id="${item.id}">
                <div class="cart-info">
                    <div class="cart-image">${product.image}</div>
                    <span class="cart-title">${product.name}</span>
                    <span class="cart-price">${product.price.toLocaleString()} ₽</span>
                </div>
                <div class="cart-actions">
                    <div class="cart-qty">
                        <button class="qty-minus" data-id="${item.id}">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-remove" data-id="${item.id}">Удалить</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    totalSpan.textContent = totalSum.toLocaleString() + ' ₽';

    container.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', e => {
            const pid = parseInt(btn.dataset.id);
            changeQty(pid, 1);
        });
    });
    container.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', e => {
            const pid = parseInt(btn.dataset.id);
            changeQty(pid, -1);
        });
    });
    container.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', e => {
            const pid = parseInt(btn.dataset.id);
            removeItem(pid);
        });
    });
}
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav a, .cart-icon');
    const pages = {
        home: document.getElementById('homePage'),
        catalog: document.getElementById('catalogPage'),
        cart: document.getElementById('cartPage')
    };
    function showPage(pageId) {
        Object.values(pages).forEach(p => p.classList.remove('active-page'));
        if (pages[pageId]) pages[pageId].classList.add('active-page');
        document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
        const activeNav = document.querySelector(`.nav a[data-page="${pageId}"]`);
        if (activeNav) activeNav.classList.add('active');
        if (pageId === 'cart') renderCartPage();
        if (pageId === 'catalog') renderCatalog();
    }
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            let page = link.dataset.page;
            if (!page && link.classList.contains('cart-icon')) page = 'cart';
            if (page) showPage(page);
        });
    });
    document.querySelector('.hero-btn')?.addEventListener('click', () => {
        showPage('catalog');
    });
    renderCatalog();
    renderCartPage();
    updateCartCount();
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
        if (cart.length === 0) return;
        if (confirm('Оформить заказ? Корзина будет очищена.')) {
            cart = [];
            saveCart();
            renderCartPage();
            updateCartCount();
            updateCatalogButtons();
        }
    });
}
window.addEventListener('DOMContentLoaded', setupNavigation);