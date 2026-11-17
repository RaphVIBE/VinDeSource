# Commandes → Google Sheets (2026-v2)

Chaque commande passée sur le site arrive dans la feuille
**« Vin de source 2026-v2 »** (Drive de rhombroeck@gmail.com) et déclenche
un email d'alerte à rhombroeck@gmail.com.

## La feuille
Onglet **Commande**, une ligne par commande :

`date · name · email · téléphone · message · une colonne par vin et par format · total`

Les vins vendus à l'unité ont deux colonnes : `(cartons)` et `(bouteilles)`.
Vin de Source et Les Pipelettes n'ont qu'une colonne `(cartons)`.
Le script remet la ligne d'en-têtes d'aplomb tout seul si elle est abîmée.

L'ancienne feuille « Vin de source 2026 » garde les commandes de l'été.

## Le script
`Code.gs` est la copie du script lié à la feuille (Extensions > Apps Script).
Déploiement : application Web, exécutée en tant que rhombroeck@gmail.com,
accès « Tout le monde ». L'URL est dans `index.html` (`SHEET_WEBHOOK_URL`).

Ouvrir l'URL `/exec` dans un navigateur doit afficher
`{"status":"ok","version":"2026-v2"}`.

### Tester sans le site
Dans Apps Script, choisis la fonction `testCommande` et clique **Exécuter** :
une ligne TEST apparaît (pas d'email).

### Après une modification du code
**Déployer > Gérer les déploiements > (crayon) > Version : Nouvelle version >
Déployer.** L'URL ne change pas.

### Ajouter ou retirer un vin
1. Dans `index.html`, tableau `WINES` (id, nom, prix carton, prix bouteille ou `null`).
2. Dans `Code.gs`, tableau `WINE_COLUMNS` (même id + `:carton` / `:bouteille`).
3. Redéployer le script (voir ci-dessus).
