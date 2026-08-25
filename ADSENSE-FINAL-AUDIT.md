# AdSense re-audit (after B-page fixes)

**Date:** 25 August 2026 (local files; not committed).

**This document does not claim AdSense approval.**

Indexable URLs are unchanged from the previous pass (**76** in `sitemap.xml`). Quality grades below are for a human visitor.

| Grade | Count |
|--------|--------|
| **A** | **71** |
| **B** | **5** |
| **C** (indexable) | **0** |

Previous pass: 45 A / 31 B / 0 C.

The 31 former B pages were rewritten as course checklists, university-specific visit notes, honest download/paper hubs, PET/PTI process pages, or thicker category introductions. A pages from the first audit were not rewritten.

### Remaining B pages (why they stay B)

1. **`/mped-admission-2026.html`** — Body is a usable M.P.Ed process guide, but the **filename and URL still say 2026**, which can look like a dated admission cycle even though the text tells readers to use the current prospectus.
2. **`/rajasthan-pti-bharti-2027.html`** — Body is official-notice-only and practical, but the **URL still contains 2027 / “bharti”**, which can look like a vacancy announcement.
3. **`/resources/mcqs/`** — Useful method plus one trap example, still mainly a **short gateway** to tests and unit pages rather than a full MCQ bank.
4. **`/resources/sports-rules/`** — Clear school-vs-federation distinction, still a **short category intro**; depth lives on `school-sports-event-formats.html`.
5. **`/resources/tournament-management/`** — Committees note plus links, still a **short hub**; depth lives on `school-tournament-checklist.html`.

There are **no remaining indexable C pages** (placeholder, coming-soon locker, or generic template with only a name swap). Leftover thin pages stay `noindex` as in the first audit.

Renaming the two dated URLs would need redirects so old links do not 404; that was not done in this pass.

---

# AdSense final readiness audit (first pass)

**Live check:** `https://physicaleducationcareer.in/about.html` is publicly serving the About page (title and H1 match the repository). GitHub Pages had already deployed the previous commit. **This audit’s extra noindex/sitemap edits are local only and have not been committed or pushed.**

**This document does not claim AdSense approval.**

Method: every HTML file in the repository was classified. Indexability = `robots` meta + `robots.txt`. Quality is judged for a human visitor, not word count.

---

## Actions taken in this pass (not pushed)

| Action | Pages |
|--------|--------|
| `noindex` + `robots.txt` Disallow | `top-universities.html`, `yoga-day-quiz.html`, `success-stories.html`, `bped-admission-2026.html` (canonical → `bped.html`), `class10-papers.html`, `old-pyq.html`, `mewar-university.html`, `opjs-university.html`, `madhav-university.html`, `physical-education-career-scope.html`, `certificate-verify.html`, `tournament-verify.html` |
| Student tools `noindex` | plus register, dashboard, forgot, details, practice-tests, live-tests, profile |
| Removed false **COMING SOON** badges | `cbse-papers.html` (Class 10/11 labelled Archive) |
| H1 / title / description aligned with verified-only stance | `rajasthan-pti-bharti-2027.html` |
| Sitemap | Removed the noindexed URLs above |
| Legal pages | Explicit `index,follow` on Privacy and Terms |

Tournament, Firebase and fixture/certificate JS were not changed (HTML robots/canonical only).

---

## Table (publisher content URLs)

