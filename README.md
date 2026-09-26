# SERENA

> **Comprendre son corps. Anticiper. Prendre soin de soi.**

SERENA est une application web de suivi personnel de santé féminine : cycle
menstruel, fertilité, grossesse, contraception par implant, journal quotidien,
température basale, rendez-vous médicaux et rapports pour professionnels de santé.

**Version actuelle : 1.2.0**

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
- [Structure du fichier](#structure-du-fichier)
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

- **i18n** : Français + Anglais
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

### Option 1 — Serveur local (recommandé)

Télécharger le dossier du projet, puis le servir en HTTP. L'ouverture en
`file://` peut afficher la page, mais les navigateurs bloquent alors le
manifeste et le Service Worker. Les données restent stockées localement dans
le navigateur.

### Option 2 — Serveur local

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Avec XAMPP, démarrer Apache puis ouvrir
<http://localhost/serena/serena.html>. Avec les autres serveurs, ouvrir
<http://localhost:8000/serena.html>.

### Option 3 — Hébergement statique

Déployer `serena.html` sur n'importe quel hébergeur statique (Netlify, Vercel,
GitHub Pages, Cloudflare Pages, etc.). Aucun backend requis.

**Pour bénéficier de la PWA complète**, servir en **HTTPS** (obligatoire pour
Service Worker, WebAuthn, Notifications).

---

## Utilisation

### Premier lancement

1. **Splash** (~1,2 s)
2. **Onboarding** en 5 étapes :
   - 💜 Bienvenue
   - 🔒 Confidentialité
   - 👤 Profil (prénom, date de naissance — facultatifs)
   - 💊 Implant (optionnel)
   - 🔐 Création du PIN (4 chiffres, confirmé)
3. **Dashboard**

### Navigation

- **Mobile** : barre d'onglets en bas (Accueil, Calendrier, Suivi, Grossesse, Profil)
- **Desktop** : barre latérale à gauche (14 entrées)
- **URL** : hash router (`#dashboard`, `#calendar`, `#pregnancy`, etc.)

### Actions rapides (dashboard)

- 🩸 Règles
- 📓 Journal
- 🌡️ Température
- ❤️ Rapport
- ⏱️ Contractions
- 📄 Rapport PDF

### Ajout de données

Toutes les données se saisissent via des **modales** (bottom sheet sur mobile,
dialogue centré sur desktop). Les formulaires sont validés côté client :
dates cohérentes, températures 34–42 °C, PIN 4 chiffres, bornes physiologiques.

### Sauvegarde et restauration

- **Paramètres → Données → Exporter** : télécharge un JSON horodaté
- **Paramètres → Données → Importer** : fusionne un JSON précédemment exporté

**Conseil** : exporter régulièrement (changement de téléphone, réinitialisation).

### Mode médecin

- **Rapports → Exporter mon dossier (PDF)**
- Sélectionner les sections à inclure
- Le navigateur ouvre la boîte de dialogue d'impression → "Enregistrer au format PDF"

---

## Architecture technique

### Choix fondateurs

| Sujet | Choix | Justification |
|---|---|---|
| **Distribution** | Application mono-fichier `serena.html`, accompagnée du manifeste, du service worker et des icônes | Portabilité, aucun build |
| **Dépendances** | Aucune | Zéro CDN, zéro framework, zéro tracking |
| **Stockage** | IndexedDB (+ fallback localStorage) | Structuré, scalable, transactionnel |
| **PIN** | PBKDF2 150k itérations + sel 16 octets | Standard OWASP 2023 |
| **Chiffrement** | AES-GCM 256 bits disponible; notes pas encore chiffrées | Chiffrement authentifié prévu pour les champs sensibles |
| **PDF** | `window.print()` + CSS print | Pas de dépendance externe |
| **Dates** | Serial UTC (jours depuis epoch) | Zéro dérive de fuseau |
| **XSS** | `escapeHtml()` systématique | Protection de toutes les injections |

