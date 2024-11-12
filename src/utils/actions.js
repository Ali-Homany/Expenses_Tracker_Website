function scroll_to_form() {
    const form = document.querySelector("form");
    if (form) {
        form.scrollIntoView({behavior:"smooth"});
    }
}

function importData() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json"; // Accept only JSON files

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (!file) {
            alert("No file selected!");
            return;
        }

        const reader = new FileReader();
        reader.readAsText(file); // Read the file content as text

        reader.onload = (e) => {
            try {
            const data = JSON.parse(e.target.result);
            // Check if data is a list of dictionaries
            if (!Array.isArray(data) || !data.every(item => typeof item === 'object')) {
                alert("Error: Invalid data structure. Please ensure the file contains a list of dictionaries.");
                return;
            }
            // Filter and normalize the data
            const normalizedData = data.map(item => ({
                id: crypto.randomUUID(),
                date: item.date || null,
                title: item.title || null,
                price: item.price || null,
                currency: item.currency || "LL",
                category: item.category || null,
            }));
            // Set the data to your application logic (e.g., update local storage)
            localStorage.setItem("data", JSON.stringify(normalizedData));
            alert("Data imported successfully!");
            window.location.reload();
            } catch (error) {
                alert("Error parsing JSON file!");
                console.error(error);
            }
        };
    });

    // Simulate a click on the file input to open the file selection dialog
    fileInput.click();
}

function downloadData() {
    const data = JSON.parse(localStorage.getItem("data"));

    if (!data) {
    alert("No data found in local storage!");
    return;
    }

    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expense_data.json";

    link.click();
    URL.revokeObjectURL(link.href);
}

export { importData, downloadData, scroll_to_form };