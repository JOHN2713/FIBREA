from datetime import datetime
from backend.extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(160), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    image = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(80), nullable=False, default="Decoración")
    external_url = db.Column(db.String(500), nullable=True)
    ai_description = db.Column(db.Text, nullable=True)
    available = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "price": float(self.price) if self.price is not None else None,
            "image": self.image,
            "category": self.category,
            "external_url": self.external_url,
            "ai_description": self.ai_description,
            "available": self.available,
        }
