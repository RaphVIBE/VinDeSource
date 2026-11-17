/**
 * Vin de Source — réception des commandes du site dans Google Sheets (V2026).
 *
 * Onglets (créés automatiquement s'ils manquent) :
 *   - « Commandes » : une ligne par commande (client, total, statut à suivre).
 *   - « Détail »    : une ligne par vin et par format (carton / bouteille),
 *                     pratique pour les totaux à commander chez les producteurs.
 *
 * Chaque commande reçoit un numéro (2026-001, 2026-002…) et déclenche un email.
 * Installation : voir GOOGLE-SHEET.md.
 */

// Adresses qui reçoivent l'alerte de commande (séparées par des virgules).
var NOTIFY_EMAIL = "jhcauwen@yp5.be,jeanpierrekamp20@gmail.com,naim.rahal@gmail.com";

var SAISON = "2026";

var TAB_COMMANDES = "Commandes";
var TAB_DETAIL = "Détail";

var HEADERS_COMMANDES = ["N°", "Date", "Nom", "Email", "Téléphone", "Message", "Commande", "Total (€)", "Statut"];
var HEADERS_DETAIL = ["N°", "Date", "Nom", "Vin", "Format", "Quantité", "Prix unitaire (€)", "Sous-total (€)"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // deux commandes simultanées ne prennent pas le même numéro
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var commandes = getTab_(ss, TAB_COMMANDES, HEADERS_COMMANDES);
    var detail = getTab_(ss, TAB_DETAIL, HEADERS_DETAIL);

    var d = JSON.parse(e.postData.contents);
    var items = Array.isArray(d.items) ? d.items : [];

    // Total recalculé côté serveur à partir des lignes.
    var cents = 0;
    items.forEach(function (it) { cents += Math.round(Number(it.qty) * Number(it.unit) * 100); });
    var total = items.length ? cents / 100 : Number(d.total) || 0;

    var num = SAISON + "-" + ("00" + commandes.getLastRow()).slice(-3); // la ligne 1 = en-têtes
    var date = new Date();

    commandes.appendRow([
      num, date, safe_(d.name), safe_(d.email), safe_(d.phone), safe_(d.message),
      safe_(d.order), total, "À traiter"
    ]);

    if (items.length) {
      var rows = items.map(function (it) {
        var q = Number(it.qty) || 0, u = Number(it.unit) || 0;
        return [num, date, safe_(d.name), safe_(it.name),
                it.format === "bouteille" ? "Bouteille" : "Carton de 6",
                q, u, Math.round(q * u * 100) / 100];
      });
      detail.getRange(detail.getLastRow() + 1, 1, rows.length, HEADERS_DETAIL.length).setValues(rows);
    }

    try {
      if (NOTIFY_EMAIL) {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          replyTo: d.email || undefined,
          subject: "Commande " + num + " · Vin de Source · " + (d.name || "client"),
          body:
            "Nouvelle commande " + num + "\n\n" +
            "Nom : " + d.name + "\n" +
            "Email : " + d.email + "\n" +
            "Téléphone : " + (d.phone || "-") + "\n" +
            "Message : " + (d.message || "-") + "\n\n" +
            (d.order || "") + "\n\n" +
            "Total estimé : " + total.toFixed(2).replace(".", ",") + " €\n"
        });
      }
    } catch (mailErr) { /* l'enregistrement reste fait même si l'email échoue */ }

    return json_({ ok: true, num: num });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Ouvre l'URL /exec dans un navigateur : doit afficher {"status":"ok","version":"V2026"}.
function doGet() {
  return json_({ status: "ok", version: "V" + SAISON });
}

/* ---------- outils ---------- */

function getTab_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3ece2");
    sh.setFrozenRows(1);
  }
  return sh;
}

// Empêche qu'un texte saisi sur le site soit interprété comme une formule.
function safe_(v) {
  if (v === undefined || v === null) return "";
  v = String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
