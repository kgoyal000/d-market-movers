/* ============================================
   D' Market Movers - App JavaScript
   Cart, Mobile Menu, Quick Add, Interactions
   ============================================ */

// ---- Cart State ----
const Cart = {
  items: JSON.parse(localStorage.getItem('dmm-cart') || '[]'),

  save() {
    localStorage.setItem('dmm-cart', JSON.stringify(this.items));
    this.updateUI();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
    showToast(`${product.name} added to cart`);
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(id);
      return;
    }
    this.save();
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  updateUI() {
    // Update cart count badges
    document.querySelectorAll('.cart-count').forEach(el => {
      const count = this.getCount();
      el.textContent = count;
      el.classList.toggle('show', count > 0);
    });

    // Update cart drawer count
    const drawerCount = document.querySelector('.cart-drawer-count');
    if (drawerCount) drawerCount.textContent = `${this.getCount()} items`;

    // Update cart items
    const cartItemsEl = document.querySelector('.cart-items');
    if (!cartItemsEl) return;

    if (this.items.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <p>Your cart is empty</p>
          <a href="collection.html" class="btn btn-green btn-sm">Start Shopping</a>
        </div>`;
      const footer = document.querySelector('.cart-footer');
      if (footer) footer.style.display = 'none';
      return;
    }

    const footer = document.querySelector('.cart-footer');
    if (footer) footer.style.display = 'block';

    cartItemsEl.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)} TTD</div>
          <div class="cart-item-qty">
            <button onclick="Cart.updateQty('${item.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="Cart.updateQty('${item.id}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="Cart.remove('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');

    // Update subtotal
    const subtotalEl = document.querySelector('.cart-subtotal-value');
    if (subtotalEl) subtotalEl.textContent = `$${this.getTotal().toFixed(2)} TTD`;
  }
};

// ---- Cart Drawer ----
function openCart() {
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.querySelector('.cart-drawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  Cart.updateUI();
}

function closeCart() {
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.querySelector('.cart-drawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Mobile Menu ----
function toggleMobileMenu() {
  const nav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.cart-overlay');
  const toggle = document.querySelector('.mobile-toggle');

  if (nav?.classList.contains('open')) {
    nav.classList.remove('open');
    overlay?.classList.remove('open');
    toggle?.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    nav?.classList.add('open');
    overlay?.classList.add('open');
    toggle?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  document.querySelector('.mobile-nav')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.querySelector('.mobile-toggle')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Toast Notification ----
let toastTimeout;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    ${message}`;
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => {
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
  });
}

// ---- Product Page: Image Gallery ----
function switchImage(src, thumb) {
  const main = document.querySelector('.product-main-image img');
  if (main) {
    main.style.opacity = '0';
    setTimeout(() => {
      main.src = src;
      main.style.opacity = '1';
    }, 150);
  }
  document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
  thumb?.classList.add('active');
}

// ---- Product Page: Tabs ----
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

// ---- Product Page: Quantity ----
function updateQuantity(delta) {
  const el = document.querySelector('.quantity-value');
  if (!el) return;
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  el.textContent = val;
}

// ---- Filters Toggle ----
function toggleFilterGroup(el) {
  el.closest('.filter-group')?.classList.toggle('collapsed');
}

function toggleFilter(el) {
  el.classList.toggle('active');
}

// Mobile filter drawer
function openMobileFilters() {
  document.querySelector('.mobile-filter-drawer')?.classList.add('open');
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileFilters() {
  document.querySelector('.mobile-filter-drawer')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Header Scroll Effect ----
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// ---- Overlay Click Handler ----
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('cart-overlay')) {
    closeCart();
    closeMobileMenu();
    closeMobileFilters();
  }
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateUI();

  // Add transition to main image
  const mainImg = document.querySelector('.product-main-image img');
  if (mainImg) mainImg.style.transition = 'opacity 0.15s ease';

  // Intersection observer for fade-in animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(el => {
    observer.observe(el);
  });

  // Init mega menu
  initMegaMenu();
});

// ---- Mega Menu ----
// Show/hide mega menu with delay to prevent accidental close
function initMegaMenu() {
  document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
    let timeout;
    item.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      // Close other open dropdowns
      document.querySelectorAll('.nav-item.has-dropdown.active').forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.add('active');
    });
    item.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => item.classList.remove('active'), 200);
    });
  });
}

