/* ============================================================================
   STUDENT PORTAL — SEED CONTENT
   ----------------------------------------------------------------------------
   A substantial, original, student-focused seed dataset for the 12 categories.
   Loaded by admin-content.html. The "Seed Starter Content" button (admin only)
   imports these into Firestore (portal_content) — skipping any slug that already
   exists, so it is safe to run more than once.

   NOTE ON GOVERNMENT / LIVE DATA:
   No vacancy, date, fee or result figure is invented here. Government-job,
   admit-card and result entries are written as evergreen GUIDE articles that
   explain the process and point to the official website, with a clear
   "verify on the official notification" disclaimer. The structured govt-job
   type is fully supported in the CMS for when you enter a real vacancy.
   ============================================================================ */
(function (root) {
  'use strict';

  // Helper to build FAQ HTML from [{q,a}]
  function faqHtml(list) {
    if (!list || !list.length) return '';
    return '<h2>Frequently Asked Questions</h2>' + list.map(function (f) {
      return '<div class="faq-item"><div class="q">' + f.q + '</div><div class="a">' + f.a + '</div></div>';
    }).join('');
  }
  // Helper to build an "important info" box
  function info(text) {
    return '<div class="info-box"><strong>Important:</strong> ' + text + '</div>';
  }

  var S = [];
  function add(o) {
    o.status = 'published';
    if (!o.publishDate) o.publishDate = '2026-01-10';
    if (!o.lastUpdated) o.lastUpdated = '2026-03-15';
    if (!o.featured) o.featured = false;
    if (!o.faq) o.faq = [];
    if (!o.keywords) o.keywords = '';
    if (!o.seoTitle) o.seoTitle = o.title + ' | Physical Education Career';
    if (!o.metaDescription) o.metaDescription = o.shortDescription;
    S.push(o);
  }

  /* ===================== 1. CBSE / RBSE ===================== */
  add({ type:'article', category:'cbse-rbse', topic:'cbse-results',
    title:'CBSE 10th & 12th Result 2026 — How to Check, Marksheet & DigiLocker',
    slug:'cbse-result-2026',
    shortDescription:'Step-by-step guide to check CBSE Class 10 and 12 results online, download the marksheet from DigiLocker and apply for revaluation.',
    fullContent:'<p>The Central Board of Secondary Education (CBSE) declares Class 10 and Class 12 results on its official website. Knowing the correct process helps you avoid fake portals and get your marksheet quickly.</p>'+
      '<h2>How to Check CBSE Result Online</h2>'+
      '<ol><li>Visit the official CBSE results portal (cbseresults.nic.in) or cbse.gov.in.</li>'+
      '<li>Click "CBSE Class 10 / 12 Result 2026".</li>'+
      '<li>Enter your Roll Number, School Number, Admit Card ID and Security PIN.</li>'+
      '<li>Submit to view and download your marksheet.</li></ol>'+
      info('Always use the official CBSE website. Never share your credentials on unknown sites.')+
      '<h2>Download Marksheet from DigiLocker</h2>'+
      '<p>CBSE issues digital marksheets through DigiLocker (digilocker.gov.in). Once results are declared, your mark sheet, passing certificate and migration certificate appear under the "Issued Documents" section linked to your Aadhaar.</p>'+
      '<h2>Revaluation & Verification</h2>'+
      '<p>If you are not satisfied with a subject score, CBSE opens a short window for verification of marks, photocopy of answer book and revaluation. Fees are per subject and dates are strict.</p>'+
      faqHtml([{q:'When is the CBSE 2026 result expected?',a:'CBSE generally declares results between May and July. Check the official notice for exact dates.'},{q:'Is the DigiLocker marksheet valid?',a:'Yes, the digitally signed DigiLocker marksheet is legally valid for admissions and jobs.'}])});

  add({ type:'article', category:'cbse-rbse', topic:'rbse-results',
    title:'RBSE 10th & 12th Result — Check Online, Marksheet & Revaluation',
    slug:'rbse-result-2026',
    shortDescription:'How Rajasthan Board (RBSE) students can check Class 10 and 12 results, download marksheets and apply for revaluation.',
    fullContent:'<p>The Board of Secondary Education, Rajasthan (RBSE) publishes Class 10 (Secondary) and Class 12 (Senior Secondary) results on rajeduboard.rajasthan.gov.in.</p>'+
      '<h2>Steps to Check RBSE Result</h2>'+
      '<ol><li>Go to the official RBSE website.</li><li>Open the "Results" section.</li>'+
      '<li>Select Class 10 or Class 12 and enter your roll number.</li>'+
      '<li>Download and print the provisional marksheet.</li></ol>'+
      '<h2>Revaluation</h2><p>RBSE allows revaluation/verification within a limited window after result declaration. Keep your roll number and fee receipt safe.</p>'+
      faqHtml([{q:'Where is the official RBSE site?',a:'rajeduboard.rajasthan.gov.in is the only official source.'}])});

  add({ type:'article', category:'cbse-rbse', topic:'marksheet-digilocker',
    title:'Download CBSE/RBSE Marksheet from DigiLocker — Step by Step',
    slug:'download-marksheet-digilocker',
    shortDescription:'Use DigiLocker to get your digitally signed CBSE or RBSE marksheet, passing and migration certificates.',
    fullContent:'<p>DigiLocker (digilocker.gov.in) is the government’s cloud document wallet. Boards push verified marksheets here, so students no longer need to wait for the physical copy.</p>'+
      '<h2>How to Get Your Marksheet</h2>'+
      '<ol><li>Sign in to DigiLocker with your Aadhaar / mobile.</li>'+
      '<li>Go to "Issued Documents" → select CBSE or RBSE.</li>'+
      '<li>Choose Marksheet / Passing Certificate / Migration.</li>'+
      '<li>Download the PDF (digitally signed, valid for admission).</li></ol>'+
      info('If a document is missing, wait 24–48 hours after result declaration; boards sync in batches.')});

  add({ type:'article', category:'cbse-rbse', topic:'revaluation-result',
    title:'CBSE/RBSE Revaluation & Verification of Marks — Process & Fees',
    slug:'cbse-rbse-revaluation',
    shortDescription:'Understand the verification, photocopy and revaluation process, timelines and fees for CBSE and RBSE.',
    fullContent:'<p>Both CBSE and RBSE provide a transparent correction window. The usual order is: Verification of Marks → Obtaining Photocopy → Revaluation.</p>'+
      '<h2>Important Points</h2><ul><li>Apply only through the official portal within the notified dates.</li>'+
      '<li>Fees are per subject and non-refundable.</li>'+
      '<li>Revaluation is generally limited to specific subjects and not for entire answer books.</li></ul>'+
      faqHtml([{q:'Can I get a photocopy of my answer book?',a:'Yes, after verification, boards allow a paid photocopy request before revaluation.'}])});

  add({ type:'article', category:'cbse-rbse', topic:'board-exam-updates',
    title:'CBSE/RBSE Board Exam Updates 2026 — Datesheet, Admit Card & Guidelines',
    slug:'board-exam-updates-2026',
    shortDescription:'Stay updated with CBSE and RBSE board exam datesheets, admit cards, practicals and exam-day guidelines.',
    fullContent:'<p>Board exams follow a fixed annual calendar. The datesheet is released weeks before the exam; admit cards are issued by schools (CBSE) or the board (RBSE).</p>'+
      '<h2>Checklist</h2><ul><li>Download the datesheet and highlight your subjects.</li>'+
      '<li>Collect your admit card and verify details (name, photo, subjects).</li>'+
      '<li>Carry a valid school ID and the admit card on exam day.</li>'+
      '<li>Reach the centre 30 minutes early.</li></ul>'+
      info('Follow the dress code and barred-items list published with the admit card.')});

  /* ===================== 2. Admit Card ===================== */
  add({ type:'admit-card', category:'admit-card', topic:'cbse-admit-card',
    title:'CBSE Admit Card 2026 — Download, Errors & Guidelines',
    slug:'cbse-admit-card-2026',
    shortDescription:'How regular and private CBSE students download the Class 10/12 admit card, fix errors and follow exam guidelines.',
    fullContent:'<p>CBSE distributes admit cards through schools for regular candidates; private candidates download theirs from the CBSE portal.</p>'+
      '<h2>Download Steps (Private Candidates)</h2><ol><li>Visit cbse.gov.in → "Admit Card / Private Candidate".</li>'+
      '<li>Enter application number / roll number and date of birth.</li><li>Download and print.</li></ol>'+
      '<h2>If Details Are Wrong</h2><p>Contact your school or the regional CBSE office immediately. Minor corrections (photo, signature) are handled at the centre; major name/subject errors need prior correction.</p>'+
      info('Verify the barcode, subjects and medium before the exam.')+
      faqHtml([{q:'Who issues the CBSE admit card?',a:'Schools issue regular-candidate admit cards; private candidates download from the CBSE site.'}]),
    officialUrl:'https://cbse.gov.in' });

  add({ type:'admit-card', category:'admit-card', topic:'ssc-admit-card',
    title:'SSC Admit Card Download Guide — ssc.nic.in',
    slug:'ssc-admit-card-guide',
    shortDescription:'Download SSC CGL/CHSL/MTS/GD admit cards region-wise from the official SSC portals.',
    fullContent:'<p>The Staff Selection Commission (SSC) releases admit cards on its regional websites, not centrally. Candidates must use the region they applied under.</p>'+
      '<h2>How to Download</h2><ol><li>Open your SSC regional website (links from ssc.nic.in).</li>'+
      '<li>Go to "Admit Card" → select your exam.</li><li>Enter registration ID / roll number and DOB.</li>'+
      '<li>Save the PDF and carry a photo ID.</li></ol>'+
      info('SSC never asks for money to download an admit card. Use only ssc.nic.in and regional sites.')+
      faqHtml([{q:'I cannot find my regional link?',a:'ssc.nic.in lists all regional websites; choose the one matching your application.'}]),
    officialUrl:'https://ssc.nic.in' });

  add({ type:'admit-card', category:'admit-card', topic:'rpsc-admit-card',
    title:'RPSC Admit Card Download — rpsc.rajasthan.gov.in',
    slug:'rpsc-admit-card-guide',
    shortDescription:'Download Rajasthan Public Service Commission admit cards for RAS, lectureship and other exams.',
    fullContent:'<p>RPSC publishes admit cards on rpsc.rajasthan.gov.in under the "Admit Card" tab for each advertised exam.</p>'+
      '<ol><li>Open the RPSC website and click "Admit Card".</li><li>Select the examination.</li>'+
      '<li>Enter your application/registration details.</li><li>Download and print.</li></ol>'+
      info('Carry a valid photo ID (Aadhaar/Voter/DL) along with the admit card.')+
      faqHtml([{q:'Where is the official RPSC site?',a:'rpsc.rajasthan.gov.in'}]),
    officialUrl:'https://rpsc.rajasthan.gov.in' });

  add({ type:'admit-card', category:'admit-card', topic:'ctet-admit-card',
    title:'CTET Admit Card Download — ctet.nic.in',
    slug:'ctet-admit-card-guide',
    shortDescription:'Download the Central Teacher Eligibility Test admit card and understand exam-day rules.',
    fullContent:'<p>CTET admit cards are released on ctet.nic.in a few weeks before the exam.</p>'+
      '<ol><li>Visit ctet.nic.in → "Download Admit Card".</li><li>Enter registration number and date of birth.</li>'+
      '<li>Download and verify exam centre, shift and paper (Paper I / II).</li></ol>'+
      info('Reach the centre with the admit card and a valid ID at least 60 minutes before the exam.')+
      faqHtml([{q:'What does CTET admit card show?',a:'Your exam city, centre, shift, paper and candidate details.'}]),
    officialUrl:'https://ctet.nic.in' });

  /* ===================== 3. Government Jobs ===================== */
  add({ type:'article', category:'govt-jobs', topic:'ssc-jobs',
    title:'SSC Exams & Jobs Guide — CGL, CHSL, MTS, GD (Eligibility & How to Apply)',
    slug:'ssc-jobs-guide',
    shortDescription:'Complete guide to Staff Selection Commission exams: CGL, CHSL, MTS, GD, eligibility, syllabus, application process and official portal.',
    fullContent:'<p>The Staff Selection Commission (SSC) conducts some of the largest government recruitment exams in India. Understanding each exam helps you apply to the right post.</p>'+
      '<h2>Major SSC Exams</h2><ul><li><strong>SSC CGL</strong> — Graduate Level posts (Assistant, Inspector, Auditor).</li>'+
      '<li><strong>SSC CHSL</strong> — 12th-pass posts (LDC, Postal Assistant).</li>'+
      '<li><strong>SSC MTS</strong> — 10th-pass multi-tasking staff.</li>'+
      '<li><strong>SSC GD</strong> — Constable in CAPFs.</li></ul>'+
      '<h2>Eligibility (typical)</h2><p>CGL/CHSL require graduation/12th; age limits vary by post and category. Always read the official notification for exact criteria.</p>'+
      '<h2>How to Apply</h2><ol><li>Visit ssc.nic.in and register (One-Time Registration).</li>'+
      '<li>Fill the application for the relevant exam.</li><li>Pay the fee (exemptions apply) and note the last date.</li>'+
      '<li>Download admit card when released.</li></ol>'+
      info('Notification dates, vacancies and fees change every cycle. Verify everything on ssc.nic.in before applying.')+
      faqHtml([{q:'Is SSC CGL for graduates only?',a:'Yes, CGL generally requires a bachelor’s degree from a recognised university.'},{q:'Where do I apply?',a:'Only through the official SSC portal ssc.nic.in.'}]),
    officialUrl:'https://ssc.nic.in' });

  add({ type:'article', category:'govt-jobs', topic:'upsc-jobs',
    title:'UPSC Recruitment Guide — Civil Services & Other Exams',
    slug:'upsc-jobs-guide',
    shortDescription:'Overview of UPSC exams (CSE, CDS, NDA, CAPF), eligibility and the application process.',
    fullContent:'<p>The Union Public Service Commission (UPSC) conducts top central recruitments including the Civil Services Examination (IAS, IPS, IFS), CDS, NDA and CAPF.</p>'+
      '<h2>Key Exams</h2><ul><li><strong>CSE</strong> — for IAS/IPS/IFS and central services.</li>'+
      '<li><strong>CDS</strong> — entry to IMA, OTA, INA, AFA.</li><li><strong>NDA</strong> — after 12th, for defence academies.</li></ul>'+
      '<h2>How to Apply</h2><p>Apply through upsc.gov.in (Online Recruitment Application). Keep your photo, signature and ID ready.</p>'+
      info('UPSC dates and patterns are authoritative only on upsc.gov.in.')+
      faqHtml([{q:'What is the UPSC CSE age limit?',a:'Generally 21–32 years with relaxations; verify the notification.'}]),
    officialUrl:'https://upsc.gov.in' });

  add({ type:'article', category:'govt-jobs', topic:'railway-jobs',
    title:'Railway Jobs via RRB — ALP, Technician, NTPC Guide',
    slug:'railway-jobs-guide',
    shortDescription:'Railway recruitment through RRBs: NTPC, ALP, Technician, Group D — eligibility and application process.',
    fullContent:'<p>Indian Railways recruits lakhs of candidates through Railway Recruitment Boards (RRBs) for NTPC, ALP, Technician and Group D posts.</p>'+
      '<h2>Common Posts</h2><ul><li><strong>NTPC</strong> — Non-Technical Popular Categories (clerk, station master, etc.).</li>'+
      '<li><strong>ALP / Technician</strong> — Assistant Loco Pilot and technical roles.</li>'+
      '<li><strong>Level-1 (Group D)</strong> — track maintainer, helper.</li></ul>'+
      '<h2>How to Apply</h2><p>Applications are accepted on the official RRB portal during notification windows. A single registration can be used across RRBs.</p>'+
      info('Never pay agents. All railway recruitment is free to apply on rrbcdg.gov.in / indianrailways.gov.in.')+
      faqHtml([{q:'Is there a Railway exam every year?',a:'Recruitment is notification-based; watch the official RRB site for openings.'}]),
    officialUrl:'https://indianrailways.gov.in' });

  add({ type:'article', category:'govt-jobs', topic:'police-jobs',
    title:'Police Jobs — Rajasthan & Central (Constable / SI) Guide',
    slug:'police-jobs-guide',
    shortDescription:'How to join police forces: Rajasthan Police Constable/SI, CAPF and central police recruitment.',
    fullContent:'<p>Police recruitment happens at state and central levels. Rajasthan Police conducts Constable and Sub-Inspector exams; central forces (CRPF, BSF, ITBP, CISF, SSB) recruit via SSC/UG. </p>'+
      '<h2>Eligibility</h2><ul><li>Constable: usually 10th/12th pass, age 18–23 (relaxations apply).</li>'+
      '<li>SI: graduation, age 20–25 typically.</li><li>Physical standards (height, chest, race) are mandatory.</li></ul>'+
      '<h2>How to Apply</h2><p>Use the official state police site (e.g., police.rajasthan.gov.in) or SSC for CAPFs.</p>'+
      info('Physical efficiency tests are qualifying; prepare the run and standards in advance.')+
      faqHtml([{q:'Where to apply for Rajasthan Police?',a:'Through police.rajasthan.gov.in during notifications.'}]),
    officialUrl:'https://police.rajasthan.gov.in' });

  add({ type:'article', category:'govt-jobs', topic:'pti-pet-jobs',
    title:'PTI / PET Government Jobs — Eligibility & Exams',
    slug:'pti-pet-govt-jobs',
    shortDescription:'Government PTI/PET (Physical Training Instructor) jobs in schools, police, railways and defence — eligibility and exams.',
    fullContent:'<p>Physical Training Instructors (PTI) and Physical Education Teachers (PET) are recruited by schools, colleges, police, railways and defence establishments.</p>'+
      '<h2>Eligibility</h2><ul><li>School PTI: D.P.Ed / B.P.Ed often required.</li>'+
      '<li>College PET: B.P.Ed / M.P.Ed preferred.</li><li>Police/Railway: physical standards plus educational qualification per post.</li></ul>'+
      '<h2>Where They Are Advertised</h2><p>RPSC (school lecturer PE), state education departments, SSC (PET in CAPFs), railways and defence.</p>'+
      info('A B.P.Ed/M.P.Ed degree plus REET/CTET (for schools) greatly improves prospects.')+
      faqHtml([{q:'Which degree is best for PTI jobs?',a:'D.P.Ed/B.P.Ed for schools; M.P.Ed for senior/college roles.'}]) });

  add({ type:'article', category:'govt-jobs', topic:'sports-govt-jobs',
    title:'Sports Quota Jobs in Government — Eligibility & Process',
    slug:'sports-quota-jobs-guide',
    shortDescription:'How sports achievements can lead to government jobs via sports quota in railways, police, defence and PSUs.',
    fullContent:'<p>Many government departments reserve posts under the Sports Quota for meritorious sportspersons with recognized certificates (national/state/recognized tournaments).</p>'+
      '<h2>Where Sports Quota Exists</h2><ul><li>Railways, police, forest and PSUs recruit sportspersons.</li>'+
      '<li>Defence and paramilitary have sports wings.</li></ul>'+
      '<h2>Documents Needed</h2><p>Valid achievement certificates, Gazette notifications and proof of recognized event. Keep originals and digitized copies.</p>'+
      info('Only certificates from recognized bodies are accepted; verify the list on the recruiting department’s site.') });

  /* ===================== 4. Teacher & Education Jobs ===================== */
  add({ type:'article', category:'teacher-jobs', topic:'reet',
    title:'REET 2026 — Rajasthan Eligibility Examination for Teachers Guide',
    slug:'reet-guide',
    shortDescription:'REET eligibility, levels (Level 1/2), syllabus, application and validity for Rajasthan government school teaching jobs.',
    fullContent:'<p>REET (Rajasthan Eligibility Examination for Teachers) is the mandatory eligibility test for government school teacher recruitment in Rajasthan (Level 1: Class 1–5, Level 2: Class 6–8).</p>'+
      '<h2>Eligibility</h2><ul><li>Level 1: 12th with D.El.Ed/equivalent.</li><li>Level 2: graduation with B.Ed/D.El.Ed.</li>'+
      '<li>PTI/PET roles need B.P.Ed/D.P.Ed as per rules.</li></ul>'+
      '<h2>How to Apply</h2><p>Through the official REET portal during notification; keep your ID, photo and fee ready.</p>'+
      info('REET is eligibility, not direct recruitment; final selection follows the recruitment rules. Verify on the official Board site.')+
      faqHtml([{q:'Is REET valid for life?',a:'Validity periods change by notification; check the current rule.'}]) });

  add({ type:'article', category:'teacher-jobs', topic:'ctet',
    title:'CTET 2026 — Central Teacher Eligibility Test Guide',
    slug:'ctet-guide',
    shortDescription:'CTET Paper 1 & 2 eligibility, syllabus, application and validity for central-school teaching.',
    fullContent:'<p>CTET (Central Teacher Eligibility Test) is required for teaching in central government schools (KVS, NVS, Kendriya Vidyalayas) and many states accept it.</p>'+
      '<h2>Papers</h2><ul><li>Paper I — for Class 1–5.</li><li>Paper II — for Class 6–8.</li>'+
      '<li>Both for dual eligibility.</li></ul>'+
      '<h2>How to Apply</h2><p>ctet.nic.in → register → choose paper → pay → download admit card.</p>'+
      info('CTET is eligibility only; recruitment follows separate vacancies.')+
      faqHtml([{q:'Is CTET mandatory for KVS/NVS?',a:'Yes, CTET qualification is generally required for central-school teaching.'}]),
    officialUrl:'https://ctet.nic.in' });

  add({ type:'article', category:'teacher-jobs', topic:'pgt-jobs',
    title:'PGT Teacher Jobs — Eligibility, Subjects & Recruitment',
    slug:'pgt-jobs-guide',
    shortDescription:'Post Graduate Teacher recruitment: eligibility, subjects and major recruiting bodies (RPSC, KVS, NVS).',
    fullContent:'<p>PGT (Post Graduate Teacher) posts in senior secondary schools require a master’s degree in the subject plus B.Ed (as per rules).</p>'+
      '<h2>Recruiters</h2><ul><li>RPSC School Lecturer (state government).</li><li>KVS/NVS (central schools).</li>'+
      '<li>Private senior secondary schools.</li></ul>'+
      '<h2>How to Apply</h2><p>Watch the official recruiting body’s notification; PGT often needs a subject-specific entrance/interview.</p>'+
      info('PE/Graduate subjects have dedicated PGT posts; verify subject eligibility in the notification.') });

  add({ type:'article', category:'teacher-jobs', topic:'prt-jobs',
    title:'PRT Teacher Jobs — Eligibility & Recruitment',
    slug:'prt-jobs-guide',
    shortDescription:'Primary Teacher (PRT) jobs: eligibility (12th + D.El.Ed), CTET/REET requirement and recruitment bodies.',
    fullContent:'<p>PRT (Primary Teacher) roles cover Class 1–5. Eligibility is typically 12th with D.El.Ed and a primary-level eligibility test (CTET Paper I / REET Level 1).</p>'+
      '<h2>Recruiters</h2><ul><li>State education departments (via REET).</li><li>KVS/NVS (via CTET).</li><li>Private primary schools.</li></ul>'+
      info('A valid primary-level eligibility certificate is mandatory before joining.') });

  add({ type:'article', category:'teacher-jobs', topic:'pti-jobs',
    title:'PTI Teacher Jobs — Physical Training Instructor Recruitment',
    slug:'pti-teacher-jobs',
    shortDescription:'How to become a PTI in government and private schools: qualifications, eligibility test and career path.',
    fullContent:'<p>PTIs handle physical education in schools. Government schools recruit PTI/PET through RPSC (lecturer PE) and REET/special drives; private schools hire B.P.Ed/D.P.Ed holders directly.</p>'+
      '<h2>Qualification Path</h2><ol><li>D.P.Ed (after 12th) or B.P.Ed (after graduation).</li>'+
      '<li>Clear the relevant eligibility test (REET/CTET as applicable).</li>'+
      '<li>Apply to school/state notifications.</li></ol>'+
      info('A strong sports background plus the right PE degree is the standard combination.') });

  /* ===================== 5. College & University Admissions ===================== */
  add({ type:'admission', category:'college-admissions', topic:'bped-admission',
    title:'B.P.Ed Admission 2026 — Eligibility, Entrance & Colleges',
    slug:'bped-admission-guide',
    shortDescription:'Bachelor of Physical Education (B.P.Ed) admission: eligibility, entrance test, colleges and career scope.',
    fullContent:'<p>B.P.Ed is a 2-year (or 3–4 year integrated) undergraduate programme preparing students for careers in physical education, coaching and teaching.</p>'+
      '<h2>Eligibility</h2><ul><li>Graduation in any stream (some colleges prefer PE/sports background).</li>'+
      '<li>Minimum marks as per the university (often 45–50%).</li>'+
      '<li>Physical fitness and sports certificates are valued.</li></ul>'+
      '<h2>Admission Process</h2><ol><li>Apply to the university/college.</li><li>Appear for the entrance + physical fitness test + interview.</li>'+
      '<li>Merit list based on academics + entrance + sports achievements.</li></ol>'+
      info('Each university sets its own rules; verify eligibility and entrance pattern on the college website.')+
      faqHtml([{q:'Can I do B.P.Ed after 12th?',a:'Usually a bachelor’s degree is required; some integrated courses accept 12th. Check the university.'}]) });

  add({ type:'admission', category:'college-admissions', topic:'mped-admission',
    title:'M.P.Ed Admission 2026 — Eligibility & Process',
    slug:'mped-admission-guide',
    shortDescription:'Master of Physical Education (M.P.Ed) admission: eligibility, entrance test and career opportunities.',
    fullContent:'<p>M.P.Ed is a 2-year postgraduate degree for advanced study in physical education, sports science, coaching and teaching at senior levels.</p>'+
      '<h2>Eligibility</h2><ul><li>B.P.Ed or equivalent (some accept any graduate with PE background).</li>'+
      '<li>Entrance test + fitness + interview per university.</li></ul>'+
      '<h2>Career Scope</h2><p>College PET, school PGT (PE), sports coach, fitness trainer, and research roles.</p>'+
      info('Verify equivalence and entrance weightage on the university admission portal.') });

  add({ type:'admission', category:'college-admissions', topic:'dped-admission',
    title:'D.P.Ed Admission — Diploma in Physical Education',
    slug:'dped-admission-guide',
    shortDescription:'Diploma in Physical Education (D.P.Ed): eligibility, duration and career use.',
    fullContent:'<p>D.P.Ed is a diploma (often 2 years) that qualifies you as a physical education instructor at school level, especially useful where a degree is not mandated.</p>'+
      '<h2>Eligibility</h2><p>12th pass with preference for sports/PE background; some states require an entrance/fitness test.</p>'+
      info('Check whether your target school system accepts D.P.Ed for PTI posts in that state.') });

  add({ type:'article', category:'college-admissions', topic:'counselling',
    title:'College Admission Counselling — Process & Documents',
    slug:'college-admission-counselling',
    shortDescription:'How central/state counselling works for UG/PG admissions, choice filling and required documents.',
    fullContent:'<p>Most professional and university admissions use online counselling: registration → choice filling → seat allotment → document verification → admission.</p>'+
      '<h2>Documents to Keep Ready</h2><ul><li>Mark sheets & certificates (10th, 12th, graduation).</li>'+
      '<li>Category / domicile / income certificates if applicable.</li><li>ID proof, photos, transfer/migration certificate.</li></ul>'+
      info('Lock choices only after careful priority order; changing later is usually not allowed.')+
      faqHtml([{q:'What if documents are missing at verification?',a:'You may be given a short window to submit; always read the counselling schedule.'}]) });

  add({ type:'article', category:'college-admissions', topic:'entrance-exams',
    title:'Physical Education Entrance Exams — What to Prepare',
    slug:'physical-education-entrance-exams',
    shortDescription:'Syllabus and preparation tips for B.P.Ed/M.P.Ed/CUCET and state PE entrance tests.',
    fullContent:'<p>PE entrance tests usually combine: general knowledge & sports, English/aptitude, subject knowledge, physical fitness, and an interview.</p>'+
      '<h2>Preparation Tips</h2><ul><li>Revise basics of anatomy, physiology and sports rules.</li>'+
      '<li>Follow current sports news and major events.</li><li>Train for the fitness test (run, strength) in advance.</li></ul>'+
      info('Download the specific university’s prospectus for the exact test components.') });

  /* ===================== 6. Scholarships ===================== */
  add({ type:'scholarship', category:'scholarships', topic:'nsp-scholarship',
    title:'NSP Scholarship — National Scholarship Portal Registration Guide',
    slug:'nsp-scholarship-guide',
    shortDescription:'How to register and apply on the National Scholarship Portal (scholarships.gov.in) with documents and deadlines.',
    fullContent:'<p>The National Scholarship Portal (NSP) is the unified platform for central and state scholarship schemes.</p>'+
      '<h2>How to Apply</h2><ol><li>Register at scholarships.gov.in with Aadhaar & bank details.</li>'+
      '<li>Complete the One-Time Registration (OTP verification).</li><li>Find the eligible scheme and fill the application.</li>'+
      '<li>Upload documents and submit before the last date.</li></ol>'+
      info('Always apply only on the official NSP. Beware of fake portals asking for fees.')+
      faqHtml([{q:'Is NSP free to use?',a:'Yes. The official NSP does not charge any application fee.'}]),
    officialUrl:'https://scholarships.gov.in' });

  add({ type:'scholarship', category:'scholarships', topic:'rajasthan-scholarships',
    title:'Rajasthan Scholarships — SJE, Post-Matric & E-Scholarship',
    slug:'rajasthan-scholarships-guide',
    shortDescription:'Rajasthan state scholarships for SC/ST/OBC/Minority/Sambal students and how to apply.',
    fullContent:'<p>Rajasthan offers pre-matric, post-matric and merit scholarships through the Social Justice & Empowerment (SJE) department and the E-Mitra / SSO portal.</p>'+
      '<h2>How to Apply</h2><p>Most Rajasthan scholarships are applied via the SSO / E-Scholarship portal with income, caste and marks certificates.</p>'+
      info('Keep income and caste certificates current; mismatches cause rejection.') });

  add({ type:'scholarship', category:'scholarships', topic:'college-scholarships',
    title:'Sports Scholarships — Funding for Student Athletes',
    slug:'sports-scholarships-guide',
    shortDescription:'Scholarship and stipend opportunities for sportspersons from government and universities.',
    fullContent:'<p>Meritorious athletes can get scholarships/stipends from the Sports Ministry, state departments and universities, often linked to the sports quota.</p>'+
      '<h2>Typical Support</h2><ul><li>Training stipends and equipment support.</li><li>Fee waivers in sports hostels / universities.</li>'+
      '<li>National-level cash awards.</li></ul>'+
      info('Maintain recognized achievement certificates; schemes change yearly—verify on the official sports department site.') });

  add({ type:'scholarship', category:'scholarships', topic:'sc-st-obc-scholarships',
    title:'SC/ST/OBC Scholarships — Eligibility & Apply',
    slug:'sc-st-obc-scholarships',
    shortDescription:'Central & state scholarships for SC/ST/OBC students: pre-matric, post-matric and top-class education.',
    fullContent:'<p>SC/ST/OBC students can avail pre-matric, post-matric and "Top Class Education" scholarships through NSP and state portals.</p>'+
      '<h2>Documents</h2><ul><li>Caste certificate.</li><li>Income certificate.</li><li>Mark sheets & bank passbook (joint account with parent for minors).</li></ul>'+
      info('Apply well before the deadline; many schemes close early due to quotas.') });

  add({ type:'article', category:'scholarships', topic:'scholarship-form',
    title:'Scholarship Application Guide — Documents, Deadlines & Tips',
    slug:'scholarship-application-guide',
    shortDescription:'A practical checklist to apply for any scholarship successfully.',
    fullContent:'<p>Applying for scholarships is competitive; a clean, complete application wins.</p>'+
      '<h2>Checklist</h2><ul><li>Confirm eligibility (caste/income/marks/domicile).</li>'+
      '<li>Scan all documents in required format & size.</li><li>Fill every field; avoid blank mandatory columns.</li>'+
      '<li>Submit before the last date and save the acknowledgement.</li></ul>'+
      info('Track status on the portal; respond to queries/defects within the given window.') });

  /* ===================== 7. Study Material ===================== */
  add({ type:'study-material', category:'study-material', topic:'physical-education-notes',
    title:'Physical Education Notes (Class 11/12) — Complete Guide',
    slug:'physical-education-notes',
    shortDescription:'Chapter-wise Physical Education notes for Class 11 & 12: key topics, diagrams and revision points.',
    fullContent:'<p>Physical Education is a high-scoring subject when concepts of anatomy, physiology, sports, yoga and training are clear.</p>'+
      '<h2>Important Units (CBSE Class 12)</h2><ul><li>Planning in Sports</li><li>Sports & Nutrition</li>'+
      '<li>Yoga & Lifestyle</li><li>Physical Education & Sports for CWSN</li><li>Children & Women in Sports</li>'+
      '<li>Test & Measurement</li><li>Physiology & Injuries</li><li>Biomechanics & Psychology</li><li>Training Methods</li></ul>'+
      '<h2>Revision Tip</h2><p>Make one-page notes per unit with diagrams (heart, joints, training curves) for quick recall.</p>'+
      info('Use NCERT as the base; practice previous-year questions for each unit.') });

  add({ type:'study-material', category:'study-material', topic:'cbse-pe-notes',
    title:'CBSE Physical Education Notes — Chapter-wise',
    slug:'cbse-pe-notes',
    shortDescription:'Chapter-wise CBSE PE notes with definitions, diagrams and exam-style points.',
    fullContent:'<p>These notes follow the CBSE Class 11 & 12 Physical Education syllabus to help you write precise answers.</p>'+
      '<h2>Class 11 Highlights</h2><ul><li>Changes in Olympic Games, Yogic practices</li>'+
      '<li>Physical fitness & wellness, postures, test items</li><li>Fundamentals of anatomy & physiology, injuries</li></ul>'+
      '<h2>Writing Answers</h2><p>Start with a definition, add points with examples, and draw labelled diagrams wherever possible.</p>' });

  add({ type:'study-material', category:'study-material', topic:'mcq',
    title:'MCQs for Physical Education & General Knowledge',
    slug:'pe-mcq-practice',
    shortDescription:'Practice multiple-choice questions for PE, sports GK and teaching exams.',
    fullContent:'<p>MCQs test recall and application. Regular practice improves speed and accuracy for board and competitive exams.</p>'+
      '<h2>Topics to Cover</h2><ul><li>Sports & tournaments (related games, venues, trophies).</li>'+
      '<li>Anatomy & physiology basics.</li><li>Yoga, training methods, injuries.</li>'+
      '<li>Current sports affairs.</li></ul>'+
      info('Review wrong answers; understanding the concept beats memorising options.') });

  add({ type:'article', category:'study-material', topic:'exam-preparation',
    title:'Exam Preparation Strategy — Timetable & Revision',
    slug:'exam-preparation-strategy',
    shortDescription:'Build a realistic study timetable, use active recall and revise effectively for board & competitive exams.',
    fullContent:'<p>A good strategy matters more than long hours. Plan, practice and review consistently.</p>'+
      '<h2>Steps</h2><ol><li>Make a weekly timetable with fixed slots per subject.</li>'+
      '<li>Use active recall (solve, don’t just read).</li><li>Do one full mock per week and analyse mistakes.</li>'+
      '<li>Keep a formula/diagram sheet for quick revision.</li></ol>'+
      info('Sleep and hydration directly affect memory—do not sacrifice them.') });

  /* ===================== 8. Previous Year Papers ===================== */
  add({ type:'previous-paper', category:'previous-papers', topic:'cbse-previous-papers',
    title:'CBSE Previous Year Papers with Solutions',
    slug:'cbse-previous-papers',
    shortDescription:'Why solving CBSE previous-year papers helps and how to use them for board exams.',
    fullContent:'<p>Previous-year papers reveal the question pattern, marking scheme and frequently asked topics.</p>'+
      '<h2>How to Use</h2><ol><li>Solve a paper in exam-like conditions (3 hours).</li>'+
      '<li>Check with the official marking scheme.</li><li>Note repeated topics and weak areas.</li>'+
      '<li>Re-solve only the mistakes until perfect.</li></ol>'+
      info('Start with the last 5 years; board patterns are fairly stable.') });

  add({ type:'previous-paper', category:'previous-papers', topic:'physical-education-previous-papers',
    title:'Physical Education Previous Year Papers (PE)',
    slug:'pe-previous-papers',
    shortDescription:'PE PYQs for board and entrance exams with a solving strategy.',
    fullContent:'<p>PE papers reward diagram-based and application answers. Practising PYQs builds that skill.</p>'+
      '<h2>Focus Areas</h2><ul><li>Labelled diagrams (heart, joints, training curves).</li>'+
      '<li>Applied physiology and injury management.</li><li>Sports & yoga short notes.</li></ul>'+
      info('Write answers in points with headings; examiners award step marks.') });

  add({ type:'previous-paper', category:'previous-papers', topic:'physical-education-previous-papers',
    title:'B.P.Ed Entrance Previous Year Papers',
    slug:'bped-previous-papers',
    shortDescription:'Use B.P.Ed entrance PYQs to prepare for the written, fitness and interview stages.',
    fullContent:'<p>B.P.Ed entrance combines academics, sports GK, fitness and interview. PYQs help calibrate preparation.</p>'+
      '<h2>Prepare</h2><ul><li>Academics: PE basics, GK, English.</li><li>Fitness: run, strength as per test.</li>'+
      '<li>Interview: motivation, sports background.</li></ul>' });

  add({ type:'previous-paper', category:'previous-papers', topic:'solved-papers',
    title:'Sample Papers for Board & Entrance Exams',
    slug:'sample-papers',
    shortDescription:'How model/sample papers complement PYQs for final revision.',
    fullContent:'<p>Sample papers (model sets) help you practise new blends of questions close to the exam.</p>'+
      '<h2>Plan</h2><p>Use sample papers in the last 3–4 weeks as full mocks, then plug gaps with PYQs and notes.</p>' });

  /* ===================== 9. Online Tests ===================== */
  add({ type:'test', category:'online-tests', topic:'physical-education-mcq-test',
    title:'Physical Education Mock Test — Practice Online',
    slug:'pe-mock-test',
    shortDescription:'How to use online PE mock tests for board and teaching exams, and a preparation plan.',
    fullContent:'<p>Online mock tests give instant feedback and build exam temperament.</p>'+
      '<h2>How to Use</h2><ol><li>Attempt topic-wise tests first.</li><li>Move to full-length mocks weekly.</li>'+
      '<li>Review every wrong answer and note the concept.</li></ol>'+
      info('Consistency (20–30 mins daily) beats one long session.') });

  add({ type:'test', category:'online-tests', topic:'chapter-wise-test',
    title:'CBSE PE Online Test — Chapter-wise Practice',
    slug:'cbse-pe-online-test',
    shortDescription:'Chapter-wise CBSE Physical Education online practice tests and tips.',
    fullContent:'<p>Chapter-wise tests reinforce each unit before moving on.</p>'+
      '<h2>Suggested Order</h2><ul><li>Units 1–3 (planning, nutrition, yoga).</li>'+
      '<li>Units 4–6 (CWSN, women, test & measurement).</li><li>Units 7–9 (physiology, biomechanics, training).</li></ul>' });

  add({ type:'test', category:'online-tests', topic:'general-knowledge-test',
    title:'General Knowledge Online Test — Practice Sets',
    slug:'gk-online-test',
    shortDescription:'GK practice sets for competitive exams with a current-affairs plan.',
    fullContent:'<p>GK is broad; focus on static + current affairs.</p>'+
      '<h2>Areas</h2><ul><li>Indian polity, geography, history basics.</li>'+
      '<li>Sports, awards, appointments (current).</li><li>State (Rajasthan) specific facts for state exams.</li></ul>'+
      info('Read one reliable current-affairs source daily; don’t hoard PDFs.') });

  add({ type:'test', category:'online-tests', topic:'reet-practice-test',
    title:'Teacher Exam (REET/CTET) Mock Test Guide',
    slug:'teacher-exam-mock-test',
    shortDescription:'Mock-test strategy for REET & CTET with child-development focus.',
    fullContent:'<p>REET/CTET weigh Child Development & Pedagogy heavily along with subject content.</p>'+
      '<h2>Strategy</h2><ul><li>Strengthen CDP concepts with examples.</li>'+
      '<li>Practice pedagogy-based MCQs, not just facts.</li><li>Attempt full mocks with time limits.</li></ul>' });

  /* ===================== 10. Student News ===================== */
  add({ type:'news', category:'student-news', topic:'board-updates',
    title:'Education News 2026 — Policy, Exams & Reforms',
    slug:'education-news-2026',
    shortDescription:'Round-up of major education news: NEP updates, exam reforms and admission changes.',
    fullContent:'<p>Education policy evolves yearly. Following credible news helps students plan exams and admissions.</p>'+
      '<h2>What to Track</h2><ul><li>Exam calendar & pattern changes.</li><li>Admission & counselling schedules.</li>'+
      '<li>Scholarship openings.</li></ul>'+
      info('Rely on official board/university notifications for decisions, not rumours.') });

  add({ type:'news', category:'student-news', topic:'result-updates',
    title:'Result News — Latest Board & Competitive Results',
    slug:'result-news',
    shortDescription:'Where and how to check the latest result announcements safely.',
    fullContent:'<p>Result season brings a spike in fake sites. Always use official portals.</p>'+
      '<h2>Safe Checking</h2><ol><li>Use the official board/university result portal.</li>'+
      '<li>Keep roll number & DOB ready.</li><li>Download the marksheet; don’t trust screenshots.</li></ol>' });

  add({ type:'news', category:'student-news', topic:'admission-updates',
    title:'Admission News — UG/PG & Counselling Updates',
    slug:'admission-news',
    shortDescription:'Track UG/PG admission openings, counselling rounds and deadlines.',
    fullContent:'<p>Admission cycles move fast; missing a counselling round can cost a year.</p>'+
      '<h2>Stay Updated</h2><ul><li>Official university admission portals.</li>'+
      '<li>State counselling authorities.</li><li>Verified education news sources.</li></ul>' });

  add({ type:'news', category:'student-news', topic:'form-notifications',
    title:'Recruitment News — Latest Govt Job Notifications',
    slug:'recruitment-news',
    shortDescription:'How to track the latest government job notifications without missing last dates.',
    fullContent:'<p>Central and state portals release hundreds of notifications. A simple tracker prevents missed deadlines.</p>'+
      '<h2>Habit</h2><ul><li>Weekly check of SSC/RPSC/RRB/state portals.</li>'+
      '<li>Note application start & last dates in a calendar.</li><li>Keep scanned documents ready.</li></ul>'+
      info('Apply only via official portals; ignore paid "guaranteed job" offers.') });

  /* ===================== 11. Career After 10th/12th ===================== */
  add({ type:'article', category:'career-guidance', topic:'career-after-10th',
    title:'Career After 10th — Streams, Courses & Options',
    slug:'career-after-10th',
    shortDescription:'How to choose the right stream and courses after Class 10 with a future-focused approach.',
    fullContent:'<p>Class 10 is a foundation decision. Choose a stream based on interest, aptitude and career goals—not peer pressure.</p>'+
      '<h2>Options</h2><ul><li>Science (medical/non-medical).</li><li>Commerce.</li><li>Arts/Humanities.</li>'+
      '<li>Vocational & skill courses (ITI, polytechnic).</li></ul>'+
      '<h2>Tip</h2><p>If you like sports & health, keep Physical Education open—it leads to B.P.Ed/M.P.Ed and teaching/coaching careers.</p>'+
      info('You can pivot later, but a considered choice saves time.') });

  add({ type:'article', category:'career-guidance', topic:'career-after-12th',
    title:'Career After 12th — Best Courses & Paths',
    slug:'career-after-12th',
    shortDescription:'Explore courses after 12th: degrees, professional programmes and emerging options.',
    fullContent:'<p>After 12th, align your course with a clear career outcome.</p>'+
      '<h2>Common Paths</h2><ul><li>Degree (BA/BSc/BCom) + competitive exam prep.</li>'+
      '<li>Professional (B.P.Ed, B.P.Ed Integrated, BPEd, Nursing, Law, Design).</li>'+
      '<li>Skill/vocational diplomas.</li></ul>'+
      '<h2>For Sports Lovers</h2><p>B.P.Ed / B.Sc (PE) → M.P.Ed → PET/PTI/Coach is a strong, respected path.</p>' });

  add({ type:'article', category:'career-guidance', topic:'physical-education-career',
    title:'Physical Education Career — Scope, Jobs & Courses',
    slug:'physical-education-career',
    shortDescription:'Full scope of a Physical Education career: teaching, coaching, fitness, sports management and government jobs.',
    fullContent:'<p>Physical Education is no longer "just sports"—it spans teaching, sports science, fitness, management and public service.</p>'+
      '<h2>Career Routes</h2><ul><li>School PTI / PET (via REET/CTET + PE degree).</li>'+
      '<li>College PET / lecturer (M.P.Ed, NET).</li><li>Sports coach / academy owner.</li>'+
      '<li>Fitness trainer / sports nutrition advisor.</li><li>Sports quota government jobs.</li></ul>'+
      info('Combine a PE degree with certifications (NIS, yoga, fitness) to stand out.') });

  add({ type:'article', category:'career-guidance', topic:'teacher-career',
    title:'Teacher Career — How to Become a Teacher in India',
    slug:'teacher-career',
    shortDescription:'Step-by-step path to become a school/college teacher: eligibility tests and degrees.',
    fullContent:'<p>Teaching is stable and respected. The path depends on the level you target.</p>'+
      '<h2>Path</h2><ol><li>12th → D.El.Ed/B.El.Ed → primary (CTET/REET).</li>'+
      '<li>Graduation + B.Ed → TGT/PGT (CTET/REET/State).</li>'+
      '<li>PG + M.Ed/NET → college lecturer.</li></ol>'+
      info('A B.P.Ed/M.P.Ed plus REET/CTET opens PE teaching roles specifically.') });

  add({ type:'article', category:'career-guidance', topic:'sports-career',
    title:'Sports Career — Athlete, Coach & PE Teacher Paths',
    slug:'sports-career',
    shortDescription:'Turn a love for sports into a career: professional athlete, coach, PE teacher, sports management.',
    fullContent:'<p>Sports offers multiple professional routes beyond playing.</p>'+
      '<h2>Routes</h2><ul><li>Elite athlete (academy → state → national).</li>'+
      '<li>Certified coach (NIS / federation courses).</li><li>PE teacher (B.P.Ed/M.P.Ed + eligibility).</li>'+
      '<li>Sports management / officiating / physiotherapy.</li></ul>'+
      info('Build a verifiable achievement record early; it unlocks sports-quota and scholarship options.') });

  add({ type:'article', category:'career-guidance', topic:'best-courses-after-12th',
    title:'Best Courses After 12th — High-Value Programs & Career Outcomes',
    slug:'best-courses-after-12th',
    shortDescription:'Explore the best courses after 12th for commerce, science and arts students with strong career outcomes.',
    fullContent:'<p>Choosing the right course after 12th determines your career trajectory. Here is a curated list of high-value programs across streams.</p>'+
      '<h2>Science Stream</h2><ul><li>Engineering (B.Tech/B.E.) — CSE, Mechanical, Civil, ECE.</li>'+
      '<li>Medical (MBBS/BDS/BAMS/BHMS).</li><li>B.Sc (Physics, Chemistry, Biology, IT).</li></ul>'+
      '<h2>Commerce Stream</h2><ul><li>B.Com (Honours) — accounting, finance, taxation.</li>'+
      '<li>BBA — business administration.</li><li>CA/CS/CMA — professional certifications.</li></ul>'+
      '<h2>Arts / Humanities</h2><ul><li>BA (English, Political Science, History, Psychology).</li>'+
      '<li>BJMC — journalism and mass communication.</li><li>LLB — law.</li></ul>'+
      '<h2>For Sports Enthusiasts</h2><p>B.P.Ed, B.Sc (Physical Education), B.P.E.S and D.P.Ed are excellent choices leading to coaching, teaching and sports management careers.</p>'+
      info('Choose based on interest and aptitude, not just salary. A course you enjoy leads to better outcomes.')+
      faqHtml([{q:'Which course is best after 12th commerce?',a:'B.Com (H), BBA, CA and BMS are top picks depending on your career goal.'},{q:'Can I do B.P.Ed after 12th?',a:'B.P.Ed typically requires graduation. After 12th, consider D.P.Ed or B.P.Ed Integrated programs.'}])});

  /* ===================== 12. Sports & Physical Education ===================== */
  add({ type:'article', category:'sports-pe', topic:'physical-education-career-sp',
    title:'Physical Education Courses — UG, PG & Diploma',
    slug:'physical-education-courses',
    shortDescription:'List of PE courses: D.P.Ed, B.P.Ed, B.P.Ed Integrated, M.P.Ed, PhD and diplomas.',
    fullContent:'<p>Physical Education has a clear academic ladder.</p>'+
      '<h2>Course Ladder</h2><ul><li>D.P.Ed (diploma, after 12th).</li>'+
      '<li>B.P.Ed / B.Sc (PE) (undergraduate).</li><li>M.P.Ed (postgraduate).</li>'+
      '<li>PhD / M.Phil (research).</li></ul>'+
      info('Choose a recognised university (NCTE/UGC approved) for valid teaching eligibility.') });

  add({ type:'article', category:'sports-pe', topic:'pti-vacancy',
    title:'PTI Vacancy — Eligibility, Exam & Apply Guide',
    slug:'pti-vacancy-guide',
    shortDescription:'How PTI (Physical Training Instructor) vacancies are advertised and the eligibility required.',
    fullContent:'<p>PTI posts appear in schools, colleges and government departments. Eligibility usually needs a PE degree plus the relevant eligibility test.</p>'+
      '<h2>Where to Look</h2><ul><li>State education department / RPSC (lecturer PE).</li>'+
      '<li>KVS/NVS and central schools (CTET + B.P.Ed).</li><li>Private school career pages.</li></ul>'+
      info('Keep B.P.Ed/M.P.Ed and REET/CTET certificates updated before applying.') });

  add({ type:'article', category:'sports-pe', topic:'sports-quota-jobs',
    title:'Sports Quota in Admissions & Jobs — Rules & Proof',
    slug:'sports-quota-rules',
    shortDescription:'How sports quota works in college admissions and government jobs, with required certificates.',
    fullContent:'<p>Sports quota reserves seats/jobs for meritorious sportspersons in many institutions and departments.</p>'+
      '<h2>Proof Required</h2><ul><li>Recognized tournament certificates (district/state/national).</li>'+
      '<li>Gazette / selection proof where applicable.</li><li>Age & identity documents.</li></ul>'+
      info('Only certificates from recognized bodies count—verify the approved list beforehand.') });

  add({ type:'article', category:'sports-pe', topic:'sports-coach-jobs',
    title:'Sports Coaching Career — NIS, Diploma & Certifications',
    slug:'sports-coaching-career',
    shortDescription:'Become a certified sports coach: NIS diplomas, federation courses and career options.',
    fullContent:'<p>Coaching is a growing profession with paths in academies, schools, clubs and national teams.</p>'+
      '<h2>Certifications</h2><ul><li>NIS (Netaji Subhas National Institute of Sports) diploma.</li>'+
      '<li>State/district coaching courses.</li><li>Sport-specific federation certificates.</li></ul>'+
      '<h2>Careers</h2><p>Academy coach, school PE support, personal trainer, talent scout.</p>'+
      info('Practical experience + a recognised certificate builds credibility fastest.') });

  add({ type:'article', category:'sports-pe', topic:'fitness-training',
    title:'Fitness & Training Careers — Personal Trainer Path',
    slug:'fitness-training-career',
    shortDescription:'Build a career in fitness training: certifications, gym roles and sports fitness.',
    fullContent:'<p>Fitness is a booming sector. A PE background is a strong foundation for fitness careers.</p>'+
      '<h2>Steps</h2><ol><li>Get a recognised fitness/certification (REPS/AFHI or equivalent).</li>'+
      '<li>Gain practical hours in a gym/academy.</li><li>Specialise (strength, yoga, rehab, sports conditioning).</li></ol>'+
      info('Combine PE knowledge with client-handling skills for the best outcomes.') });

  add({ type:'news', category:'student-news', topic:'exam-date-updates',
    title:'Exam Date Updates 2026 — Board, CTET, REET, SSC & University Schedules',
    slug:'exam-date-updates-2026',
    shortDescription:'Track confirmed and expected exam dates for CBSE, RBSE, CTET, REET, SSC, RPSC and university exams in 2026.',
    fullContent:'<p>Keeping track of exam dates across multiple boards and competitive exams is critical. Missing a date can cost an entire attempt.</p>'+
      '<h2>How to Track Exam Dates</h2><ol>'+
      '<li>Bookmark official board websites (CBSE, RBSE, SSC, RPSC, UPSC).</li>'+
      '<li>Check the official notification when released — do not rely on social media rumour.</li>'+
      '<li>Note the application start date, last date, admit card release and exam day in a planner.</li></ol>'+
      '<h2>Typical Annual Calendar</h2><ul>'+
      '<li><strong>January–March:</strong> Board practicals, university semester exams.</li>'+
      '<li><strong>February–April:</strong> Board theory exams (CBSE, RBSE).</li>'+
      '<li><strong>March–June:</strong> CTET, REET, SSC exams (notification-dependent).</li>'+
      '<li><strong>May–July:</strong> Board results, counselling rounds.</li>'+
      '<li><strong>August–December:</strong> New notifications, application windows, tier-2 exams.</li></ul>'+
      info('Dates change frequently. Always confirm on the official website before making travel or fee arrangements.')+
      faqHtml([{q:'Where can I find all exam dates in one place?',a:'Check the Student News section regularly and bookmark official portals for each exam you are targeting.'},{q:'What if an exam date is postponed?',a:'Follow the official notification; admit cards are reissued with the updated date.'}]),
    publishDate:'2026-01-05', lastUpdated:'2026-08-01' });

  add({ type:'news', category:'student-news', topic:'scholarship-updates',
    title:'Scholarship Updates 2026 — NSP, Rajasthan & Central Schemes',
    slug:'scholarship-updates-2026',
    shortDescription:'Track latest scholarship openings: NSP portal dates, Rajasthan state scholarships and central sector schemes.',
    fullContent:'<p>Scholarships are a major support for students from all backgrounds. Missing a deadline means losing a year of funding.</p>'+
      '<h2>Key Scholarship Portals</h2><ul>'+
      '<li><strong>NSP (scholarships.gov.in):</strong> Central and state schemes for pre-matric, post-matric and merit students.</li>'+
      '<li><strong>Rajasthan SSO / E-Scholarship:</strong> State-specific SC/ST/OBC/minority scholarships.</li>'+
      '<li><strong>University portals:</strong> Merit, sports and need-based scholarships.</li></ul>'+
      '<h2>Application Tips</h2><ol>'+
      '<li>Start early — documents like income and caste certificates take time.</li>'+
      '<li>Upload clearly scanned copies in the required format.</li>'+
      '<li>Save the application acknowledgement and track status regularly.</li></ol>'+
      info('Apply only through official portals. Never pay anyone claiming to process your scholarship application.')+
      faqHtml([{q:'When does NSP open for fresh applications?',a:'NSP typically opens fresh applications at the start of each academic session. Check scholarships.gov.in for exact dates.'},{q:'Can I apply for multiple scholarships?',a:'Yes, but read the terms — some schemes restrict concurrent benefits. Declare all scholarships if asked.'}]),
    publishDate:'2026-01-10', lastUpdated:'2026-07-15' });

  add({ type:'test', category:'online-tests', topic:'chapter-wise-test',
    title:'Chapter-wise Physical Education Test — Practice by Unit',
    slug:'chapter-wise-pe-test',
    shortDescription:'Take chapter-wise PE tests for Class 11 & 12 — one unit at a time for focused revision.',
    fullContent:'<p>Chapter-wise testing lets you master each unit before moving on. It prevents the common mistake of revising everything at once without depth.</p>'+
      '<h2>How to Use Chapter-wise Tests</h2><ol>'+
      '<li>Revise one unit from NCERT or your notes.</li>'+
      '<li>Take the corresponding chapter test within 24 hours.</li>'+
      '<li>Review every wrong answer — note the concept and re-read it.</li>'+
      '<li>Re-test the same chapter after 7 days to confirm retention.</li></ol>'+
      '<h2>Suggested Order (CBSE Class 12)</h2><ul>'+
      '<li>Unit 1: Planning in Sports.</li><li>Unit 2: Sports & Nutrition.</li>'+
      '<li>Unit 3: Yoga.</li><li>Unit 4: CWSN.</li><li>Unit 5: Children & Women in Sports.</li>'+
      '<li>Unit 6: Test & Measurement.</li><li>Unit 7: Physiology & Injuries.</li>'+
      '<li>Unit 8: Biomechanics.</li><li>Unit 9: Psychology & Training.</li></ul>'+
      info('Score 70%+ on a chapter before moving to the next one.')+
      faqHtml([{q:'How many questions are in each chapter test?',a:'Typically 15–25 MCQs per chapter, designed to cover all key concepts.'}]),
    publishDate:'2026-02-01', lastUpdated:'2026-06-01' });

  add({ type:'previous-paper', category:'previous-papers', topic:'rbse-previous-papers',
    title:'RBSE Previous Year Papers — Class 10 & 12 (All Subjects)',
    slug:'rbse-previous-papers',
    shortDescription:'Download and practise RBSE previous year question papers for Class 10 and 12 with marking scheme analysis.',
    fullContent:'<p>Rajasthan Board (RBSE) previous year papers are the best indicator of exam difficulty and question patterns.</p>'+
      '<h2>Why Practise RBSE PYQs</h2><ul>'+
      '<li>Understand the exact pattern RBSE follows each year.</li>'+
      '<li>Identify frequently repeated questions and important topics.</li>'+
      '<li>Build time management skills for the actual exam.</li></ul>'+
      '<h2>How to Use</h2><ol>'+
      '<li>Download the paper for your subject and year.</li>'+
      '<li>Set a timer for the exam duration and solve it.</li>'+
      '<li>Check answers against the official marking scheme or solved guide.</li>'+
      '<li>Note your weak topics and revise them before the next paper.</li></ol>'+
      info('Start with the last 3 years of papers; RBSE patterns are fairly consistent year to year.')+
      faqHtml([{q:'Where can I find official RBSE papers?',a:' rajeduboard.rajasthan.gov.in publishes some papers. Solved collections are available from education publishers.'}]),
    publishDate:'2026-01-15', lastUpdated:'2026-05-01' });

  add({ type:'news', category:'student-news', topic:'university-updates',
    title:'University Updates 2026 — Admission, Exam & Result News',
    slug:'university-updates-2026',
    shortDescription:'Stay informed about university admission dates, exam schedules, results and counselling for UG and PG programmes.',
    fullContent:'<p>Universities across India update their schedules frequently. Keeping track helps you avoid missed admissions and exam deadlines.</p>'+
      '<h2>What to Monitor</h2><ul>'+
      '<li><strong>Admission:</strong> Application forms, entrance exams, merit lists and counselling rounds.</li>'+
      '<li><strong>Exams:</strong> Semester and annual exam timetables, admit cards and centre allotments.</li>'+
      '<li><strong>Results:</strong> Declaration dates, revaluation windows and migration certificates.</li></ul>'+
      '<h2>Key University Portals</h2><ul>'+
      '<li>University of Rajasthan (uniraj.ac.in).</li>'+
      '<li>Maharshi Dayanand Saraswati University (mdsu.ac.in).</li>'+
      '<li>Deen Dayal Upadhyaya Gorakhpur University, Kalyani University and other state universities.</li>'+
      '<li>Central universities: DU, JNU, BHU, AMU admission portals.</li></ul>'+
      info('Always verify dates on the university website. Third-party sites may carry outdated information.')+
      faqHtml([{q:'How do I check my university result?',a:'Visit your university website, go to the results section and enter your roll number.'}]),
    publishDate:'2026-01-20', lastUpdated:'2026-08-01' });

  // ---- Admin importer (uses existing PortalData; admin-only by page guard) ----
  async function seedPortalContent() {
    if (!window.PortalData) { alert('Portal data layer not loaded.'); return 0; }
    var created = 0, skipped = 0;
    for (var i = 0; i < S.length; i++) {
      var item = S[i];
      try {
        var existing = await PortalData.getBySlug(item.slug);
        if (existing) { skipped++; continue; }
        var copy = {};
        Object.keys(item).forEach(function (k) { copy[k] = item[k]; });
        await PortalData.createContent(copy);
        created++;
      } catch (e) { console.error('Seed error for', item.slug, e); }
    }
    return { created: created, skipped: skipped, total: S.length };
  }

  root.PORTAL_SEED = S;
  root.seedPortalContent = seedPortalContent;
})(window);
