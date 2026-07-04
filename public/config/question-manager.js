/*
=========================================
Physical Education Career
Question Manager v1.0
Author : Jai Thakur
=========================================
*/

const QuestionManager = {

    add(question) {

        console.log("Add Question", question);

    },

    edit(id, data) {

        console.log("Edit Question", id);

    },

    remove(id) {

        console.log("Delete Question", id);

    },

    get(id) {

        console.log("Get Question", id);

    },

    getAll() {

        console.log("Get All Questions");

    },

    search(keyword) {

        console.log("Search", keyword);

    },

    importJSON(file) {

        console.log("Import", file);

    },

    exportJSON() {

        console.log("Export JSON");

    }

};
