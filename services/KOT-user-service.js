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


let BillTime;
let SaleDate;
let ItemName;
let Quantity;
let POSPrinterName;
let BillCounterName;
let TableNo;
let SeatNo;
let WaiterName;
let IsTakeAway;
let SaleValues;
let KOTFilteredTakeAwayList = [];
let KOTFilteredList = [];
let KOTFilteredNonTakeAwayList = [];
let OrderNoCount;
let BillingdbService = require('../database/billingdb');



class KOTUserPrinterService {


  async KOTItemsPrinter(SaleItemdetails, KOTDetails, POSPrinterName, IsTakeAway) {
    debugger
    return new Promise(function (resolve, reject) {
      debugger
      // SaleDate = KOTDetails.Date

      let serverDate = KOTDetails.Date
      let serverDateArr = serverDate.split('-')
      let displayyear = serverDateArr[2].slice(-2)
      SaleDate = serverDateArr[0] + "/" + serverDateArr[1] + "/" + displayyear
      BillTime = KOTDetails.Time
      TableNo = KOTDetails.TableNo
      SeatNo = KOTDetails.SeatNo
      WaiterName = KOTDetails.WaiterName
      BillCounterName = KOTDetails.BillCounterName
      // ItemName = KOTDetails.ItemName
      // Quantity = KOTDetails.Quantity + ' ' + KOTDetails.UOM

      let POSSaleIds = Array.from(new Set(SaleItemdetails.map(s => s.POSSaleId))).map(POSSaleId => {
        return POSSaleId
      })
      // for (var i in printername) {
      //   let POSPrinterName = printername[i];
      //   KOTFilteredList = SaleItemdetails.filter(x => x.PrinterName == POSPrinterName)
      //   KOTFilteredTakeAwayList = KOTFilteredList.filter(x => x.IsTakeAway == 1)
      //   KOTFilteredNonTakeAwayList = KOTFilteredList.filter(x => x.IsTakeAway == 0)
      //   if (KOTFilteredNonTakeAwayList.length != 0) {


      var ItemArray = SaleItemdetails.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
      SaleValues = ItemArray.map(Object.values);

      let OrderNoCount = []
      //OrderNoCount = "Order No:" + ' # ' + (i + 1)
      OrderNoCount = "Order No:" + ' # ' + 1

      //POSPrinterName = KOTDetails.POSPrinterName
      // IsTakeAway = KOTDetails.IsTakeAway
      // OrderNoCount = KOTDetails.OrderNoCount

      const options = {
        preview: false,
        margin: '-174px 24px -3px -10px',
        copies: 1,
        silent: true,
        width: 100,
        printerName: POSPrinterName,
        timeOutPerLine: 400,
        pageSize: '80mm' // page size

      }

      const data = [
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
          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          value: "KOT",
          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        },
        {
          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          value: BillCounterName + ' : ' + TableNo + ' - ' + SeatNo,
          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        },
        {
          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          value: IsTakeAway == 0 ? '' : "Take Away",
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
            <tr style=" line-height:5px;  border-bottom:1px dotted;">
            <td style="text-align:left; font-size: 16px; border-top:1px dotted; font-family:Calibri">Date : ${SaleDate} </td>
            <td style="text-align:right; font-size: 16px; border-top:1px dotted; font-family:Calibri">@${BillTime}</td>
            </tr>
            </table>`,
          style: { fontSize: "12px", 'font-family': "Calibri" }
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
          tableBodyStyle: { border: 'none', 'font-family': "Calibri", fontSize: "16px", textAlign: "left", fontWeight: "700" },
          // custom style for the table footer
          tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px", },
        },
        {
          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          value: `<table>
             <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
            <td colspan="2" style="text-align:center; font-family:Calibri">${OrderNoCount}</td>
            </tr>
            </table>`,
          style: { fontSize: "12px", 'font-family': "Calibri" }
        },{
          type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          value: "*** KITCHEN USE ONLY ***",
          style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
        },
      ]
      ipcRenderer.invoke('KOTTokenPrint', data, options).then((res) => {
        debugger
        resolve("Success")
      }).catch((err) => {
        debugger
        reject(err)

      });
      // }

      // if (KOTFilteredTakeAwayList.length != 0) {


      //   var ItemArray = KOTFilteredTakeAwayList.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
      //   SaleValues = ItemArray.map(Object.values);

      //   let OrderNoCount = []
      //   OrderNoCount = "Order No:" + ' # ' + (i + 1)


      //   //POSPrinterName = KOTDetails.POSPrinterName
      //   // IsTakeAway = KOTDetails.IsTakeAway
      //   // OrderNoCount = KOTDetails.OrderNoCount

      //   const options = {
      //     preview: true,
      //     margin: '-174px 24px -3px -10px',
      //     copies: 1,
      //     silent: true,
      //     width: 100,
      //     printerName: POSPrinterName,
      //     timeOutPerLine: 400,
      //     pageSize: '80mm' // page size

      //   }

      //   const data = [
      //     // {
      //     //   type: 'image',
      //     //   path: rootPath() + '/assets/images/logo.png',
      //     //   position: 'center',                                  // position of image: 'left' | 'center' | 'right'
      //     //   width: '220px',                                           // width of image in px; default: auto
      //     //   height: '70px',                                          // width of image in px; default: 50 or '50px'
      //     // },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     }, {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     }, {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     }, {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     }, {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     }, {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "-",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "KOT",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: BillCounterName + ' : ' + TableNo + ' - ' + SeatNo,
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: "Take Away",
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: WaiterName,
      //       style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: `<table>
      //       <tr style=" line-height:5px;  border-bottom:1px dotted;">
      //       <td style="text-align:left; font-size: 16px; border-top:1px dotted; font-family:Calibri">Date : ${SaleDate} </td>
      //       <td style="text-align:right; font-size: 16px; border-top:1px dotted; font-family:Calibri">@${BillTime}</td>
      //       </tr>
      //       </table>`,
      //       style: { fontSize: "12px", 'font-family': "Calibri" }
      //     },
      //     {
      //       type: 'table',
      //       // style the table
      //       style: { 'border-bottom': '1px dashed', 'border-bottom': '1px dashed' },
      //       // list of the columns to be rendered in the table header
      //       //    tableHeader: ['', ''],
      //       // multi dimensional array depicting the rows and columns of the table body
      //       tableBody: SaleValues,
      //       // list of columns to be rendered in the table footer
      //       // tableFooter: ,
      //       // custom style for the table header
      //       tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "16px", },
      //       // custom style for the table body
      //       // tableRowStyle: { 'border-bottom': 'none' },
      //       tableBodyStyle: { border: 'none', 'font-family': "Calibri", fontSize: "16px", textAlign: "left", fontWeight: "700" },
      //       // custom style for the table footer
      //       tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px", },
      //     },
      //     {
      //       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      //       value: `<table>
      //        <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
      //       <td colspan="2" style="text-align:center; font-family:Calibri">${OrderNoCount}</td>
      //       </tr>
      //       </table>`,
      //       style: { fontSize: "12px", 'font-family': "Calibri" }
      //     }
      //   ]
      //   ipcRenderer.invoke('KOTTokenPrint', data, options).catch((err) => {
      //     reject(err)
      //   });
      // }


    })
    //   })

  }



}


module.exports = new KOTUserPrinterService();
