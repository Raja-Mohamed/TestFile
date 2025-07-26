let Store = require('electron-store');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
let BillsForView = '';
let myInterval;
let BillingdbService = require('../database/billingdb');
const EncrDecrService = require('../services/encrypt-decrypt.service');
let SpecialRightsAccess = 0;
const printerService = require('../services/printer-service');
const TokenPrinterService = require('../services/Token-printer-service');
const KOTPrinterService = require('../services/KOT-printer-service');
const printerServicetodayreport = require('../services/previousbill-todayreport');
const printerServicewaiterreport = require('../services/previousbill-waiterreport');
const ErrorLog = require('../services/log');
let loginId;
let POSPassword = store.get('POSPassword')
let BillCounterName = store.get('BillCounterName')
var BillCounterId = store.get('BillCounterId')
var POSId = environment.POSId
let date = new Date();
let totalcashvalue;
let totalcardvalue;
let totalonlinevalue;
let IsDayend = 0;
let totalsalesvalue;
var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
var cancelDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
let todayDate = store.get('todayDate')
document.getElementById("Billcounter").innerHTML = BillCounterName;
document.getElementById("datepicker").value = todayDate;
const showLoading = function () {
    debugger;
    Swal.fire({
        title: 'Please Wait',
        allowEscapeKey: false,
        allowOutsideClick: false,
        background: '#FFFFFF',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },

    });
};
let IsAllowReprint = store.get('IsAllowReprint');
let IsAllowReprintPassword = store.get('IsAllowReprintPassword');
let ReprintCount = store.get('ReprintCount');
let ReprintPassword = store.get('ReprintPassword');
let IsAllowKOTReprint = store.get('IsAllowKOTReprint');
let IsAllowKOTReprintPassword = store.get('IsAllowKOTReprintPassword');
let KOTReprintCount = store.get('KOTReprintCount');
let KOTReprintPassword = store.get('KOTReprintPassword');
$("#printWaiterReport").hide();
$("#previewWaiterReport").hide();
// $("#HOURS").hide();
// $("#MINUTES").hide();
$("#Timepicker").hide();

var previousBills = [];
var previousBillsTemp = []

$(function () {

    // time details
    displayDateTime();
    loadServiceTypesForBillCounter();
    // var hr = 24;
    // for (i = 0; i < hr; i++) {
    //     if (i < 10) {
    //         if (i == 0) {
    //             $("#deliveryhours").append('<option value="0">00</option>');
    //         } else {
    //             $("#deliveryhours").append('<option value="0' + i + '">0' + i + '</option>');
    //         }
    //     }
    //     else {
    //         $("#deliveryhours").append('<option value="' + i + '">' + i + '</option>');
    //     }
    // }
    // var mi = 60;
    // for (i = 0; i < mi; i++) {
    //     if (i < 10) {
    //         $("#deliveryminutes").append('<option value="0' + i + '">0' + i + '</option>');
    //     }
    //     else {
    //         $("#deliveryminutes").append('<option value="' + i + '">' + i + '</option>');
    //     }
    // }

    // for (i = 0; i < mi; i++) {
    //     if (i < 10) {
    //         $("#deliveryseconds").append('<option value="0' + i + '">0' + i + '</option>');
    //     }
    //     else {
    //         $("#deliveryseconds").append('<option value="' + i + '">' + i + '</option>');
    //     }
    // }

    // var ampm = ['AM', 'PM'];
    // for (i = 0; i < ampm.length; i++) {
    //     $("#deliveryampm").append('<option value="' + ampm[i] + '">' + ampm[i] + '</option>');
    // }

    let date = new Date();
    // let AMPM = date.getHours() >= 12 ? ' PM' : ' AM';
    // let dateString = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    let dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    let seconds = ("0" + date.getSeconds()).slice(-2);
    //let timeString = hours + ":" + minutes + ":" + seconds;
    // document.getElementById('deliveryhours').value = hours;
    // document.getElementById('deliveryminutes').value = minutes;
    // document.getElementById('deliveryampm').value = AMPM;
    document.getElementById('myTime').value = hours + ":" + minutes;

    // datepicker details
    $("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd/mm/yy",
        maxDate: new Date(),

        onSelect: function (dateText) {

            var initialDate = dateText.split(/\//);
            let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))

            serverDate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
            BillsForView = '';
            document.getElementById("SearchBill").value = "";
            document.getElementById("type").value = "";
            if (serverDate < dateString) {
                document.getElementById('myTime').value = "23:59";
            }
            else {
                let date = new Date();
                let hours = ("0" + date.getHours()).slice(-2);
                let minutes = ("0" + date.getMinutes()).slice(-2);
                document.getElementById('myTime').value = hours + ":" + minutes;
            }
            // showLoading();
            let item = {
                "serverDate": serverDate,
                "BillCounterId": BillCounterId
            }
            BillingdbService.getIsDayEnd(item).then((result) => {
                debugger
                IsDayend = result.IsDayEnd
                //   console.log("IsDayend", IsDayend)
            })
            loadSaleBills();

        }
    });
})


function displayDateTime() {
    myInterval = setInterval(function () {
        let date = new Date();
        let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
        let dateString = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        let hr = ("0" + date.getHours()).slice(-2);
        let min = ("0" + date.getMinutes()).slice(-2);
        let sec = ("0" + date.getSeconds()).slice(-2);
        // dateString = dateString + " - " + hr + ":" + min + ":" + sec + ampm;
        dateString = hr + ":" + min + ":" + sec + ampm;
        document.getElementById('currentDateTime').innerHTML = dateString;
    }, 1000);
}


function loadServiceTypesForBillCounter() {

    let item = {
        "BillCounterId": store.get('BillCounterId'),
    }

    BillingdbService.getBillCounterServiceTypes(item).then((result) => {
        let res = result;
        if (res.Status == "valid") {
            let services = res.Data;
            let serviceTypeindex = services.filter(x => x.ServiceType == "Dine-In" || x.ServiceType == "Take Away"  || x.ServiceType == "Sweetshop" || x.ServiceType == "DineIn-Self Service");
            if (serviceTypeindex.length > 0) {
                $("#printWaiterReport").show();
                $("#previewWaiterReport").show();
                // $("#HOURS").show();
                // $("#MINUTES").show();
                $("#Timepicker").show();
            } else {
                $("#printWaiterReport").hide();
                $("#previewWaiterReport").hide();
                // $("#HOURS").hide();
                // $("#MINUTES").hide();
                $("#Timepicker").hide();
            }
        }
        else if (res.Status == 'invalid') {
            Swal.fire('Oops!',
                res.Error,
                'warning'
            );
        }
        else {
            Swal.fire(
                'Oops!',
                res.Error,
                'warning'
            );
        }
    },
        (error) => {
            ErrorLog.writeLogFile('getBillCounterServiceTypes', error)

        });
}


$.fn.Cancel = function () {
    window.close();
}

document.onkeyup = function (e) {
    if (e.which == 27 && e.code == 'Escape') {
        window.close();
    }

    else {
        return;
    }
};


$(document).ready(function () {


    showLoading();
    setTimeout(function () {


        loadSaleBills()
    }, 1000)





});

function loadSaleBills() {
    debugger;
    showLoading();

    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: serverDate
    }

    BillingdbService.getPreviousBills(item).then(
        (data) => {
            debugger;

            // Swal.close();
            if (data.length > 0) {
                previousBills = data;
                previousBillsTemp = data
                preBills(previousBills)

            } else {
                Swal.close();
                $('#bills_list').empty();
                document.getElementById("Totalcash").innerHTML = "Total Cash:" + " " + "0.00"
                document.getElementById("Totalcard").innerHTML = "Total Card:" + " " + "0.00"
                document.getElementById("Totalonline").innerHTML = "Total Online:" + " " + " 0.00"
                document.getElementById("TotalSales").innerHTML = "Total Sales:" + " " + " 0.00"

            }
        },
        (error) => {
            Swal.close();
            ErrorLog.writeLogFile('loadSaleBills', error)
        }
    )
}


