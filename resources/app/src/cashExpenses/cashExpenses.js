let { ipcRenderer } = require('electron');
let Swal = require('sweetalert2');
let Store = require('electron-store');
let BillingdbService = require('../database/billingdb');
const store = new Store();
const CustomValidators = require('../services/custom-validation')
const ErrorLog = require('../services/log');
const EncrDecrService = require('../services/encrypt-decrypt.service');
let date = new Date();
var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
var CashExpenses = [];
var CashExpForView = [];
let row = [];
let environment = require('../environment');
var BillCounterId = store.get('BillCounterId');
let todayDate = store.get('todayDate')
let loginId;
var POSId = environment.POSId;
CompanyId = environment.CompanyId;

let CurrentDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);

$(document).ready(function () {


    document.getElementById("datepicker").value = todayDate;

    loadCashExp()
});
$(function () {
    $("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd/mm/yy",
        onSelect: function (dateText) {
            var initialDate = dateText.split(/\//);
            let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))
            serverDate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
            CashExpForView = '';
            loadCashExp();

        }
    });
})

function loadCashExp() {

    let item = {
        SaleDate: serverDate,
        POSId: POSId,
        BillCounterId: BillCounterId,
        CompanyId: CompanyId
    }
    BillingdbService.LoadCashExp(item).then(
        (data) => {
            $('#product_list').empty();
            CashExpenses = [];
            CashExpForView = [];

            CashExpenses = data;

            if (CashExpenses.length > 0) {
                CashExpenses.forEach(row => {
                    CashExpForView += `<tr>
                  
                    <td style="font-size: 15px;">${parseFloat(row.Amount).toFixed(2)}</td>
                    <td style="font-size: 15;">${(row.Type)}</td>
                    <td style="font-size: 15;">${(row.Description)}</td> 
                  <td> <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditCashExp(${row.CashExpensesId})' ></span>
                  <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteCashExp(${row.CashExpensesId})'></span></td>
                                               
                </tr>`;
                    $('#product_list').html(CashExpForView);

                })
            }
            else {
                $('#product_list').empty();
            }


        },
        (error) => {
            ErrorLog.writeLogFile('loadCashExp', error)

        }
    )
}

$.fn.DeleteCashExp = function (CashExpensesId) {

    Swal.fire({
        title: 'Are you Sure to Delete the Cash Exp?',
        showCancelButton: true,
        icon: 'warning',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    }).then((result) => {
        if (result.isConfirmed) {

            BillingdbService.deleteCashExp(CashExpensesId).then((data) => {

                Swal.fire('Cash Exp Deleted!', '', 'success')
            },
                (error) => {
                    ErrorLog.writeLogFile('DeleteCashExp', error)
                })
            loadCashExp()

        }
        // else if (result.isDenied) {
        //   Swal.fire('Changes are not saved', '', 'info')
        // }
    })

}
$.fn.EditCashExp = function (CashExpensesId) {


    row = CashExpenses.filter(row => row.CashExpensesId == CashExpensesId);
    row[0].isNew = false;
    EnterCashExpInfo(row[0])
    if (row[0].Type == 'Cash In') {
        document.getElementById('CashIn').checked = true;
    }
    else {
        document.getElementById('CashOut').checked = true;
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

$.fn.openCashExpensesPopupWindow = function () {

    let row = {
        Amount: '',
        Description: '',
        isNew: true,
        Type: 'Cash In'
    }

    EnterCashExpInfo(row);
    document.getElementById('CashIn').checked = true
}



function EnterCashExpInfo(row) {
    Swal.fire({
        title: 'Cash Expenses',
        allowOutsideClick: false,
        showCancelButton: true,
        html: `
        
        <input type="radio" name="ExpenseType" id="CashIn" value="Cash In">
        <label for="CashIn">Cash In</label>
       <input type="radio" name="ExpenseType" id="CashOut" value="Cash Out">
       <label for="CashOut">Cash Out</label>
   <div></div>
       <br>
        <input type="text" name="" id="Amount" class="form-control" 
          value="${row.Amount}"  PlaceHolder="Enter Amount"    onkeydown="$(this).Validate(event)">
          
        <br>
    

 <textarea  placeholder="Enter Description" id="Description" maxlength="300" class="form-control" style="height:100px;">${row.Description}</textarea> `,


        //icon: 'question',
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            let Type;
            if (document.getElementById('CashIn').checked) {
                Type = document.getElementById('CashIn').value;
            }
            else {
                Type = document.getElementById('CashOut').value;
            }
            let date = new Date();
            let CurrentDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            if (store.get('IsOnline') == 'true') {
                loginId = EncrDecrService.decrypt(store.get('Ref'))
            }
            else {
                loginId = store.get('Ref')
            }
            let item = {
                "CashExpensesId": row.CashExpensesId,
                "SaleDate": CurrentDate,
                "Amt": document.getElementById('Amount').value,
                "Type": Type,
                "Desc": document.getElementById('Description').value.trim(),
                "BillCounterId": store.get('BillCounterId'),
                "POSId": environment.POSId,
                "CompanyId": environment.CompanyId,
                "Ref": loginId,
                "CreatedOn": CurrentDate + Time,
                "UpdatedOn": CurrentDate + Time,
            }

            if (item.Amt != '' && item.Desc != '') {
                if (row.isNew) {
                    BillingdbService.addCashExp(item).then(
                        (result) => {
                            CashExpenses = [];
                            Swal.fire('Cash Expenses Added!', '', 'success')
                            loadCashExp();
                        },
                        (error) => {
                            Swal.close();
                            ErrorLog.writeLogFile('addCashExp', error)
                        });
                }
                else {
                    BillingdbService.UpdateCashExp(item).then(
                        (result) => {
                            CashExpenses = [];
                            Swal.fire('Cash Expenses Updated!', '', 'success')
                            loadCashExp();
                        },
                        (error) => {
                            Swal.close();
                            ErrorLog.writeLogFile('UpdateCashExp', error)
                        });
                }
            }
            else {
                Swal.fire(
                    'warning..!',
                    'Please Enter Cash Expenses?',
                    'warning'
                ).then((result) => {
                    if (result.isConfirmed) {
                        EnterCashExpInfo(row);

                    }
                })
            }




        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
        }
    })

}
$.fn.Validate = function (event) {

    let Regex = /^\d{1,4}\.?\d{0,2}$/g;
    CustomValidators.ValidateDecimal(event, event.target, Regex);
}







