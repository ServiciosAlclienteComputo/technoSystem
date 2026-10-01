# TechnoSystem — Sitio web de mantenimiento y soporte técnico

Página web profesional, responsive y de carga rápida para un negocio de
mantenimiento y soporte de computadores. Sin dependencias externas (sin
librerías ni frameworks): HTML + CSS + JavaScript puros.

## Estructura del proyecto

```
├── index.html        ← Contenido principal, textos e iconos (SVG inline)
├── politicas.html    ← Políticas, términos y libro de quejas y reclamos
├── blog/             ← Blog: índice + artículos (HTML puro, sin JavaScript)
├── css/styles.css    ← Estilos (organizados por secciones, usa variables CSS)
├── js/main.js        ← Interacciones y CONFIGURACIÓN (bloque 1 del archivo)
├── assets/           ← Logo JA (logo-ja.svg) y demás imágenes
├── contador-visitas-apps-script.js ← Script de Google para el contador de visitas
├── robots.txt        ← Permite rastrear todo y enlaza el sitemap
├── sitemap.xml       ← Mapa del sitio para Google
└── README.md         ← Esta guía
```

## Cómo verla

Abre `index.html` directamente en el navegador, o para probarla en local:

```bash
# Python
python -m http.server 8080
# o con Node (si tienes npx)
npx serve .
```

Luego visita `http://localhost:8080`.

## Publicar en GitHub Pages

Sube el contenido de esta carpeta directamente a la raíz del repositorio,
incluyendo `index.html`, `politicas.html`, `css/`, `js/`, `assets/`,
`robots.txt` y `.nojekyll`. No subas la carpeta contenedora
`Proyecto predeterminado` como un nivel adicional.

En GitHub, activa **Settings > Pages**, selecciona la rama `main` y la carpeta
`/(root)`. La página quedará disponible en una dirección similar a:
`https://tuusuario.github.io/nombre-del-repositorio/`.

---

## Lo que debes personalizar

### 1. Nombre y datos del negocio
- **Nombre:** busca `TechnoSystem` en `index.html` (aparece en título, navbar,
  footer) y cámbialo por el nombre real.
- **Teléfono:** están en la sección `#contacto` y en el
  footer de `index.html`. El sitio no muestra otro correo: el único correo
  visible es el de quejas y reclamos (abajo).
- **Redes sociales:** en el footer solo está Instagram, con enlace directo a
  `https://www.instagram.com/itstechnosystem_jm/` (cámbialo si usas otra cuenta).
- **Precios:** en la sección `#precios`, edita montos y contenidos de los tres
  planes (están comentados con `EDITA`), y debajo, la lista **"Precio por
  servicio individual"** (7 filas con su propio comentario `EDITA`). La moneda
  mostrada es el **peso
  colombiano (COP)**: si cambias de moneda, actualiza los montos, el texto
  `COP / servicio` de cada plan y la nota bajo los planes.
- **Correo de quejas y reclamos:**
  `JAServicioAlCliente@gmail.com` (aparece en `index.html` —tarjeta
  de contacto y footer— y en `politicas.html`). Si cambias de correo,
  reemplázalo en ambos archivos.
- **Políticas legales:** viven en `politicas.html` y se enlazan desde el footer
  (privacidad, cookies, términos y libro de reclamos). Son un modelo completo
  y coherente con el sitio: ajústalo a la legislación de tu país y, si puedes,
  hazlo revisar por un profesional del derecho antes de publicar.

### 2. WhatsApp
En `js/main.js`, bloque **1. CONFIGURACIÓN**:

```js
whatsapp: {
  numero: "573122698232",  // formato internacional sin "+" ni espacios
  mensajeBase: "Hola, quiero solicitar un servicio de mantenimiento."
}
```

Cambia también los enlaces `https://wa.me/573122698232...` directamente en
`index.html` (aparecen en el hero, la sección de contacto y el botón flotante).