URL | INDEX/NOINDEX | CONTENT QUALITY | ORIGINALITY | USER VALUE | PROBLEM | ACTION
--- | --- | --- | --- | --- | --- | ---
`/` | INDEX | A | High | High | Home is also a lead form | Keep
`/about.html` | INDEX | A | High | High | — | Keep
`/editorial-policy.html` | INDEX | A | High | High | — | Keep
`/contact.html` | INDEX | A | High | High | Repeated “what we can help with” | Keep
`/privacy-policy.html` | INDEX | A | High | High | Needed for ads | Keep
`/terms.html` | INDEX | A | High | High | — | Keep
`/disclaimer.html` | INDEX | A | High | High | Overlaps editorial slightly | Keep
`/resources/` | INDEX | A | High | High | Hub | Keep
`/resources/cbse/` | INDEX | B | Medium | High | Directory + study method | Keep as hub
`/resources/practical/` | INDEX | B | Medium | High | Hub | Keep
`/resources/practical/cbse-pe-practical-file.html` | INDEX | A | High | High | — | Keep
`/resources/practical/viva-preparation.html` | INDEX | A | High | High | — | Keep
`/resources/mcqs/` | INDEX | B | Medium | Medium | Short how-to | Keep as hub
`/resources/previous-papers/` | INDEX | B | Medium | Medium | Short how-to | Keep as hub
`/resources/entrance-preparation/` | INDEX | B | Medium | High | Hub | Keep
`/resources/entrance-preparation/bped-physical-fitness-test.html` | INDEX | A | High | High | — | Keep
`/resources/pet-preparation/` | INDEX | B | Medium | High | Hub | Keep
`/resources/pet-preparation/pti-physical-and-written.html` | INDEX | A | High | High | — | Keep
`/resources/sports-rules/` | INDEX | B | Medium | Medium | Thin intro | Keep as hub
`/resources/sports-rules/school-sports-event-formats.html` | INDEX | A | High | High | — | Keep
`/resources/tournament-management/` | INDEX | B | Medium | Medium | Hub | Keep
`/resources/tournament-management/school-tournament-checklist.html` | INDEX | A | High | High | — | Keep
`/pe-lesson-planning.html` | INDEX | A | High | High | — | Keep
`/sports-injury-prevention-pe.html` | INDEX | A | High | High | — | Keep
`/pe-teacher-interview-questions.html` | INDEX | A | High | High | — | Keep
`/fitness-assessment-in-schools.html` | INDEX | A | High | High | — | Keep
`/taekwondo-coaching-for-schools.html` | INDEX | A | High | High | — | Keep
`/admissions.html` | INDEX | B | Medium | Medium | Sales landing; NCTE not proven per college | Keep
`/bped.html` | INDEX | B | Medium | High | Generic Hindi opening + useful English add-on | Keep
`/bpes.html` | INDEX | B | Medium | Medium | Generic course copy | Keep
`/dped.html` | INDEX | B | Medium | Medium | Generic + unofficial salary | Keep
`/mped-admission-2026.html` | INDEX | B | Medium | Medium | Year in URL; unofficial salary | Keep
`/phd.html` | INDEX | A | High | High | Short stub then real extra | Keep
`/cbse.html` | INDEX | A | Medium | High | Unit hub | Keep
`/board-preparation.html` | INDEX | A | High | High | — | Keep
`/exam-strategy.html` | INDEX | A | High | High | — | Keep
`/cbse-papers.html` | INDEX | B | Medium | Medium | Was “Coming soon”; now Archive + how-to | Keep
`/class11-papers.html` | INDEX | B | Low–Med | Medium | Download-style | Keep
`/class12-papers.html` | INDEX | B | Low–Med | Medium | Download hub | Keep
`/class12-pyq.html` | INDEX | A | High | High | — | Keep
`/bped-sem2.html` | INDEX | B | Medium | Medium | Two PDFs + usage notes | Keep
`/downloads.html` | INDEX | B | Medium | Medium | File list | Keep
`/class11-unit1.html`–`/class11-unit10.html` | INDEX | A | High | High | Some career filler in U1/U10 | Keep
`/class12-unit1.html` | INDEX | B | High | High | PDF-first, then notes + MCQs | Keep
`/class12-unit2.html`–`/class12-unit10.html` | INDEX | A | High | High | Notes + MCQs | Keep
`/pet-career.html` | INDEX | B | Medium | Medium | Unofficial salary | Keep
`/govt-pti.html` | INDEX | B | Medium | Medium | Unofficial salary | Keep
`/rajasthan-pti-bharti-2027.html` | INDEX | B | Medium | Medium | Filename still “2027”; body official-only | Keep
`/rajasthan-universities.html` | INDEX | B | Medium | High | Directory | Keep
`/university-of-rajasthan.html` | INDEX | A | High | High | Specific department notes | Keep
`/nims-university.html` | INDEX | B | Medium | Medium | Still template-like | Keep
`/jjt-university.html` | INDEX | B | Medium | Medium | Citation leftovers; fees flagged | Keep
`/lords-university.html` | INDEX | B | Medium | Medium | Template reduced | Keep
`/tantia-university.html` | INDEX | B | Medium | Medium | Fees removed | Keep
`/bhupal-nobles-university.html` | INDEX | B | Medium | Medium | Fees removed | Keep
`/singhania-university.html` | INDEX | B | Medium | Medium | Fees removed | Keep
`/jai-thakur.html` | INDEX | B | Medium | High | Thin profile | Keep
`/cbse-tournament.html` | INDEX | B | Medium | Medium | Dates need CBSE circular | Keep
`/tournament.html` | INDEX | A | High | High | Live event portal | Keep

