var hashTable = require('./HashTable.js');
var User = require('./User.js');
var _keys = [], //Holds all the keys that can be used again
    _count = 0, //counter of how many times a server has been created (NOT HOW MANY SERVER THEIR ARE)
    _sessions = new hashTable(); //Hash table to hold all the sessions

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
}

/**
 * Provides a user in a session based on the name provided
 * @param name The name to match with a user in the session
 * @returns {*} Returns the user if it's found
 */
Session.prototype.findUser = function (name) {
    for (var i = 0; i < this._users.length; i++) {
        if (name == this._users[i]._username)
            return this._users[i];
    }
};

/**
 * Generates a key
 * adds a new session to the hash based on the key
 * @param req Used to get params
 * @param res Responds with the key of the server
 */
Session.hostSession = function (req, res) {
    var key = generateSessionKey();
    _sessions.put(key, new Session(req.params.name, key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.params.filter));
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
    var key = "";
    if (_keys.length != 0) {
        key = _keys[0];
        _keys.splice(0, 1);
        return key;
    }
    var num = _count;
    for (var i = 0; i < 5; i++) {
        key += String.fromCharCode(65 + (num % 26));
        num /= 26;
    }
    _count++;
    return key.split("").reverse().join("");
}

/**
 * Adds a new user to the session
 * It will not add the new user if the name is already taken
 * @param req
 * @param res responds with a message saying if the username was taken or not
 */
Session.addUser = function (req, res) {
    var message = {response: "error"};
    var s = _sessions.get(req.params.key);
    if (s) {
        if (s.findUser(req.params.name)) {
            message.response = "used";
            res.send(JSON.stringify(message));
            return;
        }
        message.response = "free";
        s._users.push(new User(req.params.name));
    }
    res.send(JSON.stringify(message));
};

/**
 * Gets the sessions that match the IP of the request
 * @param req Gets the public IP from the request
 * @param res sends out an JSON array of te sessions found matching the IP
 */
Session.getSessionsOnNetwork = function (req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var sessionsOnNetwork = [];
    _sessions.forEach(function (key, session) {
        if (session._sessionIp == ip)
            sessionsOnNetwork.push(session);
    });
    res.send(JSON.stringify(sessionsOnNetwork));
};

/**
 * Sets a users chosen track id
 * Also provides the sessions iteration in the id param
 * @param req Used to get params
 * @param res Ends at the end
 */
Session.setUserChosenTrack = function (req, res) {
    var s = _sessions.get(req.params.key);
    if (!s)
        return;
    var u = s.findUser(req.params.name);
    if (u)
        u._chosenTrackId = req.params.id + "ITE" + s._sessionIteration;
    res.end();
};

/**
 * Gets an array of all the chosen track ids
 * @param req Used to get params
 * @param res Responds with a JSON array of all the chosen tracks
 */
Session.getChosenTracks = function (req, res) {
    var s = _sessions.get(req.params.key);
    var tracks = [];
    if (s) {
        for (var i = 0; i < s._users.length; i++)
            tracks.push(s._users[i]._chosenTrackId);
    }
    res.send(JSON.stringify(tracks));
};

/**
 * Sets the current track that is playing
 * Also sets whether the current track is paused or not
 * @param req Used to get params
 * @param res Ends the response at the end
 */
Session.setCurrentTrack = function (req, res) {
    var s = _sessions.get(req.params.key);
    if (!s)
        return;
    s._currentPlayingTrackId = req.params.id;
    s._currentTrackPaused = (req.params.paused === 'true');
    res.end();
};

/**
 * Sets a user voted track id
 * @param req Used to get params
 * @param res ends the response at the end
 */
Session.setUserVotedTrack = function (req, res) {
    var s = _sessions.get(req.params.key);
    if (!s)
        return;
    var u = s.findUser(req.params.name);
    if (u)
        u._voteTrackId = req.params.id;
    res.end();
};

/**
 * Gets an array of the voted tracks by all the users on the session
 * @param req Used to get params
 * @param res Responds with an array in JSON format
 */
Session.getVotedTracks = function (req, res) {
    var s = _sessions.get(req.params.key);
    var tracks = [];
    if (s) {
        for (var i = 0; i < s._users.length; i++)
            tracks.push(s._users[i]._voteTrackId);
    }
    res.send(JSON.stringify(tracks));
};

/**
 *  Restarts the session
 *  Adds up the session iteration by one
 *  Restarts all the users in the session
 * @param req Used to get params
 * @param res Ends at the end
 */
Session.restartSession = function (req, res) {
    var s = _sessions.get(req.params.key);
    if (!s)
        return;
    s._sessionIteration++;
    for (var i = 0; i < s._users.length; i++) {
        var name = s._users[i]._username;
        s._users[i] = new User(name);
    }

    res.end();
};

/**
 * TODO: Figure out how to add session key back to array
 * Stops the session
 * sets the stopped session variable to true so the client can read it as true when it gets server info
 * @param req Gets params
 * @param res Ends at the end to prevent no responses
 */
Session.stopSession = function (req, res) {
    var s = _sessions.get(req.params.key);
    s._stoppedSession = true;
    res.end();
};

/**
 * Gets the server info
 * The client parses the information and acts upon changed data
 * @param req Gets params
 * @param res Ends at the end to prevent no responses
 */
Session.sessionInfo = function (req, res) {
    var s = _sessions.get(req.params.key);
    if (!s) {
        var message = 'session ended';
        res.send(JSON.stringify(message));
    }
    res.send(JSON.stringify(s.getServerInfo()));
};

/**
 * Returns a safe version of the session i.e their is no session IP in this one
 * @returns {{serverName: *, serverKey: *, stopped: boolean, serverIteration: number, filterExplicit: *, users: Array, currentPlayingSongId: string, currentSongPaused: boolean}}
 */
Session.prototype.getServerInfo = function () {
    return {
        serverName: this._sessionName,
        serverKey: this._sessionKey,
        stopped: this._stoppedSession,
        serverIteration: this._sessionIteration,
        filterExplicit: this._filterExplicitTracks,
        users: this._users,
        currentPlayingSongId: this._currentPlayingTrackId,
        currentSongPaused: this._currentTrackPaused
    };
};

module.exports = Session;