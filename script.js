var data = []
var filtered_data = []
const del = document.getElementById("delete")
const tbody = document.getElementById("body")
const title = document.getElementById("title")
const price = document.getElementById("price")
const category = document.getElementById("category")
const submit = document.getElementById("submit")
const output = document.querySelector(".output")
const controls = document.getElementsByClassName("controls")[0]
const search = document.getElementById("search")
const summary = document.getElementById("summary")
let mode = "create"
let temp;
var pieChart;
var barChart;

// onload loading and displaying data
window.onload = loadPage()

function loadPage(){
    loadData()
    createAllRows(data)
    createCharts(data);
    displayOutput()
}

// create a row data, append it, display
function submitItem (){
    // add this record to data array
    let result = {
        date: year.value + "/" + month.value + "/" + day.value,
        title: title.value.toLowerCase(),
        price:price.value,
        category:category.value.toLowerCase()
    }
    if(!isDateValid(result.date)){
        return
    }
    if(mode=="create"){
        data.push(result);
    }else{
        data[temp] = result
        temp = null
        mode = "create"
        submit.innerHTML = "create"
    }
    data.sort(sortDates)
    // clear values from create form
    clear_inputs()
    // save updated data array to local storage
    saveRecords()
    // create rows and display data
    loadPage()
}
function sortDates(a,b){
    d1 = new Date(a.date)
    d2 = new Date(b.date)
    return d1 - d2
}
function isDateValid(datestr) {
    let date = datestr.split('/')
    let day = date[2]
    let month = date[1]
    let year = date[0]
    if(month==2){
        if(day>29){
            return false
        }
        if(day==29){
            if(year%4!=0 || (year%100==0 && year%400!=0)){
                return false
            }
        }
    }
    if(day==31 && (month==4 || month==6 || month==9 || month==11)){
        return false
    }
    return true
    // need to search and check if date is valid
}
// loop over data array to create tr for each record
function createAllRows(data){
    tbody.innerHTML = ''
    for(let i=0; i<data.length; i++){
        const tr = document.createElement("tr")
        for(const [key, value] of Object.entries(data[i])){
            const td = document.createElement("td");
            td.innerHTML = value;
            tr.appendChild(td);
        }
        tr.innerHTML += `<td><svg onclick="updateRow(${i})" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg><svg onclick="deleteRow(${i})" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg></td>`
        tbody.appendChild(tr);
    }
    del.innerHTML = "(" + (data.length) + ")";
}

// save data array to localstorage, to update local storage
function saveRecords(){
    localStorage.setItem("data",JSON.stringify(data))
}

// load localstorage to data array, to get existing data from previous sessions
function loadData(){
    if(localStorage.getItem("data")===null){
        data = []
        console.log("nothing in local storage")
    }else{
        data = JSON.parse(localStorage.getItem("data"))
    }
}


// display output container
function displayOutput(){
    if(tbody.childNodes.length > 0){
        output.style.display = "block"
        controls.style.display = "block"
        summary.style.display = "flex"
    }else{
        output.style.display = "none"
        controls.style.display = "none"
        summary.style.display = "none"
    }
}


// delete all
del.ondblclick = ()=>{
    localStorage.removeItem("data")
    loadPage()
}

// delete a record, invoked by delete button within a tr
function deleteRow(id){
    data.splice(id,1)
    saveRecords()
    data = []
    loadPage()
}

// clear inputs on create
function clear_inputs(){
    let inputs = document.querySelectorAll("input")
    for(let i=0; i<inputs.length; i+=1){
        inputs[i].value=""
    }
}

// update a record, invoked by update button within a tr
function updateRow(id){
    row = data[id]

    title.value = row.title
    price.value = row.price
    category.value = row.category
    
    date = row.date.split('/')
    day.value = date[2]
    month.value = date[1]
    year.value = date[0]
    
    mode = "update"
    submit.innerHTML = "update"
    temp = id
    go_to_crud()
}


