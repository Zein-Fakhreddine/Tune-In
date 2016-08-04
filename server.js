var fs = require('fs'),
    express = require('express'),
    app = express(),
    port = Number(process.env.PORT || 8000),
    Session = require('./Session.js');

app.use(express.static('./public'));

//Routes
app.get('/host&name=:name&filter=:filter', Session.hostSession);
app.get('/sessionsonnetwork', Session.getSessionsOnNetwork);
app.get('/user&name=:name&key=:key',Session.addUser);
app.get('/userchosentrack&name=:name&id=:id&key=:key', Session.setUserChosenTrack);
app.get('/chosentracks&key=:key', Session.getChosenTracks);
app.get('/currenttrack&id=:id&paused=:paused&key=:key', Session.setCurrentTrack);
app.get('/uservotedtrack&name=:name&id=:id&key=:key', Session.setUserVotedTrack);
app.get('/votedtracks&key=:key', Session.getVotedTracks);
app.get('/restart&key=:key', Session.restartSession);
app.get('/stop&key=:key', Session.stopSession);
app.get('/sessioninfo&key=:key', Session.sessionInfo);

app.listen(port, function () {
    console.log("Dyanimic Dj server running on: " + port);
});

app.use(function(req, res){
   res.redirect('/index.html');
});
