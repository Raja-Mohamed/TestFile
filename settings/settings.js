let Store = require('electron-store');
const store = new Store();
let Swal = require('sweetalert2');
// local database testing
let BillingdbService = require('../database/billingdb');
const ErrorLog = require('../services/log');
let IsPineLabPaymentModeValue =0 ;
let IsMultiplePaymentModeValue = 0;
let IsNormalPaymentModeValue = 0;
let IsPaytmPaymentModeValue = 0;
$("#IsNormal").hide();
$("#IsPineModeOption").hide();

$(document).ready(function () {

    // IsPineLabPaymentModeValue = store.get('IsPineLabPaymentMode');
    // IsMultiplePaymentModeValue = store.get('IsMultiplePaymentMode');
    // IsNormalPaymentModeValue = store.get('IsNormalPaymentMode');
    IsPineLabPaymentModeValue = store.get('IsPineLabPaymentMode') != undefined ? store.get('IsPineLabPaymentMode') : 0;
    IsMultiplePaymentModeValue = store.get('IsMultiplePaymentMode')!= undefined ? store.get('IsMultiplePaymentMode') : 0;
    IsNormalPaymentModeValue = store.get('IsNormalPaymentMode')!= undefined ? store.get('IsNormalPaymentMode') : 0;
    IsPaytmPaymentModeValue = store.get('IsPaytmPaymentMode')!= undefined ? store.get('IsPaytmPaymentMode') : 0;

    document.getElementById("IsPaytmPaymentMode").disabled = IsPineLabPaymentModeValue == 1 ? true : false; 
    document.getElementById("IsPineLabPaymentMode").disabled = IsPaytmPaymentModeValue == 1 ? true : false; 

    if(IsPineLabPaymentModeValue){
        // $("#IsNormal").show();
        // $("#IsPineModeOption").show();
        $("#IsNormal").hide();
        $("#IsPineModeOption").hide();
    }
    else{
        $("#IsPineModeOption").hide();
        $("#IsNormal").hide();
        IsNormalPaymentModeValue =0;
        document.getElementById("IsNormalPaymentMode").checked =0;
        store.set('IsNormalPaymentMode', IsNormalPaymentModeValue);
    }

    document.getElementById("IsPineMode").innerHTML = IsPineLabPaymentModeValue == 1 ? 'ON' : 'OFF';
    document.getElementById("IsMultipleMode").innerHTML = IsMultiplePaymentModeValue == 1 ? 'ON' : 'OFF';
    document.getElementById("IsNormalMode").innerHTML = IsNormalPaymentModeValue == 1 ? 'ON' : 'OFF';
    document.getElementById("IsPaytmMode").innerHTML = IsPaytmPaymentModeValue == 1 ? 'ON' : 'OFF';

    document.getElementById("printername").value = store.get('PrinterName');
    document.getElementById("IsBankCode").value =  store.get('IsBankCode') != undefined ? store.get('IsBankCode') : 4;
    document.getElementById("IsPineLabPaymentMode").checked = IsPineLabPaymentModeValue;
    document.getElementById("IsMultiplePaymentMode").checked = IsMultiplePaymentModeValue;
    document.getElementById("IsNormalPaymentMode").checked = IsNormalPaymentModeValue;
    document.getElementById("IsPaytmPaymentMode").checked = IsPaytmPaymentModeValue;

});
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

$.fn.IsPineLabPaymentMode = function () {

    let indexOfCustomer = document.getElementById("IsPineLabPaymentMode").checked;
    IsPineLabPaymentModeValue = indexOfCustomer ? 1 : 0;
    document.getElementById("IsPineMode").innerHTML = IsPineLabPaymentModeValue == 1 ? 'ON' : 'OFF';
    document.getElementById("IsPaytmPaymentMode").disabled = IsPineLabPaymentModeValue == 1 ? true : false; 

    if(IsPineLabPaymentModeValue){
        // $("#IsNormal").show();
        // $("#IsPineModeOption").show();
        $("#IsNormal").hide();
        $("#IsPineModeOption").hide();
    }
    else{
        $("#IsNormal").hide();
        $("#IsPineModeOption").hide();
        IsNormalPaymentModeValue =0;
        IsMultiplePaymentModeValue = 0;
        document.getElementById("IsBankCode").value =  store.get('IsBankCode') != undefined ? store.get('IsBankCode') : 4;

        document.getElementById("IsNormalPaymentMode").checked =IsNormalPaymentModeValue;
        document.getElementById("IsNormalMode").innerHTML = IsNormalPaymentModeValue == 1 ? 'ON' : 'OFF';
        store.set('IsNormalPaymentMode', IsNormalPaymentModeValue);

        document.getElementById("IsMultiplePaymentMode").checked =IsMultiplePaymentModeValue;
        document.getElementById("IsMultipleMode").innerHTML = IsMultiplePaymentModeValue == 1 ? 'ON' : 'OFF';
        store.set('IsMultiplePaymentMode', IsMultiplePaymentModeValue);

    }
   
}