### Découpage interne

Le code est organisé en **7 blocs logiques** dans le même `<script>` :

| Bloc | Rôle | Lignes |
|---|---|---|
| 1 | `<head>` + CSS (design tokens, composants) | ~400 |
| 2 | SVG sprite + structure HTML | ~250 |
| 3 | Noyau : utils, i18n, crypto, IndexedDB, toasts | ~500 |
| 4 | Algorithmes métier (`S.calc.*`) | ~300 |
| 5 | UI : router, vues, modales, charts | ~600 |
| 6 | Modules : formulaires, exports, PWA | ~500 |
| 7 | Boot, PIN, onboarding, auto-lock | ~80 |

**Total : environ 5 800 lignes dans la version assemblée actuelle.**

### Namespace global

Tout est exposé via `window.SERENA` (alias `S`) :

```js
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
```

---

## Structure du fichier

```
serena.html
├── <head>
│   ├── <meta> (SEO, PWA, theme-color)
│   ├── <link rel="icon"> (icônes dans assets/)
│   ├── <link rel="manifest"> (manifest.json)
│   └── <style> (design tokens + composants)
├── <body>
│   ├── <svg> sprite (logo + icônes)
│   ├── #print-report (zone d'impression)
│   ├── #toastwrap (notifications)
│   ├── #screen-splash
│   ├── #screen-lock (PIN + biométrie)
│   ├── #screen-onboarding (5 étapes)
│   ├── #app (shell)
│   │   ├── nav.sidebar (desktop)
│   │   └── .content-col
│   │       ├── header.topbar (mobile)
│   │       └── main#mainView
│   ├── #modalRoot
│   ├── #offlineBadge
│   └── <script>
│       ├── Bloc 3 : Noyau
│       ├── Bloc 4 : Algorithmes
│       ├── Bloc 5 : UI
│       ├── Bloc 6 : Modules
│       └── Bloc 7 : Boot
```

---

## Compatibilité

| Navigateur | Version minimale | Statut |
|---|---|---|
| Chrome / Edge | 90+ | ✅ Complet |
| Firefox | 88+ | ✅ Complet |
| Safari (macOS) | 15+ | ✅ Complet |
| Safari (iOS) | 15+ | ✅ Complet |
| Chrome Android | 90+ | ✅ Complet |
| Samsung Internet | 15+ | ✅ Complet |

**Prérequis techniques** :

- `IndexedDB` (fallback localStorage si absent)
- `Web Crypto API` (`crypto.subtle`) — obligatoire pour le PIN
- `CSS Grid`, `CSS Custom Properties`
- `ES2020` (optional chaining, nullish coalescing)

**Contexte sécurisé** (`https://` ou `localhost`) requis pour :

- Notifications
- WebAuthn
- Service Worker

---

## Développement

### Reconstruire le fichier

Le fichier `serena.html` est assemblé à partir de 7 blocs. Pour modifier :

1. Éditer le fichier `serena.html` directement (mono-fichier)
2. Ou maintenir les 7 blocs dans des fichiers séparés et les concaténer

### Lancer les auto-tests

- **Paramètres → État technique**
- 8 tests sont exécutés :
  1. Prédiction du prochain cycle
  2. Fenêtre fertile (J-19 → J-13)
  3. Crypto PIN (PBKDF2)
  4. Chiffrement AES-GCM
  5. Dates sans dérive (31 janv + 1 = 1 févr)
  6. Implant +1 mois (31 janv → 28/29 févr)
  7. Détection hausse thermique
  8. Échappement HTML (XSS)

### Débogage

- Ouvrir la console développeur (F12)
- Vérifier `window.SERENA` (objet global)
- `S.state` : état applicatif complet
- `S.storageInfo()` : état IndexedDB / crypto / quota
- `S.runSelfTests()` : tests asynchrones

### Données de démonstration

