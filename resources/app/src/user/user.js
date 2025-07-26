var autocomplete = require('autocompleter');
let Store = require('electron-store');
const { path } = require('path');
let { ipcRenderer } = require('electron');
const ErrorLog = require('../services/log');
let environment = require('../environment');
const CustomValidators = require('../services/custom-validation')
const store = new Store();
let Swal = require('sweetalert2');
const { rootPath } = require('../../rootpath')
const EncrDecrService = require('../services/encrypt-decrypt.service');
let POSPassword = store.get('POSPassword');
var mysql = require('mysql');



let selectedItems = [];
let DineInselectedItems = [];
let DineinList = [];
let selectedItem = [];
let selectedItemsForView = '';
let itemList = [];
let tempItemList = [];
let myInterval;
let billSlotNo = 1;
let seatbillSlotNo = 65
let tableSlotNo = 1
let serviceTypesOfSlot = [];
let itemId, itemBrandId;
let serviceTypes = [];
let HoldItemsList = [];
let HoldDineInItemsList = [];
let UOMname = '';
let LoadedBillCounter = [];
let SaleHeaderList = [];
let SaleDetailList = [];
let nonSaleHeaderIds = [];
let TotalItems = 0;
let WaiterList = [];
let TotalAmount;
let TotalGST;
let TotalCESS;
let TotalTax;
let RoundOff;
let NetAmount;
let WaiterId;
let WaiterName;
let IsKOTPrint;
let IsOtherStateCustomerValue;
let IsAllowNegativeRoundOff;
let IsAllowCustomerTokenGrouping;
let loginId;
let str;
let ServiceTypeId;
let Buttonshow = false;

// local database testing
let BillingdbService = require('../database/billingdb');
let ItemdbService = require('../database/itemdb');
const printerService = require('../services/printer-service');
const printerEstimateService = require('../services/printer-Estimate-service');
const TokenPrinterService = require('../services/Token-printer-service');
const KOTPrinterService = require('../services/KOT-printer-service');
const KOTUserPrinterService = require('../services/KOT-user-service')
const cron = require("node-cron");
var ip = require("ip");
const { TIMEOUT } = require('dns');
var ipaddress = ip.address();
var date = new Date()
//var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
var ItemserverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
let SpecialRights=[];
 SpecialRights= store.get('SpecialRights')
//console.log("SplAccess",SpecialRights)
if(SpecialRights.length>0){

    let AdminRights=SpecialRights.findIndex(x=>x.SpecialRights=="Allow POS DayEnd" && x.Access==1)
    if (AdminRights!=-1){
        $("#openAdminDayendWindow").show();
    } else {
        $("#openAdminDayendWindow").hide();
    
    }
}else{
    $("#openAdminDayendWindow").hide();
}


function GetPOSDineInSales() {
    debugger
    var date = new Date()
    let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
    let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    if (SaleHeaderList.length == 0) {
        let Item = {
            //  "POSId": environment.POSId,
            "BillCounterId": store.get('BillCounterId'),
            // "CompanyId": environment.CompanyId,
            "SaleDate": SaleDate
        }

        ErrorLog.writeLogFile('spGetDineInSaleDetails', JSON.stringify(Item))
        // return new Promise(function (resolve, reject) {
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

            // in case of error
            if (err) {
                ErrorLog.writeLogFile('spGetDineInSaleDetails', err.sqlMessage)
                reject(err)
            }
        });


        connection.query("call spGetDineInSaleDetails(?,?)", [Item.BillCounterId, Item.SaleDate], function (err, rows, fields) {

            if (err) {
                ErrorLog.writeLogFile('spGetDineInSaleDetails', err.sqlMessage)
                return;
            }
            else {
                debugger
                if (rows[0].length > 0) {
                    let data = Object.values(JSON.parse(JSON.stringify(rows[0])))
                    let data1 = Object.values(JSON.parse(JSON.stringify(rows[1])))

                    SaleHeaderList = data
                    SaleDetailList = data1
                    generateDineInBills(SaleHeaderList, SaleDetailList)

                }

            }

        });

        // Close the connection
        connection.end(function () {
            // The connection has been closed
        });


    } else {

    }

};


var IsOtherStateCustomer = $.fn.IsOtherStateCustomer = function () {

    let indexOfCustomer = document.getElementById("IsOtherStateCustomer").checked
   // console.log(indexOfCustomer);
    
    IsOtherStateCustomerValue = indexOfCustomer ? 1 : 0
    document.getElementById("IsOtherStateCustomerOpt").innerText= indexOfCustomer ? "Yes" : "No"
}
function generateDineInBills(SaleHeaderList, SaleDetailList) {
    i = 0;
    generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList)
}

async function generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList) {
    debugger
    var date = new Date()
    let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
    let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    let SaleHeaderId;

    if (i == SaleHeaderList.length) {
        debugger
        i = 0
        var SaleHeaders = SaleHeaderList.map(({ SaleHeaderId }) => ({ SaleHeaderId }))

        for (let i = 0; i < nonSaleHeaderIds.length; i++) {
            SaleHeaders = SaleHeaders.filter(x => x.SaleHeaderId != nonSaleHeaderIds[i])
        }
        //SaleHeaders = SaleHeaders.filter(x => x.SaleHeaderId != nonSaleHeaderIds)

        UpdateSaleHeader(SaleHeaders)
        nonSaleHeaderIds = []

        return false;
    }
    else {
        debugger
        let tempsaleDetail = SaleDetailList.filter(x => x.SaleHeaderId == SaleHeaderList[i].SaleHeaderId)
      //  console.log("tempsaleDetail",tempsaleDetail)
        let IsFromDevice = SaleHeaderList[i].IsFromDevice
        let cronservicetypeId = SaleHeaderList[i].ServiceTypeId;
        let cronservicetype = SaleHeaderList[i].ServiceType;
        let serverSaleHeaderId = SaleHeaderList[i].SaleHeaderId
        let IsPaymentRequired = serviceTypes.find(x => x.ServiceType.includes('Dine')).IsPaymentRequired
        let IsShowPayment = serviceTypes.find(x => x.ServiceType.includes('Dine')).IsShowPayment

        let loginId;
        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        let item = {
            "SaleDate": SaleDate,
            "BillTime": Time,
            "POSId": environment.POSId,
            "BillCounterId": store.get('BillCounterId'),
            "ServiceTypeId": SaleHeaderList[i].ServiceTypeId,
            "ServiceType": SaleHeaderList[i].ServiceType,
            "BillCounterCode": store.get('BillCounterCode'),
            "CashierName": SaleHeaderList[i].CashierName,
            "CustomerName": '',
            "PhoneNo": '',
            "GSTNo": '',
            "RefNo": '',
            "BillTokenNo": '',
            "IsWebOrders": 0,
            "TotalAmount": SaleHeaderList[i].TotalAmount,
            "TotalGST": parseFloat(SaleHeaderList[i].TotalGST).toFixed(2),
            "TotalCESS":parseFloat(SaleHeaderList[i].TotalCESS).toFixed(2),
            "TotalTax":parseFloat(SaleHeaderList[i].TotalTax).toFixed(2),
            "RoundOff": parseFloat(SaleHeaderList[i].RoundOff).toFixed(2),
            "NetAmount": parseFloat(SaleHeaderList[i].NetAmount).toFixed(2),
            "WaiterId": SaleHeaderList[i].WaiterId,
            "WaiterName": SaleHeaderList[i].WaiterName,
            "CustomerName":SaleHeaderList[i].CustomerName,
            "PhoneNo":SaleHeaderList[i].PhoneNo,
            "GSTNo":SaleHeaderList[i].GSTNo,
            "RefNo":SaleHeaderList[i].RefNo,
            "IsOtherStateCustomer":SaleHeaderList[i].IsOtherStateCustomer,
            "IsGSTInput":SaleHeaderList[i].IsGSTInput,
            "TableNo": SaleHeaderList[i].TableNo,
            "SeatNo": SaleHeaderList[i].SeatNo,
            "CompanyId": environment.CompanyId,
            "Source": environment.PageUrl.user,
            "Ref": loginId,
            "CreatedOn": SaleDate + Time,
            "UpdatedOn": SaleDate + Time,

        }
        await BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(async (result) => {
            debugger
            let res = result.split('_');
            item.BillNo = res[0];
            item.DisplayBillNo = res[1];
            await BillingdbService.checkBillNo(item.BillNo).then(async (Res) => {
                debugger            
                ErrorLog.writeLogFile('Billgenerateuser', JSON.stringify(item))
                
                if (Res == 0) {
                    debugger
                    await BillingdbService.addSaleHeader(item).then(
                        async (result) => {
                            debugger
                            SaleHeaderId = result
                            let SaleItemDetails = JSON.stringify(tempsaleDetail.map(obj => ({
                                SaleHeaderId: SaleHeaderId,
                                ItemId: obj.ItemId,
                                ItemName: obj.ItemName,
                                ItemGroupId: obj.ItemGroupId,
                                IsTakeAway: obj.IsTakeAway == 1 ? 1 : 0,
                                IsShowHSN: obj.IsShowHSN == 1 ? 1 : 0,
                                UOM: obj.UOM,
                                ItemBrandId: obj.ItemBrandId,
                                HSNNo: obj.HSNNo,
                                Quantity: obj.Quantity,
                                Rate: obj.Rate,
                                GSTPercentage: obj.GSTPercentage,
                                CESSPercentage: obj.CESSPercentage,
                                TaxPercentage: obj.TaxPercentage,
                                TotalAmount: parseFloat(obj.TotalAmount).toFixed(2),
                                GSTAmount: parseFloat(obj.GSTAmount).toFixed(2),
                                CESSAmount: parseFloat(obj.CESSAmount).toFixed(2),
                                TaxAmount: parseFloat(obj.TaxAmount).toFixed(2),
                                NetAmount: parseFloat(obj.NetAmount).toFixed(2),
                                IsGSTInput: obj.IsGSTInput
                               
                            })
                         
                            ));
                           // console.log("SaleItemDetails",SaleItemDetails)
                            await BillingdbService.addSaleDetail(SaleItemDetails).then(
                                (result) => {
                                    debugger
                                    if (result == 'SaleDetailList is Empty') {
                                        ErrorLog.writeLogFile('SaleDetailList is Empty', SaleHeaderId)

                                    } else if (result != 'SaleHeader Detail Added') {
                                        ErrorLog.writeLogFile('saledetailnotadded', SaleHeaderId)

                                    }
                                    if(cronservicetype="DineIn-Self Service"){
                                        TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {
                                            ErrorLog.writeLogFile('TokenPrinterService', SaleHeaderId)
                                        }).catch((err) => {
                                            ErrorLog.writeLogFile('TokenPrinterService', err)
                                        })
                                    }
                                    

                                    if (IsFromDevice == 0) {
                                        store.delete('SaleHeaderId')
                                        store.delete('serviceTypeName')
                                        store.set('SaleHeaderId', SaleHeaderId)
                                        store.set('serviceTypeName', "Dine-In")
                                        if (IsPaymentRequired == 0) {
                                            let saleHeaderList = {
                                                IsCreditBill: 1,
                                                IsPaid: 0,
                                                IsOtherStateCustomer:IsOtherStateCustomerValue,
                                                SaleHeaderId: SaleHeaderId,
                                                Ref: loginId,
                                                UpdatedOn: SaleDate + Time,
                                                CustomerName: '',
                                                PhoneNo: '',
                                                GSTNo: '',
                                                RefNo: ''
                                            }
                                            if (SaleHeaderId != undefined) {
                                                BillingdbService.updateSaleHeaderCreditList(saleHeaderList).then(
                                                    (data) => {
                                                        Swal.fire({
                                                            title: 'Bill was changed Credit Successfully',
                                                            icon: 'success',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'ok',
                                                            timer: 1500
                                                        })
                                                    },
                                                    (error) => {
                                                        ErrorLog.writeLogFile('updateSaleHeaderCreditList', error)
                                                    });

                                            } else {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'error Bill...',
                                                    confirmButtonColor: '#d33',
                                                    confirmButtonText: 'ok'
                                                })
                                            }
                                        } else if (IsPaymentRequired == 1 && IsShowPayment == 1) {
                                            setTimeout(function () {
                                                ipcRenderer.invoke('OpenBillReceipt', '');
                                            }, 1500)
                                        } else {
                                            Swal.fire({
                                                title: 'Bill was Generated Successfully',
                                                icon: 'success',
                                                confirmButtonColor: '#5cb85c',
                                                confirmButtonText: 'ok',
                                                timer: 1500
                                            })
                                        }
                                    }
                                    printerService.getBillCounterdetail(SaleHeaderId).catch((err) => {
                                        ErrorLog.writeLogFile('printerService', err)

                                    })

                                }).catch((err) => {
                                    debugger
                                    ErrorLog.writeLogFile(SaleHeaderId, err)
                                    nonSaleHeaderIds.push(serverSaleHeaderId)
                                    ErrorLog.writeLogFile('serversaleheaderIds', JSON.stringify(nonSaleHeaderIds))
                                    BillingdbService.deleteSale(SaleHeaderId).then((res) => {
                                        ErrorLog.writeLogFile(SaleHeaderId, res)
                                    }).catch(function (err) {
                                        ErrorLog.writeLogFile('deleteSale', err)
                                    });

                                })
                            i++;
                            await generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList)


                        }).catch(async (err) => {
                            ErrorLog.writeLogFile(item.BillNo, err)
                            nonSaleHeaderIds.push(serverSaleHeaderId)
                            ErrorLog.writeLogFile('serversaleheaderIds', JSON.stringify(nonSaleHeaderIds))
                            i++;
                            await generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList)

                        })
                } else {
                    debugger
                    ErrorLog.writeLogFile('duplicategenerateBillNo', item.BillNo)
                    nonSaleHeaderIds.push(serverSaleHeaderId)
                    ErrorLog.writeLogFile('serversaleheaderIds', JSON.stringify(nonSaleHeaderIds))
                    i++;
                    generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList)
                }

            }).catch(async (err) => {
                debugger
                ErrorLog.writeLogFile('checkBillNo', err)
                nonSaleHeaderIds.push(serverSaleHeaderId)
                ErrorLog.writeLogFile('serversaleheaderIds', JSON.stringify(nonSaleHeaderIds))
                i++;
                await generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList)

            })

        }).catch(async (err) => {
            ErrorLog.writeLogFile('generateBillNo', err)
            nonSaleHeaderIds.push(serverSaleHeaderId)
            ErrorLog.writeLogFile('serversaleheaderIds', JSON.stringify(nonSaleHeaderIds))
            i++;
            await generateDineinSaleHeader(i, SaleHeaderList, SaleDetailList)
        })


    }
}
// Setting a cron job

cron.schedule("*/5 * * * * *", function () {
debugger
    let services = store.get('ServiceTypes');
    let serviceTypeindex = services.findIndex(x => x.ServiceType.includes("Dine"))

    if (serviceTypeindex != -1) {

        GetPOSDineInSales()
    }
});

function UpdateSaleHeader(SaleHeaders) {

    if (store.get('IsOnline') == 'true') {
        loginId = EncrDecrService.decrypt(store.get('Ref'))
    }
    else {
        loginId = store.get('Ref')
    }
    let Item = {
        "SaleHeaders": JSON.stringify(SaleHeaders),
        "Source": environment.PageUrl.user,
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

        // in case of error
        if (err) {

            ErrorLog.writeLogFile('spUpdateSaleHeader', err.sqlMessage)

            //   reject(err)
        }
    });

    connection.query("call spUpdateSaleHeader(?,?,?)", [Item.SaleHeaders, Item.Source, Item.LoginId], function (err, rows, fields) {

        if (err) {

            ErrorLog.writeLogFile('spUpdateSaleHeader', err.sqlMessage)
            ErrorLog.writeLogFile('spUpdateSaleHeadererr', JSON.stringify(Item.SaleHeaders));
            UpdateSaleHeader(SaleHeaders)
            return;
        }
        else {

            SaleHeaderList = []
            SaleDetailList = []

            let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

            let Item = {
                "TableNo": tableSlotNo,
                "BillCounterId": store.get('BillCounterId'),
                "SeatNo": String.fromCharCode(seatbillSlotNo),
                "SaleDate": SaleDate
            }
            getPOSSaleDetails(Item).then((res) => {

                ErrorLog.writeLogFile('spUpdateSaleHeader succesfully executed', res)

            }).catch((err) => {
                ErrorLog.writeLogFile('spUpdateSaleHeader', err.sqlMessage)
                reject(err)
            })

        }


    });

    // Close the connection
    connection.end(function () {
        // The connection has been closed
    });

};

function getPOSSaleDetails(Item) {
debugger;
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

            // in case of error
            if (err) {

                ErrorLog.writeLogFile('getPOSSaleDetails', err.sqlMessage)
                reject(err)
            }
        });

        connection.query("call spgetPOSSaleDetails(?,?,?,?)", [Item.TableNo, Item.SeatNo, Item.BillCounterId, Item.SaleDate], function (err, rows, fields) {

            if (err) {

                ErrorLog.writeLogFile('getPOSSaleDetails', err.sqlMessage)
                reject(err.sqlMessage)
                return;
            }
            else {
debugger
                if (rows[0].length > 0) {
                    let data = Object.values(JSON.parse(JSON.stringify(rows[0])))
                    DineinList = data
                    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                    ServiceTypeId = Number(ServiceTypeId);
                    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
                    if (DineInselectedItems.length != 0) {
                        let tempDineInselectedItems = DineInselectedItems.filter(x => x.TableNo == tableSlotNo && x.SeatNo == String.fromCharCode(seatbillSlotNo))
                        if (tempDineInselectedItems.length != 0) {
                            var RowId = tempDineInselectedItems.map(({ POSSaleId }) => ({ POSSaleId }))
                            for (let i = 0; i < RowId.length; i++) {
                                DineInselectedItems = DineInselectedItems.filter(x => x.POSSaleId != RowId[i].POSSaleId)

                            }
                            setTimeout(() => {
                                DineInselectedItems = DineInselectedItems.concat(DineinList)

                            }, 200);

                        } else {
                            DineInselectedItems = DineInselectedItems.concat(DineinList)
                        }
                    } else {
                        DineInselectedItems = DineInselectedItems.concat(DineinList)
                    }


                    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                    ServiceTypeId = Number(ServiceTypeId);
                     serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType

                    loadItemsData(serviceName)
                    calculateAmount(serviceName)
                    waiterDisable(seatbillSlotNo)

                    resolve("getPOSSaleDetails success")
                } else {
                    debugger
                    DineinList = []
                    if (DineInselectedItems.length != 0) {
                        ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                        ServiceTypeId = Number(ServiceTypeId);
                        let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
                        let tempDineInselectedItems = DineInselectedItems.filter(x => x.TableNo == tableSlotNo && x.SeatNo == String.fromCharCode(seatbillSlotNo))
                        if (tempDineInselectedItems.length != 0) {
                            var RowId = tempDineInselectedItems.map(({ POSSaleId }) => ({ POSSaleId }))
                            for (let i = 0; i < RowId.length; i++) {
                                DineInselectedItems = DineInselectedItems.filter(x => x.POSSaleId != RowId[i].POSSaleId)
                            }
                            setTimeout(() => {
                                DineInselectedItems = DineInselectedItems
                            }, 200);

                        } else {
                            DineInselectedItems = DineInselectedItems
                        }
                    } else {
                        DineInselectedItems = DineInselectedItems
                    }
                    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                    ServiceTypeId = Number(ServiceTypeId);
                     serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
                    loadItemsData(serviceName)
                    calculateAmount(serviceName)
                    waiterDisable(seatbillSlotNo)

                    ErrorLog.writeLogFile('getPOSSaleDetails', 'success')

                    resolve("getPOSSaleDetails success")

                }


            }

        });

        // Close the connection
        connection.end(function () {
            // The connection has been closed
        });
    })
}

$(document).ready(function () {
    debugger
    SpecialRights= store.get('SpecialRights')
    if(SpecialRights.length>0){

        let AdminRights=SpecialRights.findIndex(x=>x.SpecialRights=="Allow POS DayEnd" && x.Access==1)
        if (AdminRights!=-1){
            $("#openAdminDayendWindow").show();  
              Swal.fire({
                title: 'Please choose the Screen?',
                allowOutsideClick: false,
                showCancelButton: true,
        //         html: `<select name="" id="billCounterdrp" class="form-control">
        // </select>`,
                icon: 'question',
                confirmButtonText: 'Billing Screen',
                cancelButtonText: 'Cancel',
                showDenyButton: true,
                denyButtonText: `Admin Screen`
            }).then((result) => {
                if (result.isConfirmed) {
                    loadBillCounters();

                }else if(result.isDenied){
                    openAdminDayendWindow()
                }else{
                    store.delete('loginToken');
                    clearInterval(myInterval);
                    ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                }
        } )}else {
            loadBillCounters();
        }
    }else{
        loadBillCounters();
    }

   
});

