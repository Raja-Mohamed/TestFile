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
let SaleValues;
let ServiceType;
let BillCounterName;
let TableNo;
let SeatNo;
let RefNo;
let WaiterName;
let IsWebOrders;
let IsTakeAway
let BillingdbService = require('../database/billingdb');



class KOTPrinterService {


  getSaleBilldetail(SaleHeaderId) {
    debugger
    let item = {
      SaleHeaderId: SaleHeaderId
    }
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
          //  SaleDate = SaleBilldetails[0].SaleDate
          BillTime = SaleBilldetails[0].BillTime
          TableNo = SaleBilldetails[0].TableNo
          IsTakeAway = SaleBilldetails[0].IsTakeAway
          ServiceType = SaleBilldetails[0].ServiceType
          SeatNo = SaleBilldetails[0].SeatNo
          WaiterName = SaleBilldetails[0].WaiterName
          BillTokenNo = SaleBilldetails[0].BillTokenNo
          BillCounterName = store.get('BillCounterName')
          IsWebOrders = SaleBilldetails[0].IsWebOrders
          RefNo = SaleBilldetails[0].RefNo

          BillingdbService.getSaleBillItemDetailsForKOT(item).then(
            (result) => {
              debugger
              SaleItemdetails = result
              let KOTPrintersList = store.get('KOTPrintersList')
              let PrinterName = store.get('PrinterName')
              let KOTGroupList;
              let itemGroupId;

              for (let i = 0; i < SaleItemdetails.length; i++) {
                itemGroupId = SaleItemdetails[i].ItemGroupId
                KOTGroupList = KOTPrintersList.find(x => x.ItemGroupId == itemGroupId)
                if (KOTGroupList != undefined) {
                  SaleItemdetails[i].PrinterName = KOTGroupList.PrinterName
                  SaleItemdetails[i].IpAddress = KOTGroupList.IpAddress
                } else {
                  if (PrinterName == "") {
                    Swal.fire(
                      'warning..!',
                      'Please Configure printer Settings..!',
                      'warning'
                    )
                  } else {
                    SaleItemdetails[i].PrinterName = PrinterName
                    SaleItemdetails[i].IpAddress = 0
                  }

                }
                // SaleItemdetails[i].PrinterName = KOTGroupList.PrinterName
                // SaleItemdetails[i].IpAddress = KOTGroupList.IpAddress
              }
              //  var ItemArray=SaleItemdetails.map(( {ItemName,DisplayQuantity} ) =>  ({DisplayQuantity,ItemName}) )
              //   console.log(ItemArray)

              let printername = Array.from(new Set(SaleItemdetails.map(s => s.PrinterName))).map(PrinterName => {
                return PrinterName
              })
              // var printername = SaleItemdetails.map(({ PrinterName }) => ({ PrinterName }))

              //console.log(printername)
              // for (var i in printername) {

              // let POSPrinterName = printername[i].PrinterName;
              // let KOTFilterListTakeAway = SaleItemdetails.filter(x => x.PrinterName == POSPrinterName)

              if (ServiceType == "Dine-In") {

              //  console.log(printername)
                for (var i in printername) {
                  let POSPrinterName = printername[i];
                  let KOTFilteredList = SaleItemdetails.filter(x => x.PrinterName == POSPrinterName)
                  var ItemArray = KOTFilteredList.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
                  SaleValues = ItemArray.map(Object.values);
                  // for (let i = 0; i < SaleItemdetails.length; i++) {
                  //   debugger
                  //   let ItemName = SaleItemdetails[i].ItemName
                  let OrderNoCount = []
                  OrderNoCount = "Order No:" + ' # ' + 1
                  //   let Quantity = SaleItemdetails[i].DisplayQuantity
                  //   let POSPrinterName = SaleItemdetails[i].PrinterName

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
                      value: IsTakeAway == 1 ? "Take Away" : '',
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
                      tableBodyStyle: { border: 'none', 'font-family': "Calibri", fontSize: "12px", textAlign: "left" },
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
                    }
                  ]
                  ipcRenderer.invoke('KOTTokenPrint', data, options);

                  // }
                }

              }
              else if (ServiceType == "Take Away" || IsWebOrders == 1) {
                debugger
                for (var i in printername) {
                  let POSPrinterName = printername[i];
                  let KOTFilteredList = SaleItemdetails.filter(x => x.PrinterName == POSPrinterName)
                  var ItemArray = KOTFilteredList.map(({ ItemName, DisplayQuantity }) => ({ ItemName, DisplayQuantity }))
                  SaleValues = ItemArray.map(Object.values);
                  // for (let i = 0; i < SaleItemdetails.length; i++) {
                  //   debugger
                  //   let ItemName = SaleItemdetails[i].ItemName
                  let OrderNoCount = []
                  // OrderNoCount = "Order No:" + ' # ' + (i + 1) 
                  OrderNoCount = "Order No:" + ' # ' + 1
                  //   let Quantity = SaleItemdetails[i].DisplayQuantity
                  //   let POSPrinterName = SaleItemdetails[i].PrinterName

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
                      value: "KOT",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: BillCounterName,
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
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: ServiceType + " Ref # " + RefNo,
                      style: { fontWeight: "700", fontSize: "22px", textAlign: "center", 'font-family': "Calibri" }
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
                      tableBodyStyle: { border: 'none', 'font-family': "Calibri", fontSize: "16px", textAlign: "left", fontWeight: "700" },
                      // custom style for the table footer
                      tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "16px", },
                    }, {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: `<table>
                          <tr style="line-height:5px; font-size: 16px;border-bottom:1px dotted">
                          <td colspan="2" style="text-align:center; font-family:Calibri"> ${OrderNoCount}</td>
                          </tr>                    
                          </table>`,
                      style: { fontSize: "12px", textAlign: "right", 'font-family': "Calibri" }
                    },
                    {
                      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                      value: "*** KITCHEN USE ONLY ***",
                      style: { fontWeight: "700", fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
                    }
                  ]
                 // console.log(data)
                  ipcRenderer.invoke('KOTTokenPrint', data, options);

                  //}


                }
                resolve("Success")
              }



            }).catch((error) => {
              ErrorLog.writeLogFile('getSaleBillItemDetailsForKOT', error)
            })
        }
      ).catch((error) => {
        ErrorLog.writeLogFile('getSaleBillItemDetailsForKOT', error)
        reject(error)
      })
    })
  }


}





module.exports = new KOTPrinterService();
