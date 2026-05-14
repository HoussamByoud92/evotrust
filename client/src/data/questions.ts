export type QuestionType = "single" | "multiple" | "scale" | "open";

export interface Question {
  id: string;
  number: number;
  theme: number;
  themeLabel: string;
  text: string;
  type: QuestionType;
  options?: string[];
  maxChoices?: number;
  required: boolean;
  image?: string;
}

export const THEMES = [
  { id: 1, label: "Profil & Situation Actuelle", questions: "Q1–Q7", image: "/manus-storage/img_profil_064a105f.jpg" },
  { id: 2, label: "L'Envie de Maroc", questions: "Q8–Q10", image: "/manus-storage/img_maroc_3589d5ab.jpg" },
  { id: 3, label: "Craintes & Freins", questions: "Q11–Q14", image: "/manus-storage/img_diaspora_ff2ca8a8.jpg" },
  { id: 4, label: "Attentes Concrètes", questions: "Q15–Q18", image: "/manus-storage/img_success_09e048db.jpg" },
  { id: 5, label: "Perception & Confiance", questions: "Q19–Q25", image: "/manus-storage/img_cover_92b3b2c3.jpg" },
];

export const QUESTIONS: Question[] = [
  // THÈME 1 — PROFIL & SITUATION ACTUELLE
  {
    id: "q1", number: 1, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "Votre profil",
    type: "single",
    options: ["Femme", "Homme"],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },
  {
    id: "q2", number: 2, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "Votre situation personnelle",
    type: "single",
    options: [
      "Célibataire, sans enfant",
      "Célibataire, avec enfant(s)",
      "Marié(e), sans enfant",
      "Marié(e), avec enfant(s)",
      "Autre situation",
    ],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },
  {
    id: "q3", number: 3, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "De quelle diaspora êtes-vous issue ?",
    type: "single",
    options: ["Marocaine", "Algérienne", "Tunisienne", "Autre (préciser)"],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },
  {
    id: "q4", number: 4, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "Depuis combien d'années vivez-vous en dehors du Maroc ?",
    type: "single",
    options: [
      "Moins de 2 ans",
      "2 à 5 ans",
      "5 à 10 ans",
      "10 à 20 ans",
      "Plus de 20 ans",
      "Je suis né(e) à l'étranger",
    ],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },
  {
    id: "q5", number: 5, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "Dans quel pays résidez-vous actuellement ?",
    type: "single",
    options: ["France", "Canada", "Émirats Arabes Unis", "Belgique", "Pays-Bas", "Espagne", "Autre"],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },
  {
    id: "q6", number: 6, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "Dans quel secteur exercez-vous ?",
    type: "single",
    options: [
      "Finance / Banque",
      "Tech / Digital",
      "Industrie / Ingénierie",
      "Santé / Pharma",
      "Conseil / Services",
      "FMCG / Retail",
      "Énergie / Infrastructure",
      "Autre",
    ],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },
  {
    id: "q7", number: 7, theme: 1, themeLabel: "Profil & Situation Actuelle",
    text: "Quel est votre niveau de poste actuel ?",
    type: "single",
    options: [
      "Étudiant / jeune diplômé",
      "Cadre junior (0–5 ans)",
      "Cadre confirmé (5–15 ans)",
      "Cadre supérieur",
      "Dirigeant / C-level",
      "Entrepreneur",
    ],
    required: true,
    image: "/manus-storage/img_profil_064a105f.jpg",
  },

  // THÈME 2 — L'ENVIE DE MAROC
  {
    id: "q8", number: 8, theme: 2, themeLabel: "L'Envie de Maroc",
    text: "Envisagez-vous de venir vivre et travailler au Maroc ?",
    type: "scale",
    options: ["1 Pas du tout", "2 Peut-être", "3 Oui, c'est mon projet"],
    required: true,
    image: "/manus-storage/img_maroc_3589d5ab.jpg",
  },
  {
    id: "q9", number: 9, theme: 2, themeLabel: "L'Envie de Maroc",
    text: "Dans quel délai envisagez-vous votre installation ou votre retour au Maroc ?",
    type: "single",
    options: [
      "Dans moins d'un an",
      "Dans 1 à 3 ans",
      "Dans 3 à 5 ans",
      "À plus de 5 ans",
      "Je n'envisage pas de retour au Maroc",
    ],
    required: true,
    image: "/manus-storage/img_maroc_3589d5ab.jpg",
  },
  {
    id: "q10", number: 10, theme: 2, themeLabel: "L'Envie de Maroc",
    text: "Qu'est-ce qui motive cette envie de Maroc ? (3 choix maximum)",
    type: "multiple",
    maxChoices: 3,
    options: [
      "La famille et les proches",
      "Me reconnecter à mes racines et à mon identité",
      "La qualité de vie",
      "Les opportunités professionnelles croissantes",
      "Le dynamisme économique du pays",
      "L'envie d'entreprendre au Maroc",
      "Le besoin de contribuer au développement du Maroc",
      "Les valeurs culturelles et le cadre de vie marocain",
      "Le contexte politique et social de mon pays d'accueil",
      "Autre motivation",
    ],
    required: false,
    image: "/manus-storage/img_maroc_3589d5ab.jpg",
  },

  // THÈME 3 — CRAINTES & FREINS
  {
    id: "q11", number: 11, theme: 3, themeLabel: "Craintes & Freins",
    text: "Quels sont les principaux obstacles que vous identifiez pour concrétiser votre projet de retour au Maroc ? (3 choix maximum)",
    type: "multiple",
    maxChoices: 3,
    options: [
      "La rémunération",
      "Le manque d'opportunités dans mon secteur ou à mon niveau",
      "Le regard des recruteurs sur les profils internationaux",
      "La méconnaissance du monde de l'entreprise marocain",
      "La perte des droits et avantages acquis dans mon pays d'accueil",
      "La scolarité de mes enfants",
      "La situation professionnelle de mon/ma conjoint(e)",
      "Le système de santé (médecins, hôpitaux, etc.)",
      "La bureaucratie et les démarches administratives",
      "Le système de protection sociale",
      "L'absence d'un dispositif public dédié aux profils de la diaspora",
      "L'adaptation sociale et culturelle",
      "Le manque de réseau professionnel actif au Maroc",
      "Autre obstacle",
    ],
    required: false,
    image: "/manus-storage/img_diaspora_ff2ca8a8.jpg",
  },
  {
    id: "q12", number: 12, theme: 3, themeLabel: "Craintes & Freins",
    text: "Comment jugez-vous votre connaissance de l'évolution du niveau socio-économique du Maroc ?",
    type: "single",
    options: [
      "Très bonne (je suis les actualités économiques et sociales du Maroc de près)",
      "Bonne (j'ai une vision globale, je m'informe régulièrement)",
      "Partielle (je connais certains secteurs ou sujets)",
      "Limitée (je m'appuie surtout sur mes séjours au Maroc ou sur ce qu'en disent mes proches)",
      "Très limitée (je manque de recul sur la réalité socio-économique actuelle du Maroc)",
    ],
    required: true,
    image: "/manus-storage/img_diaspora_ff2ca8a8.jpg",
  },
  {
    id: "q13", number: 13, theme: 3, themeLabel: "Craintes & Freins",
    text: "Pensez-vous que votre profil et vos compétences sont adaptés au contexte de l'entreprise marocaine ?",
    type: "single",
    options: ["Oui", "Partiellement", "Pas du tout", "Je ne sais pas"],
    required: true,
    image: "/manus-storage/img_diaspora_ff2ca8a8.jpg",
  },
  {
    id: "q14", number: 14, theme: 3, themeLabel: "Craintes & Freins",
    text: "Quelles ont été vos principales difficultés pour trouver un poste au Maroc depuis l'étranger ? (3 choix maximum)",
    type: "multiple",
    maxChoices: 3,
    options: [
      "Pas de réponse aux candidatures",
      "Offres inadaptées à mon profil",
      "Package salarial proposé insuffisant",
      "Manque d'interlocuteur de confiance",
      "Difficulté à évaluer les entreprises à distance",
      "Opacité du marché de l'emploi",
      "Je n'ai pas encore cherché activement",
    ],
    required: false,
    image: "/manus-storage/img_diaspora_ff2ca8a8.jpg",
  },

  // THÈME 4 — ATTENTES CONCRÈTES
  {
    id: "q15", number: 15, theme: 4, themeLabel: "Attentes Concrètes",
    text: "Quelle équation de rémunération globale vous semblerait juste pour un retour au Maroc ?",
    type: "single",
    options: [
      "Un package équivalent à ma rémunération actuelle",
      "Un package légèrement inférieur, compensé par la qualité de vie",
      "Un package sensiblement inférieur, si le projet en vaut la peine",
      "L'aspect financier n'est pas le critère principal pour moi",
    ],
    required: true,
    image: "/manus-storage/img_success_09e048db.jpg",
  },
  {
    id: "q16", number: 16, theme: 4, themeLabel: "Attentes Concrètes",
    text: "Quels sont les avantages sociaux qui motiveraient votre mobilité vers le Maroc ? (3 choix maximum)",
    type: "multiple",
    maxChoices: 3,
    options: [
      "Assurance santé internationale",
      "Prise en charge de la scolarité des enfants",
      "Aide à l'installation et au déménagement",
      "Télétravail partiel et flexibilité",
      "Véhicule de fonction",
      "Formation et développement professionnel",
      "Intéressement, participation et actionnariat salarié",
      "Plan d'épargne retraite complémentaire",
    ],
    required: false,
    image: "/manus-storage/img_success_09e048db.jpg",
  },
  {
    id: "q17", number: 17, theme: 4, themeLabel: "Attentes Concrètes",
    text: "De quel type d'accompagnement auriez-vous besoin pour faciliter votre installation au Maroc ? (3 choix maximum)",
    type: "multiple",
    maxChoices: 3,
    options: [
      "Accès à des offres d'emploi adaptées à mon profil",
      "Accès aux entreprises qui recrutent des profils issus de la diaspora",
      "Mise en relation avec des recruteurs et décideurs fiables",
      "Coaching de carrière pour valoriser et repositionner mon profil",
      "Information claire sur la fiscalité et les aspects juridiques du retour",
      "Accompagnement à la relocalisation (logement, scolarité, etc.)",
      "Accès à un réseau de Marocains du Monde déjà installés au Maroc",
      "Autre besoin d'accompagnement",
    ],
    required: false,
    image: "/manus-storage/img_success_09e048db.jpg",
  },
  {
    id: "q18", number: 18, theme: 4, themeLabel: "Attentes Concrètes",
    text: "Dans quelle ville du Maroc seriez-vous prêt(e) à travailler en priorité ?",
    type: "single",
    options: ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Autre", "Indifférent"],
    required: true,
    image: "/manus-storage/img_success_09e048db.jpg",
  },

  // THÈME 5 — PERCEPTION & CONFIANCE
  {
    id: "q19", number: 19, theme: 5, themeLabel: "Perception & Confiance",
    text: "Comment évaluez-vous votre niveau de confiance dans l'avenir socio-économique du Maroc ?",
    type: "single",
    options: ["Très peu confiant(e)", "Neutre", "Très confiant(e)"],
    required: true,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
  {
    id: "q20", number: 20, theme: 5, themeLabel: "Perception & Confiance",
    text: "Avez-vous déjà fait appel à un cabinet de recrutement pour explorer des opportunités au Maroc ?",
    type: "single",
    options: [
      "Oui, avec une bonne expérience",
      "Oui, avec une mauvaise expérience",
      "Non, je ne savais pas à qui m'adresser",
      "Non, je gère seul(e) via Internet",
      "Non, je n'ai pas encore cherché",
    ],
    required: true,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
  {
    id: "q21", number: 21, theme: 5, themeLabel: "Perception & Confiance",
    text: "Avez-vous le sentiment que le marché marocain valorise suffisamment les profils de la diaspora ?",
    type: "single",
    options: ["Oui", "Pas vraiment", "Non"],
    required: true,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
  {
    id: "q22", number: 22, theme: 5, themeLabel: "Perception & Confiance",
    text: "Connaissez-vous les niveaux de rémunération pratiqués au Maroc pour des profils comme le vôtre ?",
    type: "single",
    options: ["Oui", "Pas vraiment", "Non"],
    required: true,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
  {
    id: "q23", number: 23, theme: 5, themeLabel: "Perception & Confiance",
    text: "Seriez-vous intéressé(e) par un événement networking dans votre pays d'accueil dédié aux cadres marocains de la diaspora ?",
    type: "single",
    options: ["Oui", "Peut-être", "Non"],
    required: true,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
  {
    id: "q24", number: 24, theme: 5, themeLabel: "Perception & Confiance",
    text: "De quoi avez-vous besoin aujourd'hui pour envisager concrètement une mobilité vers le Maroc ? (3 choix maximum)",
    type: "multiple",
    maxChoices: 3,
    options: [
      "Une offre d'emploi concrète, à la hauteur de mon niveau d'expérience",
      "Une rémunération comparable (ou acceptable) par rapport à mon pays de résidence",
      "La reconnaissance réelle de mon expérience internationale par les employeurs marocains",
      "Des perspectives d'évolution claires à moyen terme",
      "Un accompagnement par un cabinet qui comprend la réalité des profils de la diaspora",
      "Une meilleure connaissance du marché marocain (secteurs, salaires, codes professionnels, culturels, etc.)",
      "Un réseau professionnel actif et fiable au Maroc",
      "Une solution satisfaisante pour la scolarité de mes enfants",
      "Un accès à une couverture santé de qualité comparable à mon pays de résidence",
      "Une stabilité du cadre de vie (logement, sécurité, santé)",
    ],
    required: false,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
  {
    id: "q25", number: 25, theme: 5, themeLabel: "Perception & Confiance",
    text: "Quelle est la vraie raison (celle qu'on n'ose pas toujours dire) qui vous retient de franchir le pas vers le Maroc ?",
    type: "open",
    required: false,
    image: "/manus-storage/img_cover_92b3b2c3.jpg",
  },
];



