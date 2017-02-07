var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    socket = require('socket.io')(server),
    port = Number(process.env.PORT || 8000),
    routes = require('./routes/index'),
    Session = require('./Session.js');

server.listen(port, function () {
    console.log('Server running on port ' + port);
});
//Routes
app.use(routes);
