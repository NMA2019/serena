'use strict';
window.SERENA = window.SERENA || {};
const S = window.SERENA;

/* ============================================================
   BLOC 1 : UTILITAIRES DOM & SÉCURITÉ
   ============================================================ */

S.$  = (sel, root) => (root || document).querySelector(sel);
S.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/**
 * Crée un élément DOM.
 * ATTENTION : Ne pas passer de chaînes HTML dans `children`.
 * Utilisez `innerHTML` après création pour insérer du HTML/SVG.
 */
S.el = function(tag, attrs, children){
  const node = document.createElement(tag);
  if(attrs){
    for(const k in attrs){
      if(k === 'class') node.className = attrs[k];
      else if(k === 'dataset'){ Object.assign(node.dataset, attrs[k]); }
      else if(k === 'style' && typeof attrs[k] === 'object'){ Object.assign(node.style, attrs[k]); }
      else if(k.startsWith('on') && typeof attrs[k] === 'function'){
        node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      }
      else if(attrs[k] === true) node.setAttribute(k, '');
      else if(attrs[k] === false || attrs[k] == null) continue;
      else node.setAttribute(k, attrs[k]);
    }
  }
  if(children != null){
    const arr = Array.isArray(children) ? children : [children];
    arr.forEach(c => {
      if(c == null || c === false) return;
      // Si c'est un nœud DOM, on l'ajoute. Sinon on crée un texte.
      node.appendChild(typeof c === 'string' || typeof c === 'number'
        ? document.createTextNode(String(c))
        : c);
    });
  }
  return node;
};

