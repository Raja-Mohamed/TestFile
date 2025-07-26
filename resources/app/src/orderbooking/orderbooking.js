
const CustomValidators = require('../services/custom-validation')
var autocomplete = require('autocompleter');
let { ipcRenderer } = require('electron');
let Store = require('electron-store');
let printerService = require('../../src/services/printer-service')
let environment = require('../environment');
let BillingdbService = require('../database/billingdb')
const EncrDecrService = require('../services/encrypt-decrypt.service');
const store = new Store();
let Swal = require('sweetalert2');
let selectedItems = [];
let saveAndGenerate;
let nonSaleHeaderIds = [];
let selectedVessels = [];
let selectedPayment = [];
let VesselItemList = [];
let TempPaymentList = [];
let isNew = true;
let VehicleList = [];
let UpdatedBalance;
let PaymentList = [];
let complete;
let isCompleted
let IsCancelled;
const ErrorLog = require('../services/log');
let itemList = [];
let VesselsList = [];
let itemId, itemBrandId;
let CustomersList = [];
let TotalAmount;
let TotalGST;
let RoundOff;
let NetAmount;
let BalanceAmt;
let POSItemList = [];
let UOMname = '';
let tempItemList = [];
let tempVesselsList = [];
let selectedVesselsForView = '';
let selectedPaymentForView = '';
let ServiceTypeId;
let ServiceType;
let Advancechecked;
let loginId;
const BillNoDetails = [];
document.getElementById('POSName').innerHTML = environment.POSName;
let Cateringservicetype = store.get('CateringService')
if (Cateringservicetype.length != 0) {
     ServiceTypeId = Cateringservicetype[0].ServiceTypeId
     ServiceType = Cateringservicetype[0].ServiceType
} else {

}
let todayDate = store.get('todayDate')
document.getElementById('CashierName').innerHTML = store.get('DisplayName');
let OrderBookingHeaderId = store.get('OrderBookingHeaderId')
document.getElementById('billCounterName').innerHTML = store.get('BillCounterName');
let date = new Date();
var SelDeliverydate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
var VesselReturndate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
var input = document.getElementById("itemName");
var vesselinput = document.getElementById("VesselName");
let IsAllowNegativeRoundOff = store.get('IsAllowNegativeRoundOff');
//console.log("IsAllowNegativeRoundOff", IsAllowNegativeRoundOff)
document.getElementById('BulkOrderChanges').innerHTML = OrderBookingHeaderId ? "Update Order Booking" : "Add Order Booking";
$(document).ready(function () {
     debugger;

     isNew = OrderBookingHeaderId ? false : true;
     loadItemsForBillCounter();
     loadVesselsForBillCounter();
     displayDateTime();
     getVehicles();
     if (isNew) {
          //  console.log(isNew);
          document.getElementById("velReturndate").value = todayDate;
          document.getElementById("deliverydate").value = todayDate;
          document.getElementById('IsCompleted').disabled = true;
          document.getElementById('IsCreditBill').disabled = true;
          document.getElementById('IsComplimentaryBill').disabled = true;
          // document.getElementById('BillCompleted').disabled = true;
          document.getElementById('EstimationCompleted').disabled = true;
          document.getElementById('VessleReport').disabled = true;
          document.getElementById('PaymentCompleted').disabled = false;
          document.getElementById('deleteAllButton').disabled = false;
          loadItemsData(selectedItems);
          LoadVesselData(selectedVessels);

     }
     if (!isNew) {
          // console.log(!isNew);
          loadPOSItemsForUpdate();
          loadPaymentsForUpdate();
          loadCustomerDetailForUpdate();
          loadVesselItemsForUpdate();
     }

});

$(function () {
     $("#currentDate").datepicker({
          changeMonth: true,
          changeYear: true,
          dateFormat: "dd/mm/yy",
          minDate: new Date(),
          onSelect: function (dateText) {
               let initialDate = dateText.split(/\//);
               let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))
               currentDate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
          }
     });
})

$.fn.Cancel = function () {
     debugger
     store.set('isWindowOpen', false)
     window.close();
}

$(function () { // delivery time details
     var hr = 12;
     for (i = 0; i < hr; i++) {
          if (i < 10) {
               if (i == 0) {
                    $("#deliveryhours").append('<option value="12">12</option>');
               } else {
                    $("#deliveryhours").append('<option value="0' + i + '">0' + i + '</option>');
               }
          }
          else {
               $("#deliveryhours").append('<option value="' + i + '">' + i + '</option>');
          }
     }
     var mi = 60;
     for (i = 0; i < mi; i++) {
          if (i < 10) {
               $("#deliveryminutes").append('<option value="0' + i + '">0' + i + '</option>');
          }
          else {
               $("#deliveryminutes").append('<option value="' + i + '">' + i + '</option>');
          }
     }
     var ampm = ['AM', 'PM'];
     for (i = 0; i < ampm.length; i++) {
          $("#deliveryampm").append('<option value="' + ampm[i] + '">' + ampm[i] + '</option>');
     }

     $("#deliverydate").datepicker({
          changeMonth: true,
          changeYear: true,
          dateFormat: "dd/mm/yy",
          minDate: new Date(),
          onSelect: function (dateText) {
               let initialDate = dateText.split(/\//);
               let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))
               selecteddate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
          }
     });

     $("#velReturndate").datepicker({
          changeMonth: true,
          changeYear: true,
          dateFormat: "dd/mm/yy",
          minDate: new Date(),
          onSelect: function (dateText) {
               let initialDate = dateText.split(/\//);
               let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))
               selecteddate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
          }
     });
})

autocomplete({

     input: input,
     fetch: function (text, update) {
          text = text.toLowerCase();
          suggestions = tempItemList.filter(n => n.ItemName.toLowerCase().startsWith(text) || n.ItemCode.toLowerCase().trim().startsWith(text) || n.Barcode.toLowerCase().trim().includes(text))
          update(suggestions);
          suggestions = [];
     },
     onSelect: function (item) {
          UOMname = '';
          UOMname = item.UOM;
          input.value = item.ItemName;
          itemId = item.ItemId;
          itemBrandId = item.ItemBrandId;
          //event.preventDefault();
          $('#quantity').focus();
     },
})

autocomplete({

     input: vesselinput,
     fetch: function (text, update) {
          text = text.toLowerCase();
          suggestions = tempVesselsList.filter(n => n.ItemName.toLowerCase().startsWith(text))
          update(suggestions);
          suggestions = [];
     },
     onSelect: function (item) {

          vesselinput.value = item.ItemName;
          itemId = item.ItemId;
          itemBrandId = item.ItemBrandId;

     },
})

