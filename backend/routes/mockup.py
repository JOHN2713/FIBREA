import os
import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from backend.models.product import Product
from backend.services.image_ai import ImageAIError, generate_mockup, provider_status

mockup_bp = Blueprint("mockup", __name__)


@mockup_bp.get("/api/mockup/status")
def mockup_status():
    return jsonify({"success": True, **provider_status()})


@mockup_bp.post("/api/mockup")
def create_mockup():
    file = request.files.get("image")
    if not file or file.filename == "":
        return jsonify({"success": False, "message": "No se recibió ninguna imagen."}), 400

    product_id = request.form.get("product_id", type=int)
    if not product_id:
        return jsonify({"success": False, "message": "Debes seleccionar un producto."}), 400

    product = Product.query.get_or_404(product_id)

    # La imagen del producto se guarda como /static/..., la convertimos a ruta local.
    product_image_path = None
    if product.image and product.image.startswith("/static/"):
        product_image_path = os.path.join(current_app.static_folder, product.image[len("/static/"):])

    options = {
        "style": request.form.get("style", "").strip()[:80],
        "placement": request.form.get("placement", "").strip()[:80],
    }

    try:
        image_bytes = generate_mockup(file.stream, product, product_image_path, options)
    except ImageAIError as error:
        if error.__cause__:
            current_app.logger.exception("Error generando mockup")
        return jsonify({"success": False, "message": str(error)}), error.status

    filename = f"mockup_{datetime.now():%Y%m%d%H%M%S}_{uuid.uuid4().hex[:8]}.png"
    mockups_dir = os.path.join(current_app.static_folder, "images", "mockups")
    os.makedirs(mockups_dir, exist_ok=True)
    with open(os.path.join(mockups_dir, filename), "wb") as f:
        f.write(image_bytes)

    return jsonify({
        "success": True,
        "image_url": f"/static/images/mockups/{filename}",
        "product_id": product.id,
        "message": "Mockup generado correctamente.",
    })