function preBills(previousBills) {
    debugger
    //showLoading();
    let NonCancelBills = []
    NonCancelBills = previousBills.filter(x => x.IsCancelled == 0)
    let counter = 0;
    let SpecialRights = store.get('SpecialRights')
    if (NonCancelBills.length != 0) {
        totalcashvalue = NonCancelBills.map(row => (row.CashAmount)).reduce((prev, next) => prev + next);
        totalcardvalue = NonCancelBills.map(row => (row.CardAmount)).reduce((prev, next) => prev + next);
        totalonlinevalue = NonCancelBills.map(row => (row.OnlineAmount)).reduce((prev, next) => prev + next);
        totalsalesvalue = (totalcashvalue + totalcardvalue + totalonlinevalue)
        document.getElementById("Totalcash").innerHTML = "Total Cash:" + " " + parseFloat(totalcashvalue).toFixed(2)
        document.getElementById("Totalcard").innerHTML = "Total Card:" + " " + parseFloat(totalcardvalue).toFixed(2)
        document.getElementById("Totalonline").innerHTML = "Total Online:" + " " + parseFloat(totalonlinevalue).toFixed(2)
        document.getElementById("TotalSales").innerHTML = "Total Sales:" + " " + parseFloat(totalsalesvalue).toFixed(2)
    } else {
        document.getElementById("Totalcash").innerHTML = "Total Cash:" + " " + "0.00"
        document.getElementById("Totalcard").innerHTML = "Total Card:" + " " + "0.00"
        document.getElementById("Totalonline").innerHTML = "Total Online:" + " " + " 0.00"
        document.getElementById("TotalSales").innerHTML = "Total Sales:" + " " + " 0.00"
    }



    debugger
    SplAccess = SpecialRights[0].Access;
    $('#bills_list').empty();
    //let totalAmount = previousBills.filter(row => row.BillNo==Searchstring);

    // New Append method for Data render speed increase

    // if (previousBills.length > 0) {
    //     //console.log("previousBills", previousBills)
    //     var tablearea = document.getElementById('bills_list')

    //     for (var i = 0; i < previousBills.length; i++) {
    //         if(previousBills[i].IsCancelled == 0){ // Not Cancel bill Numbers

    //             let tr = document.createElement('tr');

    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right' ;
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'center';
    //             tr.appendChild( document.createElement('td')).style.cssText= 'color:green;font-size:18px; cursor:pointer;';
    //             tr.appendChild( document.createElement('td'));
    //             tr.appendChild( document.createElement('td'));

    //             tr.cells[0].appendChild( document.createTextNode(previousBills[i].DisplayBillNo) );
    //             tr.cells[1].appendChild( document.createTextNode(previousBills[i].BillTime));
    //             tr.cells[2].appendChild( document.createTextNode(previousBills[i].TotalAmount.toFixed(2)));
    //             tr.cells[3].appendChild( document.createTextNode(previousBills[i].TotalGST.toFixed(2)) );
    //             tr.cells[4].appendChild( document.createTextNode(previousBills[i].RoundOff.toFixed(2)));
    //             tr.cells[5].appendChild( document.createTextNode(previousBills[i].NetAmount.toFixed(2)));
    //             tr.cells[6].appendChild( document.createTextNode(previousBills[i].ServiceType));
    //             tr.cells[7].appendChild( document.createTextNode(previousBills[i].CashAmount.toFixed(2)));
    //             tr.cells[8].appendChild( document.createTextNode(previousBills[i].CardAmount.toFixed(2)));
    //             tr.cells[9].appendChild( document.createTextNode(previousBills[i].OnlineAmount.toFixed(2)));

    //             if (previousBills[i].IsPaid) {
    //                 tr.cells[10].appendChild( document.createTextNode('Cash'));
    //                 tr.cells[11].appendChild( document.createElement('span')).className= 'glyphicon glyphicon-ok';
    //             }
    //             else if (previousBills[i].IsComplimentary) {
    //                 tr.cells[10].appendChild( document.createTextNode('Complimentary'));
    //             }
    //             else if (previousBills[i].IsCreditBill) {
    //                 tr.cells[10].appendChild( document.createTextNode('Credit'));
    //             }
    //             else {
    //                 tr.cells[10].appendChild( document.createTextNode('Unpaid'));
    //                 tr.cells[11].appendChild( document.createElement('span'));
    //             }
    //             if (previousBills[i].ServiceType != "Sweetshop") {
    //                 let editbtn1 = document.createElement('span'); 
    //                 editbtn1.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn1.className= "glyphicon glyphicon-phone";
    //                 editbtn1.onclick = (function(i){ return function(){ 
    //                     KOTBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn1);

    //                 // let editbtn2 = document.createElement('span'); 
    //                 // editbtn2.innerHTML = "&nbsp";
    //                 // tr.cells[12].appendChild(editbtn2);

    //                 let editbtn3 = document.createElement('span'); 
    //                 editbtn3.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn3.className= "glyphicon glyphicon-file";
    //                 editbtn3.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId,1)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn3);

    //                 // let editbtn4 = document.createElement('span'); 
    //                 // editbtn4.innerHTML = "&nbsp";
    //                 // tr.cells[12].appendChild(editbtn4);

    //                 let editbtn5 = document.createElement('span'); 
    //                 editbtn5.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn5.className= "glyphicon glyphicon-print";
    //                 editbtn5.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn5);
    //             }
    //             else{
    //                 let editbtn3 = document.createElement('span'); 
    //                 editbtn3.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn3.className= "glyphicon glyphicon-file";
    //                 editbtn3.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId,1)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn3);

    //                 // let editbtn4 = document.createElement('span'); 
    //                 // editbtn4.innerHTML = "&nbsp";
    //                 // tr.cells[12].appendChild(editbtn4);

    //                 let editbtn5 = document.createElement('span'); 
    //                 editbtn5.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn5.className= "glyphicon glyphicon-print";
    //                 editbtn5.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn5);
    //             }
    //             if (SplAccess == 1) {

    //                 let editbtn5 = document.createElement('span'); 
    //                 editbtn5.style.cssText= 'color:red;font-size:20px; cursor:pointer;'
    //                 editbtn5.className= "glyphicon glyphicon-remove";
    //                 editbtn5.id= "cancel_"+(previousBills[i].SaleHeaderId);
    //                 editbtn5.onclick = (function(i){ return function(){ 
    //                     CancelBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn5);
    //             }
    //             tablearea.appendChild(tr);
    //         }
    //         else { //  Cancel bill Numbers

    //             let tr = document.createElement('tr');
    //             tr.style.backgroundColor = '#f55858';

    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right' ;
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'right';
    //             tr.appendChild( document.createElement('td')).style.textAlign= 'center';
    //             tr.appendChild( document.createElement('td')).style.cssText= 'color:green;font-size:18px; cursor:pointer;';
    //             tr.appendChild( document.createElement('td'));
    //             tr.appendChild( document.createElement('td'));
    //             tr.appendChild( document.createElement('td'));
    //             //.style.cssText= 'color:red;font-size:20px; cursor:pointer;';

    //             tr.cells[0].appendChild( document.createTextNode(previousBills[i].DisplayBillNo) );
    //             tr.cells[1].appendChild( document.createTextNode(previousBills[i].BillTime));
    //             tr.cells[2].appendChild( document.createTextNode(previousBills[i].TotalAmount.toFixed(2)));
    //             tr.cells[3].appendChild( document.createTextNode(previousBills[i].TotalGST.toFixed(2)) );
    //             tr.cells[4].appendChild( document.createTextNode(previousBills[i].RoundOff.toFixed(2)));
    //             tr.cells[5].appendChild( document.createTextNode(previousBills[i].NetAmount.toFixed(2)));
    //             tr.cells[6].appendChild( document.createTextNode(previousBills[i].ServiceType));
    //             tr.cells[7].appendChild( document.createTextNode(previousBills[i].CashAmount.toFixed(2)));
    //             tr.cells[8].appendChild( document.createTextNode(previousBills[i].CardAmount.toFixed(2)));
    //             tr.cells[9].appendChild( document.createTextNode(previousBills[i].OnlineAmount.toFixed(2)));

    //             let editbtn1 = document.createElement('span'); 
    //             editbtn1.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //             editbtn1.innerHTML = "Cancelled";
    //             editbtn1.style.cssText= 'text-align:center;'
    //             tr.cells[10].appendChild(editbtn1);

    //             if (previousBills[i].ServiceType!= "Sweetshop") {
    //                 let editbtn1 = document.createElement('span'); 
    //                 editbtn1.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn1.className= "glyphicon glyphicon-phone";
    //                 editbtn1.onclick = (function(i){ return function(){ 
    //                     KOTBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn1);

    //                 // let editbtn2 = document.createElement('span'); 
    //                 // editbtn2.innerHTML = "&nbsp";
    //                 // tr.cells[12].appendChild(editbtn2);

    //                 let editbtn3 = document.createElement('span'); 
    //                 editbtn3.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn3.className= "glyphicon glyphicon-file";
    //                 editbtn3.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId,1)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn3);

    //                 // let editbtn4 = document.createElement('span'); 
    //                 // editbtn4.innerHTML = "&nbsp";
    //                 // tr.cells[12].appendChild(editbtn4);

    //                 let editbtn5 = document.createElement('span'); 
    //                 editbtn5.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn5.className= "glyphicon glyphicon-print";
    //                 editbtn5.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn5);

    //                 // let editbtn6 = document.createElement('hr'); 
    //                 // tr.cells[12].appendChild(editbtn6);

    //             }
    //             else {
    //                 let editbtn3 = document.createElement('span'); 
    //                 editbtn3.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn3.className= "glyphicon glyphicon-file";
    //                 editbtn3.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId,1)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn3);

    //                 // let editbtn4 = document.createElement('span'); 
    //                 // editbtn4.innerHTML = "&nbsp";
    //                 // tr.cells[12].appendChild(editbtn4);

    //                 let editbtn5 = document.createElement('span'); 
    //                 editbtn5.style.cssText= 'color:green;font-size:18px; cursor:pointer;'
    //                 editbtn5.className= "glyphicon glyphicon-print";
    //                 editbtn5.onclick = (function(i){ return function(){ 
    //                     printBill(previousBills[i].SaleHeaderId)
    //                 }})(i);
    //                 tr.cells[12].appendChild(editbtn5);

    //                 // let editbtn6 = document.createElement('hr'); 
    //                 // tr.cells[12].appendChild(editbtn6);
    //             }
    //             tablearea.appendChild(tr);
    //         }
    //     }
    //     Swal.close();
    // }
    // else {
    //     Swal.close();
    // }

    // Old table Render Method
    debugger
    BillsForView += `<tr>
        <th>Bill No</th>
        <th>Bill Time</td>
        <th style="text-align:right">Bill Value</th>
        <th style="text-align:right">Tax</th>
        <th style="text-align:right">Round off</th>
        <th style="text-align:right">Net Amount</th>
        <th style="text-align:right">Service Type</th>
        <th style="text-align:right">Cash</th>
        <th style="text-align:right">Card</th>
        <th style="text-align:right">Online</th>
        <th style="text-align:center">Bill Type</th>
     
        <th>Paid</th>
        <th>Actions</th></tr>`
    debugger
    if (previousBills.length > 0) {
        previousBills.forEach((bills, index) => {
            counter++;
            debugger;
            if (bills.IsCancelled == 0) {
                BillsForView += `<tr>
                <td>${bills.DisplayBillNo}</td>
                <td>${bills.BillTime}</td>
                <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.ServiceType}</td>
                <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`

                if (bills.IsPaid) {
                    //BillsForView += `<td style="text-align:center"><span >Cash</span></td>`
                    BillsForView += `<td style="text-align:center"><span >${PaymentTypeCheck(bills)}</span></td>`
                }
                else if (bills.IsComplimentary) {
                    BillsForView += `<td style="text-align:center"><span>Complimentary</span></td>`
                }
                else if (bills.IsCreditBill) {
                    BillsForView += `<td style="text-align:center"><span>Credit</span></td>`
                }
                else {
                    BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                }


                if (bills.IsPaid) {
                    BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span>
                    &nbsp<span class="badge" style=" background-color: ${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}" >${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice || bills.PaymentDevice == environment.PaytmUrl.PaymentDevice ? 'p' : ''}</span>
                    <span>&nbsp</span><span>&nbsp</span></td>`
                }
                else {
                    BillsForView += `<td><span></span></td>`
                }

                if (bills.ServiceType != "Sweetshop") {
                    BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                } else {
                    BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                }
                debugger
                if (SplAccess == 1 && IsDayend != 1 && bills.ServiceType != "Catering") {
                    // `<td>test</td>`
                    // minDate: new Date()
                    BillsForView += `<span style="color:red ;font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                }

                $('#bills_list').html(BillsForView);
            }
            else {
                BillsForView += `<tr style="background-color:#f55858">
            <td>${bills.DisplayBillNo}</td>
            <td>${bills.BillTime}</td>
            <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
            <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
            <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
            <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
            <td style="text-align:right">${bills.ServiceType}</td>
            <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
            <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
            <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                BillsForView += `<td style="text-align:center"><span>Cancelled</span></td>`

                if (bills.ServiceType != "Sweetshop") {
                    BillsForView += `<td><span></span></td>
                    <td>
                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span>
                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                    </tr><hr>`;
                }
                else {
                    BillsForView += `<td><span></span></td>
                    <td><span>&emsp;</span><span>&nbsp;</span>
                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                    </tr><hr>`;
                }

                $('#bills_list').html(BillsForView);
            }

        });
        Swal.close();
    }
    else {
        Swal.close();
        $('#bills_list').html(BillsForView);
    }
}

$.fn.myFunction = function () {

    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

}
var printBill = $.fn.printBill = function (SaleHeaderId, view) {
    debugger

    if (SaleHeaderId != 0 || SaleHeaderId != undefined) {

        if (view != 1) {
            let date = new Date();
            var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            var servertime = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

            if (IsAllowReprint == 1) {
                BillingdbService.getSaleHeaderforPrintCount(SaleHeaderId).then((res) => {
                    debugger
                    let printcount = res.PrintCount;
                    let BillNo = res.BillNo;
                    let Amount = res.NetAmount;             
                    //if (printcount == 0) {
                    if (printcount < +ReprintCount) {
                        debugger
                     
                        if (IsAllowReprintPassword == 1) {
                            Swal.fire({
                                title: view == 1 ? 'Are you Sure to Preview the Bill ' + `<br><strong>` + BillNo + `</strong>` + '?' : 'Are you Sure to Reprint the Bill ' + `<br><strong>` + BillNo + `</strong>` + '?',
                                showCancelButton: true,
                                icon: 'question',
                                html: `<input type="password"  placeholder="Enter Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br><textarea  placeholder="Enter the Reason for Bill Reprint " id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br>
                                        <input type="checkbox" onclick="$(this).myFunction()"> Show Password `,
                                confirmButtonText: 'Yes',
                                cancelButtonText: 'No',
                            }).then((result) => {

                                let Password = document.getElementById('password').value.trim()

                                if (result.isConfirmed) {

                                    if (Password != '') {
                                        if (Password == ReprintPassword) {

                                            let ReprintReason = document.getElementById('Description').value.trim()

                                            if (ReprintReason != '' && ReprintReason != ' ') {
                                                printerService.getBillCounterdetail(SaleHeaderId, view).then((res) => {
                                                    let loginId;
                                                    if (store.get('IsOnline') == 'true') {
                                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                                    }
                                                    else {
                                                        loginId = store.get('Ref')
                                                    }
                                                    let saleHeaderList = {
                                                        SaleHeaderId: SaleHeaderId,
                                                        BillNo: BillNo,
                                                        Amount: Amount,
                                                        SaleDate: serverDate,
                                                        ReprintReason: ReprintReason,
                                                        CashierName: store.get('DisplayName'),
                                                        BillCounterId: store.get('BillCounterId'),
                                                        CreatedBy: loginId,
                                                        Type: "Bill",
                                                        CreatedOn: serverDate + servertime,
                                                        PrintCount: (printcount + 1)
                                                    }
                                                    BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                        //      console.log("rs", rs)
                                                        ErrorLog.writeLogFile('addReprintLogs', SaleHeaderId)
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('addReprintLogs', err)
                                                    })

                                                    BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                        debugger
                                                        ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                                    })
                                                })
                                            } else {
                                                Swal.fire({
                                                    title: 'Please Enter the Reason for Reprint Bill..!',
                                                    icon: 'warning',
                                                    showCancelButton: false,
                                                    confirmButtonText: 'Ok'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        printBill(SaleHeaderId, view)
                                                    }
                                                })
                                            }
                                        } else {
                                            Swal.fire({
                                                title: 'Invalid Password..!',
                                                icon: 'error',
                                                showCancelButton: false,
                                                confirmButtonText: 'Ok'
                                            }).then((result) => {
                                                printBill(SaleHeaderId, view)
                                            })
                                        }


                                    } else {
                                        Swal.fire({
                                            title: 'Please Enter the Password for Reprint Bill..!',
                                            icon: 'warning',
                                            showCancelButton: false,
                                            confirmButtonText: 'Ok'
                                        }).then((result) => {
                                            if (result.isConfirmed) {

                                                printBill(SaleHeaderId, view)

                                            }
                                        })
                                    }


                                }

                            })
                        }
                        else {


                            Swal.fire({
                                title: view == 1 ? 'Are you Sure to Preview the Bill ' + `<br><strong>` + BillNo + `</strong>` + '?' : 'Are you Sure to Reprint the Bill ' + `<br><strong>` + BillNo + `</strong>` + '?',
                                showCancelButton: true,
                                icon: 'question',
                                html: `<textarea  placeholder="Enter the Reason for Bill Reprint " id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br> `,
                                confirmButtonText: 'Yes',
                                cancelButtonText: 'No',
                            }).then((result) => {

                                if (result.isConfirmed) {

                                    let ReprintReason = document.getElementById('Description').value.trim()

                                    if (ReprintReason != '' && ReprintReason != ' ') {


                                        printerService.getBillCounterdetail(SaleHeaderId, view).then((res) => {
                                            debugger
                                            let loginId;
                                            if (store.get('IsOnline') == 'true') {
                                                loginId = EncrDecrService.decrypt(store.get('Ref'))
                                            }
                                            else {
                                                loginId = store.get('Ref')
                                            }
                                            let saleHeaderList = {
                                                SaleHeaderId: SaleHeaderId,
                                                BillNo: BillNo,
                                                Amount: Amount,
                                                SaleDate: serverDate,
                                                ReprintReason: ReprintReason,
                                                CashierName: store.get('DisplayName'),
                                                BillCounterId: store.get('BillCounterId'),
                                                CreatedBy: loginId,
                                                Type: "Bill",
                                                CreatedOn: serverDate + servertime,
                                                PrintCount: (printcount + 1)
                                            }
                                            BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                //          console.log("rs", rs)
                                                ErrorLog.writeLogFile('addReprintLogs', SaleHeaderId)
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('addReprintLogs', err)
                                            })

                                            BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                debugger
                                                ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('updateSaleHeaderPrintCount failure', err)
                                            })
                                        })
                                    } else {
                                        Swal.fire({
                                            title: 'Please Enter the Reason for Reprint Bill..!',
                                            icon: 'warning',
                                            showCancelButton: false,
                                            confirmButtonText: 'Ok'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                printBill(SaleHeaderId, view)
                                            }
                                        })
                                    }
                                }
                            })

                        }

                    }
                    else {
                        debugger
                        Swal.fire({
                            title: 'Print Limit Exceeded ..!',
                            icon: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                        })
                        // Swal.fire({
                        //     title: view == 1 ? 'Are you Sure to Preview the Bill?' : 'Are you Sure to Reprint the Bill?',
                        //     showCancelButton: true,
                        //     icon: 'question',
                        //     html: `<input type="password"  placeholder="Enter Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br>
                        //             <input type="checkbox" onclick="$(this).myFunction()"> Show Password `,
                        //     confirmButtonText: 'Yes',
                        //     cancelButtonText: 'No',
                        // }).then((result) => {

                        //     let Password = document.getElementById('password').value.trim()

                        //     if (result.isConfirmed) {

                        //         if (Password != '') {
                        //             if (Password == POSPassword[0].AdminPassword) {

                        //                 printerService.getBillCounterdetail(SaleHeaderId, view).then((res) => {

                        //                     let saleHeaderList = {
                        //                         SaleHeaderId: SaleHeaderId,
                        //                         PrintCount: (printcount + 1)
                        //                     }
                        //                     BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                        //                         debugger
                        //                         ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                        //                     })
                        //                 })

                        //             } else {
                        //                 Swal.fire({
                        //                     title: 'Invalid Password..!',
                        //                     icon: 'error',
                        //                     showCancelButton: false,
                        //                     confirmButtonText: 'Ok'
                        //                 }).then((result) => {
                        //                     printBill(SaleHeaderId, view)
                        //                 })
                        //             }


                        //         } else {
                        //             Swal.fire({
                        //                 title: 'Please Enter the Password for Reprint Bill..!',
                        //                 icon: 'warning',
                        //                 showCancelButton: false,
                        //                 confirmButtonText: 'Ok'
                        //             }).then((result) => {
                        //                 if (result.isConfirmed) {

                        //                     printBill(SaleHeaderId, view)

                        //                 }
                        //             })
                        //         }


                        //     }

                        // })
                    }
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Reprinting is not permitted. Please contact the administrator...!',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'ok'
                })
            }

        }

        else {

            printerService.getBillCounterdetail(SaleHeaderId, view).then((res) => {

            })

        }



    } else {
        Swal.fire({
            title: 'Please Choose Bill?',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        })
    }


}
var KOTBill = $.fn.KOTBill = function (SaleHeaderId) {
    let date = new Date();
    var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    var servertime = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

    let IsKOTPrint = store.get('IsKOTPrint')

    if (SaleHeaderId != 0 || SaleHeaderId != undefined) {

        // Swal.fire({
        //     title: 'Are you Sure to Reprint the KOT?',
        //     showCancelButton: true,
        //     icon: 'question',
        //     html: `<input type="password"  placeholder="Enter KOT Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br>
        //     <input type="checkbox" onclick="$(this).myFunction()"> Show Password `,
        //     confirmButtonText: 'Yes',
        //     cancelButtonText: 'No',
        // }).then((result) => {

        //     let Password = document.getElementById('password').value.trim()

        //     if (result.isConfirmed) {

        //         if (Password != '') {
        //             if (Password == POSPassword[0].KOTPassword) {

        //                 TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {

        //                 }).then(async (result2) => {
        //                     await KOTPrinterService.getSaleBilldetail(SaleHeaderId).then((res1) => {

        //                     }).catch((err) => {
        //                         ErrorLog.writeLogFile('KOTPrinterService', err)
        //                     })
        //                 }).catch((error) => {
        //                     ErrorLog.writeLogFile('TokenPrinterService', error)
        //                 })

        //             } else {
        //                 Swal.fire({
        //                     title: 'Invalid Password..!',
        //                     icon: 'error',
        //                     showCancelButton: false,
        //                     confirmButtonText: 'Ok'
        //                 }).then((result) => {
        //                     KOTBill(SaleHeaderId)
        //                 })
        //             }


        //         } else {
        //             Swal.fire({
        //                 title: 'Please Enter the Password for Reprint KOT..!',
        //                 icon: 'warning',
        //                 showCancelButton: false,
        //                 confirmButtonText: 'Ok'
        //             }).then((result) => {
        //                 if (result.isConfirmed) {

        //                     KOTBill(SaleHeaderId)

        //                 }
        //             })
        //         }


        //     }

        // })

        if (IsAllowKOTReprint == 1) {
            BillingdbService.getSaleHeaderforKOTPrintCount(SaleHeaderId).then((res) => {
                debugger
                let kotprintcount = res.KOTPrintCount;
                let BillNo = res.BillNo;
                let Amount = res.NetAmount;
                //if (printcount == 0) {
                if (kotprintcount < +KOTReprintCount) {
                    debugger

                    if (IsAllowKOTReprintPassword == 1) {
                        Swal.fire({
                            title: 'Are you Sure to Reprint the KOT ' + `<br><strong>` + BillNo + `</strong>` + '?',
                            showCancelButton: true,
                            icon: 'question',
                            html: `<input type="password"  placeholder="Enter KOT Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br><textarea  placeholder="Enter the Reason for KOT Reprint" id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br><input type="checkbox" onclick="$(this).myFunction()"> Show Password `,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                        }).then((result) => {

                            let Password = document.getElementById('password').value.trim()

                            if (result.isConfirmed) {

                                if (Password != '') {
                                    if (Password == KOTReprintPassword) {

                                        let ReprintReason = document.getElementById('Description').value.trim()

                                        if (ReprintReason != '' && ReprintReason != ' ') {

                                            TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {

                                            }).then(async (result2) => {
                                                let loginId;
                                                if (store.get('IsOnline') == 'true') {
                                                    loginId = EncrDecrService.decrypt(store.get('Ref'))
                                                }
                                                else {
                                                    loginId = store.get('Ref')
                                                }
                                                let saleHeaderList = {
                                                    SaleHeaderId: SaleHeaderId,
                                                    BillNo: BillNo,
                                                    Amount: Amount,
                                                    SaleDate: serverDate,
                                                    ReprintReason: ReprintReason,
                                                    CashierName: store.get('DisplayName'),
                                                    BillCounterId: store.get('BillCounterId'),
                                                    CreatedBy: loginId,
                                                    Type: "KOT/TOKEN",
                                                    CreatedOn: serverDate + servertime,
                                                    KOTPrintCount: (kotprintcount + 1)
                                                }
                                                BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                    //      console.log("rs", rs)
                                                    ErrorLog.writeLogFile('addReprintLogs', SaleHeaderId)
                                                }).catch((err) => {
                                                    ErrorLog.writeLogFile('addReprintLogs', err)
                                                })

                                                BillingdbService.updateSaleHeaderKOTPrintCount(saleHeaderList).then((res) => {
                                                    debugger
                                                    ErrorLog.writeLogFile('updateSaleHeaderKOTPrintCount success', res)
                                                })
                                                if (IsKOTPrint == 1) {
                                                    await KOTPrinterService.getSaleBilldetail(SaleHeaderId).then((res1) => {
                                                        debugger

                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('KOTPrinterService', err)
                                                    })
                                                } else {
                                                    ErrorLog.writeLogFile('KOTPrinterService', "IsKOTPrint==0")
                                                }
                                            }).catch((error) => {
                                                ErrorLog.writeLogFile('TokenPrinterService', error)
                                            })

                                        } else {
                                            Swal.fire({
                                                title: 'Please Enter the Reason for Reprint KOT..!',
                                                icon: 'warning',
                                                showCancelButton: false,
                                                confirmButtonText: 'Ok'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    KOTBill(SaleHeaderId)
                                                }
                                            })
                                        }




                                    } else {
                                        Swal.fire({
                                            title: 'Invalid Password..!',
                                            icon: 'error',
                                            showCancelButton: false,
                                            confirmButtonText: 'Ok'
                                        }).then((result) => {
                                            KOTBill(SaleHeaderId)
                                        })
                                    }


                                } else {
                                    Swal.fire({
                                        title: 'Please Enter the Password for Reprint KOT..!',
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'Ok'
                                    }).then((result) => {
                                        if (result.isConfirmed) {

                                            KOTBill(SaleHeaderId)

                                        }
                                    })
                                }


                            }

                        })
                    }
                    else {

                        Swal.fire({
                            title: 'Are you Sure to Reprint the KOT ' + `<br><strong>` + BillNo + `</strong>` + '?',
                            showCancelButton: true,
                            icon: 'question',
                            html: `<textarea  placeholder="Enter the Reason for KOT Reprint" id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br>`,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                        }).then((result) => {

                            if (result.isConfirmed) {

                                let ReprintReason = document.getElementById('Description').value.trim()

                                if (ReprintReason != '' && ReprintReason != ' ') {

                                    TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {

                                    }).then(async (result2) => {
                                        debugger


                                        let loginId;
                                        if (store.get('IsOnline') == 'true') {
                                            loginId = EncrDecrService.decrypt(store.get('Ref'))
                                        }
                                        else {
                                            loginId = store.get('Ref')
                                        }
                                        let saleHeaderList = {
                                            SaleHeaderId: SaleHeaderId,
                                            BillNo: BillNo,
                                            Amount: Amount,
                                            SaleDate: serverDate,
                                            ReprintReason: ReprintReason,
                                            CashierName: store.get('DisplayName'),
                                            BillCounterId: store.get('BillCounterId'),
                                            CreatedBy: loginId,
                                            Type: "KOT/TOKEN",
                                            CreatedOn: serverDate + servertime,
                                            KOTPrintCount: (kotprintcount + 1)
                                        }
                                        BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                            //         console.log("rs", rs)
                                            ErrorLog.writeLogFile('addReprintLogs', SaleHeaderId)
                                        }).catch((err) => {
                                            ErrorLog.writeLogFile('addReprintLogs', err)
                                        })
                                        BillingdbService.updateSaleHeaderKOTPrintCount(saleHeaderList).then((res) => {
                                            debugger
                                            ErrorLog.writeLogFile('updateSaleHeaderKOTPrintCount success', res)
                                        })
                                        if (IsKOTPrint == 1) {
                                            await KOTPrinterService.getSaleBilldetail(SaleHeaderId).then((res1) => {
                                                debugger

                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('KOTPrinterService', err)
                                            })
                                        } else {
                                            ErrorLog.writeLogFile('KOTPrinterService', "IsKOTPrint==0")
                                        }
                                    }).catch((error) => {
                                        ErrorLog.writeLogFile('TokenPrinterService', error)
                                    })

                                } else {
                                    Swal.fire({
                                        title: 'Please Enter the Reason for Reprint KOT..!',
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'Ok'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            KOTBill(SaleHeaderId)
                                        }
                                    })
                                }
                            }
                        })


                    }

                }
                else {
                    debugger
                    Swal.fire({
                        title: 'Print Limit Exceeded..!',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Ok'
                    })

                }
            }).catch((err => {
                ErrorLog.writeLogFile('getSaleHeaderforKOTPrintCount', err)
            }))
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Reprinting is not permitted. Please contact the administrator...!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'ok'
            })
        }
    } else {
        Swal.fire({
            title: 'Please Choose Bill?',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        })
    }
}