function loadVesselItemsForUpdate() {
     debugger;
     //    if (selectedVessels.length == 0) {
     //      document.getElementById('VessleReport').disabled = true;
     // } 

     let Item = {
          "OrderBookingHeaderId": store.get('OrderBookingHeaderId')
     }

     $.post(environment.apiURL + '/GetBulkOrderBookingVessels', Item, function (data) {
          let res = JSON.parse(data);
          debugger
          if (res.Status == "valid") {
               debugger
               VesselItemList = res.Data;
               // debugger
               // if (VesselItemList.length == 0) {
               //      document.getElementById('VessleReport').disabled = true;
               // } else {
               //      document.getElementById('VessleReport').disabled = false;
               // }
               // debugger
               AddVesselListForUpdate(VesselItemList)
               ErrorLog.writeLogFile('GetBulkOrderBookingVessels', res.Status)

          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetBulkOrderBookingVessels', res.Error)

               Swal.fire({
                    title: 'GetBulkOrderBookingVessels Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetBulkOrderBookingVessels', err)

          Swal.fire({
               title: 'GetBulkOrderBookingVessels Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })

}

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

function LoadVesselData(selectedVessels) {
     debugger;
     selectedVesselsForView = '';
     debugger
     let ItemsForLoadVesselData = selectedVessels;
     debugger
     if (selectedVessels.length > 0) {
          debugger
          // document.getElementById('VessleReport').disabled = TotalItems != 0 ? false : true;
          selectedVessels.forEach(row => {
               selectedVesselsForView +=
                    `<tr>
                         <td>
                         <button style="font-size: 20px;" class="btn btn-danger btn-xs" id="item-delete"   onclick="$(this).delete(${row.RowId})"><i
                         class="fa fa-times"></i></button></td>   
                         <td style="font-size: 20px;">${row.ItemName}</td>
                         <td style="font-size: 20px;"><input type="text" id="Quantity_${row.RowId}" value="${row.Quantity}" onkeyup="updateQuantity(${row.RowId})"  onkeydown="validatenumber(event)"  style="background-color:transparent; outline:0; border-width: 0 0 1px; border-color: darkgray; width: 80px; font-size: unset;"></td>   
                         <td style="font-size: 20px;"><input type="text" id="QuantityReturned_${row.RowId}" value="${row.QuantityReturned}"  onkeyup="updateReturned(${row.RowId})"  onkeydown="validatenumber(event)"  style="background-color:transparent; outline:0; border-width: 0 0 1px; border-color: darkgray; width: 80px; font-size: unset;"></td> 
                    </tr>`;
               $('#vessel_list').html(selectedVesselsForView);

          })
     }
     else {
          debugger
          // document.getElementById('VessleReport').disabled = TotalItems != 0 ? false : true;
          $('#vessel_list').empty();
     }


     setTimeout(() => {
          debugger
          if (document.getElementById('IsTypeCancel').innerHTML == "Cancelled Bill") {
               document.getElementById('VessleReport').disabled = true;
          } else {
               if (selectedVessels.length == 0 || isNew) {
                    document.getElementById('VessleReport').disabled = true;
               } else {
                    document.getElementById('VessleReport').disabled = false;
               }
          }
     }, 100);



     debugger
     TotalVessels = ItemsForLoadVesselData.length;
     document.getElementById('TotalVessels').innerHTML = TotalVessels;
}

function validatenumber(event) {
     let length = 5;
     CustomValidators.ValidateNumber(event, event.target, length);
}
$.fn.delete = function (rowId) {


     let indexOfDelete = selectedVessels.findIndex(row => row.RowId == rowId);
     selectedVessels.splice(indexOfDelete, 1);
     debugger;
     LoadVesselData(selectedVessels);
}

$("#VesselName").keydown(function (e) {
     // console.log(e);
     if (e.which == 13) {
          if (document.getElementById("VesselName").value == '') {
               // Swal.fire({
               //      title: 'Warning..!',
               //      text: "Please enter VesselItems",
               //      icon: 'warning',
               //      showCancelButton: false,
               //      confirmButtonText: 'Ok',
               //      timer:2000

               // })
          } else {
               AddVesselList();

          }
     }


})




var AddVesselList = $.fn.AddVesselList = function () {
     AddVesselsList();
}
function AddVesselsList() {


     if (document.getElementById("VesselName").value == '') {
          Swal.fire({
               title: 'Warning..!',
               text: "Please enter VesselItems",
               icon: 'warning',
               showCancelButton: false,
               confirmButtonText: 'Ok'
          })
     }
     else {
          let selectedVessel = VesselsList.filter(row => row.ItemId == itemId && row.ItemBrandId == itemBrandId && itemId != 0);
          let rowId = selectedVessels.length > 0 ? selectedVessels[selectedVessels.length - 1].RowId + 1 : 1;
          selectedVessels.push({

               RowId: rowId,
               OrderBookingVesselsId: 0,
               ItemId: selectedVessel[0].ItemId,
               //ServiceType: serviceName,
               ItemBrandId: selectedVessel[0].ItemBrandId,
               ItemName: selectedVessel[0].ItemName,
               Quantity: 0,
               QuantityReturned: 0,
          });


          LoadVesselData(selectedVessels);
          // if (selectedVessel.length > 0) {
          //      document.getElementById('VessleReport').disabled = false;
          // } else {
          //      document.getElementById('VessleReport').disabled = true;
          // }
          $('#VesselName').val('');
          selectedVessel = [];
          $('#VesselName').focus();
          itemId = 0;
          itemBrandId = 0;
     }
}


document.onkeyup = function (e) {
     if (e.which == 112) {
          $('#itemName').focus();
     } else {
          return;
     }
};


function AddVesselListForUpdate(selectedVessel) {
     debugger;
     if (selectedVessels.length == 0) {
          document.getElementById('VessleReport').disabled = true;
     } else {
          document.getElementById('VessleReport').disabled = false;
     }
     //let rowId = selectedVessels.length > 0 ? selectedVessels[selectedVessels.length - 1].RowId + 1 : 1;
     //let rowId=1;
     for (var i = 0; i < selectedVessel.length; i++) {
          selectedVessels.push({
               RowId: i + 1,
               OrderBookingVesselsId: selectedVessel[i].OrderBookingVesselsId,
               ItemId: selectedVessel[i].ItemId,
               //ServiceType: serviceName,
               ItemBrandId: selectedVessel[i].ItemBrandId,
               ItemName: selectedVessel[i].ItemName,
               Quantity: isNew == true ? 0 : selectedVessel[i].Quantity,
               QuantityReturned: isNew == true ? 0 : selectedVessel[i].QuantityReturned,
          });
     }


     LoadVesselData(selectedVessels);
     // if (selectedVessel.length > 0) {
     //      document.getElementById('VessleReport').disabled = false;
     // } else {
     //      document.getElementById('VessleReport').disabled = true;
     // }
     $('#VesselName').val('');
     selectedVessel = [];
     $('#VesselName').focus();
     itemId = 0;
     itemBrandId = 0;
     //  }
}

function updateQuantity(RowId) {
     // console.log("updateQuantity")
     let ind = selectedVessels.findIndex(x => x.RowId == RowId)
     debugger;
     let UpdatedQuantity = parseFloat(document.getElementById("Quantity_" + RowId).value);
     selectedVessels[ind]['Quantity'] = isNaN(UpdatedQuantity) ? 0 : UpdatedQuantity;
}

function updateReturned(RowId) {
     let ind = selectedVessels.findIndex(x => x.RowId == RowId)
     let ReturnedQuantity = parseFloat(document.getElementById("QuantityReturned_" + RowId).value);
     selectedVessels[ind]['QuantityReturned'] = isNaN(ReturnedQuantity) ? 0 : ReturnedQuantity;


}

function loadPaymentsForUpdate() {

     debugger;
     let Item = {
          "OrderBookingHeaderId": store.get("OrderBookingHeaderId")
     }

     $.post(environment.apiURL + '/GetBulkOrderBookingPayments', Item, function (data) {
          debugger
          let res = JSON.parse(data);
          if (res.Status == "valid") {
               debugger
               PaymentList = res.Data;
               AddPaymentDataForUpdate(PaymentList)
               ErrorLog.writeLogFile('GetBulkOrderBookingPayments', res.Status)
          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetBulkOrderBookingPayments', res.Error)
               Swal.fire({
                    title: 'GetBulkOrderBookingPayments Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetBulkOrderBookingPayments', err)

          Swal.fire({
               title: 'GetBulkOrderBookingPayments Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })


}

$.fn.AddPaymentList = function () {
     AddPaymentList();
}

function AddPaymentList() {
     debugger;
     // let curdate=todayDate;
     //var curdate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
     //document.getElementById("AmountReceived").innerHTML = '';
     UpdatedBalance = document.getElementById("BalanceAmt").innerHTML;
     let totalnetAmount = document.getElementById("netAmount").innerHTML;
     //  document.getElementById('checkAdvance').disabled = checked==true
     Swal.fire({
          title: 'Add Payment',
          allowOutsideClick: false,
          showCancelButton: true,
          width: 550,
          html: `<div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">
                         <div class="col-xs-4">
                              <label>Payment Date</label>
                         </div>
                         <div class="col-xs-4">
                              <input id="datepicker" >
                         </div>
                         </div>
    
                         <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">
                         <div class="col-xs-4">
                              <label>Total Amount</label>
                         </div>
                         <div class="col-xs-4"  >
                              <label id="totalAmt">${totalnetAmount}</label>
                         </div>
                    </div>
                    <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">
                         <div class="col-xs-4">
                              <label>Amount Due</label>
                         </div>
                         <div class="col-xs-4">
                              <label id="AmountDue">${UpdatedBalance}</label>
                         </div>
                    </div>
                    <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">
                    <div class="col-xs-4">
                         <label>Cash</label>
                    </div>
                    <div class="col-xs-4">
                         <input type="number" min="0"  id="CashAmount" size="10" oninput="this.value = 
                         !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null"  onkeyup="$(this).calculateAmount(UpdatedBalance)">
                    </div>
                         </div>
                         <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">
                         <div class="col-xs-4">
                              <label>Card</label>
                         </div>
                         <div class="col-xs-4">
                              <input type="number" min="0"  id="CardAmount" size="10" oninput="this.value = 
                              !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null" onkeyup="$(this).calculateAmount(UpdatedBalance)">
                         </div>
                    </div>
        
                    <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">
                    <div class="col-xs-4">
                         <label>Online</label>
                    </div>
                    <div class="col-xs-4">
                         <input type="number" min="0"  id="OnlineAmount" size="10" oninput="this.value = 
                         !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null"  onkeyup="$(this).calculateAmount(UpdatedBalance)">
                    </div>
               </div>
             
        
               <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">

               <div class="col-xs-4">
                    <label>Amount Paid</label>
               </div>
               <div class="col-xs-6">

                    <label id="AmountPaid">0.00</label>
                    <input type="Checkbox" name="Advance"  id="checkAdvance" style="margin-left:10px;">
                    <label for="checkAdvance">Advance</label>

               </div>
          </div>
          <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">

          <div class="col-xs-4">
               <label>Balance</label>
          </div>
          <div class="col-xs-4">
               <label id="Balance">0.00</label>
          </div>
               </div>
                              
               <div class="container" style="font-size: 20px;margin-top:10px;text-align:left;">

               <div class="col-xs-4">
                    <label>Notes</label>
               </div>
               <div class="col-xs-4">
                    <textarea id="Notes" rows="3" cols="28"></textarea>
               </div>
          </div>`,


          //icon: 'question',
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',

     }).then((result) => {
          if (result.isConfirmed) {
               debugger
               let Type = $("#checkAdvance").is(":checked");




               debugger
               // let PaymentList;
               let card = document.getElementById("CardAmount").value
               let online = document.getElementById("OnlineAmount").value
               let cash = document.getElementById("CashAmount").value

               let AmountPaid1 = document.getElementById("AmountPaid").innerHTML;
               debugger
               if (parseInt(AmountPaid1) > parseInt(UpdatedBalance)) {
                    Swal.fire({
                         title: 'Incorrect card /online payment. Please verify insufficient Cash',
                         icon: 'error',
                         confirmButtonColor: '#d33',
                         cancelButtonColor: '#3085d6',
                         confirmButtonText: 'OK'
                    }).then((res) => {

                         AddPaymentList();

                    });
               } else if (parseInt(AmountPaid1) == 0) {
                    Swal.fire({
                         title: 'Please Enter the Amount',
                         icon: 'error',
                         confirmButtonColor: '#d33',
                         cancelButtonColor: '#3085d6',
                         confirmButtonText: 'OK'
                    }).then((res) => {

                         AddPaymentList();

                    });

               }


               if (+cash != 0 && +card == 0 && +online == 0) {
                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         CashAmount: document.getElementById("CashAmount").value,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CardAmount: 0,
                         OnlineAmount: 0,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }
               }
               else if (+card != 0 && +cash == 0 && +online == 0) {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: 0,
                         CardAmount: document.getElementById("CardAmount").value,
                         OnlineAmount: 0,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }

               else if (+card == 0 && +cash == 0 && +online != 0) {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         //IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: 0,
                         CardAmount: 0,
                         OnlineAmount: document.getElementById("OnlineAmount").value,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }


               else if (+card != 0 && +cash != 0 && +online != 0) {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: document.getElementById("CashAmount").value,
                         CardAmount: document.getElementById("CardAmount").value,
                         OnlineAmount: document.getElementById("OnlineAmount").value,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }

               else if (+card != 0 && +cash == 0 && +online != 0) {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: 0,
                         CardAmount: document.getElementById("CardAmount").value,
                         OnlineAmount: document.getElementById("OnlineAmount").value,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }

               else if (+card != 0 && +cash != 0 && +online == 0) {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: document.getElementById("CashAmount").value,
                         CardAmount: document.getElementById("CardAmount").value,
                         OnlineAmount: 0,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }

               else if (+card == 0 && +cash != 0 && +online != 0) {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: document.getElementById("CashAmount").value,
                         CardAmount: 0,
                         OnlineAmount: document.getElementById("OnlineAmount").value,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }

               else {

                    PaymentList =
                    {

                         PaidAmount: document.getElementById("AmountPaid").innerHTML,
                         PaymentDate: document.getElementById("datepicker").value,
                         Type: Type,
                         // IsCompleted:document.getElementById("checkAdvance").checked,
                         IsCompleted: document.getElementById("IsCompleted").value,
                         CashAmount: 0,
                         CardAmount: 0,
                         OnlineAmount: 0,
                         Notes: document.getElementById("Notes").value.trim(),
                         Balance: document.getElementById("Balance").innerHTML
                    }

               }




               AddPaymentData(PaymentList);
          }


     })


     document.getElementById("datepicker").value = todayDate;
     $("#datepicker").datepicker({
          changeMonth: true,
          changeYear: true,
          dateFormat: "dd/mm/yy",
          minDate: new Date(),
          onSelect: function (dateText) {
               let initialDate = dateText.split(/\//);
               let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))
               selecteddate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);


          }
     });


}

$("#CashAmount").keydown(function (event) {
     debugger
     let Regex = /^\d{0,3}\.?\d{0,2}$/g;
     CustomValidators.ValidateDecimal(event, event.target, Regex);
});

$("#CardAmount").keydown(function (event) {
     debugger
     let Regex = /^\d{0,3}\.?\d{0,2}$/g;
     CustomValidators.ValidateDecimal(event, event.target, Regex);
});

$("#OnlineAmount").keydown(function (event) {
     debugger
     let Regex = /^\d{0,3}\.?\d{0,2}$/g;
     CustomValidators.ValidateDecimal(event, event.target, Regex);
});


function AddPaymentData(PaymentList) {


     let rowId = selectedPayment.length > 0 ? selectedPayment[selectedPayment.length - 1].RowId + 1 : 1;
     let splitDate = PaymentList.PaymentDate.split("/")
     let joinDate = splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0]
     //this.complete=PaymentList.IsConfirmed
     // if(PaymentList.IsConfirmed=="on"){
     //     return PaymentList.IsConfirmed=true ;
     //   }else{
     //      PaymentList.IsConfirmed= false;
     //   }
     // let change  =PaymentList.IsConfirmed=="on"?true:false;
     debugger;
     selectedPayment.push({

          RowId: rowId,
          OrderBookingPaymentId: 0,
          PaymentDate: joinDate,
          PaidAmount: PaymentList.PaidAmount,
          IsCompleted: PaymentList.IsCompleted,
          IsAdvance: PaymentList.Type,
          CashAmount: PaymentList.CashAmount,
          CardAmount: PaymentList.CardAmount,
          OnlineAmount: PaymentList.OnlineAmount,
          Notes: PaymentList.Notes,
          Balance: PaymentList.Balance

     });


     // let selecteddata = selectedPayment.filter(x => x.IsAdvance == 1)
     // debugger
     // if (selecteddata.length > 1) {

     //      Swal.fire({
     //           title: 'Advance was already given',
     //           icon: 'error',
     //           confirmButtonColor: '#d33',
     //           cancelButtonColor: '#3085d6',
     //           allowEscapeKey: false,
     //           allowOutsideClick: false,
     //           confirmButtonText: 'OK'
     //      }).then((res) => {

     //           var RowId = selecteddata.map(({ RowId }) => ({ RowId }))
     //           for (let i = 0; i < 1; i++) {

     //                selectedPayment = selectedPayment.filter(x => x.RowId != RowId[1].RowId)

     //           }
     //AddPaymentList();

     //      });


     // } else {
     LoadPaymentData(selectedPayment);

     UpdateAmtReceived(selectedPayment);
     // }


}
function AddPaymentDataForUpdate(PaymentList) {
     debugger;
     selectedPayment = [];
     //let rowId = selectedPayment.length > 0 ? selectedPayment[selectedPayment.length - 1].RowId + 1 : 1;
     for (var j = 0; j < PaymentList.length; j++) {
          debugger
          let splitDate = PaymentList[j].PaymentDate.split("/")
          let joinDate = splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0]
          selectedPayment.push({
               RowId: j + 1,
               OrderBookingPaymentId: PaymentList[j].OrderBookingPaymentId,
               PaymentDate: joinDate,
               PaidAmount: PaymentList[j].PaidAmount,
               IsAdvance: PaymentList[j].IsAdvance,
               CashAmount: PaymentList[j].CashAmount,
               CardAmount: PaymentList[j].CardAmount,
               OnlineAmount: PaymentList[j].OnlineAmount,
               Notes: PaymentList[j].Notes,
               Balance: PaymentList[j].Balance,
               IsCompleted: PaymentList[j].IsCompleted
          });
     }
     UpdateAmtReceived(selectedPayment);
     LoadPaymentData(selectedPayment);
}

function UpdateAmtReceived(selectedPayment) {
     debugger;
     m = 0;
     let UpdatedAmt = 0;
     if (selectedPayment.length > 0) {
          for (var n = 0; n < selectedPayment.length; n++) {
               debugger
               UpdatedAmt = m + +selectedPayment[n].PaidAmount;
               m = UpdatedAmt;
          }
     }
     debugger
     let netAmount = document.getElementById("netAmount").innerHTML;
     document.getElementById("AmountReceived").innerHTML = parseFloat(UpdatedAmt).toFixed(2);
     let Balance = netAmount - UpdatedAmt;
     document.getElementById("BalanceAmt").innerHTML = parseFloat(Balance).toFixed(2);

     // Check for add payment disabled
     debugger
     let chAmountReceived = document.getElementById("AmountReceived").innerHTML;
     debugger

     if (parseInt(netAmount) == parseInt(chAmountReceived)) {
          debugger
          document.getElementById('PaymentCompleted').disabled = true;
          //  document.getElementById('deleteAllButton').disabled = true;
          // document.getElementById('BillCompleted').disabled = true;
     }
     else {
          debugger
          document.getElementById('PaymentCompleted').disabled = false;
          // document.getElementById('deleteAllButton').disabled = false;
          // document.getElementById('BillCompleted').disabled = false;
     }
}

function LoadPaymentData(selectedPayment) {
     Advancechecked = selectedPayment
     debugger
     selectedPaymentForView = '';
     debugger
     TempPaymentList = selectedPayment;

     if (TempPaymentList.length > 0) {
          debugger;
          TempPaymentList.forEach(row => {
               let tempDate = row.PaymentDate;
               debugger;
               row.PaidAmount = parseFloat(row.PaidAmount).toFixed(2);
               row.CashAmount = parseFloat(row.CashAmount).toFixed(2);
               row.CardAmount = parseFloat(row.CardAmount).toFixed(2);
               row.OnlineAmount = parseFloat(row.OnlineAmount).toFixed(2);
               debugger
               let splitDate = tempDate.split("/")
               let joinDate = splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0]
               if (row.IsAdvance == 0 && row.IsCompleted == 0) {
                    debugger;
                    selectedPaymentForView += `<tr>
                         <td><button style="font-size: 15px;"  class="btn btn-danger btn-xs"  onclick="$(this).deletePaymentRow(${row.RowId})">
                              <i class="fa fa-times" ></i></button>
                         </td>
                         <td style="font-size: 16px;">  <label >${joinDate}</label></td>  
                         <td style="font-size: 20px;">${row.PaidAmount}</td>
                         <td style="font-size: 17px;">${row.CashAmount}</td>
                         <td style="font-size: 17px;">${row.CardAmount}</td>
                         <td style="font-size: 17px;">${row.OnlineAmount}</td>
                         <td style="font-size: 23px;"><input type="checkbox"  disabled  ></td>  
                         <td style="font-size: 23px;">${row.Notes}</td>       
                    </tr>`;
                    $('#payment_list').html(selectedPaymentForView);

               } else if (row.IsAdvance == 0 && row.IsCompleted == 1) {
                    debugger
                    selectedPaymentForView += `<tr>
                         <td>
                              <button style="font-size: 15px;"  disabled  class="btn btn-danger btn-xs" onclick="$(this).deletePaymentRow(${row.RowId})">
                                   <i class="fa fa-times" ></i>
                              </button>
                         </td>
                         <td style="font-size: 16px;">  <label >${joinDate}</label></td>  
                         <td style="font-size: 20px;">${row.PaidAmount}</td>
                         <td style="font-size: 17px;">${row.CashAmount}</td>
                         <td style="font-size: 17px;">${row.CardAmount}</td>
                         <td style="font-size: 17px;">${row.OnlineAmount}</td>
                         <td style="font-size: 23px;"><input type="checkbox"  disabled> </td>  
                         <td style="font-size: 23px;">${row.Notes}</td>       
                    </tr>`;
                    $('#payment_list').html(selectedPaymentForView);

               } else if (row.IsAdvance == 1 && row.IsCompleted == 0) {
                    debugger
                    selectedPaymentForView += `<tr>
                         <td>
                              <button style="font-size: 15px;" class="btn btn-danger btn-xs" onclick="$(this).deletePaymentRow(${row.RowId})">
                                   <i class="fa fa-times" ></i>
                              </button>
                         </td>
                         <td style="font-size: 16px;">  <label >${joinDate}</label></td>  
                         <td style="font-size: 20px;">${row.PaidAmount}</td>
                         <td style="font-size: 17px;">${row.CashAmount}</td>
                         <td style="font-size: 17px;">${row.CardAmount}</td>
                         <td style="font-size: 17px;">${row.OnlineAmount}</td>
                         <td style="font-size: 23px;"><input type="checkbox"  checked  disabled></td>  
                         <td style="font-size: 23px;">${row.Notes}</td>       
                    </tr>`;

                    $('#payment_list').html(selectedPaymentForView);
               }
               else if (row.IsAdvance == 1 && row.IsCompleted == 1) {
                    debugger
                    selectedPaymentForView += `<tr>
                         <td>
                              <button style="font-size: 15px;"   disabled     class="btn btn-danger btn-xs"   onclick="$(this).deletePaymentRow(${row.RowId})">
                                   <i class="fa fa-times" ></i>
                              </button>
                         </td>
                         <td style="font-size: 16px;">  <label >${joinDate}</label></td>  
                         <td style="font-size: 20px;">${row.PaidAmount}</td>
                         <td style="font-size: 17px;">${row.CashAmount}</td>
                         <td style="font-size: 17px;">${row.CardAmount}</td>
                         <td style="font-size: 17px;">${row.OnlineAmount}</td>
                         <td style="font-size: 23px;"><input type="checkbox"  checked  disabled></td>  
                         <td style="font-size: 23px;">${row.Notes}</td>       
                    </tr>`;
                    $('#payment_list').html(selectedPaymentForView);
               }
               else {
                    debugger
                    selectedPaymentForView += `<tr>
                         <td>
                              <button style="font-size: 15px;" class="btn btn-danger btn-xs"  onclick="$(this).deletePaymentRow(${row.RowId})">
                              <i class="fa fa-times" ></i></button>
                         </td>
                         <td style="font-size: 11px;"> <label >${joinDate}</label></td>  
                         <td style="font-size: 20px;">${row.PaidAmount}</td>
                         <td style="font-size: 17px;">${row.CashAmount}</td>
                         <td style="font-size: 17px;">${row.CardAmount}</td>
                         <td style="font-size: 17px;">${row.OnlineAmount}</td>
                         <td style="font-size: 23px;"><input type="checkbox" disabled  ></td>  
                         <td style="font-size: 23px;">${row.Notes}</td>       
                    </tr>`;
                    $('#payment_list').html(selectedPaymentForView);
               }
          })
     }

     else {
          $('#payment_list').empty();
     }
}


$.fn.deletePaymentRow = function (rowId) {

     debugger;
     let indexOfDelete = selectedPayment.findIndex(row => row.RowId == rowId);
     selectedPayment.splice(indexOfDelete, 1);
     LoadPaymentData(selectedPayment);
     UpdateAmtReceived(selectedPayment);
}

$.fn.calculateAmount = function (UpdatedBalance) {
     debugger;
     let cash = document.getElementById("CashAmount").value
     let card = document.getElementById("CardAmount").value
     let online = document.getElementById("OnlineAmount").value
     let Amount = document.getElementById("totalAmt").innerHTML;
     let AmountPaid = +cash + +card + +online;
     document.getElementById("AmountPaid").innerHTML = AmountPaid.toFixed(2)

     if (AmountPaid >= UpdatedBalance) {
          debugger;
          document.getElementById("Balance").innerHTML = 0.00;
          // document.getElementById("PaymentCompleted").disabled=true;
     }
     else {
          debugger;
          let Balance = UpdatedBalance - AmountPaid;
          document.getElementById("Balance").innerHTML = Balance.toFixed(2);
          // document.getElementById("PaymentCompleted").disabled=false;
     }
}

function displayDateTime() {
     myInterval = setInterval(function () {
          var date = new Date();
          var ampm = date.getHours() >= 12 ? ' PM' : ' AM';
          var dateString = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          store.set('todayDate', dateString)
          dateString = dateString + " - " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;
          document.getElementById('currentDateTime').innerHTML = dateString;
     }, 1000);
}

function loadItemsForBillCounter() {

     let Item = {
          "BillCounterId": store.get('BillCounterId')
     }

     $.post(environment.apiURL + '/GetCateringItemDetails', Item, function (data) {
          let res = JSON.parse(data);
          if (res.Status == "valid") {
               itemList = res.Data[0];
               tempItemList = itemList;
               ErrorLog.writeLogFile('GetCateringItemDetails', res.Status)

          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetCateringItemDetails', res.Error)

               Swal.fire({
                    title: 'GetCateringItemDetails Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetCateringItemDetails', err)

          Swal.fire({
               title: 'GetCateringItemDetails Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })

}

function loadVesselsForBillCounter() {

     let Item = {
          "BillCounterId": store.get('BillCounterId')
     }

     $.post(environment.apiURL + '/GetCateringVesselDetails', Item, function (data) {

          let res = JSON.parse(data);
          if (res.Status == "valid") {
               VesselsList = res.Data;
               tempVesselsList = VesselsList;
               ErrorLog.writeLogFile('GetCateringVesselDetails', res.Status)

          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetCateringVesselDetails', res.Error)

               Swal.fire({
                    title: 'GetCateringVesselDetails Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetCateringVesselDetails', err)

          Swal.fire({
               title: 'GetCateringVesselDetails Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })


}

function loadCustomerDetailForUpdate() {

     let Item = {
          "OrderBookingHeaderId": store.get('OrderBookingHeaderId')
     }

     $.post(environment.apiURL + '/GetBulkOrderBookingCustomerDetail', Item, function (data) {
          let res = JSON.parse(data);
          if (res.Status == "valid") {
               debugger
               CustomersList = res.Data;
               let VehicleName = CustomersList[0].VehicleId
               debugger
               let DeliveryTime = CustomersList[0].DeliveryTime;
               let TimeArray = DeliveryTime.split(':');
               document.getElementById('deliveryhours').value = TimeArray[0];
               document.getElementById('deliveryminutes').value = TimeArray[1].slice(0, 2);
               document.getElementById('deliveryampm').value = TimeArray[1].slice(3);
               document.getElementById('deliverydate').value = CustomersList[0].DeliveryDate;
               document.getElementById('velReturndate').value = CustomersList[0].VessleReturnDate;
               document.getElementById('Address').value = CustomersList[0].Address;
               document.getElementById('BulkOrderNotes').value = CustomersList[0].Notes;
               document.getElementById('refno').value = CustomersList[0].RefNo;
               document.getElementById('customerName').value = CustomersList[0].CustomerName;
               document.getElementById('phoneNumber').value = CustomersList[0].PhoneNo;
               document.getElementById('gst').value = CustomersList[0].GSTNo;
               document.getElementById('inCharge').value = CustomersList[0].DeliveryInCharge;
               document.getElementById('BookingNo').innerHTML = CustomersList[0].OrderBookingNo;
               setTimeout(function () {
                    $("#Vehicle").val(VehicleName)
               }, 100)
               // document.getElementById('Vehicle').value =CustomersList[0].VehicleName;
               ErrorLog.writeLogFile('GetBulkOrderBookingCustomerDetail', res.Status)
               isCompleted = CustomersList[0].IsCompleted;
               let IsComplimentary = CustomersList[0].IsComplimentary;
               let IsCreditBill = CustomersList[0].IsCreditBill;
               IsCancelled = CustomersList[0].IsCancelled;
               // console.log('CustomersList',CustomersList);
               debugger;
               if (isCompleted == 1) {
                    document.getElementById('itemName').disabled = true;
                    document.getElementById('quantity').disabled = true;
                    debugger;
                    document.getElementById('IsCompleted').disabled = true;
                    document.getElementById('IsCreditBill').disabled = true;
                    document.getElementById('IsComplimentaryBill').disabled = true;
                    //document.getElementById('BillCompleted').disabled = true;
                    document.getElementById('EstimationCompleted').disabled = false;
                    document.getElementById('VessleReport').disabled = true;
                    document.getElementById('PaymentCompleted').disabled = true;
                    document.getElementById('deleteAllButton').disabled = true;
                    if (IsComplimentary == 1) {
                         document.getElementById('IsType').innerHTML = ' Complimentary Bill ';
                         document.getElementById('BalanceAmt').innerHTML = '0.00';
                    } else if (IsCreditBill == 1) {
                         document.getElementById('IsType').innerHTML = ' Credit Bill ';
                         document.getElementById('BalanceAmt').innerHTML = '0.00';
                    } else {
                         document.getElementById('IsType').innerHTML = ' Cash Bill ';
                         document.getElementById('BalanceAmt').innerHTML = '0.00';
                    }
                    // document.getElementById('product-delete').disabled = true;
                    //  document.getElementById('deletecompleted').disabled = true;
                    // document.getElementById('payment-delete').disabled =true;
               }
               else if (IsCancelled == 1) {
                    document.getElementById('itemName').disabled = true;
                    document.getElementById('quantity').disabled = true;
                    document.getElementById('VesselName').disabled = true;
                    document.getElementById('IsCompleted').disabled = true;
                    document.getElementById('IsCreditBill').disabled = true;
                    document.getElementById('IsComplimentaryBill').disabled = true;
                    document.getElementById('IsTypeCancel').innerHTML = 'Cancelled Bill';
                    document.getElementById('SaveData').disabled = true;
                    document.getElementById('PaymentCompleted').disabled = true;
                    document.getElementById('EstimationCompleted').disabled = false;
                    document.getElementById('VessleReport').disabled = true;
                    document.getElementById('PaymentCompleted').disabled = true;
                    document.getElementById('deleteAllButton').disabled = true;
               }
               else {
                    document.getElementById('IsCompleted').disabled = false;
                    document.getElementById('IsCreditBill').disabled = false;
                    document.getElementById('IsComplimentaryBill').disabled = false;
                    document.getElementById('IsType').innerHTML = ' Unpaid Bill ';
                    // document.getElementById('BalanceAmt').innerHTML ='0.00';
                    // document.getElementById('BillCompleted').disabled = false;
                    document.getElementById('EstimationCompleted').disabled = false;
                    document.getElementById('VessleReport').disabled = false;
                    document.getElementById('PaymentCompleted').disabled = false;
                    document.getElementById('deleteAllButton').disabled = false;
                    //  document.getElementById('product-delete').disabled = false;
                    // document.getElementById('deletecompleted').disabled = false;
                    // document.getElementById('payment-delete').disabled =false;
               }
          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetBulkOrderBookingCustomerDetail', res.Error)

               Swal.fire({
                    title: 'GetBulkOrderBookingCustomerDetail Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetBulkOrderBookingCustomerDetail', err)

          Swal.fire({
               title: 'GetBulkOrderBookingCustomerDetail Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })
}


function loadPOSItemsForUpdate() {

     let Item = {
          "OrderBookingHeaderId": store.get('OrderBookingHeaderId')
     }

     $.post(environment.apiURL + '/GetBulkOrderBookingDetail', Item, function (data) {
          let res = JSON.parse(data);
          if (res.Status == "valid") {
               POSItemList = res.Data;
               AddItemIntoListForUpdate(POSItemList)
               ErrorLog.writeLogFile('GetBulkOrderBookingDetail', res.Status)
          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetBulkOrderBookingDetail', res.Error)

               Swal.fire({
                    title: 'GetBulkOrderBookingDetail Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetBulkOrderBookingDetail', err)

          Swal.fire({
               title: 'GetBulkOrderBookingDetail Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })

}


$("#itemName").keydown(function (e) {
     if (e.which == 13) {
          $('#quantity').focus();
     }
});

$("#quantity").keydown(function (event) {
     if (UOMname == "LTR" || UOMname == "KG") {
          let Regex = /^\d{0,3}\.?\d{0,3}$/g;
          CustomValidators.ValidateDecimal(event, event.target, Regex);
     }
     else {
          let Regex = /^\d{0,3}\d{0,3}$/g;
          CustomValidators.ValidateDecimal(event, event.target, Regex);
     }


});

$("#quantity").keydown(function (e) {
     if (e.which == 13) {

          e.preventDefault();
          let quantity = e.target.value;
          if (quantity != '' && quantity != '.' && quantity != 0) {

               selectedItem = tempItemList.filter(row => row.ItemId == itemId && row.ItemBrandId == itemBrandId && itemId != 0);
               if (selectedItem.length > 0) {
                    // let rowId = Math.max.apply(Math, selectedItems.map(function (obj) { return obj.RowId; })) + 1
                    if (selectedItem[0].Rate == 0) {
                         Swal.fire({
                              title: 'Are you sure?',
                              text: "Rate Value is 0.Do you want to continue",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'Yes'
                         }).then((result) => {
                              if (result.value) {
                                   // AddItemIntoList(selectedItem);
                              }
                         });
                    }
                    else {
                         AddItemIntoList(selectedItem);
                    }
               }
          }
          else {
               Swal.fire({
                    title: 'Warning..!',
                    text: "Not Enter 0 Quantity ! Please enter Quantity",
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
               })

          }


     }


});

$("#BulkOrderNotes").keydown(function (event) {
     let BulkOrderNotes = $('#BulkOrderNotes').val().trim();
     if (BulkOrderNotes.length > 399) {
          Swal.fire({
               title: 'Notes More Character Added !',
               icon: 'warning',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     }

});

function AddItemIntoList(selectedItem) {
     debugger
     // ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
     let rowId = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1].RowId + 1 : 1;
     let quantity = $('#quantity').val();
     selectedItems.push({
          RowId: rowId,
          OrderBookingDetailId: 0,
          ItemId: selectedItem[0].ItemId,
          ItemBrandId: selectedItem[0].ItemBrandId,
          ItemName: selectedItem[0].ItemName,
          ItemGroupId: selectedItem[0].ItemGroupId,
          UOM: selectedItem[0].UOM,
          HSNNo: selectedItem[0].HSNNo,
          Quantity: quantity,
          Rate: selectedItem[0].Rate,
          IsGSTInput: selectedItem[0].IsGSTInput,
          GSTPercentage: selectedItem[0].GST,
          Amount: parseFloat(parseFloat(quantity) * parseFloat(selectedItem[0].Rate)).toFixed(2),
          GSTAmount: parseFloat(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].GST / 100)).toFixed(2)
     });


     loadItemsData(selectedItems);
     calculateAmount();
     $('#itemName').val('');
     $('#quantity').val('');
     itemId = 0;
     itemBrandId = 0;
     $('#itemName').focus();
}

function AddItemIntoListForUpdate(selectedItem) {
     debugger
     let rowId = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1].RowId + 1 : 1;
     for (var j = 0; j < selectedItem.length; j++) {
          selectedItems.push({
               RowId: j + 1,
               OrderBookingDetailId: selectedItem[j].OrderBookingDetailId,
               ItemId: selectedItem[j].ItemId,
               ItemBrandId: selectedItem[j].ItemBrandId,
               ItemName: selectedItem[j].ItemName,
               ItemGroupId: selectedItem[j].ItemGroupId,
               UOM: selectedItem[j].UOM,
               HSNNo: selectedItem[j].HSNNo,
               Quantity: selectedItem[j].Quantity,
               Rate: selectedItem[j].Rate,
               IsGSTInput: selectedItem[j].IsGSTInput,
               IsCompleted: selectedItem[j].IsCompleted,
               GSTPercentage: selectedItem[j].GSTPercentage,
               Amount: selectedItem[j].Amount,
               //    Amount: parseFloat(parseFloat(selectedItem[j].Quantity) * parseFloat(selectedItem[j].Rate)).toFixed(2),
               GSTAmount: selectedItem[j].GST
          });
     }

     loadItemsData(selectedItems);
     calculateAmount();
     $('#itemName').val('');
     $('#quantity').val('');
     itemId = 0;
     itemBrandId = 0;
     $('#itemName').focus();
}

function loadItemsData(selectedItems) {
     debugger
     let selectedItemsForView = '';
     let ItemsForSelectedBillSlot = selectedItems;
     // console.log("ItemsForSelectedBillSlot", ItemsForSelectedBillSlot);
     // console.log("selectedItems", selectedItems);
     if (ItemsForSelectedBillSlot.length > 0) {
          // document.getElementById('EstimationCompleted').disabled = ItemsForSelectedBillSlot.length != 0 ? false : true;
          ItemsForSelectedBillSlot.forEach(row => {
               if (row.IsCompleted == 1) {
                    selectedItemsForView += `<tr>
                                   <td>
                                        <button style="font-size: 20px;" class="btn btn-danger btn-xs" disabled  onclick="$(this).deleteItemRow(${row.RowId})">
                                             <i class="fa fa-times"></i>
                                        </button>
                                   </td>  
                                   <td style="font-size: 23px;">${row.ItemName}</td>
                                   <td style="font-size: 23px;">${row.UOM}</td>         
                                   <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                                   <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                                   <td style="font-size: 23px;">${parseFloat(row.GSTPercentage).toFixed(2)}</td>
                                   <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                    </tr>`;
                    $('#product_list').html(selectedItemsForView);
               }
               else {
                    selectedItemsForView += `<tr>
                                   <td>
                                        <button style="font-size: 20px;" class="btn btn-danger btn-xs"  onclick="$(this).deleteItemRow(${row.RowId})">
                                             <i class="fa fa-times"></i>
                                        </button>
                                   </td>  
                                   <td style="font-size: 23px;">${row.ItemName}</td>
                                   <td style="font-size: 23px;">${row.UOM}</td>         
                                   <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                                   <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                                   <td style="font-size: 23px;">${parseFloat(row.GSTPercentage).toFixed(2)}</td>
                                   <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 

                    </tr>`;
                    $('#product_list').html(selectedItemsForView);
               }
          })
     }
     else {
          document.getElementById('EstimationCompleted').disabled = ItemsForSelectedBillSlot.length != 0 ? false : true;
          $('#product_list').empty();
     }
     TotalItems = ItemsForSelectedBillSlot.length;
     document.getElementById('TotalItems').innerHTML = TotalItems;
}

$.fn.deleteItemRow = function (rowId) {

     let indexOfDelete = selectedItems.findIndex(row => row.RowId == rowId);
     selectedItems.splice(indexOfDelete, 1);
     loadItemsData(selectedItems);
     calculateAmount();
}

$.fn.deleteAll = function () {
     debugger;
     if (isCompleted == 1) {
          Swal.fire({
               title: 'Cannot delete Records because bill is Generated',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Yes'
          })
     }
     else {
          if (TempPaymentList.length > 0) {
               Swal.fire({
                    title: 'Are you sure Want to delete while the payment Table holding Records?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
               })
                    .then((result) => {
                         if (result.value) {
                              selectedItems = []; // order list delete all
                              loadItemsData(selectedItems);
                              selectedPayment = []; //  payment delete all
                              LoadPaymentData(selectedPayment);
                              document.getElementById('PaymentCompleted').disabled = false;
                              document.getElementById('deleteAllButton').disabled = false;
                              document.getElementById('AmountReceived').innerHTML = '0.00';
                              calculateAmount();
                         }
                    });


          }
          else {

               selectedItems = []; // order list delete all
               loadItemsData(selectedItems);
               calculateAmount();

          }
     }



}

function calculateAmount() {

     let ItemsForSelectedBillSlot = selectedItems;
     if (ItemsForSelectedBillSlot.length > 0) {
          let AmountReceived = document.getElementById('AmountReceived').innerHTML;
          let totalAmount = ItemsForSelectedBillSlot.map(row => row.Amount).reduce((prev, next) => Number(prev) + Number(next));
          let gstAmount = ItemsForSelectedBillSlot.map(row => row.GSTAmount).reduce((prev, next) => Number(prev) + Number(next));
          let totalAmountWithGST = parseFloat(Number(totalAmount) + Number(gstAmount)).toFixed(2);
          let roundOff = 0;
          let decimalValue = parseFloat(parseFloat((+totalAmountWithGST) % 1).toFixed(2));
          if (decimalValue != 0) {
               roundOff = 1 - decimalValue;
               if (IsAllowNegativeRoundOff == 0) {
                    if (roundOff <= 0.50) {
                         totalAmountWithGST = (+totalAmountWithGST) + roundOff;
                         document.getElementById('roundOff').innerHTML = parseFloat(roundOff).toFixed(2);
                         roundOff = document.getElementById('roundOff').innerHTML
                    } else if (roundOff >= 0.50) {
                         totalAmountWithGST = (+totalAmountWithGST) - decimalValue;
                         document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
                         roundOff = document.getElementById('roundOff').innerHTML
                    }
               } else {

                    totalAmountWithGST = (+totalAmountWithGST) - decimalValue;
                    document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
                    roundOff = document.getElementById('roundOff').innerHTML
               }


          }
          else if (decimalValue == 0) {
               document.getElementById('roundOff').innerHTML = parseFloat(0).toFixed(2);
          }
          TotalAmount = parseFloat(totalAmount).toFixed(2);
          TotalGST = parseFloat(gstAmount).toFixed(2);
          RoundOff = roundOff;
          NetAmount = (+TotalAmount + +TotalGST) + (+roundOff)
          BalanceAmt = NetAmount - AmountReceived;

          document.getElementById('totalAmt').innerHTML = parseFloat(totalAmount).toFixed(2);
          document.getElementById('totalGST').innerHTML = parseFloat(gstAmount).toFixed(2);
          document.getElementById('netAmount').innerHTML = parseFloat(NetAmount).toFixed(2);
          document.getElementById('BalanceAmt').innerHTML = parseFloat(BalanceAmt).toFixed(2);

          if (document.getElementById('BalanceAmt').innerHTML != 0 && document.getElementById('netAmount').innerHTML != 0) {
               document.getElementById('PaymentCompleted').disabled = false;
          }
          else {
               document.getElementById('PaymentCompleted').disabled = true;
          }
     }
     else {
          document.getElementById('totalAmt').innerHTML = '0.00';
          document.getElementById('totalGST').innerHTML = '0.00';
          document.getElementById('roundOff').innerHTML = '0.00';
          document.getElementById('netAmount').innerHTML = '0.00';
          document.getElementById('BalanceAmt').innerHTML = '0.00';

     }

     //Old Code
     // if (ItemsForSelectedBillSlot.length > 0) {
     //      let AmountReceived = document.getElementById('AmountReceived').innerHTML;
     //      let totalAmount = ItemsForSelectedBillSlot.map(row => row.Amount).reduce((prev, next) => prev + next);
     //      let gstAmount = ItemsForSelectedBillSlot.map(row => row.GSTAmount).reduce((prev, next) => prev + next);
     //      let totalAmountWithGST = totalAmount + gstAmount;
     //      let roundOff = 0;
     //      let decimalValue = parseFloat(parseFloat(totalAmountWithGST % 1).toFixed(2));
     //      if (decimalValue != 0) {
     //           roundOff = 1 - decimalValue;
     //           if (roundOff <= 0.50) {
     //                totalAmountWithGST = totalAmountWithGST + roundOff;
     //                document.getElementById('roundOff').innerHTML = parseFloat(roundOff).toFixed(2);

     //           } else if (roundOff >= 0.50) {
     //                totalAmountWithGST = totalAmountWithGST - decimalValue;
     //                document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
     //           }
     //           roundOff = document.getElementById('roundOff').innerHTML
     //      }
     //      else if (decimalValue == 0) {
     //           document.getElementById('roundOff').innerHTML = parseFloat(0).toFixed(2);
     //      }
     //      TotalAmount = totalAmount;
     //      TotalGST = gstAmount;
     //      RoundOff = roundOff;
     //      NetAmount = totalAmountWithGST;
     //      BalanceAmt = NetAmount - AmountReceived;
     //      document.getElementById('totalAmt').innerHTML = parseFloat(totalAmount).toFixed(2);
     //      document.getElementById('totalGST').innerHTML = parseFloat(gstAmount).toFixed(2);
     //      document.getElementById('netAmount').innerHTML = parseFloat(totalAmountWithGST).toFixed(2);
     //      document.getElementById('BalanceAmt').innerHTML = parseFloat(BalanceAmt).toFixed(2);
     // }
     // else {
     //      document.getElementById('totalAmt').innerHTML = '0.00';
     //      document.getElementById('totalGST').innerHTML = '0.00';
     //      document.getElementById('roundOff').innerHTML = '0.00';
     //      document.getElementById('netAmount').innerHTML = '0.00';
     //      document.getElementById('BalanceAmt').innerHTML = '0.00';
     // }
}

function getVehicles() {

     let Item = {
          "CompanyId": environment.CompanyId
     }
     if (VehicleList.length == 0) {
          $.post(environment.apiURL + '/GetActiveVehicles', Item, function (data) {

               let res = JSON.parse(data);
               if (res.Status == "valid") {
                    VehicleList = res.Data;
                    $("#Vehicle").append("<option value='0'><-- Select Vehicle --></option>");
                    for (var i = 0; i < VehicleList.length; i++) {
                         $("#Vehicle").append("<option value=" + VehicleList[i]['VehicleId'] + ">" + VehicleList[i]['VehicleName'] + "</option>")

                    }

               }
               else if (res.Status == "invalid") {
                    ErrorLog.writeLogFile('GetVehicle', res.Error)
                    Swal.fire(
                         'Oops!',
                         res.Data,
                         'warning'
                    );

               }
          }).catch(function (err) {
               ErrorLog.writeLogFile('GetVehicle', err)
               Swal.fire(
                    'Oops!',
                    res.Data,
                    'warning'
               );
          });
     }
}

function convertTo24HourFormat(timeString) {
     const [time, period] = timeString.split(' ');
     const [hour, minute] = time.split(':');
     let formattedHour = parseInt(hour);

     if (period === 'PM') {
          if (formattedHour == 12) {
               formattedHour = 12;
          }
          else {
               formattedHour += 12;
          }
     }
     else {
          if (formattedHour == 12) {
               formattedHour = '00';
          }
     }
     return `${formattedHour}:${minute}`;
}

$.fn.saveData = function (saveAndGenerate, type) {
     saveData(saveAndGenerate, 0)
}

function saveData(saveAndGenerate, type) {
     //     console.log('saveAndGenerate =', saveAndGenerate, ' , type =', type);
     debugger
     return new Promise(function (resolve, reject) {
          let item;
          let selectedBillSlotItems = selectedItems;
          let selectedVesselList = selectedVessels;
          let selectedPaymentList = selectedPayment;
          let vesselReturn = selectedVesselList.filter(x => x.QuantityReturned > x.Quantity);

          if (vesselReturn.length > 0) {
               Swal.fire({
                    icon: 'warning',
                    text: "QuantityReturned should not be greater than Quantity",
                    confirmButtonText: 'Ok',
               })

          } else {
               //return true;
               //}
               if (selectedBillSlotItems.length > 0) {
                    if ($('#customerName').val().trim() != '') {
                         // if ($('#Vehicle').val() != '') {
                         var DeliveryChoosedDate = $('#deliverydate').val();

                         let splitDeliveryfulldate = DeliveryChoosedDate.split('/')
                         let splitDeliverydate = splitDeliveryfulldate[0]
                         let splitDeliverymonth = splitDeliveryfulldate[1]
                         let splitDeliveryear = splitDeliveryfulldate[2]

                         //SelDeliverydate = ("0" + date).slice(-2) + "-" + ("0" + (month)).slice(-2) + "-" + year;

                         let Deliverydate = splitDeliveryear + "-" + ("0" + (splitDeliverymonth)).slice(-2) + "-" + ("0" + splitDeliverydate).slice(-2);

                         let h = $('#deliveryhours').val();
                         let m = $('#deliveryminutes').val();
                         let mid = $('#deliveryampm').val();
                         let deliverytime = h + ':' + m + ' ' + mid;
                         let SelDeliverytime = convertTo24HourFormat(deliverytime);
                         SelDeliverydate = Deliverydate + ' ' + SelDeliverytime;

                         var vehicleReturnChoosedDate = $('#velReturndate').val();
                         let splitvehicleReturnfulldate = vehicleReturnChoosedDate.split('/')
                         let splitVehicleReturndate = splitvehicleReturnfulldate[0]
                         let splitVehicleReturnmonth = splitvehicleReturnfulldate[1]
                         let splitVehicleReturnyear = splitvehicleReturnfulldate[2]

                         VesselReturndate = splitVehicleReturnyear + "-" + ("0" + (splitVehicleReturnmonth)).slice(-2) + "-" + ("0" + splitVehicleReturndate).slice(-2);

                         let OrderBookingDetails = JSON.stringify(selectedBillSlotItems.map(obj => ({
                              OrderBookingDetailId: obj.OrderBookingDetailId,
                              ItemId: obj.ItemId,
                              ItemName: obj.ItemName,
                              UOM: obj.UOM,
                              ItemBrandId: obj.ItemBrandId,
                              ItemGroupId: obj.ItemGroupId,
                              HSNNo: obj.HSNNo,
                              Quantity: obj.Quantity,
                              Rate: obj.Rate,
                              IsGSTInput: obj.IsGSTInput,
                              GST: obj.GSTAmount,
                              GSTPercentage: obj.GSTPercentage,
                              Amount: parseFloat(obj.Amount).toFixed(2)

                         })));
                         debugger;

                         let OrderBookingVessels = JSON.stringify(selectedVesselList.map(obj => ({
                              OrderBookingVesselsId: obj.OrderBookingVesselsId,
                              ItemId: obj.ItemId,
                              ItemName: obj.ItemName,
                              ItemBrandId: obj.ItemBrandId,
                              Quantity: obj.Quantity,
                              QuantityReturned: obj.QuantityReturned


                         })));
                         debugger;

                         let IsAdvance = 0;

                         for (let i = 0; i < selectedPaymentList.length; i++) {
                              if (selectedPaymentList[i].IsAdvance == 1) {
                                   IsAdvance = 1;
                              }
                         }
                         //console.log('IsAdvance ',IsAdvance);
                         if (type == 'IsCreditBill' || type == 'IsComplimentary') {
                              selectedPaymentList = [];
                              document.getElementById('AmountReceived').innerHTML = 0.00;
                              document.getElementById('BalanceAmt').innerHTML = 0.00;
                         }
                         OrderBookingPayment = JSON.stringify(selectedPaymentList.map(obj => ({
                              OrderBookingPaymentId: obj.OrderBookingPaymentId,
                              PaymentDate: obj.PaymentDate,
                              PaidAmount: obj.PaidAmount,
                              IsAdvance: obj.IsAdvance,
                              CashAmount: obj.CashAmount,
                              CardAmount: obj.CardAmount,
                              OnlineAmount: obj.OnlineAmount,
                              Notes: obj.Notes,
                              Balance: obj.Balance
                         })));

                         debugger;
                         if (isNew) {
                              if (store.get('IsOnline') == 'true') {
                                   loginId = store.get('Ref')
                              }
                              else {
                                   loginId = EncrDecrService.encrypt(store.get('Ref'))
                              }
                              var vehicleselect = $('#Vehicle').val();

                              item = {
                                   "BillCounterId": store.get('BillCounterId'),
                                   "POSId": environment.POSId,
                                   "CompanyId": environment.CompanyId,
                                   "CustomerName": $('#customerName').val().trim(),
                                   "Address": $('#Address').val().trim(),
                                   "PhoneNo": $('#phoneNumber').val().trim(),
                                   "GSTNo": $('#gst').val().trim(),
                                   "RefNo": $('#refno').val().trim(),
                                   "Notes": $('#BulkOrderNotes').val().trim(),
                                   "DeliveryInCharge": $('#inCharge').val().trim(),
                                   "DeliveryDate": SelDeliverydate,
                                   "VehicleId": vehicleselect == "" || vehicleselect == undefined ? 0 : vehicleselect,
                                   "VessleReturnDate": VesselReturndate,
                                   "OrderBookingDetails": OrderBookingDetails,
                                   "OrderBookingVessels": OrderBookingVessels,
                                   "OrderBookingPayments": OrderBookingPayment,
                                   "Amount": document.getElementById('totalAmt').innerHTML,
                                   "GST": document.getElementById('totalGST').innerHTML,
                                   "RoundOff": document.getElementById('roundOff').innerHTML,
                                   "NetAmount": document.getElementById('netAmount').innerHTML,
                                   "AmountReceived": document.getElementById('AmountReceived').innerHTML,
                                   "Balance": document.getElementById('BalanceAmt').innerHTML,
                                   "Source": environment.PageUrl.orderbooking,
                                   //"Ref": store.get('Ref')
                                   "Ref": loginId
                              }
                              //    console.log('item', item);
                              debugger;
                              $.post(environment.apiURL + '/AddBulkOrderBooking', item, function (data) {
                                   let res = JSON.parse(data);
                                   if (res.Status == "valid") {
                                        store.set('isWindowOpen', false)
                                        debugger;
                                        let OrderBookingHeaderId = res.Data[0].OrderBookingHeaderId;
                                        let Ordertype = 'NewOrder';
                                        store.set("BulkOrderRefresh", 'Refresh');
                                        if (IsAdvance == 1) {
                                             getBulkOrderAdvancePaymentDetail(saveAndGenerate, Ordertype, OrderBookingHeaderId);
                                        }
                                        else {
                                             Swal.fire({
                                                  icon: 'success',
                                                  title: 'Bill has been saved',
                                                  showConfirmButton: false,
                                                  timer: 1500
                                             }).then((res) => {
                                                  if (!saveAndGenerate) {
                                                       $(this).EstimationReport(Ordertype, OrderBookingHeaderId);
                                                  }
                                                  resolve("Bill has been saved")
                                             })
                                        }
                                   }
                                   else if (res.Status == "invalid") {
                                        debugger
                                        ErrorLog.writeLogFile('AddBulkOrderBooking', res.Error)

                                        Swal.fire({
                                             title: 'AddBulkOrderBooking Failed',
                                             icon: 'error',
                                             confirmButtonColor: '#d33',
                                             cancelButtonColor: '#3085d6',
                                             confirmButtonText: 'OK'
                                        })
                                   }
                              }).catch(function (err) {
                                   debugger
                                   ErrorLog.writeLogFile('AddBulkOrderBooking', err)

                                   Swal.fire(
                                        'Oops!',
                                        'Internet was Disconnected . try again later!',
                                        'warning'
                                   );
                              })
                         }
                         else {
                              if (store.get('IsOnline') == 'true') {
                                   loginId = store.get('Ref')
                              }
                              else {
                                   loginId = EncrDecrService.encrypt(store.get('Ref'))
                              }

                              item = {
                                   "OrderBookingHeaderId": OrderBookingHeaderId,
                                   "CustomerName": $('#customerName').val().trim(),
                                   "Address": $('#Address').val().trim(),
                                   "PhoneNo": $('#phoneNumber').val().trim(),
                                   "GSTNo": $('#gst').val().trim(),
                                   "RefNo": $('#refno').val().trim(),
                                   "Notes": $('#BulkOrderNotes').val().trim(),
                                   "DeliveryInCharge": $('#inCharge').val().trim(),
                                   "DeliveryDate": SelDeliverydate,
                                   "VehicleId": $('#Vehicle').val(),
                                   "VessleReturnDate": VesselReturndate,
                                   "OrderBookingDetails": OrderBookingDetails,
                                   "OrderBookingVessels": OrderBookingVessels,
                                   "OrderBookingPayments": OrderBookingPayment,
                                   "Amount": document.getElementById('totalAmt').innerHTML,
                                   "GST": document.getElementById('totalGST').innerHTML,
                                   "RoundOff": document.getElementById('roundOff').innerHTML,
                                   "NetAmount": document.getElementById('netAmount').innerHTML,
                                   "AmountReceived": document.getElementById('AmountReceived').innerHTML,
                                   "Balance": document.getElementById('BalanceAmt').innerHTML,
                                   "Source": environment.PageUrl.orderbooking,
                                   "IsCreditBill": type == 'IsCreditBill' ? 1 : 0,
                                   "IsComplimentary": type == 'IsComplimentary' ? 1 : 0,
                                   // "Ref": store.get('Ref')
                                   "Ref": loginId
                              }
                              debugger;
                              $.post(environment.apiURL + '/UpdateBulkOrderBooking', item, function (data) {
                                   let res = JSON.parse(data);
                                   if (res.Status == "valid") {
                                        store.set('isWindowOpen', false)
                                        store.set("BulkOrderRefresh", 'Refresh');
                                        getBulkOrderAdvancePaymentDetail(saveAndGenerate, type, 1);
                                        resolve("Bill has been saved");
                                   }
                                   else if (res.Status == "invalid") {
                                        ErrorLog.writeLogFile('UpdateBulkOrderBooking In UpdateBulkOrderBooking', res.Error)
                                        Swal.fire({
                                             title: 'UpdateBulkOrderBooking Failed ' + res.Error,
                                             icon: 'error',
                                             confirmButtonColor: '#d33',
                                             cancelButtonColor: '#3085d6',
                                             confirmButtonText: 'OK'
                                        })
                                   }
                              }).catch(function (err) {
                                   ErrorLog.writeLogFile('UpdateBulkOrderBooking', err)
                                   Swal.fire(
                                        'Oops!',
                                        'Internet was Disconnected . try again later!',
                                        'warning'
                                   );
                              })

                         }
                         // }
                         //  else {
                         //      Swal.fire(
                         //           'warning..!',
                         //           'Please select Vehicle Name',
                         //           'warning'
                         //      )
                         //  }
                    }

                    else {
                         Swal.fire(
                              'warning..!',
                              'Please Enter Customer Name',
                              'warning'
                         )
                    }

               }
               else {
                    Swal.fire(
                         'warning..!',
                         'Please Enter a Item?',
                         'warning'
                    )
               }
          }
     })
}

function ClearData() {

     selectedItems = [];
     selectedVessels = [];
     selectedPayment = [];
     loadItemsData([]);
     LoadVesselData([]);
     LoadPaymentData([]);
     store.delete('OrderBookingHeaderId');

     // $('#deliverydate').val()='';
     // $('#velReturndate').val()='';
     document.getElementById('deliverydate').value = '';
     document.getElementById('velReturndate').value = '';
     document.getElementById('Address').value = '';
     document.getElementById('BulkOrderNotes').value = '';
     document.getElementById('refno').value = '';
     document.getElementById('customerName').value = '';
     document.getElementById('phoneNumber').value = '';
     document.getElementById('gst').value = '';
     document.getElementById('inCharge').value = '';
     $("#Vehicle").val('')
     document.getElementById('AmountReceived').innerHTML = '0.00';
     document.getElementById('BalanceAmt').innerHTML = '0.00';
     document.getElementById('totalAmt').innerHTML = '0.00';
     document.getElementById('totalGST').innerHTML = '0.00';
     document.getElementById('roundOff').innerHTML = '0.00';
     document.getElementById('netAmount').innerHTML = '0.00';
}

function RoundOffmethod(NetAmount) {
     debugger
     let roundOff = 0;
     let roundOffValue = 0;
     let decimalValue = parseFloat(parseFloat(NetAmount % 1).toFixed(2));
     if (decimalValue != 0) {
          debugger
          roundOff = 1 - decimalValue;
          if (IsAllowNegativeRoundOff == 0) {
               debugger
               if (roundOff <= 0.50) {
                    NetAmount = NetAmount + roundOff;
                    roundOffValue = parseFloat(roundOff).toFixed(2);

               } else if (roundOff >= 0.50) {
                    NetAmount = NetAmount - decimalValue;
                    roundOffValue = parseFloat(-(decimalValue)).toFixed(2);
               }
          }
          else {
               debugger
               NetAmount = NetAmount - decimalValue;
               roundOffValue = parseFloat(-(decimalValue)).toFixed(2);
          }
          return roundOffValue;
     }
     else if (decimalValue == 0) {
          return parseFloat(0).toFixed(2);
     }
}

function calculationCashCardOnline(array) {
     debugger;
     let totalnetAmounts = document.getElementById("netAmount").innerHTML;
     let cash = TempPaymentList.map(row => (Number(row.CashAmount))).reduce((prev, next) => prev + next);
     let card = TempPaymentList.map(row => (Number(row.CardAmount))).reduce((prev, next) => prev + next);
     let online = TempPaymentList.map(row => (Number(row.OnlineAmount))).reduce((prev, next) => prev + next);

     let paidlistdetails = [];
     if (array.length == 1) {
          debugger;
          if (array[0].NetAmount == Number(totalnetAmounts)) {
               debugger;

               paidlistdetails.push({
                    "CashAmount": cash,
                    "CardAmount": card,
                    "OnlineAmount": online,
               })

               debugger;
               return paidlistdetails;
          }
     }
     else {
          debugger;

          if (cash != 0 && card == 0 && online == 0) { // cash amount only , card && online = 0

               paidlistdetails.push({
                    "CashAmount": array[0].NetAmount,
                    "CardAmount": 0,
                    "OnlineAmount": 0,
               })

               paidlistdetails.push({
                    "CashAmount": array[1].NetAmount,
                    "CardAmount": 0,
                    "OnlineAmount": 0,
               })

               debugger;
               return paidlistdetails;

          }
          else if (card != 0 && cash == 0 && online == 0) { // card amount only , cash && online = 0

               paidlistdetails.push({
                    "CashAmount": 0,
                    "CardAmount": array[0].NetAmount,
                    "OnlineAmount": 0,
               })

               paidlistdetails.push({
                    "CashAmount": 0,
                    "CardAmount": array[1].NetAmount,
                    "OnlineAmount": 0,
               })

               debugger;
               return paidlistdetails;

          }
          else if (online != 0 && cash == 0 && card == 0) { // online amount only , cash && card = 0
               debugger;

               paidlistdetails.push({
                    "CashAmount": 0,
                    "CardAmount": 0,
                    "OnlineAmount": array[0].NetAmount,
               })

               paidlistdetails.push({
                    "CashAmount": 0,
                    "CardAmount": 0,
                    "OnlineAmount": array[1].NetAmount,
               })

               debugger;
               return paidlistdetails;

          }
          else if (cash != 0 && card != 0 && online == 0) { // cash && card amount only , online = 0
               debugger;
               let total = Number(totalnetAmounts);
               let bill1 = array[0].NetAmount;
               let bill2 = array[1].NetAmount;

               let balance1 = 0;
               //  let balance2 = 0;

               balance1 = bill1 - cash;
               //  balance2 =  bill2 - balance1;

               if (cash < bill1) {
                    paidlistdetails.push({
                         "CashAmount": cash,
                         "CardAmount": Math.abs(balance1),
                         "OnlineAmount": 0,
                    })

                    paidlistdetails.push({
                         "CashAmount": 0,
                         "CardAmount": bill2,
                         "OnlineAmount": 0,
                    })
                    debugger;

                    return paidlistdetails;
               }
               else {
                    debugger;

                    paidlistdetails.push({
                         "CashAmount": bill1,
                         "CardAmount": 0,
                         "OnlineAmount": 0,
                    })

                    paidlistdetails.push({
                         "CashAmount": Math.abs(balance1),
                         "CardAmount": card,
                         "OnlineAmount": 0,
                    })
                    debugger;
                    return paidlistdetails;
               }
          }
          else if (cash != 0 && online != 0 && card == 0) { // cash && online amount only , card = 0
               debugger;
               let total = Number(totalnetAmounts);
               let bill1 = array[0].NetAmount;
               let bill2 = array[1].NetAmount;

               let balance1 = 0;
               // let balance2 = 0;
               balance1 = bill1 - cash;
               // balance2 =  bill2 - balance1;

               if (cash < bill1) {
                    paidlistdetails.push({
                         "CashAmount": cash,
                         "CardAmount": 0,
                         "OnlineAmount": Math.abs(balance1),
                    })

                    paidlistdetails.push({
                         "CashAmount": 0,
                         "CardAmount": 0,
                         "OnlineAmount": bill2,
                    })
                    debugger;

                    return paidlistdetails;
               }
               else {
                    debugger;

                    paidlistdetails.push({
                         "CashAmount": bill1,
                         "CardAmount": 0,
                         "OnlineAmount": 0,
                    })

                    paidlistdetails.push({
                         "CashAmount": Math.abs(balance1),
                         "CardAmount": 0,
                         "OnlineAmount": online,
                    })
                    debugger;
                    return paidlistdetails;
               }
          }
          else if (card != 0 && online != 0 && cash == 0) { // card && online mount only , cash = 0
               debugger;
               let total = Number(totalnetAmounts);
               let bill1 = array[0].NetAmount;
               let bill2 = array[1].NetAmount;

               let balance1 = 0;
               //let balance2 = 0;
               balance1 = bill1 - card;
               // balance2 =  bill2 - balance1;

               if (card < bill1) {

                    paidlistdetails.push({
                         "CashAmount": 0,
                         "CardAmount": card,
                         "OnlineAmount": Math.abs(balance1),
                    })

                    paidlistdetails.push({
                         "CashAmount": 0,
                         "CardAmount": 0,
                         "OnlineAmount": bill2,
                    })
                    debugger;

                    return paidlistdetails;
               }
               else {
                    debugger;
                    paidlistdetails.push({
                         "CashAmount": 0,
                         "CardAmount": bill1,
                         "OnlineAmount": 0,
                    })

                    paidlistdetails.push({
                         "CashAmount": 0,
                         "CardAmount": Math.abs(balance1),
                         "OnlineAmount": online,
                    })
                    debugger;
                    return paidlistdetails;
               }
          }
          else if (cash != 0 && card != 0 && online != 0) { // card && online & cash all amount 
               debugger;
               let total = Number(totalnetAmounts);
               let bill1 = array[0].NetAmount;
               let bill2 = array[1].NetAmount;

               let balance1 = 0;
               let balance2 = 0;
               debugger;
               balance1 = bill1 - cash;
               balance2 = balance1 - card;

               if (cash < bill1) {
                    if (card > bill1) {
                         let cardbalance1 = balance1 - card;
                         debugger;
                         paidlistdetails.push({
                              "CashAmount": cash,
                              "CardAmount": Math.abs(balance1),
                              "OnlineAmount": 0,
                         })
                         paidlistdetails.push({
                              "CashAmount": 0,
                              "CardAmount": Math.abs(cardbalance1),
                              "OnlineAmount": online,
                         })
                         debugger;
                         return paidlistdetails;
                    }
                    else {
                         if (balance1 < card) {
                              debugger;
                              paidlistdetails.push({
                                   "CashAmount": cash,
                                   "CardAmount": Math.abs(balance1),
                                   "OnlineAmount": 0,
                              })
                              paidlistdetails.push({
                                   "CashAmount": 0,
                                   "CardAmount": Math.abs(balance2),
                                   "OnlineAmount": online,
                              })
                              debugger;
                              return paidlistdetails;
                         }
                         else {
                              debugger;
                              paidlistdetails.push({
                                   "CashAmount": cash,
                                   "CardAmount": card,
                                   "OnlineAmount": Math.abs(balance2),
                              })
                              paidlistdetails.push({
                                   "CashAmount": 0,
                                   "CardAmount": 0,
                                   "OnlineAmount": bill2,
                              })
                              debugger;
                              return paidlistdetails;
                         }
                    }
               }
               else {
                    paidlistdetails.push({
                         "CashAmount": bill1,
                         "CardAmount": 0,
                         "OnlineAmount": 0,
                    })
                    debugger;
                    paidlistdetails.push({
                         "CashAmount": Math.abs(balance1),
                         "CardAmount": card,
                         "OnlineAmount": online,
                    })
                    debugger;

                    return paidlistdetails;
               }

          }
     }

}

$.fn.ComplimentaryBill = function (event, saveAndGenerate) {
     debugger;
     let type = event == 1 ? 'IsComplimentary' : 0;
     let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
     let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
     let OrderBookingHeaderId = store.get('OrderBookingHeaderId')
     debugger
     if (selectedPayment.length > 0) {
          debugger
          Swal.fire({
               title: 'Warning..!',
               text: "Payment is already given, Are you sure want to complimentary bill?",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Yes',
               cancelButtonText: 'No'
          }).then((result) => {
               if (result.isConfirmed) {
                    saveData(saveAndGenerate, type).then((res) => {
                         showLoading();

                         let Item = {
                              "OrderBookingHeaderId": OrderBookingHeaderId,
                         }
                         $.post(environment.apiURL + '/GetOrderBookingBillDetails', Item, function (data) {
                              debugger
                              let res = JSON.parse(data);
                              if (res.Status == "valid") {
                                   debugger
                                   $("#OrderBookingclose").prop("disabled", true);
                                   if (res.Data[0].length > 0) {
                                        debugger
                                        let SaleHeaderList = res.Data[0]
                                        let SaleDetailList = res.Data[1]

                                        let cashierName = store.get('DisplayName');

                                        let itemDetailList1 = [];
                                        let itemDetailList2 = [];
                                        debugger;
                                        for (let i = 0; i < SaleDetailList.length; i++) {
                                             if (SaleDetailList[i].IsGSTInput == 0) {
                                                  itemDetailList1.push({
                                                       Amount: SaleDetailList[i].Amount,
                                                       GST: SaleDetailList[i].GST,
                                                       GSTPercentage: SaleDetailList[i].GSTPercentage,
                                                       HSNNo: SaleDetailList[i].HSNNo,
                                                       IsGSTInput: SaleDetailList[i].IsGSTInput,
                                                       ItemBrandId: SaleDetailList[i].ItemBrandId,
                                                       ItemGroupId: SaleDetailList[i].ItemGroupId,
                                                       ItemId: SaleDetailList[i].ItemId,
                                                       ItemName: SaleDetailList[i].ItemName,
                                                       NetAmount: SaleDetailList[i].NetAmount,
                                                       Quantity: SaleDetailList[i].Quantity,
                                                       Rate: SaleDetailList[i].Rate,
                                                       SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                                       UOM: SaleDetailList[i].UOM
                                                  })
                                                  ErrorLog.writeLogFile('ComplimentaryBill IsGSTInput==0 Item Added', OrderBookingHeaderId)
                                             }
                                             debugger;
                                             if (SaleDetailList[i].IsGSTInput == 1) {
                                                  itemDetailList2.push({
                                                       Amount: SaleDetailList[i].Amount,
                                                       GST: SaleDetailList[i].GST,
                                                       GSTPercentage: SaleDetailList[i].GSTPercentage,
                                                       HSNNo: SaleDetailList[i].HSNNo,
                                                       IsGSTInput: SaleDetailList[i].IsGSTInput,
                                                       ItemBrandId: SaleDetailList[i].ItemBrandId,
                                                       ItemGroupId: SaleDetailList[i].ItemGroupId,
                                                       ItemId: SaleDetailList[i].ItemId,
                                                       ItemName: SaleDetailList[i].ItemName,
                                                       NetAmount: SaleDetailList[i].NetAmount,
                                                       Quantity: SaleDetailList[i].Quantity,
                                                       Rate: SaleDetailList[i].Rate,
                                                       SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                                       UOM: SaleDetailList[i].UOM
                                                  })
                                                  ErrorLog.writeLogFile('ComplimentaryBill IsGSTInput==1 Item Added', OrderBookingHeaderId)
                                             }
                                        }
                                        debugger;
                                        let itemAmountdetails = [];
                                        debugger;
                                        debugger;
                                        if (itemDetailList1.length > 0) {
                                             ErrorLog.writeLogFile('ComplimentaryBill itemDetailList1  NetAmount Added', OrderBookingHeaderId)
                                             debugger;
                                             let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                             var roundOff1 = RoundOffmethod(NetAmount1);
                                             NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                             itemAmountdetails.push({
                                                  "ItemNO": 1,
                                                  "NetAmount": NetAmount1
                                             })
                                             debugger;

                                        } debugger;
                                        if (itemDetailList2.length > 0) {
                                             ErrorLog.writeLogFile('ComplimentaryBill itemDetailList2  NetAmount Added', OrderBookingHeaderId)
                                             debugger;
                                             let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                             var roundOff2 = RoundOffmethod(NetAmount2);
                                             NetAmount2 = Number(NetAmount2) + Number(roundOff2);

                                             itemAmountdetails.push({
                                                  "ItemNO": 2,
                                                  "NetAmount": NetAmount2
                                             })
                                             debugger;

                                        }

                                        debugger;
                                        if (itemDetailList1.length > 0) {
                                             debugger;
                                             if (store.get('IsOnline') == 'true') {
                                                  loginId = EncrDecrService.decrypt(store.get('Ref'))
                                             }
                                             else {
                                                  loginId = store.get('Ref')
                                             } debugger;
                                             let TotalAmount1 = itemDetailList1.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                             let GST1 = itemDetailList1.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                             let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                             var roundOff1 = RoundOffmethod(NetAmount1);
                                             NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                             let item = {
                                                  "SaleDate": SaleDate,
                                                  "BillTime": Time,
                                                  "POSId": environment.POSId,
                                                  "BillCounterId": store.get('BillCounterId'),
                                                  "ServiceTypeId": ServiceTypeId,
                                                  "ServiceType": ServiceType,
                                                  "BillCounterCode": store.get('BillCounterCode'),
                                                  "CashierName": cashierName,
                                                  "CustomerName": SaleHeaderList[0].CustomerName,
                                                  "PhoneNo": SaleHeaderList[0].PhoneNo,
                                                  "GSTNo": SaleHeaderList[0].GSTNo,
                                                  "RefNo": SaleHeaderList[0].RefNo,
                                                  "BillTokenNo": '',
                                                  "IsWebOrders": 0,
                                                  "TotalAmount": parseFloat(TotalAmount1).toFixed(2),
                                                  "TotalGST": parseFloat(GST1).toFixed(2),
                                                  "RoundOff": roundOff1,
                                                  "NetAmount": parseFloat(NetAmount1).toFixed(2),
                                                  "WaiterId": 0,
                                                  "WaiterName": '',
                                                  "TableNo": 0,
                                                  "SeatNo": '',
                                                  "CompanyId": environment.CompanyId,
                                                  "Source": environment.PageUrl.orderbooking,
                                                  "IsPaid": 0,
                                                  "IsCreditBill": 0,
                                                  "IsComplimentary": 1,
                                                  "IsGSTInput": 0,
                                                  "CashAmount": 0.00,
                                                  "CardAmount": 0.00,
                                                  "OnlineAmount": 0.00,
                                                  "AmountPaid": 0.00,
                                                  "Balance": 0.00,
                                                  "Ref": loginId,
                                                  "CreatedOn": SaleDate + Time,
                                                  "UpdatedOn": SaleDate + Time,
                                                  //  "itemDetail": itemDetailList1
                                             }
                                             debugger;
                                             ErrorLog.writeLogFile('ComplimentaryBill itemDetailList1  generateBillNo Added', OrderBookingHeaderId)
                                             BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                                  async (result) => {
                                                       debugger;
                                                       let res = result.split('_');
                                                       item.BillNo = res[0];
                                                       item.DisplayBillNo = res[1];
                                                       BillNoDetails.push(res[0]);
                                                       //  console.log("generateBillNo 1==", item)
                                                       await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                            async (result) => {
                                                                 debugger
                                                                 item = '';
                                                                 let SaleHeaderId = result
                                                                 let serverSaleHeaderId = SaleHeaderId
                                                                 nonSaleHeaderIds.push(serverSaleHeaderId)
                                                                 let SaleItemDetails = JSON.stringify(itemDetailList1.map(obj => ({
                                                                      SaleHeaderId: SaleHeaderId,
                                                                      ItemId: obj.ItemId,
                                                                      ItemName: obj.ItemName,
                                                                      ItemGroupId: obj.ItemGroupId,
                                                                      ItemBrandId: obj.ItemBrandId,
                                                                      HSNNo: obj.HSNNo,
                                                                      Quantity: obj.Quantity,
                                                                      Rate: obj.Rate,
                                                                      IsGSTInput: obj.IsGSTInput,
                                                                      GSTPercentage: obj.GSTPercentage,
                                                                      IsTakeAway: 0,
                                                                      IsShowHSN: obj.IsShowHSN == 0,
                                                                      UOM: obj.UOM,
                                                                      TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                                      GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                                      NetAmount: obj.NetAmount
                                                                 })
                                                                 ));
                                                                 await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                                      async (result) => {
                                                                           debugger
                                                                           await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                                ErrorLog.writeLogFile('printerService', err)
                                                                           })
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)

                                                                      }).catch((err) => {
                                                                           ErrorLog.writeLogFile('ComplimentaryBill addSaleDetailforOrderBooking', err)
                                                                           for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                                let SaleHeaderId = nonSaleHeaderIds[i]
                                                                                BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                                     ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                                }).catch(function (err) {
                                                                                     ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                                });
                                                                           }
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                                      })

                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('ComplimentaryBill addSaleHeader', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })

                                                  }).catch((err) => {
                                                       ErrorLog.writeLogFile(' ComplimentaryBill generateBillNo', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })
                                        }
                                        debugger;
                                        if (itemDetailList2.length > 0) {
                                             debugger;
                                             if (store.get('IsOnline') == 'true') {
                                                  loginId = EncrDecrService.decrypt(store.get('Ref'))
                                             }
                                             else {
                                                  loginId = store.get('Ref')
                                             }
                                             let TotalAmount2 = itemDetailList2.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                             let GST2 = itemDetailList2.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                             let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                             var roundOff2 = RoundOffmethod(NetAmount2);
                                             NetAmount2 = Number(NetAmount2) + Number(roundOff2);
                                             debugger;
                                             let item;

                                             item = {
                                                  "SaleDate": SaleDate,
                                                  "BillTime": Time,
                                                  "POSId": environment.POSId,
                                                  "BillCounterId": store.get('BillCounterId'),
                                                  "ServiceTypeId": ServiceTypeId,
                                                  "ServiceType": ServiceType,
                                                  "BillCounterCode": store.get('BillCounterCode'),
                                                  "CashierName": cashierName,
                                                  "CustomerName": SaleHeaderList[0].CustomerName,
                                                  "PhoneNo": SaleHeaderList[0].PhoneNo,
                                                  "GSTNo": SaleHeaderList[0].GSTNo,
                                                  "RefNo": SaleHeaderList[0].RefNo,
                                                  "BillTokenNo": '',
                                                  "IsWebOrders": 0,
                                                  "TotalAmount": parseFloat(TotalAmount2).toFixed(2),
                                                  "TotalGST": parseFloat(GST2).toFixed(2),
                                                  "RoundOff": roundOff2,
                                                  "NetAmount": parseFloat(NetAmount2).toFixed(2),
                                                  "WaiterId": 0,
                                                  "WaiterName": '',
                                                  "TableNo": 0,
                                                  "SeatNo": '',
                                                  "CompanyId": environment.CompanyId,
                                                  "Source": environment.PageUrl.orderbooking,
                                                  "IsPaid": 0,
                                                  "IsCreditBill": 0,
                                                  "IsComplimentary": 1,
                                                  "IsGSTInput": 1,
                                                  "CashAmount": 0.00,
                                                  "CardAmount": 0.00,
                                                  "OnlineAmount": 0.00,
                                                  "AmountPaid": 0.00,
                                                  "Balance": 0.00,
                                                  "Ref": loginId,
                                                  "CreatedOn": SaleDate + Time,
                                                  "UpdatedOn": SaleDate + Time,
                                                  // "itemDetail": itemDetailList2
                                             }

                                             debugger;
                                             setTimeout(function () {
                                                  ErrorLog.writeLogFile('ComplimentaryBill itemDetailList2  generateBillNo Added', OrderBookingHeaderId)
                                                  BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(async (result) => {
                                                       debugger;
                                                       let res = result.split('_');
                                                       item.BillNo = res[0];
                                                       item.DisplayBillNo = res[1];
                                                       BillNoDetails.push(res[0]);
                                                       // console.log("generateBillNo 1==", item)
                                                       await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                            async (result) => {
                                                                 debugger
                                                                 item = '';
                                                                 let SaleHeaderId = result
                                                                 let serverSaleHeaderId = SaleHeaderId
                                                                 nonSaleHeaderIds.push(serverSaleHeaderId)
                                                                 let SaleItemDetails = JSON.stringify(itemDetailList2.map(obj => ({
                                                                      SaleHeaderId: SaleHeaderId,
                                                                      ItemId: obj.ItemId,
                                                                      ItemName: obj.ItemName,
                                                                      ItemGroupId: obj.ItemGroupId,
                                                                      ItemBrandId: obj.ItemBrandId,
                                                                      HSNNo: obj.HSNNo,
                                                                      Quantity: obj.Quantity,
                                                                      Rate: obj.Rate,
                                                                      IsGSTInput: obj.IsGSTInput,
                                                                      GSTPercentage: obj.GSTPercentage,
                                                                      IsTakeAway: 0,
                                                                      IsShowHSN: obj.IsShowHSN == 0,
                                                                      UOM: obj.UOM,
                                                                      TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                                      GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                                      NetAmount: obj.NetAmount
                                                                 })
                                                                 )); debugger;
                                                                 await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                                      async (result) => {
                                                                           debugger
                                                                           await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                                ErrorLog.writeLogFile('printerService', err)
                                                                           })
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)

                                                                      }).catch((err) => {
                                                                           ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                           for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                                let SaleHeaderId = nonSaleHeaderIds[i]
                                                                                BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                                     ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                                }).catch(function (err) {
                                                                                     ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                                });
                                                                           }
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                                      })

                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('ComplimentaryBill addSaleHeader', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })
                                                  }).catch((err) => {
                                                       ErrorLog.writeLogFile('ComplimentaryBill generateBillNo', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })
                                             }, 1000)
                                        }
                                   }
                              }
                              else if (res.Status == "invalid") {
                                   ErrorLog.writeLogFile('ComplimentaryBill GetOrderBookingBillDetails', res.Error)

                              }
                         }).catch(function (err) {
                              ErrorLog.writeLogFile('ComplimentaryBill GetOrderBookingBillDetails', err)

                         })
                    })
               }
          })
     }
     else {
          saveData(saveAndGenerate, type).then((res) => {
               showLoading();

               let Item = {
                    "OrderBookingHeaderId": OrderBookingHeaderId,
               }
               $.post(environment.apiURL + '/GetOrderBookingBillDetails', Item, function (data) {
                    debugger
                    let res = JSON.parse(data);
                    if (res.Status == "valid") {
                         debugger
                         if (res.Data[0].length > 0) {
                              debugger
                              let SaleHeaderList = res.Data[0]
                              let SaleDetailList = res.Data[1]

                              let cashierName = store.get('DisplayName');

                              let itemDetailList1 = [];
                              let itemDetailList2 = [];
                              debugger;
                              for (let i = 0; i < SaleDetailList.length; i++) {
                                   if (SaleDetailList[i].IsGSTInput == 0) {
                                        itemDetailList1.push({
                                             Amount: SaleDetailList[i].Amount,
                                             GST: SaleDetailList[i].GST,
                                             GSTPercentage: SaleDetailList[i].GSTPercentage,
                                             HSNNo: SaleDetailList[i].HSNNo,
                                             IsGSTInput: SaleDetailList[i].IsGSTInput,
                                             ItemBrandId: SaleDetailList[i].ItemBrandId,
                                             ItemGroupId: SaleDetailList[i].ItemGroupId,
                                             ItemId: SaleDetailList[i].ItemId,
                                             ItemName: SaleDetailList[i].ItemName,
                                             NetAmount: SaleDetailList[i].NetAmount,
                                             Quantity: SaleDetailList[i].Quantity,
                                             Rate: SaleDetailList[i].Rate,
                                             SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                             UOM: SaleDetailList[i].UOM
                                        })
                                        ErrorLog.writeLogFile('ComplimentaryBill IsGSTInput==0 Item Added', OrderBookingHeaderId);
                                   }
                                   debugger;
                                   if (SaleDetailList[i].IsGSTInput == 1) {
                                        itemDetailList2.push({
                                             Amount: SaleDetailList[i].Amount,
                                             GST: SaleDetailList[i].GST,
                                             GSTPercentage: SaleDetailList[i].GSTPercentage,
                                             HSNNo: SaleDetailList[i].HSNNo,
                                             IsGSTInput: SaleDetailList[i].IsGSTInput,
                                             ItemBrandId: SaleDetailList[i].ItemBrandId,
                                             ItemGroupId: SaleDetailList[i].ItemGroupId,
                                             ItemId: SaleDetailList[i].ItemId,
                                             ItemName: SaleDetailList[i].ItemName,
                                             NetAmount: SaleDetailList[i].NetAmount,
                                             Quantity: SaleDetailList[i].Quantity,
                                             Rate: SaleDetailList[i].Rate,
                                             SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                             UOM: SaleDetailList[i].UOM
                                        })
                                        ErrorLog.writeLogFile('ComplimentaryBill IsGSTInput==1 Item Added', OrderBookingHeaderId);
                                   }
                              }
                              debugger;
                              let itemAmountdetails = [];
                              debugger;
                              debugger;
                              if (itemDetailList1.length > 0) {
                                   debugger;
                                   let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                   var roundOff1 = RoundOffmethod(NetAmount1);
                                   NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                   itemAmountdetails.push({
                                        "ItemNO": 1,
                                        "NetAmount": NetAmount1
                                   })

                                   ErrorLog.writeLogFile('ComplimentaryBill itemDetailList1  NetAmount Added', OrderBookingHeaderId);

                              } debugger;
                              if (itemDetailList2.length > 0) {
                                   debugger;
                                   let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                   var roundOff2 = RoundOffmethod(NetAmount2);
                                   NetAmount2 = Number(NetAmount2) + Number(roundOff2);

                                   itemAmountdetails.push({
                                        "ItemNO": 2,
                                        "NetAmount": NetAmount2
                                   })
                                   ErrorLog.writeLogFile('ComplimentaryBill itemDetailList2  NetAmount Added', OrderBookingHeaderId);

                              }

                              debugger;
                              if (itemDetailList1.length > 0) {
                                   debugger;
                                   if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                   }
                                   else {
                                        loginId = store.get('Ref')
                                   } debugger;
                                   let TotalAmount1 = itemDetailList1.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                   let GST1 = itemDetailList1.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                   let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                   var roundOff1 = RoundOffmethod(NetAmount1);
                                   NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                   let item = {
                                        "SaleDate": SaleDate,
                                        "BillTime": Time,
                                        "POSId": environment.POSId,
                                        "BillCounterId": store.get('BillCounterId'),
                                        "ServiceTypeId": ServiceTypeId,
                                        "ServiceType": ServiceType,
                                        "BillCounterCode": store.get('BillCounterCode'),
                                        "CashierName": cashierName,
                                        "CustomerName": SaleHeaderList[0].CustomerName,
                                        "PhoneNo": SaleHeaderList[0].PhoneNo,
                                        "GSTNo": SaleHeaderList[0].GSTNo,
                                        "RefNo": SaleHeaderList[0].RefNo,
                                        "BillTokenNo": '',
                                        "IsWebOrders": 0,
                                        "TotalAmount": parseFloat(TotalAmount1).toFixed(2),
                                        "TotalGST": parseFloat(GST1).toFixed(2),
                                        "RoundOff": roundOff1,
                                        "NetAmount": parseFloat(NetAmount1).toFixed(2),
                                        "WaiterId": 0,
                                        "WaiterName": '',
                                        "TableNo": 0,
                                        "SeatNo": '',
                                        "CompanyId": environment.CompanyId,
                                        "Source": environment.PageUrl.orderbooking,
                                        "IsPaid": 0,
                                        "IsCreditBill": 0,
                                        "IsComplimentary": 1,
                                        "IsGSTInput": 0,
                                        "CashAmount": 0.00,
                                        "CardAmount": 0.00,
                                        "OnlineAmount": 0.00,
                                        "AmountPaid": 0.00,
                                        "Balance": 0.00,
                                        "Ref": loginId,
                                        "CreatedOn": SaleDate + Time,
                                        "UpdatedOn": SaleDate + Time,
                                        //  "itemDetail": itemDetailList1
                                   }
                                   ErrorLog.writeLogFile('ComplimentaryBill itemDetailList1  generateBillNo Added', OrderBookingHeaderId);
                                   BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                        async (result) => {
                                             debugger;
                                             let res = result.split('_');
                                             item.BillNo = res[0];
                                             item.DisplayBillNo = res[1];
                                             BillNoDetails.push(res[0]);
                                             //  console.log("generateBillNo 1==", item)
                                             await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                  async (result) => {
                                                       debugger
                                                       item = '';
                                                       let SaleHeaderId = result
                                                       let serverSaleHeaderId = SaleHeaderId
                                                       nonSaleHeaderIds.push(serverSaleHeaderId)
                                                       let SaleItemDetails = JSON.stringify(itemDetailList1.map(obj => ({
                                                            SaleHeaderId: SaleHeaderId,
                                                            ItemId: obj.ItemId,
                                                            ItemName: obj.ItemName,
                                                            ItemGroupId: obj.ItemGroupId,
                                                            ItemBrandId: obj.ItemBrandId,
                                                            HSNNo: obj.HSNNo,
                                                            Quantity: obj.Quantity,
                                                            Rate: obj.Rate,
                                                            IsGSTInput: obj.IsGSTInput,
                                                            GSTPercentage: obj.GSTPercentage,
                                                            IsTakeAway: 0,
                                                            IsShowHSN: obj.IsShowHSN == 0,
                                                            UOM: obj.UOM,
                                                            TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                            GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                            NetAmount: obj.NetAmount
                                                       })
                                                       ));
                                                       await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                            async (result) => {
                                                                 debugger
                                                                 await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                      ErrorLog.writeLogFile('printerService', err)
                                                                 })
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)

                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('ComplimentaryBill addSaleDetailforOrderBooking', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })

                                                  }).catch((err) => {
                                                       ErrorLog.writeLogFile('ComplimentaryBill addSaleHeader', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })

                                        }).catch((err) => {
                                             ErrorLog.writeLogFile(' ComplimentaryBill generateBillNo', err)
                                             for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                  let SaleHeaderId = nonSaleHeaderIds[i]
                                                  BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                       ErrorLog.writeLogFile(SaleHeaderId, res)
                                                  }).catch(function (err) {
                                                       ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                  });
                                             }
                                             UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                        })
                              }
                              debugger;
                              if (itemDetailList2.length > 0) {
                                   debugger;
                                   if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                   }
                                   else {
                                        loginId = store.get('Ref')
                                   }
                                   let TotalAmount2 = itemDetailList2.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                   let GST2 = itemDetailList2.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                   let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                   var roundOff2 = RoundOffmethod(NetAmount2);
                                   NetAmount2 = Number(NetAmount2) + Number(roundOff2);
                                   debugger;
                                   let item;

                                   item = {
                                        "SaleDate": SaleDate,
                                        "BillTime": Time,
                                        "POSId": environment.POSId,
                                        "BillCounterId": store.get('BillCounterId'),
                                        "ServiceTypeId": ServiceTypeId,
                                        "ServiceType": ServiceType,
                                        "BillCounterCode": store.get('BillCounterCode'),
                                        "CashierName": cashierName,
                                        "CustomerName": SaleHeaderList[0].CustomerName,
                                        "PhoneNo": SaleHeaderList[0].PhoneNo,
                                        "GSTNo": SaleHeaderList[0].GSTNo,
                                        "RefNo": SaleHeaderList[0].RefNo,
                                        "BillTokenNo": '',
                                        "IsWebOrders": 0,
                                        "TotalAmount": parseFloat(TotalAmount2).toFixed(2),
                                        "TotalGST": parseFloat(GST2).toFixed(2),
                                        "RoundOff": roundOff2,
                                        "NetAmount": parseFloat(NetAmount2).toFixed(2),
                                        "WaiterId": 0,
                                        "WaiterName": '',
                                        "TableNo": 0,
                                        "SeatNo": '',
                                        "CompanyId": environment.CompanyId,
                                        "Source": environment.PageUrl.orderbooking,
                                        "IsPaid": 0,
                                        "IsCreditBill": 0,
                                        "IsComplimentary": 1,
                                        "IsGSTInput": 1,
                                        "CashAmount": 0.00,
                                        "CardAmount": 0.00,
                                        "OnlineAmount": 0.00,
                                        "AmountPaid": 0.00,
                                        "Balance": 0.00,
                                        "Ref": loginId,
                                        "CreatedOn": SaleDate + Time,
                                        "UpdatedOn": SaleDate + Time,
                                        // "itemDetail": itemDetailList2
                                   }

                                   debugger;
                                   setTimeout(function () {
                                        ErrorLog.writeLogFile('ComplimentaryBill itemDetailList2  generateBillNo Added', OrderBookingHeaderId);
                                        BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                             async (result) => {
                                                  debugger;
                                                  let res = result.split('_');
                                                  item.BillNo = res[0];
                                                  item.DisplayBillNo = res[1];
                                                  BillNoDetails.push(res[0]);
                                                  // console.log("generateBillNo 1==", item)
                                                  await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                       async (result) => {
                                                            debugger
                                                            item = '';
                                                            let SaleHeaderId = result
                                                            let serverSaleHeaderId = SaleHeaderId
                                                            nonSaleHeaderIds.push(serverSaleHeaderId)
                                                            let SaleItemDetails = JSON.stringify(itemDetailList2.map(obj => ({
                                                                 SaleHeaderId: SaleHeaderId,
                                                                 ItemId: obj.ItemId,
                                                                 ItemName: obj.ItemName,
                                                                 ItemGroupId: obj.ItemGroupId,
                                                                 ItemBrandId: obj.ItemBrandId,
                                                                 HSNNo: obj.HSNNo,
                                                                 Quantity: obj.Quantity,
                                                                 Rate: obj.Rate,
                                                                 IsGSTInput: obj.IsGSTInput,
                                                                 GSTPercentage: obj.GSTPercentage,
                                                                 IsTakeAway: 0,
                                                                 IsShowHSN: obj.IsShowHSN == 0,
                                                                 UOM: obj.UOM,
                                                                 TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                                 GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                                 NetAmount: obj.NetAmount
                                                            })
                                                            )); debugger;
                                                            await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                                 async (result) => {
                                                                      debugger
                                                                      await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                           ErrorLog.writeLogFile('printerService', err)
                                                                      })
                                                                      UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)

                                                                 }).catch((err) => {
                                                                      ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                      for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                           let SaleHeaderId = nonSaleHeaderIds[i]
                                                                           BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                                ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                           }).catch(function (err) {
                                                                                ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                           });
                                                                      }
                                                                      UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                                 })

                                                       }).catch((err) => {
                                                            ErrorLog.writeLogFile('ComplimentaryBill addSaleHeader', err)
                                                            for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                 let SaleHeaderId = nonSaleHeaderIds[i]
                                                                 BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                      ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                 }).catch(function (err) {
                                                                      ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                 });
                                                            }
                                                            UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                       })
                                             }).catch((err) => {
                                                  ErrorLog.writeLogFile('ComplimentaryBill generateBillNo', err)
                                                  for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                       let SaleHeaderId = nonSaleHeaderIds[i]
                                                       BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                            ErrorLog.writeLogFile(SaleHeaderId, res)
                                                       }).catch(function (err) {
                                                            ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                       });
                                                  }
                                                  UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                             })
                                   }, 1000)
                              }
                         }
                    }
                    else if (res.Status == "invalid") {
                         ErrorLog.writeLogFile('ComplimentaryBill GetOrderBookingBillDetails', res.Error)

                    }
               }).catch(function (err) {
                    ErrorLog.writeLogFile('ComplimentaryBill GetOrderBookingBillDetails', err)

               })
          })
     }
}

