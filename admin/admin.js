let Store = require('electron-store');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
let EncrDecrService = require('../services/encrypt-decrypt.service')
let ItemDbService = require('../database/itemdb')
let BillingdbService = require('../database/billingdb');
let ExcelJS = require('exceljs');
var todate = new Date();
let serverDate = todate.getFullYear() + "-" + ("0" + (todate.getMonth() + 1)).slice(-2) + "-" + ("0" + todate.getDate()).slice(-2);
const ErrorLog = require('../services/log');
const cron = require("node-cron");
let i;
let months = [];
let IsAllowNegativeStock = 0;
let selectedPOSId;
let selectedPOSName;
let datalist;


//Pdf Required package
var pdf = require("pdf-creator-node");
var fs = require("fs");



const showLoading = function () {
    Swal.fire({
        title: 'Please Wait',
        allowEscapeKey: false,
        allowOutsideClick: false,
        background: '#FFFFFF',
        showConfirmButton: true,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

$(document).ready(function () {
    debugger
    let UserPOSId = store.get('UserPOSId')
    // console.log("UserPOSId", UserPOSId)
    if (UserPOSId != '' && UserPOSId != 0 && UserPOSId != undefined) {
        selectedPOSId = UserPOSId
        selectedPOSName = environment.POSName;
        store.set('POSId', UserPOSId)
        showLoading();
        GetCalendarsForPOSApp(month, year)

        document.getElementById("POSName").innerText = UserPOSId == environment.POSId ? environment.POSName : '';
    } else {
        showLoading();
        $("#IsAdminWindow").hide();
        loadPOS()
    }

});


const calendar = document.querySelector(".calendar"),
    date = document.querySelector(".date"),
    daysContainer = document.querySelector(".days"),
    prev = document.querySelector(".prev"),
    next = document.querySelector(".next"),
    todayBtn = document.querySelector(".today-btn"),
    gotoBtn = document.querySelector(".goto-btn"),
    dateInput = document.querySelector(".date-input");


var today = new Date();
var activeDay;
var month = today.getMonth();
var year = today.getFullYear();
var DayList = []
months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const eventsArr = [];
prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

function loadPOS() {
    debugger
    let Item = {
        "CompanyId": environment.CompanyId,
        "LoginId": store.get('Ref')
    }

    $.post(environment.apiURL + '/GetLoginAccessForPOS', Item, function (data) {
        let res = JSON.parse(data);

        if (res.Status == "valid") {
            let POSList = res.Data[1];
            store.set('POS', res.Data)
            debugger
            if (POSList.length == 1) {
                Swal.close();
                $("#IsAdminWindow").show();
                store.set('POSId', POSList[0].POSId)
                store.set('POSName', POSList[0].POSName)
                selectedPOSId = POSList[0].POSId
                selectedPOSName = POSList[0].POSName
                document.getElementById("POSName").innerText = POSList[0].POSName;
                GetCalendarsForPOSApp(month, year)
            }
            else if (POSList.length > 1) {
                Swal.fire({
                    title: 'Please choose the POS?',
                    allowOutsideClick: false,
                    showCancelButton: true,
                    html: `<select name="" id="posdrp" class="form-control">
            </select>`,
                    icon: 'question',
                    confirmButtonText: 'Go',
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                        debugger
                        str = document.getElementById('posdrp').value
                        let selectBillCounter = JSON.parse(str);

                        if (selectBillCounter != 0) {
                            $("#IsAdminWindow").show();
                            store.set("POSId", selectBillCounter.posId)
                            store.set("POSName", selectBillCounter.posName)
                            selectedPOSId = selectBillCounter.posId
                            selectedPOSName = selectBillCounter.posName
                            document.getElementById("POSName").innerText = selectBillCounter.posName;
                            GetCalendarsForPOSApp(month, year)
                        } else {
                            Swal.fire(
                                'warning..!',
                                'Please choose a POS?',
                                'warning'
                            ).then((result) => {
                                if (result.isConfirmed) {

                                    loadPOS()
                                }
                            })
                        }
                    }
                    else if (result.dismiss === Swal.DismissReason.cancel) {
                        ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                    }
                })
            }
            else if (POSList.length == 0) {
                Swal.fire({
                    title: 'POS was Not Configured to User..!',
                    allowOutsideClick: false,
                    icon: 'warning',
                    confirmButtonText: 'Ok',
                }
                ).then((result) => {
                    if (result.isConfirmed) {
                        store.delete('loginToken');
                        ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                    }
                })
            }

            $('#posdrp').html(`<option value="0" selected="selected">Please select</option>`);
            // console.log(" res.Data", res.Data)
            POSList.forEach(row => {
                debugger
                let counter = `<option value='{"posId": "${row.POSId}","posName": "${row.POSName}","posCode": "${row.POSCode}","IsAllowNegativeStock": "${row.IsAllowNegativeStock}"}'>${row.POSName}</option>`;
                $('#posdrp').append(counter);
            });
        }
        else if (res.Status == "invalid") {
            ErrorLog.writeLogFile('GetLoginAccessForPOS invalid', JSON.stringify(res))

            Swal.fire({
                title: "GetLoginAccessForPOS Failed",
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    store.delete('loginToken');
                    ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                }
            })
        } else {
            ErrorLog.writeLogFile('GetLoginAccessForPOS else', JSON.stringify(res))
            Swal.fire({
                title: "GetLoginAccessForPOS Failed",
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    store.delete('loginToken');
                    ipcRenderer.invoke('Navigate', environment.PageUrl.login);
                }
            })

        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('GetLoginAccessForPOS catch', JSON.stringify(err))
        Swal.fire({
            title: 'API Server was Disconnected . try again later!',
            allowOutsideClick: false,
            icon: 'warning',
            confirmButtonText: 'Ok',
        }
        ).then((result) => {
            if (result.isConfirmed) {
                store.delete('loginToken');
                ipcRenderer.invoke('Navigate', environment.PageUrl.login);
            }
        })
    });

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
            store.delete('loginToken');
            store.delete('UserPOSId');
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
            store.delete('loginToken');
            store.delete('UserPOSId');
            ipcRenderer.send('app-quit', '');
        }
    });
});
// Setting a cron job
// cron.schedule("*/10 */59 */23 * * *", function () {
//     //  loadBillCounters()
//     deletePOSRecords()
//     // Data to write on file
//     // let data = `${new Date().toLocaleString()} 
//     //            : Server is working\n`;
//     // // console.log(data)
//     // // // Appending data to logs.txt file
//     // ErrorLog.writeLogFile("logs.txt", data, function (err) {
//     //     if (err) throw err;

