# Console Contabilità · Effestudio

Pagina di ingresso su GitHub Pages per la Console Contabilità (solo amministrazione).
- PIN amministrazione = stesso PIN di EffeOre (controllo sul server a ogni richiesta).
- I dati non vengono salvati sul dispositivo: ogni numero arriva dal server con il PIN.
- Backend: progetto Apps Script della Contabilità, file `ApiHub.gs`, deployment "API HUB GitHub". Indirizzo in `config.js`.

## Nuovo incasso da telefono (`incasso.html`)
- Stesso PIN amministrazione, stesso backend: chiama `getInitData`, `infoCliente`, `salvaIncassi` (le funzioni della sidebar "Nuovo incasso" del foglio).
- Richiede `backend/ApiHub.gs` aggiornato nel progetto Apps Script + nuova versione del deployment "API HUB GitHub" (stesso URL).
