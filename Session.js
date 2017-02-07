var User = require('./User.js'), encode = require('htmlencode').htmlEncode;
const IDLE_TIME = 300;
var _keys = [], //Holds all the keys that can be used again
    _count = 0, //counter of how many times a server has been created (NOT HOW MANY SERVER THEIR ARE)
    _sessions = {},
    _ipKeys = {};
/**
 * Session holds all the info for each session on Dynamic Dj
 * @param sessionName The sessions name
 * @param sessionKey The sessions key
 * @param sessionIp The sessions external IP (The Ip it was created from)
 * @param filterExplicitTracks True if the session should filter explicit tracks
 * @constructor
 */
function Session(sessionName, sessionKey, sessionIp, filterExplicitTracks) {
    this._sessionName = sessionName;
    this._sessionKey = sessionKey;
    this._sessionIp = sessionIp;
    this._filterExplicitTracks = filterExplicitTracks;
    this._users = [];
    this._sessionIteration = 0;
    this._stoppedSession = false;
    this._currentPlayingTrackId = "-1";
    this._currentTrackPaused = true;
    this._pinged = false;
    this.idleCounter();
}

/**
 * Provides a user in a session based on the name provided
 * @param name The name to match with a user in the session
 * @returns {*} Returns the user if it's found
 */
Session.prototype.findUser = function (name) {
    for (var i = 0; i < this._users.length; i++) {
        console.log(name);
        console.log( this._users[i].username);
        if (name == this._users[i].username)
            return  this._users[i];
    }
};

/**
 * Generates a key
 * adds a new session to the hash based on the key
 * @param req Used to get params
 * @param res Responds with the key of the server
 */
Session.hostSession = function (req, res) {
    var key = generateSessionKey(), ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    _sessions[key] = new Session(encode(req.params.name), key,ip, req.params.filter);
    if(_ipKeys[ip])
        _ipKeys[ip].push(key);
    else
        _ipKeys[ip] = [key];

    res.send(key);
};

/**
 * Generates a key for a new session
 * If the keys array is not empty it will take a key from their and then remove it
 * If the keys array is empty it will generate the next key based on the count variable
 * TODO: Figure out what to do when their is nothing in the keys array and count is filled i.e count = 26^5
 * @returns {*} Returns a new sessions key
 */
function generateSessionKey() {
    var key = "", num = _count;
    if (_keys.length != 0) {
        key = _keys[0];
        _keys.splice(0, 1);
        return key;
    }
    for (var i = 0; i < 5; i++) {
        key += String.fromCharCode(65 + (num % 26));
        num /= 26;
    }
    _count++;
    return key.split("").reverse().join(""); //Reversed just because it's easier to read but it does work both ways
}

/**
 * Adds a new user to the session
 * It will not add the new user if the name is already taken
 * @param req
 * @param res responds with a message saying if the username was taken or not
 */
Session.addUser = function (req, res) {
    var message = {response: "error", sessionName: "error", sessionIteration: -1};
    var s = _sessions[req.params.key];
    if (s) {
        message.sessionIteration = s._sessionIteration;
        message.sessionName = s._sessionName;
        if (s.findUser(req.params.name))
            message.response = "used";
        else{
            message.response = "free";
            var u = new User(encode(req.params.name));
            s._users.push(u);
        }
    }
    res.send(JSON.stringify(message));
};

/**
 * Gets the sessions that match the IP of the request
 * TODO: Find a faster way to get sessions on your network
 * @param req Gets the public IP from the request
 * @param res sends out an JSON array of te sessions found matching the IP
 */
Session.getSessionsOnNetwork = function (req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var sessionsOnNetwork = [];
    /*

    for(var key in _sessions) {
        var s = _sessions[key];
        if (s._sessionIp == ip)
            sessionsOnNetwork.push(s.getSessionInfo());
    }
    */
    var keys = _ipKeys[ip];
    if(keys)
        for(var i = 0; i < keys.length; i++)
            sessionsOnNetwork.push(_sessions[keys[i]].getSessionInfo());

    res.send(JSON.stringify(sessionsOnNetwork));
};

