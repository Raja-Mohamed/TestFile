let Store = require('electron-store');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
let EncrDecrService = require('../services/encrypt-decrypt.service')
let ItemDbService = require('../database/itemdb')
let BillingdbService = require('../database/billingdb')
var todate = new Date();
let serverDate = todate.getFullYear() + "-" + ("0" + (todate.getMonth() + 1)).slice(-2) + "-" + ("0" + todate.getDate()).slice(-2);
const ErrorLog = require('../services/log');
$.fn.Cancel = function () {
    window.close();
}
document.onkeyup = function (e) {
    debugger;
    if (e.which == 27 && e.code == 'Escape') {
        window.close();
    }

    else {
        return;
    }
};
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
let BillCounterName = store.get('BillCounterName')
document.getElementById("BillCounter").innerText = BillCounterName



const calendar = document.querySelector(".calendar");
const date = document.querySelector(".date");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");



var today = new Date();
var month = today.getMonth();
var year = today.getFullYear();
var DayList = []
const months = [
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


function calendar1(month, year) {
    debugger
    var current = new Date();
    var cyear = current.getFullYear();
    var cmonth = current.getMonth();
    var day = current.getDate();
    var tempMonth = month + 1;

    date.innerHTML = months[month] + " " + year;
    var padding = "";
    var totalFeb = "";
    var i = 1;

    if (month == 1) {
        if ((year % 100 !== 0) && (year % 4 === 0) || (year % 400 === 0)) {
            totalFeb = 29;
        } else {
            totalFeb = 28;
        }
    }

    var DayInfo = DayList
    var tempDate = new Date(tempMonth + ' 1 ,' + year);
    var tempweekday = tempDate.getDay();
    var tempweekday2 = tempweekday;

    while (tempweekday > 0) {
        padding += "<td class='premonth'></td>";
        tempweekday--;
    }
    for (let item in DayInfo) {

        if (tempweekday2 > 6) {
            tempweekday2 = 0;
            padding += "</tr><tr>";
        }
        var next = day + 1
        if (year == cyear) {

            if (month == cmonth) {

                if (i == day) {
                    debugger
                    if ((DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0)) {
                        debugger
                        padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + ")'>Day End</button>" + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                    else if ((DayInfo[item].TotalBills != 0 && DayInfo[item].DayEnd == 0)) {
                        debugger
                        padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + ")'>Day End</button>" + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                    else if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 1) {
                        padding += "<td class='currentday' style=  'background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                    else if (DayInfo[item].DayStart == 0 && DayInfo[item].DayEnd == 0) {
                        padding += "<td class='currentday'   style='background-color:green'>" + i + "<BR>" + "</td>";
                    }
                } else if (day > i) {
                    debugger
                    if ((DayInfo[item].TotalBills != 0 && DayInfo[item].DayEnd == 0) || (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0)) {
                        padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + ")'>Day End</button>" + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                    }
                    else if (DayInfo[item].DayStart == 0 && DayInfo[item].DayEnd == 0) {
                        padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";

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
                debugger
                if (DayInfo[item].TotalBills != 0 && DayInfo[item].DayEnd == 0) {
                    padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + ")'>Day End</button>" + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                } else if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0) {
                    padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + ")'>Day End</button>" + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                } else if (DayInfo[item].DayStart == 0 && DayInfo[item].DayEnd == 0) {
                    padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";

                } else if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 1) {
                    padding += "<td class='currentmonth' style='background-color:skyblue'>" + i + "<BR>" + DayInfo[item].TotalBills + "&nbsp;" + "Bills" + "</td>";
                }

            } else {
                padding += "<td class='currentmonth' style='background-color:#9e9c96'>" + i + "</td>";
            }
        }
        else if (year < cyear) {

            if (DayInfo[item].DayStart == 1 && DayInfo[item].DayEnd == 0) {
                padding += "<td class='currentday'   style='background-color:#db0f31;color:white'>" + i + "<BR>" + "<button  class='btn btn-danger  btn-xs' onclick='$(this).openPOSSales(" + i + "," + month + "," + year + ")'>Day End</button>" + "</td>";
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

function prevMonth() {
    month--;
    if (month < 0) {
        month = 11;
        year--;
    }
    GetCalendarsForBillCounter(month, year)
}

function nextMonth() {
    month++;
    if (month > 11) {
        month = 0;
        year++;
    }
    GetCalendarsForBillCounter(month, year)
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);
GetCalendarsForBillCounter(month, year)



function GetCalendarsForBillCounter(selmonth, selyear) {
    showLoading()

    debugger
    var date = new Date();
    var month = selmonth + 1;
    var year = selyear;
    let newdate = year + "-" + ("0" + month).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    let Item = {
        "POSId": environment.POSId,
        "SelectedDate": newdate,
        "BillCounterId": store.get('BillCounterId'),
        "CompanyId": environment.CompanyId
    }
    $.post(environment.apiURL + '/GetCalendarsForBillCounter', Item, function (data) {

        let res = JSON.parse(data);
        if (res.Status == "valid") {
            DayList = res.Data
            BillingdbService.getIsDayStart(Item).then(async (result) => {
                debugger
                let daystartlist = result
                let startlist = daystartlist.findIndex(x => x.DayEndDate.includes(year + "-" + ("0" + month).slice(-2)))
                daystartlist = daystartlist.filter(x => x.DayEndDate.includes(year + "-" + ("0" + month).slice(-2)))
                if (startlist != -1) {
                    if (daystartlist.length > 0) {
                        let len = daystartlist.length
                        let BillsList = []

                        for (let i = 0; i < daystartlist.length; i++) {
                            let length = parseInt(i) + 1;
                            let date = daystartlist[i].DayEndDate
                            BillingdbService.getIsDayStartTotalBills(date).then( async (resu) => {
                                debugger
                                let TotalBills = resu
                                if (TotalBills.length > 0) {
                                    BillsList[i] = TotalBills[0].TotalBills
                                }
                                else {
                                    BillsList[i] = 0
                                }
                                if (BillsList.length > 0) {
                                    DayList.find(x => x.CalDate == date).TotalBills = BillsList[i]
                                }
                                if (len == length) {
                                 await   calendar1(selmonth, selyear)
                                    Swal.close();
                                }
                            })

                        }
                    } else {
                        calendar1(selmonth, selyear)
                        Swal.close();
                    }
                } else {
                    calendar1(selmonth, selyear)
                    Swal.close();
                }


            })

        }
        else if (res.Status == "invalid") {
            ErrorLog.writeLogFile('GetCalendarsForBillCounter', res.Error)

            Swal.fire({
                title: 'Imported Failed',
                icon: 'error',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        }
    }).catch(function (err) {
        ErrorLog.writeLogFile('GetCalendarsForBillCounter', err)
        Swal.fire({
            title: 'API Was Disconnected',
            icon: 'error',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        })
        ipcRenderer.invoke('OpenDayendReport', newdate);

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


$.fn.openPOSSales = function (seldate, selmonth, selyear) {
    debugger
    var d = new Date(selyear, selmonth, seldate)
    let newdate = formatDate(d);

    ipcRenderer.invoke('OpenDayendReport', newdate);


}






