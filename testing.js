/**
 * Created by Zein's on 6/19/2016.
 */
//Example input 'key'
var http = require('http');

function  onRequest(request, response){
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;
    console.log(ip);
    response.end();
}
var port = Number(process.env.PORT || 8000);
http.createServer(onRequest).listen(port);

