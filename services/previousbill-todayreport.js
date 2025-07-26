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

let SaleItemdetails = [];
let ItemSubTotal;
let ItemRoundOff;
let ItemNetAmount;
let SaleItemValues;
let TotalItemsCount;
let BillingdbService = require('../database/billingdb');

class PreviousBillTodayReport {
 
    getPreviousBillTodayPrint(item, printItem ,view,checked) {
    debugger;
    let PrinterName = store.get('PrinterName');
    let BillCounterName = store.get('BillCounterName');
    if (PrinterName == "" && view != 1) {

      Swal.fire(
        'warning..!',
        'Please Configure printer Settings..!',
        'warning'
      )
     // reject("printer not Configured")

    } else {
          ItemSubTotal = 0;  ItemNetAmount = 0;
          //console.log('item', item);

          // Nested Array Created
            let array1 = [];
            for (let i = 0; i < item.length; i++) {
              array1[item[i].Category] = {
                  CategoryId: item[i].CategoryId,
                  Category: item[i].Category,
                  children :[]
              }
            }

            for (let i = 0; i < item.length; i++) {
              if(item[i].CategoryId == array1[item[i].Category].CategoryId){ 
                array1[item[i].Category].children.push({
                  ItemName: item[i].ItemName,
                  Qty: item[i].Qty ,
                  UOM : item[i].UOM ,
                  TotalAmount: Number(parseFloat(item[i].TotalAmount).toFixed(2))
                })
              }
            }
          // Nested Array Created
          array1 = Object.entries(array1); // object to array convert
          
           // List View Category, iteam, total print
          let ItemListString= [];
          var totalItem =0;
          for (let i = 0; i < array1.length; i++) {
            let itemObj ={ // Category Wise header detail
              CategoryId:array1[i][1].CategoryId,
              // Category: '<b style=" font-size: 14px;">' +  array1[i][1].Category + ' </b> ',
              ItemName: '<b style=" font-size: 14px;">' +  array1[i][1].Category + ' </b> ',
              Qty: '',
              UOM : '' ,
              TotalAmount: '',
            }
  
            ItemListString.push(itemObj); // Category detail

            let itemObj1 =[]; // Category Wise Item Detail
            for (let m = 0; m < array1[i][1].children.length; m++) {
              itemObj1 ={
                CategoryId: array1[i][1].CategoryId,
                // Category: '',
                ItemName: array1[i][1].children[m].ItemName,
               // Qty: array1[i][1].children[m].Qty,
                Qty: parseFloat(array1[i][1].children[m].Qty).toFixed(2),
                UOM : array1[i][1].children[m].UOM ,
                TotalAmount:  parseFloat(array1[i][1].children[m].TotalAmount).toFixed(2),
              }
             ItemListString.push(itemObj1); // Item  detail
            }

            totalItem += array1[i][1].children.length; //Total Item Sum

            // let itemObj2 =[]; // Category Wise Total Item Count
            // itemObj2 ={
            //  Category: '',
            //   ItemName:'<b style=" font-size: 14px;"> Total Item ' + String(array1[i][1].children.length) + ' </b> ',
            //   Qty :  '',
            //   UOM : '' ,
            //   TotalAmount: '',
            // }
            // ItemListString.push(itemObj2);

            let TotalAmount = array1[i][1].children.map(row => (row.TotalAmount)).reduce((prev, next) => prev + next);
            ItemSubTotal += TotalAmount; //Total Amount Sum

            let itemObj3 =[];
             itemObj3 ={
               // Category: '',
                ItemName: '',
                Qty :  '',
                UOM : '' ,
                TotalAmount: '<b style=" font-size: 14px;">' +  parseFloat(TotalAmount).toFixed(2) +  ' </b>',
              }
            ItemListString.push(itemObj3); // Item Total Amount
          }

          // Table view another array pushed
          let itemList = [];

          for (let i = 0; i < ItemListString.length; i++) {
            itemList.push({
               // Category: ItemListString[i].Category,
                ItemName: ItemListString[i].ItemName,
                Qty: ItemListString[i].Qty ,
                UOM : ItemListString[i].UOM ,
                TotalAmount: ItemListString[i].TotalAmount 
            })
          }

         // console.log('printItem =', printItem);
        SaleItemdetails = itemList;
        TotalItemsCount = totalItem;
        // ItemRoundOff =  printItem.roundOff;
        //  ItemNetAmount =  Number(ItemSubTotal) + Number(ItemRoundOff);
         ItemNetAmount =  parseFloat(printItem.totalAmount).toFixed(2);
       // ItemNetAmount =   printItem.totalAmount.toLocaleString('en-IN');
        ItemSubTotal =   parseFloat(ItemSubTotal).toFixed(2);
        ItemRoundOff =  Number(printItem.totalAmount) - Number(ItemSubTotal);
        ItemRoundOff = parseFloat(ItemRoundOff).toFixed(2);
       // ItemRoundOff = parseFloat(printItem.roundOff).toFixed(2);
        SaleItemValues = SaleItemdetails.map(Object.values);
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
              value: 'Item Sales Report',
              style: { fontWeight: "700",fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
            }, {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: '&nbsp;',
              style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
            },
            {
              type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: `<table style="border-style:none; font-size: 12px; ">
                <tr style="border-style:none; line-height:5px;">
                  <td style="text-align:center;font-size:20px" colspan="2"><strong>${environment.POSName}</strong></td>
                </tr>
                <tr style="border-style:none; line-height:14px">
                  <td style="text-align:center; font-family:Calibri;font-size:17" colspan="2"><strong>Counter: ${BillCounterName}</strong></td>
                </tr>
                ${ checked == false ? '' : `                
                  <tr style="border-style:none; line-height:14px">
                    <td style="text-align:center; font-family:Calibri;font-size:17" colspan="2"><strong>Cashier: ${printItem.CashierName}</strong></td>
                  </tr>`
                }
                <tr style="border-style:none; line-height:14px">
                    <td style="text-align:left; font-family:Calibri">Date: ${printItem.SaleDate}</td>
                    <td style="text-align:right;font-family:Calibri">Time:  ${printItem.Currenttime}</td>
                </tr>
                </table>`,
                style: { fontSize: "16px", textAlign: "right", 'font-family': "Calibri" }
            },
            {
              type: 'table',
              // style the table
              style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
              // list of the columns to be rendered in the table header
              tableHeader: SaleItemValues.length > 0 ? ['Item Name', 'QTY', '' ,'Total Amount'] : '',
              // multi dimensional array depicting the rows and columns of the table body
              tableBody: SaleItemValues,
              // list of columns to be rendered in the table footer
              // tableFooter: ,
              // custom style for the table header 
             // tableFooter: SaleItemValues.length > 0 ? ['', 'TOTAL', ItemSubTotal] : '',

              tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px", },
              // custom style for the table body
              tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px"},
              // custom style for the table footer
              tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px" },
            }, 
            {
              type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
              value: `<table style="border-style:none; font-size: 12px; ">
                <tr style="border-style:none;line-height:10px">
                  <td style="text-align:left;font-family:Calibri"> Total Items: ${TotalItemsCount}</td>
                  <td style="text-align:right;font-family:Calibri">Sub Total</td>
                  <td style="text-align:right;font-family:Calibri">${ItemSubTotal}</td>
                <tr  style="border-style:none;line-height:5px">
                  <td></td>
                  <td style="text-align:right;font-family:Calibri">Round Off </td>
                  <td style="text-align:right;font-family:Calibri"> ${checked == false ? ItemRoundOff : printItem.roundOff}</td>
                </tr>
                <tr style="border-style:none;line-height:10px"> 
                  <td style="text-align:center;font-family:Calibri; font-size:20px" colspan="3"><strong>TOTAL ${checked == false ?  ItemNetAmount : Number(ItemSubTotal) + Number(printItem.roundOff)}/-  </strong></td>
                </tr>
                  <tr style="border-style:none;line-height:5px"> 
                  <td style="text-align:center;font-family:Calibri;font-size:15px" colspan="3"><strong>Cash : ${printItem.totalcashvalue}</strong></td>
                </tr>
                </tr>
                  <tr style="border-style:none;line-height:5px"> 
                  <td style="text-align:center;font-family:Calibri;font-size:15px" colspan="3"><strong> Card : ${printItem.totalcardvalue}</strong></td>
                </tr>
                </tr>
                  <tr style="border-style:none;line-height:5px"> 
                  <td style="text-align:center;font-family:Calibri;font-size:15px" colspan="3"><strong> Online : ${printItem.totalonlinevalue}</strong></td>
                </tr>
                </table><br/>`,
              style: { textAlign: 'center', fontSize: "20px" }
            },
          ]
        ipcRenderer.invoke('Print', data, options);
    }
  }

}



module.exports = new PreviousBillTodayReport();