$.fn.CreditBill = function (event, saveAndGenerate) {
     debugger;
     let type = event == 1 ? 'IsCreditBill' : 0;
     let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
     let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
     let OrderBookingHeaderId = store.get('OrderBookingHeaderId')
     debugger;
     if (selectedPayment.length > 0) {
          debugger
          Swal.fire({
               title: 'Warning..!',
               text: "Payment is already given, Are you sure want to credit bill?",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Yes',
               cancelButtonText: 'No'
          }).then((result) => {
               if (result.isConfirmed) {
                    saveData(saveAndGenerate, type).then((res) => {
                         showLoading();
                         let Item = {
                              "OrderBookingHeaderId": OrderBookingHeaderId,
                         }
                         $.post(environment.apiURL + '/GetOrderBookingBillDetails', Item, function (data) {
                              debugger
                              let res = JSON.parse(data);
                              if (res.Status == "valid") {
                                   debugger
                                   $("#OrderBookingclose").prop("disabled", true);
                                   if (res.Data[0].length > 0) {
                                        debugger
                                        let SaleHeaderList = res.Data[0]
                                        let SaleDetailList = res.Data[1]

                                        let cashierName = store.get('DisplayName');

                                        let itemDetailList1 = [];
                                        let itemDetailList2 = [];
                                        debugger;
                                        for (let i = 0; i < SaleDetailList.length; i++) {
                                             if (SaleDetailList[i].IsGSTInput == 0) {
                                                  itemDetailList1.push({
                                                       Amount: SaleDetailList[i].Amount,
                                                       GST: SaleDetailList[i].GST,
                                                       GSTPercentage: SaleDetailList[i].GSTPercentage,
                                                       HSNNo: SaleDetailList[i].HSNNo,
                                                       IsGSTInput: SaleDetailList[i].IsGSTInput,
                                                       ItemBrandId: SaleDetailList[i].ItemBrandId,
                                                       ItemGroupId: SaleDetailList[i].ItemGroupId,
                                                       ItemId: SaleDetailList[i].ItemId,
                                                       ItemName: SaleDetailList[i].ItemName,
                                                       NetAmount: SaleDetailList[i].NetAmount,
                                                       Quantity: SaleDetailList[i].Quantity,
                                                       Rate: SaleDetailList[i].Rate,
                                                       SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                                       UOM: SaleDetailList[i].UOM
                                                  })

                                                  ErrorLog.writeLogFile('CreditBill IsGSTInput==0 Item Added', OrderBookingHeaderId);
                                             }
                                             debugger;
                                             if (SaleDetailList[i].IsGSTInput == 1) {
                                                  itemDetailList2.push({
                                                       Amount: SaleDetailList[i].Amount,
                                                       GST: SaleDetailList[i].GST,
                                                       GSTPercentage: SaleDetailList[i].GSTPercentage,
                                                       HSNNo: SaleDetailList[i].HSNNo,
                                                       IsGSTInput: SaleDetailList[i].IsGSTInput,
                                                       ItemBrandId: SaleDetailList[i].ItemBrandId,
                                                       ItemGroupId: SaleDetailList[i].ItemGroupId,
                                                       ItemId: SaleDetailList[i].ItemId,
                                                       ItemName: SaleDetailList[i].ItemName,
                                                       NetAmount: SaleDetailList[i].NetAmount,
                                                       Quantity: SaleDetailList[i].Quantity,
                                                       Rate: SaleDetailList[i].Rate,
                                                       SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                                       UOM: SaleDetailList[i].UOM
                                                  })
                                                  ErrorLog.writeLogFile('CreditBill IsGSTInput==1 Item Added', OrderBookingHeaderId);
                                             }
                                        }
                                        debugger;
                                        let itemAmountdetails = [];
                                        debugger;
                                        debugger;
                                        if (itemDetailList1.length > 0) {
                                             debugger;
                                             let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                             var roundOff1 = RoundOffmethod(NetAmount1);
                                             NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                             itemAmountdetails.push({
                                                  "ItemNO": 1,
                                                  "NetAmount": NetAmount1
                                             })
                                             ErrorLog.writeLogFile('CreditBill itemDetailList1  NetAmount Added', OrderBookingHeaderId);

                                        } debugger;
                                        if (itemDetailList2.length > 0) {
                                             debugger;
                                             let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                             var roundOff2 = RoundOffmethod(NetAmount2);
                                             NetAmount2 = Number(NetAmount2) + Number(roundOff2);

                                             itemAmountdetails.push({
                                                  "ItemNO": 2,
                                                  "NetAmount": NetAmount2
                                             })
                                             ErrorLog.writeLogFile('CreditBill itemDetailList2  NetAmount Added', OrderBookingHeaderId);
                                        }

                                        // const amountDetails = calculationCashCardOnline(itemAmountdetails);
                                        debugger;
                                        if (itemDetailList1.length > 0) {
                                             debugger;
                                             if (store.get('IsOnline') == 'true') {
                                                  loginId = EncrDecrService.decrypt(store.get('Ref'))
                                             }
                                             else {
                                                  loginId = store.get('Ref')
                                             } debugger;
                                             let TotalAmount1 = itemDetailList1.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                             let GST1 = itemDetailList1.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                             let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                             var roundOff1 = RoundOffmethod(NetAmount1);
                                             NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                             let item = {
                                                  "SaleDate": SaleDate,
                                                  "BillTime": Time,
                                                  "POSId": environment.POSId,
                                                  "BillCounterId": store.get('BillCounterId'),
                                                  "ServiceTypeId": ServiceTypeId,
                                                  "ServiceType": ServiceType,
                                                  "BillCounterCode": store.get('BillCounterCode'),
                                                  "CashierName": cashierName,
                                                  "CustomerName": SaleHeaderList[0].CustomerName,
                                                  "PhoneNo": SaleHeaderList[0].PhoneNo,
                                                  "GSTNo": SaleHeaderList[0].GSTNo,
                                                  "RefNo": SaleHeaderList[0].RefNo,
                                                  "BillTokenNo": '',
                                                  "IsWebOrders": 0,
                                                  "TotalAmount": parseFloat(TotalAmount1).toFixed(2),
                                                  "TotalGST": parseFloat(GST1).toFixed(2),
                                                  "RoundOff": roundOff1,
                                                  "NetAmount": parseFloat(NetAmount1).toFixed(2),
                                                  "WaiterId": 0,
                                                  "WaiterName": '',
                                                  "TableNo": 0,
                                                  "SeatNo": '',
                                                  "CompanyId": environment.CompanyId,
                                                  "Source": environment.PageUrl.orderbooking,
                                                  "IsPaid": 0,
                                                  "IsCreditBill": 1,
                                                  "IsGSTInput": 0,
                                                  "IsComplimentary": 0,
                                                  "CashAmount": 0.00,
                                                  "CardAmount": 0.00,
                                                  "OnlineAmount": 0.00,
                                                  "AmountPaid": 0.00,
                                                  "Balance": 0.00,
                                                  "Ref": loginId,
                                                  "CreatedOn": SaleDate + Time,
                                                  "UpdatedOn": SaleDate + Time,
                                                  //  "itemDetail": itemDetailList1
                                             }

                                             ErrorLog.writeLogFile('CreditBill itemDetailList1  generateBillNo Added', OrderBookingHeaderId)
                                             BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                                  async (result) => {
                                                       debugger;
                                                       let res = result.split('_');
                                                       item.BillNo = res[0];
                                                       item.DisplayBillNo = res[1];
                                                       BillNoDetails.push(res[0]);
                                                       //  console.log("generateBillNo 1==", item)
                                                       await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                            async (result) => {
                                                                 debugger
                                                                 item = '';
                                                                 let SaleHeaderId = result
                                                                 let serverSaleHeaderId = SaleHeaderId
                                                                 nonSaleHeaderIds.push(serverSaleHeaderId)
                                                                 let SaleItemDetails = JSON.stringify(itemDetailList1.map(obj => ({
                                                                      SaleHeaderId: SaleHeaderId,
                                                                      ItemId: obj.ItemId,
                                                                      ItemName: obj.ItemName,
                                                                      ItemGroupId: obj.ItemGroupId,
                                                                      ItemBrandId: obj.ItemBrandId,
                                                                      HSNNo: obj.HSNNo,
                                                                      Quantity: obj.Quantity,
                                                                      Rate: obj.Rate,
                                                                      IsGSTInput: obj.IsGSTInput,
                                                                      GSTPercentage: obj.GSTPercentage,
                                                                      IsTakeAway: 0,
                                                                      IsShowHSN: obj.IsShowHSN == 0,
                                                                      UOM: obj.UOM,
                                                                      TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                                      GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                                      NetAmount: obj.NetAmount
                                                                 })
                                                                 ));
                                                                 await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                                      async (result) => {
                                                                           debugger
                                                                           await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                                ErrorLog.writeLogFile('printerService', err)
                                                                           })
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)


                                                                           //console.log(result)
                                                                      }).catch((err) => {
                                                                           ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                           for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                                let SaleHeaderId = nonSaleHeaderIds[i]
                                                                                BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                                     ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                                }).catch(function (err) {
                                                                                     ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                                });
                                                                           }
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                                      })

                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('IsCreditBill addSaleDetailforOrderBooking', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })

                                                  }).catch((err) => {
                                                       ErrorLog.writeLogFile('IsCreditBill generateBillNo', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })
                                        }
                                        debugger;
                                        if (itemDetailList2.length > 0) {
                                             debugger;
                                             if (store.get('IsOnline') == 'true') {
                                                  loginId = EncrDecrService.decrypt(store.get('Ref'))
                                             }
                                             else {
                                                  loginId = store.get('Ref')
                                             }
                                             let TotalAmount2 = itemDetailList2.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                             let GST2 = itemDetailList2.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                             let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                             NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                             var roundOff2 = RoundOffmethod(NetAmount2);
                                             NetAmount2 = Number(NetAmount2) + Number(roundOff2);
                                             debugger;
                                             let item;

                                             item = {
                                                  "SaleDate": SaleDate,
                                                  "BillTime": Time,
                                                  "POSId": environment.POSId,
                                                  "BillCounterId": store.get('BillCounterId'),
                                                  "ServiceTypeId": ServiceTypeId,
                                                  "ServiceType": ServiceType,
                                                  "BillCounterCode": store.get('BillCounterCode'),
                                                  "CashierName": cashierName,
                                                  "CustomerName": SaleHeaderList[0].CustomerName,
                                                  "PhoneNo": SaleHeaderList[0].PhoneNo,
                                                  "GSTNo": SaleHeaderList[0].GSTNo,
                                                  "RefNo": SaleHeaderList[0].RefNo,
                                                  "BillTokenNo": '',
                                                  "IsWebOrders": 0,
                                                  "TotalAmount": parseFloat(TotalAmount2).toFixed(2),
                                                  "TotalGST": parseFloat(GST2).toFixed(2),
                                                  "RoundOff": roundOff2,
                                                  "NetAmount": parseFloat(NetAmount2).toFixed(2),
                                                  "WaiterId": 0,
                                                  "WaiterName": '',
                                                  "TableNo": 0,
                                                  "SeatNo": '',
                                                  "CompanyId": environment.CompanyId,
                                                  "Source": environment.PageUrl.orderbooking,
                                                  "IsPaid": 0,
                                                  "IsCreditBill": 1,
                                                  "IsGSTInput": 1,
                                                  "IsComplimentary": 0,
                                                  "CashAmount": 0.00,
                                                  "CardAmount": 0.00,
                                                  "OnlineAmount": 0.00,
                                                  "AmountPaid": 0.00,
                                                  "Balance": 0.00,
                                                  "Ref": loginId,
                                                  "CreatedOn": SaleDate + Time,
                                                  "UpdatedOn": SaleDate + Time,
                                                  // "itemDetail": itemDetailList2
                                             }

                                             debugger;
                                             setTimeout(function () {
                                                  ErrorLog.writeLogFile('CreditBill itemDetailList2  generateBillNo Added', OrderBookingHeaderId)
                                                  BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                                       async (result) => {
                                                            debugger;
                                                            let res = result.split('_');
                                                            item.BillNo = res[0];
                                                            item.DisplayBillNo = res[1];
                                                            BillNoDetails.push(res[0]);
                                                            // console.log("generateBillNo 1==", item)
                                                            await BillingdbService.addSaleHeaderforOrderBooking(item).then(async (result) => {
                                                                 debugger
                                                                 item = '';
                                                                 let SaleHeaderId = result
                                                                 let serverSaleHeaderId = SaleHeaderId
                                                                 nonSaleHeaderIds.push(serverSaleHeaderId)
                                                                 let SaleItemDetails = JSON.stringify(itemDetailList2.map(obj => ({
                                                                      SaleHeaderId: SaleHeaderId,
                                                                      ItemId: obj.ItemId,
                                                                      ItemName: obj.ItemName,
                                                                      ItemGroupId: obj.ItemGroupId,
                                                                      ItemBrandId: obj.ItemBrandId,
                                                                      HSNNo: obj.HSNNo,
                                                                      Quantity: obj.Quantity,
                                                                      Rate: obj.Rate,
                                                                      IsGSTInput: obj.IsGSTInput,
                                                                      GSTPercentage: obj.GSTPercentage,
                                                                      IsTakeAway: 0,
                                                                      IsShowHSN: obj.IsShowHSN == 0,
                                                                      UOM: obj.UOM,
                                                                      TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                                      GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                                      NetAmount: obj.NetAmount
                                                                 })
                                                                 )); debugger;
                                                                 await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                                      async (result) => {
                                                                           debugger
                                                                           await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                                ErrorLog.writeLogFile('printerService', err)
                                                                           })
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)

                                                                      }).catch((err) => {
                                                                           ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                           for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                                let SaleHeaderId = nonSaleHeaderIds[i]
                                                                                BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                                     ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                                }).catch(function (err) {
                                                                                     ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                                });
                                                                           }
                                                                           UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                                      })

                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('addSaleHeaderforOrderBooking', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })
                                                       }).catch((err) => {
                                                            ErrorLog.writeLogFile('generateBillNo', err)
                                                            for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                 let SaleHeaderId = nonSaleHeaderIds[i]
                                                                 BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                      ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                 }).catch(function (err) {
                                                                      ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                 });
                                                            }
                                                            UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                       })
                                             }, 1000)
                                        }

                                   }
                              }
                              else if (res.Status == "invalid") {
                                   ErrorLog.writeLogFile('IsCreditBill GetOrderBookingBillDetails', res.Error)
                              }
                         }).catch(function (err) {
                              ErrorLog.writeLogFile('IsCreditBill GetOrderBookingBillDetails', err)

                         })
                    })
               }
          })
     }
     else {
          saveData(saveAndGenerate, type).then((res) => {
               showLoading();
               let Item = {
                    "OrderBookingHeaderId": OrderBookingHeaderId,
               }
               $.post(environment.apiURL + '/GetOrderBookingBillDetails', Item, function (data) {
                    debugger
                    let res = JSON.parse(data);
                    if (res.Status == "valid") {
                         debugger
                         if (res.Data[0].length > 0) {
                              debugger
                              let SaleHeaderList = res.Data[0]
                              let SaleDetailList = res.Data[1]

                              let cashierName = store.get('DisplayName');

                              let itemDetailList1 = [];
                              let itemDetailList2 = [];
                              debugger;
                              for (let i = 0; i < SaleDetailList.length; i++) {
                                   if (SaleDetailList[i].IsGSTInput == 0) {
                                        itemDetailList1.push({
                                             Amount: SaleDetailList[i].Amount,
                                             GST: SaleDetailList[i].GST,
                                             GSTPercentage: SaleDetailList[i].GSTPercentage,
                                             HSNNo: SaleDetailList[i].HSNNo,
                                             IsGSTInput: SaleDetailList[i].IsGSTInput,
                                             ItemBrandId: SaleDetailList[i].ItemBrandId,
                                             ItemGroupId: SaleDetailList[i].ItemGroupId,
                                             ItemId: SaleDetailList[i].ItemId,
                                             ItemName: SaleDetailList[i].ItemName,
                                             NetAmount: SaleDetailList[i].NetAmount,
                                             Quantity: SaleDetailList[i].Quantity,
                                             Rate: SaleDetailList[i].Rate,
                                             SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                             UOM: SaleDetailList[i].UOM
                                        })

                                        ErrorLog.writeLogFile('CreditBill IsGSTInput==0 Item Added', OrderBookingHeaderId)
                                   }
                                   debugger;
                                   if (SaleDetailList[i].IsGSTInput == 1) {
                                        itemDetailList2.push({
                                             Amount: SaleDetailList[i].Amount,
                                             GST: SaleDetailList[i].GST,
                                             GSTPercentage: SaleDetailList[i].GSTPercentage,
                                             HSNNo: SaleDetailList[i].HSNNo,
                                             IsGSTInput: SaleDetailList[i].IsGSTInput,
                                             ItemBrandId: SaleDetailList[i].ItemBrandId,
                                             ItemGroupId: SaleDetailList[i].ItemGroupId,
                                             ItemId: SaleDetailList[i].ItemId,
                                             ItemName: SaleDetailList[i].ItemName,
                                             NetAmount: SaleDetailList[i].NetAmount,
                                             Quantity: SaleDetailList[i].Quantity,
                                             Rate: SaleDetailList[i].Rate,
                                             SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                             UOM: SaleDetailList[i].UOM
                                        })
                                        ErrorLog.writeLogFile('CreditBill IsGSTInput==1 Item Added', OrderBookingHeaderId)
                                   }
                              }
                              debugger;
                              let itemAmountdetails = [];
                              debugger;
                              debugger;
                              if (itemDetailList1.length > 0) {
                                   debugger;
                                   let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                   var roundOff1 = RoundOffmethod(NetAmount1);
                                   NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                   itemAmountdetails.push({
                                        "ItemNO": 1,
                                        "NetAmount": NetAmount1
                                   })

                                   ErrorLog.writeLogFile('CreditBill itemDetailList1  NetAmount Added', OrderBookingHeaderId)

                              }
                              if (itemDetailList2.length > 0) {
                                   debugger;
                                   let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                   var roundOff2 = RoundOffmethod(NetAmount2);
                                   NetAmount2 = Number(NetAmount2) + Number(roundOff2);

                                   itemAmountdetails.push({
                                        "ItemNO": 2,
                                        "NetAmount": NetAmount2
                                   })
                                   ErrorLog.writeLogFile('CreditBill itemDetailList2  NetAmount Added', OrderBookingHeaderId)


                              }

                              // const amountDetails = calculationCashCardOnline(itemAmountdetails);
                              debugger;
                              if (itemDetailList1.length > 0) {
                                   debugger;
                                   if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                   }
                                   else {
                                        loginId = store.get('Ref')
                                   } debugger;
                                   let TotalAmount1 = itemDetailList1.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                   let GST1 = itemDetailList1.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                   let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                   var roundOff1 = RoundOffmethod(NetAmount1);
                                   NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                   let item = {
                                        "SaleDate": SaleDate,
                                        "BillTime": Time,
                                        "POSId": environment.POSId,
                                        "BillCounterId": store.get('BillCounterId'),
                                        "ServiceTypeId": ServiceTypeId,
                                        "ServiceType": ServiceType,
                                        "BillCounterCode": store.get('BillCounterCode'),
                                        "CashierName": cashierName,
                                        "CustomerName": SaleHeaderList[0].CustomerName,
                                        "PhoneNo": SaleHeaderList[0].PhoneNo,
                                        "GSTNo": SaleHeaderList[0].GSTNo,
                                        "RefNo": SaleHeaderList[0].RefNo,
                                        "BillTokenNo": '',
                                        "IsWebOrders": 0,
                                        "TotalAmount": parseFloat(TotalAmount1).toFixed(2),
                                        "TotalGST": parseFloat(GST1).toFixed(2),
                                        "RoundOff": roundOff1,
                                        "NetAmount": parseFloat(NetAmount1).toFixed(2),
                                        "WaiterId": 0,
                                        "WaiterName": '',
                                        "TableNo": 0,
                                        "SeatNo": '',
                                        "CompanyId": environment.CompanyId,
                                        "Source": environment.PageUrl.orderbooking,
                                        "IsPaid": 0,
                                        "IsCreditBill": 1,
                                        "IsComplimentary": 0,
                                        "IsGSTInput": 0,
                                        "CashAmount": 0.00,
                                        "CardAmount": 0.00,
                                        "OnlineAmount": 0.00,
                                        "AmountPaid": 0.00,
                                        "Balance": 0.00,
                                        "Ref": loginId,
                                        "CreatedOn": SaleDate + Time,
                                        "UpdatedOn": SaleDate + Time,
                                        //  "itemDetail": itemDetailList1
                                   }
                                   ErrorLog.writeLogFile('CreditBill itemDetailList1  generateBillNo Added', OrderBookingHeaderId)
                                   BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                        async (result) => {
                                             debugger;
                                             let res = result.split('_');
                                             item.BillNo = res[0];
                                             item.DisplayBillNo = res[1];
                                             BillNoDetails.push(res[0]);
                                             //  console.log("generateBillNo 1==", item)
                                             await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                  async (result) => {
                                                       debugger
                                                       item = '';
                                                       let SaleHeaderId = result
                                                       let serverSaleHeaderId = SaleHeaderId
                                                       nonSaleHeaderIds.push(serverSaleHeaderId)
                                                       let SaleItemDetails = JSON.stringify(itemDetailList1.map(obj => ({
                                                            SaleHeaderId: SaleHeaderId,
                                                            ItemId: obj.ItemId,
                                                            ItemName: obj.ItemName,
                                                            ItemGroupId: obj.ItemGroupId,
                                                            ItemBrandId: obj.ItemBrandId,
                                                            HSNNo: obj.HSNNo,
                                                            Quantity: obj.Quantity,
                                                            Rate: obj.Rate,
                                                            IsGSTInput: obj.IsGSTInput,
                                                            GSTPercentage: obj.GSTPercentage,
                                                            IsTakeAway: 0,
                                                            IsShowHSN: obj.IsShowHSN == 0,
                                                            UOM: obj.UOM,
                                                            TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                            GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                            NetAmount: obj.NetAmount
                                                       })
                                                       ));
                                                       await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                            async (result) => {
                                                                 debugger
                                                                 await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                      ErrorLog.writeLogFile('printerService', err)
                                                                 })
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)


                                                                 //console.log(result)
                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })

                                                  }).catch((err) => {
                                                       ErrorLog.writeLogFile('IsCreditBill addSaleHeader', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })

                                        }).catch((err) => {
                                             ErrorLog.writeLogFile('IsCreditBill generateBillNo', err)
                                             for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                  let SaleHeaderId = nonSaleHeaderIds[i]
                                                  BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                       ErrorLog.writeLogFile(SaleHeaderId, res)
                                                  }).catch(function (err) {
                                                       ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                  });
                                             }
                                             UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                        })
                              }
                              debugger;
                              if (itemDetailList2.length > 0) {
                                   debugger;
                                   if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                   }
                                   else {
                                        loginId = store.get('Ref')
                                   }
                                   let TotalAmount2 = itemDetailList2.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                   let GST2 = itemDetailList2.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                   let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                   var roundOff2 = RoundOffmethod(NetAmount2);
                                   NetAmount2 = Number(NetAmount2) + Number(roundOff2);
                                   debugger;
                                   let item;

                                   item = {
                                        "SaleDate": SaleDate,
                                        "BillTime": Time,
                                        "POSId": environment.POSId,
                                        "BillCounterId": store.get('BillCounterId'),
                                        "ServiceTypeId": ServiceTypeId,
                                        "ServiceType": ServiceType,
                                        "BillCounterCode": store.get('BillCounterCode'),
                                        "CashierName": cashierName,
                                        "CustomerName": SaleHeaderList[0].CustomerName,
                                        "PhoneNo": SaleHeaderList[0].PhoneNo,
                                        "GSTNo": SaleHeaderList[0].GSTNo,
                                        "RefNo": SaleHeaderList[0].RefNo,
                                        "BillTokenNo": '',
                                        "IsWebOrders": 0,
                                        "TotalAmount": parseFloat(TotalAmount2).toFixed(2),
                                        "TotalGST": parseFloat(GST2).toFixed(2),
                                        "RoundOff": roundOff2,
                                        "NetAmount": parseFloat(NetAmount2).toFixed(2),
                                        "WaiterId": 0,
                                        "WaiterName": '',
                                        "TableNo": 0,
                                        "SeatNo": '',
                                        "CompanyId": environment.CompanyId,
                                        "Source": environment.PageUrl.orderbooking,
                                        "IsPaid": 0,
                                        "IsCreditBill": 1,
                                        "IsComplimentary": 0,
                                        "IsGSTInput": 1,
                                        "CashAmount": 0.00,
                                        "CardAmount": 0.00,
                                        "OnlineAmount": 0.00,
                                        "AmountPaid": 0.00,
                                        "Balance": 0.00,
                                        "Ref": loginId,
                                        "CreatedOn": SaleDate + Time,
                                        "UpdatedOn": SaleDate + Time,
                                        // "itemDetail": itemDetailList2
                                   }

                                   debugger;
                                   setTimeout(function () {
                                        ErrorLog.writeLogFile('CreditBill itemDetailList2  generateBillNo Added', OrderBookingHeaderId)
                                        BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                             async (result) => {
                                                  debugger;
                                                  let res = result.split('_');
                                                  item.BillNo = res[0];
                                                  item.DisplayBillNo = res[1];
                                                  BillNoDetails.push(res[0]);
                                                  // console.log("generateBillNo 1==", item)
                                                  await BillingdbService.addSaleHeaderforOrderBooking(item).then(async (result) => {
                                                       debugger
                                                       item = '';
                                                       let SaleHeaderId = result
                                                       let serverSaleHeaderId = SaleHeaderId
                                                       nonSaleHeaderIds.push(serverSaleHeaderId)
                                                       let SaleItemDetails = JSON.stringify(itemDetailList2.map(obj => ({
                                                            SaleHeaderId: SaleHeaderId,
                                                            ItemId: obj.ItemId,
                                                            ItemName: obj.ItemName,
                                                            ItemGroupId: obj.ItemGroupId,
                                                            ItemBrandId: obj.ItemBrandId,
                                                            HSNNo: obj.HSNNo,
                                                            Quantity: obj.Quantity,
                                                            Rate: obj.Rate,
                                                            IsGSTInput: obj.IsGSTInput,
                                                            GSTPercentage: obj.GSTPercentage,
                                                            IsTakeAway: 0,
                                                            IsShowHSN: obj.IsShowHSN == 0,
                                                            UOM: obj.UOM,
                                                            TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                            GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                            NetAmount: obj.NetAmount
                                                       })
                                                       )); debugger;
                                                       await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                            async (result) => {
                                                                 debugger
                                                                 await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                      ErrorLog.writeLogFile('printerService', err)
                                                                 })
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, 1)

                                                            }).catch((err) => {
                                                                 ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })

                                                  }).catch((err) => {
                                                       ErrorLog.writeLogFile('addSaleHeaderforOrderBooking', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })
                                             }).catch((err) => {
                                                  ErrorLog.writeLogFile('generateBillNo', err)
                                                  for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                       let SaleHeaderId = nonSaleHeaderIds[i]
                                                       BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                            ErrorLog.writeLogFile(SaleHeaderId, res)
                                                       }).catch(function (err) {
                                                            ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                       });
                                                  }
                                                  UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                             })
                                   }, 1000)
                              }

                         }
                    }
                    else if (res.Status == "invalid") {
                         ErrorLog.writeLogFile('IsCreditBill GetOrderBookingBillDetails', res.Error)
                    }
               }).catch(function (err) {
                    ErrorLog.writeLogFile('IsCreditBill GetOrderBookingBillDetails', err)

               })
          })
     }
}

