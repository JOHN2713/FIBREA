"""Generación de mockups con IA.

Soporta dos proveedores, elegidos con la variable de entorno IMAGE_PROVIDER:

- gemini  -> Google AI Studio (GEMINI_API_KEY, modelo GEMINI_IMAGE_MODEL)
- openai  -> OpenAI / ChatGPT (OPENAI_API_KEY, modelo OPENAI_IMAGE_MODEL)

Si IMAGE_PROVIDER no está definido se usa el primero que tenga API key.
"""
import base64
import os
from io import BytesIO

from PIL import Image

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-image"
DEFAULT_OPENAI_MODEL = "gpt-image-1"


class ImageAIError(Exception):
    """Error con un mensaje apto para mostrar al usuario."""

    def __init__(self, message, status=500):
        super().__init__(message)
        self.status = status


def _env(name):
    # Limpia espacios o comillas que a veces quedan al editar el .env.
    return (os.getenv(name) or "").strip().strip("'\"`")


def active_provider():
    provider = _env("IMAGE_PROVIDER").lower()
    if provider in {"gemini", "openai"}:
        return provider
    if _env("GEMINI_API_KEY"):
        return "gemini"
    if _env("OPENAI_API_KEY"):
        return "openai"
    return None


def provider_status():
    provider = active_provider()
    return {
        "provider": provider,
        "configured": bool(provider and _env(f"{provider.upper()}_API_KEY")),
    }


def build_prompt(product, options=None):
    options = options or {}
    extras = []
    if options.get("style"):
        extras.append(f"Interior style: {options['style']}.")
    if options.get("placement"):
        extras.append(f"Place the product {options['placement']}.")

    return (
        "You receive two images. The FIRST image is the customer's room. "
        "The SECOND image is a FIBREA ATELIER product photo.\n"
        "Create one photorealistic image of the customer's room with the product "
        "naturally placed in it. Keep the room layout, walls, furniture and camera "
        "angle as in the first image. Keep the product's shape, colors, flowers, "
        "texture and realistic scale faithful to the second image. Soft natural "
        "light, editorial home decor photography.\n"
        f"Product: {product.name}. {product.ai_description or product.description or ''}\n"
        + " ".join(extras)
    ).strip()


def _to_png_bytes(source, max_size=1024):
    image = Image.open(source).convert("RGB")
    if max(image.size) > max_size:
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _generate_gemini(prompt, room_png, product_png):
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=_env("GEMINI_API_KEY"))
    parts = [
        types.Part.from_text(text=prompt),
        types.Part.from_bytes(data=room_png, mime_type="image/png"),
    ]
    if product_png:
        parts.append(types.Part.from_bytes(data=product_png, mime_type="image/png"))

    response = client.models.generate_content(
        model=_env("GEMINI_IMAGE_MODEL") or DEFAULT_GEMINI_MODEL,
        contents=[types.Content(role="user", parts=parts)],
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )

    for candidate in response.candidates or []:
        for part in (candidate.content.parts if candidate.content else []) or []:
            if part.inline_data and part.inline_data.data:
                return part.inline_data.data
    raise ImageAIError("Gemini no devolvió una imagen. Prueba con otra foto o vuelve a intentarlo.")


def _generate_openai(prompt, room_png, product_png):
    from openai import OpenAI

    client = OpenAI(api_key=_env("OPENAI_API_KEY"))
    images = [("espacio.png", room_png, "image/png")]
    if product_png:
        images.append(("producto.png", product_png, "image/png"))

    result = client.images.edit(
        model=_env("OPENAI_IMAGE_MODEL") or DEFAULT_OPENAI_MODEL,
        image=images,
        prompt=prompt,
        size="auto",            # respeta la proporción de la foto del cliente
        input_fidelity="high",  # conserva mejor los detalles del producto
        quality=_env("OPENAI_IMAGE_QUALITY") or "medium",
    )
    data = result.data[0] if result.data else None
    if not data or not data.b64_json:
        raise ImageAIError("OpenAI no devolvió una imagen. Vuelve a intentarlo.")
    return base64.b64decode(data.b64_json)


def _friendly_error(provider, error):
    text = str(error).lower()
    name = "Gemini" if provider == "gemini" else "OpenAI"
    key = f"{provider.upper()}_API_KEY"
    if "api key" in text or "api_key" in text or "401" in text or "unauthorized" in text:
        return f"La API key de {name} no es válida. Revisa {key} en el archivo .env."
    if "verif" in text and provider == "openai":
        return "Tu organización de OpenAI debe estar verificada para usar gpt-image-1 (ver README)."
    if "free_tier" in text and "limit: 0" in text:
        return (
            f"El plan gratuito de {name} no incluye generación de imágenes. "
            "Activa la facturación del proyecto (ver README, paso 3 de la guía de Gemini)."
        )
    if "quota" in text or "429" in text or "rate" in text or "exhausted" in text:
        return f"Se agotó la cuota de {name} o falta activar la facturación. Revisa tu cuenta."
    if "billing" in text or "permission" in text or "403" in text:
        return f"La cuenta de {name} no tiene permisos o facturación habilitada para generar imágenes."
    if "not found" in text or "404" in text:
        return f"El modelo configurado para {name} no existe o no está disponible en tu cuenta."
    return "No se pudo generar el mockup. Intenta más tarde."


def generate_mockup(room_file, product, product_image_path=None, options=None):
    """Devuelve los bytes PNG del mockup generado."""
    provider = active_provider()
    if not provider or not _env(f"{provider.upper()}_API_KEY"):
        raise ImageAIError(
            "La generación con IA no está configurada. Añade GEMINI_API_KEY u OPENAI_API_KEY "
            "en el archivo .env (ver README).",
            status=503,
        )

    try:
        room_png = _to_png_bytes(room_file)
    except Exception:
        raise ImageAIError("El archivo subido no es una imagen válida.", status=400)

    product_png = None
    if product_image_path and os.path.exists(product_image_path):
        product_png = _to_png_bytes(product_image_path, max_size=768)

    prompt = build_prompt(product, options)

    try:
        if provider == "gemini":
            data = _generate_gemini(prompt, room_png, product_png)
        else:
            data = _generate_openai(prompt, room_png, product_png)
    except ImageAIError:
        raise
    except Exception as error:
        raise ImageAIError(_friendly_error(provider, error)) from error

    try:
        Image.open(BytesIO(data)).verify()
    except Exception:
        raise ImageAIError("El proveedor devolvió datos que no son una imagen válida.")
    return data
