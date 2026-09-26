
---

## Notre engagement

SERENA traite des **données de santé intimes** (cycle menstruel, fertilité,
grossesse, contraception, activité sexuelle). La sécurité et la
confidentialité de ces données sont notre priorité absolue.

Nous nous engageons à :

- Corriger rapidement toute vulnérabilité confirmée
- Communiquer de manière transparente sur les incidents
- Reconnaître les chercheurs en sécurité qui signalent des problèmes
- Ne jamais minimiser une vulnérabilité liée à la vie privée

---

## Versions supportées

| Version | Supportée | Notes |
|---|---|---|
| **1.2.x** | ✅ Oui | Version stable actuelle |
| 1.1.x | ❌ Non | Obsolète — mettre à jour |
| 1.0.x | ❌ Non | Obsolète — mettre à jour |

Seule la **dernière version stable** reçoit des correctifs de sécurité.

---

## Signaler une vulnérabilité

### ⚠️ Ne pas ouvrir d'issue publique

**N'ouvrez jamais une issue GitHub publique pour une vulnérabilité de
sécurité.** Cela expose les utilisatrices à un risque avant qu'un correctif
ne soit disponible.

### Canaux de signalement privés

**Option 1 — Email (recommandé)**

À : ndjefe@gmail.com
Objet : [SECURITY] SERENA — Description courte


**Option 2 — WhatsApp**

+237 679 449 165
Préciser : [SECURITY] SERENA


**Option 3 — GitHub Security Advisory**
Si le dépôt le supporte, utiliser l'onglet "Security" → "Report a vulnerability".

### Contenu du signalement

Merci d'inclure :

