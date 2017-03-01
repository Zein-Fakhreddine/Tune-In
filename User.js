function User(userName){
    this.username = userName;
    this.chosenTrackId = "-1";
    this.votedTrackId = "-1";
    this._pinged = true;
    this._timedOut = false;
    this.idleChecker();
}

/**
 * Checks if the User has been pinged
 * User should be pinged by the users app
 * Checks every 1 second
 */
User.prototype.idleChecker = function () {
    var that = this;
    setInterval(function () {
        if(that._pinged){
            that._pinged = false;
        } else
            that._timedOut = true;
    }, 3000);
};

module.exports = User;
