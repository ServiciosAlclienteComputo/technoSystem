/* ============================================================
   TechnoSystem — Script principal
   Estructura:
     1. CONFIGURACIÓN  ← edita este bloque con tus datos reales
     2. Navbar (efecto scroll, menú móvil, enlace activo)
     3. Animaciones de aparición (IntersectionObserver)
     4. Detalles visuales (brillo siguiendo el cursor en tarjetas)
     5. FAQ (acordeón de un solo abierto a la vez)
     6. Formulario de solicitud (opcional: hoy inactivo en el HTML)

   NOTA: No hay simulaciones de reparación ni procesos falsos.
   El formulario de solicitud fue retirado del sitio: este bloque queda
   inactivo hasta que vuelvas a agregar #serviceForm en index.html.
   Mientras tanto, las solicitudes se hacen con la calculadora de
   presupuesto y los botones de WhatsApp (sin backend, sin campos que
   rellenar).
   ============================================================ */

/* ---------- 1. CONFIGURACIÓN ---------- */
const CONFIG = {
  // Número de WhatsApp en formato internacional SIN "+" ni espacios.
  // Ejemplo Colombia: "573122698232"  |  Ejemplo México: "525512345678"
  whatsapp: {
    numero: "573122698232",
    mensajeBase: "Hola, quiero solicitar un servicio de mantenimiento."
  },

  // URL del endpoint que recibirá las solicitudes del formulario.
  // Ejemplo: "/api/solicitudes"  o  "https://tudominio.com/api/solicitudes"
  // Deja "" vacío para que el formulario envíe la solicitud por WhatsApp.
  // Esperado por el backend: POST JSON con { nombre, contacto, servicio, equipo, mensaje }
  formEndpoint: "",

  // Endpoint de reseñas:
  //  - GET → lista las reseñas publicadas para todos los visitantes
  //          (objetos con { nombre, puntuacion, comentario, fecha? }
  //          pintados en #listaResenas).
  // Deja "" vacío (por defecto): las reseñas se guardan DENTRO de la
  // aplicación (localStorage del navegador) y solo las ve esa persona.
  reviewsEndpoint: "",

  // URL a la que se envían las reseñas (POST JSON con
  // { nombre, contacto, puntuacion, comentario }).
  // Deja "" vacío (por defecto): la reseña se guarda en la aplicación
  // y se limita a UNA por persona (por el campo contacto).
  // Si usas backend, aplica el límite allí (índice único por contacto).
  reviewsPostEndpoint: "",

  // Contador de visitas del footer ("Visitas: N").
  // Pega aquí la URL de tu aplicación web de Google Apps Script (se explica
  // paso a paso en el archivo "contador-visitas-apps-script.js" y en README.md).
  // Deja "" vacío (por defecto): el contador permanece OCULTO (nunca muestra
  // números inventados) hasta que conectes el endpoint real.
  // Esperado: GET ...?vid=XXXX&k=CLAVE&o=DOMINIO  →  { "visitas": 123 }
  visitasEndpoint: "https://script.google.com/macros/s/AKfycbwiINpn2-m19EOlUaoo1_OKg_4V3Xug3XqwekXi3hxjtXdaVsLnh2_TfhQwrC_Rl7Uq/exec",

  // Clave de seguridad del contador: debe ser IDÉNTICA a la variable CLAVE
  // del script de Google Apps Script (contador-visitas-apps-script.js).
  // Evita que un tercero "influe" el contador llamando a la URL a suerte.
  // Si la cambias, cámbiala en los DOS lugares y vuelve a implementar el script.
  visitasClave: "ts-2026-k7q4x9m2v"
};

/* ---------- 2. Navbar ---------- */
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

// Sombra de la barra al hacer scroll
const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menú móvil
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});

// Cerrar menú al tocar un enlace o al pulsar Escape
navLinks.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

