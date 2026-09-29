from backend.extensions import db
from backend.models.product import Product


PRODUCTS = [
    {
        "name": "Florero 3 Unidades Liso",
        "slug": "florero-3-unidades-liso",
        "description": "Set de tres floreros de acabado liso para composición decorativa.",
        "price": 40.99,
        "image": "/static/images/products/florero-3-unidades-liso.webp",
        "category": "Decoración",
        "external_url": None,
        "ai_description": (
            "Set of three smooth white faceted ceramic vases of different sizes, each with "
            "a preserved flower arrangement in soft pink, white and cream tones with pampas "
            "grass and dried foliage. Keep the three vases white and the flower colors "
            "exactly as in the product photo."
        ),
        "available": True,
    },
    {
        "name": "Florero 3 Unidades Variado",
        "slug": "florero-3-unidades-variado",
        "description": "Set de tres floreros con composición y acabado variado.",
        "price": 50.99,
        "image": "/static/images/products/florero-3-unidades-variado.webp",
        "category": "Decoración",
        "external_url": None,
        "ai_description": (
            "Set of three cream/beige geometric vases with a diamond-faceted origami pattern "
            "(small, medium, large), filled with preserved roses (white, mint green and "
            "lilac), pink and lavender dried flowers, pampas and green leaves. Keep vase "
            "shape, beige color and flower colors exactly as in the product photo."
        ),
        "available": True,
    },
    {
        "name": "Florero Uniforme Morado",
        "slug": "florero-uniforme-morado",
        "description": "Florero de acabado uniforme en tono morado.",
        "price": 33.99,
        "image": "/static/images/products/florero-uniforme-morado.webp",
        "category": "Decoración",
        "external_url": None,
        "ai_description": (
            "Single small round WHITE faceted concrete vase (the vase is white, not purple) "
            "with a preserved arrangement of tall dark purple pampas plumes, white craspedia "
            "balls, lilac limonium, white dried grass and eucalyptus leaves. About 35 cm tall. "
            "Keep the vase white and the flower colors exactly as in the product photo."
        ),
        "available": True,
    },
]


def seed_products():
    for data in PRODUCTS:
        existing = Product.query.filter_by(slug=data["slug"]).first()

        if existing:
            for key, value in data.items():
                setattr(existing, key, value)
        else:
            db.session.add(Product(**data))

    db.session.commit()
