# FIBREA ATELIER — Prototipo de e-commerce

> **Naturaleza ecuatoriana hecha con alma.**
> Piezas que nacen de nuestra tierra y encuentran su lugar en la tuya.

## Sobre el emprendimiento

**FIBREA ATELIER** es una marca ecuatoriana de decoración que une la artesanía local con el diseño
contemporáneo. Trabaja con cuatro materiales:

| Material | Qué aporta |
| --- | --- |
| **Abacá** | Fibra tropical ecuatoriana, resistente, ligera y versátil. Es la base de las piezas. |
| **Papel de abacá** | La fibra transformada en papel artesanal que envuelve cada composición. |
| **Rosa ecuatoriana** | Rosas preservadas que conservan forma y color durante años, sin agua. |
| **Follaje preservado** | Eucalipto, pampas y hojas naturales tratadas para durar. |

**Líneas de negocio**

- **Fibrea Collection**: piezas listas para comprar (floreros y arreglos).
- **Crea tu Fibrea**: el cliente ve la pieza en *su* espacio con IA antes de comprar.
- **Fibrea Atelier**: proyectos a medida para bodas, objetos de diseño y espacios comerciales
  (hoteles, restaurantes, oficinas). Se cotizan por WhatsApp.

**Propuesta de valor**: naturaleza preservada de larga duración · hecho en Ecuador con apoyo a
comunidades · empaque especial de papel de abacá · guía de cuidados incluida.

