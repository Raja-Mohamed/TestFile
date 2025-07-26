let Store = require('electron-store');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
const CustomValidators = require('../services/custom-validation')
const ErrorLog = require('../services/log');
let salesForView = '';
let balanceForView = '';
let paymentForView = '';
let DenominationForView = '';
let settledAmount = 0;
let totalAmountvalue = 0;
let BillingdbService = require('../database/billingdb');
const EncrDecrService = require('../services/encrypt-decrypt.service');
var mysql = require('mysql');
// var  serverDate;
var date = new Date();
var dayEndPayments = [];
var dayEndAdjustments = [];
var dayEndServiceTypes = [];
var Denominationcash = [];
var totalSalesAmount = 0;
let ServiceTypeCheck = 0;
let TodayDate;
var CateringAdvancedetails = [];
let BulkOrderBookingPaymentDetails = [];
let BulkOrderAdjustmentsDetails = [];
let BulkOrderAdvanceDetails = [];
let ChoosedDate = store.get('ChoosedDate')
let BillCounterName = store.get('BillCounterName')
var BillCounterId = store.get('BillCounterId')

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

$(document).ready(function () {
    debugger
    let splitdate = ChoosedDate.split('-')
    let year = splitdate[0]
    let month = splitdate[1]
    let date = splitdate[2]

    TodayDate = ("0" + date).slice(-2) + "-" + ("0" + (month)).slice(-2) + "-" + year;
    document.getElementById("datepicker").value = TodayDate;

    //serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    loadDayEndBulkOrderAdjustmentsDetails();
    loadDayEndBulkOrderAdvanceDetails();
    loadDayEndBillCounterServiceType();
    loadDayEndSaleBillsForPayment();
    loadDayEndSaleBillsForServiceType();
    loadDayEndSaleBillsForCancel();
});

$(function () {

    $("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd/mm/yy",
        //  beforeShowDay: unavailable

        // onSelect: function (dateText) {
        //     var initialDate = dateText.split(/\//);
        //     let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))
        //     serverDate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
        //     salesForView = '';
        //     balanceForView = '';
        //     paymentForView = '';
        //     DenominationForView = '';
        //     loadDayEndSaleBillsForPayment();
        //     loadDayEndSaleBillsForServiceType();
        //     getBillDenominationDetails()

        // }
        beforeShowDay: function (d) {
            debugger
            // April 10, 2012


            // for (let i = 0; i < temp.length; i++) {
            //     debugger
            //     let abc = Day[i].split(`-`).map(x => +x)
            //     var a = new Date(abc[0],abc[1],abc[2]);
            //     console.log(abc[0],abc[1],abc[2])

            // }
            return [true, 0 == 0 ? "my-class" : "date-class"];

            // var b = new Date(2023, 6, 2); // April 20, 2012
            // return [true, a <= d && d <= b ? "my-class" : "date-class"];

        }

    });
})


var POSId = environment.POSId
let serverDate;
document.getElementById("POSName").innerHTML = environment.POSName;
document.getElementById("BillCounterName").innerHTML = BillCounterName;
//serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);

function loadDayEndBillCounterServiceType() {
    let item = {
        BillCounterId: BillCounterId,
    }
    BillingdbService.getBillCounterServiceTypes(item).then(
        (data) => {
            ServiceTypeCheck = 0;
            let ServiceType = data.Data;
            let ServiceTypelen = ServiceType.filter(x => x.ServiceType == "Catering");
            if (ServiceTypelen.length > 0) {
                ServiceTypeCheck = ServiceTypelen[0].ServiceType == undefined ? 0 : ServiceTypelen[0].ServiceType;
            }
            // console.log('ServiceTypeCheck ==',ServiceTypeCheck);
        },
        (error) => {
            ErrorLog.writeLogFile('loadDayEndBillCounterServiceType', error)

        }
    )
}

$.fn.Cancel = function () {
    window.close();
}
document.onkeyup = function (e) {
    debugger;
    if (e.which == 27 && e.code == 'Escape') {
        window.close();
    }

    else {
        return;
    }
};
function loadDayEndSaleBillsForPayment() {
    debugger
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: ChoosedDate
    }
    BillingdbService.getBillCashDetails(item).then(
        (data) => {
            debugger
            dayEndPayments = data;
            setTimeout(() => {
                Cashlist(dayEndPayments)
            }, 200);

        },
        (error) => {
            ErrorLog.writeLogFile('loadDayEndSaleBillsForPayment', error)

        }
    )
}

function loadDayEndSaleBillsForAdjustment() {
    debugger
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        IsComplementary: 1,
        SaleDate: ChoosedDate
    }
    BillingdbService.getBillAdjustmentDetails(item).then(
        (data) => {
            debugger
            dayEndAdjustments = data;
            balancelist(dayEndAdjustments)
        },
        (error) => {
            ErrorLog.writeLogFile('loadDayEndSaleBillsForAdjustment', error)

        }
    )
}
function loadDayEndSaleBillsForServiceType() {
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        SaleDate: ChoosedDate
    }
    BillingdbService.getBillServiceTypeDetails(item).then(
        (data) => {
            dayEndServiceTypes = data;
            saleslist(dayEndServiceTypes)
        },
        (error) => {
            ErrorLog.writeLogFile('loadDayEndSaleBillsForServiceType', error)

        }
    )
}

loadDayEndSaleBillsForCancel()
function loadDayEndSaleBillsForCancel() {
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        //  IsComplementary: 1,
        SaleDate: ChoosedDate
    }
    BillingdbService.getBillCancelDetails(item).then(
        (data) => {

            var CancelAmount = data[0].CancelAmount
            var CancelText = data[0].CancelText
            var cancelbill = CancelText + " " + "-" + " " + CancelAmount.toFixed(2)
            document.getElementById("cancelbill").innerHTML = cancelbill;
        },
        (error) => {
            ErrorLog.writeLogFile('loadDayEndSaleBillsForCancel', error)

        }
    )
}
loadDayEndSaleBillsForUnpaid()
function loadDayEndSaleBillsForUnpaid() {
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        //  IsComplementary: 1,
        SaleDate: ChoosedDate
    }
    BillingdbService.getUnpaidBillsDetails(item).then(
        (data) => {
            debugger
            var UnpaidAmount = data[0].UnpaidAmount
            var UnpaidText = data[0].UnpaidText
            var UnpaidBills = UnpaidText + " " + "-" + " " + UnpaidAmount.toFixed(2)
            document.getElementById("UnpaidBills").innerHTML = UnpaidBills;
        },
        (error) => {
            ErrorLog.writeLogFile('loadDayEndSaleBillsForUnpaid', error)

        }
    )
}

getBillDenominationDetails()
function getBillDenominationDetails() {
    BillingdbService.getBillDenominationDetails().then(
        (data) => {
            Denominationcash = data
            Denomination(Denominationcash)
        }, (error) => {
            ErrorLog.writeLogFile('getBillDenominationDetails', error)

        })
}


function saleslist(dayEndServiceTypes) {

    let counter = 0;
    let totalSales = 0;
    $('#sales_list').empty();

    let ServiceTypelen = dayEndServiceTypes.filter(x => x.ServiceTypeAmount != 0)
    if (ServiceTypelen.length != 0) {

        this.totalSalesAmount = dayEndServiceTypes.map(row => (row.ServiceTypeAmount)).reduce((prev, next) => prev + next);
        totalSales = dayEndServiceTypes.map(row => row.TotalBills).reduce((prev, next) => prev + next);
    }
    else if (ServiceTypelen.length == 0) {
        this.totalSalesAmount = 0;
    }

    dayEndServiceTypes.forEach(item => {
        counter++;
        salesForView += `<tr>
                <td>${item.ServiceType}</td>
                <td>${item.TotalBills}</td>
                <td style="text-align:right;">${item.ServiceTypeAmount.toFixed(2)}</td>
                </tr>`;
    });
    salesForView += `<hr>`

    salesForView += `<tr>
<td> <strong>Total Sales</strong></td> <td ><strong>${totalSales}</strong></td> <td id="paymentTotalAmount" style="text-align:right; "><strong>${this.totalSalesAmount.toFixed(2)}</strong></td>
</tr>`
    $('#sales_list').html(salesForView);
    loadDayEndSaleBillsForAdjustment();

};