/**
 * Sets a users chosen track id
 * Also provides the sessions iteration in the id param
 * @param req Used to get params
 * @param res Ends at the end
 */
Session.setUserChosenTrack = function (req, res) {
    var s = _sessions[req.params.key];
    console.log(s);

    if (s) {
        var u = s.findUser(req.params.name);
        console.log(u);
        if (u)
            u.chosenTrackId = encode(req.params.id + "ITE" + s._sessionIteration);
        console.log( encode(req.params.id + "ITE" + s._sessionIteration));
    }
    res.end();
};

/**
 * Sets the current track that is playing
 * Also sets whether the current track is paused or not
 * @param req Used to get params
 * @param res Ends the response at the end
 */
Session.setCurrentTrack = function (req, res) {
    var s = _sessions[req.params.key];
    if (s) {
        s._currentPlayingTrackId = req.params.id;
        s._currentTrackPaused = (req.params.paused === 'true');
    }
    res.end();
};

/**
 * Sets a user voted track id
 * @param req Used to get params
 * @param res ends the response at the end
 */
Session.setUserVotedTrack = function (req, res) {
    var s = _sessions[req.params.key];
    if (s) {
        var u = s.findUser(req.params.name);
        if (u)
            u.votedTrackId = encode(req.params.id);
    }
    res.end();
};

/**
 *  Restarts the session
 *  Adds up the session iteration by one
 *  Restarts all the users in the session
 * @param req Used to get params
 * @param res Ends at the end
 */
Session.restartSession = function (req, res) {
    var s = _sessions[req.params.key];
    if (s) {
        s._sessionIteration++;
        for (var i = 0; i < s._users.length; i++) {
            var name = s._users[i].username;
            s._users[i] = new User(name);
        }
    }
    res.end();
};

/**
 * TODO: Figure out how to add session key back to array mostly a client side issue
 * Stops the session
 * sets the stopped session variable to true so the client can read it as true when it gets server info
 * @param req Gets params
 * @param res Ends at the end to prevent no responses
 */
Session.stopSession = function (req, res) {
    var s = _sessions[req.params.key];
    if (s)
        s._stoppedSession = true;
    res.end();
};

/**
 * Simple function that sets pinged to true
 * Is called when any request with a key param is loaded
 * Used to keep the function from idling and stopping
 * @param key
 */
Session.pingSession = function (key) {
    var s = _sessions[key];
    if (s)
        s._pinged = true;
};

/**
 * Gets the server info
 * The client parses the information and acts upon changed data
 * @param req Gets params
 * @param res Ends at the end to prevent no responses
 */
Session.sessionInfo = function (req, res) {
    var s = _sessions[req.params.key];
    if (s) {
        res.send(JSON.stringify(s.getSessionInfo()));
        return;
    }
    res.end();
};

/**
 * Does a simple check to ensure a session exists
 * Used client side to only connect users to an existing session
 * @param req Gets params
 * @param res Sends true of false based on if the session exists or not
 */
Session.sessionExists = function (req, res) {
    if(_sessions[req.params.key])
        res.send('true');
    else
        res.send('false');
};

/**
 * Returns a safe version of the session i.e their is no session IP in this one
 * @returns {Session}
 */
Session.prototype.getSessionInfo = function () {
    return {
        sessionName: this._sessionName,
        sessionKey: this._sessionKey,
        stopped: this._stoppedSession,
        sessionIteration: this._sessionIteration,
        filterExplicitTracks: this._filterExplicitTracks,
        users: this._users,
        currentPlayingTrackId: this._currentPlayingTrackId,
        currentTrackPaused: this._currentTrackPaused
    };
};

/**
 * Used to stop sessions that have been idling for more than IDLE_TIME
 */
Session.prototype.idleCounter = function () {
    var time = 0, that = this;
    setInterval(function () {
        time++;
        if (time == IDLE_TIME) {
            if (!that._pinged) {
                that._stoppedSession = true;
            } else {
                that.idleCounter();
                that._pinged = false;
            }
            clearInterval(this);
        }
    }, 1000);
};

module.exports = Session;