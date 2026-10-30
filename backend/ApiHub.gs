/***** API JSON per la Console su GitHub (andreadamo.github.io/effestudio-contabilita) *****/
// Ogni chiamata richiede il PIN amministrazione (lo stesso di EffeOre, letto dal suo foglio Config).
// getInitData, infoCliente, salvaIncassi = pagina "Nuovo incasso" da telefono (incasso.html), stesse funzioni della sidebar.
// getProiezione = pagina "Cassa 12 mesi" (cassa.html): legge il tab DASH_DATA del foglio di proiezione.
const CONT_API_FN = ['getConsole', 'getCompensi', 'getGlobale', 'getInitData', 'infoCliente', 'salvaIncassi', 'getProiezione'];
const HUB_EFFEORE_SS = '1k9yNCids2i18RNjSpMzizHQj-Mk_dt_7V-GkY-6MnYE';

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!hubAdminOk_(req.pin)) throw new Error('PIN amministrazione non valido.');
    if (req.fn === 'login') {
      out = { ok: true, data: true };
    } else if (req.fn === 'pagina') {
      out = { ok: true, data: HtmlService.createHtmlOutputFromFile('index').getContent() };
    } else {
      if (CONT_API_FN.indexOf(req.fn) < 0) throw new Error('Funzione non disponibile.');
      const args = Array.isArray(req.args) ? req.args : [];
      out = { ok: true, data: globalThis[req.fn].apply(null, args) };
    }
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function hubAdminOk_(pin) {
  const p = String(pin || '').trim();
  if (!p) return false;
  const c = CacheService.getScriptCache();
  let ref = c.get('hub_admin_pin');
  if (!ref) {
    const v = SpreadsheetApp.openById(HUB_EFFEORE_SS).getSheetByName('Config').getDataRange().getDisplayValues();
    for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() === 'PIN amministrazione') { ref = String(v[i][1]).trim(); break; }
    if (ref) c.put('hub_admin_pin', ref, 600);
  }
  return !!ref && p === ref;
}

// La pagina Google della console (doGet) resta visibile solo al proprietario del foglio,
// anche dal deployment pubblico usato dall'API.
function contabOwner_() {
  try {
    const a = Session.getActiveUser().getEmail();
    return !!a && a === Session.getEffectiveUser().getEmail();
  } catch (err) { return false; }
}

/***** Cassa 12 mesi e allerta crisi (cassa.html) *****/
// Foglio "Effestudio – Proiezione cassa 12 mesi e allerta art. 3 CCII", tab DASH_DATA (tabelle già pronte per la dashboard).
const PROIEZIONE_SS = '1F3s7dg06d9UC4E88ZA2mwfJB6r7SaywgLdh5Bn9iiFA';

function getProiezione() {
  const sh = SpreadsheetApp.openById(PROIEZIONE_SS).getSheetByName('DASH_DATA');
  if (!sh) throw new Error('Tab DASH_DATA non trovato nel foglio di proiezione.');
  const v = sh.getRange('A1:AM60').getDisplayValues();
  // c0..c1 = colonne (0 = A), r1 = prima riga esclusa (indice)
  const block = (c0, c1, r1) => {
    const head = v[0].slice(c0, c1 + 1);
    const rows = [];
    for (let i = 1; i < r1; i++) {
      const r = v[i].slice(c0, c1 + 1);
      if (String(r[0]).trim() !== '') rows.push(r);
    }
    return { head: head, rows: rows };
  };
  return {
    kpi: block(0, 2, 19),          // A:C
    mesi: block(4, 11, 13),        // E:L
    segnali: block(13, 16, 8),     // N:Q
    categorie: block(18, 19, 18),  // S:T
    scostamenti: block(21, 28, 13),// V:AC
    storico: block(30, 33, 13),    // AE:AH
    scadenze: block(35, 38, 60),   // AJ:AM
    letto: Utilities.formatDate(new Date(), 'Europe/Rome', 'dd/MM/yyyy HH:mm')
  };
}
