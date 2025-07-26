let environment = require('./environment')

class Server {

    get(methodName, params) {
     //   console.log('method Name', methodName);
      //  console.log('params', params)
        $.post(environment.apiURL + methodName, params, function (data) {
            let res = JSON.parse(data);
        //    console.log(res.Status);
            if (res.Status == 'valid') {
                return res.toString();
            }
            else if (res.Status == 'Invalid') {
               // console.log('Invalid data');
            }
            else {
              //  console.log('Invalid data');
            }
        });
    }

    
}

module.exports = new Server();
