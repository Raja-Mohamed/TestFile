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
let Title;
let SubTitle;
let Address;
let Greetings;
let BillCounterLogoPath;
let BillNo;
let BillTime;
let BillString;
let GSTNo;
let RefNo;
let CookingInstruction;
let PhoneNo;
let CaptainName;
let CustomerName;
let ServiceType;
let tableseatNo;
let TableNo;
let SeatNo;
let BillTokenNo;
let WaiterName;
let SaleDate;
let SaleItemdetails = [];
let SaleItemGSTdetails = [];
let BillTotalAmount;
let BillGSTAmount;
let BillRoundOff;
let BillNetAmount;
let CashAmount;
let CardAmount;
let PaytmAmount;
let SaleValues;
let SaleGSTValues;
let TotalItemsCount;
let IsWebOrders;
let BillingdbService = require('../database/billingdb');

class PrinterService {

  getBillCounterdetail(SaleHeaderId, view) {
    // console.log(SaleHeaderId)
    debugger
    let Item = {
      BillCounterId: store.get('BillCounterId')
    }
    let PrinterName = store.get('PrinterName')
    if (PrinterName == "" && view != 1) {

      Swal.fire(
        'warning..!',
        'Please Configure printer Settings..!',
        'warning'
      )
      reject("printer not Configured")

    } else {

      return new Promise(function (resolve, reject) {

        BillingdbService.getBillCounterDetails(Item).then(
          (Data) => {
            debugger
            let BillCounterdetails = Data
            //CompanyName = BillCounterdetails[0].BillCounterName
            Title = BillCounterdetails[0].Title
            SubTitle = BillCounterdetails[0].SubTitle
            Address = BillCounterdetails[0].Address
            Greetings = BillCounterdetails[0].Greetings
            BillCounterLogoPath = BillCounterdetails[0].BillCounterLogoPath

            let item = {
              SaleHeaderId: SaleHeaderId
            }
            BillingdbService.getSaleBillDetails(item).then(
              (Data) => {
                debugger
                let SaleBilldetails = Data
                BillNo = SaleBilldetails[0].BillNo
                CustomerName = SaleBilldetails[0].CustomerName
                ServiceType = SaleBilldetails[0].ServiceType
                WaiterName = SaleBilldetails[0].WaiterName
                CaptainName = SaleBilldetails[0].CashierName
                SeatNo = SaleBilldetails[0].SeatNo
                TableNo = SaleBilldetails[0].TableNo
                BillTokenNo = SaleBilldetails[0].BillTokenNo
                GSTNo = SaleBilldetails[0].GSTNo
                PhoneNo = SaleBilldetails[0].PhoneNo
                RefNo = SaleBilldetails[0].RefNo
                CookingInstruction = SaleBilldetails[0].CookingInstruction
                SaleDate = SaleBilldetails[0].SaleDate
                BillTime = SaleBilldetails[0].BillTime
                BillString = SaleBilldetails[0].BillString;
                BillTotalAmount = SaleBilldetails[0].TotalAmount;
                BillGSTAmount = SaleBilldetails[0].TotalTax;
                BillRoundOff = SaleBilldetails[0].RoundOff;
                BillNetAmount = SaleBilldetails[0].NetAmount;
                CashAmount = SaleBilldetails[0].CashAmount;
                CardAmount = SaleBilldetails[0].CardAmount;
                PaytmAmount = SaleBilldetails[0].OnlineAmount;
                tableseatNo = TableNo + '-' + SeatNo
                IsWebOrders = SaleBilldetails[0].IsWebOrders;

                BillingdbService.getSaleBillItemDetails(item).then(
                  (Data) => {
                    debugger

                    SaleItemdetails = Data
                    SaleValues = SaleItemdetails.map(Object.values);
                    TotalItemsCount = SaleValues.length

                    BillingdbService.getBillGSTDetails(item).then(
                      (Data) => {
                        debugger

                        SaleItemGSTdetails = Data
                        let nonCessSaleItemGSTdetails = SaleItemGSTdetails.filter(x => x.TaxPercentage != "0.00")
                        SaleGSTValues = nonCessSaleItemGSTdetails.map(Object.values)
                        let data;

                        const options = {
                        //  preview: true,
                           preview: view == 1 ? true : false,
                          // margin: '-25px 24px -4px -10px', // old left align
                          margin: '-25px 24px -4px -5px', // new left align by palani
                          width: 100,
                          copies: 1,
                          silent: true,
                          printerName: PrinterName,
                          timeOutPerLine: 400,
                          //pageSize: { height: 301000, width: 71000 }  // page size 
                          pageSize: '80mm' // page size
                        }
                        if (ServiceType == "Dine-In" || ServiceType == "DineIn-Self Service") {

                          data = [
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: "-",
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'image',
                              path: rootPath() + '/assets/images/logo.png',
                              position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                              width: '250px',                                           // width of image in px; default: auto
                              height: '80px',                                          // width of image in px; default: 50 or '50px'
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Title,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: SubTitle,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Address,
                              style: { fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: BillString,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none; line-height:5px;">
                          <td style="text-align:left;font-family:Calibri; font-size: 17px;" colspan="2"><strong> BillNo: ${BillNo}</strong></td>
                          </tr>
                          <tr style="border-style:none; line-height:5px">
                          <td style="text-align:left; font-family:Calibri">Date: ${SaleDate}</td>
                          <td style="text-align:right;font-family:Calibri">Time:  ${BillTime}</td>
                          </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri; max-width: 125px;">Name: ${CustomerName}</td>
                          <td style="text-align:right;font-family:Calibri">GST: ${GSTNo} </td>
                          </tr>
                          <tr style="border-style:none;line-height:5px">
                          <td style="text-align:left;font-family:Calibri;">PhoneNo: ${PhoneNo}</td>
                         <td style="text-align:right;font-family:Calibri"></td>
                         </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri;font-size: 16px"><strong>TableNo: ${tableseatNo}</strong> </td>
                         <td style="text-align:right;font-family:Calibri">Waiter: ${WaiterName}</td>
                         </tr>
                         </table>`,
                              style: { textAlign: "right", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: ServiceType,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: ['Particular', 'Qty', 'Rate', 'Amount'],
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Arial ", fontSize: "16px", },
                              // custom style for the table body
                              // tableRowStyle: { 'border-bottom': 'none' },
                              tableBodyStyle: { border: 'none', 'font-family': "Arial ", fontSize: "14px", fontWeight: "700" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Arial ", fontSize: "16px" },
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none;line-height:10px">
                          <td style="text-align:left;font-family:Calibri"> Total Items: ${TotalItemsCount}</td>
                          <td style="text-align:right;font-family:Calibri">Sub Total</td>
                          <td style="text-align:right;font-family:Calibri">${BillTotalAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Total Tax </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillGSTAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Round Off </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillRoundOff}</td>
                          </tr>
                          <tr style="border-style:none;line-height:5px">
                          <td style="text-align:center;font-family:Calibri; font-size:20px" colspan="3"><strong>TOTAL ${BillNetAmount}/-  </strong></td>
                          </tr>
                          </table><br/>`,
                              style: { textAlign: 'center', fontSize: "20px" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount + "&emsp; " + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount != 0 ? " Card" + ": " + CardAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount == 0 ? "Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount == 0 && PaytmAmount != 0 ? "Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: '&nbsp;',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: SaleGSTValues.length > 0 ? ['TaxType', 'HSN/SAC', 'Tax %', 'Tax Amount'] : '',
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleGSTValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableFooter: SaleGSTValues.length > 0 ? ['', 'TOTAL TAX', '', BillGSTAmount] : '',

                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px", },
                              // custom style for the table body
                              tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px" },
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: "Captain :" + " " + CaptainName,
                              style: { textAlign: 'left', fontSize: "15px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: Greetings,
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                            }
                          ]
                        }
                        else if (ServiceType == "Take Away") {
                          debugger

                          data = [
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: "-",
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'image',
                              path: rootPath() + '/assets/images/logo.png',
                              position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                              width: '250px',                                           // width of image in px; default: auto
                              height: '80px',                                          // width of image in px; default: 50 or '50px'
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Title,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: SubTitle,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Address,
                              style: { fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: BillString,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none; line-height:5px;">
                          <td style="text-align:left; font-family:Calibri; font-size: 17px;" colspan="2"><strong> BillNo: ${BillNo}</strong></td>
                          </tr>
                          <tr style="border-style:none; line-height:5px">
                          <td style="text-align:left; font-family:Calibri">Date: ${SaleDate}</td>
                          <td style="text-align:right;font-family:Calibri">Time:  ${BillTime}</td>
                          </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri;max-width: 125px;">Name: ${CustomerName}</td>
                          <td style="text-align:right;font-family:Calibri">GST: ${GSTNo} </td>
                          </tr>
                           <tr style="border-style:none;">
                           <td style="text-align:left;font-family:Calibri;">PhoneNo: ${PhoneNo}</td>
                           <td style="text-align:right;font-family:Calibri;font-size: 14px; "><strong>RefNo: ${RefNo} </strong></td>
                           </tr>
                           <tr style="border-style:none;">
                           <td style="text-align:left; font-size: 14px; font-family:Calibri"><strong>Token No : ${BillTokenNo} </strong></td>
                         <td style="text-align:right; font-size: 14px; font-family:Calibri">Waiter: ${WaiterName}</td>
                         </tr>
                          </table>`,
                              style: { fontSize: "16px", textAlign: "right", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: ServiceType,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: ['Particular', 'Qty', 'Rate', 'Amount'],
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Arial", fontSize: "16px", },
                              // custom style for the table body
                              // tableRowStyle: { 'border-bottom': 'none' },
                              tableBodyStyle: { border: 'none', 'font-family': "Arial", fontSize: "14px", fontWeight: "700" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Arial", fontSize: "16px" },
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none;line-height:10px">
                          <td style="text-align:left;font-family:Calibri"> Total Items: ${TotalItemsCount}</td>
                          <td style="text-align:right;font-family:Calibri">Sub Total</td>
                          <td style="text-align:right;font-family:Calibri">${BillTotalAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Total Tax </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillGSTAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Round Off </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillRoundOff}</td>
                          </tr>
                          <tr style="border-style:none;line-height:5px">
                          <td style="text-align:center;font-family:Calibri; font-size:20px" colspan="3"><strong>TOTAL ${BillNetAmount}/-  </strong></td>
                          </tr>
                          </table><br/>`,
                              style: { textAlign: 'center', fontSize: "20px" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount + "&emsp; " + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount != 0 ? " Card" + ": " + CardAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount == 0 ? "Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount == 0 && PaytmAmount != 0 ? "Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: '&nbsp;',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: SaleGSTValues.length > 0 ? ['TaxType', 'HSN/SAC', 'Tax %', 'Tax Amount'] : '',
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleGSTValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableFooter: SaleGSTValues.length > 0 ? ['', 'TOTAL TAX', '', BillGSTAmount] : '',

                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px" },
                              // custom style for the table body
                              tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px" },
                            }, {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: "Captain :" + " " + CaptainName,
                              style: { textAlign: 'left', fontSize: "15px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: Greetings,
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                            }
                          ]
                        }
                        else if (IsWebOrders == 1) {
                          debugger
                          let rowDivStart = `<table style="border-style:none; font-size: 12px;">
                                          <tr style="border-style:none; line-height:5px;">
                                          <td style="text-align:left;font-family:Calibri; font-size: 17px;" colspan="2"><strong> BillNo: ${BillNo}</strong></td>
                                          </tr>
                                          <tr style="border-style:none; line-height:5px">
                                          <td style="text-align:left; font-family:Calibri">Date: ${SaleDate}</td>
                                          <td style="text-align:right;font-family:Calibri">Time:  ${BillTime}</td>
                                          </tr>`

                          let rowDivEnd = ` <tr style="border-style:none;">
                                    <td style="text-align:left;font-family:Calibri; max-width: 125px;" >Name: ${CustomerName}</td>
                                    <td style="text-align:right;font-family:Calibri">GST: ${GSTNo} </td>
                                    </tr>
                                    <tr style="border-style:none;">
                                      <td style="text-align:left;font-family:Calibri;" >PhoneNo: ${PhoneNo}</td>
                                      <td style="text-align:right;font-family:Calibri;font-size: 14px; "><strong>RefNo: ${RefNo} </strong></td>
                                    </tr>
                                    <tr style="border-style:none;">
                                       <td style="text-align:left;font-family:Calibri;  font-size: 14px;"><strong>Token No : ${BillTokenNo}</strong> </td>
                                    </tr>
                              </table>`

                          data = [
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: "-",
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'image',
                              path: rootPath() + '/assets/images/logo.png',
                              position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                              width: '250px',                                           // width of image in px; default: auto
                              height: '80px',                                          // width of image in px; default: 50 or '50px'
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Title,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: SubTitle,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Address,
                              style: { fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: BillString,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: rowDivStart + rowDivEnd,
                              style: { fontSize: "16px", textAlign: "right", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: ServiceType,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: ['Particular', 'Qty', 'Rate', 'Amount'],
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Arial", fontSize: "16px", },
                              // custom style for the table body
                              // tableRowStyle: { 'border-bottom': 'none' },
                              tableBodyStyle: { border: 'none', 'font-family': "Arial", fontSize: "14px", fontWeight: "700" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Arial", fontSize: "16px", },
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: `<table style="border-style:none; font-size: 12px; ">
                            <tr style="border-style:none;line-height:10px">
                            <td style="text-align:left;font-family:Calibri"> Total Items: ${TotalItemsCount}</td>
                            <td style="text-align:right;font-family:Calibri">Sub Total</td>
                            <td style="text-align:right;font-family:Calibri">${BillTotalAmount}</td>
                            </tr>
                            <tr  style="border-style:none;line-height:5px">
                            <td></td>
                            <td style="text-align:right;font-family:Calibri">Total Tax </td>
                            <td style="text-align:right;font-family:Calibri"> ${BillGSTAmount}</td>
                            </tr>
                            <tr  style="border-style:none;line-height:5px">
                            <td></td>
                            <td style="text-align:right;font-family:Calibri">Round Off </td>
                            <td style="text-align:right;font-family:Calibri"> ${BillRoundOff}</td>
                            </tr>
                            <tr style="border-style:none;line-height:5px">
                            <td style="text-align:center;font-family:Calibri; font-size:20px" colspan="3"><strong>TOTAL ${BillNetAmount}/-  </strong></td>
                            </tr>
                            </table><br/>`,
                              style: { textAlign: 'center', fontSize: "20px" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount + "&emsp; " + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount != 0 ? " Card" + ": " + CardAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount == 0 ? "Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount == 0 && PaytmAmount != 0 ? "Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: '&nbsp;',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: SaleGSTValues.length > 0 ? ['TaxType', 'HSN/SAC', 'Tax %', 'Tax Amount'] : '',
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleGSTValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableFooter: SaleGSTValues.length > 0 ? ['', 'TOTAL TAX', '', BillGSTAmount] : '',

                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px", },
                              // custom style for the table body
                              tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px", },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px", },
                            }, {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: "Captain :" + " " + CaptainName,
                              style: { textAlign: 'left', fontSize: "15px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: CookingInstruction == '' ? '' : "<strong>Cooking Instruction:</strong>" + " " + CookingInstruction,
                              style: { textAlign: 'left', fontSize: "15px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: Greetings,
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                            }
                          ]
                        }
                        else if (ServiceType == "Catering") {
                          data = [
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: "-",
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'image',
                              path: rootPath() + '/assets/images/logo.png',
                              position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                              width: '250px',                                           // width of image in px; default: auto
                              height: '80px',                                          // width of image in px; default: 50 or '50px'
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Title,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: SubTitle,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Address,
                              style: { fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: BillString,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none; line-height:5px;">
                          <td style="text-align:left;font-family:Calibri; font-size: 17px;" colspan="2"><strong> BillNo: ${BillNo}</strong></td>
                          </tr>
                          <tr style="border-style:none; line-height:5px">
                          <td style="text-align:left; font-family:Calibri">Date: ${SaleDate}</td>
                          <td style="text-align:right;font-family:Calibri">Time:  ${BillTime}</td>
                          </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri;max-width: 125px;" >Name: ${CustomerName}</td>
                          <td style="text-align:right;font-family:Calibri">GST: ${GSTNo} </td>
                          </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri;max-width: 125px;">PhoneNo: ${PhoneNo}</td>
                          <td style="text-align:right;font-family:Calibri;font-size: 14px; "><strong>RefNo: ${RefNo} </strong></td>
                          </tr>
                          </table>`,
                              style: { fontSize: "16px", textAlign: "right", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: ServiceType,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: ['Particular', 'Qty', 'Rate', 'Amount'],
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Arial", fontSize: "16px", },
                              // custom style for the table body
                              // tableRowStyle: { 'border-bottom': 'none' },
                              tableBodyStyle: { border: 'none', 'font-family': "Arial", fontSize: "12px" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Arial", fontSize: "16px" },
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none;line-height:10px">
                          <td style="text-align:left;font-family:Calibri"> Total Items: ${TotalItemsCount}</td>
                          <td style="text-align:right;font-family:Calibri">Sub Total</td>
                          <td style="text-align:right;font-family:Calibri">${BillTotalAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Total Tax </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillGSTAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Round Off </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillRoundOff}</td>
                          </tr>
                          <tr style="border-style:none;line-height:5px">
                          <td style="text-align:center;font-family:Calibri; font-size:20px" colspan="3"><strong>TOTAL ${BillNetAmount}/-  </strong></td>
                          </tr>
                          </table><br/>`,
                              style: { textAlign: 'center', fontSize: "20px" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount + "&emsp; " + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount != 0 ? " Card" + ": " + CardAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount == 0 ? "Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount == 0 && PaytmAmount != 0 ? "Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: '&nbsp;',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: SaleGSTValues.length > 0 ? ['TaxType', 'HSN/SAC', 'Tax %', 'Tax Amount'] : '',
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleGSTValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableFooter: SaleGSTValues.length > 0 ? ['', 'TOTAL TAX', '', BillGSTAmount] : '',

                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px", },
                              // custom style for the table body
                              tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px", },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px", },
                            }, {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: "Captain :" + " " + CaptainName,
                              style: { textAlign: 'left', fontSize: "15px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: Greetings,
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                            }
                          ]
                        }
                        else {
                          data = [
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: "-",
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'image',
                              path: rootPath() + '/assets/images/logo.png',
                              position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                              width: '250px',                                           // width of image in px; default: auto
                              height: '80px',                                          // width of image in px; default: 50 or '50px'
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Title,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: SubTitle,
                              style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: Address,
                              style: { fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: BillString,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none; line-height:5px;">
                          <td style="text-align:left;font-family:Calibri; font-size: 17px;" colspan="2"><strong> BillNo: ${BillNo}</strong></td>
                          </tr>
                          <tr style="border-style:none; line-height:5px">
                          <td style="text-align:left; font-family:Calibri">Date: ${SaleDate}</td>
                          <td style="text-align:right;font-family:Calibri">Time:  ${BillTime}</td>
                          </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri;max-width: 125px;">Name: ${CustomerName}</td>
                          <td style="text-align:right;font-family:Calibri">GST: ${GSTNo} </td>
                          </tr>
                          <tr style="border-style:none;">
                          <td style="text-align:left;font-family:Calibri;">PhoneNo: ${PhoneNo}</strong></td>
                         <td style="text-align:right;font-family:Calibri">${ServiceType == "Sweetshop" ? 'Waiter:' + WaiterName : ''}</td>
                         </tr>
                          </table>`,
                              style: { fontSize: "16px", textAlign: "right", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: ServiceType,
                              style: { fontWeight: "700", fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: ['Particular', 'Qty', 'Rate', 'Amount'],
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Arial", fontSize: "16px", },
                              // custom style for the table body
                              // tableRowStyle: { 'border-bottom': 'none' },
                              tableBodyStyle: { border: 'none', 'font-family': "Arial", fontSize: "12px" },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Arial", fontSize: "16px" },
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: `<table style="border-style:none; font-size: 12px; ">
                          <tr style="border-style:none;line-height:10px">
                          <td style="text-align:left;font-family:Calibri"> Total Items: ${TotalItemsCount}</td>
                          <td style="text-align:right;font-family:Calibri">Sub Total</td>
                          <td style="text-align:right;font-family:Calibri">${BillTotalAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Total Tax </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillGSTAmount}</td>
                          </tr>
                          <tr  style="border-style:none;line-height:5px">
                          <td></td>
                          <td style="text-align:right;font-family:Calibri">Round Off </td>
                          <td style="text-align:right;font-family:Calibri"> ${BillRoundOff}</td>
                          </tr>
                          <tr style="border-style:none;line-height:5px">
                          <td style="text-align:center;font-family:Calibri; font-size:20px" colspan="3"><strong>TOTAL ${BillNetAmount}/-  </strong></td>
                          </tr>
                          </table><br/>`,
                              style: { textAlign: 'center', fontSize: "20px" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount + "&emsp; " + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount != 0 ? " Card" + ": " + CardAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount != 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount != 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount + "&emsp;" + " Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount != 0 && CardAmount == 0 && PaytmAmount == 0 ? "Cash" + ": " + CashAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount != 0 && PaytmAmount == 0 ? "Card" + ": " + CardAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            }, {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: CashAmount == 0 && CardAmount == 0 && PaytmAmount != 0 ? "Paytm" + ": " + PaytmAmount : '',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },
                            {
                              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                              value: '&nbsp;',
                              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
                            },

                            {
                              type: 'table',
                              // style the table
                              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
                              // list of the columns to be rendered in the table header
                              tableHeader: SaleGSTValues.length > 0 ? ['TaxType', 'HSN/SAC', 'Tax %', 'Tax Amount'] : '',
                              // multi dimensional array depicting the rows and columns of the table body
                              tableBody: SaleGSTValues,
                              // list of columns to be rendered in the table footer
                              // tableFooter: ,
                              // custom style for the table header
                              tableFooter: SaleGSTValues.length > 0 ? ['', 'TOTAL TAX', '', BillGSTAmount] : '',

                              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px", },
                              // custom style for the table body
                              tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px", },
                              // custom style for the table footer
                              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px", },
                            }, {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: "Captain :" + " " + CaptainName,
                              style: { textAlign: 'left', fontSize: "15px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: '&nbsp;',
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                            },
                            {
                              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                              value: Greetings,
                              style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                            }
                          ]
                        }

                        ipcRenderer.invoke('Print', data, options);
                        resolve('success')

                      },
                      (error) => {
                        ErrorLog.writeLogFile('getBillGSTDetails', error)

                      }
                    ).catch((error) => {
                      ErrorLog.writeLogFile('getBillGSTDetails', error)
                    })


                    //   this.getBillGSTDetails(SaleHeaderId, view)

                  }, (error) => {
                    ErrorLog.writeLogFile('getSaleBillItemDetails', error)

                  }
                ).catch((error) => {
                  ErrorLog.writeLogFile('getSaleBillItemDetails', error)
                })


              },
              (error) => {
                ErrorLog.writeLogFile('getSaleBillDetails', error)

              }
            ).catch((error) => {
              ErrorLog.writeLogFile('getSaleBillDetails', error)
            })

          },
          (error) => {
            ErrorLog.writeLogFile('getBillCounterDetails', error)

          }
        ).catch((error) => {
          ErrorLog.writeLogFile('getBillCounterDetails', error)
          reject(error)
        })
      })
    }
  }

}



module.exports = new PrinterService();