//     //     // console.log("Status Logged!");
//     // });
// });
$.fn.ImportDayendApprovals = function (event) {

    let Item = {
        "CompanyId": environment.CompanyId,
        "POSId": store.get('POSId')
    }
    //  console.log("Item", Item)
    Swal.fire({
        title: 'Are you Sure to Import DayEnd Approvals?',
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
                closeOnClickOutside: false,
                closeOnEsc: false,
                showConfirmButton: false,
                allowOutsideClick: false,
                imageUrl: "../../assets/images/Loader.gif"
            })

            $.post(environment.apiURL + '/POSDayEndApprovals', Item, function (data) {
                let res = JSON.parse(data);

                if (res.Status == "valid") {
                    Swal.fire({
                        title: 'POSDayEndApprovals Imported Success',
                        width: 500,
                        height: 200,
                        position: 'center',
                        icon: 'success',
                        allowOutsideClick: false
                        // title: 'Imported Success',
                        // timer: 3500
                    })
                }
                else if (res.Status == "invalid") {
                    ErrorLog.writeLogFile('POSDayEndApprovals Invalid', JSON.stringify(res))

                    Swal.fire({
                        title: 'POSDayEndApprovals Imported Failed',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                } else {
                    ErrorLog.writeLogFile('POSDayEndApprovals else', JSON.stringify(res))

                    Swal.fire({
                        title: 'POSDayEndApprovals Imported Failed',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                }
            }).catch(function (err) {
                ErrorLog.writeLogFile('POSDayEndApprovals catch', JSON.stringify(err))
                Swal.fire({
                    title: 'POSDayEndApprovals Imported Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
            });

        } else if (result.isDenied) {
        }
    })

}


$.fn.ImportMasters = function (event) {

    let Item = {
        "CompanyId": environment.CompanyId,
        "POSId": store.get('POSId')
    }
    Swal.fire({
        title: 'Are you Sure to Import Master?',
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
                closeOnClickOutside: false,
                closeOnEsc: false,
                showConfirmButton: false,
                allowOutsideClick: false,
                imageUrl: "../../assets/images/Loader.gif"
            })

            $.post(environment.apiURL + '/ImportMasters', Item, function (data) {
                let res = JSON.parse(data);

                if (res.Status == "valid") {
                    Swal.fire({
                        title: 'Imported Success',
                        width: 500,
                        height: 200,
                        position: 'center',
                        icon: 'success',
                        title: 'Imported Success',
                        allowOutsideClick: false
                        //timer: 3500
                    })
                }
                else if (res.Status == "invalid") {
                    ErrorLog.writeLogFile('ImportMasters invalid', JSON.stringify(res))

                    Swal.fire({
                        title: 'Imported Failed',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                } else {
                    ErrorLog.writeLogFile('ImportMasters else', JSON.stringify(res))

                    Swal.fire({
                        title: 'Imported Failed',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                }
            }).catch(function (err) {
                ErrorLog.writeLogFile('ImportMasters catch', JSON.stringify(err))
                Swal.fire({
                    title: 'Imported Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
            });

        } else if (result.isDenied) {
        }
    })

}

// $.fn.ExportBills = function (event) {
//     Swal.fire({
//         button: false,
//         width: 200,
//         height: 20,
//         closeOnClickOutside: false,
//         closeOnEsc: false,
//         showConfirmButton: false,
//         allowOutsideClick: false,
//         imageUrl: "../../assets/images/Loader.gif"
//     })
//     ItemDbService.insertSaleHeaderToMySQLDB().then(function (data) {
//         Swal.fire({
//             title: 'Bills Exported',
//             width: 500,
//             height: 200,
//             position: 'center',
//             icon: 'success',
//             timer: 1500
//         })
//     })
//         .catch(function (err) {
//             ErrorLog.writeLogFile('insertSaleHeaderToMySQLDB', JSON.stringify(err))

//             Swal.fire({
//                 title: 'Bills Export Failed',
//                 icon: 'error',
//                 confirmButtonColor: '#d33',
//                 cancelButtonColor: '#3085d6',
//                 allowOutsideClick: false,
//                 confirmButtonText: 'OK'
//             })
//         })
// }




function calendar1(month, year) {
    debugger
    var current = new Date();
    var cyear = current.getFullYear();
    var cmonth = current.getMonth();
    var day = current.getDate();
    var tempMonth = month + 1; //+1; //Used to match up the current month with the correct start date.
    var prevMonth = month - 1;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const days = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() - 1;


    date.innerHTML = months[month] + " " + year;
    var padding = "";
    var totalFeb = "";
    var i = 1;
    var IsDayPosEnd = 1;



    //Determing if Feb has 28 or 29 days in it.
    if (month == 1) {
        if ((year % 100 !== 0) && (year % 4 === 0) || (year % 400 === 0)) {
            totalFeb = 29;
        } else {
            totalFeb = 28;
        }
    }

    var monthNames = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"];
    var totalDays = ["31", "" + totalFeb + "", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31"];
    var DayInfo = DayList
    var tempDate = new Date(tempMonth + ' 1 ,' + year);
    var tempweekday = tempDate.getDay();
    var tempweekday2 = tempweekday;
    var dayAmount = totalDays[month];

    while (tempweekday > 0) {
        padding += "<td class='premonth'></td>";
        tempweekday--;
    }
    for (let item in DayInfo) {
        debugger
        if (tempweekday2 > 6) {
            tempweekday2 = 0;
            padding += "</tr><tr>";
        }
        var next = day + 1
        if (year == cyear) {
            debugger
            if (month == cmonth) {
                debugger
                if (i == day) {
                    if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0) {
                        padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + "<button class='btn btn-primary btn-xs' id='viewsales' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 0 + ")'>View Sales</button>" + "<BR>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 1 + ")'>Day End</button>" + "</td>";
                    } else if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 1) {
                        padding += "<td class='currentday' style=  'background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                    else if (DayInfo[item].DayStart == 0 && DayInfo[item].DayEnd == 0) {
                        padding += "<td class='currentday'   style='background-color:green'>" + i + "<BR>" + "<button class='btn btn-primary btn-xs' onclick='$(this).AddDayStartPOSBillCounter(" + i + "," + month + "," + year + "," + 0 + ")'>Day Start</button>" + "</td>";
                    }
                } else if (day > i) {
                    if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0) {
                        padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + "<button  class='btn btn-primary btn-xs' id='viewsales' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 0 + ")'>View Sales</button>" + "<BR>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 1 + ")'>Day End</button>" + "</td>";
                    } else if (DayInfo[item].DayStart == 0 && DayInfo[item].DayEnd == 0) {
                        padding += "<td class='currentmonth'   style='background-color:green'>" + i + "<BR>" + "<button class='btn btn-primary btn-xs' onclick='$(this).AddDayStartPOSBillCounter(" + i + "," + month + "," + year + "," + 0 + ")'>Day Start</button>" + "</td>";
                        //padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                    else {
                        padding += "<td class='currentmonth' style='background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                }
                else if (day < i) {
                    padding += "<td class='currentmonth'  style='background-color:#9e9c96'>" + i + "</td>";
                }
                else {
                    padding += "<td class='currentmonth'>" + i + "</td>";
                }
            } else if (cmonth > month) {
                if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0) {
                    padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + "<button class='btn btn-primary btn-xs' id='viewsales' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 0 + ")'>View Sales</button>" + "<BR>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 1 + ")'>Day End</button>" + "</td>";
                }
                else if (DayInfo[item].DayStart == 0 && DayInfo[item].DayEnd == 0) {
                    padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";

                }
                else if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 1) {
                    padding += "<td class='currentmonth' style='background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                }

                debugger
            } else {
                padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "</td>";
            }
        }
        else if (year < cyear) {

            if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0) {
                padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + "<button class='btn btn-primary btn-xs' id='viewsales' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 0 + ")'>View Sales</button>" + "<BR>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + "," + 1 + ")'>Day End</button>" + "</td>";
            } else {
                padding += "<td class='currentmonth' style='background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";

            }
            // padding += "<td class='currentmonth' style='background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
        }
        else if (year > cyear) {
            padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "</td>";
        }

        tempweekday2++;
        i++;

    }
    var calendarTable = "<table class='calendar'> <tr class='currentmonth'><td>Sun</td>  <td>Mon</td> <td>Tues</td> <td>Wed</td> <td>Thurs</td> <td>Fri</td> <td>Sat</td></tr>";

    calendarTable += padding;
    calendarTable += "</tr></table>";
    document.getElementById("calendar").innerHTML = ''
    document.getElementById("calendar").innerHTML = calendarTable;
}

//function to add month and year on prev and next button
function prevMonth() {
    month--;
    if (month < 0) {
        month = 11;
        year--;
    }
    GetCalendarsForPOSApp(month, year)
}

function nextMonth() {
    month++;
    if (month > 11) {
        month = 0;
        year++;
    }
    GetCalendarsForPOSApp(month, year)
}

//calendar1(month, year)