function balancelist() {
    debugger
    let counter = 0;
    var totalBalanceAmount;
    $('#balance_list').empty();
    // let dayEndAdjlen = dayEndServiceTypes.filter(x => x.AdjustmentAmount != 0)

    // if (dayEndAdjlen.length != 0) {
    //     totalBalanceAmount = dayEndAdjustments.map(row => parseFloat(row.AdjustmentAmount)).reduce((prev, next) => prev + next);
    // }
    // else if (dayEndAdjlen.length == 0) {
    //     totalBalanceAmount = 0;
    // }
    for (let i = 0; i < dayEndAdjustments.length; i++) {
        debugger
        let amount = dayEndAdjustments[i]['Amount'];
        dayEndAdjustments[i]['Amount'] = Number(amount);
    }

    // console.log('ServiceTypeCheck ==',ServiceTypeCheck);;

    if (ServiceTypeCheck == 'Catering') {
        if (BulkOrderAdjustmentsDetails.length > 0) {
            let a = {
                Amount: BulkOrderAdjustmentsDetails[0].AmountPaid,
                PaymentType: " Catering Adjustment "
            }
            dayEndAdjustments.push(a);
        }
        else {
            let a = {
                Amount: 0.00,
                PaymentType: " Catering Adjustment "
            }
            dayEndAdjustments.push(a);
        }

        if (BulkOrderAdvanceDetails.length > 0) {
            document.getElementById("cateringAdvance").innerHTML = "Catering Advance ( " + BulkOrderAdvanceDetails[0].AdvanceCount + " )  - " + parseFloat(BulkOrderAdvanceDetails[0].AmountPaid).toFixed(2);
            document.getElementById("cateringCard").innerHTML = "Catering Card Advance  - " + parseFloat(BulkOrderAdvanceDetails[0].CardAmount).toFixed(2);
            document.getElementById("cateringOnline").innerHTML = "Catering Online Advance - " + parseFloat(BulkOrderAdvanceDetails[0].OnlineAmount).toFixed(2);
        }
        else {
            document.getElementById("cateringAdvance").innerHTML = "Catering Advance ( 0 )  - " + 0.00;
            document.getElementById("cateringCard").innerHTML = "Catering Card Advance - " + 0.00;
            document.getElementById("cateringOnline").innerHTML = "Catering Online Advance - " + 0.00;
        }
    }

    // if(BulkOrderAdjustmentsDetails.length > 0 ){
    //     debugger;
    //     // if(dayEndAdjustments[0].PaymentType == 'Cash'){
    //     //     dayEndAdjustments[0].Amount += BulkOrderAdjustmentsDetails[0].CashAmount;
    //     // }
    //     // if( dayEndAdjustments[1].PaymentType == 'Card'){
    //     //     dayEndAdjustments[1].Amount += BulkOrderAdjustmentsDetails[0].CardAmount;
    //     // }
    //     // if( dayEndAdjustments[2].PaymentType == 'Online'){
    //     //     dayEndAdjustments[2].Amount += BulkOrderAdjustmentsDetails[0].OnlineAmount;
    //     // }
    //     let a ={
    //         Amount: BulkOrderAdjustmentsDetails[0].AmountPaid ,
    //         PaymentType: " Catering Adjustment "  
    //     }
    //     dayEndAdjustments.push(a);
    // }

    // if(BulkOrderAdvanceDetails.length > 0 ){
    //     document.getElementById("cateringAdvance").innerHTML =  "Catering Advance ( " + BulkOrderAdvanceDetails[0].AdvanceCount + " )  - " + parseFloat(BulkOrderAdvanceDetails[0].AmountPaid).toFixed(2) ;
    // }



    settledAmount = dayEndAdjustments.map(row => (row.Amount)).reduce((prev, next) => prev + next);

    // settledAmount = (+this.totalSalesAmount) + (+totalBalanceAmount);
    //console.log('dayEndAdjustments',dayEndAdjustments);

    dayEndAdjustments.forEach((item, index) => {
        counter++;
        balanceForView += `<tr>
                    <td>${item.PaymentType}</td>
                    <td></td>
                    <td style="text-align:right;">${parseFloat(item.Amount).toFixed(2)}</td>
                    </tr><hr>`;
    });

    balanceForView += `<tr>
    <td> <strong>Amount to be settled</strong></td>  <td><strong> </strong></td><td style="text-align:right;"  id="ServiceTypeTotalAmount"><strong>${settledAmount.toFixed(2)}</strong></td>
    </tr>`
    $('#balance_list').html(balanceForView);

};

function Cashlist(dayEndPayments) {
    debugger
    let counter = 0;
    $('#payment_list').empty()
    if (ServiceTypeCheck == 'Catering') {
        let CashAdvance;
        if (BulkOrderAdvanceDetails.length > 0) {
            CashAdvance = {
                Amount: BulkOrderAdvanceDetails[0].CashAmount,
                PaymentType: " Catering Cash Advance"
            }
            dayEndPayments.push(CashAdvance);
        }
        else {
            CashAdvance = {
                Amount: 0.00,
                PaymentType: " Catering Cash Advance"
            }
            dayEndPayments.push(CashAdvance);
        }
    }
    ;
    for (let i = 0; i < dayEndPayments.length; i++) {
        debugger
        let amount = dayEndPayments[i]['Amount']
        dayEndPayments[i]['Amount'] = Number(amount)

    }

    totalAmountvalue = dayEndPayments.map(row => (row.Amount)).reduce((prev, next) => prev + next);
    dayEndPayments.forEach((item, index) => {
        counter++;
        paymentForView += `<tr>
                        <td>${item.PaymentType}</td>
                        <td></td>
                        <td style="text-align:right;">${parseFloat(item.Amount).toFixed(2)}</td>
                        </tr><hr>`;
    });
    paymentForView += `<tr>
        <td> <strong>Total Amount</strong></td>  <td><strong> </strong></td><td style="text-align:right;" id="CashTotalAmount"><strong>${parseFloat(totalAmountvalue).toFixed(2)}</strong></td>
        </tr>`
    $('#payment_list').html(paymentForView);

};

function Denomination(Denominationcash) {
    let counter = 0;
    $('#Denomination_list').empty();

    Denominationcash.forEach((item, index) => {
        counter++;

        DenominationForView += `<tr>
                        <td>${item.Rupee}</td>
                        <td>&times;	</td>
                        <td> <input type="text" id="Nos_${item.RupeeId}" onkeyup="updateDenominationAmount(${item.RupeeId})"  onkeydown="validatenumber(event)"
                        style="width: 70px;"></td>
                        <td> <label id="ValueAs_${item.RupeeId}"></label>     </td>
                        <td><input type="text" style="width:150px;" id="Remarks_${item.RupeeId}" onkeyup="updateDenominationRemark(${item.RupeeId})"></td>
                        </tr><hr>`;

    });

    DenominationForView += `<tr>
        <td colspan="3"> <strong>Total Denominations</strong></td>  <td><strong> </strong></td><td><strong> <label id="ValueAs"></label></strong></td>
        </tr>
        <tr> <td colspan="3"> <strong>Cash Denominations Balance</strong></td>  <td><strong> </strong></td><td><strong> <label id="CashBalance"></label></strong></td>
        </tr>`

    $('#Denomination_list').html(DenominationForView);

};
function validatenumber(event) {
    let length = 5;
    CustomValidators.ValidateNumber(event, event.target, length);
}
function updateDenominationAmount(RupeeId) {
    debugger
    let ind = Denominationcash.findIndex(x => x.RupeeId == RupeeId)
    let nos = parseFloat(document.getElementById("Nos_" + RupeeId).value);
    let rupee = Denominationcash.find(x => x.RupeeId == RupeeId).Rupee
    let RsValue = parseFloat(rupee) * parseFloat(nos);
    document.getElementById("ValueAs_" + RupeeId).innerHTML = isNaN(RsValue) ? 0.00 : RsValue.toFixed(2);

    Denominationcash[ind]['Nos'] = isNaN(nos) ? 0 : nos;
    Denominationcash[ind]['Value'] = isNaN(RsValue) ? 0.00 : RsValue.toFixed(2);

    var totalAmount = Denominationcash.map(row => parseFloat(row.Value)).reduce((prev, next) => prev + next);

    document.getElementById("ValueAs").innerHTML = isNaN(totalAmount) ? 0.00 : totalAmount.toFixed(2);

    let cash = document.getElementById("CashTotalAmount").innerText
   // console.log("cash", cash)
    let balance = +cash - (isNaN(totalAmount) ? 0.00 : totalAmount.toFixed(2))
   // console.log("balance", balance)

    document.getElementById("CashBalance").innerHTML = balance.toFixed(2) >= 0.00 ? balance.toFixed(2) : 0.00;
}

function updateDenominationRemark(RupeeId) {

    let ind = Denominationcash.findIndex(x => x.RupeeId == RupeeId)
    let remarks = (document.getElementById("Remarks_" + RupeeId).value);
    Denominationcash[ind]['Remarks'] = remarks;

}

$.fn.print = function (event) {

    window.print()

}

