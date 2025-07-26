let Store = require('electron-store');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
const EncrDecrService = require('../services/encrypt-decrypt.service');
let BillingdbService = require('../database/billingdb');
const printerService = require('../services/printer-service');
var BillCounterId = store.get('BillCounterId')
const CustomValidators = require('../services/custom-validation')
const ErrorLog = require('../services/log');
let loginId;
let BillsForView = '';
let SaleHeaderId = 1;
let IsOtherStateCustomerValue = 0;
let selectedSaleHeaderId = 0;
let card = 0;
var POSId = environment.POSId
var Bills = [];
let date = new Date();
var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
var pendingBills = [];
var CreditBills = [];
let selectedSaleHeaderIds = [];
let POSPassword = store.get('POSPassword')
let IsAllowReprint = store.get('IsAllowReprint');
let IsAllowReprintPassword = store.get('IsAllowReprintPassword');
let ReprintCount = store.get('ReprintCount');
let ReprintPassword = store.get('ReprintPassword');

// console.log("IsAllowReprint",store.get('IsAllowReprint'))
// console.log("IsAllowReprintPassword",store.get('IsAllowReprintPassword'))
// console.log("ReprintCount",store.get('ReprintCount'))
// console.log("ReprintPassword",store.get('ReprintPassword'))




$("#IsPendingBills").show();
$("#IsCreditBills").hide();
$("#IsMarkCreditBills").show();
const axios = require('axios');
let payTm = require('paytmchecksum');
var request = require('request');

let PaymentProcessStatus = 0;
let PendingPaymentBill = [];
let IsPineLabPaymentModeValue = store.get('IsPineLabPaymentMode');
let IsPaytmPaymentModeValue = store.get('IsPaytmPaymentMode');
//let IsMultiplePaymentModeValue = store.get('IsMultiplePaymentMode');
let IsNormalPaymentModeValue = store.get('IsNormalPaymentMode');
let IsBankCode = store.get('IsBankCode')
let countDownTarget = 0;
let IntervalCheck = 0;


$(document).ready(function () {
    debugger
    loadSaleHeader();
    PineLabsModeCheck(0);
    PaytmModeCheck(0);
});


// pine labs mode check

const showLoading = function () {
    Swal.fire({
        title: 'Please Wait',
        allowEscapeKey: false,
        allowOutsideClick: false,
        background: '#FFFFFF',
        showConfirmButton: true,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

function PineLabsModeCheck(type) {
    debugger;

    if (!IsPineLabPaymentModeValue) {   // pine lab mode off
        $("#PineLabsPay").hide();
        $("#PineLabsPayConfirm").hide();
        //  $("#PineLabsPayCancel").hide();
        $("#minutes").hide();
        $("#seconds").hide();
        $("#PineLabsTimeCounter").hide();
    }
    else {
        // debugger;             // pine lab mode on
        // if(IsNormalPaymentModeValue){
        //     $("#Pay").show();
        // }else{
        //     $("#Pay").hide();
        // }

        debugger;

        if (type == 1) {   // Pinelab Status 1 Bills
            $("#PineLabsTimeCounter").show();
            $("#minutes").show();
            $("#seconds").show();

            $("#PineLabsPayConfirm").show();
            //  $("#PineLabsPayCancel").show();
            $("#PineLabsPay").hide();
        }
        else if (type == 0) {  // Pinelab Status 0 Bills
            $("#PineLabsTimeCounter").hide();
            $("#minutes").hide();
            $("#seconds").hide()

            $("#PineLabsPayConfirm").hide();
            //   $("#PineLabsPayCancel").hide();
            $("#PineLabsPay").show();
            cleardata();
        }
    }
}

function PaytmModeCheck(type) {

    if (!IsPaytmPaymentModeValue) {   // pine lab mode off
        $("#PaytmPay").hide();
        $("#PaytmPayConfirm").hide();
        $("#minutes").hide();
        $("#seconds").hide();
        $("#PineLabsTimeCounter").hide();
    }
    else {
        debugger;             // paytm lab mode on
        // if(IsNormalPaymentModeValue){
        //     $("#Pay").show();
        // }else{
        //     $("#Pay").hide();
        // }

        debugger;

        if (type == 1) {   // Pinelab Status 1 Bills
            $("#PineLabsTimeCounter").show();
            $("#minutes").show();
            $("#seconds").show();

            $("#PaytmPayConfirm").show();
            $("#PaytmPay").hide();
        }
        else if (type == 0) {  // Pinelab Status 0 Bills
            $("#PineLabsTimeCounter").hide();
            $("#minutes").hide();
            $("#seconds").hide()

            $("#PaytmPayConfirm").hide();
            $("#PaytmPay").show();
            cleardata();
        }
    }

}

// Update the count down every 1 second
function showClock(target, ProcessStatus) {
    if (target != 0) {
        if (countDownTarget - new Date().getTime() < 0) {
            clearInterval(IntervalCheck);
            myTimer(countDownTarget, ProcessStatus);
        } else {
            IntervalCheck = setInterval(function () {
                myTimer(countDownTarget, ProcessStatus);
            }, 1000);
        }
    }

}

function myTimer(target, ProcessStatus) {      // 2 minutes time function
    if (ProcessStatus == 1 && target != 0) {
        let distance = target - new Date().getTime();
        let mins = distance < 0 ? 0 : Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let secs = distance < 0 ? 0 : Math.floor((distance % (1000 * 60)) / 1000);

        let types = '';
        if (IsPineLabPaymentModeValue) {
            types = environment.PineLabsUrl.PaymentDevice;

        } else if (IsPaytmPaymentModeValue) {
            types = environment.PaytmUrl.PaymentDevice;
        }

        if (mins == 0 && secs == 0) {
            document.getElementById("RequestTime").innerHTML = types + ' Payment Request Time Out';
            $("#RequestTime").addClass("blink");
        } else {
            $("#RequestTime").removeClass("blink");
            document.getElementById("RequestTime").innerHTML = types + ' Payment Request Time';
        }

        if (mins == 0 && secs <= 30) {
            document.getElementById("minutes").style.color = '#d9534f';
            document.getElementById("seconds").style.color = '#d9534f';
        } else {
            document.getElementById("minutes").style.color = '#000000';
            document.getElementById("seconds").style.color = '#000000';
        }
        // Output the results
        document.getElementById("minutes").innerHTML = mins + ' Minutes';
        document.getElementById("seconds").innerHTML = secs + ' Seconds';
    }
}


document.onkeyup = function (e) {

    if (e.which == 80 && e.ctrlKey == true) {
        CtrlP()
    } else if (e.which == 116) {
        F5()
    } else if (e.which == 27) {
        ESC()
    }
}

var ESC = $.fn.Cancel = function () {
    debugger
    let serviceTypeName = store.get('serviceTypeName')
    if ((serviceTypeName == "Self-Service" && pendingBills.length != 0) || (serviceTypeName == "Sweetshop" && pendingBills.length != 0)) {
        debugger
        Swal.fire({
            title: 'Are you sure?',
            text: " Do you want to Close this window. Please pay Bill!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                store.delete('SaleHeaderId')
                selectedSaleHeaderIds = []
                window.close();

            }
        })
    } else {
        store.delete('SaleHeaderId')
        selectedSaleHeaderIds = []
        window.close();
    }



}

//numbers only
$.fn.keyPress = function (event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57)) {
        event.preventDefault();
        return false;
    } else {
        return true;
    }
}

var IsOtherStateCustomer = $.fn.IsOtherStateCustomer = function () {

    let indexOfCustomer = document.getElementById("IsOtherStateCustomer").checked
    IsOtherStateCustomerValue = indexOfCustomer ? 1 : 0
    document.getElementById("IsOtherStateCustomerOpt").innerText = indexOfCustomer ? "Yes" : "No"
}

function loadSaleHeader() {
    debugger
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId
    }
    BillingdbService.getSaleHeader(item).then(
        (data) => {
            var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            debugger
            selectedSaleHeaderIds = []
            Bills = data;
            pendingBills = Bills.filter(x => x.IsCreditBill == 0 && x.IsComplimentary == 0)
            CreditBills = Bills.filter(x => x.IsCreditBill == 1 && x.IsWebOrders != 1 && x.SaleDate == serverDate);
            loadSlotButtons()
            loadCreditSlotButtons()
        },
        (error) => {
            ErrorLog.writeLogFile('loadSaleHeader', error)

        }
    )
}



function loadSlotButtons() {
    debugger
    let slotButtons = '';
    let rowDivStart = `<div class="row"> `;
    let rowDivEnd = `</div><br>`;
    for (var i = 1; i <= pendingBills.length; i++) {
        if (i % 3 == 0) {
            debugger;
            slotButtons +=
                ` <div class="col-md-4">
            <button  id="slotbtn_${pendingBills[i - 1].SaleHeaderId}" class="btn btn-new btn-lg-slot-square" role="button" onclick="$(this).onSlotbtnClick(${pendingBills[i - 1].SaleHeaderId},'${pendingBills[i - 1].PaymentDevice}','${pendingBills[i - 1].PaymentDeviceID}')">${pendingBills[i - 1].DisplayBillNo} <span class="badge" style=" background-color: ${pendingBills[i - 1].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}">${pendingBills[i - 1].PaymentDevice != '' ? 'p' : ''}</span></button>
            </div>`  + rowDivEnd + rowDivStart;
        }
        else {
            debugger;
            if (i == 1) {
                slotButtons += rowDivStart +
                    ` <div class="col-md-4">
            <button id="slotbtn_${pendingBills[i - 1].SaleHeaderId}" class="btn btn-new btn-lg-slot-square" role="button" onclick="$(this).onSlotbtnClick(${pendingBills[i - 1].SaleHeaderId},'${pendingBills[i - 1].PaymentDevice}','${pendingBills[i - 1].PaymentDeviceID}')">${pendingBills[i - 1].DisplayBillNo} <span class="badge" style=" background-color: ${pendingBills[i - 1].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}">${pendingBills[i - 1].PaymentDevice != '' ? 'p' : ''}</span></button>
            </div>`
            }
            else {
                debugger;
                slotButtons +=
                    ` <div class="col-md-4">
            <button id="slotbtn_${pendingBills[i - 1].SaleHeaderId}" class="btn btn-new btn-lg-slot-square" role="button" onclick="$(this).onSlotbtnClick(${pendingBills[i - 1].SaleHeaderId},'${pendingBills[i - 1].PaymentDevice}','${pendingBills[i - 1].PaymentDeviceID}')">${pendingBills[i - 1].DisplayBillNo} <span class="badge" style=" background-color: ${pendingBills[i - 1].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}">${pendingBills[i - 1].PaymentDevice != '' ? 'p' : ''}</span></button>
            </div>`;
            }
        }
    }
    $('#billSlotButtons').html(slotButtons);
    $("#slotbtn_" + selectedSaleHeaderId).removeClass("btn-new").addClass("btn-active");

    if (PaymentProcessStatus == 0) {  // if pine lab mode off last bill number will be active
        let saleId = store.get('SaleHeaderId')
        if (saleId != undefined) {
            debugger
            $("#slotbtn_" + saleId).removeClass("btn-new").addClass("btn-active");
            selectedSaleHeaderIds.push(saleId)
            selectedSaleHeaderId = saleId
            $('#CashAmount').focus();
        }
    }
    else { // if pine lab mode on delete SaleHeaderId
        store.delete('SaleHeaderId');
        selectedSaleHeaderId = 0;
    }
    loadBillData(selectedSaleHeaderIds)
}


//loadCreditSlotButtons()
function loadCreditSlotButtons() {
    debugger
    let slotButtons = '';
    let rowDivStart = `<div class="row"> `;
    let rowDivEnd = `</div><br>`;
    for (var i = 1; i <= CreditBills.length; i++) {
        if (i % 3 == 0) {
            slotButtons +=
                ` <div class="col-md-4">
            <button  id="slotbtn_${CreditBills[i - 1].SaleHeaderId}" class="btn btn-new btn-lg-slot-square" role="button" onclick="$(this).onSlotbtnClick(${CreditBills[i - 1].SaleHeaderId},'${CreditBills[i - 1].PaymentDevice}','${CreditBills[i - 1].PaymentDeviceID}')">${CreditBills[i - 1].DisplayBillNo} <span class="badge" style=" background-color: ${CreditBills[i - 1].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}">${CreditBills[i - 1].PaymentDevice != '' ? 'p' : ''}</span></button>
            </div>`  + rowDivEnd + rowDivStart;
        }
        else {
            if (i == 1) {
                slotButtons += rowDivStart +
                    ` <div class="col-md-4">
            <button id="slotbtn_${CreditBills[i - 1].SaleHeaderId}" class="btn btn-new btn-lg-slot-square" role="button" onclick="$(this).onSlotbtnClick(${CreditBills[i - 1].SaleHeaderId},'${CreditBills[i - 1].PaymentDevice}','${CreditBills[i - 1].PaymentDeviceID}')">${CreditBills[i - 1].DisplayBillNo} <span class="badge" style=" background-color: ${CreditBills[i - 1].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}">${CreditBills[i - 1].PaymentDevice != '' ? 'p' : ''}</span></button>
            </div>`
            }
            else {
                slotButtons +=
                    ` <div class="col-md-4">
            <button id="slotbtn_${CreditBills[i - 1].SaleHeaderId}" class="btn btn-new btn-lg-slot-square" role="button" onclick="$(this).onSlotbtnClick(${CreditBills[i - 1].SaleHeaderId},'${CreditBills[i - 1].PaymentDevice}','${CreditBills[i - 1].PaymentDeviceID}')">${CreditBills[i - 1].DisplayBillNo} <span class="badge" style=" background-color: ${CreditBills[i - 1].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? '#5cb85c' : '#1f336b'}">${CreditBills[i - 1].PaymentDevice != '' ? 'p' : ''}</span></button>
            </div>`;
            }
        }
    }

    $('#creditBillSlotButtons').html(slotButtons)
}

$.fn.onSlotbtnClick = function (SaleHeaderId, PaymentDevice, PaymentDeviceID) {
    debugger;
    let billtype = $('input:radio[name=Bills]:checked').val();
    debugger;
    selectedSaleHeaderId = SaleHeaderId;

    debugger;
    if (billtype == "PendingBills") {
        var className = $('#slotbtn_' + SaleHeaderId).attr('class');

        if (className.includes("btn-new")) {
            if (selectedSaleHeaderIds.length < 2) {
                debugger;
                if ((environment.PineLabsUrl.PaymentDevice == PaymentDevice || environment.PaytmUrl.PaymentDevice == PaymentDevice) && PaymentDeviceID != '') {
                    let item = {
                        PaymentDevice: PaymentDevice,
                        PaymentDeviceID: PaymentDeviceID,
                        type: 'onSlotClick'
                    }
                    debugger;
                    loadPaymentHeader(item);  // All Device header load

                    // if(environment.PineLabsUrl.PaymentDevice == PaymentDevice){  // Pinelabs
                    //     loadPaymentHeader(item); 
                    // }else if(environment.PaytmUrl.PaymentDevice == PaymentDevice){  // Paytm
                    //     loadPaymentHeader(item); 
                    // }
                    // if(IsPineLabPaymentModeValue && !IsPaytmPaymentModeValue){ // Pinelabs On and paytm off
                    //     loadPaymentHeader(item); 
                    // }else if(!IsPineLabPaymentModeValue && IsPaytmPaymentModeValue){  // Pinelabs off and paytm on
                    //     loadPaymentHeader(item); 
                    // }
                } else {
                    debugger;
                    if (PendingPaymentBill.length > 0) {
                        // previous bill is pinelabs status= 1  and selected bill is pinelabs status= 0  so not select current bill
                        return false;
                    }
                    else {
                        debugger;
                        $("#slotbtn_" + SaleHeaderId).removeClass("btn-new").addClass("btn-active");
                        selectedSaleHeaderIds.push(SaleHeaderId);
                        loadBillData(selectedSaleHeaderIds)
                    }
                }
            }

        }
        else if (className.includes("btn-active")) {
            debugger;
            selectedSaleHeaderId = 0;
            if (PendingPaymentBill.length > 1) { // if 2 bill click 
                debugger;
                $("#slotbtn_" + PendingPaymentBill[0].SaleHeaderId).removeClass("btn-active").addClass("btn-new");
                $("#slotbtn_" + PendingPaymentBill[1].SaleHeaderId).removeClass("btn-active").addClass("btn-new");
                selectedSaleHeaderIds = [];
            }
            else {   // if 1 bill click
                debugger;
                $("#slotbtn_" + SaleHeaderId).removeClass("btn-active").addClass("btn-new");
                selectedSaleHeaderIds = selectedSaleHeaderIds.filter(x => x != SaleHeaderId);
            }

            if ((PaymentDevice == environment.PineLabsUrl.PaymentDevice || PaymentDevice == environment.PaytmUrl.PaymentDevice) && PaymentDeviceID != '') {
                debugger;
                if (IsPineLabPaymentModeValue && !IsPaytmPaymentModeValue) { // Pinelabs On and paytm off
                    PineLabsModeCheck(0);
                } else if (!IsPineLabPaymentModeValue && IsPaytmPaymentModeValue) {  // Pinelabs off and paytm on
                    PaytmModeCheck(0);
                }
                PaymentProcessStatus = 0;
                ClearDisable(false);
                PendingPaymentBill = [];
            }
            else if (PaymentDevice == '') {
                PaymentProcessStatus = 0;
            }

            if (selectedSaleHeaderIds == 0) {
                debugger;
                cleardata();
                document.getElementById("IsOtherStateCustomer").checked = false;
                document.getElementById("IsOtherStateCustomerOpt").innerText = "No"
            } else {
                debugger;
                loadBillData(selectedSaleHeaderIds)
            }

        }

    }
    else if (billtype == "CreditBills") {

        var className = $('#slotbtn_' + SaleHeaderId).attr('class');

        if (className.includes("btn-new")) {
            if (selectedSaleHeaderIds.length < 1) {
                $("#slotbtn_" + SaleHeaderId).removeClass("btn-new").addClass("btn-active");
                selectedSaleHeaderIds.push(SaleHeaderId);
                loadBillData(selectedSaleHeaderIds)
            }
        }
        else if (className.includes("btn-active")) {
            $("#slotbtn_" + SaleHeaderId).removeClass("btn-active").addClass("btn-new");
            selectedSaleHeaderIds = selectedSaleHeaderIds.filter(x => x != SaleHeaderId)
            if (selectedSaleHeaderIds == 0) {
                cleardata()
                document.getElementById("IsOtherStateCustomer").checked = false;
                document.getElementById("IsOtherStateCustomerOpt").innerText = "No"
            } else {
                loadBillData(selectedSaleHeaderIds)
            }

        }

    }

    $('#CashAmount').focus();

}

