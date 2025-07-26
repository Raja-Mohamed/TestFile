let { ipcRenderer } = require('electron');
let Store = require('electron-store');

let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
const printerService = require('../services/printer-service');
let BillingdbService = require('../database/billingdb')
const ErrorLog = require('../services/log');
document.getElementById('billCounterName').innerHTML = store.get('BillCounterName');
document.getElementById('POSName').innerHTML = environment.POSName;
const EncrDecrService = require('../services/encrypt-decrypt.service');
//document.getElementById('orderbookingList').innerHTML=OrderList.length;
let selectedItemstodisplay = '';
let OrderList;
let POSPassword = store.get('POSPassword')
let loginId;
let row;
let BulkOrderRefresh = 0;
let date = new Date();
var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
let todayDate = store.get("todayDate")


const showLoading = function () {
    Swal.fire({
        title: ' Please Wait...!',
        allowEscapeKey: false,
        allowOutsideClick: false,
        background: '#FFFFFF',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};


// $(function(){
//     setInterval(oneSecondFunction, 5000);
// });

function oneSecondFunction() {

    BulkOrderRefresh = 0;
    BulkOrderRefresh = store.get("BulkOrderRefresh") == undefined ? 0 : store.get("BulkOrderRefresh");
    //console.log(BulkOrderRefresh);
    if (BulkOrderRefresh == 'Refresh') {

        store.set("BulkOrderRefresh", 0)
        loadItemsToDisplay();

    } else {
        Swal.close();
    }
}



$(document).ready(function () {
    document.getElementById("fromdate").value = todayDate;

    document.getElementById("todate").value = todayDate;
    document.getElementById("DeliveryDate").value = todayDate;
    loadItemsToDisplay();
});

$(function () {
    debugger;

    $("#fromdate").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd/mm/yy",
        maxDate: new Date(),

        // onSelect: function (dateText) {

        //     var initialDate = dateText.split(/\//);
        //     let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))

        //     fromdate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
        //     loadItemsToDisplay();
        //     orderList();

        // }
    });

    $("#DeliveryDate").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd/mm/yy",
        // maxDate: new Date(),

        // onSelect: function (dateText) {

        //     var initialDate = dateText.split(/\//);
        //     let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))

        //     fromdate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);
        //     loadItemsToDisplay();
        //     orderList();

        // }
    });

    $("#todate").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd/mm/yy",
        maxDate: new Date(),

        // onSelect: function (dateText) {

        //     var initialDate = dateText.split(/\//);
        //     let changeddate = new Date([initialDate[1], initialDate[0], initialDate[2]].join('/'))

        //     todate = changeddate.getFullYear() + "-" + ("0" + (changeddate.getMonth() + 1)).slice(-2) + "-" + ("0" + changeddate.getDate()).slice(-2);

        //     loadItemsToDisplay();
        //     orderList();
        // }
    });
})

$.fn.runSearch = function () {

    debugger;

    //     if (OrderList.length == 0) {
    //         document.getElementById('PrintReport').disabled = true;
    //    } else {
    //         document.getElementById('PrintReport').disabled = false;
    //    }


    let fromDate, todate;
    fromDate = document.getElementById("fromdate").value;
    todate = document.getElementById("todate").value;

    //  date formate changed DD/MM/YYYY to YYYY/MM/DD
    var datefrom = fromDate.split('/');
    var newDatefrom = datefrom[2] + '/' + datefrom[1] + '/' + datefrom[0];

    var dateto = todate.split('/');
    var newDateto = dateto[2] + '/' + dateto[1] + '/' + dateto[0];
    //
    fromDate = new Date(newDatefrom);
    todate = new Date(newDateto);

    let checked = fromDate <= todate; // less than formate
    debugger;

    if (checked == true) {
        loadItemsToDisplay();
        orderList();
    }

    else {
        Swal.fire({
            title: 'To Date must be Less than From Date',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        })
    }

}