$.fn.counterDayEnd = function (event) {

    $('#CounterDayend').prop('disabled', true);
    let servicetype = store.get('ServiceTypes')
    let servicetypeIndex = servicetype.findIndex(x => x.ServiceType == 'Dine-In')
    let cateringtypeInd = servicetype.findIndex(x => x.ServiceType == 'Catering')
    debugger
    let unpaidbill = document.getElementById("UnpaidBills").innerHTML
    let b = unpaidbill.split('(')
    let c = b[1].split(')')
    if (c[0] != 0) {
        debugger
        $('#CounterDayend').prop('disabled', false);
        Swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            title: 'Please Clear or Pay Unpaid Bills',
            icon: 'warning',
            confirmButtonColor: '#5cb85c',
            confirmButtonText: 'OK'
        })
    }
    else {
        debugger
        if (cateringtypeInd != -1) {
            let cateringItem = {
                POSId: environment.POSId,
                DayEndDate: ChoosedDate,
                BillCounterId: BillCounterId,
                CompanyId: environment.CompanyId
            }
            $.post(environment.apiURL + '/GetBulkOrdersPending', cateringItem, function (data) {
                //  console.log("data", data)
                debugger
                let res = JSON.parse(data);
                if (res.Status == "valid") {
                    if (res.Data.length > 0) {
                        let outOfStockView = `
                        <table id="table" border=1>
                        <thead>
                            <tr>
                                <th style="text-align:center" width='300px'>OrderBookingNo</th>
                                <th style="text-align:center" width='300px'>CustomerName</th>
                            </tr>
                        </thead><tbody>`;
                        res.Data.forEach(row => {
                            outOfStockView += `<tr>
                            <td>${row.OrderBookingNo}</td>
                              <td>${row.CustomerName}</td>
                            </tr>
                            `
                        });
                        outOfStockView += `</tbody></table>`;


                        let BootstrapButtons = Swal.mixin({
                            customClass: {
                                confirmButton: 'btn btn-success',
                                cancelButton: 'btn btn-danger'
                            },
                            buttonsStyling: false,
                        })
                        BootstrapButtons.fire({
                            title: 'Please Complete or Cancel the Below Order!!!',
                            html: outOfStockView,
                            icon: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#d33',
                            allowOutsideClick: false,
                            reverseButtons: true
                        }).then((result) => {
                            if (result.value) {
                                $('#CounterDayend').prop('disabled', false);
                                return;
                            }
                        });
                    }
                    else {
                        //  console.log("else")
                        if (servicetypeIndex != -1) {
                            getPOSSales().then((res) => {
                                debugger
                                if (res == "Success") {
                                    debugger
                                    let ServiceTypeTotalAmount = document.getElementById("ServiceTypeTotalAmount").innerText
                                    let paymentTotalAmount = document.getElementById("paymentTotalAmount").innerText
                                    let DenominationAmount = document.getElementById("ValueAs").innerHTML
                                    let CashTotalAmount = document.getElementById("CashTotalAmount").innerText
                                    let Item = {
                                        "POSId": environment.POSId,
                                        "CompanyId": environment.CompanyId,
                                        "SelectedDate": ChoosedDate,
                                    }
                                    $.post(environment.apiURL + '/GetPOSViewSales', Item, function (data) {
                                        debugger
                                        let res = JSON.parse(data);
                                        if (res.Status == "valid") {
                                            debugger
                                            if (res.Data.length > 0) {
                                                debugger
                                                let GetPOSViewSales = res.Data
                                                let Dayendlist = GetPOSViewSales.filter(x => x.BillCounterId == BillCounterId)
                                                let DayendIndex = Dayendlist.findIndex(x => x.IsDayEnd == 0)
                                                if (DayendIndex == 0) {
                                                    debugger
                                                    let item = {
                                                        POSId: POSId,
                                                        BillCounterId: BillCounterId,
                                                        SaleDate: ChoosedDate
                                                    }
                                                    if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                                        if ((+DenominationAmount) == (+CashTotalAmount)) {
                                                            debugger
                                                            showLoading();
                                                            BillingdbService.getDayendSaleDetails(item).then(
                                                                (result) => {
                                                                    debugger
                                                                    getDeletePOSSales().then((DeletePOSSaleList) => {
                                                                        debugger
                                                                        let Item = {
                                                                            SalesHeaderList: JSON.stringify(result.HeaderList),
                                                                            SalesDetailList: JSON.stringify(result.SaleList),
                                                                            DeletePOSSaleList: JSON.stringify(DeletePOSSaleList),
                                                                            CashExpenses: JSON.stringify(result.CashExpenseList),
                                                                            BillReprintLogs: JSON.stringify(result.ReprintList),
                                                                            POSId: environment.POSId,
                                                                            DayEndDate: ChoosedDate,
                                                                            BillCounterId: BillCounterId,
                                                                            CompanyId: environment.CompanyId,
                                                                            CashDenominations: JSON.stringify(Denominationcash),
                                                                            TodayDate: TodayDate,
                                                                            Source: "/counterDayEnd",
                                                                            Ref: store.get('Ref'),
                                                                        }
                                                                        //  console.log("Item",Item)
                                                                        $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {

                                                                            debugger
                                                                            let res = JSON.parse(data);
                                                                            if (res.Status == "valid") {
                                                                                debugger
                                                                                let dayenditem = {
                                                                                    BillCounterId: BillCounterId,
                                                                                    SaleDate: ChoosedDate
                                                                                }
                                                                                BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                                                    (result) => {
                                                                                        debugger
                                                                                        Swal.fire({
                                                                                            allowEscapeKey: false,
                                                                                            allowOutsideClick: false,
                                                                                            title: 'DayEnd Successfully',
                                                                                            icon: 'success',
                                                                                            confirmButtonColor: '#5cb85c',
                                                                                            confirmButtonText: 'OK',
                                                                                            timer: 1500
                                                                                        })

                                                                                        setTimeout(function () {
                                                                                            debugger
                                                                                            store.delete('SelectedItems');
                                                                                            store.delete('loginToken');
                                                                                            ipcRenderer.invoke('CloseBillReport', res.Data);

                                                                                        }, 1500)
                                                                                        UpdateCounterDayend().then((res) => {
                                                                                            DeleteSaleheader()
                                                                                        }).catch((err) => {
                                                                                            ErrorLog.writeLogFile('UpdateCounterDayend', err)
                                                                                        })



                                                                                    },
                                                                                    (error) => {
                                                                                        $('#CounterDayend').prop('disabled', false);
                                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                                                    }
                                                                                )
                                                                            }
                                                                            else if (res.Status == "invalid") {
                                                                                if (res.Error != '' && res.Error != undefined) {
                                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Error.sqlMessage)

                                                                                } else {
                                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Status)

                                                                                }
                                                                                $('#CounterDayend').prop('disabled', false);
                                                                                Swal.fire({
                                                                                    title: 'DayEnd Failed',
                                                                                    allowEscapeKey: false,
                                                                                    allowOutsideClick: false,
                                                                                    icon: 'error',
                                                                                    confirmButtonColor: '#3085d6',
                                                                                    confirmButtonText: 'OK'
                                                                                })
                                                                            }
                                                                        }).catch(function (err) {
                                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                                            $('#CounterDayend').prop('disabled', false);
                                                                            Swal.fire(
                                                                                'Oops!',
                                                                                'API was Disconnected . try again later!',
                                                                                'warning'
                                                                            );
                                                                        })
                                                                    }).catch((err) => {
                                                                        ErrorLog.writeLogFile('getDeletePOSSales', err)
                                                                    })

                                                                }, (error) => {
                                                                    ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                                    $('#CounterDayend').prop('disabled', false);

                                                                    Swal.fire(
                                                                        'Oops!',
                                                                        'Dayend Details wrong. try again later!',
                                                                        'warning'
                                                                    );
                                                                })
                                                        }
                                                        else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                                            Swal.fire({
                                                                allowEscapeKey: false,
                                                                allowOutsideClick: false,
                                                                title: 'Cash amount mismatched',
                                                                icon: 'error',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'OK'
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    $('#CounterDayend').prop('disabled', false);
                                                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                                    $('#CounterDayend').prop('disabled', false);

                                                                }
                                                            })
                                                        }
                                                        else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                                            $('#CounterDayend').prop('disabled', false);

                                                            Swal.fire({
                                                                allowEscapeKey: false,
                                                                allowOutsideClick: false,
                                                                title: 'Please Enter Denomination Details',
                                                                icon: 'error',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'OK',
                                                            })
                                                        }
                                                        else {
                                                            $('#CounterDayend').prop('disabled', false);

                                                            Swal.fire({
                                                                allowEscapeKey: false,
                                                                allowOutsideClick: false,
                                                                title: 'Cash amount mismatched',
                                                                icon: 'error',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'OK',
                                                            })
                                                        }
                                                    }
                                                    else {
                                                        $('#CounterDayend').prop('disabled', false);

                                                        Swal.fire({
                                                            allowEscapeKey: false,
                                                            allowOutsideClick: false,
                                                            title: 'Total Sales and Amount to be settled Mismatched',
                                                            icon: 'error',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'OK',
                                                        })
                                                    }
                                                }
                                                else if (DayendIndex == -1) {
                                                    Swal.fire({
                                                        allowEscapeKey: false,
                                                        allowOutsideClick: false,
                                                        title: 'counter was already dayended..!',
                                                        icon: 'error',
                                                        showCancelButton: false,
                                                        confirmButtonText: 'ok',
                                                    })
                                                }
                                            }
                                            else if (res.Data.length == 0) {
                                                let item = {
                                                    POSId: POSId,
                                                    BillCounterId: BillCounterId,
                                                    SaleDate: ChoosedDate
                                                }

                                                if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                                    if ((+DenominationAmount) == (+CashTotalAmount)) {
                                                        showLoading();
                                                        BillingdbService.getDayendSaleDetails(item).then(
                                                            (result) => {
                                                                getDeletePOSSales().then((DeletePOSSaleList) => {
                                                                    debugger
                                                                    let Item = {
                                                                        SalesHeaderList: JSON.stringify(result.HeaderList),
                                                                        SalesDetailList: JSON.stringify(result.SaleList),
                                                                        DeletePOSSaleList: JSON.stringify(DeletePOSSaleList),
                                                                        CashExpenses: JSON.stringify(result.CashExpenseList),
                                                                        BillReprintLogs: JSON.stringify(result.ReprintList),
                                                                        POSId: environment.POSId,
                                                                        DayEndDate: ChoosedDate,
                                                                        BillCounterId: BillCounterId,
                                                                        CompanyId: environment.CompanyId,
                                                                        CashDenominations: JSON.stringify(Denominationcash),
                                                                        TodayDate: TodayDate,
                                                                        Source: "/counterDayEnd",
                                                                        Ref: store.get('Ref'),
                                                                    }
                                                                    // console.log("Item",Item)
                                                                    $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {
                                                                        let res = JSON.parse(data);
                                                                        if (res.Status == "valid") {
                                                                            let dayenditem = {
                                                                                BillCounterId: BillCounterId,
                                                                                SaleDate: ChoosedDate
                                                                            }
                                                                            BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                                                (result) => {

                                                                                    Swal.fire({
                                                                                        allowEscapeKey: false,
                                                                                        allowOutsideClick: false,
                                                                                        title: 'DayEnd Successfully',
                                                                                        icon: 'success',
                                                                                        confirmButtonColor: '#5cb85c',
                                                                                        confirmButtonText: 'OK',
                                                                                        timer: 1500
                                                                                    })

                                                                                    setTimeout(function () {
                                                                                        store.delete('SelectedItems');
                                                                                        store.delete('loginToken');
                                                                                        ipcRenderer.invoke('CloseBillReport', res.Data);
                                                                                    }, 1500)
                                                                                    UpdateCounterDayend().then((res) => {
                                                                                        DeleteSaleheader()
                                                                                    }).catch((err) => {
                                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', err)
                                                                                    })
                                                                                },
                                                                                (error) => {
                                                                                    $('#CounterDayend').prop('disabled', false);

                                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                                                }
                                                                            )
                                                                        }
                                                                        else if (res.Status == "invalid") {
                                                                            $('#CounterDayend').prop('disabled', false);
                                                                            if (res.Error != '' && res.Error != undefined) {
                                                                                ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Error.sqlMessage)

                                                                            } else {
                                                                                ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Status)

                                                                            }

                                                                            Swal.fire({
                                                                                allowEscapeKey: false,
                                                                                allowOutsideClick: false,
                                                                                title: 'DayEnd Failed',
                                                                                icon: 'error',
                                                                                confirmButtonColor: '#3085d6',
                                                                                confirmButtonText: 'OK'
                                                                            })
                                                                        }
                                                                    }).catch(function (err) {
                                                                        $('#CounterDayend').prop('disabled', false);

                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                                        Swal.fire(
                                                                            'Oops!',
                                                                            'API was Disconnected . try again later!',
                                                                            'warning'
                                                                        );
                                                                    })
                                                                }).catch((err) => {
                                                                    ErrorLog.writeLogFile('getDeletePOSSales', err)
                                                                })

                                                            }, (error) => {
                                                                ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                                $('#CounterDayend').prop('disabled', false);

                                                                Swal.fire(
                                                                    'Oops!',
                                                                    'Dayend Details wrong. try again later!',
                                                                    'warning'
                                                                );
                                                            })
                                                    }
                                                    else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                                        Swal.fire({
                                                            allowEscapeKey: false,
                                                            allowOutsideClick: false,
                                                            title: 'Cash amount mismatched',
                                                            icon: 'error',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'OK'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                $('#CounterDayend').prop('disabled', false);

                                                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                                $('#CounterDayend').prop('disabled', false);

                                                            }
                                                        })
                                                    }
                                                    else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                                        $('#CounterDayend').prop('disabled', false);

                                                        Swal.fire({
                                                            allowEscapeKey: false,
                                                            allowOutsideClick: false,
                                                            title: 'Please Enter Denomination Details',
                                                            icon: 'error',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'OK',
                                                        })
                                                    }
                                                    else {
                                                        $('#CounterDayend').prop('disabled', false);

                                                        Swal.fire({
                                                            allowEscapeKey: false,
                                                            allowOutsideClick: false,
                                                            title: 'Cash amount mismatched',
                                                            icon: 'error',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'OK',
                                                        })
                                                    }
                                                }
                                                else {
                                                    $('#CounterDayend').prop('disabled', false);

                                                    Swal.fire({
                                                        allowEscapeKey: false,
                                                        allowOutsideClick: false,
                                                        title: 'Total Sales and Amount to be settled Mismatched',
                                                        icon: 'error',
                                                        confirmButtonColor: '#5cb85c',
                                                        confirmButtonText: 'OK',
                                                    })
                                                }

                                            }
                                            else {
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire(
                                                    'Oops!',
                                                    'GetPOSViewSales Details wrong . try again later!',
                                                    'warning'
                                                );
                                            }
                                        }
                                        else if (res.Status == "invalid") {
                                            if (res.Error != '' && res.Error != undefined) {
                                                ErrorLog.writeLogFile('GetPOSViewSales', res.Error.sqlMessage)

                                            } else {
                                                ErrorLog.writeLogFile('GetPOSViewSales', res.Status)

                                            }
                                            $('#CounterDayend').prop('disabled', false);

                                            Swal.fire(
                                                'Oops!',
                                                'GetPOSViewSales details wrong . try again later!',
                                                'warning'
                                            );
                                        }
                                    }).catch(function (err) {
                                        ErrorLog.writeLogFile('GetPOSViewSales', err)
                                        $('#CounterDayend').prop('disabled', false);
                                        Swal.fire(
                                            'Oops!',
                                            'API Server was Disconnected . try again later!',
                                            'warning'
                                        );
                                    })
                                }
                            }).catch((err) => {
                                debugger
                                $('#CounterDayend').prop('disabled', false);
                                ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', err)

                            })

                        }
                        else {
                            let ServiceTypeTotalAmount = document.getElementById("ServiceTypeTotalAmount").innerText
                            let paymentTotalAmount = document.getElementById("paymentTotalAmount").innerText
                            let DenominationAmount = document.getElementById("ValueAs").innerHTML
                            let CashTotalAmount = document.getElementById("CashTotalAmount").innerText
                            let Item = {
                                "POSId": environment.POSId,
                                "CompanyId": environment.CompanyId,
                                "SelectedDate": ChoosedDate,
                            }
                            $.post(environment.apiURL + '/GetPOSViewSales', Item, function (data) {
                                debugger
                                let res = JSON.parse(data);
                                if (res.Status == "valid") {
                                    debugger
                                    if (res.Data.length > 0) {
                                        debugger
                                        let GetPOSViewSales = res.Data
                                        let Dayendlist = GetPOSViewSales.filter(x => x.BillCounterId == BillCounterId)
                                        let DayendIndex = Dayendlist.findIndex(x => x.IsDayEnd == 0)
                                        if (DayendIndex == 0) {
                                            debugger
                                            let item = {
                                                POSId: POSId,
                                                BillCounterId: BillCounterId,
                                                SaleDate: ChoosedDate
                                            }
                                            if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                                if ((+DenominationAmount) == (+CashTotalAmount)) {
                                                    debugger
                                                    showLoading();
                                                    BillingdbService.getDayendSaleDetails(item).then(
                                                        (result) => {
                                                            debugger

                                                            let Item = {
                                                                SalesHeaderList: JSON.stringify(result.HeaderList),
                                                                SalesDetailList: JSON.stringify(result.SaleList),
                                                                CashExpenses: JSON.stringify(result.CashExpenseList),
                                                                BillReprintLogs: JSON.stringify(result.ReprintList),
                                                                POSId: environment.POSId,
                                                                DayEndDate: ChoosedDate,
                                                                BillCounterId: BillCounterId,
                                                                CompanyId: environment.CompanyId,
                                                                CashDenominations: JSON.stringify(Denominationcash),
                                                                TodayDate: TodayDate,
                                                                Source: "/counterDayEnd",
                                                                Ref: store.get('Ref'),
                                                            }
                                                            //  console.log("Item",Item);
                                                            $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {

                                                                debugger
                                                                let res = JSON.parse(data);
                                                                if (res.Status == "valid") {
                                                                    debugger
                                                                    let dayenditem = {
                                                                        BillCounterId: BillCounterId,
                                                                        SaleDate: ChoosedDate
                                                                    }
                                                                    BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                                        (result) => {
                                                                            debugger
                                                                            Swal.fire({
                                                                                allowEscapeKey: false,
                                                                                allowOutsideClick: false,
                                                                                title: 'DayEnd Successfully',
                                                                                icon: 'success',
                                                                                confirmButtonColor: '#5cb85c',
                                                                                confirmButtonText: 'OK',
                                                                                timer: 1500
                                                                            })

                                                                            setTimeout(function () {
                                                                                debugger
                                                                                store.delete('SelectedItems');
                                                                                store.delete('loginToken');
                                                                                ipcRenderer.invoke('CloseBillReport', res.Data);

                                                                            }, 1500)


                                                                        },
                                                                        (error) => {
                                                                            $('#CounterDayend').prop('disabled', false);
                                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                                        }
                                                                    )
                                                                }
                                                                else if (res.Status == "invalid") {
                                                                    if (res.Error != '' && res.Error != undefined) {
                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Error.sqlMessage)

                                                                    } else {
                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Status)

                                                                    }
                                                                    $('#CounterDayend').prop('disabled', false);
                                                                    Swal.fire({
                                                                        title: 'DayEnd Failed',
                                                                        allowEscapeKey: false,
                                                                        allowOutsideClick: false,
                                                                        icon: 'error',
                                                                        confirmButtonColor: '#3085d6',
                                                                        confirmButtonText: 'OK'
                                                                    })
                                                                }
                                                            }).catch(function (err) {
                                                                ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                                $('#CounterDayend').prop('disabled', false);
                                                                Swal.fire(
                                                                    'Oops!',
                                                                    'API was Disconnected . try again later!',
                                                                    'warning'
                                                                );
                                                            })
                                                        }, (error) => {
                                                            ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                            $('#CounterDayend').prop('disabled', false);

                                                            Swal.fire(
                                                                'Oops!',
                                                                'Dayend Details wrong. try again later!',
                                                                'warning'
                                                            );
                                                        })
                                                }
                                                else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                                    Swal.fire({
                                                        allowEscapeKey: false,
                                                        allowOutsideClick: false,
                                                        title: 'Cash amount mismatched',
                                                        icon: 'error',
                                                        confirmButtonColor: '#5cb85c',
                                                        confirmButtonText: 'OK'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            $('#CounterDayend').prop('disabled', false);
                                                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                            $('#CounterDayend').prop('disabled', false);

                                                        }
                                                    })
                                                }
                                                else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                                    $('#CounterDayend').prop('disabled', false);

                                                    Swal.fire({
                                                        allowEscapeKey: false,
                                                        allowOutsideClick: false,
                                                        title: 'Please Enter Denomination Details',
                                                        icon: 'error',
                                                        confirmButtonColor: '#5cb85c',
                                                        confirmButtonText: 'OK',
                                                    })
                                                }
                                                else {
                                                    $('#CounterDayend').prop('disabled', false);

                                                    Swal.fire({
                                                        allowEscapeKey: false,
                                                        allowOutsideClick: false,
                                                        title: 'Cash amount mismatched',
                                                        icon: 'error',
                                                        confirmButtonColor: '#5cb85c',
                                                        confirmButtonText: 'OK',
                                                    })
                                                }
                                            }
                                            else {
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Total Sales and Amount to be settled Mismatched',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK',
                                                })
                                            }
                                        }
                                        else if (DayendIndex == -1) {
                                            Swal.fire({
                                                allowEscapeKey: false,
                                                allowOutsideClick: false,
                                                title: 'counter was already dayended..!',
                                                icon: 'error',
                                                showCancelButton: false,
                                                confirmButtonText: 'ok',
                                            })
                                        }
                                    }
                                    else if (res.Data.length == 0) {
                                        let item = {
                                            POSId: POSId,
                                            BillCounterId: BillCounterId,
                                            SaleDate: ChoosedDate
                                        }

                                        if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                            if ((+DenominationAmount) == (+CashTotalAmount)) {
                                                showLoading();
                                                BillingdbService.getDayendSaleDetails(item).then(
                                                    (result) => {
                                                        let Item = {
                                                            SalesHeaderList: JSON.stringify(result.HeaderList),
                                                            SalesDetailList: JSON.stringify(result.SaleList),
                                                            CashExpenses: JSON.stringify(result.CashExpenseList),
                                                            BillReprintLogs: JSON.stringify(result.ReprintList),
                                                            POSId: environment.POSId,
                                                            DayEndDate: ChoosedDate,
                                                            BillCounterId: BillCounterId,
                                                            CompanyId: environment.CompanyId,
                                                            CashDenominations: JSON.stringify(Denominationcash),
                                                            TodayDate: TodayDate,
                                                            Source: "/counterDayEnd",
                                                            Ref: store.get('Ref'),
                                                        }
                                                        //   console.log("Item",Item)
                                                        $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {
                                                            let res = JSON.parse(data);
                                                            if (res.Status == "valid") {
                                                                let dayenditem = {
                                                                    BillCounterId: BillCounterId,
                                                                    SaleDate: ChoosedDate
                                                                }
                                                                BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                                    (result) => {

                                                                        Swal.fire({
                                                                            allowEscapeKey: false,
                                                                            allowOutsideClick: false,
                                                                            title: 'DayEnd Successfully',
                                                                            icon: 'success',
                                                                            confirmButtonColor: '#5cb85c',
                                                                            confirmButtonText: 'OK',
                                                                            timer: 1500
                                                                        })

                                                                        setTimeout(function () {
                                                                            store.delete('SelectedItems');
                                                                            store.delete('loginToken');
                                                                            ipcRenderer.invoke('CloseBillReport', res.Data);

                                                                        }, 1500)


                                                                    },
                                                                    (error) => {
                                                                        $('#CounterDayend').prop('disabled', false);

                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                                    }
                                                                )
                                                            }
                                                            else if (res.Status == "invalid") {
                                                                $('#CounterDayend').prop('disabled', false);
                                                                if (res.Error != '' && res.Error != undefined) {
                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Error.sqlMessage)

                                                                } else {
                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Status)

                                                                }
                                                                Swal.fire({
                                                                    allowEscapeKey: false,
                                                                    allowOutsideClick: false,
                                                                    title: 'DayEnd Failed',
                                                                    icon: 'error',
                                                                    confirmButtonColor: '#3085d6',
                                                                    confirmButtonText: 'OK'
                                                                })
                                                            }
                                                        }).catch(function (err) {
                                                            $('#CounterDayend').prop('disabled', false);

                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                            Swal.fire(
                                                                'Oops!',
                                                                'API was Disconnected . try again later!',
                                                                'warning'
                                                            );
                                                        })
                                                    }, (error) => {
                                                        ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                        $('#CounterDayend').prop('disabled', false);

                                                        Swal.fire(
                                                            'Oops!',
                                                            'Dayend Details wrong. try again later!',
                                                            'warning'
                                                        );
                                                    })
                                            }
                                            else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Cash amount mismatched',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        $('#CounterDayend').prop('disabled', false);

                                                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                        $('#CounterDayend').prop('disabled', false);

                                                    }
                                                })
                                            }
                                            else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Please Enter Denomination Details',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK',
                                                })
                                            }
                                            else {
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Cash amount mismatched',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK',
                                                })
                                            }
                                        }
                                        else {
                                            $('#CounterDayend').prop('disabled', false);

                                            Swal.fire({
                                                allowEscapeKey: false,
                                                allowOutsideClick: false,
                                                title: 'Total Sales and Amount to be settled Mismatched',
                                                icon: 'error',
                                                confirmButtonColor: '#5cb85c',
                                                confirmButtonText: 'OK',
                                            })
                                        }

                                    }
                                    else {
                                        $('#CounterDayend').prop('disabled', false);

                                        Swal.fire(
                                            'Oops!',
                                            'GetPOSViewSales Details wrong . try again later!',
                                            'warning'
                                        );
                                    }
                                }
                                else if (res.Status == "invalid") {
                                    if (res.Error != '' && res.Error != undefined) {
                                        ErrorLog.writeLogFile('GetPOSViewSales', res.Error.sqlMessage)

                                    } else {
                                        ErrorLog.writeLogFile('GetPOSViewSales', res.Status)

                                    }
                                    $('#CounterDayend').prop('disabled', false);

                                    Swal.fire(
                                        'Oops!',
                                        'GetPOSViewSales details wrong . try again later!',
                                        'warning'
                                    );
                                }
                            }).catch(function (err) {
                                ErrorLog.writeLogFile('GetPOSViewSales', err)
                                $('#CounterDayend').prop('disabled', false);
                                Swal.fire(
                                    'Oops!',
                                    'API Server was Disconnected . try again later!',
                                    'warning'
                                );
                            })
                        }
                    }

                }
                else if (res.Status == "invalid") {
                    $('#CounterDayend').prop('disabled', false);
                    ErrorLog.writeLogFile('GetBulkOrdersPending', res.Error.sqlMessage)
                }
                else {
                    $('#CounterDayend').prop('disabled', false);
                    ErrorLog.writeLogFile('GetBulkOrdersPending', res.Status)
                }
            }).catch((err => {
                $('#CounterDayend').prop('disabled', false);
                ErrorLog.writeLogFile('GetBulkOrdersPending', err)
            }))
        }
        else {
            if (servicetypeIndex != -1) {
                getPOSSales().then((res) => {
                    debugger
                    if (res == "Success") {
                        debugger
                        let ServiceTypeTotalAmount = document.getElementById("ServiceTypeTotalAmount").innerText
                        let paymentTotalAmount = document.getElementById("paymentTotalAmount").innerText
                        let DenominationAmount = document.getElementById("ValueAs").innerHTML
                        let CashTotalAmount = document.getElementById("CashTotalAmount").innerText
                        let Item = {
                            "POSId": environment.POSId,
                            "CompanyId": environment.CompanyId,
                            "SelectedDate": ChoosedDate,
                        }
                        $.post(environment.apiURL + '/GetPOSViewSales', Item, function (data) {
                            debugger
                            let res = JSON.parse(data);
                            if (res.Status == "valid") {
                                debugger
                                if (res.Data.length > 0) {
                                    debugger
                                    let GetPOSViewSales = res.Data
                                    let Dayendlist = GetPOSViewSales.filter(x => x.BillCounterId == BillCounterId)
                                    let DayendIndex = Dayendlist.findIndex(x => x.IsDayEnd == 0)
                                    if (DayendIndex == 0) {
                                        debugger
                                        let item = {
                                            POSId: POSId,
                                            BillCounterId: BillCounterId,
                                            SaleDate: ChoosedDate
                                        }
                                        if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                            if ((+DenominationAmount) == (+CashTotalAmount)) {
                                                debugger
                                                showLoading();
                                                BillingdbService.getDayendSaleDetails(item).then(
                                                    (result) => {
                                                        debugger
                                                        getDeletePOSSales().then((DeletePOSSaleList) => {
                                                            debugger
                                                            let Item = {
                                                                SalesHeaderList: JSON.stringify(result.HeaderList),
                                                                SalesDetailList: JSON.stringify(result.SaleList),
                                                                DeletePOSSaleList: JSON.stringify(DeletePOSSaleList),
                                                                CashExpenses: JSON.stringify(result.CashExpenseList),
                                                                BillReprintLogs: JSON.stringify(result.ReprintList),
                                                                POSId: environment.POSId,
                                                                DayEndDate: ChoosedDate,
                                                                BillCounterId: BillCounterId,
                                                                CompanyId: environment.CompanyId,
                                                                CashDenominations: JSON.stringify(Denominationcash),
                                                                TodayDate: TodayDate,
                                                                Source: "/counterDayEnd",
                                                                Ref: store.get('Ref'),
                                                            }
                                                            //   console.log("Item",Item)
                                                            $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {

                                                                debugger
                                                                let res = JSON.parse(data);
                                                                if (res.Status == "valid") {
                                                                    debugger
                                                                    let dayenditem = {
                                                                        BillCounterId: BillCounterId,
                                                                        SaleDate: ChoosedDate
                                                                    }
                                                                    BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                                        (result) => {
                                                                            debugger
                                                                            Swal.fire({
                                                                                allowEscapeKey: false,
                                                                                allowOutsideClick: false,
                                                                                title: 'DayEnd Successfully',
                                                                                icon: 'success',
                                                                                confirmButtonColor: '#5cb85c',
                                                                                confirmButtonText: 'OK',
                                                                                timer: 1500
                                                                            })

                                                                            setTimeout(function () {
                                                                                debugger
                                                                                store.delete('SelectedItems');
                                                                                store.delete('loginToken');
                                                                                ipcRenderer.invoke('CloseBillReport', res.Data);

                                                                            }, 1500)
                                                                            UpdateCounterDayend().then((res) => {
                                                                                DeleteSaleheader()
                                                                            }).catch((err) => {
                                                                                ErrorLog.writeLogFile('UpdateCounterDayend', err)
                                                                            })



                                                                        },
                                                                        (error) => {
                                                                            $('#CounterDayend').prop('disabled', false);
                                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                                        }
                                                                    )
                                                                }
                                                                else if (res.Status == "invalid") {
                                                                    if (res.Error != '' && res.Error != undefined) {
                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Error.sqlMessage)

                                                                    } else {
                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Status)

                                                                    }
                                                                    $('#CounterDayend').prop('disabled', false);
                                                                    Swal.fire({
                                                                        title: 'DayEnd Failed',
                                                                        allowEscapeKey: false,
                                                                        allowOutsideClick: false,
                                                                        icon: 'error',
                                                                        confirmButtonColor: '#3085d6',
                                                                        confirmButtonText: 'OK'
                                                                    })
                                                                }
                                                            }).catch(function (err) {
                                                                ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                                $('#CounterDayend').prop('disabled', false);
                                                                Swal.fire(
                                                                    'Oops!',
                                                                    'API was Disconnected . try again later!',
                                                                    'warning'
                                                                );
                                                            })
                                                        }).catch((err) => {
                                                            ErrorLog.writeLogFile('getDeletePOSSales', err)
                                                        })

                                                    }, (error) => {
                                                        ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                        $('#CounterDayend').prop('disabled', false);

                                                        Swal.fire(
                                                            'Oops!',
                                                            'Dayend Details wrong. try again later!',
                                                            'warning'
                                                        );
                                                    })
                                            }
                                            else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Cash amount mismatched',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        $('#CounterDayend').prop('disabled', false);
                                                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                        $('#CounterDayend').prop('disabled', false);

                                                    }
                                                })
                                            }
                                            else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Please Enter Denomination Details',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK',
                                                })
                                            }
                                            else {
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire({
                                                    allowEscapeKey: false,
                                                    allowOutsideClick: false,
                                                    title: 'Cash amount mismatched',
                                                    icon: 'error',
                                                    confirmButtonColor: '#5cb85c',
                                                    confirmButtonText: 'OK',
                                                })
                                            }
                                        }
                                        else {
                                            $('#CounterDayend').prop('disabled', false);

                                            Swal.fire({
                                                allowEscapeKey: false,
                                                allowOutsideClick: false,
                                                title: 'Total Sales and Amount to be settled Mismatched',
                                                icon: 'error',
                                                confirmButtonColor: '#5cb85c',
                                                confirmButtonText: 'OK',
                                            })
                                        }
                                    }
                                    else if (DayendIndex == -1) {
                                        Swal.fire({
                                            allowEscapeKey: false,
                                            allowOutsideClick: false,
                                            title: 'counter was already dayended..!',
                                            icon: 'error',
                                            showCancelButton: false,
                                            confirmButtonText: 'ok',
                                        })
                                    }
                                }
                                else if (res.Data.length == 0) {
                                    let item = {
                                        POSId: POSId,
                                        BillCounterId: BillCounterId,
                                        SaleDate: ChoosedDate
                                    }

                                    if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                        if ((+DenominationAmount) == (+CashTotalAmount)) {
                                            showLoading();
                                            BillingdbService.getDayendSaleDetails(item).then(
                                                (result) => {
                                                    getDeletePOSSales().then((DeletePOSSaleList) => {
                                                        debugger
                                                        let Item = {
                                                            SalesHeaderList: JSON.stringify(result.HeaderList),
                                                            SalesDetailList: JSON.stringify(result.SaleList),
                                                            DeletePOSSaleList: JSON.stringify(DeletePOSSaleList),
                                                            CashExpenses: JSON.stringify(result.CashExpenseList),
                                                            BillReprintLogs: JSON.stringify(result.ReprintList),
                                                            POSId: environment.POSId,
                                                            DayEndDate: ChoosedDate,
                                                            BillCounterId: BillCounterId,
                                                            CompanyId: environment.CompanyId,
                                                            CashDenominations: JSON.stringify(Denominationcash),
                                                            TodayDate: TodayDate,
                                                            Source: "/counterDayEnd",
                                                            Ref: store.get('Ref'),
                                                        }
                                                        //   console.log("Item",Item)
                                                        $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {
                                                            let res = JSON.parse(data);
                                                            if (res.Status == "valid") {
                                                                let dayenditem = {
                                                                    BillCounterId: BillCounterId,
                                                                    SaleDate: ChoosedDate
                                                                }
                                                                BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                                    (result) => {

                                                                        Swal.fire({
                                                                            allowEscapeKey: false,
                                                                            allowOutsideClick: false,
                                                                            title: 'DayEnd Successfully',
                                                                            icon: 'success',
                                                                            confirmButtonColor: '#5cb85c',
                                                                            confirmButtonText: 'OK',
                                                                            timer: 1500
                                                                        })

                                                                        setTimeout(function () {
                                                                            store.delete('SelectedItems');
                                                                            store.delete('loginToken');
                                                                            ipcRenderer.invoke('CloseBillReport', res.Data);
                                                                        }, 1500)
                                                                        UpdateCounterDayend().then((res) => {
                                                                            DeleteSaleheader()
                                                                        }).catch((err) => {
                                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', err)
                                                                        })
                                                                    },
                                                                    (error) => {
                                                                        $('#CounterDayend').prop('disabled', false);

                                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                                    }
                                                                )
                                                            }
                                                            else if (res.Status == "invalid") {
                                                                $('#CounterDayend').prop('disabled', false);
                                                                if (res.Error != '' && res.Error != undefined) {
                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Error.sqlMessage)

                                                                } else {
                                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Status)

                                                                }

                                                                Swal.fire({
                                                                    allowEscapeKey: false,
                                                                    allowOutsideClick: false,
                                                                    title: 'DayEnd Failed',
                                                                    icon: 'error',
                                                                    confirmButtonColor: '#3085d6',
                                                                    confirmButtonText: 'OK'
                                                                })
                                                            }
                                                        }).catch(function (err) {
                                                            $('#CounterDayend').prop('disabled', false);

                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                            Swal.fire(
                                                                'Oops!',
                                                                'API was Disconnected . try again later!',
                                                                'warning'
                                                            );
                                                        })
                                                    }).catch((err) => {
                                                        ErrorLog.writeLogFile('getDeletePOSSales', err)
                                                    })

                                                }, (error) => {
                                                    ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                    $('#CounterDayend').prop('disabled', false);

                                                    Swal.fire(
                                                        'Oops!',
                                                        'Dayend Details wrong. try again later!',
                                                        'warning'
                                                    );
                                                })
                                        }
                                        else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                            Swal.fire({
                                                allowEscapeKey: false,
                                                allowOutsideClick: false,
                                                title: 'Cash amount mismatched',
                                                icon: 'error',
                                                confirmButtonColor: '#5cb85c',
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    $('#CounterDayend').prop('disabled', false);

                                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                    $('#CounterDayend').prop('disabled', false);

                                                }
                                            })
                                        }
                                        else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                            $('#CounterDayend').prop('disabled', false);

                                            Swal.fire({
                                                allowEscapeKey: false,
                                                allowOutsideClick: false,
                                                title: 'Please Enter Denomination Details',
                                                icon: 'error',
                                                confirmButtonColor: '#5cb85c',
                                                confirmButtonText: 'OK',
                                            })
                                        }
                                        else {
                                            $('#CounterDayend').prop('disabled', false);

                                            Swal.fire({
                                                allowEscapeKey: false,
                                                allowOutsideClick: false,
                                                title: 'Cash amount mismatched',
                                                icon: 'error',
                                                confirmButtonColor: '#5cb85c',
                                                confirmButtonText: 'OK',
                                            })
                                        }
                                    }
                                    else {
                                        $('#CounterDayend').prop('disabled', false);

                                        Swal.fire({
                                            allowEscapeKey: false,
                                            allowOutsideClick: false,
                                            title: 'Total Sales and Amount to be settled Mismatched',
                                            icon: 'error',
                                            confirmButtonColor: '#5cb85c',
                                            confirmButtonText: 'OK',
                                        })
                                    }

                                }
                                else {
                                    $('#CounterDayend').prop('disabled', false);

                                    Swal.fire(
                                        'Oops!',
                                        'GetPOSViewSales Details wrong . try again later!',
                                        'warning'
                                    );
                                }
                            }
                            else if (res.Status == "invalid") {
                                if (res.Error != '' && res.Error != undefined) {
                                    ErrorLog.writeLogFile('GetPOSViewSales', res.Error.sqlMessage)

                                } else {
                                    ErrorLog.writeLogFile('GetPOSViewSales', res.Status)

                                }
                                $('#CounterDayend').prop('disabled', false);

                                Swal.fire(
                                    'Oops!',
                                    'GetPOSViewSales details wrong . try again later!',
                                    'warning'
                                );
                            }
                        }).catch(function (err) {
                            ErrorLog.writeLogFile('GetPOSViewSales', err)
                            $('#CounterDayend').prop('disabled', false);
                            Swal.fire(
                                'Oops!',
                                'API Server was Disconnected . try again later!',
                                'warning'
                            );
                        })
                    }
                }).catch((err) => {
                    debugger
                    $('#CounterDayend').prop('disabled', false);
                    ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', err)

                })

            }
            else {
                let ServiceTypeTotalAmount = document.getElementById("ServiceTypeTotalAmount").innerText
                let paymentTotalAmount = document.getElementById("paymentTotalAmount").innerText
                let DenominationAmount = document.getElementById("ValueAs").innerHTML
                let CashTotalAmount = document.getElementById("CashTotalAmount").innerText
                let Item = {
                    "POSId": environment.POSId,
                    "CompanyId": environment.CompanyId,
                    "SelectedDate": ChoosedDate,
                }
                $.post(environment.apiURL + '/GetPOSViewSales', Item, function (data) {
                    debugger
                    let res = JSON.parse(data);
                    if (res.Status == "valid") {
                        debugger
                        if (res.Data.length > 0) {
                            debugger
                            let GetPOSViewSales = res.Data
                            let Dayendlist = GetPOSViewSales.filter(x => x.BillCounterId == BillCounterId)
                            let DayendIndex = Dayendlist.findIndex(x => x.IsDayEnd == 0)
                            if (DayendIndex == 0) {
                                debugger
                                let item = {
                                    POSId: POSId,
                                    BillCounterId: BillCounterId,
                                    SaleDate: ChoosedDate
                                }
                                if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                    if ((+DenominationAmount) == (+CashTotalAmount)) {
                                        debugger
                                        showLoading();
                                        BillingdbService.getDayendSaleDetails(item).then(
                                            (result) => {
                                                debugger

                                                let Item = {
                                                    SalesHeaderList: JSON.stringify(result.HeaderList),
                                                    SalesDetailList: JSON.stringify(result.SaleList),
                                                    CashExpenses: JSON.stringify(result.CashExpenseList),
                                                    BillReprintLogs: JSON.stringify(result.ReprintList),
                                                    POSId: environment.POSId,
                                                    DayEndDate: ChoosedDate,
                                                    BillCounterId: BillCounterId,
                                                    CompanyId: environment.CompanyId,
                                                    CashDenominations: JSON.stringify(Denominationcash),
                                                    TodayDate: TodayDate,
                                                    Source: "/counterDayEnd",
                                                    Ref: store.get('Ref'),
                                                }
                                                //   console.log("Item",Item)
                                                $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {

                                                    debugger
                                                    let res = JSON.parse(data);
                                                    if (res.Status == "valid") {
                                                        debugger
                                                        let dayenditem = {
                                                            BillCounterId: BillCounterId,
                                                            SaleDate: ChoosedDate
                                                        }
                                                        BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                            (result) => {
                                                                debugger
                                                                Swal.fire({
                                                                    allowEscapeKey: false,
                                                                    allowOutsideClick: false,
                                                                    title: 'DayEnd Successfully',
                                                                    icon: 'success',
                                                                    confirmButtonColor: '#5cb85c',
                                                                    confirmButtonText: 'OK',
                                                                    timer: 1500
                                                                })

                                                                setTimeout(function () {
                                                                    debugger
                                                                    store.delete('SelectedItems');
                                                                    store.delete('loginToken');
                                                                    ipcRenderer.invoke('CloseBillReport', res.Data);

                                                                }, 1500)


                                                            },
                                                            (error) => {
                                                                $('#CounterDayend').prop('disabled', false);
                                                                ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                            }
                                                        )
                                                    }
                                                    else if (res.Status == "invalid") {
                                                        if (res.Error != '' && res.Error != undefined) {
                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Error.sqlMessage)

                                                        } else {
                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', res.Status)

                                                        }
                                                        $('#CounterDayend').prop('disabled', false);
                                                        Swal.fire({
                                                            title: 'DayEnd Failed',
                                                            allowEscapeKey: false,
                                                            allowOutsideClick: false,
                                                            icon: 'error',
                                                            confirmButtonColor: '#3085d6',
                                                            confirmButtonText: 'OK'
                                                        })
                                                    }
                                                }).catch(function (err) {
                                                    ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                    $('#CounterDayend').prop('disabled', false);
                                                    Swal.fire(
                                                        'Oops!',
                                                        'API was Disconnected . try again later!',
                                                        'warning'
                                                    );
                                                })
                                            }, (error) => {
                                                ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                                $('#CounterDayend').prop('disabled', false);

                                                Swal.fire(
                                                    'Oops!',
                                                    'Dayend Details wrong. try again later!',
                                                    'warning'
                                                );
                                            })
                                    }
                                    else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                        Swal.fire({
                                            allowEscapeKey: false,
                                            allowOutsideClick: false,
                                            title: 'Cash amount mismatched',
                                            icon: 'error',
                                            confirmButtonColor: '#5cb85c',
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                $('#CounterDayend').prop('disabled', false);
                                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                $('#CounterDayend').prop('disabled', false);

                                            }
                                        })
                                    }
                                    else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                        $('#CounterDayend').prop('disabled', false);

                                        Swal.fire({
                                            allowEscapeKey: false,
                                            allowOutsideClick: false,
                                            title: 'Please Enter Denomination Details',
                                            icon: 'error',
                                            confirmButtonColor: '#5cb85c',
                                            confirmButtonText: 'OK',
                                        })
                                    }
                                    else {
                                        $('#CounterDayend').prop('disabled', false);

                                        Swal.fire({
                                            allowEscapeKey: false,
                                            allowOutsideClick: false,
                                            title: 'Cash amount mismatched',
                                            icon: 'error',
                                            confirmButtonColor: '#5cb85c',
                                            confirmButtonText: 'OK',
                                        })
                                    }
                                }
                                else {
                                    $('#CounterDayend').prop('disabled', false);

                                    Swal.fire({
                                        allowEscapeKey: false,
                                        allowOutsideClick: false,
                                        title: 'Total Sales and Amount to be settled Mismatched',
                                        icon: 'error',
                                        confirmButtonColor: '#5cb85c',
                                        confirmButtonText: 'OK',
                                    })
                                }
                            }
                            else if (DayendIndex == -1) {
                                Swal.fire({
                                    allowEscapeKey: false,
                                    allowOutsideClick: false,
                                    title: 'counter was already dayended..!',
                                    icon: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'ok',
                                })
                            }
                        }
                        else if (res.Data.length == 0) {
                            let item = {
                                POSId: POSId,
                                BillCounterId: BillCounterId,
                                SaleDate: ChoosedDate
                            }

                            if ((+ServiceTypeTotalAmount) == (+paymentTotalAmount)) {
                                if ((+DenominationAmount) == (+CashTotalAmount)) {
                                    showLoading();
                                    BillingdbService.getDayendSaleDetails(item).then(
                                        (result) => {
                                            let Item = {
                                                SalesHeaderList: JSON.stringify(result.HeaderList),
                                                SalesDetailList: JSON.stringify(result.SaleList),
                                                CashExpenses: JSON.stringify(result.CashExpenseList),
                                                BillReprintLogs: JSON.stringify(result.ReprintList),
                                                POSId: environment.POSId,
                                                DayEndDate: ChoosedDate,
                                                BillCounterId: BillCounterId,
                                                CompanyId: environment.CompanyId,
                                                CashDenominations: JSON.stringify(Denominationcash),
                                                TodayDate: TodayDate,
                                                Source: "/counterDayEnd",
                                                Ref: store.get('Ref'),
                                            }
                                            //    console.log("Item",Item);
                                            $.post(environment.apiURL + '/UpdatePOSCounterDayEnd', Item, function (data) {
                                                let res = JSON.parse(data);
                                                if (res.Status == "valid") {
                                                    let dayenditem = {
                                                        BillCounterId: BillCounterId,
                                                        SaleDate: ChoosedDate
                                                    }
                                                    BillingdbService.updatePOSCounterDayEnd(dayenditem).then(
                                                        (result) => {

                                                            Swal.fire({
                                                                allowEscapeKey: false,
                                                                allowOutsideClick: false,
                                                                title: 'DayEnd Successfully',
                                                                icon: 'success',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'OK',
                                                                timer: 1500
                                                            })

                                                            setTimeout(function () {
                                                                store.delete('SelectedItems');
                                                                store.delete('loginToken');
                                                                ipcRenderer.invoke('CloseBillReport', res.Data);

                                                            }, 1500)


                                                        },
                                                        (error) => {
                                                            $('#CounterDayend').prop('disabled', false);

                                                            ErrorLog.writeLogFile('UpdatePOSCounterDayEnd', error)
                                                        }
                                                    )
                                                }
                                                else if (res.Status == "invalid") {
                                                    $('#CounterDayend').prop('disabled', false);
                                                    if (res.Error != '' && res.Error != undefined) {
                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Error.sqlMessage)

                                                    } else {
                                                        ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', res.Status)

                                                    }
                                                    Swal.fire({
                                                        allowEscapeKey: false,
                                                        allowOutsideClick: false,
                                                        title: 'DayEnd Failed',
                                                        icon: 'error',
                                                        confirmButtonColor: '#3085d6',
                                                        confirmButtonText: 'OK'
                                                    })
                                                }
                                            }).catch(function (err) {
                                                $('#CounterDayend').prop('disabled', false);

                                                ErrorLog.writeLogFile('UpdatePOSCounterDayEndAPI', err)
                                                Swal.fire(
                                                    'Oops!',
                                                    'API was Disconnected . try again later!',
                                                    'warning'
                                                );
                                            })
                                        }, (error) => {
                                            ErrorLog.writeLogFile('getDayendSaleDetails', error)
                                            $('#CounterDayend').prop('disabled', false);

                                            Swal.fire(
                                                'Oops!',
                                                'Dayend Details wrong. try again later!',
                                                'warning'
                                            );
                                        })
                                }
                                else if ((+DenominationAmount) >= (+CashTotalAmount) && (+CashTotalAmount) != 0) {

                                    Swal.fire({
                                        allowEscapeKey: false,
                                        allowOutsideClick: false,
                                        title: 'Cash amount mismatched',
                                        icon: 'error',
                                        confirmButtonColor: '#5cb85c',
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            $('#CounterDayend').prop('disabled', false);

                                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                                            $('#CounterDayend').prop('disabled', false);

                                        }
                                    })
                                }
                                else if ((+CashTotalAmount) != 0 && (+DenominationAmount) == 0) {
                                    $('#CounterDayend').prop('disabled', false);

                                    Swal.fire({
                                        allowEscapeKey: false,
                                        allowOutsideClick: false,
                                        title: 'Please Enter Denomination Details',
                                        icon: 'error',
                                        confirmButtonColor: '#5cb85c',
                                        confirmButtonText: 'OK',
                                    })
                                }
                                else {
                                    $('#CounterDayend').prop('disabled', false);

                                    Swal.fire({
                                        allowEscapeKey: false,
                                        allowOutsideClick: false,
                                        title: 'Cash amount mismatched',
                                        icon: 'error',
                                        confirmButtonColor: '#5cb85c',
                                        confirmButtonText: 'OK',
                                    })
                                }
                            }
                            else {
                                $('#CounterDayend').prop('disabled', false);

                                Swal.fire({
                                    allowEscapeKey: false,
                                    allowOutsideClick: false,
                                    title: 'Total Sales and Amount to be settled Mismatched',
                                    icon: 'error',
                                    confirmButtonColor: '#5cb85c',
                                    confirmButtonText: 'OK',
                                })
                            }

                        }
                        else {
                            $('#CounterDayend').prop('disabled', false);

                            Swal.fire(
                                'Oops!',
                                'GetPOSViewSales Details wrong . try again later!',
                                'warning'
                            );
                        }
                    }
                    else if (res.Status == "invalid") {
                        if (res.Error != '' && res.Error != undefined) {
                            ErrorLog.writeLogFile('GetPOSViewSales', res.Error.sqlMessage)

                        } else {
                            ErrorLog.writeLogFile('GetPOSViewSales', res.Status)

                        }
                        $('#CounterDayend').prop('disabled', false);

                        Swal.fire(
                            'Oops!',
                            'GetPOSViewSales details wrong . try again later!',
                            'warning'
                        );
                    }
                }).catch(function (err) {
                    ErrorLog.writeLogFile('GetPOSViewSales', err)
                    $('#CounterDayend').prop('disabled', false);
                    Swal.fire(
                        'Oops!',
                        'API Server was Disconnected . try again later!',
                        'warning'
                    );
                })
            }
        }

    }
}