function loadBillData(selectedSaleHeaderIds) {
    debugger
    let billNoString = ''
    let tablestring = ''
    let seatNostring = ''
    let namestring = ''
    let phoneNostring = ''
    let GSTnostring = ''
    let refnostring = ''
    let netAmountstring = 0;
    let IsOtherStateCustomer = 0;
    // let cashAmountstring = 0
    // let Amount = 0
    let billData = []
    let selectedData = []

    // let saleHeaderId = selectedSaleHeaderId;
    // let filterData = pendingBills.filter(row => row.SaleHeaderId == saleHeaderId);
    // if (filterData.length != 0) {
    //     selectedData = filterData;
    // }
    // else if (filterData.length == 0) {
    //     let filtercreditData = CreditBills.filter(row => row.SaleHeaderId == saleHeaderId);
    //     selectedData = filtercreditData;
    // }
    // billData = selectedData.filter(row => row.SaleHeaderId == saleHeaderId);
    // if (billData.length > 0) {
    //     billNoString += billData[0].BillNo;
    //     tablestring += billData[0].TableNo != 0 ? billData[0].TableNo : '';
    //     seatNostring += billData[0].SeatNo;
    //     namestring += billData[0].CustomerName;
    //     phoneNostring += billData[0].PhoneNo;
    //     GSTnostring += billData[0].GSTNo;
    //     refnostring += billData[0].RefNo;
    //     netAmountstring += billData[0].NetAmount;
    // }

    for (i = 0; i < selectedSaleHeaderIds.length; i++) {
        let saleHeaderId = selectedSaleHeaderIds[i];
        let filterData = pendingBills.filter(row => row.SaleHeaderId == saleHeaderId);
        if (filterData.length != 0) {
            selectedData = filterData;
        }
        else if (filterData.length == 0) {
            let filtercreditData = CreditBills.filter(row => row.SaleHeaderId == saleHeaderId);
            selectedData = filtercreditData;
        }
        billData = selectedData.filter(row => row.SaleHeaderId == saleHeaderId);
        if (billData.length > 0) {
            billNoString += billData[0].BillNo + ',';
            namestring += billData[0].CustomerName == "" ? "" : billData[0].CustomerName + ',';
            phoneNostring += billData[0].PhoneNo == "" ? "" : billData[0].PhoneNo + ',';
            tablestring += billData[0].TableNo != 0 ? billData[0].TableNo + " " + billData[0].SeatNo + ',' : '';
            // seatNostring += billData[0].SeatNo != '' ? billData[0].SeatNo + ',' : '';
            GSTnostring += billData[0].GSTNo == "" ? "" : billData[0].GSTNo + ',';
            refnostring += billData[0].RefNo == "" ? "" : billData[0].RefNo + ',';
            netAmountstring += billData[0].NetAmount;
            IsOtherStateCustomer += billData[0].IsOtherStateCustomer;
            // cashAmountstring += billData[0].NetAmount;
            // Amount += billData[0].NetAmount;
        }

    }

    billNoString = billNoString.replace(/,\s*$/, "")
    tablestring = tablestring.replace(/,\s*$/, "")
    namestring = namestring.replace(/,\s*$/, "")
    phoneNostring = phoneNostring.replace(/,\s*$/, "")
    GSTnostring = GSTnostring.replace(/,\s*$/, "")
    refnostring = refnostring.replace(/,\s*$/, "")
    seatNostring = seatNostring.replace(/,\s*$/, "")
    document.getElementById("BillNo").value = PendingPaymentBill.length > 0 ? PendingPaymentBill[0].BillNo : billNoString;
    document.getElementById("TableNo").innerHTML = tablestring;
    document.getElementById("CustomerName").value = PendingPaymentBill.length > 0 ? PendingPaymentBill[0].CustomerName : namestring;
    document.getElementById("phoneNo").value = PendingPaymentBill.length > 0 ? PendingPaymentBill[0].PhoneNo : phoneNostring;
    document.getElementById("GSTNo").value = PendingPaymentBill.length > 0 ? PendingPaymentBill[0].GSTNo : GSTnostring;
    document.getElementById("RefNo").value = PendingPaymentBill.length > 0 ? PendingPaymentBill[0].RefNo : refnostring;
    document.getElementById("NetAmount").innerHTML = parseFloat(netAmountstring).toFixed(2)
    document.getElementById("IsOtherStateCustomer").checked = PendingPaymentBill.length > 0 ? (PendingPaymentBill[0].IsOtherStateCustomer == 0 ? false : true) : IsOtherStateCustomer == 0 ? false : true;
    document.getElementById("IsOtherStateCustomerOpt").innerText = PendingPaymentBill.length > 0 ? (PendingPaymentBill[0].IsOtherStateCustomer == 0 ? "No" : "Yes") : IsOtherStateCustomer == 0 ? "No" : "Yes";
    // document.getElementById("CashAmount").value = parseFloat(cashAmountstring).toFixed(2)
    // document.getElementById("AmountPaid").innerHTML = parseFloat(Amount).toFixed(2)
    // card= document.getElementById("CashAmount").value;
}

$("#CashAmount").keydown(function (event) {
    debugger
    let Regex = /^\d{1,5}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
    if (event.which == 13) {
        F5()
    } else if (event.which == 40) {
        $('#CardAmount').focus();
    }
    else {
        return;
    }

});

$("#CardAmount").keydown(function (event) {
    debugger
    let Regex = /^\d{1,4}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
    if (event.which == 13) {
        F5()
    } else if (event.which == 40) {
        $('#OnlineAmount').focus();
    } else {
        return true;
    }

});

$("#OnlineAmount").keydown(function (event) {
    let Regex = /^\d{1,4}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
    if (event.which == 13) {
        F5()
    }

});

$("#CashAmount").keyup(function (event) {
    debugger
    let Regex = /^\d{1,5}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
    if (event.which == 13) {
        F5()
    }
    else {
        return;
    }

});

$("#CardAmount").keyup(function (event) {
    debugger
    let Regex = /^\d{1,4}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
    if (event.which == 38) {
        $('#CashAmount').focus();
    } else {
        return true;
    }

});

$("#OnlineAmount").keyup(function (event) {
    let Regex = /^\d{1,4}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
    if (event.which == 38) {
        $('#CardAmount').focus();
    } else {
        return true;
    }

});

$.fn.calculateAmount = function (event) {

    if (document.getElementById("NetAmount").innerHTML != '' && document.getElementById("BillNo").value != '') {
        let cash = document.getElementById("CashAmount").value
        let card = document.getElementById("CardAmount").value
        let online = document.getElementById("OnlineAmount").value
        let Amount = document.getElementById("NetAmount").innerHTML

        let AmountPaid = +cash + +card + +online
        document.getElementById("AmountPaid").innerHTML = AmountPaid.toFixed(2)
        if (cash != 0) {
            if (AmountPaid >= Amount) {
                let balance = AmountPaid - Amount
                document.getElementById("Balance").innerHTML = (balance.toFixed(2))
            } else {
                document.getElementById("Balance").innerHTML = 0.00
            }
        } else {
            document.getElementById("Balance").innerHTML = 0.00

        }
    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'Please Choose Bill...',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok',

        })
        $('#CashAmount').val('');
        $('#CardAmount').val('');
        $('#OnlineAmount').val('');

    }
}

function cleardata() {
    document.getElementById("BillNo").value = ''
    document.getElementById("TableNo").innerHTML = ''
    document.getElementById("CustomerName").value = ''
    document.getElementById("phoneNo").value = ''
    document.getElementById("GSTNo").value = ''
    document.getElementById("RefNo").value = ''
    document.getElementById("NetAmount").innerHTML = ''
    document.getElementById("CashAmount").value = ''
    document.getElementById("CardAmount").value = ''
    document.getElementById("OnlineAmount").value = ''
    document.getElementById("AmountPaid").innerHTML = ''
    document.getElementById("Balance").innerHTML = ''
}

$.fn.onClickBills = function (event) {
    if (event == 'Credit') {
        debugger
        $("#IsPendingBills").hide();
        $("#IsMarkCreditBills").hide();
        $("#IsCreditBills").show();
        selectedSaleHeaderId = 0
        selectedSaleHeaderIds = []

        store.delete('SaleHeaderId')
        loadCreditSlotButtons()
        cleardata()
        document.getElementById("IsOtherStateCustomer").checked = false;
        document.getElementById("IsOtherStateCustomerOpt").innerText = "No";
    }
    else if (event = 'pending') {
        $("#IsPendingBills").show();
        $("#IsMarkCreditBills").show();
        $("#IsCreditBills").hide();
        selectedSaleHeaderId = 0
        selectedSaleHeaderIds = []

        store.delete('SaleHeaderId')
        loadSlotButtons()
        cleardata()
        document.getElementById("IsOtherStateCustomer").checked = false;
        document.getElementById("IsOtherStateCustomerOpt").innerText = "No";
    }
}

var CtrlP = $.fn.printBill = function () {
    debugger
    IsOtherStateCustomer()
    if (selectedSaleHeaderIds.length != 0) {
        let ReprintBIllNo;
        let date = new Date();
        var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
        var saleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        // var servertime = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        if (IsAllowReprint == 1) {
            BillingdbService.getSaleHeaderforPrintCount(selectedSaleHeaderIds[0]).then((res) => {
                debugger
                let printcount = res.PrintCount;
                //if (printcount == 0) {
                if (printcount < +ReprintCount) {
                    debugger
                    if (IsAllowReprintPassword == 1) {
                        Swal.fire({
                            title: 'Are you Sure to Reprint the Bill?',
                            showCancelButton: true,
                            icon: 'question',
                            html: `<input type="password"  placeholder="Enter Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br><textarea  placeholder="Enter the Reason for Bill Reprint " id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br>
                    <input type="checkbox" onclick="$(this).myFunction()"> Show Password `,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                            allowOutsideClick: false
                        }).then((result) => {
                            debugger
                            let Password = document.getElementById('password').value.trim()

                            if (result.isConfirmed) {
                                debugger
                                if (Password != '') {
                                    //    if (Password == POSPassword[0].AdminPassword) {
                                    if (Password == ReprintPassword) {

                                        let ReprintReason = document.getElementById('Description').value.trim()

                                        if (ReprintReason != '' && ReprintReason != ' ') {

                                            for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
                                                debugger
                                                let filterData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
                                                let netamt = filterData[0].NetAmount;
                                                let BillNo = filterData[0].BillNo;
                                                ReprintBIllNo = filterData[0].BillNo;
                                                let IsCreditBill = filterData[0].IsCreditBill;
                                                let saleHeaderList = {
                                                    SaleHeaderId: selectedSaleHeaderIds[i],
                                                    // BillNo: BillNo,
                                                    CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                                                    PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                                                    GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                                                    RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                                                    //  NetAmount: netamt,
                                                    IsOtherStateCustomer: IsOtherStateCustomerValue,
                                                    CashAmount: 0,
                                                    CardAmount: 0,
                                                    OnlineAmount: 0,
                                                    AmountPaid: 0,
                                                    Balance: 0,
                                                    IsPaid: 0,
                                                    IsCreditBill: IsCreditBill,
                                                    Ref: loginId,
                                                    UpdatedOn: serverDate
                                                }
                                                BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                                                    (data) => {
                                                        let result = data

                                                    },
                                                    (error) => {
                                                        ErrorLog.writeLogFile('PayBill', error)
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('PayBill', err)

                                                    })
                                            }
                                            if (selectedSaleHeaderIds.length == 1) {
                                                debugger
                                                let netamt = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].NetAmount;
                                                printerService.getBillCounterdetail(selectedSaleHeaderIds[0]).then((res) => {
                                                    debugger
                                                    let result = res
                                                    let saleHeaderList = {
                                                        SaleHeaderId: selectedSaleHeaderIds[0],
                                                        BillNo: ReprintBIllNo,
                                                        Amount: netamt,
                                                        SaleDate: saleDate,
                                                        ReprintReason: ReprintReason,
                                                        CashierName: store.get('DisplayName'),
                                                        BillCounterId: store.get('BillCounterId'),
                                                        CreatedBy: loginId,
                                                        Type: "Bill",
                                                        CreatedOn: serverDate,
                                                        PrintCount: (printcount + 1)
                                                    }
                                                    //  console.log("saleHeaderList", saleHeaderList)
                                                    BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                        //   console.log("rs", rs)
                                                        ErrorLog.writeLogFile('addBillReceiptReprintLogs', selectedSaleHeaderIds[0])
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('addBillReceiptReprintLogs', err)
                                                    })

                                                    //  console.log("saleHeaderList",saleHeaderList)
                                                    BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                        debugger

                                                        Swal.fire({
                                                            title: "Bills details updated.",
                                                            icon: 'success',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'ok',
                                                            timer: 1500
                                                        })
                                                        ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('updateSaleHeaderPrintCount Failure', err)
                                                    })


                                                }).catch((err) => {
                                                    ErrorLog.writeLogFile('BillReceipt printerService', err)
                                                })
                                            }
                                            else if (selectedSaleHeaderIds.length > 1) {
                                                debugger
                                                let firstBillNo = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].BillNo;
                                                let SecondBillNo = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[1])[0].BillNo;
                                                let firstBillNetAmount = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].NetAmount;
                                                let SecondBillNetAmount = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[1])[0].NetAmount;
                                                printerService.getBillCounterdetail(selectedSaleHeaderIds[0]).then((res) => {
                                                    //   console.log("ReprintBIllNo[0]", firstBillNo)
                                                    let result = res
                                                    let saleHeaderList = {
                                                        SaleHeaderId: selectedSaleHeaderIds[0],
                                                        BillNo: firstBillNo,
                                                        Amount: firstBillNetAmount,
                                                        SaleDate: saleDate,
                                                        ReprintReason: ReprintReason,
                                                        CashierName: store.get('DisplayName'),
                                                        BillCounterId: store.get('BillCounterId'),
                                                        CreatedBy: loginId,
                                                        Type: "Bill",
                                                        CreatedOn: serverDate,
                                                        PrintCount: (printcount + 1)
                                                    }
                                                    BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                        //    console.log("rs", rs)
                                                        ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[0]', selectedSaleHeaderIds[0])
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[0]', err)
                                                    })
                                                    BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                        debugger
                                                        // Swal.fire({
                                                        //     title: "Bills details updated.",
                                                        //     icon: 'success',
                                                        //     confirmButtonColor: '#5cb85c',
                                                        //     confirmButtonText: 'ok',
                                                        //     timer: 1500
                                                        // })
                                                        ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('updateSaleHeaderPrintCount Failure', err)
                                                    })
                                                    printerService.getBillCounterdetail(selectedSaleHeaderIds[1]).then((res) => {
                                                        //    console.log("ReprintBIllNo[1]", SecondBillNo)
                                                        let saleHeaderList = {
                                                            SaleHeaderId: selectedSaleHeaderIds[1],
                                                            BillNo: SecondBillNo,
                                                            Amount: SecondBillNetAmount,
                                                            SaleDate: saleDate,
                                                            ReprintReason: ReprintReason,
                                                            CashierName: store.get('DisplayName'),
                                                            BillCounterId: store.get('BillCounterId'),
                                                            CreatedBy: loginId,
                                                            Type: "Bill",
                                                            CreatedOn: serverDate,
                                                            PrintCount: (printcount + 1)
                                                        }
                                                        BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                            //      console.log("rs", rs)
                                                            ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[1]', selectedSaleHeaderIds[1])
                                                        }).catch((err) => {
                                                            ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[1]', err)
                                                        })
                                                        BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                            debugger
                                                            Swal.fire({
                                                                title: "Bills details updated.",
                                                                icon: 'success',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'ok',
                                                                timer: 1500
                                                            })
                                                            ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                                        }).catch((err) => {
                                                            ErrorLog.writeLogFile('updateSaleHeaderPrintCount Failure', err)
                                                        })
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('printerService Failure', err)
                                                    })
                                                })
                                            }
                                        } else {
                                            Swal.fire({
                                                title: 'Please Enter the Reason for Reprint Bill..!',
                                                icon: 'warning',
                                                showCancelButton: false,
                                                confirmButtonText: 'Ok'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    CtrlP();
                                                }
                                            })
                                        }
                                        setTimeout(() => {
                                            loadSaleHeader()
                                        }, 1500);

                                    } else {
                                        Swal.fire({
                                            title: 'Invalid Password..!',
                                            icon: 'error',
                                            showCancelButton: false,
                                            confirmButtonText: 'Ok'
                                        }).then((result) => {
                                            CtrlP()
                                        })
                                    }
                                    debugger

                                } else {
                                    Swal.fire({
                                        title: 'Please Enter the Password for Reprint Bill..!',
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'Ok'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            debugger
                                            CtrlP()

                                        }
                                    })
                                }

                                debugger
                            }

                        })
                    }
                    else {
                        Swal.fire({
                            title: 'Are you Sure to Reprint the Bill?',
                            showCancelButton: true,
                            icon: 'question',
                            html: `<br><textarea  placeholder="Enter the Reason for Bill Reprint " id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br> `,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                            allowOutsideClick: false
                        }).then((result) => {
                            debugger
                            if (result.isConfirmed) {
                                let ReprintReason = document.getElementById('Description').value.trim()
                                if (ReprintReason != '' && ReprintReason != ' ') {
                                    for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
                                        debugger
                                        let filterData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
                                        let netamt = filterData[0].NetAmount;
                                        let BillNo = filterData[0].BillNo;
                                        let IsCreditBill = filterData[0].IsCreditBill;
                                        let saleHeaderList = {
                                            SaleHeaderId: selectedSaleHeaderIds[i],
                                            // BillNo: BillNo,

                                            CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                                            PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                                            GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                                            RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                                            //  NetAmount: netamt,
                                            IsOtherStateCustomer: IsOtherStateCustomerValue,
                                            CashAmount: 0,
                                            CardAmount: 0,
                                            OnlineAmount: 0,
                                            AmountPaid: 0,
                                            Balance: 0,
                                            IsPaid: 0,
                                            IsCreditBill: IsCreditBill,
                                            Ref: loginId,
                                            UpdatedOn: serverDate
                                        }
                                        BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                                            (data) => {
                                                let result = data

                                            },
                                            (error) => {
                                                ErrorLog.writeLogFile('PayBill', error)
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('PayBill', err)

                                            })
                                    }
                                    if (selectedSaleHeaderIds.length == 1) {
                                        ReprintBIllNo = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].BillNo;
                                        ReprintBIllNetAmount = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].NetAmount;

                                        printerService.getBillCounterdetail(selectedSaleHeaderIds[0]).then((res) => {
                                            let result = res
                                            let saleHeaderList = {
                                                SaleHeaderId: selectedSaleHeaderIds[0],
                                                BillNo: ReprintBIllNo,
                                                Amount: ReprintBIllNetAmount,
                                                SaleDate: saleDate,
                                                ReprintReason: ReprintReason,
                                                CashierName: store.get('DisplayName'),
                                                BillCounterId: store.get('BillCounterId'),
                                                CreatedBy: loginId,
                                                Type: "Bill",
                                                CreatedOn: serverDate,
                                                PrintCount: (printcount + 1)
                                            }
                                            BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                //       console.log("rs", rs)
                                                ErrorLog.writeLogFile('addBillReceiptReprintLogs', selectedSaleHeaderIds[0])
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('addBillReceiptReprintLogs', err)
                                            })


                                            //     console.log("saleHeaderList",saleHeaderList)
                                            BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                debugger

                                                Swal.fire({
                                                    title: "Bills details updated.",
                                                    icon: 'success',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'ok',
                                                    timer: 1500
                                                })
                                                ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('updateSaleHeaderPrintCount Failure', err)
                                            })



                                        }).catch((err) => {
                                            ErrorLog.writeLogFile('BillReceipt printerService', err)

                                        })
                                    }
                                    else if (selectedSaleHeaderIds.length > 1) {
                                        let firstBillNo = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].BillNo;
                                        let SecondBillNo = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[1])[0].BillNo;
                                        let firstBillNetAmount = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0])[0].NetAmount;
                                        let SecondBillNetAmount = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[1])[0].NetAmount;
                                        printerService.getBillCounterdetail(selectedSaleHeaderIds[0]).then((res) => {
                                            let result = res
                                            //  console.log("ReprintBIllNo[0]", firstBillNo)
                                            let saleHeaderList = {
                                                SaleHeaderId: selectedSaleHeaderIds[0],
                                                BillNo: firstBillNo,
                                                Amount: firstBillNetAmount,
                                                SaleDate: saleDate,
                                                ReprintReason: ReprintReason,
                                                CashierName: store.get('DisplayName'),
                                                BillCounterId: store.get('BillCounterId'),
                                                CreatedBy: loginId,
                                                Type: "Bill",
                                                CreatedOn: serverDate,
                                                PrintCount: (printcount + 1)
                                            }
                                            BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                //       console.log("rs", rs)
                                                ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[0]', selectedSaleHeaderIds[0])
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[0]', err)
                                            })
                                            BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                            }).catch((err) => {
                                                ErrorLog.writeLogFile('updateSaleHeaderPrintCount Failure', err)
                                            })

                                            printerService.getBillCounterdetail(selectedSaleHeaderIds[1]).then((res) => {
                                                //   console.log("ReprintBIllNo[1]", SecondBillNo)
                                                let saleHeaderList = {
                                                    SaleHeaderId: selectedSaleHeaderIds[1],
                                                    BillNo: SecondBillNo,
                                                    Amount: SecondBillNetAmount,
                                                    SaleDate: saleDate,
                                                    ReprintReason: ReprintReason,
                                                    CashierName: store.get('DisplayName'),
                                                    BillCounterId: store.get('BillCounterId'),
                                                    CreatedBy: loginId,
                                                    Type: "Bill",
                                                    CreatedOn: serverDate,
                                                    PrintCount: (printcount + 1)
                                                }
                                                BillingdbService.addReprintLogs(saleHeaderList).then((rs) => {
                                                    //        console.log("rs", rs)
                                                    ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[1]', selectedSaleHeaderIds[1])
                                                }).catch((err) => {
                                                    ErrorLog.writeLogFile('addBillReceiptReprintLogs selectedSaleHeaderIds[1]', err)
                                                })

                                                BillingdbService.updateSaleHeaderPrintCount(saleHeaderList).then((res) => {
                                                    ErrorLog.writeLogFile('updateSaleHeaderPrintCount success', res)
                                                    Swal.fire({
                                                        title: "Bills details updated.",
                                                        icon: 'success',
                                                        confirmButtonColor: '#5cb85c',
                                                        confirmButtonText: 'ok',
                                                        timer: 1500
                                                    })
                                                }).catch((err) => {
                                                    ErrorLog.writeLogFile('updateSaleHeaderPrintCount Failure', err)
                                                })

                                            })
                                        })
                                    }
                                    setTimeout(() => {
                                        loadSaleHeader()
                                    }, 1500);

                                } else {
                                    Swal.fire({
                                        title: 'Please Enter the Password for Reprint Bill..!',
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'Ok'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            debugger
                                            CtrlP()

                                        }
                                    })
                                }
                            }

                        })



                    }




                } else {
                    Swal.fire({
                        title: 'Print Limit Exceeded..!',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Ok'
                    })
                }

            })


        }

        else {
            Swal.fire({
                icon: 'error',
                title: 'Reprinting is not permitted. Please contact the administrator...!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'ok'
            })
        }


    } else {
        Swal.fire({
            icon: 'error',
            title: 'Please Choose Bill...',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok'
        })
    }

}

