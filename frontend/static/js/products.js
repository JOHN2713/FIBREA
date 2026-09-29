// Catálogo y ficha de producto. Usa las funciones de carrito de main.js.
let products = [];
let activeCategory = "Todos";
let selectedProduct = null;
let selectedQty = 1;

async function loadProducts() {
  const response = await fetch("/api/products");
  const data = await response.json();
  products = data.products || [];

  renderCategories();
  renderProducts();

  const productId = Number(new URLSearchParams(window.location.search).get("product"));
  const requested = products.find(product => product.id === productId);
  if (requested) openProduct(requested);
}

function renderCategories() {
  const categories = ["Todos", ...new Set(products.map(product => product.category))];
  const container = document.getElementById("categories");

  container.innerHTML = categories.map(category => `
    <button type="button" role="tab" class="category-pill ${category === activeCategory ? "is-active" : ""}"
            aria-selected="${category === activeCategory}" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join("");

  container.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function filteredProducts() {
  const term = document.getElementById("searchInput").value.trim().toLowerCase();
  return products.filter(product =>
    (activeCategory === "Todos" || product.category === activeCategory) &&
    (!term || `${product.name} ${product.description}`.toLowerCase().includes(term))
  );
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const items = filteredProducts();

  document.getElementById("productsEmpty").hidden = items.length > 0;

  grid.innerHTML = items.map(product => `
    <article class="product-card">
      <button type="button" class="product-image block w-full" data-open="${product.id}" aria-label="Ver ${escapeHtml(product.name)}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" width="400" height="500">
      </button>
      <div class="flex items-end justify-between gap-3 p-4">
        <button type="button" class="min-w-0 text-left" data-open="${product.id}">
          <h3>${escapeHtml(product.name)}</h3>
          <p class="fibrea-muted mt-1 text-sm">${formatPrice(product.price)}</p>
        </button>
        <button type="button" class="quick-add" data-add="${product.id}" aria-label="Añadir ${escapeHtml(product.name)} al carrito"
                ${product.price == null ? "disabled" : ""}>
          <i data-lucide="shopping-bag"></i>
        </button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => openProduct(products.find(p => p.id === Number(button.dataset.open))));
  });
  grid.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(products.find(p => p.id === Number(button.dataset.add))));
  });

  refreshIcons();
}

function setQty(value) {
  selectedQty = Math.max(1, value);
  document.getElementById("qtyValue").textContent = selectedQty;
}

function openProduct(product) {
  if (!product) return;
  selectedProduct = product;
  setQty(1);

  const image = document.getElementById("modalImage");
  image.src = product.image;
  image.alt = product.name;
  document.getElementById("modalCategory").textContent = `Fibrea Collection  ›  ${product.category}`;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent = formatPrice(product.price);
  document.getElementById("modalDescription").textContent = product.description || "";
  document.getElementById("modalLongDescription").textContent =
    `${product.description || ""} Compuesto a mano en nuestro atelier con flores y follaje preservados: no necesita agua y mantiene su belleza por mucho tiempo.`;
  document.getElementById("mockupProduct").href = `/mockup?product=${product.id}`;
  document.getElementById("whatsappProduct").href =
    whatsappLink(`Hola FIBREA ATELIER, me interesa "${product.name}". ¿Me pueden dar más información?`);
  document.getElementById("addProduct").disabled = product.price == null;

  selectTab("descripcion");
  document.getElementById("productModal").hidden = false;
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", `/productos?product=${product.id}`);
}

function closeProduct() {
  document.getElementById("productModal").hidden = true;
  document.body.style.overflow = "";
  history.replaceState(null, "", "/productos");
}

function selectTab(name) {
  document.querySelectorAll("#productModal [data-tab]").forEach(tab =>
    tab.classList.toggle("is-active", tab.dataset.tab === name));
  document.querySelectorAll("#productModal [data-panel]").forEach(panel => {
    panel.hidden = panel.dataset.panel !== name;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  document.getElementById("searchInput").addEventListener("input", renderProducts);
  document.querySelectorAll("[data-close-product]").forEach(el => el.addEventListener("click", closeProduct));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !document.getElementById("productModal").hidden) closeProduct();
  });
  document.getElementById("qtyMinus").addEventListener("click", () => setQty(selectedQty - 1));
  document.getElementById("qtyPlus").addEventListener("click", () => setQty(selectedQty + 1));
  document.querySelectorAll("#productModal [data-tab]").forEach(tab =>
    tab.addEventListener("click", () => selectTab(tab.dataset.tab)));

  document.getElementById("addProduct").addEventListener("click", () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, selectedQty);
    closeProduct();
  });
});
