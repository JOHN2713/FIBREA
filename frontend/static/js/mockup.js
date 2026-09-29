// Crea tu Fibrea: genera un mockup del producto en la foto del cliente.
let mockupProducts = [];
let selectedMockupProduct = null;
let selectedFile = null;
let loadingInterval;

const LOADING_MESSAGES = [
  "Analizando tu espacio…",
  "Buscando el mejor lugar para tu pieza…",
  "Ajustando la luz y las sombras…",
  "Dando los últimos detalles…",
];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

async function loadMockupProducts() {
  const [productsResponse, statusResponse] = await Promise.all([
    fetch("/api/products"),
    fetch("/api/mockup/status"),
  ]);
  const data = await productsResponse.json();
  const status = await statusResponse.json();

  document.getElementById("aiNotice").hidden = status.configured;

  mockupProducts = data.products || [];
  const requestedId = Number(new URLSearchParams(window.location.search).get("product"));
  renderMockupProducts();
  selectMockupProduct(mockupProducts.some(p => p.id === requestedId) ? requestedId : mockupProducts[0]?.id);
}

function renderMockupProducts() {
  const container = document.getElementById("mockupProducts");

  container.innerHTML = mockupProducts.map(product => `
    <button type="button" class="option-card" data-id="${product.id}">
      <img src="${escapeHtml(product.image)}" alt="" class="h-16 w-14 flex-none rounded object-cover" width="56" height="64" loading="lazy">
      <span class="min-w-0">
        <strong class="block text-sm font-medium">${escapeHtml(product.name)}</strong>
        <small class="fibrea-muted">${formatPrice(product.price)}</small>
      </span>
    </button>
  `).join("");

  container.querySelectorAll("[data-id]").forEach(button => {
    button.addEventListener("click", () => selectMockupProduct(Number(button.dataset.id)));
  });
}

function selectMockupProduct(id) {
  selectedMockupProduct = mockupProducts.find(product => product.id === id) || null;
  document.querySelectorAll("#mockupProducts [data-id]").forEach(button => {
    const selected = Number(button.dataset.id) === id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected);
  });
}

// Reduce fotos grandes (típicas de la cámara del celular) antes de subirlas.
// El servidor igual las reescala a 1024 px, así que enviar más solo hace lenta la subida.
async function compressImage(file, maxSide = 1600, quality = 0.88) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    if (scale === 1 && file.size < 2 * 1024 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    return blob ? new File([blob], "espacio.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // si el navegador no puede decodificarla, se envía tal cual
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function setFile(file) {
  const message = document.getElementById("mockupMessage");
  message.textContent = "";

  if (!file) return;
  if (file.type && !file.type.startsWith("image/")) {
    message.textContent = "El archivo debe ser una imagen.";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    message.textContent = "La imagen es demasiado pesada (máx. 25 MB).";
    return;
  }

  message.textContent = "Preparando la foto…";
  selectedFile = await compressImage(file);
  message.textContent = "";

  const preview = document.getElementById("previewImage");
  preview.src = URL.createObjectURL(selectedFile);
  preview.hidden = false;
  document.getElementById("dropzoneEmpty").hidden = true;
}

function setLoading(loading) {
  const button = document.getElementById("generateMockup");
  button.disabled = loading;
  document.getElementById("resultLoading").hidden = !loading;
  if (loading) {
    document.getElementById("resultEmpty").hidden = true;
    document.getElementById("mockupResult").hidden = true;
    let index = 0;
    const text = document.getElementById("loadingText");
    text.textContent = LOADING_MESSAGES[0];
    loadingInterval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      text.textContent = LOADING_MESSAGES[index];
    }, 3500);
  } else {
    clearInterval(loadingInterval);
  }
}

async function generate() {
  const message = document.getElementById("mockupMessage");

  if (!selectedMockupProduct) {
    message.textContent = "Elige primero una pieza.";
    return;
  }
  if (!selectedFile) {
    message.textContent = "Sube primero una foto de tu espacio.";
    return;
  }

  message.textContent = "";
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("product_id", selectedMockupProduct.id);
    formData.append("style", document.getElementById("styleSelect").value);
    formData.append("placement", document.getElementById("placementSelect").value);

    const response = await fetch("/api/mockup", { method: "POST", body: formData });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "No se pudo generar el mockup.");
    }

    const image = document.getElementById("generatedImage");
    image.src = result.image_url;
    image.alt = `${selectedMockupProduct.name} en tu espacio`;
    const download = document.getElementById("downloadMockup");
    download.href = result.image_url;
    download.download = `fibrea-${selectedMockupProduct.slug}.png`;

    document.getElementById("mockupResult").hidden = false;
    if (window.innerWidth < 1024) {
      document.getElementById("mockupResult").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (error) {
    message.textContent = error.message;
    document.getElementById("resultEmpty").hidden = false;
  } finally {
    setLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMockupProducts();

  const input = document.getElementById("spaceImage");
  const dropzone = document.getElementById("dropzone");

  const camera = document.getElementById("cameraInput");
  input.addEventListener("change", event => setFile(event.target.files[0]));
  camera.addEventListener("change", event => setFile(event.target.files[0]));
  ["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  }));
  ["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
  }));
  dropzone.addEventListener("drop", event => setFile(event.dataTransfer.files[0]));

  document.getElementById("generateMockup").addEventListener("click", generate);
  document.getElementById("addMockupProduct").addEventListener("click", () => {
    if (selectedMockupProduct) addToCart(selectedMockupProduct);
  });
  document.getElementById("newMockup").addEventListener("click", () => {
    document.getElementById("mockupResult").hidden = true;
    document.getElementById("resultEmpty").hidden = false;
    input.value = "";
    camera.value = "";
    selectedFile = null;
    document.getElementById("previewImage").hidden = true;
    document.getElementById("dropzoneEmpty").hidden = false;
  });
});
