# Student Module — PEEngine

Extends the existing project without modifying admin.html, live-test-admin.html,
config/admin-data.js, or any master data / question / live test logic.

## Files added
- `config/student-data.js` — Firebase Auth + Firestore layer for students
- `student-styles.css` — shared theme for student pages
- `student-register.html` — Registration
- `student-login.html` — Login
- `student-forgot.html` — Forgot password (email reset link)
- `student-dashboard.html` — Overview (stats + quick actions + recent attempts)
- `student-profile.html` — View / edit profile
- `student-live-tests.html` — Available ACTIVE (published) live tests
- `student-attempt.html?id=TESTID` — Attempt UI with countdown timer + auto-submit
- `student-result.html?id=ATTEMPTID` — Immediate result summary
- `student-my-results.html` — All past attempts
- `student-leaderboard.html?id=TESTID` — Ranked by score, then time
- `student-certificate.html?id=ATTEMPTID` — Printable certificate (>=40%)
- `student-analytics.html` — Aggregate + subject-wise + trend
- `admin-students.html` — Admin: search / block / unblock / delete / view results

## Firestore collections used
- `classes`, `subjects`, `chapters`, `questions`, `live_tests` — EXISTING (unchanged)
- `students` — NEW: `{ uid, name, email, phone, className, school, city, state, blocked, createdAt, updatedAt }`
- `student_attempts` — NEW: attempt records with answers, score, percent, durationSec
- `live_tests/{id}/attempts/{uid}` — NEW marker doc enforcing single-attempt

## Firebase Authentication
The student module uses `firebase-auth-compat`. Enable **Email/Password**
provider in the Firebase Console (Authentication → Sign-in method) for the
`pe-exam-hub` project. No other Firebase configuration changes are required —
the existing `config/firebase-init.js` is reused.

## Entry points
- Students: `student-login.html` (or `student-register.html`)
- Admin manages students: `admin-students.html` (link this from your admin sidebar)

## Firestore security rules (recommended, add in Firebase console)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /students/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /student_attempts/{id} {
      allow create: if request.auth != null && request.resource.data.studentId == request.auth.uid;
      allow read:   if request.auth != null;
    }
    match /live_tests/{tid} {
      allow read: if true;
      match /attempts/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /{path=**} { allow read: if true; }
  }
}
```
Tighten as needed for your admin flow.