$.fn.SearchBill = function () {
    debugger;
    let Searchstring = document.getElementById("SearchBill").value;
    let Billtype = document.getElementById("type").value;
    if (Billtype == 1) {

        let FilterBills = previousBillsTemp.filter(row => row.IsPaid == 1 || row.IsCreditBill == 1 || row.IsComplimentary == 1)
        if (Searchstring != '') {
            let SearchBills = FilterBills.filter(row => row.DisplayBillNo.trim().includes(Searchstring))
            $('#bills_list').empty();
            //let totalAmount = previousBills.filter(row => row.BillNo==Searchstring)
            BillsForView = ''
            BillsForView += `<tr>
            <th>Bill No</th>
            <th>Bill Time</td>
            <th style="text-align:right">Bill Value</th>
            <th style="text-align:right">GST</th>
            <th style="text-align:right">Round off</th>
            <th style="text-align:right">Net Amount</th>
            <th style="text-align:right">Service Type</th>
            <th style="text-align:right">Cash</th>
            <th style="text-align:right">Card</th>
            <th style="text-align:right">Online</th>
            <th style="text-align:center">Bill Type</th>
            <th>Paid</th>
            <th>Actions</th></tr>`
            if (SearchBills.length > 0) {


                SearchBills.forEach((bills, index) => {
                    if (bills.IsCancelled == 0) {
                        BillsForView += `<tr>
                        <td>${bills.DisplayBillNo}</td>
                        <td>${bills.BillTime}</td>
                        <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                        <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                        <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.ServiceType}</td>
                        <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                        if (bills.IsPaid) {
                            // BillsForView += `<td style="text-align:center"><span >Cash</span></td>`
                            BillsForView += `<td style="text-align:center"><span >${PaymentTypeCheck(bills)}</span></td>`
                        }
                        else if (bills.IsComplimentary) {
                            BillsForView += `<td style="text-align:center"><span >Complimentary</span></td>`
                        }
                        else if (bills.IsCreditBill) {
                            BillsForView += `<td style="text-align:center"><span >Credit</span></td>`
                        }
                        else {
                            BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                        }

                        if (bills.IsPaid) {
                            BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span>
                            &nbsp<span class="badge" style=" background-color: ${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}" >${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice || bills.PaymentDevice == environment.PaytmUrl.PaymentDevice ? 'p' : ''}</span>
                            <span>&nbsp</span><span>&nbsp</span></td>`
                        }
                        else {
                            BillsForView += `<td><span></span></td>`
                        }


                        if (bills.ServiceType != "Sweetshop") {
                            BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                        } else {
                            BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                        }

                        if (SplAccess == 1 && IsDayend != 1 && bills.ServiceType != "Catering") {
                            // `<td>test</td>`
                            BillsForView += `<span style="color:red; font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                        }

                        $('#bills_list').html(BillsForView);
                    }
                    else {
                        BillsForView += `<tr style="background-color:#f55858">
                        <td>${bills.DisplayBillNo}</td>
                        <td>${bills.BillTime}</td>
                        <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                        <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                        <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.ServiceType}</td>
                        <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                        BillsForView += `<td style="text-align:center"><span >Cancelled</span></td>`

                        if (bills.ServiceType != "Sweetshop") {
                            BillsForView += `<td><span></span></td>
                            <td>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                                  </tr><hr>`;
                        } else {
                            BillsForView += `<td><span></span></td>
                            <td><span>&emsp;</span><span>&nbsp;</span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                                  </tr><hr>`;
                        }

                        $('#bills_list').html(BillsForView);
                    }

                });

            }
            else {
                $('#bills_list').html(BillsForView);
            }


        }
    }
    else if (Billtype == 0 && Billtype != "") {
        let FilterBills = previousBillsTemp.filter(row => row.IsPaid == 0 && row.IsCreditBill == 0 && row.IsComplimentary == 0)
        // if (Searchstring != '') {
        let SearchBills = FilterBills.filter(row => row.DisplayBillNo.trim().includes(Searchstring))
        $('#bills_list').empty();
        //let totalAmount = previousBills.filter(row => row.BillNo==Searchstring)
        BillsForView = ''
        BillsForView += `<tr>
                <th>Bill No</th>
                <th>Bill Time</td>
                <th style="text-align:right">Bill Value</th>
                <th style="text-align:right">GST</th>
                <th style="text-align:right">Round off</th>
                <th style="text-align:right">Net Amount</th>
                <th style="text-align:right">Service Type</th>
                <th style="text-align:right">Cash</th>
                <th style="text-align:right">Card</th>
               <th style="text-align:right">Online</th>
                <th style="text-align:center">Bill Type</th>
                <th>Paid</th>
                <th>Actions</th></tr>`
        if (SearchBills.length > 0) {

            SearchBills.forEach((bills, index) => {
                if (bills.IsCancelled == 0) {
                    BillsForView += `<tr>
                            <td>${bills.DisplayBillNo}</td>
                            <td>${bills.BillTime}</td>
                            <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                            <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                            <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.ServiceType}</td>
                            <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                    if (bills.IsPaid) {
                        // BillsForView += `<td style="text-align:center"><span >Cash</span></td>`
                        BillsForView += `<td style="text-align:center"><span >${PaymentTypeCheck(bills)}</span></td>`
                    }
                    else if (bills.IsComplimentary) {
                        BillsForView += `<td style="text-align:center"><span >Complimentary</span></td>`
                    }
                    else if (bills.IsCreditBill) {
                        BillsForView += `<td style="text-align:center"><span >Credit</span></td>`
                    }
                    else {
                        BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                    }

                    if (bills.IsPaid) {
                        BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span>
                        &nbsp<span class="badge" style=" background-color: ${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}" >${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice || bills.PaymentDevice == environment.PaytmUrl.PaymentDevice ? 'p' : ''}</span>
                        <span>&nbsp</span><span>&nbsp</span></td>`
                    }
                    else {
                        BillsForView += `<td><span></span></td>`
                    }


                    if (bills.ServiceType != "Sweetshop") {
                        BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    } else {
                        BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    }

                    if (SplAccess == 1 && IsDayend != 1 && bills.ServiceType != "Catering") {
                        // `<td>test</td>`
                        BillsForView += `<span style="color:red; font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                    }

                    $('#bills_list').html(BillsForView);
                }
                else {
                    BillsForView += `<tr style="background-color:#f55858">
                            <td>${bills.DisplayBillNo}</td>
                            <td>${bills.BillTime}</td>
                            <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                            <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                            <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.ServiceType}</td>
                            <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                            <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                    BillsForView += `<td style="text-align:center"><span >Cancelled</span></td>`

                    if (bills.ServiceType != "Sweetshop") {
                        BillsForView += `<td><span></span></td>
                                <td>
                                <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span>
                                <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                                <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                                      </tr><hr>`;
                    } else {
                        BillsForView += `<td><span></span></td>
                                <td><span>&emsp;</span><span>&nbsp;</span>
                                <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                                <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                                      </tr><hr>`;
                    }

                    $('#bills_list').html(BillsForView);
                }

            });

        }
        else {
            $('#bills_list').html(BillsForView);
        }



    }
    else {
        if (Searchstring != '') {
            let SearchBills = previousBillsTemp.filter(row => row.DisplayBillNo.trim().includes(Searchstring))
            $('#bills_list').empty();
            //let totalAmount = previousBills.filter(row => row.BillNo==Searchstring)
            BillsForView = ''
            BillsForView += `<tr>
            <th>Bill No</th>
            <th>Bill Time</td>
            <th style="text-align:right">Bill Value</th>
            <th style="text-align:right">GST</th>
            <th style="text-align:right">Round off</th>
            <th style="text-align:right">Net Amount</th>
            <th style="text-align:right">Service Type</th>
            <th style="text-align:right">Cash</th>
            <th style="text-align:right">Card</th>
            <th style="text-align:right">Online</th>
            <th style="text-align:center">Bill Type</th>
            <th>Paid</th>
            <th>Actions</th></tr>`
            if (SearchBills.length > 0) {

                SearchBills.forEach((bills, index) => {
                    if (bills.IsCancelled == 0) {
                        BillsForView += `<tr>
                        <td>${bills.DisplayBillNo}</td>
                        <td>${bills.BillTime}</td>
                        <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                        <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                        <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.ServiceType}</td>
                        <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                        if (bills.IsPaid) {
                            //  BillsForView += `<td style="text-align:center"><span >Cash</span></td>`
                            BillsForView += `<td style="text-align:center"><span >${PaymentTypeCheck(bills)}</span></td>`
                        }
                        else if (bills.IsComplimentary) {
                            BillsForView += `<td style="text-align:center"><span >Complimentary</span></td>`
                        }
                        else if (bills.IsCreditBill) {
                            BillsForView += `<td style="text-align:center"><span >Credit</span></td>`
                        }
                        else {
                            BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                        }

                        if (bills.IsPaid) {
                            BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span>
                            &nbsp<span class="badge" style=" background-color: ${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}" >${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice || bills.PaymentDevice == environment.PaytmUrl.PaymentDevice ? 'p' : ''}</span>
                            <span>&nbsp</span><span>&nbsp</span></td>`
                        }
                        else {
                            BillsForView += `<td><span></span></td>`
                        }


                        if (bills.ServiceType != "Sweetshop") {
                            BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                        } else {
                            BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                        }

                        if (SplAccess == 1 && IsDayend != 1 && bills.ServiceType != "Catering") {
                            // `<td>test</td>`
                            BillsForView += `<span style="color:red; font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                        }

                        $('#bills_list').html(BillsForView);
                    }
                    else {
                        BillsForView += `<tr style="background-color:#f55858">
                        <td>${bills.DisplayBillNo}</td>
                        <td>${bills.BillTime}</td>
                        <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                        <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                        <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.ServiceType}</td>
                        <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                        BillsForView += `<td style="text-align:center"><span >Cancelled</span></td>`

                        if (bills.ServiceType != "Sweetshop") {
                            BillsForView += `<td><span></span></td>
                            <td>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                                  </tr><hr>`;
                        } else {
                            BillsForView += `<td><span></span></td>
                            <td><span>&emsp;</span><span>&nbsp;</span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                                  </tr><hr>`;
                        }

                        $('#bills_list').html(BillsForView);
                    }

                });

            }
            else {
                $('#bills_list').html(BillsForView);
            }


        }
        else {

            document.getElementById("SearchBill").value = '';
            //   let Billtype = document.getElementById("type").value;

            BillsForView = ''
            let counter = 0;
            let SpecialRights = store.get('SpecialRights')
            SplAccess = SpecialRights[0].Access;
            $('#bills_list').empty();
            //let totalAmount = previousBills.filter(row => row.BillNo==Searchstring)
            BillsForView += `<tr>
                <th>Bill No</th>
                <th>Bill Time</td>
                <th style="text-align:right">Bill Value</th>
                <th style="text-align:right">GST</th>
                <th style="text-align:right">Round off</th>
                <th style="text-align:right">Net Amount</th>
                <th style="text-align:right">Service Type</th>
                <th style="text-align:right">Cash</th>
                <th style="text-align:right">Card</th>
                <th style="text-align:right">Online</th>
                <th style="text-align:center">Bill Type</th>
                <th>Paid</th>
                <th>Actions</th></tr>`
            if (previousBills.length > 0) {

                previousBills.forEach((bills, index) => {
                    counter++;
                    if (bills.IsCancelled == 0) {
                        BillsForView += `<tr>
                    <td>${bills.DisplayBillNo}</td>
                    <td>${bills.BillTime}</td>
                    <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                    <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                    <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.ServiceType}</td>
                    <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                        if (bills.IsPaid) {
                            // BillsForView += `<td style="text-align:center"><span >Cash</span></td>`
                            BillsForView += `<td style="text-align:center"><span >${PaymentTypeCheck(bills)}</span></td>`
                        }
                        else if (bills.IsComplimentary) {
                            BillsForView += `<td style="text-align:center"><span>Complimentary</span></td>`
                        }
                        else if (bills.IsCreditBill) {
                            BillsForView += `<td style="text-align:center"><span>Credit</span></td>`
                        }
                        else {
                            BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                        }


                        if (bills.IsPaid) {
                            BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span>
                            &nbsp<span class="badge" style=" background-color: ${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}" >${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice || bills.PaymentDevice == environment.PaytmUrl.PaymentDevice ? 'p' : ''}</span>
                            <span>&nbsp</span><span>&nbsp</span></td>`
                        }
                        else {
                            BillsForView += `<td><span></span></td>`
                        }

                        if (bills.ServiceType != "Sweetshop") {
                            BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                        } else {
                            BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                        }

                        if (SplAccess == 1 && IsDayend != 1 && bills.ServiceType != "Catering") {
                            // `<td>test</td>`
                            BillsForView += `<span style="color:red; font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                        }

                        $('#bills_list').html(BillsForView);
                    }
                    else {
                        BillsForView += `<tr style="background-color:#f55858">
                <td>${bills.DisplayBillNo}</td>
                <td>${bills.BillTime}</td>
                <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.ServiceType}</td>
                <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`

                        BillsForView += `<td style="text-align:center"><span>Cancelled</span></td>`

                        if (bills.ServiceType != "Sweetshop") {
                            BillsForView += `<td><span></span></td>
                        <td>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                        </tr><hr>`;
                        } else {
                            BillsForView += `<td><span></span></td>
                        <td><span>&emsp;</span><span>&nbsp;</span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                        </tr><hr>`;
                        }

                        $('#bills_list').html(BillsForView);
                    }

                });

            }
            else {

                $('#bills_list').html(BillsForView);

            }
        }
    }
}


$('#type').on('change', function () {


    let Billtype = document.getElementById("type").value;

    if (Billtype == 1) {
        let FilterBills = previousBillsTemp.filter(row => row.IsPaid == 1 || row.IsCreditBill == 1 || row.IsComplimentary == 1)

        $('#bills_list').empty();
        BillsForView = '';
        BillsForView += `<tr>
        <th>Bill No</th>
        <th>Bill Time</td>
        <th style="text-align:right">Bill Value</th>
        <th style="text-align:right">GST</th>
        <th style="text-align:right">Round off</th>
        <th style="text-align:right">Net Amount</th>
        <th style="text-align:right">Service Type</th>
        <th style="text-align:right">Cash</th>
        <th style="text-align:right">Card</th>
        <th style="text-align:right">Online</th>
        <th style="text-align:center">Bill Type</th>
        <th>Paid</th>
        <th>Actions</th></tr>`

        if (FilterBills.length > 0) {
            // showLoading();
            FilterBills.forEach((bills) => {
                if (bills.IsCancelled == 0) {
                    BillsForView += `<tr>
                    <td>${bills.DisplayBillNo}</td>
                    <td>${bills.BillTime}</td>
                    <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                    <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                    <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.ServiceType}</td>
                    <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                    if (bills.IsPaid) {
                        // BillsForView += `<td style="text-align:center"><span >Cash</span></td>`
                        BillsForView += `<td style="text-align:center"><span >${PaymentTypeCheck(bills)}</span></td>`
                    }
                    else if (bills.IsComplimentary) {
                        BillsForView += `<td style="text-align:center"><span >Complimentary</span></td>`
                    }
                    else if (bills.IsCreditBill) {
                        BillsForView += `<td style="text-align:center"><span >Credit</span></td>`
                    }
                    else {
                        BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                    }

                    if (bills.IsPaid) {
                        BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span>
                        &nbsp<span class="badge" style=" background-color: ${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}" >${bills.PaymentDevice == environment.PineLabsUrl.PaymentDevice || bills.PaymentDevice == environment.PaytmUrl.PaymentDevice ? 'p' : ''}</span>
                        <span>&nbsp</span><span>&nbsp</span></td>`
                    }
                    else {
                        BillsForView += `<td><span></span></td>`
                    }

                    if (bills.ServiceType != "Sweetshop") {
                        BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    } else {
                        BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    }


                    if (SplAccess == 1 && IsDayend != 1) {
                        // `<td>test</td>`
                        BillsForView += `<span style="color:red; font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                    }

                    $('#bills_list').html(BillsForView);
                }


                else {
                    BillsForView += `<tr style="background-color:#f55858">
                        <td>${bills.DisplayBillNo}</td>
                        <td>${bills.BillTime}</td>
                        <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                        <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                        <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.ServiceType}</td>
                        <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                        <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                    BillsForView += `<td style="text-align:center"><span >Cancelled</span></td>`

                    if (bills.ServiceType != "Sweetshop") {
                        BillsForView += `<td><span></span></td>
                        <td>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                              </tr><hr>`;
                    } else {
                        BillsForView += `<td><span></span></td>
                        <td><span>&emsp;</span><span>&nbsp;</span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span>
                              </tr><hr>`;
                    }

                    $('#bills_list').html(BillsForView);

                }



            });

        }
        else {

            $('#bills_list').html(BillsForView);
        }
        document.getElementById("SearchBill").value = '';

    }
    else if (Billtype == 0 && Billtype != "") {

        let FilterBills = previousBillsTemp.filter(row => row.IsPaid == 0 && row.IsCreditBill == 0 && row.IsComplimentary == 0 && row.IsCancelled == 0 || row.IsCancelled == 1)
        $('#bills_list').empty();
        BillsForView = '';
        BillsForView += `<tr>
        <th>Bill No</th>
        <th>Bill Time</td>
        <th style="text-align:right">Bill Value</th>
        <th style="text-align:right">GST</th>
        <th style="text-align:right">Round off</th>
        <th style="text-align:right">Net Amount</th>
        <th style="text-align:right">Service Type</th>
        <th style="text-align:right">Cash</th>
        <th style="text-align:right">Card</th>
        <th style="text-align:right">Online</th>
        <th style="text-align:center">Bill Type</th>
        <th>Paid</th>
        <th>Actions</th></tr>`
        if (FilterBills.length > 0) {
            // showLoading();
            FilterBills.forEach((bills) => {
                if (bills.IsCancelled == 0) {
                    BillsForView += `<tr>
                    <td>${bills.DisplayBillNo}</td>
                    <td>${bills.BillTime}</td>
                    <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                    <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                    <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.ServiceType}</td>
                    <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>`
                    if (bills.IsPaid) {
                        BillsForView += `<td style="text-align:center"><span>Cash</span></td>`
                    }
                    else if (bills.IsComplimentary) {
                        BillsForView += `<td style="text-align:center"><span >Complimentary</span></td>`
                    }
                    else if (bills.IsCreditBill) {
                        BillsForView += `<td style="text-align:center"><span >Credit</span></td>`
                    }
                    else {
                        BillsForView += `<td style="text-align:center"><span>Unpaid</span></td>`
                    }

                    if (bills.IsPaid) {
                        BillsForView += `<td><span style="color:green;font-size:18px; cursor:pointer;"  class="glyphicon glyphicon-ok" ></span><span>&nbsp</span><span>&nbsp</span></td>`
                    }
                    else {
                        BillsForView += `<td><span></span></td>`
                    }


                    if (bills.ServiceType != "Sweetshop") {
                        BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    } else {
                        BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    }


                    if (SplAccess == 1 && IsDayend != 1) {
                        // `<td>test</td>`
                        BillsForView += `<span style="color:red; font-size: 20px; cursor: pointer;" id="cancel_${bills.SaleHeaderId}"onclick='$(this).CancelBill(${bills.SaleHeaderId},"${bills.BillNo}")'  class="glyphicon glyphicon-remove"></span></td></tr></th>`;
                    }

                    $('#bills_list').html(BillsForView);

                }
                else if (bills.IsCancelled == 1) {
                    BillsForView += `<tr style="background-color:#f55858">
                    <td>${bills.DisplayBillNo}</td>
                    <td>${bills.BillTime}</td>
                    <td style="text-align:right">${bills.TotalAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.TotalTax.toFixed(2)}</td>
                    <td style="text-align:right">${bills.RoundOff.toFixed(2)}</td>
                    <td style="text-align:right">${bills.NetAmount.toFixed(2)}</td>
                    <td style="text-align:right">${bills.ServiceType}</td>
                    <td style="text-align:right">${bills.CashAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.CardAmount.toFixed(2)}</td>
                <td style="text-align:right">${bills.OnlineAmount.toFixed(2)}</td>
                    <td style="text-align:center"><span>Cancelled</span></td><td><span></span></td>`



                    if (bills.ServiceType != "Sweetshop") {
                        BillsForView += ` <td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-phone" onclick='$(this).KOTBill(${bills.SaleHeaderId})'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    } else {
                        BillsForView += ` <td><span>&emsp;</span><span>&ensp;</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-file" onclick='$(this).printBill(${bills.SaleHeaderId},1)'></span><span>&nbsp</span><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print" onclick='$(this).printBill(${bills.SaleHeaderId})'></span><span>&nbsp</span>`;

                    }



                    $('#bills_list').html(BillsForView);

                }
            });

        }
        else {

            $('#bills_list').html(BillsForView);
        }
        document.getElementById("SearchBill").value = '';

    }
    else {
        document.getElementById("SearchBill").value = '';
        BillsForView = ''
        loadSaleBills()
    }


});