### 3. Colores / identidad visual
Todo el color está en `css/styles.css` dentro de `:root`. Los más
importantes:

```css
--bg: #05070d;        /* fondo oscuro */
--accent: #22d3ee;    /* cian principal */
--accent-2: #818cf8;  /* violeta secundario */
--grad: linear-gradient(135deg, #22d3ee, #818cf8);  /* degradado de marca */
```

---

## Contador de visitas (footer)

El footer muestra **"Visitas: N"** con el total de personas (dispositivos
únicos) que han entrado a la página. El contador es **real**: no hay cifras
inventadas. Mientras no configures el endpoint, el contador **permanece
oculto**.

Se alimenta con **Google Apps Script** (gratis, con tu Gmail, sin servidor):
el script guarda los datos en **una hoja de Cálculo tuya**.

### Instalación (3 minutos)

1. Crea una hoja de cálculo nueva en <https://sheets.google.com>
   (ej.: "TechnoSystem - Visitas").
2. Menú **Extensiones → Apps Script**.
3. Borra el contenido de `Código.gs` y pega **todo** el archivo
   `contador-visitas-apps-script.js`.
4. **Implementar → Nueva implementación → Aplicación web** con:
   *Ejecutar como:* **Yo** · *Quién tiene acceso:* **Cualquier persona**.
5. Autoriza los permisos (tu cuenta te guía; si aparece "no verificado",
   entra a **Avanzado → ir a la aplicación → Permitir**).
6. Copia la URL que termina en `/exec` y pégala en `js/main.js`:

```js
visitasEndpoint: "https://script.google.com/macros/s/AKfy.../exec"
```

7. Recarga la página: el contador ya aparece en el footer.

### Comportamiento

| `CONFIG.visitasEndpoint` | Resultado |
|---|---|
| `""` (vacío, por defecto) | El contador **no se muestra** (sin números falsos). |
| `"https://script.google.com/macros/s/.../exec"` | Cuenta cada navegador una sola vez y muestra el total en el footer. |

Detalles técnicos:

- Cada navegador guarda un ID (`ts_vid`) en `localStorage`; solo la **primera
  visita** de ese dispositivo suma, así que el número representa **personas**,
  no recargas.
- El script devuelve `{ "visitas": 123 }` (JSON). Si `fetch` falla por CORS,
  `js/main.js` reintenta automáticamente con **JSONP** (`&callback=`), que
  Google Apps Script acepta de serie.
- Los datos (ID + fecha) quedan en la pestaña `visitas` de tu hoja: puedes
  verlos, exportarlos o borrarlos; al borrar la celda **A1** el contador
  empieza de cero.
- Usa `LockService` para que dos visitas simultáneas no cuenten doble.
- Para reiniciar el contador: borra la hoja `visitas` o deja `A1` en `0`.

---

## Seguridad del sitio

Sitio **estático** (HTML/CSS/JS): no hay servidor propio, base de datos ni
accesos que un "hacker" pueda romper. Aun así, se aplicaron estas capas:

### Protecciones activas