$.fn.AddDayStartPOSBillCounter = function (seldate, selmonth, selyear) {
    debugger
    var d = new Date(selyear, selmonth, seldate)
    let newdate = formatDate(d);
    let Item = {
        "POSId": store.get('POSId'),
        "Date": newdate,
        "IsDayStart": 1,
        "CompanyId": environment.CompanyId,
        "Source": environment.PageUrl.admin,
        "Ref": store.get('Ref')
    }
    $.post(environment.apiURL + '/AddDayStartPOS', Item, function (data) {
        let res = JSON.parse(data);
        debugger
        if (res.Status == "valid") {
            Swal.fire({
                title: 'Day Started',
                width: 500,
                height: 200,
                position: 'center',
                icon: 'success',
                timer: 1500
            })
            GetCalendarsForPOSApp(today.getUTCMonth(), today.getFullYear())
        }
        else if (res.Status == 'invalid') {
            ErrorLog.writeLogFile('AddDayStartPOS invalid', JSON.stringify(res))
            Swal.fire({
                title: 'Day Started Failed',
                icon: 'error',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        }
        else {
            ErrorLog.writeLogFile('AddDayStartPOS else', JSON.stringify(res))
            Swal.fire({
                title: 'Day Started Failed',
                icon: 'error',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('AddDayStartPOS', JSON.stringify(err))
        Swal.fire({
            title: 'Day Started Failed',
            icon: 'error',
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        })
    })

}



function GetCalendarsForPOSApp(selmonth, selyear) {
    debugger

    var date = new Date();
    var month = selmonth + 1; //months from 1-12
    //var day = dateObj.getUTCDate();
    var year = selyear;
    //  let newdate = formatDate(dateObj);
    let newdate = year + "-" + ("0" + month).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    let Item = {
        "POSId": store.get('POSId'),
        "CompanyId": environment.CompanyId,
        "SelectedDate": newdate
    }

    $.post(environment.apiURL + '/GetCalendarsForPOSApp', Item, function (data) {
        debugger
        let res = JSON.parse(data);
        if (res.Status == "valid") {
            debugger
            DayList = res.Data
            Swal.close()
            calendar1(selmonth, selyear)
        }
        else if (res.Status == "invalid") {
            ErrorLog.writeLogFile('GetCalendarsForPOSApp invalid', JSON.stringify(res))

            Swal.fire({
                title: 'GetCalendarsForPOSApp Failed',
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                allowOutsideClick: false,
                confirmButtonText: 'OK'
            })
        } else {
            ErrorLog.writeLogFile('GetCalendarsForPOSApp else', JSON.stringify(res))
            Swal.fire({
                title: 'GetCalendarsForPOSApp Failed',
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                allowOutsideClick: false,
                confirmButtonText: 'OK'
            })

        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('GetCalendarsForPOSApp catch', JSON.stringify(err))
        Swal.fire({
            title: 'GetCalendarsForPOSApp Failed. try again later!',
            icon: 'error',
            allowOutsideClick: false,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) {
                store.delete('loginToken');
                store.delete('UserPOSId');
                ipcRenderer.invoke('Navigate', environment.PageUrl.login);
            }
        })
    })
};


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


$.fn.openPOSSales = function (seldate, selmonth, selyear, type) {
    var d = new Date(selyear, selmonth, seldate)
    let newdate = formatDate(d);
    let displayDate = ("0" + seldate).slice(-2) + "/" + ("0" + (selmonth + 1)).slice(-2) + "/" + selyear;
    let Item = {
        "POSId": store.get('POSId'),
        "CompanyId": environment.CompanyId,
        "SelectedDate": newdate,
        "DisplayDate": displayDate,
        "Type": type
    }

    loadUserList(Item);

}
$.fn.printBillCounter = function (BillCounterId, POSDayEndId, DayEndDate, IsCancelledBills) {
    showLoading();
    debugger;
    let d = new Date();
    let TodayDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

    let Item = {
        "POSId": store.get('POSId'),
        "POSName": selectedPOSName,
        "POSDayEndId": POSDayEndId,
        "BillCounterId": BillCounterId,
        "DayEndDate": DayEndDate,
        "IsCancelledBills": IsCancelledBills,
        "TodayDate": TodayDate,
        "CompanyId": environment.CompanyId,
    }
    //  // console.log('Item ==', Item)

    $.post(environment.apiURL + '/GetPOSDayCounterDayEndReport', Item, function (data) {
        debugger
        let res = JSON.parse(data);
        //  // console.log('res ==', res)
        if (res.Status == "valid") {
            if (res.Data.length > 0) {
                debugger
                setTimeout(function () {
                    debugger
                    store.delete('loginToken');
                    ipcRenderer.invoke('PrintBillReport', res.Data);
                    Swal.close();
                }, 1500)

            }
        }
        else if (res.Status == "invalid") {
            ErrorLog.writeLogFile('GetPOSDayCounterDayEndReport invalid', JSON.stringify(res))

            Swal.fire(
                'Oops!',
                'GetPOSDayCounterDayEndReport details wrong . try again later!',
                'warning'
            );
        } else {
            ErrorLog.writeLogFile('GetPOSDayCounterDayEndReport else', JSON.stringify(res))

            Swal.fire(
                'Oops!',
                'GetPOSDayCounterDayEndReport details wrong . try again later!',
                'warning'
            );
        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('GetPOSDayCounterDayEndReport catch', JSON.stringify(err))
        Swal.fire(
            'Oops!',
            'GetPOSDayCounterDayEndReport Failed. try again later!',
            'warning'
        );
    })
}

function loadUserList(Item) {
    debugger
    var itemList = [];
    let counter = 0;
    let user_list = '';
    let selectedItemsForView = `<table id="table" border=1>
   <thead>
       <tr>
           <th style="text-align:center" width='300px'>Counter Name</th>
           <th style="text-align:center"  width='150px'>Total Bills</th>
           <th style="text-align:center"  width='250px'>Total Cancelled Bills</th>
           <th style="text-align:center"   width='150px'>Day End</th>
       </tr>
   </thead><tbody>`

    $('#product_list').empty();
    var title = "Day Summary: " + selectedPOSName + ' - ' + Item.DisplayDate

    $.post(environment.apiURL + '/GetPOSViewSales', Item, function (data) {
        debugger
        let res = JSON.parse(data);
        if (res.Status == "valid") {
            debugger
            itemList = res.Data;
            debugger
            itemList.forEach((item, index) => {
                counter++;
                let DayEndDate = "'" + item.DayEndDate + "'";
                selectedItemsForView += `<tr>
                        <td>${item.BillCounterName}</td>
                        <td>${item.TotalBills}</td>
                        <td>${item.TotalCancelledBills}</td>
                        <td>${item.IsDayEnd == 1 ?
                        `<span class="btn-group"><span style="color:green" class="glyphicon glyphicon-ok"><span>&nbsp&nbsp&nbsp&nbsp</span><span onclick="$(this).printBillCounter(${item.BillCounterId}, ${item.POSDayEndId} , ${DayEndDate} , ${item.IsCancelledBills})" style="color:green; font-size: 18px; cursor: pointer;" class="glyphicon glyphicon-print"></span></span></span>`
                        : '<span class="btn-group"><span style="color:red" class="glyphicon glyphicon-remove"></span></span>'
                    }</td>
                        </tr></tbody>`;
            });
            let dayendLength = itemList.filter(x => x.IsDayEnd == 1)
            let counterDayEndlist = itemList.filter(x => x.IsDayEnd == 0);
            let isAllDayend = (dayendLength.length == itemList.length)
            if (Item['Type'] == 0) {
                Swal.fire({
                    title: '<strong>' + title + '</strong>',
                    width: 680,
                    html: selectedItemsForView,
                    showCloseButton: true,
                    allowOutsideClick: false,
                    focusConfirm: false
                })
            }
            else if (Item['Type'] == 1) {
                debugger
                let swalWithBootstrapButtons;
                // if (counterDayEndlist.length > 0) {
                //     debugger
                //     swalWithBootstrapButtons = Swal.mixin({
                //         customClass: {
                //             confirmButton: 'btn btn-success',
                //             cancelButton: 'btn btn-danger',
                //             denyButton: 'btn btn-success',
                //         },
                //         buttonsStyling: false,
                //         showDenyButton: true,
                //         denyButtonText: 'Update Counter DayEnd',

                //     })
                // }
                // else {
                //     debugger
                //     swalWithBootstrapButtons = Swal.mixin({
                //         customClass: {
                //             confirmButton: 'btn btn-success',
                //             cancelButton: 'btn btn-danger'
                //         },
                //         buttonsStyling: false,
                //     })
                // }
                swalWithBootstrapButtons = Swal.mixin({
                    customClass: {
                        confirmButton: 'btn btn-success',
                        cancelButton: 'btn btn-danger'
                    },
                    buttonsStyling: false,
                })

                swalWithBootstrapButtons.fire({
                    title: '<strong>' + title + '</strong>',
                    html: selectedItemsForView,
                    width: 800,
                    showCancelButton: true,
                    //  showConfirmButton: isAllDayend ? true : false,
                    confirmButtonText: 'POS DayEnd !',
                    cancelButtonText: 'Cancel',
                    allowOutsideClick: false,
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        debugger
                        //    console.log("counterDayEndlist", counterDayEndlist)

                        if (itemList.length == 1 && counterDayEndlist.length != 0) {
                            Swal.fire({
                                title: 'Make sure to close the Bill counter Before POS Dayend..!',
                                showCancelButton: false,
                                icon: 'warning',
                                confirmButtonText: 'Ok',
                                cancelButtonText: 'No',

                            })
                        }
                        else if (counterDayEndlist.length > 0) {
                            Swal.fire({
                                title: 'Some Counters are not completed the Dayend process. Are you sure want to continue the POS DayEnd?',
                                showCancelButton: true,
                                icon: 'question',
                                confirmButtonText: 'Yes',
                                cancelButtonText: 'No',
                            }).then(async (result) => {
                                if (result.isConfirmed) {
                                    showLoading();
                                    await updatePOSBillCounterWiseDayEnd(counterDayEndlist, Item['SelectedDate']);
                                }
                            })

                        } else {
                            showLoading();
                            updateposDayEndBills(Item['SelectedDate']);
                        }

                        // $.post(environment.apiURL + '/GetPOSDayEndBills', {
                        //     "POSId": environment.POSId,
                        //     "SaleDate": Item['SelectedDate'],
                        //     "CompanyId": environment.CompanyId
                        // }, function (data) {
                        //     debugger
                        //     let res = JSON.parse(data);
                        //     if (res.Status == "valid") {
                        //         debugger
                        //         let DayEndHeader = res.Data.DayEndList
                        //         let DayEndCashDenominations = res.Data.DayEndCashDenominations
                        //         let SalesHeaderList = res.Data.HeaderList
                        //         let SalesDetailList = res.Data.DetailList
                        //         let DayEndCashExpenses = res.Data.DayEndCashExpenses;
                        //         let OrderBookingHeaderList = res.Data.OrderBookingHeaderList;
                        //         let OrderBookingDetailList = res.Data.OrderBookingDetailList;
                        //         let OrderBookingPaymentList = res.Data.OrderBookingPaymentList;
                        //         let OrderBookingVesselsList = res.Data.OrderBookingVesselsList;

                        //         // // console.log("SalesHeaderList", JSON.stringify(SalesHeaderList))
                        //         // // console.log("SalesDetailList", JSON.stringify(SalesDetailList))
                        //         // // console.log("OrderBookingHeaderList", JSON.stringify(OrderBookingHeaderList))
                        //         // // console.log("OrderBookingDetailList", JSON.stringify(OrderBookingDetailList))
                        //         // // console.log("OrderBookingPaymentList", JSON.stringify(OrderBookingPaymentList))
                        //         // // console.log("OrderBookingVesselsList", JSON.stringify(OrderBookingVesselsList))
                        //         $.post(environment.webApiURL + '/UpdatePOSDayEndBills', {

                        //             "POSId": environment.POSId,
                        //             "CompanyId": environment.CompanyId,
                        //             "DayEndDate": Item['SelectedDate'],
                        //             "DayEndHeader": JSON.stringify(DayEndHeader),
                        //             "DayEndCashDenominations": JSON.stringify(DayEndCashDenominations),
                        //             "DayEndCashExpenses": JSON.stringify(DayEndCashExpenses),
                        //             "SalesHeaderList": JSON.stringify(SalesHeaderList),
                        //             "SalesDetailList": JSON.stringify(SalesDetailList),
                        //             "OrderBookingHeaderList": JSON.stringify(OrderBookingHeaderList),
                        //             "OrderBookingDetailList": JSON.stringify(OrderBookingDetailList),
                        //             "OrderBookingPaymentList": JSON.stringify(OrderBookingPaymentList),
                        //             "OrderBookingVesselsList": JSON.stringify(OrderBookingVesselsList),
                        //             "Source": environment.PageUrl.admin,
                        //             "Ref": store.get('Ref')
                        //         }, function (data) {
                        //             debugger
                        //             let res = JSON.parse(data);
                        //             if (res.Status == "valid") {
                        //                 if (res.Data[0].length > 0) {
                        //                     let outOfStockView = `
                        //                     <table id="table" border=1>
                        //                     <thead>
                        //                         <tr>
                        //                             <th style="text-align:center" width='300px'>Item Name</th>
                        //                             <th style="text-align:center"  width='150px'>Available</th>
                        //                             <th style="text-align:center"   width='150px'>Sale</th>
                        //                         </tr>
                        //                     </thead><tbody>`;
                        //                     res.Data[0].forEach(row => {
                        //                         outOfStockView += `<tr>
                        //                         <td>${row.ItemWithBrandName}</td>
                        //                         <td>${row.Available}</td>
                        //                         <td>${row.RequestedQuantity}</td>
                        //                         </tr>
                        //                         `
                        //                     });
                        //                     outOfStockView += `</tbody></table>`;

                        //                     Swal.fire({
                        //                         title: 'Out of stock!',
                        //                         // text: "Out of stock!",
                        //                         html: outOfStockView,
                        //                         icon: 'warning',
                        //                         showCancelButton: false,
                        //                         confirmButtonColor: '#d33',
                        //                         allowOutsideClick: false,
                        //                         confirmButtonText: 'Ok'
                        //                     }).then((result) => {
                        //                         if (result.value) {
                        //                             return;
                        //                         }
                        //                     });
                        //                 }
                        //                 else {
                        //                     $.post(environment.apiURL + '/UpdatePOSDayEnd', {
                        //                         "POSId": environment.POSId,
                        //                         "CompanyId": environment.CompanyId,
                        //                         "Date": Item['SelectedDate'],
                        //                         "Source": environment.PageUrl.admin,
                        //                         "Ref": store.get('Ref')

                        //                     }, function (data) {
                        //                         let res = JSON.parse(data);
                        //                         Swal.fire({
                        //                             title: ' Dayended Successfully',
                        //                             width: 500,
                        //                             height: 200,
                        //                             position: 'center',
                        //                             icon: 'success',
                        //                             timer: 3500
                        //                         })
                        //                         GetCalendarsForPOSApp(today.getUTCMonth(), today.getFullYear())

                        //                     }).catch(function (err) {
                        //                         ErrorLog.writeLogFile('UpdatePOSDayEnd', err)

                        //                         Swal.fire({
                        //                             title: 'UpdatePOSDayEnd Failed',
                        //                             icon: 'error',
                        //                             allowOutsideClick: false,
                        //                             confirmButtonColor: '#d33',
                        //                             cancelButtonColor: '#3085d6',
                        //                             confirmButtonText: 'OK'
                        //                         })
                        //                     })
                        //                     GetCalendarsForPOSApp(today.getUTCMonth(), today.getFullYear())
                        //                 }

                        //             }
                        //             else if (res.Status == "invalid") {
                        //                 debugger
                        //                 ErrorLog.writeLogFile('UpdatePOSDayEndBills', res.Error.sqlMessage)

                        //                 Swal.fire({
                        //                     title: res.Error.sqlMessage,
                        //                     icon: 'error',
                        //                     confirmButtonColor: '#d33',
                        //                     cancelButtonColor: '#3085d6',
                        //                     confirmButtonText: 'OK',
                        //                     allowOutsideClick: false,

                        //                 })
                        //             }
                        //             else {
                        //                 Swal.fire({
                        //                     title: res.Error.sqlMessage,
                        //                     icon: 'error',
                        //                     confirmButtonColor: '#d33',
                        //                     cancelButtonColor: '#3085d6',
                        //                     allowOutsideClick: false,
                        //                     confirmButtonText: 'OK'
                        //                 })
                        //             }
                        //         }).catch(function (err) {
                        //             debugger
                        //             Swal.fire({
                        //                 title: 'WebAPI was Disconnected.',
                        //                 icon: 'error',
                        //                 allowOutsideClick: false,
                        //                 confirmButtonColor: '#d33',
                        //                 cancelButtonColor: '#3085d6',
                        //                 confirmButtonText: 'OK'
                        //             })
                        //             ErrorLog.writeLogFile('UpdatePOSDayEndBills', 'WebAPI was Disconnected.')

                        //         })
                        //     }
                        //     else if (res.Status == "invalid") {
                        //         ErrorLog.writeLogFile('GetPOSDayEndBills', res.Error)

                        //         Swal.fire({
                        //             title: ' GetPOSDayEndBills invalid',
                        //             icon: 'error',
                        //             confirmButtonColor: '#d33',
                        //             cancelButtonColor: '#3085d6',
                        //             allowOutsideClick: false,
                        //             confirmButtonText: 'OK'
                        //         })
                        //     }
                        //     else {
                        //         Swal.fire({
                        //             title: ' GetPOSDayEndBills API Connection Failed',
                        //             icon: 'error',
                        //             confirmButtonColor: '#d33',
                        //             allowOutsideClick: false,
                        //             cancelButtonColor: '#3085d6',
                        //             confirmButtonText: 'OK'
                        //         })
                        //     }
                        // }).catch(function (err) {
                        //     ErrorLog.writeLogFile('GetPOSDayEndBills', err)
                        //     Swal.fire({
                        //         title: 'GetPOSDayEndBills API Failed',
                        //         icon: 'error',
                        //         allowOutsideClick: false,
                        //         confirmButtonColor: '#d33',
                        //         cancelButtonColor: '#3085d6',
                        //         confirmButtonText: 'OK'
                        //     })
                        // })

                    } else if (result.dismiss === Swal.DismissReason.cancel) {

                    }
                    // else if (result.isDenied) {
                    //     updatePOSBillCounterWiseDayEnd(counterDayEndlist);
                    // }

                })
            }
        }
        else if (res.Status == 'invalid') {
            debugger
            ErrorLog.writeLogFile('GetPOSViewSales invalid', JSON.stringify(res))

            Swal.fire(
                'Oops!',
                'GetPOSViewSales Failed . try again later!',
                'warning'
            );
        }
        else {
            ErrorLog.writeLogFile('GetPOSViewSales else', JSON.stringify(res))
            Swal.fire(
                'Oops!',
                'GetPOSViewSales Failed . try again later!',
                'warning'
            );
        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('GetPOSViewSales catch', JSON.stringify(err))
        Swal.fire(
            'Oops!',
            'GetPOSViewSales Failed . try again later!',
            'warning'
        );
    });

}

function updateposDayEndBills(SelectedDate) {

    if (SelectedDate != '') {
        // // console.log('SelectedDate',SelectedDate);
        $.post(environment.apiURL + '/GetPOSDayEndBills', {
            "POSId": store.get('POSId'),
            "SaleDate": SelectedDate,
            "CompanyId": environment.CompanyId
        }, function (data) {
            debugger
            let res = JSON.parse(data);
            if (res.Status == "valid") {
                debugger
                let DayEndHeader = res.Data.DayEndList
                let DayEndCashDenominations = res.Data.DayEndCashDenominations
                let SalesHeaderList = res.Data.HeaderList
                let SalesDetailList = res.Data.DetailList
                let DayEndCashExpenses = res.Data.DayEndCashExpenses;
                let OrderBookingHeaderList = res.Data.OrderBookingHeaderList;
                let OrderBookingDetailList = res.Data.OrderBookingDetailList;
                let OrderBookingPaymentList = res.Data.OrderBookingPaymentList;
                let OrderBookingVesselsList = res.Data.OrderBookingVesselsList;
                let DeletePOSSaleList = res.Data.DeletePOSSaleList;
                let DayEndBillReprintLogs = res.Data.BillReprintLogs;
                // console.log('IsAllowNegativeStock 1==',IsAllowNegativeStock);
                //  console.log('DayEndHeader',DayEndHeader);

                let posdetails = {
                    "POSId": store.get('POSId'),
                    "CompanyId": environment.CompanyId,
                    "IsAllowNegativeStock": IsAllowNegativeStock,
                    "DayEndDate": SelectedDate,
                    "DayEndHeader": JSON.stringify(DayEndHeader),
                    "DayEndDeletePOSSales": JSON.stringify(DeletePOSSaleList),
                    "DayEndBillReprintLogs": JSON.stringify(DayEndBillReprintLogs),
                    "DayEndCashDenominations": JSON.stringify(DayEndCashDenominations),
                    "DayEndCashExpenses": JSON.stringify(DayEndCashExpenses),
                    "SalesHeaderList": JSON.stringify(SalesHeaderList),
                    "SalesDetailList": JSON.stringify(SalesDetailList),
                    "OrderBookingHeaderList": JSON.stringify(OrderBookingHeaderList),
                    "OrderBookingDetailList": JSON.stringify(OrderBookingDetailList),
                    "OrderBookingPaymentList": JSON.stringify(OrderBookingPaymentList),
                    "OrderBookingVesselsList": JSON.stringify(OrderBookingVesselsList),
                    "Source": environment.PageUrl.admin,
                    "Ref": store.get('Ref')
                }
                // ErrorLog.writeLogFile(`= SelectedDate , UpdatePOSDayEndBills = ${JSON.stringify(posdetails)} `, SelectedDate)
                $.post(environment.webApiURL + '/UpdatePOSDayEndBills', posdetails, function (data) {
                    debugger;
                    let res = JSON.parse(data);
                    // console.log('UpdatePOSDayEndBills  ==',res);
                    let outOfStocklist = '';
                    if (res.Status == "valid") {
                        outOfStocklist = res.Data[0];
                        datalist = outOfStocklist
                        // console.log("outOfStocklist",outOfStocklist)
                        if (outOfStocklist.length > 0) {
                            debugger;
                            let Item = {
                                "POSId": store.get('POSId'),
                            }
                            $.post(environment.apiURL + '/GetPOSNegativeStock', Item, function (data) {
                                let res = JSON.parse(data);
                                debugger;
                                //  console.log(res)
                                if (res.Status == "valid") {
                                    debugger;
                                    let POSDetail = res.Data[0]; // check NegativeStock values
                                    IsAllowNegativeStock = POSDetail.IsAllowNegativeStock;
                                    ErrorLog.writeLogFile(`= SelectedDate , GetPOSNegativeStock = ${JSON.stringify(outOfStocklist)} `, SelectedDate);
                                    let ArrayDate = SelectedDate.split('-');
                                    let frontformatedate = ArrayDate[2] + '-' + ArrayDate[1] + '-' + ArrayDate[0];
                                    let outOfStockView = `
                                    <div class="label label-danger" style="font-size: 18px; text-align:center"><b> Please Approve the Today Received Items</b>
                                    </div>
                                    <div id="outofstocktable">
                                        <div>
                                            <div class="col-md-6">
                                                <h4 id='dayendDate'>Date :  ${frontformatedate} </h4>
                                            </div>
                                            <div class="col-md-6">
                                                <h4 id='posheader'>POS  :  ${selectedPOSName} </h4>
                                            </div>
                                        </div>
                                    <table  border=1>
                                    <thead>
                                        <tr>
                                            <th style="text-align:center" width='300px'>Item Name</th>
                                            <th style="text-align:center" width='150px'>Available</th>
                                            <th style="text-align:center" width='150px'>Sale</th>
                                            <th style="text-align:center" width='150px'>Difference</th>
                                        </tr>
                                    </thead><tbody>`;
                                    outOfStocklist.forEach(row => {

                                        let Difference = (row.RequestedQuantity - row.Available).toFixed(3)
                                        outOfStockView += `<tr>
                                        <td>${row.ItemWithBrandName}</td>
                                        <td style="text-align:center" >${row.Available}</td>
                                        <td style="text-align:center" >${row.RequestedQuantity}</td>
                                        <td style="text-align:center" >-${Difference}</td>`
                                        // if(row.Available<0){
                                        //     outOfStockView +=` <td>${row.Available + row.RequestedQuantity}</td>`
                                        // }else{
                                        //     outOfStockView +=`<td>${row.Available - row.RequestedQuantity}</td>`
                                        // }
                                        outOfStockView += `<tr>`
                                    });
                                    outOfStockView += `</tbody></table></div>`;
                                    //  console.log('IsAllowNegativeStock 2==',IsAllowNegativeStock);
                                    debugger;
                                    if (IsAllowNegativeStock == 1) {
                                        debugger;
                                        let BootstrapButtons = Swal.mixin({
                                            customClass: {
                                                confirmButton: 'btn btn-success',
                                                cancelButton: 'btn btn-danger',
                                                denyButton: 'btn btn-warning',
                                            },
                                            buttonsStyling: false,
                                        })
                                        BootstrapButtons.fire({
                                            title: 'Out of stock!',
                                            html: outOfStockView,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            reverseButtons: true,
                                            showDenyButton: true,
                                            confirmButtonColor: '#d33',
                                            allowOutsideClick: false,
                                            confirmButtonText: 'POS DayEnd !',
                                            cancelButtonText: 'Cancel',
                                            denyButtonText: 'Print '
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                showLoading();
                                                updateposDayEndBills(SelectedDate)
                                            }
                                            else if (result.isDenied) {
                                                //  showLoading(); 
                                                IsAllowNegativeStock = 0;
                                                OutOfStockPrint(SelectedDate, outOfStockView);
                                            }
                                            else if (result.value) {
                                                IsAllowNegativeStock = 0;
                                                return;
                                            }
                                            else if (result.isDismissed) {
                                                IsAllowNegativeStock = 0;
                                            }
                                        });
                                    }
                                    else {
                                        debugger;
                                        Swal.fire({
                                            title: 'Out of stock!',
                                            // text: "Out of stock!",
                                            html: outOfStockView,
                                            icon: 'warning',
                                            showCancelButton: false,
                                            confirmButtonColor: '#d33',
                                            allowOutsideClick: false,
                                            confirmButtonText: 'Ok'
                                        }).then((result) => {
                                            if (result.value) {
                                                return;
                                            }
                                        });

                                    }
                                }
                                else if (res.Status == "invalid") {
                                    debugger;
                                    IsAllowNegativeStock = 0;
                                    ErrorLog.writeLogFile('GetPOSNegativeStock invalid', JSON.stringify(res))
                                    Swal.fire({
                                        title: 'POSNegativeStock ' + res.Error.sqlMessage,
                                        icon: 'error',
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'OK',
                                        allowOutsideClick: false,
                                    })
                                }
                                //        console.log('IsAllowNegativeStock 3 =', IsAllowNegativeStock);
                            }).catch(function (err) {
                                debugger;
                                IsAllowNegativeStock = 0;
                                ErrorLog.writeLogFile('GetPOSNegativeStock catch', JSON.stringify(err))
                                Swal.fire({
                                    title: 'POS Negative Stock was Faild.',
                                    icon: 'error',
                                    allowOutsideClick: false,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                })
                            })

                            /*

                            let outOfStockView = `
                            <table id="table" border=1>
                            <thead>
                                <tr>
                                    <th style="text-align:center" width='300px'>Item Name</th>
                                    <th style="text-align:center" width='150px'>Available</th>
                                    <th style="text-align:center" width='150px'>Sale</th>
                                </tr>
                            </thead><tbody>`;
                            res.Data[0].forEach(row => {
                                outOfStockView += `<tr>
                                <td>${row.ItemWithBrandName}</td>
                                <td>${row.Available}</td>
                                <td>${row.RequestedQuantity}</td>
                                </tr>
                                `
                            });
                            outOfStockView += `</tbody></table>`;

                            // console.log('POSDetail 21==',POSDetail);
                            debugger;
                            if(POSDetail.IsAllowNegativeStock == 1){
                                debugger;
                                let BootstrapButtons = Swal.mixin({
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                        cancelButton: 'btn btn-danger'
                                    },
                                    buttonsStyling: false,
                                })
                               BootstrapButtons.fire({
                                    title: 'Out of stock!',
                                    // text: "Out of stock!",
                                    html: outOfStockView,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#d33',
                                    allowOutsideClick: false,
                                    confirmButtonText: 'POS DayEnd !',
                                    cancelButtonText: 'Ok',
                                    reverseButtons: true,
                                    // showDenyButton: true,
                                    // denyButtonText: 'Update Counter DayEnd'
                                }).then((result) => {
                                    if (result.value) {
                                        return;
                                    }
                                });
                            }
                            else{
                                debugger;
                                Swal.fire({
                                    title: 'Out of stock!',
                                    // text: "Out of stock!",
                                    html: outOfStockView,
                                    icon: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#d33',
                                    allowOutsideClick: false,
                                    confirmButtonText: 'Ok'
                                }).then((result) => {
                                    if (result.value) {
                                        return;
                                    }
                                });

                            }*/
                        }
                        else {
                            $.post(environment.apiURL + '/UpdatePOSDayEnd', {
                                "POSId": store.get('POSId'),
                                "CompanyId": environment.CompanyId,
                                "Date": SelectedDate,
                                "Source": environment.PageUrl.admin,
                                "Ref": store.get('Ref')

                            }, function (data) {
                                let res = JSON.parse(data);
                                IsAllowNegativeStock = 0;
                                Swal.fire({
                                    title: ' Dayended Successfully',
                                    width: 500,
                                    height: 200,
                                    position: 'center',
                                    icon: 'success',
                                    timer: 3500
                                })
                                GetCalendarsForPOSApp(today.getUTCMonth(), today.getFullYear())

                            }).catch(function (err) {
                                IsAllowNegativeStock = 0;
                                ErrorLog.writeLogFile('UpdatePOSDayEnd catch', JSON.stringify(err))

                                Swal.fire({
                                    title: 'UpdatePOSDayEnd Failed',
                                    icon: 'error',
                                    allowOutsideClick: false,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                })
                            })
                            GetCalendarsForPOSApp(today.getUTCMonth(), today.getFullYear())
                        }
                    }
                    else if (res.Status == "invalid") {
                        debugger;
                        IsAllowNegativeStock = 0;
                        ErrorLog.writeLogFile('UpdatePOSDayEndBills invalid', JSON.stringify(res))
                        if (res.Error.sqlMessage == "DayEnd Already done") {
                            Swal.fire({
                                title: res.Error.sqlMessage,
                                icon: 'error',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Update Dayend',
                                allowOutsideClick: false,

                            }).then((res) => {
                                if (res.isConfirmed) {
                                    $.post(environment.apiURL + '/UpdatePOSDayEnd', {
                                        "POSId": store.get('POSId'),
                                        "CompanyId": environment.CompanyId,
                                        "Date": SelectedDate,
                                        "Source": environment.PageUrl.admin,
                                        "Ref": store.get('Ref')

                                    }, function (data) {
                                        let res = JSON.parse(data);
                                        IsAllowNegativeStock = 0;
                                        Swal.fire({
                                            title: ' Dayend Updated Successfully',
                                            width: 500,
                                            height: 200,
                                            position: 'center',
                                            icon: 'success',
                                            timer: 3500
                                        })
                                        GetCalendarsForPOSApp(today.getUTCMonth(), today.getFullYear())
                                    })
                                }

                            })
                        }
                        else {
                            Swal.fire({
                                title: res.Error.sqlMessage,
                                icon: 'error',
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,

                            })
                        }

                    }
                    else {
                        ErrorLog.writeLogFile('UpdatePOSDayEndBills else', JSON.stringify(res))
                        IsAllowNegativeStock = 0;
                        Swal.fire({
                            title: res.Error.sqlMessage,
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            allowOutsideClick: false,
                            confirmButtonText: 'OK'
                        })
                    }
                }).catch(function (err) {
                    debugger;
                    ErrorLog.writeLogFile('UpdatePOSDayEndBillsCatch', JSON.stringify(err))
                    //   console.log("UpdatePOSDayEndBillsCatch", err)
                    IsAllowNegativeStock = 0;
                    Swal.fire({
                        title: 'WebAPI was Disconnected.',
                        icon: 'error',
                        allowOutsideClick: false,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                    ErrorLog.writeLogFile('UpdatePOSDayEndBills', 'WebAPI was Disconnected.')

                })
            }
            else if (res.Status == "invalid") {
                ErrorLog.writeLogFile('GetPOSDayEndBills invalid', JSON.stringify(res));
                IsAllowNegativeStock = 0;
                Swal.fire({
                    title: ' GetPOSDayEndBills invalid',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    allowOutsideClick: false,
                    confirmButtonText: 'OK'
                })
            }
            else {
                ErrorLog.writeLogFile('GetPOSDayEndBills API Connection Failed', JSON.stringify(res))
                IsAllowNegativeStock = 0;
                Swal.fire({
                    title: ' GetPOSDayEndBills API Connection Failed',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    allowOutsideClick: false,
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                })
            }
        }).catch(function (err) {
            IsAllowNegativeStock = 0;
            ErrorLog.writeLogFile('GetPOSDayEndBills catch', JSON.stringify(err))
            Swal.fire({
                title: 'GetPOSDayEndBills API Failed',
                icon: 'error',
                allowOutsideClick: false,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        })
    }
    else {
        IsAllowNegativeStock = 0;
        Swal.fire({
            title: 'SelectedDate Failed',
            icon: 'error',
            allowOutsideClick: false,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        })
        ErrorLog.writeLogFile('SelectedDate Failed', SelectedDate)
    }
}


// function updatePOSBillCounterWiseDayEnd(itemList) {
//     debugger
//     if (itemList.length > 0) {

//         debugger
//         Swal.fire({
//             title: 'Are you sure to Update the Counter DayEnd ?',
//             showCancelButton: true,
//             icon: 'question',
//             confirmButtonText: 'Yes',
//             cancelButtonText: 'No',
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 showLoading();
//                 debugger
//                 let item = [];
//                 for (let i = 0; i < itemList.length; i++) {
//                     item.push({
//                         DayInfoDetailId: itemList[i].DayInfoDetailId,
//                         BillCounterId: itemList[i].BillCounterId,
//                         DayInfoId: itemList[i].DayInfoId,
//                         DayEndDate: itemList[i].DayEndDate,
//                         CompanyId: environment.CompanyId,
//                         POSId: environment.POSId,
//                     })
//                 }
//                 let list = {
//                     DayEndCounterList: item,
//                     CompanyId: environment.CompanyId,
//                     POSId: environment.POSId,
//                     SaleDate: serverDate,
//                     Source: environment.PageUrl.admin,
//                     loginId: store.get('Ref')
//                 }
//                 // // console.log('list', list);

//                 $.post(environment.apiURL + '/UpdatePOSBillCounterWiseDayEnd', list, function (data) {
//                     debugger
//                     let res = JSON.parse(data);
//                     if (res.Status == "valid") {
//                         Swal.fire({
//                             title: 'UpdateCounterDayEnd Successfully',
//                             icon: 'success',
//                             allowOutsideClick: false,
//                             confirmButtonColor: '#5cb85c',
//                             //   cancelButtonColor: '#3085d6',
//                             confirmButtonText: 'OK'
//                         })
//                         updateposDayEndBills(SelectedDate);
//                     }
//                     else if (res.Status == "invalid") {
//                         ErrorLog.writeLogFile('UpdatePOSBillCounterWiseDayEnd', res.Error)
//                         Swal.fire({
//                             title: 'UpdateCounterDayEnd Failed',
//                             icon: 'error',
//                             allowOutsideClick: false,
//                             confirmButtonColor: '#d33',
//                             cancelButtonColor: '#3085d6',
//                             confirmButtonText: 'OK'
//                         })

//                     }
//                     //  // console.log('res',res);
//                 }).catch(function (err) {
//                     ErrorLog.writeLogFile('UpdatePOSBillCounterWiseDayEnd', err)
//                     Swal.fire({
//                         title: 'Counter DayEnd Failed',
//                         icon: 'error',
//                         allowOutsideClick: false,
//                         confirmButtonColor: '#d33',
//                         cancelButtonColor: '#3085d6',
//                         confirmButtonText: 'OK'
//                     })
//                 })
//             }
//         })
//     }
// }

function updatePOSBillCounterWiseDayEnd(itemList, SelectedDate) {
    debugger;
    if (itemList.length > 0) {
        debugger;
        let item = [];
        for (let i = 0; i < itemList.length; i++) {
            item.push({
                DayInfoDetailId: itemList[i].DayInfoDetailId,
                BillCounterId: itemList[i].BillCounterId,
                DayInfoId: itemList[i].DayInfoId,
                DayEndDate: itemList[i].DayEndDate,
                CompanyId: environment.CompanyId,
                POSId: store.get('POSId'),
            })
        }
        let list = {
            DayEndCounterList: item,
            CompanyId: environment.CompanyId,
            POSId: store.get('POSId'),
            SaleDate: serverDate,
            Source: environment.PageUrl.admin,
            loginId: store.get('Ref')
        }
        // // console.log('list', list);

        $.post(environment.apiURL + '/UpdatePOSBillCounterWiseDayEnd', list, async function (data) {
            debugger
            let res = JSON.parse(data);
            if (res.Status == "valid") {
                await updateposDayEndBills(SelectedDate);
            }
            else if (res.Status == "invalid") {
                ErrorLog.writeLogFile('UpdatePOSBillCounterWiseDayEnd invalid', JSON.stringify(res))
                Swal.fire({
                    title: 'Counter DayEnd Failed',
                    icon: 'error',
                    allowOutsideClick: false,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                })
            } else {
                ErrorLog.writeLogFile('UpdatePOSBillCounterWiseDayEnd else', JSON.stringify(res))
                Swal.fire({
                    title: 'Counter DayEnd Failed',
                    icon: 'error',
                    allowOutsideClick: false,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                })
            }
            //  // console.log('res',res);
        }).catch(function (err) {
            ErrorLog.writeLogFile('UpdatePOSBillCounterWiseDayEnd catch', JSON.stringify(err))
            Swal.fire({
                title: 'Counter DayEnd Failed',
                icon: 'error',
                allowOutsideClick: false,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        })

    }
}


$.fn.deletePOSRecords = function () {
    debugger;

    Swal.fire({
        title: 'Are you sure want to clear data ?',
        showCancelButton: true,
        icon: 'question',
        confirmButtonText: 'Yes',
        allowOutsideClick: false,
        cancelButtonText: 'No',
        // width: 400,
        //height:50
    }).then((result) => {

        if (result.isConfirmed) {
            showLoading();

            //// console.log(serverDate);
            $.post(environment.apiURL + '/DeletePOSTransactionRecords', {
                "POSId": store.get('POSId'),
                "CompanyId": environment.CompanyId,
                "Source": environment.PageUrl.admin,
                "Ref": store.get('Ref')
            }, function (data) {

                let res = JSON.parse(data);
                if (res.Status == "valid") {
                    debugger;
                    Swal.close();
                    let DateList = res.Data[0];
                    if (DateList.length > 0) {
                        // i = 0;
                        // DeletePOSRecord(i, DateList)
                        ErrorLog.writeLogFile('Delete POS Record is Success');
                        Swal.fire({
                            title: 'Clear Data Successfully',
                            icon: 'success',
                            confirmButtonColor: '#5cb85c',
                            allowOutsideClick: false,
                            confirmButtonText: 'ok',
                            timer: 1500
                        })
                    } else {
                        Swal.fire({
                            title: 'No More POS Record Details!',
                            icon: 'warning',
                            showCancelButton: false,
                            allowOutsideClick: false,
                            confirmButtonText: 'Ok',
                            // timer: 1500
                        })
                        // Swal.close();
                    }
                }

                else if (res.Status == "invalid") {
                    ErrorLog.writeLogFile('DeletePOSTransactionRecords invalid', JSON.stringify(res))

                    Swal.fire({
                        title: res.Error.sqlMessage,
                        icon: 'error',
                        allowOutsideClick: false,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                }
                else {
                    ErrorLog.writeLogFile('DeletePOSTransactionRecords else', JSON.stringify(res))

                    Swal.fire({
                        title: res.Error.sqlMessage,
                        icon: 'error',
                        allowOutsideClick: false,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                }

            }).catch(function (err) {
                ErrorLog.writeLogFile('DeletePOSTransactionRecords catch', JSON.stringify(err))
                Swal.fire({
                    title: err,
                    icon: 'error',
                    allowOutsideClick: false,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                })
            });
        }
    })
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
    ipcRenderer.send('minimize', '')

});
// function DeletePOSRecord(i, DateList) {
//     debugger;

//     if (i == DateList.length) {

//         Swal.fire({
//             title: 'POS Transaction Records Deleted Successfully',
//             width: 500,
//             height: 200,
//             position: 'center',
//             icon: 'success',
//             timer: 3500
//         })
//         return false;
//     }
//     else {
//         let item = {
//             "Saledate": DateList[i].Saledate,
//             "BillCounterId": DateList[i].BillCounterId,
//             "POSId": environment.POSId,
//             "CompanyId": environment.CompanyId,
//         }
//         BillingdbService.deletePOSRecords(item).then(
//             (result) => {

//                 let res = result;
//                 if (res.Status == "valid") {
//                     debugger;
//                     // // console.log(res);
//                     res.Data = res.Data
//                     i++;
//                     DeletePOSRecord(i, DateList);


//                 }

//                 else if (res.Status == 'invalid') {
//                     Swal.fire(
//                         'Oops!',
//                         res.Error,
//                         'warning'
//                     );
//                     ErrorLog.writeLogFile('DeletePOSRecord', res.Error)

//                 }
//                 else {
//                     Swal.fire(
//                         'Oops!',
//                         result.Error,
//                         'warning'
//                     );
//                     ErrorLog.writeLogFile('DeletePOSRecord', res.Error)


//                 }

//             }).catch(function (err) {
//                 ErrorLog.writeLogFile('DeletePOSRecord', err)
//             });
//     }

// }

function OutOfStockPrint(SelectedDate, outOfStockView) {
    debugger;



    Swal.fire({
        title: 'Are you sure want to print ?',
        showCancelButton: true,
        icon: 'question',
        confirmButtonText: 'print Excel',
        allowOutsideClick: false,
        allowEscapeKey: false,
        cancelButtonText: 'print Pdf'
        // width: 400,
        //height:50
    }).then((result) => {
        debugger
        if (result.isConfirmed) {
            // // Excel download
            //  showLoading();

            excel()




        } else if (result.dismiss === "cancel") {
            debugger
            showLoading();

            // pdf print donwload
            const dtime = new Date();
            let current_time = dtime.getHours() + "-" + dtime.getMinutes() + "-" + dtime.getSeconds();
            let DisplayName = store.get('DisplayName')

            var options = {
                format: "A4",
                orientation: "portrait",
                border: "0mm",
                header: {
                    height: "20mm",
                    contents: `<div style="text-align: center;">User Name : ${DisplayName}</div>`
                },
                footer: {
                    height: "28mm",
                    contents: {
                        first: 'First page',
                        2: 'Second page', // Any page number is working. 1-based index
                        default: '<span style="color: #444;"> </span>/<span>{{pages}}</span>', // fallback value
                        last: 'Last Page'
                    }
                }
            };
            let filename = SelectedDate + "_" + current_time + "_OutOfStock.pdf";
            //let filename= SelectedDate + "-OutOfStock.pdf";

            // Read HTML Template
            var document = {
                html: outOfStockView,
                data: {
                    users: '',
                },
                path: "./NegativeStock/" + filename,
                type: "",
            };

            pdf.create(document, options).then((res) => {
                Swal.close();

                if (res) {
                    Swal.fire({
                        title: 'PDF Download Successfully',
                        icon: 'success',
                        confirmButtonColor: '#5cb85c',
                        confirmButtonText: 'Ok',
                        allowOutsideClick: false,

                    })
                    ErrorLog.writeLogFile('OutOfStockPrint Success , ' + filename + ' = ', JSON.stringify(res))

                }
                else {
                    Swal.fire({
                        title: 'PDF Download Failed!',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: 'Ok',
                        allowOutsideClick: false

                    })
                    ErrorLog.writeLogFile('OutOfStockPrint Error ,' + filename + ' = ', JSON.stringify(res))
                }

            }).catch((error) => {
                Swal.close();
                Swal.fire({
                    title: 'PDF Download Failed!',
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false

                })
                ErrorLog.writeLogFile('OutOfStockPrint Catch Error ,' + filename + ' = ', JSON.stringify(error))
            });
        }

    })





    function excel() {
        let array = []
        array.push([])

        let dataHeader = datalist.map(Object.keys)
        let dataDetail = datalist.map(Object.values)


        array.push(dataHeader[0])
        for (let i = 0; i < dataDetail.length; i++) {
            array.push(dataDetail[i])
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Negative Stock Report');
        worksheet.addRows(array);
        // worksheet.fillFormula('G2:G10', 'C2+1');
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            let filename = "Negative Stock Report_" + SelectedDate + ".xlsx"
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

        })

    }





    // // Landscape export, 2×4 inches example pdf
    // const doc = new jsPDF();
    // doc.text("Hello world!", 10, 10);
    // doc.save("a4.pdf"); // will save the file in the current working directory


    // old Pdf print method

    //  var outofstocktable = document.getElementById("outofstocktable");
    // html2canvas(outofstocktable, {
    //     onrendered: function (canvas) {
    //         var x = outofstocktable;
    //         x.style.display = "none";
    //         var data = canvas.toDataURL();
    //         var docDefinition = {
    //             content: [{
    //                 image: data,
    //                 //   width: 500
    //                 width: 500,
    //                 //  height: 800,
    //             }]
    //         };
    //         pdfMake.createPdf(docDefinition).download(SelectedDate + "-OutOfStock.pdf");
    //     }
    // });
}

