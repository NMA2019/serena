---

Toutes les modifications notables de SERENA sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et

le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Unreleased]

### Modifié

- Découpage et modularisation de `serena.html` : extraction des styles vers `styles.css` et de la logique applicative vers `app.js`.
- Mise à jour du Service Worker `sw.js` (cache `serena-v1.2.2`, version 3) pour pré-cacher `styles.css` et `app.js` dans l'App Shell offline.

### Corrigé

- La page `serena.html` utilise le manifeste et le service worker statiques du dépôt.
- Les chemins du manifeste, du cache hors-ligne et des icônes correspondent aux fichiers présents.
- Les icônes PWA utilisent les PNG de `assets/`.

## [1.2.0] — 2026-09-26

> **Fusion index_bk.html + index.html — Version stabilisée, prête pour usage personnel**

### Ajouté

- **Palette alignée sur le logo officiel** : violet `#4A2B7A`), rose

  `#F5A9C4`), vert feuille `#8FB886`). Design tokens centralisés dans

  `:root` avec support complet du mode sombre.

- **SVG sprite** intégré : logo (couleur, monochrome, compact) + 9 icônes

  de navigation, réutilisables via `<use href="#...">`.

- **Sécurité renforcée** : hachage PIN avec PBKDF2 (150 000 itérations,

  SHA-256, sel aléatoire 16 octets) au lieu de SHA-256 simple.

- **Chiffrement AES-GCM 256 bits** : infrastructure de dérivation de clé

  depuis le PIN `S.crypto.deriveAesKey`), `encrypt` / `decrypt` prêts.

- **Auto-tests intégrés** (8 tests) : prédiction cycle, fenêtre fertile,

  crypto PIN, AES-GCM, dates, implant, analyse thermique, XSS.

- **Indicateur hors-ligne** discret en haut de l'écran.

- **Mode médecin amélioré** : sélection des sections à inclure dans le

  rapport PDF (8 sections).

- **Export JSON versionné** : marqueur `__serena__` + version de schéma

  `SCHEMA_VERSION = 12`).

- **Import JSON** symétrique, avec confirmation.

- **Onboarding en 5 étapes** : Bienvenue → Confidentialité → Profil →

  Implant → PIN.

- **Fenêtre fertile corrigée** : méthode symptothermique J-19 à J-13

  (au lieu de J-18 à J-11).

- **Phase lutéale configurable** (8 à 20 jours, défaut 14).

- **Régularité du cycle** : écart-type + label (très régulier / régulier /

  irrégulier).

- **Détection de la hausse thermique** normalisée en °C (seuil 0,2 °C sur

  3 jours vs 3 jours précédents).

- **Conseils grossesse** : 11 tranches (1-4 SA à 41+ SA), bug `41+` corrigé.

- **10 jalons de grossesse** avec statut `done` / `upcoming`.

- **Badges implant** : Actif / Bientôt / Expiré / Retiré avec code couleur.

- **Contractions** : chronomètre + statistiques (durée moyenne, intervalle

  moyen, tendance : accélération / ralentissement / stable).

- **Notifications navigateur** : rappels quotidiens + alertes implant à

  90, 30, 7 et 1 jour.

- **PWA** : manifest généré dynamiquement, tentative de Service Worker

  (Blob URL — voir limitations).

- **i18n** : dictionnaires complets FR + EN (~200 clés).

- **Thème** : Light / Dark / System avec `prefers-color-scheme`.

- **Accessibilité** : focus trap dans les modales, fermeture par Échap,

  `aria-*` sur tous les composants interactifs, `prefers-reduced-motion`.

- **Échappement HTML systématique** `S.escapeHtml`) sur toutes les

  injections de données utilisateur.

- **Dates en serial UTC** : zéro dérive de fuseau horaire.

### Modifié

- **Architecture** : passage à un découpage en 7 blocs logiques au sein du

  même `<script>`, facilitant la lecture et la maintenance.

- **Stockage** : IndexedDB comme stockage principal `SERENA_DB`, version 2),

  localStorage en fallback `serena_fallback_v12`).

- **Calcul du prochain cycle** : la fonction `predictNextPeriod` ne saute

  plus un cycle en cas de retard (boucle `while` + détection `isLate`).

- **Calcul de l'expiration d'implant** : `setFullYear` + ajustement fin de

  mois (ex. 31 janv + 1 mois → 28/29 févr) au lieu de `365 * n`.

- **Chiffrement du PIN** : PBKDF2 150 000 itérations (vs SHA-256 simple en

  V1.0).

- **Export PDF** : `window.print()` + CSS print au lieu de jsPDF depuis

  CDN (suppression de la dépendance externe).

- **Navigation** : tabbar mobile (5 onglets) + sidebar desktop (14 entrées).

