# Brancher les commandes sur Google Sheets — 5 minutes

Le site marche déjà sans rien faire : le bouton ouvre un email pré-rempli.
Ces étapes ajoutent en plus un enregistrement automatique dans une feuille
Google Sheets **et** un email d'alerte à chaque commande.

## 1. Créer la feuille
Va sur **https://sheets.new** (crée une feuille vierge).
Pas besoin de mettre les en-têtes : le script les crée tout seul.
Donne-lui un nom, par ex. « Commandes Vin de Source ».

## 2. Ouvrir l'éditeur de script
Dans la feuille : menu **Extensions > Apps Script**.

## 3. Coller le script
Efface le contenu par défaut, puis colle tout le contenu du fichier
**`Code.gs`** (fourni à côté de ce guide).
Vérifie en haut que `NOTIFY_EMAIL` est bien ton adresse, puis enregistre
(icône disquette ou Cmd+S).

## 4. Déployer en application web
- Clique **Déployer > Nouveau déploiement**.
- Roue dentée > choisis **Application Web**.
- *Description* : « commandes site ».
- *Exécuter en tant que* : **Moi**.
- *Qui a accès* : **Tout le monde**.
- Clique **Déployer**.
- Google demande une autorisation : **Autoriser l'accès** > choisis ton
  compte > (si l'écran « Google n'a pas validé cette appli » apparaît :
  *Paramètres avancés* > *Accéder à … (non sécurisé)* — c'est ton propre
  script, sans risque).
- **Copie l'URL de l'application web** (elle se termine par `/exec`).

Tu peux vérifier : colle cette URL dans un navigateur, tu dois voir
`{"status":"ok"}`.

## 5. Brancher le site
Ouvre `index.html`, repère tout en haut du `<script>` :

```javascript
const SHEET_WEBHOOK_URL = "";
```

et colle ton URL :

```javascript
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfy.../exec";
```

Puis publie la mise à jour :

```bash
cd "/Users/raphael/Documents/Claude/Projects/Projet Vin /Projet Vin"
git add index.html
git commit -m "Branche les commandes sur Google Sheets"
git push
```

Une minute plus tard, chaque commande passée sur le site arrivera
automatiquement dans la feuille, et tu recevras un email.

---

### Astuce test
Sur le site en ligne, ajoute une caisse, remplis tes coordonnées et envoie :
une ligne doit apparaître dans la feuille et un email arriver.
Si rien n'arrive, revérifie que « Qui a accès » est bien sur **Tout le monde**
et que l'URL collée se termine par `/exec`.
