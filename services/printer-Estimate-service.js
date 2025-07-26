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
let BillTime;
let PhoneNo;
let GSTNo;
let RefNo;
let CaptainName;
let CustomerName;
let ServiceType;
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

class PrinterEstimateService {

    getGenerateBill(item , itemList , view) {
        // console.log(itemList)
        debugger;
        let Item = {
            BillCounterId: store.get('BillCounterId')
        }

        let PrinterName = store.get('PrinterName');

        if (PrinterName == "" && view != 1) {
            Swal.fire(
                'warning..!',
                'Please Configure printer Settings..!',
                'warning'
            )
            reject("printer not Configured")
        } 
        else {
            return new Promise(function (resolve, reject) {

                BillingdbService.getBillCounterDetails(Item).then((Data) => {

                    debugger;
                    let BillCounterdetails = Data;

                    Title = BillCounterdetails[0].Title
                    SubTitle = BillCounterdetails[0].SubTitle
                    Address = BillCounterdetails[0].Address
                    Greetings = BillCounterdetails[0].Greetings
                    BillCounterLogoPath = BillCounterdetails[0].BillCounterLogoPath

                    let SaleBilldetails = item;
                    CustomerName = SaleBilldetails.CustomerName;
                    PhoneNo = SaleBilldetails.PhoneNo;
                    GSTNo = SaleBilldetails.GSTNo;
                    RefNo = SaleBilldetails.RefNo;
                    ServiceType = SaleBilldetails.ServiceType;
                    SaleDate = SaleBilldetails.SaleDate;
                    BillTime = SaleBilldetails.BillTime;
                    BillTotalAmount = SaleBilldetails.TotalAmount;
                    BillGSTAmount = SaleBilldetails.TotalGST;
                    BillRoundOff = SaleBilldetails.RoundOff;
                    BillNetAmount = SaleBilldetails.NetAmount;
                    CaptainName = SaleBilldetails.CashierName;

                    SaleItemdetails = itemList
                    SaleValues = SaleItemdetails.map(Object.values);
                    TotalItemsCount = SaleValues.length
                    let data;

                    const options = {
                        // preview: true,
                        preview: view == 1 ? false : true,
                        margin: '-25px 24px -4px -10px',
                        width: 100,
                        copies: 1,
                        silent: true,
                        printerName: PrinterName,
                        timeOutPerLine: 400,
                        //pageSize: { height: 301000, width: 71000 }  // page size 
                        pageSize: '80mm' // page size
                    }

                    data = [
                        {
                            type: 'text',   // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                            value: "-",
                            style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                            type: 'image',
                            path: rootPath() + '/assets/images/logo.png',
                            position: 'center',   // position of image: 'left' | 'center' | 'right'
                            width: '250px',    // width of image in px; default: auto
                            height: '80px',   // width of image in px; default: 50 or '50px'
                        },
                        {
                            type: 'text',
                            value: Title,
                            style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                            type: 'text',
                            value: SubTitle,
                            style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                            type: 'text',  
                            value: Address,
                            style: { fontSize: "16px", textAlign: "center", 'font-family': "Calibri" }
                        },
                        {
                            type: 'text',
                            value: `<table style="border-style:none; font-size: 12px; ">
                                <tr style="border-style:none; line-height:5px;">
                                    <td style="text-align:left;" colspan="2"><strong> CashierName: ${CaptainName}</strong></td>
                                </tr>
                                <tr style="border-style:none; line-height:5px">
                                    <td style="text-align:left; font-family:Calibri">Date: ${SaleDate}</td>
                                    <td style="text-align:right;font-family:Calibri">Time:  ${BillTime}</td>
                                </tr>
                                <tr style="border-style:none;">
                                    <td style="text-align:left;font-family:Calibri; max-width: 125px;">Name: ${CustomerName}</td>
                                    <td style="text-align:right;font-family:Calibri">GST: ${GSTNo} </td>
                                </tr>
                                    <tr style="border-style:none;">
                                    <td style="text-align:left;font-family:Calibri; max-width: 125px;">PhoneNo: ${PhoneNo}</td>
                                    <td style="text-align:right;font-family:Calibri">RefNo: ${RefNo} </td>
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
                            tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Arial ", fontSize: "16px", },
                            // custom style for the table body
                            // tableRowStyle: { 'border-bottom': 'none' },
                            tableBodyStyle: { border: 'none', 'font-family': "Arial ", fontSize: "12px", },
                            // custom style for the table footer
                            tableFooterStyle: { color: 'black', 'font-family': "Arial ", fontSize: "16px", },
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
                                <td style="text-align:right;font-family:Calibri">Total GST </td>
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
                            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                            value: "**This is Not Sale Bill**",
                            style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                        }, {
                            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                            value: Greetings,
                            style: { fontWeight: "700", textAlign: 'center', fontSize: "15px" }
                        },
                        {
                            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                            value: '&nbsp;',
                            style: { fontWeight: "700", textAlign: 'center', fontSize: "12px" }
                        },
                    ]
                    ipcRenderer.invoke('Print', data, options);
                    resolve('success')
                }).catch((error) => {
                    ErrorLog.writeLogFile('getBillCounterDetails', error)
                    reject(error)
                })
            })
        }
    }

}



module.exports = new PrinterEstimateService();
