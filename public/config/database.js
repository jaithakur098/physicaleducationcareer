/* ===========================================
   Physical Education Career
   Universal Question Database Engine v1.0
   =========================================== */

const PEDatabase = {

  version: "1.0",

  classes: {
    "11": {
      name: "Class 11",
      subjects: {}
    },
    "12": {
      name: "Class 12",
      subjects: {}
    }
  },

  addSubject(classId, subjectId, subjectName) {

    if (!this.classes[classId]) return false;

    this.classes[classId].subjects[subjectId] = {
      name: subjectName,
      chapters: {}
    };

    this.save();

    return true;

  },

  addChapter(classId, subjectId, chapterId, chapterName) {

    const subject = this.classes[classId]?.subjects[subjectId];

    if (!subject) return false;

    subject.chapters[chapterId] = {
      id: chapterId,
      name: chapterName,
      mcq: [],
      theory: []
    };

    this.save();

    return true;

  },

  addQuestion(classId, subjectId, chapterId, question) {

    const chapter =
      this.classes[classId]
      ?.subjects[subjectId]
      ?.chapters[chapterId];

    if (!chapter) return false;

    if (question.type === "mcq") {

      chapter.mcq.push(question);

    } else {

      chapter.theory.push(question);

    }

    this.save();

    return true;

  },

  save() {

    localStorage.setItem(
      "PE_DATABASE",
      JSON.stringify(this.classes)
    );

  },

  load() {

    const data = localStorage.getItem("PE_DATABASE");

    if (!data) return;

    this.classes = JSON.parse(data);

  }

};

PEDatabase.load();