S.escapeHtml = function(str){
  if(str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* ============================================================
   BLOC 2 : DATES & I18N
   ============================================================ */

S.dt = {
  toISO(y, m, d){
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  },
  parse(iso){
    const [y,m,d] = iso.split('-').map(Number);
    return {y,m,d};
  },
  toSerial(iso){
    const {y,m,d} = this.parse(iso);
    return Math.round(Date.UTC(y, m-1, d) / 86400000);
  },
  fromSerial(serial){
    const dt = new Date(serial * 86400000);
    return this.toISO(dt.getUTCFullYear(), dt.getUTCMonth()+1, dt.getUTCDate());
  },
  addDays(iso, n){
    return this.fromSerial(this.toSerial(iso) + n);
  },
  diffDays(isoA, isoB){
    return this.toSerial(isoB) - this.toSerial(isoA);
  },
  todayISO(){
    const n = new Date();
    return this.toISO(n.getFullYear(), n.getMonth()+1, n.getDate());
  },
  fmt(iso, withYear){
    if(!iso) return '—';
    const {y,m,d} = this.parse(iso);
    const months = S.lang === 'fr'
      ? ['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[m-1]}${withYear === false ? '' : ' ' + y}`;
  },
  fmtLong(iso){
    if(!iso) return '—';
    const {y,m,d} = this.parse(iso);
    const months = S.lang === 'fr'
      ? ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${d} ${months[m-1]} ${y}`;
  },
  monthLabel(y, m){
    const months = S.lang === 'fr'
      ? ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[m-1]} ${y}`;
  },
  dows(){
    return S.lang === 'fr'
      ? ['L','M','M','J','V','S','D']
      : ['M','T','W','T','F','S','S'];
  },
  age(birthISO){
    if(!birthISO) return null;
    const {y,m,d} = this.parse(birthISO);
    const today = new Date();
    let age = today.getFullYear() - y;
    const beforeBirthday = (today.getMonth()+1 < m) || (today.getMonth()+1 === m && today.getDate() < d);
    if(beforeBirthday) age--;
    return age;
  }
};

S.dict = {
fr: {
  tagline: "Comprendre son corps. Anticiper. Prendre soin de soi.",
  appName: "SERENA",
  lockTitle: "Application verrouillée",
  lockEnterPin: "Entrez votre code PIN",
  useBiometric: "Utiliser la biométrie",
  wrongPin: "Code incorrect",
  tryAgainIn: "Réessayez dans {n}s",
  pinCreated: "Code PIN créé",
  pinRequired: "Code à 4 chiffres requis",
  pinMismatch: "Les codes ne correspondent pas",
  confirmPin: "Confirmez le code",
  createPin: "Créer un code PIN",
  pinChangeOk: "Code PIN modifié",
  pinCurrentWrong: "PIN actuel incorrect",
  onbWelcomeTitle: "Bienvenue sur SERENA",
  onbWelcomeBody: "SERENA vous aide à comprendre votre cycle, suivre votre corps et anticiper — sans jugement, sans diagnostic.",
  onbPrivacyTitle: "Vos données restent chez vous",
  onbPrivacyBody: "Toutes vos données de santé sont stockées uniquement sur votre appareil. Aucun envoi automatique vers un serveur.",
  onbProfileTitle: "Votre profil",
  onbProfileBody: "Quelques informations pour personnaliser votre expérience. Tous les champs sont facultatifs.",
  onbCycleTitle: "Suivi du cycle",
  onbCycleBody: "Enregistrez vos règles pour obtenir des estimations personnalisées : jour du cycle, fenêtre fertile, ovulation potentielle.",
  onbImplantTitle: "Votre implant",
  onbImplantBody: "Si vous utilisez un implant contraceptif, SERENA peut suivre sa date d'expiration.",
  onbSecurityTitle: "Protégez votre application",
  onbSecurityBody: "Créez un code PIN pour verrouiller SERENA. Vous pourrez aussi activer la biométrie si votre appareil le permet.",
  onbName: "Prénom ou pseudonyme",
  onbNamePlaceholder: "Ex : Aïcha",
  onbBirth: "Date de naissance",
  onbImplantType: "Type d'implant",
  onbImplantDate: "Date de pose",
  onbSkipImplant: "— Plus tard —",
  onbSkip: "Passer",
  onbNext: "Suivant",
  onbBack: "Retour",
  onbStart: "Commencer",
  onbFinish: "Terminer",
  onbWelcome: "Bienvenue sur SERENA ✨",
  navDashboard: "Accueil",
  navCalendar: "Calendrier",
  navTracking: "Suivi",
  navPregnancy: "Grossesse",
  navProfile: "Profil",
  navFertility: "Fertilité",
  navTemperature: "Température",
  navJournal: "Journal",
  navSexual: "Activité",
  navImplant: "Implant",
  navReminders: "Rappels",
  navAppointments: "Rendez-vous",
  navReports: "Rapports",
  navSettings: "Paramètres",
  navSecurity: "Sécurité",
  navPrivacy: "Confidentialité",
  navAbout: "À propos",
  navHelp: "Aide",
  navContractions: "Contractions",
  navHealth: "Santé",
  greetingMorning: "Bonjour",
  greetingAfternoon: "Bon après-midi",
  greetingEvening: "Bonsoir",
  cycleDay: "Jour du cycle",
  nextPeriod: "Prochaines règles estimées",
  avgCycle: "Durée moy. du cycle",
  fertileWindow: "Fenêtre fertile",
  ovulation: "Ovulation potentielle",
  implantStatus: "État de l'implant",
  recentTemp: "Température récente",
  journalSummary: "Résumé du journal",
  todayReminders: "Rappels du jour",
  nextAppt: "Prochain rendez-vous",
  pregnancyStatus: "Grossesse en cours",
  phaseMenstruation: "Menstruation",
  phaseFollicular: "Phase folliculaire",
  phaseFertile: "Période fertile",
  phaseLuteal: "Phase lutéale",
  phasePregnancy: "Grossesse",
  noDataYet: "Aucune donnée enregistrée",
  registerPeriods: "Enregistrez vos règles",
  qaPeriod: "Règles",
  qaJournal: "Journal",
  qaTemp: "Température",
  qaReport: "Rapport",
  qaSymptoms: "Symptômes",
  qaNote: "Note",
  qaSex: "Rapport",
  estimation: "Estimation",
  confidenceLow: "Confiance FAIBLE",
  confidenceMed: "Confiance MOYENNE",
  confidenceHigh: "Confiance ÉLEVÉE",
  regularVery: "Très régulier",
  regularNormal: "Régulier",
  regularIrregular: "Irrégulier",
  regularInsufficient: "Données insuffisantes",
  periods: "Règles",
  spotting: "Spotting",
  flow: "Flux",
  flowLight: "Léger",
  flowMedium: "Moyen",
  flowHeavy: "Abondant",
  flowNone: "Aucun",
  intensity: "Intensité",
  startDate: "Date de début",
  endDate: "Date de fin",
  duration: "Durée",
  interval: "Intervalle",
  cycleHistory: "Historique des cycles",
  cycleEvolution: "Évolution des cycles",
  cycleSummary: "Résumé du cycle",
  lastPeriod: "Dernières règles",
  mood: "Humeur",
  pain: "Douleur",
  energy: "Énergie",
  sleep: "Sommeil",
  libido: "Libido",
  symptoms: "Symptômes",
  notes: "Notes",
  dailyJournal: "Journal du jour",
  journalLast30: "Derniers 30 jours",
  journalHistory: "Historique",
  journalEmpty: "Aucune entrée pour le moment",
  addEntry: "Ajouter l'entrée du jour",
  pregnancyJournal: "Journal grossesse",
  symCramps: "Crampes",
  symHeadache: "Maux de tête",
  symBreasts: "Seins sensibles",
  symBloating: "Ballonnements",
  symFatigue: "Fatigue",
  symNausea: "Nausées",
  symAcne: "Acné",
  symBack: "Dos",
  symDischarge: "Pertes",
  symOther: "Autre",
  mood1: "😢", mood2: "😕", mood3: "😐", mood4: "🙂", mood5: "😄",
  temperature: "Température basale",
  temperatureValue: "Valeur (°C)",
  temperatureHint: "Mesurez au réveil, avant tout effort, à la même heure chaque jour.",
  temperatureInvalid: "Valeur invalide (34–42 °C)",
  temperatureUnit: "Unité",
  temperatureMethod: "Méthode",
  methodOral: "Orale",
  methodVaginal: "Vaginale",
  methodBasal: "Basale",
  temperatureRise: "Hausse thermique détectée : ovulation probable il y a 2-3 jours.",
  temperatureNoRise: "Pas encore de hausse thermique nette ce cycle.",
  temperatureNeedMore: "Enregistrez 3+ températures",
  temperatureChart: "Courbe de température basale",
  fertilityWarning: "Les périodes fertiles affichées sont des estimations et ne constituent pas une méthode contraceptive.",
  ovulationNote: "Ovulation potentiellement détectée — jamais confirmée médicalement.",
  fertileToday: "Jour fertile",
  fertileNotToday: "Hors période fertile",
  fertileNext: "Prochaine : {date}",
  sexualWarning: "Le suivi des rapports ne permet pas à lui seul de déterminer le risque de grossesse.",
  protectedSex: "Protégé",
  unprotectedSex: "Non protégé",
  contraception: "Contraception",
  contraceptionPlaceholder: "ex : préservatif, pilule",
  privateNote: "Note privée",
  logSex: "Enregistrer un rapport",
  implantWarning: "La date affichée est calculée à partir des informations enregistrées. Vérifiez la durée applicable à votre implant avec votre professionnel de santé.",
  implantActive: "Implant en cours",
  implantHistory: "Historique",
  implantAdd: "Ajouter un implant",
  implantType: "Type d'implant",
  implantDate: "Date de pose",
  implantArm: "Bras de pose",
  armLeft: "Gauche",
  armRight: "Droit",
  implantProvider: "Professionnel (optionnel)",
  implantDaysLeft: "{n} jours restants",
  implantExpired: "Expiré depuis {n} jours",
  implantBadgeActive: "Actif",
  implantBadgeSoon: "Bientôt",
  implantBadgeExpired: "Expiré",
  implantBadgeRemoved: "Retiré",
  implantRemove: "Marquer comme retiré",
  implantEndDate: "Fin estimée",
  implantNoData: "Aucun implant enregistré",
  pregnancy: "Ma grossesse",
  pregnancyWeeks: "Semaine d'aménorrhée",
  pregnancyStart: "Démarrer un suivi",
  pregnancyStartDesc: "Renseignez la date de vos dernières règles (DDR) ou votre date probable d'accouchement (DPA).",
  pregnancyEnd: "Arrêter le suivi",
  pregnancyEndConfirm: "Arrêter le suivi de grossesse ?",
  pregnancyJournalBtn: "Journal grossesse",
  pregnancyTips: "Conseils de la semaine",
  pregnancyMilestones: "Jalons de suivi",
  pregnancyConsultations: "Prochaines consultations",
  pregnancyConsultList: "• 1er trimestre : 1 consultation mensuelle\n• 2e trimestre : 1 consultation par mois\n• 3e trimestre : 1 consultation tous les 15 jours\n• + échographies à 12 SA, 22 SA, 32 SA",
  lmp: "Date des dernières règles (DDR)",
  conception: "Date de conception (optionnelle)",
  providedEdd: "DPA fournie par un professionnel",
  edd: "DPA estimée",
  trimester: "Trimestre",
  trimester1: "1er trimestre",
  trimester2: "2e trimestre",
  trimester3: "3e trimestre",
  daysSinceDDR: "{n} jours de grossesse",
  daysLeft: "Il reste {n} jours",
  weeksAndDays: "{w} SA + {d}j",
  noPregnancy: "Aucune grossesse en cours",
  contractionStart: "DÉBUT",
  contractionEnd: "FIN",
  contractionSave: "Enregistrer une contraction",
  contractionDuration: "Durée (minutes)",
  contractionRecent: "Contractions récentes",
  contractionTimerNote: "Ce chronomètre ne diagnostique pas le travail.",
  contractionNoData: "Aucune contraction enregistrée",
  appointments: "Mes RDV",
  appointmentAdd: "Ajouter un RDV",
  appointmentLabel: "Libellé",
  appointmentLabelPlaceholder: "Ex : Échographie T2",
  appointmentDate: "Date",
  appointmentTime: "Heure",
  appointmentType: "Type",
  appointmentProfessional: "Professionnel",
  appointmentFacility: "Établissement",
  appointmentNone: "Aucun RDV à venir",
  apptTypeConsultation: "Consultation",
  apptTypeUltrasound: "Échographie",
  apptTypeExam: "Examen",
  apptTypeFollowup: "Suivi grossesse",
  apptTypeImplant: "Implant",
  apptTypeOther: "Autre",
  reminders: "Rappels",
  reminderAdd: "Ajouter un rappel",
  reminderType: "Type",
  reminderDate: "Date",
  reminderTime: "Heure",
  reminderNone: "Aucun rappel",
  reminderPeriod: "Règles",
  reminderTemp: "Température",
  reminderJournal: "Journal",
  reminderImplant: "Implant",
  reminderAppt: "Rendez-vous",
  reminderPregnancy: "Grossesse",
  reminderNotifications: "Notifications",
  reminderEnable: "Activer les notifications",
  reminderNotSupported: "Notifications non supportées",
  reminderPermissionDenied: "Permission refusée",
  reminderPermissionGranted: "Notifications activées 🔔",
  reports: "Rapports",
  exportPdf: "Exporter mon dossier (PDF)",
  exportData: "Exporter mes données",
  importData: "Importer mes données",
  doctorMode: "Mode médecin",
  doctorModeSelect: "Sélectionnez les données à inclure dans le rapport imprimable.",
  reportGenerated: "Rapport généré le",
  reportDisclaimer: "Document généré à partir des données saisies par l'utilisatrice. Ce document ne constitue pas un diagnostic médical.",
  patientInfo: "Informations patiente",
  exportSuccess: "Export terminé",
  importSuccess: "Import réussi",
  importInvalid: "Fichier invalide",
  importConfirm: "Fusionner avec les données existantes ?",
  settings: "Paramètres",
  appearance: "Apparence",
  language: "Langue",
  theme: "Thème",
  themeLight: "Clair",
  themeDark: "Sombre",
  themeSystem: "Système",
  security: "Sécurité",
  data: "Données",
  about: "À propos",
  help: "Aide",
  statusPage: "État technique",
  runTests: "Lancer les auto-tests",
  cycleLength: "Durée du cycle (jours)",
  periodLength: "Durée des règles (jours)",
  lutealPhase: "Phase lutéale (jours)",
  lutealPhaseHint: "14 jours est la valeur standard. Ajustez si vous connaissez votre phase lutéale.",
  defaultCycle: "Durée du cycle par défaut",
  temperatureUnitSetting: "Unité de température",
  notifTime: "Heure du rappel quotidien",
  enableAutoLock: "Verrouillage auto",
  never: "Jamais",
  min1: "1 min",
  min5: "5 min",
  min15: "15 min",
  min30: "30 min",
  changePin: "Changer le PIN",
  currentPin: "PIN actuel",
  newPin: "Nouveau PIN",
  confirmNewPin: "Confirmer le nouveau PIN",
  deleteAllTitle: "Supprimer toutes mes données",
  deleteAllWarn: "Cette action est irréversible.",
  deleteAllConfirm2: "Confirmez une seconde fois.",
  deleteAllDone: "Toutes les données ont été supprimées",
  loadDemo: "Charger les données de démonstration",
  clearDemo: "Effacer les données de démonstration",
  demoLoaded: "Données de démo chargées",
  demoCleared: "Données de démo effacées",
  saved: "Enregistré",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  close: "Fermer",
  add: "Ajouter",
  confirm: "Confirmer",
  today: "Aujourd'hui",
  yesterday: "Hier",
  date: "Date",
  time: "Heure",
  none: "Aucun(e)",
  all: "Tout",
  optional: "facultatif",
  dateRequired: "Date requise",
  fieldsRequired: "Champs requis",
  valueInvalid: "Valeur invalide",
  endBeforeStart: "La date de fin doit être après la date de début",
  seeWhenConsult: "Quand consulter un professionnel de santé ?",
  consultList: "Douleur intense ou inhabituelle • Saignement anormalement abondant • Fièvre • Malaise important • Symptômes inquiétants pendant la grossesse • Problème supposé lié à l'implant",
  medicalFooter: "SERENA est un outil de suivi personnel. Il ne remplace pas un avis médical.",
  aboutDisclaimer: "SERENA ne diagnostique aucune maladie, ne confirme aucune grossesse ni ovulation, ne garantit aucune période sans risque et ne remplace pas un professionnel de santé.",
  privacyBody: "Toutes vos données de santé sont stockées localement sur votre appareil, dans une base IndexedDB nommée SERENA_DB. Aucune donnée n'est envoyée automatiquement vers un serveur, il n'y a aucun outil d'analyse, ni publicité, ni traçage.",
  privacyExport: "Vous pouvez exporter vos données au format JSON à tout moment, ou tout supprimer définitivement depuis Paramètres → Données.",
  helpBody: "Naviguez via les onglets (bas sur mobile, gauche sur ordinateur). Le tableau de bord résume votre cycle et vos rappels. Le calendrier affiche vos règles, fenêtre fertile estimée et ovulation potentielle. Chaque module (température, journal, activité, implant, grossesse) permet d'ajouter et consulter vos données.",
  helpEstimates: "Toutes les estimations sont clairement identifiées comme telles et ne remplacent jamais un avis médical.",
  securityBody: "SERENA protège l'accès à vos données avec un code PIN à 4 chiffres, dérivé et haché avec PBKDF2 (Web Crypto API) — le PIN n'est jamais stocké en clair.",
  securityBiometric: "La biométrie (WebAuthn) est proposée en complément lorsque votre navigateur/appareil la supporte, avec le PIN comme solution de repli.",
  securityDataEncrypted: "Vos notes et données sensibles sont chiffrées au repos avec AES-GCM.",
  offlineBadge: "Hors-ligne — données locales uniquement",
  onlineRestored: "Connexion rétablie",
  installApp: "Installer SERENA",
  installAppHint: "Ajoutez SERENA à votre écran d'accueil pour un accès rapide.",
  errIndexedDB: "IndexedDB indisponible — mode dégradé",
  errSave: "Erreur de sauvegarde",
  errLoad: "Erreur de chargement",
  errCrypto: "Erreur cryptographique",
  errGeneric: "Une erreur est survenue",
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
  preg_ms_8_label: "1ère consultation prénatale",
  preg_ms_8_desc: "Confirmation, bilan sanguin",
  preg_ms_12_label: "Échographie 1er trimestre",
  preg_ms_12_desc: "Datation + clarté nucale (11-13 SA)",
  preg_ms_16_label: "Consultation mensuelle",
  preg_ms_16_desc: "Suivi tension, poids, hauteur utérine",
  preg_ms_22_label: "Échographie morphologique",
  preg_ms_22_desc: "Examen détaillé des organes",
  preg_ms_24_label: "Dépistage diabète gestationnel",
  preg_ms_24_desc: "Test HGPO",
  preg_ms_28_label: "Consultation + injection anti-D si Rh-",
  preg_ms_28_desc: "Prévention allo-immunisation",
  preg_ms_32_label: "Échographie de croissance",
  preg_ms_32_desc: "Poids, position, liquide amniotique",
  preg_ms_36_label: "Consultation pré-anesthésique",
  preg_ms_36_desc: "Préparation accouchement",
  preg_ms_38_label: "Consultation de terme",
  preg_ms_38_desc: "Surveillance rapprochée",
  preg_ms_40_label: "DPA — Terme",
  preg_ms_40_desc: "Surveillance du travail",
  regularity: "Régularité",
  actions: "Actions",
},
en: {
  tagline: "Understand your body. Anticipate. Take care of yourself.",
  appName: "SERENA",
  lockTitle: "App locked",
  lockEnterPin: "Enter your PIN code",
  useBiometric: "Use biometrics",
  wrongPin: "Wrong code",
  tryAgainIn: "Try again in {n}s",
  pinCreated: "PIN created",
  pinRequired: "4-digit code required",
  pinMismatch: "Codes do not match",
  confirmPin: "Confirm the code",
  createPin: "Create a PIN",
  pinChangeOk: "PIN changed",
  pinCurrentWrong: "Current PIN incorrect",
  onbWelcomeTitle: "Welcome to SERENA",
  onbWelcomeBody: "SERENA helps you understand your cycle, track your body and plan ahead — no judgment, no diagnosis.",
  onbPrivacyTitle: "Your data stays with you",
  onbPrivacyBody: "All your health data is stored only on your device. Nothing is sent to a server automatically.",
  onbProfileTitle: "Your profile",
  onbProfileBody: "A few details to personalize your experience. All fields are optional.",
  onbCycleTitle: "Cycle tracking",
  onbCycleBody: "Log your periods to get personalized estimates: cycle day, fertile window, potential ovulation.",
  onbImplantTitle: "Your implant",
  onbImplantBody: "If you use a contraceptive implant, SERENA can track its expiration date.",
  onbSecurityTitle: "Protect your app",
  onbSecurityBody: "Create a PIN code to lock SERENA. You can also enable biometrics if your device supports it.",
  onbName: "First name or nickname",
  onbNamePlaceholder: "e.g. Aïcha",
  onbBirth: "Date of birth",
  onbImplantType: "Implant type",
  onbImplantDate: "Insertion date",
  onbSkipImplant: "— Later —",
  onbSkip: "Skip",
  onbNext: "Next",
  onbBack: "Back",
  onbStart: "Get started",
  onbFinish: "Finish",
  onbWelcome: "Welcome to SERENA ✨",
  navDashboard: "Home",
  navCalendar: "Calendar",
  navTracking: "Tracking",
  navPregnancy: "Pregnancy",
  navProfile: "Profile",
  navFertility: "Fertility",
  navTemperature: "Temperature",
  navJournal: "Journal",
  navSexual: "Activity",
  navImplant: "Implant",
  navReminders: "Reminders",
  navAppointments: "Appointments",
  navReports: "Reports",
  navSettings: "Settings",
  navSecurity: "Security",
  navPrivacy: "Privacy",
  navAbout: "About",
  navHelp: "Help",
  navContractions: "Contractions",
  navHealth: "Health",
  greetingMorning: "Good morning",
  greetingAfternoon: "Good afternoon",
  greetingEvening: "Good evening",
  cycleDay: "Cycle day",
  nextPeriod: "Estimated next period",
  avgCycle: "Avg. cycle length",
  fertileWindow: "Fertile window",
  ovulation: "Potential ovulation",
  implantStatus: "Implant status",
  recentTemp: "Recent temperature",
  journalSummary: "Journal summary",
  todayReminders: "Today's reminders",
  nextAppt: "Next appointment",
  pregnancyStatus: "Pregnancy in progress",
  phaseMenstruation: "Menstruation",
  phaseFollicular: "Follicular phase",
  phaseFertile: "Fertile window",
  phaseLuteal: "Luteal phase",
  phasePregnancy: "Pregnancy",
  noDataYet: "No data recorded",
  registerPeriods: "Log your periods",
  qaPeriod: "Period",
  qaJournal: "Journal",
  qaTemp: "Temperature",
  qaReport: "Report",
  qaSymptoms: "Symptoms",
  qaNote: "Note",
  qaSex: "Intercourse",
  estimation: "Estimate",
  confidenceLow: "LOW confidence",
  confidenceMed: "MEDIUM confidence",
  confidenceHigh: "HIGH confidence",
  regularVery: "Very regular",
  regularNormal: "Regular",
  regularIrregular: "Irregular",
  regularInsufficient: "Insufficient data",
  periods: "Periods",
  spotting: "Spotting",
  flow: "Flow",
  flowLight: "Light",
  flowMedium: "Medium",
  flowHeavy: "Heavy",
  flowNone: "None",
  intensity: "Intensity",
  startDate: "Start date",
  endDate: "End date",
  duration: "Duration",
  interval: "Interval",
  cycleHistory: "Cycle history",
  cycleEvolution: "Cycle evolution",
  cycleSummary: "Cycle summary",
  lastPeriod: "Last period",
  mood: "Mood",
  pain: "Pain",
  energy: "Energy",
  sleep: "Sleep",
  libido: "Libido",
  symptoms: "Symptoms",
  notes: "Notes",
  dailyJournal: "Today's journal",
  journalLast30: "Last 30 days",
  journalHistory: "History",
  journalEmpty: "No entry yet",
  addEntry: "Add today's entry",
  pregnancyJournal: "Pregnancy journal",
  symCramps: "Cramps",
  symHeadache: "Headache",
  symBreasts: "Tender breasts",
  symBloating: "Bloating",
  symFatigue: "Fatigue",
  symNausea: "Nausea",
  symAcne: "Acne",
  symBack: "Back pain",
  symDischarge: "Discharge",
  symOther: "Other",
  mood1: "😢", mood2: "😕", mood3: "😐", mood4: "🙂", mood5: "😄",
  temperature: "Basal temperature",
  temperatureValue: "Value (°C)",
  temperatureHint: "Measure on waking, before any effort, at the same time every day.",
  temperatureInvalid: "Invalid value (34–42 °C)",
  temperatureUnit: "Unit",
  temperatureMethod: "Method",
  methodOral: "Oral",
  methodVaginal: "Vaginal",
  methodBasal: "Basal",
  temperatureRise: "Thermal rise detected: ovulation likely 2-3 days ago.",
  temperatureNoRise: "No clear thermal rise yet this cycle.",
  temperatureNeedMore: "Log 3+ temperatures",
  temperatureChart: "Basal temperature chart",
  fertilityWarning: "Fertile windows shown are estimates and are not a contraceptive method.",
  ovulationNote: "Ovulation potentially detected — never medically confirmed.",
  fertileToday: "Fertile day",
  fertileNotToday: "Outside fertile window",
  fertileNext: "Next: {date}",
  sexualWarning: "Tracking intercourse alone cannot determine pregnancy risk.",
  protectedSex: "Protected",
  unprotectedSex: "Unprotected",
  contraception: "Contraception",
  contraceptionPlaceholder: "e.g. condom, pill",
  privateNote: "Private note",
  logSex: "Log intercourse",
  implantWarning: "The date shown is calculated from the information you entered. Check the duration for your implant with your healthcare professional.",
  implantActive: "Active implant",
  implantHistory: "History",
  implantAdd: "Add an implant",
  implantType: "Implant type",
  implantDate: "Insertion date",
  implantArm: "Arm",
  armLeft: "Left",
  armRight: "Right",
  implantProvider: "Healthcare professional (optional)",
  implantDaysLeft: "{n} days left",
  implantExpired: "Expired {n} days ago",
  implantBadgeActive: "Active",
  implantBadgeSoon: "Soon",
  implantBadgeExpired: "Expired",
  implantBadgeRemoved: "Removed",
  implantRemove: "Mark as removed",
  implantEndDate: "Estimated end",
  implantNoData: "No implant recorded",
  pregnancy: "My pregnancy",
  pregnancyWeeks: "Weeks of amenorrhea",
  pregnancyStart: "Start tracking",
  pregnancyStartDesc: "Enter your last menstrual period (LMP) or your estimated due date (EDD).",
  pregnancyEnd: "End tracking",
  pregnancyEndConfirm: "End pregnancy tracking?",
  pregnancyJournalBtn: "Pregnancy journal",
  pregnancyTips: "Weekly tips",
  pregnancyMilestones: "Milestones",
  pregnancyConsultations: "Upcoming consultations",
  pregnancyConsultList: "• 1st trimester: 1 monthly consultation\n• 2nd trimester: 1 monthly consultation\n• 3rd trimester: 1 consultation every 2 weeks\n• + ultrasounds at 12 WA, 22 WA, 32 WA",
  lmp: "Last menstrual period (LMP)",
  conception: "Conception date (optional)",
  providedEdd: "EDD provided by a professional",
  edd: "Estimated due date",
  trimester: "Trimester",
  trimester1: "1st trimester",
  trimester2: "2nd trimester",
  trimester3: "3rd trimester",
  daysSinceDDR: "{n} days pregnant",
  daysLeft: "{n} days left",
  weeksAndDays: "{w} WA + {d}d",
  noPregnancy: "No ongoing pregnancy",
  contractionStart: "START",
  contractionEnd: "STOP",
  contractionSave: "Log a contraction",
  contractionDuration: "Duration (minutes)",
  contractionRecent: "Recent contractions",
  contractionTimerNote: "This timer does not diagnose labor.",
  contractionNoData: "No contraction recorded",
  appointments: "My appointments",
  appointmentAdd: "Add appointment",
  appointmentLabel: "Label",
  appointmentLabelPlaceholder: "e.g. Anatomy scan",
  appointmentDate: "Date",
  appointmentTime: "Time",
  appointmentType: "Type",
  appointmentProfessional: "Professional",
  appointmentFacility: "Facility",
  appointmentNone: "No upcoming appointment",
  apptTypeConsultation: "Consultation",
  apptTypeUltrasound: "Ultrasound",
  apptTypeExam: "Exam",
  apptTypeFollowup: "Pregnancy follow-up",
  apptTypeImplant: "Implant",
  apptTypeOther: "Other",
  reminders: "Reminders",
  reminderAdd: "Add reminder",
  reminderType: "Type",
  reminderDate: "Date",
  reminderTime: "Time",
  reminderNone: "No reminder",
  reminderPeriod: "Period",
  reminderTemp: "Temperature",
  reminderJournal: "Journal",
  reminderImplant: "Implant",
  reminderAppt: "Appointment",
  reminderPregnancy: "Pregnancy",
  reminderNotifications: "Notifications",
  reminderEnable: "Enable notifications",
  reminderNotSupported: "Notifications not supported",
  reminderPermissionDenied: "Permission denied",
  reminderPermissionGranted: "Notifications enabled 🔔",
  reports: "Reports",
  exportPdf: "Export my record (PDF)",
  exportData: "Export my data",
  importData: "Import my data",
  doctorMode: "Doctor mode",
  doctorModeSelect: "Choose which data to include in the printable report.",
  reportGenerated: "Report generated on",
  reportDisclaimer: "Document generated from data entered by the user. This document is not a medical diagnosis.",
  patientInfo: "Patient information",
  exportSuccess: "Export complete",
  importSuccess: "Import successful",
  importInvalid: "Invalid file",
  importConfirm: "Merge with existing data?",
  settings: "Settings",
  appearance: "Appearance",
  language: "Language",
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  security: "Security",
  data: "Data",
  about: "About",
  help: "Help",
  statusPage: "Technical status",
  runTests: "Run self-tests",
  cycleLength: "Cycle length (days)",
  periodLength: "Period length (days)",
  lutealPhase: "Luteal phase (days)",
  lutealPhaseHint: "14 days is the standard value. Adjust if you know your luteal phase.",
  defaultCycle: "Default cycle length",
  temperatureUnitSetting: "Temperature unit",
  notifTime: "Daily reminder time",
  enableAutoLock: "Auto-lock",
  never: "Never",
  min1: "1 min",
  min5: "5 min",
  min15: "15 min",
  min30: "30 min",
  changePin: "Change PIN",
  currentPin: "Current PIN",
  newPin: "New PIN",
  confirmNewPin: "Confirm new PIN",
  deleteAllTitle: "Delete all my data",
  deleteAllWarn: "This action is irreversible.",
  deleteAllConfirm2: "Confirm a second time.",
  deleteAllDone: "All data deleted",
  loadDemo: "Load demo data",
  clearDemo: "Clear demo data",
  demoLoaded: "Demo data loaded",
  demoCleared: "Demo data cleared",
  saved: "Saved",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  close: "Close",
  add: "Add",
  confirm: "Confirm",
  today: "Today",
  yesterday: "Yesterday",
  date: "Date",
  time: "Time",
  none: "None",
  all: "All",
  optional: "optional",
  dateRequired: "Date required",
  fieldsRequired: "Required fields",
  valueInvalid: "Invalid value",
  endBeforeStart: "End date must be after start date",
  seeWhenConsult: "When to see a healthcare professional?",
  consultList: "Severe or unusual pain • Abnormally heavy bleeding • Fever • Significant discomfort • Worrying pregnancy symptoms • Suspected implant issue",
  medicalFooter: "SERENA is a personal tracking tool. It does not replace medical advice.",
  aboutDisclaimer: "SERENA does not diagnose any condition, does not confirm pregnancy or ovulation, does not guarantee any risk-free period, and does not replace a healthcare professional.",
  privacyBody: "All your health data is stored locally on your device, in an IndexedDB database named SERENA_DB. No data is automatically sent to a server; there is no analytics, advertising, or tracking.",
  privacyExport: "You can export your data as JSON at any time, or permanently delete everything from Settings → Data.",
  helpBody: "Navigate with the tabs (bottom on mobile, left on desktop). The dashboard summarizes your cycle and reminders. The calendar shows periods, estimated fertile window and potential ovulation. Each module (temperature, journal, activity, implant, pregnancy) lets you add and review data.",
  helpEstimates: "All estimates are clearly labeled as such and never replace medical advice.",
  securityBody: "SERENA protects access to your data with a 4-digit PIN, derived and hashed with PBKDF2 (Web Crypto API) — the PIN is never stored in plain text.",
  securityBiometric: "Biometrics (WebAuthn) are offered as a complement when your browser/device supports it, with the PIN as a fallback.",
  securityDataEncrypted: "Your notes and sensitive data are encrypted at rest with AES-GCM.",
  offlineBadge: "Offline — local data only",
  onlineRestored: "Connection restored",
  installApp: "Install SERENA",
  installAppHint: "Add SERENA to your home screen for quick access.",
  errIndexedDB: "IndexedDB unavailable — degraded mode",
  errSave: "Save error",
  errLoad: "Load error",
  errCrypto: "Crypto error",
  errGeneric: "An error occurred",
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
  preg_ms_8_label: "1st prenatal visit",
  preg_ms_8_desc: "Confirmation, blood work",
  preg_ms_12_label: "1st trimester ultrasound",
  preg_ms_12_desc: "Dating + nuchal translucency (11-13 WA)",
  preg_ms_16_label: "Monthly consultation",
  preg_ms_16_desc: "Blood pressure, weight, fundal height",
  preg_ms_22_label: "Anatomy scan",
  preg_ms_22_desc: "Detailed organ examination",
  preg_ms_24_label: "Gestational diabetes screening",
  preg_ms_24_desc: "OGTT test",
  preg_ms_28_label: "Consultation + anti-D if Rh-",
  preg_ms_28_desc: "Alloimmunization prevention",
  preg_ms_32_label: "Growth ultrasound",
  preg_ms_32_desc: "Weight, position, amniotic fluid",
  preg_ms_36_label: "Pre-anesthesia consultation",
  preg_ms_36_desc: "Birth preparation",
  preg_ms_38_label: "Term consultation",
  preg_ms_38_desc: "Close monitoring",
  preg_ms_40_label: "EDD — Term",
  preg_ms_40_desc: "Labor monitoring",
  regularity: "Regularity",
  actions: "Actions",
}
};

S.lang = (localStorage.getItem('serena_lang') || (navigator.language || 'fr').slice(0,2));
if(!S.dict[S.lang]) S.lang = 'fr';

S.t = function(key, vars){
  const raw = (S.dict[S.lang] && S.dict[S.lang][key])
    || (S.dict.fr && S.dict.fr[key])
    || key;
  if(!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
};

S.applyI18n = function(root){
  S.$$('[data-i18n]', root || document).forEach(el => {
    const key = el.dataset.i18n;
    const txt = S.t(key);
    if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
      if(el.placeholder) el.placeholder = txt;
      else el.value = txt;
    } else {
      el.textContent = txt;
    }
  });
  S.$$('[data-i18n-aria]', root || document).forEach(el => {
    el.setAttribute('aria-label', S.t(el.dataset.i18nAria));
  });
  document.documentElement.lang = S.lang;
};

/* ============================================================
   BLOC 3 : CRYPTO & STOCKAGE
   ============================================================ */

S.crypto = {
  b64encode(bytes){
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  },
  b64decode(str){
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
  },
  async hashPin(pin, saltB64){
    const enc = new TextEncoder();
    let salt;
    if(saltB64) salt = this.b64decode(saltB64);
    else salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    return {
      hash: this.b64encode(bits),
      salt: this.b64encode(salt)
    };
  },
  async verifyPin(pin, storedHash, storedSalt){
    try{
      const { hash } = await this.hashPin(pin, storedSalt);
      return hash === storedHash;
    }catch(e){ return false; }
  },
  async deriveAesKey(pin, saltB64){
    const enc = new TextEncoder();
    const salt = saltB64 ? this.b64decode(saltB64) : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
    return { key, salt: this.b64encode(salt) };
  },
  async encrypt(key, plaintext){
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key, enc.encode(plaintext)
    );
    return {
      iv: this.b64encode(iv),
      ct: this.b64encode(ciphertext)
    };
  },
  async decrypt(key, ivB64, ctB64){
    const dec = new TextDecoder();
    const iv = this.b64decode(ivB64);
    const ct = this.b64decode(ctB64);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key, ct
    );
    return dec.decode(plaintext);
  }
};

S.DB_NAME = 'SERENA_DB';
S.DB_VERSION = 2;
S.STORES = [
  'profile', 'periods', 'dailyLogs', 'temperatures',
  'sexualActivity', 'implant', 'pregnancy', 'appointments',
  'reminders', 'contractions', 'settings', 'security'
];
S.db = null;
S.dbAvailable = false;

S.openDB = function(){
  return new Promise((resolve, reject) => {
    if(!('indexedDB' in window)){
      reject(new Error('no-indexeddb'));
      return;
    }
    const req = indexedDB.open(S.DB_NAME, S.DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      S.STORES.forEach(name => {
        if(!db.objectStoreNames.contains(name)){
          db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
    req.onsuccess = (e) => {
      S.db = e.target.result;
      S.dbAvailable = true;
      S.db.onversionchange = () => { S.db.close(); S.dbAvailable = false; };
      resolve(S.db);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('indexeddb-blocked'));
  });
};

S.tx = function(store, mode){
  return S.db.transaction(store, mode || 'readonly').objectStore(store);
};

S.dbAdd = function(store, obj){
  return new Promise((res, rej) => {
    const now = new Date().toISOString();
    obj.createdAt = obj.createdAt || now;
    obj.updatedAt = now;
    const r = S.tx(store, 'readwrite').add(obj);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
};

S.dbPut = function(store, obj){
  return new Promise((res, rej) => {
    obj.updatedAt = new Date().toISOString();
    const r = S.tx(store, 'readwrite').put(obj);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
};

S.dbDelete = function(store, id){
  return new Promise((res, rej) => {
    const r = S.tx(store, 'readwrite').delete(id);
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
};

S.dbGet = function(store, id){
  return new Promise((res, rej) => {
    const r = S.tx(store).get(id);
    r.onsuccess = () => res(r.result || null);
    r.onerror = () => rej(r.error);
  });
};

S.dbGetAll = function(store){
  return new Promise((res, rej) => {
    const r = S.tx(store).getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
};

S.dbClear = function(store){
  return new Promise((res, rej) => {
    const r = S.tx(store, 'readwrite').clear();
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
};

S.dbClearAll = async function(){
  for(const s of S.STORES){ await S.dbClear(s); }
};

S.LS_KEY = 'serena_fallback_v12';

S.lsLoad = function(){
  try{
    const raw = localStorage.getItem(S.LS_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
};

S.lsSave = function(data){
  try{
    localStorage.setItem(S.LS_KEY, JSON.stringify(data));
    return true;
  }catch(e){
    S.toast(S.t('errSave'));
    return false;
  }
};

S.toast = function(msg, opts){
  const wrap = S.$('#toastwrap');
  if(!wrap) return;
  const el = S.el('div', { class: 'toast', role: 'status' }, msg);
  wrap.appendChild(el);
  const duration = (opts && opts.duration) || 2600;
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, duration);
};

S.prefs = {
  get(key, fallback){
    try{
      const v = localStorage.getItem('serena_' + key);
      return v == null ? fallback : JSON.parse(v);
    }catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem('serena_' + key, JSON.stringify(value)); }
    catch(e){ /* quota / mode privé */ }
  },
  remove(key){
    try{ localStorage.removeItem('serena_' + key); }catch(e){}
  }
};

S.applyTheme = function(){
  const pref = S.prefs.get('theme', 'system');
  if(pref === 'system'){
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', pref);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta){
    const dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    meta.setAttribute('content', dark ? '#1A1428' : '#4A2B7A');
  }
};

S.cycleTheme = function(){
  const order = ['system', 'dark', 'light'];
  const cur = S.prefs.get('theme', 'system');
  const next = order[(order.indexOf(cur) + 1) % order.length];
  S.prefs.set('theme', next);
  S.applyTheme();
  S.toast(S.t('theme') + ' : ' + S.t(next === 'system' ? 'themeSystem' : next === 'dark' ? 'themeDark' : 'themeLight'));
};

S.applyTheme();

S.state = {
  profile: null,
  periods: [],
  dailyLogs: [],
  temperatures: [],
  sexualActivity: [],
  implant: null,
  implants: [],
  pregnancy: null,
  pregnancies: [],
  appointments: [],
  reminders: [],
  contractions: [],
  settings: {
    id: 1,
    avgCycleLength: 28,
    periodLength: 5,
    lutealPhase: 14,
    tempUnit: 'C',
    notifTime: '20:00',
    notifications: false,
    demoLoaded: false
  },
  security: null,
  route: 'dashboard',
  routeParam: null,
  isPregnant: false,
  aesKey: null,
  unlocked: false
};

S.reloadAll = async function(){
  if(!S.dbAvailable){
    const data = S.lsLoad();
    if(data){
      S.state.profile = data.profile || null;
      S.state.periods = data.periods || [];
      S.state.dailyLogs = data.dailyLogs || [];
      S.state.temperatures = data.temperatures || [];
      S.state.sexualActivity = data.sexualActivity || [];
      S.state.implant = data.implant || null;
      S.state.implants = data.implants || (data.implant ? [data.implant] : []);
      S.state.pregnancy = data.pregnancy || null;
      S.state.pregnancies = data.pregnancies || (data.pregnancy ? [data.pregnancy] : []);
      S.state.appointments = data.appointments || [];
      S.state.reminders = data.reminders || [];
      S.state.contractions = data.contractions || [];
      if(data.settings) Object.assign(S.state.settings, data.settings);
      S.state.security = data.security || null;
    }
    S.state.isPregnant = !!(S.state.pregnancy && S.state.pregnancy.active);
    return;
  }

  const [
    profileArr, periods, dailyLogs, temperatures, sexualActivity,
    implantArr, pregnancyArr, appointments, reminders, contractions,
    settingsArr, securityArr
  ] = await Promise.all([
    S.dbGetAll('profile'),
    S.dbGetAll('periods'),
    S.dbGetAll('dailyLogs'),
    S.dbGetAll('temperatures'),
    S.dbGetAll('sexualActivity'),
    S.dbGetAll('implant'),
    S.dbGetAll('pregnancy'),
    S.dbGetAll('appointments'),
    S.dbGetAll('reminders'),
    S.dbGetAll('contractions'),
    S.dbGetAll('settings'),
    S.dbGetAll('security')
  ]);

  S.state.profile = profileArr[0] || null;
  S.state.periods = periods;
  S.state.dailyLogs = dailyLogs;
  S.state.temperatures = temperatures;
  S.state.sexualActivity = sexualActivity;
  S.state.implants = implantArr;
  S.state.implant = implantArr
    .filter(i => !i.retire)
    .sort((a,b) => S.dt.toSerial(b.insertionDate) - S.dt.toSerial(a.insertionDate))[0] || null;
  S.state.pregnancies = pregnancyArr;
  S.state.pregnancy = pregnancyArr.find(p => p.active) || null;
  S.state.appointments = appointments;
  S.state.reminders = reminders;
  S.state.contractions = contractions;
  if(settingsArr[0]) Object.assign(S.state.settings, settingsArr[0]);
  S.state.security = securityArr[0] || null;
  S.state.isPregnant = !!(S.state.pregnancy && S.state.pregnancy.active);
};

S.persistFallback = function(){
  if(S.dbAvailable) return;
  S.lsSave({
    profile: S.state.profile,
    periods: S.state.periods,
    dailyLogs: S.state.dailyLogs,
    temperatures: S.state.temperatures,
    sexualActivity: S.state.sexualActivity,
    implant: S.state.implant,
    implants: S.state.implants,
    pregnancy: S.state.pregnancy,
    pregnancies: S.state.pregnancies,
    appointments: S.state.appointments,
    reminders: S.state.reminders,
    contractions: S.state.contractions,
    settings: S.state.settings,
    security: S.state.security
  });
};

S.storageInfo = async function(){
  const info = {
    indexedDB: 'indexedDB' in window,
    dbOpened: S.dbAvailable,
    webCrypto: !!(window.crypto && crypto.subtle),
    webAuthn: 'PublicKeyCredential' in window,
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    secureContext: window.isSecureContext,
    localStorage: (() => { try{ localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }catch(e){ return false; } })(),
    quota: null
  };
  if(navigator.storage && navigator.storage.estimate){
    try{
      const est = await navigator.storage.estimate();
      info.quota = {
        usage: est.usage,
        quota: est.quota,
        percent: est.quota ? Math.round((est.usage / est.quota) * 100) : 0
      };
    }catch(e){}
  }
  return info;
};

/* ============================================================
   BLOC 4 : ALGORITHMES MÉTIER (CALCULS)
   ============================================================ */

S.calc = {};

S.calc.DEFAULTS = {
  CYCLE_LENGTH: 28,
  PERIOD_LENGTH: 5,
  LUTEAL_PHASE: 14,
  FERTILE_BEFORE_OVU: 5,
  FERTILE_AFTER_OVU: 1,
  MIN_CYCLE: 15,
  MAX_CYCLE: 60,
  MIN_PERIOD: 1,
  MAX_PERIOD: 10,
  TEMP_RISE_THRESHOLD: 0.2,
  TEMP_UNIT: 'C'
};

S.calc.toCelsius = function(value, unit){
  if(unit === 'F') return (value - 32) * 5 / 9;
  return value;
};

S.calc.toFahrenheit = function(value, unit){
  if(unit === 'C') return value * 9 / 5 + 32;
  return value;
};

S.calc.normalizeTemps = function(temps){
  return temps.map(t => ({
    ...t,
    valueC: S.calc.toCelsius(t.value, t.unit || 'C')
  }));
};

S.calc.cycleDay = function(periods, refIso){
  if(!periods || !periods.length) return { value: null, lastStart: null, confidence: 'low' };
  const ref = refIso || S.dt.todayISO();
  const sorted = [...periods].sort((a,b) => S.dt.toSerial(b.startDate) - S.dt.toSerial(a.startDate));
  const last = sorted.find(p => S.dt.toSerial(p.startDate) <= S.dt.toSerial(ref));
  if(!last) return { value: null, lastStart: null, confidence: 'low' };
  const day = S.dt.diffDays(last.startDate, ref) + 1;
  return { value: day, lastStart: last.startDate, confidence: 'high' };
};

S.calc.averageCycleLength = function(periods, fallback){
  const fb = fallback || S.calc.DEFAULTS.CYCLE_LENGTH;
  if(!periods || periods.length < 2){
    return { value: fb, confidence: 'low', n: 0 };
  }
  const sorted = [...periods].sort((a,b) => S.dt.toSerial(a.startDate) - S.dt.toSerial(b.startDate));
  const lengths = [];
  for(let i = 1; i < sorted.length; i++){
    const d = S.dt.diffDays(sorted[i-1].startDate, sorted[i].startDate);
    if(d >= S.calc.DEFAULTS.MIN_CYCLE && d <= S.calc.DEFAULTS.MAX_CYCLE){
      lengths.push(d);
    }
  }
  if(!lengths.length){
    return { value: fb, confidence: 'low', n: 0 };
  }
  const avg = Math.round(lengths.reduce((a,b) => a+b, 0) / lengths.length);
  const conf = lengths.length >= 6 ? 'high' : lengths.length >= 3 ? 'medium' : 'low';
  return { value: avg, confidence: conf, n: lengths.length };
};

S.calc.cycleVariability = function(periods){
  if(!periods || periods.length < 3) return { sd: null, label: 'regularInsufficient' };
  const sorted = [...periods].sort((a,b) => S.dt.toSerial(a.startDate) - S.dt.toSerial(b.startDate));
  const lengths = [];
  for(let i = 1; i < sorted.length; i++){
    const d = S.dt.diffDays(sorted[i-1].startDate, sorted[i].startDate);
    if(d >= S.calc.DEFAULTS.MIN_CYCLE && d <= S.calc.DEFAULTS.MAX_CYCLE) lengths.push(d);
  }
  if(lengths.length < 3) return { sd: null, label: 'regularInsufficient' };
  const avg = lengths.reduce((a,b) => a+b, 0) / lengths.length;
  const variance = lengths.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / lengths.length;
  const sd = Math.sqrt(variance);
  let label = 'regularIrregular';
  if(sd < 3) label = 'regularVery';
  else if(sd < 7) label = 'regularNormal';
  return { sd: Math.round(sd * 10) / 10, label };
};

S.calc.averagePeriodLength = function(periods, fallback){
  const fb = fallback || S.calc.DEFAULTS.PERIOD_LENGTH;
  const withEnd = (periods || []).filter(p => p.endDate && S.dt.toSerial(p.endDate) >= S.dt.toSerial(p.startDate));
  if(!withEnd.length) return { value: fb, confidence: 'low', n: 0 };
  const lengths = withEnd.map(p => S.dt.diffDays(p.startDate, p.endDate) + 1)
    .filter(d => d >= S.calc.DEFAULTS.MIN_PERIOD && d <= S.calc.DEFAULTS.MAX_PERIOD);
  if(!lengths.length) return { value: fb, confidence: 'low', n: 0 };
  const avg = Math.round(lengths.reduce((a,b) => a+b, 0) / lengths.length);
  const conf = lengths.length >= 3 ? 'high' : 'medium';
  return { value: avg, confidence: conf, n: lengths.length };
};

S.calc.predictNextPeriod = function(periods, cycleLength){
  if(!periods || !periods.length){
    return { date: null, confidence: 'low', usedLength: cycleLength || S.calc.DEFAULTS.CYCLE_LENGTH };
  }
  const avg = S.calc.averageCycleLength(periods, cycleLength);
  const len = avg.value;
  const sorted = [...periods].sort((a,b) => S.dt.toSerial(b.startDate) - S.dt.toSerial(a.startDate));
  const lastStart = sorted[0].startDate;
  const today = S.dt.todayISO();

  const daysSinceLast = S.dt.diffDays(lastStart, today);
  let cyclesElapsed = Math.floor(daysSinceLast / len);
  if(cyclesElapsed < 0) cyclesElapsed = 0;

  let nextDate = S.dt.addDays(lastStart, (cyclesElapsed + 1) * len);

  while(S.dt.toSerial(nextDate) < S.dt.toSerial(today)){
    cyclesElapsed++;
    nextDate = S.dt.addDays(lastStart, (cyclesElapsed + 1) * len);
    if(cyclesElapsed > 120) break;
  }

  const isLate = daysSinceLast > len && cyclesElapsed === 0;

  return {
    date: nextDate,
    confidence: avg.confidence,
    usedLength: len,
    isLate,
    daysLate: isLate ? daysSinceLast - len : 0
  };
};

S.calc.estimateOvulation = function(periods, cycleLength, lutealPhase){
  const lp = lutealPhase || S.calc.DEFAULTS.LUTEAL_PHASE;
  const next = S.calc.predictNextPeriod(periods, cycleLength);
  if(!next.date) return { date: null, confidence: 'low' };
  return {
    date: S.dt.addDays(next.date, -lp),
    confidence: next.confidence
  };
};

S.calc.estimateFertileWindow = function(periods, cycleLength, lutealPhase){
  const lp = lutealPhase || S.calc.DEFAULTS.LUTEAL_PHASE;
  const next = S.calc.predictNextPeriod(periods, cycleLength);
  if(!next.date) return { start: null, end: null, confidence: 'low' };
  const ovu = S.dt.addDays(next.date, -lp);
  return {
    start: S.dt.addDays(ovu, -S.calc.DEFAULTS.FERTILE_BEFORE_OVU),
    end:   S.dt.addDays(ovu, +S.calc.DEFAULTS.FERTILE_AFTER_OVU),
    ovulationDate: ovu,
    confidence: next.confidence
  };
};

S.calc.cycleInfo = function(state, refIso){
  const ref = refIso || S.dt.todayISO();
  const settings = state.settings || {};
  const cycleLen = settings.avgCycleLength || S.calc.DEFAULTS.CYCLE_LENGTH;
  const periodLen = settings.periodLength || S.calc.DEFAULTS.PERIOD_LENGTH;
  const luteal = settings.lutealPhase || S.calc.DEFAULTS.LUTEAL_PHASE;

  const cd = S.calc.cycleDay(state.periods, ref);
  const avg = S.calc.averageCycleLength(state.periods, cycleLen);
  const next = S.calc.predictNextPeriod(state.periods, cycleLen);
  const ovu = S.calc.estimateOvulation(state.periods, cycleLen, luteal);
  const fertile = S.calc.estimateFertileWindow(state.periods, cycleLen, luteal);
  const variability = S.calc.cycleVariability(state.periods);

  let phase = null;
  if(cd.value != null){
    if(cd.value <= periodLen) phase = 'phaseMenstruation';
    else if(ovu.date && S.dt.toSerial(ref) >= S.dt.toSerial(fertile.start) && S.dt.toSerial(ref) <= S.dt.toSerial(fertile.end)) phase = 'phaseFertile';
    else if(ovu.date && S.dt.toSerial(ref) < S.dt.toSerial(ovu.date)) phase = 'phaseFollicular';
    else phase = 'phaseLuteal';
  }

  const isFertile = !!(fertile.start && fertile.end
    && S.dt.toSerial(ref) >= S.dt.toSerial(fertile.start)
    && S.dt.toSerial(ref) <= S.dt.toSerial(fertile.end));

  return {
    day: cd.value,
    lastStart: cd.lastStart,
    cycleLength: avg.value,
    cycleLengthConfidence: avg.confidence,
    periodLength: periodLen,
    nextPeriod: next.date,
    nextPeriodConfidence: next.confidence,
    isLate: next.isLate,
    daysLate: next.daysLate,
    ovulation: ovu.date,
    fertileStart: fertile.start,
    fertileEnd: fertile.end,
    isFertile,
    phase,
    variability
  };
};

S.calc.analyzeBasalTemperature = function(temps, thresholdC){
  const th = thresholdC || S.calc.DEFAULTS.TEMP_RISE_THRESHOLD;
  if(!temps || temps.length < 6){
    return {
      rise: false,
      insufficient: true,
      message: 'temperatureNeedMore',
      baseline: null,
      recentAvg: null,
      delta: null
    };
  }

  const normalized = S.calc.normalizeTemps(temps)
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date));

  const last6 = normalized.slice(-6);
  const days = last6.map(t => S.dt.toSerial(t.date));
  const span = days[days.length-1] - days[0];
  if(span > 10){
    return {
      rise: false,
      insufficient: true,
      message: 'temperatureNeedMore',
      baseline: null, recentAvg: null, delta: null
    };
  }

  const baselineSlice = last6.slice(0, 3);
  const recentSlice = last6.slice(-3);

  const baseline = baselineSlice.reduce((a,t) => a + t.valueC, 0) / baselineSlice.length;
  const recentAvg = recentSlice.reduce((a,t) => a + t.valueC, 0) / recentSlice.length;
  const delta = recentAvg - baseline;
  const rise = delta >= th;

  let ovulationDate = null;
  if(rise){
    for(let i = 3; i < last6.length; i++){
      if(last6[i].valueC - baseline >= th){
        ovulationDate = S.dt.addDays(last6[i].date, -1);
        break;
      }
    }
  }

  return {
    rise,
    insufficient: false,
    baseline: Math.round(baseline * 100) / 100,
    recentAvg: Math.round(recentAvg * 100) / 100,
    delta: Math.round(delta * 100) / 100,
    ovulationDate,
    message: rise ? 'temperatureRise' : 'temperatureNoRise'
  };
};

S.calc.temperatureStats = function(temps){
  const normalized = S.calc.normalizeTemps(temps || []);
  if(!normalized.length){
    return { min: null, max: null, avg: null, count: 0 };
  }
  const vals = normalized.map(t => t.valueC);
  return {
    min: Math.round(Math.min(...vals) * 100) / 100,
    max: Math.round(Math.max(...vals) * 100) / 100,
    avg: Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 100) / 100,
    count: vals.length
  };
};

S.calc.pregnancyInfo = function(pregnancy, refIso){
  if(!pregnancy) return null;
  const ref = refIso || S.dt.todayISO();

  let lmpEquivalent = null;
  if(pregnancy.lmpDate){
    lmpEquivalent = pregnancy.lmpDate;
  } else if(pregnancy.conceptionDate){
    lmpEquivalent = S.dt.addDays(pregnancy.conceptionDate, -14);
  } else if(pregnancy.providedEdd){
    lmpEquivalent = S.dt.addDays(pregnancy.providedEdd, -280);
  }

  if(!lmpEquivalent){
    return { sa: null, daysInSA: null, dpa: null, daysLeft: null, progress: 0, trimester: null, totalDays: null };
  }

  const totalDays = S.dt.diffDays(lmpEquivalent, ref);
  const sa = Math.floor(totalDays / 7);
  const daysInSA = totalDays % 7;

  let dpa = pregnancy.providedEdd;
  if(!dpa){
    dpa = S.dt.addDays(lmpEquivalent, 280);
  }

  const daysLeft = S.dt.diffDays(ref, dpa);
  const progress = Math.max(0, Math.min(100, Math.round((totalDays / 280) * 100)));

  let trimester = null;
  if(sa < 14) trimester = 1;
  else if(sa < 28) trimester = 2;
  else trimester = 3;

  return {
    lmpEquivalent,
    totalDays,
    sa,
    daysInSA,
    dpa,
    daysLeft,
    progress,
    trimester
  };
};

S.calc.PREG_TIPS = [
  { min: 1,  max: 4,   key: 'preg_tip_1_4'   },
  { min: 5,  max: 8,   key: 'preg_tip_5_8'   },
  { min: 9,  max: 12,  key: 'preg_tip_9_12'  },
  { min: 13, max: 16,  key: 'preg_tip_13_16' },
  { min: 17, max: 20,  key: 'preg_tip_17_20' },
  { min: 21, max: 24,  key: 'preg_tip_21_24' },
  { min: 25, max: 28,  key: 'preg_tip_25_28' },
  { min: 29, max: 32,  key: 'preg_tip_29_32' },
  { min: 33, max: 36,  key: 'preg_tip_33_36' },
  { min: 37, max: 40,  key: 'preg_tip_37_40' },
  { min: 41, max: 999, key: 'preg_tip_41_plus' }
];

S.calc.getPregnancyTip = function(sa){
  if(sa == null) return '';
  for(const t of S.calc.PREG_TIPS){
    if(sa >= t.min && sa <= t.max){
      return S.t(t.key);
    }
  }
  return '';
};

S.calc.getPregnancyMilestones = function(sa){
  const milestones = [
    { sa: 8,  key: 'preg_ms_8'  },
    { sa: 12, key: 'preg_ms_12' },
    { sa: 16, key: 'preg_ms_16' },
    { sa: 22, key: 'preg_ms_22' },
    { sa: 24, key: 'preg_ms_24' },
    { sa: 28, key: 'preg_ms_28' },
    { sa: 32, key: 'preg_ms_32' },
    { sa: 36, key: 'preg_ms_36' },
    { sa: 38, key: 'preg_ms_38' },
    { sa: 40, key: 'preg_ms_40' }
  ];
  return milestones.map(m => ({
    ...m,
    label: S.t(m.key + '_label'),
    desc: S.t(m.key + '_desc'),
    done: sa != null && sa >= m.sa,
    upcoming: sa != null && Math.abs(sa - m.sa) <= 2 && sa < m.sa
  }));
};

S.calc.IMPLANT_DURATIONS = {
  'Implanon NXT': { months: 36, years: 3 },
  'Nexplanon': { months: 36, years: 3 },
  'Jadelle': { months: 60, years: 5 },
  'Sino-Implant II': { months: 48, years: 4 },
  'Lévonorgestrel 2 bâtonnets': { months: 60, years: 5 },
  'Autre': { months: 36, years: 3 }
};

S.calc.implantExpiration = function(insertionDate, durationMonths){
  if(!insertionDate || !durationMonths) return null;
  const { y, m, d } = S.dt.parse(insertionDate);
  const totalMonths = (m - 1) + Number(durationMonths);
  const ny = y + Math.floor(totalMonths / 12);
  const nm = (totalMonths % 12) + 1;
  const daysInMonth = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  const nd = Math.min(d, daysInMonth);
  return S.dt.toISO(ny, nm, nd);
};

S.calc.implantDaysLeft = function(implant){
  if(!implant) return null;
  const end = implant.expectedEndDate
    || S.calc.implantExpiration(implant.insertionDate, implant.durationMonths);
  if(!end) return null;
  const today = S.dt.todayISO();
  return S.dt.diffDays(today, end);
};

S.calc.implantStatus = function(implant){
  if(!implant) return null;
  if(implant.retire) return { key: 'implantBadgeRemoved', class: 'badge-expire' };
  const days = S.calc.implantDaysLeft(implant);
  if(days == null) return { key: 'implantBadgeActive', class: 'badge-actif' };
  if(days < 0) return { key: 'implantBadgeExpired', class: 'badge-expire' };
  if(days < 90) return { key: 'implantBadgeSoon', class: 'badge-bientot' };
  return { key: 'implantBadgeActive', class: 'badge-actif' };
};

S.calc.getActiveImplant = function(implants){
  if(!implants || !implants.length) return null;
  return implants
    .filter(i => !i.retire)
    .sort((a,b) => S.dt.toSerial(b.insertionDate) - S.dt.toSerial(a.insertionDate))[0] || null;
};

S.calc.contractionStats = function(contractions){
  if(!contractions || contractions.length < 1){
    return { count: 0, lastDuration: null, lastInterval: null, avgDuration: null, avgInterval: null, trend: null };
  }

  const sorted = [...contractions]
    .filter(c => c.start)
    .sort((a,b) => new Date(a.start) - new Date(b.start));

  const durations = sorted
    .map(c => c.duration)
    .filter(d => typeof d === 'number' && d > 0);

  const intervals = [];
  for(let i = 1; i < sorted.length; i++){
    const sec = (new Date(sorted[i].start) - new Date(sorted[i-1].start)) / 1000;
    if(sec > 0 && sec < 3600) intervals.push(sec);
  }

  const avg = arr => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : null;

  let trend = null;
  if(intervals.length >= 10){
    const recent = intervals.slice(-5);
    const prev = intervals.slice(-10, -5);
    const rAvg = avg(recent);
    const pAvg = avg(prev);
    if(rAvg != null && pAvg != null){
      const delta = rAvg - pAvg;
      trend = delta < -60 ? 'accelerating' : delta > 60 ? 'slowing' : 'stable';
    }
  }

  return {
    count: sorted.length,
    lastDuration: durations.length ? Math.round(durations[durations.length-1]) : null,
    lastInterval: intervals.length ? Math.round(intervals[intervals.length-1]) : null,
    avgDuration: durations.length ? Math.round(avg(durations)) : null,
    avgInterval: intervals.length ? Math.round(avg(intervals)) : null,
    trend
  };
};

S.calc.recentContractions = function(contractions, n){
  const limit = n || 5;
  return [...(contractions || [])]
    .sort((a,b) => new Date(b.start) - new Date(a.start))
    .slice(0, limit);
};

S.calc.healthSummary = function(state){
  const cycle = S.calc.cycleInfo(state);
  const implant = S.calc.getActiveImplant(state.implants || (state.implant ? [state.implant] : []));
  const pregnancy = state.pregnancy
    ? S.calc.pregnancyInfo(state.pregnancy)
    : null;

  const lastTemp = [...(state.temperatures || [])]
    .sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date))[0] || null;

  const today = S.dt.todayISO();
  const nextAppt = [...(state.appointments || [])]
    .filter(a => S.dt.toSerial(a.date) >= S.dt.toSerial(today))
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date))[0] || null;

  const todayReminders = (state.reminders || []).filter(r => r.enabled && r.date === today);

  const lastLog = [...(state.dailyLogs || [])]
    .sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date))[0] || null;

  return {
    cycle,
    implant,
    pregnancy,
    lastTemp,
    nextAppt,
    todayReminders,
    lastLog,
    isPregnant: !!pregnancy
  };
};

S.calc.flowKey = function(flow){
  const map = {
    none: 'flowNone',
    light: 'flowLight',
    medium: 'flowMedium',
    heavy: 'flowHeavy',
    spotting: 'spotting'
  };
  return map[flow] || 'flowNone';
};

S.calc.flowEmoji = function(flow){
  const map = { none: '', light: '🩸', medium: '🩸🩸', heavy: '🩸🩸🩸', spotting: '·' };
  return map[flow] || '';
};

S.calc.bmi = function(weightKg, heightCm){
  if(!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  let category = 'normal';
  if(bmi < 18.5) category = 'underweight';
  else if(bmi < 25) category = 'normal';
  else if(bmi < 30) category = 'overweight';
  else category = 'obese';
  return { value: Math.round(bmi * 10) / 10, category };
};

/* ============================================================
   BLOC 5 : UI (VUES, ROUTER, MODALES, CHARTS)
   ============================================================ */

S.ICONS = {
  home:     'ico-home',
  calendar: 'ico-calendar',
  chart:    'ico-chart',
  heart:    'ico-heart',
  user:     'ico-user',
  lock:     'ico-lock',
  close:    'ico-close',
  theme:    'ico-theme',
  settings: 'ico-settings'
};

S.svgIcon = function(name, size){
  const id = S.ICONS[name] || name;
  const s = size || 22;
  return `<svg width="${s}" height="${s}" aria-hidden="true"><use href="#${id}"/></svg>`;
};

S.NAV_MOBILE = [
  { route: 'dashboard',  label: 'navDashboard',  icon: 'home' },
  { route: 'calendar',   label: 'navCalendar',   icon: 'calendar' },
  { route: 'tracking',   label: 'navTracking',   icon: 'chart' },
  { route: 'pregnancy',  label: 'navPregnancy',  icon: 'heart' },
  { route: 'profile',    label: 'navProfile',    icon: 'user' }
];

S.NAV_SIDEBAR = [
  { route: 'dashboard',    label: 'navDashboard' },
  { route: 'calendar',     label: 'navCalendar' },
  { route: 'fertility',    label: 'navFertility' },
  { route: 'temperature',  label: 'navTemperature' },
  { route: 'journal',      label: 'navJournal' },
  { route: 'sexual',       label: 'navSexual' },
  { route: 'implant',      label: 'navImplant' },
  { route: 'pregnancy',    label: 'navPregnancy' },
  { route: 'contractions', label: 'navContractions' },
  { route: 'appointments', label: 'navAppointments' },
  { route: 'reminders',    label: 'navReminders' },
  { route: 'reports',      label: 'navReports' },
  { route: 'health',       label: 'navHealth' },
  { route: 'settings',     label: 'navSettings' }
];

S.VIEWS = {};

S.navigate = function(route, param){
  S.state.route = route;
  S.state.routeParam = param || null;
  if(window.location.hash !== '#' + route){
    try{ window.location.hash = route; }catch(e){}
  }
  S.renderNavActive();
  S.renderView();
  const main = S.$('#mainView');
  if(main) main.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

S.renderNavActive = function(){
  S.$$('#tabbar button, #sidebar button').forEach(b => {
    if(b.dataset.route === S.state.route) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
};

S.buildNav = function(){
  const tab = S.$('#tabbar');
  const side = S.$('#sidebar');
  if(!tab || !side) return;

  // Construction de la barre d'onglets (Mobile)
  tab.innerHTML = '';
  S.NAV_MOBILE.forEach(item => {
    const b = S.el('button', {
      type: 'button',
      'data-route': item.route,
      'aria-label': S.t(item.label)
    });
    // CORRECTION : Utilisation de innerHTML pour injecter le SVG
    b.innerHTML = `
      <span style="display:inline-flex">${S.svgIcon(item.icon, 22)}</span>
      <span>${S.escapeHtml(S.t(item.label))}</span>
    `;
    b.addEventListener('click', () => S.navigate(item.route));
    tab.appendChild(b);
  });

  // Construction du menu latéral (Desktop)
  side.innerHTML = '';
  const brand = S.el('div', {
    style: { fontWeight: '700', fontSize: '18px', padding: '8px 12px 16px',
             color: 'var(--primary)', letterSpacing: '.1em',
             display: 'flex', alignItems: 'center', gap: '8px' }
  });
  // CORRECTION : Utilisation de innerHTML pour injecter le SVG
  brand.innerHTML = `
    <svg width="26" height="26" aria-hidden="true"><use href="#logo-serena-compact"/></svg>
    SERENA
  `;
  side.appendChild(brand);

  S.NAV_SIDEBAR.forEach(item => {
    const b = S.el('button', {
      type: 'button',
      'data-route': item.route
    }, S.t(item.label));
    b.addEventListener('click', () => S.navigate(item.route));
    side.appendChild(b);
  });
};

S.openSheet = function(title, bodyHtml, opts){
  opts = opts || {};
  const root = S.$('#modalRoot');
  if(!root) return null;

  const previousFocus = document.activeElement;
  const ov = S.el('div', {
    class: 'overlay',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title
  });
  const sheet = S.el('div', { class: 'sheet' });
  const head = S.el('div', { class: 'sheet-head' }, [
    S.el('h2', {}, title),
    S.el('button', {
      type: 'button',
      class: 'btn-ghost',
      'aria-label': S.t('close'),
      'data-close': ''
    }, S.svgIcon('close', 20))
  ]);
  const body = S.el('div', { class: 'sheet-body' });
  if(typeof bodyHtml === 'string') body.innerHTML = bodyHtml;
  else if(bodyHtml instanceof Node) body.appendChild(bodyHtml);

  sheet.appendChild(head);
  sheet.appendChild(body);
  ov.appendChild(sheet);
  root.appendChild(ov);

  const focusables = () => S.$$(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    sheet
  ).filter(el => el.offsetParent !== null);

  const onKeydown = (e) => {
    if(e.key === 'Escape'){
      e.preventDefault();
      close();
      return;
    }
    if(e.key === 'Tab'){
      const list = focusables();
      if(!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  };

  const close = () => {
    ov.remove();
    document.removeEventListener('keydown', onKeydown);
    if(previousFocus && previousFocus.focus) try{ previousFocus.focus(); }catch(e){}
    if(opts.onClose) opts.onClose();
  };

  ov.addEventListener('click', (e) => {
    if(e.target === ov || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', onKeydown);

  setTimeout(() => {
    const list = focusables();
    if(list.length) list[0].focus();
    else sheet.focus();
  }, 30);

  if(opts.onMount) opts.onMount(sheet, close);

  return { overlay: ov, sheet, body, close };
};

S.confirmDialog = function(title, message, onConfirm, opts){
  opts = opts || {};
  const body = `
    <p style="margin:0 0 14px">${S.escapeHtml(message)}</p>
    <div class="row" style="justify-content:flex-end;gap:8px">
      <button type="button" class="btn-outline" data-close>${S.escapeHtml(S.t('cancel'))}</button>
      <button type="button" class="btn-danger" data-confirm>${S.escapeHtml(opts.confirmLabel || S.t('confirm'))}</button>
    </div>`;
  const sheet = S.openSheet(title, body, {
    onMount: (root, close) => {
      root.querySelector('[data-confirm]').addEventListener('click', () => {
        close();
        if(onConfirm) onConfirm();
      });
    }
  });
  return sheet;
};

S.charts = {};

S.charts.setupCanvas = function(canvas){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width || canvas.clientWidth || 320;
  const cssH = parseInt(getComputedStyle(canvas).height, 10) || 180;
  canvas.width = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return { ctx, w: cssW, h: cssH };
};

S.charts.colors = function(){
  const cs = getComputedStyle(document.documentElement);
  return {
    ink: cs.getPropertyValue('--ink').trim() || '#2E1B5B',
    muted: cs.getPropertyValue('--muted').trim() || '#6B6B6B',
    primary: cs.getPropertyValue('--primary').trim() || '#4A2B7A',
    accent: cs.getPropertyValue('--accent').trim() || '#F5A9C4',
    border: cs.getPropertyValue('--border').trim() || 'rgba(74,43,122,0.12)',
    vert: cs.getPropertyValue('--vert-500').trim() || '#8FB886',
    danger: cs.getPropertyValue('--danger').trim() || '#E85A6E'
  };
};

S.charts.line = function(canvas, points, opts){
  opts = opts || {};
  const { ctx, w, h } = S.charts.setupCanvas(canvas);
  const c = S.charts.colors();
  ctx.clearRect(0, 0, w, h);

  if(!points || !points.length){
    ctx.fillStyle = c.muted;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(opts.emptyText || S.t('noDataYet'), w / 2, h / 2);
    return;
  }

  const padL = 36, padR = 16, padT = 18, padB = 32;
  const cW = w - padL - padR;
  const cH = h - padT - padB;

  const ys = points.map(p => p.y);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if(minY === maxY){ minY -= 1; maxY += 1; }
  const pad = (maxY - minY) * 0.1;
  minY -= pad; maxY += pad;
  const rangeY = maxY - minY;

  ctx.strokeStyle = c.border;
  ctx.lineWidth = 1;
  ctx.font = '10px sans-serif';
  ctx.fillStyle = c.muted;
  ctx.textAlign = 'right';
  for(let i = 0; i <= 3; i++){
    const y = padT + (cH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    const val = maxY - (rangeY / 3) * i;
    ctx.fillText(opts.yFormat ? opts.yFormat(val) : val.toFixed(1), padL - 4, y + 3);
  }

  const stepX = points.length > 1 ? cW / (points.length - 1) : 0;
  const xOf = i => padL + i * stepX;
  const yOf = v => padT + cH - ((v - minY) / rangeY) * cH;

  ctx.strokeStyle = opts.color || c.primary;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xOf(i), y = yOf(p.y);
    if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = opts.color || c.primary;
  points.forEach((p, i) => {
    const x = xOf(i), y = yOf(p.y);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const maxLabels = 6;
  const stepLbl = Math.max(1, Math.ceil(points.length / maxLabels));
  ctx.fillStyle = c.muted;
  ctx.textAlign = 'center';
  points.forEach((p, i) => {
    if(i % stepLbl !== 0 && i !== points.length - 1) return;
    const x = xOf(i);
    const { d, m } = S.dt.parse(p.x);
    ctx.fillText(`${d}/${m}`, x, h - 10);
  });

  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label',
    (opts.label || 'Graphique') + ' : ' + points.map(p => p.y).join(', '));
};

S.charts.bars = function(canvas, bars, opts){
  opts = opts || {};
  const { ctx, w, h } = S.charts.setupCanvas(canvas);
  const c = S.charts.colors();
  ctx.clearRect(0, 0, w, h);

  if(!bars || !bars.length){
    ctx.fillStyle = c.muted;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(opts.emptyText || S.t('noDataYet'), w / 2, h / 2);
    return;
  }

  const padL = 28, padR = 12, padT = 14, padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const bw = cW / bars.length;
  const maxV = opts.max || Math.max(...bars.map(b => b.v || 0), 1);
  const colors = opts.colors || [
    c.border, c.danger, '#F0B860', '#B8A3DC', c.vert, '#3A7A4F'
  ];

  bars.forEach((b, i) => {
    const x = padL + i * bw;
    const v = b.v || 0;
    const bh = v ? (cH * v / maxV) : 3;
    ctx.fillStyle = colors[Math.min(v, colors.length - 1)] || c.primary;
    ctx.fillRect(x + 1, padT + cH - bh, Math.max(1, bw - 2), bh);
  });

  ctx.fillStyle = c.muted;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(opts.startLabel || '', padL + 30, h - 8);
  ctx.fillText(opts.endLabel || '', w - padR - 30, h - 8);

  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', opts.label || 'Graphique');
};

S.emptyState = function(msg, actionLabel, onAction){
  const id = 'ea_' + Math.random().toString(36).slice(2, 8);
  const html = `
    <div class="empty">
      <div class="ico" aria-hidden="true">✦</div>
      <p>${S.escapeHtml(msg)}</p>
      ${actionLabel ? `<button type="button" class="btn-primary" id="${id}">${S.escapeHtml(actionLabel)}</button>` : ''}
    </div>`;
  if(actionLabel && onAction){
    setTimeout(() => {
      const b = document.getElementById(id);
      if(b) b.addEventListener('click', onAction);
    }, 0);
  }
  return html;
};

S.VIEWS.dashboard = function(){
  const summary = S.calc.healthSummary(S.state);
  const cycle = summary.cycle;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening';
  const name = S.state.profile && S.state.profile.name
    ? ' — ' + S.escapeHtml(S.state.profile.name)
    : '';

  const confidenceClass = (c) =>
    c === 'high' ? 'pill-green' : c === 'medium' ? 'pill-violet' : 'pill-grey';
  const confidenceKey = (c) =>
    c === 'high' ? 'confidenceHigh' : c === 'medium' ? 'confidenceMed' : 'confidenceLow';

  let pregnancyCard = '';
  if(summary.isPregnant && summary.pregnancy){
    const p = summary.pregnancy;
    pregnancyCard = `
      <div class="card card-preg" role="button" tabindex="0" data-go="pregnancy" style="cursor:pointer">
        <div class="card-title">🤰 ${S.escapeHtml(S.t('pregnancyStatus'))}</div>
        <div class="card-value">${p.sa != null ? p.sa : '—'}<span class="card-unit">${S.escapeHtml(S.t('weeksAndDays', { w: p.sa != null ? p.sa : '—', d: p.daysInSA != null ? p.daysInSA : '—' }))}</span></div>
        <div class="card-desc">${S.escapeHtml(S.t('edd'))} : ${S.escapeHtml(S.dt.fmt(p.dpa))}</div>
      </div>`;
  }

  let implantBlock = '';
  if(summary.implant){
    const days = S.calc.implantDaysLeft(summary.implant);
    const status = S.calc.implantStatus(summary.implant);
    const end = summary.implant.expectedEndDate
      || S.calc.implantExpiration(summary.implant.insertionDate, summary.implant.durationMonths);
    implantBlock = `
      <div class="row-between" style="margin-top:6px">
        <span class="muted">${S.escapeHtml(S.t('implantStatus'))}</span>
        <span class="pill-status ${status.class}">${S.escapeHtml(S.t(status.key))}</span>
      </div>
      <div class="row-between" style="margin-top:6px">
        <span class="muted">${S.escapeHtml(summary.implant.type || '')}</span>
        <span style="font-size:13px">${S.escapeHtml(S.dt.fmt(end))}</span>
      </div>`;
  }

  return `
    <h1 class="section-title">${S.escapeHtml(S.t(greeting))}${name} 👋</h1>
    <p class="section-sub">${S.escapeHtml(now.toLocaleDateString(S.lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</p>

    ${pregnancyCard}

    <div class="grid2">
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('cycleDay'))}</div>
        <div class="card-value">${cycle.day != null ? 'J' + cycle.day : '—'}</div>
        <div class="card-desc">${S.escapeHtml(cycle.phase ? S.t(cycle.phase) : '—')}</div>
      </div>
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('nextPeriod'))}</div>
        <div class="card-value" style="font-size:1.2rem">${S.escapeHtml(S.dt.fmt(cycle.nextPeriod))}</div>
        <span class="pill-status ${confidenceClass(cycle.nextPeriodConfidence)}">${S.escapeHtml(S.t(confidenceKey(cycle.nextPeriodConfidence)))}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('fertileWindow'))}</div>
      <div class="card-value" style="font-size:1.3rem">
        ${cycle.fertileStart ? S.escapeHtml(S.dt.fmt(cycle.fertileStart, false) + ' – ' + S.dt.fmt(cycle.fertileEnd, false)) : '—'}
      </div>
      <div class="card-desc">
        ${cycle.ovulation ? S.escapeHtml(S.t('ovulation')) + ' : ' + S.escapeHtml(S.dt.fmt(cycle.ovulation)) : ''}
        ${cycle.isFertile ? ' · <strong style="color:var(--vert-500)">' + S.escapeHtml(S.t('fertileToday')) + '</strong>' : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('avgCycle'))}</div>
      <div class="card-value">${cycle.cycleLength != null ? cycle.cycleLength : '—'}<span class="card-unit">j</span></div>
      <div class="card-desc">${S.escapeHtml(S.t(cycle.variability.label))}</div>
      ${implantBlock}
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('qaNote'))}</div>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:10px">
        <button type="button" class="btn-secondary btn-sm" data-qa="period">🩸<br>${S.escapeHtml(S.t('qaPeriod'))}</button>
        <button type="button" class="btn-secondary btn-sm" data-qa="journal">📓<br>${S.escapeHtml(S.t('qaJournal'))}</button>
        <button type="button" class="btn-secondary btn-sm" data-qa="temperature">🌡️<br>${S.escapeHtml(S.t('qaTemp'))}</button>
        <button type="button" class="btn-secondary btn-sm" data-qa="sexual">❤️<br>${S.escapeHtml(S.t('qaSex'))}</button>
        <button type="button" class="btn-secondary btn-sm" data-qa="contraction">⏱️<br>${S.escapeHtml(S.t('navContractions'))}</button>
        <button type="button" class="btn-secondary btn-sm" data-qa="report">📄<br>${S.escapeHtml(S.t('qaReport'))}</button>
      </div>
    </div>

    <div class="disclaimer">⚠️ ${S.escapeHtml(S.t('medicalFooter'))}</div>
  `;
};

S.calState = { y: new Date().getFullYear(), m: new Date().getMonth() + 1 };

S.VIEWS.calendar = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navCalendar'))}</h1>
    <p class="section-sub">${S.escapeHtml(S.lang === 'fr' ? 'Touchez un jour pour le marquer' : 'Tap a day to mark it')}</p>
    <div id="calBody"></div>
  `;
};

S.mountCalendar = function(){
  const body = S.$('#calBody');
  if(!body) return;

  const { y, m } = S.calState;
  const first = new Date(Date.UTC(y, m - 1, 1));
  const startDow = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const prevDays = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
  const totalCells = startDow + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;

  const todayIso = S.dt.todayISO();
  const cycle = S.calc.cycleInfo(S.state);

  const periodSet = new Set();
  S.state.periods.forEach(p => {
    const s = S.dt.toSerial(p.startDate);
    const e = p.endDate ? S.dt.toSerial(p.endDate) : s;
    for(let i = s; i <= e; i++) periodSet.add(S.dt.fromSerial(i));
  });

  const fertileSet = new Set();
  if(cycle.fertileStart && cycle.fertileEnd){
    const s = S.dt.toSerial(cycle.fertileStart);
    const e = S.dt.toSerial(cycle.fertileEnd);
    for(let i = s; i <= e; i++) fertileSet.add(S.dt.fromSerial(i));
  }

  const predictedSet = new Set();
  if(cycle.nextPeriod){
    const periodLen = S.state.settings.periodLength || 5;
    for(let i = 0; i < periodLen; i++){
      predictedSet.add(S.dt.addDays(cycle.nextPeriod, i));
    }
  }

  const logSet = new Set(S.state.dailyLogs.map(l => l.date));
  const tempSet = new Set(S.state.temperatures.map(t => t.date));

  const dows = S.dt.dows();

  let cells = '';
  for(let i = 0; i < startDow; i++){
    cells += `<div class="cal-day out" aria-hidden="true">${prevDays - startDow + 1 + i}</div>`;
  }
  for(let d = 1; d <= daysInMonth; d++){
    const iso = S.dt.toISO(y, m, d);
    const classes = ['cal-day'];
    if(iso === todayIso) classes.push('today');
    if(periodSet.has(iso)) classes.push('period');
    else if(predictedSet.has(iso)) classes.push('predicted');
    if(fertileSet.has(iso) && !periodSet.has(iso)) classes.push('fertile');
    if(cycle.ovulation === iso) classes.push('ovulation');

    const dots = [];
    if(periodSet.has(iso)) dots.push('<span class="dot-period"></span>');
    if(fertileSet.has(iso)) dots.push('<span class="dot-fertile"></span>');
    if(cycle.ovulation === iso) dots.push('<span class="dot-ovu"></span>');
    if(logSet.has(iso) || tempSet.has(iso)) dots.push('<span class="dot-log"></span>');

    cells += `
      <button type="button" class="${classes.join(' ')}" data-date="${iso}"
              aria-label="${S.escapeHtml(S.dt.fmt(iso))}">
        <span>${d}</span>
        <span class="dots" aria-hidden="true">${dots.join('')}</span>
      </button>`;
  }
  for(let i = 1; i <= trailing; i++){
    cells += `<div class="cal-day out" aria-hidden="true">${i}</div>`;
  }

  const last = S.state.periods.slice().sort((a,b) => S.dt.toSerial(b.startDate) - S.dt.toSerial(a.startDate))[0];

  body.innerHTML = `
    <div class="cal-head">
      <button type="button" class="btn-ghost" id="calPrev" aria-label="Mois précédent">←</button>
      <strong style="color:var(--primary)">${S.escapeHtml(S.dt.monthLabel(y, m))}</strong>
      <button type="button" class="btn-ghost" id="calNext" aria-label="Mois suivant">→</button>
    </div>
    <div class="row" style="margin-bottom:8px">
      <button type="button" class="btn-outline btn-sm" id="calToday">${S.escapeHtml(S.t('today'))}</button>
      <button type="button" class="btn-primary btn-sm" id="calAddPeriod" style="margin-left:auto">🩸 ${S.escapeHtml(S.t('qaPeriod'))}</button>
    </div>
    <div class="cal-grid" role="grid">
      ${dows.map(d => `<div class="cal-dow">${d}</div>`).join('')}
      ${cells}
    </div>
    <div class="cal-legend">
      <span><i class="lg-box" style="background:var(--rose-500)"></i>${S.escapeHtml(S.t('periods'))}</span>
      <span><i class="lg-box" style="background:var(--vert-300)"></i>${S.escapeHtml(S.t('fertileWindow'))}</span>
      <span><i class="lg-box" style="background:var(--vert-500)"></i>${S.escapeHtml(S.t('ovulation'))}</span>
      <span><i class="lg-box" style="background:var(--primary);border-radius:50%"></i>${S.escapeHtml(S.t('navJournal'))}</span>
    </div>

    <div class="card mt-20">
      <div class="card-title">${S.escapeHtml(S.t('cycleSummary'))}</div>
      <div class="row-between mt-12"><span>${S.escapeHtml(S.t('avgCycle'))}</span><strong>${cycle.cycleLength != null ? cycle.cycleLength : '—'} j</strong></div>
      <div class="row-between mt-12"><span>${S.escapeHtml(S.t('lastPeriod'))}</span><strong>${S.escapeHtml(S.dt.fmt(last ? last.startDate : null))}</strong></div>
      <div class="row-between mt-12"><span>${S.escapeHtml(S.t('duration'))}</span><strong>${(() => { const a = S.calc.averagePeriodLength(S.state.periods); return a.value; })()} j</strong></div>
      <div class="row-between mt-12"><span>${S.escapeHtml(S.t('regularity') || 'Régularité')}</span><strong>${S.escapeHtml(S.t(cycle.variability.label))}</strong></div>
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('cycleEvolution'))}</div>
      <div class="chart-wrap"><canvas class="chart" id="cycleChart"></canvas></div>
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('temperatureChart'))}</div>
      <div class="chart-wrap"><canvas class="chart" id="calTempChart"></canvas></div>
    </div>

    <div class="disclaimer">⚠️ ${S.escapeHtml(S.t('fertilityWarning'))}</div>
  `;

  body.querySelector('#calPrev').addEventListener('click', () => {
    S.calState.m--;
    if(S.calState.m < 1){ S.calState.m = 12; S.calState.y--; }
    S.mountCalendar();
  });
  body.querySelector('#calNext').addEventListener('click', () => {
    S.calState.m++;
    if(S.calState.m > 12){ S.calState.m = 1; S.calState.y++; }
    S.mountCalendar();
  });
  body.querySelector('#calToday').addEventListener('click', () => {
    const n = new Date();
    S.calState = { y: n.getFullYear(), m: n.getMonth() + 1 };
    S.mountCalendar();
  });
  body.querySelector('#calAddPeriod').addEventListener('click', () => {
    if(S.openPeriodForm) S.openPeriodForm();
  });
  body.querySelectorAll('.cal-day[data-date]').forEach(b => {
    b.addEventListener('click', () => S.openDayPanel(b.dataset.date));
  });

  const cycleChart = document.getElementById('cycleChart');
  const cyclePoints = [];
  const sorted = S.state.periods.slice().sort((a,b) => S.dt.toSerial(a.startDate) - S.dt.toSerial(b.startDate));
  for(let i = 1; i < sorted.length; i++){
    const d = S.dt.diffDays(sorted[i-1].startDate, sorted[i].startDate);
    if(d >= 15 && d <= 60){
      cyclePoints.push({ x: sorted[i].startDate, y: d });
    }
  }
  S.charts.line(cycleChart, cyclePoints, {
    label: S.t('cycleEvolution'),
    emptyText: S.t('noDataYet'),
    yFormat: (v) => Math.round(v) + 'j'
  });

  const tempChart = document.getElementById('calTempChart');
  const temps = S.state.temperatures
    .slice()
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date))
    .slice(-30)
    .map(t => ({ x: t.date, y: t.value }));
  S.charts.line(tempChart, temps, {
    label: S.t('temperatureChart'),
    emptyText: S.t('temperatureNeedMore'),
    yFormat: (v) => v.toFixed(1) + '°',
    color: S.charts.colors().danger
  });
};

S.openDayPanel = function(iso){
  const log = S.state.dailyLogs.find(l => l.date === iso);
  const temp = S.state.temperatures.find(t => t.date === iso);
  const period = S.state.periods.find(p =>
    S.dt.toSerial(iso) >= S.dt.toSerial(p.startDate)
    && S.dt.toSerial(iso) <= S.dt.toSerial(p.endDate || p.startDate)
  );

  const body = `
    <p class="muted">${S.escapeHtml(S.dt.fmtLong(iso))}</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
      <div class="card"><strong>${S.escapeHtml(S.t('periods'))}</strong> : ${period ? '✔️ ' + S.escapeHtml(S.t(S.calc.flowKey(period.flow))) : S.escapeHtml(S.t('none'))}</div>
      <div class="card"><strong>${S.escapeHtml(S.t('temperature'))}</strong> : ${temp ? S.escapeHtml(temp.value + '°' + (temp.unit || 'C')) : S.escapeHtml(S.t('none'))}</div>
      <div class="card"><strong>${S.escapeHtml(S.t('dailyJournal'))}</strong> : ${log ? `${S.escapeHtml(S.t('mood'))} ${log.mood || '—'} · ${S.escapeHtml(S.t('pain'))} ${log.pain != null ? log.pain : '—'}` : S.escapeHtml(S.t('none'))}</div>
    </div>
    <div class="row" style="margin-top:14px">
      <button type="button" class="btn-outline" data-day-action="period">🩸 ${S.escapeHtml(S.t('qaPeriod'))}</button>
      <button type="button" class="btn-outline" data-day-action="temp">🌡️ ${S.escapeHtml(S.t('qaTemp'))}</button>
      <button type="button" class="btn-outline" data-day-action="journal">📓 ${S.escapeHtml(S.t('qaJournal'))}</button>
    </div>`;

  const sheet = S.openSheet(S.dt.fmtLong(iso), body, {
    onMount: (root, close) => {
      root.querySelector('[data-day-action="period"]').addEventListener('click', () => {
        close();
        if(S.openPeriodForm) S.openPeriodForm(iso);
      });
      root.querySelector('[data-day-action="temp"]').addEventListener('click', () => {
        close();
        if(S.openTemperatureForm) S.openTemperatureForm(iso);
      });
      root.querySelector('[data-day-action="journal"]').addEventListener('click', () => {
        close();
        if(S.openJournalForm) S.openJournalForm(iso);
      });
    }
  });
  return sheet;
};

S.VIEWS.fertility = function(){
  const c = S.calc.cycleInfo(S.state);
  const confClass = (x) => x === 'high' ? 'pill-green' : x === 'medium' ? 'pill-violet' : 'pill-grey';
  const confKey = (x) => x === 'high' ? 'confidenceHigh' : x === 'medium' ? 'confidenceMed' : 'confidenceLow';

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navFertility'))}</h1>
    <p class="section-sub">${S.escapeHtml(S.t('fertilityWarning'))}</p>

    <div class="card card-gradient">
      <div class="card-title">${S.escapeHtml(S.t('fertileWindow'))}</div>
      <div class="card-value" style="font-size:1.4rem">
        ${c.fertileStart ? S.escapeHtml(S.dt.fmt(c.fertileStart, false) + ' – ' + S.dt.fmt(c.fertileEnd, false)) : '—'}
      </div>
      <span class="pill-status ${confClass(c.nextPeriodConfidence)}" style="margin-top:6px">${S.escapeHtml(S.t(confKey(c.nextPeriodConfidence)))}</span>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('ovulation'))}</div>
        <div class="card-value" style="font-size:1.2rem">${S.escapeHtml(S.dt.fmt(c.ovulation))}</div>
      </div>
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('nextPeriod'))}</div>
        <div class="card-value" style="font-size:1.2rem">${S.escapeHtml(S.dt.fmt(c.nextPeriod))}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('cycleDay'))}</div>
      <div class="card-value">${c.day != null ? 'J' + c.day : '—'}</div>
      <div class="card-desc">${S.escapeHtml(c.phase ? S.t(c.phase) : '')}</div>
    </div>

    <div class="disclaimer">⚠️ ${S.escapeHtml(S.t('ovulationNote'))}</div>
  `;
};

S.VIEWS.temperature = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navTemperature'))}</h1>
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn-primary" id="tempAddBtn">${S.escapeHtml(S.t('add'))}</button>
    </div>
    <div class="card">
      <div class="chart-wrap"><canvas class="chart" id="tempChart" style="height:200px"></canvas></div>
    </div>
    <div id="tempAnalysis" class="muted" style="margin-top:8px"></div>
    <div id="tempStats" style="margin-top:12px"></div>
    <div id="tempHistWrap" style="margin-top:14px"></div>
  `;
};

S.mountTemperature = function(){
  const addBtn = S.$('#tempAddBtn');
  if(addBtn) addBtn.addEventListener('click', () => S.openTemperatureForm && S.openTemperatureForm());

  const sorted = S.state.temperatures.slice()
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date))
    .slice(-30);

  const chart = document.getElementById('tempChart');
  if(chart){
    S.charts.line(chart, sorted.map(t => ({ x: t.date, y: t.value })), {
      label: S.t('temperatureChart'),
      emptyText: S.t('temperatureNeedMore'),
      yFormat: (v) => v.toFixed(1) + '°',
      color: S.charts.colors().danger
    });
  }

  const analysis = S.calc.analyzeBasalTemperature(S.state.temperatures);
  const analysisEl = S.$('#tempAnalysis');
  if(analysisEl){
    if(analysis.insufficient){
      analysisEl.textContent = S.t('temperatureNeedMore');
      analysisEl.style.color = '';
    } else if(analysis.rise){
      analysisEl.textContent = '↑ ' + S.t('temperatureRise');
      analysisEl.style.color = 'var(--vert-500)';
    } else {
      analysisEl.textContent = S.t('temperatureNoRise');
      analysisEl.style.color = '';
    }
  }

  const stats = S.calc.temperatureStats(S.state.temperatures);
  const statsEl = S.$('#tempStats');
  if(statsEl && stats.count){
    statsEl.innerHTML = `
      <div class="card">
        <div class="row-between"><span class="muted">${S.escapeHtml(S.t('temperature'))}</span><span>${stats.count} ×</span></div>
        <div class="row-between mt-12"><span class="muted">Min</span><strong>${stats.min}°C</strong></div>
        <div class="row-between mt-12"><span class="muted">Max</span><strong>${stats.max}°C</strong></div>
        <div class="row-between mt-12"><span class="muted">Moy</span><strong>${stats.avg}°C</strong></div>
      </div>`;
  }

  const histWrap = S.$('#tempHistWrap');
  if(histWrap){
    const hist = sorted.slice().reverse().slice(0, 20);
    histWrap.innerHTML = hist.length
      ? `<table class="hist">
          <thead><tr><th>${S.escapeHtml(S.t('date'))}</th><th>°</th><th>${S.escapeHtml(S.t('notes'))}</th></tr></thead>
          <tbody>${hist.map(t => `<tr>
            <td>${S.escapeHtml(S.dt.fmt(t.date))}</td>
            <td>${S.escapeHtml(String(t.value))}°${S.escapeHtml(t.unit || 'C')}</td>
            <td>${S.escapeHtml(t.note || '')}</td>
          </tr>`).join('')}</tbody>
        </table>`
      : S.emptyState(S.t('noDataYet'));
  }
};

S.journalState = { metric: 'mood', range: 30 };

S.VIEWS.journal = function(){
  const metrics = ['mood', 'pain', 'energy', 'sleep', 'libido'];
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navJournal'))}</h1>
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn-primary" id="journalAddBtn">${S.escapeHtml(S.t('addEntry'))}</button>
    </div>
    <div class="row" style="margin-bottom:8px">
      ${metrics.map(m => `<button type="button" class="pill ${S.journalState.metric === m ? 'selected' : ''}" data-metric="${m}">${S.escapeHtml(S.t(m))}</button>`).join('')}
    </div>
    <div class="row" style="margin-bottom:8px">
      ${[7, 30, 90, 180, 365].map(n => `<button type="button" class="pill ${S.journalState.range === n ? 'selected' : ''}" data-range="${n}">${n}j</button>`).join('')}
    </div>
    <div class="card">
      <div class="chart-wrap"><canvas class="chart" id="journalChart" style="height:200px"></canvas></div>
    </div>
    <div id="journalHistWrap" style="margin-top:14px"></div>
  `;
};

S.mountJournal = function(){
  const addBtn = S.$('#journalAddBtn');
  if(addBtn) addBtn.addEventListener('click', () => S.openJournalForm && S.openJournalForm());

  S.$$('[data-metric]').forEach(b => b.addEventListener('click', () => {
    S.journalState.metric = b.dataset.metric;
    S.renderView();
  }));
  S.$$('[data-range]').forEach(b => b.addEventListener('click', () => {
    S.journalState.range = parseInt(b.dataset.range, 10);
    S.renderView();
  }));

  const cutoff = S.dt.addDays(S.dt.todayISO(), -S.journalState.range);
  const logs = S.state.dailyLogs
    .filter(l => l.date >= cutoff)
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date));

  const points = logs
    .filter(l => l[S.journalState.metric] != null)
    .map(l => ({ x: l.date, y: l[S.journalState.metric] }));

  const chart = document.getElementById('journalChart');
  if(chart){
    S.charts.line(chart, points, {
      label: S.t(S.journalState.metric),
      emptyText: S.t('noDataYet'),
      yFormat: (v) => v.toFixed(0)
    });
  }

  const histWrap = S.$('#journalHistWrap');
  if(histWrap){
    const hist = logs.slice().reverse().slice(0, 20);
    histWrap.innerHTML = hist.length
      ? `<table class="hist">
          <thead><tr>
            <th>${S.escapeHtml(S.t('date'))}</th>
            <th>${S.escapeHtml(S.t('mood'))}</th>
            <th>${S.escapeHtml(S.t('pain'))}</th>
            <th>${S.escapeHtml(S.t('symptoms'))}</th>
          </tr></thead>
          <tbody>${hist.map(l => `<tr>
            <td>${S.escapeHtml(S.dt.fmt(l.date))}</td>
            <td>${l.mood ? S.escapeHtml(S.t('mood' + l.mood)) : '—'}</td>
            <td>${l.pain != null ? S.escapeHtml(String(l.pain)) : '—'}</td>
            <td>${S.escapeHtml((l.symptoms || []).join(', ') || '—')}</td>
          </tr>`).join('')}</tbody>
        </table>`
      : S.emptyState(S.t('journalEmpty'));
  }
};

S.VIEWS.sexual = function(){
  const hist = S.state.sexualActivity
    .slice()
    .sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date))
    .slice(0, 30);

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navSexual'))}</h1>
    <p class="section-sub">${S.escapeHtml(S.t('sexualWarning'))}</p>
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn-primary" id="sexAddBtn">${S.escapeHtml(S.t('logSex'))}</button>
    </div>
    ${hist.length ? `
      <table class="hist">
        <thead><tr>
          <th>${S.escapeHtml(S.t('date'))}</th>
          <th>${S.escapeHtml(S.t('protectedSex'))}</th>
          <th>${S.escapeHtml(S.t('contraception'))}</th>
        </tr></thead>
        <tbody>${hist.map(a => `<tr>
          <td>${S.escapeHtml(S.dt.fmt(a.date))}</td>
          <td>${a.protected ? '✔️' : '—'}</td>
          <td>${S.escapeHtml(a.contraception || '')}</td>
        </tr>`).join('')}</tbody>
      </table>` : S.emptyState(S.t('noDataYet'))}
  `;
};

S.mountSexual = function(){
  const btn = S.$('#sexAddBtn');
  if(btn) btn.addEventListener('click', () => S.openSexualForm && S.openSexualForm());
};

S.VIEWS.implant = function(){
  const active = S.calc.getActiveImplant(S.state.implants || []);
  const all = (S.state.implants || []).slice()
    .sort((a,b) => S.dt.toSerial(b.insertionDate) - S.dt.toSerial(a.insertionDate));

  let activeCard = '';
  if(active){
    const end = active.expectedEndDate
      || S.calc.implantExpiration(active.insertionDate, active.durationMonths);
    const days = S.calc.implantDaysLeft(active);
    const status = S.calc.implantStatus(active);
    activeCard = `
      <div class="card card-gradient">
        <div class="card-title">${S.escapeHtml(S.t('implantActive'))}</div>
        <div class="card-value" style="font-size:1.3rem">${S.escapeHtml(active.type || '')}</div>
        <div class="card-desc">${S.escapeHtml(S.dt.fmt(active.insertionDate))} → ${S.escapeHtml(S.dt.fmt(end))}</div>
        <div class="card-desc" style="font-weight:700;margin-top:8px">
          ${days > 0 ? '⏳ ' + S.escapeHtml(S.t('implantDaysLeft', { n: days })) : '⚠️ ' + S.escapeHtml(S.t('implantExpired', { n: Math.abs(days) }))}
        </div>
        <span class="badge ${status.class}" style="margin-top:8px">${S.escapeHtml(S.t(status.key))}</span>
      </div>`;
  }

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navImplant'))}</h1>
    <p class="section-sub">${S.escapeHtml(S.t('implantWarning'))}</p>
    ${activeCard}
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn-primary" id="implantAddBtn">${S.escapeHtml(S.t('implantAdd'))}</button>
      ${active ? `<button type="button" class="btn-outline" id="implantRemoveBtn">${S.escapeHtml(S.t('implantRemove'))}</button>` : ''}
    </div>
    <h2 style="font-size:1.1rem;margin-top:22px;color:var(--primary)">${S.escapeHtml(S.t('implantHistory'))}</h2>
    ${all.length ? all.map(i => {
      const end = i.expectedEndDate || S.calc.implantExpiration(i.insertionDate, i.durationMonths);
      const status = S.calc.implantStatus(i);
      return `<div class="card">
        <div class="row-between">
          <strong>${S.escapeHtml(i.type || '')}</strong>
          <span class="badge ${status.class}">${S.escapeHtml(S.t(status.key))}</span>
        </div>
        <p class="muted" style="margin:6px 0 0">${S.escapeHtml(S.dt.fmt(i.insertionDate))} → ${S.escapeHtml(S.dt.fmt(end))}</p>
      </div>`;
    }).join('') : S.emptyState(S.t('implantNoData'))}
  `;
};

S.mountImplant = function(){
  const add = S.$('#implantAddBtn');
  if(add) add.addEventListener('click', () => S.openImplantForm && S.openImplantForm());
  const rm = S.$('#implantRemoveBtn');
  if(rm) rm.addEventListener('click', () => {
    const active = S.calc.getActiveImplant(S.state.implants);
    if(!active) return;
    S.confirmDialog(S.t('implantRemove'), S.t('implantRemove') + ' ?', async () => {
      active.retire = true;
      active.removedAt = S.dt.todayISO();
      await S.dbPut('implant', active);
      await S.reloadAll();
      S.toast(S.t('saved'));
      S.renderView();
    });
  });
};

S.VIEWS.pregnancy = function(){
  const preg = S.state.pregnancy;

  if(!preg){
    return `
      <h1 class="section-title">${S.escapeHtml(S.t('pregnancy'))}</h1>
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('pregnancyStart'))}</div>
        <div class="card-desc">${S.escapeHtml(S.t('pregnancyStartDesc'))}</div>
        <button type="button" class="btn-primary mt-12" id="pregStartBtn">🤰 ${S.escapeHtml(S.t('pregnancyStart'))}</button>
      </div>
      <div class="disclaimer">⚠️ ${S.escapeHtml(S.t('medicalFooter'))}</div>
    `;
  }

  const info = S.calc.pregnancyInfo(preg);
  const tip = S.calc.getPregnancyTip(info.sa);
  const milestones = S.calc.getPregnancyMilestones(info.sa);
  const contractions = S.calc.recentContractions(S.state.contractions, 5);
  const nextAppts = S.state.appointments
    .filter(a => S.dt.toSerial(a.date) >= S.dt.toSerial(S.dt.todayISO()))
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date))
    .slice(0, 5);

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('pregnancy'))}</h1>
    <p class="section-sub">${S.escapeHtml(S.t('pregnancyWeeks'))}</p>

    <div class="card card-preg">
      <div class="card-title">${S.escapeHtml(S.t('pregnancyWeeks'))}</div>
      <div class="card-value">
        ${info.sa != null ? info.sa : '—'}
        <span class="card-unit">${S.escapeHtml(S.t('weeksAndDays', { w: info.sa != null ? info.sa : '—', d: info.daysInSA != null ? info.daysInSA : '—' }))}</span>
      </div>
      <div class="card-desc">${S.escapeHtml(S.t('daysSinceDDR', { n: info.totalDays }))}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${info.progress}%"></div></div>
      <div class="card-desc" style="margin-top:6px">
        ${info.progress}% — ${S.escapeHtml(S.t('daysLeft', { n: info.daysLeft }))}
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('edd'))}</div>
        <div class="card-value" style="font-size:1.2rem">${S.escapeHtml(S.dt.fmt(info.dpa))}</div>
      </div>
      <div class="card">
        <div class="card-title">${S.escapeHtml(S.t('trimester'))}</div>
        <div class="card-value">${info.trimester || '—'}/3</div>
        <div class="card-desc">${S.escapeHtml(info.trimester ? S.t('trimester' + info.trimester) : '')}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">💡 ${S.escapeHtml(S.t('pregnancyTips'))}</div>
      <div class="card-desc">${S.escapeHtml(tip)}</div>
    </div>

    <div class="card">
      <div class="card-title">📅 ${S.escapeHtml(S.t('pregnancyMilestones'))}</div>
      <div class="timeline mt-12">
        ${milestones.map(m => `
          <div class="tl-item">
            <span class="tl-dot ${m.done ? 'done' : m.upcoming ? '' : 'upcoming'}"></span>
            <div class="tl-title">${S.escapeHtml(m.label)}</div>
            <div class="tl-sub">${m.sa} SA • ${S.escapeHtml(m.desc)}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">🩺 ${S.escapeHtml(S.t('pregnancyConsultations'))}</div>
      <div class="card-desc" style="white-space:pre-line">${S.escapeHtml(S.t('pregnancyConsultList'))}</div>
    </div>

    <div class="card">
      <div class="card-title">⏱️ ${S.escapeHtml(S.t('contractionRecent'))}</div>
      ${contractions.length ? contractions.map(c => `
        <div class="row-between mt-12">
          <span>${S.escapeHtml(new Date(c.start).toLocaleString(S.lang === 'fr' ? 'fr-FR' : 'en-US'))}</span>
          <strong>${c.duration ? Math.round(c.duration) + 's' : '—'}</strong>
        </div>`).join('') : `<div class="muted">${S.escapeHtml(S.t('contractionNoData'))}</div>`}
    </div>

    <div class="card">
      <div class="card-title">📅 ${S.escapeHtml(S.t('appointments'))}</div>
      ${nextAppts.length ? nextAppts.map(a => `
        <div class="row-between mt-12">
          <span>${S.escapeHtml(S.dt.fmt(a.date))} ${S.escapeHtml(a.time || '')}</span>
          <strong>${S.escapeHtml(a.label || '')}</strong>
        </div>`).join('') : `<div class="muted">${S.escapeHtml(S.t('appointmentNone'))}</div>`}
    </div>

    <div class="card">
      <div class="card-title">${S.escapeHtml(S.t('actions') || 'Actions')}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
        <button type="button" class="btn-outline" id="pregContractionBtn">⏱️ ${S.escapeHtml(S.t('contractionSave'))}</button>
        <button type="button" class="btn-outline" id="pregApptBtn">📅 ${S.escapeHtml(S.t('appointmentAdd'))}</button>
        <button type="button" class="btn-outline" id="pregJournalBtn">📓 ${S.escapeHtml(S.t('pregnancyJournalBtn'))}</button>
        <button type="button" class="btn-outline" id="pregEditBtn">✏️ ${S.escapeHtml(S.t('edit'))}</button>
        <button type="button" class="btn-danger" id="pregEndBtn">${S.escapeHtml(S.t('pregnancyEnd'))}</button>
      </div>
    </div>

    <div class="disclaimer">⚠️ ${S.escapeHtml(S.t('medicalFooter'))}</div>
  `;
};

S.mountPregnancy = function(){
  const startBtn = S.$('#pregStartBtn');
  if(startBtn) startBtn.addEventListener('click', () => S.openPregnancyForm && S.openPregnancyForm());

  const editBtn = S.$('#pregEditBtn');
  if(editBtn) editBtn.addEventListener('click', () => S.openPregnancyForm && S.openPregnancyForm(S.state.pregnancy));

  const journalBtn = S.$('#pregJournalBtn');
  if(journalBtn) journalBtn.addEventListener('click', () => S.openPregnancyJournalForm && S.openPregnancyJournalForm());

  const ctrBtn = S.$('#pregContractionBtn');
  if(ctrBtn) ctrBtn.addEventListener('click', () => S.openContractionForm && S.openContractionForm());

  const apptBtn = S.$('#pregApptBtn');
  if(apptBtn) apptBtn.addEventListener('click', () => S.openAppointmentForm && S.openAppointmentForm());

  const endBtn = S.$('#pregEndBtn');
  if(endBtn) endBtn.addEventListener('click', () => {
    S.confirmDialog(S.t('pregnancyEndConfirm'), S.t('deleteAllWarn'), async () => {
      const p = S.state.pregnancy;
      p.active = false;
      p.endedAt = S.dt.todayISO();
      await S.dbPut('pregnancy', p);
      await S.reloadAll();
      S.toast(S.t('saved'));
      S.renderView();
    });
  });
};

S.VIEWS.contractions = function(){
  const stats = S.calc.contractionStats(S.state.contractions);
  const recent = S.calc.recentContractions(S.state.contractions, 15);
  const active = S.contractionActive;
  const startLabel = active ? 'contractionEnd' : 'contractionStart';
  const btnClass = active ? 'stop' : 'start';

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navContractions'))}</h1>
    <div class="card" style="text-align:center">
      <div class="timer-num" id="ctTimerNum">00:00</div>
      <button type="button" class="timer-btn ${btnClass}" id="ctTimerBtn">
        ${S.escapeHtml(S.t(startLabel))}
      </button>
      ${stats.avgInterval ? `<p class="muted" style="margin-top:10px">${S.escapeHtml(S.t('interval'))} : ${Math.round(stats.avgInterval / 60)} min</p>` : ''}
    </div>

    ${stats.count ? `
      <div class="grid2">
        <div class="card">
          <div class="card-title">${S.escapeHtml(S.t('duration'))}</div>
          <div class="card-value">${stats.avgDuration != null ? stats.avgDuration : '—'}<span class="card-unit">s</span></div>
          <div class="card-desc">${S.escapeHtml(S.lang === 'fr' ? 'Moyenne' : 'Average')}</div>
        </div>
        <div class="card">
          <div class="card-title">${S.escapeHtml(S.t('interval'))}</div>
          <div class="card-value">${stats.avgInterval != null ? Math.round(stats.avgInterval / 60) : '—'}<span class="card-unit">min</span></div>
          <div class="card-desc">${stats.trend ? S.escapeHtml(S.lang === 'fr'
            ? (stats.trend === 'accelerating' ? 'Accélération' : stats.trend === 'slowing' ? 'Ralentissement' : 'Stable')
            : (stats.trend === 'accelerating' ? 'Accelerating' : stats.trend === 'slowing' ? 'Slowing' : 'Stable')) : ''}</div>
        </div>
      </div>` : ''}

    <div style="margin-top:16px">
      ${recent.length ? `
        <table class="hist">
          <thead><tr>
            <th>${S.escapeHtml(S.t('date'))}</th>
            <th>${S.escapeHtml(S.t('duration'))}</th>
          </tr></thead>
          <tbody>${recent.map(c => `<tr>
            <td>${S.escapeHtml(new Date(c.start).toLocaleString(S.lang === 'fr' ? 'fr-FR' : 'en-US'))}</td>
            <td>${c.duration ? Math.round(c.duration) + 's' : '—'}</td>
          </tr>`).join('')}</tbody>
        </table>` : S.emptyState(S.t('contractionNoData'))}
    </div>

    <p class="muted" style="margin-top:10px">${S.escapeHtml(S.t('contractionTimerNote'))}</p>
  `;
};

S.mountContractions = function(){
  const btn = S.$('#ctTimerBtn');
  if(!btn) return;

  if(S.contractionActive){
    const elapsed = Math.floor((Date.now() - new Date(S.contractionActive.start).getTime()) / 1000);
    S.updateContractionTimer(elapsed);
    S.startContractionTick();
  }

  btn.addEventListener('click', async () => {
    if(!S.contractionActive){
      S.contractionActive = { start: new Date().toISOString() };
      if(S.prefs) S.prefs.set('contractionActive', S.contractionActive);
      S.renderView();
      return;
    }
    const end = new Date().toISOString();
    const duration = (new Date(end) - new Date(S.contractionActive.start)) / 1000;
    await S.dbAdd('contractions', {
      start: S.contractionActive.start,
      end,
      duration
    });
    S.contractionActive = null;
    if(S.prefs) S.prefs.remove('contractionActive');
    if(S.stopContractionTick) S.stopContractionTick();
    await S.reloadAll();
    S.renderView();
    S.toast(S.t('saved'));
  });
};

S.contractionTick = null;

S.startContractionTick = function(){
  if(S.contractionTick) clearInterval(S.contractionTick);
  S.contractionTick = setInterval(() => {
    if(!S.contractionActive){
      clearInterval(S.contractionTick);
      S.contractionTick = null;
      return;
    }
    const elapsed = Math.floor((Date.now() - new Date(S.contractionActive.start).getTime()) / 1000);
    S.updateContractionTimer(elapsed);
  }, 500);
};

S.stopContractionTick = function(){
  if(S.contractionTick){
    clearInterval(S.contractionTick);
    S.contractionTick = null;
  }
};

S.updateContractionTimer = function(sec){
  const el = S.$('#ctTimerNum');
  if(!el) return;
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
};

S.VIEWS.appointments = function(){
  const list = S.state.appointments.slice()
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date));

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('appointments'))}</h1>
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn-primary" id="apptAddBtn">${S.escapeHtml(S.t('appointmentAdd'))}</button>
    </div>
    ${list.length ? list.map(a => `
      <div class="card">
        <div class="row-between">
          <strong>${S.escapeHtml(S.dt.fmt(a.date))} ${S.escapeHtml(a.time || '')}</strong>
          <span class="pill-status pill-violet">${S.escapeHtml(S.t('apptType' + (a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : 'Other')) || a.type || '')}</span>
        </div>
        <p class="muted" style="margin:6px 0 0">
          ${S.escapeHtml(a.label || '')}
          ${a.professional ? ' · ' + S.escapeHtml(a.professional) : ''}
          ${a.facility ? ' · ' + S.escapeHtml(a.facility) : ''}
        </p>
      </div>`).join('') : S.emptyState(S.t('appointmentNone'))}
  `;
};

S.mountAppointments = function(){
  const btn = S.$('#apptAddBtn');
  if(btn) btn.addEventListener('click', () => S.openAppointmentForm && S.openAppointmentForm());
};

S.VIEWS.reminders = function(){
  const list = S.state.reminders.slice()
    .sort((a,b) => S.dt.toSerial(a.date) - S.dt.toSerial(b.date));

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('reminders'))}</h1>
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn-primary" id="reminderAddBtn">${S.escapeHtml(S.t('reminderAdd'))}</button>
    </div>
    ${list.length ? list.map(r => `
      <div class="card">
        <div class="row-between">
          <div>
            <strong>${S.escapeHtml(S.t('reminder' + (r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : 'Journal')))}</strong>
            <p class="muted" style="margin:4px 0 0">${S.escapeHtml(S.dt.fmt(r.date))} ${S.escapeHtml(r.time || '')}</p>
          </div>
          <button type="button" class="toggle ${r.enabled ? 'on' : ''}" data-toggle-reminder="${r.id}" aria-label="${S.escapeHtml(S.t('reminderEnable'))}">
            <span></span>
          </button>
        </div>
      </div>`).join('') : S.emptyState(S.t('reminderNone'))}
  `;
};

S.mountReminders = function(){
  const btn = S.$('#reminderAddBtn');
  if(btn) btn.addEventListener('click', () => S.openReminderForm && S.openReminderForm());

  S.$$('[data-toggle-reminder]').forEach(b => {
    b.addEventListener('click', async () => {
      const id = parseInt(b.dataset.toggleReminder, 10);
      const r = S.state.reminders.find(x => x.id === id);
      if(!r) return;
      r.enabled = !r.enabled;
      await S.dbPut('reminders', r);
      await S.reloadAll();
      S.renderView();
    });
  });
};

S.VIEWS.reports = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('reports'))}</h1>
    <div class="settings-list">
      <button type="button" id="reportPdf">📄 <span>${S.escapeHtml(S.t('exportPdf'))}</span></button>
      <button type="button" id="reportExport">⬇️ <span>${S.escapeHtml(S.t('exportData'))}</span></button>
      <button type="button" id="reportImport">⬆️ <span>${S.escapeHtml(S.t('importData'))}</span></button>
    </div>
    <input type="file" id="reportImportFile" accept="application/json" class="hidden">
    <p class="muted" style="margin-top:12px">${S.escapeHtml(S.t('medicalFooter'))}</p>
  `;
};

S.mountReports = function(){
  const pdf = S.$('#reportPdf');
  if(pdf) pdf.addEventListener('click', () => S.openDoctorModeSheet && S.openDoctorModeSheet());
  const exp = S.$('#reportExport');
  if(exp) exp.addEventListener('click', () => S.exportJSON && S.exportJSON());
  const imp = S.$('#reportImport');
  const file = S.$('#reportImportFile');
  if(imp && file){
    imp.addEventListener('click', () => file.click());
    file.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if(!f) return;
      try{
        const text = await f.text();
        const data = JSON.parse(text);
        if(S.importJSON) S.importJSON(data);
      }catch(err){
        S.toast(S.t('importInvalid'));
      }
      file.value = '';
    });
  }
};

