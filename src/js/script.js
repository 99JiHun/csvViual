const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('filename');
const clickArea = document.getElementById('click-area');
const resetArea = document.getElementById('reset-area');

let allData = []; // 모든 파일 데이터 저장 배열
let hearders = []; // 모든 csv 파일에서 발견한 고유한 헤더

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
    fileInput.value = '';
    allData.splice(0,allData.length);
    hearders.splice(0,hearders.length);

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

function parseCSV(csvText){
    const rows = csvText.trim().split("\n").map(row => row.split(","));
    const headers = rows[0].map(header => header.trim());
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
            // const {headers, data} = parseCSV(csvText);

            const rows = csvText.split("\n");
            const fileData = [];
    
            rows.forEach((row, rowIndex)=>{
                const cols = row.split(",").map(col => col.trim());
                const hasValidData = cols.some(col => col.length > 0);
                if(rowIndex === 0){
                    cols.forEach(col=>{
                        if(!hearders.includes(col.trim())){
                            hearders.push(col.trim());
                        }
                    });
                } else if(hasValidData){
                    const rowData = {};
                    cols.forEach((col,colIndex)=>{
                        rowData[hearders[colIndex]] = col.trim();
                    });
                    fileData.push(rowData);
                }
            });
            allData = allData.concat(fileData);
            updateTable();
            generateChartData();
        };
        reader.readAsText(file);
    }
}

function updateTable(){
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");

    hearders.forEach(header =>{
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    allData.forEach(rowData =>{
        const tr = document.createElement("tr");
        hearders.forEach(header =>{
            const td = document.createElement("td");
            td.textContent = rowData[header] || "n";
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
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
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

function generateChartData(){
    const labels = allData.map(row => row['A']);
    const datasetkeys = ['B','C','D','E'];

    const datasets = datasetkeys.map(key=>{
        return{
            label : key,
            data : allData.map(row => parseFloat(row[key])),
            backgroundColor: getRandomColor(),
            borderColor: getRandomColor(),
            borderWidth: 1,
        };
    });
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