- **Paramètres → Données → Charger les données de démonstration**
- Ajoute : 4 cycles, 10 températures, 10 logs journal, 1 implant, 1 RDV
- Marqueur `[DEMO]` sur toutes les entrées
- **Effacer les données de démonstration** supprime uniquement le tag `[DEMO]`

---

## Limitations connues

### PWA

`serena.html` référence `manifest.json` et enregistre `sw.js` depuis le même
répertoire. Le service worker met en cache la page, le manifeste et les icônes.
Il nécessite un contexte sécurisé : HTTPS en production ou `localhost` en
local. L'ouverture via `file://` ne permet pas au navigateur de charger ces
ressources PWA.

### WebAuthn

L'implémentation biométrique est **partielle** :

- Le bouton "Utiliser la biométrie" apparaît si un credential est configuré
- Aucun credential n'est enregistré automatiquement (pas de `navigator.credentials.create`)
- Le déverrouillage biométrique complet reste à implémenter

### Chiffrement AES

L'infrastructure est **prête** (dérivation de clé, `encrypt`, `decrypt`) mais
les champs de notes ne sont **pas encore chiffrés** au repos. Prévu en V1.3.

### Notifications

Les rappels utilisent l'API `Notification` du navigateur :

- Fonctionnent uniquement si l'app est ouverte (ou en arrière-plan récent)
- Pas de notifications push persistantes (nécessite un serveur)
- Vérification toutes les minutes quand l'app est active

### Autres

- Pas de synchronisation multi-appareils (par choix : local-first)
- Pas de mode "post-partum" (retour de couches, allaitement)
- Pas de suivi de la glaire cervicale (méthode symptothermique complète)

---

## Feuille de route

### V1.3 (prévu)

- [ ] Améliorer et vérifier les stratégies PWA hors-ligne sur les navigateurs ciblés
- [ ] Chiffrement AES-GCM des notes au repos
- [ ] WebAuthn complet (enregistrement + vérification)
- [ ] Tests unitaires (mini-framework maison)
- [ ] Mode post-partum
- [ ] Suivi de la glaire cervicale
- [ ] Rappels récurrents (ex. "température tous les matins")

### V2.0 (exploratoire)

- [ ] Mode partenaire (accès en lecture seule)
- [ ] Export chiffré
- [ ] Synchronisation E2E optionnelle (via serveur tiers)
- [ ] Intégration Apple Health / Google Fit
- [ ] Mode hors-ligne avancé (cache des vues)

---

## Contribution

### Rapport de bug

Ouvrir une issue avec :

1. Version de SERENA (`Paramètres → À propos`)
2. Navigateur + version
3. Système d'exploitation
4. Étapes de reproduction
5. Résultat attendu vs observé
6. Capture d'écran si pertinent

**⚠️ Ne jamais joindre un export JSON réel** (données médicales intimes).
Utiliser les données de démonstration pour reproduire.

### Suggestion

Ouvrir une issue avec le label `enhancement`.

### Pull request

1. Forker le dépôt
2. Créer une branche (`feature/ma-fonctionnalite`)
3. Respecter le style existant (voir `serena.html`)
4. Tester sur Chrome + Firefox + Safari
5. Lancer les auto-tests
6. Ouvrir la PR avec description claire

---

## Licence

Voir [LICENCE.md](LICENCE.md).

**En résumé** : usage personnel et éducatif autorisé. Toute utilisation
commerciale ou médicale doit faire l'objet d'un accord explicite.

---

## Crédits

- **Design** : palette inspirée du logo officiel SERENA (violet, rose, vert feuille)
- **Typographie** : Fraunces (titres), system-ui (corps)
- **Développement** : projet mono-fichier sans dépendance externe
- **Inspiration** : méthodes symptothermiques, recommandations OMS sur la
  contraception, cadre légal français sur les données de santé (RGPD)

---

**SERENA** — *Comprendre son corps. Anticiper. Prendre soin de soi.*