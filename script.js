var data = []
var filtered_data = []
const del = document.getElementById("delete")
const tbody = document.getElementById("body")
const title = document.getElementById("title")
const price = document.getElementById("price")
const category = document.getElementById("category")
const submit = document.getElementById("submit")
const output = document.querySelector(".output")
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
        count.style.display = "block"
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
        summary.style.display = "flex"
    }else{
        output.style.display = "none"
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
    
    mode = "update"
    submit.innerHTML = "update"
    temp = id
    window.scrollTo({
        top:0,
        behavior:'smooth'
    })
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