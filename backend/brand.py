"""Información del emprendimiento.

Edita este archivo para cambiar textos, contacto e historia de la marca sin
tocar los templates. Todo lo que está aquí se inyecta en las páginas como `brand`.
"""
import os

BRAND = {
    "name": "FIBREA ATELIER",
    "short_name": "FIBREA",
    "tagline": "Naturaleza ecuatoriana hecha con alma.",
    "hero_subtitle": "Piezas que nacen de nuestra tierra y encuentran su lugar en la tuya.",
    "origin": "Hecho en Ecuador",
    # Video de fondo del inicio (mp4, se reproduce en silencio y en loop). Vacío = sin video.
    "hero_video": "https://tool.perseo.ec/wp-content/uploads/2026/09/fondo-fibrea.mp4",

    # Contacto (el número de WhatsApp también se puede definir en .env)
    "whatsapp": os.getenv("WHATSAPP_NUMBER", "593999774777"),
    "email": os.getenv("CONTACT_EMAIL", "hola@fibrea.ec"),
    "instagram": os.getenv("INSTAGRAM_URL", "https://www.instagram.com/"),
    "city": "Ecuador",

    # Historia / propuesta de valor
    "story_title": "Ecuador, territorio de fibras.",
    "story": (
        "FIBREA ATELIER nace del encuentro entre la artesanía ecuatoriana y el diseño "
        "contemporáneo. Trabajamos con abacá, papel de abacá, rosas preservadas y follaje "
        "natural para crear piezas decorativas que duran en el tiempo y cuentan de dónde vienen."
    ),
    "mission": (
        "Llevar la naturaleza del Ecuador a los espacios de las personas con piezas "
        "hechas a mano, duraderas y con un origen que se puede contar."
    ),

    # Materiales que inspiran la marca (sección "Conoce la naturaleza que nos inspira")
    # Si agregas una foto en /static/images/brand/<slug>.webp se mostrará automáticamente.
    "materials": [
        {
            "slug": "abaca",
            "name": "Abacá",
            "short": "Una fibra extraordinaria.",
            "text": (
                "El abacá crece en zonas tropicales del Ecuador. Su fibra es resistente, "
                "ligera y versátil: la base de nuestras piezas."
            ),
            "tone": "hoja",
        },
        {
            "slug": "papel-abaca",
            "name": "Papel de abacá",
            "short": "De fibra a materia.",
            "text": (
                "Transformamos la fibra en un papel de textura única que envuelve y da "
                "carácter a cada composición."
            ),
            "tone": "abaca",
        },
        {
            "slug": "rosa-ecuatoriana",
            "name": "Rosa ecuatoriana",
            "short": "Una flor que lleva nuestro país al mundo.",
            "text": (
                "Rosas preservadas que conservan su forma y color durante años, sin agua "
                "ni mantenimiento."
            ),
            "tone": "rosa",
        },
        {
            "slug": "follaje",
            "name": "Follaje preservado",
            "short": "Naturaleza que permanece.",
            "text": (
                "Eucalipto, pampas y hojas naturales tratadas para mantener su belleza "
                "por mucho más tiempo."
            ),
            "tone": "amazonia",
        },
    ],

    # Proceso (página Descubre)
    "process": [
        {"step": "01", "name": "Planta", "text": "Cultivo del abacá en zonas tropicales del Ecuador."},
        {"step": "02", "name": "Fibra", "text": "Extracción y secado natural de la fibra."},
        {"step": "03", "name": "Papel de abacá", "text": "La fibra se transforma en papel artesanal."},
        {"step": "04", "name": "Diseño", "text": "Cada pieza se compone a mano en nuestro atelier."},
    ],

    # Beneficios que se muestran en la ficha de producto
    "benefits": [
        {"icon": "leaf", "title": "Naturaleza preservada", "text": "Larga duración, sin agua"},
        {"icon": "hand", "title": "Hecho en Ecuador", "text": "Apoyo a comunidades"},
        {"icon": "gift", "title": "Empaque especial", "text": "Papel de abacá"},
        {"icon": "book", "title": "Guía de cuidados", "text": "Incluida en cada pedido"},
    ],

    # Líneas de servicio (Fibrea Atelier)
    "atelier": [
        {"name": "Bodas", "text": "Bouquets y detalles para tu día.", "tone": "abaca"},
        {"name": "Objetos", "text": "Diseño en abacá para el hogar.", "tone": "tierra"},
        {"name": "Espacios", "text": "Hoteles, restaurantes y oficinas.", "tone": "hoja"},
    ],

    "care": [
        "Mantén la pieza en interiores, lejos de la luz solar directa y la humedad.",
        "No la riegues: las flores y el follaje están preservados.",
        "Retira el polvo con un secador de pelo en modo frío o una brocha suave.",
    ],

    "shipping": {
        "cost": 6.00,
        "free_from": 80.00,
        "text": "Envíos a todo Ecuador en 2 a 5 días hábiles.",
    },

    "payment_methods": [
        {"id": "transferencia", "name": "Transferencia bancaria", "text": "Te enviamos los datos por WhatsApp."},
        {"id": "contra_entrega", "name": "Pago contra entrega", "text": "Disponible en ciudades principales."},
        {"id": "tarjeta", "name": "Tarjeta de crédito o débito", "text": "Link de pago seguro (demo)."},
    ],
}