function getDeletePOSSales() {
    debugger
    return new Promise(function (resolve, reject) {
        var connection = mysql.createConnection({

            connectionLimit: environment.ConnectionUrl.connectionLimit, //important
            host: environment.ConnectionUrl.host,
            user: environment.ConnectionUrl.user,
            password: environment.ConnectionUrl.password,
            database: environment.ConnectionUrl.database,
            debug: environment.ConnectionUrl.debug
        });

        // connect to mysql
        connection.connect(function (err) {
            debugger
            // in case of error
            if (err) {
                //        console.log("getDeletePOSSales", err.code);
                //   console.log("getDeletePOSSales", err.fatal);
                ErrorLog.writeLogFile('getDeletePOSSales', err.sqlMessage)
                reject(err)
            }
        });

        connection.query("Select BillCounterId,CancelledReason,CashierName,CreatedBy,DATE_FORMAT(CreatedOn,'%Y-%m-%d %H:%i:%s')as CreatedOn,GST,IsFromDevice,IsKOTSentTime,IsTakeAway,ItemBrandId,ItemGroupId,ItemId,ItemName,POSDeleteSaleId,POSSaleId,Quantity,Rate,DATE_FORMAT(SaleDate,'%Y-%m-%d %H:%i:%s')as SaleDate,SeatNo,TableNo,UOM,WaiterId,WaiterName  from tbldeletepossales where DATE_FORMAT(SaleDate,'%Y-%m-%d')='" + ChoosedDate + "'", function (err, rows, fields) {
            debugger
            if (err) {
                debugger
                //   console.log("An error ocurred performing the query.");
                //    console.log("getDeletePOSSaleserr", err.sqlMessage);
                //    ErrorLog.writeLogFile('getDeletePOSSales', err.sqlMessage)
                reject(err)
                return;
            }
            else {
                debugger
                //    console.log('getPOSSaleDetails', rows);
                if (rows.length > 0) {
                    let DeletePOSSaleList = Object.values(JSON.parse(JSON.stringify(rows)))
                    resolve(DeletePOSSaleList)
                    ErrorLog.writeLogFile('getPOSSaleDetails success')
                } else {
                    let DeletePOSSaleList = []
                    resolve(DeletePOSSaleList)
                    ErrorLog.writeLogFile('getPOSSaleDetails success')
                }




            }

        });

        // Close the connection
        connection.end(function () {
            // The connection has been closed
        });
    })

}