var CancelBill = $.fn.CancelBill = function (SaleHeaderId, BillNo) {


    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }

    let date = new Date();
    var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    var servertime = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    Swal.fire({
        title: 'Are you Sure to Cancel the Bill ' + `<br><strong>` + BillNo + `</strong>` + '?',
        showCancelButton: true,
        icon: 'question',
        html: `<input type="password"  placeholder="Enter Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br><textarea  placeholder="Enter the Reason for cancel this Bill" id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br>
        <input type="checkbox" onclick="$(this).myFunction()"> Show Password`,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    }).then((result) => {


        let Password = document.getElementById('password').value.trim()

        if (result.isConfirmed) {

            if (Password != '') {
                if (Password == POSPassword[0].AdminPassword) {

                    let CancelledReason = document.getElementById('Description').value.trim()

                    if (CancelledReason != '' && CancelledReason != ' ') {

                        let saleHeaderList = {
                            CancelledReason: CancelledReason,
                            IsCancelled: 1,
                            IsCreditBill: 0,
                            IsComplimentary: 0,
                            IsPaid: 0,
                            CashAmount: 0,
                            CardAmount: 0,
                            OnlineAmount: 0,
                            AmountPaid: 0,
                            Balance: 0,
                            SaleHeaderId: SaleHeaderId,
                            Ref: loginId,
                            UpdatedOn: serverDate + servertime,
                        }
                        BillingdbService.updateSaleHeaderCancelList(saleHeaderList).then(
                            (result) => {

                                Swal.fire('Bill Cancelled!', '', 'success')
                                BillsForView = ''
                                document.getElementById("SearchBill").value = '';
                                loadSaleBills()
                            },
                            (error) => {
                                ErrorLog.writeLogFile('updateSaleHeaderCancelList', error)

                            }
                        )
                    } else {
                        Swal.fire({
                            title: 'Please Enter the Reason for Cancel Bill..!',
                            icon: 'warning',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                        }).then((result) => {
                            if (result.isConfirmed) {

                                CancelBill(SaleHeaderId, BillNo)

                            }
                        })
                    }

                } else {
                    Swal.fire({
                        title: 'Invalid Password..!',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Ok'
                    }).then((result) => {
                        CancelBill(SaleHeaderId, BillNo)
                    })
                }


            } else {
                Swal.fire({
                    title: 'Please Enter the Password for Cancel Bill..!',
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.isConfirmed) {

                        CancelBill(SaleHeaderId, BillNo)

                    }
                })
            }


        }

    })

}