| Protección | Dónde | Qué impide |
|---|---|---|
| **CSP** (`Content-Security-Policy`) | `<meta>` en `index.html` y `politicas.html` | El navegador carga código **solo** de estos orígenes: el sitio, Google Fonts y tu Apps Script. Un script inyectado por un tercero (XSS) quedaría bloqueado. |
| **Sin estilos/JS en línea** | HTML (sprite con clase `.svg-sprite`) | La CSP puede ser estricta (`sin 'unsafe-inline'`), lo que cierra la puerta clásica de inyección. |
| **Escapado de HTML en reseñas** | `js/main.js` → `escaparHTML()` | Un comentario con `<script>` o `<img onerror=...>` se muestra como texto, nunca se ejecuta. Además: máximo 60 caracteres de nombre y 600 de comentario. |
| **`rel="noopener"`** | todos los `target="_blank"` | Otra pestaña no puede tocar `window` de tu sitio (tabnabbing). |
| **`referrer` restringido** | `<meta name="referrer">` | No se filtra la URL completa a sitios externos, solo el dominio de origen. |
| **Clave del contador** | `CONFIG.visitasClave` ↔ `CLAVE` en el script de Google | Nadie puede inflar el número llamando a la URL `/exec` a suerte: sin la clave, el script no cuenta ni revela nada. |
| **Dominios permitidos** | `DOMINIOS` en el script de Google | Solo cuenta cuando la petición llega desde tu sitio (GitHub Pages o `localhost` en pruebas). |
| **Límites horarios/diarios** | `MAX_NUEVAS_HORA = 40`, `MAX_NUEVAS_DIA = 300` | Un bot no puede inflar el contador: como mucho suma hasta el tope y luego ignora los intentos. |
| **`LockService`** | script de Google | Dos visitas simultáneas no cuentan doble. |
| **Datos anónimos** | hoja de cálculo | En tu hoja solo hay IDs aleatorios + fecha: **cero datos personales** de los visitantes. |

### Cambiar la clave del contador

1. Genera una clave nueva (ej.: `ts-2026-` + letras y números al azar).
2. Cámbiala en `js/main.js` → `CONFIG.visitasClave`.
3. Cámbiala en `contador-visitas-apps-script.js` → `CLAVE` (mismo valor).
4. Vuelve a pegar el script en Apps Script y **Implementar → Implementaciones
   → editar → Implementar** (para que actualice la URL/web app).

### Publicar en otro dominio

- **Apps Script:** agrega el dominio a la lista `DOMINIOS` (sin `https://`).
- **CSP:** si conectas otro backend (`formEndpoint`, `reviewsEndpoint` o un
  contador con otro dominio), agrega ese dominio a `connect-src` en el `<meta>`
  de `index.html` y `politicas.html`; si no, el navegador lo bloqueará.

### Lo que este sitio NO puede proteger (y qué hacer)

- **La cuenta de GitHub** (donde vive el código): activa **verificación en dos
  pasos (2FA)** en https://github.com/settings/security — es lo que realmente
  evita que alguien publique código tuyo.
- **Tu cuenta de Google** (la hoja del contador): activa 2FA también en
  https://myaccount.google.com/security. Solo tú puedes ver esa hoja.
- **La clave `visitasClave` es visible** en el código del sitio (es un sitio
  público): cumple la función de candado contra curiosos/bots, no es
  criptografía. Si alguien la copiara, lo peor que podría hacer es intentar
  inflar el contador, que sigue topeado por los límites horarios/diarios.
- **GitHub Pages no permite cabeceras HTTP** propias (HSTS, X-Frame-Options).
  Si algún día compras dominio propio con Cloudflare o similar, ahí sí se
  pueden añadir desde el panel del proveedor.

---

## Conectar a un backend

El **formulario de solicitud (nombre, teléfono, "Enviar solicitud") fue
retirado del sitio**: hoy las solicitudes se hacen con la calculadora de
presupuesto y los botones de WhatsApp. El código de envío sigue preparado
en `js/main.js` (bloque `if (form)`), por si algún día vuelves a agregar
un formulario `#serviceForm` en el HTML.

La **reseña** (`#reviewForm`) tiene **dos modos** (configurado en `js/main.js`):

| `CONFIG.*` | Comportamiento real |
|---|---|
| `formEndpoint: ""` | *(Solo si vuelves a agregar el formulario de solicitud)* La solicitud se envía abriendo WhatsApp **conversación con tu número** y el mensaje ya escrito (nombre, contacto, servicio, equipo y descripción): la persona solo presiona "Enviar". Si el navegador bloquea la ventana, se navega en la misma pestaña y aparece un enlace de respaldo. Funciona sin servidor. |
| `formEndpoint: "/api/solicitudes"` | *(Solo con el formulario de solicitud)* Envía `POST` en JSON a tu backend con `fetch`. |
| `reviewsPostEndpoint: ""` | La reseña se guarda **dentro de la aplicación** (localStorage del navegador): aparece al instante en el panel, sin WhatsApp, y **solo se permite una por persona** (se valida con el campo "Correo o WhatsApp"). |
| `reviewsPostEndpoint: "/api/resenas"` | Envía `POST` en JSON con la reseña (aplica el límite de una por persona en el backend). |
| `reviewsEndpoint: ""` | El panel muestra las reseñas guardadas en ese navegador. |
| `reviewsEndpoint: "/api/resenas"` | Hace `GET` y pinta las reseñas publicadas para **todos** los visitantes. |