$.fn.myFunction = function () {
    debugger
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

}

function PaymentDevicetoNormalPayConvert(PayType) {

    Swal.fire({
        title: "Are you sure you want to change the payment mode to manual ?",
        icon: 'question',
        confirmButtonColor: '#5cb85c',
        allowOutsideClick: false,
        cancelButton: '#d33',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        width: 850
    }).then((res) => {
        if (res.isConfirmed) {

            let PaymentDeviceID = '';
            let PaymentDeviceConvert = '';
            let PaymentDevice = '';
            let date = new Date();
            let BillTimeDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

            debugger;
            if (PendingPaymentBill.length == 1) {  // more than 2 Bills select ,so default 1 fo Array detail PaymentDevice name get method 
                PaymentDeviceID = PendingPaymentBill[0].PaymentDeviceID;
                PaymentDeviceConvert = PendingPaymentBill[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? environment.PineLabsUrl.PaymentDeviceConvert : environment.PaytmUrl.PaymentDeviceConvert;
                PaymentDevice = PendingPaymentBill[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? environment.PineLabsUrl.PaymentDevice : environment.PaytmUrl.PaymentDevice;

            } else {
                if (PendingPaymentBill[0].PaymentDeviceID == PendingPaymentBill[1].PaymentDeviceID) {
                    PaymentDeviceID = PendingPaymentBill[0].PaymentDeviceID;
                    PaymentDeviceConvert = PendingPaymentBill[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? environment.PineLabsUrl.PaymentDeviceConvert : environment.PaytmUrl.PaymentDeviceConvert;
                    PaymentDevice = PendingPaymentBill[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? environment.PineLabsUrl.PaymentDevice : environment.PaytmUrl.PaymentDevice;
                }
                // else{
                //     Swal.fire({
                //         icon: 'error',
                //         title: 'Mismatch Transaction Reference ID',
                //         confirmButtonColor: '#d33',
                //         cancelButtonColor: '#3085d6',
                //         confirmButtonText: 'OK',
                //         allowOutsideClick: false,
                //     })
                //     return false;
                // }
            }

            // let Amounts = 0;
            // if(PendingPaymentBill[0].PaymentDeviceID == PaymentDeviceID){

            //     if(PendingPaymentBill[0].PaymentDeviceMode == environment.PaytmUrl.PaymentCardMode){
            //         Amounts = PendingPaymentBill[0].CardAmount;
            //     }
            //     else if(PendingPaymentBill[0].PaymentDeviceMode == environment.PaytmUrl.PaymentOnlineMode){
            //         Amounts = PendingPaymentBill[0].OnlineAmount;
            //     }
            // }

            let saleHeaderList = {
                SaleHeaderId: PendingPaymentBill[0].SaleHeaderId,
                PaymentDeviceID: PaymentDeviceID,
                PaymentDevice: PaymentDeviceConvert,
                IsRequestCancelled: 1,
                IsPaid: 0,
                UpdatedOn: BillTimeDate,
                UpdatedBy: loginId,
            }

            debugger;
            BillingdbService.updatePaymentModeChangeStatus(saleHeaderList, PaymentDevice).then((data) => {
                debugger;
                updateSaleHeader(PayType);
            },
                (error) => {
                    Swal.fire({
                        title: `${PaymentDevice} Normal Payment Mode Change Failed`,
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                    ErrorLog.writeLogFile(`${PaymentDevice} Normal Payment Failed = `, JSON.stringify(error));
                }).catch((err) => {
                    Swal.fire({
                        title: 'Normal Payment Mode Change Failed',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                    ErrorLog.writeLogFile(`${PaymentDevice} Normal Payment catch Failed = `, JSON.stringify(err));
                })
        }
        else if (res.isDismissed) {
            //    console.log('isDismissed',res.isDismissed);
        }
    })

}

function updateSaleHeader(PayType) {

    let AmountPaid = document.getElementById("AmountPaid").innerHTML
    let Amount = document.getElementById("NetAmount").innerHTML
    let card = document.getElementById("CardAmount").value
    let online = document.getElementById("OnlineAmount").value
    let cash = document.getElementById("CashAmount").value
    let balance = document.getElementById("Balance").innerHTML
    let storecash = +cash - +balance
    let date = new Date();
    var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);


    IsOtherStateCustomer()
    if (selectedSaleHeaderIds.length > 1) {
        debugger
        let len = selectedSaleHeaderIds.length
        let fristSaleHeaderId = selectedSaleHeaderIds[0];
        let secondSaleHeaderId = selectedSaleHeaderIds[1];
        let fristBillData = pendingBills.find(row => row.SaleHeaderId == fristSaleHeaderId);
        let secondBillData = pendingBills.find(row => row.SaleHeaderId == secondSaleHeaderId);
        let fristBillnetamt = fristBillData.NetAmount;
        let secondBillnetamt = secondBillData.NetAmount;
        let fristBillNo = fristBillData.BillNo;
        let secondBillNo = secondBillData.BillNo;
        let firstBillBalance, secondBillBalance;
        let billsList = []
        billsList = [{ 'SaleHeaderId': fristSaleHeaderId, 'NetAmount': fristBillnetamt, 'BillNo': fristBillNo, 'CashAmount': 0, 'CardAmount': 0, 'OnlineAmount': 0, 'Balance': 0 },
        { 'SaleHeaderId': secondSaleHeaderId, 'NetAmount': secondBillnetamt, 'BillNo': secondBillNo, 'CashAmount': 0, 'CardAmount': 0, 'OnlineAmount': 0, 'Balance': 0 }]
        let cashAmountTemp = cash
        let cardAmountTemp = card
        let onlineAmountTemp = online

        if (+cash != 0 && +card == 0 && +online == 0) {

            for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
                debugger
                let filterData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
                let netamt = filterData[0].NetAmount;
                let BillNo = filterData[0].BillNo;
                if (len > i) {
                    let saleHeaderList = {
                        SaleHeaderId: selectedSaleHeaderIds[i],
                        //BillNo: BillNo,
                        CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                        PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                        GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                        RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                        // NetAmount: netamt,
                        CashAmount: netamt,
                        CardAmount: 0,
                        OnlineAmount: 0,
                        AmountPaid: netamt,
                        Balance: 0,
                        IsPaid: 1,
                        IsOtherStateCustomer: IsOtherStateCustomerValue,
                        IsCreditBill: 0,
                        Ref: loginId,
                        UpdatedOn: serverDate
                    }
                    BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                        (data) => {

                            Swal.fire({
                                title: "Bills Paid Sucessfully.",
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            }).then((res) => {
                                if (pendingBills.length == 0) {
                                    window.close()
                                }
                            })
                        },
                        (error) => {
                            ErrorLog.writeLogFile('PayBill', error)
                        });
                }

                if (len == (i + 1)) {
                    debugger
                    let saleHeaderList = {
                        SaleHeaderId: selectedSaleHeaderIds[i],
                        //  BillNo: BillNo,
                        CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                        PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                        GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                        RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                        //NetAmount: netamt,
                        CashAmount: netamt,
                        CardAmount: 0,
                        OnlineAmount: 0,
                        AmountPaid: netamt,
                        Balance: document.getElementById("Balance").innerHTML == '' ? 0 : document.getElementById("Balance").innerHTML,
                        IsPaid: 1,
                        IsOtherStateCustomer: IsOtherStateCustomerValue,
                        IsCreditBill: 0,
                        Ref: loginId,
                        UpdatedOn: serverDate
                    }
                    BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                        (data) => {

                            Swal.fire({
                                title: "Bills Paid Sucessfully.",
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            })
                        },
                        (error) => {
                            ErrorLog.writeLogFile('PayBill', error)
                        });
                }
            }
        }
        else if (+card != 0 && +cash == 0 && +online == 0) {

            for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
                debugger
                let filterData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
                let netamt = filterData[0].NetAmount;
                let BillNo = filterData[0].BillNo;
                if (len > i) {
                    let saleHeaderList = {
                        SaleHeaderId: selectedSaleHeaderIds[i],
                        // BillNo: BillNo,
                        CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                        PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                        GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                        RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                        //NetAmount: netamt,
                        CashAmount: 0,
                        CardAmount: netamt,
                        OnlineAmount: 0,
                        AmountPaid: netamt,
                        Balance: 0,
                        IsPaid: 1,
                        IsCreditBill: 0,
                        IsOtherStateCustomer: IsOtherStateCustomerValue,
                        Ref: loginId,
                        UpdatedOn: serverDate
                    }
                    BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                        (data) => {

                            Swal.fire({
                                title: "Bills Paid Sucessfully.",
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            }).then((res) => {
                                if (pendingBills.length == 0) {
                                    window.close()
                                }
                            })
                        },
                        (error) => {
                            ErrorLog.writeLogFile('PayBill', error)
                        });
                }

                if (len == (i + 1)) {
                    debugger
                    let saleHeaderList = {
                        SaleHeaderId: selectedSaleHeaderIds[i],
                        //BillNo: BillNo,
                        CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                        PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                        GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                        RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                        // NetAmount: netamt,
                        CashAmount: 0,
                        CardAmount: netamt,
                        OnlineAmount: 0,
                        AmountPaid: netamt,
                        Balance: document.getElementById("Balance").innerHTML == '' ? 0 : document.getElementById("Balance").innerHTML,
                        IsPaid: 1,
                        IsCreditBill: 0,
                        IsOtherStateCustomer: IsOtherStateCustomerValue,
                        Ref: loginId,
                        UpdatedOn: serverDate
                    }
                    BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                        (data) => {

                            Swal.fire({
                                title: "Bills Paid Sucessfully.",
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            })
                        },
                        (error) => {
                            ErrorLog.writeLogFile('PayBill', error)
                        });
                }
            }
        }
        else if (+online != 0 && +cash == 0 && +card == 0) {

            for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
                debugger
                let filterData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
                let netamt = filterData[0].NetAmount;
                let BillNo = filterData[0].BillNo;
                if (len > i) {
                    let saleHeaderList = {
                        SaleHeaderId: selectedSaleHeaderIds[i],
                        //BillNo: BillNo,
                        CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                        PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                        GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                        RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                        //  NetAmount: netamt,
                        CashAmount: 0,
                        CardAmount: 0,
                        OnlineAmount: netamt,
                        AmountPaid: netamt,
                        Balance: 0,
                        IsPaid: 1,
                        IsCreditBill: 0,
                        IsOtherStateCustomer: IsOtherStateCustomerValue,
                        Ref: loginId,
                        UpdatedOn: serverDate
                    }
                    BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                        (data) => {

                            Swal.fire({
                                title: "Bills Paid Sucessfully.",
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            }).then((res) => {
                                if (pendingBills.length == 0) {
                                    window.close()
                                }
                            })
                        },
                        (error) => {
                            ErrorLog.writeLogFile('PayBill', error)
                        });
                }

                if (len == (i + 1)) {
                    debugger
                    let saleHeaderList = {
                        SaleHeaderId: selectedSaleHeaderIds[i],
                        // BillNo: BillNo,
                        CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                        PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                        GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                        RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                        // NetAmount: netamt,
                        CashAmount: 0,
                        CardAmount: 0,
                        OnlineAmount: netamt,
                        AmountPaid: netamt,
                        Balance: document.getElementById("Balance").innerHTML == '' ? 0 : document.getElementById("Balance").innerHTML,
                        IsPaid: 1,
                        IsCreditBill: 0,
                        IsOtherStateCustomer: IsOtherStateCustomerValue,
                        Ref: loginId,
                        UpdatedOn: serverDate
                    }
                    BillingdbService.updateSaleHeaderList(saleHeaderList).then(
                        (data) => {

                            Swal.fire({
                                title: "Bills Paid Sucessfully.",
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            })
                        },
                        (error) => {
                            ErrorLog.writeLogFile('PayBill', error)
                        });
                }
            }
        }
        else if (+cash != 0 && +card != 0 && +online == 0) {
            debugger

            if (fristBillnetamt > cashAmountTemp) {
                debugger
                billsList[0]['CashAmount'] = cashAmountTemp
                cashAmountTemp = 0;
                firstBillBalance = fristBillnetamt - billsList[0]['CashAmount']
                if (firstBillBalance != 0) {
                    debugger
                    if (firstBillBalance < +card) {
                        debugger
                        let deductedvalue = firstBillBalance;
                        billsList[0]['CardAmount'] = deductedvalue;
                        cardAmountTemp = cardAmountTemp - deductedvalue;
                        billsList[1]['CardAmount'] = cardAmountTemp
                        firstBillBalance = 0;
                    }
                }
                else if (firstBillBalance == 0) {
                    billsList[1]['CardAmount'] = cardAmountTemp

                }

            }
            else if (fristBillnetamt < cashAmountTemp) {
                debugger
                billsList[0]['CashAmount'] = fristBillnetamt
                let firstBillBalance = cashAmountTemp - fristBillnetamt;
                billsList[0]['Balance'] = firstBillBalance
                cashAmountTemp = 0;
                if (firstBillBalance != 0) {
                    debugger
                    let deductedvalue = firstBillBalance;
                    billsList[1]['CashAmount'] = deductedvalue;
                    billsList[1]['CardAmount'] = cardAmountTemp
                    firstBillBalance = 0;

                }
                else if (firstBillBalance == 0) {
                    billsList[1]['CardAmount'] = cardAmountTemp

                }

            }
            else if (fristBillnetamt == cashAmountTemp) {
                billsList[0]['CashAmount'] = cashAmountTemp
                billsList[1]['CardAmount'] = cardAmountTemp
            }

            if (billsList[0].CashAmount != 0 || billsList[0].CardAmount != 0 || billsList[0].OnlineAmount != 0) {
                let totalcost = Number(card) + Number(storecash) + Number(online)
                if ((Number(Amount) < totalcost) || (Number(Amount) > totalcost)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect card/online payment. Please verify...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                    return false;
                } else {
                    BillPaid(billsList)
                }
            }

        }
        else if (+cash != 0 && +online != 0 && +card == 0) {
            debugger

            if (fristBillnetamt > cashAmountTemp) {
                debugger
                billsList[0]['CashAmount'] = cashAmountTemp
                cashAmountTemp = 0;
                firstBillBalance = fristBillnetamt - billsList[0]['CashAmount']
                if (firstBillBalance != 0) {
                    debugger
                    if (firstBillBalance < +online) {
                        debugger
                        let deductedvalue = firstBillBalance;
                        billsList[0]['OnlineAmount'] = deductedvalue;
                        onlineAmountTemp = onlineAmountTemp - deductedvalue;
                        billsList[1]['OnlineAmount'] = onlineAmountTemp
                        firstBillBalance = 0;
                    }
                }
                else if (firstBillBalance == 0) {
                    billsList[1]['OnlineAmount'] = onlineAmountTemp

                }


            }

            else if (fristBillnetamt < cashAmountTemp) {
                debugger
                billsList[0]['CashAmount'] = fristBillnetamt
                let firstBillBalance = cashAmountTemp - fristBillnetamt;
                billsList[0]['Balance'] = firstBillBalance
                cashAmountTemp = 0;
                if (firstBillBalance != 0) {
                    debugger
                    let deductedvalue = firstBillBalance;
                    billsList[1]['CashAmount'] = deductedvalue;
                    billsList[1]['OnlineAmount'] = onlineAmountTemp
                    firstBillBalance = 0;

                }
                else if (firstBillBalance == 0) {
                    billsList[1]['OnlineAmount'] = onlineAmountTemp

                }

            }
            else if (fristBillnetamt == cashAmountTemp) {
                billsList[0]['CashAmount'] = cashAmountTemp
                billsList[1]['OnlineAmount'] = onlineAmountTemp
            }

            if (billsList[0].CashAmount != 0 || billsList[0].CardAmount != 0 || billsList[0].OnlineAmount != 0) {
                let totalcost = Number(card) + Number(storecash) + Number(online)
                if ((Number(Amount) < totalcost) || (Number(Amount) > totalcost)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect card/online payment. Please verify...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                    return false;
                } else {
                    BillPaid(billsList)
                }
            }

        }
        else if (+card != 0 && +online != 0 && +cash == 0) {
            debugger

            if (fristBillnetamt > cardAmountTemp) {
                debugger
                billsList[0]['CardAmount'] = cardAmountTemp
                cardAmountTemp = 0;
                firstBillBalance = fristBillnetamt - billsList[0]['CardAmount']
                if (firstBillBalance != 0) {
                    debugger
                    if (firstBillBalance < +online) {
                        debugger
                        let deductedvalue = firstBillBalance;
                        billsList[0]['OnlineAmount'] = deductedvalue;
                        onlineAmountTemp = onlineAmountTemp - deductedvalue;
                        billsList[1]['OnlineAmount'] = onlineAmountTemp
                        firstBillBalance = 0;
                    }
                }
                else if (firstBillBalance == 0) {
                    billsList[1]['OnlineAmount'] = onlineAmountTemp

                }


            }

            else if (fristBillnetamt < cardAmountTemp) {
                debugger
                billsList[0]['CardAmount'] = fristBillnetamt
                let firstBillBalance = cardAmountTemp - fristBillnetamt;
                billsList[0]['Balance'] = firstBillBalance
                cardAmountTemp = 0;
                if (firstBillBalance != 0) {
                    debugger
                    let deductedvalue = firstBillBalance;
                    billsList[1]['CardAmount'] = deductedvalue;
                    billsList[1]['OnlineAmount'] = onlineAmountTemp
                    firstBillBalance = 0;

                }
                else if (firstBillBalance == 0) {
                    billsList[1]['OnlineAmount'] = onlineAmountTemp

                }

                // if (cardAmountTemp != 0) {
                //     debugger
                //     billsList[1]['Balance'] = secondBillnetamt - cardAmountTemp
                //     cardAmountTemp = 0
                //     console.log(billsList)
                // }
            }
            else if (fristBillnetamt == cardAmountTemp) {
                billsList[0]['CardAmount'] = cardAmountTemp
                billsList[1]['OnlineAmount'] = onlineAmountTemp
            }

            if (billsList[0].CashAmount != 0 || billsList[0].CardAmount != 0 || billsList[0].OnlineAmount != 0) {
                let totalcost = Number(card) + Number(storecash) + Number(online)
                if ((Number(Amount) < totalcost) || (Number(Amount) > totalcost)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect card/online payment. Please verify...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                    return false;
                } else {
                    BillPaid(billsList)
                }
            }

        }
        else if (+cash != 0 && +card != 0 && +online != 0) {
            debugger

            if (fristBillnetamt >= cashAmountTemp) {
                debugger
                billsList[0]['CashAmount'] = cashAmountTemp
                firstBillBalance = fristBillnetamt - cashAmountTemp
                if (firstBillBalance != 0) {
                    debugger
                    let deductedvalue = firstBillBalance;
                    firstBillBalance = 0;
                    if (deductedvalue >= cardAmountTemp) {
                        billsList[0]['CardAmount'] = cardAmountTemp
                        firstBillBalance = deductedvalue - cardAmountTemp; 200
                        if (firstBillBalance != 0) {
                            let deductedvalue = firstBillBalance;
                            firstBillBalance = 0;
                            firstBillBalance = onlineAmountTemp - deductedvalue
                            billsList[0]['OnlineAmount'] = deductedvalue
                            billsList[1]['OnlineAmount'] = firstBillBalance
                        }
                        else if (firstBillBalance == 0) {
                            billsList[1]['OnlineAmount'] = onlineAmountTemp
                        }
                    }
                    else if (deductedvalue <= cardAmountTemp) {
                        billsList[0]['CardAmount'] = deductedvalue
                        let firstBillBalance = cardAmountTemp - deductedvalue
                        billsList[1]['CardAmount'] = firstBillBalance
                        billsList[1]['OnlineAmount'] = onlineAmountTemp

                    }

                }
                else if (firstBillBalance == 0) {
                    debugger
                    billsList[1]['CardAmount'] = cardAmountTemp
                    billsList[1]['OnlineAmount'] = onlineAmountTemp

                }
            }

            //completed
            else if (fristBillnetamt <= cashAmountTemp) {
                debugger
                billsList[0]['CashAmount'] = fristBillnetamt
                let firstBillBalance = cashAmountTemp - fristBillnetamt;
                billsList[0]['Balance'] = firstBillBalance
                cashAmountTemp = 0;
                if (firstBillBalance != 0) {
                    debugger
                    let deductedvalue = firstBillBalance;
                    billsList[1]['CashAmount'] = deductedvalue;
                    billsList[1]['CardAmount'] = cardAmountTemp
                    billsList[1]['OnlineAmount'] = onlineAmountTemp
                    firstBillBalance = 0;

                } else if (firstBillBalance == 0) {
                    billsList[1]['CardAmount'] = cardAmountTemp
                    billsList[1]['OnlineAmount'] = onlineAmountTemp
                }

            }
            else if (fristBillnetamt == cashAmountTemp) {
                billsList[0]['CashAmount'] = cashAmountTemp
                billsList[1]['CardAmount'] = cardAmountTemp
                billsList[1]['OnlineAmount'] = onlineAmountTemp
            }

            if (billsList[0].CashAmount != 0 || billsList[0].CardAmount != 0 || billsList[0].OnlineAmount != 0) {
                debugger
                let totalcost = Number(card) + Number(storecash) + Number(online)
                if ((Number(Amount) < totalcost) || (Number(Amount) > totalcost)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect card/online payment. Please verify...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                    return false;
                } else {
                    BillPaid(billsList)
                }
            }

        }

        store.delete('SaleHeaderId');
        loadSaleHeader();
        selectedSaleHeaderIds = [];
        selectedSaleHeaderId = 0;
        cleardata();
        document.getElementById("IsOtherStateCustomer").checked = false;
        document.getElementById("IsOtherStateCustomerOpt").innerText = "No";

        if (IsPineLabPaymentModeValue == 1) { //  Pinelabs mode on 
            PineLabsModeCheck(0);
        } else if (IsPaytmPaymentModeValue == 1) { //  PaytmPay mode on 
            PaytmModeCheck(0);
        }

        PaymentProcessStatus = 0;
        PendingPaymentBill = [];
        ClearDisable(false);

    }
    else if (selectedSaleHeaderIds.length == 1) {
        debugger;

        let totalcost = Number(card) + Number(storecash) + Number(online)
        if ((Number(Amount) < totalcost) || (Number(Amount) > totalcost)) {
            Swal.fire({
                icon: 'error',
                title: 'Incorrect card/online payment. Please verify...',
                confirmButtonColor: '#d33',
                confirmButtonText: 'ok'
            })
            return false;
        } else {
            let saleHeaderList = {
                SaleHeaderId: selectedSaleHeaderIds[0],
                //BillNo: document.getElementById("BillNo").value,
                CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                // NetAmount: document.getElementById("NetAmount").innerHTML,
                CashAmount: document.getElementById("CashAmount").value == '' ? 0 : storecash,
                CardAmount: document.getElementById("CardAmount").value == '' ? 0 : document.getElementById("CardAmount").value,
                OnlineAmount: document.getElementById("OnlineAmount").value == '' ? 0 : document.getElementById("OnlineAmount").value,
                AmountPaid: document.getElementById("AmountPaid").innerHTML == '' ? 0 : document.getElementById("AmountPaid").innerHTML,
                Balance: document.getElementById("Balance").innerHTML == '' ? 0 : document.getElementById("Balance").innerHTML,
                IsPaid: 1,
                IsOtherStateCustomer: IsOtherStateCustomerValue,
                IsCreditBill: 0,
                Ref: loginId,
                UpdatedOn: serverDate
            }
            debugger;
            if (saleHeaderList.SaleHeaderId != undefined) {
                debugger;

                BillingdbService.updateSaleHeaderList(saleHeaderList).then((data) => {
                    store.delete('SaleHeaderId')
                    loadSaleHeader();
                    selectedSaleHeaderIds = [];
                    selectedSaleHeaderId = 0;
                    cleardata();
                    document.getElementById("IsOtherStateCustomer").checked = false;
                    document.getElementById("IsOtherStateCustomerOpt").innerText = "No";

                    if (IsPineLabPaymentModeValue == 1) { //  Pinelabs mode on 
                        PineLabsModeCheck(0);
                    } else if (IsPaytmPaymentModeValue == 1) { //  PaytmPay mode on 
                        PaytmModeCheck(0);
                    }

                    PaymentProcessStatus = 0;
                    PendingPaymentBill = [];
                    ClearDisable(false);

                    Swal.fire({
                        title: "Bills Paid Sucessfully.",
                        icon: 'success',
                        confirmButtonColor: '#5cb85c',
                        confirmButtonText: 'ok',
                        timer: 1500
                    }).then((res) => {
                        if (pendingBills.length == 0) {
                            window.close()
                        }
                    })
                },
                    (error) => {
                        ErrorLog.writeLogFile('PayBill', error)
                    });
            }
        }

    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'Please Choose Bill...',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok'
        })

    }

}