> Todos estos textos se editan en **`backend/brand.py`**, sin tocar HTML (ver
> [Editar la información de la marca](#editar-la-información-de-la-marca)).

---

## Qué incluye el prototipo

| Página | Ruta | Descripción |
| --- | --- | --- |
| Inicio | `/` | Hero, materiales, colección, teaser de «Crea tu Fibrea», beneficios y Atelier. |
| Descubre | `/descubre` | Historia de la marca, materiales, proceso, cuidados y envíos. |
| Fibrea Collection | `/productos` | Catálogo con filtros y búsqueda, ficha de producto, cantidad y pestañas. |
| Crea tu Fibrea | `/mockup` | Sube una foto de tu espacio y la IA coloca el producto en ella. |
| Checkout | `/checkout` | Tres pasos: envío, pago y confirmación, con resumen del pedido. |
| Confirmación | `/pedido/<id>` | Número de pedido, resumen y botón para continuar por WhatsApp. |
| Admin | `/admin` | Lista de pedidos, métricas y cambio de estado. Protegido con `ADMIN_USER` / `ADMIN_PASSWORD`. |

Además: carrito lateral en todas las páginas, envío gratis desde un monto configurable, botón
flotante de WhatsApp, diseño adaptable a móvil y menú responsive.

**Stack:** Flask + Jinja2 · SQLAlchemy + SQLite · Tailwind (CDN) · Lucide icons ·
Google Gemini u OpenAI para las imágenes.

---

## Ejecutar en local

Requisito: **Python 3.12** (o 3.13).

```bash
# 1. Crear el entorno virtual (solo la primera vez)
py -3.12 -m venv .venv          # Windows
# python3 -m venv .venv         # macOS / Linux

# 2. Activarlo
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear el archivo de configuración
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux

# 5. Ejecutar
python backend/app.py
```

Abrir <http://localhost:5000>.

> Si copias el proyecto a otra computadora, **no copies la carpeta `.venv`**: créala de nuevo
> con los pasos 1 a 3. Un `.venv` copiado apunta al Python de la otra máquina y no arranca.

---

## Generación de imágenes con IA

La página **Crea tu Fibrea** (`/mockup`) envía a la IA dos imágenes: la foto del espacio del
cliente y la foto real del producto. La IA devuelve una imagen del espacio con la pieza colocada.

Puedes usar **Gemini (Google)** u **OpenAI (ChatGPT)**. Basta con configurar uno.

| | Gemini | OpenAI |
| --- | --- | --- |
| Modelo por defecto | `gemini-2.5-flash-image` («Nano Banana») | `gpt-image-1` |
| Dónde se crea la key | Google AI Studio | platform.openai.com |
| ¿Tiene plan gratuito para imágenes? | **No**, requiere facturación activa | No, requiere saldo prepagado |
| Requisito extra | — | Verificar la organización |
| Costo aproximado | ~US$0.04 por imagen | ~US$0.04–0.07 por imagen (calidad media, 1024×1024) |

> Los precios cambian: consulta <https://ai.google.dev/pricing> y <https://openai.com/api/pricing>.
> Para un prototipo, US$5–10 de saldo alcanzan para más de 100 pruebas.

### Opción A: Gemini (recomendada)

1. **Crear la API key**
   - Entra en <https://aistudio.google.com/apikey> con una cuenta de Google.
   - Haz clic en **Create API key**. Elige un proyecto de Google Cloud o crea uno nuevo.
   - Copia la key (empieza con `AIza...`).

2. **Pegarla en `.env`**

   ```env
   IMAGE_PROVIDER=gemini
   GEMINI_API_KEY=AIza...tu_key...
   ```

   Sin comillas ni espacios.

3. **Activar la facturación (obligatorio para imágenes)**
   - El plan gratuito de Gemini tiene cuota **0** para los modelos de imagen. Sin facturación, la
     app muestra: *«El plan gratuito de Gemini no incluye generación de imágenes»*.
   - En AI Studio ve a <https://aistudio.google.com/usage>, o en el listado de API keys haz clic
     en **Set up billing** junto al proyecto.
   - Vincula una tarjeta en Google Cloud Billing. Google suele dar crédito de bienvenida a
     cuentas nuevas.
   - Recomendado: en Google Cloud → **Billing → Budgets & alerts**, crea un presupuesto (por
     ejemplo US$10) para recibir avisos.

4. **Reiniciar el servidor** (`Ctrl+C` y otra vez `python backend/app.py`).

5. **Probar**: abre `/mockup`. Si el aviso amarillo de «IA no configurada» ya no aparece, la key
   se leyó bien. Elige una pieza, sube una foto y pulsa **Ver en mi espacio**. Tarda entre 10 y 30
   segundos.

> **¿Otro modelo?** Si Google publica uno más nuevo, cámbialo sin tocar código:
> `GEMINI_IMAGE_MODEL=nombre-del-modelo` en `.env`.

### Opción B: OpenAI (ChatGPT)

> La suscripción de **ChatGPT Plus no sirve** para la API: la API se paga aparte, en
> platform.openai.com.

1. **Crear una cuenta de API** en <https://platform.openai.com/signup>.
2. **Cargar saldo**: **Settings → Billing → Add payment details**, y agrega crédito (mínimo US$5).
3. **Verificar la organización** (obligatorio para `gpt-image-1`): **Settings → Organization →
   General → Verify Organization**. Se hace con un documento de identidad y puede tardar unos
   minutos en activarse. Sin esto, la app muestra un error de verificación.
4. **Crear la API key**: <https://platform.openai.com/api-keys> → **Create new secret key**. Cópiala
   (empieza con `sk-...`), porque solo se muestra una vez.
5. **Pegarla en `.env`**

   ```env
   IMAGE_PROVIDER=openai
   OPENAI_API_KEY=sk-...tu_key...
   ```

6. **Reiniciar el servidor** y probar en `/mockup`. Cada imagen tarda entre 30 y 50 segundos.

> **Importante:** si en `.env` también hay una `GEMINI_API_KEY`, debes poner
> `IMAGE_PROVIDER=openai`. Sin esa línea, la app usa Gemini.
> Puedes alternar entre proveedores cambiando solo esa línea.

**Calidad y costo** (opcional): `OPENAI_IMAGE_QUALITY=low | medium | high` (por defecto `medium`).
`low` es más barato y rápido para pruebas; `high` da más detalle pero cuesta varias veces más.

> **La descripción del producto importa.** La IA recibe la foto del producto y además el campo
> `ai_description` de `backend/seed.py`. Si la descripción contradice la foto (por ejemplo, dice
> «florero morado» cuando el florero es blanco y las flores son moradas), la IA sigue el texto.
> Describe en inglés, de forma literal, el color del recipiente y de las flores.

### Seguridad de las API keys

- Las keys viven **solo en el servidor** (`.env`). El navegador nunca las ve: el front llama a
  `/api/mockup` y es Flask quien habla con Google u OpenAI.
- `.env` está en `.gitignore`. **Nunca lo subas a GitHub** ni lo compartas por chat.
- Si una key se filtra, revócala en AI Studio o en OpenAI y crea otra.
- En Railway (u otro hosting), carga las variables en el panel **Variables** en vez de subir el
  `.env`.

### Solución de problemas

| Mensaje en la app | Causa | Solución |
| --- | --- | --- |
| «La generación con IA no está configurada» | No hay key en `.env` o no se reinició el servidor | Revisa `.env` y reinicia. |
| «El plan gratuito de Gemini no incluye generación de imágenes» | Proyecto sin facturación | Paso 3 de la opción A. |
| «La API key … no es válida» | Key mal copiada, con comillas o revocada | Cópiala de nuevo. |
| «Tu organización de OpenAI debe estar verificada» | Falta verificar la organización | Paso 3 de la opción B. |
| «Se agotó la cuota…» | Límite por minuto o sin saldo | Espera un minuto o recarga saldo. |
| «El modelo configurado … no existe» | Nombre de modelo incorrecto | Borra `GEMINI_IMAGE_MODEL` / `OPENAI_IMAGE_MODEL` para usar el valor por defecto. |

Estado de la configuración: <http://localhost:5000/api/mockup/status>.

**Consejos para mejores resultados**: fotos horizontales, con buena luz y la superficie donde irá la
pieza despejada. Las imágenes generadas se guardan en `frontend/static/images/mockups/`.

---

## Editar la información de la marca

Todo el contenido está en **`backend/brand.py`**:

- `tagline`, `hero_subtitle`, `story`, `mission`: textos principales.
- `materials`, `process`, `benefits`, `atelier`, `care`: secciones de las páginas.
- `shipping`: costo de envío y monto para envío gratis (lo usan el carrito y el backend).
- `payment_methods`: métodos de pago que aparecen en el checkout.
- WhatsApp, correo e Instagram se leen de `.env` (`WHATSAPP_NUMBER`, `CONTACT_EMAIL`,
  `INSTAGRAM_URL`).

### Fotografías de marca

Mientras no haya fotos, las secciones muestran texturas con la paleta de la marca. Para usar
fotos reales, guárdalas en `frontend/static/images/brand/` con estos nombres y aparecerán solas:

| Archivo | Dónde aparece |
| --- | --- |
| `abaca.webp` | Tarjeta «Abacá» (inicio y Descubre) |
| `papel-abaca.webp` | Tarjeta «Papel de abacá» |
| `rosa-ecuatoriana.webp` | Tarjeta «Rosa ecuatoriana» |
| `follaje.webp` | Tarjeta «Follaje preservado» |
| `historia.webp` | «Nuestra historia» en Descubre |

> Tip: puedes generar estas fotos con la misma API key de Gemini u OpenAI.

### Productos

Los productos se definen en `backend/seed.py` y se sincronizan al arrancar el servidor. Para
agregar uno, pon su foto en `frontend/static/images/products/` y añade una entrada:

```python
{
    "name": "Arreglo Signature M",
    "slug": "arreglo-signature-m",
    "description": "Rosas preservadas, follaje y papel de abacá.",
    "price": 49.00,
    "image": "/static/images/products/arreglo-signature-m.webp",
    "category": "Arreglos Signature",   # las categorías del filtro se crean solas
    "external_url": None,
    "ai_description": "Descripción visual detallada para que la IA respete la pieza.",
    "available": True,
},
```

Recomendaciones de imagen: formato **WebP**, máximo **1200 px** en el lado más largo, comprimida
con [Squoosh](https://squoosh.app/).

---

## Identidad visual

| Token | Color | Uso |
| --- | --- | --- |
| Amazonia | `#4C6971` | Acentos y estados activos |
| Tierra | `#48443D` | Texto |
| Abacá | `#C99B72` | Acentos cálidos, contador del carrito |
| Rosa Atelier | `#C9826F` | Acento complementario |
| Hoja | `#59675A` | Verde complementario |
| Papel | `#F4EFE7` | Fondo general |
| Noche | `#1E1B17` | Hero, footer y botones principales |

Tipografías: **Cormorant Garamond** (títulos) y **Montserrat** (texto). Los tokens están en
`frontend/static/css/styles.css`.

---

## Estructura

```text
backend/
  app.py              rutas de páginas + arranque
  brand.py            ← información del emprendimiento
  config.py           configuración (lee .env)
  seed.py             ← catálogo de productos
  models/             Product, Order, OrderItem
  routes/             products, orders, admin, mockup (API)
  services/image_ai.py  integración Gemini / OpenAI
frontend/
  templates/base.html   nav, carrito, footer (compartidos)
  templates/*.html      páginas
  static/js/main.js     carrito y utilidades compartidas
  static/css/styles.css estilos de marca
```

## Despliegue en Railway (paso a paso)

El proyecto ya está preparado para Railway:

| Archivo | Para qué sirve |
| --- | --- |
| `railway.json` | Comando de arranque, health check y reinicio automático. |
| `Procfile` | Mismo comando de arranque (respaldo). |
| `.python-version` | Fija Python 3.12. |
| `requirements.txt` | Incluye `gunicorn` (servidor) y `psycopg` (PostgreSQL). |

> **¿Por qué PostgreSQL y no SQLite?** En Railway el disco se borra en cada despliegue. Con SQLite
> perderías todos los pedidos cada vez que actualices el sitio. PostgreSQL guarda los datos aparte.

> **Timeout:** un mockup tarda entre 30 y 50 segundos. El arranque usa `--timeout 180` para que el
> servidor no corte la petición a los 30 segundos, que es el valor por defecto de gunicorn.

### Paso 1: Subir el código a GitHub

Railway despliega desde un repositorio de GitHub.

1. Crea una cuenta en <https://github.com> si no tienes una.
2. Crea un repositorio nuevo: **New repository → nombre `fibrea-ecommerce` → Private → Create**.
   No marques «Add a README».
3. En la terminal, desde la carpeta del proyecto:

   ```bash
   git init
   git add .
   git status              # revisa que NO aparezcan .env ni .venv
   git commit -m "FIBREA ATELIER: prototipo e-commerce"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/fibrea-ecommerce.git
   git push -u origin main
   ```

   > Si prefieres no usar la terminal, [GitHub Desktop](https://desktop.github.com/) hace lo mismo
   > con botones: *Add local repository → Publish repository* (marca «Keep this code private»).

   **Importante:** `.env` no debe subirse. Está en `.gitignore`, pero verifícalo en `git status`
   o en la web de GitHub. Si aparece, **no hagas push**: revoca tus API keys y créalas de nuevo.

### Paso 2: Crear el proyecto en Railway

1. Entra en <https://railway.com> y haz clic en **Login → Login with GitHub**.
2. Haz clic en **New Project → Deploy from GitHub repo**.
3. Si no ves tu repositorio, haz clic en **Configure GitHub App** y dale acceso a
   `fibrea-ecommerce`.
4. Selecciona el repositorio. Railway empieza a construir el proyecto. **Es normal que este primer
   despliegue falle o quede incompleto**: todavía faltan la base de datos y las variables.

### Paso 3: Agregar la base de datos PostgreSQL

1. En el lienzo del proyecto haz clic en **+ Create** (o **Create** arriba a la derecha).
2. Elige **Database → Add PostgreSQL**.
3. Aparecerá un segundo recuadro llamado **Postgres**. No hay que configurar nada más en él.

### Paso 4: Configurar las variables de entorno

1. Haz clic en el recuadro de tu **app** (no en el de Postgres) y abre la pestaña **Variables**.
2. Haz clic en **Raw Editor** y pega lo siguiente, reemplazando los valores:

   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=pega-aqui-un-texto-aleatorio-largo
   FLASK_DEBUG=0

   IMAGE_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-...tu_key...
   OPENAI_IMAGE_QUALITY=medium

   ADMIN_USER=admin
   ADMIN_PASSWORD=una-contraseña-segura

   WHATSAPP_NUMBER=593999774777
   CONTACT_EMAIL=hola@fibrea.ec
   INSTAGRAM_URL=https://www.instagram.com/tu_cuenta
   ```

   - `${{Postgres.DATABASE_URL}}` se escribe **tal cual**: Railway lo reemplaza por la dirección
     real de la base de datos.
   - Para generar la `SECRET_KEY`, ejecuta en tu computadora
     `python -c "import secrets; print(secrets.token_hex(32))"` y copia el resultado.
   - `FLASK_DEBUG=0` es obligatorio en producción.
   - Sin `ADMIN_PASSWORD`, el panel `/admin` queda bloqueado.

3. Haz clic en **Update Variables** y luego en **Deploy** (o **Apply changes**). Railway volverá a
   desplegar.

### Paso 5: Generar la URL pública

1. En tu app, ve a **Settings → Networking → Public Networking → Generate Domain**.
2. Si te pide un puerto, deja el que sugiere Railway. La app escucha en la variable `PORT` que
   Railway asigna.
3. Obtendrás una URL del tipo `https://fibrea-ecommerce-production.up.railway.app`.

### Paso 6: Verificar

Abre la URL y revisa, en orden:

1. **Inicio** (`/`): carga con los productos.
2. **Estado de la IA** (`/api/mockup/status`): debe mostrar `"configured": true, "provider": "openai"`.
3. **Crea tu Fibrea** (`/mockup`): genera un mockup. Desde el celular, prueba el botón
   **Usar cámara**.
4. **Compra**: añade un producto, completa el checkout y confirma el pedido.
5. **Admin** (`/admin`): el navegador pide usuario y contraseña; el pedido de prueba debe aparecer.

Si algo falla, abre tu app en Railway → **Deployments → View logs**.

### Paso 7 (opcional): Dominio propio

1. En Railway: **Settings → Networking → Custom Domain** y escribe, por ejemplo,
   `tienda.fibrea.ec`.
2. Railway te mostrará un registro **CNAME**. Créalo en el panel de tu proveedor de dominio (por
   ejemplo NIC.ec, GoDaddy o Cloudflare).
3. El certificado HTTPS se genera solo. La propagación puede tardar desde minutos hasta unas horas.

### Actualizar el sitio

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Describe el cambio"
git push
```

Railway detecta el push y vuelve a desplegar automáticamente, en unos 2 a 3 minutos.

### Costos

Railway cobra por uso. Hay un periodo de prueba con crédito gratuito y luego el plan **Hobby**
(US$5 al mes, con US$5 de uso incluidos), que suele alcanzar para un prototipo con poco tráfico.
Consulta los valores vigentes en <https://railway.com/pricing>. OpenAI se paga aparte, por cada
imagen generada.

### Problemas frecuentes en Railway

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| *Application failed to respond* | La app no arrancó | Revisa **View logs**. Casi siempre falta una variable o `DATABASE_URL` está mal escrita. |
| Error `could not translate host name` o `connection refused` | `DATABASE_URL` no apunta a Postgres | Debe ser exactamente `${{Postgres.DATABASE_URL}}` y el servicio debe llamarse `Postgres`. |
| `/admin` responde «Configura ADMIN_PASSWORD…» | Falta la variable | Agrega `ADMIN_PASSWORD` y vuelve a desplegar. |
| El mockup falla solo en producción | Falta la API key o `IMAGE_PROVIDER` | Revisa `/api/mockup/status` y las variables. |
| Desaparecieron los mockups generados | El disco de Railway se borra en cada deploy | Es esperado: los mockups son temporales y el cliente los descarga. Los pedidos sí se conservan en Postgres. |
| Los pedidos hechos en local no aparecen en Railway | Son bases distintas | Es normal: local usa SQLite y Railway usa Postgres. |

---

## Próximos pasos

1. Pasarela de pago real (Payphone, Kushki o PayPal) en el paso 2 del checkout.
2. Correo de confirmación de pedido.
3. Fotografías reales de marca y más productos (Arreglos Signature, Fibrea Leaf).
4. Guardar los mockups generados en un almacenamiento permanente (Cloudinary o S3).
