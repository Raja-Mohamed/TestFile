
const sqlite3 = require('sqlite3');
const ErrorLog = require('../services/log');
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')

db = new sqlite3.Database("./aahhaa.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {

        // do your thing 
    });

class ItemdbService {

    getAllItems(item) {
        return new Promise(function (resolve, reject) {
            db.all("select * from tblItem WHERE BillCounterId=" + item.BillCounterId + " ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getAllItems', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    getUserById(id) {
        return new Promise(function (resolve, reject) {
            db.all("select * from tblItem where Id=" + id + "", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getUserById', err)

                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    getBillCounters(item) {
        return new Promise(function (resolve, reject) {
            db.all("select BillCounterName, billCounterCode, BillCounterId, NoOfSlots, NoOfTables,IsEnableWaiterToken,IsEnableCustomerToken,IsKOTPrint  from tblBillCounter where CompanyId='" + item.CompanyId + "' AND POSId='" + item.POSId + "' ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounters', err)

                    return reject(err);
                }
                else {
                    var res = {
                        Data: rows,
                        Status: 'valid'
                    }
                    resolve(res);
                }
            });
        });

    }



    insertSaleHeaderToMySQLDB() {
        var saleHeaderListLoc = [];
        var salesHeaderListDB = [];
        var salesDetailListDB = [];
        return new Promise(function (resolve, reject) {
            db.all("select * from tblSaleHeader Where IsSync=0 AND (IsPaid=1 OR IsCancelled=1)", function (err, rows) {
                if (err) { return reject(err); }
                else {
                    saleHeaderListLoc = rows;
                    db.all("select * from tblSaleDetail Where IsSync=0 AND SaleHeaderId IN(SELECT SaleHeaderId from tblSaleHeader Where IsSync=0 AND (IsPaid=1 OR IsCancelled=1))", function (err, detailRows) {
                        if (err) { return reject(err); }
                        else {
                            salesDetailListDB = detailRows;

                            $.post(environment.apiURL + '/AddPOSSaleHeaderDetail', { "SaleHeader": JSON.stringify(saleHeaderListLoc), "SaleDetails": JSON.stringify(salesDetailListDB), "Source": "/bill", "Ref": store.get('Ref') }, async function (data) {
                                let res = JSON.parse(data);
                                if (await res.Status == "valid") {
                                    salesHeaderListDB = res.Data;
                                    if (salesHeaderListDB.length == 0) {
                                        resolve('success');
                                    }
                                    else {
                                        for (let i = 0; i < salesHeaderListDB.length; i++) {

                                            db.run('UPDATE tblSaleHeader SET IsSync=1 where SaleHeaderId="' + salesHeaderListDB[i]['SaleHeaderId'] + '"', function (err) {
                                                if (err) {
                                                    reject(err);
                                                }
                                                else {
                                                    db.run('UPDATE tblSaleDetail SET IsSync=1 where SaleHeaderId="' + salesHeaderListDB[i]['SaleHeaderId'] + '"', function (err) {
                                                        if (err) {
                                                            reject(err)
                                                        }
                                                        else {
                                                            resolve('success')
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                }
                                else if (await res.Status == 'invalid') {
                                    reject(res.Error)
                                }
                                else {
                                    reject(res.Error)
                                }
                            });

                        }
                    })
                }
            });
        });

    }


}

module.exports = new ItemdbService();


