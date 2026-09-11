/* ============================================================================
 6th ALWAR CUP TAEKWONDO CHAMPIONSHIP — Tournament Configuration
 Default AGE + WEIGHT category rules. Admin can override these at runtime;
 overrides are stored in Firestore at tournament_settings/categories
 and merged over these defaults by TCore.loadCategoryRules().

 Pure config file — safe to include on any page. Does NOT touch existing
 PE Exam Hub / MCQ / student code. Age/Weight defaults match the prior
 Alwar Cup module exactly so existing category logic stays identical.
 ============================================================================ */
(function (root) {
  'use strict';

  var DEFAULT_AGE_RULES = [
    { key: 'peewee', name: 'Pee Wee', min: 0, max: 8 },
    { key: 'subjunior', name: 'Sub Junior', min: 9, max: 11 },
    { key: 'cadet', name: 'Cadet', min: 12, max: 14 },
    { key: 'junior', name: 'Junior', min: 15, max: 17 },
    { key: 'senior', name: 'Senior', min: 18, max: 99 }
  ];

  /* Weight rules: key = "<ageKey>_<gender>", value = ordered upper bounds.
     A trailing "+N" entry is the open (heavyweight) class. */
  var DEFAULT_WEIGHT_RULES = {
    peewee_male: ['-18', '-21', '-23', '-25', '-27', '-29', '-32', '-35', '-38', '+38'],
    peewee_female: ['-16', '-18', '-20', '-22', '-24', '-26', '-29', '-32', '-35', '+35'],
    subjunior_male: ['-18', '-21', '-23', '-25', '-27', '-29', '-32', '-35', '-38', '-41', '-44', '-50', '+50'],
    subjunior_female: ['-16', '-18', '-20', '-22', '-24', '-26', '-29', '-32', '-35', '-38', '-41', '-47', '+47'],
    cadet_male: ['-33', '-37', '-41', '-45', '-49', '-53', '-57', '-61', '-65', '+65'],
    cadet_female: ['-29', '-33', '-37', '-41', '-44', '-47', '-51', '-55', '-59', '+59'],
    junior_male: ['-45', '-48', '-51', '-55', '-59', '-63', '-68', '-73', '-78', '+78'],
    junior_female: ['-42', '-44', '-46', '-49', '-52', '-55', '-59', '-63', '-68', '+68'],
    senior_male: ['-54', '-58', '-63', '-68', '-74', '-80', '-87', '+87'],
    senior_female: ['-46', '-49', '-53', '-57', '-62', '-67', '-73', '+73']
  };

  root.TOURNAMENT_DEFAULTS = {
    moduleName: '6th ALWAR CUP TAEKWONDO CHAMPIONSHIP',
    shortName: '6th Alwar Cup',
    edition: '6th',
    sport: 'Taekwondo',
    brandLine: '6th ALWAR CUP TAEKWONDO CHAMPIONSHIP',
    eventFullName: '6TH ALWAR CUP TAEKWONDO CHAMPIONSHIP 2026',
    eventYear: '2026',
    eventLocation: 'ALWAR, RAJASTHAN',
    website: 'physicaleducationcareer.in',
    logoImage: 'ultimate-logo.svg',
    ageRules: DEFAULT_AGE_RULES,
    weightRules: DEFAULT_WEIGHT_RULES,
    collections: {
      tournaments: 'tournaments',
      coaches: 'coaches',
      players: 'players',
      categories: 'categories',
      draws: 'draws',
      matches: 't_matches',
      results: 'results',
      referees: 'referees',
      medalTable: 'medalTable',
      /* Exam certificates stay in 'certificates'. Tournament certs use t_certificates. */
      certificates: 't_certificates',
      settings: 'tournament_settings'
    },
    medals: ['gold', 'silver', 'bronze1', 'bronze2'],
    statuses: ['upcoming', 'live', 'completed'],
    coachStatuses: ['pending', 'approved', 'rejected'],
    playerStatuses: ['pending', 'approved', 'rejected']
  };
})(window);
