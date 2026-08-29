/* ============================================================================
   STUDENT INFORMATION PORTAL — TAXONOMY CATALOG
   ----------------------------------------------------------------------------
   Static definition of the 12 main categories and their related topics
   (LEVEL 1 = category, LEVEL 2 = topic). Content items (LEVEL 3) are stored in
   Firestore and assigned to a category + topic via the Admin Content Manager.

   This catalog is the single source of truth for the navigation structure.
   It is intentionally static (matches the verified spec topic lists) so the
   category/topic hierarchy never breaks. New posts are added under these
   topics from the Admin panel — no HTML editing required.

   Loaded by: student-portal.html, portal-category.html, portal-topic.html,
   portal-content.html, portal-search.html, admin-content.html
   Requires: firebase-init.js is NOT required for this catalog file.
   ============================================================================ */
(function (root) {
  'use strict';

  var SITE = 'https://physicaleducationcareer.in';

  var CATEGORIES = [
    {
      id: 'cbse-rbse',
      name: 'CBSE / RBSE',
      icon: '📘',
      desc: 'CBSE & RBSE results, date sheets, syllabus, sample papers, admit cards and board exam updates.',
      topics: [
        { id: 'cbse-results', name: 'CBSE Results' },
        { id: 'rbse-results', name: 'RBSE Results' },
        { id: 'class-10-result', name: 'Class 10 Result' },
        { id: 'class-12-result', name: 'Class 12 Result' },
        { id: 'result-date', name: 'Result Date' },
        { id: 'marksheet-digilocker', name: 'Marksheet / DigiLocker' },
        { id: 'revaluation-result', name: 'Revaluation Result' },
        { id: 'supplementary-result', name: 'Supplementary Result' },
        { id: 'compartment-result', name: 'Compartment Result' },
        { id: 'cbse-date-sheet', name: 'CBSE Date Sheet' },
        { id: 'rbse-time-table', name: 'RBSE Time Table' },
        { id: 'syllabus', name: 'Syllabus' },
        { id: 'sample-papers', name: 'Sample Papers' },
        { id: 'important-questions', name: 'Important Questions' },
        { id: 'board-exam-updates', name: 'Board Exam Updates' }
      ]
    },
    {
      id: 'admit-card',
      name: 'Admit Card',
      icon: '🎫',
      desc: 'Download admit cards for CBSE, RBSE, SSC, Railway, RPSC, RSSB, Police, CTET and university exams.',
      topics: [
        { id: 'cbse-admit-card', name: 'CBSE Admit Card' },
        { id: 'rbse-admit-card', name: 'RBSE Admit Card' },
        { id: 'ssc-admit-card', name: 'SSC Admit Card' },
        { id: 'railway-admit-card', name: 'Railway Admit Card' },
        { id: 'rpsc-admit-card', name: 'RPSC Admit Card' },
        { id: 'rssb-admit-card', name: 'RSSB/RSMSSB Admit Card' },
        { id: 'police-admit-card', name: 'Police Admit Card' },
        { id: 'teacher-exam-admit-card', name: 'Teacher Exam Admit Card' },
        { id: 'ctet-admit-card', name: 'CTET Admit Card' },
        { id: 'university-exam-admit-card', name: 'University Exam Admit Card' },
        { id: 'entrance-exam-admit-card', name: 'Entrance Exam Admit Card' }
      ]
    },
    {
      id: 'govt-jobs',
      name: 'Government Jobs',
      icon: '🏛️',
      desc: 'Latest government vacancies — central, Rajasthan, teacher, PTI/PET, sports, police, railway, SSC, UPSC, defence, bank and apprenticeship.',
      topics: [
        { id: 'latest-govt-jobs', name: 'Latest Government Jobs' },
        { id: 'rajasthan-govt-jobs', name: 'Rajasthan Government Jobs' },
        { id: 'central-govt-jobs', name: 'Central Government Jobs' },
        { id: '10th-pass-jobs', name: '10th Pass Jobs' },
        { id: '12th-pass-jobs', name: '12th Pass Jobs' },
        { id: 'graduate-jobs', name: 'Graduate Jobs' },
        { id: 'teacher-govt-jobs', name: 'Teacher Government Jobs' },
        { id: 'pti-pet-jobs', name: 'PTI/PET Jobs' },
        { id: 'sports-govt-jobs', name: 'Sports Government Jobs' },
        { id: 'police-jobs', name: 'Police Jobs' },
        { id: 'railway-jobs', name: 'Railway Jobs' },
        { id: 'ssc-jobs', name: 'SSC Jobs' },
        { id: 'upsc-jobs', name: 'UPSC Jobs' },
        { id: 'defence-jobs', name: 'Defence Jobs' },
        { id: 'bank-jobs', name: 'Bank Jobs' },
        { id: 'apprenticeship-jobs', name: 'Apprenticeship Jobs' }
      ]
    },
    {
      id: 'teacher-jobs',
      name: 'Teacher & Education Jobs',
      icon: '👩‍🏫',
      desc: 'PRT, TGT, PGT, PTI, PET, physical education teacher jobs, B.Ed/B.P.Ed/M.P.Ed vacancies, CTET, REET and state TET.',
      topics: [
        { id: 'prt-jobs', name: 'PRT Jobs' },
        { id: 'tgt-jobs', name: 'TGT Jobs' },
        { id: 'pgt-jobs', name: 'PGT Jobs' },
        { id: 'pti-jobs', name: 'PTI Jobs' },
        { id: 'pet-jobs', name: 'PET Jobs' },
        { id: 'physical-education-teacher-jobs', name: 'Physical Education Teacher Jobs' },
        { id: 'school-lecturer-jobs', name: 'School Lecturer Jobs' },
        { id: 'bed-jobs', name: 'B.Ed Jobs' },
        { id: 'bped-jobs', name: 'B.P.Ed Jobs' },
        { id: 'mped-jobs', name: 'M.P.Ed Jobs' },
        { id: 'ctet', name: 'CTET' },
        { id: 'reet', name: 'REET' },
        { id: 'state-tet', name: 'State TET' },
        { id: 'teacher-vacancy', name: 'Teacher Vacancy' },
        { id: 'teacher-eligibility', name: 'Teacher Eligibility' },
        { id: 'teacher-salary', name: 'Teacher Salary' }
      ]
    },
    {
      id: 'college-admissions',
      name: 'College & University Admissions',
      icon: '🎓',
      desc: 'B.P.Ed, M.P.Ed, B.P.E.S, D.P.Ed, B.A, B.Sc, B.Com, BCA, MBA admissions, entrance exams, counselling, merit list and cut off.',
      topics: [
        { id: 'college-admission-2026', name: 'College Admission 2026' },
        { id: 'university-admission-2026', name: 'University Admission 2026' },
        { id: 'bped-admission', name: 'B.P.Ed Admission' },
        { id: 'mped-admission', name: 'M.P.Ed Admission' },
        { id: 'bpes-admission', name: 'B.P.E.S Admission' },
        { id: 'dped-admission', name: 'D.P.Ed Admission' },
        { id: 'ba-admission', name: 'B.A. Admission' },
        { id: 'bsc-admission', name: 'B.Sc. Admission' },
        { id: 'bcom-admission', name: 'B.Com Admission' },
        { id: 'bca-admission', name: 'BCA Admission' },
        { id: 'mba-admission', name: 'MBA Admission' },
        { id: 'entrance-exams', name: 'Entrance Exams' },
        { id: 'admission-form', name: 'Admission Form' },
        { id: 'counselling', name: 'Counselling' },
        { id: 'merit-list', name: 'Merit List' },
        { id: 'cut-off', name: 'Cut Off' },
        { id: 'college-fees', name: 'College Fees' },
        { id: 'eligibility', name: 'Eligibility' }
      ]
    },
    {
      id: 'scholarships',
      name: 'Scholarships',
      icon: '🏅',
      desc: 'Government, Rajasthan, central sector, post-matric, pre-matric, SC/ST/OBC, minority, college scholarships and NSP.',
      topics: [
        { id: 'government-scholarships', name: 'Government Scholarships' },
        { id: 'rajasthan-scholarships', name: 'Rajasthan Scholarships' },
        { id: 'central-sector-scholarship', name: 'Central Sector Scholarship' },
        { id: 'post-matric-scholarship', name: 'Post-Matric Scholarship' },
        { id: 'pre-matric-scholarship', name: 'Pre-Matric Scholarship' },
        { id: 'sc-st-obc-scholarships', name: 'SC/ST/OBC Scholarships' },
        { id: 'minority-scholarships', name: 'Minority Scholarships' },
        { id: 'college-scholarships', name: 'College Scholarships' },
        { id: 'scholarship-form', name: 'Scholarship Form' },
        { id: 'scholarship-status', name: 'Scholarship Status' },
        { id: 'scholarship-renewal', name: 'Scholarship Renewal' },
        { id: 'nsp-scholarship', name: 'NSP Scholarship' }
      ]
    },
    {
      id: 'study-material',
      name: 'Study Material',
      icon: '📚',
      desc: 'Class 10 & 12 notes, physical education notes, important questions, MCQs, one-liners, chapter-wise questions and revision notes.',
      topics: [
        { id: 'class-10-notes', name: 'Class 10 Notes' },
        { id: 'class-12-notes', name: 'Class 12 Notes' },
        { id: 'physical-education-notes', name: 'Physical Education Notes' },
        { id: 'cbse-pe-notes', name: 'CBSE PE Notes' },
        { id: 'rbse-pe-notes', name: 'RBSE PE Notes' },
        { id: 'important-questions-sm', name: 'Important Questions' },
        { id: 'mcq', name: 'MCQ' },
        { id: 'one-liner-questions', name: 'One-Liner Questions' },
        { id: 'chapter-wise-questions', name: 'Chapter-wise Questions' },
        { id: 'revision-notes', name: 'Revision Notes' },
        { id: 'exam-preparation', name: 'Exam Preparation' },
        { id: 'study-timetable', name: 'Study Timetable' },
        { id: 'last-minute-preparation', name: 'Last-Minute Preparation' }
      ]
    },
    {
      id: 'previous-papers',
      name: 'Previous Year Papers',
      icon: '🗂️',
      desc: 'CBSE, RBSE, physical education, PTI, REET, CTET, SSC, RPSC, RSSB solved papers with answer keys and downloads.',
      topics: [
        { id: 'cbse-previous-papers', name: 'CBSE Previous Papers' },
        { id: 'rbse-previous-papers', name: 'RBSE Previous Papers' },
        { id: 'physical-education-previous-papers', name: 'Physical Education Previous Papers' },
        { id: 'pti-previous-papers', name: 'PTI Previous Papers' },
        { id: 'reet-previous-papers', name: 'REET Previous Papers' },
        { id: 'ctet-previous-papers', name: 'CTET Previous Papers' },
        { id: 'ssc-previous-papers', name: 'SSC Previous Papers' },
        { id: 'rpsc-previous-papers', name: 'RPSC Previous Papers' },
        { id: 'rssb-previous-papers', name: 'RSSB Previous Papers' },
        { id: 'solved-papers', name: 'Solved Papers' },
        { id: 'answer-keys', name: 'Answer Keys' }
      ]
    },
    {
      id: 'online-tests',
      name: 'Online Tests',
      icon: '🧪',
      desc: 'Class 10/12 PE mock tests, chapter-wise tests, PTI/PET, REET, CTET, SSC practice tests, GK, current affairs and daily quizzes.',
      topics: [
        { id: 'class-10-pe-mock-test', name: 'Class 10 PE Mock Test' },
        { id: 'class-12-pe-mock-test', name: 'Class 12 PE Mock Test' },
        { id: 'physical-education-mcq-test', name: 'Physical Education MCQ Test' },
        { id: 'chapter-wise-test', name: 'Chapter-wise Test' },
        { id: 'full-mock-test', name: 'Full Mock Test' },
        { id: 'pti-mock-test', name: 'PTI Mock Test' },
        { id: 'pet-mock-test', name: 'PET Mock Test' },
        { id: 'reet-practice-test', name: 'REET Practice Test' },
        { id: 'ctet-practice-test', name: 'CTET Practice Test' },
        { id: 'ssc-practice-test', name: 'SSC Practice Test' },
        { id: 'general-knowledge-test', name: 'General Knowledge Test' },
        { id: 'current-affairs-quiz', name: 'Current Affairs Quiz' },
        { id: 'daily-quiz', name: 'Daily Quiz' },
        { id: 'live-test', name: 'Live Test' }
      ]
    },
    {
      id: 'student-news',
      name: 'Student News / Education Updates',
      icon: '📰',
      desc: 'Exam dates, result, admit card, form, answer key, cut off, merit list, counselling, admission, scholarship and board updates.',
      topics: [
        { id: 'exam-date-updates', name: 'Exam Date Updates' },
        { id: 'result-updates', name: 'Result Updates' },
        { id: 'admit-card-updates', name: 'Admit Card Updates' },
        { id: 'form-notifications', name: 'Form Notifications' },
        { id: 'answer-key-news', name: 'Answer Key' },
        { id: 'cut-off-news', name: 'Cut Off' },
        { id: 'merit-list-news', name: 'Merit List' },
        { id: 'counselling-updates', name: 'Counselling Updates' },
        { id: 'admission-updates', name: 'Admission Updates' },
        { id: 'scholarship-updates', name: 'Scholarship Updates' },
        { id: 'board-updates', name: 'Board Updates' },
        { id: 'university-updates', name: 'University Updates' }
      ]
    },
    {
      id: 'career-guidance',
      name: 'Career After 10th / 12th',
      icon: '🧭',
      desc: 'Career options after 10th & 12th, government & sports careers, B.P.Ed/M.P.Ed, teacher career, best & high-demand courses.',
      topics: [
        { id: 'career-after-10th', name: 'Career After 10th' },
        { id: 'career-after-12th', name: 'Career After 12th' },
        { id: 'government-career-options', name: 'Government Career Options' },
        { id: 'sports-career', name: 'Sports Career' },
        { id: 'physical-education-career', name: 'Physical Education Career' },
        { id: 'bped-career', name: 'B.P.Ed Career' },
        { id: 'mped-career', name: 'M.P.Ed Career' },
        { id: 'teacher-career', name: 'Teacher Career' },
        { id: 'best-courses-after-12th', name: 'Best Courses After 12th' },
        { id: 'high-demand-courses', name: 'High-Demand Courses' },
        { id: 'career-without-maths', name: 'Career Without Maths' },
        { id: 'career-without-science', name: 'Career Without Science' },
        { id: 'diploma-courses', name: 'Diploma Courses' },
        { id: 'skill-courses', name: 'Skill Courses' }
      ]
    },
    {
      id: 'sports-pe',
      name: 'Sports & Physical Education',
      icon: '⚽',
      desc: 'Physical education & sports careers, sports quota & government jobs, PTI/PET vacancies, coach jobs, sports colleges and PE MCQs.',
      topics: [
        { id: 'physical-education-career-sp', name: 'Physical Education Career' },
        { id: 'sports-career-sp', name: 'Sports Career' },
        { id: 'sports-quota-jobs', name: 'Sports Quota Jobs' },
        { id: 'government-sports-jobs', name: 'Government Sports Jobs' },
        { id: 'pti-vacancy', name: 'PTI Vacancy' },
        { id: 'pet-vacancy', name: 'PET Vacancy' },
        { id: 'physical-education-teacher-vacancy', name: 'Physical Education Teacher Vacancy' },
        { id: 'sports-coach-jobs', name: 'Sports Coach Jobs' },
        { id: 'sports-scholarships', name: 'Sports Scholarships' },
        { id: 'sports-colleges', name: 'Sports Colleges' },
        { id: 'bped-colleges', name: 'B.P.Ed Colleges' },
        { id: 'mped-colleges', name: 'M.P.Ed Colleges' },
        { id: 'sports-certificates', name: 'Sports Certificates' },
        { id: 'physical-education-syllabus', name: 'Physical Education Syllabus' },
        { id: 'physical-education-mcqs', name: 'Physical Education MCQs' },
        { id: 'sports-gk', name: 'Sports GK' },
        { id: 'fitness-training', name: 'Fitness & Training' }
      ]
    }
  ];

  var CONTENT_TYPES = [
    { id: 'article', label: 'Article', icon: '📝' },
    { id: 'govt-job', label: 'Government Job', icon: '🏛️' },
    { id: 'result', label: 'Result', icon: '📊' },
    { id: 'admit-card', label: 'Admit Card', icon: '🎫' },
    { id: 'admission', label: 'Admission', icon: '🎓' },
    { id: 'scholarship', label: 'Scholarship', icon: '🏅' },
    { id: 'study-material', label: 'Study Material', icon: '📚' },
    { id: 'previous-paper', label: 'Previous Paper', icon: '🗂️' },
    { id: 'form', label: 'Online Form', icon: '📝' },
    { id: 'test', label: 'Test', icon: '🧪' },
    { id: 'news', label: 'News/Update', icon: '📰' }
  ];

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function getCategory(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i];
    }
    return null;
  }
  function getCategoryName(id) {
    var c = getCategory(id);
    return c ? c.name : id;
  }
  function getTopic(id, topicId) {
    var c = getCategory(id);
    if (!c) return null;
    for (var i = 0; i < c.topics.length; i++) {
      if (c.topics[i].id === topicId) return c.topics[i];
    }
    return null;
  }
  function getTopicName(id, topicId) {
    var t = getTopic(id, topicId);
    return t ? t.name : topicId;
  }
  function getContentTypeLabel(type) {
    for (var i = 0; i < CONTENT_TYPES.length; i++) {
      if (CONTENT_TYPES[i].id === type) return CONTENT_TYPES[i].label;
    }
    return type;
  }
  function getContentTypeIcon(type) {
    for (var i = 0; i < CONTENT_TYPES.length; i++) {
      if (CONTENT_TYPES[i].id === type) return CONTENT_TYPES[i].icon;
    }
    return '📄';
  }

  function categoryUrl(id) {
    return SITE + '/portal-category.html?cat=' + encodeURIComponent(id);
  }
  function topicUrl(id, topicId) {
    return SITE + '/portal-topic.html?cat=' + encodeURIComponent(id) + '&topic=' + encodeURIComponent(topicId);
  }
  function contentUrl(slug) {
    return SITE + '/portal-content.html?slug=' + encodeURIComponent(slug);
  }

  root.PORTAL_CATALOG = {
    SITE: SITE,
    CATEGORIES: CATEGORIES,
    CONTENT_TYPES: CONTENT_TYPES,
    slugify: slugify,
    getCategory: getCategory,
    getCategoryName: getCategoryName,
    getTopic: getTopic,
    getTopicName: getTopicName,
    getContentTypeLabel: getContentTypeLabel,
    getContentTypeIcon: getContentTypeIcon,
    categoryUrl: categoryUrl,
    topicUrl: topicUrl,
    contentUrl: contentUrl
  };
})(window);
