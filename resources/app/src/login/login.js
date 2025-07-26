const Store = require('electron-store');
let { ipcRenderer } = require('electron');
let EncrDecrService = require('../services/encrypt-decrypt.service')
let Server = require('../server')
let Swal = require('sweetalert2');
let auth_empty = 'Please enter a username and password';
let auth_error = 'Incorrect username or password';
let load_error = 'Unable to load data, please contact administrator';
const store = new Store();
const ErrorLog = require('../services/log');
let environment = require('../environment')
let BillingdbService = require('../database/billingdb');
let ItemdbService = require('../database/itemdb');
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
const showLoadingForDataSync = function () {
  Swal.fire({
    title: 'Data is Syncing. Please Wait...!',
    allowEscapeKey: false,
    allowOutsideClick: false,
    background: '#FFFFFF',
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};
var date = new Date()
var serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);

$.fn.myFunction = function () {

  var x = document.getElementById("loginpg_password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }

}
$.fn.signInClick = function (event) {

  event.preventDefault();
  // event.stopPropagation();

  // if ($(this).find("span.submit-now").length !== 0) {
  //   event.preventDefault();
  //   event.stopPropagation();

  // } else {
  //   $(this).prepend(
  //     showLoading())
  // }

  const email = document.getElementById("loginpg_email")
  const password = document.getElementById("loginpg_password");
  if (email.value == "" || password.value == "") {
    Swal.fire(
      'Incomplete form!',
      auth_empty,
      'warning'
    );
  }
  else {
    debugger
    showLoading()
    $.post(environment.apiURL + '/GetLoginDetail', { "LoginEmail": email.value, "LoginPassword": EncrDecrService.encrypt(password.value),"CompanyId":environment.CompanyId }, function (data) {
      let res = JSON.parse(data);
      debugger
      if (res.Status == 'valid') {
        debugger
        store.set('IsOnline', 'true');
        store.delete('BillCounterId');
        store.delete('BillCounterName');
        store.delete('noOfSlots');
        store.delete('BillCounterCode');

        // store.delete('DisplayName');
        // store.delete('Ref');
        // store.delete('loginToken');
        // store.delete('UserType');
        // store.delete('SpecialRights');

        store.set('DisplayName', res.Data.DisplayName);
        store.set('Ref', res.Data.Ref);
        store.set('loginToken', res.Token);
        store.set('UserType', res.Data.UserType);
        store.set('SpecialRights', res.Data.SpecialRights);

        if (res.Data.UserType == 'Admin') {
          showLoading()
          ipcRenderer.invoke('Navigate', environment.PageUrl.admin);
          // if (res.Data.CompanyId == 0) {
          //   showLoading()
          //   ipcRenderer.invoke('Navigate', environment.PageUrl.admin);
          // } else if (res.Data.CompanyId == environment.CompanyId) {
          //   showLoading()
          //   ipcRenderer.invoke('Navigate', environment.PageUrl.admin);
          // } else {
          //   Swal.fire({
          //     title: 'Login was Not Configured to Company..!',
          //     allowOutsideClick: false,
          //     icon: 'warning',
          //     confirmButtonText: 'Ok',
          //   })
          // }
        }
        else {

          let billCounterList;
          let billCounterInfoList;
          let billCounterTablesList;
          let rupeeList;
          let billCounterPrintersList;
          let servicetypeList;
          let loginList;
          let loginAccessList;
          let itemList;
          let waiterList;
          let settingsList;
          let itemGroupList;
          let addLoginAccessBillCounterList;
          let dayEndDetails;
          let CustomerTokenGroupList;

          $.post(environment.apiURL + '/GetAllBillCountersandItemsForPOS', {
            "POSId": environment.POSId,
            "POSDate": serverDate,
            "CompanyId": environment.CompanyId
          }, function (data) {
            showLoadingForDataSync()

            let resu = JSON.parse(data);
            loginList = resu.Data[0]
            loginAccessList = resu.Data[1]
            billCounterList = resu.Data[2]
            billCounterInfoList = resu.Data[3]
            rupeeList = resu.Data[4]
            servicetypeList = resu.Data[5]
            itemList = resu.Data[6]
            billCounterTablesList = resu.Data[7]
            waiterList = resu.Data[8]
            billCounterPrintersList = resu.Data[9]
            settingsList = resu.Data[10]
            itemGroupList = resu.Data[11]
            addLoginAccessBillCounterList = resu.Data[12]
            dayEndDetails = resu.Data[13]
            CustomerTokenGroupList = resu.Data[14]

          }).then(async (resultmain) => {
            await BillingdbService.addLoginDetails(loginList)
          }).then(async (result) => {
            await BillingdbService.addLoginAccessDetails(loginAccessList)
          }).then(async (result1) => {
            await BillingdbService.addBillCounters(billCounterList)
          }).then(async (result2) => {
            await BillingdbService.addBillCounterDetails(billCounterInfoList)
          }).then(async (result3) => {
            await BillingdbService.addBillCounterTables(billCounterTablesList)
          }).then(async (result4) => {
            await BillingdbService.addPOSWaiters(waiterList)
          }).then(async (result5) => {
            await BillingdbService.addRupees(rupeeList)
          }).then(async (result6) => {
            await BillingdbService.addBillCounterServiceTypes(servicetypeList)
          }).then(async (result7) => {
            await BillingdbService.addBillCounterKOTPrinters(billCounterPrintersList)
          }).then(async (result8) => {
            await BillingdbService.addBillCounterCustomerTokenGroups(CustomerTokenGroupList)
          }).then(async (result9) => {
            store.set('POSPassword', settingsList)
            await BillingdbService.addPOSSettings(settingsList)
          }).then(async (result10) => {
            await BillingdbService.addItemGroups(itemGroupList)
          }).then(async (result11) => {
            await BillingdbService.updateDayEndApprove(dayEndDetails)
          }).then(async (result12) => {
            await BillingdbService.addLoginAccessBillCounter(addLoginAccessBillCounterList)
          }).then(async (result13) => {
            await BillingdbService.addItemList(itemList)
          }).then(async (result14) => {
            await ipcRenderer.invoke('Navigate', environment.PageUrl.user);
          }).catch(function (err) {
            ErrorLog.writeLogFile('adddetailsList from login page', err)
          })
        }
      }
      else if (res.Status == 'invalid') {
        ErrorLog.writeLogFile('GetAllBillCountersandItemsForPOS', res.Data)

        Swal.fire(
          'Oops!',
          res.Data,
          'warning'
        );
      }
      else {
        Swal.fire(
          'Oops!',
          res.Data,
          'warning'
        );
      }
    }).fail(function () {
      store.set('IsOnline', 'false');
      BillingdbService.validateLoginDetails({ "LoginEmail": email.value.toUpperCase(), "LoginPassword": EncrDecrService.encrypt(password.value) })
        .then((result) => {
          if (result.UserType != 'Admin') {
            store.delete('BillCounterId');
            store.delete('BillCounterName');
            store.delete('noOfSlots');
            store.delete('BillCounterCode');
            store.delete('Ref');
            store.set('DisplayName', result.DisplayName);
            store.set('Ref', result.Ref);
            store.set('loginToken', '');
            store.set('UserType', result.UserType);
            store.set('SpecialRights', result.SpecialRightsRows);
            Swal.fire({
              title: 'Are you sure?',
              text: "Server is unavailable, Do you want to continue with previous setup.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes',
              allowEscapeKey: false,
              allowOutsideClick: false,
              cancelButtonText: 'No'
            }).then((result) => {
              if (result.isConfirmed) {
                showLoadingForDataSync()
                ipcRenderer.invoke('Navigate', environment.PageUrl.user);
              }
            })
          }
          else if (result.UserType != 'User') {
            Swal.fire(
              'Oops!',
              'Server was Disconnected'
            );
          }
        }, (error) => {
          ErrorLog.writeLogFile('ISonline false', error)
        })
    })
  }

}

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
      ipcRenderer.send('app-quit', '');
    }
  });
});
$('#Minimize').click(function () {
  ipcRenderer.send('minimize','')

});