const showLoading = function () {
    Swal.fire({
        title: 'Please Wait',
        allowEscapeKey: false,
        allowOutsideClick: false,
        background: '#FFFFFF',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};


var openPreviousBillWindow = $.fn.openPreviousBillWindow = function () {
    ipcRenderer.invoke('OpenPreviousBills', '');
}

$.fn.openCashExpensesWindow = function () {
    ipcRenderer.invoke('OpenCashExpenses', '');
}

$.fn.openDevicesWindow = function () {
    ipcRenderer.invoke('OpenDevices', '');
}

var openBillReceiptWindow = $.fn.openBillReceiptWindow = function () {
    ipcRenderer.invoke('OpenBillReceipt', '');
}
var openAdminDayendWindow = $.fn.openAdminDayendWindow = function () {
    debugger
   store.set('UserPOSId',environment.POSId);
  // console.log("UserPOSId",store.get('UserPOSId'))
   let holdItemlist = []
   holdItemlist = selectedItems.length != 0 ? selectedItems : []
   if (holdItemlist.length != 0) {
       store.set('SelectedItems', selectedItems)
  
   } else {
       store.delete('SelectedItems')
   }
   let holdDineInlist = []
   holdDineInlist = DineInselectedItems.length != 0 ? DineInselectedItems : []
   if (holdDineInlist.length != 0) {
       store.set('DineInselectedItems', DineInselectedItems)
   } else {
       store.delete('DineInselectedItems')
   }
   clearInterval(myInterval);
   store.delete('loginToken');
   
    showLoading();
    ipcRenderer.invoke('Navigate', environment.PageUrl.admin);

}


$.fn.dayEnd = function () {
    ipcRenderer.invoke('OpenBillReport', '');
}

$.fn.openBulkOrderWindow = function () {

    ipcRenderer.invoke('OpenBulkOrder', '');
}

$.fn.openSettingsWindow = function () {
    ipcRenderer.invoke('openSettings', '');
}


if (store.get('IsOnline') == 'true' && (store.get('BillCounterId') == '' || store.get('BillCounterId') == undefined)) {

    $("#billingScreen").hide();

    SpecialRights= store.get('SpecialRights')
    if(SpecialRights.length>0){

        let AdminRights=SpecialRights.findIndex(x=>x.SpecialRights=="Allow POS DayEnd" && x.Access==1)
        if (AdminRights!=-1){
            $("#openAdminDayendWindow").show();  
              Swal.fire({
                title: 'Please choose the Screen?',
                allowOutsideClick: false,
                showCancelButton: true,
        //         html: `<select name="" id="billCounterdrp" class="form-control">
        // </select>`,
                icon: 'question',
                confirmButtonText: 'Billing Screen',
                cancelButtonText: 'Cancel',
                showDenyButton: true,
                denyButtonText: `Admin Screen`
            }).then((result) => {
                if (result.isConfirmed) {
                    loadBillCounters();

                }else if (result.isConfirmed){
                    openAdminDayendWindow()
                }else{

                }
        } )}else {
            loadBillCounters();
        }
    }else{
        loadBillCounters();
    }

}
else if (store.get('IsOnline') == 'false') {

    $("#billingScreen").hide();

    BillingdbService.addDayInfo().then(
        (result) => {
            if (result == 0) {

debugger
                ItemdbService.getAllItems({ "BillCounterId": store.get('BillCounterId') }).then(function (result) {
                    itemList = result;
                    loadServiceTypesForBillCounter();
                })

                displayDateTime();
                document.getElementById('cashierName').innerHTML = store.get('DisplayName');
                document.getElementById('billCounterName').innerHTML = store.get('BillCounterName');

                let services = store.get('ServiceTypes');
                let serviceTypeindex = services.findIndex(x => x.ServiceType.includes('Dine'));
                let serviceTypeind = services.findIndex(x => x.ServiceType=="Dine-In");
                if (serviceTypeindex != -1) {
                    if (IsKOTPrint == 1) {

                        $("#showKOTLabel").show();
                        $("#IsKOTCheck").show();
                    }
                    $("#showSlot").hide();
                    $("#deleteAll").hide()
                    $("#PrintEstimateBill").hide()
                    $("#showTable").show();
                    $("#cookinglabel").hide();
                    $("#cookingList").hide();
                    getBillCounterTables()
                    debugger
                    getWaiters()
                    if(serviceTypeind != -1){
                        $("#IsTakeAway").show();
                    }else{
                        $("#IsTakeAway").hide();
                    }
              
                    loadSlotButtons();
                    document.getElementById('TableSlot').innerText = "Table Slot#"
                    setTimeout(function () {
                        HoldItemlist()

                    }, 1000)

                } else {
                    if (IsWebOrders != -1) {
                        $("#cookinglabel").show();
                        $("#cookingList").show();
                    } else {
                        $("#cookinglabel").hide();
                        $("#cookingList").hide();
                    }
                    $("#showSlot").show();
                    $("#deleteAll").show()
                    $("#PrintEstimateBill").show()
                    $("#showTable").hide();
                    $("#showWaiterList").hide();
                    $("#IsTakeAway").hide();
                    $("#IsKOTCheck").hide();
                    $("#showKOTLabel").hide();
                    $("#showWaiterListLabel").hide();
                    document.getElementById('BillSlot').innerText = "Bill Slot#"
                    loadSlotButtons();
                    setTimeout(function () {
                        HoldItemlist()
                    }, 1000)
                }

            }
            else {

                loadBillCounters();
            }
        },
        (error) => {
            ErrorLog.writeLogFile('addDayInfo', error)

        }
    )

}
function loadBillCounters() {
debugger
    let item;
    if (store.get('IsOnline') == 'true') {
        item = {
            "POSId": environment.POSId,
            "LoginId": EncrDecrService.decrypt(store.get('Ref'))
        }
    }
    else {
        item = {
            "POSId": environment.POSId,
            "LoginId": store.get('Ref')
        }
    }
    BillingdbService.getUserAccessBillCounters(item).then(
        (result) => {
debugger
            let res = result;
        //    console.log("Billcounters",res.Data)
            store.set('Billcounters', res.Data)
            if (res.Status == "valid") {
                debugger
                if (res.Data.length == 1) {
                    store.set('isWindowOpen', false)

                    if (res.Data[0].IsEnableIPAddressAuthentication == 1) {
                        if (res.Data[0].IPAddress == ipaddress) {
                            LoadedBillCounter = res.Data;
                            BillCounter(LoadedBillCounter)
                        } else {
                            Swal.fire({
                                title: 'Counter was Not Configured on Your System..!',
                                allowOutsideClick: false,
                                icon: 'error',
                                confirmButtonText: 'Ok',
                            }).then((res) => {
                                store.delete('loginToken');
                                clearInterval(myInterval);
                                ipcRenderer.invoke('Navigate', environment.PageUrl.login);

                            })
                        }

                    }
                    else {
                        LoadedBillCounter = res.Data;
                        BillCounter(LoadedBillCounter)
                    }
                }
                else if (res.Data.length > 1) {


                    Swal.fire({
                        title: 'Please choose the counter?',
                        allowOutsideClick: false,
                        showCancelButton: true,
                        html: `<select name="" id="billCounterdrp" class="form-control">
                </select>`,
                        icon: 'question',
                        confirmButtonText: 'Go',
                        cancelButtonText: 'Cancel',
                    }).then((result) => {
                        if (result.isConfirmed) {

                            str = document.getElementById('billCounterdrp').value
                            let selectBillCounter = JSON.parse(str);
                            if (selectBillCounter != 0) {
                                store.set('isWindowOpen', false)
                                if (selectBillCounter.IsEnableIPAddressAuthentication == 1) {
                                    let ipcheck = (selectBillCounter.IPAddress == ipaddress) && (selectBillCounter.IsEnableIPAddressAuthentication == 1)
                                    if (ipcheck) {
                                        LoadedBillCounter = selectBillCounter
                                        BillCounter(LoadedBillCounter)

                                    } else {
                                        Swal.fire({
                                            title: 'Counter was Not Configured on Your System..!',
                                            allowOutsideClick: false,
                                            icon: 'error',
                                            confirmButtonText: 'Ok',
                                        }).then((res) => {
                                            loadBillCounters();

                                        })
                                    }
                                } else {
                                    LoadedBillCounter = selectBillCounter
                                    BillCounter(LoadedBillCounter)
                                }
                            } else {
                                Swal.fire(
                                    'warning..!',
                                    'Please choose a counter?',
                                    'warning'
                                ).then((result) => {
                                    if (result.isConfirmed) {
                                        loadBillCounters();
                                    }
                                })
                            }
                        }
                        else if (result.dismiss === Swal.DismissReason.cancel) {
                            store.delete('loginToken');
                            clearInterval(myInterval);
                            ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                        }
                    })
                }
                else if (res.Data.length == 0) {
                    Swal.fire({
                        title: 'Counter was Not Configured to User..!',
                        allowOutsideClick: false,
                        icon: 'warning',
                        confirmButtonText: 'Ok',
                    }
                    ).then((result) => {
                        if (result.isConfirmed) {
                            store.delete('loginToken');
                            clearInterval(myInterval);
                            ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                        }
                    })
                }

                $('#billCounterdrp').html(`<option value="0" selected="selected">Please select</option>`);
               // console.log(" res.Data", res.Data)
                res.Data.forEach(row => {
debugger
                    let counter = `<option value='{"billCounterId": "${row.BillCounterId}","billCounterName": "${row.BillCounterName}","billCounterCode": "${row.BillCounterCode}","NoOfSlots": "${row.NoOfSlots}","IsEnableWaiterToken": "${row.IsEnableWaiterToken}","IsEnableCustomerToken": "${row.IsEnableCustomerToken}","IsKOTPrint": "${row.IsKOTPrint}","IPAddress": "${row.IPAddress}","IsEnableIPAddressAuthentication": "${row.IsEnableIPAddressAuthentication}","IsGSTInputBillSplit": "${row.IsGSTInputBillSplit}","IsAllowReprint": "${row.IsAllowReprint}","IsAllowReprintPassword": "${row.IsAllowReprintPassword}","ReprintCount": "${row.ReprintCount}","ReprintPassword": "${row.ReprintPassword}","IsAllowKOTReprint": "${row.IsAllowKOTReprint}","IsAllowKOTReprintPassword": "${row.IsAllowKOTReprintPassword}","KOTReprintCount": "${row.KOTReprintCount}","KOTReprintPassword": "${row.KOTReprintPassword}","IsAllowNegativeRoundOff": "${row.IsAllowNegativeRoundOff}","IsAllowCustomerTokenGrouping": "${row.IsAllowCustomerTokenGrouping}"}'>${row.BillCounterName}</option>`;
                    $('#billCounterdrp').append(counter);
                });
            }

            else if (res.Status == 'invalid') {
                Swal.fire(
                    'Oops!',
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
        }, (error) => {
            ErrorLog.writeLogFile('getBillCounters', error)

        }
    ).catch((err) => {
        ErrorLog.writeLogFile('getBillCounters', err)
    })
}

var keyPress = $.fn.keyPress = function (event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57)) {
        event.preventDefault();
        return false;
    } else {
        return true;
    }
}

// cooking ubstruction 20 char auto break method
// document.getElementById("cookinginstruction").onkeyup = function() {
//     var text = this.value.replace("\n", "");
//     if (text.length > 20) {
//       var chunks = text.match(/.{1,15}/g);
//       if (chunks.length > 10) { 
//         chunks.splice(10, chunks.length - 1);
//       }
//       this.value = chunks.join("\n");

//     }
// };

function BillCounter(LoadedBillCounter) {
debugger
    let BillCounterId;
    let BillCounterName;
    let BillCounterCode;
    let NoOfSlots;
    let IsEnableWaiterToken;
    let IsEnableCustomerToken;
    let IsAllowReprint;
    let IsAllowReprintPassword;
    let ReprintCount;
    let ReprintPassword;
    let IsAllowKOTReprint;
    let IsAllowKOTReprintPassword;
    let KOTReprintCount;
    let KOTReprintPassword;
    let IsGSTInputBillSplit;
    //let IsAllowNegativeRoundOff;




    if (Array.isArray(LoadedBillCounter)) {
        let selectedBillCounter = LoadedBillCounter
        BillCounterId = selectedBillCounter[0].BillCounterId
        BillCounterName = selectedBillCounter[0].BillCounterName
        BillCounterCode = selectedBillCounter[0].BillCounterCode
        NoOfSlots = selectedBillCounter[0].NoOfSlots
        IsEnableWaiterToken = selectedBillCounter[0].IsEnableWaiterToken
        IsEnableCustomerToken = selectedBillCounter[0].IsEnableCustomerToken
        IsGSTInputBillSplit=selectedBillCounter[0].IsGSTInputBillSplit
        IsKOTPrint = selectedBillCounter[0].IsKOTPrint
        IsAllowReprint=selectedBillCounter[0].IsAllowReprint
        IsAllowReprintPassword=selectedBillCounter[0].IsAllowReprintPassword
        ReprintCount=selectedBillCounter[0].ReprintCount
        ReprintPassword=selectedBillCounter[0].ReprintPassword
        IsAllowKOTReprint=selectedBillCounter[0].IsAllowKOTReprint
        IsAllowKOTReprintPassword=selectedBillCounter[0].IsAllowKOTReprintPassword
        KOTReprintCount=selectedBillCounter[0].KOTReprintCount
        KOTReprintPassword=selectedBillCounter[0].KOTReprintPassword
        IsAllowNegativeRoundOff=selectedBillCounter[0].IsAllowNegativeRoundOff
        IsAllowCustomerTokenGrouping=selectedBillCounter[0].IsAllowCustomerTokenGrouping


    } else {
        let selectedBillCounter = LoadedBillCounter
        BillCounterId = selectedBillCounter.billCounterId
        BillCounterName = selectedBillCounter.billCounterName
        BillCounterCode = selectedBillCounter.billCounterCode
        NoOfSlots = selectedBillCounter.NoOfSlots
        IsEnableWaiterToken = selectedBillCounter.IsEnableWaiterToken
        IsEnableCustomerToken = selectedBillCounter.IsEnableCustomerToken
        IsGSTInputBillSplit=selectedBillCounter.IsGSTInputBillSplit
        IsKOTPrint = selectedBillCounter.IsKOTPrint
        IsAllowReprint=selectedBillCounter.IsAllowReprint
        IsAllowReprintPassword=selectedBillCounter.IsAllowReprintPassword
        ReprintCount=selectedBillCounter.ReprintCount
        ReprintPassword=selectedBillCounter.ReprintPassword
        IsAllowKOTReprint=selectedBillCounter.IsAllowKOTReprint
        IsAllowKOTReprintPassword=selectedBillCounter.IsAllowKOTReprintPassword
        KOTReprintCount=selectedBillCounter.KOTReprintCount
        KOTReprintPassword=selectedBillCounter.KOTReprintPassword
        IsAllowNegativeRoundOff=selectedBillCounter.IsAllowNegativeRoundOff
        IsAllowCustomerTokenGrouping=selectedBillCounter.IsAllowCustomerTokenGrouping
    }

    HoldItemsList = store.get('SelectedItems') == undefined ? [] : store.get('SelectedItems');
   // console.log("HoldItemsList",HoldItemsList)
    // store.delete('SelectedItems');
    if (HoldItemsList.length != 0) {
        let HoldItemsIndex = HoldItemsList.findIndex(x => x.POSId == environment.POSId && x.CompanyId == environment.CompanyId && x.BillCounterId == BillCounterId)
        if (HoldItemsIndex != -1) {
            selectedItems = HoldItemsList
        } else {
            // store.delete('SelectedItems');
        }
    } else {
        // store.delete('SelectedItems');
    }

    HoldDineInItemsList = store.get('DineInselectedItems') == undefined ? [] : store.get('DineInselectedItems');
//console.log("HoldDineInItemsList",HoldDineInItemsList)
    // store.delete('SelectedItems');
    if (HoldDineInItemsList.length != 0) {

        let HoldDineInItemsListIndex = HoldDineInItemsList.findIndex(x => x.BillCounterId == BillCounterId)
        if (HoldDineInItemsListIndex != -1) {
            DineInselectedItems = HoldDineInItemsList
        } else {
            // store.delete('DineInselectedItems');
        }
    } else {
        // store.delete('DineInselectedItems');
    }
    //console.log("HoldDineInItemsList", DineInselectedItems)


    store.set('BillCounterId', BillCounterId);
    store.set('BillCounterName', BillCounterName);
    store.set('BillCounterCode', BillCounterCode);
    store.set('noOfSlots', NoOfSlots);
    store.set('IsEnableWaiterToken', IsEnableWaiterToken);
    store.set('IsEnableCustomerToken', IsEnableCustomerToken);
   // store.set('IsGSTInputBillSplit', IsGSTInputBillSplit);
    store.set('IsAllowReprint', IsAllowReprint);
    store.set('IsAllowReprintPassword', IsAllowReprintPassword);
    store.set('ReprintCount', ReprintCount);
    store.set('ReprintPassword', ReprintPassword);
    store.set('IsAllowKOTReprint', IsAllowKOTReprint);
    store.set('IsAllowKOTReprintPassword', IsAllowKOTReprintPassword);
    store.set('KOTReprintCount', KOTReprintCount);
    store.set('KOTReprintPassword', KOTReprintPassword); 
    store.set('IsAllowNegativeRoundOff', IsAllowNegativeRoundOff);
    store.set('IsAllowCustomerTokenGrouping',IsAllowCustomerTokenGrouping)
    //console.log("IsAllowCustomerTokenGrouping",IsAllowCustomerTokenGrouping)

    


    // store.delete('IsKOTPrint');
    // store.set('IsKOTPrint', IsKOTPrint);

    if (IsKOTPrint == 0) {

        $("#showKOTLabel").hide();
        $("#IsKOTCheck").hide();

    }
    loadKOTPrinters()
    loadCustomerTokenGroups()
    BillingdbService.addDayInfo().then(
        (result) => {
            if (result == 0) {

                document.getElementById('cashierName').innerHTML = store.get('DisplayName');
                document.getElementById('billCounterName').innerHTML = store.get('BillCounterName');
                loadItemsForBillCounter().then(async (res) => {
                    let item = {
                        "BillCounterId": store.get('BillCounterId'),
                    }
                    await BillingdbService.getBillCounterServiceTypes(item).then(
                        (res) => {
                            loadServiceTypesForBillCounter();

                            let services = res.Data;
                            let serviceTypeindex = services.findIndex(x => x.ServiceType.includes('Dine'));
                            let IsWebOrders = services.findIndex(x => x.IsWebOrders == 1 && x.ServiceType != "Catering");
                            let serviceTypeind = services.findIndex(x => x.ServiceType == "Dine-In");
                            if (serviceTypeindex != -1) {
                                let itemArray = {
                                    "IsGSTInputBillSplit":IsGSTInputBillSplit,
                                    "BillCounterId": BillCounterId,
                                    "IsAllowNegativeRoundOff":IsAllowNegativeRoundOff
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
                            
                                    // in case of error
                                    if (err) {
                            
                                        ErrorLog.writeLogFile('spAddCounterSettings', err.sqlMessage)
                            
                                    }
                                });
                            
                                connection.query("call spAddCounterSettings(?,?,?)", [itemArray.BillCounterId, itemArray.IsGSTInputBillSplit,itemArray.IsAllowNegativeRoundOff], function (err, rows, fields) {

                            
                                    if (err) {
                            
                            
                                        Swal.fire({
                                            title: err.sqlMessage,
                                            icon: 'warning',
                                            showCancelButton: false,
                                            confirmButtonText: 'Ok',
                                            allowOutsideClick: false
                                        })
                                        ErrorLog.writeLogFile('spAddCounterSettings', err.sqlMessage)
                                        return;
                                    }
                                    else {
                            
                                        ErrorLog.writeLogFile('spAddCounterSettings',"CounterSettings added successfully")
                                    }
                            
                            
                                });
                            
                                // Close the connection
                                connection.end(function () {
                                    // The connection has been closed
                                });
                                if (IsKOTPrint == 1) {

                                    $("#showKOTLabel").show();
                                    $("#IsKOTCheck").show();
                                }
                                $("#showSlot").hide();
                                $("#deleteAll").hide()
                                $("#PrintEstimateBill").hide()
                                $("#showTable").show();
                                $("#cookinglabel").hide();
                                $("#cookingList").hide();
                                getBillCounterTables()
                                debugger
                                getWaiters()
                                if(serviceTypeind != -1){
                                    $("#IsTakeAway").show();
                                }else{
                                    $("#IsTakeAway").hide();
                                }
                              
                                loadSlotButtons();
                                document.getElementById('TableSlot').innerText = "Table Slot#"
                                setTimeout(function () {
                                    HoldItemlist()

                                }, 1000)

                            } else {
                                if (IsWebOrders != -1) {
                                    $("#cookinglabel").show();
                                    $("#cookingList").show();
                                } else {
                                    $("#cookinglabel").hide();
                                    $("#cookingList").hide();
                                }
                                $("#showSlot").show();
                                $("#deleteAll").show()
                                $("#PrintEstimateBill").show()
                                $("#showTable").hide();
                                $("#showWaiterList").hide();
                                $("#IsTakeAway").hide();
                                $("#IsKOTCheck").hide();
                                $("#showKOTLabel").hide();
                                $("#showWaiterListLabel").hide();
                                document.getElementById('BillSlot').innerText = "Bill Slot#"
                                loadSlotButtons();
                                setTimeout(function () {
                                    HoldItemlist()
                                }, 1000)
                            }

                        }).catch(function (err) {
                            ErrorLog.writeLogFile('getBillCounterServiceTypes', err)
                        });

                }).catch(function (err) {
                    ErrorLog.writeLogFile('loadItemsForBillCounter', err)
                });

                $("#billingScreen").show();
                displayDateTime();
            }
            else {
                Swal.fire({
                    title: 'Counter was closed..!',
                    allowOutsideClick: false,
                    icon: 'warning',
                    confirmButtonText: 'Ok',
                }
                ).then((result) => {
                    if (result.isConfirmed) {
                        store.delete('loginToken');
                        clearInterval(myInterval);
                        ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                    }
                })
            }
        },
        (error) => {
            ErrorLog.writeLogFile('addDayInfo', error)
        }
    )
};



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
document.onkeyup = function (e) {

    let selectedvalue;
    if (e.which == 49 && e.ctrlKey == true) {
        selectedvalue = 1;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 50 && e.ctrlKey == true) {
        selectedvalue = 2;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 51 && e.ctrlKey == true) {
        selectedvalue = 3;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 52 && e.ctrlKey == true) {
        selectedvalue = 4;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 53 && e.ctrlKey == true) {
        selectedvalue = 5;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 54 && e.ctrlKey == true) {
        selectedvalue = 6;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 55 && e.ctrlKey == true) {
        selectedvalue = 7;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 56 && e.ctrlKey == true) {
        selectedvalue = 8;
        slotAllocation(selectedvalue);

    }
    else if (e.which == 57 && e.ctrlKey == true) {
        selectedvalue = 9;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 48 && e.ctrlKey == true) {
        selectedvalue = 10;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 49 && e.altKey == true) {
        selectedvalue = 11;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 50 && e.altKey == true) {
        selectedvalue = 12;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 51 && e.altKey == true) {
        selectedvalue = 13;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 52 && e.altKey == true) {
        selectedvalue = 14;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 53 && e.altKey == true) {
        selectedvalue = 15;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 54 && e.altKey == true) {
        selectedvalue = 16;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 55 && e.altKey == true) {
        selectedvalue = 17;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 56 && e.altKey == true) {
        selectedvalue = 18;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 57 && e.altKey == true) {
        selectedvalue = 19;
        slotAllocation(selectedvalue);
    }
    else if (e.which == 48 && e.altKey == true) {
        selectedvalue = 20;
        slotAllocation(selectedvalue);
    } else if (e.which == 65 && e.altKey == true) {

        selectedvalue = 65;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 66 && e.altKey == true) {

        selectedvalue = 66;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 67 && e.altKey == true) {

        selectedvalue = 67;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 68 && e.altKey == true) {

        selectedvalue = 68;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 69 && e.altKey == true) {

        selectedvalue = 69;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 70 && e.altKey == true) {

        selectedvalue = 70;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 71 && e.altKey == true) {

        selectedvalue = 71;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 72 && e.altKey == true) {

        selectedvalue = 72;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 73 && e.altKey == true) {

        selectedvalue = 73;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 74 && e.altKey == true) {

        selectedvalue = 74;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 75 && e.altKey == true) {

        selectedvalue = 75;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 76 && e.altKey == true) {

        selectedvalue = 76;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 77 && e.altKey == true) {

        selectedvalue = 77;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 78 && e.altKey == true) {

        selectedvalue = 78;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 79 && e.altKey == true) {

        selectedvalue = 79;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 80 && e.altKey == true) {

        selectedvalue = 80;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 81 && e.altKey == true) {

        selectedvalue = 81;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 82 && e.altKey == true) {

        selectedvalue = 82;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 83 && e.altKey == true) {

        selectedvalue = 83;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 84 && e.altKey == true) {

        selectedvalue = 84;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 85 && e.altKey == true) {

        selectedvalue = 85;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 86 && e.altKey == true) {

        selectedvalue = 86;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 87 && e.altKey == true) {

        selectedvalue = 87;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 88 && e.altKey == true) {

        selectedvalue = 88;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 89 && e.altKey == true) {

        selectedvalue = 89;
        onSeatSlotbtnClick(selectedvalue);
    } else if (e.which == 90 && e.altKey == true) {

        selectedvalue = 90;
        onSeatSlotbtnClick(selectedvalue);
    }
    else if (e.which == 66 && e.ctrlKey == true) {
        openBillReceiptWindow()
    } else if (e.which == 80 && e.ctrlKey == true) {
        openPreviousBillWindow()
    }
    else if (e.which == 113) {
debugger
        ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
        ServiceTypeId = Number(ServiceTypeId);
        let serviceIndex = serviceTypes.findIndex(x => x.ServiceTypeId == ServiceTypeId)
        let lastIndex = serviceTypes.length - 1;

        if (serviceIndex != lastIndex) {
            $('#serviceType_' + serviceTypes[serviceIndex + 1].ServiceTypeId).prop('checked', true);
        } else {
            $('#serviceType_' + serviceTypes[0].ServiceTypeId).prop('checked', true);
        }


        ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
        ServiceTypeId = Number(ServiceTypeId);
        let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType

        if (serviceName != "Dine-In" && serviceName != "DineIn-Self Service") {

            $("#showWaiterList").hide();
            $("#showWaiterListLabel").hide();
            $("#showKOTLabel").hide();
            $("#showTable").hide();
            $("#showSlot").show();
            $("#deleteAll").show()
            $("#PrintEstimateBill").show()
            $("#IsTakeAway").hide();
            $("#IsKOTCheck").hide();
            // if (serviceName == "Sweetshop" ||serviceName == "Take Away") {
            //     $("#showWaiterList").show();
            //     $("#showWaiterListLabel").show();
            //     debugger
            //     getWaiters()
            // }
            // else{
            //     $("#showWaiterList").hide();
            //     $("#showWaiterListLabel").hide();
            // }
            loadItemsData(serviceName)
            calculateAmount(serviceName)
            document.getElementById('BillSlot').innerText = "Bill Slot#";

        } else if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {
            if (IsKOTPrint == 1) {
                $("#showKOTLabel").show();
                $("#IsKOTCheck").show();

            }
            $("#showWaiterList").show();
            $("#showWaiterListLabel").show();
            $("#showTable").show();
            $("#deleteAll").hide()
            $("#PrintEstimateBill").hide()
            $("#showSlot").hide();
            if(serviceName == "Dine-In"){
                $("#IsTakeAway").show();
            }else{
                $("#IsTakeAway").hide();
            }

            loadItemsData(serviceName)
            calculateAmount(serviceName)

            document.getElementById('TableSlot').innerText = "Table Slot#"

        }
        item(ServiceTypeId)
    }

    else if (e.which == 120) {
        F9();
        e.preventDefault();
        e.stopPropagation()
    }
    else if (e.which == 112) {
        $('#itemName').focus();
    }
    else {
        return;
    }
};


function HoldItemlist() {

    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    ServiceTypeId = Number(ServiceTypeId);
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    let event = 1
    if (serviceName != "Dine-In" && serviceName != "DineIn-Self Service") {
        debugger;
        if (serviceName == "Sweetshop" || serviceName == "Take Away" ) {
            debugger
            getWaiters()
            $("#showWaiterList").show();
            $("#showWaiterListLabel").show();
        }
        else{
            $("#showWaiterList").hide();
            $("#showWaiterListLabel").hide();
        }
        $("#showKOTLabel").hide();
        $("#showTable").hide();
        $("#showSlot").show();
        $("#deleteAll").show()
        $("#PrintEstimateBill").show()
        $("#IsTakeAway").hide();
        $("#IsKOTCheck").hide();

        document.getElementById('BillSlot').innerText = "Bill Slot#"

        slotAllocation(event);
        debugger
        let tempItem = selectedItems.filter(row => row.BillSlotNo != 0);
        if (tempItem != undefined) {

            if (tempItem.length > 0) {
                for (let i = 0; i < tempItem.length; i++) {
                    $("#slotbtn_" + tempItem[i].BillSlotNo).removeClass("btn-new").addClass('btn-hold');
                }
            } else {
                for (let i = 0; i < selectedItems.length; i++) {
                    $("#slotbtn_" + selectedItems[i].BillSlotNo).removeClass("btn-hold").addClass('btn-new');
                }
            }
        }

    } else if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {

        if (IsKOTPrint == 1) {
            $("#showKOTLabel").show();
            $("#IsKOTCheck").show();

        }
        $("#showWaiterList").show();
        $("#showWaiterListLabel").show();
        $("#showTable").show();
        $("#deleteAll").hide()
        $("#PrintEstimateBill").hide()
        $("#showSlot").hide();
        if (serviceName == "Dine-In"){
            $("#IsTakeAway").show();
        }else{
            $("#IsTakeAway").hide();
        }
     
        document.getElementById('TableSlot').innerText = "Table Slot#"
        slotAllocation(event);


        let tempItem = DineInselectedItems.filter(row => row.TableNo != 0 && row.TableNo != 1);
        if (tempItem != undefined) {

            if (tempItem.length > 0) {
                for (let i = 0; i < tempItem.length; i++) {
                    $("#tablebtn_" + tempItem[i].TableNo).removeClass("btn-new").addClass('btn-hold');
                }
            } else {
                for (let i = 0; i < DineInselectedItems.length; i++) {
                    $("#tablebtn_" + DineInselectedItems[i].TableNo).removeClass("btn-hold").addClass('btn-new');
                }
            }
        }


    }



}
function slotAllocation(selectedvalue) {

    let serviceName;
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (serviceName != "Dine-In" && serviceName != "DineIn-Self Service") {
        onSlotbtnClick(selectedvalue)
    }
    else if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {

        onTableSlotbtnClick(selectedvalue)
    }
}

$('#log-out').click(function () {

    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to log out.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Logout'
    }).then((result) => {

        if (result.value) {

         
            let holdItemlist = []
            holdItemlist = selectedItems.length != 0 ? selectedItems : []
            if (holdItemlist.length != 0) {
                store.set('SelectedItems', selectedItems)

            } else {
                store.delete('SelectedItems')
            }
            let holdDineInlist = []
            holdDineInlist = DineInselectedItems.length != 0 ? DineInselectedItems : []
            if (holdDineInlist.length != 0) {
                store.set('DineInselectedItems', DineInselectedItems)
            } else {
                store.delete('DineInselectedItems')
            }
            store.delete('loginToken');
            clearInterval(myInterval);
            ipcRenderer.invoke('Navigate', environment.PageUrl.login);
        }
    });
});

