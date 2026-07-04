/*
=========================================
Physical Education Career
Import / Export Engine v1.0
=========================================
*/

const PEImportExport = {

    exportJSON() {

        const data = PEStorage.load();

        if (!data) {
            alert("No database found.");
            return;
        }

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "PhysicalEducationDatabase.json";
        a.click();

        URL.revokeObjectURL(url);
    },

    importJSON(file) {

        const reader = new FileReader();

        reader.onload = function(event) {

            try {

                const data = JSON.parse(event.target.result);

                PEStorage.save(data);

                alert("Database imported successfully.");

            } catch {

                alert("Invalid JSON file.");

            }

        };

        reader.readAsText(file);

    }

};
