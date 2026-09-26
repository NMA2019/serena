# Guide de contribution — SERENA

Merci de l'intérêt porté à SERENA. Ce document décrit les règles et les
procédures pour contribuer efficacement au projet.

**Mainteneur principal** : NDJEFE MBAKOP ARNAUD
**Contact** : ndjefe@gmail.com — WhatsApp : +237 679 449 165
**Structure** : CFP-CMD (Centre de Formation Professionnel du Commerce et
du Monde Digital)

---

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Signaler un bug](#signaler-un-bug)
- [Proposer une fonctionnalité](#proposer-une-fonctionnalité)
- [Soumettre une pull request](#soumettre-une-pull-request)
- [Style de code](#style-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Traductions](#traductions)
- [Sécurité](#sécurité)
- [Questions fréquentes](#questions-fréquentes)

---

## Code de conduite

En participant à ce projet, vous vous engagez à respecter le
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Tout comportement contraire
pourra entraîner l'exclusion du projet.

---

## Comment contribuer

### Types de contributions bienvenues

- 🐛 **Signalement de bugs** (interface, calculs, accessibilité)
- ✨ **Nouvelles fonctionnalités** (voir feuille de route dans `README.md`)
- 📝 **Amélioration de la documentation** (README, aide intégrée)
- 🌐 **Traductions** (actuellement FR + EN, autres langues bienvenues)
- ♿ **Accessibilité** (contraste, navigation clavier, lecteurs d'écran)
- 🔒 **Sécurité** (voir `SECURITY.md` pour les divulgations responsables)
- 🎨 **Design** (suggestions UX, palette, typographie)
- 🧪 **Tests** (unitaires, intégration, manuels)

### Types de contributions refusées

- ❌ Ajout de **dépendances externes** (CDN, framework, bibliothèque)
- ❌ Ajout de **télémétrie**, **analytics**, **publicité**
- ❌ Retrait ou affaiblissement des **disclaimers médicaux**
- ❌ Modification des **algorithmes médicaux** sans source scientifique
- ❌ Code **non testé** sur au moins 3 navigateurs
- ❌ **Données médicales réelles** dans les exemples ou tests

---

## Signaler un bug

### Avant de créer une issue

1. Vérifier que le bug n'est pas déjà signalé (recherche dans les issues)
2. Reproduire sur un **navigateur différent** (Chrome, Firefox, Safari)
3. Vider le cache et recharger
4. Tester en **navigation privée** (pour exclure les extensions)
5. Vérifier la console développeur (F12)

### Créer une issue

Utiliser le template suivant :

```markdown
## Description du bug

[Description claire et concise]

## Étapes de reproduction

1. Ouvrir SERENA
2. Naviguer vers ...
3. Cliquer sur ...
4. Observer ...

## Comportement attendu

[Ce qui devrait se passer]

## Comportement observé

[Ce qui se passe réellement]

## Environnement

- **Version SERENA** : 1.2.0 (voir Paramètres → À propos)
- **Navigateur** : Chrome 120 / Firefox 121 / Safari 17
- **Système** : Windows 11 / macOS 14 / Ubuntu 22.04 / iOS 17 / Android 14
- **Taille écran** : mobile / tablette / desktop

## Captures d'écran

[Si pertinent]

## Logs console

[Coller les erreurs de la console F12]

text

## Contexte additionnel

[Tout élément utile : données de démo, mode hors-ligne, etc.]
⚠️ Avertissement important
Ne jamais joindre un export JSON réel — il contient des données médicales
intimes (règles, températures, rapports, grossesse). Utiliser exclusivement
Paramètres → Données → Charger les données de démonstration pour
reproduire un bug.

Si le bug ne se reproduit qu'avec des données réelles, décrire la structure
(anonymisée) sans les valeurs.

Proposer une fonctionnalité
Avant de proposer
Vérifier qu'elle n'est pas dans la feuille de route (README.md)

Vérifier qu'elle n'a pas déjà été refusée (issues fermées)

Réfléchir à son impact médical (si applicable)

Vérifier qu'elle respecte le principe local-first (pas de serveur)

Créer une issue
Utiliser le template suivant :

markdown
## Fonctionnalité proposée

[Description claire]

## Problème résolu

[Quel besoin utilisateur cette fonctionnalité adresse-t-elle ?]

## Solution envisagée

[Comment imaginez-vous l'implémentation ?]

## Alternatives considérées

[Autres approches possibles]

## Impact médical

[La fonctionnalité produit-elle des estimations ? Des conseils ?
Nécessite-t-elle des sources scientifiques ?]

## Impact accessibilité

[Est-elle utilisable au clavier ? Compatible lecteurs d'écran ?]

## Impact performance

[Impact sur le chargement, la mémoire, le stockage ?]
Soumettre une pull request
Prérequis
Avoir une issue ouverte décrivant le changement

Avoir lu le style de code (section suivante)

Avoir testé sur Chrome + Firefox + Safari

Avoir lancé les auto-tests (Paramètres → État technique)

Procédure
Forker le dépôt officiel

Créer une branche descriptive :

text
feature/fenetre-fertile-symptothermique
fix/pin-partiel-onboarding
docs/guide-installation
a11y/contraste-muted
Commiter avec des messages clairs (voir conventions ci-dessous)

Pousser sur votre fork

Ouvrir une pull request vers la branche main

Conventions de commit
Format : type(scope): description courte

Types :

feat : nouvelle fonctionnalité

fix : correction de bug

docs : documentation

style : formatage (sans changement de comportement)

refactor : refactoring

perf : optimisation

test : ajout ou modification de tests

a11y : accessibilité

i18n : internationalisation

sec : sécurité

chore : tâches diverses (build, config)

Exemples :

text
feat(fertility): ajoute suivi de la glaire cervicale
fix(pin): empêche la persistance d'un PIN partiel
docs(readme): ajoute section PWA
a11y(modales): ajoute focus trap et fermeture Échap
i18n(es): ajoute traduction espagnole (partielle)
sec(crypto): passe à 200k itérations PBKDF2
Règles :

Impératif présent (« ajoute », pas « ajouté »)

Première ligne ≤ 72 caractères

Corps optionnel, séparé par une ligne vide

Référencer les issues (Refs #42, Closes #43)

Template de pull request
markdown
## Description

[Description du changement]

## Type

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Refactoring
- [ ] Documentation
- [ ] Accessibilité
- [ ] Traduction
- [ ] Sécurité

## Issue liée

Closes #[numéro]

## Checklist

- [ ] J'ai lu le CONTRIBUTING.md
- [ ] Mon code respecte le style du projet
- [ ] J'ai testé sur Chrome
- [ ] J'ai testé sur Firefox
- [ ] J'ai testé sur Safari (ou expliqué pourquoi non)
- [ ] J'ai testé sur mobile (ou expliqué pourquoi non)
- [ ] J'ai lancé les auto-tests (tous ✅)
- [ ] J'ai mis à jour le CHANGELOG.md
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Je n'ai ajouté aucune dépendance externe
- [ ] Je n'ai ajouté aucune télémétrie
- [ ] J'ai échappé toutes les données utilisateur (`escapeHtml`)

## Captures d'écran

[Avant / Après si UI]

## Notes pour les reviewers

[Points d'attention particuliers]
Revue de code
Un mainteneur examinera votre PR sous 7 jours (généralement)

Des commentaires peuvent demander des modifications

Les conversations résolues seront marquées comme telles

Une fois approuvée, la PR sera mergée (squash merge par défaut)

En cas de désaccord, discuter dans les commentaires, ne pas forcer

Style de code
Principes généraux
Aucune dépendance externe — vanilla JS uniquement

Un seul fichier index.html (mono-bloc)

ES2020 minimum (optional chaining, nullish coalescing autorisés)

Pas de build step — le code doit tourner tel quel

Pas de minification — le code doit rester lisible

JavaScript
js
// ✅ Bon
const periods = S.state.periods.filter(p => p.endDate);
function predictNextPeriod(periods, cycleLength){
  if(!periods || !periods.length) return null;
  // ...
}

// ❌ Mauvais
var periods=S.state.periods.filter(function(p){return p.endDate});
function predictNextPeriod(periods,cycleLength){if(!periods)return null;/*...*/}
Règles :

const par défaut, let si réassignation, jamais var

Point-virgule obligatoire

Guillemets simples '...' (sauf JSON)

Indentation : 2 espaces

Longueur de ligne : ≤ 100 caractères

Toujours des accolades, même pour une ligne

=== et !== (jamais == / !=)

Fonctions nommées (pas d'anonymes pour les fonctions > 3 lignes)

Commentaires en français (ou anglais pour les blocs techniques)

Sécurité
js
// ✅ Bon — échappement systématique
el.innerHTML = `<p>${S.escapeHtml(userInput)}</p>`;

// ❌ Mauvais — XSS
el.innerHTML = `<p>${userInput}</p>`;

// ✅ Bon — textContent quand possible
el.textContent = userInput;

// ❌ Mauvais — eval, Function constructor
eval(userInput);
new Function(userInput)();
CSS
Custom properties pour toutes les couleurs (--primary, --bg, etc.)

kebab-case pour les classes (.cal-day, .btn-primary)

Mobile-first : styles de base, puis @media (min-width: ...)

Pas de !important sauf cas exceptionnel justifié

Pas d'ID pour le style (uniquement pour le JS)

Respecter prefers-color-scheme et prefers-reduced-motion

Accessibilité
Tout bouton doit avoir un label (texte ou aria-label)

Toute image informative doit avoir un alt

Tout formulaire doit avoir un <label> associé

Contraste minimum AA (4.5:1 pour texte normal, 3:1 pour grand texte)

Focus visible sur tous les éléments interactifs

Navigation clavier complète

Internationalisation
Aucune chaîne en dur dans le JS — utiliser S.t('key')

Ajouter les clés dans S.dict.fr et S.dict.en

Utiliser S.t('key', { n: 42 }) pour l'interpolation

Échapper avec S.escapeHtml(S.t('key')) lors d'injection HTML

Dates
Toujours utiliser S.dt.* (serial UTC)

Jamais new Date() pour les dates calendaires

new Date() toléré uniquement pour l'heure exacte (contractions, timestamps)

Tests
Auto-tests intégrés
Lancer via Paramètres → État technique. Les 8 tests couvrent :

predictNextPeriod — ne saute pas un cycle

Fenêtre fertile — J-19 à J-13

Crypto PIN — PBKDF2 verify

AES-GCM — encrypt/decrypt

Dates — 31 janv + 1 = 1 févr

Implant +1 mois — 31 janv → 28/29 févr

Détection hausse thermique

escapeHtml — anti-XSS

Toute PR doit maintenir ces 8 tests en ✅.

Tests manuels obligatoires
Avant de soumettre une PR, tester :

□ Premier lancement → onboarding → PIN → dashboard
□ Rechargement → écran de vérification PIN
□ Ajout / modification / suppression de chaque type de donnée
□ Navigation entre toutes les vues
□ Changement de langue (FR ↔ EN)
□ Changement de thème (Light ↔ Dark ↔ System)
□ Export JSON → réimport
□ Export PDF → impression propre
□ Auto-lock (configurer 1 min, attendre, vérifier)
□ Mode hors-ligne (couper le réseau)
□ Navigation clavier (Tab, Échap, Entrée)
□ Zoom navigateur (Ctrl + / Ctrl -)
Ajouter un test
js
// Dans S.runSelfTests (Bloc 6)
try{
  const result = S.calc.maFonction(testInput);
  tests.push({
    name: 'maFonction retourne X',
    ok: result === expected
  });
}catch(e){
  tests.push({
    name: 'maFonction',
    ok: false,
    error: e.message
  });
}
Les tests ne doivent jamais écrire dans IndexedDB ni localStorage.

Documentation
Mettre à jour
README.md si la fonctionnalité change l'usage

CHANGELOG.md systématiquement (section [Unreleased])

Aide intégrée (S.dict.fr.helpBody) si l'UX change

Commentaires JSDoc pour les fonctions publiques

Format JSDoc
js
/**
 * Prédit la date des prochaines règles.
 * @param {Array<{startDate:string}>} periods
 * @param {number} cycleLength - Durée moyenne du cycle en jours
 * @returns {{date:string|null, confidence:string, isLate:boolean}}
 */
S.calc.predictNextPeriod = function(periods, cycleLength){
  // ...
};
Traductions
Ajouter une langue
Dupliquer S.dict.fr dans S.dict.xx (xx = code ISO 639-1)

Traduire toutes les clés

Tester la cohérence (aucune clé manquante)

Ajouter la langue dans S.openLanguageSheet

Mettre à jour README.md

Règles de traduction
Ne pas traduire les noms propres (SERENA, Implanon, Nexplanon)

Ne pas traduire les unités (°C, SA, DPA)

Conserver les disclaimers médicaux intacts

Vérifier les longueurs (certaines langues sont plus longues)

Tester l'interface dans la nouvelle langue

Corrections de traductions
Si vous repérez une erreur dans une traduction existante :

Ouvrir une issue avec le tag i18n

Indiquer la clé, la langue, la traduction actuelle, la proposition

Justifier (source, contexte culturel)

Sécurité
Ne jamais ouvrir d'issue publique pour une vulnérabilité. Voir
SECURITY.md pour la procédure de divulgation responsable.

Les contributions touchant à :

la cryptographie (PIN, AES)

l'authentification (WebAuthn)

le stockage (IndexedDB)

l'échappement HTML

seront examinées avec une attention particulière et pourront nécessiter
une revue supplémentaire.

Questions fréquentes
Puis-je ajouter une dépendance externe ?
Non. Le projet est volontairement mono-fichier sans dépendance. Si vous
avez besoin d'une fonctionnalité, implémentez-la en vanilla JS.

Puis-je ajouter Google Analytics / Plausible / etc. ?
Non. Aucune télémétrie, aucun tracking, aucune publicité. Principe
local-first strict.

Puis-je modifier les algorithmes médicaux ?
Avec précaution. Toute modification doit :

être justifiée par une source scientifique (OMS, HAS, CNGOF, etc.)

être documentée dans le CHANGELOG

ne pas retirer les disclaimers

être testée avec des cas limites

Puis-je utiliser un framework (React, Vue, Svelte) ?
Non. Le projet est vanilla JS par choix (portabilité, offline, zéro build).

Puis-je proposer une refonte complète ?
Discutons-en d'abord. Ouvrir une issue avec le tag discussion pour
expliquer la motivation, les bénéfices, les coûts. Une refonte ne sera
acceptée que si elle résout un problème réel sans casser la portabilité.

Comment devenir mainteneur ?
Après 3 contributions substantielles acceptées et un engagement régulier,
un mainteneur peut vous proposer le rôle. Les mainteneurs ont accès en
écriture au dépôt et peuvent merger les PR.

Puis-je contribuer en dehors de GitHub ?
Oui. Envoyer un patch par email à ndjefe@gmail.com ou via WhatsApp
+237 679 449 165. Merci de préciser :

le type de contribution

l'issue liée (si applicable)

les tests effectués

Reconnaissance
Tous les contributeurs sont crédités dans le README.md (section Crédits)
et dans l'historique Git. Les contributions significatives (nouvelles
fonctionnalités, corrections critiques, traductions complètes) sont
mentionnées dans le CHANGELOG.

Contact
Email : ndjefe@gmail.com

WhatsApp : +237 679 449 165

Structure : CFP-CMD (Centre de Formation Professionnel du Commerce
et du Monde Digital)

Mainteneur : NDJEFE MBAKOP ARNAUD
Licence Administration Réseaux et Systèmes — CCNA, MTCNA
IT — Cofondateur et Direction du CFP-CMD

Merci de contribuer à SERENA. 💜