var F5 = $.fn.Pay = function (event) {
    debugger;

    if (document.getElementById("BillNo").value != '') {
        if (document.getElementById("NetAmount").innerHTML != '' && document.getElementById("NetAmount").innerHTML != 0.00) {
            debugger
            let AmountPaid = document.getElementById("AmountPaid").innerHTML
            let Amount = document.getElementById("NetAmount").innerHTML
            let card = document.getElementById("CardAmount").value
            let online = document.getElementById("OnlineAmount").value
            let cash = document.getElementById("CashAmount").value
            let balance = document.getElementById("Balance").innerHTML
            let storecash = +cash - +balance
            let date = new Date();
            var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

            if (store.get('IsOnline') == 'true') {
                loginId = EncrDecrService.decrypt(store.get('Ref'))
            }
            else {
                loginId = store.get('Ref')
            }

            //    if ((cash == 0 || cash == '' && (card != 0 || online != 0)) || (cash != 0 || cash != '' && (card != 0 || online != 0))) {

            if ((cash == 0 || cash == '' && (card != 0 || online != 0))) {
                let totalcost = Number(card) + Number(cash) + Number(online)
                if (Number(Amount) < totalcost) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect card/online payment. Please verify...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                    return false;
                }
            }

            if (+AmountPaid >= +Amount) {
                debugger
                if (((+Amount == +card) || ((+Amount == ((+card + +cash) + (+online)))) || ((+Amount == +card + +cash)) && +card != 0 && +cash != 0) || ((+Amount == +online) || ((+Amount == +online + +cash)) && +card != 0 && +cash != 0) || (+cash >= +Amount)) {
                    debugger;

                    //event is 0 or undefined  normal pay , event is 1 PineLabsPay or PaytmPay
                    let PayType = event == 0 || event == undefined ? 'NormalPay' : event == 1 ? 'PineLabsPay' : 'PaytmPay';
                    let CashAmountCheck = Number(document.getElementById("CashAmount").value);
                    let CardAmountCheck = Number(document.getElementById("CardAmount").value);
                    let OnlineAmountCheck = Number(document.getElementById("OnlineAmount").value);
                    let TotalBillAmt = Number(CashAmountCheck) + Number(CardAmountCheck) + Number(OnlineAmountCheck);

                    // Paytype wise enter key allow 
                    if (PayType == 'NormalPay') {
                        if (PaymentProcessStatus == 1 && PendingPaymentBill.length > 0) { // Payment Process On and Pending Bill is not empty
                            // if(TotalBillAmt > Number(Amount)){  //  insufficient total amount 
                            //     Swal.fire({
                            //         icon: 'error',
                            //         title: 'Incorrect Amount payment. Please verify',
                            //         confirmButtonColor: '#d33',
                            //         confirmButtonText: 'ok'
                            //     })
                            //     return false;
                            // }else{
                            PaymentDevicetoNormalPayConvert(PayType);
                            // }
                        } else {
                            if ((IsPineLabPaymentModeValue || IsPaytmPaymentModeValue) && (CardAmountCheck != 0 || OnlineAmountCheck != 0)) { // Pinelabs mode on and card or online payment only allow 
                                if (event == 0 && IsNormalPaymentModeValue) { // Normal payment mode on and click normal pay button to allow 
                                    updateSaleHeader(PayType);
                                } else {
                                    if (IsPineLabPaymentModeValue == 1) { //  Pinelabs mode on 
                                        $(this).PineLabsPay(PayType);
                                    } else if (IsPaytmPaymentModeValue == 1) { //  PaytmPay mode on 
                                        $(this).PaytmPay(PayType);
                                    }
                                }
                            }
                            else {   // (Pinelabs or PaytmPay ) off 
                                updateSaleHeader(PayType);
                            }
                        }
                    }
                    else {

                        if (CashAmountCheck != 0 && CardAmountCheck == 0 && OnlineAmountCheck == 0) {  // cash only allow normal payment 
                            updateSaleHeader(PayType)
                        }
                        else {
                            if (TotalBillAmt > Number(Amount)) {  //  insufficient total amount 
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Incorrect Amount payment. Please verify',
                                    confirmButtonColor: '#d33',
                                    confirmButtonText: 'ok'
                                })
                                return false;
                            }
                            else {
                                if (IsPineLabPaymentModeValue == 1 && PayType == 'PineLabsPay') {
                                    $(this).PineLabsPay(PayType);
                                }
                                else if (IsPaytmPaymentModeValue == 1 && PayType == 'PaytmPay') {
                                    $(this).PaytmPay(PayType);
                                }
                            }
                        }
                    }

                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect card/online payment. Please verify',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                }
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'insufficient Cash...',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'ok'
                })

            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Bill Amount Value As Zero...',
                confirmButtonColor: '#d33',
                confirmButtonText: 'ok'
            })
        }
    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'Please Choose Bill...',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok'
        })

    }
}

