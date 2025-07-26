const {app, session } = require("electron");
let environment = require('../environment')
const Store = require('electron-store');
const store = new Store();

const filter = {
  urls: []
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  
  details.requestHeaders['authorization'] = 'Bearer ' + store.get('loginToken')
  callback({ requestHeaders: details.requestHeaders })
})
});