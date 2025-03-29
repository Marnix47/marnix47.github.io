function getRawData(){
    return localStorage.getItem('data');
}

function getTableData(){
    return JSON.parse(getRawData());
}