- **Modales** : bottom sheet sur mobile, dialogue centré sur desktop,

  focus trap intégré.

### Corrigé

- **Fenêtre fertile incorrecte** (V1.1) : J-18 à J-11 → J-19 à J-13.

- **Bug `41+`** dans `PREGN_TIPS` : parsing `'41+'.replace('+','-999')`

  produisait `NaN`, la tranche 41+ n'était jamais atteinte.

- *`nextPeriodStart` sautait un cycle** (V1.0) : formule `Math.ceil` peu

  fiable remplacée par une boucle `while`.

- **Analyse thermique mélangeait °C et °F** (V1.0) : normalisation en °C

  systématique avant analyse.

- **Auto-tests polluaient `settings`** (V1.1) : plus d'écriture en base

  lors des tests.

- *`finishSetup` créait des doublons** (V1.0) : flag anti-doublon via

  `pendingImplant` + vérification.

- *`toggleDay` fusionnait mal les périodes** (V1.0) : logique validée,

  pas de chevauchement.

- **XSS via `innerHTML`** : toutes les données utilisateur passent par

  `escapeHtml()`.

- *`user-scalable=no`** retiré : zoom navigateur autorisé (WCAG 1.4.4).

- **Contraste `--muted`** : `#888` → `#6B6B6B` (AA minimum).

### Supprimé

- **Dépendance jsPDF via CDN** (V1.0) : remplacée par `window.print()`.

- *`maximum-scale=1.0`** dans le viewport meta : anti-accessibilité.

- **Comptes de démonstration persistants** : nettoyage automatique avant

  chargement.

### Sécurité

- PIN haché avec **PBKDF2** (150 000 itérations, SHA-256, sel 16 octets).

- **AES-GCM 256 bits** dérivé du PIN pour le chiffrement des données

  (infrastructure prête, activation en V1.3).

- **Détection XSS** via échappement systématique.

- **Aucune donnée transmise** à un serveur : tout reste en local.

- **Auto-lock** configurable (Jamais / 1 / 5 / 15 / 30 min) avec

  `visibilitychange` pour contourner le throttling des timers.

- **Effacement total** protégé par double confirmation.

- **Export JSON sans le PIN** ni son hash.

### Limitations connues

- **PWA de la version 1.2.0** : le Service Worker via Blob URL était refusé par

  les navigateurs modernes. Cette limitation est corrigée dans la section

  [Unreleased] avec `sw.js` et `manifest.json` statiques.

- **WebAuthn partiel** : aucun credential n'est enregistré automatiquement.

- **Chiffrement AES non activé** : infrastructure prête mais les champs

  de notes ne sont pas encore chiffrés au repos.

- **Icône PWA en SVG data-URI** : Chrome préfère PNG 192 et 512.

---

## [1.1.0] — 2026-09-15

> **Version IndexedDB + i18n + Thème**

### Ajouté

- Stockage **IndexedDB** `SERENA_DB`, version 1)

- **i18n FR/EN** (~200 clés)

- **Thème** Light / Dark / System

- **Hachage PIN** avec PBKDF2 (150 000 itérations)

- **Modules** : fertilité, température, journal, sexualité, implant,

  grossesse, contractions, rendez-vous, rappels, rapports

- **Export PDF** via `window.print()`

- **Export/Import JSON** versionné

- **Auto-tests** (5 tests)

- **Données de démonstration** avec marqueur `[DEMO]`

- **Navigation** : tabbar mobile + sidebar desktop

- **Accessibilité partielle** : `focus-visible`, `aria-`*, `role`

### Modifié

- Architecture mono-fichier avec namespace `SERENA`

- Dates en serial UTC

### Corrigé

- Divers bugs de rendu

### Connu à l'époque

- Fenêtre fertile incorrecte (J-18 à J-11) — **corrigé en V1.2**

- Auto-tests polluaient `settings` — **corrigé en V1.2**

---

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

---

## Format des versions

- **MAJEUR** : changement de schéma de données incompatible, refonte

  architecturale

- **MINEUR** : ajout de fonctionnalités rétrocompatibles

- **PATCH** : corrections de bugs rétrocompatibles

### Version de schéma

La version de schéma des exports JSON est exposée via `S.SCHEMA_VERSION`.

| Version SERENA | Version schéma |

|---|---|

| 1.0.0 | (pas de versionnage) |

| 1.1.0 | 1 |

| 1.2.0 | 12 |

---

## Politique de support

- **Version stable** : la plus récente (V1.2.0)

- **Versions obsolètes** : non supportées

- **Compatibilité descendante** : les exports JSON V1.1 sont importables en

  V1.2 (conversion automatique)

---

## Liens

- [README.md](README.md) — Documentation principale

- [LICENCE.md](LICENCE.md) — Licence