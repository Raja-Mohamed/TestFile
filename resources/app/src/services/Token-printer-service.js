const { path } = require('path');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const CustomValidators = require('../services/custom-validation')
let Swal = require('sweetalert2');
const { rootPath } = require('../../rootpath')
const EncrDecrService = require('../services/encrypt-decrypt.service');
let Store = require('electron-store');
const store = new Store();
const ErrorLog = require('../services/log');

let CompanyName;
let ItemName;
let Quantity;
let BillNo;
let BillTime;
let BillTokenNo;
let SaleDate;
let SaleItemdetails = [];
let nontokengrouplist = [];
let tokengrouplist = [];
let SaleValues;
let ServiceType;
let BillCounterName;
let TableNo;
let SeatNo;
let RefNo;
let IsWebOrders;
let IsEnableWaiterToken;
let IsEnableCustomerToken;
let WaiterName;
let CaptainName;
let CustomerTokenGroupList = store.get('CustomerTokenGroupList');
let IsAllowCustomerTokenGrouping = store.get('IsAllowCustomerTokenGrouping');

//console.log("IsAllowCustomerTokenGrouping", IsAllowCustomerTokenGrouping)
//console.log("CustomerTokenGroupList", CustomerTokenGroupList)
let TotalItemsCount;
let BillingdbService = require('../database/billingdb');



class TokenPrinterService {