function BillPaid(billsList) {
    debugger
    let date = new Date();
    var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }
    for (let i = 0; i < billsList.length; i++) {
        debugger
        let saleHeaderList = {
            SaleHeaderId: billsList[i].SaleHeaderId,
            // BillNo: billsList[i].BillNo,
            CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
            PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
            GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
            RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
            // NetAmount: billsList[i].NetAmount,
            CashAmount: billsList[i].CashAmount,
            CardAmount: billsList[i].CardAmount,
            OnlineAmount: billsList[i].OnlineAmount,
            AmountPaid: billsList[i].NetAmount,
            Balance: document.getElementById("Balance").innerHTML == '' ? 0 : document.getElementById("Balance").innerHTML,
            IsPaid: 1,
            IsCreditBill: 0,
            IsOtherStateCustomer: IsOtherStateCustomerValue,
            Ref: loginId,
            UpdatedOn: serverDate
        }
        BillingdbService.updateSaleHeaderList(saleHeaderList).then(
            (data) => {
                debugger
                Swal.fire({
                    title: "Bills Paid Sucessfully.",
                    icon: 'success',
                    confirmButtonColor: '#5cb85c',
                    confirmButtonText: 'ok',
                    timer: 1500
                }).then((res) => {
                    if (pendingBills.length == 0) {
                        window.close()
                    }
                })
            },
            (error) => {
                ErrorLog.writeLogFile('PayBill', error)
            });
    }
}

$.fn.IsMarkComplementryBills = function () {
    debugger
    IsOtherStateCustomer()
    if (selectedSaleHeaderIds.length != 0) {
        debugger
        let date = new Date();
        var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
            let saleHeaderList = {
                CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                IsComplimentary: 1,
                IsPaid: 0,
                IsCreditBill: 0,
                SaleHeaderId: selectedSaleHeaderIds[i],
                IsOtherStateCustomer: IsOtherStateCustomerValue,
                Ref: loginId,
                UpdatedOn: serverDate
            }
            let CustomerName = document.getElementById("CustomerName").value.trim()
            if (CustomerName != "") {
                debugger
                if (saleHeaderList.SaleHeaderId != undefined) {

                    BillingdbService.updateSaleHeaderComplementryList(saleHeaderList).then(
                        (data) => {
                            Swal.fire({
                                title: 'Bill was changed Complementry Successfully',
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500

                            }).then((res) => {
                                if (pendingBills.length == 0) {
                                    window.close()
                                }
                            })
                            store.delete('SaleHeaderId')
                            loadSaleHeader()
                            cleardata()
                            document.getElementById("IsOtherStateCustomer").checked = false;
                            document.getElementById("IsOtherStateCustomerOpt").innerText = "No";
                            selectedSaleHeaderId = 0
                            selectedSaleHeaderIds = []

                        },
                        (error) => {
                            ErrorLog.writeLogFile('IsMarkComplementryBills', error)
                        });


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Please Choose Bill...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Please Enter Customer Name...',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'ok'
                })
            }

        }

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Please Choose Bill...',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok'
        })
    }



}

$.fn.IsMarkCreditBills = function () {
    debugger
    IsOtherStateCustomer()
    if (selectedSaleHeaderIds.length != 0) {

        let date = new Date();
        var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        for (let i = 0; i < selectedSaleHeaderIds.length; i++) {

            let saleHeaderList = {
                CustomerName: document.getElementById("CustomerName").value.trim() == '' ? "" : document.getElementById("CustomerName").value.trim(),
                PhoneNo: document.getElementById("phoneNo").value.trim() == '' ? "" : document.getElementById("phoneNo").value.trim(),
                GSTNo: document.getElementById("GSTNo").value.trim() == '' ? "" : document.getElementById("GSTNo").value.trim(),
                RefNo: document.getElementById("RefNo").value.trim() == '' ? "" : document.getElementById("RefNo").value.trim(),
                IsCreditBill: 1,
                IsPaid: 0,
                IsOtherStateCustomer: IsOtherStateCustomerValue,
                SaleHeaderId: selectedSaleHeaderIds[i],
                Ref: loginId,
                UpdatedOn: serverDate
            }
            let CustomerName = document.getElementById("CustomerName").value.trim()
            if (CustomerName != "") {
                if (saleHeaderList.SaleHeaderId != undefined) {
                    BillingdbService.updateSaleHeaderCreditList(saleHeaderList).then(
                        (data) => {
                            Swal.fire({
                                title: 'Bill was changed Credit Successfully',
                                icon: 'success',
                                confirmButtonColor: '#5cb85c',
                                confirmButtonText: 'ok',
                                timer: 1500
                            }).then((res) => {
                                if (pendingBills.length == 0) {
                                    window.close()
                                }
                            })
                            store.delete('SaleHeaderId')
                            loadSaleHeader()
                            cleardata()
                            document.getElementById("IsOtherStateCustomer").checked = false;
                            document.getElementById("IsOtherStateCustomerOpt").innerText = "No";
                            selectedSaleHeaderId = 0
                            selectedSaleHeaderIds = []

                        },
                        (error) => {
                            ErrorLog.writeLogFile('IsMarkCreditBills', error)
                        });

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Please Choose Bill...',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'ok'
                    })
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Please Enter CustomerName...',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'ok'
                })
            }
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Please Choose Bill...',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok'
        })
    }
}

function ClearDisable(type) {
    if (type) {
        // document.getElementById('CustomerName').disabled = true;
        // document.getElementById('phoneNo').disabled = true;
        // document.getElementById('GSTNo').disabled = true;
        // document.getElementById('RefNo').disabled = true;
        document.getElementById('CashAmount').disabled = true;
        document.getElementById('CardAmount').disabled = true;
        document.getElementById('OnlineAmount').disabled = true;
        document.getElementById("IsOtherStateCustomer").disabled = true;
    }
    else {
        // document.getElementById('CustomerName').disabled = false;
        // document.getElementById('phoneNo').disabled = false;
        // document.getElementById('GSTNo').disabled = false;
        // document.getElementById('RefNo').disabled = false;
        document.getElementById('CashAmount').disabled = false;
        document.getElementById('CardAmount').disabled = false;
        document.getElementById('OnlineAmount').disabled = false;
        document.getElementById("IsOtherStateCustomer").disabled = false;
    }
}

function loadPaymentHeader(PaymentHeaderList) {
    debugger;
    if (PaymentHeaderList.PaymentDeviceID != '') {

        PendingPaymentBill = [];
        let item = {
            POSId: POSId,
            BillCounterId: BillCounterId,
            PaymentDeviceID: PaymentHeaderList.PaymentDeviceID,
        }
        if (PaymentHeaderList.PaymentDevice == environment.PineLabsUrl.PaymentDevice) {

            BillingdbService.getPineLabHeader(item).then((data) => {
                debugger;
                PendingPaymentBill = data;
                if (PendingPaymentBill.length > 0) {

                    countDownTarget = 0;
                    selectedSaleHeaderId = 0
                    selectedSaleHeaderIds = [];

                    if (IsPineLabPaymentModeValue) { // PineLabs payment mode on cash , card and online input field disable 
                        debugger;
                        ClearDisable(true);
                    }

                    for (let i = 0; i < PendingPaymentBill.length; i++) { // color change 
                        if (PendingPaymentBill[i].PaymentDevice == environment.PineLabsUrl.PaymentDevice) {
                            PaymentProcessStatus = 1; // processing start
                            countDownTarget = PendingPaymentBill[i].TimeCountDown;
                            showClock(countDownTarget, PaymentProcessStatus); // exists bill show time 
                            $("#slotbtn_" + PendingPaymentBill[i].SaleHeaderId).removeClass("btn-new").addClass("btn-active");
                        }
                        // re-schedule selected bills
                        selectedSaleHeaderIds.push(PendingPaymentBill[i].SaleHeaderId);
                    }

                    debugger;
                    PineLabsModeCheck(1);
                    document.getElementById("IsOtherStateCustomer").checked = data[0].IsOtherStateCustomer;
                    document.getElementById("IsOtherStateCustomerOpt").innerText = data[0].IsOtherStateCustomer ? "Yes" : "No";
                    document.getElementById("BillNo").value = data[0].BillNo;
                    document.getElementById("CustomerName").value = data[0].CustomerName;
                    document.getElementById("phoneNo").value = data[0].PhoneNo;
                    document.getElementById("GSTNo").value = data[0].GSTNo;
                    document.getElementById("RefNo").value = data[0].RefNo;
                    document.getElementById("CashAmount").value = Number(data[0].CashAmount) != 0 ? data[0].CashAmount : '';
                    let Amt = Number(data[0].CashAmount) + Number(data[0].CardAmount) + Number(data[0].OnlineAmount);
                    document.getElementById("AmountPaid").innerHTML = parseFloat(Amt).toFixed(2);
                    document.getElementById("NetAmount").innerHTML = parseFloat(Amt).toFixed(2);

                    if (data[0].PaymentDeviceMode == environment.PaytmUrl.PaymentCardMode) {
                        document.getElementById("CardAmount").value = data[0].CardAmount;
                    }
                    else if (data[0].PaymentDeviceMode == environment.PaytmUrl.PaymentOnlineMode) {
                        document.getElementById("OnlineAmount").value = data[0].OnlineAmount;
                    }

                    if (PaymentHeaderList.type == 'onSlotClick') { // onSlotClick click trigger to loadBillData
                        debugger;
                        loadBillData(selectedSaleHeaderIds);
                    }
                }
            },
                (error) => {
                    ErrorLog.writeLogFile('loadPinePaymentHeader', error)

                })
        }
        else if (PaymentHeaderList.PaymentDevice == environment.PaytmUrl.PaymentDevice) {

            BillingdbService.getPaytmHeader(item).then((data) => {
                debugger;
                PendingPaymentBill = data;
                if (PendingPaymentBill.length > 0) {
                    countDownTarget = 0;
                    selectedSaleHeaderId = 0
                    selectedSaleHeaderIds = [];

                    if (IsPaytmPaymentModeValue) { // Paytm payment mode on cash , card and online input field disable 
                        debugger;
                        ClearDisable(true);
                    }

                    for (let i = 0; i < PendingPaymentBill.length; i++) { // color change
                        if (PendingPaymentBill[i].PaymentDevice == environment.PaytmUrl.PaymentDevice) {
                            PaymentProcessStatus = 1; // processing start
                            countDownTarget = PendingPaymentBill[i].TimeCountDown;
                            showClock(countDownTarget, PaymentProcessStatus); // exists bill show time 
                            $("#slotbtn_" + PendingPaymentBill[i].SaleHeaderId).removeClass("btn-new").addClass("btn-active");
                        }
                        // re-schedule selected bills
                        selectedSaleHeaderIds.push(PendingPaymentBill[i].SaleHeaderId);
                    }

                    debugger;
                    PaytmModeCheck(1);
                    document.getElementById("IsOtherStateCustomer").checked = data[0].IsOtherStateCustomer;
                    document.getElementById("IsOtherStateCustomerOpt").innerText = data[0].IsOtherStateCustomer ? "Yes" : "No";
                    document.getElementById("BillNo").value = data[0].BillNo;
                    document.getElementById("CustomerName").value = data[0].CustomerName;
                    document.getElementById("phoneNo").value = data[0].PhoneNo;
                    document.getElementById("GSTNo").value = data[0].GSTNo;
                    document.getElementById("RefNo").value = data[0].RefNo;
                    document.getElementById("CashAmount").value = Number(data[0].CashAmount) != 0 ? data[0].CashAmount : '';
                    let Amt = Number(data[0].CashAmount) + Number(data[0].CardAmount) + Number(data[0].OnlineAmount);
                    document.getElementById("AmountPaid").innerHTML = parseFloat(Amt).toFixed(2);
                    document.getElementById("NetAmount").innerHTML = parseFloat(Amt).toFixed(2);

                    if (data[0].PaymentDeviceMode == environment.PaytmUrl.PaymentCardMode) {
                        document.getElementById("CardAmount").value = data[0].CardAmount;
                    }
                    else if (data[0].PaymentDeviceMode == environment.PaytmUrl.PaymentOnlineMode) {
                        document.getElementById("OnlineAmount").value = data[0].OnlineAmount;
                    }

                    if (PaymentHeaderList.type == 'onSlotClick') { // onSlotClick click trigger to loadBillData
                        debugger;
                        loadBillData(selectedSaleHeaderIds);
                    }
                }
            },
                (error) => {
                    ErrorLog.writeLogFile('loadPaytmPaymentHeader', error)

                })
        }

    }
}

function UpdatePaymentDeviceStatus(saleHeaderList, type, PaymentDevice) {
    return new Promise(function (resolve, reject) {
        if (saleHeaderList.SaleHeaderId != undefined) {
            BillingdbService.updateSaleHeaderPaymentDeviceStatus(saleHeaderList, type, PaymentDevice).then((data) => {
                debugger;
                var jsonResponse = JSON.stringify({
                    Message: 'success',
                    Status: 'valid'
                });
                resolve(jsonResponse);
            },
                (error) => {
                    ErrorLog.writeLogFile(`${PaymentDevice} Payment ${saleHeaderList.type} Failed = `, JSON.stringify(error));

                    var jsonResponse = JSON.stringify({
                        Message: `Payment ${saleHeaderList.type} Failed `,
                        Status: 'invalid'
                    });
                    reject(jsonResponse);
                }).catch((err) => {
                    ErrorLog.writeLogFile(`${PaymentDevice} Payment ${saleHeaderList.type} catch Failed = `, JSON.stringify(err));

                    var jsonResponse = JSON.stringify({
                        Message: `Payment ${saleHeaderList.type} Failed `,
                        Status: 'invalid'
                    });
                    reject(jsonResponse);
                })
        }
        else {
            var jsonResponse = JSON.stringify({
                Message: 'Please Choose Bill...',
                Status: 'invalid'
            });
            reject(jsonResponse);
        }

    })
}

function UpdatePaymentConfirmStatus(saleHeaderList, type, PaymentDevice) {
    return new Promise(function (resolve, reject) {
        if (saleHeaderList.PaymentDeviceID != '') {
            BillingdbService.updatePaymentDeviceConfirmStatus(saleHeaderList, type, PaymentDevice).then((data) => {
                debugger;
                var jsonResponse = JSON.stringify({
                    Message: 'success',
                    Status: 'valid'
                });
                resolve(jsonResponse);
            },
                (error) => {
                    ErrorLog.writeLogFile(`${PaymentDevice} Payment Confrim ${saleHeaderList.type} Failed = `, JSON.stringify(error));

                    var jsonResponse = JSON.stringify({
                        Message: `Payment ${saleHeaderList.type} Failed `,
                        Status: 'invalid'
                    });
                    reject(jsonResponse);
                }).catch((err) => {
                    ErrorLog.writeLogFile(`${PaymentDevice} Payment Confrim ${saleHeaderList.type} catch Failed = `, JSON.stringify(err));

                    var jsonResponse = JSON.stringify({
                        Message: `Payment ${saleHeaderList.type} Failed `,
                        Status: 'invalid'
                    });
                    reject(jsonResponse);
                })
        }
        else {
            ErrorLog.writeLogFile(`${PaymentDevice} Payment Confrim ${saleHeaderList.type} Failed = `, JSON.stringify(saleHeaderList));

            var jsonResponse = JSON.stringify({
                Message: 'PlutusTransaction Reference ID is Empty',
                Status: 'invalid'
            });
            reject(jsonResponse);
        }
    })
}

function updateSaleHeaderPaymentCancel(saleHeaderList, type, PaymentDevice) {
    return new Promise(function (resolve, reject) {
        if (saleHeaderList.PaymentDeviceID != '') {
            BillingdbService.updateSaleHeaderPaymentCancelStatus(saleHeaderList, type, PaymentDevice).then((data) => {
                debugger;
                var jsonResponse = JSON.stringify({
                    Message: 'success',
                    Status: 'valid'
                });
                resolve(jsonResponse);
            },
                (error) => {
                    ErrorLog.writeLogFile(`${PaymentDevice} Payment Confrim Revert Failed = `, JSON.stringify(error));

                    var jsonResponse = JSON.stringify({
                        Message: `Payment ${saleHeaderList.type} Failed `,
                        Status: 'invalid'
                    });
                    reject(jsonResponse);
                }).catch((err) => {
                    ErrorLog.writeLogFile(`${PaymentDevice} Payment Confrim Revert catch Failed = `, JSON.stringify(err));

                    var jsonResponse = JSON.stringify({
                        Message: `Payment ${saleHeaderList.type} Failed `,
                        Status: 'invalid'
                    });
                    reject(jsonResponse);
                })
        }
        else {
            ErrorLog.writeLogFile(`${PaymentDevice} Payment Confrim Revert Failed = `, JSON.stringify(saleHeaderList));

            var jsonResponse = JSON.stringify({
                Message: 'Payment Device ID is Empty',
                Status: 'invalid'
            });
            reject(jsonResponse);
        }
    })
}

