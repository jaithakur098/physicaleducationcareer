/*
=========================================
Physical Education Career
Storage Engine v1.0
=========================================
*/

const PEStorage = {

    KEY: "PE_DATABASE",

    save(data) {

        localStorage.setItem(
            this.KEY,
            JSON.stringify(data)
        );

    },

    load() {

        const data = localStorage.getItem(this.KEY);

        if (!data) {

            return null;

        }

        return JSON.parse(data);

    },

    clear() {

        localStorage.removeItem(this.KEY);

    },

    exists() {

        return localStorage.getItem(this.KEY) !== null;

    }

};