// Enlace activo según la sección visible
const sections = [...document.querySelectorAll("main section[id]")];
const linkById = (id) => document.querySelector(`.nav-link[href="#${id}"]`);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll(".nav-link.active").forEach((l) => l.classList.remove("active"));
      const link = linkById(entry.target.id);
      if (link) link.classList.add("active");
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- 3. Animaciones de aparición ---------- */
const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((el) => {
  const delay = el.dataset.delay;
  if (delay) el.style.setProperty("--d", `${delay}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
revealItems.forEach((el) => revealObserver.observe(el));

/* ---------- 4. Brillo que sigue al cursor en tarjetas ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
});

/* ---------- 5. FAQ: mantener un solo ítem abierto ---------- */
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});

/* ---------- 6. Formulario de solicitud (opcional, inactivo) ----------
   No existe #serviceForm en el HTML: este bloque no se activa hasta que
   vuelvas a agregar el formulario en index.html. */
const form = document.getElementById("serviceForm");
const statusBox = document.getElementById("formStatus");
const submitBtn = document.getElementById("formSubmit");

const setStatus = (box, msg, type = "") => {
  if (!box) return;
  box.textContent = msg;
  box.className = `form-status ${type}`;
};

// Abre WhatsApp con el mensaje ya escrito, dirigido al número del negocio.
// Estrategia en 3 pasos para que SIEMPRE se abra:
//   1) Pestaña nueva (lo normal).
//   2) Si el navegador bloquea la ventana emergente → misma pestaña.
//   3) Enlace visible en el formulario como respaldo manual.
const abrirWhatsApp = (mensaje, box, textoEstado) => {
  const url = `https://wa.me/${CONFIG.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;

  // Respaldo visible (se dibuja antes de navegar por si acaso)
  if (box) {
    box.className = "form-status info";
    box.innerHTML = `${textoEstado} <a class="status-link" href="${url}" target="_blank" rel="noopener">Haz clic aquí para abrir WhatsApp</a>.`;
  }

  // 1) Intenta pestaña nueva. OJO: no usar "noopener" aquí, porque hace que
  //    window.open devuelva null aunque la ventana sí se haya abierto.
  const win = window.open(url, "_blank");

  if (win) {
    // Se abrió: cortamos la referencia y la traemos al frente
    try { win.opener = null; win.focus(); } catch (_) {}
  } else {
    // 2) Ventana bloqueada → navegamos en esta misma pestaña (siempre funciona)
    window.location.href = url;
  }

  return url;
};

const validators = {
  nombre: (v) => (v.trim().length >= 3 ? "" : "Ingresa tu nombre completo."),
  contacto: (v) =>
    /^[\w.+~-]+@[\w-]+\.[\w.]+$|^[+\d][\d\s()-]{6,}$/.test(v.trim())
      ? ""
      : "Ingresa un teléfono o correo válido.",
  servicio: (v) => (v ? "" : "Selecciona el servicio que necesitas."),
  mensaje: (v) =>
    v.trim().length >= 10 ? "" : "Describe brevemente el problema (mín. 10 caracteres).",
  comentario: (v) =>
    v.trim().length >= 10 ? "" : "Cuéntanos tu experiencia (mín. 10 caracteres).",
  puntuacion: (v) => (v ? "" : "Selecciona una puntuación.")
};

const validateField = (field) => {
  const rule = validators[field.name];
  if (!rule) return true;
  const msg = rule(field.value);
  const wrapper = field.closest(".field");
  const errorBox = wrapper ? wrapper.querySelector(".error") : null;
  if (wrapper) wrapper.classList.toggle("invalid", Boolean(msg));
  if (errorBox) errorBox.textContent = msg;
  return !msg;
};

if (form) {
  // Validación en vivo al salir de cada campo
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) validateField(field);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fields = [...form.querySelectorAll("input, select, textarea")];
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      setStatus(statusBox, "Revisa los campos marcados e intenta de nuevo.", "err");
      form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea")?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    /* --- Opción A: backend configurado (preparada para conectar) --- */
    if (CONFIG.formEndpoint) {
      submitBtn.disabled = true;
      setStatus(statusBox, "Enviando solicitud...", "info");
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        setStatus(statusBox, "¡Solicitud enviada! Te contactaremos muy pronto.", "ok");
      } catch (err) {
        console.error("Error al enviar la solicitud:", err);
        setStatus(statusBox, "No se pudo enviar. Escríbenos por WhatsApp para continuar.", "err");
      } finally {
        submitBtn.disabled = false;
      }
      return;
    }

    /* --- Opción B: sin backend, envío real vía WhatsApp --- */
    const texto = [
      CONFIG.whatsapp.mensajeBase,
      "",
      `*Nombre:* ${data.nombre}`,
      `*Contacto:* ${data.contacto}`,
      `*Servicio:* ${data.servicio}`,
      data.equipo ? `*Equipo:* ${data.equipo}` : "",
      "",
      "*Descripción:*",
      data.mensaje
    ].filter(Boolean).join("\n");

    abrirWhatsApp(
      texto,
      statusBox,
      "Se abrió WhatsApp con tu solicitud lista para enviarla a TechnoSystem. ¿No se abrió?"
    );
    form.reset();
  });
}