// ---- Predictive Search ----
const searchProducts = [
  { id: 'organic-box', name: 'Organic Box', price: 150, category: 'Produce', image: 'https://www.dmarketmovers.com/976-home_default/organic-box.jpg' },
  { id: 'bananas', name: 'Bananas', price: 8, category: 'Produce', image: 'https://www.dmarketmovers.com/2502-home_default/bananas.jpg' },
  { id: 'basil', name: 'Basil', price: 15, category: 'Herbs', image: 'https://www.dmarketmovers.com/915-home_default/basil.jpg' },
  { id: 'eggs-free-range', name: 'Eggs Free Range', price: 30, category: 'Farm Fresh', image: 'https://www.dmarketmovers.com/839-home_default/eggs-free-range.jpg' },
  { id: 'callaloo', name: 'Callaloo', price: 5, category: 'Produce', image: 'https://www.dmarketmovers.com/55-home_default/callaloo.jpg' },
  { id: 'pink-grapefruit', name: 'Pink Grapefruit', price: 12, category: 'Fruits', image: 'https://www.dmarketmovers.com/858-home_default/pink-grapefruit.jpg' },
  { id: 'chicken-bl-breast', name: 'Chicken BL Breast', price: 42, category: 'Meats', image: 'https://www.dmarketmovers.com/79-home_default/chicken-bl-breast-per-lb.jpg' },
  { id: 'shadon-beni-pesto', name: 'Shadon Beni Pesto', price: 65, category: 'Grocery', image: 'https://www.dmarketmovers.com/1781-home_default/shadonbeni-pesto.jpg' },
  { id: 'specialty-gift-basket', name: 'Specialty Gift Basket', price: 350, category: 'Gifts', image: 'https://www.dmarketmovers.com/1066-home_default/specialty-gift-basket.jpg' },
  { id: 'smoothie', name: 'Blanchicheers Smoothie', price: 45, category: 'Wellness', image: 'https://www.dmarketmovers.com/2427-home_default/blanchicheers-smoothie.jpg' },
  { id: 'carrots', name: 'Carrots', price: 7, category: 'Produce', image: 'https://www.dmarketmovers.com/57-home_default/carrots.jpg' },
  { id: 'strawberries', name: 'Strawberries', price: 25, category: 'Fruits', image: 'https://www.dmarketmovers.com/148-home_default/strawberries-half-pint.jpg' },
  { id: 'cabbage', name: 'Cabbage', price: 12, category: 'Produce', image: 'https://www.dmarketmovers.com/45-home_default/cabbage.jpg' },
  { id: 'watermelon', name: 'Watermelon Yellow', price: 15, category: 'Fruits', image: 'https://www.dmarketmovers.com/1984-home_default/watermelon-per-lb-yellow.jpg' },
  { id: 'veggie-bites', name: 'Veggie Bites Vegan', price: 35, category: 'Meals 2 Go', image: 'https://www.dmarketmovers.com/1920-home_default/veggie-bites-vegan.jpg' },
  { id: 'beet-root', name: 'Beet Root', price: 9, category: 'Produce', image: 'https://www.dmarketmovers.com/1981-home_default/beet-root-per-lb.jpg' },
  { id: 'celery', name: 'Celery', price: 10, category: 'Produce', image: 'https://www.dmarketmovers.com/72-home_default/celery.jpg' },
  { id: 'brunch-basket', name: 'Brunch Basket', price: 250, category: 'Gifts', image: 'https://www.dmarketmovers.com/2224-home_default/d-gift-brunch-basket.jpg' },
];

