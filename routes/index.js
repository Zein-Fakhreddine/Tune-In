var express = require('express'),
    router = express.Router(),
    Session = require(process.cwd() + "/Session.js");

/* GET home page. */
router.get('/', function(req, res, next) {
    if(2 + 2 == 5){ //Authorization
        res.send(JSON.stringify({error: 'Unauthorized'}));
        res.end();
    } else{
        var key = req.url.split("&key=")[1]; //Only way I know how to get the key for now probably should figure out a better way
        if(key)
            Session.pingSession(key); //Pings session so they don't idle too long and shutdown
        next();
    }
});

//Routes
router.get('/host&name=:name&filter=:filter', Session.hostSession);
router.get('/sessionsonnetwork', Session.getSessionsOnNetwork);
router.get('/user&name=:name&key=:key',Session.addUser);
router.get('/userchosentrack&name=:name&id=:id&key=:key', Session.setUserChosenTrack);
router.get('/currenttrack&id=:id&paused=:paused&key=:key', Session.setCurrentTrack);
router.get('/currenttrackstatechanged&id=:id&paused=:paused&key=:key', Session.setCurrentTrackState);
router.get('/uservotedtrack&name=:name&id=:id&key=:key', Session.setUserVotedTrack);
router.get('/restart&key=:key', Session.restartSession);
router.get('/stop&key=:key', Session.stopSession);
router.get('/sessioninfo&key=:key', Session.sessionInfo);
router.get('/sessionExists&key=:key', Session.sessionExists);


module.exports = router;