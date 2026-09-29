from flask import Blueprint, jsonify, render_template, request
from backend.models.product import Product

products_bp = Blueprint("products", __name__)


@products_bp.get("/productos")
def products_page():
    return render_template("productos.html", active="coleccion")


@products_bp.get("/api/products")
def products_api():
    category = request.args.get("category")

    query = Product.query.filter_by(available=True)

    if category and category.lower() != "todos":
        query = query.filter_by(category=category)

    products = query.order_by(Product.id.asc()).all()

    return jsonify({
        "success": True,
        "products": [product.to_dict() for product in products]
    })


@products_bp.get("/api/products/<int:product_id>")
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        "success": True,
        "product": product.to_dict()
    })