/* ---------- 7. Reseñas ---------- */
const reviewForm = document.getElementById("reviewForm");
const reviewStatus = document.getElementById("reviewStatus");
const reviewList = document.getElementById("listaResenas");
const stars = [...document.querySelectorAll(".stars label")];

// Pintar estrellas según la puntuación elegida
const paintStars = (value) => {
  stars.forEach((label, i) => label.classList.toggle("lit", i < value));
};

document.querySelectorAll(".stars input").forEach((radio) => {
  radio.addEventListener("change", () => {
    paintStars(Number(radio.value));
    validateField(radio);
  });
});

if (reviewForm) {
  reviewForm.querySelectorAll('input:not([name="puntuacion"]), textarea').forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) validateField(field);
    });
  });

  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Campos individuales
    const nombreInput = reviewForm.querySelector('input[name="nombre"]');
    const contactoInput = reviewForm.querySelector('input[name="contacto"]');
    const comentInput = reviewForm.querySelector('textarea[name="comentario"]');

    // La puntuación se valida una sola vez (5 radios, un solo grupo)
    const puntuacionField = reviewForm.querySelector(".stars")?.closest(".field");
    const elegida = reviewForm.querySelector('input[name="puntuacion"]:checked');
    const puntuacionMsg = validators.puntuacion(elegida ? elegida.value : "");
    if (puntuacionField) {
      puntuacionField.classList.toggle("invalid", Boolean(puntuacionMsg));
      const errBox = puntuacionField.querySelector(".error");
      if (errBox) errBox.textContent = puntuacionMsg;
    }

    const camposOk = [
      validateField(nombreInput),
      validateField(contactoInput),
      validateField(comentInput)
    ].every(Boolean);

    if (!camposOk || puntuacionMsg) {
      setStatus(reviewStatus, "Revisa los campos marcados e intenta de nuevo.", "err");
      reviewForm.querySelector(".field.invalid input, .field.invalid textarea")?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(reviewForm).entries());

    /* --- Opción A: backend configurado (reseñas compartidas entre todos) --- */
    if (CONFIG.reviewsPostEndpoint) {
      setStatus(reviewStatus, "Publicando reseña...", "info");
      try {
        const res = await fetch(CONFIG.reviewsPostEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        reviewForm.reset();
        paintStars(0);
        setStatus(reviewStatus, "¡Gracias! Tu reseña ya está publicada en esta página.", "ok");
        if (CONFIG.reviewsEndpoint) cargarResenasServidor();
      } catch (err) {
        console.error("Error al enviar la reseña:", err);
        setStatus(reviewStatus, "No se pudo publicar. Inténtalo más tarde.", "err");
      }
      return;
    }

    /* --- Opción B (por defecto): la reseña se guarda DENTRO de la aplicación --- */
    const clave = clavePersona(data.contacto);
    const guardadas = leerResenas();

    // Una sola reseña por persona (identificada por su contacto)
    if (guardadas.some((r) => r.clave === clave)) {
      setStatus(
        reviewStatus,
        "Ya registraste una reseña con ese contacto. Solo se permite una reseña por persona.",
        "err"
      );
      return;
    }

    const nueva = {
      clave,
      nombre: data.nombre.trim().slice(0, 60),
      puntuacion: Number(data.puntuacion),
      comentario: data.comentario.trim().slice(0, 600),
      fecha: new Date().toISOString()
    };
    guardadas.unshift(nueva);

    if (!guardarResenas(guardadas)) {
      setStatus(
        reviewStatus,
        "Tu navegador no permitió guardar la reseña (probablemente modo privado). Permite los datos del sitio e inténtalo de nuevo.",
        "err"
      );
      return;
    }
    // Se recuerda como reseña propia para poder eliminarla después
    guardarClavePropia(clave);

    reviewForm.reset();
    paintStars(0);
    renderReviews(guardadas);
    setStatus(reviewStatus, "¡Gracias! Tu reseña ya está publicada en esta página.", "ok");
  });
}