// function cancelReason(SaleHeaderId) {
//     let date = new Date();
//     var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
//     var servertime = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
//     Swal.fire({
//         title: 'Are you Sure to Cancel the Bill?',
//         showCancelButton: true,
//         icon: 'warning',
//         html: `<textarea  placeholder="Enter Description" id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea> `,
//         confirmButtonText: 'Yes',
//         cancelButtonText: 'No',
//     }).then((result) => {

//         let CancelledReason = document.getElementById('Description').value.trim()

//         if (result.isConfirmed) {

//             if (CancelledReason != '') {

//                 let saleHeaderList = {
//                     CancelledReason: CancelledReason,
//                     IsCancelled: 1,
//                     IsCreditBill: 0,
//                     IsComplimentary: 0,
//                     IsPaid: 0,
//                     CashAmount: 0,
//                     CardAmount: 0,
//                     OnlineAmount: 0,
//                     AmountPaid: 0,
//                     Balance: 0,
//                     SaleHeaderId: SaleHeaderId,
//                     Ref: loginId,
//                     UpdatedOn: serverDate + servertime,
//                 }
//                 BillingdbService.updateSaleHeaderCancelList(saleHeaderList).then(
//                     (result) => {

//                         Swal.fire('Bill Cancelled!', '', 'success')
//                         BillsForView = ''
//                         document.getElementById("SearchBill").value = '';
//                         loadSaleBills()
//                     },
//                     (error) => {
//                         ErrorLog.writeLogFile('updateSaleHeaderCancelList', error)