function openSearch() {
  const overlay = document.querySelector('.search-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => overlay.querySelector('.search-input')?.focus(), 100);
  renderSearchSuggestions();
}

function closeSearch() {
  const overlay = document.querySelector('.search-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const input = overlay.querySelector('.search-input');
  if (input) input.value = '';
}

function handleSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  const resultsEl = document.querySelector('.search-results');
  if (!resultsEl) return;

  if (!query) {
    renderSearchSuggestions();
    return;
  }

  const matches = searchProducts.filter(p =>
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
  ).slice(0, 8);

  if (matches.length === 0) {
    resultsEl.innerHTML = `
      <div style="text-align:center;padding:40px 0;color:var(--color-text-light)">
        <svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:var(--color-border);fill:none;stroke-width:1.5;margin-bottom:12px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p style="font-size:16px;font-weight:500">No results for "${e.target.value}"</p>
        <p style="font-size:14px;margin-top:4px">Try a different search term</p>
      </div>`;
    return;
  }

  resultsEl.innerHTML = `
    <h4 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--color-text-light);margin-bottom:16px">${matches.length} results</h4>
    <div class="search-results-list">
      ${matches.map(p => `
        <a href="product.html" class="search-result-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="search-result-info">
            <div class="search-result-category">${p.category}</div>
            <div class="search-result-name">${p.name}</div>
            <div class="search-result-price">$${p.price.toFixed(2)} TTD</div>
          </div>
          <button class="search-result-add" onclick="event.preventDefault();event.stopPropagation();Cart.add({id:'${p.id}',name:'${p.name}',price:${p.price},image:'${p.image}'})">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </a>
      `).join('')}
    </div>`;
}

function renderSearchSuggestions() {
  const resultsEl = document.querySelector('.search-results');
  if (!resultsEl) return;
  const trending = searchProducts.slice(0, 4);
  resultsEl.innerHTML = `
    <div class="search-suggestions">
      <h4>Popular Searches</h4>
      <div class="search-tags">
        <a class="search-tag" onclick="document.querySelector('.search-input').value='organic';document.querySelector('.search-input').dispatchEvent(new Event('input'))">Organic</a>
        <a class="search-tag" onclick="document.querySelector('.search-input').value='fruits';document.querySelector('.search-input').dispatchEvent(new Event('input'))">Fruits</a>
        <a class="search-tag" onclick="document.querySelector('.search-input').value='meats';document.querySelector('.search-input').dispatchEvent(new Event('input'))">Meats</a>
        <a class="search-tag" onclick="document.querySelector('.search-input').value='gift';document.querySelector('.search-input').dispatchEvent(new Event('input'))">Gift Boxes</a>
        <a class="search-tag" onclick="document.querySelector('.search-input').value='smoothie';document.querySelector('.search-input').dispatchEvent(new Event('input'))">Smoothies</a>
        <a class="search-tag" onclick="document.querySelector('.search-input').value='vegan';document.querySelector('.search-input').dispatchEvent(new Event('input'))">Vegan</a>
      </div>
      <h4>Trending Products</h4>
      <div class="search-trending">
        ${trending.map(p => `
          <a href="product.html" class="search-trending-item">
            <img src="${p.image}" alt="${p.name}">
            <div class="search-trending-name">${p.name}</div>
            <div class="search-trending-price">$${p.price.toFixed(2)} TTD</div>
          </a>
        `).join('')}
      </div>
    </div>`;
}

function searchByTag(query) {
  const input = document.querySelector('.search-input');
  if (input) {
    input.value = query;
    input.dispatchEvent(new Event('input'));
  }
}

// ---- Product Quick View ----
function openQuickView(product) {
  let modal = document.querySelector('.quickview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'quickview-modal';
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickView();
    });
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="quickview-content">
      <button class="quickview-close" onclick="closeQuickView()">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="quickview-inner">
        <div class="quickview-gallery">
          <div class="quickview-main-img">
            <img src="${product.image}" alt="${product.name}">
          </div>
        </div>
        <div class="quickview-info">
          <div class="quickview-category">${product.category || 'Produce'}</div>
          <h2>${product.name}</h2>
          <div class="quickview-price">$${product.price.toFixed(2)} <span class="currency">TTD</span></div>
          <p>${product.description || 'Fresh, locally sourced from Trinidad & Tobago farms. Our products are carefully selected to ensure the highest quality and freshness for your family.'}</p>
          <div class="quickview-actions">
            <div class="quantity-selector">
              <button class="quantity-btn" onclick="updateQuickViewQty(-1)">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="quickview-qty">1</span>
              <button class="quantity-btn" onclick="updateQuickViewQty(1)">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
            <button class="add-to-cart-main" onclick="addFromQuickView('${product.id}','${product.name}',${product.price},'${product.image}')">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              <span>Add to Cart</span>
            </button>
          </div>
          <a href="product.html" class="quickview-full-link">View Full Details <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"/></svg></a>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => modal.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.querySelector('.quickview-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function updateQuickViewQty(delta) {
  const el = document.querySelector('.quickview-qty');
  if (!el) return;
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  el.textContent = val;
}

function addFromQuickView(id, name, price, image) {
  const qty = parseInt(document.querySelector('.quickview-qty')?.textContent || '1');
  for (let i = 0; i < qty; i++) {
    Cart.add({ id, name, price, image });
  }
  closeQuickView();
}

// ---- Keyboard Shortcuts ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSearch();
    closeQuickView();
    closeCart();
    closeMobileMenu();
    closeMobileFilters();
  }
  // Cmd/Ctrl+K to open search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
});
