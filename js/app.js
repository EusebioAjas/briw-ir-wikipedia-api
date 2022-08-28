// Buscador de articulos personalizados publicados en la Wikipedia
// 1. Debe permitir escribir un texto y listar los resultados de la búsqueda con enlaces a las páginas de los articulos.
// 2. El usuario debe poder cambiar el orden de los resultados por [relevancia, fecha, tamaño de la página].

const BASE_URL = "https://es.wikipedia.org/w/api.php?";

async function getInformation(userWord, srparams) {
    let defaultParams = buildParams(srparams);
    let url = `${BASE_URL}${defaultParams}&srsearch=${userWord}`
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function renderInformation(userWord, srparams) {
    let info = await getInformation(userWord, srparams);
    const data = info.query.search;
    localStorage.setItem("data", JSON.stringify(info));
    renderHTML(data);
}

async function handleSearchBtn() {
    try {
        let inputValue = handleEmptyTextField();
        await renderInformation(inputValue, params);
    } catch (error) {
        alert(error.message)
    }
}

async function renderHTML(data) {
    let html = "";
    data.forEach(element => {
        let htmlSegment = `<div class="card">
        <h2>${element.title}</h2>
        <h3>${element.size} bytes</h3>
        <p>${element.snippet}</p>
        <h3>${parseDate(element.timestamp)}</h3>
        <p><a href="https://es.wikipedia.org/?curid=${element.pageid}">Ver página</a></p>
        </div>`;

        html += htmlSegment;
    });

    let container = document.querySelector('.container');
    container.innerHTML = html;
}

// Ordenadores por Fecha, relevancia y Tamaño de página
function orderByDate() {
    try {
        handleEmptyTextField();
        const data = retrieveData();
        const sortedData = data.sort(compareDate);
        renderHTML(sortedData);
    } catch (error) {
        alert(error.message);
    }
}

async function orderByRelevance() {
    try {
        let inputValue = handleEmptyTextField();
        await renderInformation(inputValue, paramsWithRelevance);
    } catch (error) {
        alert(error.message);
    }
}

function orderBySize() {
    try {
        handleEmptyTextField();
        const dataArr = retrieveData();
        const sortedData = dataArr.sort(compareSize)
        renderHTML(sortedData);
    } catch (error) {
        alert(error.message);
    }
}

// Comparables
function compareSize(obj1, obj2) {
    return obj2.size - obj1.size;
}

function compareDate(obj1, obj2) {
    const date1 = new Date(obj1.timestamp);
    const date2 = new Date(obj2.timestamp);
    return date2 - date1;
}

//Exceptions
function handleEmptyTextField() {
    let inputValue = document.getElementById("srInput").value;
    if (!inputValue) {
        throw new EmptyTextFieldException("¡Debe ingresar una palabra en la caja de texto!");
    }
    return inputValue;
}

class EmptyTextFieldException {
    constructor(message) {
        this.message = message;
        this.name = "EmptyTextFieldError";
    }
}

//Utils
function replaceSpaces(word) {
    return word.split(' ').join('%20');
}
function parseDate(timestamp) {
    const date = new Date(timestamp);
    const timeZone = date.toLocaleString("en-US", { timeZoneName: "short" })
    return timeZone;
}

function retrieveData() {
    const retrievedData = localStorage.getItem("data");
    data = JSON.parse(retrievedData);
    dataArr = data.query.search;
    return dataArr;
}

function buildParams(data) {
    const ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}

const params = {
    'action': 'query',
    'list': 'search',
    'format': 'json',
    'origin': '*',
    'utf8': '',
    'srlimit': 10,
};

const paramsWithRelevance = {
    ...params,
    'srqiprofile': 'popular_inclinks'
}