function getPOSSales() {
    debugger
    return new Promise(function (resolve, reject) {
        var connection = mysql.createConnection({

            connectionLimit: environment.ConnectionUrl.connectionLimit, //important
            host: environment.ConnectionUrl.host,
            user: environment.ConnectionUrl.user,
            password: environment.ConnectionUrl.password,
            database: environment.ConnectionUrl.database,
            debug: environment.ConnectionUrl.debug
        });

        // connect to mysql
        connection.connect(function (err) {
            debugger
            // in case of error
            if (err) {
                //      console.log("getPOSSaleDetails", err.code);
                //       console.log("getPOSSaleDetails", err.fatal);
                ErrorLog.writeLogFile('getPOSSaleDetails', err.sqlMessage)
                reject(err)
            }
        });

        connection.query("Select count(1) from tblpossales where DATE_FORMAT(SaleDate,'%Y-%m-%d')='" + ChoosedDate + "'", function (err, rows, fields) {
            debugger
            if (err) {
                debugger
                //     console.log("An error ocurred performing the query.");
                //     console.log("getPOSSaleDetailserr", err.sqlMessage);
                ErrorLog.writeLogFile('getPOSSaleDetails', err.sqlMessage)
                reject(err)
                return;
            }
            else {
                debugger
                //    console.log('getPOSSaleDetails', rows[0]);
                let data = Object.values(JSON.parse(JSON.stringify(rows[0])))[0]
                if (data > 0) {
                    Swal.fire({
                        title: 'some Bills are generated. please generate or delete',
                        icon: 'warning',
                        confirmButtonColor: '#5cb85c',
                        confirmButtonText: 'ok',
                        // timer: 1500
                        allowOutsideClick: false
                    })
                    ErrorLog.writeLogFile('some Bills are generated. please generate or delete')
                    reject("some Bills are generated. please generate or delete")

                }
                else {
                    resolve("Success")
                    ErrorLog.writeLogFile('getPOSSaleDetails success')

                }
                // }
                //  console.log("getPOSSaleDetails Query succesfully executed");

            }

        });

        // Close the connection
        connection.end(function () {
            // The connection has been closed
        });
    })

}
function UpdateCounterDayend() {
    debugger
    return new Promise(function (resolve, reject) {
        let loginId;
        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        var connection = mysql.createConnection({
            connectionLimit: environment.ConnectionUrl.connectionLimit, //important
            host: environment.ConnectionUrl.host,
            user: environment.ConnectionUrl.user,
            password: environment.ConnectionUrl.password,
            database: environment.ConnectionUrl.database,
            debug: environment.ConnectionUrl.debug
        });

        // connect to mysql
        connection.connect(function (err) {
            debugger
            // in case of error
            if (err) {
                //    console.log("UpdateCounterDayend", err.code);
                //        console.log("UpdateCounterDayend", err.fatal);
                ErrorLog.writeLogFile('UpdateCounterDayend', err.sqlMessage)
                reject(err)
            }
        });

        connection.query("INSERT INTO tblcounterdayend(SaleDate,BillCounterId,CreatedBy) VALUES (?,?,?)", [ChoosedDate, BillCounterId, loginId], function (err, rows, fields) {
            debugger
            if (err) {
                debugger
                //  console.log("UpdateCounterDayend", err.sqlMessage);
                ErrorLog.writeLogFile('UpdateCounterDayend', err.sqlMessage)
                reject(err)
                return;
            }
            else {
                debugger
                //         console.log('UpdateCounterDayend', rows);
                resolve("Success")
            }

        });

        // Close the connection
        connection.end(function () {
            // The connection has been closed
        });
    })

}
function DeleteSaleheader() {
    let loginId;
    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }
    let Item = {
        "DayEndDate": ChoosedDate,
        "LoginId": loginId
    }
    var connection = mysql.createConnection({

        connectionLimit: environment.ConnectionUrl.connectionLimit, //important
        host: environment.ConnectionUrl.host,
        user: environment.ConnectionUrl.user,
        password: environment.ConnectionUrl.password,
        database: environment.ConnectionUrl.database,
        debug: environment.ConnectionUrl.debug
    });

    // connect to mysql
    connection.connect(function (err) {
        debugger
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
            ErrorLog.writeLogFile('DeleteSaleheader', err.sqlMessage)
        }
    });

    // console.log(Item)
    connection.query("call spDeleteSaleheader(?,?)", [Item.DayEndDate, Item.LoginId], function (err, rows, fields) {
        debugger
        if (err) {
            debugger
            //   console.log("An error ocurred performing the query.");
            //   console.log(err);
            ErrorLog.writeLogFile('DeleteSaleheader', err.sqlMessage)

            return;
        }
        else {
            debugger
            //    console.log('rows', rows);
            //    console.log("Query succesfully executed");
            ErrorLog.writeLogFile('DeleteSaleheader Successfully');
        }

    });

    // Close the connection
    connection.end(function () {
        // The connection has been closed
    });
}


function loadDayEndBulkOrderAdvanceDetails() {
    debugger
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        CompanyId: environment.CompanyId,
        PaymentDate: ChoosedDate
    }
    BillingdbService.getBulkOrderadvancePaymentsDetails(item).then((data) => {
        debugger;
        BulkOrderAdvanceDetails = data;
    },
        (error) => {
            ErrorLog.writeLogFile('getBulkOrderadvancePaymentsDetails', error)

        }
    )
}

function loadDayEndBulkOrderAdjustmentsDetails() {
    debugger
    let item = {
        POSId: POSId,
        BillCounterId: BillCounterId,
        CompanyId: environment.CompanyId,
        PaymentDate: ChoosedDate
    }
    BillingdbService.getBulkOrderAdjustmentsDetails(item).then((data) => {
        debugger;
        BulkOrderAdjustmentsDetails = data;
    },
        (error) => {
            ErrorLog.writeLogFile('getBulkOrderBookingPaymentsDetails', error)

        }
    )
}