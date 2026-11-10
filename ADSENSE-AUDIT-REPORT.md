# AdSense quality audit report

**Site:** physicaleducationcareer.in  
**Stack:** Static HTML/CSS/JS, GitHub Pages (CNAME), Firebase for student tests and tournament tools. No npm build.  
**Date:** 25 August 2026  
**This report does not claim AdSense approval.**

## 1. Original problem

Google AdSense rejection: **Low value content** / site not yet meeting publisher-network criteria.

Audit of the live repository found:

- **Broken trust URL:** `about.html` was linked from the footer and listed in the sitemap but **did not exist** (404).
- **Crawlable low-value / private URLs:** `robots.txt` allowed everything. Admin, student dashboards, test engines, coming-soon and duplicate admission HTML could be indexed.
- **Sitemap included chapter tests** (`class11-ch1-test.html`, etc.) as if they were articles.
- **University pages** used similar templates, **unverified fee ranges**, generic facility lists, and leftover ChatGPT-style `[oai_citation…]` markup.
- **Thin pages:** `class12-unit1.html` was largely a PDF link plus notes; `bped-sem2.html` was a two-link dump; `coming-soon.html` / `kurukshetra-university.html` were placeholders (already noindex).
- **Unverifiable social proof** on success-stories (named quotes, “thousands of students”).
- **PTI 2027 page** treated social-media rumours as news and cited Instagram/private portals.
- **Footer** linked the **admin portal** to every homepage visitor and used dead `#` social links.

Tournament, Firebase, certificates and ID-card scripts were **not rewritten**.

## 2. Thin pages found

| Page | Issue | Action |
|------|--------|--------|
| about.html | Missing | Created |
| class12-unit1 / unit2 | Weak exam apparatus | MCQs, mistakes, author |
| bped-sem2.html | Almost empty | Rewritten as a real paper guide |
| coming-soon.html | Placeholder | Left **noindex** |
| kurukshetra-university.html | Updating stub | Left **noindex** |
| Ready.admission.html | Duplicate of admissions | **noindex** |
| test.html, class-selection, preview/draw tests | Tools/demos | **noindex** + robots Disallow |
| University fee tables | Invented ranges | Removed or marked verify-only |

## 3. Duplicate pages / text

- University **fee bands** (₹45,000–₹90,000) repeated across NIMS, Singhania, Lords, Tantia, BN — removed from those pages.
- Generic **“international stadium”** facility lists — NIMS replaced with a Jaipur campus-visit checklist.
- **Ready.admission.html** vs **admissions.html** — duplicate kept for old links, noindex on Ready.
- Success-story **quotes** duplicated the “career opportunities” tone — replaced with pathways + habits.

ChatGPT citation strings stripped or converted to normal official links on Uniraj, JJT, Madhav, Singhania, PTI page.

## 4. Pages improved

- Trust: about, contact (editorial link), privacy/terms/disclaimer dates, editorial-policy (new).
- Home: Resources/About nav, footer (no public admin link), form `_next` URL to custom domain, course footer links.
- CBSE hub nav → resource map.
- B.P.Ed guide: practical admission/document section + internal links.
- Class 12 Units 1–2: exam sections.
- University: NIMS, Singhania, Lords, Tantia, BN fees; JJT fee warning; Uniraj citations; PTI rumour cleanup.
- Success stories: no fake named results.
- Tournament public page: description, canonical, index (coach/admin noindex).
- `bped-sem2.html`, `cbse.html` linking.

## 5. Pages removed / noindexed

**Not deleted** (to avoid breaking bookmarks and GitHub deploys):

- Admin: `admin.html`, `admin-login.html`, `admin-students.html`, `practice-test-admin.html`, `live-test-admin.html`
- Tournament tools: `tournament-admin.html`, `tournament-coach.html`, `tournament-preview-test.html`, `tournament-draw-test.html`
- Student login and `robots.txt` `Disallow: /student-`
- `tests/mcq-engine.html`, `test.html`, `coming-soon.html`, `certificate.html` (already noindex), `class-selection.html`, `Ready.admission.html`
- Chapter tests `class11-ch1/ch2-test`, `class12-ch1/ch2-test` noindex; **removed from sitemap**
- `kurukshetra-university.html` remains noindex

## 6. New original content added

Resource hub (`/resources/` and category indexes) plus:

- Practical file + viva
- B.P.Ed PFT training (no fake cut-offs)
- PET/PTI 8-week outline
- School event formats + tournament checklist
- Lesson planning, injury prevention, interview Qs, fitness assessment, school taekwondo coaching
- `404.html` for GitHub Pages
- `css/edu.css` for readable articles

## 7. Trust pages

Created **About** and **Editorial Policy**. Contact already had operator details (Jai Thakur, M.P.Ed., NIS, Alwar, phone, email). Credentials were **not invented** beyond `jai-thakur.html` / homepage.

## 8. Technical SEO

- `robots.txt` allow public content; disallow admin/tests/config/js/scripts
- `sitemap.xml` rebuilt (no tests, includes about, resources, new guides)
- Canonicals already widespread on public HTML
- Public tournament indexed; tools noindex
- Form thank-you URL no longer points at `github.io`

## 9. Internal linking

Hub ↔ CBSE units, B.P.Ed ↔ PFT ↔ universities, Unit 1 ↔ tournament checklist, PET pages ↔ written plan, CBSE nav ↔ `/resources/cbse/`.

## 10. Mobile UX

Existing `style.css` already forces table scroll and 16px inputs. New articles use `edu.css` with wrapping tables and readable type. Home nav gained two links (may wrap on small screens; hamburger already exists).

**Not fully browser-tested in this session** (no hosted preview run here). Closest check: static HTML validity of edited fragments; no JS tournament files changed except meta tags.

## 11. Remaining risks

- Other university pages (Mewar, OPJS, Madhav) still have **template similarity** and some `[oai_citation]` leftovers on Madhav/JJT body text.
- `top-universities.html` still shows **broad fee/salary ranges**.
- Hindi/English mix on course pages.
- Some CBSE units still weaker than Units 3–10 (PDF + notes without a full exam kit).
- AdSense can still reject for other policy reasons (site age, navigation, ads.txt, etc.).
- `jjt-university.html` still shows rupee figures said to be from an official page — users must re-check.

## 12. Recommended next steps

1. Resubmit AdSense only after Google recrawls (Search Console sitemap).
2. Walk Mewar/OPJS/Madhav pages the same way as NIMS (visit checklists, no invented fees).
3. Expand remaining Class 11/12 units with original MCQs where missing.
4. Keep university fees off the site unless copied from a dated prospectus screenshot you own.
5. Do not add dozens of thin SEO URLs.
