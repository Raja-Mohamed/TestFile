const sqlite3 = require('sqlite3');
const { app, BrowserWindow, ipcMain } = require('electron');
const { promises } = require('original-fs');
const ErrorLog = require('../services/log');
let Store = require('electron-store');
const store = new Store();
let environment = require('../environment');
const { cat } = require('shelljs');
let Swal = require('sweetalert2');

// const ErrLog = new ErrorLog();
db = new sqlite3.Database("./aahhaa.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {

        // do your thing 
    });

class BillingdbService {

    validateLoginDetails(item) {
        return new Promise(function (resolve, reject) {
        //    console.log("select Ifnull(LoginId ,0) LoginId,Ref,DisplayName,UserType from tblLogin where (LoginEmail='" + item.LoginEmail + "' OR Upper(UserName)='" + item.LoginEmail + "') AND LoginPassword='" + item.LoginPassword + "'  ")
            db.all("select Ifnull(LoginId ,0) LoginId,Ref,DisplayName,UserType from tblLogin where (Upper(LoginEmail)='" + item.LoginEmail + "' OR Upper(UserName)='" + item.LoginEmail + "' ) AND LoginPassword='" + item.LoginPassword + "'  ", function (err, loginrows) {
                if (err) {
                    ErrorLog.writeLogFile('validateLoginDetails', err.message)

                    return reject(err);

                }
                else {
                    let logindetails = loginrows[0];
                    if (logindetails == undefined || logindetails.LoginId == 0) {
                        Swal.fire(
                            'Oops!',
                            'Invalid login or Password'
                        );
                        reject('invalid username or password')

                    }
                    else {
                        db.all("select SpecialRights,Access from tblLoginAccess where LoginId=" + logindetails.LoginId + "  ", function (err, loginaccessrows) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('validateLoginDetails', err.message)

                            }
                            else {
                                logindetails.SpecialRightsRows = loginaccessrows;
                                resolve(logindetails);
                            }
                        })
                    }
                }
            });
        });
    }

    addLoginDetails(loginList) {
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblLogin", function (err) {
                if (!err) {
                    let LoginList = []
                    let loginListRowObjValues = [];
                    loginList.forEach(loginDetailsRow => {
                        loginListRowObjValues = Object.values(loginDetailsRow);
                        LoginList.push(loginListRowObjValues);
                    })
                    const placeholders = LoginList.map(() => "(?,?,?,?,?,?,?)").join(",");
                    let sql1 = 'INSERT INTO tblLogin (LoginId ,LoginEmail,LoginPassword,DisplayName,Ref,UserType,UserName) VALUES ' + placeholders;
                    let tempLoginList = [];
                    LoginList.forEach((arr) => { arr.forEach((item) => { tempLoginList.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempLoginList, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addLoginDetails', err.message)
                            }
                            else {
                                resolve('Login Details added successfully');
                            }
                        })
                    })
                }
            })
        });

    }

    addLoginAccessBillCounter(loginAccessBillCounterList) {
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblUserAccessBillCounter", function (err) {
                if (!err) {

                    let LoginAccessBillCounterList = []
                    let LoginAccessBillCounterListRowObjValues = [];
                    loginAccessBillCounterList.forEach(loginAccessBillCounterRow => {
                        LoginAccessBillCounterListRowObjValues = Object.values(loginAccessBillCounterRow);
                        LoginAccessBillCounterList.push(LoginAccessBillCounterListRowObjValues);
                    })
                    const placeholders = LoginAccessBillCounterList.map(() => "(?,?,?,?)").join(",");
                    let sql1 = 'INSERT INTO tblUserAccessBillCounter (UserAccessId,LoginId,POSId,BillCounterId) VALUES ' + placeholders;
                    let tempLoginAccessBillCounterList = [];
                    LoginAccessBillCounterList.forEach((arr) => { arr.forEach((item) => { tempLoginAccessBillCounterList.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempLoginAccessBillCounterList, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addLoginAccessBillCounter', err.message)

                            }
                            else {
                                resolve('Login Access BillCounter added successfully');
                            }
                        })
                    })
                }
            })
        });

    }

    addLoginAccessDetails(loginAccessList) {
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblLoginAccess", function (err) {
                if (!err) {

                    let LoginAccessList = []
                    let loginAccessListRowObjValues = [];

                    loginAccessList.forEach(loginAccessDetailsRow => {
                        loginAccessListRowObjValues = Object.values(loginAccessDetailsRow);

                        LoginAccessList.push(loginAccessListRowObjValues);
                    })

                    const placeholders = LoginAccessList.map(() => "(?,?,?,?)").join(",");
                    let sql1 = 'INSERT INTO tblLoginAccess (LoginId ,UserAccessId,SpecialRights,Access) VALUES ' + placeholders;
                    let tempLoginAccessList = [];
                    LoginAccessList.forEach((arr) => { arr.forEach((item) => { tempLoginAccessList.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempLoginAccessList, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addLoginAccessDetails', err.message)

                            }
                            else {
                                resolve('Login Access Details added successfully');
                            }
                        })
                    })
                }
            })
        });

    }

    addBillCounters(billCounterList) {
        debugger
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblBillCounter", function (err) {
                if (!err) {
                    let BillCounterList = []
                    let billcounterRowObjValues = [];
                    billCounterList.forEach(billcounterRow => {
                        billcounterRowObjValues = Object.values(billcounterRow);
                        BillCounterList.push(billcounterRowObjValues);
                    })
                    const placeholders = BillCounterList.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
                    let sql1 = 'INSERT INTO tblBillCounter (BillCounterId,POSId,BillCounterName,BillCounterCode,IsShowPayment,NoOfSlots,NoOfTables,CompanyId,IsEnableCustomerToken,IsEnableWaiterToken,IsGSTInputBillSplit,IsAllowReprint,IsAllowReprintPassword,ReprintCount,ReprintPassword,IsAllowKOTReprint,IsAllowKOTReprintPassword,KOTReprintCount,KOTReprintPassword,IsKOTPrint,IPAddress,IsEnableIPAddressAuthentication,IsAllowNegativeRoundOff,IsAllowCustomerTokenGrouping) VALUES ' + placeholders;
                    let tempCounterList = [];
                    BillCounterList.forEach((arr) => { arr.forEach((item) => { tempCounterList.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempCounterList, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addBillCounters', err.message)
                            }
                            else {
                                resolve('BillCounter added successfully');
                            }
                        })
                    })
                }
                else {
                    ErrorLog.writeLogFile('addBillCounters', err)

                }
            })

        });

    }
    // addBillCounters(billCounterList) {

    //     return new Promise(function (resolve, reject) {
    //         db.run("DELETE FROM tblBillCounter", function (err) {
    //             if (!err) {
    //                 let BillCounterList = []
    //                 let billcounterRowObjValues = [];
    //                 billCounterList.forEach(billcounterRow => {
    //                     billcounterRowObjValues = Object.values(billcounterRow);
    //                     BillCounterList.push(billcounterRowObjValues);
    //                 })
    //                 const placeholders = BillCounterList.map(() => "(?,?,?,?,?,?,?,?,?,?,?)").join(",");
    //                 let sql1 = 'INSERT INTO tblBillCounter (BillCounterId,POSId,BillCounterName,BillCounterCode,IsShowPayment,NoOfSlots,NoOfTables,CompanyId,IsEnableCustomerToken,IsEnableWaiterToken,IsKOTPrint) VALUES ' + placeholders;
    //                 let tempCounterList = [];
    //                 BillCounterList.forEach((arr) => { arr.forEach((item) => { tempCounterList.push(item) }) });
    //                 db.serialize(function () {
    //                     db.run(sql1, tempCounterList, function (err,) {
    //                         if (err) {
    //                             reject(err.message)
    //                             ErrorLog.writeLogFile('addBillCounters', err.message)
    //                         }
    //                         else {
    //                             resolve('BillCounter added successfully');
    //                         }
    //                     })
    //                 })
    //             }
    //             else {
    //                 ErrorLog.writeLogFile('addBillCounters', err)

    //             }
    //         })

    //     });

    // }

    // addItemList(itemList) {
    //     return new Promise(function (resolve, reject) {

    //         db.run("DELETE FROM tblItem", function (err) {
    //             if (!err) {

    //                 db.serialize(function () {
    //                     db.run("begin transaction");

    //                     for (let i = 0; i < itemList.length; i++) {

    //                         let stmt = db.prepare("INSERT INTO tblItem (BillCounterId,ItemGroupId,ItemBrandId,BrandName,ItemId , ItemName ,label,ServiceTypeId,ItemPriceId,UOM,ItemCode,Barcode,HSNNo,Rate ,GST, IsInclusiveGST, IsShowHSN ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //                             itemList[i].BillCounterId, itemList[i].ItemGroupId, itemList[i].ItemBrandId, itemList[i].BrandName, itemList[i].ItemId, itemList[i].ItemName, itemList[i].label,
    //                             itemList[i].ServiceTypeId, itemList[i].ItemPriceId, itemList[i].UOM, itemList[i].ItemCode,
    //                             itemList[i].Barcode, itemList[i].HSNNo, itemList[i].Rate, itemList[i].GST, itemList[i].IsInclusiveGST, itemList[i].IsShowHSN

    //                         );
    //                         stmt.run();
    //                         stmt.finalize();

    //                     }
    //                     db.run("commit")
    //                     resolve('Item added successfully');
    //                 })
    //             }
    //             else {
    //                 reject('Item added failed')
    //             }
    //         })
    //     });

    // }

    addItemList(itemList) {
        return new Promise(function (resolve, reject) {
            debugger
            db.run("DELETE FROM tblItem", function (err) {
                if (!err) {

                    db.serialize(function () {
                        db.run("begin transaction");

                        for (let i = 0; i < itemList.length; i++) {

                            let stmt = db.prepare("INSERT INTO tblItem (BillCounterId,ItemGroupId,ItemBrandId,BrandName,ItemId , ItemName ,label,ServiceTypeId,ItemPriceId,UOM,ItemCode,Barcode,HSNNo,Rate,GST,CESS,Tax,IsInclusiveGST, IsShowHSN,IsGSTInput ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                itemList[i].BillCounterId, itemList[i].ItemGroupId, itemList[i].ItemBrandId, itemList[i].BrandName, itemList[i].ItemId, itemList[i].ItemName, itemList[i].label,
                                itemList[i].ServiceTypeId, itemList[i].ItemPriceId, itemList[i].UOM, itemList[i].ItemCode,
                                itemList[i].Barcode, itemList[i].HSNNo, itemList[i].Rate, itemList[i].GST, itemList[i].CESS, itemList[i].Tax, itemList[i].IsInclusiveGST, itemList[i].IsShowHSN, itemList[i].IsGSTInput

                            );
                            stmt.run();
                            stmt.finalize();

                        }
                        db.run("commit")
                        resolve('Item added successfully');
                    })
                }
                else {
                    ErrorLog.writeLogFile('addItemList Failed')
                    reject('Item added failed')
                }
            })
        });

    }

    addBillCounterKOTPrinters(billCounterPrintersList) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblBillCounterKOTPrinters", function (err) {
                if (!err) {
                    if (billCounterPrintersList.length != 0) {
                        let BillCounterPrinterList = []
                        let billcounterKOTRowObjValues = [];
                        billCounterPrintersList.forEach(billcounterKOTRow => {
                            billcounterKOTRowObjValues = Object.values(billcounterKOTRow);
                            BillCounterPrinterList.push(billcounterKOTRowObjValues);
                        })
                        const placeholders = BillCounterPrinterList.map(() => "(?,?,?,?,?,?)").join(",");
                        let sql1 = 'INSERT INTO tblBillCounterKOTPrinters (BillCounterId,ItemGroupId,PrinterName,IpAddress,POSId,CompanyId) VALUES ' + placeholders;
                        let tempCounterList = [];
                        BillCounterPrinterList.forEach((arr) => { arr.forEach((item) => { tempCounterList.push(item) }) });
                        db.serialize(function () {
                            db.run(sql1, tempCounterList, function (err,) {
                                if (err) {
                                    reject(err.message)
                                    ErrorLog.writeLogFile('addBillCounterKOTPrinters', err.message)
                                }
                                else {
                                    resolve('addBillCounterKOTPrinters added successfully');
                                }
                            })
                        })
                    } else {
                        resolve('addBillCounterKOTPrinterslist is Empty');
                    }

                }
                else {
                    ErrorLog.writeLogFile('addBillCounterKOTPrinters', err)

                }
            })

        });

    }
    addBillCounterCustomerTokenGroups(billCounterCustomerTokenGroupsList) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblBillCounterCustomerTokenGroups", function (err) {
                if (!err) {
                    if (billCounterCustomerTokenGroupsList.length != 0) {
                        let BillCounterCustomerTokenGroupList = []
                        let billcounterCustomerTokenGroupRowObjValues = [];
                        billCounterCustomerTokenGroupsList.forEach(billcountercustomertokengroupRow => {
                            billcounterCustomerTokenGroupRowObjValues = Object.values(billcountercustomertokengroupRow);
                            BillCounterCustomerTokenGroupList.push(billcounterCustomerTokenGroupRowObjValues);
                        })
                        const placeholders = BillCounterCustomerTokenGroupList.map(() => "(?,?,?,?,?,?,?)").join(",");
                        let sql1 = 'INSERT INTO tblBillCounterCustomerTokenGroups (BillCounterId,ItemGroupId,ItemId,ItemBrandId,CustomerTokenGroupName,POSId,CompanyId) VALUES ' + placeholders;
                        let tempCounterList = [];
                        BillCounterCustomerTokenGroupList.forEach((arr) => { arr.forEach((item) => { tempCounterList.push(item) }) });
                        db.serialize(function () {
                            db.run(sql1, tempCounterList, function (err,) {
                                if (err) {
                                    reject(err.message)
                                    ErrorLog.writeLogFile('addBillCounterCustomerTokenGroups', err.message)
                                }
                                else {
                                    resolve('addBillCounterCustomerTokenGroups added successfully');
                                }
                            })
                        })
                    } else {
                        resolve('addBillCounterCustomerTokenGroups is Empty');
                    }

                }
                else {
                    ErrorLog.writeLogFile('addBillCounterCustomerTokenGroups', err)

                }
            })

        });

    }
    addSaleHeader(req) {
        debugger
        let date = new Date()
        let BillTime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2)
        return new Promise(function (resolve, reject) {
            debugger
            db.run("INSERT INTO tblSaleHeader (SaleDate ,BillTime ,BillNo, DisplayBillNo ,BillTokenNo , IsWebOrders ,IsOtherStateCustomer,IsGSTInput,POSId , BillCounterId , ServiceTypeId , ServiceType, CustomerName ,CashierName ,CancelledReason, PhoneNo , GSTNo , RefNo , CookingInstruction, TotalAmount , TotalGST ,TotalCESS,TotalTax,RoundOff ,NetAmount ,WaiterId ,WaiterName ,TableNo ,SeatNo ,CompanyId ,CreatedBy ,CreatedOn ,UpdatedBy ,UpdatedOn ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                req.SaleDate, BillTime, req.BillNo, req.DisplayBillNo, req.BillTokenNo, req.IsWebOrders, req.IsOtherStateCustomer, req.IsGSTInput, req.POSId, req.BillCounterId, req.ServiceTypeId, req.ServiceType, req.CustomerName,
                req.CashierName, '', req.PhoneNo, req.GSTNo, req.RefNo, req.CookingInstruction, req.TotalAmount,
                req.TotalGST, req.TotalCESS, req.TotalTax, req.RoundOff, req.NetAmount, req.WaiterId, req.WaiterName, req.TableNo, req.SeatNo, req.CompanyId, req.Ref, req.CreatedOn, req.Ref, req.UpdatedOn,
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('addSaleHeader', err)
                        return reject(err)
                    }
                    else {
                        resolve(this.lastID)
                    }
                })
        })
    }

    addSaleHeaderforOrderBooking(req) {
        debugger
        //console.log("req",req)
        let date = new Date()
        let BillTime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2)
        return new Promise(function (resolve, reject) {
            debugger
            db.run("INSERT INTO tblSaleHeader (SaleDate ,BillTime ,BillNo, DisplayBillNo ,BillTokenNo , IsWebOrders ,POSId , BillCounterId , ServiceTypeId , ServiceType, CustomerName ,CashierName ,CancelledReason, PhoneNo , GSTNo , RefNo , TotalAmount , TotalGST , TotalCESS , TotalTax ,RoundOff ,NetAmount ,WaiterId ,WaiterName ,TableNo ,SeatNo ,CompanyId ,IsPaid ,IsComplimentary ,IsCreditBill ,IsGSTInput,CashAmount ,CardAmount ,OnlineAmount ,AmountPaid ,Balance ,CreatedBy ,CreatedOn ,UpdatedBy ,UpdatedOn ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                req.SaleDate, BillTime, req.BillNo, req.DisplayBillNo, req.BillTokenNo, req.IsWebOrders, req.POSId, req.BillCounterId, req.ServiceTypeId, req.ServiceType, req.CustomerName,
                req.CashierName, '', req.PhoneNo, req.GSTNo, req.RefNo, req.TotalAmount, req.TotalGST, 0.00, req.TotalGST, req.RoundOff, req.NetAmount,
                req.WaiterId, req.WaiterName, req.TableNo, req.SeatNo, req.CompanyId, req.IsPaid, req.IsComplimentary, req.IsCreditBill, req.IsGSTInput, req.CashAmount, req.CardAmount, req.OnlineAmount, req.AmountPaid, req.Balance, req.Ref, req.CreatedOn, req.Ref, req.UpdatedOn,
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('addSaleHeaderforOrderBooking', err)
                        return reject(err)
                    }
                    else {
                        resolve(this.lastID)
                    }
                })
        })
    }

    addSaleDetail(req) {
        debugger
        req = JSON.parse(req);

        return new Promise(function (resolve, reject) {
            if (req.length != 0) {
                for (let i = 0; i < req.length; i++) {
                    debugger

                    db.run("INSERT INTO tblSaleDetail(SaleHeaderId,ItemId,ItemName,ItemGroupId ,IsTakeAway ,IsShowHSN ,UOM,ItemBrandId, HSNNo, Quantity, Rate, GSTPercentage,CESSPercentage,TaxPercentage, TotalAmount, GSTAmount,CESSAmount,TaxAmount ,NetAmount , IsGSTInput) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        req[i].SaleHeaderId, req[i].ItemId, req[i].ItemName, req[i].ItemGroupId, req[i].IsTakeAway, req[i].IsShowHSN, req[i].UOM, req[i].ItemBrandId, req[i].HSNNo, req[i].Quantity, req[i].Rate, req[i].GSTPercentage, req[i].CESSPercentage, req[i].TaxPercentage, req[i].TotalAmount, req[i].GSTAmount,
                        req[i].CESSAmount, req[i].TaxAmount, req[i].NetAmount, req[i].IsGSTInput,
                        function (err) {
                            debugger
                            if (err) {
                                debugger
                                ErrorLog.writeLogFile('SaleDetail reqList', JSON.stringify(req));
                                ErrorLog.writeLogFile('addSaleDetail', err)

                                return reject(err.message);

                            }
                            else {
                                debugger
                                resolve('SaleHeader Detail Added')
                            }
                        })
                }

            } else {
                debugger
                let err = 'SaleDetailList is Empty'
                ErrorLog.writeLogFile('addSaleDetail', err)
                reject('SaleDetailList is Empty')

            }
        }
        )


    }
    addSaleDetailforOrderBooking(req) {
        debugger
        req = JSON.parse(req);
        ErrorLog.writeLogFile('SaleDetail reqList', JSON.stringify(req));
        return new Promise(function (resolve, reject) {
            if (req.length != 0) {
                for (let i = 0; i < req.length; i++) {
                    debugger

                    db.run("INSERT INTO tblSaleDetail(SaleHeaderId,ItemId,ItemName,ItemGroupId ,IsTakeAway ,IsShowHSN ,UOM,ItemBrandId, HSNNo, Quantity, Rate, GSTPercentage,TaxPercentage, TotalAmount, GSTAmount, CESSAmount, TaxAmount, NetAmount , IsGSTInput) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        req[i].SaleHeaderId, req[i].ItemId, req[i].ItemName, req[i].ItemGroupId, req[i].IsTakeAway, req[i].IsShowHSN, req[i].UOM, req[i].ItemBrandId, req[i].HSNNo, req[i].Quantity, req[i].Rate, req[i].GSTPercentage, req[i].TaxPercentage, req[i].TotalAmount, req[i].GSTAmount, 0.00, req[i].GSTAmount, req[i].NetAmount, req[i].IsGSTInput,
                        function (err) {
                            debugger
                            if (err) {
                                debugger
                                ErrorLog.writeLogFile('SaleDetail err reqList', JSON.stringify(req));
                                ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)

                                return reject(err.message);

                            }
                            else {
                                debugger
                                resolve('addSaleDetailforOrderBooking Added')
                            }
                        })
                }

            } else {
                debugger
                let err = 'SaleDetailList is Empty'
                ErrorLog.writeLogFile('addSaleDetailforOrderBooking', err)
                reject('SaleDetailList is Empty')

            }
        }
        )


    }

    deleteSale(saleHeaderId) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblSaleHeader WHERE SaleHeaderId=(?)", saleHeaderId,
                function (err) {
                    if (err) {

                        ErrorLog.writeLogFile('deleteSale', err)
                        return reject(err.message);
                    }
                    else {

                        db.run("DELETE FROM tblSaleDetail WHERE SaleHeaderId=(?)", saleHeaderId);
                        resolve('SaleHeader and Detail deleted')
                    }
                })
        })
    }
    deleteSaleforOrderBooking(saleHeaderId) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblSaleHeader WHERE SaleHeaderId=(?)", saleHeaderId,
                function (err) {
                    if (err) {

                        ErrorLog.writeLogFile('deleteSaleforOrderBooking', err)
                        return reject(err.message);
                    }
                    else {

                        db.run("DELETE FROM tblSaleDetail WHERE SaleHeaderId=(?)", saleHeaderId);
                        resolve('OrderBookingHeader and Detail deleted')
                    }
                })
        })
    }

    generateBillNo(billCounterCode, BillCounterId) {
        debugger
        let date = new Date();
        let serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        let serverDateArr = serverDate.split('-')
        return new Promise(function (resolve, reject) {
            debugger
            // console.log("SELECT IFNULL(BillNo,0) AS BillNo  FROM tblSaleHeader Where BillCounterId=" + store.get('BillCounterId') + " AND BillNo<>'' AND saleDate = '" + serverDate + "' order by SaleHeaderId desc limit 1")
            db.all("SELECT IFNULL(BillNo,0) AS BillNo  FROM tblSaleHeader Where BillCounterId=" + store.get('BillCounterId') + " AND BillNo<>'' AND saleDate = '" + serverDate + "' order by SaleHeaderId desc limit 1", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('generateBillNo', err)

                    return reject(err);
                }
                else {
                    debugger
                    let billNo;
                    let previousBillNo;
                    let lastNo;
                    if (rows.length == 0) {
                        billNo = billCounterCode + '-' + serverDateArr[2] + '-' + serverDateArr[1] + '-' + serverDateArr[0] + '-' + '00001';
                        lastNo = "00001"
                        //console.log("UPDATE tblDayInfo set IsDayStart = 1 where    POSId=" + environment.POSId + " AND BillCounterId=" + store.get('BillCounterId') + " AND CompanyId=" + environment.CompanyId + " AND DayEndDate='" + serverDate + "'")
                        db.all("UPDATE tblDayInfo set IsDayStart = 1 where    POSId=" + environment.POSId + " AND BillCounterId=" + store.get('BillCounterId') + " AND CompanyId=" + environment.CompanyId + " AND DayEndDate='" + serverDate + "' ", function (err, rows) {
                            if (err) {
                                ErrorLog.writeLogFile('AddIsDayStart', err)
                            }
                            else {
                                ErrorLog.writeLogFile('AddIsDayStart', rows)
                            }
                        });
                    } else if (rows.length > 0) {
                        debugger
                        previousBillNo = rows[0].BillNo;
                        lastNo = (parseInt(previousBillNo.match(/\d+$/)) + 1).toString();
                        lastNo = lastNo.padStart(5, '0');
                        billNo = billCounterCode + '-' + serverDateArr[2] + '-' + serverDateArr[1] + '-' + serverDateArr[0] + '-' + lastNo;

                    }
                    resolve(billNo + '_' + lastNo);

                }
            })
        }
        );
    }

    checkBillNo(item) {
        debugger
        let date = new Date();
        let serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        let serverDateArr = serverDate.split('-')
        ErrorLog.writeLogFile('checkBillNofunction', item)
        return new Promise(function (resolve, reject) {
            debugger
            //console.log("SELECT IFNULL(BillNo,0) AS BillNo  FROM tblSaleHeader Where BillNo='" + item + "' AND BillNo<>'' AND saleDate = '" + serverDate + "' order by SaleHeaderId desc limit 1")
            db.all("SELECT IFNULL(BillNo,0) AS BillNo  FROM tblSaleHeader Where BillNo='" + item + "' AND BillNo<>'' AND saleDate = '" + serverDate + "' order by SaleHeaderId desc limit 1", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('checkBillNo', err)

                    return reject(err);
                }
                else {
                    debugger
                    let billNo
                    if (rows.length == 0) {
                        billNo = 0
                        ErrorLog.writeLogFile('BillgenerateBillNo', item)
                    } else if (rows.length > 0) {
                        debugger
                        billNo = 1;
                        ErrorLog.writeLogFile('DuplicateBillgenerate', item)
                    }
                    resolve(billNo);

                }
            })
        }
        );
    }

    generateBillTokenNo(BillCounterId) {
        debugger
        let date = new Date();
        let serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        // let serverDateArr = serverDate.split('-')
        return new Promise(function (resolve, reject) {
            debugger
            // console.log("SELECT IFNULL(BillTokenNo,0) AS BillTokenNo FROM tblSaleHeader Where BillCounterId=" + store.get('BillCounterId') + "  AND BillTokenNo<>'' AND BillTokenNo<>0 AND saleDate = '" + serverDate + "' order by SaleHeaderId desc limit 1")
            db.all("SELECT IFNULL(BillTokenNo,0) AS BillTokenNo FROM tblSaleHeader Where BillCounterId=" + store.get('BillCounterId') + "  AND BillTokenNo<>'' AND BillTokenNo<>0 AND saleDate = '" + serverDate + "' order by SaleHeaderId desc limit 1", function (err, rows) {
                if (err) {

                    ErrorLog.writeLogFile('generateBillTokenNo', err)

                    return reject(err);
                }
                else {
                    debugger
                    let previousBillNo;
                    let lastNo;
                    if (rows.length == 0) {
                        lastNo = "1"
                    } else if (rows.length > 0) {
                        previousBillNo = rows[0].BillTokenNo;
                        lastNo = (parseInt(previousBillNo.match(/\d+$/)) + 1).toString();

                    }

                    resolve(lastNo);
                }
            });
        })
    }

    getPreviousBills(item) {
        debugger;
        return new Promise(function (resolve, reject) {
            // console.log("select SaleHeaderId,SaleDate,BillTime,BillNo,IsWebOrders,DisplayBillNo,ServiceTypeId,ServiceType,TotalAmount,TotalGST,TotalTax,RoundOff,NetAmount,CashAmount,CardAmount,OnlineAmount,AmountPaid,Balance,IsComplimentary,IsCreditBill,IsCancelled,IsPaid,PineLabStatus,AllowedPaymentMode from tblSaleHeader where POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + "  AND SaleDate ='" + item.SaleDate + "'order by DisplayBillNo desc")
            db.all("select SaleHeaderId,SaleDate,BillTime,BillNo,IsWebOrders,DisplayBillNo,ServiceTypeId,ServiceType,TotalAmount,TotalGST,TotalTax,RoundOff,NetAmount,CashAmount,CardAmount,OnlineAmount,AmountPaid,Balance,IsComplimentary,IsCreditBill,IsCancelled,IsPaid,PaymentDeviceID,PaymentDeviceMode,PaymentDevice from tblSaleHeader where POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + "  AND SaleDate ='" + item.SaleDate + "'order by DisplayBillNo desc", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getPreviousBills', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    getPreviousBillTodayReport(item) {
        return new Promise(function (resolve, reject) {
            // console.log( "select detail.ItemGroupId AS CategoryId , cat.ItemGroupName As Category, detail.ItemName , (SUM(detail.Quantity) || ' ' || detail.UOM) Qty , SUM(detail.NetAmount) AS TotalAmount from tblSaleDetail detail INNER JOIN tblSaleHeader  head ON head.SaleHeaderId = detail.SaleHeaderId INNER JOIN 'tblItemGroups' cat ON cat.ItemGroupId = detail.ItemGroupId where head.POSId=" + item.POSId + " AND head.CompanyID="+item.CompanyId+" AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND head.IsCancelled=0  GROUP BY cat.ItemGroupName ,detail.ItemName ");
            db.all("select detail.ItemGroupId AS CategoryId , cat.ItemGroupName As Category, detail.ItemName , SUM(detail.Quantity) AS Qty , detail.UOM AS UOM,  SUM(detail.NetAmount) AS TotalAmount ,  SUM(head.TotalGST) TotalGST , SUM(head.RoundOff) RoundOff , SUM(head.NetAmount) NetAmount , SUM(head.CashAmount) CashAmount, SUM(head.CardAmount) CardAmount,SUM(head.OnlineAmount) OnlineAmount, SUM(head.AmountPaid) AmountPaid from tblSaleDetail detail INNER JOIN tblSaleHeader  head ON head.SaleHeaderId = detail.SaleHeaderId INNER JOIN 'tblItemGroups' cat ON cat.ItemGroupId = detail.ItemGroupId where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND head.IsCancelled=0  GROUP BY cat.ItemGroupName ,detail.ItemName  ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getPreviousBillTodayReport', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    // cashier wise report
    getTodayCashierReport(item) {
        return new Promise(function (resolve, reject) {
            // console.log("select l.DisplayName AS CashierName,  head.CreatedBy , head.POSId , head.CompanyID, head.BillCounterId, head.SaleDate, SUM(head.TotalAmount) TotalAmount , SUM(head.TotalGST) TotalGST , SUM(head.RoundOff) RoundOff , SUM(head.NetAmount) NetAmount , SUM(head.CashAmount) CashAmount, SUM(head.CardAmount) CardAmount,SUM(head.OnlineAmount) OnlineAmount, SUM(head.AmountPaid) AmountPaid  from tblSaleHeader head INNER JOIN 'tblLogin' l ON l.LoginId = head.CreatedBy   where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND head.IsCancelled=0  GROUP BY head.CreatedBy  ");
            db.all("select l.DisplayName AS CashierName,  head.CreatedBy , head.POSId , head.CompanyID, head.BillCounterId, head.SaleDate, SUM(head.TotalAmount) TotalAmount , SUM(head.TotalGST) TotalGST , SUM(head.RoundOff) RoundOff , SUM(head.NetAmount) NetAmount , SUM(head.CashAmount) CashAmount, SUM(head.CardAmount) CardAmount,SUM(head.OnlineAmount) OnlineAmount, SUM(head.AmountPaid) AmountPaid  from tblSaleHeader head INNER JOIN 'tblLogin' l ON l.LoginId = head.CreatedBy   where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND head.IsCancelled=0  GROUP BY head.CreatedBy  ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getTodayCashierReport', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    getPreviousBillTodayReportCashier(item) {
        return new Promise(function (resolve, reject) {
            //console.log( "select detail.ItemGroupId AS CategoryId , cat.ItemGroupName As Category, detail.ItemName , SUM(detail.Quantity) AS Qty , detail.UOM AS UOM,  SUM(detail.NetAmount) AS TotalAmount from tblSaleDetail detail INNER JOIN tblSaleHeader  head ON head.SaleHeaderId = detail.SaleHeaderId INNER JOIN 'tblItemGroups' cat ON cat.ItemGroupId = detail.ItemGroupId where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND head.CreatedBy ='" + item.CreatedBy  +"' AND head.IsCancelled=0  GROUP BY cat.ItemGroupName ,detail.ItemName ");
            db.all("select detail.ItemGroupId AS CategoryId , cat.ItemGroupName As Category, detail.ItemName , SUM(detail.Quantity) AS Qty , detail.UOM AS UOM,  SUM(detail.NetAmount) AS TotalAmount from tblSaleDetail detail INNER JOIN tblSaleHeader  head ON head.SaleHeaderId = detail.SaleHeaderId INNER JOIN 'tblItemGroups' cat ON cat.ItemGroupId = detail.ItemGroupId where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND head.CreatedBy ='" + item.CreatedBy + "' AND head.IsCancelled=0  GROUP BY cat.ItemGroupName ,detail.ItemName   ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getPreviousBillTodayReportCashier', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    // waiter wise report

    // getPreviousBillTodayWaiterReport(item) {
    //     return new Promise(function (resolve, reject) {
    //        // console.log("select l.DisplayName AS CashierName,  head.CreatedBy , head.POSId , head.CompanyID, head.BillCounterId, head.SaleDate, SUM(head.NetAmount) NetAmount   from tblSaleHeader head INNER JOIN 'tblLogin' l ON l.LoginId = head.CreatedBy   where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND STRFTIME('%H:%M',head.BillTime) <= '" + item.ShiftEndTime + "' AND head.IsCancelled=0 AND head.WaiterId <>0 GROUP BY head.CreatedBy  ");
    //         db.all("select l.DisplayName AS CashierName,  head.CreatedBy , head.POSId , head.CompanyID, head.BillCounterId, head.SaleDate, SUM(head.NetAmount) NetAmount from tblSaleHeader head INNER JOIN 'tblLogin' l ON l.LoginId = head.CreatedBy   where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND STRFTIME('%H:%M',head.BillTime) <= '" + item.ShiftEndTime + "' AND head.IsCancelled=0 AND head.WaiterId <>0 GROUP BY head.CreatedBy  ", function (err, rows) {
    //             if (err) {
    //                 ErrorLog.writeLogFile('getPreviousBillTodayWaiterReport', err)
    //                 return reject(err);
    //             }
    //             else {
    //                 resolve(rows);
    //             }
    //         });
    //     });
    // }

    getPreviousBillTodayWaiterReport(item) {
        return new Promise(function (resolve, reject) {
            db.all("SELECT head.Waitername , Count(1) AS TotalBillCount ,IFNULL(SUM(head.NetAmount),0.00) AS NetAmount FROM tblSaleHeader head where head.ServiceType IN ('Dine-In','Sweetshop','DineIn-Self Service','Take Away') AND head.WaiterId <>0  AND head.IsCancelled=0 AND  STRFTIME('%H:%M',head.BillTime) <= '" + item.ShiftEndTime + "' AND  head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' Group by head.WaiterId ORDER BY head.NetAmount DESC", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getPreviousBillTodayWaiterReport', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    getTodayCashierWaiterReport(item) {
        return new Promise(function (resolve, reject) {
            //db.all("select l.DisplayName AS CashierName,  head.CreatedBy , head.POSId , head.CompanyID, head.BillCounterId, head.SaleDate from tblSaleHeader head INNER JOIN 'tblLogin' l ON l.LoginId = head.CreatedBy   where head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND STRFTIME('%H:%M',head.BillTime) <= '" + item.ShiftEndTime + "' AND head.IsCancelled=0  GROUP BY head.CreatedBy  ", function (err, rows) {
            db.all("select l.DisplayName AS CashierName,  head.CreatedBy , head.POSId , head.CompanyID, head.BillCounterId, head.SaleDate,head.WaiterId,head.Waitername , Count(1) AS TotalBillCount ,IFNULL(SUM(head.NetAmount),0.00) AS NetAmount from tblSaleHeader head INNER JOIN 'tblLogin' l ON l.LoginId = head.CreatedBy  where head.CreatedBy =" + item.CashierloginId + " AND  head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' AND STRFTIME('%H:%M',head.BillTime) <= '" + item.ShiftEndTime + "' AND head.IsCancelled=0 AND head.ServiceType IN ('Dine-In','Sweetshop','DineIn-Self Service','Take Away') AND head.WaiterId <>0 GROUP BY head.CreatedBy,head.WaiterId ORDER BY head.CashierName,head.NetAmount DESC ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getTodayCashierWaiterReport', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }


    // getPreviousBillTodayCashierWaiterWiseReport(item,ShiftEndTime) {
    //     return new Promise(function (resolve, reject) {
    //         db.all("SELECT head.Waitername , Count(1) AS TotalBillCount ,IFNULL(SUM(head.NetAmount),0.00) AS NetAmount FROM tblSaleHeader head where head.ServiceType='Dine-In' AND head.WaiterId <>0  AND head.IsCancelled=0 AND  STRFTIME('%H:%M',head.BillTime) <= '" + ShiftEndTime + "' AND head.CreatedBy ='" + item.CreatedBy + "' AND  head.POSId=" + item.POSId + " AND head.CompanyID=" + item.CompanyId + " AND head.BillCounterId=" + item.BillCounterId + "  AND head.SaleDate ='" + item.SaleDate + "' Group by head.WaiterId ORDER BY head.NetAmount DESC ", function (err, rows) {
    //             if (err) {
    //                 ErrorLog.writeLogFile('getPreviousBillTodayCashierWaiterWiseReport', err)
    //                 return reject(err);
    //             }
    //             else {
    //                 resolve(rows);
    //             }
    //         });
    //     });
    // }


    getSaleHeader(item) {
        return new Promise(function (resolve, reject) {
            db.all("select * from tblSaleHeader where IsPaid=0 AND IsCancelled = 0 AND IsComplimentary = 0  AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + " ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleHeader', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    getIsDayStart(item) {

        return new Promise(function (resolve, reject) {
            // console.log("select DayEndDate from tblDayInfo where IsDayEnd=0  AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + " ")
            db.all("select DayEndDate from tblDayInfo where IsDayEnd=0  AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + " ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getIsDayStart', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    getIsDayEnd(item) {

        return new Promise(function (resolve, reject) {
            // console.log("select DayEndDate from tblDayInfo where IsDayEnd=0  AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + " ")
            db.all("select Ifnull(Count(1),0) as IsDayEnd from tblDayInfo where IsDayEnd=1 AND DayEndDate ='" + item.serverDate + "'  AND POSId=" + environment.POSId + " AND BillCounterId=" + item.BillCounterId + " ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getIsDayEnd', err)
                    return reject(err);
                }
                else {
                    resolve(rows[0]);
                }
            });
        });
    }
    getIsDayStartTotalBills(date) {

        //  let date = new Date();
        // let serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        // let serverDateArr = serverDate.split('-')
        return new Promise(function (resolve, reject) {

            // console.log("SELECT ifnull(COUNT(1),0) As TotalBills FROM tblSaleHeader Where BillCounterId=" + store.get('BillCounterId') + "   AND saleDate = '" + date + "' Group by BillCounterId ")
            db.all("SELECT ifnull(COUNT(1),0) As TotalBills FROM tblSaleHeader Where BillCounterId=" + store.get('BillCounterId') + "   AND saleDate = '" + date + "' Group by BillCounterId ", function (err, rows) {
                if (err) {

                    ErrorLog.writeLogFile('getIsDayStartTotalBills', err)

                    return reject(err);
                }
                else {

                    // let previousBillNo;
                    // let lastNo;
                    // if (rows.length == 0) {
                    //     lastNo = "1"
                    // } else if (rows.length > 0) {
                    //     previousBillNo = rows[0].BillTokenNo;
                    //     lastNo = (parseInt(previousBillNo.match(/\d+$/)) + 1).toString();

                    // }

                    resolve(rows);
                }
            });
        })
    }

    getDayendSaleDetails(item) {
        let List = {
            HeaderList: [],
            SaleList: [],
            CashExpenseList: [],
            ReprintList: []
        };
        return new Promise(async function (resolve, reject) {
            // console.log("select ReprintId,SaleDate,IFNULL(SaleHeaderId,0) SaleHeaderId,BillNo,Type,ReprintReason,CashierName,BillCounterId,POSId,CompanyId,CreatedBy,CreatedOn from tblBillReprintLogs where  Cast(createdOn as Date)='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + "  ")
            db.all("select SaleHeaderId,SaleDate,BillTIme ,BillNo,POSId,BillCounterId,ServiceTypeId,CustomerName,CashierName,PhoneNo,GSTNo,RefNo,TotalAmount,TotalGST,TotalCESS,TotalTax,RoundOff,NetAmount,CashAmount,CardAmount,OnlineAmount,AmountPaid,Balance,IsComplimentary,IsCreditBill,IsCancelled,CancelledReason,IsPaid,CompanyId,Ifnull(CreatedBy,1) as CreatedBy,CreatedOn,IFNULL(UpdatedBy,1) as UpdatedBy,UpdatedOn,IsSync,BillTokenNo , CASE WHEN WaiterId ='' AND WaiterId=NULL  THEN 0 ELSE WaiterId END as WaiterId ,IFNULL(WaiterName,'') AS WaiterName ,TableNo, SeatNo,IsOtherStateCustomer,PaymentDeviceID , PaymentDeviceMode,PaymentDevice,PrintCount,KOTPrintCount,IFNULL(IsGSTInput,0) AS IsGSTInput from tblSaleHeader where POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + " AND SaleDate='" + item.SaleDate + "'",
                function (err, rows) {
                    if (err) {
                        ErrorLog.writeLogFile('getDayendSaleDetails', err)
                        return reject(err);
                    }
                    else {
                        List.HeaderList = rows;
                        let saleHeaderIds = rows.map(x => x.SaleHeaderId).join(',');
                        db.all("select  SaleDetailId, SaleHeaderId ,ItemId,ItemName,UOM,ItemBrandId, ItemGroupId, IsTakeAway, HSNNo, Quantity, Rate,GSTPercentage,IFNULL(CESSPercentage,0) as CESSPercentage,Ifnull(TaxPercentage,0) as TaxPercentage,TotalAmount,GSTAmount,IFNULL(CESSAmount,0) as CESSAmount,Ifnull(TaxAmount,0) as TaxAmount,NetAmount,IsSync,IFNULL(IsGSTInput,0) AS IsGSTInput from tblSaleDetail where  SaleHeaderId IN(" + saleHeaderIds + ")",
                            function (err, Detailedrows) {
                                if (err) {
                                    ErrorLog.writeLogFile('getDayendSaleDetails', err)

                                    return reject(err);
                                }
                                else {
                                    List.SaleList = Detailedrows;
                                    db.all("select CashExpensesId,SaleDate,IFNULL(Amount,0.00) Amount,Type,Description,BillCounterId,POSId,CompanyId,CreatedBy,CreatedOn,UpdatedBy,UpdatedOn from tblPOSBillCounterCashExpenses where  SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + "  ",
                                        function (err, cashExpenseRows) {
                                            if (err) {
                                                ErrorLog.writeLogFile('getDayendSaleDetails', err)
                                                return reject(err);
                                            }
                                            else {
                                                if (cashExpenseRows.length > 0) {
                                                    List.CashExpenseList = cashExpenseRows;

                                                }
                                                else {
                                                    List.CashExpenseList = [];

                                                }
                                                db.all("select ReprintId,SaleDate,IFNULL(SaleHeaderId,0) SaleHeaderId,BillNo,Amount,Type,ReprintReason,CashierName,BillCounterId,POSId,CompanyId,CreatedBy,CreatedOn from tblBillReprintLogs where  strftime('%Y-%m-%d', CreatedOn)='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId=" + item.BillCounterId + "  ",
                                                    function (err, reprintRows) {
                                                        if (err) {
                                                            ErrorLog.writeLogFile('getDayendSaleDetails', err)
                                                            return reject(err);
                                                        }
                                                        else {
                                                            if (reprintRows.length > 0) {
                                                                List.ReprintList = reprintRows;

                                                            }
                                                            else {
                                                                List.ReprintList = [];

                                                            }
                                                            resolve(List)
                                                        }
                                                    })

                                            }
                                        })
                                }
                            })
                    }
                });
        });
    }
    getBillCashDetails(item) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            // console.log("SELECT 'Cash' As PaymentType,ifnull(SUM(CashAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' UNION ALL SELECT 'Total CashOut' AS PaymentType, ifnull( '-' || SUM(Amount),'0.00') AS AdjustmentAmount FROM tblPOSBillCounterCashExpenses where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND Type='Cash Out' UNION ALL SELECT 'Total CashIn' AS PaymentType, ifnull(SUM(Amount),'0.00') AS AdjustmentAmount FROM tblPOSBillCounterCashExpenses where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'  AND Type='Cash In'")
            //       let AdjustmentCashInOut = ""
            let TotalCateringCashAmount = "(SELECT IFNULL(SUM(CashAmount),0.00) FROM tblBulkOrderBookingPayments where IsAdvance=0 AND PaymentDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' )"
            let paymentTypeString = "SELECT 'Cash Sales' As PaymentType,ifnull(SUM(CashAmount),0.00) + " + TotalCateringCashAmount + " As Amount FROM tblSaleHeader where ServiceType<>'Catering' AND SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' UNION ALL SELECT 'Total CashOut' AS PaymentType, ifnull( '-' || SUM(Amount),'0.00') AS AdjustmentAmount FROM tblPOSBillCounterCashExpenses where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND Type='Cash Out' UNION ALL SELECT 'Total CashIn' AS PaymentType, ifnull(SUM(Amount),'0.00') AS AdjustmentAmount FROM tblPOSBillCounterCashExpenses where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'  AND Type='Cash In'"

            //  let paymentTypeString = "SELECT 'Cash' As PaymentType,ifnull(SUM(CashAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' UNION ALL SELECT 'Card' As PaymentType,ifnull(SUM(CardAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'UNION ALL SELECT 'Online' As PaymentType,ifnull(SUM(OnlineAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'"
            db.all(paymentTypeString, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCashDetails', err)
                    return reject(err);
                }
                else {
                    debugger
                    let CashList = rows;
                    resolve(CashList);

                    // let cashoutTypeString = "SELECT CASE WHEN Type='Cash Out' THEN (-1)*(ifnull(Amount,0.00)) ELSE (ifnull(Amount,0.00)) End as Amount FROM tblPOSBillCounterCashExpenses where SaleDate='" + item.SaleDate + "'  AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'"
                    // db.all(cashoutTypeString, function (err, cashexpenserows) {
                    //     if (err) {
                    //         ErrorLog.writeLogFile('getBillCashDetails', err)
                    //         return reject(err);
                    //     }
                    //     else {
                    //         debugger
                    //         if (cashexpenserows.length > 0) {
                    //             debugger
                    //             let CashExpensesList = cashexpenserows.map(row => row.Amount).reduce((prev, next) => prev + next);
                    //             CashList[0]['Amount'] = CashList[0]['Amount'] + CashExpensesList
                    //             resolve(CashList);

                    //         }
                    //         else {
                    //             debugger
                    //             resolve(CashList);
                    //         }
                    //     }

                    // })
                }
            });


        })
    }

    // getBillAdjustmentDetails(item) {
    //     debugger
    //     let AdjustmentString
    //     return new Promise(function (resolve, reject) {
    //         let AdjustmentCashInOut = "SELECT 'Cash' As PaymentType,ifnull(SUM(CashAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' UNION ALL SELECT 'Card' As PaymentType,ifnull(SUM(CardAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'UNION ALL SELECT 'Online' As PaymentType,ifnull(SUM(OnlineAmount),0.00) As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'"
    //         let AdjustmentComplementarycredit = "SELECT 'Complementary ( ' || IFNULL(COUNT(1),0) || ' )' As PaymentType, ifnull(SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsComplimentary=" + 1 + " UNION ALL SELECT 'CreditBill ( ' || IFNULL(COUNT(1),0) || ' )' As PaymentType, ifnull(SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + "  AND IsWebOrders=" + 0 + ""
    //         let WebOrders = "select ServiceType FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + "  AND IsWebOrders=" + 1 + ""
    //         db.all(WebOrders, function (err, rows) {
    //             if (!err) {
    //                 if (rows.length) {
    //                     AdjustmentString = AdjustmentCashInOut + " UNION ALL " + AdjustmentComplementarycredit + " UNION ALL SELECT  IFNULL(ServiceType,'')  As PaymentType, ifnull( SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + " AND IsWebOrders=" + 1 + " Group By ServiceTypeId";
    //                     // console.log(AdjustmentString)
    //                 }
    //                 else {
    //                     AdjustmentString = AdjustmentCashInOut + " UNION ALL " + AdjustmentComplementarycredit;

    //                 }

    //                 db.all(AdjustmentString, function (err, rows) {
    //                     if (err) {
    //                         ErrorLog.writeLogFile('getBillAdjustmentDetails', err)
    //                         return reject(err);
    //                     }
    //                     else {
    //                         resolve(rows);
    //                     }
    //                 });
    //             }
    //             else {

    //                 ErrorLog.writeLogFile('getBillAdjustmentDetails', err)
    //                 return reject(err);
    //             }

    //         })

    //     })
    // }


    getBillAdjustmentDetails(item) {
        debugger
        //ServiceType<>'Catering'
        let AdjustmentString
        return new Promise(function (resolve, reject) {
            let TotalCateringCashAmount = "(SELECT IFNULL(SUM(CashAmount),0.00) FROM tblBulkOrderBookingPayments where IsAdvance=0 AND PaymentDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' )"
            let TotalCateringCardAmountTotal = "(SELECT IFNULL(SUM(CardAmount),0.00) FROM tblBulkOrderBookingPayments where IsAdvance=0 AND PaymentDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' )"
            let TotalCateringOnlineAmountTotal = "(SELECT IFNULL(SUM(OnlineAmount),0.00) FROM tblBulkOrderBookingPayments where IsAdvance=0 AND PaymentDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' )"

            let AdjustmentCashInOut = "SELECT 'Cash' As PaymentType,ifnull(SUM(CashAmount),0.00) + " + TotalCateringCashAmount + " As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND ServiceType<>'Catering' UNION ALL SELECT 'Card' As PaymentType,ifnull(SUM(CardAmount),0.00) + " + TotalCateringCardAmountTotal + " As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND ServiceType<>'Catering' AND BillCounterId='" + item.BillCounterId + "'UNION ALL SELECT 'Online' As PaymentType,ifnull(SUM(OnlineAmount),0.00) + " + TotalCateringOnlineAmountTotal + " As Amount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND ServiceType<>'Catering' AND IsCancelled=" + 0 + " AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'"
            //  let AdjustmentComplementarycredit = "SELECT 'Complementary ( ' || IFNULL(COUNT(1),0) || ' )' As PaymentType, ifnull(SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsComplimentary=" + 1 + " AND ServiceType<>'Catering' UNION ALL SELECT 'CreditBill ( ' || IFNULL(COUNT(1),0) || ' )' As PaymentType, ifnull(SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + " AND ServiceType<>'Catering'  AND IsWebOrders=" + 0 + ""
            let AdjustmentComplementarycredit = "SELECT 'Complementary ( ' || IFNULL(COUNT(1),0) || ' )' As PaymentType, ifnull(SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsComplimentary=" + 1 + " UNION ALL SELECT 'CreditBill ( ' || IFNULL(COUNT(1),0) || ' )' As PaymentType, ifnull(SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + " AND IsWebOrders=" + 0 + ""
            let WebOrders = "select ServiceType FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + " AND ServiceType<>'Catering' AND IsWebOrders=" + 1 + ""
            db.all(WebOrders, function (err, rows) {
                if (!err) {
                    if (rows.length) {
                        AdjustmentString = AdjustmentCashInOut + " UNION ALL " + AdjustmentComplementarycredit + " UNION ALL SELECT  IFNULL(ServiceType,'')  As PaymentType, ifnull( SUM(NetAmount),'0.00') As AdjustmentAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCreditBill=" + 1 + " AND IsComplimentary=" + 0 + " AND IsWebOrders=" + 1 + " AND ServiceType<>'Catering' Group By ServiceTypeId";
                        // console.log( 'AdjustmentString1',AdjustmentString)
                    }
                    else {
                        AdjustmentString = AdjustmentCashInOut + " UNION ALL " + AdjustmentComplementarycredit;
                        // console.log( 'AdjustmentString2',AdjustmentString)
                    }
                    db.all(AdjustmentString, function (err, rows) {
                        if (err) {
                            ErrorLog.writeLogFile('getBillAdjustmentDetails', err)
                            return reject(err);
                        }
                        else {
                            resolve(rows);
                        }
                    });
                }
                else {

                    ErrorLog.writeLogFile('getBillAdjustmentDetails', err)
                    return reject(err);
                }

            })

        })
    }
    getBillServiceTypeDetails(item) {

        return new Promise(function (resolve, reject) {

            let ServiceTypeBillsString = "SELECT  ServiceType ,  ServiceTypeId ,COUNT(1) AS TotalBills, ifnull(SUM(NetAmount),0.00) As ServiceTypeAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND IsCancelled=" + 0 + "  AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "'  Group By ServiceTypeId  "
            db.all(ServiceTypeBillsString, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillServiceTypeDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });


        })
    }


    getBillCancelDetails(item) {

        return new Promise(function (resolve, reject) {
            let CancelBillsString = "SELECT  'CancelBills( ' || IFNULL(COUNT(1),0) || ' )'As CancelText,IFNULL( SUM(NetAmount),0.00) As CancelAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCancelled=" + 1 + "   "
            db.all(CancelBillsString, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCancelDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        })
    }
    getUnpaidBillsDetails(item) {

        return new Promise(function (resolve, reject) {
            let CancelBillsString = "SELECT  'UnpaidBills( ' || IFNULL(COUNT(1),0) || ' )'As UnpaidText,IFNULL( SUM(NetAmount),0.00) As UnpaidAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCancelled=" + 0 + " AND Ispaid=" + 0 + " AND   IsComplimentary=" + 0 + " AND IsCreditBill=" + 0 + "  "
            //console.log("SELECT  'UnpaidBills( ' || IFNULL(COUNT(1),0) || ' )'As UnpaidText,IFNULL( SUM(NetAmount),0.00) As UnpaidAmount FROM tblSaleHeader where SaleDate='" + item.SaleDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND IsCancelled=" + 0 + " AND Ispaid=" + 0 + " AND   IsComplimentary=" + 0 + " AND IsCreditBill=" + 0 + "  ")
            db.all(CancelBillsString, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getUnpaidBillsDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        })
    }

    getBillDenominationDetails() {
        return new Promise(function (resolve, reject) {
            db.all("select RupeeId, Rupee, 'Rs.'|| Rupee As DisplayRupee, 0 As Nos, 0 As Value, '' As Remarks from tblRupee ORDER BY Rupee DESC", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillDenominationDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }


    updateSaleHeaderList(saleHeaderList) {
        debugger;
        return new Promise(function (resolve, reject) {
            db.run("UPDATE tblSaleHeader set CustomerName='" + saleHeaderList.CustomerName + "' ,PhoneNo='" + saleHeaderList.PhoneNo + "' , GSTNo='" + saleHeaderList.GSTNo + "' ,RefNo='" + saleHeaderList.RefNo + "' , CashAmount=" + saleHeaderList.CashAmount + " , CardAmount=" + saleHeaderList.CardAmount + " , OnlineAmount=" + saleHeaderList.OnlineAmount + " , AmountPaid=" + saleHeaderList.AmountPaid + " ,  Balance=" + saleHeaderList.Balance + ",IsPaid=" + saleHeaderList.IsPaid + ",IsCreditBill='" + saleHeaderList.IsCreditBill + "', IsOtherStateCustomer='" + saleHeaderList.IsOtherStateCustomer + "',UpdatedOn='" + saleHeaderList.UpdatedOn + "',UpdatedBy='" + saleHeaderList.Ref + "' where SaleHeaderId= " + saleHeaderList.SaleHeaderId + " ",
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('updateSaleHeaderList', err.message)

                        reject(err.message)
                    }
                    else {
                        resolve('updateSaleHeaderList  successfully');
                    }
                })
        });

    }

    updateSaleHeaderPrintCount(saleHeaderList) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.run("UPDATE tblSaleHeader set PrintCount='" + saleHeaderList.PrintCount + "' where SaleHeaderId= " + saleHeaderList.SaleHeaderId + " ",
                function (err) {
                    debugger
                    if (err) {
                        debugger
                        ErrorLog.writeLogFile('updateSaleHeaderPrintCount', err.message)

                        reject(err.message)
                    }
                    else {
                        debugger
                        resolve('updateSaleHeaderPrintCount successfully');
                    }
                })
        });

    }
    updateSaleHeaderKOTPrintCount(saleHeaderList) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.run("UPDATE tblSaleHeader set KOTPrintCount='" + saleHeaderList.KOTPrintCount + "' where SaleHeaderId= " + saleHeaderList.SaleHeaderId + " ",
                function (err) {
                    debugger
                    if (err) {
                        debugger
                        ErrorLog.writeLogFile('updateSaleHeaderKOTPrintCount', err.message)

                        reject(err.message)
                    }
                    else {
                        debugger
                        resolve('updateSaleHeaderKOTPrintCount successfully');
                    }
                })
        });

    }
    updateSaleHeaderComplementryList(saleHeaderList) {

        return new Promise(function (resolve, reject) {
            db.run("UPDATE tblSaleHeader set CustomerName='" + saleHeaderList.CustomerName + "' ,PhoneNo='" + saleHeaderList.PhoneNo + "' , GSTNo='" + saleHeaderList.GSTNo + "' ,RefNo='" + saleHeaderList.RefNo + "' , IsCreditBill='" + saleHeaderList.IsCreditBill + "', IsComplimentary=" + saleHeaderList.IsComplimentary + ", IsPaid=" + saleHeaderList.IsPaid + ",IsOtherStateCustomer=" + saleHeaderList.IsOtherStateCustomer + ",UpdatedOn='" + saleHeaderList.UpdatedOn + "',UpdatedBy='" + saleHeaderList.Ref + "' where SaleHeaderId= " + saleHeaderList.SaleHeaderId + " ",
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('updateSaleHeaderComplementryList', err.message)

                        reject(err.message)
                    }
                    else {
                        resolve('updateSaleHeaderComplementryList successfully');
                    }
                })
        });

    }
    updateSaleHeaderCreditList(saleHeaderList) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE tblSaleHeader set CustomerName='" + saleHeaderList.CustomerName + "' ,PhoneNo='" + saleHeaderList.PhoneNo + "' , GSTNo='" + saleHeaderList.GSTNo + "' ,RefNo='" + saleHeaderList.RefNo + "' ,IsCreditBill=" + saleHeaderList.IsCreditBill + ", IsPaid=" + saleHeaderList.IsPaid + ",IsOtherStateCustomer=" + saleHeaderList.IsOtherStateCustomer + ",UpdatedOn='" + saleHeaderList.UpdatedOn + "',UpdatedBy='" + saleHeaderList.Ref + "' where SaleHeaderId= " + saleHeaderList.SaleHeaderId + " ",
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('updateSaleHeaderCreditList', err.message)

                        reject(err.message)
                    }
                    else {
                        resolve('updateSaleHeaderCreditList successfully');
                    }
                })
        });

    }


    updateSaleHeaderCancelList(saleHeaderList) {

        return new Promise(function (resolve, reject) {
            db.run("UPDATE tblSaleHeader set CashAmount='" + saleHeaderList.CashAmount + "' ,CardAmount='" + saleHeaderList.CardAmount + "' ,OnlineAmount='" + saleHeaderList.OnlineAmount + "', AmountPaid=" + saleHeaderList.AmountPaid + " ,Balance=" + saleHeaderList.Balance + " , IsCancelled=" + saleHeaderList.IsCancelled + ",IsComplimentary=" + saleHeaderList.IsComplimentary + ",IsPaid=" + saleHeaderList.IsPaid + ",IsCreditBill=" + saleHeaderList.IsCreditBill + ",CancelledReason='" + saleHeaderList.CancelledReason + "',UpdatedOn='" + saleHeaderList.UpdatedOn + "',UpdatedBy='" + saleHeaderList.Ref + "' where SaleHeaderId= " + saleHeaderList.SaleHeaderId + " ",
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('updateSaleHeaderCancelList', err.message)

                        reject(err.message)
                    }
                    else {
                        resolve('updateSaleHeaderCancelList successfully');
                    }
                })
        });

    }

    addRupees(rupeelist) {
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblRupee", function (err) {
                if (!err) {
                    let Rupeelist = []
                    let rupeelistRowObjValues = [];
                    rupeelist.forEach(rupeeRow => {
                        rupeelistRowObjValues = Object.values(rupeeRow);
                        Rupeelist.push(rupeelistRowObjValues);
                    })
                    const placeholders = Rupeelist.map(() => "(?,?)").join(",");
                    let sql1 = 'INSERT INTO tblRupee(RupeeId,Rupee) VALUES ' + placeholders;
                    let tempRupeelist = [];
                    Rupeelist.forEach((arr) => { arr.forEach((item) => { tempRupeelist.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempRupeelist, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addRupees', err.message)

                            }
                            else {
                                resolve('Rupee added successfully');
                            }
                        })
                    })
                }
            })
        });

    }



    addBillCounterServiceTypes(servicetypeList) {
        debugger
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblBillCounterServicetypes", function (err) {
                if (!err) {
                    debugger
                    let ServicetypeList = []
                    let servicetypeRowObjValues = [];
                    servicetypeList.forEach(servicetypeDetailsRow => {
                        servicetypeRowObjValues = Object.values(servicetypeDetailsRow);
                        ServicetypeList.push(servicetypeRowObjValues);
                    })
                    const placeholders = ServicetypeList.map(() => "(?,?,?,?,?,?,?)").join(",");
                    let sql1 = 'INSERT INTO tblBillCounterServicetypes(ServiceTypeId,ServiceType,BillCounterId,BillCounterServiceTypeId,IsWebOrders,IsPaymentRequired,IsShowPayment ) VALUES ' + placeholders;
                    let tempServicetypeList = [];
                    ServicetypeList.forEach((arr) => { arr.forEach((item) => { tempServicetypeList.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempServicetypeList, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addBillCounterServiceTypes', err.message)

                            }
                            else {
                                resolve('Servicetypes added successfully');
                            }
                        })
                    })
                }
            })
        });

    }
    addDayInfo() {
        let date = new Date();
        let serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        return new Promise(function (resolve, reject) {
            db.all("select COUNT(1) As Count from tblDayInfo where BillCounterId = " + store.get('BillCounterId') + " AND DayEndDate ='" + serverDate + "'",
                function (err, rows) {
                    if (err) {
                        ErrorLog.writeLogFile('addDayInfo', err)
                        return reject(err);
                    }
                    else {
                        if (rows[0].Count == 0) {
                            db.all("INSERT INTO tblDayInfo (DayEndDate ,BillCounterId, POSId, CompanyId, IsDayEnd,IsDayStart,IsDayEndApprove)VALUES(?,?,?,?,?,?,?)",
                                serverDate, store.get('BillCounterId'), environment.POSId, environment.CompanyId, 0, 0, 0,
                                function (err, rows) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    else {
                                        resolve(0)
                                    }
                                })
                        }
                        else {
                            db.all("select IsDayEnd from tblDayInfo where BillCounterId = " + store.get('BillCounterId') + " AND DayEndDate ='" + serverDate + "'",
                                function (err, rows) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    else {
                                        resolve(rows[0].IsDayEnd)
                                    }
                                });
                        }
                    }
                });
        })
    }

    updatePOSCounterDayEnd(item) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            //console.log("UPDATE tblDayInfo set IsDayEnd= 1 WHERE CompanyId = " + environment.CompanyId + " AND POSId = " + environment.POSId + " AND BillCounterId = '" + item.BillCounterId + "' AND DayEndDate ='" + item.SaleDate + "'")
            db.run("UPDATE tblDayInfo set IsDayEnd= 1 WHERE CompanyId = " + environment.CompanyId + " AND POSId = " + environment.POSId + " AND BillCounterId = '" + item.BillCounterId + "' AND DayEndDate ='" + item.SaleDate + "'",
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('updatePOSCounterDayEnd', err.message)

                        reject(err.message)
                    }
                    else {
                        debugger
                        resolve('Successfully counter closed');
                    }
                })
        });
    }

    addBillCounterDetails(billCounterdetails) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblBillCounterBillInfo", function (err) {
                if (!err) {
                    let BillCounterDetailsList = []
                    let billcounterRowObjValues = [];
                    billCounterdetails.forEach(billcounterDetailsRow => {
                        billcounterRowObjValues = Object.values(billcounterDetailsRow);
                        BillCounterDetailsList.push(billcounterRowObjValues);
                    })
                    const placeholders = BillCounterDetailsList.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
                    let sql1 = 'INSERT INTO tblBillCounterBillInfo (BillCounterId,POSId,BillCounterName,BillCounterCode,BillCounterBillInfoId, Title, SubTitle, Address,Greetings,LogoSame, BillCounterLogoPath,CompanyLogoPath) VALUES ' + placeholders;
                    let tempBillCounterdetails = [];
                    BillCounterDetailsList.forEach((arr) => { arr.forEach((item) => { tempBillCounterdetails.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempBillCounterdetails, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addBillCounterDetails', err.message)

                            }
                            else {
                                resolve('BillCounterdetails added successfully');
                            }
                        })
                    })
                }
            })
        });

    }

    addBillCounterTables(billCounterdetails) {
        debugger
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblBillCounterTables", function (err) {
                if (!err) {

                    //  console.log("addBillCounterTables",billCounterdetails)
                    if (billCounterdetails.length != 0) {
                        let BillCounterTablesList = []
                        let billcounterRowObjValues = [];
                        billCounterdetails.forEach(billcounterTablesRow => {
                            billcounterRowObjValues = Object.values(billcounterTablesRow);
                            BillCounterTablesList.push(billcounterRowObjValues);
                        })
                        const placeholders = BillCounterTablesList.map(() => "(?,?,?)").join(",");
                        let sql1 = 'INSERT INTO tblBillCounterTables (BillCounterId,TableNo,Seats) VALUES ' + placeholders;
                        let tempBillCounterTables = [];
                        BillCounterTablesList.forEach((arr) => { arr.forEach((item) => { tempBillCounterTables.push(item) }) });
                        db.serialize(function () {
                            db.run(sql1, tempBillCounterTables, function (err,) {
                                if (err) {
                                    reject(err.message)
                                    ErrorLog.writeLogFile('addBillCounterTables', err.message)

                                }
                                else {
                                    resolve('BillCounterTables added successfully');
                                }
                            })
                        })
                    } else {
                        resolve('BillCounterTableslist is Empty');
                    }

                }
            })
        });

    }


    addPOSWaiters(waiterList) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblWaiters", function (err) {

                if (!err) {

                    if (waiterList.length != 0) {

                        let WaiterList = []
                        let billcounterRowObjValues = [];
                        waiterList.forEach(waiterListRow => {
                            billcounterRowObjValues = Object.values(waiterListRow);
                            WaiterList.push(billcounterRowObjValues);
                        })
                        const placeholders = WaiterList.map(() => "(?,?,?,?)").join(",");
                        let sql1 = 'INSERT INTO tblWaiters (WaiterId,WaiterName,BillCounterId,POSId) VALUES ' + placeholders;
                        let tempwaiters = [];
                        WaiterList.forEach((arr) => { arr.forEach((item) => { tempwaiters.push(item) }) });
                        db.serialize(function () {
                            db.run(sql1, tempwaiters, function (err,) {
                                if (err) {
                                    reject(err.message)
                                    ErrorLog.writeLogFile('addPOSWaiter', err.message)

                                }
                                else {
                                    resolve('Waiter added successfully');
                                }
                            })
                        })
                    } else {
                        resolve('WaiterList is Empty');
                    }

                }
            })
        });

    }
    addPOSSettings(settingsList) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblPOSSettings", function (err) {
                if (!err) {
                    if (settingsList.length != 0) {
                        let SettingsList = []
                        let billcounterRowObjValues = [];
                        settingsList.forEach(settingListRow => {
                            billcounterRowObjValues = Object.values(settingListRow);
                            SettingsList.push(billcounterRowObjValues);
                        })
                        const placeholders = SettingsList.map(() => "(?,?)").join(",");
                        let sql1 = 'INSERT INTO tblPOSSettings (AdminPassword,KOTPassword) VALUES ' + placeholders;
                        let tempsettings = [];
                        SettingsList.forEach((arr) => { arr.forEach((item) => { tempsettings.push(item) }) });
                        db.serialize(function () {
                            db.run(sql1, tempsettings, function (err,) {
                                if (err) {
                                    reject(err.message)
                                    ErrorLog.writeLogFile('addPOSSettings', err.message)

                                }
                                else {
                                    resolve('POSSettings added successfully');
                                }
                            })
                        })
                    } else {
                        resolve('POSSettingslist is Empty');
                    }

                }
            })
        });

    }
    addItemGroups(itemGrouplist) {

        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblItemGroups", function (err) {
                if (!err) {
                    let ItemGrouplist = []
                    let itemGroupRowObjValues = [];
                    itemGrouplist.forEach(itemGroupListRow => {
                        itemGroupRowObjValues = Object.values(itemGroupListRow);
                        ItemGrouplist.push(itemGroupRowObjValues);
                    })
                    const placeholders = ItemGrouplist.map(() => "(?,?)").join(",");
                    let sql1 = 'INSERT INTO tblItemGroups (ItemGroupId,ItemGroupName) VALUES ' + placeholders;
                    let tempItemGroups = [];
                    ItemGrouplist.forEach((arr) => { arr.forEach((item) => { tempItemGroups.push(item) }) });
                    db.serialize(function () {
                        db.run(sql1, tempItemGroups, function (err,) {
                            if (err) {
                                reject(err.message)
                                ErrorLog.writeLogFile('addItemGroups', err.message)
                            }
                            else {
                                resolve('addItemGroups added successfully');
                            }
                        })
                    })
                }
            })
        });

    }


    getUserAccessBillCounters(item) {
        return new Promise(function (resolve, reject) {
            // console.log("select BillCounterName, billCounterCode, BillCounterId, NoOfSlots, NoOfTables,IsEnableWaiterToken,IsEnableCustomerToken,IsKOTPrint  from tblBillCounter where BillCounterId IN ( SELECT BillCounterId FROM tblUserAccessBillCounter WHERE LoginId='" + item.LoginId + "' AND POSId='" + item.POSId + "')")
            db.all("select BillCounterName, billCounterCode, BillCounterId, NoOfSlots, NoOfTables,IsEnableWaiterToken,IsEnableCustomerToken,IsKOTPrint,IPAddress,IsEnableIPAddressAuthentication,IsGSTInputBillSplit,IsAllowReprint,IsAllowReprintPassword,ReprintCount,ReprintPassword,IsAllowKOTReprint,IsAllowKOTReprintPassword,KOTReprintCount,KOTReprintPassword,IsAllowNegativeRoundOff,IsAllowCustomerTokenGrouping  from tblBillCounter where BillCounterId IN ( SELECT BillCounterId FROM tblUserAccessBillCounter WHERE LoginId='" + item.LoginId + "' AND POSId='" + item.POSId + "')", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getUserAccessBillCounters', err)

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
    getWaiters(item) {
        return new Promise(function (resolve, reject) {

            db.all("select WaiterId,WaiterName  from tblWaiters where POSId='" + 0 + "' And BillCounterId='" + item.BillCounterId + "' ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getWaiters', err.message)
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

    getBillCounterTables(item) {
        return new Promise(function (resolve, reject) {
            db.all("select TableNo  from tblBillCounterTables where BillCounterId='" + item.BillCounterId + "' ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterTables', err.message)
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

    getBillCounterTableSeats(item) {
        return new Promise(function (resolve, reject) {
            db.all("select Seats  from tblBillCounterTables where BillCounterId='" + item.BillCounterId + "' AND TableNo='" + item.TableNo + "'   ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterTableSeats', err.message)
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
    getBillCounterTableSeatWaiter(item) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            //  console.log("select ifnull(WaiterName,'') AS  WaiterName, ifnull(WaiterId,0) AS  WaiterId from tblSaleHeader where BillCounterId='" + item.BillCounterId + "' AND TableNo='" + item.TableNo + "' AND SeatNo='" + String.fromCharCode(item.SeatNo) + "' order by SaleHeaderId desc limit 1 ")
            db.all("select ifnull(WaiterName,'') AS  WaiterName, ifnull(WaiterId,0) AS  WaiterId from tblSaleHeader where BillCounterId='" + item.BillCounterId + "' AND TableNo='" + item.TableNo + "' AND SeatNo='" + String.fromCharCode(item.SeatNo) + "' order by SaleHeaderId desc limit 1 ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterTableSeatWaiter', err.message)
                    return reject(err);
                }
                else {
                    debugger
                    // var res = {
                    //     Data: rows,
                    //     Status: 'valid'
                    // }
                    resolve(rows);
                }
            });
        });

    }
    getSaleBillItemDetails(item) {
        return new Promise(function (resolve, reject) {

            db.all("SELECT (ItemName || '<br>' ||  CASE WHEN HSNNo<>''AND IsShowHSN=1 THEN 'HSN: ' ||HSNNo ELSE '' END) ItemName,(Quantity || ' ' || UOM) DisplayQuantity,printf('%.2f', Rate) Rate , printf('%.2f', TotalAmount) TotalAmount  from tblsaledetail  where SaleHeaderId='" + item.SaleHeaderId + "'", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleBillItemDetails', err.message)

                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }

    getSaleBillItemDetailsForToken(item) {
        return new Promise(function (resolve, reject) {
            //console.log("SELECT ItemId,ItemName,case when UOM<>'KG' and UOM<>'LTR' then (CAST(Quantity as INT) || ' ' || UOM)  else(CAST(Quantity as Decimal) || ' ' || UOM) End as  DisplayQuantity  from tblsaledetail  where SaleHeaderId='" + item.SaleHeaderId + "'")
            db.all("SELECT  ItemId,ItemName,case when UOM<>'KG' and UOM<>'LTR' then (CAST(Quantity as INT) || ' ' || UOM)  else(CAST(Quantity as Decimal) || ' ' || UOM) End as  DisplayQuantity  from tblsaledetail  where SaleHeaderId='" + item.SaleHeaderId + "'", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleBillItemDetailsForToken', err.message)

                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }
    getSaleBillItemDetailsForKOT(item) {
        return new Promise(function (resolve, reject) {

            db.all("SELECT  ItemName,(CAST(Quantity as Real) || ' ' || UOM) DisplayQuantity,ItemId,ItemGroupId,IsTakeAway ,'' AS PrinterName,'' As IpAddress from tblsaledetail  where SaleHeaderId='" + item.SaleHeaderId + "'", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleBillItemDetailsForKOT', err.message)

                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }
    getBillCounterKOTPrinters(item) {
        return new Promise(function (resolve, reject) {

            db.all("SELECT  BillCounterId,ItemGroupId,PrinterName,IpAddress ,POSId,CompanyId from tblBillCounterKOTPrinters  where POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND CompanyId=" + item.CompanyId + "", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterKOTPrinters', err.message)

                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }
    getBillCounterCustomerTokenGroups(item) {
        return new Promise(function (resolve, reject) {

            db.all("SELECT  BillCounterId,ItemGroupId,ItemId,ItemBrandId,CustomerTokenGroupName,POSId,CompanyId from tblBillCounterCustomerTokenGroups  where POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND CompanyId=" + item.CompanyId + "", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterCustomerTokenGroups', err.message)

                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }


    getBillCounterServiceTypes(item) {
        return new Promise(function (resolve, reject) {

            db.all("select ServiceType, ServiceTypeId, IsWebOrders,IsPaymentRequired,IsShowPayment  from tblBillCounterServicetypes where BillCounterId='" + item.BillCounterId + "'  Order By ServiceType ASC ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterServiceTypes', err.message)
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
    getBillCounterDetails(item) {
        return new Promise(function (resolve, reject) {
            db.all("select BillCounterName, Title,SubTitle, Address,Greetings,BillCounterLogoPath  from tblBillCounterBillInfo where BillCounterId=" + item.BillCounterId + " ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillCounterDetails', err.message)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }
    getSaleBillDetails(item) {
        return new Promise(function (resolve, reject) {

            db.all("select DisplayBillNo,BillNo,WaiterName,CashierName,BillTokenNo, IsWebOrders, TableNo, SeatNo, ServiceType, strftime('%d-%m-%Y', SaleDate) AS SaleDate ,TRIM(BillTime) As BillTime , CustomerName,GSTNo,RefNo,CookingInstruction,PhoneNo,printf('%.2f', TotalAmount)  TotalAmount, printf('%.2f', TotalGST)  TotalGST,printf('%.2f', TotalCESS)  TotalCESS,printf('%.2f', TotalTax)  TotalTax,printf('%.2f', RoundOff)  RoundOff,printf('%.2f', NetAmount) NetAmount ,CashAmount,CardAmount,OnlineAmount, case when IsCreditBill=1 THEN ('CREDIT BILL' ||'<br/>'|| '') ELSE ('CASH BILL'|| '<br/>' ||'') END As BillString  from tblSaleHeader  where SaleHeaderId='" + item.SaleHeaderId + "'", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleBillDetails', err.message)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });

    }

    getRupeeDetails(item) {
        return new Promise(function (resolve, reject) {

            db.all("select RupeeId, Rupee  from tblRupee", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getRupeeDetails', err.message)
                    return reject(err);
                }
                else {
                    let res = {
                        Data: rows,
                        Status: "valid"
                    }
                    resolve(res);
                }
            });
        });

    }


    getBillGSTDetails(item) {
        return new Promise(function (resolve, reject) {

            db.all("SELECT IsOtherStateCustomer FROM tblSaleHeader  where SaleHeaderId='" + item.SaleHeaderId + "' ", function (err, IsOtherStateCustomerrows) {
                if (err) {
                    ErrorLog.writeLogFile('getBillGSTDetails', err.message)
                    return reject(err);
                }
                else {
                    // console.log("IsOtherStateCustomerrows",IsOtherStateCustomerrows)
                    let IsOtherStateCustomer;
                    if (IsOtherStateCustomerrows[0].IsOtherStateCustomer == 0) {
                        //    console.log("rows[0]",IsOtherStateCustomerrows[0].IsOtherStateCustomer)
                        //    console.log("SELECT 'CGST' As TaxType,HSNNo,  printf('%.2f', (GSTPercentage/2)) TaxPercentage,  printf('%.2f', (SUM(GSTAmount)/2)) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>''  Group By HSNNo,GSTPercentage UNION ALL SELECT 'SGST' As TaxType,HSNNo,  printf('%.2f', (GSTPercentage/2)) TaxPercentage,  printf('%.2f', (SUM(GSTAmount)/2)) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>''  Group By HSNNo,GSTPercentage UNION ALL SELECT 'CESS' As TaxType,HSNNo,  printf('%.2f', CESSPercentage) TaxPercentage,  printf('%.2f', (SUM(CESSAmount))) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>'' AND CESSPercentage<>''   Group By HSNNo,CESSPercentage Order By TaxType DESC")
                        db.all("SELECT 'CGST' As TaxType,HSNNo,  printf('%.2f', (GSTPercentage/2)) TaxPercentage,  printf('%.3f', (SUM(GSTAmount)/2)) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>''  Group By HSNNo,GSTPercentage UNION ALL SELECT 'SGST' As TaxType,HSNNo,  printf('%.2f', (GSTPercentage/2)) TaxPercentage,  printf('%.3f', (SUM(GSTAmount)/2)) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>''  Group By HSNNo,GSTPercentage UNION ALL SELECT 'CESS' As TaxType,HSNNo,  printf('%.2f', CESSPercentage) TaxPercentage,  printf('%.3f', (SUM(CESSAmount))) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>'' AND CESSPercentage<>''   Group By HSNNo,CESSPercentage Order By HSNNo,TaxType DESC", function (err, rows) {
                            if (err) {
                                ErrorLog.writeLogFile('getBillGSTDetails', err.message)
                                return reject(err);
                            }
                            else {

                                IsOtherStateCustomer = rows;
                            }
                            // console.log("IsOtherStateCustomer",IsOtherStateCustomer)
                            resolve(IsOtherStateCustomer);
                        });
                    }
                    else if (IsOtherStateCustomerrows[0].IsOtherStateCustomer == 1) {
                        // console.log("rows[0]1",IsOtherStateCustomerrows[0].IsOtherStateCustomer)
                        // console.log("SELECT 'IGST' As TaxType,HSNNo,  printf('%.2f', (GSTPercentage)) TaxPercentage,  printf('%.2f', (SUM(GSTAmount))) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>''  Group By HSNNo,GSTPercentage  UNION ALL SELECT 'CESS' As TaxType,HSNNo,  printf('%.2f', CESSPercentage) TaxPercentage,  printf('%.2f', (SUM(CESSAmount))) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>'' AND CESSPercentage<>''   Group By HSNNo,CESSPercentage Order By TaxType DESC")
                        db.all("SELECT 'IGST' As TaxType,HSNNo,  printf('%.2f', (GSTPercentage)) TaxPercentage,  printf('%.3f', (SUM(GSTAmount))) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>''  Group By HSNNo,GSTPercentage  UNION ALL SELECT 'CESS' As TaxType,HSNNo,  printf('%.2f', CESSPercentage) TaxPercentage,  printf('%.3f', (SUM(CESSAmount))) TaxAmount FROM tblSaleDetail  where SaleHeaderId='" + item.SaleHeaderId + "' AND HSNNo<>'' AND CESSPercentage<>''   Group By HSNNo,CESSPercentage Order By HSNNo,TaxType DESC", function (err, rows) {
                            if (err) {
                                ErrorLog.writeLogFile('getBillGSTDetails', err.message)
                                return reject(err);
                            }
                            else {
                                IsOtherStateCustomer = rows;
                                //          console.log("IsOtherStateCustomer",IsOtherStateCustomer)
                            }
                            //    console.log("IsOtherStateCustomerresolve",IsOtherStateCustomer)
                            resolve(IsOtherStateCustomer);
                        });

                    }

                }
            });

        }
        )
    }

    getSaleHeaderforPrintCount(item) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.all("select ifnull(PrintCount,0) as PrintCount,BillNo,NetAmount from tblSaleHeader where SaleHeaderId=" + item + "", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleHeaderforPrintCount', err)
                    return reject(err);
                }
                else {
                    debugger
                    resolve(rows[0]);
                }
            });
        });
    }

    getSaleHeaderforKOTPrintCount(item) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.all("select ifnull(KOTPrintCount,0) as KOTPrintCount,BillNo,NetAmount from tblSaleHeader where SaleHeaderId=" + item + "", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getSaleHeaderforKOTPrintCount', err)
                    return reject(err);
                }
                else {
                    debugger
                    resolve(rows[0]);
                }
            });
        });
    }
    addReprintLogs(reprintDetails) {
        return new Promise(function (resolve, reject) {

            db.run("INSERT INTO tblBillReprintLogs (SaleDate,SaleHeaderId,BillNo,Amount,Type,ReprintReason,CashierName, BillCounterId, POSId, CompanyId,CreatedBy ,CreatedOn) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                reprintDetails.SaleDate, reprintDetails.SaleHeaderId, reprintDetails.BillNo, reprintDetails.Amount, reprintDetails.Type, reprintDetails.ReprintReason, reprintDetails.CashierName, reprintDetails.BillCounterId, environment.POSId, environment.CompanyId, reprintDetails.CreatedBy, reprintDetails.CreatedOn,
                function (err,) {
                    if (err) {
                        ErrorLog.writeLogFile('addReprintLogs', err)
                        reject(err.message)
                    }
                    else {
                        resolve('Bill Reprint Details Added');
                    }
                })
        });

    }

    addCashExp(ExpDetails) {
        return new Promise(function (resolve, reject) {

            db.run("INSERT INTO tblPOSBillCounterCashExpenses (SaleDate,Amount,Type,Description, BillCounterId, POSId, CompanyId,CreatedBy ,CreatedOn ,UpdatedBy ,UpdatedOn) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                ExpDetails.SaleDate, ExpDetails.Amt, ExpDetails.Type, ExpDetails.Desc, ExpDetails.BillCounterId, ExpDetails.POSId, ExpDetails.CompanyId, ExpDetails.Ref, ExpDetails.CreatedOn, ExpDetails.Ref, ExpDetails.UpdatedOn,
                function (err,) {
                    if (err) {
                        ErrorLog.writeLogFile('ExpDetails', err)
                        reject(err.message)
                    }
                    else {
                        resolve('Cash Exp Details Added');
                    }
                })
        });

    }
    LoadCashExp(ExpDetails) {
        return new Promise(function (resolve, reject) {
            db.all("select CashExpensesId,SaleDate,Amount,Type, Description from tblPOSBillCounterCashExpenses where SaleDate='" + ExpDetails.SaleDate + "' AND POSId=" + ExpDetails.POSId + " AND BillCounterId='" + ExpDetails.BillCounterId + "' AND CompanyId=" + ExpDetails.CompanyId + "",
                function (err, rows) {

                    if (err) {
                        ErrorLog.writeLogFile('LoadCashExp', err.message)
                        return reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
        });
    }
    deleteCashExp(CashExpensesId) {
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM tblPOSBillCounterCashExpenses WHERE CashExpensesId=(?)", CashExpensesId,
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('deleteSale', err)
                        return reject(err.message);
                    }
                    else {
                        resolve(" Cash Expense Deleted");
                    }
                })
        })
    }


    UpdateCashExp(row) {
        return new Promise(function (resolve, reject) {
            db.run("Update tblPOSBillCounterCashExpenses set Amount= '" + row.Amt + "' ,Type='" + row.Type + "' , Description='" + row.Desc + "',UpdatedOn='" + row.UpdatedOn + "',UpdatedBy='" + row.Ref + "' where CompanyId = " + environment.CompanyId + " AND POSId = " + environment.POSId + " AND BillCounterId = " + store.get('BillCounterId') + " AND CashExpensesId ='" + row.CashExpensesId + "'",
                function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('UpdateCashExp', err.message)
                        reject(err.message)
                    }
                    else {
                        resolve('Cash Expenses Updated successfully');
                    }
                })
        });

    }

    deletePOSRecords(item) {
        return new Promise(function (resolve, reject) {
            debugger;

            //console.log("DELETE FROM tblSaleDetail WHERE SaleHeaderId IN (select SaleHeaderId from tblSaleHeader where SaleDate='" + item.Saledate + "' AND POSId =" + item.POSId + " AND CompanyId =" + item.CompanyId + ")")
            db.run("DELETE FROM tblSaleDetail WHERE SaleHeaderId IN (select SaleHeaderId from tblSaleHeader where SaleDate='" + item.Saledate + "' AND POSId =" + item.POSId + " AND CompanyId =" + item.CompanyId + " AND BillCounterId=" + item.BillCounterId + ")", function (err) {

                if (err) {
                    debugger;
                    ErrorLog.writeLogFile('deletePOSRecords', err.message)
                    return reject(err);
                }
                else {
                    debugger;
                    // console.log("DELETE FROM tblSaleHeader WHERE SaleDate='" + item.Saledate + "' AND POSId=" + item.POSId + " AND CompanyId=" + item.CompanyId + "")
                    db.run("DELETE FROM tblSaleHeader WHERE SaleDate='" + item.Saledate + "' AND POSId=" + item.POSId + " AND CompanyId=" + item.CompanyId + " AND BillCounterId=" + item.BillCounterId + "", function (err) {
                        if (err) {
                            debugger;
                            ErrorLog.writeLogFile('deletePOSRecords', err.message)
                            return reject(err);
                        }
                        else {
                            let res = {
                                Data: 0,
                                Status: "valid"
                            }
                            resolve(res);
                        }
                    });
                }
            });
        });
    }

    getDayEndApproveDetails(item) {
        debugger;
        return new Promise(function (resolve, reject) {
            // console.log("select * from tblDayInfo where IsDayEndApprove=" + item);
            db.all("select * from tblDayInfo where IsDayEndApprove=" + item, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getDayEndApproveDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    DeleteDayEndApproveAllDetails(item) {
        debugger;
        const d = new Date().toLocaleString();
        var dateAr = d.split('/');
        let currentdatetime = dateAr[1] + '-' + dateAr[0] + '-' + dateAr[2];
        let details = " Current Date & Time = " + currentdatetime + "  , Saledate = " + item.Saledate + " , POSId = " + item.POSId + " ,CompanyId = " + item.CompanyId + " ,BillCounterId = " + item.BillCounterId;

        return new Promise(function (resolve, reject) {
            // console.log("DELETE FROM tblSaleDetail WHERE SaleHeaderId IN (select SaleHeaderId from tblSaleHeader where SaleDate='" + item.Saledate + "' AND POSId =" + item.POSId + " AND CompanyId =" + item.CompanyId + " AND BillCounterId=" + item.BillCounterId + ")");
            db.run("DELETE FROM tblSaleDetail WHERE SaleHeaderId IN (select SaleHeaderId from tblSaleHeader where SaleDate='" + item.Saledate + "' AND POSId =" + item.POSId + " AND CompanyId =" + item.CompanyId + " AND BillCounterId=" + item.BillCounterId + ")", function (err, rows) {
                debugger;
                if (err) {
                    ErrorLog.writeLogFile('DeleteDayEndApproveAllDetails', err)
                    return reject(err);
                }
                else {
                    debugger;
                    //resolve(rows);
                    ErrorLog.writeLogFile('Delete sale Details Success', details);
                    db.run("DELETE FROM tblSaleHeader WHERE SaleDate='" + item.Saledate + "' AND POSId=" + item.POSId + " AND CompanyId=" + item.CompanyId + " AND BillCounterId=" + item.BillCounterId, function (error, response) {
                        if (error) {
                            debugger;
                            ErrorLog.writeLogFile('DeleteDayEndApproveAllDetails', error.message)
                            return reject(error);
                        }
                        else {
                            debugger;
                            //resolve(response);
                            ErrorLog.writeLogFile('Delete sale Header Details Success', details);
                            db.run("DELETE FROM tblPOSBillCounterCashExpenses WHERE SaleDate='" + item.Saledate + "' AND POSId=" + item.POSId + " AND CompanyId=" + item.CompanyId + " AND BillCounterId=" + item.BillCounterId, function (errr, res) {
                                if (errr) {
                                    debugger;
                                    ErrorLog.writeLogFile('DeleteDayEndApproveAllDetails', errr.message)
                                    return reject(errr);
                                }
                                else {
                                    //resolve(res);
                                    ErrorLog.writeLogFile('Delete sale Cash Expenses Details Success', details)
                                    let data = {
                                        Data: 0,
                                        Status: "valid"
                                    }
                                    resolve(data);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    updateDayEndApprove(item) {
        // let DayEndApproveDetails = item;
        return new Promise(function (resolve, reject) {

            if (item.length > 0) {
                let date = new Date();
                let serverDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);

                for (var i = 0; i < item.length; i++) {
                    let text = "UPDATE tblDayInfo  SET IsDayEndApprove = 1 WHERE DayEndDate = '" + item[i].SaleDate + "'  AND  BillCounterId = " + item[i].BillCounterId + " AND CompanyId = " + item[i].CompanyId + " AND POSId = " + item[i].POSId;
                    db.all("UPDATE tblDayInfo  SET IsDayEndApprove = 1 WHERE DayEndDate = '" + item[i].SaleDate + "'  AND  BillCounterId = " + item[i].BillCounterId + " AND CompanyId = " + item[i].CompanyId + " AND POSId = " + item[i].POSId, function (err, rows) {
                        if (err) {
                            ErrorLog.writeLogFile('reject updateDayendApprove : ' + text, err)
                            // return reject(err);
                            resolve('Updated successfully');
                        }
                        else {
                            // resolve(rows);

                            // ErrorLog.writeLogFile('resolve Updated successfully :' + text, rows)
                            resolve('Updated successfully');
                        }
                    });
                }
                ErrorLog.writeLogFile('resolve updateDayEndApprove successfully :', serverDate)
            }
            else {
                resolve('DayEndApprove Updated successfully');
            }
        });
    }

    getBulkOrderSaleHeaderId(billNo) {
        return new Promise(function (resolve, reject) {
            let querydetail = "select SaleHeaderId from tblSaleHeader where BillNo='" + billNo + "'";
            //console.log('querydetail',querydetail);
            db.all("select SaleHeaderId from tblSaleHeader where BillNo='" + billNo + "'", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBulkOrderSaleHeaderId' + querydetail, err.message)
                    return reject(err);
                }
                else {
                    resolve(rows[0]);
                }
            });
        });

    }

    addBulkOrderBookingAdvancePayments(req) {
        debugger;
        if (req.IsAdvance == 1) {
            return new Promise(function (resolve, reject) {
                debugger;
                db.run("DELETE FROM tblBulkOrderBookingPayments WHERE IsAdvance=1 AND PaymentDate='" + req.SaleDate + "' AND POSId =" + req.POSId + " AND CompanyId =" + req.CompanyId + " AND BillCounterId=" + req.BillCounterId, function (err) {
                    //  db.run("DELETE FROM tblBulkOrderBookingPayments WHERE PaymentDate=(?) AND IsAdvance=1", req.SaleDate,function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('deleteBulkOrderBookingPayments IsAdvance =1', err)
                        return reject(err.message);
                    }
                    else {
                        // resolve(" BulkOrderBookingPayments  Deleted");
                        db.run("INSERT INTO tblBulkOrderBookingPayments (PaymentDate ,POSId ,BillCounterId ,CompanyId , IsAdvance ,AdvanceCount ,AmountPaid ,CashAmount ,CardAmount ,OnlineAmount ,CreatedOn ,UpdatedOn )   VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                            req.SaleDate, req.POSId, req.BillCounterId, req.CompanyId, req.IsAdvance, req.AdvanceCount, req.AmountPaid, req.CashAmount, req.CardAmount, req.OnlineAmount, req.CreatedOn, req.UpdatedOn,
                            function (err) {
                                if (err) {
                                    ErrorLog.writeLogFile('addBulkOrderBookingAdvancePayments IsAdvance =1', err)
                                    return reject(err)
                                }
                                else {
                                    resolve("BulkOrderBookingPayments  Added");
                                }
                            })
                    }
                })
            })
        }
        else if (req.IsAdvance == 0) {
            return new Promise(function (resolve, reject) {
                debugger;
                db.run("DELETE FROM tblBulkOrderBookingPayments WHERE IsAdvance=0 AND PaymentDate='" + req.SaleDate + "' AND POSId =" + req.POSId + " AND CompanyId =" + req.CompanyId + " AND BillCounterId=" + req.BillCounterId, function (err) {
                    //db.run("DELETE FROM tblBulkOrderBookingPayments WHERE PaymentDate=(?) AND IsAdvance=0", req.SaleDate,function (err) {
                    if (err) {
                        ErrorLog.writeLogFile('addBulkOrderBookingbalancePayments IsAdvance =0', err)
                        return reject(err.message);
                    }
                    else {
                        // resolve(" BulkOrderBookingPayments  Deleted");
                        db.run("INSERT INTO tblBulkOrderBookingPayments (PaymentDate ,POSId ,BillCounterId ,CompanyId , IsAdvance ,AdvanceCount ,AmountPaid ,CashAmount ,CardAmount ,OnlineAmount ,CreatedOn ,UpdatedOn )   VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                            req.SaleDate, req.POSId, req.BillCounterId, req.CompanyId, req.IsAdvance, req.AdvanceCount, req.AmountPaid, req.CashAmount, req.CardAmount, req.OnlineAmount, req.CreatedOn, req.UpdatedOn,
                            function (err) {
                                if (err) {
                                    ErrorLog.writeLogFile('addBulkOrderBookingbalancePayments IsAdvance =0', err)
                                    return reject(err)
                                }
                                else {
                                    // resolve("BulkOrderBookingPayments  Added");
                                }
                            })
                    }
                })
            })
        }

    }

    addBulkOrderBookingAdjustmentsPayments(req) {
        debugger;
        return new Promise(function (resolve, reject) {
            debugger
            db.run("DELETE FROM tblBulkOrderBookingAdjustments WHERE PaymentDate='" + req.SaleDate + "' AND POSId =" + req.POSId + " AND CompanyId =" + req.CompanyId + " AND BillCounterId=" + req.BillCounterId, function (err) {
                // db.run("DELETE FROM tblBulkOrderBookingAdjustments WHERE PaymentDate=(?)", req.SaleDate,function (err) {
                if (err) {
                    ErrorLog.writeLogFile('deleteBulkOrderBookingPayments IsAdvance =1', err)
                    return reject(err.message);
                }
                else {
                    // resolve(" BulkOrderBookingPayments  Deleted");
                    db.run("INSERT INTO tblBulkOrderBookingAdjustments (PaymentDate ,POSId ,BillCounterId ,CompanyId  ,AmountPaid ,CashAmount ,CardAmount ,OnlineAmount ,CreatedOn ,UpdatedOn )   VALUES(?,?,?,?,?,?,?,?,?,?)",
                        req.SaleDate, req.POSId, req.BillCounterId, req.CompanyId, req.AmountPaid, req.CashAmount, req.CardAmount, req.OnlineAmount, req.CreatedOn, req.UpdatedOn,
                        function (err) {
                            if (err) {
                                ErrorLog.writeLogFile('addBulkOrderBookingAdvancePayments IsAdvance =1', err)
                                return reject(err)
                            }
                            else {
                                // resolve("BulkOrderBookingPayments  Added");
                            }
                        })
                }
            })
        })
    }

    getBulkOrderadvancePaymentsDetails(item) {
        return new Promise(function (resolve, reject) {
            let BookingPaymentsString = "SELECT * FROM tblBulkOrderBookingPayments where IsAdvance=1 AND PaymentDate='" + item.PaymentDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND CompanyId='" + item.CompanyId + "'"
            db.all(BookingPaymentsString, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBulkOrderadvancePaymentsDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        })
    }

    getBulkOrderAdjustmentsDetails(item) {
        return new Promise(function (resolve, reject) {
            let AdjustmentsString = "SELECT * FROM tblBulkOrderBookingAdjustments where PaymentDate='" + item.PaymentDate + "' AND POSId=" + item.POSId + " AND BillCounterId='" + item.BillCounterId + "' AND CompanyId='" + item.CompanyId + "'"
            db.all(AdjustmentsString, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getBulkOrderAdjustmentsDetails', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        })
    }

    DeleteCateringSaleDetail(item) {
        return new Promise(function (resolve, reject) {
            let SaleheaderDelete = "UPDATE tblSaleHeader SET IsCancelled=1,IsComplimentary=0,IsCreditBill=0,IsPaid=0,AmountPaid=0,CashAmount=0,CardAmount=0,OnlineAmount=0, UpdatedBy='" + item.UpdatedBy + "' ,UpdatedOn= '" + item.UpdatedOn + "' , CancelledReason= '" + item.CancelledReason + "' WHERE ServiceType='Catering' AND SaleDate='" + item.SaleDate + "' AND BillNo='" + item.Billno + "' AND POSId='" + item.POSId + "' AND BillCounterId='" + item.BillCounterId + "' AND CompanyId='" + item.CompanyId + "'";
            // console.log('SaleheaderDelete',SaleheaderDelete);
            db.all(SaleheaderDelete, function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('DeleteCateringSaleDetail ' + item, err)
                    return reject(err);
                }
                else {
                    resolve('DeleteCateringSaleDetail  successfully');
                }
            });
            // db.run("DELETE FROM tblSaleDetail WHERE SaleHeaderId =(SELECT SaleHeaderId FROM tblSaleHeader WHERE ServiceType='Catering' AND SaleDate='" + item.SaleDate + "' AND BillNo='"+ item.Billno +"' AND POSId='"+ item.POSId +"' AND BillCounterId='"+ item.BillCounterId +"' AND CompanyId='"+ item.CompanyId+"')", function (err) {
            //         if (err) {
            //             ErrorLog.writeLogFile('DeleteCateringSaleDetail', err)
            //             return reject(err.message);
            //         }
            //         else {
            //             db.run("DELETE FROM tblSaleHeader WHERE ServiceType='Catering' AND SaleDate='" + item.SaleDate + "' AND BillNo='"+ item.Billno +"' AND POSId='"+ item.POSId +"' AND BillCounterId='"+ item.BillCounterId +"' AND CompanyId='"+ item.CompanyId+"'");
            //             resolve('Catering SaleHeader and Detail deleted')
            //         }
            //     })
        })
    }


    // addDineInCancelList(req) {
    //     return new Promise(function (resolve, reject) {
    //         db.run("INSERT INTO tblDineInCancelItem ( SaleDate, ItemId,  ItemName, ItemBrandId,  ItemGroupId,  IsTakeAway ,IsKOTSent , BillSlotNo,SeatbillSlotNo ,TableSlotNo ,DisplayQuantity,Amount, ServiceType ,PrinterName ,CashierName,WaiterName ,CancelledReason, BillCounterId ,POSId,CompanyId ,CreatedBy ,CreatedOn,UpdatedBy ,UpdatedOn)   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //         req.SaleDate, req.ItemId, req.ItemName, req.ItemBrandId,  req.ItemGroupId,  req.IsTakeAway ,req.IsKOTSent , req.BillSlotNo, req.SeatbillSlotNo , req.TableSlotNo , req.DisplayQuantity, req.Amount, req.ServiceType , req.PrinterName , req.CashierName, req.WaiterName , req.CancelledReason, req.BillCounterId , req.POSId, req.CompanyId , req.loginId , req.SaleDate, req.loginId ,req.SaleDate ,
    //         function (err) {
    //                 if (err) {
    //                     ErrorLog.writeLogFile('addDineInCancelList', err.message)
    //                     reject(err.message)
    //                 }
    //                 else {
    //                     resolve('Item added successfully');
    //                 }
    //             })
    //     });
    // }

    getPineLabHeader(item) {
        return new Promise(function (resolve, reject) { //  IsPaid=0 AND removed
            db.all("select * from tblPineLabHeader where IsRequestCancelled = 0 AND PaymentDevice = 'PineLabs' AND PaymentDeviceID='" + item.PaymentDeviceID + "' ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getPineLabHeader', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }


    updateSaleHeaderPaymentDeviceStatus(req, type, PaymentDevice) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.run("UPDATE tblSaleHeader set PaymentDevice='" + req.PaymentDevice + "', PaymentDeviceID='" + req.PaymentDeviceID + "', PaymentDeviceMode='" + req.PaymentDeviceMode + "', UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where SaleHeaderId= " + req.SaleHeaderId + " ",
                function (err) {
                    debugger
                    if (err) {
                        debugger
                        ErrorLog.writeLogFile('updateSaleHeaderPaymentDeviceStatus', err.message)
                        reject(err.message)
                    }
                    else {
                        debugger;
                        if (type == 'Add' && PaymentDevice == environment.PineLabsUrl.PaymentDevice) { // pine labs payment
                            db.run("INSERT INTO tblPineLabHeader(SaleHeaderId,SaleDate, PaymentDeviceID , PaymentDeviceMode,PaymentDevice, BillNo, DisplayBillNo ,IsOtherStateCustomer , CustomerName , PhoneNo , GSTNo , RefNo , TotalAmount , NetAmount , CashAmount, CardAmount,  OnlineAmount, Response, CompanyId ,CreatedBy ,CreatedOn ,UpdatedBy ,UpdatedOn , TimeCountDown) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                req.SaleHeaderId, req.SaleDate, req.PaymentDeviceID, req.PaymentDeviceMode, req.PaymentDevice, req.BillNo, req.DisplayBillNo, req.IsOtherStateCustomer, req.CustomerName, req.PhoneNo, req.GSTNo, req.RefNo, req.TotalAmount, req.Amount, req.CashAmount, req.CardAmount, req.OnlineAmount, req.Response, req.CompanyId, req.CreatedBy, req.CreatedOn, req.UpdatedBy, req.UpdatedOn, req.TimeCountDown,
                                function (err) {
                                    if (err) {
                                        ErrorLog.writeLogFile('addPineSaleHeader', err)
                                        return reject(err)
                                    }
                                    else {
                                        debugger;
                                        resolve('updatePineSaleHeaderPineLab successfully')
                                    }
                                })
                        }
                        else if (type == 'Add' && PaymentDevice == environment.PaytmUrl.PaymentDevice) { // paytm payment 
                            db.run("INSERT INTO tblPaytmHeader(SaleHeaderId,SaleDate, PaymentDeviceID ,PaymentDeviceMode,PaymentDevice,  BillNo, DisplayBillNo ,IsOtherStateCustomer , CustomerName , PhoneNo , GSTNo , RefNo , TotalAmount , NetAmount , CashAmount, CardAmount,  OnlineAmount, Response, CompanyId ,CreatedBy ,CreatedOn ,UpdatedBy ,UpdatedOn , TimeCountDown) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                req.SaleHeaderId, req.SaleDate, req.PaymentDeviceID, req.PaymentDeviceMode, req.PaymentDevice, req.BillNo, req.DisplayBillNo, req.IsOtherStateCustomer, req.CustomerName, req.PhoneNo, req.GSTNo, req.RefNo, req.TotalAmount, req.Amount, req.CashAmount, req.CardAmount, req.OnlineAmount, req.Response, req.CompanyId, req.CreatedBy, req.CreatedOn, req.UpdatedBy, req.UpdatedOn, req.TimeCountDown,
                                function (err) {
                                    if (err) {
                                        ErrorLog.writeLogFile('add PaytmSaleHeader', err)
                                        return reject(err)
                                    }
                                    else {
                                        debugger;
                                        resolve('updatePineSaleHeaderPineLab successfully')
                                    }
                                })
                        }
                    }
                })
        });
    }

    updatePaymentModeChangeStatus(req, PaymentDevice) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.run("UPDATE tblSaleHeader set  PaymentDevice='" + req.PaymentDevice + "', UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                function (err) {
                    debugger
                    if (err) {
                        debugger
                        ErrorLog.writeLogFile('updatePaymentModeChangeStatus', err.message)
                        reject(err.message)
                    }
                    else {
                        if (PaymentDevice == environment.PineLabsUrl.PaymentDevice) { // pine labs payment
                            db.run("UPDATE tblPineLabHeader set TimeCountDown=0, PaymentDevice='" + req.PaymentDevice + "', IsRequestCancelled='" + req.IsRequestCancelled + "', IsPaid='" + req.IsPaid + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                                function (err) {
                                    debugger
                                    if (err) {
                                        debugger
                                        ErrorLog.writeLogFile('updatePaymentModeChangeStatus , req =' + req, err.message)
                                        reject(err.message)
                                    }
                                    else {
                                        debugger;
                                        resolve('pinelabs to normal pay change successfully');
                                    }
                                })
                        }
                        else if (PaymentDevice == environment.PaytmUrl.PaymentDevice) { // paytm payment 
                            db.run("UPDATE tblPaytmHeader set TimeCountDown=0, PaymentDevice='" + req.PaymentDevice + "', IsRequestCancelled='" + req.IsRequestCancelled + "', IsPaid='" + req.IsPaid + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                                function (err) {
                                    debugger
                                    if (err) {
                                        debugger
                                        ErrorLog.writeLogFile('updatePaymentModeChangeStatus , req =' + req, err.message)
                                        reject(err.message)
                                    }
                                    else {
                                        debugger;
                                        resolve('paytm to normal pay change successfully');
                                    }
                                })
                        }
                    }
                })
        });
    }

    updatePaymentDeviceConfirmStatus(req, type, PaymentDevice) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            if (PaymentDevice == environment.PineLabsUrl.PaymentDevice) { // pine labs payment
                db.run("UPDATE tblPineLabHeader set TimeCountDown=0, Response='" + req.Response + "', IsPaid='" + req.IsPaid + "', UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                    function (err) {
                        debugger
                        if (err) {
                            debugger
                            ErrorLog.writeLogFile('updatePaymentDeviceConfirmStatus', err.message)
                            reject(err.message)
                        }
                        else {
                            debugger;
                            resolve('Pinelabs Confirm successfully');
                        }
                    })
            }
            else if (PaymentDevice == environment.PaytmUrl.PaymentDevice) { // paytm payment 
                db.run("UPDATE tblPaytmHeader set TimeCountDown=0, Response='" + req.Response + "', IsPaid='" + req.IsPaid + "', UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                    function (err) {
                        debugger
                        if (err) {
                            debugger
                            ErrorLog.writeLogFile('updatePaymentDeviceConfirmStatus Error = ', err.message)
                            reject(err.message)
                        }
                        else {
                            debugger;
                            resolve('Paytm Confirm successfully');
                        }
                    })
            }

        });
    }

    updateSaleHeaderPaymentCancelStatus(req, type, PaymentDevice) {
        debugger
        return new Promise(function (resolve, reject) {
            debugger
            db.run("UPDATE tblSaleHeader set  PaymentDevice='', PaymentDeviceID='', PaymentDeviceMode='', UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                function (err) {
                    debugger
                    if (err) {
                        debugger
                        ErrorLog.writeLogFile('updateSaleHeaderPaymentCancelStatus', err.message)
                        reject(err.message)
                    }
                    else {
                        debugger;
                        if (PaymentDevice == environment.PineLabsUrl.PaymentDevice) { // pine labs payment
                            db.run("UPDATE tblPineLabHeader set TimeCountDown=0, IsRequestCancelled=1, IsPaid=0, Response='" + req.Response + "', UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                                function (err) {
                                    debugger
                                    if (err) {
                                        debugger
                                        ErrorLog.writeLogFile('updateSaleHeaderPaymentCancelStatus', err.message)
                                        reject(err.message)
                                    }
                                    else {
                                        debugger;
                                        resolve('Payment Revert successfully');
                                    }
                                })
                        }
                        else if (PaymentDevice == environment.PaytmUrl.PaymentDevice) { // paytm payment
                            db.run("UPDATE tblPaytmHeader set TimeCountDown=0, IsRequestCancelled=1, IsPaid=0, Response='" + req.Response + "',  UpdatedOn='" + req.UpdatedOn + "', UpdatedBy='" + req.UpdatedBy + "' where PaymentDeviceID= '" + req.PaymentDeviceID + "' ",
                                function (err) {
                                    debugger
                                    if (err) {
                                        debugger
                                        ErrorLog.writeLogFile('UpdateSaleHeadePaytmCancelStatus', err.message)
                                        reject(err.message)
                                    }
                                    else {
                                        debugger;
                                        resolve('Payment Revert successfully');
                                    }
                                })
                        }
                    }
                })
        });
    }

    // paytm headers  ------------------------------------------------------------------------------

    getPaytmHeader(item) {
        return new Promise(function (resolve, reject) { //  IsPaid=0 AND removed
            db.all("select * from tblPaytmHeader where IsRequestCancelled = 0 AND PaymentDevice = 'Paytm' AND PaymentDeviceID='" + item.PaymentDeviceID + "' ", function (err, rows) {
                if (err) {
                    ErrorLog.writeLogFile('getPaytmHeader', err)
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

}



module.exports = new BillingdbService();