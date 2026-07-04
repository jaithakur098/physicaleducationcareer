/*
=========================================
Physical Education Career
Randomizer Engine v1.0
Author : Jai Thakur
=========================================
*/

const PERandomizer = {

    // Array Shuffle (Fisher-Yates)
    shuffle(array) {

        let arr = [...array];

        for (let i = arr.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [arr[i], arr[j]] = [arr[j], arr[i]];

        }

        return arr;

    },

    // Random Questions
    randomQuestions(questions, limit = 50) {

        if (!Array.isArray(questions)) return [];

        return this.shuffle(questions).slice(0, limit);

    },

    // Shuffle Options
    shuffleOptions(question) {

        if (!question.options) return question;

        question.options = this.shuffle(question.options);

        return question;

    },

    // Complete Test Generator
    generateTest(questions, total = 50) {

        let selected = this.randomQuestions(questions, total);

        return selected.map(q => this.shuffleOptions(q));

    }

};