$('#quit').click(function () {
    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to close the application.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Close Application'
    }).then((result) => {
        if (result.value) {
          
            let holdItemlist = []
            holdItemlist = selectedItems.length != 0 ? selectedItems : []
            if (holdItemlist.length != 0) {
                store.set('SelectedItems', selectedItems)
           
            } else {
                store.delete('SelectedItems')
            }
            let holdDineInlist = []
            holdDineInlist = DineInselectedItems.length != 0 ? DineInselectedItems : []
            if (holdDineInlist.length != 0) {
                store.set('DineInselectedItems', DineInselectedItems)
            } else {
                store.delete('DineInselectedItems')
            }
            clearInterval(myInterval);
            store.delete('loginToken');
            ipcRenderer.send('app-quit', '');
        }
    });
});


$('#Minimize').click(function () {
    ipcRenderer.send('minimize', '')
});

var KOTBills = $.fn.KOT = function (event) {
debugger
    return new Promise(function (resolve, reject) {
        debugger
        let serverDate = document.getElementById('currentDateTime').innerHTML
        let serverDateArr = serverDate.split('-')
        let displayDate = serverDateArr[0]
        let splitDate = displayDate.split('/')
        let joinDate = splitDate[0] + "-" + splitDate[1] + "-" + splitDate[2]
        let KOTDate = joinDate.trim()
        let Time = serverDateArr[1]
        let tempTime = Time.split(' ')
        let KOTTime = tempTime[1]
        WaiterId = $('#showWaiter').val()
        TableNo = tableSlotNo
        ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
        let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
        SeatNo = String.fromCharCode(seatbillSlotNo)
        let KOTPrintersList = store.get('KOTPrintersList')
        let PrinterName = store.get('PrinterName')
        let cashierName = document.getElementById('cashierName').innerHTML
        let SentBy = cashierName;
        let KOTGroupList;
        let itemGroupId;
        let loginId;
        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

        let Item = {
            "TableNo": TableNo,
            "BillCounterId": store.get('BillCounterId'),
            "SeatNo": SeatNo,
            "SaleDate": SaleDate
        }
        getPOSSaleDetails(Item).then((res) => {
            //console.log("getPOSSaleDetailsres", res)

            if ((serviceName == "Dine-In" && WaiterId != '') || serviceName == "DineIn-Self Service") {
debugger
           
            WaiterName = WaiterId!=''?WaiterList.filter(x => x.WaiterId == WaiterId)[0].WaiterName:'';
           
             
                let SaleKOTItemdetails = DineinList.filter(x => x.IsKOTSent == 0 && x.TableNo == TableNo && x.SeatNo == SeatNo )
                if (SaleKOTItemdetails.length != 0) {
                    var ItemArray = SaleKOTItemdetails.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
                    let SaleHeaderId = 0
                    let KOTDetails = {
                        Date: KOTDate,
                        Time: KOTTime,
                        TableNo: TableNo,
                        ServiceType:serviceName,
                        SeatNo: SeatNo,
                        WaiterName: WaiterName,
                        ItemArray: ItemArray,
                        cashierName: cashierName,
                        BillCounterName: store.get('BillCounterName')
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

                        // in case of error
                        if (err) {

                            ErrorLog.writeLogFile('spChecklock', err.sqlMessage)

                            reject(err)
                        }
                    });

                    connection.query("call spChecklock(?,?,?)", [SentBy, TableNo, SeatNo], function (err, rows, fields) {

                        if (err) {

                            ErrorLog.writeLogFile('spChecklock', err.sqlMessage)
                            Swal.fire({
                                title: err.sqlMessage,
                                icon: 'warning',
                                showCancelButton: false,
                                confirmButtonText: 'Ok'
                            })
                            reject(err.sqlMessage)
                            return;
                        }
                        else {

                            if(serviceName== "Dine-In"){
                                TokenPrinterService.getSaleBilldetail(SaleHeaderId, KOTDetails).then((res) => {
                                    debugger
                                    let result = res
                                }).catch((err) => {
                                    ErrorLog.writeLogFile('TokenPrinterService', err)

                                })
                            }
                          

                            for (let i = 0; i < SaleKOTItemdetails.length; i++) {
                                itemGroupId = SaleKOTItemdetails[i].ItemGroupId
                                KOTGroupList = KOTPrintersList.find(x => x.ItemGroupId == itemGroupId)
                                if (KOTGroupList != undefined) {
                                    SaleKOTItemdetails[i].PrinterName = KOTGroupList.PrinterName
                                    SaleKOTItemdetails[i].IpAddress = KOTGroupList.IpAddress
                                } else {
                                    if (PrinterName == "") {
                                        Swal.fire(
                                            'warning..!',
                                            'Please Configure printer Settings..!',
                                            'warning'
                                        )
                                    } else {
                                        SaleKOTItemdetails[i].PrinterName = PrinterName
                                        SaleKOTItemdetails[i].IpAddress = 0
                                    }

                                }

                            }

                            //** KOT OrderNo **
                            // for (let i = 0; i < SaleKOTItemdetails.length; i++) {
                            //     
                            //     let OrderNoCount = []
                            //     let SaleKOTSentdetails = selectedItems.filter(x => x.IsKOTSent == 1 && x.TableSlotNo == TableNo && x.seatbillSlotNo == seatbillSlotNo)

                            //     if (SaleKOTSentdetails.length == 0) {
                            //         
                            //         OrderNoCount = "Order No:" + ' # ' + 1

                            //     }
                            //     else if (SaleKOTSentdetails.length != 0) {
                            //         
                            //         let len = SaleKOTSentdetails.length

                            //         if (i == 0) {
                            //             let OrderNo = len + 1
                            //             OrderNoCount = "Order No:" + ' # ' + OrderNo

                            //         } else {
                            //             let OrderNo = len + 1
                            //             OrderNoCount = "Order No:" + ' # ' + OrderNo
                            //         }

                            //     }

                            //     let KOTDetails = {
                            //         Date: KOTDate,
                            //         Time: KOTTime,
                            //         TableNo: TableNo,
                            //         SeatNo: SeatNo,
                            //         WaiterName: WaiterName,
                            //         BillCounterName: store.get('BillCounterName'),
                            //         ItemName: SaleKOTItemdetails[i].ItemName,
                            //         Quantity: SaleKOTItemdetails[i].Quantity,
                            //         UOM: SaleKOTItemdetails[i].UOM,
                            //         OrderNoCount, OrderNoCount,
                            //         POSPrinterName: SaleKOTItemdetails[i].PrinterName,
                            //         IsTakeAway: SaleKOTItemdetails[i].IsTakeAway
                            //     }


                            //   let RowId = SaleKOTItemdetails[i].RowId;

                            KOTBillsIndex(SaleKOTItemdetails, KOTDetails).then((res) => {
                                resolve("KOTBills Query succesfully executed", res);

                            }).catch((err) => {
                                ErrorLog.writeLogFile('KOTBills Query failed to executed', err.sqlMessage)

                                reject("KOTBills Query failed to executed", err);

                            })
                        }

                    });

                    // Close the connection
                    connection.end(function () {
                        // The connection has been closed
                    });
                    // })


                } else {
                    Swal.fire({
                        title: 'KOT Is Already Sent',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: 'Ok'
                    })
                    ErrorLog.writeLogFile('Success', 'KOT Is Already Sent')
                    resolve("KOT Is Already Sent")
                }


            } else {
                Swal.fire({
                    title: 'Please Choose Waiter?',
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                })
                ErrorLog.writeLogFile('Please Choose Waiter')
                reject("Please Choose Waiter")
            }
            $('#itemName').val('');
            $('#quantity').val('');
            // }, 100);
            //  })
        }).catch((err) => {
            ErrorLog.writeLogFile('getPOSSaleDetails', err.sqlMessage)
            reject(err)
        })


    })
}
function KOTBillsIndex(SaleKOTItemdetails, KOTDetails) {

    return new Promise(function (resolve, reject) {
        i = 0;

        let printernamelist = Array.from(new Set(SaleKOTItemdetails.map(s => s.PrinterName))).map(PrinterName => {
            return PrinterName
        })
        UpdatePOSSalesKOTIndex(i, printernamelist, SaleKOTItemdetails, KOTDetails).then((res) => {

            resolve("UpdatePOSSalesKOTIndex SuccessFully", res)
        }).catch((err) => {

            ErrorLog.writeLogFile('UpdatePOSSalesKOTIndex', err)
            reject(err)
        })
    })
}

function UpdatePOSSalesKOTIndex(i, printernamelist, SaleKOTItemdetails, KOTDetails) {
    return new Promise(function (resolve, reject) {
        if (i <= (printernamelist.length - 1)) {
            let POSPrinterName = printernamelist[i];
            KOTFilteredList = SaleKOTItemdetails.filter(x => x.PrinterName == POSPrinterName)
            KOTFilteredTakeAwayList = KOTFilteredList.filter(x => x.IsTakeAway == 1)
            KOTFilteredNonTakeAwayList = KOTFilteredList.filter(x => x.IsTakeAway == 0)
            if (KOTFilteredNonTakeAwayList.length != 0) {

                KOTUserPrinterService.KOTItemsPrinter(KOTFilteredNonTakeAwayList, KOTDetails, POSPrinterName, 0).then(async (res) => {

                    let POSSaleIdlist = JSON.stringify(KOTFilteredNonTakeAwayList.map(obj => ({ POSSaleId: obj.POSSaleId })));


                    await UpdatePOSSalesKOT(POSSaleIdlist).catch((err) => {
                        ErrorLog.writeLogFile('UpdatePOSSalesKOT', err)
                    })



                }).catch((err) => {
                    ErrorLog.writeLogFile('KOTFilteredNonTakeAwayList', err)
                    reject(err)
                })
            }

            if (KOTFilteredTakeAwayList.length != 0) {

                KOTUserPrinterService.KOTItemsPrinter(KOTFilteredTakeAwayList, KOTDetails, POSPrinterName, 1).then(async (res) => {

                    let POSSaleIdlist = JSON.stringify(KOTFilteredTakeAwayList.map(obj => ({ POSSaleId: obj.POSSaleId })));

                    await UpdatePOSSalesKOT(POSSaleIdlist).catch((err) => {
                        ErrorLog.writeLogFile('UpdatePOSSalesKOT', err)

                    })
                    //console.log("KOTFilteredTakeAwayList", res, POSSaleIdlist)
                }).catch((err) => {
                    ErrorLog.writeLogFile('KOTFilteredTakeAwayList', err)
                    reject(err)
                })
            }
        } else {

            resolve("UpdatePOSSalesKOTIndex")
        }


        setTimeout(() => {
            if (i < (printernamelist.length)) {
                i++;
                UpdatePOSSalesKOTIndex(i, printernamelist, SaleKOTItemdetails, KOTDetails)
            }
        }, 100);
        setTimeout(() => {
            resolve("UpdatePOSSalesKOTIndex")
        }, 1000);
    })

}

async function UpdatePOSSalesKOT(POSSaleIdlist) {



    return new Promise(function (resolve, reject) {
        let loginId
        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        let CashierName = store.get('DisplayName');
        let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
        let Item = {
            "POSSaleIds": POSSaleIdlist,
            "IsKOTSentBy": CashierName,
            "Source": '/Dine-In Desktop',
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

            // in case of error
            if (err) {

                ErrorLog.writeLogFile('spUpdatePOSSalesKOT', err.sqlMessage)
                reject(err)
            }
        });

        connection.query("call spUpdatePOSSalesKOT(?,?,?,?) ", [Item.POSSaleIds, Item.IsKOTSentBy, Item.Source, Item.LoginId], function (err, rows, fields) {

            if (err) {

                ErrorLog.writeLogFile('spUpdatePOSSalesKOT', err.sqlMessage)
                reject(err)
                return;
            }
            else {



                let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

                let Item = {
                    "TableNo": tableSlotNo,
                    "BillCounterId": store.get('BillCounterId'),
                    "SeatNo": String.fromCharCode(seatbillSlotNo),
                    "SaleDate": SaleDate
                }
                getPOSSaleDetails(Item).then((res) => {
                    resolve(res)

                }).catch((err) => {
                    ErrorLog.writeLogFile('spUpdatePOSSalesKOT', err.sqlMessage)
                    reject(err)
                })

            }


        });

        // Close the connection
        connection.end(function () {
            // The connection has been closed
        });
    })
}

function loadItemsForBillCounter() {
    return new Promise(function (resolve, reject) {
  

        ItemdbService.getAllItems({ "BillCounterId": store.get('BillCounterId') }).then(
            function (result) {
           
                itemList = result;
                resolve("Item get successfully")

            }).catch(function (err) {
                ErrorLog.writeLogFile('loadItemsForBillCounter', err)
                reject('loadItemsForBillCounter')
            })

    })
}

var input = document.getElementById("itemName");
var suggestions = []

function item(serviceTypeId) {

    tempItemList = []
    tempItemList = itemList.filter(row => row.ServiceTypeId == serviceTypeId);
}

autocomplete({
    input: input,
    fetch: function (text, update) {
        text = text.toLowerCase();
        suggestions = tempItemList.filter(n => n.ItemName.toLowerCase().startsWith(text) || n.ItemCode.toLowerCase().trim().startsWith(text) || n.Barcode.toLowerCase().trim().includes(text))
        update(suggestions);
        suggestions = [];
    },
    onSelect: function (item) {
        $('#quantity').val('');
        UOMname = '';
        UOMname = item.UOM;
        input.value = item.ItemName;
        itemId = item.ItemId;
        itemBrandId = item.ItemBrandId;
        //event.preventDefault();
        $('#quantity').focus();
    },
})