### Qué debe recibir tu backend

**Solicitudes** — *(solo si vuelves a agregar el formulario)* `POST` con
`Content-Type: application/json`:

```json
{
  "nombre": "Juan Pérez",
  "contacto": "312 2698232",
  "servicio": "Limpieza interna del computador",
  "equipo": "Portátil",
  "mensaje": "Mi computador tarda mucho en encender..."
}
```

**Reseñas** — `POST` con `Content-Type: application/json`:

```json
{
  "nombre": "María López",
  "contacto": "maria@correo.com",
  "puntuacion": "5",
  "comentario": "Excelente servicio, quedó como nuevo."
}
```

> El campo `contacto` es el que sirve para aplicar la regla de
> **una reseña por persona** (guárdalo hasheado y crea un índice único).

**Listado de reseñas** — `GET` que devuelva un array:

```json
[
  { "nombre": "María López", "puntuacion": 5, "comentario": "Excelente servicio." }
]
```

### Ejemplo mínimo con Node/Express

```js
app.post("/api/solicitudes", express.json(), (req, res) => {
  const { nombre, contacto, servicio, equipo, mensaje } = req.body;
  // valida los campos y guárdalos (base de datos, correo, Telegram, etc.)
  res.status(201).json({ ok: true });
});

app.post("/api/resenas", express.json(), (req, res) => {
  const { nombre, contacto, puntuacion, comentario } = req.body;
  // 1) hashea "contacto" y verifica que esa persona no tenga otra reseña
  // 2) guarda la reseña con estado "pendiente" y repítela al cliente al moderar
  res.status(201).json({ ok: true });
});

app.get("/api/resenas", (req, res) => {
  // devuelve solo las reseñas con estado "publicada"
  res.json([{ nombre: "María López", puntuacion: 5, comentario: "Excelente servicio." }]);
});
```

### Ejemplo con Google Forms / Formspree / Basin

*(Solo si vuelves a agregar el formulario de solicitud.)* Si usas un
servicio de formularios, pon su URL en `formEndpoint` y ajusta los
nombres de los campos en `js/main.js` para que coincidan con los del
servicio (usa `FormData` en lugar del objeto `data` si es necesario).

Si el servidor responde con estado distinto de 2xx, el formulario muestra un
mensaje de error y sugiere escribir por WhatsApp: nunca finge un envío exitoso.

---

## Sobre las reglas pedidas

- **Sin funciones falsas:** nada simula reparaciones, diagnósticos en vivo ni
  procesos automáticos. El "Checklist de servicio" del hero es texto
  informativo, no una interfaz que simule acciones. Tampoco hay reseñas
  inventadas: no se precargan valoraciones de mentira.
- **Reseñas en la aplicación:** se envían y se muestran en la propia página
  (nada de WhatsApp), quedan guardadas en el navegador del visitante y cada
  persona solo puede publicar **una** (validada por su correo o WhatsApp). La
  persona que publicó una reseña puede **eliminarla** con el botón «Eliminar»
  del panel (solo se muestra en el navegador donde la creó). Para que todas las
  reseñas las vean todos los visitantes, conecta `reviewsEndpoint` /
  `reviewsPostEndpoint` a un backend.
- **Backend pendiente:** el formulario de reseñas y el listado de reseñas
  quedan declarados en `CONFIG` y documentados arriba (el código del
  formulario de solicitud sigue listo en `main.js` por si se re-agrega).