$.fn.IsNormalPaymentMode = function () {
    let indexOfCustomer = document.getElementById("IsNormalPaymentMode").checked;
    IsNormalPaymentModeValue = indexOfCustomer ? 1 : 0;
    document.getElementById("IsNormalMode").innerHTML = IsNormalPaymentModeValue == 1 ? 'ON' : 'OFF';
}

$.fn.IsMultiplePaymentMode = function () {
    let indexOfCustomer = document.getElementById("IsMultiplePaymentMode").checked;
    IsMultiplePaymentModeValue = indexOfCustomer ? 1 : 0;
    document.getElementById("IsMultipleMode").innerHTML = IsMultiplePaymentModeValue == 1 ? 'ON' : 'OFF';
}

$.fn.IsPaytmPaymentMode = function () {

    let indexOfCustomer = document.getElementById("IsPaytmPaymentMode").checked;
    IsPaytmPaymentModeValue = indexOfCustomer ? 1 : 0;
    document.getElementById("IsPaytmMode").innerHTML = IsPaytmPaymentModeValue == 1 ? 'ON' : 'OFF';
    document.getElementById("IsPineLabPaymentMode").disabled = IsPaytmPaymentModeValue == 1 ? true : false; 
}

$.fn.saveData = function (event) {

    store.delete('PrinterName');
    store.delete('IsBankCode');
    store.delete('IsPineLabPaymentMode');
    store.delete('IsMultiplePaymentMode');
    store.delete('IsNormalPaymentMode');
    store.delete('IsPaytmPaymentMode');

    var printer = (document.getElementById("printername").value).trim();
    if (printer != '') {
        //debugger
        store.set('PrinterName', $('#printername').val());
        // store.set('IsBankCode', $('#IsBankCode').val());
        // store.set('IsMultiplePaymentMode', IsMultiplePaymentModeValue);
        // store.set('IsNormalPaymentMode', IsNormalPaymentModeValue);
        store.set('IsBankCode',4);
        store.set('IsPineLabPaymentMode', IsPineLabPaymentModeValue);
        store.set('IsMultiplePaymentMode', 0);
        store.set('IsNormalPaymentMode', 1);
        store.set('IsPaytmPaymentMode', IsPaytmPaymentModeValue);

        Swal.fire(
            'Success..!',
            'Settings Saved',
         //   'PrinterName saved',

        )
    }
    else {
        Swal.fire(
            'warning..!',
            'Please Enter PrinterName',

        )
    }


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


$.fn.ClearBill = function (view) {

    Swal.fire({
        title: 'Are you sure want to clear data ?',
        showCancelButton: true,
        allowOutsideClick: false,
        icon: 'question',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        width: 400,
        //height:50
    }).then((result) => {
        if (result.isConfirmed) {
            showLoading();
            BillingdbService.getDayEndApproveDetails(view).then((result) => {
                let DayEndApproveDetails = result;
                if (DayEndApproveDetails.length > 0) {
                    for (var i = 0; i < DayEndApproveDetails.length; i++) {
                        let item = {
                            "BillCounterId": DayEndApproveDetails[i].BillCounterId,
                            "CompanyId": DayEndApproveDetails[i].CompanyId,
                            "Saledate": DayEndApproveDetails[i].DayEndDate,
                            "POSId": DayEndApproveDetails[i].POSId,
                        };
                        BillingdbService.DeleteDayEndApproveAllDetails(item).then(async (res) => {
                            if (i == DayEndApproveDetails.length) {
                                Swal.fire({
                                    title: 'Clear Data Successfully',
                                    icon: 'success',
                                    confirmButtonColor: '#5cb85c',
                                    allowOutsideClick: false,
                                    confirmButtonText: 'ok'
                                })
                            }

                            //   console.log( 'DeleteDayEndApproveAllDetails ', res);
                            item = '';
                        }).catch(function (error) {
                            ErrorLog.writeLogFile('DeleteDayEndApproveAllDetails', error)
                            Swal.fire({
                                title: 'Clear Data invalid ' + error,
                                icon: 'error',
                                allowOutsideClick: false,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'OK'
                            })
                        });
                    }
                    //  Swal.close();
                    // Swal.fire({
                    //     title: 'Clear Data Successfully',
                    //     icon: 'success',
                    //     confirmButtonColor: '#5cb85c',
                    //     allowOutsideClick: false,
                    //     confirmButtonText: 'ok'
                    // })
                }
                else {
                    Swal.fire({
                        title: 'No More Day End Details!',
                        icon: 'warning',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'Ok',
                        // timer: 1500
                    })
                    // Swal.close();
                }
            }).catch(function (err) {
                ErrorLog.writeLogFile('getDayEndApproveDetails', err);
                Swal.fire({
                    title: 'Clear Data invalid ' + err,
                    icon: 'error',
                    allowOutsideClick: false,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                })
            });
        }
    })
}