$("#itemName").keydown(function (e) {
    var itemName = document.getElementById("itemName").value;
    let text = itemName.toLowerCase();
    let checkItem = tempItemList.filter(n => n.ItemName.toLowerCase().startsWith(text) || n.ItemCode.toLowerCase().trim().startsWith(text) || n.Barcode.toLowerCase().trim().includes(text))

    if (e.which == 13) {
        if (itemName == '') {
            $('#quantity').val('');
            Swal.fire({
                title: 'Warning..!',
                text: "Please Enter Item Name",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
            e.preventDefault();
        }
        else if (itemId == undefined || itemId == '' || itemId == 0) {
            $('#quantity').val('');
            Swal.fire({
                title: 'Warning..!',
                text: "Please Enter Valid Item Name",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
            e.preventDefault();
        }
        else if (itemName.length > 2 == false || checkItem.length == 0) {
            itemId = 0;
            $('#quantity').val('');
            Swal.fire({
                title: 'Warning..!',
                text: "Please Enter Valid Item Name",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
            e.preventDefault();
        }
        else {
            $('#quantity').val('');
            $('#quantity').focus();
        }
    }
    else if (e.which == 40) {
        if (itemName == '') {
            $('#quantity').val('');
            Swal.fire({
                title: 'Warning..!',
                text: "Please Enter Item Name",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
        }
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

function loadItemsData(servicetypeName) {
debugger
    selectedItemsForView = '';
    if (servicetypeName == "Dine-In" || servicetypeName == "DineIn-Self Service") {
        let ItemsForSelectedBillSlot = DineinList.filter(row => row.TableNo == tableSlotNo && row.SeatNo == String.fromCharCode(seatbillSlotNo));
        //    let ItemsForSelectedBillSlot = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == seatbillSlotNo);
        if (ItemsForSelectedBillSlot.length > 0) {
        if (servicetypeName == "Dine-In"){
            ItemsForSelectedBillSlot.forEach(row => {

                if (row.IsTakeAway == 1 && row.IsKOTSent == 1) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td style="font-size: 23px;"><i  style="color:green" class="fa fa-check"></i></td> 

                            <td style="font-size: 23px;"><input type="checkbox" disabled="true" checked onclick="$(this).IsTakeAwayCheck(${row.POSSaleId})" id="IsTakeAway_${row.POSSaleId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                           
                        </tr>`;
                }

                else if (IsKOTPrint == 1 && row.IsTakeAway == 1 && row.IsKOTSent == 0) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td style="font-size: 23px;"></td> 

                            <td style="font-size: 23px;"><input type="checkbox"  checked onclick="$(this).IsTakeAwayCheck(${row.POSSaleId})" id="IsTakeAway_${row.POSSaleId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                           
                        </tr>`;
                }
                else if (IsKOTPrint == 0 && row.IsTakeAway == 1 && row.IsKOTSent == 0) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 

                            <td style="font-size: 23px;"><input type="checkbox"  checked onclick="$(this).IsTakeAwayCheck(${row.POSSaleId})" id="IsTakeAway_${row.POSSaleId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>             
                        </tr>`;
                }
                else if (row.IsTakeAway == 0 && row.IsKOTSent == 1) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td style="font-size: 23px;"><i  style="color:green"  class="fa fa-check"></i></td> 

                            <td style="font-size: 23px;"><input type="checkbox"  disabled="true" onclick="$(this).IsTakeAwayCheck(${row.POSSaleId})" id="IsTakeAway_${row.POSSaleId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                       
                        </tr>`;
                }
                else if (row.IsTakeAway == 0 && row.IsKOTSent == 0 && IsKOTPrint == 1) {
                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td style="font-size: 23px;"></td> 

                            <td style="font-size: 23px;"><input type="checkbox"  onclick="$(this).IsTakeAwayCheck(${row.POSSaleId})" id="IsTakeAway_${row.POSSaleId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                          
                        </tr>`;
                }
                else if (row.IsTakeAway == 0 && row.IsKOTSent == 0 && IsKOTPrint == 0) {
                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 

                            <td style="font-size: 23px;"><input type="checkbox"  onclick="$(this).IsTakeAwayCheck(${row.POSSaleId})" id="IsTakeAway_${row.POSSaleId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                         
                        </tr>`;
                }
                else {
                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 

                            <td style="font-size: 23px;"><input type="checkbox"  onclick="$(this).IsTakeAwayCheck(${row.RowId})" id="IsTakeAway_${row.RowId}" ></td> 
                            
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.RowId},${row.BillSlotNo},${row.TableSlotNo},${row.seatbillSlotNo})"><i
                            class="fa fa-times"></i></button></td>                           
                        </tr>`;
                }
                debugger
                let WaiterItemlist = ItemsForSelectedBillSlot.filter(x => x.WaiterId != 0)
                if (WaiterItemlist.length > 0) {
                    let WaiterId = WaiterItemlist.find(x => x.WaiterId != 0).WaiterId
                    $("#showWaiter").val(WaiterId)
                    document.getElementById('showWaiter').setAttribute("disabled", "disabled");
                }else{
                    document.getElementById('showWaiter').removeAttribute("disabled");
                }

                $('#product_list').html(selectedItemsForView);
                $("#tablebtn_" + tableSlotNo).removeClass("btn-hold").addClass('btn-active');
            })
        }
        else{
            ItemsForSelectedBillSlot.forEach(row => {

                if ( row.IsKOTSent == 1) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td style="font-size: 23px;"><i  style="color:green" class="fa fa-check"></i></td> 
 
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                           
                        </tr>`;
                }
                else if (IsKOTPrint == 1  && row.IsKOTSent == 0) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td style="font-size: 23px;"></td> 

                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>                           
                        </tr>`;
                }
                else if (IsKOTPrint == 0  && row.IsKOTSent == 0) {

                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 

                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.POSSaleId})"><i
                            class="fa fa-times"></i></button></td>             
                        </tr>`;
                }
                else {
                    selectedItemsForView += `<tr>
                            <td style="font-size: 23px;">${row.ItemName}</td>
                            <td style="font-size: 23px;">${row.UOM}</td>         
                            <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
                            <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
                            <td>
                            <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete"   onclick="$(this).delete(${row.RowId},${row.BillSlotNo},${row.TableSlotNo},${row.seatbillSlotNo})"><i
                            class="fa fa-times"></i></button></td>                           
                        </tr>`;
                }
                debugger
                let WaiterItemlist = ItemsForSelectedBillSlot.filter(x => x.WaiterId != 0)
                if (WaiterItemlist.length > 0) {
                    let WaiterId = WaiterItemlist.find(x => x.WaiterId != 0).WaiterId
                    $("#showWaiter").val(WaiterId)
                    document.getElementById('showWaiter').setAttribute("disabled", "disabled");
                }else{
                    document.getElementById('showWaiter').removeAttribute("disabled");
                    $("#showWaiter").empty();
                    if (WaiterList.length == 1) {
                        // Directly set the particular WaiterId to the dropdown
                         $("#showWaiter").append('<option value=' + WaiterList[0]['WaiterId'] + '>' + WaiterList[0]['WaiterName'] + '</option>');
                    }
                     else if(WaiterList.length > 1) {
                     //   If there are multiple waiters, loop through and append each to the dropdown
                        $("#showWaiter").append("<option value=''><-- Select Waiter --></option>");
                        for (var i = 0; i < WaiterList.length; i++) {
                            $("#showWaiter").append('<option value=' + WaiterList[i]['WaiterId'] + '>' + WaiterList[i]['WaiterName'] + '</option>');
                        }
                        $("#showWaiterList").show();
                        $("#showWaiterListLabel").show();
                        $("#showWaiter").show();
              
                        
                    }else{
                   $("#showWaiter").val('')
                    }
                }

                $('#product_list').html(selectedItemsForView);
                $("#tablebtn_" + tableSlotNo).removeClass("btn-hold").addClass('btn-active');
            })
        }
          
        }
        else {

            $('#product_list').empty();
            $("#tablebtn_" + tableSlotNo).removeClass("btn-hold").addClass('btn-active');
            $("#seatbtn_" + String.fromCharCode(seatbillSlotNo)).removeClass("btn-hold").addClass('btn-active');
            document.getElementById('showWaiter').removeAttribute("disabled");
            
            $("#showWaiter").empty();
            if (WaiterList.length == 1) {
                // Directly set the particular WaiterId to the dropdown
                 $("#showWaiter").append('<option value=' + WaiterList[0]['WaiterId'] + '>' + WaiterList[0]['WaiterName'] + '</option>');
            }
             else if(WaiterList.length > 1) {
             //   If there are multiple waiters, loop through and append each to the dropdown
                $("#showWaiter").append("<option value=''><-- Select Waiter --></option>");
                for (var i = 0; i < WaiterList.length; i++) {
                    $("#showWaiter").append('<option value=' + WaiterList[i]['WaiterId'] + '>' + WaiterList[i]['WaiterName'] + '</option>');
                }
                $("#showWaiterList").show();
                $("#showWaiterListLabel").show();
                $("#showWaiter").show();
      
                
            }else{
           $("#showWaiter").val('')
            }
            document.getElementById('showWaiter').removeAttribute("disabled");
        }
        TotalItems = ItemsForSelectedBillSlot.length;
        document.getElementById('TotalItems').innerHTML = TotalItems;
    }
    else {
debugger
        let ItemsForSelectedBillSlot = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == servicetypeName);
        if (ItemsForSelectedBillSlot.length > 0) {

            ItemsForSelectedBillSlot.forEach(row => {
                selectedItemsForView +=

                    `<tr>
        <td style="font-size: 23px;">${row.ItemName}</td>
        <td style="font-size: 23px;">${row.UOM}</td>         
        <td style="font-size: 23px;">${parseFloat(row.Quantity).toFixed(3)}</td>
        <td style="font-size: 23px;">${parseFloat(row.Rate).toFixed(2)}</td>
        <td style="font-size: 23px;">${parseFloat(row.Tax).toFixed(2)}</td>
        <td style="font-size: 23px;">${parseFloat(row.Amount).toFixed(2)}</td> 
        
        <td>
        <button style="font-size: 23px;" class="btn btn-danger btn-xs" id="user-delete" onclick="$(this).delete(${row.RowId},${row.BillSlotNo},${row.TableSlotNo},${row.seatbillSlotNo})"><i
        class="fa fa-times"></i></button></td>                           
    </tr>`;

                $('#product_list').html(selectedItemsForView);
                $("#slotbtn_" + billSlotNo).removeClass("btn-hold").addClass('btn-active');
            })
            if (servicetypeName == "Sweetshop" || servicetypeName == "Take Away") {
                debugger
            let WaiterItemlist = ItemsForSelectedBillSlot.filter(x => x.WaiterId != 0)
            if (WaiterItemlist.length > 0) {
                let WaiterId = WaiterItemlist.find(x => x.WaiterId != 0).WaiterId
                $("#showWaiterList").show();
                $("#showWaiterListLabel").show();
                $("#showWaiter").val(WaiterId)
                document.getElementById('showWaiter').setAttribute("disabled", "disabled");
            }else{
                $("#showWaiter").val('')
                document.getElementById('showWaiter').removeAttribute("disabled");
            }
        }else{
            $("#showWaiter").val('')
            $("#showWaiterList").hide();
            $("#showWaiterListLabel").hide();
        }
    }
        else {
            $('#product_list').empty();
            if (servicetypeName == "Sweetshop" || servicetypeName == "Take Away"){
                $("#showWaiter").empty();
                if (WaiterList.length == 1) {
                    // Directly set the particular WaiterId to the dropdown
                     $("#showWaiter").append('<option value=' + WaiterList[0]['WaiterId'] + '>' + WaiterList[0]['WaiterName'] + '</option>');
                }
                 else if(WaiterList.length > 1) {
                 //   If there are multiple waiters, loop through and append each to the dropdown
                    $("#showWaiter").append("<option value=''><-- Select Waiter --></option>");
                    for (var i = 0; i < WaiterList.length; i++) {
                        $("#showWaiter").append('<option value=' + WaiterList[i]['WaiterId'] + '>' + WaiterList[i]['WaiterName'] + '</option>');
                    }
                    $("#showWaiterList").show();
                    $("#showWaiterListLabel").show();
                    $("#showWaiter").show();
          
                    
                }else{
               $("#showWaiter").val('')
                }
                document.getElementById('showWaiter').removeAttribute("disabled");
            }   

 
        }
        TotalItems = ItemsForSelectedBillSlot.length;
        document.getElementById('TotalItems').innerHTML = TotalItems;
    }
}
function AddItemIntoList() {
    debugger
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {

        let loginId;
        if (store.get('IsOnline') == 'true') {
            loginId = EncrDecrService.decrypt(store.get('Ref'))
        }
        else {
            loginId = store.get('Ref')
        }
        let WaiterId = $('#showWaiter').val()
        let BillCounterId = store.get('BillCounterId');
        let quantity = $('#quantity').val();
        var date = new Date()
        var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
        if ((serviceName == "Dine-In" && WaiterId != '') || serviceName == "DineIn-Self Service"){
            let WaiterName =WaiterId!=''?WaiterList.filter(x => x.WaiterId == WaiterId)[0].WaiterName:'';


            let itemArray = {
                "SaleDate": serverDate,
                "ItemName": selectedItem[0].ItemName,
                "ItemId": selectedItem[0].ItemId,
                "ItemBrandId": selectedItem[0].ItemBrandId,
                "ItemGroupId": selectedItem[0].ItemGroupId,
                "HSNNo": selectedItem[0].HSNNo,
                "UOM": selectedItem[0].UOM,
                "Quantity": quantity,
                "Rate": selectedItem[0].Rate,
                "GST": selectedItem[0].GST,
                "CESS": selectedItem[0].CESS,
                "CashierName": store.get('DisplayName'),
                "WaiterName": WaiterName!=''?WaiterName:'' ,
                "WaiterId": WaiterId!=''?WaiterId:0,
                "TableNo": tableSlotNo,
                "SeatNo": String.fromCharCode(seatbillSlotNo),
                "IsKOTSent": 0,
                "IsKOTSentTime": "12:00:00",
                "IsTakeAway": 0,
                "IsShowHSN": selectedItem[0].IsShowHSN,
                "IsGSTInput":selectedItem[0].IsGSTInput,
                "IsSync": 0,
                "IsFromDevice": 0,
                "ServiceType": serviceName,
                "ServiceTypeId": ServiceTypeId,
                "BillCounterId": BillCounterId,
                "CreatedBy": loginId,
                "CreatedOn": serverDate,
                "UpdatedBy": loginId,
                "UpdatedOn": serverDate
            }


            let itemListArray = [];
            itemListArray.push(itemArray);

            var sql = "INSERT INTO tblpossales(SaleDate,ItemName,ItemId,ItemBrandId,ItemGroupId,HSNNo,UOM,Quantity,Rate,GST,CESS,CashierName,WaiterName,WaiterId,TableNo,SeatNo,IsKOTSent,IsKOTSentTime,IsTakeAway,IsShowHSN,IsGSTInput,IsSync,IsFromDevice,ServiceType,ServiceTypeId,BillCounterId,CreatedBy,CreatedOn,UpdatedBy,UpdatedOn) VALUES ?";
            var saleValues = itemListArray.map(Object.values)
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

                // in case of error
                if (err) {

                    ErrorLog.writeLogFile('AddItemIntoList', err.sqlMessage)

                }
            });

            connection.query(sql, [saleValues], function (err, rows, fields) {

                if (err) {


                    Swal.fire({
                        title: err.sqlMessage,
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: 'Ok',
                        allowOutsideClick: false
                    })
                    ErrorLog.writeLogFile('AddItemIntoList', err.sqlMessage)
                    return;
                }
                else {

                    let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

                    let Item = {
                        "TableNo": tableSlotNo,
                        "BillCounterId": store.get('BillCounterId'),
                        "SeatNo": String.fromCharCode(seatbillSlotNo),
                        "SaleDate": SaleDate
                    }
                    getPOSSaleDetails(Item)
                    $('#itemName').val('');
                    $('#quantity').val('');
                    $('#itemName').focus();
                    itemId = 0;
                    itemBrandId = 0;
                }


            });

            // Close the connection
            connection.end(function () {
                // The connection has been closed
            });

        } else {
            Swal.fire({
                title: 'Please Choose Waiter?',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
            // $('#showWaiter').focus();
            //$('#quantity').val('');
            //  $('#itemName').focus();
        }

    } else {
        debugger
        let WaiterId = $('#showWaiter').val()
    //    let WaiterName = WaiterList.filter(x => x.WaiterId == WaiterId)[0].WaiterName;

        if (WaiterId == '' && serviceName == "Sweetshop") {
            Swal.fire({
                title: 'Please Choose Waiter?',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
            return false;
        }
        let BillCounterId = store.get('BillCounterId');
        let rowId = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1].RowId + 1 : 1;
        let quantity = $('#quantity').val();
        let IsTakeAway = 0;
        selectedItems.push({
            RowId: rowId,
            BillSlotNo: serviceName != "Dine-In" && serviceName != "DineIn-Self Service" ? billSlotNo : 0,
            TableSlotNo: tableSlotNo,
            seatbillSlotNo: serviceName == "Dine-In" || serviceName == "DineIn-Self Service" ? seatbillSlotNo : 0,
            ItemId: selectedItem[0].ItemId,
            ServiceType: serviceName,
            POSId: environment.POSId,
            CompanyId: environment.CompanyId,
            BillCounterId: BillCounterId,
            ItemBrandId: selectedItem[0].ItemBrandId,
            ItemGroupId: selectedItem[0].ItemGroupId,
            IsTakeAway: IsTakeAway,
            IsShowHSN: selectedItem[0].IsShowHSN,
            IsGSTInput: selectedItem[0].IsGSTInput,
            IsKOTSent: 0,
            WaiterId: WaiterId,
            ItemName: selectedItem[0].ItemName,
            DisplayQuantity: quantity + " " + selectedItem[0].UOM,
            UOM: selectedItem[0].UOM,
            HSNNo: selectedItem[0].HSNNo,
            Quantity: quantity,
            Rate: selectedItem[0].Rate,
            GST: selectedItem[0].GST,
            CESS:selectedItem[0].CESS,
            Tax: selectedItem[0].Tax,
            Amount: parseFloat(parseFloat(quantity) * parseFloat(selectedItem[0].Rate)).toFixed(2),
          GSTAmount: parseFloat(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].GST / 100)).toFixed(2),
          CESSAmount: parseFloat(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].CESS / 100)).toFixed(2),
          TaxAmount: parseFloat(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].Tax / 100)).toFixed(2)
         
        //   GSTAmount: Math.ceil(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].GST / 100)*100)/100,
        //   CESSAmount: Math.ceil(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].CESS / 100)*100)/100,
        //     TaxAmount: Math.ceil(parseFloat(quantity) * parseFloat(selectedItem[0].Rate) * (selectedItem[0].Tax / 100)*100)/100
            //let totalTax=Math.ceil(nonCeilTotalTax * 100) / 100
        });
     //   console.log("selectedItems",selectedItems)
        loadItemsData(serviceName);
        calculateAmount(serviceName);
        $('#itemName').val('');
        $('#quantity').val('');
        $('#itemName').focus();
        itemId = 0;
        itemBrandId = 0;
    }







}