//                     }
//                 )
//             } else {
//                 Swal.fire({
//                     title: 'Please Enter the Reason for Cancel Bill..!',
//                     icon: 'warning',
//                     showCancelButton: false,
//                     confirmButtonText: 'Ok'
//                 }).then((result) => {
//                     if (result.isConfirmed) {

//                         cancelReason(SaleHeaderId)

//                     }
//                 })
//             }






//         }

//     })
// }

$.fn.Reports = function (view) {
    debugger;
    let Cashiercheckbox = document.getElementById("Cashiercheckbox").checked;
    // let checked =document.querySelector('#Cashiercheckbox').checked;
    if (Cashiercheckbox == false) {
        $(this).SaleReport(view, Cashiercheckbox)
    } else {
        $(this).CashierReport(view, Cashiercheckbox)
    }
}

$.fn.SaleReport = function (view, checked) {

    debugger;
    showLoading();
    let roundOff, totalAmount = 0;
    let datepicker = document.getElementById("datepicker").value;
    var dateAr = datepicker.split('/');
    let SaleDate = dateAr[2] + '-' + dateAr[1] + '-' + dateAr[0];

    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: SaleDate,
        CompanyId: environment.CompanyId
    }
        ;
    BillingdbService.getPreviousBillTodayReport(item).then(
        (data) => {
            debugger;
            if (data.length > 0) {

                let NonCancelBills = previousBills.filter(x => x.IsCancelled == 0)
                totalAmount = NonCancelBills.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                roundOff = NonCancelBills.map(row => (row.RoundOff)).reduce((prev, next) => prev + next);
                let datepicker = document.getElementById("datepicker").value;

                let TotalAmount = data.map(row => (row.TotalAmount)).reduce((prev, next) => prev + next);
                let cashvalue = data.map(row => (row.CashAmount)).reduce((prev, next) => prev + next);
                let cardvalue = data.map(row => (row.CardAmount)).reduce((prev, next) => prev + next);
                let onlinevalue = data.map(row => (row.OnlineAmount)).reduce((prev, next) => prev + next);
                let roundOffs = data.map(row => (row.RoundOff)).reduce((prev, next) => prev + next);

                let date = new Date();
                let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
                let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;

                // let printItem = {
                //     SaleDate: datepicker,
                //     Currenttime: currenttime,
                //     roundOff: roundOffs,
                //     totalAmount: TotalAmount,
                //     totalcashvalue: cashvalue.toFixed(2),
                //     totalcardvalue: cardvalue.toFixed(2),
                //     totalonlinevalue: onlinevalue.toFixed(2),
                // }

                let printItem = {
                    SaleDate: datepicker,
                    Currenttime: currenttime,
                    roundOff: roundOff,
                    totalAmount: totalAmount,
                    totalcashvalue: totalcashvalue.toFixed(2),
                    totalcardvalue: totalcardvalue.toFixed(2),
                    totalonlinevalue: totalonlinevalue.toFixed(2),
                    //  totalsalesvalue : totalsalesvalue.toFixed(2)
                }

                printerServicetodayreport.getPreviousBillTodayPrint(data, printItem, view, checked)
                Swal.close();
            } else {
                Swal.fire({
                    title: 'No More Bills Today!',
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                })
                // Swal.close();
            }
        },
        (error) => {
            debugger
            ErrorLog.writeLogFile('getPreviousBillTodayReport', error)
        }
    )
}

