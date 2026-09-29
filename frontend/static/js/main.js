// Funciones compartidas por todas las páginas: carrito, drawer, toast y menú.
const FIBREA_CART_KEY = "fibrea_cart";
const SHIPPING = (window.FIBREA && window.FIBREA.shipping) || { cost: 0, free_from: 0 };
const WHATSAPP = (window.FIBREA && window.FIBREA.whatsapp) || "";

function formatPrice(price) {
  if (price === null || price === undefined) return "Precio por definir";
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(price);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function whatsappLink(text) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// ---------------------------------------------------------------- Carrito
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(FIBREA_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(FIBREA_CART_KEY, JSON.stringify(cart));
  } catch {
    /* sin almacenamiento disponible: el carrito vive solo en esta página */
  }
  updateCartCount();
}

function clearCart() {
  saveCart([]);
}

function cartTotals(cart = getCart()) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = !cart.length || subtotal >= SHIPPING.free_from ? 0 : SHIPPING.cost;
  return { subtotal, shipping, total: subtotal + shipping };
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.product_id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    });
  }

  saveCart(cart);
  showToast(`${product.name} se añadió al carrito`);
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const element = document.getElementById("cartCount");
  if (!element) return;
  element.textContent = count;
  element.hidden = count === 0;
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="grid place-items-center gap-4 py-16 text-center">
        <i data-lucide="shopping-bag" style="width:36px;height:36px" class="fibrea-muted"></i>
        <p class="fibrea-muted">Tu carrito está vacío.</p>
        <a href="/productos" class="fibrea-btn fibrea-btn-outline">Ver la colección</a>
      </div>`;
    summary.hidden = true;
    refreshIcons();
    return;
  }

  summary.hidden = false;
  container.innerHTML = cart.map(item => `
    <div class="flex gap-4 border-b border-[var(--border)] py-4">
      <img src="${escapeHtml(item.image)}" alt="" class="h-24 w-20 flex-none rounded object-cover">
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium">${escapeHtml(item.name)}</p>
          <button type="button" class="icon-btn -mr-2 -mt-2 !h-8 !w-8" data-action="remove" data-id="${item.product_id}" aria-label="Eliminar ${escapeHtml(item.name)}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
        <p class="fibrea-muted text-xs">${formatPrice(item.price)}</p>
        <div class="mt-auto flex items-center justify-between pt-2">
          <div class="qty">
            <button type="button" data-action="minus" data-id="${item.product_id}" aria-label="Quitar uno">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="plus" data-id="${item.product_id}" aria-label="Añadir uno">+</button>
          </div>
          <strong class="text-sm">${formatPrice((item.price || 0) * item.quantity)}</strong>
        </div>
      </div>
    </div>
  `).join("");

  const totals = cartTotals(cart);
  document.getElementById("cartSubtotal").textContent = formatPrice(totals.subtotal);
  document.getElementById("cartShipping").textContent = totals.shipping ? formatPrice(totals.shipping) : "Gratis";
  document.getElementById("cartTotal").textContent = formatPrice(totals.total);

  const missing = SHIPPING.free_from - totals.subtotal;
  document.getElementById("cartFreeShipping").textContent =
    missing > 0 ? `Te faltan ${formatPrice(missing)} para envío gratis.` : "Tu pedido tiene envío gratis.";

  const hasUndefinedPrice = cart.some(item => item.price == null);
  document.getElementById("checkoutButton").setAttribute("aria-disabled", hasUndefinedPrice);

  container.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      let current = getCart();
      const item = current.find(x => x.product_id === id);
      if (!item) return;

      if (button.dataset.action === "plus") item.quantity += 1;
      if (button.dataset.action === "minus") {
        item.quantity -= 1;
        if (item.quantity < 1) current = current.filter(x => x.product_id !== id);
      }
      if (button.dataset.action === "remove") current = current.filter(x => x.product_id !== id);

      saveCart(current);
      renderCart();
    });
  });

  refreshIcons();
}

function openCart() {
  renderCart();
  document.getElementById("cartDrawer").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartDrawer").hidden = true;
  document.body.style.overflow = "";
}

// ---------------------------------------------------------------- UI
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerHTML = `<i data-lucide="check"></i><span>${escapeHtml(message)}</span>
    <button type="button" class="ml-2 underline underline-offset-4" id="toastCart">Ver carrito</button>`;
  toast.hidden = false;
  refreshIcons();
  document.getElementById("toastCart").addEventListener("click", () => {
    toast.hidden = true;
    openCart();
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  refreshIcons();

  document.getElementById("cartButton")?.addEventListener("click", openCart);
  document.querySelectorAll("[data-close-cart]").forEach(el => el.addEventListener("click", closeCart));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCart();
  });

  const menuButton = document.getElementById("menuButton");
  const navLinks = document.getElementById("navLinks");
  menuButton?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", open);
  });

  // Botones "añadir al carrito" renderizados desde el servidor (inicio).
  document.querySelectorAll("[data-add-product]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      addToCart(JSON.parse(button.dataset.addProduct));
    });
  });
});