$("#quantity").keydown(function (e) {

    if (e.which == 13) {

        var itemName = document.getElementById("itemName").value;
        let text = itemName.toLowerCase();
        let checkItem = tempItemList.filter(n => n.ItemName.toLowerCase().startsWith(text) || n.ItemCode.toLowerCase().trim().startsWith(text) || n.Barcode.toLowerCase().trim().includes(text))

        if (itemName.length > 2 == false || checkItem.length == 0) {
            itemId = 0;
            $('#itemName').focus();
            $('#quantity').val('');
            Swal.fire({
                title: 'Warning..!',
                text: "Please Enter Valid Item Name",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
            e.preventDefault();
        }
        else if (itemId == undefined || itemId == '' || itemId == 0) {
            $('#itemName').focus();
            $('#quantity').val('');
            Swal.fire({
                title: 'Warning..!',
                text: "Please Enter Valid Item Name",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
            e.preventDefault();
        }
        else {
            e.preventDefault();
            ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
            let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
            if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {

                if (tableSlotNo != 0) {

                    let quantity = e.target.value;
                    if (quantity != '' && quantity != '.') {
                        if (quantity != 0) {
                //    console.log("tempItemList",tempItemList);

                            selectedItem = tempItemList.filter(row => row.ItemId == itemId && row.ItemBrandId == itemBrandId && itemId != 0);
                  //          console.log("selectedItem",selectedItem);
                            if (selectedItem.length > 0) {
                                // let rowId = Math.max.apply(Math, selectedItems.map(function (obj) { return obj.RowId; })) + 1
                                if (selectedItem[0].Rate == 0) {
                                    Swal.fire({
                                        title: 'Warning..!',
                                        text: "Rate Value is 0.",
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            //  AddItemIntoList();
                                        }
                                    });
                                }
                                else {
                                    AddItemIntoList();

                                }
                            }
                        } else {
                            Swal.fire({
                                title: 'Warning..!',
                                text: "Not Enter 0 Quantity ! Please enter Quantity",
                                icon: 'warning',
                                showCancelButton: false,
                                confirmButtonText: 'Ok'
                            })
                        }
                    } else {
                        Swal.fire({
                            title: 'Warning..!',
                            text: "Please enter Quantity",
                            icon: 'warning',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                        })
                    }

                }
            } else {
                if (billSlotNo != 0) {

                    let quantity = e.target.value;
                    if (quantity != '' && quantity != '.') {
                        if (quantity != 0) {


                            selectedItem = tempItemList.filter(row => row.ItemId == itemId && row.ItemBrandId == itemBrandId && itemId != 0);
                            if (selectedItem.length > 0) {
                                // let rowId = Math.max.apply(Math, selectedItems.map(function (obj) { return obj.RowId; })) + 1
                                if (selectedItem[0].Rate == 0) {
                                    Swal.fire({
                                        title: 'Warning..!',
                                        text: "Rate Value is 0.",
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'Ok'
                                    }).then((result) => {
                                        if (result.value) {
                                            //  AddItemIntoList();
                                        }
                                    });
                                }
                                else {
                                    AddItemIntoList();

                                }
                            }
                        } else {
                            Swal.fire({
                                title: 'Warning..!',
                                text: "Not Enter 0 Quantity ! Please enter Quantity",
                                icon: 'warning',
                                showCancelButton: false,
                                confirmButtonText: 'Ok'
                            })
                        }
                    } else {
                        Swal.fire({
                            title: 'Warning..!',
                            text: " Please enter Quantity",
                            icon: 'warning',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                        })
                    }
                }
                else {
                    Swal.fire(
                        'Oops!',
                        'Please choose slot',
                        'warning'
                    );
                }
            }
        }




    }

});

$.fn.myFunction = function () {

    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

}



var KOTDelete = $.fn.delete = function (rowId, BillSlotNo) {

    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {
        let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

        let Item = {
            "TableNo": tableSlotNo,
            "BillCounterId": store.get('BillCounterId'),
            "SeatNo": String.fromCharCode(seatbillSlotNo),
            "SaleDate": SaleDate
        }
        getPOSSaleDetails(Item)
        setTimeout(() => {
            let indexOfDeleteKOT = DineinList.findIndex(row => row.POSSaleId == rowId && row.IsKOTSent == 1);
            if (indexOfDeleteKOT == -1) {
                let loginId;
                if (store.get('IsOnline') == 'true') {
                    loginId = EncrDecrService.decrypt(store.get('Ref'))
                }
                else {
                    loginId = store.get('Ref')
                }
                let Item = {
                    "POSSaleId": rowId,
                    "CancelledReason": '',
                    "IsFromDevice": 0,
                    "CashierName": store.get('DisplayName'),
                    "Source": '/Dine-In From Desktop',
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

                    // in case of error
                    if (err) {
                        ErrorLog.writeLogFile('DeletePOSSales', err.sqlMessage)

                    }
                });

                connection.query("call spDeletePOSSales(?,?,?,?,?,?)", [Item.POSSaleId, Item.CancelledReason, Item.IsFromDevice, Item.CashierName, Item.Source, Item.LoginId], function (err, rows, fields) {

                    if (err) {


                        ErrorLog.writeLogFile('DeletePOSSales', err.sqlMessage)

                        return;
                    }
                    else {


                        let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

                        let Item = {
                            "TableNo": tableSlotNo,
                            "BillCounterId": store.get('BillCounterId'),
                            "SeatNo": String.fromCharCode(seatbillSlotNo),
                            "SaleDate": SaleDate
                        }
                        getPOSSaleDetails(Item)

                    }

                });

                // Close the connection
                connection.end(function () {
                    // The connection has been closed
                });

            }
            else { // dine-in kot details checking
                Swal.fire({
                    title: 'Are you Sure to Cancel the KOT ?',
                    showCancelButton: true,
                    icon: 'question',
                    html: `<input type="password"  placeholder="Enter KOT Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br><textarea  placeholder="Enter Description" id="Description" maxlength="300" class="form-control" style="height:100px;"></textarea><br>
                <input type="checkbox" onclick="$(this).myFunction()"> Show Password`,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                }).then((result) => {
                    let Password = document.getElementById('password').value;
                    let CancelledReason = document.getElementById('Description').value
                    if (result.isConfirmed) {
                        if (Password != '') {
                         //   console.log("POSPassword[0].KOTPassword",POSPassword[0].KOTPassword)
                            if (Password == POSPassword[0].KOTPassword) {
                                debugger;
                                if (CancelledReason != '' && CancelledReason != ' ') {
                                    debugger;
                                    let loginId;
                                    if (store.get('IsOnline') == 'true') {
                                        loginId = EncrDecrService.decrypt(store.get('Ref'))
                                    }
                                    else {
                                        loginId = store.get('Ref')
                                    }
                                    let Item = {
                                        "POSSaleId": rowId,
                                        "CancelledReason": CancelledReason,
                                        "IsFromDevice": 0,
                                        "CashierName": store.get('DisplayName'),
                                        "Source": '/Dine-In From Desktop',
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

                                        // in case of error
                                        if (err) {

                                            ErrorLog.writeLogFile('DeletePOSSales', err.sqlMessage)

                                        }
                                    });

                                    connection.query("call spDeletePOSSales(?,?,?,?,?,?)", [Item.POSSaleId, Item.CancelledReason, Item.IsFromDevice, Item.CashierName, Item.Source, Item.LoginId], function (err, rows, fields) {
                                        debugger;
                                        if (err) {


                                            ErrorLog.writeLogFile('DeletePOSSales', err.sqlMessage)

                                            return;
                                        }
                                        else {
                                            debugger;
                                            let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

                                            let Item = {
                                                "TableNo": tableSlotNo,
                                                "BillCounterId": store.get('BillCounterId'),
                                                "SeatNo": String.fromCharCode(seatbillSlotNo),
                                                "SaleDate": SaleDate
                                            }
                                            getPOSSaleDetails(Item)


                                        }

                                    });

                                    // Close the connection
                                    connection.end(function () {
                                        // The connection has been closed
                                    });

                                } else {
                                    Swal.fire({
                                        title: 'Please Enter the Reason for Cancel KOT..!',
                                        icon: 'warning',
                                        showCancelButton: false,
                                        confirmButtonText: 'Ok'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            KOTDelete(rowId)
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
                                    $(this).delete(rowId, BillSlotNo, tableSlotNo, seatbillSlotNo);
                                    // selectedItems.splice(indexOfDelete, 1);
                                })
                            }

                        } else {
                            Swal.fire({
                                title: 'Please Enter the Password for Cancel Item..!',
                                icon: 'warning',
                                showCancelButton: false,
                                confirmButtonText: 'Ok'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    $(this).delete(rowId, BillSlotNo, tableSlotNo, seatbillSlotNo);
                                }
                            })
                        }
                    }
                })
            }
        }, 250);


    } else {
        let indexOfDelete = selectedItems.findIndex(row => row.RowId == rowId && row.BillSlotNo == BillSlotNo);
        selectedItems.splice(indexOfDelete, 1);
        loadItemsData(serviceName);
        calculateAmount(serviceName);
    }
}


$.fn.IsTakeAwayCheck = function (POSSaleId) {

    let indexOfTakeAway = document.getElementById("IsTakeAway_" + POSSaleId).checked
    let TakeAwayValue = indexOfTakeAway ? 1 : 0
    var date = new Date()
    var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

    // AddItemIntoList(TakeAwayValue)
    let Item = {
        "POSSaleId": POSSaleId,
        "IsTakeAway": TakeAwayValue,
        "IsFromDevice": 0,
        "UpdatedBy": loginId,
        "UpdatedOn": serverDate
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

        // in case of error
        if (err) {

            ErrorLog.writeLogFile('IsTakeAwayCheck', err.sqlMessage)

        }
    });

    connection.query("UPDATE tblpossales SET IsTakeAway='" + Item.IsTakeAway + "' where POSSaleId= " + Item.POSSaleId + " ", function (err, rows, fields) {

        if (err) {

            ErrorLog.writeLogFile('IsTakeAwayCheck', err.sqlMessage)

            return;
        }
        else {

            let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

            let Item = {
                "TableNo": tableSlotNo,
                "BillCounterId": store.get('BillCounterId'),
                "SeatNo": String.fromCharCode(seatbillSlotNo),
                "SaleDate": SaleDate
            }
            getPOSSaleDetails(Item)

        }


    });

    // Close the connection
    connection.end(function () {
        // The connection has been closed
    });

}

$.fn.deleteAll = function () {

    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {

        // if (selectedItems.length > 0) {
        //     let tempItems = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == seatbillSlotNo);
        //     let tempItems2 = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == seatbillSlotNo && row.IsKOTSent == 1);

        //     if (tempItems2.length > 0) { // dine-in kot details checking
        //         Swal.fire({
        //             title: 'Are you Sure to Cancel the KOT?',
        //             showCancelButton: true,
        //             icon: 'question',
        //             html: `<input type="password"  placeholder="Enter Password" id="password" maxlength="15" class="form-control" style="height:50px;"><br>
        //             <input type="checkbox" onclick="$(this).myFunction()"> Show Password`,
        //             confirmButtonText: 'Yes',
        //             cancelButtonText: 'No',
        //         }).then((result) => {
        //             let Password = document.getElementById('password').value;
        //             if (result.isConfirmed) {
        //                 if (Password != '') {
        //                     if (Password == POSPassword[0].AdminPassword) { // AdminPassword , KOTPassword
        //                         // cancelReason('deleteAll',serviceName);
        //                         var RowId = tempItems.map(({ RowId }) => ({ RowId }))
        //                         for (let i = 0; i < RowId.length; i++) {
        //                             selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId);
        //                         }
        //                         loadItemsData();
        //                         calculateAmount();
        //                     } else {
        //                         Swal.fire({
        //                             title: 'Invalid Password..!',
        //                             icon: 'error',
        //                             showCancelButton: false,
        //                             confirmButtonText: 'Ok'
        //                         }).then((result) => {
        //                             $(this).deleteAll();
        //                         })
        //                     }

        //                 } else {
        //                     Swal.fire({
        //                         title: 'Please Enter the Password for Cancel Bill..!',
        //                         icon: 'warning',
        //                         showCancelButton: false,
        //                         confirmButtonText: 'Ok'
        //                     }).then((result) => {
        //                         if (result.isConfirmed) {
        //                             $(this).deleteAll();
        //                         }
        //                     })
        //                 }
        //             }
        //         })
        //     }
        //     else {
        //         var RowId = tempItems.map(({ RowId }) => ({ RowId }))
        //         for (let i = 0; i < RowId.length; i++) {
        //             selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId);
        //             //  selectedItems.splice((RowId[i].RowId-1), RowId.length);
        //         }
        //         loadItemsData();
        //         calculateAmount();
        //     }
        // }
    } else {
        if (selectedItems.length > 0) {

            // selectedItems = selectedItems.filter(row => row.BillSlotNo != billSlotNo);
            let tempItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceName);
            var RowId = tempItems.map(({ RowId }) => ({ RowId }))
            for (let i = 0; i < RowId.length; i++) {
                selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId)
                //  selectedItems.splice((RowId[i].RowId-1), RowId.length);
            }
            loadItemsData();
            calculateAmount();
        }
    }
}

function getWaiters() {

debugger
    let Item = {
        "POSId": environment.POSId,
         "BillCounterId": store.get('BillCounterId')
    }
    debugger
    if (WaiterList.length == 0) {
        debugger
        BillingdbService.getWaiters(Item).then(
            (result) => {
debugger
                WaiterList = result.Data
                if (result.Status == "valid") {
                 debugger
                  if (WaiterList.length == 1) {
                    // Directly set the particular WaiterId to the dropdown
                     $("#showWaiter").append('<option value=' + WaiterList[0]['WaiterId'] + '>' + WaiterList[0]['WaiterName'] + '</option>');
                } else {
                 //   If there are multiple waiters, loop through and append each to the dropdown
                    $("#showWaiter").append("<option value=''><-- Select Waiter --></option>");
                    for (var i = 0; i < WaiterList.length; i++) {
                        $("#showWaiter").append('<option value=' + WaiterList[i]['WaiterId'] + '>' + WaiterList[i]['WaiterName'] + '</option>');
                    }
                }


                }
                else if (result.Status == 'invalid') {
                    Swal.fire(
                        'Oops!',
                        result.Error,
                        'warning'
                    );
                }
                else {
                    Swal.fire(
                        'Oops!',
                        result.Error,
                        'warning'
                    );

                }
            }).catch(function (err) {
                ErrorLog.writeLogFile('getWaiters', err)
            });
    }

}




$('#showWaiter').on('change', function () {

    WaiterId = $('#showWaiter').val()
    WaiterName = WaiterList.filter(x => x.WaiterId == WaiterId)[0].WaiterName

});

function loadSlotButtons() {


    let slotButtons = '';
    let rowDivStart = `<div class="row"> `;
    let rowDivEnd = `</div>
    <br>`;
    let noOfSlots = store.get('noOfSlots');
    for (var i = 1; i <= noOfSlots; i++) {
        if (i % 6 == 0) {
            slotButtons +=
                ` <div class="col-md-2">
            <button id="slotbtn_${i}" class="btn btn-new btn-lg-slot" onclick="$(this).onSlotbtnClick(${i})">${i}</button>
            </div>` + rowDivEnd + rowDivStart;
        }
        else {
            if (i == 1) {
                slotButtons += rowDivStart +
                    ` <div class="col-md-2">
            <button id="slotbtn_${i}" class="btn btn-active btn-lg-slot" onclick="$(this).onSlotbtnClick(${i})">${i}</button>
            </div>`
            }
            else {
                slotButtons +=
                    ` <div class="col-md-2">
            <button id="slotbtn_${i}" class="btn btn-new btn-lg-slot" onclick="$(this).onSlotbtnClick(${i})">${i}</button>
            </div>`;
            }
        }
    }

    $('#billSlotButtons').html(slotButtons)
}
var onSlotbtnClick = $.fn.onSlotbtnClick = function (event) {

debugger
    let serviceName;
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    debugger
    getWaiters()
    if (selectedItems.length > 0) {
     
        if (billSlotNo != 0) {
            let tempItem = selectedItems.filter(row => row.BillSlotNo == billSlotNo)[0];
            let previousBillSlotNo = tempItem != undefined ? tempItem.BillSlotNo : 0;
            let previousBillSlotClass = previousBillSlotNo != 0 && previousBillSlotNo != undefined ? 'btn-hold' : 'btn-new';
            $("#slotbtn_" + previousBillSlotNo).removeClass("btn-new").addClass(previousBillSlotClass);
        }
        else {

            $("#slotbtn_" + event).removeClass("btn-new").addClass('btn-active');
        }
        let ServiceItem = selectedItems.find(row => row.BillSlotNo == event)
        if (ServiceItem != undefined && ServiceItem.length != 0) {
            serviceName = ServiceItem.ServiceType
            ServiceTypeId = serviceTypes.find(row => row.ServiceType == serviceName).ServiceTypeId;
            $('#serviceType_' + ServiceTypeId).prop('checked', true);
        } else {
            ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
            serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
        }
        if (serviceName == "Sweetshop" ||serviceName == "Take Away") {
            $("#showWaiterList").show();
            $("#showWaiterListLabel").show();
        
        }else{
              $("#showWaiterList").hide();
              $("#showWaiterListLabel").hide();
              $("#showWaiter").val('')
        }
    }else{
        if (serviceName == "Sweetshop" ||serviceName == "Take Away") {
            $("#showWaiterList").show();
            $("#showWaiterListLabel").show();
         
        }
    }


    $("#slotbtn_" + billSlotNo).removeClass("btn-active").addClass('btn-new');
    $("#slotbtn_" + event).removeClass("btn-new").addClass('btn-active');
    billSlotNo = event;
    item(ServiceTypeId)

    // if (serviceName == "Sweetshop") {
    //     setTimeout(() => {
    //         waiterDisable(65)
    //     }, 500);
    // }

    loadItemsData(serviceName);
    calculateAmount(serviceName);
}

function getBillCounterTables() {
    let item = {
        "BillCounterId": store.get('BillCounterId'),
    }

    BillingdbService.getBillCounterTables(item).then(
        (result) => {
            let res = result.Data
            store.set('noofTables', res)
            let billcounterTableNo = res;
            if (result.Status == "valid") {
                loadTableSlotButtons(billcounterTableNo)
            }

            else if (result.Status == 'invalid') {
                Swal.fire(
                    'Oops!',
                    result.Error,
                    'warning'
                );
            }
            else {
                Swal.fire(
                    'Oops!',
                    result.Error,
                    'warning'
                );
            }
        }).catch(function (err) {
            ErrorLog.writeLogFile('getBillCounterTables', err)
        });

}

function loadTableSlotButtons(billcounterTableNo) {

    let slotButtons = '';
    let rowDivStart = `<div class="row"> `;
    let rowDivEnd = `</div><br>`;
    for (var i = 1; i <= billcounterTableNo.length; i++) {
        if (i % 6 == 0) {
            slotButtons +=
                ` <div class="col-md-2">
            <button id="tablebtn_${i}" class="btn btn-new btn-lg-slot" onclick="$(this).onTableSlotbtnClick(${i})">${i}</button>
            </div>` + rowDivEnd + rowDivStart;
        }
        else {
            if (i == 1) {
                slotButtons += rowDivStart +
                    ` <div class="col-md-2">
            <button id="tablebtn_${i}" class="btn btn-active btn-lg-slot" onclick="$(this).onTableSlotbtnClick(${i})">${i}</button>
            </div>`
            }
            else {
                slotButtons +=
                    ` <div class="col-md-2">
            <button id="tablebtn_${i}" class="btn btn-new btn-lg-slot" onclick="$(this).onTableSlotbtnClick(${i})">${i}</button>
            </div>`;
            }
        }
    }

    $('#billTableSlotButtons').html(slotButtons)
    let item = {
        "BillCounterId": store.get('BillCounterId'),
        "TableNo": 1
    }

    BillingdbService.getBillCounterTableSeats(item).then(
        (result) => {
            let res = result.Data
            let billcounterSeatNo = res[0].Seats;
            if (result.Status == "valid") {
                loadSeatSlotButtons(billcounterSeatNo)
            }
            else if (result.Status == 'invalid') {
                Swal.fire(
                    'Oops!',
                    result.Error,
                    'warning'
                );
            }
            else {
                Swal.fire(
                    'Oops!',
                    result.Error,
                    'warning'
                );
            }
        }).catch(function (err) {
            ErrorLog.writeLogFile('getBillCounterTableSeats', err)
        });
}

var onTableSlotbtnClick = $.fn.onTableSlotbtnClick = function (event) {

    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (DineInselectedItems.length > 0) {
        if (tableSlotNo != 0) {
            let tempItem = DineInselectedItems.filter(row => row.TableNo == tableSlotNo)[0];
            let previousTableSlotNo = tempItem != undefined ? tempItem.TableNo : 0;
            let previousTableSlotClass = previousTableSlotNo != 0 && previousTableSlotNo != undefined ? 'btn-hold' : 'btn-new';
            $("#tablebtn_" + previousTableSlotNo).removeClass("btn-new").addClass(previousTableSlotClass);
            //  loadSeats(event)
        }
        else {
            $("#tablebtn_" + event).removeClass("btn-new").addClass('btn-active');
        }
    }


    let item = {
        "BillCounterId": store.get('BillCounterId'),
        "TableNo": event
    }

    BillingdbService.getBillCounterTableSeats(item).then(
        (result) => {

            let res = result.Data
            let billcounterSeatNo = res[0].Seats;
            if (result.Status == "valid") {
                loadSeatSlotButtons(billcounterSeatNo, event)
                onSeatSlotbtnClick(65);
                let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
                let Item = {
                    "TableNo": event,
                    "BillCounterId": store.get('BillCounterId'),
                    "SeatNo": String.fromCharCode(65),
                    "SaleDate": SaleDate
                }
                getPOSSaleDetails(Item)

            }
            else if (result.Status == 'invalid') {
                Swal.fire(
                    'Oops!',
                    result.Error,
                    'warning'
                );
            }
            else {
                Swal.fire(
                    'Oops!',
                    result.Error,
                    'warning'
                );
            }
        }).catch(function (err) {
            ErrorLog.writeLogFile('getBillCounterTableSeats', err)
        });

    $("#tablebtn_" + tableSlotNo).removeClass("btn-active").addClass('btn-new');
    seatbillSlotNo = 65
    $("#tablebtn_" + event).removeClass("btn-new").addClass('btn-active');
    tableSlotNo = event;
    // ServiceTypeId = serviceTypesOfSlot.find(row => row.BillSlotNo == event).ServiceTypeId;
    // $('#serviceType_' + ServiceTypeId).prop('checked', true);

    setTimeout(() => {
        waiterDisable(65)
    }, 500);
    loadItemsData(serviceName);
    calculateAmount(serviceName);
}



function loadSeats(event) {
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (tableSlotNo != 0 && seatbillSlotNo != 0) {
        let tempItem = DineInselectedItems.filter(row => row.TableNo == event);
        if (tempItem != undefined) {
            if (tempItem.length > 0) {
                for (let i = 0; i < tempItem.length; i++) {
                    $("#seatbtn_" + tempItem[i].SeatNo).removeClass("btn-new").addClass('btn-hold');

                }
            } else {
                for (let i = 0; i < DineInselectedItems.length; i++) {
                    $("#seatbtn_" + DineInselectedItems[i].SeatNo).removeClass("btn-hold").addClass('btn-new');

                }
            }
        }
    }
}


function loadSeatSlotButtons(billcounterSeats, event) {

    let slotButtons = '';
    let rowDivStart = `<div class="row"> `;
    let rowDivEnd = `</div><br>`;
    // let noOfSlots = store.get('noOfSlots');
    for (var i = 65; i <= (64 + billcounterSeats); i++) {

        if ((i - 64) % 6 == 0) {
            slotButtons +=
                ` <div class="col-md-2">
            <button id="seatbtn_${String.fromCharCode(i)}" class="btn btn-new btn-lg-slot-square" onclick="$(this).onSeatSlotbtnClick(${i})">${String.fromCharCode(i)}</button>
            </div>` + rowDivEnd + rowDivStart;
        }
        else {
            if ((i - 64) == 1) {
                slotButtons += rowDivStart +
                    ` <div class="col-md-2">
            <button id="seatbtn_${String.fromCharCode(i)}" class="btn btn-active btn-lg-slot-square" onclick="$(this).onSeatSlotbtnClick(${i})">${String.fromCharCode(i)}</button>
            </div>`
            }
            else {
                slotButtons +=
                    ` <div class="col-md-2">
            <button id="seatbtn_${String.fromCharCode(i)}" class="btn btn-new btn-lg-slot-square" onclick="$(this).onSeatSlotbtnClick(${i})">${String.fromCharCode(i)}</button>
            </div>`;
            }
        }
    }

    $('#billTableSeatButtons').html(slotButtons)
    loadSeats(event)
}

var onSeatSlotbtnClick = $.fn.onSeatSlotbtnClick = function (event) {
debugger
    let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
    let Item = {
        "TableNo": tableSlotNo,
        "BillCounterId": store.get('BillCounterId'),
        "SeatNo": String.fromCharCode(event),
        "SaleDate": SaleDate
    }
    getPOSSaleDetails(Item)

    // let seatItem = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == event);
    // if (seatItem.length == 0) {
    //     let item = {
    //         "BillCounterId": store.get('BillCounterId'),
    //         "TableNo": tableSlotNo,
    //         "SeatNo": event
    //     }
    //     BillingdbService.getBillCounterTableSeatWaiter(item).then(
    //         (result) => {
    //             
    //             let res = result
    //             if (res.length > 0) {
    //                 WaiterId = res[0].WaiterId
    //                 WaiterName = res[0].WaiterName
    //                 $("#showWaiter").val(WaiterId)
    //             } else if (res.length == 0) {
    //                 $("#showWaiter").val('')

    //             }
    //         }, (error) => {
    //             ErrorLog.writeLogFile('getBillCounterTableSeatWaiter', error)
    //         }
    //     ).catch(function (err) {
    //         ErrorLog.writeLogFile('getBillCounterTableSeatWaiter', err)
    //     });
    // }
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    if (DineInselectedItems.length > 0) {

        if (tableSlotNo != 0 && seatbillSlotNo != 0) {
            let tempItem = DineInselectedItems.filter(row => row.TableNo == tableSlotNo && row.SeatNo == String.fromCharCode(seatbillSlotNo))[0];
            let previousBillSlotNo = tempItem != undefined ? tempItem.SeatNo : 0;
            let previousBillSlotClass = previousBillSlotNo != 0 && previousBillSlotNo != undefined ? 'btn-hold' : 'btn-new';
            $("#seatbtn_" + previousBillSlotNo).removeClass("btn-new").addClass(previousBillSlotClass);

        }
        else {
            $("#seatbtn_" + String.fromCharCode(event)).removeClass("btn-new").addClass('btn-active');
        }
    }
    $("#seatbtn_" + String.fromCharCode(seatbillSlotNo)).removeClass("btn-active").addClass('btn-new');
    $("#seatbtn_" + String.fromCharCode(event)).removeClass("btn-new").addClass('btn-active');
    seatbillSlotNo = event;
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
     serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType

    setTimeout(() => {
        waiterDisable(event)
    }, 500);


    loadItemsData(serviceName);
    calculateAmount(serviceName);
}

