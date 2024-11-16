import * as XLSX from 'xlsx';

function scroll_to_form() {
    const form = document.querySelector("form");
    if (form) {
        form.scrollIntoView({behavior:"smooth"});
    }
}
function getRandomColors(n) {
    const shades = [];

  for (let i = 0; i < n; i++) {
    // Calculate the shade based on the index
    const shade = `#${Math.floor((255 / n) * i).toString(16).padStart(2, '0')}0000`;
    shades.push(shade);
  }

  return shades;
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

function downloadData(format) {
    const allowed_formats = ['json', 'csv', 'xlsx'];
    if (!allowed_formats.includes(format)) {
        alert("Invalid format!");
        return;
    }

    const data = JSON.parse(localStorage.getItem("data"));
    if (!data) {
        alert("No data found in local storage!");
        return;
    }

    const jsonData = JSON.stringify(data);

    var blob = null;
    if (format === "json") {
        blob = new Blob([jsonData], { type: "application/json" });
    } else if (format === "csv") {
        const csvData = data.map(item => {
            const { id, date, title, price, currency, category } = item;
            return `${id},${date},${title},${price},${currency},${category}`;
        }).join("\n");
        blob = new Blob([csvData], { type: "text/csv" });
    } else if (format === "xlsx") {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const xlsxBlob = new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], 
                                { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        blob = xlsxBlob;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expense_data.${format}`;
    link.click();
    link.addEventListener('click', () => {
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    });
}

export { importData, downloadData, scroll_to_form, getRandomColors };