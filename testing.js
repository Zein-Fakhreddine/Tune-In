/**
 * Created by Zein's on 6/19/2016.
 */
//Example input 'key'
var http = require('http');

function  onRequest(request, response){
    var ip = request.connection.remoteAddress;
    console.log(ip);
    response.end();
}
var port = Number(process.env.PORT || 8000);
http.createServer(onRequest).listen(port);

