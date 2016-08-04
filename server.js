var fs = require('fs'),
    express = require('express'),
    app = express(),
    port = Number(process.env.PORT || 8000),
    Session = require('./Session.js');

app.use(express.static("./public"));

//Routes
app.get("/host&name=:name&filter=:filter", Session.hostSession);
app.get('/sessionsonnetwork', Session.getSessionsOnNetwork);
app.get("/user&name=:name&key=:key",Session.addUser);
app.get("/userchosentrack&name=:name&id=:id&key=:id", Session.setUserChosenTrack);

app.listen(port, function () {
    console.log("Dyanimic Dj server running on: " + port);
});

app.use(function(req, res){
   res.redirect('/index.html');
});

function getSession(key){
    var index = 0;

    if (key.length == 0) return undefined;

    for (var i = 0; i < key.length; i++) {
        var char = key.charCodeAt(i) - 65;
        index += char * ((((i - 4) * -25)) + 1);
    }
    return sessions[index];
}

function generateSessionKey(){
    var chars = [65, 65, 65, 65, 65];
    var key = "AAAAA";
    if(sessions.length == 1)
        return key;
    console.log(sessions.length % 5);


}
