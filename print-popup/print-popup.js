
let Store = require('electron-store');
const store = new Store();

$(document).ready(function () {

    debugger
    let printString = store.get('PrintString');

    loadDayEndReport(printString)

});

function loadDayEndReport(printString) {
    const base64Pdf = printString;
    const pdfViewer = document.getElementById("pdfViewer")
    pdfViewer.src = "data:application/pdf;base64," + base64Pdf
}
$.fn.Cancel = function () {
   // store.set('isWindowOpen',false)
    window.close();
}
