# Commandes → Google Sheets (V2026) · 5 minutes

Chaque commande passée sur le site arrive dans une feuille Google et déclenche
un email d'alerte. La V2026 gère la vente **au carton de 6 et à la bouteille**.

## La feuille

« **Vin de Source · Commandes V2026** » (dans le Drive de raph@dropno.eu) contient trois onglets :

| Onglet | Contenu |
|---|---|
| **Commandes** | une ligne par commande : N° (2026-001…), date, client, texte de la commande, total, **Statut** (« À traiter » au départ, à faire évoluer à la main : payé, livré…) |
| **Détail** | une ligne par vin et par format (carton / bouteille) : idéal pour un tableau croisé « combien commander chez chaque producteur » |
| **Catalogue** | les prix 2026, pour référence. Les prix affichés sur le site se changent dans `index.html` (tableau `WINES`). |

Si un onglet manque, le script le recrée avec ses en-têtes.

## 1. Coller le script
Dans la feuille : **Extensions > Apps Script**. Efface le contenu par défaut,
colle tout le fichier **`Code.gs`**, vérifie `NOTIFY_EMAIL`, puis enregistre.

## 2. Déployer en application web
- **Déployer > Nouveau déploiement** > roue dentée > **Application Web**.
- *Exécuter en tant que* : **Moi** · *Qui a accès* : **Tout le monde**.
- **Déployer**, puis autoriser (écran « Google n'a pas validé cette appli » :
  *Paramètres avancés* > *Accéder à … (non sécurisé)*, c'est ton propre script).
- **Copie l'URL** (elle se termine par `/exec`). Ouverte dans un navigateur,
  elle doit afficher `{"status":"ok","version":"V2026"}`.

## 3. Brancher le site
Dans `index.html`, remplace l'URL de `SHEET_WEBHOOK_URL` par la nouvelle, puis :

```bash
git add index.html && git commit -m "Branche le Sheet V2026" && git push
```

Tant que l'ancienne URL est en place, les commandes continuent d'arriver dans
l'ancienne feuille (colonne « order » remplie avec le détail), rien ne se perd.

## Ce que le site envoie
```json
{
  "version": "V2026", "date": "...", "name": "...", "email": "...",
  "phone": "...", "message": "...",
  "items": [{ "id": "petit-bocq", "name": "Château Petit Bocq",
              "format": "bouteille", "qty": 3, "unit": 29, "subtotal": 87 }],
  "order": "3 bouteilles · Château Petit Bocq (87 €)",
  "total": 87
}
```
Le script recalcule le total à partir des lignes.

### Test
Sur le site, ajoute un carton et une bouteille, remplis tes coordonnées et
envoie : une ligne dans **Commandes**, deux dans **Détail**, et un email.
