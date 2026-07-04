/*
=========================================
Physical Education Career
Schema v1.0
Author : Jai Thakur
=========================================
*/

const PESchema = {

    classes: [
        {
            id: "11",
            name: "Class 11"
        },
        {
            id: "12",
            name: "Class 12"
        }
    ],

    subjects: [
        {
            id: "physical-education",
            name: "Physical Education"
        }
    ],

    questionTypes: [
        "MCQ",
        "Theory"
    ],

    questionTemplate: {
        id: "",
        class: "",
        subject: "",
        chapter: "",
        type: "MCQ",
        question: "",
        options: [],
        answer: "",
        explanation: "",
        difficulty: "Medium",
        marks: 1,
        createdAt: "",
        updatedAt: ""
    }

};
