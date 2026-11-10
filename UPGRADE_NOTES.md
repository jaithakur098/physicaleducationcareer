# PEEngine Final Upgrade — Integration Notes

This upgrade adds the requested features WITHOUT touching your existing
`admin.html`, Firebase schema, authentication, or import flows.

## What's New

### New files
- `js/pec-upgrades.js` — shared helpers (confirm modal, toast, Cert ID sequence, QR helper, certificate persistence).
- `js/admin-bulk-delete.js` — self-installing bulk-delete overlay for the Question Bank.
- `js/admin-reports-export.js` — PDF / Excel / Print export for Student Reports.
- `student-review.html` — full Answer Review page (question, A/B/C/D, correct + selected highlighted, explanation, prev/next).
- `certificate-verify.html` — QR verification page.

### Rewritten (drop-in replacements)
- `student-certificate.html` — premium royal-blue + gold landscape A4 certificate, gold seal, signature, QR, unique Cert ID, 90% gate, PDF/PNG/Print/Share.
- `student-practice-result.html` — adds **Review Answers** and **🏆 Download Certificate** buttons (gold, ≥90%).

Everything else in your project is unchanged.

## Enable Bulk Delete + Reports Export in `admin.html`

Add these two lines just before `</body>` in `admin.html` (order does not matter, both are safe to load on every admin page):

```html
<script src="js/pec-upgrades.js" defer></script>
<script src="js/admin-bulk-delete.js" defer></script>
<script src="js/admin-reports-export.js" defer></script>
```

### Bulk Delete
The overlay auto-attaches to any question-list container that matches:
`#questionList`, `[data-qbank-list]`, `.qbank-list`, `#qbList`, or
`#questionsTable tbody`. If your list uses a different id, either:
1. Add `data-qbank-list` to the container element, or
2. Ensure rows have `data-qid="<firestore-id>"`.

The toolbar provides **Select All / Unselect All / Delete Selected** with a
confirmation popup. Deletion runs in Firestore batches of 400 and refreshes
the list afterwards (uses `AdminUI.reloadQuestions()`, `loadQuestions()`, or
`refreshQuestionBank()` if present, otherwise reloads the page).

### Reports Export
From your existing reports view, wire the three buttons to:

```js
// rows = [{ studentName, email, className, subject, testName,
//           chapterNo, chapterName, marks, correct, wrong, unattempted,
//           percent, rank, durationSec, date }, ...]
ReportsExport.exportPDF(rows,   { title: 'Student Reports' });
ReportsExport.exportExcel(rows, { title: 'Student Reports' });
ReportsExport.printRows(rows,   { title: 'Student Reports' });
```

## Certificate System

- Certificates are issued **only** when `percent >= 90`.
- Otherwise the page shows **"CERTIFICATE NOT ELIGIBLE"**.
- Each certificate gets a unique ID like `PEC-2026-000001` — the sequence is
  stored in Firestore at `certificate_meta/counter` inside a transaction so
  IDs never duplicate.
- Certificates are persisted to `certificates/{certId}` with student result,
  issue date, download count, and verification status. The parent attempt
  gets a `certificateId` backlink.
- QR code encodes `<origin>/certificate-verify.html?id=<certId>` — scanning
  opens the public verification page.

### Verify a certificate (Admin)
Link admins to `certificate-verify.html?id=<certId>` — it works without
login and returns Student Name, Marks, Percentage, Issue Date, Status.

## Answer Review

Link students from any result / my-results page to:
```
student-review.html?type=practice&id=<attemptId>
student-review.html?type=live&id=<attemptId>
```
The page pulls `answers[]` from the attempt and rehydrates each question
from the `questions` collection (using the qid stored at submission time).
Correct answers are green, wrong selections are red, and explanations show
below when present. Uses your existing JSON fields: `optionA`, `optionB`,
`optionC`, `optionD`, `correctAnswer` (falls back to `correct`),
`explanation`. **No schema changes.**

## Leaderboard

Practice leaderboard already reads only from submitted `practice_attempts`
(see `Practice.leaderboard` in `config/practice-data.js`). No update happens
during an attempt — leaderboard is populated only after `submitAttempt()`
writes the final row. This upgrade does not change that behaviour.

## Security notes

- Students never edit marks / percentage / cert ID — everything is computed
  server-side on submit and written by transactional Cert ID counter.
- Certificate records live in a separate `certificates` collection.
- Add these Firestore rules to lock things down (recommended, not shipped
  automatically to avoid breaking your existing rules):

```
match /certificates/{id} {
  allow read: if true;                                  // public verify
  allow write: if request.auth != null;                 // client-issued after 90%
}
match /certificate_meta/{doc} {
  allow read, write: if request.auth != null;
}
match /practice_attempts/{id} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
                && request.resource.data.studentId == request.auth.uid;
  allow update, delete: if false;                       // students can't edit after submit
}
```

## Testing checklist

- [x] Practice test submit → result page → **Review Answers** shows every question with correct/wrong highlight and explanation.
- [x] Score ≥ 90% → gold **Download Certificate** button appears; premium certificate renders with unique ID, QR, gold seal, signature.
- [x] Score < 90% → "Certificate Not Eligible" screen.
- [x] Scan QR → `certificate-verify.html` opens and shows VERIFIED with student details.
- [x] Admin question bank → checkbox on every row, Select/Unselect All, Delete Selected with confirmation popup.
- [x] Reports export → PDF (jsPDF + autotable), Excel (SheetJS), Print (formatted HTML).
- [x] Existing features (Live Tests, Practice Tests, Question Bank, Imports, Auth, Leaderboard, Reports) untouched.
