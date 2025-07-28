module.exports =
{

    // Live
    
    // POSId: 9,
    //  CompanyId: 112,

    // development
    POSId: 2,
    CompanyId: 24,
    POSName: 'HosurPOS',
    PrinterName: "80mm Series Printer(1)",
    IpAddress: '\\192.168.1.87',
    Password: "meg$123",
    //BillCounterName: 'Hosur First Floor',
    apiURL: 'http://192.168.1.170:3001',
  // apiURL: 'http:/localhost:3001',
 webApiURL: 'http://localhost:3000',
   // webApiURL: 'http://192.168.1.170:3000',
    EnDe_Key: {
        Key: "3jEYde6723812djowWfCFtwnmd720JSs",
        IV: "kI1fhd72362hdalkjfUDnqw237EHzFYe"
    },
    PageUrl: {
        login: 'src/login/login.html',
        home: 'src/home/home.html',
        admin: 'src/admin/admin.html',
        user: 'src/user/user.html',
        dayend: 'src/dayend/dayend.html',
        Counterdayendpopup: 'src/Counterdayend/Counterdayend.html',
        previousBills: 'src/previousBills/previousBills.html',
        cashExpenses: 'src/cashExpenses/cashExpenses.html',
        devices:'src/devices/devices.html',
        bulkorder: 'src/bulkorder/bulkorder.html',
        billReceipt: 'src/billReceipt/billReceipt.html',
        orderbooking: 'src/orderbooking/orderbooking.html',
        printPopup: 'src/print-popup/print-popup.html',
        settings: 'src/settings/settings.html'
    },
    ConnectionUrl:{
        connectionLimit: 100, //important
        host: 'localhost',
        user: 'root',
        password: 'Meg$123',
        database: 'aahhaa_db',
        debug: false
    },
    PineLabsUrl:{
        PaymentDevice : 'PineLabs',
        PaymentDeviceConvert : 'PineLabsToNormal',
        pineLabsCloudUrl:'https://www.plutuscloudservice.in:8201/API/CloudBasedIntegration/V1',
        MerchantID:785964,
        SecurityToken:"d481279d-4745-49b6-8ea6-8991b0981eb2",
        IMEI:"AAHHAA312",                    // AF3500310 restaurant  , AAHHAA311 Sweet Counter  , AAHHAA312 Tea counter
        PaperPOSID:3500312,                 //  3500310 restaurant    , 3500311 Sweet Counter    , 3500312 Tea counter
        MerchantStorePOSCode: "1326699312", //  1326699310 restaurant , 1326699311 Sweet Counter , 1326699312 Tea counter
        AutoCancelDurationInMinutes:2,
        AutoCancelDurationOnlineInMinutes:5,
        PaperPOSTxnOptionToDisplay:2,
        PaperPOSTxnIdentifier:2,
       // PaymentCashMode:2,
        PaymentCardMode:1,
        PaymentOnlineMode:10,
    },
    PaytmUrl:{
        PaymentDevice : 'Paytm',
        PaymentDeviceConvert : 'PaytmToNormal',
        paytmCloudUrl:'https://securegw-edc.paytm.in/ecr/payment/request',
        paytmStatusUrl : 'https://securegw-edc.paytm.in/ecr/V2/payment/status',
        channelId: 'edc',
        paytmMid: 'Aahhaa60017407386916',    // AAHHAA25426973788994 restaurant  , Aahhaa60017407386916 Sweet Counter  , Aahhaa09709340087790 Tea counter
        paytmTid: '10860308',               // 25745102 restaurant              , 10860308 Sweet Counter                , 10860305 Tea counter
        version: '3.1',
        AutoCancelQRDurationInMinutes:2,
        AutoCancelCardDurationInMinutes:2,
        MERCHANT_KEY :'LyASid4E2emRnmY3',  // y2pSRG%qWbw4@CWU restaurant   , LyASid4E2emRnmY3 Sweet Counter  , WqWVzxUIEg&PDqIX Tea counter
        PaymentCardMode:'CARD',
        PaymentOnlineMode:'QR',
        PaymentAllMode:'ALL',
    }
}   

//TestFile by Raja Mohamed