$.fn.CashierReport = function (view, checked) {

    debugger;
    showLoading();
    let roundOff, totalAmount = 0;
    let datepicker = document.getElementById("datepicker").value;
    var dateAr = datepicker.split('/');
    let SaleDate = dateAr[2] + '-' + dateAr[1] + '-' + dateAr[0];

    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: SaleDate,
        CompanyId: environment.CompanyId,
    }

    BillingdbService.getTodayCashierReport(item).then(
        (datalist) => {
            debugger;
            if (datalist.length > 0) {
                for (let i = 0; i < datalist.length; i++) {
                    debugger;
                    BillingdbService.getPreviousBillTodayReportCashier(datalist[i]).then(
                        (data) => {
                            debugger;
                            if (data.length > 0) {
                                // let NonCancelBills = previousBills.filter(x => x.IsCancelled == 0)
                                // totalAmount = NonCancelBills.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                // roundOff = NonCancelBills.map(row => (row.RoundOff)).reduce((prev, next) => prev + next);
                                let datepicker = document.getElementById("datepicker").value;

                                let date = new Date();
                                let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
                                let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;

                                let printItem = {
                                    CashierName: datalist[i].CashierName,
                                    SaleDate: datepicker,
                                    Currenttime: currenttime,
                                    roundOff: datalist[i].RoundOff.toFixed(2),
                                    totalAmount: datalist[i].TotalAmount.toFixed(2),
                                    totalcashvalue: datalist[i].CashAmount.toFixed(2),
                                    totalcardvalue: datalist[i].CardAmount.toFixed(2),
                                    totalonlinevalue: datalist[i].OnlineAmount.toFixed(2),
                                    //  totalsalesvalue : totalsalesvalue.toFixed(2)
                                }

                                printerServicetodayreport.getPreviousBillTodayPrint(data, printItem, view, checked)
                                Swal.close();
                            } else {
                                Swal.fire({
                                    title: 'No More Bills Today!',
                                    icon: 'warning',
                                    showCancelButton: false,
                                    confirmButtonText: 'Ok'
                                })
                                // Swal.close();
                            }
                        },
                        (error) => {
                            debugger
                            ErrorLog.writeLogFile('loadSaleBills', error)
                        }
                    )
                }
            } else {
                Swal.fire({
                    title: 'No More Bills Today!',
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                })
                // Swal.close();
            }
        },
        (error) => {
            debugger
            ErrorLog.writeLogFile('getTodayCashierReport', error)
        }
    )

}

