# Enregistrer les commandes dans Google Sheets

Le site fonctionne **sans configuration** : si rien n'est branché, le bouton
« Envoyer ma commande » ouvre un email pré-rempli vers `raph@veracruz.be`.

Pour recevoir les commandes directement dans une feuille Google Sheets, suivez
ces 5 étapes (10 minutes, une seule fois).

## 1. Créer la feuille
Créez un nouveau Google Sheets. En ligne 1, mettez les en-têtes :

```
date | name | email | phone | message | order | total
```

## 2. Ouvrir Apps Script
Dans le menu : **Extensions > Apps Script**.

## 3. Coller ce script
Effacez le contenu et collez :

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([d.date, d.name, d.email, d.phone, d.message, d.order, d.total]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Enregistrez (icône disquette).

## 4. Déployer
- Cliquez **Déployer > Nouveau déploiement**.
- Type : **Application Web**.
- « Exécuter en tant que » : **moi**.
- « Qui a accès » : **Tout le monde**.
- Cliquez **Déployer**, autorisez l'accès, puis **copiez l'URL** de
  l'application web (elle finit par `/exec`).

## 5. Brancher le site
Ouvrez `index.html`, trouvez la ligne :

```javascript
const SHEET_WEBHOOK_URL = "";
```

et collez votre URL entre les guillemets :

```javascript
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/XXXX/exec";
```

C'est tout. Chaque commande apparaîtra automatiquement dans la feuille.

---

## Héberger le site (gratuit)
`index.html` est un fichier autonome. Pour le mettre en ligne :
- **Netlify Drop** (netlify.com/drop) : glissez le fichier, lien immédiat.
- **GitHub Pages**, **Cloudflare Pages**, **Vercel** : tous gratuits.
Aucune base de données ni serveur n'est nécessaire.