$.fn.SearchOrder = function () {
    debugger;
    selectedItemstodisplay = '';
    $('#order_list').empty();
    let Searchstring = document.getElementById("SearchOrder").value;

    // console.log('OrderList =', OrderList);
    // console.log('Searchstring =', Searchstring);
    if (Searchstring != '') {
        let SearchBills = OrderList.filter(row => row.OrderBookingNo.trim().includes(Searchstring.toUpperCase()))
        // console.log('SearchBills =', SearchBills);
        if (SearchBills.length > 0) {
            SearchBills.forEach(row => {
                selectedItemstodisplay +=
                    `<tr>
                <td>${row.OrderBookingDate}</td>
                <td><span style="color:green; cursor: pointer;" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'>${row.OrderBookingNo}</span></td>
                <td>${row.DeliveryDate + ' ' + row.DeliveryTime}</td>
                <td>${row.CustomerName}</td>
                <td>${row.PhoneNo}</td>
                <td>${row.NetAmount.toFixed(2)}</td>
                <td>${row.AmountReceived.toFixed(2)}</td>
                <td>${row.Balance.toFixed(2)}</td>`
                if (row.IsCompleted == 1 && row.IsComplimentary == 0 && row.IsCreditBill == 0 && row.IsCancelled == 0) {
                    selectedItemstodisplay += `<td><span>Cash</span></td>`
                }
                else if (row.IsCompleted == 1 && row.IsComplimentary == 1 && row.IsCreditBill == 0 && row.IsCancelled == 0) {
                    selectedItemstodisplay += `<td><span>Complimentary</span></td>`
                } else if (row.IsCompleted == 1 && row.IsCreditBill == 1 && row.IsComplimentary == 0 && row.IsCancelled == 0) {
                    selectedItemstodisplay += `<td><span>Credit</span></td>`
                }
                else if (row.IsCancelled == 1) {
                    selectedItemstodisplay += `<td><span class="label label-danger">Cancelled</span></td>`
                }
                else {
                    selectedItemstodisplay += `<td><span>Unpaid</span></td>`
                }


                if (row.IsCompleted == 1 && row.IsCancelled == 0) {
                    selectedItemstodisplay += `<td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;<span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span></td></tr>`
                } else if (row.IsCancelled == 1) {
                    selectedItemstodisplay += `<td>
                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>
                            </td>
                    </tr>`
                }
                else {
                    selectedItemstodisplay += `<td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;<span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span></td></tr>`
                }
                $('#order_list').html(selectedItemstodisplay);
            })
            orderList();
        }
        else {
            $('#order_list').empty();
        }
    }
    else {
        document.getElementById("SearchOrder").value = '';
        OrderList.forEach(row => {
            selectedItemstodisplay +=
                `<tr>
                <td>${row.OrderBookingDate}</td>
                <td><span style="color:green; cursor: pointer;" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'>${row.OrderBookingNo}</span></td>
                <td>${row.DeliveryDate + ' ' + row.DeliveryTime}</td>
                <td>${row.CustomerName}</td>
                <td>${row.PhoneNo}</td>
                <td>${row.NetAmount.toFixed(2)}</td>
                <td>${row.AmountReceived.toFixed(2)}</td>
                <td>${row.Balance.toFixed(2)}</td>`
            if (row.IsCompleted == 1 && row.IsComplimentary == 0 && row.IsCreditBill == 0 && row.IsCancelled == 0) {
                selectedItemstodisplay += `<td><span>Cash</span></td>`
            }
            else if (row.IsCompleted == 1 && row.IsComplimentary == 1 && row.IsCreditBill == 0 && row.IsCancelled == 0) {
                selectedItemstodisplay += `<td><span>Complimentary</span></td>`
            } else if (row.IsCompleted == 1 && row.IsCreditBill == 1 && row.IsComplimentary == 0 && row.IsCancelled == 0) {
                selectedItemstodisplay += `<td><span>Credit</span></td>`
            } else if (row.IsCancelled == 1) {
                selectedItemstodisplay += `<td><span class="label label-danger">Cancelled</span></td>`
            }
            else {
                selectedItemstodisplay += `<td><span>Unpaid</span></td>`
            }


            if (row.IsCompleted == 1 && row.IsCancelled == 0) {
                selectedItemstodisplay += `<td> <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;<span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span></td></tr>`
            } else if (row.IsCancelled == 1) {
                selectedItemstodisplay += `<td>
                <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>
                        </td>
                </tr>`
            }
            else {
                selectedItemstodisplay += `<td><span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;<span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span></td></tr>`
            }
            $('#order_list').html(selectedItemstodisplay);
        })
        orderList();
    }
}

