var method = User.prototype;

function User(userName){
    this._username = userName;
    this._chosenTrackId = "-1";
    this._voteTrackId = "-1";
}

module.exports = User;