$.fn.PineLabsPay = async function (event) {

    // if(selectedSaleHeaderIds.length > 0 ){  
    //     let BillData1 =[] ;
    //     BillData1 = pendingBills.filter(row => row.PaymentDevice == environment.PineLabsUrl.PaymentDevice ); 
    //     // previous bills any one bill pinepayment send and multiple mode off for single request method
    //     if(BillData1.length > 0 && IsMultiplePaymentModeValue){  
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Single Payment Mode ',
    //             confirmButtonColor: '#d33',
    //             confirmButtonText: 'ok',
    //             allowOutsideClick: false,
    //         });
    //         return false;
    //     }
    //     else if(selectedSaleHeaderIds.length > 1 ){ // one bill already request send (pine payment ), second bill normal payment again send request warning error
    //         let BillData1 = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[0]);
    //         let BillData2  = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[1]);

    //         if(((BillData1[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice && BillData2[0].PaymentDevice == '' ) || (BillData1[0].PaymentDevice == '' && BillData2[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice)) &&  BillData1[0].PaymentDeviceID != BillData2[0].PaymentDeviceID){ 
    //             let BillNo = BillData1[0].PaymentDevice == environment.PineLabsUrl.PaymentDevice ? BillData1[0].BillNo : BillData2[0].BillNo;
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Already Payment Request Send ' + BillNo ,
    //                 confirmButtonColor: '#d33',
    //                 confirmButtonText: 'ok',
    //                 allowOutsideClick: false,
    //             });
    //             return false;
    //         }
    //     }
    // }

    let date = new Date();
    let filterBillsData = '';
    let SaleHeaderDetail = [];
    PaymentProcessStatus = 0;
    let AllowedPaymentMode = 0;
    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }
    //loginId = EncrDecrService.decrypt(store.get('Ref'));
    let AmountPaid = document.getElementById("AmountPaid").innerHTML;
    let Amount = document.getElementById("NetAmount").innerHTML;
    let card = document.getElementById("CardAmount").value;
    let online = document.getElementById("OnlineAmount").value;
    let cash = document.getElementById("CashAmount").value;
    let balance = document.getElementById("Balance").innerHTML;
    let storecash = +cash - +balance;
    let BillTimeDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    let IsOtherStateCus = document.getElementById("IsOtherStateCustomer").checked;

    if (Number(card) != 0 && Number(online) != 0) {

        Swal.fire({
            icon: 'error',
            title: 'Please enter Card or Online Payment',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok',
            allowOutsideClick: false,
        })
        return false;
    }

    showLoading();

    for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
        filterBillsData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
        SaleHeaderDetail.push(filterBillsData[0]);
    }

    debugger;
    let PineLabsAmount = 0;
    let PaymentMode = '';
    if (Number(card) != 0) {
        PineLabsAmount = Number(card);
        AllowedPaymentMode = environment.PineLabsUrl.PaymentCardMode;
        PaymentMode = environment.PaytmUrl.PaymentCardMode;

    } else if (Number(online) != 0) {
        PineLabsAmount = Number(online);
        AllowedPaymentMode = environment.PineLabsUrl.PaymentOnlineMode;
        PaymentMode = environment.PaytmUrl.PaymentOnlineMode;
    }

    let cashierName = store.get('DisplayName');
    let TransactionNumber = SaleHeaderDetail.length == 1 ? SaleHeaderDetail[0].BillNo : SaleHeaderDetail[0].BillNo + ',' + SaleHeaderDetail[1].BillNo;
    let SequenceNumber = Number(SaleHeaderDetail[0].DisplayBillNo);

    let Item = {
        "TransactionNumber": TransactionNumber,
        "SequenceNumber": SequenceNumber,
        "AllowedPaymentMode": AllowedPaymentMode,
        "MerchantStorePosCode": environment.PineLabsUrl.MerchantStorePOSCode,
        "Amount": (Number(PineLabsAmount) * 100),
        "UserID": cashierName,// filterBillsData[0].CashierName,                
        "MerchantID": environment.PineLabsUrl.MerchantID,
        "SecurityToken": environment.PineLabsUrl.SecurityToken,
        "IMEI": environment.PineLabsUrl.IMEI,
        // "AutoCancelDurationInMinutes":environment.PineLabsUrl.AutoCancelDurationInMinutes,
        "AutoCancelDurationInMinutes": AllowedPaymentMode == 10 ? environment.PineLabsUrl.AutoCancelDurationOnlineInMinutes : environment.PineLabsUrl.AutoCancelDurationInMinutes,
        "PaperPOSID": environment.PineLabsUrl.PaperPOSID,
        "PaperPOSTxnOptionToDisplay": environment.PineLabsUrl.PaperPOSTxnOptionToDisplay,
        "PaperPOSTxnIdentifier": environment.PineLabsUrl.PaperPOSTxnIdentifier,
    }

    if (AllowedPaymentMode == 10) {
        Item.BankCode = IsBankCode;
    }

    ErrorLog.writeLogFile('PineLabs UploadBilledTransaction Params = ', JSON.stringify(Item))
    debugger;

    // for testing purpose pinelabs
    // var response =[];
    // response.ResponseMessage = 'APPROVED'
    // response.ResponseCode = 0
    // response.PlutusTransactionReferenceID = Math.floor((Math.random() * 700000) + 1);

    $.post(environment.PineLabsUrl.pineLabsCloudUrl + '/UploadBilledTransaction', Item, async function (response) { // for testing purpose pinelabs request Comment this line
        debugger;
        // console.log('UploadBilledTransaction ', response);
        if (response.ResponseMessage == "APPROVED" && response.ResponseCode == 0) {
            ErrorLog.writeLogFile('PineLabs Request APPROVED = ', JSON.stringify(response));

            PaymentProcessStatus = 1;
            countDownTarget = 0;
            let InMinutes = AllowedPaymentMode == 10 ? environment.PineLabsUrl.AutoCancelDurationOnlineInMinutes : environment.PineLabsUrl.AutoCancelDurationInMinutes;
            countDownTarget = new Date().getTime() + InMinutes * 60 * 1000;
            let CompletedListCount = 0;
            let Salelength = SaleHeaderDetail.length;
            debugger;
            // update status of saleHeader and pinelabs header
            for (let i = 0; i < SaleHeaderDetail.length; i++) {
                let saleHeaderList = {
                    SaleHeaderId: SaleHeaderDetail[i].SaleHeaderId,
                    SaleDate: SaleHeaderDetail[i].SaleDate,
                    BillNo: document.getElementById("BillNo").value,
                    DisplayBillNo: SaleHeaderDetail[i].DisplayBillNo,
                    POSId: SaleHeaderDetail[i].POSId,
                    BillCounterId: SaleHeaderDetail[i].BillCounterId,
                    TableNo: document.getElementById("TableNo").innerHTML,
                    CustomerName: document.getElementById("CustomerName").value,
                    PhoneNo: document.getElementById("phoneNo").value,
                    GSTNo: document.getElementById("GSTNo").value,
                    RefNo: document.getElementById("RefNo").value,
                    TotalAmount: SaleHeaderDetail[i].NetAmount,
                    CompanyId: SaleHeaderDetail[i].CompanyId,
                    PaymentDeviceID: response.PlutusTransactionReferenceID,
                    AmountPaid: Number(AmountPaid),
                    IsOtherStateCustomer: IsOtherStateCus,
                    Amount: Number(Amount),
                    CardAmount: Number(card),
                    OnlineAmount: Number(online),
                    CashAmount: Number(cash),
                    TimeCountDown: countDownTarget,
                    // balance:Number(balance),
                    // storecash:Number(storecash),
                    CreatedOn: BillTimeDate,
                    UpdatedOn: BillTimeDate,
                    CreatedBy: loginId,
                    UpdatedBy: loginId,
                    Response: JSON.stringify(response),
                    PaymentDeviceMode: PaymentMode,
                    PaymentDevice: environment.PineLabsUrl.PaymentDevice,
                    type: 'Request',
                }

                await UpdatePaymentDeviceStatus(saleHeaderList, 'Add', environment.PineLabsUrl.PaymentDevice).then(async function (responsenodes) {
                    let res = JSON.parse(responsenodes);
                    if (res.Status == 'valid') {
                        CompletedListCount += 1;
                        if (Salelength == CompletedListCount) {

                            Swal.fire({
                                title: 'Payment Request Completed',
                                width: 500,
                                height: 200,
                                position: 'center',
                                icon: 'success',
                                timer: 3500
                            })

                            loadSaleHeader();

                            // after update refresh get amount and customer details in pinelabs header
                            let pinelabs = {
                                POSId: POSId,
                                BillCounterId: BillCounterId,
                                PaymentDeviceID: response.PlutusTransactionReferenceID,
                                PaymentDevice: environment.PineLabsUrl.PaymentDevice,
                            }
                            debugger;
                            loadPaymentHeader(pinelabs);
                        }
                    }
                    else if (res.Status == 'invalid') {
                        Swal.fire({
                            title: res.Message,
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })

                        ErrorLog.writeLogFile("Error in Add PineLabs UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
                    }
                }).catch(function (catchError) {
                    let res = JSON.parse(catchError);
                    Swal.fire({
                        title: res.Message,
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                    ErrorLog.writeLogFile("catchError in Add PineLabs UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
                })
            }
            PineLabsModeCheck(1);
        }
        else if (response.ResponseCode == 1) {
            // INVALID PAYMENT MODE RECEIVED
            PaymentProcessStatus = 1;
            let ResponseMessage = response.ResponseMessage;
            let error, icon;
            if (ResponseMessage == 'PLEASE APPROVE OPEN TXN FIRST') {
                error = 'Please Open PineLabs Device and Check Previous Payment Request ! '
                icon = 'warning';
            }
            else if (ResponseMessage == 'TXN WITH SIMILAR PARAMS IS ALREADY IN PROGRESS') {
                error = 'This Bill Is Already In Process ! '
                icon = 'warning';
            }
            else {
                error = 'PAYMENT REQUEST FAILED ' + response.ResponseMessage;
                icon = 'error';
            }

            Swal.fire({
                title: error,
                icon: icon,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                width: 850,
            })
            ErrorLog.writeLogFile('ResponseCode is 1 PineLabs Payment Request Failed = ', JSON.stringify(response))
        }
        else {
            Swal.fire({
                title: 'PAYMENT REQUEST FAILED ' + response.ResponseMessage,
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                width: 850,
            })
            ErrorLog.writeLogFile('PineLabs Payment Request Failed = ', JSON.stringify(response))
        }
    }).catch(function (err) { // for testing purpose pinelabs request Comment this catch line
        let errormsg;
        if (err.statusText == "Not Found") {
            errormsg = " PineLabs Payment Request Failed / Not Found"
        }
        else if (err.statusText == "error") {
            errormsg = 'Internet Disconnected..Please check!!'
        }
        else {
            errormsg = err.statusText;
        }
        Swal.fire({
            icon: 'error',
            title: errormsg,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        })
        ErrorLog.writeLogFile('PineLabs Payment Request catcherror =', JSON.stringify(err))
    });
}


$.fn.PineLabsPayConfirm = function (event) {

    let PaymentStatus = [];
    let filterBillsData = '';
    let SaleHeaderDetail = [];
    let PaymentDeviceID = '';

    for (let i = 0; i < PendingPaymentBill.length; i++) {
        //filterBillsData = Bills.filter(row => row.SaleHeaderId == PendingPaymentBill[i].SaleHeaderId);  
        if (PendingPaymentBill[i].PaymentDevice == '') {
            let BillNo = { BillNo: PendingPaymentBill[i].BillNo }
            PaymentStatus.push(BillNo)
        }
        else {
            SaleHeaderDetail.push(PendingPaymentBill[i])
        }
    }

    // if(PaymentStatus.length > 0){ 
    //     let BillNo = PaymentStatus.length == 1 ? PaymentStatus[0].BillNo : PaymentStatus[0].BillNo + ' , ' + PaymentStatus[1].BillNo;
    //     Swal.fire({
    //         title:  'Not Pay in PineLabs ' + BillNo,
    //         icon: 'error',
    //         confirmButtonColor: '#d33',
    //         cancelButtonColor: '#3085d6',
    //         confirmButtonText: 'OK',
    //         allowOutsideClick: false,
    //         width: 950
    //     })
    //     return false;
    // }

    let date = new Date();
    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }
    //loginId = EncrDecrService.decrypt(store.get('Ref'));
    let cashierName = store.get('DisplayName');
    let AmountPaid = document.getElementById("AmountPaid").innerHTML;
    let Amount = document.getElementById("NetAmount").innerHTML;
    let card = document.getElementById("CardAmount").value;
    let online = document.getElementById("OnlineAmount").value
    let cash = document.getElementById("CashAmount").value;
    let balance = document.getElementById("Balance").innerHTML;
    let storecash = +cash - +balance;
    let BillTimeDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);


    if (SaleHeaderDetail.length == 1) {
        PaymentDeviceID = SaleHeaderDetail[0].PaymentDeviceID;
    } else {
        if (SaleHeaderDetail[0].PaymentDeviceID == SaleHeaderDetail[1].PaymentDeviceID) {
            PaymentDeviceID = SaleHeaderDetail[0].PaymentDeviceID;
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Mismatched Payment Device ID',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })
            return false;
        }
    }

    if (SaleHeaderDetail[0].PaymentDeviceMode == environment.PaytmUrl.PaymentCardMode && Number(card) == 0) {
        Swal.fire({
            title: 'Your Payment Mode is Card',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            width: 850,
        })
        return false;
    }
    else if (SaleHeaderDetail[0].PaymentDeviceMode == environment.PaytmUrl.PaymentOnlineMode && Number(online) == 0) {
        Swal.fire({
            title: 'Your Payment Mode is Online',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            width: 850,
        })
        return false;
    }

    let Item = {
        "MerchantID": environment.PineLabsUrl.MerchantID,
        "SecurityToken": environment.PineLabsUrl.SecurityToken,
        "IMEI": environment.PineLabsUrl.IMEI,
        "UserID": cashierName,
        "MerchantStorePosCode": environment.PineLabsUrl.MerchantStorePOSCode,
        "PlutusTransactionReferenceID": PaymentDeviceID,
    }


    $.post(environment.PineLabsUrl.pineLabsCloudUrl + '/GetCloudBasedTxnStatus', Item, async function (response) {
        debugger;
        //console.log('GetCloudBasedTxnStatus ', response);

        if (response.ResponseCode == 0) { // Success Confrim // for testing purpose pinelabs confirm Comment this line
            //if (response.ResponseCode == 1 || response.ResponseCode == 1001){ // for testing purpose pinelabs confirm  

            ErrorLog.writeLogFile('PineLabs Payment Confirm Success = ', JSON.stringify(response));
            debugger;

            await updateSaleHeader('PineLabsPay');

            // let CompletedListCount = 0;
            // let Salelength = 0;
            // Salelength = SaleHeaderDetail.length;

            let saleHeaderList = {
                PaymentDeviceID: PaymentDeviceID,
                IsRequestCancelled: 0,
                IsPaid: 1,
                UpdatedOn: BillTimeDate,
                UpdatedBy: loginId,
                Response: JSON.stringify(response),
                type: 'Update',
                PaymentDevice: 1
            }
            debugger;
            await UpdatePaymentConfirmStatus(saleHeaderList, 'Update', environment.PineLabsUrl.PaymentDevice).then(async function (responsenodes) {

                let res = JSON.parse(responsenodes);

                if (res.Status == 'valid') {
                    // Swal.fire({
                    //     title: 'Payment Success Completed',
                    //     width: 500,
                    //     height: 200,
                    //     position: 'center',
                    //     icon: 'success',
                    //     timer: 3500
                    // })
                }
                else if (res.Status == 'invalid') {
                    Swal.fire({
                        title: res.Message,
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })

                    ErrorLog.writeLogFile("Error in Update PineLabs UpdatePaymentConfirmStatus", JSON.stringify(saleHeaderList));
                }
            }).catch(function (catchError) {
                let res = JSON.parse(catchError);
                Swal.fire({
                    title: res.Message,
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
                ErrorLog.writeLogFile("Error in Update PineLabs UpdatePaymentConfirmStatus", JSON.stringify(saleHeaderList));
            })
        }
        else if (response.ResponseCode == 1 || response.ResponseCode == 1052) {
            debugger;
            let ResponseMessage = response.ResponseMessage;
            let error, icon;
            //ResponseMessage == 'INVALID INPUT'

            if (ResponseMessage == 'INVALID TRANSACTION NUMBER' || ResponseMessage == 'INVALID PLUTUS TXN REF ID' || ResponseMessage == "CBI UPI/PhonePe TXN INITIATED. Perform GetStatus") {

                ErrorLog.writeLogFile('PineLabs Payment confirm Failed response = ', JSON.stringify(response));

                if (ResponseMessage == 'INVALID TRANSACTION NUMBER') {
                    error = 'Payment Request Time Out';
                }
                else if (ResponseMessage == 'INVALID PLUTUS TXN REF ID' || ResponseMessage == "CBI UPI/PhonePe TXN INITIATED. Perform GetStatus") {
                    error = 'Payment Request Time Over';
                }
                else {
                    error = ResponseMessage;
                }

                let saleHeaderList = {
                    PaymentDeviceID: PaymentDeviceID,
                    PaymentDeviceMode: '',
                    IsRequestCancelled: 1,
                    IsPaid: 0,
                    UpdatedOn: BillTimeDate,
                    UpdatedBy: loginId,
                    Response: JSON.stringify(response),
                    type: 'Cancel',
                    PaymentDevice: '',
                }
                await updateSaleHeaderPaymentCancel(saleHeaderList, 'Cancel', environment.PineLabsUrl.PaymentDevice).then(async function (responsenodes) {

                    let res = JSON.parse(responsenodes);

                    if (res.Status == 'valid') {
                        Swal.fire({
                            title: error,
                            width: 500,
                            height: 200,
                            position: 'center',
                            icon: 'warning',
                            timer: 3500
                        })

                        loadSaleHeader();
                        PineLabsModeCheck(0);
                        PaymentProcessStatus = 0;
                        selectedSaleHeaderIds = [];
                        PendingPaymentBill = [];
                        selectedSaleHeaderId = 0;
                        cleardata();
                        ClearDisable(false);
                    }
                    else if (res.Status == 'invalid') {

                        Swal.fire({
                            title: res.Message,
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })

                        ErrorLog.writeLogFile("Error in TimeOut Update PineLabs updateSaleHeaderPaymentCancel", JSON.stringify(saleHeaderList));
                    }
                }).catch(function (catchError) {
                    let res = JSON.parse(catchError);

                    Swal.fire({
                        title: res.Message,
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })

                    ErrorLog.writeLogFile("Error in TimeOut Update PineLabs updateSaleHeaderPaymentCancel", JSON.stringify(saleHeaderList));
                })
            }
            else {

                if (ResponseMessage == 'TXN UPLOADED') {
                    debugger;
                    PaymentProcessStatus = 1;
                    error = 'Payment Is On Progress, Please wait!!';
                    icon = 'warning';

                }
                else {
                    debugger;
                    error = response.ResponseMessage;
                    icon = 'error';
                }

                Swal.fire({
                    title: error,
                    icon: icon,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    width: 850,
                })
                ErrorLog.writeLogFile("PineLabs Payment confirm Failed in Else ", JSON.stringify(response));

                return false;
            }
        }
        else {
            let ResponseMessage = response.ResponseMessage;
            let error, icon;

            if (ResponseMessage == 'TXN UPLOADED' && response.ResponseCode == 1001) {
                PaymentProcessStatus = 1;
                error = 'Payment Is On Progress, Please wait!!';
                icon = 'warning';
            } else {
                error = ResponseMessage;
                icon = 'error';
            }

            Swal.fire({
                title: error,
                icon: icon,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                width: 850,
            })

            ErrorLog.writeLogFile('PineLabs Payment confirm Failed= ', JSON.stringify(response));

            return false;
        }

    }).catch(function (err) {
        let errormsg;

        if (err.statusText == "Not Found") {
            errormsg = "Payment Confirm Failed / Not Found"
        }
        else if (err.statusText == "error") {
            errormsg = 'PineLabs Internet Disconnected..Please check!!'
        }
        else {
            errormsg = err.statusText;
        }

        Swal.fire({
            icon: 'error',
            title: errormsg,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            width: 850,
        })

        ErrorLog.writeLogFile('PineLabs Payment catch error =', JSON.stringify(err))

        return false;
    });

}


// $.fn.PineLabsPayCancel = function (event) {

//     if(selectedSaleHeaderIds.length == 0){
//         Swal.fire({
//             title: 'Please Choose Bill...',
//             confirmButtonColor: '#d33',
//             confirmButtonText: 'ok'
//         })
//         return false;
//     }

//     Swal.fire({
//         title:  "Payment Is On Progress, Are you sure want to cancel ?",
//         icon: 'question',
//         confirmButtonColor: '#5cb85c',
//         allowOutsideClick: false,
//         cancelButton: '#d33',
//         showCancelButton: true,
//         confirmButtonText: 'Yes',
//         cancelButtonText: 'Cancel',
//         width: 850
//     }).then((res) => {
//         if(res.isConfirmed){
//             let filterBillsData = '';
//             let SaleHeaderDetail = [];
//             let PaymentDeviceID;
//             if (store.get('IsOnline') == 'true') {
//                    loginId = EncrDecrService.decrypt(store.get('Ref'))
//             }
//             else {
//                    loginId = store.get('Ref')
//              }
//            // loginId = EncrDecrService.decrypt(store.get('Ref'));
//             let cashierName =  store.get('DisplayName');
//             let BillTimeDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

//             if(PendingPaymentBill.length == 1){
//                 PaymentDeviceID = PendingPaymentBill[0].PaymentDeviceID;
//             }else{
//                 if(PendingPaymentBill[0].PaymentDeviceID == PendingPaymentBill[1].PaymentDeviceID){
//                     PaymentDeviceID = PendingPaymentBill[0].PaymentDeviceID;
//                 }
//                 else{
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Mismatch Transaction Reference ID',
//                         confirmButtonColor: '#d33',
//                         cancelButtonColor: '#3085d6',
//                         confirmButtonText: 'OK',
//                         allowOutsideClick: false,
//                     })
//                     return false;
//                 }
//             }

//             let Amounts = 0;
//             if(PendingPaymentBill[0].PaymentDeviceID = PaymentDeviceID){
//                 if(PendingPaymentBill[0].PaymentDeviceMode == environment.PaytmUrl.PaymentCardMode){
//                     Amounts = PendingPaymentBill[0].CardAmount;
//                 }else if(PendingPaymentBill[0].PaymentDeviceMode == environment.PaytmUrl.PaymentOnlineMode){
//                     Amounts = PendingPaymentBill[0].OnlineAmount;
//                 }
//             }

//             let Item = {
//                 "MerchantID":environment.PineLabsUrl.MerchantID,           
//                 "SecurityToken":environment.PineLabsUrl.SecurityToken,
//                 "IMEI": environment.PineLabsUrl.IMEI,
//                 "UserID": cashierName, 
//                 "MerchantStorePosCode":environment.PineLabsUrl.MerchantStorePOSCode,
//                 ""PlutusTransactionReferenceID":PaymentDeviceID,
//                 "Amount": (Amounts*100),  
//             }


//             ErrorLog.writeLogFile('CancelTransaction Params = ', JSON.stringify(Item))
//             debugger;
//             $.post(environment.PineLabsUrl.pineLabsCloudUrl + '/CancelTransactionForced', Item, async function (response) {  
//                  // CancelTransaction -- 2 minutes after cancel
//                   // CancelTransactionForced -- immediate cancel
//                 debugger;
//               //  console.log('CancelTransactionForced ', response);
//                 if (response.ResponseCode == 0)  {  // && response.ResponseMessage == 'APPROVED'

//                     ErrorLog.writeLogFile('Payment Request Cancel Success = ', JSON.stringify(response));
//                     let CompletedListCount = 0;
//                     let Salelength = PendingPaymentBill.length;

//                     for (let i = 0; i < PendingPaymentBill.length; i++) {
//                         let saleHeaderList = {
//                             SaleHeaderId : PendingPaymentBill[i].SaleHeaderId,
//                             OldPlutusTransactionReferenceID:PaymentDeviceID,
//                             PaymentDeviceID: event == 0 ? PaymentDeviceID : '',
//                             PaymentDeviceMode: '',
//                             IsRequestCancelled :1,
//                             IsPaid:0,
//                             UpdatedOn: BillTimeDate,
//                             UpdatedBy : loginId,
//                             Response : JSON.stringify(response),
//                             title: 'Payment Request Cancel Completed',
//                             type: 'Cancel',
//                             icon: 'success',
//                             PaymentDevice: ''
//                         }
//                         await UpdatePaymentDeviceStatus(saleHeaderList,'Cancel',environment.PineLabsUrl.PaymentDevice).then(async function (responsenodes) {
//                             let res = JSON.parse(responsenodes);

//                             if(res.Status == 'valid'){
//                                 CompletedListCount += 1; 
//                                 if(Salelength == CompletedListCount){

//                                     Swal.fire({
//                                         title: 'Payment Request Cancel Completed',
//                                         width: 500,
//                                         height: 200,
//                                         position: 'center',
//                                         icon: 'warning',
//                                         timer: 3500
//                                     })

//                                     loadSaleHeader();
//                                     PineLabsModeCheck(0);
//                                     PaymentProcessStatus = 0;
//                                     selectedSaleHeaderIds = [];
//                                     PendingPaymentBill = [];
//                                     selectedSaleHeaderId = 0;
//                                     cleardata();
//                                     ClearDisable(false);
//                                 }
//                             }
//                             else if(res.Status == 'invalid'){
//                                 Swal.fire({
//                                     title: res.Message,
//                                     icon: 'error',
//                                     confirmButtonColor: '#d33',
//                                     cancelButtonColor: '#3085d6',
//                                     confirmButtonText: 'OK',
//                                     allowOutsideClick: false,
//                                 })

//                                 ErrorLog.writeLogFile("Error in Cancel UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
//                             }
//                         }).catch(function (catchError) {
//                             let res = JSON.parse(catchError);
//                             Swal.fire({
//                                 title: res.Message,
//                                 icon: 'error',
//                                 confirmButtonColor: '#d33',
//                                 cancelButtonColor: '#3085d6',
//                                 confirmButtonText: 'OK',
//                                 allowOutsideClick: false,
//                             })
//                             ErrorLog.writeLogFile("Error in Cancel UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
//                         })
//                     }

//                 }
//                 else if (response.ResponseCode == 1 && response.ResponseMessage == 'TRANSACTION NOT FOUND') {
//                     ErrorLog.writeLogFile('TRANSACTION NOT FOUND = ', JSON.stringify(response));
//                     let CompletedListCount = 0;
//                     let Salelength = PendingPaymentBill.length;

//                     for (let i = 0; i < PendingPaymentBill.length; i++) {
//                         let saleHeaderList = {
//                             SaleHeaderId : PendingPaymentBill[i].SaleHeaderId,
//                             OldPlutusTransactionReferenceID:PaymentDeviceID,
//                             PaymentDeviceID: event == 0 ? PaymentDeviceID : '',
//                             PaymentDeviceMode: '',
//                             IsRequestCancelled :1,
//                             IsPaid:0,
//                             UpdatedOn: BillTimeDate,
//                             UpdatedBy : loginId,
//                             Response : JSON.stringify(response),
//                             title: 'Payment Request Not Found',
//                             type: 'Cancel',
//                             icon: 'error',
//                             PaymentDevice:''
//                         }
//                         await UpdatePaymentDeviceStatus(saleHeaderList,'Cancel').then(async function (responsenodes) {
//                             let res = JSON.parse(responsenodes);

//                             if(res.Status == 'valid'){
//                                 CompletedListCount += 1; 
//                                 if(Salelength == CompletedListCount){

//                                     Swal.fire({
//                                         title:'Payment Request Not Found',
//                                         width: 500,
//                                         height: 200,
//                                         position: 'center',
//                                         icon: 'warning',
//                                         timer: 3500
//                                     })

//                                     loadSaleHeader();
//                                     PineLabsModeCheck(0);
//                                     PaymentProcessStatus = 0;
//                                     selectedSaleHeaderIds = [];
//                                     PendingPaymentBill = [];
//                                     selectedSaleHeaderId = 0;
//                                     cleardata();
//                                     ClearDisable(false);
//                                 }
//                             }
//                             else if(res.Status == 'invalid'){
//                                 Swal.fire({
//                                     title: res.Message,
//                                     icon: 'error',
//                                     confirmButtonColor: '#d33',
//                                     cancelButtonColor: '#3085d6',
//                                     confirmButtonText: 'OK',
//                                     allowOutsideClick: false,
//                                 })

//                                 ErrorLog.writeLogFile("Error in Cancel UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
//                             }
//                         }).catch(function (catchError) {
//                             let res = JSON.parse(catchError);
//                             Swal.fire({
//                                 title: res.Message,
//                                 icon: 'error',
//                                 confirmButtonColor: '#d33',
//                                 cancelButtonColor: '#3085d6',
//                                 confirmButtonText: 'OK',
//                                 allowOutsideClick: false,
//                             })
//                             ErrorLog.writeLogFile("Error in Cancel UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
//                         })
//                     }

//                 }
//                 else if (response.ResponseCode == 1) {
//                     let ResponseMessage = response.ResponseMessage;
//                     if(ResponseMessage == 'CANNOT CANCEL AS TRANSACTION IS IN PROGRESS'){
//                         PaymentProcessStatus = 1;
//                         error = 'Payment Is On Progress, Please wait!!';
//                         icon ='warning';
//                     }
//                     else{
//                         error = 'PAYMENT REQUEST CANCEl FAILED '+ response.ResponseMessage;
//                         icon ='error';
//                     }

//                     Swal.fire({
//                         title: error,
//                         icon: icon,
//                         confirmButtonColor: '#d33',
//                         cancelButtonColor: '#3085d6',
//                         confirmButtonText: 'OK',
//                         allowOutsideClick: false,
//                         width: 850,
//                     })
//                     ErrorLog.writeLogFile('Payment Request Cancel Failed = ', JSON.stringify(response))
//                 }
//                 else{
//                     let ResponseMessage = response.ResponseMessage;
//                     if(ResponseMessage == 'CANNOT CANCEL AS TRANSACTION IS IN PROGRESS'){
//                         PaymentProcessStatus = 1;
//                         error = 'Payment Is On Progress, Please wait!!';
//                         icon ='warning';
//                     }
//                     else{
//                         error = 'PAYMENT REQUEST CANCEl FAILED '+ response.ResponseMessage;
//                         icon ='error';
//                     }

//                     Swal.fire({
//                         title: error,
//                         icon: icon,
//                         confirmButtonColor: '#d33',
//                         cancelButtonColor: '#3085d6',
//                         confirmButtonText: 'OK',
//                         allowOutsideClick: false,
//                         width: 850,
//                     })
//                     ErrorLog.writeLogFile('Payment Request Cancel Failed = ', JSON.stringify(response))
//                 }
//             }).catch(function (err) {
//                 let errormsg;
//                 if(err.statusText == "Not Found"){
//                     errormsg = " Payment Request Cancel Failed / Not Found"
//                 }
//                 else if(err.statusText == "error"){
//                     errormsg = 'Internet Disconnected..Please check!!'
//                 }
//                 else{
//                     errormsg = err.statusText;
//                 }
//                 Swal.fire({
//                     icon: 'error',
//                     title: errormsg,
//                     confirmButtonColor: '#d33',
//                     cancelButtonColor: '#3085d6',
//                     confirmButtonText: 'OK',
//                     allowOutsideClick: false,
//                 })
//                 ErrorLog.writeLogFile('Payment Request Cancel error =', JSON.stringify(err))
//             });
//         }
//         else if(res.isDismissed){
//         //    console.log('isDismissed',res.isDismissed);
//         }
//     })
// }


// Paytm Device  ----------------------------------------------------------------------------------------------------------------------


function PaytmCheckSum(body, type) {
    return new Promise(function (resolve, reject) {
        let originalchecksum = '';
        var paytmChecksum = payTm.generateSignature(body, environment.PaytmUrl.MERCHANT_KEY);

        paytmChecksum.then(async function (checksum) {
            originalchecksum = checksum;
            let isVerifySignature = payTm.verifySignature(body, environment.PaytmUrl.MERCHANT_KEY, originalchecksum);

            if (isVerifySignature) {
                // console.log('signature matched');
                var jsonResponse = JSON.stringify({
                    Message: 'signature matched',
                    Status: 'valid',
                    checksum: originalchecksum
                });
                resolve(jsonResponse);
            } else {
                // console.log('signature mismatched');
                var jsonResponse = JSON.stringify({
                    Message: 'signature mismatched',
                    Status: 'invalid',
                    checksum: originalchecksum
                });
                reject(jsonResponse);
            }
        })
    })
}

$.fn.PaytmPay = async function (event) {
    debugger;
    let date = new Date();
    let filterBillsData = '';
    let SaleHeaderDetail = [];
    PaymentProcessStatus = 0;

    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }

    // loginId = EncrDecrService.decrypt(store.get('Ref'));
    let AmountPaid = document.getElementById("AmountPaid").innerHTML;
    let Amount = document.getElementById("NetAmount").innerHTML;
    let card = document.getElementById("CardAmount").value;
    let online = document.getElementById("OnlineAmount").value;
    let cash = document.getElementById("CashAmount").value;
    let balance = document.getElementById("Balance").innerHTML;
    let storecash = +cash - +balance;
    let BillTimeDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    let IsOtherStateCus = document.getElementById("IsOtherStateCustomer").checked;
    let cashierName = store.get('DisplayName');

    if (Number(card) != 0 && Number(online) != 0) {

        Swal.fire({
            icon: 'error',
            title: 'Please enter Card or Online Payment',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ok',
            allowOutsideClick: false,
        })
        return false;
    }

    showLoading();

    for (let i = 0; i < selectedSaleHeaderIds.length; i++) {
        filterBillsData = pendingBills.filter(row => row.SaleHeaderId == selectedSaleHeaderIds[i]);
        SaleHeaderDetail.push(filterBillsData[0]);
    }

    debugger;
    let PaytmAmount = 0;
    let PaymentMode = '';

    if (Number(card) != 0) {
        PaytmAmount = Number(card);
        PaymentMode = environment.PaytmUrl.PaymentCardMode;

    } else if (Number(online) != 0) {
        PaytmAmount = Number(online);
        PaymentMode = environment.PaytmUrl.PaymentOnlineMode;
    }

    let currentDateTime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    let merchantTransactionId = SaleHeaderDetail.length == 1 ? SaleHeaderDetail[0].BillNo + currentDateTime : SaleHeaderDetail[0].BillNo + 'C' + SaleHeaderDetail[1].DisplayBillNo + currentDateTime;
    merchantTransactionId = merchantTransactionId.replace(/[-:]/g, "");
    PaytmAmount = (Number(PaytmAmount) * 100);

    var body = {};
    body["paytmMid"] = environment.PaytmUrl.paytmMid;
    body["paytmTid"] = environment.PaytmUrl.paytmTid;
    body["transactionDateTime"] = BillTimeDate;
    body["merchantTransactionId"] = merchantTransactionId;
    body["merchantReferenceNo"] = merchantTransactionId;
    body["transactionAmount"] = PaytmAmount.toString();
    body["paymentMode"] = PaymentMode;
    body["autoAccept"] = "True";

    await PaytmCheckSum(body, 'Add').then(async function (response) {
        debugger;
        let res = JSON.parse(response);
        let head, output;

        if (res.Status == 'valid') {

            debugger;
            let obj = { "paymentMode": PaymentMode, "autoAccept": "True", };
            body["merchantExtendedInfo"] = obj;

            output = {
                head: {
                    requestTimeStamp: BillTimeDate,
                    channelId: environment.PaytmUrl.channelId,
                    checksum: res.checksum,
                    version: environment.PaytmUrl.version
                },
                body
            }
            ErrorLog.writeLogFile('Paytm output', JSON.stringify(output));

            // for testing purpose paytm
            // var resultInfo =[];
            // resultInfo.resultCode = "A" ;
            // resultInfo.resultStatus = "ACCEPTED_SUCCESS";
            // resultInfo.resultCodeId = "0009";

            // let errors = '';
            // var response =[];
            // response.statusCode=200;

            request.post(environment.PaytmUrl.paytmCloudUrl, { json: output }, async function (errors, response, bodycontent) { // for testing purpose paytm request Comment this line

                if (!errors && response.statusCode == 200) {

                    let resultInfo = bodycontent.body.resultInfo;  // for testing purpose paytm comment this line
                    let ResponseMessage = resultInfo.resultMsg;  // for testing purpose  paytm comment this line
                    let error = '';

                    if (resultInfo.resultCode == "A" && resultInfo.resultStatus == "ACCEPTED_SUCCESS" && resultInfo.resultCodeId == "0009") {

                        ErrorLog.writeLogFile('Paytm Request SUCCESS response', JSON.stringify(response));

                        PaymentProcessStatus = 1;
                        countDownTarget = 0;
                        let CompletedListCount = 0;
                        let Salelength = 0;
                        let InMinutes = PaymentMode == environment.PaytmUrl.PaymentOnlineMode ? environment.PaytmUrl.AutoCancelQRDurationInMinutes : environment.PaytmUrl.AutoCancelCardDurationInMinutes;
                        countDownTarget = new Date().getTime() + InMinutes * 60 * 1000;
                        Salelength = SaleHeaderDetail.length;

                        for (let i = 0; i < SaleHeaderDetail.length; i++) {
                            let saleHeaderList = {
                                SaleHeaderId: SaleHeaderDetail[i].SaleHeaderId,
                                SaleDate: SaleHeaderDetail[i].SaleDate,
                                BillNo: document.getElementById("BillNo").value,
                                DisplayBillNo: SaleHeaderDetail[i].DisplayBillNo,
                                POSId: SaleHeaderDetail[i].POSId,
                                BillCounterId: SaleHeaderDetail[i].BillCounterId,
                                TableNo: document.getElementById("TableNo").innerHTML,
                                CustomerName: document.getElementById("CustomerName").value,
                                PhoneNo: document.getElementById("phoneNo").value,
                                GSTNo: document.getElementById("GSTNo").value,
                                RefNo: document.getElementById("RefNo").value,
                                TotalAmount: SaleHeaderDetail[i].NetAmount,
                                CompanyId: SaleHeaderDetail[i].CompanyId,
                                PaymentDeviceID: merchantTransactionId,
                                AmountPaid: Number(AmountPaid),
                                IsOtherStateCustomer: IsOtherStateCus,
                                Amount: Number(Amount),
                                CardAmount: Number(card),
                                OnlineAmount: Number(online),
                                CashAmount: Number(cash),
                                TimeCountDown: countDownTarget,
                                CreatedOn: BillTimeDate,
                                UpdatedOn: BillTimeDate,
                                CreatedBy: loginId,
                                UpdatedBy: loginId,
                                Response: JSON.stringify(resultInfo),
                                PaymentDeviceMode: PaymentMode,
                                PaymentDevice: environment.PaytmUrl.PaymentDevice,
                                type: 'Request'
                            }

                            await UpdatePaymentDeviceStatus(saleHeaderList, 'Add', environment.PaytmUrl.PaymentDevice).then(async function (responsenodes) {
                                let res = JSON.parse(responsenodes);
                                if (res.Status == 'valid') {
                                    CompletedListCount += 1;
                                    if (Salelength == CompletedListCount) {

                                        Swal.fire({
                                            title: 'Payment Request Completed',
                                            width: 500,
                                            height: 200,
                                            position: 'center',
                                            icon: 'success',
                                            timer: 3500
                                        })

                                        loadSaleHeader();

                                        // after update refresh get amount and customer details in pinelabs header
                                        let PaytmHeader = {
                                            POSId: POSId,
                                            BillCounterId: BillCounterId,
                                            PaymentDeviceID: merchantTransactionId,
                                            PaymentDevice: environment.PaytmUrl.PaymentDevice,
                                        }
                                        debugger;
                                        loadPaymentHeader(PaytmHeader);
                                    }
                                }
                                else if (res.Status == 'invalid') {
                                    Swal.fire({
                                        title: res.Message,
                                        icon: 'error',
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'OK',
                                        allowOutsideClick: false,
                                    })

                                    ErrorLog.writeLogFile("Error in Add Paytm UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
                                }
                            }).catch(function (catchError) {
                                let res = JSON.parse(catchError);
                                Swal.fire({
                                    title: res.Message,
                                    icon: 'error',
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                ErrorLog.writeLogFile("catchError in Add Paytm UpdatePaymentDeviceStatus", JSON.stringify(saleHeaderList));
                            })

                        }
                        PaytmModeCheck(1);
                    }
                    else {

                        if (resultInfo.resultCodeId == "0002" && ResponseMessage == "Request parameters are not valid") {
                            error = 'Payment Request Parameters Failed ';
                        }
                        else {
                            error = ResponseMessage;
                        }

                        Swal.fire({
                            title: error,
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            width: 850,
                        })
                        ErrorLog.writeLogFile('Paytm Request Failed = ', JSON.stringify(response))
                    }
                }
                else {

                    if (errors) {  // code":"ENOTFOUND" , Internet Issues
                        Swal.fire({
                            title: 'Paytm Request Error ',
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            width: 850,
                        })

                        ErrorLog.writeLogFile('Paytm Request response Error = ', JSON.stringify(errors));
                    }
                    else {
                        Swal.fire({
                            title: 'Paytm Request Failed ',
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            width: 850,
                        })

                        ErrorLog.writeLogFile('Paytm Request response Failed = ', JSON.stringify(response));
                    }
                }
            }); // for testing purpose paytm request Comment this line
        }
        else if (res.Status == 'invalid') {

            Swal.fire({
                title: res.Message,
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })

            ErrorLog.writeLogFile("Error in Invalid PaytmCheckSum  , res = " + JSON.stringify(res) + ' , body = ', JSON.stringify(body));
        }
    }).catch(function (catchError) {

        Swal.fire({
            title: 'Paytm CheckSum Failed',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        })

        ErrorLog.writeLogFile("CatchError in PaytmCheckSum , catchError= " + JSON.stringify(catchError) + ' , body  = ', JSON.stringify(body));
    })
}

$.fn.PaytmPayConfirm = async function (event) {

    let date = new Date();
    let PaytmStatus = [];
    let SaleHeaderDetail = [];
    let PaymentDeviceID = '';
    //let currentDateTime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

    for (let i = 0; i < PendingPaymentBill.length; i++) {
        if (PendingPaymentBill[i].PaymentDevice == '') {
            let BillNo = { BillNo: PendingPaymentBill[i].BillNo }
            PaytmStatus.push(BillNo)
        }
        else {
            SaleHeaderDetail.push(PendingPaymentBill[i])
        }
    }

    // if(PaytmStatus.length > 0){
    //     let BillNo = PaytmStatus.length == 1 ? PaytmStatus[0].BillNo + currentDateTime :  PaytmStatus[0].BillNo  +'C'  +PaytmStatus[1].DisplayBillNo + currentDateTime;
    //     Swal.fire({
    //         title:  'Not Pay in Paytm ' + BillNo,
    //         icon: 'error',
    //         confirmButtonColor: '#d33',
    //         cancelButtonColor: '#3085d6',
    //         confirmButtonText: 'OK',
    //         allowOutsideClick: false,
    //         width: 950
    //     })
    //     return false;
    // }

    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }

    // loginId = EncrDecrService.decrypt(store.get('Ref'));
    let cashierName = store.get('DisplayName');
    let AmountPaid = document.getElementById("AmountPaid").innerHTML;
    let Amount = document.getElementById("NetAmount").innerHTML;
    let card = document.getElementById("CardAmount").value;
    let online = document.getElementById("OnlineAmount").value
    let cash = document.getElementById("CashAmount").value;
    let balance = document.getElementById("Balance").innerHTML;
    let storecash = +cash - +balance;
    let BillTimeDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

    if (SaleHeaderDetail.length == 1) {
        PaymentDeviceID = SaleHeaderDetail[0].PaymentDeviceID;
    } else {
        if (SaleHeaderDetail[0].PaymentDeviceID == SaleHeaderDetail[1].PaymentDeviceID) {
            PaymentDeviceID = SaleHeaderDetail[0].PaymentDeviceID;
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Mismatched Transaction Reference ID',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })
            return false;
        }
    }


    if (SaleHeaderDetail[0].PaymentDeviceMode == environment.PaytmUrl.PaymentCardMode && Number(card) == 0) {
        Swal.fire({
            title: 'Your Payment Mode is Card',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            width: 850,
        })
        return false;
    }
    else if (SaleHeaderDetail[0].PaymentDeviceMode == environment.PaytmUrl.PaymentOnlineMode && Number(online) == 0) {
        Swal.fire({
            title: 'Your Payment Mode is Online',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            width: 850,
        })
        return false;
    }

    var body = {};
    body["paytmMid"] = environment.PaytmUrl.paytmMid;
    body["paytmTid"] = environment.PaytmUrl.paytmTid;
    body["transactionDateTime"] = SaleHeaderDetail[0].CreatedOn;
    body["merchantTransactionId"] = PaymentDeviceID;
    // body["transactionDateTime"]="2024-10-29 11:53:57"
    // body["merchantTransactionId"]='209129348433839203708';

    await PaytmCheckSum(body, 'Status').then(async function (response) {
        let res = JSON.parse(response);
        let head, output;

        if (res.Status == 'valid') {
            output = {
                head: {
                    requestTimeStamp: SaleHeaderDetail[0].CreatedOn,
                    channelId: environment.PaytmUrl.channelId,
                    checksum: res.checksum,
                    version: environment.PaytmUrl.version
                },
                body
            }

            ErrorLog.writeLogFile('paytm output Status', JSON.stringify(output));

            request.post(environment.PaytmUrl.paytmStatusUrl, { json: output }, async function (errors, response, bodycontent) {

                if (!errors && response.statusCode == 200) {  // Status 200 OK

                    let resultInfo = bodycontent.body.resultInfo;
                    let ResponseMessage = resultInfo.resultMsg;
                    let error = '';

                    //  resultInfo.resultCode == "S" && resultInfo.resultStatus == "SUCCESS" &&  resultInfo.resultCodeId == "0000"
                    //  resultInfo.resultStatus == "ACCEPTED_SUCCESS" && resultInfo.resultCodeId == "0009"

                    //if(resultInfo.resultCodeId == "0404" || resultInfo.resultCodeId == "0011"){ // testing purpose error msg convert to confrim 
                    if (resultInfo.resultCodeId == "0000" || resultInfo.resultCodeId == "0009") { // SUCCESS or ACCEPTED_SUCCESS
                        // console.log('resultInfo SUCCESS',resultInfo);

                        ErrorLog.writeLogFile('Paytm Payment SUCCESS = ', JSON.stringify(response));

                        await updateSaleHeader('PaytmPay');

                        let saleHeaderList = {
                            PaymentDeviceID: PaymentDeviceID,
                            IsRequestCancelled: 0,
                            IsPaid: 1,
                            UpdatedOn: BillTimeDate,
                            UpdatedBy: loginId,
                            Response: JSON.stringify(response),
                            type: 'Update',
                            PaymentDevice: '',
                        }
                        debugger;

                        await UpdatePaymentConfirmStatus(saleHeaderList, 'Update', environment.PaytmUrl.PaymentDevice).then(async function (responsenodes) {

                            let res = JSON.parse(responsenodes);

                            if (res.Status == 'valid') {
                                // Swal.fire({
                                //     title: 'Payment Success Completed',
                                //     width: 500,
                                //     height: 200,
                                //     position: 'center',
                                //     icon: 'success',
                                //     timer: 3500
                                // })
                            }
                            else if (res.Status == 'invalid') {
                                Swal.fire({
                                    title: res.Message,
                                    icon: 'error',
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })

                                ErrorLog.writeLogFile("Error in Update Paytm UpdatePaymentConfirmStatus", JSON.stringify(saleHeaderList));
                            }
                        }).catch(function (catchError) {
                            let res = JSON.parse(catchError);
                            Swal.fire({
                                title: res.Message,
                                icon: 'error',
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                            ErrorLog.writeLogFile("catchError in Update Paytm UpdatePaymentConfirmStatus , catchError =" + JSON.stringify(catchError), JSON.stringify(saleHeaderList));
                        })
                    }
                    else {
                        // resultInfo.resultStatus == "FAIL" && resultInfo.resultCodeId == "0012" , resultInfo.resultMsg == Internal Server Error. Please retry
                        // resultInfo.resultStatus == "FAIL" && resultInfo.resultCodeId == "0404" , resultInfo.resultMsg == Merchant transaction id does not exist..
                        // resultInfo.resultStatus == "FAIL" && resultInfo.resultCodeId == "0330", resultInfo.resultMsg == Invalid checksum
                        // resultInfo.resultStatus == "FAIL" && resultInfo.resultCodeId == "0011" , resultInfo.resultMsg == The sale txn has failed
                        // resultInfo.resultStatus == "FAILED" && resultInfo.resultCodeId == "0090" ,resultInfo.resultMsg == ECR void failed
                        // resultInfo.resultStatus == "FAILED" && resultInfo.resultCodeId == "0180" , resultInfo.resultMsg ==VOID transaction not found
                        // resultInfo.resultStatus == "PENDING" && resultInfo.resultCodeId == "0010",  resultInfo.resultMsg ==Please check status on machine
                        // resultInfo.resultStatus == "PENDING" && resultInfo.resultCodeId == "0030",  resultInfo.resultMsg ==Please check the status on edc machine

                        ErrorLog.writeLogFile('Paytm Payment Confirm Failed Status = ', JSON.stringify(response));

                        if (resultInfo.resultCodeId == "0404" || resultInfo.resultCodeId == "0011") {
                            error = 'Request Decline';
                        }
                        else if (resultInfo.resultCodeId == "0030") {
                            error = 'Please Open Paytm Device and Check Previous Payment Request ! ';
                        }
                        else {
                            error = ResponseMessage;
                        }

                        if (resultInfo.resultCodeId == "0404" || resultInfo.resultCodeId == "0011") {

                            let saleHeaderList = {
                                PaymentDeviceID: PaymentDeviceID,
                                PaymentDeviceMode: '',
                                IsRequestCancelled: 1,
                                IsPaid: 0,
                                UpdatedOn: BillTimeDate,
                                UpdatedBy: loginId,
                                Response: JSON.stringify(response),
                                type: 'Cancel',
                                PaymentDevice: ''
                            }

                            await updateSaleHeaderPaymentCancel(saleHeaderList, 'Cancel', environment.PaytmUrl.PaymentDevice).then(async function (responsenodes) {

                                let res = JSON.parse(responsenodes);

                                if (res.Status == 'valid') {

                                    Swal.fire({
                                        title: error,
                                        width: 500,
                                        height: 200,
                                        position: 'center',
                                        icon: 'warning',
                                        timer: 3500
                                    })

                                    loadSaleHeader();
                                    PaytmModeCheck(0);
                                    PaymentProcessStatus = 0;
                                    selectedSaleHeaderIds = [];
                                    PendingPaymentBill = [];
                                    selectedSaleHeaderId = 0;
                                    cleardata();
                                    ClearDisable(false);
                                }
                                else if (res.Status == 'invalid') {

                                    Swal.fire({
                                        title: res.Message,
                                        icon: 'error',
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'OK',
                                        allowOutsideClick: false,
                                    })

                                    ErrorLog.writeLogFile("Error in Paytm updateSaleHeaderPaymentCancel", JSON.stringify(saleHeaderList));
                                }
                            }).catch(function (catchError) {
                                let res = JSON.parse(catchError);

                                Swal.fire({
                                    title: res.Message,
                                    icon: 'error',
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                ErrorLog.writeLogFile("Error in Paytm updateSaleHeaderPaymentCancel , catchError = " + JSON.stringify(catchError), JSON.stringify(saleHeaderList));
                            })
                        }
                        else {

                            Swal.fire({
                                title: error,
                                icon: 'warning',
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                                width: 850,
                            })
                        }
                    }
                }
                else {
                    if (errors) {
                        let errorslog = JSON.stringify(errors);

                        Swal.fire({
                            title: errorslog,
                            icon: 'warning',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            width: 850,
                        })
                        ErrorLog.writeLogFile('Paytm Payment Confirm Status Failed errors = ', errorslog);

                    }
                    else {
                        Swal.fire({
                            title: 'Paytm Confirm failed',
                            icon: 'warning',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            width: 850,
                        })
                        ErrorLog.writeLogFile('Paytm Payment Confirm Status Failed response = ', JSON.stringify(response));
                    }

                }
            });

        }
        else if (res.Status == 'invalid') {

            Swal.fire({
                title: res.Message,
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })

            ErrorLog.writeLogFile("Error invalid PaytmCheckSum Status", JSON.stringify(body));
        }
    }).catch(function (catchError) {

        Swal.fire({
            title: 'Paytm CheckSum Status Failed',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        })

        ErrorLog.writeLogFile("CatchError in PaytmCheckSum Status " + JSON.stringify(catchError) + ' , body  =' + JSON.stringify(body));
    })

}