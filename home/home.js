let Store = require('electron-store');
let { ipcRenderer } = require('electron');
let environment = require('../environment');
const store = new Store();
let Swal = require('sweetalert2');
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
            ipcRenderer.send('app-quit', '');
        }
    });
});