- **Sin cookies de rastreo:** el sitio no usa publicidad ni analítica de
  terceros (declarado en `politicas.html`), lo que evita avisos de cookies
  invasivos y riesgos de retirada por incumplimiento.
- **Fácil de modificar:** textos en el HTML, colores en `:root`, datos en el
  bloque `CONFIG` de `main.js`.
- **Rápida:** cero librerías, cero imágenes pesadas, iconos SVG inline,
  fuente con `display=swap` y JavaScript con `defer`.
- **Responsive:** menú móvil, grids adaptativos y `prefers-reduced-motion`
  para accesibilidad.
- **Auditoría Lighthouse:** 100 en Accesibilidad, Buenas prácticas y SEO
  (tanto `index.html` como `politicas.html`).

## Mantenimiento de contenidos

Las secciones siguen el orden del `index.html`:
`hero → servicios (incluye "Cómo trabajamos") → precios (incluye los datos de contacto con id="contacto" y la calculadora) → trabajos (antes y después) → sobre nosotros → FAQ → reseñas → footer`.
Para agregar un servicio, copia un bloque `<article class="card">` en la
sección `#servicios`. Si quieres ofrecerlo con precio en la calculadora,
agrega también su chip con `data-precio` dentro de `#cotizador`.

### Calculadora de presupuesto (`#cotizador`)

- Es el **único punto de pedido de precios**: se eliminaron la lista
  "Precio por servicio individual" y los botones "Solicitar plan" de los
  paquetes (los planes conservan su precio visible en la tarjeta).
- Los precios de los servicios **no se muestran en la página**: viven solo
  en los atributos `data-precio` de cada chip (en COP, sin puntos) y
  aparecen únicamente en el resultado de la estimación. Si cambias un
  valor, edita el `data-precio` del chip correspondiente.
- El complemento de instalación de programas usa `PRECIO_ADDON` en
  `js/main.js` (valor actual: `15000`).
- Los chips con `data-incluye="1"` desactivan el complemento porque ya lo
  incluyen (Instalación de programas y Plan Premium).
- Todo ocurre en el navegador: no se envía ni se guarda ningún dato.

### Antes y después (`#trabajos`)

- Las imágenes actuales son ilustraciones SVG del resultado de cada
  servicio (no son fotos de clientes).
- Cuando tengas fotos reales: súbelas a `assets/trabajos/` y reemplaza el
  `<svg>` de cada figura por
  `<img src="assets/trabajos/NOMBRE.jpg" alt="Descripción de la foto">`.

### Estado del horario (Abierto / Cerrado)

- Se calcula con la hora real de Colombia (`America/Bogota`) en
  `js/main.js`, bloque `HORARIO`, y se actualiza cada minuto.
- Si cambias el horario, edita `abre`, `cierra`, `abreHora` y `cierraHora`,
  y también los textos visibles de contacto y footer.

### Blog (`blog/`)

- `blog/index.html` lista los artículos: copia una tarjeta
  `<a class="blog-card">` para agregar uno nuevo.
- Para crear un artículo: copia `blog/senales-mantenimiento.html` y cambia
  textos, `title`, `meta description` y el bloque JSON-LD
  (`headline`, `description`, `datePublished`, `mainEntityOfPage`).
- Recuerda agregar la nueva URL a `sitemap.xml`.

### SEO (Google)

- `sitemap.xml`: lista las páginas que Google debe rastrear; actualiza
  `<lastmod>` cuando edites una página.
- `robots.txt`: permite rastrear todo y enlaza el sitemap.
- `index.html` incluye JSON-LD de `LocalBusiness` (horario, teléfono,
  Instagram) y `FAQPage` (las 10 preguntas del FAQ). Si editas una
  pregunta o respuesta del FAQ, cambia también esa en el JSON-LD:
  deben coincidir con lo que se ve en la página.
- El favicon de todas las páginas es `assets/logo-ja.svg`.