S.VIEWS.profile = function(){
  const p = S.state.profile || {};
  const s = S.state.settings || {};
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navProfile'))}</h1>
    <div class="card">
      <label>${S.escapeHtml(S.t('onbName'))}</label>
      <input type="text" id="profileName" value="${S.escapeHtml(p.name || '')}" placeholder="${S.escapeHtml(S.t('onbNamePlaceholder'))}">
      <label>${S.escapeHtml(S.t('onbBirth'))}</label>
      <input type="date" id="profileBirth" value="${S.escapeHtml(p.birthDate || '')}">
      <label>${S.escapeHtml(S.t('cycleLength'))}</label>
      <input type="number" id="profileCycle" min="15" max="60" value="${S.escapeHtml(String(s.avgCycleLength || 28))}">
      <label>${S.escapeHtml(S.t('periodLength'))}</label>
      <input type="number" id="profilePeriod" min="1" max="10" value="${S.escapeHtml(String(s.periodLength || 5))}">
      <label>${S.escapeHtml(S.t('lutealPhase'))}</label>
      <input type="number" id="profileLuteal" min="8" max="20" value="${S.escapeHtml(String(s.lutealPhase || 14))}">
      <p class="form-hint">${S.escapeHtml(S.t('lutealPhaseHint'))}</p>
      <label>${S.escapeHtml(S.t('temperatureUnitSetting'))}</label>
      <select id="profileTempUnit">
        <option value="C" ${s.tempUnit === 'C' ? 'selected' : ''}>°C</option>
        <option value="F" ${s.tempUnit === 'F' ? 'selected' : ''}>°F</option>
      </select>
      <div class="row" style="margin-top:14px;justify-content:flex-end">
        <button type="button" class="btn-primary" id="profileSave">${S.escapeHtml(S.t('save'))}</button>
      </div>
    </div>
  `;
};

S.mountProfile = function(){
  const btn = S.$('#profileSave');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    const name = S.$('#profileName').value.trim();
    const birthDate = S.$('#profileBirth').value || null;
    const cycle = Math.max(15, Math.min(60, parseInt(S.$('#profileCycle').value, 10) || 28));
    const period = Math.max(1, Math.min(10, parseInt(S.$('#profilePeriod').value, 10) || 5));
    const luteal = Math.max(8, Math.min(20, parseInt(S.$('#profileLuteal').value, 10) || 14));
    const tempUnit = S.$('#profileTempUnit').value;

    const profile = S.state.profile || { id: 1, onboarded: true };
    profile.name = name;
    profile.birthDate = birthDate;
    if(S.dbAvailable) await S.dbPut('profile', profile);
    else { S.state.profile = profile; }

    const settings = S.state.settings;
    settings.avgCycleLength = cycle;
    settings.periodLength = period;
    settings.lutealPhase = luteal;
    settings.tempUnit = tempUnit;
    if(S.dbAvailable) await S.dbPut('settings', settings);

    await S.reloadAll();
    S.persistFallback();
    S.toast(S.t('saved'));
    S.renderView();
  });
};

S.VIEWS.settings = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('settings'))}</h1>
    <div class="settings-list">
      <button type="button" data-go="profile">👤 <span>${S.escapeHtml(S.t('navProfile'))}</span></button>
      <button type="button" id="settingsAppearance">🎨 <span>${S.escapeHtml(S.t('appearance'))}</span></button>
      <button type="button" id="settingsLanguage">🌐 <span>${S.escapeHtml(S.t('language'))}</span></button>
      <button type="button" data-go="security">🔒 <span>${S.escapeHtml(S.t('security'))}</span></button>
      <button type="button" id="settingsData">💾 <span>${S.escapeHtml(S.t('data'))}</span></button>
      <button type="button" id="settingsNotifications">🔔 <span>${S.escapeHtml(S.t('reminderNotifications'))}</span></button>
      <button type="button" data-go="privacy">🛡️ <span>${S.escapeHtml(S.t('navPrivacy'))}</span></button>
      <button type="button" data-go="about">ℹ️ <span>${S.escapeHtml(S.t('about'))}</span></button>
      <button type="button" data-go="help">❓ <span>${S.escapeHtml(S.t('help'))}</span></button>
      <button type="button" id="settingsDebug">🧪 <span>${S.escapeHtml(S.t('statusPage'))}</span></button>
    </div>
  `;
};

