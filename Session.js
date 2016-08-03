var method = Session.prototype,
    _validKeySymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    _keys = [],
    User = require('./User.js'),
    _sessions = [];

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

Session.hostSession = function (req, res) {
    var key = generateSessionKey();
    _sessions.push(new Session(req.params.name, key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.params.filter));
    res.send(key);
};

function generateSessionKey() {
    return "AAAAA";
}

Session.addUser = function (req, res) {
    var message = {response: "error"};
    var index = getSessionIndex(req.params.key);
    console.log(index);
    if (index != undefined) {
        for (var i = 0; i < _sessions[index]._users.length; i++) {
            if (_sessions[index]._users[i]._username == req.params.name) {
                message.response = "used";
                break;
            }
        }

        message.response = "free";
    }
    res.send(JSON.stringify(message));
};

Session.getSessionsOnNetwork = function (req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var sessionsOnNetwork = [];
    for (var i = 0; i < _sessions.length; i++) {
        if (ip == _sessions[i]._sessionIp) {
            sessionsOnNetwork.push(_sessions[i].getServerInfo());
            break;
        }
    }

    res.send(sessionsOnNetwork);
};

Session.setUserChosenTrack = function (req) {
    var s = _sessions[getSessionIndex(req.params.key)];
    for (var i = 0; i < s._users.length; i++) {
        if (s._users[i]._username == req.params.name) {
            s._users[i]._chosenTrackId = req.params.id + "ITE" + s._sessionIteration;
            break;
        }
    }
};

function getSessionIndex(key) {
    for (var i = 0; i < _sessions.length; i++) {
        if (key == _sessions[i]._sessionKey)
            return i;
    }
    return undefined;
}

method.getServerInfo = function () {
    var obj = {
        serverName: this._sessionName,
        serverKey: this._sessionKey,
        stopped: this._stoppedSession, //TODO: Fix spelling of word stoped to stopped
        serverIteration: this._sessionIteration,
        filterExplicit: this._filterExplicitTracks,
        users: this._users,
        currentPlayingSongId: this._currentPlayingTrackId,
        currentSongPaused: this._currentTrackPaused
    };

    return obj;
};

module.exports = Session;