### Noindex (C or app — not in indexable total)

URL | INDEX/NOINDEX | Grade | PROBLEM
--- | --- | --- | ---
`/top-universities.html` | NOINDEX | C | Invented “top” ranking and fee bands
`/yoga-day-quiz.html` | NOINDEX | C | Event form, not an article
`/success-stories.html` | NOINDEX | C | Thin after removing unverifiable quotes
`/bped-admission-2026.html` | NOINDEX | C | Duplicate of `bped.html`
`/class10-papers.html` | NOINDEX | C | Almost empty
`/old-pyq.html` | NOINDEX | C | Thin link list
`/mewar-university.html` | NOINDEX | C | Template university page
`/opjs-university.html` | NOINDEX | C | Template university page
`/madhav-university.html` | NOINDEX | C | Template + leftover citation strings
`/physical-education-career-scope.html` | NOINDEX | C | Generic + unverified salaries
`/kurukshetra-university.html` | NOINDEX | C | Stub
`/coming-soon.html` | NOINDEX | C | Placeholder
`/Ready.admission.html` | NOINDEX | C | Duplicate admissions
Admin, student, tests, certificates, draw preview | NOINDEX | — | Application UI
`/404.html` | NOINDEX | — | Error page
`googlee24decdc4d4a6ce9.html` | verification | — | Search Console file

---

## Remaining risks

- B university pages still share a similar layout.
- Paper download pages are useful only if the PDFs work.
- `rajasthan-pti-bharti-2027.html` filename still implies a 2027 exam.
- AdSense can still reject for reasons other than these pages (history, ads.txt, navigation, policy).

---

## Counts (indexable after this pass)

**TOTAL INDEXABLE PAGES: 76**

**A PAGES: 45**

**B PAGES: 31**

**C PAGES (still indexable): 0**

### All B pages (indexable)

- `/admissions.html`
- `/bped.html`
- `/bpes.html`
- `/dped.html`
- `/mped-admission-2026.html`
- `/cbse-papers.html`
- `/class11-papers.html`
- `/class12-papers.html`
- `/bped-sem2.html`
- `/downloads.html`
- `/class12-unit1.html`
- `/pet-career.html`
- `/govt-pti.html`
- `/rajasthan-pti-bharti-2027.html`
- `/rajasthan-universities.html`
- `/nims-university.html`
- `/jjt-university.html`
- `/lords-university.html`
- `/tantia-university.html`
- `/bhupal-nobles-university.html`
- `/singhania-university.html`
- `/jai-thakur.html`
- `/cbse-tournament.html`
- `/resources/cbse/`
- `/resources/practical/`
- `/resources/mcqs/`
- `/resources/previous-papers/`
- `/resources/entrance-preparation/`
- `/resources/pet-preparation/`
- `/resources/sports-rules/`
- `/resources/tournament-management/`

### All C pages (noindexed, still on disk)

- `/top-universities.html`
- `/yoga-day-quiz.html`
- `/success-stories.html`
- `/bped-admission-2026.html`
- `/class10-papers.html`
- `/old-pyq.html`
- `/mewar-university.html`
- `/opjs-university.html`
- `/madhav-university.html`
- `/physical-education-career-scope.html`
- `/kurukshetra-university.html`
- `/coming-soon.html`
- `/Ready.admission.html`