1. **Description** de la vulnérabilité
2. **Impact** : quelles données ? quels utilisateurs ? quelle gravité ?
3. **Étapes de reproduction** précises
4. **Version** de SERENA concernée
5. **Navigateur** et système d'exploitation
6. **Preuve de concept** (PoC) si applicable, sans données réelles
7. **Suggestion de correctif** (optionnel)
8. **Vos coordonnées** pour le suivi (ou souhait d'anonymat)

### Ce qu'il ne faut PAS joindre

- ❌ Données médicales réelles (règles, températures, etc.)
- ❌ PIN ou hash de PIN
- ❌ Export JSON contenant des données personnelles
- ❌ Captures d'écran montrant des données sensibles

Utiliser les **données de démonstration** (Paramètres → Données → Charger
les données de démonstration) pour reproduire.

---

## Notre engagement en retour

### Délais de réponse

| Étape | Délai |
|---|---|
| Accusé de réception | **48 heures** |
| Évaluation initiale | **7 jours** |
| Correctif (critique) | **30 jours** |
| Correctif (majeur) | **60 jours** |
| Correctif (mineur) | **90 jours** |
| Divulgation publique | **Après correctif** (accord mutuel) |

Ces délais sont des **objectifs** et peuvent varier selon la complexité.

### Processus

1. **Réception** : nous accusons réception sous 48h
2. **Évaluation** : nous confirmons la vulnérabilité et estimons sa gravité
3. **Développement** : nous développons un correctif
4. **Test** : nous testons le correctif sur plusieurs navigateurs
5. **Release** : nous publions une version corrigée
6. **Divulgation** : nous publions un avis de sécurité (avec votre accord)
7. **Crédit** : vous êtes crédité (sauf si vous préférez l'anonymat)

### Communication

Nous vous tiendrons informé à chaque étape. Si vous ne recevez pas de
réponse sous 7 jours, relancez par un autre canal.

---

## Périmètre

### Dans le périmètre

- **Cryptographie** : PIN (PBKDF2), AES-GCM, dérivation de clé
- **Stockage** : IndexedDB, localStorage (fuites, corruption)
- **Authentification** : verrouillage PIN, WebAuthn, auto-lock
- **XSS** : injection HTML via données utilisateur
- **CSRF** : (peu applicable, pas de serveur, mais à vérifier)
- **Clickjacking** : intégration dans une iframe malveillante
- **Exposition de données** : fuites via export, impression, notifications
- **Logique métier** : contournement de l'auto-lock, du PIN
- **Dépendances** : aucune (mais vérifier les imports indirects)

### Hors périmètre

- ❌ Attaques physiques (vol de l'appareil déverrouillé)
- ❌ Attaques par canal auxiliaire (timing sur PBKDF2)
- ❌ Compromission du navigateur ou de l'OS
- ❌ Extensions navigateur malveillantes
- ❌ Ingénierie sociale (phishing, manipulation)
- ❌ Attaques par force brute sur PIN 4 chiffres (limitation connue)
- ❌ Absence de chiffrement au repos (limitation documentée)
- ⚠️ Ouverture en `file://` : le navigateur bloque le manifeste et le Service Worker (utiliser HTTPS ou `localhost`)
- ❌ WebAuthn partiel (limitation documentée)

---

## Vulnérabilités connues et limitations

### Limitations documentées

Les points suivants sont **connus et documentés**, ils ne constituent pas
des vulnérabilités au sens strict :

#### PIN à 4 chiffres

Un PIN à 4 chiffres représente **10 000 combinaisons**. Même avec PBKDF2
150 000 itérations (≈ 100 ms par essai), une attaque par force brute
prendrait :

- **~17 minutes** en local sur un appareil rapide (théorique)
- **Beaucoup plus** avec le délai croissant après échecs

**Mesures d'atténuation** :
- Délai exponentiel après 3 échecs
- Auto-lock configurable
- PBKDF2 (ralentit les attaques)

**Ce que le PIN protège** : accès casual (personne qui prend le téléphone
déverrouillé).
**Ce que le PIN ne protège pas** : attaquant avec accès au système de
fichiers (profil navigateur).

#### Chiffrement AES non activé

L'infrastructure AES-GCM est **prête** (`S.crypto.encrypt/decrypt`) mais
les notes ne sont **pas encore chiffrées au repos**. Les données dans
IndexedDB sont en clair.

**Prévu en V1.3** : chiffrement des champs `notes` et `sexualActivity.notes`.

#### Service Worker et contexte sécurisé

SERENA enregistre le fichier `sw.js` et référence `manifest.json` depuis son
répertoire. Le navigateur n'autorise ces fonctions que depuis HTTPS ou
`localhost`. Une ouverture directe en `file://` bloque le manifeste et le
Service Worker. Cette restriction est imposée par le navigateur et ne constitue
pas une vulnérabilité de SERENA.

#### WebAuthn partiel

Aucun credential n'est enregistré automatiquement. Le bouton biométrie
n'est donc jamais affiché en pratique. **Ce n'est pas une vulnérabilité**,
juste une fonctionnalité incomplète.

### Historique des vulnérabilités corrigées

#### V1.1 → V1.2 (2026-09-26)

| CVE | Description | Gravité | Statut |
|---|---|---|---|
| Aucune CVE | Hash PIN SHA-256 sans itérations | 🔴 Critique | ✅ Corrigé (PBKDF2) |
| Aucune CVE | XSS via `innerHTML` non échappé | 🟠 Majeur | ✅ Corrigé (`escapeHtml`) |
| Aucune CVE | PIN partiel persisté en cas d'interruption | 🟠 Majeur | ✅ Corrigé (transition atomique) |
| Aucune CVE | Auto-lock contournable par throttling | 🟡 Mineur | ✅ Corrigé (`visibilitychange`) |
| Aucune CVE | jsPDF depuis CDN compromettable | 🟡 Mineur | ✅ Supprimé (`window.print`) |

#### V1.0 → V1.1 (2026-09-15)

| Description | Gravité | Statut |
|---|---|---|
| localStorage sans chiffrement | 🟠 Majeur | ✅ Migré vers IndexedDB |
| Pas d'i18n (FR uniquement) | 🔵 Faible | ✅ Ajouté FR + EN |

---

## Bonnes pratiques pour les utilisatrices

### Sécurité de base

- **Choisir un PIN non trivial** (pas 1234, 0000, année de naissance)
- **Activer l'auto-lock** (5 minutes recommandé)
- **Verrouiller l'appareil** avec un code biométrique ou PIN fort
- **Activer le chiffrement disque** (BitLocker, FileVault, LUKS, iOS/Android)
- **Mettre à jour** le navigateur et le système régulièrement

### Sauvegarde

- **Exporter régulièrement** (Paramètres → Données → Exporter)
- **Stocker l'export** dans un endroit sûr (gestionnaire de mots de passe,
  cloud chiffré)
- **Ne pas partager** l'export avec des tiers non médicaux
- **Ne pas joindre** l'export à un email non chiffré

### Vie privée

- **Éviter les navigateurs partagés** (ordinateur public, famille)
- **Utiliser la navigation privée** sur appareils partagés (mais les données
  sont perdues à la fermeture)
- **Désactiver la synchronisation** navigateur pour ce site (Chrome Sync,
  Firefox Sync)
- **Vérifier les extensions** navigateur (certaines lisent toutes les pages)
- **Ne pas installer** SERENA sur un appareil non maîtrisé

### En cas de perte ou vol

1. **Révoquer** l'accès distant à l'appareil (Find My, Google Find)
2. **Effacer à distance** si possible
3. **Changer les mots de passe** partagés avec l'appareil
4. **Prévenir** les professionnels de santé si données sensibles exposées
5. **Restaurer** depuis un export JSON récent sur un nouvel appareil

---

## Reconnaissance des chercheurs

Les chercheurs en sécurité qui signalent des vulnérabilités de manière
responsable seront :

- **Crédités** dans le CHANGELOG (avec leur accord)
- **Mentionnés** dans cette page (section "Remerciements")
- **Contactés** pour discuter du correctif

### Souhaitez-vous l'anonymat ?

Précisez-le dans votre signalement. Nous respecterons votre choix.

### Remerciements

*(Aucun chercheur à remercier pour le moment.)*

---

## Conformité

### RGPD

SERENA traite des **données de santé** au sens de l'article 9 du RGPD.
En utilisation locale :

- Les auteurs ne traitent **aucune** donnée personnelle
- L'utilisatrice agit en **responsable de traitement** pour ses propres données
- Aucune obligation de déclaration CNIL n'incombe aux auteurs

### MDR (dispositif médical)

SERENA **n'est pas** un dispositif médical au sens du Règlement (UE)
2017/745. Elle ne diagnostique rien, ne traite rien, ne prévient rien.

### Autres juridictions

Les utilisatrices hors UE doivent vérifier la conformité locale
(lois nationales sur les données de santé, dispositifs médicaux).

---

## Contact sécurité

**NDJEFE MBAKOP ARNAUD**
IT — Cofondateur et Directeur du CFP-CMD
*Licence Administration Réseaux et Systèmes — CCNA, MTCNA*

- 📧 **ndjefe@gmail.com**
- 📱 **WhatsApp** : +237 679 449 165

**Merci de contribuer à la sécurité de SERENA.** 🔒