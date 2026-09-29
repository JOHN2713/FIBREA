import hmac
import os

from flask import Blueprint, Response, jsonify, render_template, request
from backend.extensions import db
from backend.models.order import Order
from backend.routes.orders import serialize_order

admin_bp = Blueprint("admin", __name__)


@admin_bp.before_request
def require_admin_login():
    """Autenticación básica del navegador. Usuario y contraseña se definen en el entorno."""
    password = os.getenv("ADMIN_PASSWORD", "")
    if not password:
        # En local (FLASK_DEBUG=1) el panel queda abierto; en producción se bloquea.
        if os.getenv("FLASK_DEBUG", "0") == "1":
            return None
        return Response("Configura ADMIN_PASSWORD para habilitar el panel.", 403)

    auth = request.authorization
    valid = (
        auth is not None
        and hmac.compare_digest(auth.username or "", os.getenv("ADMIN_USER", "admin"))
        and hmac.compare_digest(auth.password or "", password)
    )
    if not valid:
        return Response(
            "Acceso restringido.", 401,
            {"WWW-Authenticate": 'Basic realm="FIBREA Admin", charset="UTF-8"'},
        )
    return None


@admin_bp.get("/admin")
def admin_page():
    return render_template("admin.html", active="")


@admin_bp.get("/api/admin/orders")
def admin_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()

    return jsonify({
        "success": True,
        "orders": [serialize_order(order) for order in orders],
    })


@admin_bp.patch("/api/admin/orders/<int:order_id>")
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "").strip().upper()

    valid_statuses = {"PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"}
    if new_status not in valid_statuses:
        return jsonify({
            "success": False,
            "message": "Estado no válido.",
            "valid_statuses": sorted(valid_statuses),
        }), 400

    order.status = new_status
    db.session.commit()

    return jsonify({
        "success": True,
        "order_id": order.id,
        "status": order.status,
        "message": "Estado actualizado correctamente.",
    })
