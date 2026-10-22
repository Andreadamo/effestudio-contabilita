/***** API JSON per la Console su GitHub (andreadamo.github.io/effestudio-contabilita) *****/
// Ogni chiamata richiede il PIN amministrazione (lo stesso di EffeOre, letto dal suo foglio Config).
// getInitData, infoCliente, salvaIncassi = pagina "Nuovo incasso" da telefono (incasso.html), stesse funzioni della sidebar.
const CONT_API_FN = ['getConsole', 'getCompensi', 'getGlobale', 'getInitData', 'infoCliente', 'salvaIncassi'];
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
