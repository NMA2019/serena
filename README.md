# SERENA

> **Comprendre son corps. Anticiper. Prendre soin de soi.**

SERENA est une application web de suivi personnel de santé féminine : cycle
menstruel, fertilité, grossesse, contraception par implant, journal quotidien,
température basale, rendez-vous médicaux et rapports pour professionnels de santé.

**Version actuelle : 1.2.2**

> ⚠️ **SERENA n'est pas un dispositif médical.** Elle ne diagnostique rien, ne
> confirme aucune grossesse ni ovulation, et ne remplace en aucun cas l'avis
> d'un professionnel de santé.

---

## Table des matières

- [Caractéristiques](#caractéristiques)
- [Confidentialité](#confidentialité)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture technique](#architecture-technique)
- [Structure du projet](#structure-du-projet)
- [Compatibilité](#compatibilité)
- [Développement](#développement)
- [Limitations connues](#limitations-connues)
- [Feuille de route](#feuille-de-route)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Caractéristiques

### Suivi du cycle

- Enregistrement des règles avec flux (léger / moyen / abondant / spotting)
- Calcul du jour du cycle en temps réel
- Moyenne de la durée du cycle avec niveau de confiance (faible / moyen / élevé)
- Indicateur de régularité (très régulier / régulier / irrégulier)
- Prédiction des prochaines règles (ne saute plus un cycle en cas de retard)

### Fertilité

- **Fenêtre fertile corrigée** : J-19 à J-13 (méthode symptothermique)
- Estimation de l'ovulation (prochaines règles − phase lutéale)
- Phase lutéale configurable (8 à 20 jours, défaut 14)
- Détection de la hausse thermique basale (> 0,2 °C sur 3 jours)
- Avertissement systématique : **pas une méthode contraceptive**

### Grossesse

- Calcul SA / DPA / trimestre à partir de DDR, conception ou DPA fournie
- Suivi de progression (0 à 100 %)
- 10 jalons de suivi (consultations, échographies, dépistages)
- Conseils hebdomadaires (11 tranches, y compris grossesse prolongée)
- Journal de grossesse (humeur, énergie, sommeil, poids)
- Chronomètre de contractions avec statistiques (durée, intervalle, tendance)

### Contraception par implant

- 6 types d'implants préréglés (Implanon, Nexplanon, Jadelle, Sino-Implant II, etc.)
- Calcul précis de la date d'expiration (gestion des fins de mois)
- Badges de statut (Actif / Bientôt / Expiré / Retiré)
- Alertes à 90, 30, 7 et 1 jour de l'expiration
- Historique complet des implants

### Journal quotidien

- Humeur (5 emojis), douleur, énergie, sommeil, libido (échelles 0–10)
- 10 symptômes prédéfinis + champ libre
- Flux menstruel
- Graphique d'évolution configurable (7 / 30 / 90 / 180 / 365 jours)

### Activité sexuelle

- Enregistrement protégé / non protégé
- Contraception utilisée
- Note privée
- Avertissement : ne détermine pas le risque de grossesse

### Rendez-vous et rappels

- RDV médicaux (type, professionnel, établissement, notes)
- Rappels quotidiens avec notifications navigateur
- Vue dédiée aux rappels du jour

### Rapports et exports

- **Export JSON** complet et réimportable (marqueur `__serena__`, versionnage)
- **Rapport PDF** via `window.print()` (mode médecin : sélection des sections)
- Rapport structuré : patiente, cycles, températures, journal, implant, grossesse, contractions, RDV

### Personnalisation

- **i18n** : Français + Anglais (~200 clés)
- **Thème** : Clair / Sombre / Système (respect de `prefers-color-scheme`)
- **Palette** alignée sur le logo officiel (violet, rose, vert feuille)

### Sécurité

- **PIN à 4 chiffres** haché avec PBKDF2 (150 000 itérations, SHA-256, sel aléatoire 16 octets)
- **Chiffrement AES-GCM** dérivé du PIN (infrastructure prête, chiffrement des notes en V1.3)
- **Auto-lock** configurable (Jamais / 1 / 5 / 15 / 30 min)
- Détection de retour sur l'onglet (`visibilitychange`)

### Accessibilité

- Navigation clavier complète
- Focus piégé dans les modales + fermeture par Échap
- `aria-label`, `aria-modal`, `aria-live`, `role` sur les composants interactifs
- Respect de `prefers-reduced-motion`

### PWA (Progressive Web App)

- **Manifeste** statique (`manifest.json`) avec icônes PNG 192×192 et 512×512
- **Service Worker** (`sw.js`) — cache-first pour l'App Shell, stale-while-revalidate pour le reste
- **Shortcuts** : Journal, Température, Règles, Grossesse
- **Share Target** et **Protocol Handlers** (`web+serena`)
- Installation sur écran d'accueil (nécessite HTTPS ou `localhost`)

---

## Confidentialité

**SERENA ne collecte aucune donnée. Aucun serveur. Aucun tracking. Aucune publicité.**

Toutes les données de santé sont stockées **localement** sur l'appareil :

- **IndexedDB** (base `SERENA_DB`, version 2) — stockage principal
- **localStorage** (clé `serena_fallback_v12`) — uniquement si IndexedDB est indisponible
- **localStorage** pour les préférences non sensibles (thème, langue, contraction en cours)

Aucune donnée n'est transmise automatiquement. L'export JSON est **manuel** et
l'utilisatrice en garde le contrôle total.

L'export JSON ne contient **pas** le PIN ni le hash du PIN.

---

## Installation

### Option 1 — Ouverture directe

Télécharger le dossier du projet, puis ouvrir `index.html` dans un navigateur
moderne. ⚠️ Les navigateurs bloquent le manifeste et le Service Worker en
`file://`. Les données restent stockées localement, mais la PWA est dégradée.

### Option 2 — Serveur local (recommandé)

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000

Puis ouvrir http://localhost:8000/index.html. Avec XAMPP, démarrer Apache
puis ouvrir http://localhost/serena/index.html.

Option 3 — Hébergement statique
Déployer le dossier complet sur n'importe quel hébergeur statique (Netlify,
Vercel, GitHub Pages, Cloudflare Pages, etc.). Aucun backend requis.

Pour bénéficier de la PWA complète, servir en HTTPS (obligatoire pour
Service Worker, WebAuthn, Notifications).

Utilisation
Premier lancement
Splash (~1,8 s)

Onboarding en 5 étapes :

💜 Bienvenue

🔒 Confidentialité

👤 Profil (prénom, date de naissance — facultatifs)

💊 Implant (optionnel)

🔐 Création du PIN (4 chiffres, confirmé)

Dashboard

Navigation
Mobile : barre d'onglets en bas (Accueil, Calendrier, Suivi, Grossesse, Profil)

Desktop : barre latérale à gauche (14 entrées)

URL : hash router (#dashboard, #calendar, #pregnancy, etc.)

Actions rapides (dashboard)
🩸 Règles

📓 Journal

🌡️ Température

❤️ Rapport

⏱️ Contractions

📄 Rapport PDF

Ajout de données
Toutes les données se saisissent via des modales (bottom sheet sur mobile,
dialogue centré sur desktop). Les formulaires sont validés côté client :
dates cohérentes, températures 34–42 °C, PIN 4 chiffres, bornes physiologiques.

Sauvegarde et restauration
Paramètres → Données → Exporter : télécharge un JSON horodaté

Paramètres → Données → Importer : fusionne un JSON précédemment exporté

Conseil : exporter régulièrement (changement de téléphone, réinitialisation).

Mode médecin
Rapports → Exporter mon dossier (PDF)

Sélectionner les sections à inclure

Le navigateur ouvre la boîte de dialogue d'impression → "Enregistrer au format PDF"

Architecture technique
Choix fondateurs
Sujet	Choix	Justification
Distribution	Application web statique en 3 fichiers (index.html, assets/css/styles.css, assets/js/app.js)	Séparation claire HTML/CSS/JS, aucun build
Dépendances	Aucune	Zéro CDN, zéro framework, zéro tracking
Stockage	IndexedDB (+ fallback localStorage)	Structuré, scalable, transactionnel
PIN	PBKDF2 150k itérations + sel 16 octets	Standard OWASP 2023
Chiffrement	AES-GCM 256 bits disponible ; notes pas encore chiffrées	Chiffrement authentifié prévu pour les champs sensibles
PDF	window.print() + CSS print	Pas de dépendance externe
Dates	Serial UTC (jours depuis epoch)	Zéro dérive de fuseau
XSS	escapeHtml() systématique	Protection de toutes les injections
PWA	manifest.json + sw.js statiques	Cache offline, installation
Découpage de app.js
Le code JavaScript est organisé en 7 blocs logiques :

Bloc	Rôle
1	Utilitaires DOM & sécurité ($, $$, el, escapeHtml)
2	Dates & i18n (S.dt, S.t, S.applyI18n, dictionnaires FR/EN)
3	Crypto & stockage (S.crypto, IndexedDB, localStorage fallback, toasts, prefs)
4	Algorithmes métier (S.calc.*)
5	UI : router, vues, modales, charts, navigation
6	Formulaires, exports, PWA, démo, notifications
7	Boot, PIN, onboarding, auto-lock
Namespace global
Tout est exposé via window.SERENA (alias S) :
S.$, S.$$, S.el                  // Helpers DOM
S.escapeHtml                     // Anti-XSS
S.dt.*                           // Dates UTC
S.t(key, vars)                   // i18n
S.crypto.hashPin, deriveAesKey   // Crypto
S.dbAdd, S.dbPut, S.dbGetAll     // IndexedDB
S.toast                          // Notifications éphémères
S.calc.*                         // Algorithmes métier
S.VIEWS.dashboard, ...           // Vues
S.navigate, S.renderView         // Router
S.openSheet, S.confirmDialog     // Modales
S.openPeriodForm, ...            // Formulaires
S.exportJSON, S.importJSON       // Exports
S.boot                           // Démarrage

serena/
├── index.html                    # Structure HTML + SVG sprite
├── manifest.json                 # Manifeste PWA
├── sw.js                         # Service Worker
├── assets/
│   ├── css/
│   │   └── styles.css            # Design tokens + composants
│   ├── js/
│   │   └── app.js                # Logique applicative (7 blocs)
│   ├── favicon.ico
│   ├── favicon-96x96.png
│   ├── apple-touch-icon.png
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENCE.md

index.html

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#4A2B7A">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="icon" href="./assets/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="96x96" href="./assets/favicon-96x96.png">
  <link rel="apple-touch-icon" href="./assets/apple-touch-icon.png">
  <link rel="manifest" href="./manifest.json">
  <link rel="stylesheet" href="./assets/css/styles.css">
</head>
<body>
  <!-- SVG sprite (logo + icônes) -->
  <!-- #print-report, #toastwrap -->
  <!-- #screen-splash, #screen-lock, #screen-onboarding -->
  <!-- #app (sidebar + topbar + main + tabbar) -->
  <!-- #modalRoot, #offlineBadge -->
  <script src="./assets/js/app.js"></script>
</body>

styles.css
Design tokens (:root + [data-theme="dark"] + prefers-color-scheme)

Composants : .card, .pill, .cal-day, .overlay, .sheet, .tabbar, .sidebar, .timer-btn

Impression : @media print cible #print-report

Accessibilité : :focus-visible, prefers-reduced-motion

app.js
7 blocs, ~4 200 lignes. Aucune dépendance externe.

Compatibilité
Navigateur	Version minimale	Statut
Chrome / Edge	90+	✅ Complet
Firefox	88+	✅ Complet
Safari (macOS)	15+	✅ Complet
Safari (iOS)	15+	✅ Complet
Chrome Android	90+	✅ Complet
Samsung Internet	15+	✅ Complet
Prérequis techniques :

IndexedDB (fallback localStorage si absent)

Web Crypto API (crypto.subtle) — obligatoire pour le PIN

CSS Grid, CSS Custom Properties

ES2020 (optional chaining, nullish coalescing)

Contexte sécurisé (https:// ou localhost) requis pour :

Notifications

WebAuthn

Service Worker

Installation PWA

Développement
Structure des fichiers
index.html : structure HTML uniquement (SVG sprite + squelette des écrans)

assets/css/styles.css : design tokens + composants (aucun style inline)

assets/js/app.js : logique complète (aucun <script> inline)

Lancer les auto-tests
Paramètres → État technique

8 tests sont exécutés :

Prédiction du prochain cycle
Fenêtre fertile (J-19 → J-13)
Crypto PIN (PBKDF2)
Chiffrement AES-GCM
Dates sans dérive (31 janv + 1 = 1 févr)
Implant +1 mois (31 janv → 28/29 févr)
Détection hausse thermique
Échappement HTML (XSS)
Débogage
Ouvrir la console développeur (F12)

Vérifier window.SERENA (objet global)

S.state : état applicatif complet

S.storageInfo() : état IndexedDB / crypto / quota

S.runSelfTests() : tests asynchrones

Données de démonstration
Paramètres → Données → Charger les données de démonstration

Ajoute : 4 cycles, 10 températures, 10 logs journal, 1 implant, 1 RDV

Marqueur [DEMO] sur toutes les entrées

Effacer les données de démonstration supprime uniquement le tag [DEMO]

Service Worker — point d'attention
Le Service Worker (sw.js) précache actuellement :
const PRECACHE_URLS = [
  './index.html',
  './styles.css',      // ⚠️ à vérifier
  './app.js',          // ⚠️ à vérifier
  './manifest.json',
  './assets/favicon.ico',
  './assets/favicon-96x96.png',
  './assets/apple-touch-icon.png',
  './assets/web-app-manifest-192x192.png',
  './assets/web-app-manifest-512x512.png'
];

⚠️ Les chemins ./styles.css et ./app.js sont à la racine dans sw.js,
mais les fichiers réels sont dans ./assets/css/styles.css et
./assets/js/app.js. Il faut aligner les chemins. Enregistrement SW dans
app.js :

js
navigator.serviceWorker.register('./../sw.js', { scope: './assets' })
→ À ajuster en fonction de l'emplacement final de sw.js.

Limitations connues
PWA
Le Service Worker enregistre sw.js depuis la racine du projet. Il nécessite
un contexte sécurisé : HTTPS en production ou localhost en local.
L'ouverture via file:// ne permet pas au navigateur de charger le manifeste
ni d'enregistrer le Service Worker.

Chemins SW/App Shell
Les chemins de précache dans sw.js doivent être cohérents avec l'arborescence
réelle (./assets/css/styles.css et ./assets/js/app.js). À corriger dans une
prochaine révision.

WebAuthn
L'implémentation biométrique est partielle :

Le bouton "Utiliser la biométrie" apparaît si un credential est configuré

Aucun credential n'est enregistré automatiquement (pas de navigator.credentials.create)

Le déverrouillage biométrique complet reste à implémenter

Chiffrement AES
L'infrastructure est prête (dérivation de clé, encrypt, decrypt) mais
les champs de notes ne sont pas encore chiffrés au repos. Prévu en V1.3.

Notifications
Les rappels utilisent l'API Notification du navigateur :

Fonctionnent uniquement si l'app est ouverte (ou en arrière-plan récent)

Pas de notifications push persistantes (nécessite un serveur)

Vérification toutes les minutes quand l'app est active

Autres
Pas de synchronisation multi-appareils (par choix : local-first)

Pas de mode "post-partum" (retour de couches, allaitement)

Pas de suivi de la glaire cervicale (méthode symptothermique complète)

Feuille de route
V1.3 (prévu)
□ Corriger les chemins du Service Worker (./assets/css/styles.css, ./assets/js/app.js)
□ Chiffrement AES-GCM des notes au repos
□ WebAuthn complet (enregistrement + vérification)
□ Tests unitaires (mini-framework maison)
□ Mode post-partum
□ Suivi de la glaire cervicale
□ Rappels récurrents (ex. "température tous les matins")
V2.0 (exploratoire)
□ Mode partenaire (accès en lecture seule)
□ Export chiffré
□ Synchronisation E2E optionnelle (via serveur tiers)
□ Intégration Apple Health / Google Fit
□ Mode hors-ligne avancé (cache des vues)
Contribution
Rapport de bug
Ouvrir une issue avec :

Version de SERENA (Paramètres → À propos)

Navigateur + version

Système d'exploitation

Étapes de reproduction

Résultat attendu vs observé

Capture d'écran si pertinent

⚠️ Ne jamais joindre un export JSON réel (données médicales intimes).
Utiliser les données de démonstration pour reproduire.

Suggestion
Ouvrir une issue avec le label enhancement.

Pull request
Forker le dépôt

Créer une branche (feature/ma-fonctionnalite)

Respecter le style existant (voir CONTRIBUTING.md)

Tester sur Chrome + Firefox + Safari

Lancer les auto-tests

Ouvrir la PR avec description claire

Licence
Voir LICENCE.md.

En résumé : usage personnel et éducatif autorisé. Toute utilisation
commerciale ou médicale doit faire l'objet d'un accord explicite.

Crédits
Design : palette inspirée du logo officiel SERENA (violet, rose, vert feuille)

Typographie : Fraunces (titres), system-ui (corps)

Développement : projet statique sans dépendance externe

Inspiration : méthodes symptothermiques, recommandations OMS sur la
contraception, cadre légal français sur les données de santé (RGPD)

SERENA — Comprendre son corps. Anticiper. Prendre soin de soi.

text

## CHANGELOG.md

```markdown
# Changelog

Toutes les modifications notables de SERENA sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Modifié

- Documentation (`README.md`, `CONTRIBUTING.md`, `SECURITY.md`) alignée sur la structure réelle du projet en 3 fichiers.

### À corriger (dette technique)

- **`sw.js`** : les chemins de précache `./styles.css` et `./app.js` ne correspondent pas à l'arborescence réelle (`./assets/css/styles.css`, `./assets/js/app.js`).
- **`app.js`** : l'enregistrement `navigator.serviceWorker.register('./../sw.js', { scope: './assets' })` doit être revu en fonction de l'emplacement final de `sw.js`.

## [1.2.2] — 2026-09-26

> **Modularisation complète : HTML / CSS / JS séparés**

### Modifié

- **Découpage de `index.html`** : extraction complète des styles vers `assets/css/styles.css` et de la logique vers `assets/js/app.js`. `index.html` ne contient plus que la structure HTML et le SVG sprite.
- **Retrait des balises `<style>` inline** : plus aucune règle CSS n'est embarquée dans le HTML.
- **Retrait du `<script>` inline** : toute la logique applicative est désormais externalisée.
- **`sw.js`** : mise à jour du cache (`serena-v1.2.2`, version 3) pour pré-cacher `styles.css` et `app.js`. ⚠️ Les chemins doivent être alignés avec l'arborescence réelle.

### Corrigé

- La page `index.html` utilise le manifeste et le service worker statiques du dépôt.
- Les chemins du manifeste et des icônes correspondent aux fichiers présents dans `assets/`.

### Notes

- La logique JavaScript est organisée en 7 blocs logiques dans `app.js`.
- La feuille de styles centralise tous les design tokens et composants dans `styles.css`.

## [1.2.0] — 2026-09-26

> **Fusion index_bk.html + index.html — Version stabilisée, prête pour usage personnel**

### Ajouté

- **Palette alignée sur le logo officiel** : violet (`#4A2B7A`), rose (`#F5A9C4`), vert feuille (`#8FB886`). Design tokens centralisés dans `:root` avec support complet du mode sombre.
- **SVG sprite** intégré : logo (couleur, monochrome, compact) + 9 icônes de navigation, réutilisables via `<use href="#...">`.
- **Sécurité renforcée** : hachage PIN avec PBKDF2 (150 000 itérations, SHA-256, sel aléatoire 16 octets) au lieu de SHA-256 simple.
- **Chiffrement AES-GCM 256 bits** : infrastructure de dérivation de clé depuis le PIN (`S.crypto.deriveAesKey`), `encrypt` / `decrypt` prêts.
- **Auto-tests intégrés** (8 tests) : prédiction cycle, fenêtre fertile, crypto PIN, AES-GCM, dates, implant, analyse thermique, XSS.
- **Indicateur hors-ligne** discret en haut de l'écran.
- **Mode médecin amélioré** : sélection des sections à inclure dans le rapport PDF (8 sections).
- **Export JSON versionné** : marqueur `__serena__` + version de schéma (`SCHEMA_VERSION = 12`).
- **Import JSON** symétrique, avec confirmation.
- **Onboarding en 5 étapes** : Bienvenue → Confidentialité → Profil → Implant → PIN.
- **Fenêtre fertile corrigée** : méthode symptothermique J-19 à J-13 (au lieu de J-18 à J-11).
- **Phase lutéale configurable** (8 à 20 jours, défaut 14).
- **Régularité du cycle** : écart-type + label (très régulier / régulier / irrégulier).
- **Détection de la hausse thermique** normalisée en °C (seuil 0,2 °C sur 3 jours vs 3 jours précédents).
- **Conseils grossesse** : 11 tranches (1-4 SA à 41+ SA), bug `41+` corrigé.
- **10 jalons de grossesse** avec statut `done` / `upcoming`.
- **Badges implant** : Actif / Bientôt / Expiré / Retiré avec code couleur.
- **Contractions** : chronomètre + statistiques (durée moyenne, intervalle moyen, tendance : accélération / ralentissement / stable).
- **Notifications navigateur** : rappels quotidiens + alertes implant à 90, 30, 7 et 1 jour.
- **PWA** : manifest statique + Service Worker statique.
- **i18n** : dictionnaires complets FR + EN (~200 clés).
- **Thème** : Light / Dark / System avec `prefers-color-scheme`.
- **Accessibilité** : focus trap dans les modales, fermeture par Échap, `aria-*` sur tous les composants interactifs, `prefers-reduced-motion`.
- **Échappement HTML systématique** (`S.escapeHtml`) sur toutes les injections de données utilisateur.
- **Dates en serial UTC** : zéro dérive de fuseau horaire.

### Modifié

- **Architecture** : passage à un découpage en 7 blocs logiques dans `app.js`.
- **Stockage** : IndexedDB comme stockage principal (`SERENA_DB`, version 2), localStorage en fallback (`serena_fallback_v12`).
- **Calcul du prochain cycle** : la fonction `predictNextPeriod` ne saute plus un cycle en cas de retard (boucle `while` + détection `isLate`).
- **Calcul de l'expiration d'implant** : `setFullYear` + ajustement fin de mois (ex. 31 janv + 1 mois → 28/29 févr) au lieu de `365 * n`.
- **Chiffrement du PIN** : PBKDF2 150 000 itérations (vs SHA-256 simple en V1.0).
- **Export PDF** : `window.print()` + CSS print au lieu de jsPDF depuis CDN (suppression de la dépendance externe).
- **Navigation** : tabbar mobile (5 onglets) + sidebar desktop (14 entrées).
- **Modales** : bottom sheet sur mobile, dialogue centré sur desktop, focus trap intégré.

### Corrigé

- **Fenêtre fertile incorrecte** (V1.1) : J-18 à J-11 → J-19 à J-13.
- **Bug `41+`** dans `PREGN_TIPS` : parsing `'41+'.replace('+','-999')` produisait `NaN`, la tranche 41+ n'était jamais atteinte.
- **`nextPeriodStart` sautait un cycle** (V1.0) : formule `Math.ceil` peu fiable remplacée par une boucle `while`.
- **Analyse thermique mélangeait °C et °F** (V1.0) : normalisation en °C systématique avant analyse.
- **Auto-tests polluaient `settings`** (V1.1) : plus d'écriture en base lors des tests.
- **`finishSetup` créait des doublons** (V1.0) : flag anti-doublon via `pendingImplant` + vérification.
- **`toggleDay` fusionnait mal les périodes** (V1.0) : logique validée, pas de chevauchement.
- **XSS via `innerHTML`** : toutes les données utilisateur passent par `escapeHtml()`.
- **`user-scalable=no`** retiré : zoom navigateur autorisé (WCAG 1.4.4).
- **Contraste `--muted`** : `#888` → `#6B6B6B` (AA minimum).

### Supprimé

- **Dépendance jsPDF via CDN** (V1.0) : remplacée par `window.print()`.
- **`maximum-scale=1.0`** dans le viewport meta : anti-accessibilité.
- **Comptes de démonstration persistants** : nettoyage automatique avant chargement.

### Sécurité

- PIN haché avec **PBKDF2** (150 000 itérations, SHA-256, sel 16 octets).
- **AES-GCM 256 bits** dérivé du PIN pour le chiffrement des données (infrastructure prête, activation en V1.3).
- **Détection XSS** via échappement systématique.
- **Aucune donnée transmise** à un serveur : tout reste en local.
- **Auto-lock** configurable (Jamais / 1 / 5 / 15 / 30 min) avec `visibilitychange` pour contourner le throttling des timers.
- **Effacement total** protégé par double confirmation.
- **Export JSON sans le PIN** ni son hash.

### Limitations connues

- **Chemins SW** : `sw.js` référence `./styles.css` et `./app.js` à la racine, alors que les fichiers sont dans `./assets/css/` et `./assets/js/`.
- **WebAuthn partiel** : aucun credential n'est enregistré automatiquement.
- **Chiffrement AES non activé** : infrastructure prête mais les champs de notes ne sont pas encore chiffrés au repos.
- **Icône PWA en SVG data-URI** : Chrome préfère PNG 192 et 512 (fournis dans `assets/`).

## [1.1.0] — 2026-09-15

> **Version IndexedDB + i18n + Thème**

### Ajouté

- Stockage **IndexedDB** (`SERENA_DB`, version 1)
- **i18n FR/EN** (~200 clés)
- **Thème** Light / Dark / System
- **Hachage PIN** avec PBKDF2 (150 000 itérations)
- **Modules** : fertilité, température, journal, sexualité, implant, grossesse, contractions, rendez-vous, rappels, rapports
- **Export PDF** via `window.print()`
- **Export/Import JSON** versionné
- **Auto-tests** (5 tests)
- **Données de démonstration** avec marqueur `[DEMO]`
- **Navigation** : tabbar mobile + sidebar desktop
- **Accessibilité partielle** : `focus-visible`, `aria-*`, `role`

### Modifié

- Architecture mono-fichier avec namespace `SERENA`
- Dates en serial UTC

### Corrigé

- Divers bugs de rendu

### Connu à l'époque

- Fenêtre fertile incorrecte (J-18 à J-11) — **corrigé en V1.2**
- Auto-tests polluaient `settings` — **corrigé en V1.2**

## [1.0.0] — 2026-09-01

> **Version initiale — localStorage + SHA-256**

### Ajouté

- Stockage **localStorage** (clé `serena_v2_state`)
- **PIN à 4 chiffres** haché avec SHA-256 simple + sel fixe
- **Onboarding** en 5 étapes
- **Modules** : cycle, journal, grossesse, implant, santé
- **Graphiques canvas** : cycles, température, humeur
- **Export PDF** via jsPDF (CDN Cloudflare)
- **Export JSON** (sans import)
- **Chronomètre de contractions**
- **Détection hausse thermique** (seuil 0,3 °C)
- **Calcul de régularité** par écart-type
- **Timeline des jalons de grossesse**
- **Conseils grossesse** par semaine
- **Badges implant** (Actif / Bientôt / Expiré / Retiré)
- **PWA** : manifest + SW via Blob URL
- **Notifications navigateur**

### Connu à l'époque

- Hash PIN non salé (SHA-256 simple) — **corrigé en V1.2**
- Fenêtre fertile approximative — **corrigée en V1.2**
- Bug `41+` dans `PREGN_TIPS` — **corrigé en V1.2**
- `nextPeriodStart` sautait un cycle — **corrigé en V1.2**
- XSS via `innerHTML` — **corrigé en V1.2**
- jsPDF depuis CDN — **supprimé en V1.2**

## Format des versions

- **MAJEUR** : changement de schéma de données incompatible, refonte architecturale
- **MINEUR** : ajout de fonctionnalités rétrocompatibles
- **PATCH** : corrections de bugs rétrocompatibles

### Version de schéma

La version de schéma des exports JSON est exposée via `S.SCHEMA_VERSION`.

| Version SERENA | Version schéma |
|---|---|
| 1.0.0 | (pas de versionnage) |
| 1.1.0 | 1 |
| 1.2.0 | 12 |
| 1.2.2 | 12 |

## Politique de support

- **Version stable** : la plus récente (V1.2.2)
- **Versions obsolètes** : non supportées
- **Compatibilité descendante** : les exports JSON V1.1 sont importables en V1.2 (conversion automatique)

## Liens

- [README.md](README.md) — Documentation principale
- [LICENCE.md](LICENCE.md) — Licence