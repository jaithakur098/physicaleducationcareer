PEEngine — Updated Files (Complete)
===================================

Contents
--------
config/question-bank.js          shared normalize + match + loader
config/admin-data.js             questions/tests CRUD, Repair/Migrate
config/practice-data.js          Practice Test data layer (lazy QB)
config/student-data.js           Student data layer (lazy QB)
admin.html                       Admin panel (Import, Question Bank,
                                 Live Test Manager, Repair/Migrate)
practice-test-admin.html         Practice Test Manager
live-test-admin.html             Legacy live-test scheduler
student-practice-tests.html      Student list of published practice tests
student-live-tests.html          Student list of published live tests
student-practice-attempt.html    Practice attempt engine
student-attempt.html             Live attempt engine
CHANGELOG.txt
README_UPDATE.txt

How to apply
------------
1. Extract the ZIP.
2. Copy every file into your project at the SAME path (config/*.js goes
   into your existing `config/` folder, HTML files go to the project root).
3. Overwrite when prompted.
4. Hard-refresh (Ctrl+F5) every page.
5. In Admin → Import tab, run "Repair / Migrate All Questions" once to
   heal any previously-imported rows.

After that:
  * CSV / Excel / JSON imports become visible in Question Bank, Live Test
    Manager pool, Practice Test Manager pool, and both student pages
    without opening Edit → Save.
  * Class / Subject / Chapter auto-map (label OR id OR "Class 12" style).
  * Options A/B/C/D and correct answer are always saved.
  * Student Practice Tests and Student Live Tests show every published
    test (isPublished == true).