/* ---------- 8. Reseñas: almacenamiento local y pintado ---------- */
const LS_RESENAS = "technosystem_resenas_v1";
// Huellas de las reseñas creadas EN ESTE navegador: solo esas muestran el
// botón de eliminar (nadie más puede borrar una reseña ajena).
const LS_MIAS = "technosystem_mias_v1";

// Estado inicial del panel (mensaje de "todavía no hay reseñas")
const resenasVacioHTML = reviewList ? reviewList.innerHTML : "";

const leerClavesPropias = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_MIAS) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const guardarClavePropia = (clave) => {
  try {
    const mias = leerClavesPropias();
    if (!mias.includes(clave)) {
      mias.push(clave);
      localStorage.setItem(LS_MIAS, JSON.stringify(mias));
    }
  } catch {
    /* sin almacenamiento: no se recuerda como propia */
  }
};

const olvidarClavePropia = (clave) => {
  try {
    localStorage.setItem(LS_MIAS, JSON.stringify(leerClavesPropias().filter((c) => c !== clave)));
  } catch {
    /* ignorar */
  }
};

const leerResenas = () => {
  try {
    const raw = localStorage.getItem(LS_RESENAS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const guardarResenas = (arr) => {
  try {
    localStorage.setItem(LS_RESENAS, JSON.stringify(arr));
    return true;
  } catch {
    return false;
  }
};

// Huella del contacto: permite limitar a una reseña por persona
// sin guardar el dato de contacto en claro.
const clavePersona = (contacto) => {
  const c = String(contacto || "").trim().toLowerCase().replace(/[\s()+.\-]/g, "");
  let h = 5381;
  for (let i = 0; i < c.length; i++) h = ((h << 5) + h + c.charCodeAt(i)) >>> 0;
  return "p_" + h.toString(36);
};

const escaparHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

const renderReviews = (items) => {
  if (!reviewList || !Array.isArray(items)) return;
  const lista = items.slice(0, 50);

  const countEl = document.getElementById("resenasCount");
  if (countEl) countEl.textContent = `${lista.length} ${lista.length === 1 ? "reseña" : "reseñas"}`;

  // Sin reseñas: se restaura el mensaje inicial del panel
  if (lista.length === 0) {
    reviewList.innerHTML = resenasVacioHTML;
    return;
  }

  // Solo las reseñas creadas en ESTE navegador se marcan como propias
  // (y únicamente cuando no hay backend conectado se ofrece eliminar).
  const mias = new Set(leerClavesPropias());
  const puedeBorrar = !CONFIG.reviewsPostEndpoint;

  reviewList.innerHTML = lista
    .map((r) => {
      const n = Math.min(5, Math.max(0, Number(r.puntuacion) || 0));
      const estrellas = "★".repeat(n) + "☆".repeat(5 - n);
      const nombre = escaparHTML(String(r.nombre ?? "").slice(0, 60));
      const texto = escaparHTML(String(r.comentario ?? "").slice(0, 600));
      const esMia = Boolean(r.clave) && mias.has(r.clave);

      let fecha = "";
      if (r.fecha) {
        try {
          const d = new Date(r.fecha);
          if (!isNaN(d)) {
            fecha = `<span class="review-date">${d.toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}</span>`;
          }
        } catch (_) {}
      }

      // Botón de eliminar: solo para la persona que publicó la reseña
      const boton =
        esMia && puedeBorrar
          ? `<button type="button" class="review-delete" data-clave="${escaparHTML(r.clave)}" aria-label="Eliminar mi reseña">
               <svg class="icon" aria-hidden="true"><use href="#i-trash"/></svg>
               Eliminar
             </button>`
          : "";

      const pie = fecha || boton ? `<div class="review-foot">${fecha}${boton}</div>` : "";

      return `
        <article class="review-item">
          <div class="review-head">
            <span class="review-author">${nombre}</span>
            <span class="review-stars" aria-label="${n} de 5 estrellas">${estrellas}</span>
          </div>
          <p class="review-text">${texto}</p>
          ${pie}
        </article>`;
    })
    .join("");
};

// Eliminar reseña propia (por delegación de eventos en el panel).
// Confirmación en dos pasos dentro del mismo botón (sin diálogos del navegador).
if (reviewList) {
  const restaurarBoton = (b) => {
    b.dataset.confirm = "0";
    b.classList.remove("review-delete--confirm");
    b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-trash"/></svg> Eliminar';
  };

  reviewList.addEventListener("click", (e) => {
    const btn = e.target.closest(".review-delete");
    if (!btn) return;

    // 1er clic: pide confirmación
    if (btn.dataset.confirm !== "1") {
      reviewList
        .querySelectorAll('.review-delete[data-confirm="1"]')
        .forEach((b) => restaurarBoton(b));
      btn.dataset.confirm = "1";
      btn.classList.add("review-delete--confirm");
      btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg> Sí, eliminar';
      return;
    }

    // 2º clic: elimina
    const clave = btn.dataset.clave;
    const restantes = leerResenas().filter((r) => r.clave !== clave);
    if (!guardarResenas(restantes)) {
      setStatus(reviewStatus, "No se pudo eliminar la reseña (almacenamiento bloqueado).", "err");
      return;
    }
    olvidarClavePropia(clave);
    renderReviews(restantes);
  });
}

// Carga inicial: servidor si está conectado, si no, las locales
const cargarResenasServidor = () => {
  fetch(CONFIG.reviewsEndpoint)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then(renderReviews)
    .catch((err) => {
      console.error("No se pudieron cargar las reseñas:", err);
      renderReviews(leerResenas());
    });
};

if (reviewList) {
  if (CONFIG.reviewsEndpoint) {
    cargarResenasServidor();
  } else {
    renderReviews(leerResenas());
  }
}

/* ---------- Extra: año dinámico en el footer ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Extra: contador de visitas (footer) ----------
   Flujo:
   1. El navegador guarda un ID de visitante (ts_vid) la primera vez.
   2. Se pide al endpoint ese ID; el backend devuelve el total de personas.
   3. Si no hay endpoint configurado, el contador se queda oculto:
      NUNCA se muestran cifras inventadas. */
const LS_VISITANTE = "ts_vid";

const obtenerIdVisitante = () => {
  try {
    let vid = localStorage.getItem(LS_VISITANTE);
    if (!vid) {
      vid = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(LS_VISITANTE, vid);
    }
    return vid;
  } catch (_) {
    // Sin localStorage: se usa un ID temporal (no bloquea el contador)
    return "t" + Math.random().toString(36).slice(2, 12);
  }
};

// Apps Script no siempre envía cabeceras CORS: si fetch falla, se reintenta
// con JSONP (mismo endpoint, agregando &callback=...).
const pedirJSONP = (url, alRecibir) => {
  const nombre = "tsVisitasCB" + Date.now();
  const script = document.createElement("script");
  const limpiar = () => {
    try { delete window[nombre]; } catch (_) { window[nombre] = undefined; }
    script.remove();
  };
  window[nombre] = (datos) => { limpiar(); alRecibir(null, datos); };
  script.onerror = () => { limpiar(); alRecibir(new Error("JSONP no disponible")); };
  script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + nombre;
  document.head.appendChild(script);
};

const cargarVisitas = () => {
  const caja = document.getElementById("visitasCaja");
  const totalEl = document.getElementById("visitasTotal");
  if (!caja || !totalEl || !CONFIG.visitasEndpoint) return;

  const url =
    CONFIG.visitasEndpoint +
    (CONFIG.visitasEndpoint.includes("?") ? "&" : "?") +
    "vid=" + encodeURIComponent(obtenerIdVisitante()) +
    "&k=" + encodeURIComponent(CONFIG.visitasClave) +   // clave anti-manipulación
    "&o=" + encodeURIComponent(location.host);           // dominio del sitio

  const pintar = (datos) => {
    const n = Number(datos && datos.visitas);
    if (!Number.isFinite(n) || n < 1) return;   // sin dato válido: no se muestra
    totalEl.textContent = n.toLocaleString("es-CO");
    caja.hidden = false;
  };

  fetch(url, { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then(pintar)
    .catch((err) => {
      console.warn("Contador vía fetch no disponible, se intenta JSONP:", err);
      pedirJSONP(url, (err2, datos) => {
        if (err2) console.warn("Contador de visitas no disponible:", err2);
        else pintar(datos);
      });
    });
};

cargarVisitas();

/* ---------- Extra: estado del horario (Abierto / Cerrado) ----------
   Usa la hora real de Colombia (America/Bogota): lunes a sábado,
   8:00 a.m. a 6:00 p.m. Actualiza la píldora cada minuto en las
   secciones de contacto y del pie de página. */
const HORARIO = {
  zona: "America/Bogota",
  abre: "8:00 a.m.",
  cierra: "6:00 p.m.",
  abreHora: 8,
  cierraHora: 18
};

const actualizarHorario = () => {
  const pilas = document.querySelectorAll(".js-horario");
  if (!pilas.length) return;

  try {
    const partes = new Intl.DateTimeFormat("es-CO", {
      timeZone: HORARIO.zona,
      weekday: "short",
      hour: "numeric",
      hour12: false
    }).formatToParts(new Date());

    const valor = (tipo) => {
      const p = partes.find((x) => x.type === tipo);
      return p ? p.value : "";
    };

    const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
    const dia = dias.indexOf(valor("weekday").toLowerCase().replace(".", ""));
    const hora = parseInt(valor("hour"), 10) % 24;

    // Sin dato fiable (idioma/zona desconocida): la píldora queda vacía
    if (dia === -1 || Number.isNaN(hora)) return;

    const abierto =
      dia >= 1 && dia <= 6 &&
      hora >= HORARIO.abreHora && hora < HORARIO.cierraHora;

    let texto;
    if (abierto) {
      texto = "Abierto ahora · cerramos a las " + HORARIO.cierra;
    } else if (dia === 0) {
      texto = "Cerrado · abrimos el lunes a las " + HORARIO.abre;
    } else if (hora < HORARIO.abreHora) {
      texto = "Cerrado · abrimos hoy a las " + HORARIO.abre;
    } else if (dia === 6) {
      texto = "Cerrado · abrimos el lunes a las " + HORARIO.abre;
    } else {
      texto = "Cerrado · mañana abrimos a las " + HORARIO.abre;
    }

    pilas.forEach((p) => {
      p.textContent = texto;
      p.classList.toggle("abierto", abierto);
      p.classList.toggle("cerrado", !abierto);
    });
  } catch (_) {
    // Navegador sin soporte: la píldora queda vacía sin romper nada
  }
};

actualizarHorario();
setInterval(actualizarHorario, 60000);

/* ---------- Extra: calculadora de presupuesto ----------
   Todo ocurre en el navegador: NO se envía ni se guarda ningún dato.
   Los precios salen de los atributos data-precio del HTML (los mismos
   de la lista de precios de la sección de arriba). Si cambias un
   precio en la lista, cámbialo también en su chip de la calculadora. */
const cotizador = document.getElementById("cotizador");

if (cotizador) {
  const valorEl = document.getElementById("cotValor");
  const enviarEl = document.getElementById("cotEnviar");
  const addonEl = document.getElementById("cotAddon");
  const addonCaja = document.getElementById("cotAddonCaja");
  const addonMsg = document.getElementById("cotAddonMsg");
  const PRECIO_ADDON = 15000; // Instalación de programas (lista de precios)

  const cop = (n) => "$" + n.toLocaleString("es-CO");

  const calcular = () => {
    const servicio = cotizador.querySelector('input[name="cot-servicio"]:checked');
    const equipo = cotizador.querySelector('input[name="cot-equipo"]:checked');
    if (!servicio || !equipo) return;

    const base = Number(servicio.dataset.precio || 0);
    const yaIncluye = servicio.dataset.incluye === "1";

    // El complemento se desactiva si el servicio ya incluye instalación
    addonEl.disabled = yaIncluye;
    addonCaja.classList.toggle("is-off", yaIncluye);
    addonMsg.textContent = yaIncluye
      ? " Este servicio ya incluye la instalación de programas."
      : "";

    const conAddon = addonEl.checked && !yaIncluye;
    const total = base + (conAddon ? PRECIO_ADDON : 0);

    valorEl.textContent = total === 0 ? "Sin costo" : cop(total);

    const detalle = servicio.value + (conAddon ? " + instalación de programas" : "");
    const estimado = total === 0
      ? "diagnóstico sin costo"
      : cop(total) + " COP (valor de referencia)";

    const msg =
      "Hola, quiero cotizar: " + detalle +
      " para un equipo " + equipo.value +
      ". Valor de referencia: " + estimado +
      ". ¿Me confirman el precio final y la agenda?";

    enviarEl.href =
      "https://wa.me/" + CONFIG.whatsapp.numero + "?text=" + encodeURIComponent(msg);
  };

  cotizador.addEventListener("change", calcular);
  calcular();
}
