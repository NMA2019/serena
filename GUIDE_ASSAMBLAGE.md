
---

# GUIDE D'ASSEMBLAGE COMPLET

## 1. Structure finale du fichier `index.html`

```
<!DOCTYPE html>
<html lang="fr">
<head>
  [BLOC 1] ← <meta>, <title>, <link icon>, <style>...</style>
</head>
<body>
  [BLOC 2] ← SVG sprite + splash + lock + onboarding + app + modalRoot + offlineBadge
  <script>
    'use strict';
    [BLOC 3] ← Noyau (utils, i18n, crypto, DB, toasts, prefs, thème, state)
    [BLOC 4] ← Algorithmes métier (S.calc.*)
    [BLOC 5] ← UI (router, vues, modales, charts)
    [BLOC 6] ← Modules (formulaires, exports, PWA, notifications, démo, tests)
    [BLOC 7] ← Boot, PIN, onboarding, auto-lock, init
  </script>
</body>
</html>
```

## 2. Patchs i18n à appliquer

**Dans `S.dict.fr` (Bloc 3)**, ajoute ces clés **avant la fermeture de l'objet** :

```js
/* --- Patch i18n Bloc 4 (à insérer dans S.dict.fr) --- */
preg_tip_1_4: "Prenez de l'acide folique (400µg/j). Évitez alcool, tabac, médicaments non prescrits.",
preg_tip_5_8: "Premières nausées possibles. Fractionnez vos repas. Repos essentiel.",
preg_tip_9_12: "Échographie du 1er trimestre à prévoir (11-13 SA). Dépistage trisomie.",
preg_tip_13_16: "Le risque de fausse couche diminue. Vous pouvez annoncer la grossesse.",
preg_tip_17_20: "Échographie morphologique à 22 SA. Premiers mouvements perceptibles.",
preg_tip_21_24: "Pensez à la préparation à la naissance. Surveillez la tension.",
preg_tip_25_28: "Test de dépistage du diabète gestationnel (24-28 SA).",
preg_tip_29_32: "Échographie de croissance. Repos et surveillance des contractions.",
preg_tip_33_36: "Préparation à l'accouchement. Préparez votre valise maternité.",
preg_tip_37_40: "À terme ! Surveillez les contractions et la perte des eaux.",
preg_tip_41_plus: "Grossesse prolongée. Surveillance rapprochée recommandée.",
preg_ms_8_label:  "1ère consultation prénatale",
preg_ms_8_desc:   "Confirmation, bilan sanguin",
preg_ms_12_label: "Échographie 1er trimestre",
preg_ms_12_desc:  "Datation + clarté nucale (11-13 SA)",
preg_ms_16_label: "Consultation mensuelle",
preg_ms_16_desc:  "Suivi tension, poids, hauteur utérine",
preg_ms_22_label: "Échographie morphologique",
preg_ms_22_desc:  "Examen détaillé des organes",
preg_ms_24_label: "Dépistage diabète gestationnel",
preg_ms_24_desc:  "Test HGPO",
preg_ms_28_label: "Consultation + injection anti-D si Rh-",
preg_ms_28_desc:  "Prévention allo-immunisation",
preg_ms_32_label: "Échographie de croissance",
preg_ms_32_desc:  "Poids, position, liquide amniotique",
preg_ms_36_label: "Consultation pré-anesthésique",
preg_ms_36_desc:  "Préparation accouchement",
preg_ms_38_label: "Consultation de terme",
preg_ms_38_desc:  "Surveillance rapprochée",
preg_ms_40_label: "DPA — Terme",
preg_ms_40_desc:  "Surveillance du travail",
regularity: "Régularité",
actions: "Actions",
```

**Dans `S.dict.en` (Bloc 3)**, ajoute :

