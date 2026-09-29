import os
import sys

from dotenv import load_dotenv
from flask import Flask, render_template
from sqlalchemy import inspect, text

# Permite ejecutar `python backend/app.py` desde la raíz del proyecto.
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Se carga antes de importar la configuración para que las variables estén disponibles.
load_dotenv(os.path.join(ROOT_DIR, ".env"))

from backend.brand import BRAND
from backend.config import Config
from backend.extensions import db
from backend.models.order import Order
from backend.models.product import Product
from backend.routes.admin import admin_bp
from backend.routes.mockup import mockup_bp
from backend.routes.orders import orders_bp
from backend.routes.products import products_bp
from backend.seed import seed_products


def _add_missing_columns():
    """Mini migración para bases SQLite creadas con versiones anteriores del MVP."""
    new_columns = {
        "orders": {
            "shipping": "NUMERIC(10, 2) NOT NULL DEFAULT 0",
            "payment_method": "VARCHAR(40)",
        },
    }
    inspector = inspect(db.engine)
    for table, columns in new_columns.items():
        existing = {column["name"] for column in inspector.get_columns(table)}
        for name, ddl in columns.items():
            if name not in existing:
                db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
    db.session.commit()


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(ROOT_DIR, "frontend", "templates"),
        static_folder=os.path.join(ROOT_DIR, "frontend", "static"),
        static_url_path="/static",
    )

    app.config.from_object(Config)

    db.init_app(app)

    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(mockup_bp)

    @app.context_processor
    def inject_brand():
        return {"brand": BRAND}

    @app.get("/")
    def home():
        products = Product.query.filter_by(available=True).order_by(Product.id).all()
        return render_template("index.html", products=products, active="inicio")

    @app.get("/descubre")
    def discover():
        return render_template("descubre.html", active="descubre")

    @app.get("/mockup")
    def mockup_page():
        return render_template("mockup.html", active="crea")

    @app.get("/checkout")
    def checkout_page():
        return render_template("checkout.html", active="")

    @app.get("/pedido/<int:order_id>")
    def order_received(order_id):
        order = Order.query.get_or_404(order_id)
        return render_template("pedido.html", order=order, active="")

    with app.app_context():
        db.create_all()
        _add_missing_columns()
        seed_products()

    return app


app = create_app()


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=debug,
        use_reloader=False,
    )
