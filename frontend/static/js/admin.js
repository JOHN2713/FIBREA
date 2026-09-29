const STATUS_LABELS = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PREPARING", label: "En preparación" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

let currentOrders = [];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadOrders() {
  const response = await fetch("/api/admin/orders");
  const data = await response.json();
  currentOrders = data.orders || [];

  document.getElementById("totalOrders").textContent = currentOrders.length;
  document.getElementById("pendingOrders").textContent =
    currentOrders.filter(order => order.status === "PENDING").length;

  const sales = currentOrders
    .filter(order => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);
  document.getElementById("salesTotal").textContent = formatCurrency(sales);

  renderOrdersTable(currentOrders);
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById("ordersTable");

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center fibrea-muted">No hay pedidos registrados.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr class="border-b border-black/5" data-order-id="${order.id}">
      <td class="p-5 font-medium">#${order.id}</td>
      <td class="p-5">${escapeHtml(order.customer_name)}</td>
      <td class="p-5">${escapeHtml(order.phone)}</td>
      <td class="p-5">${escapeHtml(order.city)}</td>
      <td class="p-5">${formatCurrency(order.total)}</td>
      <td class="p-5">
        <span class="status-badge ${statusClass(order.status)}">
          ${STATUS_LABELS[order.status] || order.status}
        </span>
      </td>
      <td class="p-5">
        <div class="flex flex-wrap items-center gap-2">
          <select
            class="status-select fibrea-input !min-h-[36px] !py-1 !text-xs"
            data-order-id="${order.id}"
          >
            ${STATUS_OPTIONS.map(option => `
              <option value="${option.value}" ${option.value === order.status ? "selected" : ""}>
                ${option.label}
              </option>
            `).join("")}
          </select>
          <button class="fibrea-btn fibrea-btn-outline !min-h-[36px] !px-3 !text-[10px]" data-view="${order.id}">
            Ver
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", async event => {
      const orderId = Number(event.target.dataset.orderId);
      const newStatus = event.target.value;
      await updateOrderStatus(orderId, newStatus);
    });
  });

  tbody.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", event => {
      const orderId = Number(event.target.dataset.view);
      openOrderDetail(orderId);
    });
  });
}

function statusClass(status) {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED": return "bg-blue-100 text-blue-800";
    case "PREPARING": return "bg-purple-100 text-purple-800";
    case "SHIPPED": return "bg-indigo-100 text-indigo-800";
    case "DELIVERED": return "bg-green-100 text-green-800";
    case "CANCELLED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "No se pudo actualizar el estado.");
      return;
    }

    const order = currentOrders.find(o => o.id === orderId);
    if (order) order.status = status;

    renderOrdersTable(currentOrders);
    updateSummary();
  } catch (error) {
    alert("Error de red al actualizar el estado.");
  }
}

function updateSummary() {
  document.getElementById("totalOrders").textContent = currentOrders.length;
  document.getElementById("pendingOrders").textContent =
    currentOrders.filter(order => order.status === "PENDING").length;

  const sales = currentOrders
    .filter(order => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);
  document.getElementById("salesTotal").textContent = formatCurrency(sales);
}

function openOrderDetail(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById("orderModalTitle").textContent = `Pedido #${order.id}`;
  document.getElementById("orderModalBody").innerHTML = `
    <p><span class="fibrea-muted">Cliente:</span> ${escapeHtml(order.customer_name)}</p>
    <p><span class="fibrea-muted">Email:</span> ${escapeHtml(order.email)}</p>
    <p><span class="fibrea-muted">WhatsApp:</span> ${escapeHtml(order.phone)}</p>
    <p><span class="fibrea-muted">Ciudad:</span> ${escapeHtml(order.city)}</p>
    <p><span class="fibrea-muted">Dirección:</span> ${escapeHtml(order.address)}</p>
    ${order.notes ? `<p><span class="fibrea-muted">Notas:</span> ${escapeHtml(order.notes)}</p>` : ""}
    <p><span class="fibrea-muted">Pago:</span> ${escapeHtml(order.payment_method || "Por coordinar")}</p>
    <p><span class="fibrea-muted">Envío:</span> ${formatCurrency(order.shipping || 0)}</p>
    <p><span class="fibrea-muted">Fecha:</span> ${formatDate(order.created_at)}</p>
    <p><span class="fibrea-muted">Estado:</span> ${STATUS_LABELS[order.status] || order.status}</p>
    <p class="pt-2 text-lg"><span class="fibrea-muted">Total:</span> <strong>${formatCurrency(order.total)}</strong></p>
  `;

  document.getElementById("orderModalItems").innerHTML = `
    <p class="fibrea-label">Productos</p>
    ${order.items.map(item => `
      <div class="flex justify-between rounded-lg bg-white/50 p-3">
        <span>${escapeHtml(item.name)} × ${item.quantity}</span>
        <span>${formatCurrency(item.subtotal)}</span>
      </div>
    `).join("")}
  `;

  const modal = document.getElementById("orderModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeOrderDetail() {
  const modal = document.getElementById("orderModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  document.getElementById("closeOrderModal").addEventListener("click", closeOrderDetail);
});