function waiterDisable(event) {
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    let WaiterIdList = DineinList.filter(row => row.TableNo == tableSlotNo && row.SeatNo == String.fromCharCode(event));
    if(serviceName == "Dine-In" || serviceName == "DineIn-Self Service"){
        if (WaiterIdList.length != 0) {
            if (WaiterIdList[0].WaiterId != '') {
                document.getElementById('showWaiter').setAttribute("disabled", "disabled");

            } else {
                document.getElementById('showWaiter').removeAttribute("disabled");
                $("#showWaiter").val('')

            }
        } else {

          //  $('#showWaiter').prop('disabled', false);
         //   $("#showWaiter").val('')

            $("#showWaiter").empty();
            if (WaiterList.length == 1) {
                // Directly set the particular WaiterId to the dropdown
                 $("#showWaiter").append('<option value=' + WaiterList[0]['WaiterId'] + '>' + WaiterList[0]['WaiterName'] + '</option>');
            }
             else if(WaiterList.length > 1) {
             //   If there are multiple waiters, loop through and append each to the dropdown
                $("#showWaiter").append("<option value=''><-- Select Waiter --></option>");
                for (var i = 0; i < WaiterList.length; i++) {
                    $("#showWaiter").append('<option value=' + WaiterList[i]['WaiterId'] + '>' + WaiterList[i]['WaiterName'] + '</option>');
                }
                $("#showWaiterList").show();
                $("#showWaiterListLabel").show();
                $("#showWaiter").show();
      
                
            }else{
           $("#showWaiter").val('')
            }
        }
    }
   
}
function loadServiceType() {

    let serviceTypeLabel = '';
    let serviceTypeIndex = serviceTypes.findIndex(x => x.ServiceType == 'Catering')
    if (serviceTypeIndex != -1) {
        $("#openBulkOrderWindow").show();
    } else {
        $("#openBulkOrderWindow").hide();

    }
    serviceTypes = serviceTypes.filter(x => x.ServiceType != 'Catering')


    for (var i = 0; i < serviceTypes.length; i++) {
        serviceTypeLabel += `<div class="col-md-3" style="font-size: 15px;">
        <input type="radio" name="serviceType" id="serviceType_${serviceTypes[i].ServiceTypeId}" value="${serviceTypes[i].ServiceTypeId}">
        <label for="serviceType_${serviceTypes[i].ServiceTypeId}">
           ${serviceTypes[i].ServiceType}
        </label>
    </div>`;
    }

    $('#serviceType').html(serviceTypeLabel);
    $('#serviceType_' + serviceTypes[0].ServiceTypeId).prop('checked', true);
    ServiceTypeId = serviceTypes[0].ServiceTypeId;
    item(ServiceTypeId)
}


function calculateAmount(serviceName) {
    debugger
    if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {
debugger
        let ItemsForSelectedBillSlot = DineinList.filter(row => row.TableNo == tableSlotNo && row.SeatNo == String.fromCharCode(seatbillSlotNo));

        if (ItemsForSelectedBillSlot.length > 0) {
debugger
            let totalAmount = ItemsForSelectedBillSlot.map(row => row.Amount).reduce((prev, next) => Number(prev) + Number(next));
            let gstAmount = ItemsForSelectedBillSlot.map(row => row.GSTAmount).reduce((prev, next) => Number(prev) + Number(next));
            let cessAmount=ItemsForSelectedBillSlot.map(row => row.CESSAmount).reduce((prev, next) => Number(prev) + Number(next));
            let totalTax=ItemsForSelectedBillSlot.map(row => row.TaxAmount).reduce((prev, next) => Number(prev) + Number(next));
            let totalAmountWithGST = parseFloat(Number(totalAmount) + Number(totalTax)).toFixed(2);
            let roundOff = 0;
            let decimalValue = parseFloat(parseFloat((+totalAmountWithGST) % 1).toFixed(2));
            if (decimalValue != 0) {
                roundOff = 1 - decimalValue;
                if (IsAllowNegativeRoundOff==0){
                    if (roundOff <= 0.50) {
                        totalAmountWithGST = (+totalAmountWithGST) + roundOff;
                        document.getElementById('roundOff').innerHTML = parseFloat(roundOff).toFixed(2);
                    } else if (roundOff >= 0.50) {
                       totalAmountWithGST = (+totalAmountWithGST) - decimalValue;
                       document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
                   }
                   roundOff = document.getElementById('roundOff').innerHTML
                  }
                  else if(IsAllowNegativeRoundOff==1){
                       totalAmountWithGST = (+totalAmountWithGST) - decimalValue;
                       document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
                       roundOff = document.getElementById('roundOff').innerHTML
                  }
            }
            else if (decimalValue == 0) {
                document.getElementById('roundOff').innerHTML = parseFloat(0).toFixed(2);
            }
            //New Code
            TotalAmount = parseFloat(totalAmount).toFixed(2);
            TotalGST = parseFloat(gstAmount).toFixed(2);
            TotalCESS=parseFloat(cessAmount).toFixed(2);
            TotalTax=parseFloat(totalTax).toFixed(2);
            RoundOff = roundOff;
            let netAmt=parseFloat(+TotalAmount + +TotalTax).toFixed(2)
            netAmt= +netAmt
            NetAmount =  netAmt + (+roundOff)
          //  NetAmount = (+TotalAmount + +TotalTax) + (+roundOff)
            document.getElementById('totalAmt').innerHTML = parseFloat(totalAmount).toFixed(2);
            document.getElementById('totalGST').innerHTML = parseFloat(totalTax).toFixed(2);
            document.getElementById('netAmount').innerHTML = parseFloat(NetAmount).toFixed(2);




            //Old Code
            // let totalAmount = ItemsForSelectedBillSlot.map(row => row.Amount).reduce((prev, next) => prev + next);
            // let gstAmount = ItemsForSelectedBillSlot.map(row => row.GSTAmount).reduce((prev, next) => prev + next);
            // let totalAmountWithGST = totalAmount + gstAmount;
            // let roundOff = 0;
            // let decimalValue = parseFloat(parseFloat(totalAmountWithGST % 1).toFixed(2));
            // if (decimalValue != 0) {
            //     
            //     roundOff = 1 - decimalValue;
            //     if (roundOff <= 0.50) {
            //         
            //         totalAmountWithGST = totalAmountWithGST + roundOff;
            //         document.getElementById('roundOff').innerHTML = parseFloat(roundOff).toFixed(2);

            //     } else if (roundOff >= 0.50) {
            //         
            //         totalAmountWithGST = totalAmountWithGST - decimalValue;
            //         document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
            //     }
            //     roundOff = document.getElementById('roundOff').innerHTML
            // }
            // else if (decimalValue == 0) {
            //     document.getElementById('roundOff').innerHTML = parseFloat(0).toFixed(2);
            // }
            // TotalAmount = totalAmount;
            // TotalGST = gstAmount;
            // RoundOff = roundOff;
            // NetAmount = totalAmountWithGST;
            // document.getElementById('totalAmt').innerHTML = parseFloat(totalAmount).toFixed(2);
            // document.getElementById('totalGST').innerHTML = parseFloat(gstAmount).toFixed(2);
            // document.getElementById('netAmount').innerHTML = parseFloat(totalAmountWithGST).toFixed(2);
        }
        else {
            document.getElementById('totalAmt').innerHTML = '0.00';
            document.getElementById('totalGST').innerHTML = '0.00';
            document.getElementById('roundOff').innerHTML = '0.00';
            document.getElementById('netAmount').innerHTML = '0.00';
        }

    } else {
        debugger
        let ItemsForSelectedBillSlot = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceName);
        if (ItemsForSelectedBillSlot.length > 0) {
           
            let totalAmount = ItemsForSelectedBillSlot.map(row => row.Amount).reduce((prev, next) => Number(prev) + Number(next));
            let gstAmount = ItemsForSelectedBillSlot.map(row => row.GSTAmount).reduce((prev, next) => Number(prev) + Number(next));
            let cessAmount=ItemsForSelectedBillSlot.map(row => row.CESSAmount).reduce((prev, next) => Number(prev) + Number(next));
            let totalTax=ItemsForSelectedBillSlot.map(row => row.TaxAmount).reduce((prev, next) => Number(prev) + Number(next));
           //let nonCeilTotalTax=ItemsForSelectedBillSlot.map(row => row.TaxAmount).reduce((prev, next) => Number(prev) + Number(next));
          // let totalTax=Math.ceil(nonCeilTotalTax * 100) / 100
         //  console.log(Math.ceil(totalTax * 100) / 100)
            let totalAmountWithGST = parseFloat(Number(totalAmount) + Number(totalTax)).toFixed(2);
            let roundOff = 0;
            let decimalValue = parseFloat(parseFloat((+totalAmountWithGST) % 1).toFixed(2));
            if (decimalValue != 0) {
                roundOff = 1 - decimalValue;
               if (IsAllowNegativeRoundOff==0){
                 if (roundOff <= 0.50) {
                     totalAmountWithGST = (+totalAmountWithGST) + roundOff;
                     document.getElementById('roundOff').innerHTML = parseFloat(roundOff).toFixed(2);
                 } else if (roundOff >= 0.50) {
                    totalAmountWithGST = (+totalAmountWithGST) - decimalValue;
                    document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
                }
                roundOff = document.getElementById('roundOff').innerHTML
               }
               else if(IsAllowNegativeRoundOff==1){
                    totalAmountWithGST = (+totalAmountWithGST) - decimalValue;
                    document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
                    roundOff = document.getElementById('roundOff').innerHTML
               }
              
  
            }
            else if (decimalValue == 0) {
                document.getElementById('roundOff').innerHTML = parseFloat(0).toFixed(2);
            }
            //New Code
            TotalAmount = parseFloat(totalAmount).toFixed(2);
            TotalGST = parseFloat(gstAmount).toFixed(2);
            TotalCESS=parseFloat(cessAmount).toFixed(2);
            TotalTax=parseFloat(totalTax).toFixed(2);
            RoundOff = roundOff;
            let netAmt=parseFloat(+TotalAmount + +TotalTax).toFixed(2)
            netAmt= +netAmt
            NetAmount =  netAmt + (+roundOff)
            document.getElementById('totalAmt').innerHTML = parseFloat(totalAmount).toFixed(2);
            document.getElementById('totalGST').innerHTML = parseFloat(totalTax).toFixed(2);
            document.getElementById('netAmount').innerHTML = parseFloat(NetAmount).toFixed(2);




            //Old Code
            // let totalAmount = ItemsForSelectedBillSlot.map(row => row.Amount).reduce((prev, next) => prev + next);
            // let gstAmount = ItemsForSelectedBillSlot.map(row => row.GSTAmount).reduce((prev, next) => prev + next);
            // let totalAmountWithGST = totalAmount + gstAmount;
            // let roundOff = 0;
            // let decimalValue = parseFloat(parseFloat(totalAmountWithGST % 1).toFixed(2));
            // if (decimalValue != 0) {
            //     roundOff = 1 - decimalValue;
            //     if (roundOff <= 0.50) {
            //         totalAmountWithGST = totalAmountWithGST + roundOff;
            //         document.getElementById('roundOff').innerHTML = parseFloat(roundOff).toFixed(2);

            //     } else if (roundOff >= 0.50) {
            //         totalAmountWithGST = totalAmountWithGST - decimalValue;
            //         document.getElementById('roundOff').innerHTML = parseFloat(-(decimalValue)).toFixed(2);
            //     }
            //     roundOff = document.getElementById('roundOff').innerHTML
            // }
            // else if (decimalValue == 0) {
            //     document.getElementById('roundOff').innerHTML = parseFloat(0).toFixed(2);
            // }
            // TotalAmount = totalAmount;
            // TotalGST = gstAmount;
            // RoundOff = roundOff;
            // NetAmount = totalAmountWithGST;
            // document.getElementById('totalAmt').innerHTML = parseFloat(totalAmount).toFixed(2);
            // document.getElementById('totalGST').innerHTML = parseFloat(gstAmount).toFixed(2);
            // document.getElementById('netAmount').innerHTML = parseFloat(totalAmountWithGST).toFixed(2);
        }
        else {
            document.getElementById('totalAmt').innerHTML = '0.00';
            document.getElementById('totalGST').innerHTML = '0.00';
            document.getElementById('roundOff').innerHTML = '0.00';
            document.getElementById('netAmount').innerHTML = '0.00';
        }

    }

}

function clearData() {
    $('#customerName').val('');
    $('#phoneNumber').val('');
    $('#gst').val('');
    $('#ref').val('');
    $('#cookinginstruction').val('');

}


$('#serviceType').change(function () {
debugger
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    ServiceTypeId = Number(ServiceTypeId);
    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType;
    let IsWebOrders = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).IsWebOrders;

    if (serviceName != "Dine-In" && serviceName != "DineIn-Self Service") {
        //serviceTypesOfSlot[billSlotNo - 1]['ServiceTypeId'] = Number(ServiceTypeId);
        //   serviceTypesOfSlot[billSlotNo - 1]['ServiceType'] = serviceTypes.find(row => row.ServiceTypeId == ServiceTypeId).ServiceType;

        if (IsWebOrders == 1) { //  Cooking Instruction -> Swiggy , Zomato 
            $("#cookinglabel").show();
            $("#cookingList").show();
        }
        else {
            $("#cookinglabel").hide();
            $("#cookingList").hide();
        }
     
        if (serviceName == "Sweetshop" ||serviceName == "Take Away") {
            $("#showWaiterList").show();
            $("#showWaiterListLabel").show();
            debugger
            getWaiters()
        }
        else{
            $("#showWaiterList").hide();
            $("#showWaiterListLabel").hide();
        }
        $("#showKOTLabel").hide();
        $("#showTable").hide();
        $("#showSlot").show();
        $("#deleteAll").show()
        $("#PrintEstimateBill").show()
        $("#IsTakeAway").hide();
        $("#IsKOTCheck").hide();
        loadItemsData(serviceName)
        calculateAmount(serviceName)
        document.getElementById('BillSlot').innerText = "Bill Slot#"
    } else if (serviceName == "Dine-In" || serviceName == "DineIn-Self Service") {
        //    serviceTypesOfSlot[tableSlotNo - 1]['ServiceTypeId'] = Number(ServiceTypeId);
        //  serviceTypesOfSlot[tableSlotNo - 1]['ServiceType'] = serviceTypes.find(row => row.ServiceTypeId == ServiceTypeId).ServiceType;
        if (IsKOTPrint == 1) {
            $("#showKOTLabel").show();
            $("#IsKOTCheck").show();
        }
        $("#deleteAll").hide()
        $("#PrintEstimateBill").hide()
        $("#cookinglabel").hide();
        $("#cookingList").hide();
        $("#showWaiterList").show();
        $("#showWaiterListLabel").show();
        $("#showTable").show();
        $("#showSlot").hide();
        if(serviceName == "Dine-In"){
            $("#IsTakeAway").show();
        }else{
            $("#IsTakeAway").hide();
        }
      

        loadItemsData(serviceName)
        calculateAmount(serviceName)
        document.getElementById('TableSlot').innerText = "Table Slot#"
    }
    item(ServiceTypeId)

})


