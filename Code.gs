/**
 * Vin de Source — réception des commandes du site dans Google Sheets.
 *
 * Ce script :
 *   1. crée automatiquement la ligne d'en-têtes si elle manque ;
 *   2. ajoute chaque commande dans la feuille ;
 *   3. t'envoie un email récapitulatif à chaque nouvelle commande.
 *
 * Installation : voir GOOGLE-SHEET.md (coller, déployer en "Application Web", copier l'URL).
 */

// Adresses qui reçoivent l'alerte de commande (séparées par des virgules).
var NOTIFY_EMAIL = "jhcauwen@yp5.be,jeanpierrekamp20@gmail.com,naim.rahal@gmail.com";

var HEADERS = ["date", "name", "email", "phone", "message", "order", "total"];

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // En-têtes auto si la feuille est vide.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    var d = JSON.parse(e.postData.contents);
    sheet.appendRow([d.date, d.name, d.email, d.phone, d.message, d.order, d.total]);

    // Email de notification (silencieux en cas d'échec).
    try {
      if (NOTIFY_EMAIL) {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: "Nouvelle commande Vin de Source — " + (d.name || "client"),
          body:
            "Nouvelle commande reçue :\n\n" +
            "Nom : " + d.name + "\n" +
            "Email : " + d.email + "\n" +
            "Téléphone : " + (d.phone || "-") + "\n" +
            "Message : " + (d.message || "-") + "\n\n" +
            "Commande : " + d.order + "\n" +
            "Total estimé : " + d.total + " €\n" +
            "Date : " + d.date + "\n"
        });
      }
    } catch (mailErr) { /* on n'interrompt pas l'enregistrement si l'email échoue */ }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Permet de tester l'URL dans le navigateur (doit afficher {"status":"ok"}).
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
