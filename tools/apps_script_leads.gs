// RESCAR · recepción de leads de la web (Google Apps Script ligado a la hoja «RESCAR · Leads web»).
// Implementar → Nueva implementación → Aplicación web → Ejecutar como: yo · Acceso: cualquier persona.
// Cada lead: fila nueva en la pestaña «Leads» (con enlace directo a WhatsApp) + correo al dueño de la hoja.
const HOJA = 'Leads';
const COLS = ['Fecha', 'Nombre', 'Celular', 'WhatsApp', 'Correo', 'Interés', 'Lote', 'Visita', 'Mensaje', 'Origen', 'Estado', 'Notas'];

function hoja_() {
  const ss = SpreadsheetApp.getActive();
  let h = ss.getSheetByName(HOJA);
  if (!h) {
    h = ss.getSheets()[0].setName(HOJA);
    h.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#0E3A32').setFontColor('#F3EFE6');
    h.setFrozenRows(1);
    h.setColumnWidths(1, COLS.length, 140);
    h.getRange('K2:K').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['nuevo', 'contactado', 'cliente', 'descartado']).build());
    if (ss.getName().indexOf('Sin título') === 0 || ss.getName().indexOf('Hoja de cálculo sin título') === 0) ss.rename('RESCAR · Leads web');
  }
  return h;
}

const limpia_ = (v, n) => String(v || '').slice(0, n || 800).replace(/^[=+\-@]/, "'$&");

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.empresa) return resp_(true);                       // trampa para bots
    let tel = String(d.celular || '').replace(/\D/g, '');
    if (!d.nombre || tel.length < 10 || !d.acepta) return resp_(false);
    if (tel.length === 10) tel = '57' + tel;
    const nombre = limpia_(d.nombre, 80);
    const saludo = 'Hola ' + nombre.split(' ')[0] + ', te escribo de RESCAR Propiedad Raíz por tu solicitud sobre La Virginia' + (d.lote ? ' (lote ' + limpia_(d.lote, 4) + ')' : '') + '. ¿Cuándo te queda bien que hablemos?';
    const wa = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(saludo);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    const h = hoja_();
    h.appendRow([new Date(), nombre, '+' + tel, 'Escribir por WhatsApp', limpia_(d.correo, 120), limpia_(d.interes, 60), limpia_(d.lote, 4),
                 limpia_(d.fecha, 10), limpia_(d.mensaje), limpia_(d.origen, 200), 'nuevo', '']);
    const fila = h.getLastRow();
    h.getRange(fila, 4).setRichTextValue(SpreadsheetApp.newRichTextValue().setText('Escribir por WhatsApp').setLinkUrl(wa).build());
    lock.releaseLock();
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'Nuevo lead RESCAR: ' + nombre + (d.lote ? ' · lote ' + d.lote : ''),
      htmlBody: '<p><b>' + nombre + '</b> · +' + tel + '</p><p>' + limpia_(d.interes, 60) + (d.lote ? ' · lote ' + limpia_(d.lote, 4) : '') +
                (d.fecha ? ' · visita ' + limpia_(d.fecha, 10) : '') + '</p><p>' + limpia_(d.mensaje).replace(/</g, '&lt;') + '</p>' +
                '<p><a href="' + wa + '">Escribirle por WhatsApp</a> · <a href="' + SpreadsheetApp.getActive().getUrl() + '">Abrir panel de leads</a></p>'
    });
    return resp_(true);
  } catch (err) {
    return resp_(false);
  }
}

function doGet() { return resp_(true); }   // prueba de que la implementación responde
function resp_(ok) { return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON); }

// Ejecútala una vez desde el editor para crear la pestaña y autorizar los permisos (hoja y correo).
function configurar() { hoja_(); }
