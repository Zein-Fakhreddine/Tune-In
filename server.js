var express = require('express'),
    app = express(),
    port = Number(process.env.PORT || 8000),
    Session = require('./Session.js');

//Authorization test and used to ping servers
app.use('/', function(req, res, next){
    if(req.headers['host'] != 'localhost:8000'){ //Authorization
        res.send(JSON.stringify({error: 'Unauthorized'}));
        res.end();
    } else{
        var key = req.url.split("&key=")[1]; //Only way I know how to get the key for now probably should figure out a better way
        if(key)
            Session.pingSession(key); //Pings server so they don't idle too long and shutdown
        next();
    }
});

app.use(express.static('./public'));

//Routes
app.get('/host&name=:name&filter=:filter', Session.hostSession);
app.get('/sessionsonnetwork', Session.getSessionsOnNetwork);
app.get('/user&name=:name&key=:key',Session.addUser);
app.get('/userchosentrack&name=:name&id=:id&key=:key', Session.setUserChosenTrack);
app.get('/currenttrack&id=:id&paused=:paused&key=:key', Session.setCurrentTrack);
app.get('/uservotedtrack&name=:name&id=:id&key=:key', Session.setUserVotedTrack);
app.get('/restart&key=:key', Session.restartSession);
app.get('/stop&key=:key', Session.stopSession);
app.get('/sessioninfo&key=:key', Session.sessionInfo);

app.listen(port, function () {
    console.log("Dynamic Dj server running on: " + port);
});
