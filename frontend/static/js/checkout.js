// Checkout en dos pasos (envío → pago). La confirmación es la página /pedido/<id>.
function renderSummary() {
  const cart = getCart();
  const empty = !cart.length;

  document.getElementById("emptyCheckout").hidden = !empty;
  document.getElementById("checkoutForm").hidden = empty;

  document.getElementById("checkoutItems").innerHTML = cart.map(item => `
    <div class="flex items-center gap-3">
      <img src="${escapeHtml(item.image)}" alt="" class="h-16 w-14 flex-none rounded object-cover">
      <div class="min-w-0 flex-1 text-sm">
        <p class="font-medium">${escapeHtml(item.name)}</p>
        <p class="fibrea-muted text-xs">Cantidad: ${item.quantity}</p>
      </div>
      <span class="text-sm">${formatPrice((item.price || 0) * item.quantity)}</span>
    </div>
  `).join("") || `<p class="fibrea-muted text-sm">Sin productos.</p>`;

  const totals = cartTotals(cart);
  document.getElementById("sumSubtotal").textContent = formatPrice(totals.subtotal);
  document.getElementById("sumShipping").textContent = totals.shipping ? formatPrice(totals.shipping) : "Gratis";
  document.getElementById("sumTotal").textContent = formatPrice(totals.total);
  document.getElementById("payTotal").textContent = formatPrice(totals.total);
}

function goToStep(step) {
  document.querySelectorAll("[data-step-panel]").forEach(panel => {
    panel.hidden = Number(panel.dataset.stepPanel) !== step;
  });
  document.querySelectorAll("#stepper [data-step]").forEach(el => {
    const n = Number(el.dataset.step);
    el.classList.toggle("is-active", n === step);
    el.classList.toggle("is-done", n < step);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateShipping() {
  const panel = document.querySelector('[data-step-panel="1"]');
  let firstInvalid = null;
  panel.querySelectorAll("input[required]").forEach(input => {
    const valid = input.checkValidity() && input.value.trim() !== "";
    input.classList.toggle("is-invalid", !valid);
    if (!valid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }
  return true;
}

async function submitOrder(event) {
  event.preventDefault();

  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const message = document.getElementById("checkoutMessage");
  const button = document.getElementById("submitOrder");

  if (data.reference) {
    data.address = `${data.address} (Ref.: ${data.reference})`;
  }
  delete data.reference;
  data.items = getCart().map(item => ({ product_id: item.product_id, quantity: item.quantity }));

  message.textContent = "";
  button.disabled = true;

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "No se pudo crear el pedido.");

    clearCart();
    window.location.href = `/pedido/${result.order_id}`;
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();

  document.querySelector("[data-next]").addEventListener("click", () => {
    if (validateShipping()) goToStep(2);
  });
  document.querySelector("[data-prev]").addEventListener("click", () => goToStep(1));
  document.getElementById("checkoutForm").addEventListener("submit", submitOrder);
  document.querySelectorAll(".fibrea-input").forEach(input =>
    input.addEventListener("input", () => input.classList.remove("is-invalid")));
});