```js
/* --- Patch i18n Bloc 4 (à insérer dans S.dict.en) --- */
preg_tip_1_4: "Take folic acid (400µg/day). Avoid alcohol, tobacco, unprescribed medication.",
preg_tip_5_8: "First nausea may appear. Split your meals. Rest is essential.",
preg_tip_9_12: "Schedule 1st trimester ultrasound (11-13 WA). Trisomy screening.",
preg_tip_13_16: "Miscarriage risk decreases. You can announce the pregnancy.",
preg_tip_17_20: "Anatomy scan at 22 WA. First movements may be felt.",
preg_tip_21_24: "Consider birth preparation classes. Monitor blood pressure.",
preg_tip_25_28: "Gestational diabetes screening (24-28 WA).",
preg_tip_29_32: "Growth ultrasound. Rest and monitor contractions.",
preg_tip_33_36: "Birth preparation. Pack your maternity bag.",
preg_tip_37_40: "Full term! Monitor contractions and water breaking.",
preg_tip_41_plus: "Prolonged pregnancy. Close monitoring recommended.",
preg_ms_8_label:  "1st prenatal visit",
preg_ms_8_desc:   "Confirmation, blood work",
preg_ms_12_label: "1st trimester ultrasound",
preg_ms_12_desc:  "Dating + nuchal translucency (11-13 WA)",
preg_ms_16_label: "Monthly consultation",
preg_ms_16_desc:  "Blood pressure, weight, fundal height",
preg_ms_22_label: "Anatomy scan",
preg_ms_22_desc:  "Detailed organ examination",
preg_ms_24_label: "Gestational diabetes screening",
preg_ms_24_desc:  "OGTT test",
preg_ms_28_label: "Consultation + anti-D if Rh-",
preg_ms_28_desc:  "Alloimmunization prevention",
preg_ms_32_label: "Growth ultrasound",
preg_ms_32_desc:  "Weight, position, amniotic fluid",
preg_ms_36_label: "Pre-anesthesia consultation",
preg_ms_36_desc:  "Birth preparation",
preg_ms_38_label: "Term consultation",
preg_ms_38_desc:  "Close monitoring",
preg_ms_40_label: "EDD — Term",
preg_ms_40_desc:  "Labor monitoring",
regularity: "Regularity",
actions: "Actions",
```

## 3. Ordre d'assemblage (procédure pas-à-pas)

1. **Crée un fichier** `index.html` vide.
2. **Copie le Bloc 1** (tout ce qui est entre `<head>` et `</head>`). Le Bloc 1 inclut déjà `<!DOCTYPE html>`, `<html>`, `<head>` et `</head>`.
3. **Ajoute `<body>`** puis **copie le Bloc 2** (SVG, HTML, `<script>` ouvrant, `'use strict';`).
4. **À l'intérieur du `<script>`**, colle dans l'ordre :
   - Bloc 3 (noyau)
   - Bloc 4 (algorithmes)
   - Bloc 5 (UI)
   - Bloc 6 (modules)
   - Bloc 7 (boot)
5. **Applique les patchs i18n** (§2 ci-dessus) dans `S.dict.fr` et `S.dict.en`.
6. **Ferme** avec `</script>`, `</body>`, `</html>`.

## 4. Vérifications rapides (checklist)

### 4.1 Structure

- [ ] Le fichier fait entre **2 800 et 3 200 lignes**.
- [ ] Une seule balise `<script>` (celle du Bloc 2).
- [ ] Le `<script>` contient : `'use strict';` puis les 5 blocs dans l'ordre.
- [ ] `</html>` présent en fin de fichier.
- [ ] Pas de `</script>` orphelin au milieu.

### 4.2 Syntaxe JS

- [ ] Aucune erreur dans la console au chargement.
- [ ] `typeof S.calc`, `typeof S.crypto`, `typeof S.VIEWS`, `typeof S.boot` renvoient `'object'` ou `'function'`.
- [ ] `S.boot()` se lance bien au `DOMContentLoaded`.

### 4.3 Boot

- [ ] Splash visible ~1,2 s puis disparaît.
- [ ] Si premier lancement : onboarding à l'étape 1 (💜).
- [ ] Après onboarding : création PIN (deux saisies).
- [ ] Après PIN : dashboard affiché.
- [ ] Après rechargement : écran de vérification PIN.

### 4.4 Fonctionnel

