/**
 * Vin de Source — réception des commandes du site dans Google Sheets (2026-v2).
 *
 * Une ligne par commande : date, nom, email, téléphone, message,
 * puis une colonne par vin et par format (cartons / bouteilles), et le total.
 * Auto-correcteur : remet la ligne d'en-têtes d'aplomb si besoin.
 * Email récapitulatif à chaque commande.
 *
 * POUR TESTER SANS LE SITE : dans la barre du haut, sélectionne la fonction
 * "testCommande" puis clique "Exécuter". Une ligne TEST doit apparaître dans
 * la feuille (aucun email n'est envoyé pour ce test).
 *
 * APRÈS TOUTE MODIF DU CODE : Déployer > Gérer les déploiements >
 * (crayon) Modifier > Version : NOUVELLE VERSION > Déployer. L'URL ne change pas.
 */

// Adresse(s) qui reçoivent l'alerte de commande (séparées par des virgules).
var NOTIFY_EMAIL = "rhombroeck@gmail.com";

// Nom de l'onglet où écrire les commandes (sinon le premier onglet).
var SHEET_NAME = "Commande";

// Colonnes vins : id du site + format -> titre de colonne. Même ordre que sur le site.
var WINE_COLUMNS = [
  ["vin-de-source:carton",  "Vin de Source (cartons)"],
  ["pipelettes:carton",     "Les Pipelettes (cartons)"],
  ["petit-bocq:carton",     "Petit Bocq (cartons)"],
  ["petit-bocq:bouteille",  "Petit Bocq (bouteilles)"],
  ["barolo:carton",         "Barolo 7 Cascine (cartons)"],
  ["barolo:bouteille",      "Barolo 7 Cascine (bouteilles)"],
  ["la-gemiere:carton",     "La Gémière (cartons)"],
  ["la-gemiere:bouteille",  "La Gémière (bouteilles)"],
  ["vessigaud:carton",      "Mâcon Vessigaud (cartons)"],
  ["vessigaud:bouteille",   "Mâcon Vessigaud (bouteilles)"],
  ["vollereaux:carton",     "Vollereaux (cartons)"],
  ["vollereaux:bouteille",  "Vollereaux (bouteilles)"]
];

var HEADERS = ["date", "name", "email", "téléphone", "message"]
  .concat(WINE_COLUMNS.map(function (c) { return c[1]; }))
  .concat(["total"]);

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

// Remet la ligne 1 d'aplomb si elle ne correspond pas aux colonnes attendues.
function ensureHeaders(sheet) {
  var range = sheet.getRange(1, 1, 1, HEADERS.length);
  var current = range.getValues()[0].map(String);
  if (current.join("|") !== HEADERS.join("|")) {
    range.setValues([HEADERS]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function writeOrder(d, sendMail) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet();
    ensureHeaders(sheet);

    // Quantités par vin/format, total recalculé à partir des lignes.
    var qty = {}, cents = 0;
    (Array.isArray(d.items) ? d.items : []).forEach(function (it) {
      var key = it.id + ":" + it.format;
      var q = Number(it.qty) || 0;
      qty[key] = (qty[key] || 0) + q;
      cents += Math.round(q * Number(it.unit) * 100);
    });
    var total = cents / 100;

    var row = [new Date(), safe_(d.name), safe_(d.email), safe_(d.phone), safe_(d.message)]
      .concat(WINE_COLUMNS.map(function (c) { return qty[c[0]] || 0; }))
      .concat([total]);
    sheet.appendRow(row);

    if (sendMail && NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          replyTo: d.email || undefined,
          subject: "Nouvelle commande Vin de Source — " + (d.name || "client"),
          body:
            "Nouvelle commande reçue :\n\n" +
            "Nom : " + d.name + "\n" +
            "Email : " + d.email + "\n" +
            "Téléphone : " + (d.phone || "-") + "\n" +
            "Message : " + (d.message || "-") + "\n\n" +
            (d.order || "") + "\n\n" +
            "Total estimé : " + total.toFixed(2).replace(".", ",") + " €\n"
        });
      } catch (mailErr) { /* l'enregistrement reste fait même si l'email échoue */ }
    }
    return total;
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var total = writeOrder(d, true);
    return json_({ ok: true, total: total });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Ouvre l'URL /exec dans un navigateur : doit afficher {"status":"ok","version":"2026-v2"}.
function doGet() {
  return json_({ status: "ok", version: "2026-v2" });
}

// Test sans le site : ajoute une ligne TEST (pas d'email).
function testCommande() {
  writeOrder({
    name: "TEST", email: "test@example.com", phone: "", message: "ligne de test",
    items: [
      { id: "vin-de-source", format: "carton", qty: 1, unit: 50 },
      { id: "vessigaud", format: "bouteille", qty: 3, unit: 17.85 }
    ]
  }, false);
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
