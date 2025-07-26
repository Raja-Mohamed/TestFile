const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const EncrDecrService = require('../services/encrypt-decrypt.service');
let Store = require('electron-store');
const store = new Store();
//import * as environment from "../appConfig";
//const EncryptDecrypt = new EncrDecrService();
class ErrorLog {

    writeLogFileTemp(req, message) {
        let logfileUploadDir = path.resolve(__dirname, "..") + "//public//log//";
        logfileUploadDir = path.normalize(logfileUploadDir);
        var date = new Date();
        let month = date.getMonth() + 1;
        let monthstring = month < 10 ? '0' + month : '' + month;
        let val = moment().format() + " -" + " LoginId: " + 2 + " -" + message + " -" + 'addSaleHeader()' + "\r\n";
        let filename = "log_" + date.getFullYear() + monthstring + ".log";
        let fullFolderPath = logfileUploadDir;
        fullFolderPath = path.normalize(fullFolderPath);

        let stat = null;
        try {
            stat = fs.statSync(fullFolderPath);
        }
        catch (err) {

            //fs.mkdirSync(fullFolderPath);
            shell.mkdir('-p', fullFolderPath);

        }

        let newPath = fullFolderPath
            + '/' + filename
        //console.log(newPath);
        fs.appendFile(newPath, val, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    writeLogFile(methodName, message) {
        let logfileUploadDir = path.resolve(__dirname, "..") + "//public//log//";
        logfileUploadDir = path.normalize(logfileUploadDir);
        let LoginId = store.get('Ref');
        try {
            if (LoginId == undefined || LoginId == null || LoginId == "") {
                LoginId = "N/A";
            }
            else {
                LoginId = EncrDecrService.decrypt(LoginId);
            }
        }
        catch (ex) {
            LoginId = "N/A";
        }


        var date = new Date();
        let month = date.getMonth() + 1;
        let monthstring = month < 10 ? '0' + month : '' + month;
        let val = moment().format() + " -" + " LoginId: " + LoginId + " -" + message + " -" + methodName + "\r\n";
        let filename = "log_" + date.getFullYear() + monthstring + ".log";
        let fullFolderPath = logfileUploadDir;
        fullFolderPath = path.normalize(fullFolderPath);

        let stat = null;
        try {
            stat = fs.statSync(fullFolderPath);
        }
        catch (err) {

            //fs.mkdirSync(fullFolderPath);
            shell.mkdir('-p', fullFolderPath);

        }


        let newPath = fullFolderPath
            + '/' + filename
        //console.log(newPath);
        fs.appendFile(newPath, val, function (err) {
            if (err) {
                console.log(err);
            }
        });


    }
}

module.exports = new ErrorLog();