$.fn.WaiterReport = function (view) {
    debugger;

    // let h = $('#deliveryhours').val();
    // let m = $('#deliveryminutes').val();
    // let mid = $('#deliveryampm').val();
    // let deliverytime = h + ':' + m + ' ' + mid;
    // let ShiftEndTime = convertTo24HourFormat(deliverytime);

    let ShiftEndTime = $('#myTime').val();

    let date = new Date();
    //let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
    let currentDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2); //+ ":" + ("0" + date.getSeconds()).slice(-2) + ampm;

    if (ShiftEndTime > currenttime && serverDate == currentDate) {
        Swal.fire({
            title: 'Shift Time greater than Current Time..',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        })
        return false;
    }

    // let ShiftWisecheckbox = document.getElementById("ShiftWisecheckbox").checked;
    let Cashiercheckbox = document.getElementById("Cashiercheckbox").checked;
    if (Cashiercheckbox == false) {
        $(this).WaiterWiseReports(view, Cashiercheckbox, ShiftEndTime);
    } else {
        $(this).WaiterShiftWiseReports(view, Cashiercheckbox, ShiftEndTime);
    }
}

$.fn.WaiterWiseReports = function (view, checked, ShiftEndTime) {
    debugger;
    showLoading();
    let CashierloginId;
    if (store.get('IsOnline') == 'true') {
        CashierloginId = EncrDecrService.decrypt(store.get('Ref'));
    }
    else {
        CashierloginId = store.get('Ref');
    }

    let datepicker = document.getElementById("datepicker").value;
    var dateAr = datepicker.split('/');
    let SaleDate = dateAr[2] + '-' + dateAr[1] + '-' + dateAr[0];

    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: SaleDate,
        CompanyId: environment.CompanyId,
        CashierloginId: CashierloginId,
        ShiftEndTime, ShiftEndTime
    }

    BillingdbService.getPreviousBillTodayWaiterReport(item).then((data) => {
         debugger;
        if (data.length > 0) {
            let datepicker = document.getElementById("datepicker").value;
            let date = new Date();
            let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
            let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;
            let TotalAmount = data.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
            let TotalBillCount = data.map(row => (row.TotalBillCount)).reduce((prev, next) => prev + next);

            let printItem = {
                SaleDate: datepicker,
                Currenttime: currenttime,
                TotalAmount: TotalAmount.toFixed(2),
                TotalBillCount: TotalBillCount,
                CashierName: store.get('DisplayName'),
                ShiftEndTime: ShiftEndTime + ':00',
            }

            printerServicewaiterreport.getPreviousBillTodayWaiterPrint(data, printItem, view, checked)
            Swal.close();
        } else {
            Swal.fire({
                title: 'No More Bills Today!',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
            // Swal.close();
        }
    },
        (error) => {
            debugger
            ErrorLog.writeLogFile('getPreviousBillTodayWaiterReport', error)
        })
}

$.fn.WaiterShiftWiseReports = function (view, checked, ShiftEndTime) {
    showLoading();

    let CashierloginId;
    if (store.get('IsOnline') == 'true') {
        CashierloginId = EncrDecrService.decrypt(store.get('Ref'));
    }
    else {
        CashierloginId = store.get('Ref');
    }

    let datepicker = document.getElementById("datepicker").value;
    var dateAr = datepicker.split('/');
    let SaleDate = dateAr[2] + '-' + dateAr[1] + '-' + dateAr[0];

    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: SaleDate,
        CompanyId: environment.CompanyId,
        ShiftEndTime: ShiftEndTime,
        CashierloginId: CashierloginId,
    }
    BillingdbService.getTodayCashierWaiterReport(item).then((data) => {
        debugger;
        if (data.length > 0) {
            // for (let i = 0; i < datalist.length; i++) {
            //     BillingdbService.getPreviousBillTodayCashierWaiterWiseReport(datalist[i],ShiftEndTime).then(
            //         (data) => {
            //             debugger;
            //             if (data.length > 0) {
            let datepicker = document.getElementById("datepicker").value;
            let date = new Date();
            let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
            let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;
            let TotalAmount = data.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
            let TotalBillCount = data.map(row => (row.TotalBillCount)).reduce((prev, next) => prev + next);

            let printItem = {
                SaleDate: datepicker,
                Currenttime: currenttime,
                TotalAmount: TotalAmount.toFixed(2),
                TotalBillCount: TotalBillCount,
                CashierName: store.get('DisplayName'),
                ShiftEndTime: ShiftEndTime + ':00',
            }

            printerServicewaiterreport.getPreviousBillTodayWaiterPrint(data, printItem, view, checked)
            Swal.close();
            //             } else {
            //                 Swal.fire({
            //                     title: 'No More Bills Today!',
            //                     icon: 'warning',
            //                     showCancelButton: false,
            //                     confirmButtonText: 'Ok'
            //                 })
            //                 // Swal.close();
            //             }
            //         },
            //         (error) => {
            //             debugger
            //             ErrorLog.writeLogFile('getPreviousBillTodayCashierWaiterWiseReport', error)
            //         }
            //     )
            // }
        } else {
            Swal.fire({
                title: 'No More Bills Today!',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
            // Swal.close();
        }
    },
        (error) => {
            debugger
            ErrorLog.writeLogFile('getTodayCashierWaiterReport', error)
        }
    )

}

// function convertTo24HourFormat(timeString) {
//     const [time, period] = timeString.split(' ');
//     const [hour, minute] = time.split(':');
//     let formattedHour = parseInt(hour);

//     if (period === 'PM') {
//          if (formattedHour == 12) {
//               formattedHour = 12;
//          }
//          else {
//               formattedHour += 12;
//          }
//     }
//     else {
//          if (formattedHour == 12) {
//               formattedHour = '00';
//          }
//     }
//     return `${formattedHour}:${minute}`;
// }

function PaymentTypeCheck(bills) {

    let PaymentType = '';
    // let IsCashAmountEntered=false;
    //let IsCardAmountEntered=false;
    if (bills.CashAmount != 0) {
        // IsCashAmountEntered=true;
        PaymentType = 'Cash';
    }

    if (bills.CardAmount != 0) {
        // IsCardAmountEntered=true;
        if (bills.CashAmount != 0) {
            PaymentType = PaymentType + ',' + 'Card';
        } else {
            PaymentType = 'Card';
        }
    }

    if (bills.OnlineAmount != 0) {
        //if(IsCashAmountEntered == false && IsCardAmountEntered == false){
        if (bills.CashAmount == 0 && bills.CardAmount == 0) {
            PaymentType = 'Online';
        } else {
            PaymentType = PaymentType + ',' + 'Online';
        }
    }

    return PaymentType;
}