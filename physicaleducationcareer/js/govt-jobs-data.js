/* ============================================================================
   Government Jobs dataset — Physical Education Career
   ----------------------------------------------------------------------------
   Single source for govt-jobs-list.html and govt-job-detail.html?id=...
   - Factual fields (vacancies, dates, fee, age, qualification, selection) were
     extracted and verified from SarkariResult.com.cm detail pages, then
     cross-checked against the department's OWN official website for links.
   - Official links point ONLY to the department's own website / ORA / IBPS /
     RRB apply portal / digialm / UMANG. No third-party aggregator link is used.
   - If a field could not be verified it is left null or the string
     "Verify from official notification". DO NOT invent values.
   - JobPosting structured data is emitted by govt-job-detail.html ONLY when
     entry.verified === true.
   ============================================================================ */
(function (root) {
  'use strict';

  var STATUS_LABELS = {
  "sample": {
    "label": "Sample",
    "cls": "status-info"
  },
  "active": {
    "label": "Active",
    "cls": "status-active"
  },
  "lastdate": {
    "label": "Last Date Today",
    "cls": "status-active"
  },
  "upcoming": {
    "label": "Upcoming",
    "cls": "status-upcoming"
  },
  "closed": {
    "label": "Closed",
    "cls": "status-closed"
  },
  "result": {
    "label": "Result Out",
    "cls": "status-upcoming"
  }
};

  var CATEGORIES = [
  {
    "id": "central",
    "label": "Central Government"
  },
  {
    "id": "rajasthan",
    "label": "Rajasthan Government"
  },
  {
    "id": "teacher",
    "label": "Teacher Jobs"
  },
  {
    "id": "sports",
    "label": "Sports Jobs"
  },
  {
    "id": "police",
    "label": "Police / Defence"
  },
  {
    "id": "railway",
    "label": "Railway"
  },
  {
    "id": "ssc",
    "label": "SSC"
  },
  {
    "id": "banking",
    "label": "Banking"
  },
  {
    "id": "state",
    "label": "State Government"
  },
  {
    "id": "apprenticeship",
    "label": "Apprenticeship"
  }
];

  var NA = 'Verify from official notification';

  var JOBS = [
  {
    "id": "rpsc-school-lecturer-special-education-2026",
    "title": "RPSC School Lecturer (Special Education) 2026",
    "org": "Rajasthan Public Service Commission (RPSC)",
    "postName": "School Lecturer (Special Education)",
    "categories": [
      "teacher",
      "rajasthan",
      "state"
    ],
    "status": "closed",
    "verified": true,
    "vacancies": 121,
    "qualification": "Post Graduate degree in English, Hindi, History, Political Science, Sociology, or Music with B.Ed (Special Education) / B.Ed + 2-year Diploma in Special Education (RCI recognized); valid RCI CRR registration; working knowledge of Hindi (Devanagari) and Rajasthani culture",
    "eligibility": "Verify from official notification",
    "ageLimit": "Min 21 Years, Max 40 Years (as on 01/01/2027)",
    "ageRelaxation": "As per RPSC rules",
    "fee": "General / Other State: ₹ 600/- ; SC / ST / OBC / BC / PH: ₹ 400/- ; Correction Charge: ₹ 500/-",
    "importantDates": {
      "Application Begin": "01/06/2026",
      "Last Date": "30/06/2026",
      "Correction Date": "10/07/2026",
      "Exam Date": "08/12/2026",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Written Exam, Document Verification, Medical Examination",
    "salary": null,
    "applyLink": "https://sso.rajasthan.gov.in/signin?ru=RECRUITMENT",
    "notificationLink": "https://rpsc.rajasthan.gov.in/Static/RecruitmentAdvertisements/20787BD8A34D461A80CD78EE212A5723.pdf",
    "resultLink": "https://rpsc.rajasthan.gov.in/results",
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Register/update OTR on the Rajasthan State Recruitment Portal via SSO",
      "Submit the online application for the post on the RPSC Recruitment Portal during the application window"
    ],
    "description": "RPSC School Lecturer (Special Education) — Advt 01/2026-27 — for 121 posts. Application 01/06/2026 to 30/06/2026; exam 08/12/2026.",
    "lastUpdated": "August 2026",
    "source": "https://rpsc.rajasthan.gov.in/advertisements"
  },
  {
    "id": "rssb-upper-primary-school-teacher-2025",
    "title": "RSSB Upper Primary School Teacher (Level-2) 2025",
    "org": "Rajasthan Staff Selection Board (RSSB)",
    "postName": "Upper Primary School Teacher (Level-2)",
    "categories": [
      "teacher",
      "rajasthan",
      "state"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 2123,
    "qualification": "Bachelor Degree in any stream with B.Ed / B.El.Ed & REET qualified",
    "eligibility": "Verify from official notification",
    "ageLimit": "Min 18 Years, Max 40 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RSSB rules",
    "fee": "General/EWS/OBC (Creamy): ₹ 600/- ; EWS/OBC (Non-Creamy): ₹ 400/- ; SC/ST/PH: ₹ 400/- ; Correction: ₹ 300/-",
    "importantDates": {
      "Application Begin": "07/11/2025",
      "Last Date": "06/12/2025",
      "Exam Date": "17–20/01/2026",
      "Admit Card": "12/01/2026",
      "Answer Key": "27/02/2026",
      "Final Answer Key": "03/06/2026",
      "Result": "27/05/2026"
    },
    "selection": "Written Exam, Document Verification, Final Merit List",
    "salary": null,
    "applyLink": null,
    "notificationLink": "https://rssb.rajasthan.gov.in/advertisements",
    "resultLink": "https://rssb.rajasthan.gov.in/results",
    "admitLink": "https://rssb.rajasthan.gov.in/admitcards",
    "examPattern": null,
    "documents": [],
    "howToApply": [],
    "description": "RSSB Upper Primary School Teacher (Level-2) 2025 — 2123 posts (Non-TSP 1919, TSP 204). Exam 17–20/01/2026; result 27/05/2026.",
    "lastUpdated": "August 2026",
    "source": "https://rssb.rajasthan.gov.in/news"
  },
  {
    "id": "rpsc-sub-inspector-comb-comp-exam-2025",
    "title": "RPSC Sub Inspector Combined Competitive Exam 2025",
    "org": "Rajasthan Public Service Commission (RPSC)",
    "postName": "Sub Inspector (including Platoon Commander)",
    "categories": [
      "police",
      "rajasthan",
      "state"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 1015,
    "qualification": "Graduation in any stream; working knowledge of Hindi (Devanagari) and Rajasthani culture",
    "eligibility": "Verify from official notification",
    "ageLimit": "Min 20 Years, Max 25 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RPSC rules",
    "fee": "General / Other State: ₹ 600/- ; SC / ST / OBC / BC: ₹ 400/- ; Correction: ₹ 500/-",
    "importantDates": {
      "Application Begin": "10/08/2025",
      "Last Date": "08/09/2025",
      "Correction Date": "31/01–06/02/2026",
      "Exam Date": "05–06/04/2026",
      "Admit Card": "02/04/2026",
      "PET Date": "03–13/08/2026",
      "Result": "19/06/2026 (Score Card 23/06/2026)"
    },
    "selection": "Written Exam, PET & PST, Interview, Document Verification, Medical Examination",
    "salary": null,
    "applyLink": "https://sso.rajasthan.gov.in/signin?ru=RECRUITMENT",
    "notificationLink": "https://rpsc.rajasthan.gov.in/Static/RecruitmentAdvertisements/B87284F000614D55999928D873BD8B3E.pdf",
    "resultLink": "https://rpsc.rajasthan.gov.in/results",
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Register/update OTR on the Rajasthan State Recruitment Portal via SSO",
      "Submit the online application for the post on the RPSC Recruitment Portal during the application window"
    ],
    "description": "RPSC Sub Inspector (including Platoon Commander) Combined Competitive Exam 2025 — 1015 posts (SI 951, Platoon Commander 64). Exam 05–06/04/2026; result 19/06/2026.",
    "lastUpdated": "August 2026",
    "source": "https://rpsc.rajasthan.gov.in/advertisements"
  },
  {
    "id": "rssb-platoon-commander-direct-recruitment-2025",
    "title": "RSSB Platoon Commander Direct Recruitment 2025",
    "org": "Rajasthan Staff Selection Board (RSSB)",
    "postName": "Platoon Commander",
    "categories": [
      "police",
      "rajasthan",
      "state"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 84,
    "qualification": "Graduation in any stream; working knowledge of Hindi (Devanagari) and Rajasthani culture",
    "eligibility": "Verify from official notification",
    "ageLimit": "Min 20 Years, Max 25 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RSSB rules",
    "fee": "General/EWS/OBC (Creamy): ₹ 600/- ; EWS/OBC (Non-Creamy): ₹ 400/- ; SC/ST/PH: ₹ 400/- ; Correction: ₹ 300/-",
    "importantDates": {
      "Application Begin": "23/07/2025",
      "Last Date": "21/08/2025",
      "Exam Date": "22/11/2025",
      "Admit Card": "19/11/2025",
      "Final Answer Key": "22/01/2026",
      "Result": "17/07/2026"
    },
    "selection": "Written Exam, PET, PST, Interview, Document Verification, Medical Examination",
    "salary": null,
    "applyLink": null,
    "notificationLink": "https://rssb.rajasthan.gov.in/advertisements",
    "resultLink": "https://rssb.rajasthan.gov.in/results",
    "admitLink": "https://rssb.rajasthan.gov.in/admitcards",
    "examPattern": null,
    "documents": [],
    "howToApply": [],
    "description": "RSSB Platoon Commander (Direct Recruitment) — Advt 05/2025 — 84 posts (Non-TSP 82, TSP 02). Exam 22/11/2025; result 17/07/2026.",
    "lastUpdated": "August 2026",
    "source": "https://rssb.rajasthan.gov.in/news"
  },
  {
    "id": "rpsc-sr-teacher-sec-edu-comp-exam-2025",
    "title": "RPSC Senior Teacher (Secondary Education) Comp. Exam 2025",
    "org": "Rajasthan Public Service Commission (RPSC)",
    "postName": "Senior Teacher (Grade II, Secondary Education)",
    "categories": [
      "teacher",
      "rajasthan",
      "state"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 2129,
    "qualification": "Graduate or equivalent degree with at least two relevant optional subjects and a degree/diploma in education; proficiency in Hindi (Devanagari) and knowledge of Rajasthani culture",
    "eligibility": "Verify from official notification",
    "ageLimit": "Min 18 Years, Max 40 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RPSC rules",
    "fee": "General/OBC (Creamy): ₹ 600/- ; OBC/EWS (Non-Creamy): ₹ 400/- ; SC/ST/PWD: ₹ 400/-",
    "importantDates": {
      "Application Begin": "26/12/2024",
      "Last Date": "24/01/2025",
      "Exam Date": "07–12/09/2025",
      "Admit Card": "04/09/2025",
      "Result": "29/01/2026"
    },
    "selection": "Written Exam, Final Merit List",
    "salary": "₹ 9300 – 34800/- (Grade Pay ₹ 4200/-)",
    "applyLink": "https://sso.rajasthan.gov.in/signin?ru=RECRUITMENT",
    "notificationLink": "https://rpsc.rajasthan.gov.in/Static/RecruitmentAdvertisements/ED4F69C3BFA14F9BBACDC0077554C90D.pdf",
    "resultLink": "https://rpsc.rajasthan.gov.in/results",
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Register/update OTR on the Rajasthan State Recruitment Portal via SSO",
      "Submit the online application for the post on the RPSC Recruitment Portal during the application window"
    ],
    "description": "RPSC Senior Teacher Grade-II (Sec. Edu.) Comp. Exam 2025 — Advt 07/2025-26 — 2129 posts. Exam 07–12/09/2025; result 29/01/2026.",
    "lastUpdated": "August 2026",
    "source": "https://rpsc.rajasthan.gov.in/advertisements"
  },
  {
    "id": "ctet-sep-2026",
    "title": "CTET September 2026 (22nd Edition)",
    "org": "Central Board of Secondary Education (CBSE) – CTET",
    "postName": "Central Teacher Eligibility Test (CTET) September 2026",
    "categories": [
      "central",
      "teacher"
    ],
    "status": "active",
    "verified": true,
    "vacancies": "Not Applicable",
    "qualification": "Level-1 (Class 1-5): Senior Secondary 50% + D.El.Ed./B.El.Ed./B.Ed.; Level-2 (Class 6-8): Graduation + D.El.Ed./B.Ed. (per NCTE)",
    "eligibility": "Verify from official notification",
    "ageLimit": "No Age Limit",
    "ageRelaxation": "As per CBSE rules",
    "fee": "Paper-I: General/OBC ₹ 1000/-, SC/ST/PWD ₹ 500/-; Both Papers: General/OBC ₹ 1200/-, SC/ST/PWD ₹ 600/-",
    "importantDates": {
      "Application Begin": "11/05/2026 (Re-Open: 25/08/2026)",
      "Last Date": "10/06/2026 (Re-Open Last Date: 01/09/2026)",
      "Exam Date": "06/09/2026 (Postponed)",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Written Exam",
    "salary": null,
    "applyLink": "https://ctet.nic.in/",
    "notificationLink": "https://ctet.nic.in/",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the official CTET portal https://ctet.nic.in/",
      "Click \"Apply/Login: CTET SEP 2026\" and submit the online application",
      "The last date has been extended to 01/09/2026; a correction window has also been notified"
    ],
    "description": "CBSE conducted CTET September 2026 (22nd edition). Online application re-opened 25/08/2026 to 01/09/2026; exam 06/09/2026 (postponed). CTET is an eligibility test with no vacancies.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/ctet-september-2026/"
  },
  {
    "id": "kvs-recruitment-advt-01-2025",
    "title": "KVS Teaching Recruitment Advertisement No. 01/2025 – Tier II Results",
    "org": "Kendriya Vidyalaya Sangathan (KVS)",
    "postName": "PGT / TGT / Vice Principal & Other Posts (Advt 01/2025)",
    "categories": [
      "central",
      "teacher"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 15762,
    "qualification": "10th/12th/Graduation/Post Graduation as per post (post-wise)",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 18 Years; Maximum 27–50 Years (post-wise)",
    "ageRelaxation": "As per KVS/NVS rules",
    "fee": "Asst Commissioner/Principal/VP: Gen/OBC/EWS ₹ 2800/-, SC/ST/PH/ESM ₹ 500/-; PGT/TGT/PRT/AE: Gen/OBC/EWS ₹ 2000/-, SC/ST/PH/ESM ₹ 500/-; SSA/Steno/JSA/Lab Attendant/MTS: Gen/OBC/EWS ₹ 1700/-, SC/ST/PH/ESM ₹ 500/-",
    "importantDates": {
      "Application Begin": "14/11/2025",
      "Last Date": "11/12/2025",
      "Tier-I Exam": "10–11/01/2026",
      "Tier-I Admit Card": "08/01/2026",
      "Tier-I Result": "28/02/2026",
      "Tier-II Exam": "27–31/03/2026",
      "Tier-II Admit Card": "23/03/2026",
      "Tier-II Result": "17/08/2026 (Available)"
    },
    "selection": "Written Exam, Skill Test (if applicable), Document Verification, Medical Examination",
    "salary": null,
    "applyLink": null,
    "notificationLink": "https://kvsangathan.nic.in/recruitment/",
    "resultLink": "https://kvsangathan.nic.in/",
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [],
    "description": "KVS (with NVS) invited applications for Teaching & Non-Teaching posts (PGT, TGT, PRT, Principal, VP, AC, Librarian, Non-Teaching) — 15,762 posts. Tier-II result declared 17/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/kvs-teaching-2025/"
  },
  {
    "id": "sbi-junior-associates-2026",
    "title": "SBI Junior Associates (Customer Support & Sales) 2026-27",
    "org": "State Bank of India",
    "postName": "Junior Associate (Customer Support & Sales)",
    "categories": [
      "banking"
    ],
    "status": "active",
    "verified": true,
    "vacancies": 9124,
    "qualification": "Bachelor Degree (passed / appearing) in any discipline from a recognized university",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 20 Years, Maximum 28 Years (as on 01/04/2026)",
    "ageRelaxation": "As per SBI rules",
    "fee": "General / OBC / EWS: ₹ 750/- ; SC / ST / PH: ₹ 00/-",
    "importantDates": {
      "Application Begin": "11/08/2026",
      "Last Date": "31/08/2026",
      "Fee Payment Last Date": "31/08/2026",
      "Exam Date": "September 2026",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Preliminary Exam, Main Exam, Local Language Test, Medical Examination, Document Verification",
    "salary": null,
    "applyLink": "https://ibpsreg.ibps.in/sbijajul26/",
    "notificationLink": "https://sbi.bank.in/webfiles/uploads/files_2627/08/JA_2026_Detailed_Advt_Eng.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the official SBI Careers \"Current Openings\" page (bank.sbi/web/careers/current-openings)",
      "Open \"RECRUITMENT OF JUNIOR ASSOCIATES (CUSTOMER SUPPORT & SALES)\" — Advt. CRPD/CR/2026-27/17",
      "Apply online via the IBPS portal (ibpsreg.ibps.in/sbijajul26) between 11 and 31 August 2026"
    ],
    "description": "SBI invited online applications for Junior Associates (Customer Support & Sales) — Advt No. CRPD/CR/SPLDrive/2026-27/17 — for 9124 posts (including backlog 1444). Apply online from 11/08/2026 to 31/08/2026; exam September 2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/sbi-junior-associates-clerk-2026/"
  },
  {
    "id": "sbi-sco-regular-2026-27-12",
    "title": "SBI Specialist Cadre Officer (Regular) 2026-27",
    "org": "State Bank of India",
    "postName": "Specialist Cadre Officer (Regular Basis)",
    "categories": [
      "banking"
    ],
    "status": "closed",
    "verified": true,
    "vacancies": null,
    "qualification": "Verify from official notification",
    "eligibility": "Verify from official notification",
    "ageLimit": null,
    "ageRelaxation": null,
    "fee": null,
    "importantDates": {
      "Application Start": "07/08/2026",
      "Last Date": "27/08/2026"
    },
    "selection": "Verify from official notification",
    "salary": null,
    "applyLink": "https://recruitment.sbi.bank.in/crpd-sco-2026-27-12/apply",
    "notificationLink": "https://bank.sbi/documents/77530/57941334/FINAL+ADVT+CRPD_SCO_2026-27_12.pdf/1c6d4f7f-ca97-cc9c-6e00-5b6744a1283d?t=1786026186547",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the official SBI Careers \"Current Openings\" page",
      "Open \"RECRUITMENT OF SPECIALIST CADRE OFFICER ON REGULAR BASIS\" — Advt. CRPD/SCO/2026-27/12",
      "Apply online via the SBI recruitment portal before 27 August 2026"
    ],
    "description": "SBI is recruiting Specialist Cadre Officers on a regular basis across specialist/domain roles for the 2026-27 cycle. The online application window closed on 27 August 2026.",
    "lastUpdated": "August 2026",
    "source": "https://bank.sbi/web/careers/current-openings"
  },
  {
    "id": "sbi-apprentice-2026-27-07",
    "title": "SBI Engagement of Apprentices 2026-27",
    "org": "State Bank of India",
    "postName": "Apprentice",
    "categories": [
      "banking",
      "apprenticeship"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 7150,
    "qualification": "Bachelor's Degree in any stream from a recognized university",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 20 Years, Maximum 28 Years (as on 01/04/2026)",
    "ageRelaxation": "As per SBI rules",
    "fee": "General / OBC / EWS: ₹ 300/- ; SC / ST / PwBD: ₹ 00/-",
    "importantDates": {
      "Application Begin": "19/05/2026",
      "Last Date": "15/06/2026 (Extended)",
      "Admit Card": "30/06/2026",
      "Exam Date": "11/07/2026",
      "Result": "25/08/2026 (Available)"
    },
    "selection": "Written Test, Language Test, Medical Examination",
    "salary": null,
    "applyLink": "https://ibpsreg.ibps.in/sbiaapr26/",
    "notificationLink": "https://bank.sbi/documents/77530/57941334/19052026_ENGAGEMENT+OF+APPRENTICE+2026+ADVERTISEMENT+CRPD_APPR_2026-27_07.pdf/fa9015ff-2268-a829-f9e8-8c1b5d55e126?t=1779173730791",
    "resultLink": "https://sbi.bank.in/webfiles/uploads/files_2627/Apprentices-2026-RESULT-15-FORMAT.pdf",
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the official SBI Careers \"Current Openings\" page",
      "Open \"ENGAGEMENT OF APPRENTICES UNDER THE APPRENTICES ACT, 1961\" — Advt. CRPD/APPR/2026-27/07",
      "The list of provisionally selected candidates has been published"
    ],
    "description": "SBI engaged Apprentices (01 year training) — Advt No. CRPD/APPR/2026-27/07 — for 7150 posts. Online application was 19/05/2026 to 15/06/2026 (extended); exam 11/07/2026; result declared 25/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/sbi-apprentice-2026/"
  },
  {
    "id": "rrb-je-dms-cen-04-2026",
    "title": "RRB JE 2026 (CEN 04/2026) – Junior Engineer & DMS",
    "org": "Railway Recruitment Board (Ministry of Railways, Govt. of India)",
    "postName": "Junior Engineer (JE) and Depot Material Superintendent (DMS)",
    "categories": [
      "central",
      "railway"
    ],
    "status": "active",
    "verified": true,
    "vacancies": 4029,
    "qualification": "Engineering Diploma / Degree (for JE (IT) and Chemical & Metallurgical Assistant)",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 18 Years, Maximum 33 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RRB rules",
    "fee": "General / OBC / EWS: ₹ 500/- ; SC / ST / EBC / Female: ₹ 250/- (Refund after appearing: Gen/OBC ₹ 400/-, others ₹ 250/-)",
    "importantDates": {
      "Application Begin": "14/08/2026",
      "Last Date": "13/09/2026",
      "Fee Payment Last Date": "15/09/2026",
      "Correction Date": "16–25/09/2026",
      "Exam Date": "Notify Later",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "CBT 1, CBT 2, Document Verification, Medical Examination",
    "salary": null,
    "applyLink": "https://www.rrbapply.gov.in/#/auth/landing",
    "notificationLink": "https://www.rrbapply.gov.in/",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the official RRB application portal https://www.rrbapply.gov.in/",
      "Select your RRB and register with a valid email/mobile",
      "Fill CEN 04/2026 (JE/DMS) application, upload documents and pay the fee"
    ],
    "description": "Railway Recruitment Boards invited applications for Junior Engineer (JE) & Depot Material Superintendent (DMS) under CEN 04/2026 for 4029 posts. Apply online 14/08/2026 to 13/09/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/rrb-je-2026/"
  },
  {
    "id": "rrb-level-1-group-d-cen-09-2025",
    "title": "RRB Level-1 / Group D (CEN 09/2025)",
    "org": "Railway Recruitment Board (Ministry of Railways, Govt. of India)",
    "postName": "Various Level-1 posts (Group D)",
    "categories": [
      "central",
      "railway"
    ],
    "status": "active",
    "verified": true,
    "vacancies": 22195,
    "qualification": "Class 10 (High School) from a recognized board OR National Apprenticeship Certificate (NAC) issued by NCVT",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 18 Years, Maximum 33 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RRB rules",
    "fee": "General / OBC: ₹ 500/- ; SC / ST / EBC / Female / Transgender: ₹ 250/- (Refund after appearing: Gen/OBC ₹ 400/-, others ₹ 250/-)",
    "importantDates": {
      "Application Begin": "31/01/2026",
      "Last Date": "09/03/2026 (Extended)",
      "Fee Payment Last Date": "11/03/2026",
      "Correction Date": "12–21/03/2026",
      "Exam Date (CBT-I)": "03–21/08/2026 (Revised)",
      "Admit Card": "31/07/2026",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "CBT-1, Physical Efficiency Test, Document Verification, Medical Examination",
    "salary": null,
    "applyLink": "https://www.rrbapply.gov.in/#/auth/landing",
    "notificationLink": "https://www.rrbapply.gov.in/",
    "resultLink": null,
    "admitLink": "https://rrb.digialm.com/EForms/configuredHtml/33128/101714/login.html",
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Apply only via the official RRB portal https://www.rrbapply.gov.in/",
      "Choose one RRB and complete registration for CEN 09/2025 (Level-1)",
      "Upload photo, signature and certificates, pay the fee and submit"
    ],
    "description": "RRB invited applications for Group-D (Level-1) posts under CEN 09/2025 for 22,195 posts. CBT-I was conducted 03–21/08/2026; result is awaited.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/railway-rrb-group-d-level-1-recruitment-2026-online/"
  },
  {
    "id": "rrb-ntpc-graduate-cen-06-2025",
    "title": "RRB NTPC (Graduate) CEN 06/2025",
    "org": "Railway Recruitment Board (Ministry of Railways, Govt. of India)",
    "postName": "Non-Technical Popular Categories (NTPC) – Graduate",
    "categories": [
      "central",
      "railway"
    ],
    "status": "result",
    "verified": true,
    "vacancies": 5810,
    "qualification": "Degree from a recognized University (Junior Accounts Assistant Cum Typist & Senior Clerk Cum Typist require typing proficiency in English/Hindi)",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 18 Years, Maximum 33 Years (as on 01/01/2026)",
    "ageRelaxation": "As per RRB rules",
    "fee": "General / OBC / EWS: ₹ 500/- ; SC / ST / EBC / Female: ₹ 250/- (Refund after appearing: Gen/OBC ₹ 400/-, others ₹ 250/-)",
    "importantDates": {
      "Application Begin": "21/10/2025",
      "Last Date": "27/11/2025",
      "Fee Payment Last Date": "27/11/2025",
      "Correction Date": "30/11–09/12/2025",
      "CBT-I Exam": "16–27/03/2026",
      "CBT-I Result": "11/06/2026",
      "CBT-II Exam": "10/07/2026",
      "CBT-II Result": "27/08/2026 (Available)"
    },
    "selection": "CBT-1, CBT-2, Skill/Typing/Aptitude Test, Document Verification, Medical Examination",
    "salary": null,
    "applyLink": "https://www.rrbapply.gov.in/#/auth/landing",
    "notificationLink": "https://www.rrbapply.gov.in/",
    "resultLink": "https://rrb.digialm.com/EForms/loginAction.do?subAction=ViewLoginPage&formId=98228&orgId=33128",
    "admitLink": "https://www.rrbapply.gov.in/",
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Register and apply on the official RRB portal https://www.rrbapply.gov.in/",
      "Select CEN 06/2025 (NTPC Graduate) and your preferred RRB",
      "Upload documents, pay the fee and download e-call letters as notified"
    ],
    "description": "RRB NTPC (Graduate) under CEN 06/2025 for 5810 posts. CBT-I (16–27/03/2026) and CBT-II (10/07/2026) conducted; CBT-II score card / result declared 27/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/rrb-ntpc-graduate-level-2026/"
  },
  {
    "id": "upsc-advt-52-2026-special",
    "title": "UPSC Recruitment Advertisement No. 52/2026 (Special)",
    "org": "Union Public Service Commission (UPSC)",
    "postName": "Various central government posts (see notification)",
    "categories": [
      "central"
    ],
    "status": "active",
    "verified": true,
    "vacancies": null,
    "qualification": "Verify from official notification",
    "eligibility": "Verify from official notification",
    "ageLimit": null,
    "ageRelaxation": null,
    "fee": null,
    "importantDates": {
      "Advertisement Released": "21/08/2026"
    },
    "selection": "Verify from official notification",
    "salary": null,
    "applyLink": "https://upsconline.nic.in/ora/",
    "notificationLink": "https://www.upsc.gov.in/sites/default/files/AdvtNo-52-2026-Special-Engl-210826.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the UPSC Online Recruitment Application (ORA) portal at https://upsconline.nic.in/ora/",
      "Register/login and select Advertisement No. 52/2026 (Special)",
      "Fill the form, upload documents and submit before the closing date"
    ],
    "description": "UPSC has published Special Recruitment Advertisement No. 52/2026 inviting online applications through the ORA portal for various central government posts; the detailed advertisement was released on 21/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://www.upsc.gov.in/whats-new/52%20-%202026%20%28Special%29"
  },
  {
    "id": "upsc-advt-10-2026",
    "title": "UPSC Recruitment Advertisement No. 10/2026",
    "org": "Union Public Service Commission (UPSC)",
    "postName": "Various central government posts (see notification)",
    "categories": [
      "central"
    ],
    "status": "active",
    "verified": true,
    "vacancies": null,
    "qualification": "Verify from official notification",
    "eligibility": "Verify from official notification",
    "ageLimit": null,
    "ageRelaxation": null,
    "fee": null,
    "importantDates": {
      "Advertisement Released": "07/08/2026"
    },
    "selection": "Verify from official notification",
    "salary": null,
    "applyLink": "https://upsconline.nic.in/ora/",
    "notificationLink": "https://www.upsc.gov.in/sites/default/files/AdvtNo-10-2026-Engl-070826.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Visit the UPSC ORA portal at https://upsconline.nic.in/ora/",
      "Register/login and select Advertisement No. 10/2026",
      "Complete the form, upload documents and submit before the closing date"
    ],
    "description": "UPSC has published Recruitment Advertisement No. 10/2026 on the ORA portal for various central government posts; the detailed advertisement was released on 07/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://www.upsc.gov.in/whats-new/10%20-%202026"
  },
  {
    "id": "upsc-nda-na-2-2026",
    "title": "National Defence Academy and Naval Academy Examination (II), 2026",
    "org": "Union Public Service Commission (UPSC)",
    "postName": "National Defence Academy & Naval Academy",
    "categories": [
      "central"
    ],
    "status": "upcoming",
    "verified": true,
    "vacancies": 394,
    "qualification": "Army Wing: 10+2 (any stream); Air Force & Naval Wing: 10+2 with Physics, Chemistry, Mathematics",
    "eligibility": "Verify from official notification",
    "ageLimit": "Born between 01/01/2008 and 01/01/2011 (both inclusive)",
    "ageRelaxation": "As per UPSC rules",
    "fee": "General / OBC: ₹ 100/- ; SC / ST / Female: ₹ 0/-",
    "importantDates": {
      "Application Begin": "20/05/2026",
      "Last Date": "11/06/2026",
      "Exam Date": "13/09/2026",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Written Test, SSB Interview",
    "salary": null,
    "applyLink": "https://upsconline.nic.in/",
    "notificationLink": "https://www.upsc.gov.in/sites/default/files/TimeTable-NDA-%20NA-Exam-II-2026-Engl-120826.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Apply through the UPSC application portal at https://upsconline.nic.in/",
      "Register, fill the NDA & NA (II) 2026 form and pay the fee, then submit"
    ],
    "description": "UPSC NDA & NA (II) Examination 2026 — Advt 10/2026-NDA-II — 394 posts. Apply 20/05/2026 to 11/06/2026; exam 13/09/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/upsc-nda-na-2-2026/"
  },
  {
    "id": "upsc-cds-2-2026",
    "title": "Combined Defence Services Examination (II), 2026",
    "org": "Union Public Service Commission (UPSC)",
    "postName": "Combined Defence Services",
    "categories": [
      "central"
    ],
    "status": "upcoming",
    "verified": true,
    "vacancies": 451,
    "qualification": "IMA & OTA: Bachelor's degree; Naval Academy: Engineering degree; Air Force: Bachelor's degree with Physics & Math at 10+2",
    "eligibility": "Verify from official notification",
    "ageLimit": "Born not earlier than 01/07/2003 and not later than 01/07/2008",
    "ageRelaxation": "As per UPSC rules",
    "fee": "General / OBC: ₹ 200/- ; SC / ST / Female: ₹ 0/-",
    "importantDates": {
      "Application Begin": "20/05/2026",
      "Last Date": "11/06/2026",
      "Exam Date": "13/09/2026",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Written Test, SSB Interview",
    "salary": null,
    "applyLink": "https://upsconline.nic.in/",
    "notificationLink": "https://www.upsc.gov.in/sites/default/files/TT-CDSE-II-2026-Engl-100826.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Apply through the UPSC application portal at https://upsconline.nic.in/",
      "Register, fill the CDS (II) 2026 form and pay the fee, then submit"
    ],
    "description": "UPSC CDS (II) Examination 2026 — Advt 11/2026-CDS-II — 451 posts. Apply 20/05/2026 to 11/06/2026; exam 13/09/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/upsc-cds-2-2026/"
  },
  {
    "id": "isro-icrb-scientist-engineer-sc-2026",
    "title": "ISRO ICRB Scientist/Engineer 'SC' Recruitment 2026",
    "org": "ISRO – Centralised Recruitment Board (ICRB)",
    "postName": "Scientist/Engineer 'SC'",
    "categories": [
      "central"
    ],
    "status": "active",
    "verified": true,
    "vacancies": 175,
    "qualification": "BE/B.Tech or equivalent in Electronics & Communication / Mechanical / Computer Science & Engineering with minimum 65% aggregate (CGPA 6.84/10)",
    "eligibility": "Verify from official notification",
    "ageLimit": "Minimum 18 Years, Maximum 28 Years (as on 16/09/2026)",
    "ageRelaxation": "As per ISRO ICRB rules",
    "fee": "All categories: ₹ 750/- (Refund ₹ 750 for SC/ST/PwBD/Women/ExSM; ₹ 500 for others; Final Application Fee: ₹ 250/-)",
    "importantDates": {
      "Application Begin": "27/08/2026",
      "Last Date": "16/09/2026",
      "Exam Date": "Notify Later",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Shortlisting, Interview, Final Merit List",
    "salary": null,
    "applyLink": "https://cdn.digialm.com/EForms/configuredHtml/1258/102146/Index.html",
    "notificationLink": "https://www.isro.gov.in/media_isro/pdf/recruitmentNotice/2026/August/Bilingual_Advertisement_27082026.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Submit applications online through the official ISRO recruitment portal (digialm) between 27/08/2026 and 16/09/2026 (until 11:55 PM)"
    ],
    "description": "ISRO ICRB invited applications for Scientist/Engineer 'SC' (Electronics, Mechanical, Computer Science) — Advt ISRO ICRB:03(EMC):2026 — for 175 posts. Apply 27/08/2026 to 16/09/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/isro-icrb-scientist-engineer-2026/"
  },
  {
    "id": "ursc-graduate-diploma-apprentices-2026",
    "title": "URSC Graduate & Diploma Apprentice Trainee 2026",
    "org": "ISRO – U. R. Rao Satellite Centre (URSC), Bengaluru",
    "postName": "Graduate Apprentice Trainee and Diploma Apprentice Trainee",
    "categories": [
      "apprenticeship",
      "central"
    ],
    "status": "lastdate",
    "verified": true,
    "vacancies": 410,
    "qualification": "Graduate Apprentice: BE/B.Tech in relevant engineering; Diploma Apprentice: Diploma in relevant engineering; Commercial Practice: Diploma in Commercial Practice",
    "eligibility": "Verify from official notification",
    "ageLimit": "N/A (as per Apprenticeship rules)",
    "ageRelaxation": "As per ISRO rules",
    "fee": "₹ 00/- (No fee)",
    "importantDates": {
      "Application Begin": "29/07/2026",
      "Last Date": "28/08/2026",
      "Exam Date": "Notify Later",
      "Admit Card": "Before Exam",
      "Result": "Will Be Updated Here Soon"
    },
    "selection": "Based on Merit List",
    "salary": null,
    "applyLink": "https://web.umang.gov.in/landing/",
    "notificationLink": "https://www.isro.gov.in/media_isro/pdf/recruitmentNotice/2026/July/URSC_Advt_for_Apprentice_July_2026_Blingual28072026.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Apply online through the UMANG portal; the window is open from 29/07/2026 to 28/08/2026"
    ],
    "description": "ISRO URSC engaged Graduate & Diploma Apprentice Trainees (incl. Commercial Practice) — Advt URSC 03/2026 — for 410 posts. Apply 29/07/2026 to 28/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://sarkariresult.com.cm/isro-ursc-apprentice-2026/"
  },
  {
    "id": "hsfc-scientist-engineer-sd-2026",
    "title": "HSFC Scientist/Engineer 'SD' Recruitment 2026",
    "org": "ISRO – Human Space Flight Centre (HSFC), Bengaluru",
    "postName": "Scientist/Engineer 'SD'",
    "categories": [
      "central"
    ],
    "status": "active",
    "verified": true,
    "vacancies": null,
    "qualification": "Verify from official notification",
    "eligibility": "Verify from official notification",
    "ageLimit": null,
    "ageRelaxation": null,
    "fee": null,
    "importantDates": {
      "Advertisement Date": "10/08/2026",
      "Last Date": "30/08/2026"
    },
    "selection": "Verify from official notification",
    "salary": null,
    "applyLink": null,
    "notificationLink": "https://www.isro.gov.in/media_isro/pdf/recruitmentNotice/2026/August/PhDLive_Register_Adv_10.08.2026.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Apply online through the official ISRO recruitment portal; the window is open from 10/08/2026 (1000 hrs) to 30/08/2026 (1700 hrs)"
    ],
    "description": "The Human Space Flight Centre (HSFC) has invited applications for the post of Scientist/Engineer 'SD'. The recruitment notification was issued on 10/08/2026 with applications closing on 30/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://www.isro.gov.in/Careers.html"
  },
  {
    "id": "lpsc-technical-assistant-technician-2026",
    "title": "LPSC Technical Assistant, Technician 'B', Draughtsman 'B' & Fireman 'A' 2026",
    "org": "ISRO – Liquid Propulsion Systems Centre (LPSC), Bengaluru & Thiruvananthapuram",
    "postName": "Technical Assistant, Technician 'B', Draughtsman 'B', Fireman 'A'",
    "categories": [
      "central"
    ],
    "status": "active",
    "verified": true,
    "vacancies": null,
    "qualification": "Verify from official notification",
    "eligibility": "Verify from official notification",
    "ageLimit": null,
    "ageRelaxation": null,
    "fee": null,
    "importantDates": {
      "Advertisement Date": "15/08/2026",
      "Last Date": "04/09/2026"
    },
    "selection": "Verify from official notification",
    "salary": null,
    "applyLink": "https://www.lpsc.gov.in",
    "notificationLink": "https://www.isro.gov.in/media_isro/pdf/recruitmentNotice/2026/August/LPSC_02_2026_Detailed_Advt17082026.pdf",
    "resultLink": null,
    "admitLink": null,
    "examPattern": null,
    "documents": [],
    "howToApply": [
      "Submit applications online via the official LPSC website (www.lpsc.gov.in) as per the detailed advertisement"
    ],
    "description": "LPSC has invited applications for Technical Assistant, Technician 'B', Draughtsman 'B' and Fireman 'A' posts at its Bengaluru and Thiruvananthapuram units. The advertisement was released on 15/08/2026.",
    "lastUpdated": "August 2026",
    "source": "https://www.isro.gov.in/Careers.html"
  }
];

  root.GOVT_JOBS = JOBS;
  root.GOVT_JOB_CATEGORIES = CATEGORIES;
  root.GOVT_STATUS_LABELS = STATUS_LABELS;

  root.getGovtJob = function (id) {
    for (var i = 0; i < JOBS.length; i++) {
      if (JOBS[i].id === id) return JOBS[i];
    }
    return null;
  };
})(window);