- [ ] Dashboard affiche : jour cycle, prochaine période, fenêtre fertile, moyenne.
- [ ] Calendrier navigue (← / → / Aujourd'hui).
- [ ] Clic sur un jour ouvre le panneau de détail.
- [ ] Bouton "Règles" ouvre le formulaire.
- [ ] Enregistrement d'une période → retour dashboard, données à jour.
- [ ] Idem température, journal, sexualité, implant, RDV, rappel.
- [ ] Grossesse : démarrage, SA calculée, DPA affichée, jalons.
- [ ] Contractions : chrono fonctionne, bouton change (DÉBUT/FIN).
- [ ] Rapports : export JSON télécharge, import fonctionne.
- [ ] PDF : `window.print()` s'ouvre, le rapport est propre.
- [ ] Paramètres : thème (Light/Dark/System), langue (FR/EN), données.
- [ ] Sécurité : changement de PIN fonctionne.
- [ ] Auto-tests : tous ✅ dans État technique.

### 4.5 Sécurité

- [ ] Le PIN est stocké hashé (PBKDF2) dans IndexedDB.
- [ ] Le PIN n'apparaît jamais en clair dans `localStorage`.
- [ ] Rechargement pendant la création PIN → on repart de zéro (pas de PIN partiel).
- [ ] Auto-lock fonctionne (5 min par défaut, configurable).
- [ ] Fermeture d'onglet puis retour → auto-lock déclenché si délai écoulé.

### 4.6 Accessibilité

- [ ] Tous les boutons ont un `aria-label` ou un texte.
- [ ] `Tab` parcourt les éléments dans l'ordre logique.
- [ ] `Échap` ferme les modales.
- [ ] Focus piégé dans les modales (Tab ne sort pas).
- [ ] Contraste AA minimum (texte `--muted` sur fond clair).

### 4.7 PWA

- [ ] Le manifest est bien injecté dans `<head>` (inspecteur).
- [ ] L'icône d'installation apparaît (Chrome desktop/Android) — **peut ne pas apparaître** à cause du Blob SW, c'est attendu.
- [ ] Indicateur hors-ligne s'affiche si tu coupes le réseau.

## 5. Tests manuels prioritaires

| # | Test | Attendu |
|---|---|---|
| 1 | Premier lancement | Onboarding → PIN → Dashboard |
| 2 | Rechargement après PIN | Écran de vérification |
| 3 | Mauvais PIN 3× | Délai croissant, message d'erreur |
| 4 | Ajout de règles | Visible dans le calendrier |
| 5 | Fenêtre fertile | J-19 à J-13 (vérifier manuellement) |
| 6 | Ajout température | Point sur le graphique |
| 7 | Analyse thermique (6 jours avec hausse) | Message "Hausse détectée" |
| 8 | Démarrage grossesse | SA + DPA correctes |
| 9 | Chrono contraction | Compte les secondes, sauvegarde |
| 10 | Export JSON | Fichier téléchargé, réimportable |
| 11 | Export PDF | Impression propre avec logo |
| 12 | Changement langue | Interface traduite, `html lang` mis à jour |
| 13 | Changement thème | Bascule Light/Dark/System |
| 14 | Auto-lock (5 min) | Retour à l'écran PIN |
| 15 | État technique | Tous les tests ✅ |

## 6. Points d'attention connus (limitations V1.2)

1. **PWA non installable** : le Service Worker via Blob URL est refusé par tous les navigateurs modernes. Pour une vraie PWA, il faudra servir `sw.js` et `manifest.json` en fichiers séparés depuis un serveur.
2. **WebAuthn partiel** : la biométrie est proposée mais ne déverrouille pas complètement (le PIN reste requis pour dériver la clé AES). Une implémentation complète nécessiterait d'enregistrer un credential au setup.
3. **Chiffrement AES non utilisé** : la clé AES est dérivée et stockée en mémoire (`S.state.aesKey`) mais aucun champ n'est encore chiffré. À activer dans une V1.3 (chiffrer `dailyLogs.notes`, `sexualActivity.notes`, `implant.notes`).
4. **Pas de tests unitaires automatisés** : les auto-tests (`S.runSelfTests`) couvrent 8 cas critiques, mais pas l'ensemble.
5. **Icône PWA en SVG data-URI** : Chrome préfère PNG 192×192 et 512×512. À ajouter dans une V1.3.

## 7. Prochaines étapes suggérées (V1.3)

1. Servir `sw.js` + `manifest.json` en fichiers séparés (PWA réelle).
2. Chiffrer les champs sensibles (`notes`) avec `S.state.aesKey`.
3. Ajouter les icônes PNG (192, 512) générées depuis le SVG logo.
4. Enregistrer le credential WebAuthn au setup, permettre le déverrouillage biométrique complet.
5. Ajouter des tests unitaires (avec un mini-framework maison ou Jest en CI).
6. Ajouter un mode "post-partum" (suivi retour de couches, allaitement).
7. Ajouter le suivi de la glaire cervicale (méthode symptothermique complète).
8. Ajouter un système de **rappels récurrents** (ex. "température tous les matins").

---

## État d'avancement final

| Bloc | Contenu | Statut |
|---|---|---|
| 1 | `<head>` + CSS | ✅ |
| 2 | SVG + HTML | ✅ |
| 3 | JS noyau | ✅ |
| 4 | JS métier : algorithmes | ✅ |
| 5 | JS UI : router, vues, modales, charts | ✅ |
| 6 | JS modules : formulaires, exports, PWA | ✅ |
| 7 | Boot + PIN + onboarding + guide | ✅ |

**V1.2 est complète.** Assemble les 7 blocs, applique les patchs i18n, ouvre `index.html` dans un navigateur moderne (Chrome/Edge/Firefox/Safari récent), et tu devrais avoir une application fonctionnelle de suivi de santé féminine.

Si tu rencontres une erreur à l'assemblage, envoie-moi le **message d'erreur exact** et le **numéro de ligne** — je te fournirai un correctif ciblé.

Bon build ! 🌸