function loadServiceTypesForBillCounter() {
    // if (store.get('IsOnline') == 'true') {

    store.delete('ServiceTypes');
    store.delete('CateringService');
    let item = {
        "BillCounterId": store.get('BillCounterId'),
    }
    BillingdbService.getBillCounterServiceTypes(item).then(
        (result) => {


            let res = result;
            if (res.Status == "valid") {

                serviceTypes = res.Data;
                //serviceTypesOfSlot = []
                store.set('ServiceTypes', serviceTypes);
                let CateringService = serviceTypes.filter(x => x.ServiceType == 'Catering')
                if (CateringService.length != 0) {

                    store.set('CateringService', CateringService);
                }
                else {
                    store.set('CateringService', '');
                }
                let noOfSlots = store.get('noOfSlots');
                // for (let i = 1; i <= noOfSlots; i++) {
                //     serviceTypesOfSlot.push({
                //         BillSlotNo: i,
                //         TableSlotNo: i,
                //         ServiceTypeId: serviceTypes[0].ServiceTypeId,
                //         ServiceType: serviceTypes[0].ServiceType
                //     })
                // }
                loadServiceType();
            }
            else if (res.Status == 'invalid') {
                Swal.fire(
                    'Oops!',
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
    //  }
    // else {
    //     serviceTypes = store.get('ServiceTypes');
    //     let noOfSlots = store.get('noOfSlots');
    //     for (let i = 1; i <= noOfSlots; i++) {
    //         serviceTypesOfSlot.push({
    //             BillSlotNo: i,
    //             ServiceTypeId: serviceTypes[0].ServiceTypeId,
    //             ServiceType: serviceTypes[0].ServiceType
    //         })
    //     }
    //     loadServiceType();
    // }
}


loadRupees();
function loadRupees() {
    BillingdbService.getRupeeDetails().then(
        (result) => {
            let res = result;
            if (res.Status == "valid") {
                res.Data = res.Data
            }
            else if (res.Status == 'invalid') {
                Swal.fire(
                    'Oops!',
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
        }, (error) => {
            ErrorLog.writeLogFile('getRupeeDetails', error)
        }).catch(function (err) {
            ErrorLog.writeLogFile('getRupeeDetails', err)
        });
}
function loadKOTPrinters() {
    let Item = {
        "POSId": environment.POSId,
        "BillCounterId": store.get('BillCounterId'),
        "CompanyId": environment.CompanyId
    }
    BillingdbService.getBillCounterKOTPrinters(Item).then(
        (result) => {

            let KOTList = result
            store.set('KOTPrintersList', KOTList)
        }).catch(function (err) {
            ErrorLog.writeLogFile('getBillCounterKOTPrinters', err)
        });
}
function loadCustomerTokenGroups() {
    let Item = {
        "POSId": environment.POSId,
        "BillCounterId": store.get('BillCounterId'),
        "CompanyId": environment.CompanyId
    }
    BillingdbService.getBillCounterCustomerTokenGroups(Item).then(
        (result) => {

            let CustomerTokenGroupList = result
            store.set('CustomerTokenGroupList', CustomerTokenGroupList)
        }).catch(function (err) {
            ErrorLog.writeLogFile('loadCustomerTokenGroups', err)
        });
}

var F9 = $.fn.saveData = function (event) {
debugger
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceTypeName = serviceTypes.find(x => x.ServiceTypeId == Number(ServiceTypeId)).ServiceType
    let selectedBillSlotItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);
   // console.log("selectedBillSlotItems",selectedBillSlotItems)
    WaiterId = $('#showWaiter').val()==''?0:$('#showWaiter').val();
    if (WaiterId != null && WaiterId != '' && WaiterId != 0) {
        WaiterName = WaiterList.filter(x => x.WaiterId == WaiterId)[0].WaiterName
    }else{
        WaiterName='';
    }

    let selectedTableSlotItems = DineinList.filter(row => row.TableNo == tableSlotNo && row.SeatNo == String.fromCharCode(seatbillSlotNo));
    if (selectedItems.length > 0 || selectedTableSlotItems.length > 0) {
        if (Buttonshow == false) {
            debugger
            let IsWebOrders = serviceTypes.find(x => x.ServiceTypeId == Number(ServiceTypeId)).IsWebOrders
            let IsPaymentRequired = serviceTypes.find(x => x.ServiceTypeId == Number(ServiceTypeId)).IsPaymentRequired
            let IsShowPayment = serviceTypes.find(x => x.ServiceTypeId == Number(ServiceTypeId)).IsShowPayment
            // $('#GenerateBill').prop('disabled', true);
            let date = new Date();
            let SaleHeaderId;
            let todayDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            let Time = " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            // let selectedService = serviceTypesOfSlot.filter(row => row.BillSlotNo == billSlotNo)[0]
            if (store.get('IsOnline') == 'true') {
                loginId = EncrDecrService.decrypt(store.get('Ref'))
            }
            else {
                loginId = store.get('Ref')
            }
            let item;
            let cookinginstruction = $('#cookinginstruction').val().trim();
            IsOtherStateCustomer()
            if(NetAmount==0.00){
                Swal.fire(
                    'warning..!',
                    'The bill amount cannot be zero. Please check..!',
                    'warning'
                )
            }else{
                if (serviceTypeName == "Dine-In" || serviceTypeName == "DineIn-Self Service") {

                    item = {
                        "SaleDate": todayDate,
                        "BillTime": Time,
                        "POSId": environment.POSId,
                        "BillCounterId": store.get('BillCounterId'),
                        "ServiceTypeId": Number(ServiceTypeId),
                        "ServiceType": serviceTypeName,
                        "BillCounterCode": store.get('BillCounterCode'),
                        "CashierName": store.get('DisplayName'),
                        "CustomerName": $('#customerName').val().trim(),
                        "PhoneNo": $('#phoneNumber').val().trim(),
                        "GSTNo": $('#gst').val().trim(),
                        "IsOtherStateCustomer":IsOtherStateCustomerValue,
                        "RefNo": $('#ref').val().trim(),
                        "CookingInstruction": cookinginstruction == '' ? '' : cookinginstruction,
                        "TotalAmount": parseFloat(TotalAmount).toFixed(2),
                        "TotalGST": parseFloat(TotalGST).toFixed(2),
                        "TotalCESS": parseFloat(TotalCESS).toFixed(2),
                        "TotalTax":parseFloat(TotalTax).toFixed(2),
                        "RoundOff": parseFloat(RoundOff).toFixed(2),
                        "NetAmount": parseFloat(NetAmount).toFixed(2),
                        "WaiterId": WaiterId,
                        "WaiterName": WaiterName,
                        "TableNo": tableSlotNo,
                        "SeatNo": String.fromCharCode(seatbillSlotNo),
                        "IsGSTInput":0,
                        "CompanyId": environment.CompanyId,
                        "Source": environment.PageUrl.user,
                        "Ref": loginId,
                        "CreatedOn": todayDate + Time,
                        "UpdatedOn": todayDate + Time,
    
                    }
                } else {
                    item = {
                        "SaleDate": todayDate,
                        "BillTime": Time,
                        "POSId": environment.POSId,
                        "BillCounterId": store.get('BillCounterId'),
                        "ServiceTypeId": Number(ServiceTypeId),
                        "ServiceType": serviceTypeName,
                        "BillCounterCode": store.get('BillCounterCode'),
                        "CashierName": store.get('DisplayName'),
                        "CustomerName": $('#customerName').val().trim(),
                        "PhoneNo": $('#phoneNumber').val().trim(),
                        "GSTNo": $('#gst').val().trim(),
                        "IsOtherStateCustomer":IsOtherStateCustomerValue,
                        "RefNo": $('#ref').val().trim(),
                        "CookingInstruction": cookinginstruction == '' ? '' : cookinginstruction,
                        "TotalAmount": parseFloat(TotalAmount).toFixed(2),
                        "TotalGST": parseFloat(TotalGST).toFixed(2),
                        "TotalCESS": parseFloat(TotalCESS).toFixed(2),
                        "TotalTax":parseFloat(TotalTax).toFixed(2),
                        "RoundOff": parseFloat(RoundOff).toFixed(2),
                        "NetAmount": parseFloat(NetAmount).toFixed(2),
                        // "WaiterId": 0,
                        // "WaiterName": '',
                        "WaiterId": serviceTypeName == "Sweetshop" || serviceTypeName == "Take Away"? WaiterId : 0,
                        "WaiterName": serviceTypeName == "Sweetshop" ||serviceTypeName == "Take Away" ? WaiterName : '',
                        "TableNo": 0,
                        "SeatNo": '',
                        "IsGSTInput":0,
                        "CompanyId": environment.CompanyId,
                        "Source": environment.PageUrl.user,
                        "Ref": loginId,
                        "CreatedOn": todayDate + Time,
                        "UpdatedOn": todayDate + Time,
                    }
                }
    
    
    
    
                if (serviceTypeName == "Take Away") {
                    if (selectedBillSlotItems.length > 0) {
                        $('#GenerateBill').prop('disabled', true);
                        Buttonshow = true;
                        BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                            (result) => {
    
                                let res = result.split('_');
                                item.BillNo = res[0];
                                item.DisplayBillNo = res[1];
                                BillingdbService.generateBillTokenNo(item.BillCounterCode, item.BillCounterId, item.ServiceTypeId).then(
                                    (result) => {
    
                                        item.BillTokenNo = result;
                                        item.IsWebOrders = 0
                                        BillingdbService.addSaleHeader(item).then(
                                            (result) => {
    
                                                SaleHeaderId = result
                                                let SaleItemDetails = JSON.stringify(selectedBillSlotItems.map(obj => ({
                                                    SaleHeaderId: SaleHeaderId,
                                                    ItemId: obj.ItemId,
                                                    ItemName: obj.ItemName,
                                                    ItemGroupId: obj.ItemGroupId,
                                                    IsTakeAway: obj.IsTakeAway == 1 ? 1 : 0,
                                                    IsShowHSN: obj.IsShowHSN,
                                                    UOM: obj.UOM,
                                                    ItemBrandId: obj.ItemBrandId,
                                                    HSNNo: obj.HSNNo,
                                                    Quantity: obj.Quantity,
                                                    GSTPercentage: obj.GST,
                                                    Rate: obj.Rate,
                                                    CESSPercentage: obj.CESS,
                                                    TaxPercentage: obj.Tax,
                                                    TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                    GSTAmount: parseFloat(obj.GSTAmount).toFixed(2),
                                                    CESSAmount: parseFloat(obj.CESSAmount).toFixed(2),
                                                    TaxAmount: parseFloat(obj.TaxAmount).toFixed(2),
                                                    NetAmount: parseFloat(parseFloat(obj.Amount) + parseFloat(obj.TaxAmount)).toFixed(2),
                                                    IsGSTInput: obj.IsGSTInput
                                                })));
                                                BillingdbService.addSaleDetail(SaleItemDetails).then(
                                                    (result) => {
    
                                                        if (IsKOTPrint == 1) {
    
                                                            TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {
                                                                printerService.getBillCounterdetail(SaleHeaderId)
    
                                                            }).then(async (result2) => {
                                                                // printerService.getBillCounterdetail(SaleHeaderId)
                                                                await KOTPrinterService.getSaleBilldetail(SaleHeaderId).then((res1) => {
                                                                }).catch((err) => {
                                                                    ErrorLog.writeLogFile('KOTPrinterService', err)
    
                                                                })
                                                            }).catch((error) => {
                                                                ErrorLog.writeLogFile('TokenPrinterService', error)
                                                            })
                                                        }
                                                        else {
                                                            TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {
                                                            }).then(async (result2) => {
                                                                printerService.getBillCounterdetail(SaleHeaderId)
                                                            }).catch((error) => {
                                                                ErrorLog.writeLogFile('TokenPrinterService', error)
                                                            })
                                                        }
                                                        // selectedItems = selectedItems.filter(row => row.BillSlotNo != billSlotNo);
                                                        let tempItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);
                                                        var RowId = tempItems.map(({ RowId }) => ({ RowId }))
                                                        for (let i = 0; i < RowId.length; i++) {
                                                            selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId)
                                                            // selectedItems.splice((RowId[i].RowId-1), RowId.length);
                                                        }
                                                        ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                                                        let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
                                                        loadItemsData(serviceName);
                                                        calculateAmount(serviceName);
                                                        clearData();
    
                                                        Swal.fire({
                                                            icon: 'success',
                                                            title: 'Bill has been saved',
                                                            showConfirmButton: false,
                                                            timer: 1500
                                                        });
                                                        store.delete('SaleHeaderId')
                                                        store.delete('serviceTypeName')
                                                        store.set('SaleHeaderId', SaleHeaderId)
                                                        store.set('serviceTypeName', serviceTypeName)
                                                        $('#GenerateBill').prop('disabled', false);
                                                        document.getElementById("IsOtherStateCustomer").checked = false;
                                                        document.getElementById("IsOtherStateCustomerOpt").innerText="No"
                                                        Buttonshow = false;
                                                        if (IsPaymentRequired == 0) {
                                                            let saleHeaderList = {
                                                                IsCreditBill: 1,
                                                                IsPaid: 0,
                                                                IsOtherStateCustomer:IsOtherStateCustomerValue,
                                                                SaleHeaderId: SaleHeaderId,
                                                                Ref: loginId,
                                                                UpdatedOn: todayDate + Time,
                                                                CustomerName: $('#customerName').val().trim() != '' ? $('#customerName').val().trim() : '',
                                                                PhoneNo: $('#phoneNumber').val().trim() != '' ? $('#phoneNumber').val().trim() : '',
                                                                GSTNo: $('#gst').val().trim() != '' ? $('#gst').val().trim() : '',
                                                                RefNo: $('#ref').val().trim() != '' ? $('#ref').val().trim() : ''
                                                            }
                                                            if (SaleHeaderId != undefined) {
                                                                BillingdbService.updateSaleHeaderCreditList(saleHeaderList).then(
                                                                    (data) => {
                                                                        Swal.fire({
                                                                            title: 'Bill was changed Credit Successfully',
                                                                            icon: 'success',
                                                                            confirmButtonColor: '#5cb85c',
                                                                            confirmButtonText: 'ok',
                                                                            timer: 1500
                                                                        })
                                                                    },
                                                                    (error) => {
                                                                        ErrorLog.writeLogFile('updateSaleHeaderCreditList', error)
                                                                    });
    
                                                            } else {
                                                                Swal.fire({
                                                                    icon: 'error',
                                                                    title: 'error Bill...',
                                                                    confirmButtonColor: '#d33',
                                                                    confirmButtonText: 'ok'
                                                                })
                                                            }
                                                        } else if (IsPaymentRequired == 1 && IsShowPayment == 1) {
                                                            setTimeout(function () {
                                                                ipcRenderer.invoke('OpenBillReceipt', '');
                                                            }, 1500)
                                                        } else {
                                                            Swal.fire({
                                                                title: 'Bill was Generated Successfully',
                                                                icon: 'success',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'ok',
                                                                timer: 1500
                                                            })
                                                        }
    
                                                    },
                                                    (error) => {
                                                        ErrorLog.writeLogFile('addSaleDetail', error)
    
                                                        BillingdbService.deleteSale(SaleHeaderId);
                                                        Swal.fire(
                                                            'Oops!',
                                                            'Not able to save the bill. try again later!',
                                                            'warning'
                                                        );
                                                    }
                                                )
                                            },
                                            (error) => {
                                                ErrorLog.writeLogFile('addSaleHeader', error)
    
                                                BillingdbService.deleteSale(SaleHeaderId);
                                                Swal.fire(
                                                    'Oops!',
                                                    'Not able to save the bill. try again later!',
                                                    'error'
                                                );
                                            }
                                        )
                                    }).catch(function (err) {
                                        ErrorLog.writeLogFile('generateBillTokenNo', err)
                                    });
    
                            },
                            (error) => {
                                ErrorLog.writeLogFile('generateBillNo', error)
    
                                Swal.fire(
                                    'Oops!',
                                    'Not able to generate the bill no. try again later!',
                                    'error'
                                );
                            }).catch(function (err) {
                                ErrorLog.writeLogFile('generateBillNo', err)
                            });
                    }
                    else {
                        Swal.fire(
                            'warning..!',
                            'Please Enter a Item?',
                            'warning'
                        )
    
                    }
    
                }
                else if (IsWebOrders == 1) {
    
                    if (selectedBillSlotItems.length > 0) {
    
                        $('#GenerateBill').prop('disabled', true);
                        Buttonshow = true;
                        BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                            (result) => {
    
                                let res = result.split('_');
                                item.BillNo = res[0];
                                item.DisplayBillNo = res[1];
                                BillingdbService.generateBillTokenNo(item.BillCounterCode, item.BillCounterId).then(
                                    (result) => {
    
                                        item.BillTokenNo = result;
                                        item.IsWebOrders = 1;
                                        BillingdbService.addSaleHeader(item).then(
                                            (result) => {
    
                                                SaleHeaderId = result
                                                let SaleItemDetails = JSON.stringify(selectedBillSlotItems.map(obj => ({
                                                    SaleHeaderId: SaleHeaderId,
                                                    ItemId: obj.ItemId,
                                                    ItemName: obj.ItemName,
                                                    ItemGroupId: obj.ItemGroupId,
                                                    IsTakeAway: obj.IsTakeAway == 1 ? 1 : 0,
                                                    IsShowHSN: obj.IsShowHSN,
                                                    UOM: obj.UOM,
                                                    ItemBrandId: obj.ItemBrandId,
                                                    HSNNo: obj.HSNNo,
                                                    Quantity: obj.Quantity,
                                                    Rate: obj.Rate,
                                                    GSTPercentage: obj.GST,
                                                    CESSPercentage: obj.CESS,
                                                    TaxPercentage: obj.Tax,
                                                    TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                    GSTAmount: parseFloat(obj.GSTAmount).toFixed(2),
                                                    CESSAmount: parseFloat(obj.CESSAmount).toFixed(2),
                                                    TaxAmount: parseFloat(obj.TaxAmount).toFixed(2),
                                                    NetAmount: parseFloat(parseFloat(obj.Amount) + parseFloat(obj.TaxAmount)).toFixed(2),
                                                    IsGSTInput: obj.IsGSTInput
                                                  
                                                })));
                                                BillingdbService.addSaleDetail(SaleItemDetails).then(
                                                    (result) => {
    
                                                        store.delete('SaleHeaderId')
                                                        store.delete('serviceTypeName')
                                                        store.set('SaleHeaderId', SaleHeaderId)
                                                        store.set('serviceTypeName', serviceTypeName)
                                                        $('#GenerateBill').prop('disabled', false);
                                                        Buttonshow = false;
    
    
                                                        if (IsPaymentRequired == 0) {
                                                            let saleHeaderList = {
                                                                IsCreditBill: 1,
                                                                IsPaid: 0,
                                                                IsOtherStateCustomer:IsOtherStateCustomerValue,
                                                                SaleHeaderId: SaleHeaderId,
                                                                Ref: loginId,
                                                                UpdatedOn: todayDate + Time,
                                                                CustomerName: $('#customerName').val().trim() != '' ? $('#customerName').val().trim() : '',
                                                                PhoneNo: $('#phoneNumber').val().trim() != '' ? $('#phoneNumber').val().trim() : '',
                                                                GSTNo: $('#gst').val().trim() != '' ? $('#gst').val().trim() : '',
                                                                RefNo: $('#ref').val().trim() != '' ? $('#ref').val().trim() : ''
                                                            }
                                                            if (SaleHeaderId != undefined) {
                                                                BillingdbService.updateSaleHeaderCreditList(saleHeaderList).then(
                                                                    (data) => {
                                                                        Swal.fire({
                                                                            title: 'Bill was changed Credit Successfully',
                                                                            icon: 'success',
                                                                            confirmButtonColor: '#5cb85c',
                                                                            confirmButtonText: 'ok',
                                                                            timer: 1500
                                                                        })
                                                                    },
                                                                    (error) => {
                                                                        ErrorLog.writeLogFile('updateSaleHeaderCreditList', error)
                                                                    });
    
                                                            } else {
                                                                Swal.fire({
                                                                    icon: 'error',
                                                                    title: 'error Bill...',
                                                                    confirmButtonColor: '#d33',
                                                                    confirmButtonText: 'ok'
                                                                })
                                                            }
                                                        } else if (IsPaymentRequired == 1 && IsShowPayment == 1) {
                                                            setTimeout(function () {
                                                                ipcRenderer.invoke('OpenBillReceipt', '');
                                                            }, 1500)
                                                        } else {
                                                            Swal.fire({
                                                                title: 'Bill was Generated Successfully',
                                                                icon: 'success',
                                                                confirmButtonColor: '#5cb85c',
                                                                confirmButtonText: 'ok',
                                                                timer: 1500
                                                            })
                                                        }
    
                                                        if (IsKOTPrint == 1) {
    
                                                            TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {
    
                                                            }).then(async (result2) => {
    
                                                                await KOTPrinterService.getSaleBilldetail(SaleHeaderId).then((res1) => {
    
                                                                    printerService.getBillCounterdetail(SaleHeaderId)
    
                                                                }).catch((err) => {
                                                                    ErrorLog.writeLogFile('KOTPrinterService', err)
    
                                                                })
                                                            }).catch((error) => {
                                                                ErrorLog.writeLogFile('TokenPrinterService', error)
                                                            })
                                                        } else {
    
                                                            TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {
    
                                                            }).then(async (result2) => {
    
                                                                printerService.getBillCounterdetail(SaleHeaderId)
    
                                                            }).catch((error) => {
                                                                ErrorLog.writeLogFile('TokenPrinterService', error)
                                                            })
    
                                                        }
                                                        // selectedItems = selectedItems.filter(row => row.BillSlotNo != billSlotNo);
                                                        let tempItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);
                                                        var RowId = tempItems.map(({ RowId }) => ({ RowId }))
                                                        for (let i = 0; i < RowId.length; i++) {
                                                            selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId)
                                                            // selectedItems.splice((RowId[i].RowId-1), RowId.length);
                                                        }
                                                        ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                                                        let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
                                                        loadItemsData(serviceName);
                                                        calculateAmount(serviceName);
                                                        clearData();
                                                        document.getElementById("IsOtherStateCustomer").checked = false;
                                                        document.getElementById("IsOtherStateCustomerOpt").innerText="No"
                                                        // Swal.fire({
                                                        // icon: 'success',
                                                        // title: 'Bill has been saved',
                                                        // showConfirmButton: false,
                                                        // timer: 1500
                                                        // });
    
                                                    },
                                                    (error) => {
                                                        ErrorLog.writeLogFile('addSaleDetail', error)
    
                                                        BillingdbService.deleteSale(SaleHeaderId);
                                                        Swal.fire(
                                                            'Oops!',
                                                            'Not able to save the bill. try again later!',
                                                            'warning'
                                                        );
                                                    }
                                                )
                                            },
                                            (error) => {
                                                ErrorLog.writeLogFile('addSaleHeader', error)
    
                                                BillingdbService.deleteSale(SaleHeaderId);
                                                Swal.fire(
                                                    'Oops!',
                                                    'Not able to save the bill. try again later!',
                                                    'error'
                                                );
                                            }
                                        )
                                    }).catch(function (err) {
                                        ErrorLog.writeLogFile('generateBillTokenNo', err)
                                    });
    
                            },
                            (error) => {
                                ErrorLog.writeLogFile('generateBillNo', error)
    
                                Swal.fire(
                                    'Oops!',
                                    'Not able to generate the bill no. try again later!',
                                    'error'
                                );
                            }).catch(function (err) {
                                ErrorLog.writeLogFile('generateBillNo', err)
                            });
                    }
                    else {
                        Swal.fire(
                            'warning..!',
                            'Please Enter a Item?',
                            'warning'
                        )
                    }
    
    
                }
                else if (serviceTypeName == "Dine-In" || serviceTypeName == "DineIn-Self Service") {
                    
                    if (selectedTableSlotItems.length > 0) {
                        
                        $('#GenerateBill').prop('disabled', true);
                        Buttonshow = true;
    
                        item.BillTokenNo = '';
    
                        if ((serviceTypeName == "Dine-In" && WaiterId != '')|| serviceTypeName == "DineIn-Self Service" ) {
                            if (IsKOTPrint == 1) {
                                
                                KOTBills().then(async (res) => {
    
                                    await AddDineInSales()
                                    $('#GenerateBill').prop('disabled', false);
                                    Buttonshow = false;
                                }).catch((err) => {
                                    ErrorLog.writeLogFile('KOTBillserr', err)
                                    
    
                                    $('#GenerateBill').prop('disabled', false);
                                    Buttonshow = false;
                                })
                            } else {
                                
                                AddDineInSales()
                                $('#GenerateBill').prop('disabled', false);
                                Buttonshow = false;
                            }
    
                            //AddDineInSales()
    
    
                            // BillingdbService.addSaleHeader(item).then(
                            //     (result) => {
                            //         
                            //         SaleHeaderId = result
                            //         let SaleItemDetails = JSON.stringify(selectedTableSlotItems.map(obj => ({
                            //             SaleHeaderId: SaleHeaderId,
                            //             ItemId: obj.ItemId,
                            //             ItemName: obj.ItemName,
                            //             UOM: obj.UOM,
                            //             ItemBrandId: obj.ItemBrandId,
                            //             ItemGroupId: obj.ItemGroupId,
                            //             IsTakeAway: obj.IsTakeAway == 1 ? 1 : 0,
                            //             IsShowHSN: obj.IsShowHSN,
                            //             HSNNo: obj.HSNNo,
                            //             Quantity: obj.Quantity,
                            //             Rate: obj.Rate,
                            //             GSTPercentage: obj.GST,
                            //             TotalAmount: parseFloat(obj.Amount).toFixed(2),
                            //             GSTAmount: parseFloat(obj.GSTAmount).toFixed(2),
                            //             NetAmount: obj.Amount + parseFloat(obj.Amount) * (obj.GST / 100),
                            //             IsGSTInput: 0
                            //         })));
                            //         BillingdbService.addSaleDetail(SaleItemDetails).then(
                            //             (result) => {
                            //                 
                            //                 $('#GenerateBill').prop('disabled', false);
                            //                 Buttonshow = false;
                            //                 if (IsKOTPrint == 1) {
                            //                     //KOTBills()
                            //                 }
    
                            //                 printerService.getBillCounterdetail(SaleHeaderId)
    
                            //                 // let tempItems = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == seatbillSlotNo);
                            //                 // var RowId = tempItems.map(({ RowId }) => ({ RowId }))
                            //                 // for (let i = 0; i < RowId.length; i++) {
                            //                 //     selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId)
                            //                 //     // selectedItems.splice((RowId[i].RowId-1), RowId.length);
                            //                 // }
                            //                 ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                            //                 let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    
                            //                 loadItemsData(serviceName);
                            //                 calculateAmount(serviceName);
                            //                 clearData();
    
                            //                 Swal.fire({
                            //                     icon: 'success',
                            //                     title: 'Bill has been saved',
                            //                     showConfirmButton: false,
                            //                     timer: 1500
                            //                 });
    
                            //                 store.delete('SaleHeaderId')
                            //                 store.delete('serviceTypeName')
                            //                 store.set('SaleHeaderId', SaleHeaderId)
                            //                 store.set('serviceTypeName', serviceTypeName)
    
    
    
                            //                 if (IsPaymentRequired == 0) {
                            //                     let saleHeaderList = {
                            //                         IsCreditBill: 1,
                            //                         IsPaid: 0,
                            //                         SaleHeaderId: SaleHeaderId,
                            //                         Ref: loginId,
                            //                         UpdatedOn: todayDate + Time
                            //                     }
                            //                     if (SaleHeaderId != undefined) {
                            //                         BillingdbService.updateSaleHeaderCreditList(saleHeaderList).then(
                            //                             (data) => {
                            //                                 Swal.fire({
                            //                                     title: 'Bill was changed Credit Successfully',
                            //                                     icon: 'success',
                            //                                     confirmButtonColor: '#5cb85c',
                            //                                     confirmButtonText: 'ok',
                            //                                     timer: 1500
                            //                                 })
                            //                             },
                            //                             (error) => {
                            //                                 ErrorLog.writeLogFile('updateSaleHeaderCreditList', error)
                            //                             });
    
                            //                     } else {
                            //                         Swal.fire({
                            //                             icon: 'error',
                            //                             title: 'error Bill...',
                            //                             confirmButtonColor: '#d33',
                            //                             confirmButtonText: 'ok'
                            //                         })
                            //                     }
                            //                 } else if (IsPaymentRequired == 1 && IsShowPayment == 1) {
                            //                     setTimeout(function () {
                            //                         ipcRenderer.invoke('OpenBillReceipt', '');
                            //                     }, 1500)
                            //                 } else {
                            //                     Swal.fire({
                            //                         title: 'Bill was Generated Successfully',
                            //                         icon: 'success',
                            //                         confirmButtonColor: '#5cb85c',
                            //                         confirmButtonText: 'ok',
                            //                         timer: 1500
                            //                     })
                            //                 }
                            //                 //$("#showWaiter").val('')
    
                            //             },
                            //             (error) => {
                            //                 ErrorLog.writeLogFile('addSaleDetail', error)
    
                            //                 BillingdbService.deleteSale(SaleHeaderId).then(
                            //                     (result) => {
                            //                     }).catch(function (err) {
                            //                         ErrorLog.writeLogFile('deleteSale', err)
                            //                     });
                            //                 Swal.fire(
                            //                     'Oops!',
                            //                     'Not able to save the bill. try again later!',
                            //                     'warning'
                            //                 );
                            //             }
                            //         ).catch(function (err) {
                            //             ErrorLog.writeLogFile('addSaleDetail', err)
                            //         });
                            //     },
                            //     (error) => {
                            //         ErrorLog.writeLogFile('addSaleHeader', error)
    
                            //         BillingdbService.deleteSale(SaleHeaderId).catch(function (err) {
                            //             ErrorLog.writeLogFile('deleteSale', err)
                            //         });;
                            //         Swal.fire(
                            //             'Oops!',
                            //             'Not able to save the bill. try again later!',
                            //             'error'
                            //         );
                            //     }
                            // ).catch(function (err) {
                            //     ErrorLog.writeLogFile('addSaleHeader', err)
                            // });
    
                            // },
                            // (error) => {
                            //     ErrorLog.writeLogFile('generateBillNo', error)
    
                            //     Swal.fire(
                            //         'Oops!',
                            //         'Not able to generate the bill no. try again later!',
                            //         'error'
                            //     );
                            // }).catch(function (err) {
                            //     ErrorLog.writeLogFile('generateBillNo', err)
                            // });
                        }
                        else {
                            $('#GenerateBill').prop('disabled', false);
                            Buttonshow = false;
                            Swal.fire({
                                title: 'Please Choose Waiter?',
                                icon: 'warning',
                                showCancelButton: false,
                                confirmButtonText: 'Ok'
                            })
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
                else if (IsWebOrders != 1) {
                    if (serviceTypeName != "Take Away" && serviceTypeName != "Dine-In" && serviceTypeName != "DineIn-Self Service") {
                        if (selectedBillSlotItems.length > 0) {
                            $('#GenerateBill').prop('disabled', true);
                            Buttonshow = true;
                            item.BillTokenNo = '';
    
                            BillingdbService.generateBillNo(item.BillCounterCode, item.BillCounterId).then(
                                (result) => {
    
                                    let res = result.split('_');
                                    item.BillNo = res[0];
                                    item.DisplayBillNo = res[1];
                                    item.IsWebOrders = 0
    
                                    BillingdbService.addSaleHeader(item).then(
                                        (result) => {
    
                                            SaleHeaderId = result
                                           // console.log("SA",selectedBillSlotItems)
                                            let SaleItemDetails = JSON.stringify(selectedBillSlotItems.map(obj => ({
                                                SaleHeaderId: SaleHeaderId,
                                                ItemId: obj.ItemId,
                                                ItemName: obj.ItemName,
                                                UOM: obj.UOM,
                                                ItemBrandId: obj.ItemBrandId,
                                                ItemGroupId: obj.ItemGroupId,
                                                IsTakeAway: obj.IsTakeAway == 1 ? 1 : 0,
                                                IsShowHSN: obj.IsShowHSN,
                                                HSNNo: obj.HSNNo,
                                                Quantity: obj.Quantity,
                                                Rate: obj.Rate,
                                                GSTPercentage: obj.GST,
                                                CESSPercentage: obj.CESS,
                                                TaxPercentage: obj.Tax,
                                                TotalAmount: parseFloat(obj.Amount).toFixed(2),
                                                GSTAmount: parseFloat(obj.GSTAmount).toFixed(2),
                                                CESSAmount: parseFloat(obj.CESSAmount).toFixed(2),
                                                TaxAmount: parseFloat(obj.TaxAmount).toFixed(2),
                                                NetAmount: parseFloat(parseFloat(obj.Amount) + parseFloat(obj.TaxAmount)).toFixed(2),
                                                IsGSTInput: obj.IsGSTInput
                                          
                                            })));
                                            BillingdbService.addSaleDetail(SaleItemDetails).then(
                                                (result) => {
                                                    
                                                    // $('#GenerateBill').prop('disabled', false);
    
                                                    if (serviceTypeName == "Self-Service") {
    
                                                        // TokenPrinterService.getSaleBilldetail(SaleHeaderId).then((res) => {
                                                        // printerService.getBillCounterdetail(SaleHeaderId)
                                                        // }).catch((error) => {
                                                        // ErrorLog.writeLogFile('TokenPrinterService', error)
                                                        // })
    
                                                        printerService.getBillCounterdetail(SaleHeaderId).then((res) => {
    
                                                            if (res == "success") {
                                                                setTimeout(function () {
                                                                    TokenPrinterService.getSaleBilldetail(SaleHeaderId)
                                                                }, 2000);
                                                            } else {
                                                                ErrorLog.writeLogFile('TokenPrinterService', error)
    
                                                            }
                                                        }).catch((error) => {
                                                            ErrorLog.writeLogFile('TokenPrinterService', error)
                                                        })
                                                    }
                                                    else if (serviceTypeName != "Self-Service" && serviceTypeName != "Dine-In" && serviceTypeName != "DineIn-Self Service" && serviceTypeName != "Take Away") {
                                                        printerService.getBillCounterdetail(SaleHeaderId)
    
                                                    }
                                                    //selectedItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);
                                                    let tempItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);
                                                    var RowId = tempItems.map(({ RowId }) => ({ RowId }))
                                                    for (let i = 0; i < RowId.length; i++) {
                                                        selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId)
                                                        // selectedItems.splice((RowId[i].RowId-1), RowId.length);
                                                    }
                                                    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
                                                    let serviceName = serviceTypes.find(x => x.ServiceTypeId == ServiceTypeId).ServiceType
    
                                                    loadItemsData(serviceName);
                                                    calculateAmount(serviceName);
                                                    clearData();
    
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Bill has been saved',
                                                        showConfirmButton: false,
                                                        timer: 1500
                                                    });
                                                    store.delete('SaleHeaderId')
                                                    store.delete('serviceTypeName')
                                                    store.set('SaleHeaderId', SaleHeaderId)
                                                    store.set('serviceTypeName', serviceTypeName)
                                                    $('#GenerateBill').prop('disabled', false);
                                                    document.getElementById("IsOtherStateCustomer").checked = false;
                                                    document.getElementById("IsOtherStateCustomerOpt").innerText="No"
                                                    Buttonshow = false;
    
                                                    if (IsPaymentRequired == 0) {
    
                                                        let saleHeaderList = {
                                                            IsCreditBill: 1,
                                                            IsPaid: 0,
                                                            SaleHeaderId: SaleHeaderId,
                                                            Ref: loginId,
                                                            UpdatedOn: todayDate + Time,
                                                            IsOtherStateCustomer:IsOtherStateCustomerValue,
                                                            CustomerName: $('#customerName').val().trim() != '' ? $('#customerName').val().trim() : '',
                                                            PhoneNo: $('#phoneNumber').val().trim() != '' ? $('#phoneNumber').val().trim() : '',
                                                            GSTNo: $('#gst').val().trim() != '' ? $('#gst').val().trim() : '',
                                                            RefNo: $('#ref').val().trim() != '' ? $('#ref').val().trim() : ''
                                                        }
                                                        if (SaleHeaderId != undefined) {
                                                            BillingdbService.updateSaleHeaderCreditList(saleHeaderList).then(
                                                                (data) => {
                                                                    Swal.fire({
                                                                        title: 'Bill was changed Credit Successfully',
                                                                        icon: 'success',
                                                                        confirmButtonColor: '#5cb85c',
                                                                        confirmButtonText: 'ok',
                                                                        timer: 1500
                                                                    })
                                                                },
                                                                (error) => {
                                                                    ErrorLog.writeLogFile('updateSaleHeaderCreditList', error)
                                                                });
    
                                                        } else {
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'error Bill...',
                                                                confirmButtonColor: '#d33',
                                                                confirmButtonText: 'ok'
                                                            })
                                                        }
                                                    } else if (IsPaymentRequired == 1 && IsShowPayment == 1) {
    
                                                        setTimeout(function () {
                                                            ipcRenderer.invoke('OpenBillReceipt', '');
                                                        }, 1500)
                                                    } else {
                                                        Swal.fire({
                                                            title: 'Bill was Generated Successfully',
                                                            icon: 'success',
                                                            confirmButtonColor: '#5cb85c',
                                                            confirmButtonText: 'ok',
                                                            timer: 1500
                                                        })
                                                    }
                                                },
                                                (error) => {
                                                    ErrorLog.writeLogFile('addSaleDetail', error)
    
                                                    BillingdbService.deleteSale(SaleHeaderId).then(
                                                        (result) => {
                                                        }).catch(function (err) {
                                                            ErrorLog.writeLogFile('deleteSale', err)
                                                        });
                                                    Swal.fire(
                                                        'Oops!',
                                                        'Not able to save the bill. try again later!',
                                                        'warning'
                                                    );
                                                }
                                            ).catch(function (err) {
                                                ErrorLog.writeLogFile('addSaleDetail', err)
                                            });
                                        },
                                        (error) => {
                                            ErrorLog.writeLogFile('addSaleHeader', error)
    
                                            BillingdbService.deleteSale(SaleHeaderId).catch(function (err) {
                                                ErrorLog.writeLogFile('deleteSale', err)
                                            });;
                                            Swal.fire(
                                                'Oops!',
                                                'Not able to save the bill. try again later!',
                                                'error'
                                            );
                                        }
                                    ).catch(function (err) {
                                        ErrorLog.writeLogFile('addSaleHeader', err)
                                    });
                                },
                                (error) => {
                                    ErrorLog.writeLogFile('generateBillNo', error)
    
                                    Swal.fire(
                                        'Oops!',
                                        'Not able to generate the bill no. try again later!',
                                        'error'
                                    );
                                }).catch(function (err) {
                                    ErrorLog.writeLogFile('generateBillNo', err)
                                });
                        } else {
                            Swal.fire(
                                'warning..!',
                                'Please Enter a Item?',
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
            }
          

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

function AddDineInSales() {
    // return new Promise(function (resolve, reject) {
    let TableNo = tableSlotNo;
    let SeatNo = String.fromCharCode(seatbillSlotNo);
    let SentBy = document.getElementById('cashierName').innerHTML;
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

        // in case of error
        if (err) {

            ErrorLog.writeLogFile('spChecklock', err.sqlMessage)

        }
    });

    connection.query("call spChecklock(?,?,?)", [SentBy, TableNo, SeatNo], function (err, rows, fields) {

        if (err) {
            ErrorLog.writeLogFile('spChecklock', err.sqlMessage)

            Swal.fire({
                title: err.sqlMessage,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
            $('#GenerateBill').prop('disabled', false);
            Buttonshow = false;
            return;
        }
        else {
            IsOtherStateCustomer()

            if (store.get('IsOnline') == 'true') {
                loginId = EncrDecrService.decrypt(store.get('Ref'))
            }
            else {
                loginId = store.get('Ref')
            }


            let Item = {
                "TableNo": tableSlotNo,
                "SeatNo": String.fromCharCode(seatbillSlotNo),
                "SentBy": store.get('DisplayName') != '' ? store.get('DisplayName') : '',
                "IsOtherStateCustomer": IsOtherStateCustomerValue,
                "CustomerName": $('#customerName').val().trim(),
                "PhoneNo": $('#phoneNumber').val().trim(),
                "GSTNo": $('#gst').val().trim(),
                "RefNo": $('#ref').val().trim(),
                "Source": '/Dine-In Desktop',
                "LoginId": loginId
            }
         //   console.log(Item)
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

                // in case of error
                if (err) {

                    ErrorLog.writeLogFile('AddDineInSales', err.sqlMessage)

                }
            });

            connection.query("call spAddDineInSales(?,?,?,?,?,?,?,?,?,?)", [Item.TableNo, Item.SeatNo, Item.SentBy,Item.IsOtherStateCustomer,Item.CustomerName,Item.PhoneNo,Item.GSTNo,Item.RefNo,Item.Source, Item.LoginId], function (err, rows, fields) {

                if (err) {


                    if (err.sqlMessage == "Already Bill Generated") {

                        clearData();
                        let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

                        let Item = {
                            "TableNo": tableSlotNo,
                            "SeatNo": String.fromCharCode(seatbillSlotNo),
                            "BillCounterId": store.get('BillCounterId'),
                            "SaleDate": SaleDate
                        }
                        getPOSSaleDetails(Item)
                        Swal.fire({
                            icon: 'success',
                            title: err.sqlMessage,
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {

                        ErrorLog.writeLogFile('spAddDineInSales', err.sqlMessage)


                        Swal.fire({
                            icon: 'error',
                            title: err.sqlMessage,
                            showConfirmButton: true,
                            allowOutsideClick: false
                            //timer: 1500
                        });
                    }

                    $('#GenerateBill').prop('disabled', false);
                    Buttonshow = false;
                    //  reject()

                    return;
                }
                else {

                    $('#GenerateBill').prop('disabled', false);
                    Buttonshow = false;

                    Swal.fire({
                        icon: 'success',
                        title: 'Bill has been saved',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    document.getElementById("IsOtherStateCustomer").checked = false;
                    document.getElementById("IsOtherStateCustomerOpt").innerText="No"
                    clearData()

                    let SaleDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)

                    let Item = {
                        "TableNo": tableSlotNo,
                        "SeatNo": String.fromCharCode(seatbillSlotNo),
                        "BillCounterId": store.get('BillCounterId'),
                        "SaleDate": SaleDate
                    }
                    getPOSSaleDetails(Item)
                    // resolve('AddDineInSales succesfully')
                }
            });

            connection.end(function () {
                // The connection has been closed
            });
        }
    })





    // Close the connection
    connection.end(function () {
        // The connection has been closed
    });



    //})
}



$.fn.GenerateBillReport = function (view) {
    debugger
    ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
    let serviceTypeName = serviceTypes.find(x => x.ServiceTypeId == Number(ServiceTypeId)).ServiceType
    let SlotWiselist = selectedItems.filter(x => x.BillSlotNo == billSlotNo && x.ServiceType == serviceTypeName);
    let selectedTableSlotItems = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == seatbillSlotNo);
    //let selectedBillSlotItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);


    if (SlotWiselist.length > 0) {
        debugger
        showLoading();

        let date = new Date();
        let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
        let dateString = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;

        let totalAmount = SlotWiselist.map(row => row.Amount).reduce((prev, next) => Number(prev) + Number(next));
        let gstAmount = SlotWiselist.map(row => row.GSTAmount).reduce((prev, next) => Number(prev) + Number(next));

        let item = {
            TotalAmount: Number(totalAmount).toFixed(2),
            TotalGST: Number(gstAmount).toFixed(2),
            NetAmount: NetAmount.toFixed(2),
            TotalItems: TotalItems,
            RoundOff: RoundOff,
            CustomerName: $('#customerName').val().trim(),
            PhoneNo: $('#phoneNumber').val().trim(),
            GSTNo: $('#gst').val().trim(),
            RefNo: $('#ref').val().trim(),
            BillTime: currenttime,
            SaleDate: dateString,
            ServiceType: serviceTypeName + ' Estimation',
            CashierName: store.get('DisplayName')
        }


        let itemList = [];
        for (let i = 0; i < SlotWiselist.length; i++) {
            itemList.push({
                ItemName: SlotWiselist[i].ItemName,
                Qty: Number(SlotWiselist[i].Quantity).toFixed(2) + SlotWiselist[i].UOM,
                Rate: SlotWiselist[i].Rate.toFixed(2),
                // Qty : SlotWiselist[i].DisplayQuantity , 
                // UOM : SlotWiselist[i].UOM ,
                TotalAmount: Number(SlotWiselist[i].Amount).toFixed(2)
            })
        }

        Swal.close();
        printerEstimateService.getGenerateBill(item, itemList, view);

        if (view == 1) {
            clearData();
            // $(this).deleteAll();
            let tempItems = selectedItems.filter(row => row.BillSlotNo == billSlotNo && row.ServiceType == serviceTypeName);
            var RowId = tempItems.map(({ RowId }) => ({ RowId }))
            for (let i = 0; i < RowId.length; i++) {
                selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId);
            }
            loadItemsData();
            calculateAmount();
        }
    }
    else if (selectedTableSlotItems.length > 0) {


        showLoading();

        let date = new Date();
        let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
        let dateString = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        let currenttime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + ampm;

        let totalAmount = selectedTableSlotItems.map(row => row.Amount).reduce((prev, next) => Number(prev) + Number(next));
        let gstAmount = selectedTableSlotItems.map(row => row.GSTAmount).reduce((prev, next) => Number(prev) + Number(next));

        let item = {
            TotalAmount: totalAmount.toFixed(2),
            TotalGST: Number(gstAmount).toFixed(2),
            NetAmount: NetAmount.toFixed(2),
            TotalItems: TotalItems,
            RoundOff: RoundOff,
            CustomerName: $('#customerName').val().trim(),
            PhoneNo: $('#phoneNumber').val().trim(),
            GSTNo: $('#gst').val().trim(),
            RefNo: $('#ref').val().trim(),
            BillTime: currenttime,
            SaleDate: dateString,
            ServiceType: serviceTypeName + ' Estimation',
            CashierName: store.get('DisplayName')
        }

        let itemList = [];
        for (let i = 0; i < selectedTableSlotItems.length; i++) {
            itemList.push({
                ItemName: selectedTableSlotItems[i].ItemName,
                Qty: Number(selectedTableSlotItems[i].Quantity).toFixed(2) + selectedTableSlotItems[i].UOM,
                Rate: selectedTableSlotItems[i].Rate.toFixed(2),
                // Qty : SlotWiselist[i].DisplayQuantity , 
                // UOM : SlotWiselist[i].UOM ,
                TotalAmount: selectedTableSlotItems[i].Amount.toFixed(2)
            })
        }

        Swal.close();
        printerEstimateService.getGenerateBill(item, itemList, view);

        if (view == 1) {
            clearData();
            // $(this).deleteAll();
            let tempItems = selectedItems.filter(row => row.TableSlotNo == tableSlotNo && row.seatbillSlotNo == seatbillSlotNo);
            var RowId = tempItems.map(({ RowId }) => ({ RowId }))
            for (let i = 0; i < RowId.length; i++) {
                selectedItems = selectedItems.filter(x => x.RowId != RowId[i].RowId);
                //  selectedItems.splice((RowId[i].RowId-1), RowId.length);
            }
            loadItemsData();
            calculateAmount();
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


$.fn.ImportItems = function (event) {

    let Item = {
        "CompanyId": environment.CompanyId,
        "POSId": environment.POSId
    }
    Swal.fire({
        title: 'Are you Sure to Import Items?',
        showCancelButton: true,
        icon: 'question',
        confirmButtonText: 'Yes',
        CancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                button: false,
                width: 200,
                height: 20,
                allowEscapeKey: false,
                closeOnClickOutside: false,
                closeOnEsc: false,
                showConfirmButton: false,
                allowOutsideClick: false,
                imageUrl: "../../assets/images/Loader.gif"
            })

            $.post(environment.apiURL + '/ImportItems', Item, function (data) {
                let res = JSON.parse(data);
              //  console.log('res ==',res)

                if (res.Status == "valid") {
                    Swal.fire({
                        title: 'Imported Success',
                        width: 500,
                        height: 200,
                        position: 'center',
                        icon: 'success',
                        title: 'Imported Success',
                        timer: 3500
                    })
                    // UpdateItems();
                    // $('#log-out').click();

                    store.delete('loginToken');
                    let holdItemlist = []
                    holdItemlist = selectedItems.length != 0 ? selectedItems : []
                    if (holdItemlist.length != 0) {
                        store.set('SelectedItems', selectedItems)
        
                    } else {
                        store.delete('SelectedItems')
                    }
                    let holdDineInlist = []
                    holdDineInlist = DineInselectedItems.length != 0 ? DineInselectedItems : []
                    if (holdDineInlist.length != 0) {
                        store.set('DineInselectedItems', DineInselectedItems)
                    } else {
                        store.delete('DineInselectedItems')
                    }
                    store.delete('loginToken');
                    clearInterval(myInterval);
                    ipcRenderer.invoke('Navigate', environment.PageUrl.login);

                }
                else if (res.Status == "invalid") {
                    Swal.fire({
                        title: 'Imported Failed',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                    ErrorLog.writeLogFile('ImportItems invalid = ', JSON.stringify(res))
                }
            }).catch(function (err) {
           //     console.log('ImportItems catch error =', err.statusText)
                let errormsg;
                if(err.statusText == "Not Found"){
                    errormsg = " Imported Failed / Not Found"
                }
                else if(err.statusText == "error"){
                    errormsg = 'API Server was Disconnected . try again later!'
                }
                else{
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
                ErrorLog.writeLogFile('ImportItems  error =', JSON.stringify(err))
             });

        } else if (result.isDenied) {
            
        }
    })

}

// function UpdateItems() {
    
//     let Item = {
//         "POSId": environment.POSId,
//         "POSDate": ItemserverDate,
//         "CompanyId": environment.CompanyId
//     }

//     debugger;
//     $.post(environment.apiURL + '/GetAllBillCountersandItemsForPOS', Item).then(async (result12) => {
//         let resu = JSON.parse(result12);
//         if(resu.Status == "valid"){
//             itemList = [];
//             itemList = resu.Data[6];
//             console.log(' resu==',resu)
//             console.log('itemList length==',itemList.length)

//             await BillingdbService.addItemList(itemList).then(async (response) => {
//                 if(response == 'Item added successfully'){
//                     debugger;
//                     loadItemsForBillCounter().then(async (response1) => {
//                         if(response1 == 'Item get successfully'){
//                             debugger;
//                             ServiceTypeId = $('input:radio[name=serviceType]:checked').val();
//                             ServiceTypeId = Number(ServiceTypeId);
//                             console.log('ServiceTypeId ==',ServiceTypeId)
//                             tempItemList = [];
//                             console.log('ServiceTypeId ==',itemList)
//                             tempItemList = itemList.filter(row => row.ServiceTypeId == ServiceTypeId);
//                             console.log('tempItemList ==',tempItemList)
//                         }
//                         else{
//                             ErrorLog.writeLogFile('GetAllBillCountersandItemsForPOS from user page', err)
//                         }
//                     })
//                 }
//                 else{
//                     ErrorLog.writeLogFile('GetAllBillCountersandItemsForPOS from user page', err)
//                 }
//             }).catch(function (err) {
//                 ErrorLog.writeLogFile('GetAllBillCountersandItemsForPOS from user page', err)
//             })
//         }
//         else{
//             ErrorLog.writeLogFile('GetAllBillCountersandItemsForPOS from user page', err)
//         }
//     }).catch(function (err) {
//         ErrorLog.writeLogFile('GetAllBillCountersandItemsForPOS from user page', err)
//     })
// }
