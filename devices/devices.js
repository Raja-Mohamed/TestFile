let { ipcRenderer } = require('electron');
let Swal = require('sweetalert2');
let Store = require('electron-store');
let BillingdbService = require('../database/billingdb')
let environment = require('../environment');
const ErrorLog = require('../services/log');
const store = new Store();
var Devices = [];
var DevicesForView = [];
let row = [];


$(document).ready(function () {


     LoadDeviceDetails();
});


function LoadDeviceDetails() {
     let Item =
     {
          "BillCounterId": store.get('BillCounterId'),
          "CompanyId": environment.CompanyId
     }
     $.post(environment.apiURL + '/GetPOSDevices', Item, function (data) {

          let res = JSON.parse(data);
          if (res.Status == "valid") {

               $('#device_list').empty();
               Devices = [];
               DevicesForView = [];

               Devices = res.Data[0];
               if (Devices.length > 0) {
                    Devices.forEach(row => {
                         debugger;
                         DevicesForView += `<tr>
                  
                    <td style="font-size: 15px;">${(row.DeviceId)}</td>
                    <td style="font-size: 15;">${(row.DeviceName)}</td>
                    <td> <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-pencil" onclick='$(this).EditDeviceDetails(${row.POSDeviceId})' ></span>
                  <span style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-trash"   onclick='$(this).DeleteDeviceDetails(${row.POSDeviceId})'></span></td>                              
                </tr>`;
                         $('#device_list').html(DevicesForView);

                    })
               }
               else {
                    $('#device_list').empty();
               }
          }
          else if (res.Status == "invalid") {
               ErrorLog.writeLogFile('GetPOSDevices', res.Data)

               Swal.fire({
                    title: 'GetPOSDevices Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
               })
          }
     }).catch(function (err) {
          ErrorLog.writeLogFile('GetPOSDevices', err)

          Swal.fire(
               'Oops!',
               'Internet was Disconnected . try again later!',
               'warning'
          );
     })
}

$.fn.Cancel = function () {
     window.close();
}

$.fn.openDevicesPopupWindow = function () {

     let row = {
          DeviceId: '',
          DeviceName: '',
          isNew: true

     }
     DeviceInfo(row)

}
function DeviceInfo(row) {

     Swal.fire({
          title: 'POS Devices',
          allowOutsideClick: false,
          showCancelButton: true,
          html: `
          

          <input type="text" name="" id="id" class="form-control" 
            value="${row.DeviceId}"  PlaceHolder="Enter DeviceId" maxlength="30">
            <br>
            <input type="text" name="" id="name" class="form-control" 
            value="${row.DeviceName}"  PlaceHolder="Enter DeviceName" maxlength="50">
            
          <br> `,


          //icon: 'question',
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
     }).then((result) => {
          if (result.isConfirmed) {
               let Item = {
                    "POSDeviceId": row.POSDeviceId,
                    "DeviceId": document.getElementById('id').value.trim(),
                    "DeviceName": document.getElementById('name').value.trim(),
                    "BillCounterId": store.get('BillCounterId'),
                    "CompanyId": environment.CompanyId,
                    Source: environment.PageUrl.devices,
                    Ref: store.get('Ref'),
               }
               if (Item.DeviceId != '' && Item.DeviceName != '') {
                    if (row.isNew) {

                         $.post(environment.apiURL + '/AddPOSDevices', Item, function (data) {

                              debugger
                              let res = JSON.parse(data);
                              if (res.Status == "valid") {
                                   debugger

                                   Devices = [];
                                   Swal.fire('Device Details Added!', '', 'success')
                                   LoadDeviceDetails();

                              }

                              else if (res.Status == "invalid") {
                                   ErrorLog.writeLogFile('AddPOSDevices', res.Error)

                                   Swal.fire({
                                        title: res.Error,
                                        icon: 'error',
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'OK'
                                   })
                              }
                         }).catch(function (err) {
                              ErrorLog.writeLogFile('AddPOSDevices', err)

                              Swal.fire(
                                   'Oops!',
                                   'Internet was Disconnected . try again later!',
                                   'warning'
                              );
                         })
                    }
                    else {
                         $.post(environment.apiURL + '/UpdatePOSDevices', Item, function (data) {

                              let res = JSON.parse(data);
                              if (res.Status == "valid") {
                                   debugger

                                   Devices = [];
                                   Swal.fire('Device Details Updated!', '', 'success')
                                   LoadDeviceDetails();

                              }
                              else if (res.Status == "invalid") {
                                   ErrorLog.writeLogFile('UpdatePOSDevices', res.Error)

                                   Swal.fire({
                                        title: res.Error,
                                        icon: 'error',
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'OK'
                                   })
                              }
                         }).catch(function (err) {
                              ErrorLog.writeLogFile('UpdatePOSDevices', err)

                              Swal.fire(
                                   'Oops!',
                                   'Internet was Disconnected . try again later!',
                                   'warning'
                              );
                         })

                    }
               }
               else {
                    Swal.fire(
                         'warning..!',
                         'Please Enter Device Details?',
                         'warning'
                    ).then((result) => {
                         if (result.isConfirmed) {
                              DeviceInfo(row);

                         }
                    })
               }
          }

          else if (result.dismiss === Swal.DismissReason.cancel) {
          }
     })
}
$.fn.EditDeviceDetails = function (POSDeviceId) {
     debugger;
     row = Devices.filter(X => X.POSDeviceId == POSDeviceId);

     row[0].isNew = false;
     DeviceInfo(row[0])
}

$.fn.DeleteDeviceDetails = function (POSDeviceId) {

     debugger;
     Swal.fire({
          title: 'Are you Sure to Delete the Device Details?',
          showCancelButton: true,
          icon: 'warning',
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
     }).then((result) => {
          if (result.isConfirmed) {

               debugger;
               let Item = {
                    "POSDeviceId": POSDeviceId,
                    "BillCounterId": store.get('BillCounterId'),
                    "CompanyId": environment.CompanyId,
                    "Source": environment.PageUrl.devices,
                    "Ref": store.get('Ref')

               }

               $.post(environment.apiURL + '/DeletePOSDevices', Item, function (data) {

                    let res = JSON.parse(data);
                    if (res.Status == "valid") {
                         debugger

                         Devices = [];
                         Swal.fire('Device Details Deleted!', '', 'success')
                         LoadDeviceDetails();

                    }

                    else if (res.Status == "invalid") {
                         ErrorLog.writeLogFile('DeletePOSDevices', res.Error)

                         Swal.fire({
                              title: 'DeletePOSDevices Failed',
                              icon: 'error',
                              confirmButtonColor: '#d33',
                              cancelButtonColor: '#3085d6',
                              confirmButtonText: 'OK'
                         })
                    }
               }).catch(function (err) {
                    ErrorLog.writeLogFile('DeletePOSDevices', err)

                    Swal.fire(
                         'Oops!',
                         'Internet was Disconnected . try again later!',
                         'warning'
                    );
               })
          }
     })



}




