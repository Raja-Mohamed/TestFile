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
 
    getPreviousBillTodayWaiterPrint(item, printItem ,view,checked) {
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

        // Nested Array Created
        let array1 = [];
        for (let i = 0; i < item.length; i++) {
          array1[item[i].CashierName] = {
              CashierId: item[i].CreatedBy,
              CashierName: item[i].CashierName,
              children :[]
          }
        }
      
        // High to low Sale Amount Sort order
        item.sort(function(a, b){ 
          return b.NetAmount - a.NetAmount 
        });

        for (let i = 0; i < item.length; i++) {
          if(item[i].CreatedBy == array1[item[i].CashierName].CashierId){ 
            array1[item[i].CashierName].children.push({
              WaiterName: item[i].WaiterName,
              TotalBillCount: item[i].TotalBillCount ,
              NetAmount: Number(parseFloat(item[i].NetAmount).toFixed(2))
            })
          }
        }
        array1 = Object.entries(array1); // object to array convert

        let ItemListStrings = [];

        for (let i = 0; i < array1.length; i++) {

          // let cashier = checked == false ? printItem.CashierName : array1[i][1].CashierName;

          // if(checked == true){  // Cashier wise check box checked 
          //   let itemObj ={ // CashierName Wise header detail Cashier: 
          //     WaiterName: '<b style=" font-size: 14px;"> CashierName: </b> ', // total bill wise Login cahiser name / cashier wise and waiter wise name list
          //     TotalBillCount: '<b style=" font-size: 14px;">' +  cashier + ' </b> ',
          //     NetAmount: '',
          //   }
          //   ItemListStrings.push(itemObj); // CashierName detail
          // }

          let itemObj1 =[]; // Waiter Wise Item Detail
          for (let m = 0; m < array1[i][1].children.length; m++) {
            itemObj1 ={
              WaiterName: array1[i][1].children[m].WaiterName,
              TotalBillCount: array1[i][1].children[m].TotalBillCount,
              NetAmount:  parseFloat(array1[i][1].children[m].NetAmount).toFixed(2), // array1[i][1].children[m].NetAmount,
            }
            ItemListStrings.push(itemObj1); // Waiter detail
          }

          // let TotalAmount = array1[i][1].children.map(row => (row.NetAmount)).reduce((prev, next) => prev + next);
          // ItemSubTotal += TotalAmount; //Total Amount Sum

          // let itemObj3 =[];
          // itemObj3 ={
          //   WaiterName: '',
          //   TotalBillCount :  '',
          //   NetAmount: '<b style=" font-size: 14px;">' +  parseFloat(TotalAmount).toFixed(2) +  ' </b>',
          // }
          // ItemListStrings.push(itemObj3); // Waiter Total Amount
        }

        // Table view another array pushed
        let itemList = [];

        for (let i = 0; i < ItemListStrings.length; i++) {
          itemList.push({
              WaiterName: ItemListStrings[i].WaiterName,
              TotalBillCount: ItemListStrings[i].TotalBillCount ,
              NetAmount : ItemListStrings[i].NetAmount ,
          })
        }

        SaleItemdetails = itemList;
        SaleItemValues = SaleItemdetails.map(Object.values);

        // let itemObj1 =[];  
        // let ItemListString =[];  

        // for (let i = 0; i < item.length; i++) {

        //   itemObj1 ={
        //     WaiterName: item[i].WaiterName,
        //     TotalBillCount: item[i].TotalBillCount,
        //     NetAmount: item[i].NetAmount.toFixed(2),
        //   }
        //  ItemListString.push(itemObj1); // Item  detail
        // }

        // SaleItemValues = ItemListString.map(Object.values);
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
            type: 'text',  
            value: "-",
            style: { fontWeight: "700", fontSize: "18px", textAlign: "center", 'font-family': "Calibri" }
          },
          {
            type: 'image',
            path: rootPath() + '/assets/images/logo.png',
            position: 'center', 
            width: '250px',
            height: '80px',
          },
          {
            type: 'text',                   
            value: checked == false ?  'Waiter Wise Report' : 'Cashier Wise Waiter Report',
            style: { fontWeight: "700",fontSize: "20px", textAlign: "center", 'font-family': "Calibri" }
          }, {
            type: 'text',             
            value: '&nbsp;',
            style: { fontSize: "15px", textAlign: "center", 'font-family': "Calibri" }
          },
          {
            type: 'text',        
            value: `<table style="border-style:none; font-size: 12px; ">
              <tr style="border-style:none; line-height:5px;">
                <td style="text-align:center;font-size:20px" colspan="2"><strong>${environment.POSName}</strong></td>
              </tr>
              <tr style="border-style:none; line-height:14px">
                <td style="text-align:center; font-family:Calibri;font-size:13px" colspan="2"><strong>Counter: ${BillCounterName}</strong></td>
              </tr>
              ${ checked == false ? '' : `                
                  <tr style="border-style:none; line-height:14px">
                    <td style="text-align:center; font-family:Calibri;font-size:14px" colspan="2"><strong>Cashier: ${printItem.CashierName}</strong></td>
                  </tr>`
              }
              <!-- <tr style="border-style:none; line-height:14px">
                <td style="text-align:center; font-family:Calibri;font-size:17px" colspan="2"><strong>Shift time Up to: ${printItem.ShiftEndTime}</strong></td>
              </tr> -->
              <tr style="border-style:none; line-height:14px">
                  <td style="text-align:left; font-family:Calibri">Date: ${printItem.SaleDate}</td>
                  <td style="text-align:right;font-family:Calibri">Shift time Up to: ${printItem.ShiftEndTime}</td>
                 <!--  <td style="text-align:right;font-family:Calibri">Time:  ${printItem.Currenttime}</td> -->
              </tr>
              </table>`,
              style: { fontSize: "16px", textAlign: "right", 'font-family': "Calibri" }
          },
          {
            type: 'table',
            style: { 'border-bottom': '1px dashed', 'border-top': '1px dashed' },
            tableHeader: SaleItemValues.length > 0 ? ['Waiter Name', 'Total Bills', 'Total Sales'] : '',
            tableBody: SaleItemValues,
            tableFooter: SaleItemValues.length > 0 ? ['', 'TOTAL SALES', printItem.TotalAmount] : '',
            tableHeaderStyle: { 'border-bottom': '1px dashed', color: 'black', 'font-family': "Calibri", fontSize: "14px", },
            tableBodyStyle: { 'border': '0px', 'font-family': "Calibri", fontSize: "12px"},
            tableFooterStyle: { color: 'black', 'font-family': "Calibri", fontSize: "12px" },
          }, 
          // {
          //   type: 'text',                                  
          //   value: `<table style="border-style:none; font-size: 12px; ">
          //     <tr style="border-style:none;line-height:10px">
          //        <td style="text-align:left;font-family:Calibri"> Total Bill Count: ${printItem.TotalBillCount}</td>
          //       <td style="text-align:right;font-family:Calibri">Total Amount</td>
          //       <td style="text-align:right;font-family:Calibri">${printItem.TotalAmount}</td>
          //       <tr  style="border-style:none;line-height:5px">
          //         <td></td>
          //       </tr>
          //     </table><br/>`,
          //   style: { textAlign: 'center', fontSize: "20px" }
          // },
        ]
        ipcRenderer.invoke('Print', data, options);
    }
  }

}



module.exports = new PreviousBillTodayReport();