S.mountSettings = function(){
  S.$$('[data-go]').forEach(b => b.addEventListener('click', () => S.navigate(b.dataset.go)));
  const app = S.$('#settingsAppearance');
  if(app) app.addEventListener('click', () => S.openAppearanceSheet && S.openAppearanceSheet());
  const lang = S.$('#settingsLanguage');
  if(lang) lang.addEventListener('click', () => S.openLanguageSheet && S.openLanguageSheet());
  const data = S.$('#settingsData');
  if(data) data.addEventListener('click', () => S.openDataSheet && S.openDataSheet());
  const notif = S.$('#settingsNotifications');
  if(notif) notif.addEventListener('click', () => S.requestNotificationPermission && S.requestNotificationPermission());
  const dbg = S.$('#settingsDebug');
  if(dbg) dbg.addEventListener('click', () => S.openDebugSheet && S.openDebugSheet());
};

S.VIEWS.security = function(){
  const autoLock = S.state.security && S.state.security.autoLockMinutes;
  const options = [
    [0, 'never'], [1, 'min1'], [5, 'min5'], [15, 'min15'], [30, 'min30']
  ];
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navSecurity'))}</h1>
    <div class="card">
      <p>${S.escapeHtml(S.t('securityBody'))}</p>
      <p style="margin-top:10px">${S.escapeHtml(S.t('securityBiometric'))}</p>
      <p style="margin-top:10px">${S.escapeHtml(S.t('securityDataEncrypted'))}</p>
    </div>
    <div class="card">
      <label>${S.escapeHtml(S.t('enableAutoLock'))}</label>
      <select id="securityAutoLock">
        ${options.map(([v, k]) => `<option value="${v}" ${autoLock === v ? 'selected' : ''}>${S.escapeHtml(S.t(k))}</option>`).join('')}
      </select>
    </div>
    <div class="card">
      <button type="button" class="btn-outline" id="securityChangePin" style="width:100%">${S.escapeHtml(S.t('changePin'))}</button>
    </div>
  `;
};

S.mountSecurity = function(){
  const sel = S.$('#securityAutoLock');
  if(sel) sel.addEventListener('change', async () => {
    const mins = parseInt(sel.value, 10);
    if(!S.state.security) return;
    S.state.security.autoLockMinutes = mins;
    if(S.dbAvailable) await S.dbPut('security', S.state.security);
    S.toast(S.t('saved'));
    if(S.resetAutoLockTimer) S.resetAutoLockTimer();
  });

  const pin = S.$('#securityChangePin');
  if(pin) pin.addEventListener('click', () => S.openChangePinSheet && S.openChangePinSheet());
};

S.VIEWS.privacy = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navPrivacy'))}</h1>
    <div class="card">
      <p>${S.escapeHtml(S.t('privacyBody'))}</p>
      <p style="margin-top:10px">${S.escapeHtml(S.t('privacyExport'))}</p>
    </div>
  `;
};