// search
let searchMode = "search by title"
function setSearchMode(mode){
    searchMode = mode.toLowerCase()
    search.focus()
    if(search.value){
        console.log(search.value)
        searchData(search.value)
    }else{
        console.log(searchMode)
        search.setAttribute("placeholder", searchMode)
    }
}
function searchData(keyword){
    keyword = keyword.toLowerCase()
    filtered_data = []
    data.forEach(record => {
        if(searchMode=="search by title"){
            if(record.title.includes(keyword)){
                filtered_data.push(record)
            }
        }
        else{
            if(record.category.includes(keyword)){
                filtered_data.push(record)
            }
        }
    })
    createAllRows(filtered_data)
    createCharts(filtered_data)
}


// create charts canvas in summary
function createCharts(data){
    createPieChart(data);
    createBarChart(data);
}
function createPieChart(data){
    if(pieChart){
        pieChart.destroy()
    }
    let categories = getCategories(data)
    let summarized_data = {
        labels: categories,
        datasets: [{
          data: getCategorizedData(categories, data), // Values for each slice
          backgroundColor: getRandomColors(categories.length), // Colors for each slice
          borderWidth: 2,
        }]
      };
    if(summarized_data==[] || summarized_data==null){
        return
    }
    
    // Get the canvas element
    let pie = document.getElementById('pieChart');
    
    // Create the pie chart
    pieChart = new Chart(pie, {
      type: 'pie',
      data: summarized_data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: 'bottom',
          labels: {
            fontColor: 'black',
            fontSize: 14,
          },
        },
        title: {
          display: true,
          text: 'My Awesome Pie Chart',
          fontSize: 20,
          fontColor: 'black',
        },
      },
    });
}
function createBarChart(data){
    if(barChart){
        barChart.destroy()
    }
    let days = getDays(data)
    const barChartData = {
        labels: days,
        datasets: [{
          label: 'Values',
          data: getDailyTotal(days, data),
          backgroundColor: '#800000', // Bar color
          borderColor: 'rgba(75, 192, 192, 1)', // Border color
          borderWidth: 1,
        }]
      };
  
    // Get the canvas element
    let bar = document.getElementById('barChart');

    // Create the bar chart
    barChart = new Chart(bar, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
            x: {
                beginAtZero: false,
            },
            y: {
                beginAtZero: true,
            }
            },
            plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'My Awesome Bar Chart',
                fontSize: 20,
                fontColor: 'black',
            }
            },
        },
    });
    bar.style.minWidth = String(days.length*50+250)+"px"
    return true;
}
// summary helper functions
function getDailyTotal(days, data){
    let result = []
    for(let curr_day of days){
        let curr_sum = 0
        for(let row of data){
            if(row.date == curr_day){
                curr_sum += Number(row.price)
            }
        }
        result.push(curr_sum);
    }
    return result
}
function getDays(data){
    let days = []
    for(let row of data){
        if(!days.includes(row.date)){
            days.push(row.date);
        }
    }
    return days
}
function getCategories(data){
    let categories = []
    for(let row of data){
        if(!categories.includes(row.category)){
            categories.push(row.category);
        }
    }
    return categories
}
function getCategorizedData(categories, data){
    let result = []
    for(let curr_category of categories){
        let curr_sum = 0
        for(let row of data){
            if(row.category == curr_category){
                curr_sum += Number(row.price)
            }
        }
        result.push(curr_sum);
    }
    return result
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
function shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = percent < 0 ? percent * -1 : percent;
    const R = f >> 16;
    const G = f >> 8 & 0x00FF;
    const B = f & 0x0000FF;
  
    return `#${(0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)).toString(16).slice(1)}`;
}

// go to crud scrolling down on click
function go_to_crud(){
    document.getElementsByTagName("form")[0].scrollIntoView({behavior:"smooth"});
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
          // Set the data to your application logic (e.g., update local storage)
          localStorage.setItem("data", JSON.stringify(data));
          alert("Data imported successfully!");
        } catch (error) {
          alert("Error parsing JSON file!");
          console.error(error);
        }
      };
    });
  
    // Simulate a click on the file input to open the file selection dialog
    fileInput.click();
  }