$.fn.GenerateBill = function (event, saveAndGenerate) {
     debugger;
     let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
     let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
     let OrderBookingHeaderId = store.get('OrderBookingHeaderId')
     if (document.getElementById('BalanceAmt').innerHTML == '0.00') {
          saveData(saveAndGenerate, 0).then((res) => {
               showLoading();

               let Item = {
                    //"POSId": environment.POSId,
                    //"BillCounterId": store.get('BillCounterId'),
                    //"CompanyId": environment.CompanyId,
                    //"SaleDate": SaleDate
                    "OrderBookingHeaderId": OrderBookingHeaderId,
               }
               $.post(environment.apiURL + '/GetOrderBookingBillDetails', Item, function (data) {
                    debugger
                    let res = JSON.parse(data);
                    if (res.Status == "valid") {
                         debugger
                         $("#OrderBookingclose").prop("disabled", true);
                         if (res.Data[0].length > 0) {
                              debugger
                              let SaleHeaderList = res.Data[0]
                              //OrderBookingHeaderId=SaleHeaderList[0].SaleHeaderId
                              // console.log(SaleHeaderList, "HeaderList")
                              let SaleDetailList = res.Data[1]

                              let cashierName = store.get('DisplayName');

                              let itemDetailList1 = [];
                              let itemDetailList2 = [];

                              for (let i = 0; i < SaleDetailList.length; i++) {
                                   if (SaleDetailList[i].IsGSTInput == 0) {
                                        itemDetailList1.push({
                                             Amount: SaleDetailList[i].Amount,
                                             GST: SaleDetailList[i].GST,
                                             GSTPercentage: SaleDetailList[i].GSTPercentage,
                                             HSNNo: SaleDetailList[i].HSNNo,
                                             IsGSTInput: SaleDetailList[i].IsGSTInput,
                                             ItemBrandId: SaleDetailList[i].ItemBrandId,
                                             ItemGroupId: SaleDetailList[i].ItemGroupId,
                                             ItemId: SaleDetailList[i].ItemId,
                                             ItemName: SaleDetailList[i].ItemName,
                                             NetAmount: SaleDetailList[i].NetAmount,
                                             Quantity: SaleDetailList[i].Quantity,
                                             Rate: SaleDetailList[i].Rate,
                                             SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                             UOM: SaleDetailList[i].UOM
                                        })
                                        ErrorLog.writeLogFile('GenerateBill IsGSTInput==0 Item Added', OrderBookingHeaderId);
                                   }
                                   debugger;
                                   if (SaleDetailList[i].IsGSTInput == 1) {
                                        itemDetailList2.push({
                                             Amount: SaleDetailList[i].Amount,
                                             GST: SaleDetailList[i].GST,
                                             GSTPercentage: SaleDetailList[i].GSTPercentage,
                                             HSNNo: SaleDetailList[i].HSNNo,
                                             IsGSTInput: SaleDetailList[i].IsGSTInput,
                                             ItemBrandId: SaleDetailList[i].ItemBrandId,
                                             ItemGroupId: SaleDetailList[i].ItemGroupId,
                                             ItemId: SaleDetailList[i].ItemId,
                                             ItemName: SaleDetailList[i].ItemName,
                                             NetAmount: SaleDetailList[i].NetAmount,
                                             Quantity: SaleDetailList[i].Quantity,
                                             Rate: SaleDetailList[i].Rate,
                                             SaleHeaderId: SaleDetailList[i].SaleHeaderId,
                                             UOM: SaleDetailList[i].UOM
                                        })
                                        ErrorLog.writeLogFile('GenerateBill IsGSTInput==1 Item Added', OrderBookingHeaderId);
                                   }
                              }

                              let itemAmountdetails = [];

                              if (itemDetailList1.length > 0) {
                                   debugger;
                                   let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                   var roundOff1 = RoundOffmethod(NetAmount1);
                                   NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                   itemAmountdetails.push({
                                        "ItemNO": 1,
                                        "NetAmount": NetAmount1
                                   })
                                   ErrorLog.writeLogFile('GenerateBill itemDetailList1  NetAmount Added', OrderBookingHeaderId);

                              }
                              if (itemDetailList2.length > 0) {
                                   debugger;
                                   let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                   var roundOff2 = RoundOffmethod(NetAmount2);
                                   NetAmount2 = Number(NetAmount2) + Number(roundOff2);

                                   itemAmountdetails.push({
                                        "ItemNO": 2,
                                        "NetAmount": NetAmount2
                                   })
                                   ErrorLog.writeLogFile('GenerateBill itemDetailList2  NetAmount Added', OrderBookingHeaderId);
                              }

                              const amountDetails = calculationCashCardOnline(itemAmountdetails);


                              if (itemDetailList1.length > 0) {
                                   debugger;
                                   if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                   }
                                   else {
                                        loginId = store.get('Ref')
                                   } debugger;
                                   let TotalAmount1 = itemDetailList1.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                   let GST1 = itemDetailList1.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                   let NetAmount1 = itemDetailList1.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount1 = parseFloat(NetAmount1).toFixed(2);
                                   var roundOff1 = RoundOffmethod(NetAmount1);
                                   NetAmount1 = Number(NetAmount1) + Number(roundOff1);

                                   let item = {
                                        "SaleDate": SaleDate,
                                        "BillTime": Time,
                                        "POSId": environment.POSId,
                                        "BillCounterId": store.get('BillCounterId'),
                                        "ServiceTypeId": ServiceTypeId,
                                        "ServiceType": ServiceType,
                                        "BillCounterCode": store.get('BillCounterCode'),
                                        "CashierName": cashierName,
                                        "CustomerName": SaleHeaderList[0].CustomerName,
                                        "PhoneNo": SaleHeaderList[0].PhoneNo,
                                        "GSTNo": SaleHeaderList[0].GSTNo,
                                        "RefNo": SaleHeaderList[0].RefNo,
                                        "BillTokenNo": '',
                                        "IsWebOrders": 0,
                                        "TotalAmount": parseFloat(TotalAmount1).toFixed(2),
                                        "TotalGST": parseFloat(GST1).toFixed(2),
                                        "RoundOff": roundOff1,
                                        "NetAmount": parseFloat(NetAmount1).toFixed(2),
                                        "WaiterId": 0,
                                        "WaiterName": '',
                                        "TableNo": 0,
                                        "SeatNo": '',
                                        "CompanyId": environment.CompanyId,
                                        "Source": environment.PageUrl.orderbooking,
                                        "IsPaid": 1,
                                        "IsCreditBill": 0,
                                        "IsGSTInput": 0,
                                        "IsComplimentary": 0,
                                        "CashAmount": amountDetails[0].CashAmount,
                                        "CardAmount": amountDetails[0].CardAmount,
                                        "OnlineAmount": amountDetails[0].OnlineAmount,
                                        "AmountPaid": parseFloat(NetAmount1).toFixed(2),
                                        "Balance": 0.00,
                                        "Ref": loginId,
                                        "CreatedOn": SaleDate + Time,
                                        "UpdatedOn": SaleDate + Time,
                                        //  "itemDetail": itemDetailList1
                                   }


                                   ErrorLog.writeLogFile('GenerateBill itemDetailList1  generateBillNo Added', OrderBookingHeaderId);
                                   BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                        async (result) => {
                                             debugger;
                                             let res = result.split('_');
                                             item.BillNo = res[0];
                                             item.DisplayBillNo = res[1];
                                             BillNoDetails.push(res[0]);
                                             //  console.log("generateBillNo 1==", item)
                                             await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                  async (result) => {
                                                       debugger
                                                       item = '';
                                                       let SaleHeaderId = result
                                                       let serverSaleHeaderId = SaleHeaderId
                                                       nonSaleHeaderIds.push(serverSaleHeaderId)
                                                       let SaleItemDetails = JSON.stringify(itemDetailList1.map(obj => ({
                                                            SaleHeaderId: SaleHeaderId,
                                                            ItemId: obj.ItemId,
                                                            ItemName: obj.ItemName,
                                                            ItemGroupId: obj.ItemGroupId,
                                                            ItemBrandId: obj.ItemBrandId,
                                                            HSNNo: obj.HSNNo,
                                                            Quantity: obj.Quantity,
                                                            Rate: obj.Rate,
                                                            IsGSTInput: obj.IsGSTInput,
                                                            GSTPercentage: obj.GSTPercentage,
                                                            IsTakeAway: 0,
                                                            IsShowHSN: obj.IsShowHSN == 0,
                                                            UOM: obj.UOM,
                                                            TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                            GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                            NetAmount: obj.NetAmount
                                                       })
                                                       ));
                                                       await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                            async (result) => {
                                                                 debugger
                                                                 await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                      ErrorLog.writeLogFile('printerService', err)
                                                                 })
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 0, 1)


                                                                 //console.log(result)
                                                            }).catch((err) => {
                                                                 debugger
                                                                 ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                 for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                      let SaleHeaderId = nonSaleHeaderIds[i]
                                                                      BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                           ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                      }).catch(function (err) {
                                                                           ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                      });
                                                                 }
                                                                 //nonSaleHeaderIds=[]
                                                                 UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                            })

                                                  }).catch((err) => {
                                                       debugger
                                                       ErrorLog.writeLogFile('addSaleHeaderforOrderBooking', err)
                                                       for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                            let SaleHeaderId = nonSaleHeaderIds[i]
                                                            BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                 ErrorLog.writeLogFile(SaleHeaderId, res)
                                                            }).catch(function (err) {
                                                                 ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                            });
                                                       }
                                                       UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  })

                                        }).catch((err) => {
                                             debugger
                                             ErrorLog.writeLogFile('generateBillNo', err)
                                             for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                  let SaleHeaderId = nonSaleHeaderIds[i]
                                                  BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                       ErrorLog.writeLogFile(SaleHeaderId, res)
                                                  }).catch(function (err) {
                                                       ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                  });
                                             }
                                             UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                        })


                              }
                              debugger;
                              if (itemDetailList2.length > 0) {
                                   debugger;
                                   if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                   }
                                   else {
                                        loginId = store.get('Ref')
                                   }
                                   let TotalAmount2 = itemDetailList2.map(row => (row.Amount)).reduce((prev, next) => prev + next);
                                   let GST2 = itemDetailList2.map(row => (row.GST)).reduce((prev, next) => prev + next);
                                   let NetAmount2 = itemDetailList2.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
                                   NetAmount2 = parseFloat(NetAmount2).toFixed(2);
                                   var roundOff2 = RoundOffmethod(NetAmount2);
                                   NetAmount2 = Number(NetAmount2) + Number(roundOff2);
                                   debugger;
                                   let item;
                                   if (amountDetails.length == 1) {
                                        item = {
                                             "SaleDate": SaleDate,
                                             "BillTime": Time,
                                             "POSId": environment.POSId,
                                             "BillCounterId": store.get('BillCounterId'),
                                             "ServiceTypeId": ServiceTypeId,
                                             "ServiceType": ServiceType,
                                             "BillCounterCode": store.get('BillCounterCode'),
                                             "CashierName": cashierName,
                                             "CustomerName": SaleHeaderList[0].CustomerName,
                                             "PhoneNo": SaleHeaderList[0].PhoneNo,
                                             "GSTNo": SaleHeaderList[0].GSTNo,
                                             "RefNo": SaleHeaderList[0].RefNo,
                                             "BillTokenNo": '',
                                             "IsWebOrders": 0,
                                             "TotalAmount": parseFloat(TotalAmount2).toFixed(2),
                                             "TotalGST": parseFloat(GST2).toFixed(2),
                                             "RoundOff": roundOff2,
                                             "NetAmount": parseFloat(NetAmount2).toFixed(2),
                                             "WaiterId": 0,
                                             "WaiterName": '',
                                             "TableNo": 0,
                                             "SeatNo": '',
                                             "CompanyId": environment.CompanyId,
                                             "Source": environment.PageUrl.orderbooking,
                                             "IsPaid": 1,
                                             "IsCreditBill": 0,
                                             "IsGSTInput": 1,
                                             "IsComplimentary": 0,
                                             "CashAmount": amountDetails[0].CashAmount,
                                             "CardAmount": amountDetails[0].CardAmount,
                                             "OnlineAmount": amountDetails[0].OnlineAmount,
                                             "AmountPaid": parseFloat(NetAmount2).toFixed(2),
                                             "Balance": 0.00,
                                             "Ref": loginId,
                                             "CreatedOn": SaleDate + Time,
                                             "UpdatedOn": SaleDate + Time,
                                             // "itemDetail": itemDetailList2
                                        }

                                   } else {
                                        item = {
                                             "SaleDate": SaleDate,
                                             "BillTime": Time,
                                             "POSId": environment.POSId,
                                             "BillCounterId": store.get('BillCounterId'),
                                             "ServiceTypeId": ServiceTypeId,
                                             "ServiceType": ServiceType,
                                             "BillCounterCode": store.get('BillCounterCode'),
                                             "CashierName": cashierName,
                                             "CustomerName": SaleHeaderList[0].CustomerName,
                                             "PhoneNo": SaleHeaderList[0].PhoneNo,
                                             "GSTNo": SaleHeaderList[0].GSTNo,
                                             "RefNo": SaleHeaderList[0].RefNo,
                                             "BillTokenNo": '',
                                             "IsWebOrders": 0,
                                             "TotalAmount": parseFloat(TotalAmount2).toFixed(2),
                                             "TotalGST": parseFloat(GST2).toFixed(2),
                                             "RoundOff": roundOff2,
                                             "NetAmount": parseFloat(NetAmount2).toFixed(2),
                                             "WaiterId": 0,
                                             "WaiterName": '',
                                             "TableNo": 0,
                                             "SeatNo": '',
                                             "CompanyId": environment.CompanyId,
                                             "Source": environment.PageUrl.orderbooking,
                                             "IsPaid": 1,
                                             "IsCreditBill": 0,
                                             "IsComplimentary": 0,
                                             "IsGSTInput": 1,
                                             "CashAmount": amountDetails[1].CashAmount,
                                             "CardAmount": amountDetails[1].CardAmount,
                                             "OnlineAmount": amountDetails[1].OnlineAmount,
                                             "AmountPaid": parseFloat(NetAmount2).toFixed(2),
                                             "Balance": 0.00,
                                             "Ref": loginId,
                                             "CreatedOn": SaleDate + Time,
                                             "UpdatedOn": SaleDate + Time,
                                             // "itemDetail": itemDetailList2
                                        }

                                   }
                                   debugger;

                                   setTimeout(function () {
                                        ErrorLog.writeLogFile('GenerateBill itemDetailList1  generateBillNo Added', OrderBookingHeaderId);
                                        BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                             async (result) => {
                                                  debugger;
                                                  let res = result.split('_');
                                                  item.BillNo = res[0];
                                                  item.DisplayBillNo = res[1];
                                                  BillNoDetails.push(res[0]);
                                                  // console.log("generateBillNo 1==", item)
                                                  await BillingdbService.addSaleHeaderforOrderBooking(item).then(
                                                       async (result) => {
                                                            debugger
                                                            item = '';
                                                            let SaleHeaderId = result
                                                            let serverSaleHeaderId = SaleHeaderId
                                                            nonSaleHeaderIds.push(serverSaleHeaderId)
                                                            let SaleItemDetails = JSON.stringify(itemDetailList2.map(obj => ({
                                                                 SaleHeaderId: SaleHeaderId,
                                                                 ItemId: obj.ItemId,
                                                                 ItemName: obj.ItemName,
                                                                 ItemGroupId: obj.ItemGroupId,
                                                                 ItemBrandId: obj.ItemBrandId,
                                                                 HSNNo: obj.HSNNo,
                                                                 Quantity: obj.Quantity,
                                                                 Rate: obj.Rate,
                                                                 IsGSTInput: obj.IsGSTInput,
                                                                 GSTPercentage: obj.GSTPercentage,
                                                                 IsTakeAway: 0,
                                                                 IsShowHSN: obj.IsShowHSN == 0,
                                                                 UOM: obj.UOM,
                                                                 TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                                 GSTAmount: parseFloat(obj.GST).toFixed(2),
                                                                 NetAmount: obj.NetAmount
                                                            })
                                                            )); debugger;
                                                            await BillingdbService.addSaleDetailforOrderBooking(SaleItemDetails).then(
                                                                 async (result) => {
                                                                      debugger
                                                                      await printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                                                           ErrorLog.writeLogFile('printerService', err)
                                                                      })
                                                                      UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 0, 1)

                                                                 }).catch((err) => {
                                                                      debugger
                                                                      ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                                                                      for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                           let SaleHeaderId = nonSaleHeaderIds[i]
                                                                           BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                                ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                           }).catch(function (err) {
                                                                                ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                           });
                                                                      }
                                                                      //  nonSaleHeaderIds=[]
                                                                      UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                                 })

                                                       }).catch((err) => {
                                                            debugger
                                                            ErrorLog.writeLogFile('addSaleHeaderforOrderBooking', err)
                                                            for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                                 let SaleHeaderId = nonSaleHeaderIds[i]
                                                                 BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                                      ErrorLog.writeLogFile(SaleHeaderId, res)
                                                                 }).catch(function (err) {
                                                                      ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                                 });
                                                            }
                                                            // nonSaleHeaderIds=[]
                                                            UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                       })

                                             }).catch((err) => {
                                                  ErrorLog.writeLogFile('generateBillNo', err)
                                                  for (let i = 0; i < nonSaleHeaderIds.length; i++) {
                                                       let SaleHeaderId = nonSaleHeaderIds[i]
                                                       BillingdbService.deleteSaleforOrderBooking(SaleHeaderId).then((res) => {
                                                            ErrorLog.writeLogFile(SaleHeaderId, res)
                                                       }).catch(function (err) {
                                                            ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                                                       });
                                                  }
                                                  UpdateOrderBookingSaleHeader(OrderBookingHeaderId, 1, 0)
                                                  // nonSaleHeaderIds=[]
                                             })

                                   }, 1000)

                              }

                         }
                    }
                    else if (res.Status == "invalid") {
                         ErrorLog.writeLogFile('GetOrderBookingBillDetails', res.Error)

                    }
               }).catch(function (err) {
                    ErrorLog.writeLogFile('GetOrderBookingBillDetails', err)

               })
          })
     }
     else {

          Swal.fire({
               title: 'Warning..!',
               text: "Please Complete the payment before generating bill",
               icon: 'warning',
               showCancelButton: false,
               confirmButtonText: 'Ok'
          })
     }
}