$.fn.openOrderBookingPopupWindow = function () {
    debugger;
    // let IsOnline=store.get('IsOnline');
    let isWindowOpen = store.get('isWindowOpen')
    if (!isWindowOpen) {
        ipcRenderer.invoke('OpenOrderBooking', 0);
    } else {
        Swal.fire({
            title: 'Already Order Booking Entry Screen Opened. Please Close the Opened OrderBooking Entry Screen..!',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        }).then((res) => {
           // window.close();
        })
        //  store.set('isWindowOpen', false)
    }


}
$.fn.loadItemsToDisplay = function () {

    loadItemsToDisplay();

}
function loadItemsToDisplay() {
    showLoading();
    debugger;
    document.getElementById("SearchOrder").value = '';

    let fromDate = document.getElementById("fromdate").value.split("/")
    let tempfromDate = fromDate[2] + "/" + fromDate[1] + "/" + fromDate[0]
    let toDate = document.getElementById("todate").value.split("/")
    let temptoDate = toDate[2] + "/" + toDate[1] + "/" + toDate[0]

    selectedItemstodisplay = '';
    $('#order_list').empty();
    OrderList = [];
    let Item = {
        "BillCounterId": store.get('BillCounterId'),
        "FromDate": tempfromDate,
        "ToDate": temptoDate,
        "POSId": environment.POSId,
        "CompanyId": environment.CompanyId
    }

    $.post(environment.apiURL + '/GetBulkOrderBooking', Item, function (data) {
        debugger
        let res = JSON.parse(data);
        if (res.Status == "valid") {
            debugger
            OrderList = res.Data[0];
            if (OrderList.length > 0) {
                // console.log('OrderList',OrderList);
                OrderList.forEach(row => {
                    selectedItemstodisplay +=
                        `<tr>
                        <td>${row.OrderBookingDate}</td>
                        <td><span style="color:green; cursor: pointer;" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'>${row.OrderBookingNo}</span></td>
                        <td>${row.DeliveryDate + ' ' + row.DeliveryTime}</td>
                        <td>${row.CustomerName}</td>
                        <td>${row.PhoneNo}</td>
                        <td>${row.NetAmount.toFixed(2)}</td>
                        <td>${row.AmountReceived.toFixed(2)}</td>
                        <td>${row.Balance.toFixed(2)}</td>`

                    if (row.IsCompleted == 1 && row.IsComplimentary == 0 && row.IsCreditBill == 0 && row.IsCancelled == 0) {
                        selectedItemstodisplay += `<td><span>Cash</span></td>`
                    }
                    else if (row.IsCompleted == 1 && row.IsComplimentary == 1 && row.IsCreditBill == 0 && row.IsCancelled == 0) {
                        selectedItemstodisplay += `<td><span>Complimentary</span></td>`
                    } else if (row.IsCompleted == 1 && row.IsCreditBill == 1 && row.IsComplimentary == 0 && row.IsCancelled == 0) {
                        selectedItemstodisplay += `<td><span>Credit</span></td>`
                    } else if (row.IsCancelled == 1) {
                        selectedItemstodisplay += `<td><span class="label label-danger">Cancelled</span></td>`
                    }
                    else {
                        selectedItemstodisplay += `<td><span>Unpaid</span></td>`
                    }


                    if (row.IsCompleted == 1 && row.IsCancelled == 0) {
                        selectedItemstodisplay += `<td>
                            <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;
                            <span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span>
                            </td>
                        </tr>`
                    }
                    else if (row.IsCancelled == 1) {
                        selectedItemstodisplay += `<td>
                        <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>
                                </td>
                        </tr>`
                    }
                    else {
                        selectedItemstodisplay += `<td>
                                    <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;
                                    <span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span>
                                </td>
                            </tr>`
                    }
                    //selectedItemstodisplay += ` <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditOrderBooking(${row.OrderBookingHeaderId})'></span>&nbsp;&nbsp;`
                    //selectedItemstodisplay += `<span style="color:red; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteOrderBooking(${row.OrderBookingHeaderId},${row.IsCompleted},${row.BillNo})'></span>
                    // </td>
                    //  </tr>`;
                    $('#order_list').html(selectedItemstodisplay);

                })

                // orderList();
                Swal.close();
                // document.getElementById('orderbookingList').innerHTML=OrderList.length;
            }
            else {
                $('#order_list').empty();
                Swal.close();
            }
            orderList();
            getBulkOrderAdvancePaymentDetail();
            getBulkOrderBalancePaymentDetail();
        }
        else if (res.Status == "invalid") {
            ErrorLog.writeLogFile('GetBulkOrderBooking', res.Error)

            Swal.fire({
                title: 'GetBulkOrderBooking Failed',
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('GetBulkOrderBooking', err)

        Swal.fire(
            'Oops!',
            'API Server was Disconnected . try again later!',
            'warning'
        );
    })


}
function orderList() {

    if (OrderList.length > 0) {
        document.getElementById('orderbookingList').innerHTML = OrderList.length;

    }
    else {
        document.getElementById('orderbookingList').innerHTML = 0;
    }
}
$.fn.EditOrderBooking = function (OrderBookingHeaderId) {

    debugger;
    let isWindowOpen = store.get('isWindowOpen')
    if (!isWindowOpen) {
        //  store.set('isWindowOpen', true)
        ipcRenderer.invoke('OpenOrderBooking', OrderBookingHeaderId);
    } else {
        Swal.fire({
            title: 'Already Order Booking Entry Screen Opened. Please Close the Opened OrderBooking Entry Screen..!',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        }).then((res)=>{
         //   window.close();

        })
        //  store.set('isWindowOpen', false)
    }


}
$.fn.DeleteOrderBooking = function (OrderBookingHeaderId, Completed, BillNo) {
    debugger;
    //console.log('BillNo',BillNo);
    let BillNoArray = [];
    if (BillNo != undefined) {
        BillNoArray = BillNo.split(',');
    }
    // else{
    //     BillNoArray=0;
    // }

    // if (Completed == 1) {

    //     Swal.fire({
    //         title: 'Cannot Delete the BulkOrder Because It is completed',
    //         icon: 'error',
    //         confirmButtonColor: '#5cb85c',
    //         confirmButtonText: 'OK'
    //     })
    // } 
    // else {

    if (store.get('IsOnline') == 'true') {
        loginId = store.get('Ref')
    }
    else {
        loginId = EncrDecrService.encrypt(store.get('Ref'))
    }

    Swal.fire({
        title: 'Are you Sure Want to delete the Bulkorder?',
        showCancelButton: true,
        icon: 'question',
        html: `<input type="password"  placeholder="Enter Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br>
               <textarea  placeholder="Enter Description" id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br>
               <input type="checkbox" onclick="$(this).myFunction()"> Show Password`,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    }).then((result) => {
        let Password = document.getElementById('password').value;
        let CancelledReason = document.getElementById('Description').value;
        if (result.isConfirmed) {

            if (Password != '') {
                if (Password == POSPassword[0].AdminPassword) {
                    if (CancelledReason != '') {
                        showLoading();
                        let Item = {
                            "OrderBookingHeaderId": OrderBookingHeaderId,
                            "BillCounterId": store.get('BillCounterId'),
                            "CompanyId": environment.CompanyId,
                            "CancelledReason": CancelledReason,
                            "Source": environment.PageUrl.orderbooking,
                            "Ref": loginId
                        }
                        // console.log('Item  =',Item);
                        $.post(environment.apiURL + '/DeleteBulkOrderBooking', Item, function (data) {
                            debugger
                            let res = JSON.parse(data);
                            if (res.Status == "valid") {
                                getBulkOrderAdvancePaymentDetail();
                                getBulkOrderBalancePaymentDetail();
                                if (BillNoArray.length > 0) {
                                    // console.log('BillNoArray',BillNoArray);
                                    for (let i = 0; i < BillNoArray.length; i++) {
                                        DeleteCateringSaleDetail(BillNoArray[i], CancelledReason);
                                    }
                                }
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Bill has been Deleted',
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                                loadItemsToDisplay();
                            }
                            else if (res.Status == "invalid") {
                                ErrorLog.writeLogFile('DeleteBulkOrderBooking', res.Error)

                                Swal.fire({
                                    title: 'DeleteBulkOrderBooking Failed',
                                    icon: 'error',
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                })
                            }
                        }).catch(function (err) {
                            ErrorLog.writeLogFile('DeleteBulkOrderBooking', err)

                            Swal.fire({
                                title: 'DeleteBulkOrderBooking Failed',
                                icon: 'error',
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'OK'
                            })
                        })
                    } else {
                        Swal.fire({
                            title: 'Please Enter the Reason for Cancel Bulkorder..!',
                            icon: 'warning',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                $(this).DeleteOrderBooking(OrderBookingHeaderId, Completed, BillNo)
                            }
                        })
                    }

                } else {
                    Swal.fire({
                        title: 'Invalid Password..!',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Ok'
                    }).then((resultpasswod) => {
                        if (resultpasswod.isConfirmed) {
                            $(this).DeleteOrderBooking(OrderBookingHeaderId, Completed, BillNo)
                        }
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
                        $(this).DeleteOrderBooking(OrderBookingHeaderId, Completed, BillNo)
                    }
                })
            }
        }
    })
    // }
}


$.fn.myFunction = function () {

    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

}

// $.fn.PrintBulkOrderBooking = function (OrderBookingHeaderId, BillNo) {
//     let BillNodetails = BillNo.split(",");
//     debugger;
//     //---------- Array length using Sweet or Non Sweet Details Print

//     // if (BillNodetails.length == 1) {
//     //     BillingdbService.getBulkOrderSaleHeaderId(BillNodetails[0])
//     //     .then((Data) => {
//     //         debugger;
//     //         let SaleHeaderId = Data.SaleHeaderId;
//     //         console.log('SaleHeaderId =', SaleHeaderId);

//     //         printerService.getBillCounterdetail(SaleHeaderId, 1);
//     //         SaleHeaderId = '';
//     //     }).catch((error) => {
//     //         ErrorLog.writeLogFile('getBulkOrderSaleHeaderId', error)
//     //         reject(error)
//     //     })

//     // }
//     // else if (BillNodetails.length > 1) {
//     //     BillingdbService.getBulkOrderSaleHeaderId(BillNodetails[0]).then((Data) => {
//     //         debugger;

//     //         let SaleHeaderId = Data.SaleHeaderId;
//     //         console.log('else SaleHeaderId1 =', SaleHeaderId);
//     //         printerService.getBillCounterdetail(SaleHeaderId, 1);
//     //         SaleHeaderId = '';

//     //         BillingdbService.getBulkOrderSaleHeaderId(BillNodetails[1]).then((Data) => {
//     //             debugger;
//     //             let SaleHeaderId = Data.SaleHeaderId;
//     //             console.log('else SaleHeaderId2 =', SaleHeaderId);
//     //             printerService.getBillCounterdetail(SaleHeaderId, 1);
//     //             SaleHeaderId = '';

//     //         }).catch((error) => {
//     //             ErrorLog.writeLogFile('getBulkOrderSaleHeaderId', error)
//     //             reject(error)
//     //         })
//     //     }).catch((error) => {
//     //         ErrorLog.writeLogFile('getBulkOrderSaleHeaderId', error)
//     //         reject(error)
//     //     })
//     // }


//     //----------For loop using Sweet or Non Sweet Details Print
//     for (let i = 0; i < BillNodetails.length; i++) {
//         debugger;
//         BillingdbService.getBulkOrderSaleHeaderId(BillNodetails[i])
//             .then((Data) => {
//                 debugger;
//                 // console.log('SaleHeaderId =', SaleHeaderId);
//                 // console.log('1i =', i);
//                 // console.log('BillNodetails[i] =',BillNodetails[i]);

//                 let SaleHeaderId = 0;
//                 SaleHeaderId = Data.SaleHeaderId;
//                 if (i == 0) {
//                     printerService.getBillCounterdetail(SaleHeaderId)
//                 }
//                 if (i == 1) {
//                     setTimeout(function () {
//                         printerService.getBillCounterdetail(SaleHeaderId)
//                     }, 1000)
//                 }

//             }).catch((error) => {
//                 ErrorLog.writeLogFile('getBulkOrderSaleHeaderId', error)
//                 reject(error)
//             })
//     }
// }

function getBulkOrderAdvancePaymentDetail() {
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

    $.post(environment.apiURL + '/GetBulkOrderAdvancePaymentDetail', list, function (datas) {
        let ress = JSON.parse(datas);
        if (ress.Status == "valid") {
            let array = ress.Data[0];
            let item = {
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
            BillingdbService.addBulkOrderBookingAdvancePayments(item).then(
                async (result) => {
                    debugger;

                }).catch((err) => {
                    ErrorLog.writeLogFile('bulk order page : GetBulkOrderAdvancePaymentDetail', err)
                })
        }
    })
};

$.fn.PrintSummaryReport = function (event) {
    debugger
    // if (OrderList.length == 0) {
    //      document.getElementById('PrintReport').disabled = true;
    // } else {
    //      document.getElementById('PrintReport').disabled = false;
    // }
    // let SaleDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear()
    // let Delivery = document.getElementById('DeliveryDate').value

    let fromDate = document.getElementById("fromdate").value;
    let todate = document.getElementById("todate").value;
    let splitFromDate = fromDate.split('/')
    let splitToDate = todate.split('/')
    let joinfromDate = splitFromDate[2] + "-" + splitFromDate[1] + "-" + splitFromDate[0]
    let joinToDate = splitToDate[2] + "-" + splitToDate[1] + "-" + splitToDate[0]
    // let pos=document.getElementById('POSName').value
    // document.getElementById('billCounterName').innerHTML = store.get('BillCounterName');
    showLoading();
    let Item = {
        "FromDate": joinfromDate,
        "ToDate": joinToDate,
        "BillCounterId": Number(store.get('BillCounterId')),
        "POSId": environment.POSId,
        "CompanyId": environment.CompanyId,
        "POSName": environment.POSName
    }

    $.post(environment.apiURL + '/GetBulkOrderDetail', Item, function (data) {
        let res = JSON.parse(data);

        if (res.Status == "valid") {
            Swal.fire({
                title: 'Summary Report Print Successfully',
                icon: 'success',
                confirmButtonColor: '#5cb85c',
                confirmButtonText: 'OK',
                timer: 1500
            })
            ipcRenderer.invoke('VesselReport', res.Data);
        }
        else if (res.Status == "invalid") {
            debugger
            Swal.fire({
                title: 'Summary Report not printed.please contact to administrator.',
                icon: 'error',
                confirmButtonColor: '#5cb85c',
                confirmButtonText: 'OK',
                // timer: 1500
            })
            ErrorLog.writeLogFile('GetBulkOrderDetail', res.Error)
        }
    }).catch(function (err) {
        debugger
        Swal.fire({
            title: 'Summary Report not printed.please contact to administrator.',
            icon: 'error',
            confirmButtonColor: '#5cb85c',
            confirmButtonText: 'OK',
            // timer: 1500
        })
        ErrorLog.writeLogFile('GetBulkOrderDetail', err)
    })
}






$.fn.PrintItemReport = function (event) {
    debugger
    // if (OrderList.length == 0) {
    //      document.getElementById('PrintReport').disabled = true;
    // } else {
    //      document.getElementById('PrintReport').disabled = false;
    // }
    let SaleDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear()
    let Delivery = document.getElementById('DeliveryDate').value
    let splitDate = Delivery.split('/')
    let joinDate = splitDate[2] + "-" + splitDate[1] + "-" + splitDate[0]
    // let pos=document.getElementById('POSName').value
    // document.getElementById('billCounterName').innerHTML = store.get('BillCounterName');
    showLoading();
    let Item = {

        "CompanyId": environment.CompanyId,
        "POSId": environment.POSId,
        "BillCounterId": Number(store.get('BillCounterId')),
        "DeliveryDate": joinDate,
        "POSName": environment.POSName,
        "CounterName": store.get('BillCounterName'),
        "SaleDate": Delivery

    }

    $.post(environment.apiURL + '/GetItemDetailReport', Item, function (data) {
        let res = JSON.parse(data);

        if (res.Status == "valid") {
            Swal.fire({
                title: 'Item Report Print Successfully',
                icon: 'success',
                confirmButtonColor: '#5cb85c',
                confirmButtonText: 'OK',
                timer: 1500
            })
            ipcRenderer.invoke('VesselReport', res.Data);
        }
        else if (res.Status == "invalid") {
            debugger
            Swal.fire({
                title: 'Item Report not printed.please contact to administrator.',
                icon: 'error',
                confirmButtonColor: '#5cb85c',
                confirmButtonText: 'OK',
                // timer: 1500
            })
            ErrorLog.writeLogFile('GetItemDetailReport', res.Error)
        }
    }).catch(function (err) {
        debugger
        Swal.fire({
            title: 'Item Report not printed.please contact to administrator.',
            icon: 'error',
            confirmButtonColor: '#5cb85c',
            confirmButtonText: 'OK',
            // timer: 1500
        })
        ErrorLog.writeLogFile('GetItemDetailReport', err)
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

function DeleteCateringSaleDetail(billno, CancelledReason) {
    let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
    let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

    let UpdatedBy = EncrDecrService.decrypt(store.get('Ref'));
    let item = {
        "Billno": billno,
        "BillCounterId": store.get('BillCounterId'),
        "POSId": environment.POSId,
        "CompanyId": environment.CompanyId,
        "SaleDate": SaleDate,
        "UpdatedBy": UpdatedBy,
        "UpdatedOn": SaleDate + Time,
        "CancelledReason": CancelledReason
    }
    BillingdbService.DeleteCateringSaleDetail(item).then((result) => {
        // console.log('result',result);
        // Swal.fire('Bill Cancelled!', '', 'success')
    },
        (error) => {
            ErrorLog.writeLogFile('DeleteCateringSaleDetail', error)
        }
    )
}