  getSaleBilldetail(SaleHeaderId, KOTDetails) {
    debugger
    let item = {
      SaleHeaderId: SaleHeaderId
    }
    let PrinterName = store.get('PrinterName')
    BillCounterName = store.get('BillCounterName')
    IsEnableCustomerToken = store.get('IsEnableCustomerToken')
    IsEnableWaiterToken = store.get('IsEnableWaiterToken')


    if (PrinterName == "") {

      Swal.fire(
        'warning..!',
        'Please Configure printer Settings..!',
        'warning'
      )
      reject("printer not Configured")

    }
    else if (SaleHeaderId != 0) {
      return new Promise(function (resolve, reject) {
        debugger
        BillingdbService.getSaleBillDetails(item).then(
          (res) => {
            debugger
            let SaleBilldetails = res
            ServiceType = SaleBilldetails[0].ServiceType
            BillNo = SaleBilldetails[0].DisplayBillNo
            let serverDate = SaleBilldetails[0].SaleDate
            let serverDateArr = serverDate.split('-')
            let displayyear = serverDateArr[2].slice(-2)
            SaleDate = serverDateArr[0] + "/" + serverDateArr[1] + "/" + displayyear
            BillTime = SaleBilldetails[0].BillTime
            IsWebOrders = SaleBilldetails[0].IsWebOrders
            TableNo = SaleBilldetails[0].TableNo
            SeatNo = SaleBilldetails[0].SeatNo
            WaiterName = SaleBilldetails[0].WaiterName
            CaptainName = SaleBilldetails[0].CashierName
            BillTokenNo = SaleBilldetails[0].BillTokenNo
            RefNo = SaleBilldetails[0].RefNo

            BillingdbService.getSaleBillItemDetailsForToken(item).then(
              (result) => {
                // let TokenItem = result
                // SaleItemdetails = Array.from(new Set(TokenItem.map(s => `${s.ItemName},${s.DisplayQuantity}`)))
                //   .map(item => {
                //     const [ItemName, DisplayQuantity] = item.split(',');
                //     return { ItemName, DisplayQuantity };
                //   });
         
                SaleItemdetails = result
              
                TotalItemsCount = SaleItemdetails.length
                let options;
                let data;
                //customerTokenIsEnableCustomerToken == 1
                if (IsEnableCustomerToken == 1 && ServiceType == "Take Away") {

                  options = {
                    preview: false,
                    margin: '-174px 24px -3px -10px',
                    copies: 1,
                    silent: true,
                    width: 100,
                    printerName: PrinterName,
                    timeOutPerLine: 400,
                    pageSize: '80mm' // page size

                  }

                  data = [
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'image',
                      path: rootPath() + '/assets/images/logo.png',
                      position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                      width: '220px',                                           // width of image in px; default: auto
                      height: '70px',                                          // width of image in px; default: 50 or '50px'
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "Customer Token",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: ServiceType,
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "Token #" + BillTokenNo,
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },


                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: `<table>
                        <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                        <td style="text-align:left; font-family:Calibri">${SaleDate} @${BillTime}</td>
                        <td style="text-align:right; font-family:Calibri">Thank you</td>
                        </tr>
                        </table>`,
                      style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "*** WAITER USE ONLY ***",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }
                  ]
                  ipcRenderer.invoke('TokenPrint', data, options);

                }
                else if (IsEnableWaiterToken == 1 && ServiceType == "Dine-In") {
                  debugger
                  var ItemArray = SaleItemdetails.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
                 // console.log("ItemArray",ItemArray)
                  SaleValues = ItemArray.map(Object.values);
                  options = {
                    preview: false,
                    margin: '-186px 24px -3px -10px',
                    copies: 1,
                    silent: true,
                    width: 100,
                    printerName: PrinterName,
                    timeOutPerLine: 400,
                    pageSize: '80mm' // page size

                  }

                  data = [
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "Waiter Token",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: BillCounterName + ' : ' + TableNo + ' - ' + SeatNo,
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: WaiterName,
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: `<table>
                      <tr style=" line-height:5px; font-size: 16px; border-bottom:1px dotted;">
                      <td style="text-align:left; border-top:1px dotted; font-family:Calibri">Date : ${SaleDate}</td>
                      <td style="text-align:right; border-top:1px dotted; font-family:Calibri">@${BillTime}</td>
                      </tr>
        
                      </table>`,
                      style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                    },
                    {
                      type: 'table',
                      // style the table
                      style: { 'border-bottom': '1px dashed', 'border-bottom': '1px dashed' },
                      // list of the columns to be rendered in the table header
                      //    tableHeader: ['', ''],
                      // multi dimensional array depicting the rows and columns of the table body
                      tableBody: SaleValues,
                      // list of columns to be rendered in the table footer
                      // tableFooter: ,
                      // custom style for the table header
                      tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "16px", },
                      // custom style for the table body
                      // tableRowStyle: { 'border-bottom': 'none' },
                      tableBodyStyle: { border: 'none', fontWeight: "700", 'font-family': "Calibri", fontSize: "14px", textAlign: "left" },
                      // custom style for the table footer
                      tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px", },
                    },
                    {
                      type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                      value: "Captain :" + " " + CaptainName,
                      style: { textAlign: 'left', fontSize: "15px" }
                    },{
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "*** WAITER USE ONLY ***",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }
                  ]
                  ipcRenderer.invoke('TokenPrint', data, options);

                }
                else if (IsEnableCustomerToken == 1 && IsWebOrders == 1) {

                  options = {
                    preview: false,
                    margin: '-174px 24px -3px -10px',
                    copies: 1,
                    silent: true,
                    width: 100,
                    printerName: PrinterName,
                    timeOutPerLine: 400,
                    pageSize: '80mm' // page size

                  }

                  data = [
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "-",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'image',
                      path: rootPath() + '/assets/images/logo.png',
                      position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                      width: '220px',                                           // width of image in px; default: auto
                      height: '70px',                                          // width of image in px; default: 50 or '50px'
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "Online Token",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "Take Away",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "Token #" + BillTokenNo,
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: ServiceType + " Ref # " + RefNo,
                      style: { fontWeight: "700", fontSize: "22px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: `<table>
                        <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                        <td style="text-align:left; font-family:Calibri">${SaleDate} @${BillTime}</td>
                        <td style="text-align:right; font-family:Calibri">Thank you</td>
                        </tr>
                        </table>`,
                      style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                    },
                  ]
                  ipcRenderer.invoke('TokenPrint', data, options);

                }
                else if (IsEnableCustomerToken == 1 && ServiceType == "Self-Service") {

                  for (let i = 0; i < SaleItemdetails.length; i++) {
                    ItemName = SaleItemdetails[i].ItemName
                    Quantity = SaleItemdetails[i].DisplayQuantity
                    let BillNoCount = []
                    BillNoCount = BillNo + ' # ' + (i + 1)

                    //TokenPrinterService printer function
                    options = {
                      preview: false,
                      margin: '-174px  24px -3px -10px',
                      copies: 1,
                      silent: true,
                      width: 100,
                      printerName: PrinterName,
                      timeOutPerLine: 400,
                      pageSize: '80mm' // page size


                    }

                    data = [
                      {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      },
                      {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      }, {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      }, {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      }, {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      }, {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      }, {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "-",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      },
                      {
                        type: 'image',
                        path: rootPath() + '/assets/images/logo.png',
                        position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                        width: '220px',                                           // width of image in px; default: auto
                        height: '70px',                                          // width of image in px; default: 50 or '50px'
                      },
                      {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "TOKEN",
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      },
                      {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: "Date : " + SaleDate + " - " + BillTime,
                        style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                      },
                      {
                        type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                        value: `<table>
                        <tr style=" line-height:5px; font-size: 20px; border-bottom:1px dotted;">
                        <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong>Bill No : ${BillNoCount}</strong></td>
                        
                     
                        </tr>
                        <tr style="font-size: 20px;border-bottom:1px dotted">
                        <td style="text-align:left;font-family:Calibri; max-width: 180px;"><strong>${ItemName}</strong></td>
                        <td style="text-align:right; font-family:Calibri"><strong>${Quantity}</strong></td>
                        </tr>
                        <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                        <td colspan=2 style="text-align:center; font-family:Calibri"><strong>Thank you</strong></td>
                        </tr>
                        </table>`,
                        style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                      },
                    ]

                    ipcRenderer.invoke('TokenPrint', data, options);
                  }
                }
                else if (IsEnableCustomerToken == 1 && ServiceType == "DineIn-Self Service") {
                  debugger
                  if (IsAllowCustomerTokenGrouping == 1) {
                    debugger
                    //    let nonTokenGroupList = CustomerTokenGroupList.find(x => x.ItemId != itemId)
                    for (let i = 0; i < SaleItemdetails.length; i++) {
                      let itemId = SaleItemdetails[i].ItemId
                      let TokenGroupList = CustomerTokenGroupList.find(x => x.ItemId == itemId)
                      if (TokenGroupList != undefined) {
                        SaleItemdetails[i].CustomerTokenGroupName = TokenGroupList.CustomerTokenGroupName
                      } else {
                        SaleItemdetails[i].CustomerTokenGroupName = '';
                      }
                    }

                    nontokengrouplist = SaleItemdetails.filter(x => x.CustomerTokenGroupName == '');
                    tokengrouplist = SaleItemdetails.filter(x => x.CustomerTokenGroupName != '');
                    if (nontokengrouplist.length > 0) {
                      var ItemArray = nontokengrouplist.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
                      SaleValues = ItemArray.map(Object.values);

                      let BillNoCount = []
                      BillNoCount = BillNo

                      //TokenPrinterService printer function
                      options = {
                        preview: false,
                        margin: '-174px  24px -3px -10px',
                        copies: 1,
                        silent: true,
                        width: 100,
                        printerName: PrinterName,
                        timeOutPerLine: 400,
                        pageSize: '80mm' // page size


                      }

                      data = [
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'image',
                          path: rootPath() + '/assets/images/logo.png',
                          position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                          width: '220px',                                           // width of image in px; default: auto
                          height: '70px',                                          // width of image in px; default: 50 or '50px'
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "Customer Token - DineIn(S)",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "Date : " + SaleDate + " - " + BillTime,
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: `<table>
                          <tr style=" line-height:5px; font-size: 20px; border-bottom:1px dotted;">
                          <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong>Bill No : ${BillNoCount}</strong></td>
                          </tr>
                          <tr style=" line-height:5px; font-size: 18px; border-bottom:1px dotted;">
                          <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong>OTHERS</strong></td>
                          </tr></table>`,
                          style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                        }, {
                          type: 'table',
                          // style the table
                          style: { 'border-bottom': '1px dashed', 'border-bottom': '1px dashed' },
                          // list of the columns to be rendered in the table header
                          tableHeader: ['ItemName', 'Qty'],
                          // multi dimensional array depicting the rows and columns of the table body
                          tableBody: SaleValues,
                          // list of columns to be rendered in the table footer
                          // tableFooter: ,
                          // custom style for the table header
                          tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "18px", },
                          // custom style for the table body
                          // tableRowStyle: { 'border-bottom': 'none' },
                          tableBodyStyle: { border: 'none', 'font-family': "Calibri", fontSize: "14px", textAlign: "center" },
                          // custom style for the table footer
                          tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px" }
                        }, {
                          type: 'text',
                          value: `<table><tr style="line-height:5px; font-size: 16px;">
                          <td colspan=2 style="text-align:center; font-family:Calibri"><strong>*** Payment Received ***</strong></td>
                          </tr>
                          <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                          <td colspan=2 style="text-align:center; font-family:Calibri"><strong>Thank you</strong></td>
                          </tr>
                          </table>`,
                          style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                        }
                      ]

                      ipcRenderer.invoke('TokenPrint', data, options);
                    }

                    if (tokengrouplist.length > 0) {
                      let CustomerTokenGroupName = Array.from(new Set(tokengrouplist.map(s => s.CustomerTokenGroupName))).map(CustomerTokenGroupName => {
                        return CustomerTokenGroupName
                      })

                      for (var i in CustomerTokenGroupName) {
                        debugger
                        let CustomerTokenGroupname = CustomerTokenGroupName[i];
                        let KOTFilteredList = tokengrouplist.filter(x => x.CustomerTokenGroupName == CustomerTokenGroupname)
                        var ItemArray = KOTFilteredList.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
                        SaleValues = ItemArray.map(Object.values);

                        let BillNoCount = []
                        BillNoCount = BillNo

                        //TokenPrinterService printer function
                        options = {
                          preview: false,
                          margin: '-174px  24px -3px -10px',
                          copies: 1,
                          silent: true,
                          width: 100,
                          printerName: PrinterName,
                          timeOutPerLine: 400,
                          pageSize: '80mm' // page size


                        }

                        data = [
                          {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          },
                          {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          }, {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          }, {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          }, {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          }, {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          }, {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          },
                          {
                            type: 'image',
                            path: rootPath() + '/assets/images/logo.png',
                            position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                            width: '220px',                                           // width of image in px; default: auto
                            height: '70px',                                          // width of image in px; default: 50 or '50px'
                          },
                          {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "Customer Token - DineIn(S)",
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          },
                          {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "Date : " + SaleDate + " - " + BillTime,
                            style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                          },
                          {
                            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: `<table>
                            <tr style=" line-height:5px; font-size: 20px; border-bottom:1px dotted;">
                            <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong>Bill No : ${BillNoCount}</strong></td>
                            </tr>
                             <tr style=" font-size: 18px; border-bottom:1px dotted;">
                          <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong>${CustomerTokenGroupname}</strong></td>
                          </tr></table>`,
                            style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                          }, {
                            type: 'table',
                            // style the table
                            style: { 'border-bottom': '1px dashed', 'border-bottom': '1px dashed' },
                            // list of the columns to be rendered in the table header
                            tableHeader: ['ItemName', 'Qty'],
                            // multi dimensional array depicting the rows and columns of the table body
                            tableBody: SaleValues,
                            // list of columns to be rendered in the table footer
                            // tableFooter: ,
                            // custom style for the table header
                            tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "18px", },
                            // custom style for the table body
                            // tableRowStyle: { 'border-bottom': 'none' },
                            tableBodyStyle: { border: 'none', 'font-family': "Calibri", fontSize: "14px", textAlign: "center" },
                            // custom style for the table footer
                            tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px", },
                          }, {
                            type: 'text',
                            value: `<table><tr style="line-height:5px; font-size: 16px;">
                            <td colspan=2 style="text-align:center; font-family:Calibri"><strong>*** Payment Received ***</strong></td>
                            </tr>
                            <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                            <td colspan=2 style="text-align:center; font-family:Calibri"><strong>Thank you</strong></td>
                            </tr>
                            </table>`,
                            style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                          }
                        ]

                        ipcRenderer.invoke('TokenPrint', data, options);
                      }
                    }

                  }
                  else if (IsAllowCustomerTokenGrouping == 0) {
                    for (let i = 0; i < SaleItemdetails.length; i++) {
                      ItemName = SaleItemdetails[i].ItemName
                      Quantity = SaleItemdetails[i].DisplayQuantity
                      let BillNoCount = []
                      BillNoCount = BillNo + ' # ' + (i + 1)

                      //TokenPrinterService printer function
                      options = {
                        preview: false,
                        margin: '-174px  24px -3px -10px',
                        copies: 1,
                        silent: true,
                        width: 100,
                        printerName: PrinterName,
                        timeOutPerLine: 400,
                        pageSize: '80mm' // page size


                      }

                      data = [
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        }, {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "-",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'image',
                          path: rootPath() + '/assets/images/logo.png',
                          position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                          width: '220px',                                           // width of image in px; default: auto
                          height: '70px',                                          // width of image in px; default: 50 or '50px'
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "Customer Token - DineIn(S)",
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: "Date : " + SaleDate + " - " + BillTime,
                          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: `<table>
                          <tr style=" line-height:5px; font-size: 20px; border-bottom:1px dotted;">
                          <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong>Bill No : ${BillNoCount}</strong></td>
                          
                       
                          </tr>
                          <tr style="font-size: 20px;border-bottom:1px dotted">
                          <td style="text-align:left;font-family:Calibri; max-width: 180px;"><strong>${ItemName}</strong></td>
                          <td style="text-align:right; font-family:Calibri"><strong>${Quantity}</strong></td>
                          </tr>
                           <tr style="line-height:5px; font-size: 16px;">
                          <td colspan=2 style="text-align:center; font-family:Calibri"><strong>*** Payment Received ***</strong></td>
                          </tr>
                          <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                          <td colspan=2 style="text-align:center; font-family:Calibri"><strong>Thank you</strong></td>
                          </tr>
                          </table>`,
                          style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                        }
                      ]

                      ipcRenderer.invoke('TokenPrint', data, options);
                    }
                  }

                }

                resolve('success')
              }
              , (error) => {
                ErrorLog.writeLogFile('getSaleBillItemDetailsForToken', error)

              }
            ).catch((error) => {
              ErrorLog.writeLogFile('getSaleBillItemDetailsForToken', error)
            })
          }
        ).catch((error) => {
          ErrorLog.writeLogFile('getSaleBillDetails', error)
          reject(error)
        })
      })
    }
    else if (SaleHeaderId == 0) {
      return new Promise(function (resolve, reject) {
        debugger
        let SaleDetailList = KOTDetails.ItemArray
        let serverDate = KOTDetails.Date
        let serverDateArr = serverDate.split('-')
        let displayyear = serverDateArr[2].slice(-2)
        SaleDate = serverDateArr[0] + "/" + serverDateArr[1] + "/" + displayyear
        // SaleDate = KOTDetails.Date
        BillTime = KOTDetails.Time
        TableNo = KOTDetails.TableNo
        SeatNo = KOTDetails.SeatNo
        WaiterName = KOTDetails.WaiterName
        CaptainName = KOTDetails.cashierName
        ServiceType = KOTDetails.ServiceType
        if (IsEnableWaiterToken == 1 && ServiceType == "Dine-In") {
          debugger
          SaleValues = SaleDetailList.map(Object.values);
          let options = {
            preview: false,
            margin: '-190px 24px -3px -10px',
            copies: 1,
            silent: true,
            width: 100,
            printerName: PrinterName,
            timeOutPerLine: 400,
            pageSize: '80mm' // page size

          }

          let data = [
            // {
            //   type: 'image',
            //   path: rootPath() + '/assets/images/logo.png',
            //   position: 'center',                                  // position of image: 'left' | 'center' | 'right'
            //   width: '220px',                                           // width of image in px; default: auto
            //   height: '70px',                                          // width of image in px; default: 50 or '50px'
            // },
            {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "-",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            },
            {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: "Waiter Token",
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            },
            {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: BillCounterName + ' : ' + TableNo + ' - ' + SeatNo,
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            },
            {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: WaiterName,
              style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            },
            {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: `<table>
              <tr style=" line-height:5px; font-size: 16px; border-bottom:1px dotted;">
              <td style="text-align:left; border-top:1px dotted; font-family:Calibri">Date : ${SaleDate}</td>
              <td style="text-align:right; border-top:1px dotted; font-family:Calibri">@${BillTime}</td>
              </tr>

              </table>`,
              style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
            },
            {
              type: 'table',
              // style the table
              style: { 'border-bottom': '1px dashed', 'border-bottom': '1px dashed' },
              // list of the columns to be rendered in the table header
              //    tableHeader: ['', ''],
              // multi dimensional array depicting the rows and columns of the table body
              tableBody: SaleValues,
              // list of columns to be rendered in the table footer
              // tableFooter: ,
              // custom style for the table header
              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "16px", },
              // custom style for the table body
              // tableRowStyle: { 'border-bottom': 'none' },
              tableBodyStyle: { border: 'none', fontWeight: "700", 'font-family': "Calibri", fontSize: "14px", textAlign: "left" },
              // custom style for the table footer
              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px", },
            },
            {
              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
              value: "Captain :" + " " + CaptainName,
              style: { textAlign: 'left', fontSize: "15px" }
            }
          ]
          ipcRenderer.invoke('TokenPrint', data, options);
          resolve('success')
        }
        // else if (IsEnableCustomerToken == 1 && ServiceType == "DineIn-Self Service") {

        //   for (let i = 0; i < SaleDetailList.length; i++) {
        //     ItemName = SaleDetailList[i].ItemName
        //     Quantity = SaleDetailList[i].DisplayQuantity
        //     let BillNoCount = []
        //     BillNoCount =  ' Item # ' + (i + 1)

        //     //TokenPrinterService printer function
        //     let options = {
        //       preview: true,
        //       margin: '-174px  24px -3px -10px',
        //       copies: 1,
        //       silent: true,
        //       width: 100,
        //       printerName: PrinterName,
        //       timeOutPerLine: 400,
        //       pageSize: '80mm' // page size


        //     }

        //     let data = [
        //       {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       },
        //       {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       }, {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       }, {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       }, {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       }, {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       }, {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "-",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       },
        //       {
        //         type: 'image',
        //         path: rootPath() + '/assets/images/logo.png',
        //         position: 'center',                                  // position of image: 'left' | 'center' | 'right'
        //         width: '220px',                                           // width of image in px; default: auto
        //         height: '70px',                                          // width of image in px; default: 50 or '50px'
        //       },
        //       {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "Customer Token - DineIn(S)",
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       },
        //       {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: "Date : " + SaleDate + " - " + BillTime,
        //         style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        //       },
        //       {
        //         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        //         value: `<table>
        //         <tr style=" line-height:5px; font-size: 20px; border-bottom:1px dotted;">
        //         <td colspan=2 style="text-align:center; border-top:1px dotted; font-family:Calibri"><strong> ${BillNoCount}</strong></td>


        //         </tr>
        //         <tr style="font-size: 20px;border-bottom:1px dotted">
        //         <td style="text-align:left;font-family:Calibri; max-width: 180px;"><strong>${ItemName}</strong></td>
        //         <td style="text-align:right; font-family:Calibri"><strong>${Quantity}</strong></td>
        //         </tr>
        //         <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
        //         <td colspan=2 style="text-align:center; font-family:Calibri"><strong>Thank you</strong></td>
        //         </tr>
        //         </table>`,
        //         style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
        //       },
        //     ]


        //     ipcRenderer.invoke('TokenPrint', data, options);
        //   }
        //   resolve('success')
        // }
        else if (IsEnableWaiterToken == 0) {
          reject('IsEnableWaiterToken  disabled')
        }
      })
    }
  }


}





module.exports = new TokenPrinterService();
