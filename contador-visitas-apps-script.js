/* ============================================================================
   TECHNOSYSTEM — CONTADOR DE VISITAS (Google Apps Script) — VERSIÓN SEGURA
   ----------------------------------------------------------------------------
   Este archivo NO forma parte del sitio web. Es el "backend" del contador:
   un script gratuito de Google que guarda cuántas personas han visitado
   la página y devuelve el total para mostrarlo en el footer.

   SEGURIDAD (3 barreras contra abuso):
   1) CLAVE: solo responde a peticiones que traen la misma clave que está
      en js/main.js (CONFIG.visitasClave). Sin clave → no cuenta nada.
   2) DOMINIOS: solo cuenta cuando la petición viene de los dominios de la
      lista (se envía el "host" de la página). Otro sitio → rechazado.
   3) LÍMITES: máximo MAX_NUEVAS_HORA cuentas nuevas por hora y
      MAX_NUEVAS_DIA por día → un bot no puede "inflar" el número.
   Además usa LockService (evita dobles conteos simultáneos) y sanitiza
   los parámetros. En la hoja SOLO se guardan IDs aleatorios (sin nombres,
   correos, teléfonos ni nada personal).

   CÓMO INSTALARLO (tarda ~3 minutos, gratis, con tu Gmail):

   1. Ve a https://sheets.google.com y crea una hoja de cálculo nueva.
      (Nombre sugerido: "TechnoSystem - Visitas")

   2. Dentro de la hoja, menú:  Extensiones  →  Apps Script.

   3. Borra el contenido de "Código.gs" y pega TODO este archivo.

   4. Arriba, dale a  Implementar  →  Nueva implementación
      (tipo:  Aplicación web / Web app)

   5. Configura:
        Ejecutar como:      Yo  (tu cuenta de Google)
        Quién tiene acceso: Cualquier persona
      →  Implementar  →  autoriza los permisos (si aparece "no verificado":
         Avanzado → ir a la app → Permitir).

   6. Copia la URL que te entrega (termina en /exec) y pégala en el sitio:
      js/main.js  →  CONFIG.visitasEndpoint = "aquí la URL"

   7. Recarga la página: el contador del footer ya debería mostrarse.

   IMPORTANTE — SI CAMBIAS LA CLAVE:
   La variable CLAVE de aquí DEBE ser idéntica a CONFIG.visitasClave en
   js/main.js. Si cambias una, cambia la otra y vuelve a "Implementar"
   (Implementar → Implementaciones → editar → Implementar de nuevo).

   IMPORTANTE — SI PUBLICAS EN OTRO DOMINIO:
   Agrega el dominio (sin https://) a la lista DOMINIOS. Ej.:
   "tudominio.com" o "arisanti2200-prog.github.io".
   ========================================================================== */

/* ---------------- CONFIGURACIÓN DE SEGURIDAD ---------------- */

// Clave compartida (idéntica a CONFIG.visitasClave en js/main.js)
var CLAVE = "ts-2026-k7q4x9m2v";

// Dominios desde los que SÍ se permite contar (host, sin https://)
var DOMINIOS = [
  "arisanti2200-prog.github.io",
  "localhost:8090",
  "127.0.0.1:8090"
];

// Topes anti-bots: cuentas nuevas por hora y por día
var MAX_NUEVAS_HORA = 40;
var MAX_NUEVAS_DIA = 300;

/* ------------------------------------------------------------ */

/** ¿El dominio de origen está permitido? (localhost sirve con cualquier puerto) */
function dominioPermitido(o) {
  if (!o) return false;
  if (o.indexOf("localhost") === 0) return true;      // pruebas en local
  if (o.indexOf("127.0.0.1") === 0) return true;      // pruebas en local
  return DOMINIOS.indexOf(o) !== -1;                  // dominios de producción
}

/** Se ejecuta en cada visita a la página web (GET). */
function doGet(e) {
  var parametro = (e && e.parameter) || {};

  var vid = String(parametro.vid || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  var k = String(parametro.k || "").slice(0, 64);
  var o = String(parametro.o || "").toLowerCase().slice(0, 100);
  var callback = String(parametro.callback || "").replace(/[^a-zA-Z0-9_$.]/g, "");

  var datos;
  try {
    if (k !== CLAVE) {
      // Sin clave correcta: no se cuenta ni se revela nada
      datos = { error: "no_autorizado" };
    } else if (!dominioPermitido(o)) {
      datos = { error: "dominio_no_permitido" };
    } else {
      datos = contarVisita(vid);
    }
  } catch (err) {
    datos = { error: "error_interno" }; // no se filtra el detalle del error
  }

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(datos) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Cuenta la visita (una sola vez por navegador) y devuelve el total. */
function contarVisita(vid) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // evita que dos visitas simultáneas cuenten doble
  try {
    var props = PropertiesService.getScriptProperties();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName("visitas");
    if (!hoja) {
      hoja = ss.insertSheet("visitas");
      hoja.getRange("A1").setValue(0); // A1 = total de personas únicas
    }

    var total = Number(hoja.getRange("A1").getValue()) || 0;

    // ¿Este navegador ya fue contado antes?
    var yaContado = false;
    if (vid) {
      var ultimaFila = Math.max(hoja.getLastRow(), 1);
      if (ultimaFila >= 2) {
        var ids = hoja.getRange(2, 1, ultimaFila - 1, 1).getValues();
        yaContado = ids.some(function (fila) { return String(fila[0]) === vid; });
      }
    }
    if (yaContado) {
      return { visitas: total };
    }

    // Límites anti-inflado (por hora y por día)
    var consumo = leerConsumo(props);
    if (consumo.nHora >= MAX_NUEVAS_HORA || consumo.nDia >= MAX_NUEVAS_DIA) {
      return { visitas: total, limitado: true };
    }

    // Nueva persona: suma y registra
    var nuevo = total + 1;
    hoja.getRange("A1").setValue(nuevo);
    if (vid) {
      hoja.appendRow([vid, new Date()]); // A = ID aleatorio, B = fecha
    }
    guardarConsumo(props, consumo);
    return { visitas: nuevo };
  } finally {
    lock.releaseLock();
  }
}

/** Lee los contadores de frecuencia (hora actual y día de hoy). */
function leerConsumo(props) {
  var ahora = Date.now();
  var hora = Math.floor(ahora / 3600000);
  var dia = Math.floor(ahora / 86400000);
  var c = { hora: hora, dia: dia, nHora: 0, nDia: 0 };
  try {
    var bruto = props.getProperty("consumo");
    if (bruto) {
      var v = JSON.parse(bruto);
      if (Number(v.hora) === hora) c.nHora = Number(v.nHora) || 0;
      if (Number(v.dia) === dia) c.nDia = Number(v.nDia) || 0;
    }
  } catch (err) { /* dato corrupto: se reinicia solo */ }
  return c;
}

/** Guarda los contadores de frecuencia actualizados. */
function guardarConsumo(props, c) {
  props.setProperty("consumo", JSON.stringify({
    hora: c.hora,
    dia: c.dia,
    nHora: c.nHora + 1,
    nDia: c.nDia + 1
  }));
}
