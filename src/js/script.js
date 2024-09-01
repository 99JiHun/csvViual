const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('filename');
const clickArea = document.getElementById('click-area');
const resetArea = document.getElementById('reset-area');
const canvas = document.getElementById('myChart');
const toggleButton = document.getElementById('toggleOrientation');
let isOriginalOrientation = true;

let headers = [];
let allData = [];

dropArea.addEventListener('dragover', (e)=>{
    e.preventDefault();
    dropArea.classList.add('c');
})

dropArea.addEventListener('dragleave', (e)=>{
    dropArea.classList.add('highlight');
})

dropArea.addEventListener('drop', (e)=>{
    console.log('File input drop');
    e.preventDefault();
    dropArea.classList.remove('highlight');
    const files = e.dataTransfer.files;
    handleFiles(files);
})

clickArea.addEventListener('click', (e) =>{
    console.log('File input click');
    fileInput.click();
    e.preventDefault();
})

resetArea.addEventListener('click',(e)=>{
    console.log('File reset Click');
    const tables = dropArea.querySelectorAll("table");
    tables.forEach(table => {
        dropArea.removeChild(table);
    });

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.Width, canvas.height);

    if(window.chartInstance){
        window.chartInstance.destroy();
    }


    fileInput.value = '';
    allData = [];
    // allData.splice(0,allData.length);
    console.log("data and visual reset.");
    e.preventDefault();
})

fileInput.addEventListener('change', (e)=>{
    console.log('File input changed');
    const files = e.target.files;
    if(files.length > 0){
        console.log('File selected : ',files[0].name);
        handleFiles(files);
    }
    
})

toggleButton.addEventListener('click', (e)=>{
    isOriginalOrientation = !isOriginalOrientation;
    generateChartData(headers, allData);
    e.preventDefault();
});

function parseCSV(csvText){
    const rows = csvText.trim().split("\n").map(row => row.split(","));
    headers = rows[0].map(header => header.trim());
    
    const data = rows.slice(1).map(row =>{
        return row.map((cell, index)=>{
            const trimmedCell = cell.trim();
            return isNaN(trimmedCell) ? trimmedCell : parseFloat(trimmedCell);
        });
    });
    return {headers, data};
}

function handleFiles(files){
    for(let file of files){
        const reader = new FileReader();
        reader.onload = function(event){
            const csvText = event.target.result;
            const {headers, data} = parseCSV(csvText);
            
            allData = allData.concat(data);
            
            updateTable(headers, allData);
            generateChartData(headers, allData);
        };
        reader.readAsText(file);
    }
}

function updateTable(headers, data){
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");

    headers.forEach(header =>{
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(rowData =>{
        const tr = document.createElement("tr");
        rowData.forEach(cell =>{
            const td = document.createElement("td");
            td.textContent = cell || "n";
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    const existringTable = dropArea.querySelector("table");
    // table delete 안하면 하나씩 쌓임
    if(existringTable)dropArea.removeChild(existringTable);
    dropArea.appendChild(table);
}

function createChart(labels, datasets){
    const ctx = canvas.getContext('2d');

    if(window.chartInstance){
        window.chartInstance.destroy();
    }

    window.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateChartData(headers, data){
    let labels, datasets;
    if(isOriginalOrientation){
        labels = data.map(row => row[0]);
        datasets = headers.slice(1).map((header, index)=>{
            return{
                label : header,
                data : data.map(row => parseFloat(row[index+1])),
                backgroundColor: getRandomColor(),
                borderColor: getRandomColor(),
                borderWidth: 1,
            };
        });
    }else{
        labels = headers.slice(1); 
        datasets = data.map((row)=>{
            return{
                label : row[0],
                data : row.slice(1),
                backgroundColor: getRandomColor(),
                borderColor: getRandomColor(),
                borderWidth: 1,
            };
        });
    }
    console.log(data[0].slice(1))
    createChart(labels, datasets);
}

function getRandomColor(){
    const letters = '0123456789ABCDEF';
    let color ='#';
    for(let i=0; i<6;i++){
        color += letters[Math.floor(Math.random()*16)];
    }
    return color;
}