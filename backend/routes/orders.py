from decimal import Decimal

from flask import Blueprint, jsonify, request

from backend.brand import BRAND
from backend.extensions import db
from backend.models.order import Order, OrderItem
from backend.models.product import Product

orders_bp = Blueprint("orders", __name__)

PAYMENT_METHODS = {method["id"] for method in BRAND["payment_methods"]}


def shipping_for(subtotal):
    shipping = BRAND["shipping"]
    if subtotal >= Decimal(str(shipping["free_from"])):
        return Decimal("0.00")
    return Decimal(str(shipping["cost"]))


def serialize_order(order):
    products = {
        product.id: product
        for product in Product.query.filter(
            Product.id.in_([item.product_id for item in order.items])
        ).all()
    }
    return {
        "id": order.id,
        "customer_name": order.customer_name,
        "email": order.email,
        "phone": order.phone,
        "city": order.city,
        "address": order.address,
        "notes": order.notes,
        "shipping": float(order.shipping or 0),
        "payment_method": order.payment_method,
        "total": float(order.total),
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "items": [
            {
                "product_id": item.product_id,
                "name": products[item.product_id].name if item.product_id in products else f"Producto #{item.product_id}",
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "subtotal": float(item.subtotal),
            }
            for item in order.items
        ],
    }


@orders_bp.post("/api/orders")
def create_order():
    data = request.get_json(silent=True) or {}

    required = ["customer_name", "email", "phone", "city", "address", "items"]
    missing = [field for field in required if not data.get(field)]

    if missing:
        return jsonify({
            "success": False,
            "message": "Faltan campos obligatorios.",
            "fields": missing
        }), 400

    if not isinstance(data["items"], list) or not data["items"]:
        return jsonify({
            "success": False,
            "message": "El pedido debe contener al menos un producto."
        }), 400

    payment_method = data.get("payment_method") or "transferencia"
    if payment_method not in PAYMENT_METHODS:
        return jsonify({"success": False, "message": "Método de pago no válido."}), 400

    order = Order(
        customer_name=data["customer_name"].strip(),
        email=data["email"].strip(),
        phone=data["phone"].strip(),
        city=data["city"].strip(),
        address=data["address"].strip(),
        notes=(data.get("notes") or "").strip(),
        payment_method=payment_method,
        total=Decimal("0.00"),
        status="PENDING",
    )

    subtotal_sum = Decimal("0.00")

    for item in data["items"]:
        product = db.session.get(Product, item.get("product_id"))
        quantity = int(item.get("quantity", 0))

        if not product or not product.available or quantity < 1:
            continue

        if product.price is None:
            return jsonify({
                "success": False,
                "message": f"El producto '{product.name}' todavía no tiene precio configurado."
            }), 400

        unit_price = Decimal(str(product.price))
        subtotal = unit_price * quantity

        order.items.append(OrderItem(
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        ))

        subtotal_sum += subtotal

    if not order.items:
        return jsonify({
            "success": False,
            "message": "No se encontraron productos válidos en el pedido."
        }), 400

    order.shipping = shipping_for(subtotal_sum)
    order.total = subtotal_sum + order.shipping
    db.session.add(order)
    db.session.commit()

    return jsonify({
        "success": True,
        "order_id": order.id,
        "total": float(order.total),
        "status": order.status,
        "message": "Pedido recibido correctamente."
    }), 201


@orders_bp.get("/api/orders/<int:order_id>")
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({"success": True, "order": serialize_order(order)})