S.VIEWS.about = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('about'))}</h1>
    <div class="card">
      <p><strong>SERENA</strong> — ${S.escapeHtml(S.t('tagline'))}</p>
      <p style="margin-top:10px">${S.escapeHtml(S.t('medicalFooter'))}</p>
      <p class="disclaimer" style="margin-top:12px">⚠️ ${S.escapeHtml(S.t('aboutDisclaimer'))}</p>
      <h3 style="font-size:14px;margin-top:14px">${S.escapeHtml(S.t('seeWhenConsult'))}</h3>
      <p class="muted">${S.escapeHtml(S.t('consultList'))}</p>
    </div>
  `;
};

S.VIEWS.help = function(){
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('help'))}</h1>
    <div class="card">
      <p>${S.escapeHtml(S.t('helpBody'))}</p>
      <p style="margin-top:10px">${S.escapeHtml(S.t('helpEstimates'))}</p>
    </div>
  `;
};

S.VIEWS.health = function(){
  const active = S.calc.getActiveImplant(S.state.implants || []);
  const cards = [
    { title: '💊 Implanon NXT / Nexplanon', body: S.lang === 'fr' ? 'Durée : 3 ans. Bâtonnet unique sous-cutané, inséré dans le bras. Efficacité > 99%.' : 'Duration: 3 years. Single subcutaneous rod, inserted in the arm. Efficacy > 99%.' },
    { title: '💊 Jadelle', body: S.lang === 'fr' ? 'Durée : 5 ans. Deux bâtonnets. Saignements souvent réduits après 6 mois.' : 'Duration: 5 years. Two rods. Bleeding often reduced after 6 months.' },
    { title: '💊 Sino-Implant II', body: S.lang === 'fr' ? 'Durée : 4 ans. Deux bâtonnets. Souvent utilisé en santé publique.' : 'Duration: 4 years. Two rods. Often used in public health.' },
    { title: '⚠️ ' + (S.lang === 'fr' ? 'Effets secondaires fréquents' : 'Common side effects'), body: S.lang === 'fr' ? '• Saignements irréguliers (3-6 premiers mois)\n• Absence de règles possible\n• Maux de tête, nausées légères\n• Sensibilité des seins\n• Variations d\'humeur' : '• Irregular bleeding (first 3-6 months)\n• Possible absence of periods\n• Headaches, mild nausea\n• Breast tenderness\n• Mood swings' },
    { title: '🚨 ' + (S.lang === 'fr' ? 'Quand consulter en urgence' : 'When to seek urgent care'), body: S.lang === 'fr' ? '• Douleur intense au bras\n• Saignement abondant persistant\n• Signes d\'infection\n• Douleur abdominale sévère\n• Suspicion de grossesse' : '• Severe arm pain\n• Persistent heavy bleeding\n• Signs of infection\n• Severe abdominal pain\n• Suspected pregnancy' }
  ];

  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navHealth'))}</h1>
    <p class="section-sub">${S.escapeHtml(S.lang === 'fr' ? 'Informations générales sur la contraception' : 'General contraception information')}</p>
    ${active ? `<div class="card card-gradient"><div class="card-title">${S.escapeHtml(S.t('implantActive'))}</div><div class="card-value" style="font-size:1.2rem">${S.escapeHtml(active.type)}</div></div>` : ''}
    ${cards.map(c => `<div class="card"><div class="card-title">${S.escapeHtml(c.title)}</div><div class="card-desc" style="white-space:pre-line">${S.escapeHtml(c.body)}</div></div>`).join('')}
    <div class="disclaimer">⚠️ ${S.escapeHtml(S.t('medicalFooter'))}</div>
  `;
};

S.VIEWS.tracking = function(){
  const items = [
    { route: 'fertility',    label: 'navFertility',    icon: '💜' },
    { route: 'temperature',  label: 'navTemperature',  icon: '🌡️' },
    { route: 'journal',      label: 'navJournal',      icon: '📓' },
    { route: 'sexual',       label: 'navSexual',       icon: '💞' },
    { route: 'implant',      label: 'navImplant',      icon: '💊' },
    { route: 'contractions', label: 'navContractions', icon: '⏱️' },
    { route: 'appointments', label: 'navAppointments', icon: '📅' },
    { route: 'reminders',    label: 'navReminders',    icon: '🔔' },
    { route: 'reports',      label: 'navReports',      icon: '📄' }
  ];
  return `
    <h1 class="section-title">${S.escapeHtml(S.t('navTracking'))}</h1>
    <div class="settings-list">
      ${items.map(i => `
        <button type="button" data-go="${i.route}">
          <span>${i.icon} ${S.escapeHtml(S.t(i.label))}</span>
          <span aria-hidden="true">›</span>
        </button>`).join('')}
    </div>
  `;
};

S.renderView = function(){
  const main = S.$('#mainView');
  if(!main) return;

  const route = S.state.route;
  const fn = S.VIEWS[route];
  main.innerHTML = fn ? fn() : `<div class="empty">404 — ${S.escapeHtml(route)}</div>`;

  S.mountView(route);
};

S.mountView = function(route){
  const mounts = {
    dashboard:    S.mountDashboard,
    calendar:     S.mountCalendar,
    fertility:    S.mountFertility,
    temperature:  S.mountTemperature,
    journal:      S.mountJournal,
    sexual:       S.mountSexual,
    implant:      S.mountImplant,
    pregnancy:    S.mountPregnancy,
    contractions: S.mountContractions,
    appointments: S.mountAppointments,
    reminders:    S.mountReminders,
    reports:      S.mountReports,
    profile:      S.mountProfile,
    settings:     S.mountSettings,
    security:     S.mountSecurity,
    tracking:     S.mountTracking
  };
  const fn = mounts[route];
  if(typeof fn === 'function') fn();
};

S.mountDashboard = function(){
  S.$$('[data-qa]').forEach(b => b.addEventListener('click', () => {
    const action = b.dataset.qa;
    if(action === 'period' && S.openPeriodForm) S.openPeriodForm();
    else if(action === 'journal' && S.openJournalForm) S.openJournalForm();
    else if(action === 'temperature' && S.openTemperatureForm) S.openTemperatureForm();
    else if(action === 'sexual' && S.openSexualForm) S.openSexualForm();
    else if(action === 'contraction') S.navigate('contractions');
    else if(action === 'report' && S.openDoctorModeSheet) S.openDoctorModeSheet();
  }));

  S.$$('[data-go]').forEach(b => {
    b.addEventListener('click', () => S.navigate(b.dataset.go));
    b.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); S.navigate(b.dataset.go); }
    });
  });
};

S.mountFertility = function(){ /* statique */ };
S.mountTracking = function(){
  S.$$('[data-go]').forEach(b => b.addEventListener('click', () => S.navigate(b.dataset.go)));
};

S.bindTopbar = function(){
  const theme = S.$('#btnThemeTop');
  if(theme) theme.addEventListener('click', () => S.cycleTheme());
  const settings = S.$('#btnSettingsTop');
  if(settings) settings.addEventListener('click', () => S.navigate('settings'));
};

S.bindHashRouter = function(){
  const applyHash = () => {
    const hash = (window.location.hash || '').replace('#', '');
    const route = hash && S.VIEWS[hash] ? hash : 'dashboard';
    if(route !== S.state.route) S.navigate(route);
  };
  window.addEventListener('hashchange', applyHash);
  applyHash();
};

/* ============================================================
   BLOC 6 : FORMULAIRES & MODULES
   ============================================================ */

S.SYMPTOMS = ['cramps', 'headache', 'breasts', 'bloating', 'fatigue', 'nausea', 'acne', 'back', 'discharge', 'other'];

S.APPT_TYPES = ['consultation', 'ultrasound', 'exam', 'followup', 'implant', 'other'];
S.APPT_TYPE_LABEL = {
  consultation: 'apptTypeConsultation',
  ultrasound:   'apptTypeUltrasound',
  exam:         'apptTypeExam',
  followup:     'apptTypeFollowup',
  implant:      'apptTypeImplant',
  other:        'apptTypeOther'
};

S.REMINDER_TYPES = ['period', 'temp', 'journal', 'implant', 'appt', 'pregnancy'];
S.REMINDER_TYPE_LABEL = {
  period:    'reminderPeriod',
  temp:      'reminderTemp',
  journal:   'reminderJournal',
  implant:   'reminderImplant',
  appt:      'reminderAppt',
  pregnancy: 'reminderPregnancy'
};

S.IMPLANT_TYPES = [
  { value: 'Implanon NXT', months: 36 },
  { value: 'Nexplanon',    months: 36 },
  { value: 'Jadelle',      months: 60 },
  { value: 'Sino-Implant II', months: 48 },
  { value: 'Lévonorgestrel 2 bâtonnets', months: 60 },
  { value: 'Autre',        months: 36 }
];

S.formValue = function(id, fallback){
  const el = document.getElementById(id);
  if(!el) return fallback != null ? fallback : '';
  if(el.type === 'checkbox') return el.checked;
  if(el.type === 'number' || el.type === 'range') return el.value === '' ? null : Number(el.value);
  return el.value;
};

S.formSet = function(id, value){
  const el = document.getElementById(id);
  if(!el) return;
  if(el.type === 'checkbox') el.checked = !!value;
  else el.value = value != null ? value : '';
};

S.pillsGroup = function(name, options, selected, multi){
  const sel = multi
    ? new Set(Array.isArray(selected) ? selected : [])
    : new Set([selected]);
  return `
    <div class="pills" data-pills="${name}" data-multi="${multi ? '1' : '0'}">
      ${options.map(o => {
        const isSel = multi ? sel.has(o.value) : sel.has(o.value);
        return `<button type="button" class="pill ${o.emoji ? 'emoji' : ''} ${isSel ? 'selected' : ''}"
                        data-pill-value="${S.escapeHtml(String(o.value))}">
          ${o.emoji ? S.escapeHtml(o.emoji) : ''} ${S.escapeHtml(o.label)}
        </button>`;
      }).join('')}
    </div>`;
};

S.bindPills = function(root, name, multi){
  const group = root.querySelector(`[data-pills="${name}"]`);
  if(!group) return { get: () => multi ? [] : null };
  group.querySelectorAll('[data-pill-value]').forEach(btn => {
    btn.addEventListener('click', () => {
      if(multi){
        btn.classList.toggle('selected');
      } else {
        group.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
        btn.classList.add('selected');
      }
    });
  });
  return {
    get(){
      const selected = Array.from(group.querySelectorAll('.pill.selected'))
        .map(p => p.dataset.pillValue);
      return multi ? selected : (selected[0] || null);
    },
    el: group
  };
};

S.openPeriodForm = function(dateIso){
  const today = dateIso || S.dt.todayISO();
  const body = `
    <label>${S.escapeHtml(S.t('startDate'))}</label>
    <input type="date" id="pfStart" value="${S.escapeHtml(today)}">
    <label>${S.escapeHtml(S.t('endDate'))} (${S.escapeHtml(S.t('optional'))})</label>
    <input type="date" id="pfEnd">
    <label>${S.escapeHtml(S.t('flow'))}</label>
    ${S.pillsGroup('flow', [
      { value: 'light', label: S.t('flowLight') },
      { value: 'medium', label: S.t('flowMedium') },
      { value: 'heavy', label: S.t('flowHeavy') },
      { value: 'spotting', label: S.t('spotting') }
    ], 'medium', false)}
    <label>${S.escapeHtml(S.t('notes'))}</label>
    <textarea id="pfNotes" rows="2"></textarea>
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button type="button" class="btn-primary" id="pfSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('qaPeriod'), body, {
    onMount: (root, close) => {
      const flow = S.bindPills(root, 'flow', false);
      root.querySelector('#pfSave').addEventListener('click', async () => {
        const startDate = S.formValue('pfStart');
        const endDate = S.formValue('pfEnd') || null;
        if(!startDate){ S.toast(S.t('dateRequired')); return; }
        if(endDate && S.dt.toSerial(endDate) < S.dt.toSerial(startDate)){
          S.toast(S.t('endBeforeStart')); return;
        }
        const entry = {
          startDate,
          endDate,
          flow: flow.get() || 'medium',
          notes: S.formValue('pfNotes')
        };
        if(S.dbAvailable) await S.dbAdd('periods', entry);
        else { S.state.periods.push(Object.assign({ id: Date.now() }, entry)); }
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openTemperatureForm = function(dateIso){
  const today = dateIso || S.dt.todayISO();
  const existing = S.state.temperatures.find(t => t.date === today);
  const unit = S.state.settings.tempUnit || 'C';
  const body = `
    <label>${S.escapeHtml(S.t('date'))}</label>
    <input type="date" id="tfDate" value="${S.escapeHtml(today)}">
    <label>${S.escapeHtml(S.t('temperatureValue'))} (°${S.escapeHtml(unit)})</label>
    <input type="number" id="tfValue" step="0.05" min="35" max="40"
           value="${S.escapeHtml(String(existing ? existing.value : (unit === 'F' ? 97.7 : 36.5)))}"
           inputmode="decimal">
    <p class="form-hint">${S.escapeHtml(S.t('temperatureHint'))}</p>
    <label>${S.escapeHtml(S.t('temperatureMethod'))}</label>
    <select id="tfMethod">
      <option value="basal">${S.escapeHtml(S.t('methodBasal'))}</option>
      <option value="oral">${S.escapeHtml(S.t('methodOral'))}</option>
      <option value="vaginal">${S.escapeHtml(S.t('methodVaginal'))}</option>
    </select>
    <label>${S.escapeHtml(S.t('notes'))}</label>
    <textarea id="tfNote" rows="2"></textarea>
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button type="button" class="btn-primary" id="tfSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('temperature'), body, {
    onMount: (root, close) => {
      root.querySelector('#tfSave').addEventListener('click', async () => {
        const date = S.formValue('tfDate');
        const value = S.formValue('tfValue');
        if(!date || value == null){ S.toast(S.t('valueInvalid')); return; }
        if(value < 34 || value > 42){ S.toast(S.t('temperatureInvalid')); return; }

        const entry = {
          date,
          value: Number(value),
          unit,
          method: S.formValue('tfMethod'),
          note: S.formValue('tfNote')
        };

        if(existing && S.dbAvailable){
          entry.id = existing.id;
          await S.dbPut('temperatures', entry);
        } else if(S.dbAvailable){
          await S.dbAdd('temperatures', entry);
        } else {
          const idx = S.state.temperatures.findIndex(t => t.date === date);
          if(idx >= 0) S.state.temperatures[idx] = Object.assign({ id: Date.now() }, entry);
          else S.state.temperatures.push(Object.assign({ id: Date.now() }, entry));
        }
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openJournalForm = function(dateIso){
  const today = dateIso || S.dt.todayISO();
  const existing = S.state.dailyLogs.find(l => l.date === today) || {};

  const body = `
    <label>${S.escapeHtml(S.t('date'))}</label>
    <input type="date" id="jfDate" value="${S.escapeHtml(today)}">

    <label>${S.escapeHtml(S.t('mood'))}</label>
    ${S.pillsGroup('mood', [1,2,3,4,5].map(v => ({
      value: v,
      emoji: S.t('mood' + v),
      label: ''
    })), existing.mood, false)}

    <label>${S.escapeHtml(S.t('flow'))}</label>
    ${S.pillsGroup('flow', [
      { value: 'none',   label: S.t('flowNone') },
      { value: 'light',  label: S.t('flowLight') },
      { value: 'medium', label: S.t('flowMedium') },
      { value: 'heavy',  label: S.t('flowHeavy') }
    ], existing.flow || 'none', false)}

    <label>${S.escapeHtml(S.t('symptoms'))}</label>
    ${S.pillsGroup('symptoms',
      S.SYMPTOMS.map(s => ({ value: s, label: S.t('sym' + s.charAt(0).toUpperCase() + s.slice(1)) })),
      existing.symptoms || [],
      true)}

    <label>${S.escapeHtml(S.t('pain'))} (0–10)</label>
    <input type="range" id="jfPain" min="0" max="10" value="${existing.pain != null ? existing.pain : 0}">
    <label>${S.escapeHtml(S.t('energy'))} (0–10)</label>
    <input type="range" id="jfEnergy" min="0" max="10" value="${existing.energy != null ? existing.energy : 5}">
    <label>${S.escapeHtml(S.t('sleep'))} (0–10)</label>
    <input type="range" id="jfSleep" min="0" max="10" value="${existing.sleep != null ? existing.sleep : 5}">
    <label>${S.escapeHtml(S.t('libido'))} (0–10)</label>
    <input type="range" id="jfLibido" min="0" max="10" value="${existing.libido != null ? existing.libido : 5}">

    <label>${S.escapeHtml(S.t('notes'))}</label>
    <textarea id="jfNotes" rows="2">${S.escapeHtml(existing.notes || '')}</textarea>

    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button type="button" class="btn-primary" id="jfSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('dailyJournal'), body, {
    onMount: (root, close) => {
      const mood = S.bindPills(root, 'mood', false);
      const flow = S.bindPills(root, 'flow', false);
      const symptoms = S.bindPills(root, 'symptoms', true);

      root.querySelector('#jfSave').addEventListener('click', async () => {
        const date = S.formValue('jfDate');
        if(!date){ S.toast(S.t('dateRequired')); return; }
        const moodVal = mood.get();
        const entry = {
          date,
          mood: moodVal ? Number(moodVal) : null,
          flow: flow.get() || 'none',
          symptoms: symptoms.get(),
          pain: S.formValue('jfPain'),
          energy: S.formValue('jfEnergy'),
          sleep: S.formValue('jfSleep'),
          libido: S.formValue('jfLibido'),
          notes: S.formValue('jfNotes')
        };
        if(existing.id && S.dbAvailable){
          entry.id = existing.id;
          await S.dbPut('dailyLogs', entry);
        } else if(S.dbAvailable){
          await S.dbAdd('dailyLogs', entry);
        } else {
          const idx = S.state.dailyLogs.findIndex(l => l.date === date);
          if(idx >= 0) S.state.dailyLogs[idx] = Object.assign({ id: Date.now() }, entry);
          else S.state.dailyLogs.push(Object.assign({ id: Date.now() }, entry));
        }
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openSexualForm = function(){
  const body = `
    <label>${S.escapeHtml(S.t('date'))}</label>
    <input type="date" id="sfDate" value="${S.escapeHtml(S.dt.todayISO())}">

    <label>${S.escapeHtml(S.t('protectedSex'))}</label>
    ${S.pillsGroup('prot', [
      { value: 'yes', label: S.t('protectedSex') },
      { value: 'no',  label: S.t('unprotectedSex') }
    ], 'yes', false)}

    <label>${S.escapeHtml(S.t('contraception'))}</label>
    <input type="text" id="sfContra" placeholder="${S.escapeHtml(S.t('contraceptionPlaceholder'))}">

    <label>${S.escapeHtml(S.t('privateNote'))}</label>
    <textarea id="sfNotes" rows="2"></textarea>

    <p class="disclaimer">⚠️ ${S.escapeHtml(S.t('sexualWarning'))}</p>
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="sfSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('logSex'), body, {
    onMount: (root, close) => {
      const prot = S.bindPills(root, 'prot', false);
      root.querySelector('#sfSave').addEventListener('click', async () => {
        const date = S.formValue('sfDate');
        if(!date){ S.toast(S.t('dateRequired')); return; }
        const entry = {
          date,
          protected: prot.get() === 'yes',
          contraception: S.formValue('sfContra'),
          notes: S.formValue('sfNotes')
        };
        if(S.dbAvailable) await S.dbAdd('sexualActivity', entry);
        else S.state.sexualActivity.push(Object.assign({ id: Date.now() }, entry));
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openImplantForm = function(existing){
  const i = existing || {};
  const isEdit = !!(existing && existing.id);

  const body = `
    <label>${S.escapeHtml(S.t('implantType'))}</label>
    <select id="ifType">
      ${S.IMPLANT_TYPES.map(t => `
        <option value="${S.escapeHtml(t.value)}" ${i.type === t.value ? 'selected' : ''}>
          ${S.escapeHtml(t.value)} — ${t.months} ${S.lang === 'fr' ? 'mois' : 'months'}
        </option>`).join('')}
    </select>

    <label>${S.escapeHtml(S.t('implantDate'))}</label>
    <input type="date" id="ifDate" value="${S.escapeHtml(i.insertionDate || S.dt.todayISO())}">

    <label>${S.escapeHtml(S.t('implantArm'))}</label>
    ${S.pillsGroup('arm', [
      { value: 'left',  label: S.t('armLeft') },
      { value: 'right', label: S.t('armRight') }
    ], i.arm || 'left', false)}

    <label>${S.escapeHtml(S.t('implantProvider'))}</label>
    <input type="text" id="ifProvider" value="${S.escapeHtml(i.provider || '')}">

    <label>${S.escapeHtml(S.t('notes'))}</label>
    <textarea id="ifNotes" rows="2">${S.escapeHtml(i.notes || '')}</textarea>

    <p class="disclaimer">⚠️ ${S.escapeHtml(S.t('implantWarning'))}</p>
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="ifSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(isEdit ? S.t('edit') : S.t('implantAdd'), body, {
    onMount: (root, close) => {
      const arm = S.bindPills(root, 'arm', false);
      root.querySelector('#ifSave').addEventListener('click', async () => {
        const type = S.formValue('ifType');
        const insertionDate = S.formValue('ifDate');
        if(!type || !insertionDate){ S.toast(S.t('fieldsRequired')); return; }
        const def = S.IMPLANT_TYPES.find(t => t.value === type) || { months: 36 };
        const entry = {
          type,
          insertionDate,
          durationMonths: def.months,
          arm: arm.get() || 'left',
          provider: S.formValue('ifProvider'),
          notes: S.formValue('ifNotes'),
          retire: false
        };
        entry.expectedEndDate = S.calc.implantExpiration(insertionDate, def.months);

        if(isEdit){
          entry.id = existing.id;
          entry.createdAt = existing.createdAt;
          if(S.dbAvailable) await S.dbPut('implant', entry);
          else {
            const idx = S.state.implants.findIndex(x => x.id === existing.id);
            if(idx >= 0) S.state.implants[idx] = entry;
          }
        } else {
          if(S.dbAvailable) await S.dbAdd('implant', entry);
          else S.state.implants.push(Object.assign({ id: Date.now() }, entry));
        }
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openPregnancyForm = function(existing){
  const p = existing || {};
  const body = `
    <label>${S.escapeHtml(S.t('lmp'))}</label>
    <input type="date" id="pgLmp" value="${S.escapeHtml(p.lmpDate || '')}">
    <label>${S.escapeHtml(S.t('conception'))}</label>
    <input type="date" id="pgConc" value="${S.escapeHtml(p.conceptionDate || '')}">
    <label>${S.escapeHtml(S.t('providedEdd'))}</label>
    <input type="date" id="pgEdd" value="${S.escapeHtml(p.providedEdd || '')}">
    <p class="disclaimer">⚠️ ${S.escapeHtml(S.t('medicalFooter'))}</p>
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="pgSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('pregnancy'), body, {
    onMount: (root, close) => {
      root.querySelector('#pgSave').addEventListener('click', async () => {
        const lmpDate = S.formValue('pgLmp') || null;
        const conceptionDate = S.formValue('pgConc') || null;
        const providedEdd = S.formValue('pgEdd') || null;
        if(!lmpDate && !conceptionDate && !providedEdd){
          S.toast(S.t('fieldsRequired'));
          return;
        }

        for(const pr of S.state.pregnancies){
          if(pr.active && pr.id !== (existing && existing.id)){
            pr.active = false;
            if(S.dbAvailable) await S.dbPut('pregnancy', pr);
          }
        }

        const entry = {
          lmpDate,
          conceptionDate,
          providedEdd,
          active: true,
          startedAt: new Date().toISOString()
        };

        if(existing && existing.id){
          entry.id = existing.id;
          entry.createdAt = existing.createdAt;
          if(S.dbAvailable) await S.dbPut('pregnancy', entry);
          else {
            const idx = S.state.pregnancies.findIndex(x => x.id === existing.id);
            if(idx >= 0) S.state.pregnancies[idx] = entry;
          }
        } else {
          if(S.dbAvailable) await S.dbAdd('pregnancy', entry);
          else S.state.pregnancies.push(Object.assign({ id: Date.now() }, entry));
        }
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openPregnancyJournalForm = function(){
  const body = `
    <label>${S.escapeHtml(S.t('date'))}</label>
    <input type="date" id="pjDate" value="${S.escapeHtml(S.dt.todayISO())}">
    <label>${S.escapeHtml(S.t('mood'))} (1–5)</label>
    <input type="range" id="pjMood" min="1" max="5" value="3">
    <label>${S.escapeHtml(S.t('energy'))} (0–10)</label>
    <input type="range" id="pjEnergy" min="0" max="10" value="5">
    <label>${S.escapeHtml(S.t('sleep'))} (0–10)</label>
    <input type="range" id="pjSleep" min="0" max="10" value="5">
    <label>${S.escapeHtml(S.t('temperature'))} / ${S.lang === 'fr' ? 'Poids' : 'Weight'} (kg, ${S.escapeHtml(S.t('optional'))})</label>
    <input type="number" id="pjWeight" step="0.1" min="30" max="200">
    <label>${S.escapeHtml(S.t('notes'))}</label>
    <textarea id="pjNotes" rows="2"></textarea>
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="pjSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('pregnancyJournal'), body, {
    onMount: (root, close) => {
      root.querySelector('#pjSave').addEventListener('click', async () => {
        const date = S.formValue('pjDate');
        if(!date){ S.toast(S.t('dateRequired')); return; }
        const entry = {
          date,
          pregnancyLog: true,
          mood: S.formValue('pjMood'),
          energy: S.formValue('pjEnergy'),
          sleep: S.formValue('pjSleep'),
          weight: S.formValue('pjWeight'),
          notes: S.formValue('pjNotes')
        };
        if(S.dbAvailable) await S.dbAdd('dailyLogs', entry);
        else S.state.dailyLogs.push(Object.assign({ id: Date.now() }, entry));
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openContractionForm = function(){
  const now = new Date();
  const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const body = `
    <label>${S.escapeHtml(S.t('date'))}</label>
    <input type="date" id="cfDate" value="${S.escapeHtml(S.dt.todayISO())}">
    <label>${S.escapeHtml(S.t('time'))}</label>
    <input type="time" id="cfTime" value="${S.escapeHtml(time)}">
    <label>${S.escapeHtml(S.t('contractionDuration'))}</label>
    <input type="number" id="cfDuration" step="0.5" min="0.5" max="10" value="1" inputmode="decimal">
    <p class="disclaimer">⚠️ ${S.escapeHtml(S.t('contractionTimerNote'))}</p>
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="cfSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('contractionSave'), body, {
    onMount: (root, close) => {
      root.querySelector('#cfSave').addEventListener('click', async () => {
        const date = S.formValue('cfDate');
        const timeVal = S.formValue('cfTime');
        const duration = S.formValue('cfDuration');
        if(!date || !timeVal || !duration){ S.toast(S.t('fieldsRequired')); return; }
        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = timeVal.split(':').map(Number);
        const start = new Date(y, m - 1, d, hh, mm).toISOString();
        const end = new Date(new Date(start).getTime() + duration * 60 * 1000).toISOString();
        const entry = { start, end, duration: Number(duration) * 60 };
        if(S.dbAvailable) await S.dbAdd('contractions', entry);
        else S.state.contractions.push(Object.assign({ id: Date.now() }, entry));
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openAppointmentForm = function(){
  const body = `
    <label>${S.escapeHtml(S.t('appointmentLabel'))}</label>
    <input type="text" id="afLabel" placeholder="${S.escapeHtml(S.t('appointmentLabelPlaceholder'))}">
    <label>${S.escapeHtml(S.t('appointmentDate'))}</label>
    <input type="date" id="afDate" value="${S.escapeHtml(S.dt.todayISO())}">
    <label>${S.escapeHtml(S.t('appointmentTime'))}</label>
    <input type="time" id="afTime" value="10:00">
    <label>${S.escapeHtml(S.t('appointmentType'))}</label>
    <select id="afType">
      ${S.APPT_TYPES.map(t => `<option value="${t}">${S.escapeHtml(S.t(S.APPT_TYPE_LABEL[t]))}</option>`).join('')}
    </select>
    <label>${S.escapeHtml(S.t('appointmentProfessional'))}</label>
    <input type="text" id="afProf">
    <label>${S.escapeHtml(S.t('appointmentFacility'))}</label>
    <input type="text" id="afFac">
    <label>${S.escapeHtml(S.t('notes'))}</label>
    <textarea id="afNotes" rows="2"></textarea>
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="afSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('appointmentAdd'), body, {
    onMount: (root, close) => {
      root.querySelector('#afSave').addEventListener('click', async () => {
        const label = S.formValue('afLabel').trim();
        const date = S.formValue('afDate');
        if(!label || !date){ S.toast(S.t('fieldsRequired')); return; }
        const entry = {
          label,
          date,
          time: S.formValue('afTime'),
          type: S.formValue('afType'),
          professional: S.formValue('afProf'),
          facility: S.formValue('afFac'),
          notes: S.formValue('afNotes')
        };
        if(S.dbAvailable) await S.dbAdd('appointments', entry);
        else S.state.appointments.push(Object.assign({ id: Date.now() }, entry));
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openReminderForm = function(){
  const body = `
    <label>${S.escapeHtml(S.t('reminderType'))}</label>
    <select id="rfType">
      ${S.REMINDER_TYPES.map(t => `<option value="${t}">${S.escapeHtml(S.t(S.REMINDER_TYPE_LABEL[t]))}</option>`).join('')}
    </select>
    <label>${S.escapeHtml(S.t('reminderDate'))}</label>
    <input type="date" id="rfDate" value="${S.escapeHtml(S.dt.todayISO())}">
    <label>${S.escapeHtml(S.t('reminderTime'))}</label>
    <input type="time" id="rfTime" value="09:00">
    <div class="row" style="justify-content:flex-end">
      <button type="button" class="btn-primary" id="rfSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('reminderAdd'), body, {
    onMount: (root, close) => {
      root.querySelector('#rfSave').addEventListener('click', async () => {
        const date = S.formValue('rfDate');
        if(!date){ S.toast(S.t('dateRequired')); return; }
        const entry = {
          type: S.formValue('rfType'),
          date,
          time: S.formValue('rfTime'),
          enabled: true
        };
        if(S.dbAvailable) await S.dbAdd('reminders', entry);
        else S.state.reminders.push(Object.assign({ id: Date.now() }, entry));
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('saved'));
        S.renderView();
      });
    }
  });
};

S.openChangePinSheet = function(){
  const body = `
    <label>${S.escapeHtml(S.t('currentPin'))}</label>
    <input type="tel" id="cpOld" inputmode="numeric" maxlength="4" placeholder="••••">
    <label>${S.escapeHtml(S.t('newPin'))}</label>
    <input type="tel" id="cpNew" inputmode="numeric" maxlength="4" placeholder="••••">
    <label>${S.escapeHtml(S.t('confirmNewPin'))}</label>
    <input type="tel" id="cpConfirm" inputmode="numeric" maxlength="4" placeholder="••••">
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button type="button" class="btn-primary" id="cpSave">${S.escapeHtml(S.t('save'))}</button>
    </div>`;

  S.openSheet(S.t('changePin'), body, {
    onMount: (root, close) => {
      root.querySelector('#cpSave').addEventListener('click', async () => {
        const oldPin = S.formValue('cpOld');
        const newPin = S.formValue('cpNew');
        const confirm = S.formValue('cpConfirm');

        if(!/^\d{4}$/.test(newPin)){ S.toast(S.t('pinRequired')); return; }
        if(newPin !== confirm){ S.toast(S.t('pinMismatch')); return; }

        const sec = S.state.security;
        if(!sec){ S.toast(S.t('errGeneric')); return; }

        const ok = await S.crypto.verifyPin(oldPin, sec.pinHash, sec.pinSalt);
        if(!ok){ S.toast(S.t('pinCurrentWrong')); return; }

        const { hash, salt } = await S.crypto.hashPin(newPin);
        sec.pinHash = hash;
        sec.pinSalt = salt;
        const { key, salt: aesSalt } = await S.crypto.deriveAesKey(newPin);
        sec.aesSalt = aesSalt;
        S.state.aesKey = key;

        if(S.dbAvailable) await S.dbPut('security', sec);
        S.persistFallback();
        close();
        S.toast(S.t('pinChangeOk'));
      });
    }
  });
};

S.openAppearanceSheet = function(){
  const cur = S.prefs.get('theme', 'system');
  const body = `
    <div class="pills" data-pills="theme">
      ${['light', 'dark', 'system'].map(t => `
        <button type="button" class="pill ${cur === t ? 'selected' : ''}" data-pill-value="${t}">
          ${S.escapeHtml(S.t(t === 'light' ? 'themeLight' : t === 'dark' ? 'themeDark' : 'themeSystem'))}
        </button>`).join('')}
    </div>`;

  S.openSheet(S.t('appearance'), body, {
    onMount: (root, close) => {
      const pills = S.bindPills(root, 'theme', false);
      root.querySelectorAll('[data-pill-value]').forEach(b => {
        b.addEventListener('click', () => {
          const v = b.dataset.pillValue;
          S.prefs.set('theme', v);
          S.applyTheme();
          close();
        });
      });
    }
  });
};

S.openLanguageSheet = function(){
  const body = `
    <div class="pills" data-pills="lang">
      <button type="button" class="pill ${S.lang === 'fr' ? 'selected' : ''}" data-pill-value="fr">Français</button>
      <button type="button" class="pill ${S.lang === 'en' ? 'selected' : ''}" data-pill-value="en">English</button>
    </div>`;

  S.openSheet(S.t('language'), body, {
    onMount: (root, close) => {
      root.querySelectorAll('[data-pill-value]').forEach(b => {
        b.addEventListener('click', () => {
          const lang = b.dataset.pillValue;
          S.lang = lang;
          S.prefs.set('lang', lang);
          localStorage.setItem('serena_lang', lang);
          S.applyI18n();
          S.buildNav();
          close();
          S.renderView();
          S.toast(S.t('saved'));
        });
      });
    }
  });
};

S.openDataSheet = function(){
  const body = `
    <div class="settings-list">
      <button type="button" id="dsDemo">🧪 <span>${S.escapeHtml(S.t('loadDemo'))}</span></button>
      <button type="button" id="dsClearDemo">🧹 <span>${S.escapeHtml(S.t('clearDemo'))}</span></button>
      <button type="button" id="dsExport">⬇️ <span>${S.escapeHtml(S.t('exportData'))}</span></button>
      <button type="button" id="dsDelete" style="color:var(--danger)">🗑️ <span>${S.escapeHtml(S.t('deleteAllTitle'))}</span></button>
    </div>`;

  S.openSheet(S.t('data'), body, {
    onMount: (root, close) => {
      root.querySelector('#dsDemo').addEventListener('click', async () => {
        await S.loadDemoData();
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('demoLoaded'));
        S.renderView();
      });
      root.querySelector('#dsClearDemo').addEventListener('click', async () => {
        await S.clearDemoData();
        await S.reloadAll();
        S.persistFallback();
        close();
        S.toast(S.t('demoCleared'));
        S.renderView();
      });
      root.querySelector('#dsExport').addEventListener('click', () => S.exportJSON());
      root.querySelector('#dsDelete').addEventListener('click', () => {
        close();
        S.confirmDialog(S.t('deleteAllTitle'), S.t('deleteAllWarn'), () => {
          S.confirmDialog(S.t('deleteAllTitle'), S.t('deleteAllConfirm2'), async () => {
            if(S.dbAvailable) await S.dbClearAll();
            localStorage.removeItem(S.LS_KEY);
            localStorage.removeItem('serena_theme');
            localStorage.removeItem('serena_lang');
            S.toast(S.t('deleteAllDone'));
            setTimeout(() => window.location.reload(), 800);
          });
        });
      });
    }
  });
};

S.openDebugSheet = async function(){
  const info = await S.storageInfo();
  const tests = await S.runSelfTests();

  const body = `
    <h3 style="font-size:14px;margin:0 0 8px">${S.escapeHtml(S.t('statusPage'))}</h3>
    <table class="hist">
      <tbody>
        <tr><td>IndexedDB</td><td>${info.indexedDB ? '✅' : '❌'}</td></tr>
        <tr><td>DB ouverte</td><td>${info.dbOpened ? '✅' : '—'}</td></tr>
        <tr><td>Web Crypto</td><td>${info.webCrypto ? '✅' : '❌'}</td></tr>
        <tr><td>WebAuthn</td><td>${info.webAuthn ? '✅' : '❌'}</td></tr>
        <tr><td>Notifications</td><td>${info.notifications ? '✅' : '❌'}</td></tr>
        <tr><td>Service Worker</td><td>${info.serviceWorker ? '✅' : '❌'}</td></tr>
        <tr><td>Secure context</td><td>${info.secureContext ? '✅' : '❌'}</td></tr>
        <tr><td>localStorage</td><td>${info.localStorage ? '✅' : '❌'}</td></tr>
        ${info.quota ? `<tr><td>Quota</td><td>${info.quota.percent}% (${Math.round(info.quota.usage/1024)} Ko)</td></tr>` : ''}
      </tbody>
    </table>

    <h3 style="font-size:14px;margin:14px 0 8px">${S.escapeHtml(S.t('runTests'))}</h3>
    <table class="hist">
      <tbody>
        ${tests.map(t => `<tr><td>${S.escapeHtml(t.name)}</td><td>${t.ok ? '✅' : '❌ ' + S.escapeHtml(t.error || '')}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button type="button" class="btn-outline" id="dbgClose">${S.escapeHtml(S.t('close'))}</button>
    </div>`;

  S.openSheet(S.t('statusPage'), body, {
    onMount: (root, close) => {
      root.querySelector('#dbgClose').addEventListener('click', close);
    }
  });
};

S.runSelfTests = async function(){
  const tests = [];

  try{
    const periods = [
      { startDate: S.dt.addDays(S.dt.todayISO(), -56), endDate: S.dt.addDays(S.dt.todayISO(), -52) },
      { startDate: S.dt.addDays(S.dt.todayISO(), -28), endDate: S.dt.addDays(S.dt.todayISO(), -24) }
    ];
    const next = S.calc.predictNextPeriod(periods, 28);
    const diff = S.dt.diffDays(S.dt.todayISO(), next.date);
    tests.push({ name: 'predictNextPeriod (28j)', ok: diff >= 0 && diff <= 28 });
  }catch(e){ tests.push({ name: 'predictNextPeriod', ok: false, error: e.message }); }

  try{
    const periods = [{ startDate: S.dt.addDays(S.dt.todayISO(), -14) }];
    const fw = S.calc.estimateFertileWindow(periods, 28, 14);
    const ovu = S.calc.estimateOvulation(periods, 28, 14);
    const startDiff = S.dt.diffDays(ovu.date, fw.start);
    const endDiff = S.dt.diffDays(ovu.date, fw.end);
    tests.push({ name: 'fenêtre fertile (J-19 → J-13)', ok: startDiff === -5 && endDiff === 1 });
  }catch(e){ tests.push({ name: 'fenêtre fertile', ok: false, error: e.message }); }

  try{
    const { hash, salt } = await S.crypto.hashPin('1234');
    const ok = await S.crypto.verifyPin('1234', hash, salt);
    const ko = await S.crypto.verifyPin('0000', hash, salt);
    tests.push({ name: 'crypto PIN', ok: ok && !ko });
  }catch(e){ tests.push({ name: 'crypto PIN', ok: false, error: e.message }); }

  try{
    const { key } = await S.crypto.deriveAesKey('1234');
    const { iv, ct } = await S.crypto.encrypt(key, 'secret-serena');
    const dec = await S.crypto.decrypt(key, iv, ct);
    tests.push({ name: 'AES-GCM', ok: dec === 'secret-serena' });
  }catch(e){ tests.push({ name: 'AES-GCM', ok: false, error: e.message }); }

  try{
    const iso = S.dt.addDays('2026-01-31', 1);
    tests.push({ name: 'date +1 (31 janv)', ok: iso === '2026-02-01' });
  }catch(e){ tests.push({ name: 'date +1', ok: false, error: e.message }); }

  try{
    const end = S.calc.implantExpiration('2026-01-31', 1);
    tests.push({ name: 'implant +1 mois (31 janv)', ok: !!end });
  }catch(e){ tests.push({ name: 'implant +1 mois', ok: false, error: e.message }); }

  try{
    const temps = [
      { date: S.dt.addDays(S.dt.todayISO(), -5), value: 36.4, unit: 'C' },
      { date: S.dt.addDays(S.dt.todayISO(), -4), value: 36.5, unit: 'C' },
      { date: S.dt.addDays(S.dt.todayISO(), -3), value: 36.4, unit: 'C' },
      { date: S.dt.addDays(S.dt.todayISO(), -2), value: 36.8, unit: 'C' },
      { date: S.dt.addDays(S.dt.todayISO(), -1), value: 36.9, unit: 'C' },
      { date: S.dt.todayISO(), value: 36.85, unit: 'C' }
    ];
    const an = S.calc.analyzeBasalTemperature(temps);
    tests.push({ name: 'hausse thermique', ok: an.rise === true });
  }catch(e){ tests.push({ name: 'hausse thermique', ok: false, error: e.message }); }

  try{
    const s = S.escapeHtml('<img src=x onerror=alert(1)>');
    tests.push({ name: 'escapeHtml', ok: s.indexOf('<img') === -1 });
  }catch(e){ tests.push({ name: 'escapeHtml', ok: false, error: e.message }); }

  return tests;
};

S.SCHEMA_VERSION = 12;

S.exportJSON = async function(){
  const data = {
    __serena__: true,
    version: S.SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lang: S.lang
  };
  if(S.dbAvailable){
    for(const store of S.STORES){
      data[store] = await S.dbGetAll(store);
    }
  } else {
    data.profile = S.state.profile ? [S.state.profile] : [];
    data.periods = S.state.periods;
    data.dailyLogs = S.state.dailyLogs;
    data.temperatures = S.state.temperatures;
    data.sexualActivity = S.state.sexualActivity;
    data.implant = S.state.implants || [];
    data.pregnancy = S.state.pregnancies || [];
    data.appointments = S.state.appointments;
    data.reminders = S.state.reminders;
    data.contractions = S.state.contractions;
    data.settings = [S.state.settings];
    data.security = S.state.security ? [S.state.security] : [];
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `serena-export-${S.dt.todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  S.toast(S.t('exportSuccess'));
};

S.importJSON = function(data){
  if(!data || !data.__serena__){
    S.toast(S.t('importInvalid'));
    return;
  }
  S.confirmDialog(S.t('importData'), S.t('importConfirm'), async () => {
    try{
      const stores = ['profile', 'periods', 'dailyLogs', 'temperatures', 'sexualActivity',
                      'implant', 'pregnancy', 'appointments', 'reminders', 'contractions',
                      'settings'];
      for(const store of stores){
        if(!Array.isArray(data[store])) continue;
        for(const item of data[store]){
          const copy = { ...item };
          delete copy.id;
          if(S.dbAvailable) await S.dbAdd(store, copy);
          else{
            if(store === 'profile') S.state.profile = copy;
            else if(store === 'settings') Object.assign(S.state.settings, copy);
            else if(Array.isArray(S.state[store])) S.state[store].push(copy);
          }
        }
      }
      await S.reloadAll();
      S.persistFallback();
      S.toast(S.t('importSuccess'));
      S.renderView();
    }catch(e){
      S.toast(S.t('errGeneric'));
    }
  });
};

S.openDoctorModeSheet = function(){
  const sections = [
    { key: 'cycle',        label: S.t('periods') },
    { key: 'temperature',  label: S.t('temperature') },
    { key: 'journal',      label: S.t('navJournal') },
    { key: 'sexual',       label: S.t('navSexual') },
    { key: 'implant',      label: S.t('navImplant') },
    { key: 'pregnancy',    label: S.t('pregnancy') },
    { key: 'contractions', label: S.t('navContractions') },
    { key: 'appointments', label: S.t('appointments') }
  ];

  const body = `
    <p class="muted">${S.escapeHtml(S.t('doctorModeSelect'))}</p>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">
      ${sections.map(s => `
        <label style="display:flex;align-items:center;gap:8px;font-weight:400">
          <input type="checkbox" class="dm-section" value="${s.key}" checked style="width:auto">
          ${S.escapeHtml(s.label)}
        </label>`).join('')}
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button type="button" class="btn-primary" id="dmGenerate">📄 ${S.escapeHtml(S.t('exportPdf'))}</button>
    </div>`;

  S.openSheet(S.t('doctorMode'), body, {
    onMount: (root, close) => {
      root.querySelector('#dmGenerate').addEventListener('click', () => {
        const selected = Array.from(root.querySelectorAll('.dm-section:checked')).map(c => c.value);
        close();
        S.buildPrintReport(selected);
      });
    }
  });
};

S.buildPrintReport = function(selected){
  const st = S.state;
  const now = new Date();
  let html = `
    <div style="padding:24px;font-family:Georgia,serif;max-width:760px;margin:0 auto;color:#111">
      <div style="display:flex;align-items:center;gap:12px;border-bottom:2px solid #4A2B7A;padding-bottom:12px">
        <svg width="48" height="48" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="pv" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#4A2B7A"/><stop offset="100%" stop-color="#B8A3DC"/>
            </linearGradient>
            <linearGradient id="pr" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#F5A9C4"/><stop offset="100%" stop-color="#F5B8A8"/>
            </linearGradient>
          </defs>
          <path d="M100 25 A75 75 0 1 0 100 175 A75 75 0 0 0 165 120" fill="none" stroke="url(#pv)" stroke-width="16" stroke-linecap="round"/>
          <path d="M100 55 A45 45 0 1 0 100 145" fill="none" stroke="url(#pv)" stroke-width="14" stroke-linecap="round"/>
          <path d="M100 175 A75 75 0 0 0 165 120" fill="none" stroke="url(#pr)" stroke-width="16" stroke-linecap="round"/>
        </svg>
        <div>
          <h1 style="margin:0;font-size:22px;color:#4A2B7A">SERENA</h1>
          <p style="margin:0;color:#666;font-size:12px">${S.escapeHtml(S.t('reportGenerated'))} ${S.escapeHtml(now.toLocaleDateString())}</p>
        </div>
      </div>

      <p style="font-size:12px;font-style:italic;color:#666;margin-top:14px">
        ${S.escapeHtml(S.t('reportDisclaimer'))}
      </p>

      <h2 style="font-size:16px;color:#4A2B7A;margin-top:20px">${S.escapeHtml(S.t('patientInfo'))}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:4px 0">${S.escapeHtml(S.t('onbName'))}</td><td>${S.escapeHtml((st.profile && st.profile.name) || '—')}</td></tr>
        <tr><td style="padding:4px 0">${S.escapeHtml(S.t('onbBirth'))}</td><td>${S.escapeHtml((st.profile && st.profile.birthDate) || '—')}</td></tr>
      </table>`;

  const has = k => selected.indexOf(k) !== -1;

  if(has('cycle')){
    const avg = S.calc.averageCycleLength(st.periods, st.settings.avgCycleLength);
    const variab = S.calc.cycleVariability(st.periods);
    const periods = st.periods.slice().sort((a,b) => S.dt.toSerial(b.startDate) - S.dt.toSerial(a.startDate)).slice(0, 12);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('periods'))}</h2>
      <p style="font-size:13px;margin:4px 0">
        ${S.escapeHtml(S.t('avgCycle'))}: <strong>${avg.value} j</strong> ·
        ${S.escapeHtml(S.t('regularity') || 'Régularité')}: <strong>${S.escapeHtml(S.t(variab.label))}</strong>
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">
        <thead><tr style="background:#EDE7F6">
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('startDate'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('endDate'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('flow'))}</th>
        </tr></thead>
        <tbody>
          ${periods.map(p => `<tr>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.dt.fmt(p.startDate))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(p.endDate ? S.dt.fmt(p.endDate) : '—')}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.t(S.calc.flowKey(p.flow)))}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  if(has('temperature')){
    const temps = st.temperatures.slice().sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date)).slice(0, 30);
    const stats = S.calc.temperatureStats(st.temperatures);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('temperature'))}</h2>
      ${stats.count ? `<p style="font-size:13px;margin:4px 0">
        Min: ${stats.min}°C · Max: ${stats.max}°C · Moy: ${stats.avg}°C (${stats.count} mesures)
      </p>` : ''}
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">
        <thead><tr style="background:#EDE7F6">
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('date'))}</th>
          <th style="text-align:left;padding:6px">°C</th>
        </tr></thead>
        <tbody>
          ${temps.map(t => `<tr>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.dt.fmt(t.date))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(String(t.value))}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  if(has('journal')){
    const logs = st.dailyLogs.slice().sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date)).slice(0, 30);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('navJournal'))}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">
        <thead><tr style="background:#EDE7F6">
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('date'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('mood'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('pain'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('symptoms'))}</th>
        </tr></thead>
        <tbody>
          ${logs.map(l => `<tr>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.dt.fmt(l.date))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${l.mood || '—'}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${l.pain != null ? l.pain : '—'}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml((l.symptoms || []).join(', ') || '—')}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  if(has('sexual')){
    const logs = st.sexualActivity.slice().sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date)).slice(0, 30);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('navSexual'))}</h2>
      <p style="font-size:11px;color:#666">${S.escapeHtml(S.t('sexualWarning'))}</p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">
        <thead><tr style="background:#EDE7F6">
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('date'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('protectedSex'))}</th>
        </tr></thead>
        <tbody>
          ${logs.map(a => `<tr>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.dt.fmt(a.date))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${a.protected ? '✔' : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  if(has('implant') && st.implant){
    const end = st.implant.expectedEndDate
      || S.calc.implantExpiration(st.implant.insertionDate, st.implant.durationMonths);
    const days = S.calc.implantDaysLeft(st.implant);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('navImplant'))}</h2>
      <p style="font-size:13px;margin:4px 0">
        <strong>${S.escapeHtml(st.implant.type)}</strong><br>
        ${S.escapeHtml(S.t('implantDate'))}: ${S.escapeHtml(S.dt.fmtLong(st.implant.insertionDate))}<br>
        ${S.escapeHtml(S.t('implantEndDate'))}: ${S.escapeHtml(S.dt.fmtLong(end))}<br>
        ${days > 0 ? S.escapeHtml(S.t('implantDaysLeft', { n: days })) : S.escapeHtml(S.t('implantExpired', { n: Math.abs(days) }))}
      </p>`;
  }

  if(has('pregnancy') && st.pregnancy){
    const info = S.calc.pregnancyInfo(st.pregnancy);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('pregnancy'))}</h2>
      <p style="font-size:13px;margin:4px 0">
        ${S.escapeHtml(S.t('lmp'))}: ${S.escapeHtml(S.dt.fmtLong(st.pregnancy.lmpDate))}<br>
        ${S.escapeHtml(S.t('pregnancyWeeks'))}: <strong>${info.sa} SA + ${info.daysInSA}j</strong> (${info.trimester}${S.lang === 'fr' ? 'e' : ''} ${S.lang === 'fr' ? 'trimestre' : 'trimester'})<br>
        ${S.escapeHtml(S.t('edd'))}: <strong>${S.escapeHtml(S.dt.fmtLong(info.dpa))}</strong>
      </p>`;
  }

  if(has('contractions')){
    const ctr = st.contractions.slice().sort((a,b) => new Date(b.start) - new Date(a.start)).slice(0, 30);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('navContractions'))}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">
        <thead><tr style="background:#EDE7F6">
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('date'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('duration'))}</th>
        </tr></thead>
        <tbody>
          ${ctr.map(c => `<tr>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(new Date(c.start).toLocaleString(S.lang === 'fr' ? 'fr-FR' : 'en-US'))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${c.duration ? Math.round(c.duration) + 's' : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  if(has('appointments')){
    const list = st.appointments.slice().sort((a,b) => S.dt.toSerial(b.date) - S.dt.toSerial(a.date)).slice(0, 30);
    html += `
      <h2 style="font-size:16px;color:#4A2B7A;margin-top:22px">${S.escapeHtml(S.t('appointments'))}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">
        <thead><tr style="background:#EDE7F6">
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('date'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('appointmentType'))}</th>
          <th style="text-align:left;padding:6px">${S.escapeHtml(S.t('appointmentLabel'))}</th>
        </tr></thead>
        <tbody>
          ${list.map(a => `<tr>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.dt.fmt(a.date))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(S.t(S.APPT_TYPE_LABEL[a.type] || 'apptTypeOther'))}</td>
            <td style="padding:4px 6px;border-bottom:1px solid #EEE">${S.escapeHtml(a.label || '')}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  html += `
      <p style="margin-top:30px;font-size:11px;color:#666;text-align:center">
        ${S.escapeHtml(S.t('medicalFooter'))}
      </p>
    </div>`;

  const printEl = S.$('#print-report');
  if(printEl) printEl.innerHTML = html;
  setTimeout(() => window.print(), 250);
};

S.requestNotificationPermission = async function(){
  if(!('Notification' in window)){
    S.toast(S.t('reminderNotSupported'));
    return false;
  }
  if(Notification.permission === 'granted'){
    S.state.settings.notifications = true;
    if(S.dbAvailable) await S.dbPut('settings', S.state.settings);
    S.toast(S.t('reminderPermissionGranted'));
    return true;
  }
  if(Notification.permission === 'denied'){
    S.toast(S.t('reminderPermissionDenied'));
    return false;
  }
  try{
    const perm = await Notification.requestPermission();
    if(perm === 'granted'){
      S.state.settings.notifications = true;
      if(S.dbAvailable) await S.dbPut('settings', S.state.settings);
      S.toast(S.t('reminderPermissionGranted'));
      return true;
    }
    S.toast(S.t('reminderPermissionDenied'));
    return false;
  }catch(e){
    S.toast(S.t('reminderPermissionDenied'));
    return false;
  }
};

S.notify = function(title, body){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  try{
    new Notification(title, { body, icon: undefined, badge: undefined, silent: false });
  }catch(e){ /* ignore */ }
};

S.checkReminders = function(){
  const today = S.dt.todayISO();
  const now = new Date();
  const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  S.state.reminders.forEach(r => {
    if(!r.enabled) return;
    if(r.date !== today) return;
    if(r.time && r.time !== hhmm) return;
    S.notify('SERENA', S.t(S.REMINDER_TYPE_LABEL[r.type] || 'reminders'));
  });

  const impl = S.calc.getActiveImplant(S.state.implants || []);
  if(impl){
    const days = S.calc.implantDaysLeft(impl);
    [90, 30, 7, 1].forEach(threshold => {
      if(days === threshold){
        S.notify('SERENA', S.t('implantDaysLeft', { n: days }));
      }
    });
  }
};

S.loadDemoData = async function(){
  const today = S.dt.todayISO();
  const demoTag = '[DEMO]';

  await S.clearDemoData();

  if(!S.state.profile){
    const profile = { id: 1, onboarded: true, name: 'Démo', birthDate: '1995-06-15' };
    if(S.dbAvailable) await S.dbPut('profile', profile);
    else S.state.profile = profile;
  }

  for(let i = 3; i >= 0; i--){
    const start = S.dt.addDays(today, -28 * i - 2);
    const end = S.dt.addDays(start, 4);
    const entry = { startDate: start, endDate: end, flow: 'medium', notes: demoTag };
    if(S.dbAvailable) await S.dbAdd('periods', entry);
    else S.state.periods.push(Object.assign({ id: Date.now() + i }, entry));
  }

  for(let i = 0; i < 10; i++){
    const date = S.dt.addDays(today, -i);
    const base = 36.4 + (i < 4 ? 0.3 : 0) + Math.random() * 0.1;
    const entry = {
      date,
      value: Math.round(base * 100) / 100,
      unit: 'C',
      method: 'basal',
      note: demoTag
    };
    if(S.dbAvailable) await S.dbAdd('temperatures', entry);
    else S.state.temperatures.push(Object.assign({ id: Date.now() + i }, entry));
  }

  for(let i = 0; i < 10; i++){
    const date = S.dt.addDays(today, -i);
    const entry = {
      date,
      mood: 1 + Math.floor(Math.random() * 5),
      pain: Math.floor(Math.random() * 4),
      energy: Math.floor(Math.random() * 10),
      sleep: Math.floor(Math.random() * 10),
      libido: Math.floor(Math.random() * 10),
      symptoms: ['fatigue'],
      notes: demoTag
    };
    if(S.dbAvailable) await S.dbAdd('dailyLogs', entry);
    else S.state.dailyLogs.push(Object.assign({ id: Date.now() + i }, entry));
  }

  const implant = {
    id: 1,
    type: 'Nexplanon',
    insertionDate: S.dt.addDays(today, -200),
    durationMonths: 36,
    expectedEndDate: S.calc.implantExpiration(S.dt.addDays(today, -200), 36),
    arm: 'left',
    notes: demoTag,
    retire: false
  };
  if(S.dbAvailable) await S.dbPut('implant', implant);
  else S.state.implants.push(implant);

  const appt = {
    label: 'Consultation démo',
    date: S.dt.addDays(today, 10),
    time: '10:00',
    type: 'consultation',
    professional: 'Dr Démo',
    facility: 'Clinique Démo',
    notes: demoTag
  };
  if(S.dbAvailable) await S.dbAdd('appointments', appt);
  else S.state.appointments.push(Object.assign({ id: Date.now() }, appt));

  S.state.settings.demoLoaded = true;
};

S.clearDemoData = async function(){
  const demoTag = '[DEMO]';
  if(!S.dbAvailable){
    S.state.periods = S.state.periods.filter(p => p.notes !== demoTag);
    S.state.temperatures = S.state.temperatures.filter(t => t.note !== demoTag);
    S.state.dailyLogs = S.state.dailyLogs.filter(l => l.notes !== demoTag);
    S.state.appointments = S.state.appointments.filter(a => a.notes !== demoTag);
    S.state.implants = S.state.implants.filter(i => i.notes !== demoTag);
    return;
  }
  for(const store of ['periods', 'temperatures', 'dailyLogs', 'appointments', 'implant']){
    const all = await S.dbGetAll(store);
    for(const item of all){
      if(item.notes === demoTag){
        await S.dbDelete(store, item.id);
      }
    }
  }
};

S.deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  S.deferredInstallPrompt = e;
});

S.setupPWA = function(){
  if(!('serviceWorker' in navigator) || !window.isSecureContext) return;
  navigator.serviceWorker.register('./../sw.js', { scope: './assets' }).catch(error => {
    console.warn('SERENA: service worker indisponible', error);
  });
};

S.bindOnlineStatus = function(){
  const badge = S.$('#offlineBadge');
  if(!badge) return;
  const update = () => {
    if(navigator.onLine){
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
      badge.textContent = '⚠️ ' + S.t('offlineBadge');
    }
  };
  window.addEventListener('online', () => { update(); S.toast(S.t('onlineRestored')); });
  window.addEventListener('offline', update);
  update();
};

S.pin = {
  buffer: '',
  mode: 'verify',
  firstEntry: null,
  failCount: 0,
  lockUntil: 0
};

S.contractionActive = S.prefs.get('contractionActive', null);

S.buildNumpad = function(){
  const grid = S.$('#numpad');
  if(!grid) return;
  grid.innerHTML = '';
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  keys.forEach(k => {
    if(k === ''){
      const placeholder = S.el('div', { style: { width: '72px', height: '72px' } });
      grid.appendChild(placeholder);
      return;
    }
    const b = S.el('button', {
      type: 'button',
      'aria-label': k === '⌫' ? (S.lang === 'fr' ? 'Effacer' : 'Delete') : k
    }, k);
    b.addEventListener('click', () => S.pinKeyPress(k));
    grid.appendChild(b);
  });
};

S.renderPinDots = function(){
  const wrap = S.$('#pinDots');
  if(!wrap) return;
  wrap.innerHTML = '';
  for(let i = 0; i < 4; i++){
    const d = S.el('span', { class: 'dot' + (i < S.pin.buffer.length ? ' filled' : '') });
    wrap.appendChild(d);
  }
};

S.setLockMessage = function(msgKey){
  const el = S.$('#lockMsg');
  if(el) el.textContent = S.t(msgKey);
};

S.pinKeyPress = async function(k){
  if(Date.now() < S.pin.lockUntil) return;

  if(k === '⌫'){
    S.pin.buffer = S.pin.buffer.slice(0, -1);
    S.renderPinDots();
    return;
  }
  if(S.pin.buffer.length >= 4) return;

  S.pin.buffer += k;
  S.renderPinDots();

  if(S.pin.buffer.length === 4){
    await S.handlePinComplete();
  }
};

S.handlePinComplete = async function(){
  const pin = S.pin.buffer;

  if(S.pin.mode === 'setup-first'){
    S.pin.firstEntry = pin;
    S.pin.buffer = '';
    S.pin.mode = 'setup-confirm';
    S.renderPinDots();
    S.setLockMessage('confirmPin');
    return;
  }

  if(S.pin.mode === 'setup-confirm'){
    if(S.pin.firstEntry !== pin){
      S.pin.firstEntry = null;
      S.pin.buffer = '';
      S.pin.mode = 'setup-first';
      S.renderPinDots();
      S.setLockMessage('createPin');
      S.toast(S.t('pinMismatch'));
      return;
    }

    try{
      const { hash, salt } = await S.crypto.hashPin(pin);
      const { key, salt: aesSalt } = await S.crypto.deriveAesKey(pin);

      const sec = {
        id: 1,
        pinHash: hash,
        pinSalt: salt,
        aesSalt,
        autoLockMinutes: 5,
        webauthnCredId: null
      };

      if(S.dbAvailable){
        await S.dbClear('security');
        await S.dbPut('security', sec);
      } else {
        S.state.security = sec;
      }

      S.state.security = sec;
      S.state.aesKey = key;
      S.persistFallback();

      S.toast(S.t('pinCreated'));
      await S.reloadAll();
      S.showApp();
    }catch(e){
      S.toast(S.t('errCrypto'));
    }
    return;
  }

  if(S.pin.mode === 'verify'){
    const sec = S.state.security;
    if(!sec){
      S.pin.buffer = '';
      S.renderPinDots();
      return;
    }
    const ok = await S.crypto.verifyPin(pin, sec.pinHash, sec.pinSalt);
    if(ok){
      try{
        const { key } = await S.crypto.deriveAesKey(pin, sec.aesSalt);
        S.state.aesKey = key;
      }catch(e){ /* ignore */ }
      S.pin.buffer = '';
      S.pin.failCount = 0;
      S.renderPinDots();
      S.showApp();
    } else {
      S.pin.failCount++;
      S.pin.buffer = '';
      S.renderPinDots();
      const delay = Math.min(30, Math.pow(2, S.pin.failCount));
      S.pin.lockUntil = Date.now() + delay * 1000;
      S.setLockMessage('wrongPin');
      S.$('#lockMsg').textContent = S.t('wrongPin') + ' — ' + S.t('tryAgainIn', { n: delay });
      setTimeout(() => S.setLockMessage('lockEnterPin'), delay * 1000);
      if(navigator.vibrate) navigator.vibrate(200);
    }
    return;
  }
};

S.showLockSetup = function(mode){
  const lock = S.$('#screen-lock');
  const onb = S.$('#screen-onboarding');
  const splash = S.$('#screen-splash');
  const app = S.$('#app');
  if(!lock) return;

  lock.classList.remove('hidden');
  if(onb) onb.classList.add('hidden');
  if(splash) splash.classList.add('hidden');
  if(app) app.classList.add('hidden');

  S.pin.mode = mode || 'setup-first';
  S.pin.buffer = '';
  S.pin.firstEntry = null;
  S.pin.failCount = 0;
  S.pin.lockUntil = 0;

  S.setLockMessage('createPin');
  const bio = S.$('#btnBiometric');
  if(bio) bio.classList.add('hidden');
  S.buildNumpad();
  S.renderPinDots();
};

S.showLockVerify = function(){
  const lock = S.$('#screen-lock');
  const onb = S.$('#screen-onboarding');
  const splash = S.$('#screen-splash');
  const app = S.$('#app');
  if(!lock) return;

  lock.classList.remove('hidden');
  if(onb) onb.classList.add('hidden');
  if(splash) splash.classList.add('hidden');
  if(app) app.classList.add('hidden');

  S.pin.mode = 'verify';
  S.pin.buffer = '';
  S.pin.failCount = 0;

  S.setLockMessage('lockEnterPin');

  const bio = S.$('#btnBiometric');
  if(bio){
    const canBio = !!window.PublicKeyCredential
      && S.state.security
      && S.state.security.webauthnCredId
      && window.isSecureContext;
    bio.classList.toggle('hidden', !canBio);
  }

  S.buildNumpad();
  S.renderPinDots();
};

S.tryBiometric = async function(){
  try{
    if(!window.PublicKeyCredential){
      S.toast(S.lang === 'fr' ? 'Biométrie non disponible' : 'Biometrics not available');
      return;
    }
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if(!available){
      S.toast(S.lang === 'fr' ? 'Aucune biométrie configurée' : 'No biometric configured');
      return;
    }
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname || undefined
      }
    });
    if(assertion){
      S.toast(S.lang === 'fr' ? 'Biométrie validée — PIN requis une fois' : 'Biometrics OK — PIN required once');
    }
  }catch(e){
    S.toast(S.lang === 'fr' ? 'Biométrie annulée' : 'Biometrics cancelled');
  }
};

S.onbIndex = 0;

S.ONB_STEPS = [
  { key: 'welcome',  title: 'onbWelcomeTitle',  body: 'onbWelcomeBody',  icon: '💜' },
  { key: 'privacy',  title: 'onbPrivacyTitle',  body: 'onbPrivacyBody',  icon: '🔒' },
  { key: 'profile',  title: 'onbProfileTitle',  body: 'onbProfileBody',  icon: '👤' },
  { key: 'implant',  title: 'onbImplantTitle',  body: 'onbImplantBody',  icon: '💊' },
  { key: 'security', title: 'onbSecurityTitle', body: 'onbSecurityBody', icon: '🔐' }
];

S.renderOnboarding = function(){
  const container = S.$('#onbContent');
  if(!container) return;

  const step = S.ONB_STEPS[S.onbIndex];
  const isFirst = S.onbIndex === 0;
  const isLast = S.onbIndex === S.ONB_STEPS.length - 1;

  let extraFields = '';
  if(step.key === 'profile'){
    extraFields = `
      <label>${S.escapeHtml(S.t('onbName'))}</label>
      <input type="text" id="onbName" placeholder="${S.escapeHtml(S.t('onbNamePlaceholder'))}">
      <label>${S.escapeHtml(S.t('onbBirth'))}</label>
      <input type="date" id="onbBirth">`;
  } else if(step.key === 'implant'){
    extraFields = `
      <label>${S.escapeHtml(S.t('onbImplantType'))}</label>
      <select id="onbImplantType">
        <option value="">${S.escapeHtml(S.t('onbSkipImplant'))}</option>
        ${S.IMPLANT_TYPES.map(t => `<option value="${S.escapeHtml(t.value)}">${S.escapeHtml(t.value)}</option>`).join('')}
      </select>
      <label>${S.escapeHtml(S.t('onbImplantDate'))}</label>
      <input type="date" id="onbImplantDate">`;
  } else if(step.key === 'security'){
    extraFields = `
      <p class="muted" style="margin-top:8px">
        ${S.escapeHtml(S.lang === 'fr'
          ? 'Vous allez créer un code PIN à 4 chiffres à l\'étape suivante.'
          : 'You will create a 4-digit PIN at the next step.')}
      </p>`;
  }

  const dots = S.ONB_STEPS.map((_, i) =>
    `<span class="${i === S.onbIndex ? 'active' : ''}"></span>`
  ).join('');

  container.innerHTML = `
    <div class="onb-illustr" aria-hidden="true" style="font-size:5rem">${step.icon}</div>
    <h2 style="text-align:center;color:var(--primary)">${S.escapeHtml(S.t(step.title))}</h2>
    <p class="muted" style="text-align:center;margin-top:8px">${S.escapeHtml(S.t(step.body))}</p>
    ${extraFields}
    <div class="progress-dots" aria-hidden="true">${dots}</div>
    <div class="row" style="justify-content:space-between;margin-top:22px;gap:8px">
      ${!isFirst
        ? `<button type="button" class="btn-ghost" id="onbBack">← ${S.escapeHtml(S.t('onbBack'))}</button>`
        : `<button type="button" class="btn-ghost" id="onbSkip">${S.escapeHtml(S.t('onbSkip'))}</button>`}
      <button type="button" class="btn-primary" id="onbNext">
        ${isLast ? S.escapeHtml(S.t('onbFinish')) : (isFirst ? S.escapeHtml(S.t('onbStart')) : S.escapeHtml(S.t('onbNext')))}
      </button>
    </div>`;

  const skipBtn = container.querySelector('#onbSkip');
  if(skipBtn) skipBtn.addEventListener('click', () => S.finishOnboarding(true));

  const backBtn = container.querySelector('#onbBack');
  if(backBtn) backBtn.addEventListener('click', () => {
    S.saveOnbStepData();
    S.onbIndex = Math.max(0, S.onbIndex - 1);
    S.renderOnboarding();
  });

  const nextBtn = container.querySelector('#onbNext');
  nextBtn.addEventListener('click', async () => {
    const ok = S.saveOnbStepData();
    if(!ok) return;
    if(isLast){
      await S.finishOnboarding();
    } else {
      S.onbIndex = Math.min(S.ONB_STEPS.length - 1, S.onbIndex + 1);
      S.renderOnboarding();
    }
  });
};

S.saveOnbStepData = function(){
  const step = S.ONB_STEPS[S.onbIndex];
  if(step.key === 'profile'){
    const name = (S.formValue('onbName') || '').trim();
    const birth = S.formValue('onbBirth') || null;
    S.state.profile = S.state.profile || { id: 1, onboarded: false };
    S.state.profile.name = name || null;
    S.state.profile.birthDate = birth;
  } else if(step.key === 'implant'){
    const type = S.formValue('onbImplantType');
    const date = S.formValue('onbImplantDate');
    if(type && date){
      S.state.pendingImplant = { type, insertionDate: date };
    } else {
      S.state.pendingImplant = null;
    }
  }
  return true;
};

S.finishOnboarding = async function(skipped){
  const profile = S.state.profile || { id: 1 };
  profile.onboarded = true;
  S.state.profile = profile;

  if(S.dbAvailable){
    await S.dbPut('profile', profile);

    if(!skipped && S.state.pendingImplant){
      const p = S.state.pendingImplant;
      const def = S.IMPLANT_TYPES.find(t => t.value === p.type) || { months: 36 };
      await S.dbAdd('implant', {
        type: p.type,
        insertionDate: p.insertionDate,
        durationMonths: def.months,
        expectedEndDate: S.calc.implantExpiration(p.insertionDate, def.months),
        arm: 'left',
        retire: false
      });
    }

    await S.dbPut('settings', S.state.settings);
  } else {
    S.persistFallback();
  }

  S.state.pendingImplant = null;

  S.showLockSetup('setup-first');
};

S.lastActivity = Date.now();
S.autoLockTimer = null;

S.resetAutoLockTimer = function(){
  S.lastActivity = Date.now();
  if(S.autoLockTimer) clearTimeout(S.autoLockTimer);
  const mins = (S.state.security && S.state.security.autoLockMinutes) || 0;
  if(mins <= 0) return;
  S.autoLockTimer = setTimeout(() => {
    if(S.state.unlocked) S.lockApp();
  }, mins * 60000);
};

S.lockApp = function(){
  S.state.unlocked = false;
  S.state.aesKey = null;
  S.showLockVerify();
};

S.bindAutoLock = function(){
  let throttle = null;
  const touch = () => {
    if(throttle) return;
    throttle = setTimeout(() => { throttle = null; }, 1000);
    if(S.state.unlocked) S.resetAutoLockTimer();
  };
  ['click', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
    document.addEventListener(evt, touch, { passive: true })
  );

  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState !== 'visible') return;
    if(!S.state.unlocked) return;
    const mins = (S.state.security && S.state.security.autoLockMinutes) || 0;
    if(mins <= 0) return;
    const elapsed = (Date.now() - S.lastActivity) / 60000;
    if(elapsed >= mins){
      S.lockApp();
    } else {
      S.resetAutoLockTimer();
    }
  });
};

S.showApp = async function(){
  ['#screen-splash', '#screen-lock', '#screen-onboarding'].forEach(sel => {
    const el = S.$(sel);
    if(el) el.classList.add('hidden');
  });

  const app = S.$('#app');
  if(app) app.classList.remove('hidden');

  S.state.unlocked = true;

  const hash = (window.location.hash || '').replace('#', '');
  const route = hash && S.VIEWS[hash] ? hash : 'dashboard';
  S.state.route = route;
  S.renderNavActive();
  S.renderView();

  S.resetAutoLockTimer();

  if(typeof S.checkReminders === 'function'){
    setTimeout(() => S.checkReminders(), 3000);
  }
};

/* ============================================================
   BLOC 7 : BOOT
   ============================================================ */

S.boot = async function(){
  S.buildNav();

  S.applyI18n();

  try{
    await S.openDB();
  }catch(e){
    S.dbAvailable = false;
    S.toast(S.t('errIndexedDB'));
  }

  try{
    await S.reloadAll();
  }catch(e){
    S.toast(S.t('errLoad'));
  }

  S.bindTopbar();
  S.bindHashRouter();
  S.bindOnlineStatus();
  S.bindAutoLock();

  const bio = S.$('#btnBiometric');
  if(bio) bio.addEventListener('click', S.tryBiometric);

  const profile = S.state.profile;
  const security = S.state.security;

  setTimeout(() => {
    const splash = S.$('#screen-splash');
    if(splash) splash.classList.add('hidden');

    if(!profile || !profile.onboarded){
      const onb = S.$('#screen-onboarding');
      if(onb) onb.classList.remove('hidden');
      S.onbIndex = 0;
      S.renderOnboarding();
    } else if(!security){
      S.showLockSetup('setup-first');
    } else {
      S.showLockVerify();
    }
  }, 1800);

  S.setupPWA();

  setInterval(() => {
    if(S.state.unlocked) S.checkReminders();
  }, 60000);
};

document.addEventListener('DOMContentLoaded', () => {
  S.boot().catch(e => {
    console.error('Boot error', e);
    const splash = S.$('#screen-splash');
    if(splash){
      splash.innerHTML = `
        <p style="color:var(--danger);text-align:center;padding:20px">
          ${S.escapeHtml(S.t('errGeneric'))}<br>
          <small>${S.escapeHtml(e.message || '')}</small>
        </p>`;
    }
  });
});