function UpdateOrderBookingSaleHeader(OrderBookingHeaderId, type, IsCompleted) {
     debugger
     showLoading();
     if (store.get('IsOnline') == 'true') {
          loginId = store.get('Ref')
     }
     else {
          loginId = EncrDecrService.encrypt(store.get('Ref'))
     }

     let Billnoitems = '';
     if (BillNoDetails.length == 1) {
          Billnoitems = '"' + BillNoDetails[0] + '"';

     } else if (BillNoDetails.length == 2) {
          Billnoitems = '"' + BillNoDetails[0] + ',' + BillNoDetails[1] + '"';
     }
     let Item = {
          "IsCompleted": IsCompleted == 1 ? 1 : 0,
          "IsCreditBill": type == 'IsCreditBill' ? 1 : 0,
          "IsComplimentary": type == 'IsComplimentary' ? 1 : 0,
          "BillNo": Billnoitems,
          "OrderBookingHeaderId": JSON.stringify(OrderBookingHeaderId),
          "Source": environment.PageUrl.orderbooking,
          "Ref": loginId
     }
     $.post(environment.apiURL + '/UpdateOrderBookingSaleHeader', Item, function (data) {
          debugger
          let res = JSON.parse(data);
          if (res.Status == "valid") {
               store.set('isWindowOpen', false)
               if (type == 'IsCreditBill') {
                    store.set("BulkOrderRefresh", 'Refresh');
                    Swal.fire({
                         icon: 'success',
                         allowEscapeKey: false,
                         allowOutsideClick: false,
                         title: 'Bill Changed as CreditBill SuccessFully',
                         showConfirmButton: false,
                         timer: 1500
                    }).then((res => {
                         window.close();
                    }))
               }
               else if (type == 'IsComplimentary') {
                    store.set("BulkOrderRefresh", 'Refresh');
                    Swal.fire({
                         icon: 'success',
                         allowEscapeKey: false,
                         allowOutsideClick: false,
                         title: 'Bill Changed as ComplimentaryBill SuccessFully',
                         showConfirmButton: false,
                         timer: 1500
                    }).then((res => {
                         window.close();
                    }))

               }
               else if (type == 0) {
                    debugger
                    store.set("BulkOrderRefresh", 'Refresh');
                    Swal.fire({
                         icon: 'success',
                         allowEscapeKey: false,
                         allowOutsideClick: false,
                         title: 'Bill Generated SuccessFully',
                         showConfirmButton: false,
                         timer: 1500
                    }).then((res => {
                         window.close();
                    }))

               }
               else if (type == 1) {
                    debugger
                    setTimeout(() => {
                         Swal.fire({
                              icon: 'error',
                              title: 'Bill Generated Failed! Try Again Later..!',
                              confirmButtonText: 'Ok',
                              allowOutsideClick: false
                         }).then((res => {
                              //   nonSaleHeaderIds=[]
                              window.close()
                         }))
                    }, 100);

               }

               getBulkOrderBalancePaymentDetail()
          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('UpdateOrderBookingSaleHeader', res.Error)

               Swal.fire({
                    title: 'UpdateOrderBookingSaleHeader Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('UpdateOrderBookingSaleHeader', err)

          Swal.fire({
               title: 'UpdateOrderBookingSaleHeader Failed',
               icon: 'error',
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'OK'
          })
     })
};

$.fn.SaveVesselReport = function (saveAndGenerate, type) {
     saveData(saveAndGenerate, type)
}

$.fn.VesselReport = function (Ordertype, orderBookingHeaderId) {
     debugger
     if (selectedVessels.length == 0) {
          document.getElementById('VessleReport').disabled = true;
     } else {
          document.getElementById('VessleReport').disabled = false;
     }
     showLoading();
     let Item = {
          "OrderBookingHeaderId": Ordertype == 'NewOrder' ? orderBookingHeaderId : store.get('OrderBookingHeaderId'),
          "CompanyId": environment.CompanyId,
          "BillCounterId": store.get('BillCounterId')
     }

     $.post(environment.apiURL + '/GetOrderBookingVesselReport', Item, function (data) {
          debugger
          let res = JSON.parse(data);
          if (res.Status == "valid") {
               debugger
               Swal.fire({
                    title: 'Vessel Report Print Successfully',
                    icon: 'success',
                    confirmButtonColor: '#5cb85c',
                    confirmButtonText: 'OK',
                    timer: 1500
               })
               ipcRenderer.invoke('VesselReport', res.Data);
               if (Ordertype == 'NewOrder') {
                    ClearData();
                    window.close();
               }
          }
          else if (res.Status == "invalid") {
               Swal.fire({
                    title: 'Vessel Report not printed.please contact to administrator.',
                    icon: 'error',
                    confirmButtonColor: '#5cb85c',
                    confirmButtonText: 'OK',
                    // timer: 1500
               })
               ErrorLog.writeLogFile('GetOrderBookingVesselReport', res.Error)
          }
     }).catch(function (err) {
          Swal.fire({
               title: 'Vessel Report not printed.please contact to administrator.',
               icon: 'error',
               confirmButtonColor: '#5cb85c',
               confirmButtonText: 'OK',
               //  timer: 1500
          })
          ErrorLog.writeLogFile('GetOrderBookingVesselReport', err)
     })
}

$.fn.SaveEstimationReport = function (saveAndGenerate, type) {
     debugger
     if (document.getElementById('IsTypeCancel').innerHTML == "Cancelled Bill") {
          let Ordertype = 'cancel';
          let OrderBookingHeaderId = store.get('OrderBookingHeaderId');
          $(this).EstimationReport(Ordertype, OrderBookingHeaderId);
     } else {
          saveData(saveAndGenerate, type)
     }

}

$.fn.EstimationReport = function (Ordertype, orderBookingHeaderId) {
     debugger;
     //    console.log('EstimationReport type  =', Ordertype, ' , orderBookingHeaderId =', orderBookingHeaderId);
     showLoading();
     //  Ordertype == 'NewOrder' , 'UpdateOrder' , 'EstimationReport' , 'VesselReport'
     let Item = {
          "OrderBookingHeaderId": Ordertype == 'NewOrder' ? orderBookingHeaderId : store.get('OrderBookingHeaderId'),
          "CompanyId": environment.CompanyId,
          "TodayDate": store.get('todayDate'),
          "BillCounterId": store.get('BillCounterId')
     }

     $.post(environment.apiURL + '/GetOrderBookingEstimationReport', Item, function (data) {
          debugger
          let res = JSON.parse(data);

          if (res.Status == "valid") {
               Swal.fire({
                    title: 'Estimation Print Successfully',
                    icon: 'success',
                    confirmButtonColor: '#5cb85c',
                    confirmButtonText: 'OK',
                    timer: 1500
               })
               ipcRenderer.invoke('OrderBookingEstimateReport', res.Data);;
               if (Ordertype == 'NewOrder') {
                    ClearData();
                    window.close();
               }
          }
          else if (res.Status == "invalid") {
               Swal.fire({
                    title: 'Estimation Print not printed.please contact to administrator.',
                    icon: 'error',
                    confirmButtonColor: '#5cb85c',
                    confirmButtonText: 'OK',
                    //   timer: 1500
               })
               ErrorLog.writeLogFile('GetOrderBookingEstimationReport', res.Error)
          }
     }).catch(function (err) {
          Swal.fire({
               title: 'Estimation Print not printed.please contact to administrator.',
               icon: 'error',
               confirmButtonColor: '#5cb85c',
               confirmButtonText: 'OK',
               //   timer: 1500
          })
          ErrorLog.writeLogFile('GetOrderBookingEstimationReport', err)
     })
}

function getBulkOrderBalancePaymentDetail() {
     debugger;
     // showLoading();
     const date = new Date();
     let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
     let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
     let list = {
          "BillCounterId": store.get('BillCounterId'),
          "POSId": environment.POSId,
          "CompanyId": environment.CompanyId,
          "SaleDate": SaleDate
     }

     debugger;
     $.post(environment.apiURL + '/GetBulkOrderBalancePaymentDetail', list, function (datas) {
          let res = JSON.parse(datas);
          if (res.Status == "valid") {
               debugger;
               let balanceDetails = res.Data[0];

               let item1 = {
                    "BillCounterId": store.get('BillCounterId'),
                    "POSId": environment.POSId,
                    "CompanyId": environment.CompanyId,
                    "SaleDate": SaleDate,
                    "AdvanceCount": 0,
                    // "AdvanceCount": balanceDetails[0].AdvanceCount,
                    "POSId": environment.POSId,
                    "BillCounterId": store.get('BillCounterId'),
                    "CompanyId": environment.CompanyId,
                    "IsAdvance": 0,
                    "CashAmount": balanceDetails[0].CashAmount,
                    "CardAmount": balanceDetails[0].CardAmount,
                    "OnlineAmount": balanceDetails[0].OnlineAmount,
                    "AmountPaid": balanceDetails[0].PaidAmount,
                    "CreatedOn": SaleDate + Time,
                    "UpdatedOn": SaleDate + Time,
               }

               BillingdbService.addBulkOrderBookingAdvancePayments(item1).then(async (result) => {
                    debugger;
                    // resolve("")
               }).catch((err) => {
                    ErrorLog.writeLogFile('addBulkOrderBookingAdvancePayments ', err)

               })

               let advanceDetails = res.Data[1];
               let item2 = {
                    "SaleDate": SaleDate,
                    "POSId": environment.POSId,
                    "BillCounterId": store.get('BillCounterId'),
                    "CompanyId": environment.CompanyId,
                    "CashAmount": advanceDetails[0].CashAmount,
                    "CardAmount": advanceDetails[0].CardAmount,
                    "OnlineAmount": advanceDetails[0].OnlineAmount,
                    "AmountPaid": advanceDetails[0].AdvanceAmount,
                    "CreatedOn": SaleDate + Time,
                    "UpdatedOn": SaleDate + Time,
               }
               debugger;

               BillingdbService.addBulkOrderBookingAdjustmentsPayments(item2).then(async (result) => {
                    debugger;
                    // resolve("")
               }).catch((err) => {
                    ErrorLog.writeLogFile('addBulkOrderBookingAdjustmentsPayments ', err)

               })
          }
     })
};

function getBulkOrderAdvancePaymentDetail(saveAndGenerate, Ordertype, OrderBookingHeaderId) {

     debugger;
     const date = new Date();
     let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
     let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
     let list = {
          "BillCounterId": store.get('BillCounterId'),
          "POSId": environment.POSId,
          "CompanyId": environment.CompanyId,
          "SaleDate": SaleDate
     }
     debugger;
     $.post(environment.apiURL + '/GetBulkOrderAdvancePaymentDetail', list, function (datas) {
          let ress = JSON.parse(datas);
          if (ress.Status == "valid") {
               let array = ress.Data[0];
               let item = {
                    "BillCounterId": store.get('BillCounterId'),
                    "POSId": environment.POSId,
                    "CompanyId": environment.CompanyId,
                    "SaleDate": SaleDate,
                    "AdvanceCount": array[0].AdvanceCount,
                    "POSId": environment.POSId,
                    "BillCounterId": store.get('BillCounterId'),
                    "CompanyId": environment.CompanyId,
                    "IsAdvance": 1,
                    "CashAmount": array[0].CashAmount,
                    "CardAmount": array[0].CardAmount,
                    "OnlineAmount": array[0].OnlineAmount,
                    "AmountPaid": array[0].AdvanceAmount,
                    "CreatedOn": SaleDate + Time,
                    "UpdatedOn": SaleDate + Time,
               }
               debugger;
               BillingdbService.addBulkOrderBookingAdvancePayments(item).then(
                    async (result) => {
                         debugger;
                         Swal.fire({
                              icon: 'success',
                              allowEscapeKey: false,
                              allowOutsideClick: false,
                              title: 'Bill has been Updated',
                              showConfirmButton: false,
                              timer: 1500
                         }).then((res) => {
                              if (!saveAndGenerate) {
                                   debugger;
                                   if (Ordertype == 'EstimationReport' || Ordertype == 'NewOrder') {
                                        $(this).EstimationReport(Ordertype, OrderBookingHeaderId);
                                   }
                                   else if (Ordertype == 'VesselReport') {
                                        $(this).VesselReport(Ordertype, OrderBookingHeaderId);
                                   }
                                   else {
                                        ClearData();
                                        window.close();
                                   }
                              }
                              //  resolve("Bill has been Updated")
                         })

                    }).catch((err) => {
                         ErrorLog.writeLogFile('GetBulkOrderAdvancePaymentDetail', err)

                    })
          }
     })
}


$('#OrderBookingclose').click(function () {
     Swal.fire({
          title: 'Are you sure?',
          text: "You are about to close the Order Booking .",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Close Order Booking'
     }).then((result) => {
          if (result.value) {
               // ipcRenderer.send('OrderBooking-close', '');
               store.set('isWindowOpen', false)
               window.close();
          }
     });
});

$('#Minimize').click(function () {
     ipcRenderer.send('OrderBookingminimize', '')
});