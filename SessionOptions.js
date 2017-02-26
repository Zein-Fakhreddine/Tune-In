
function SessionOptions(options){

}

SessionOptions.prototype.setOptions = function(options){
    this._filterExplicitTracks = options.filterExplicitTracks;
    this._minTrackTime = options.minTrackTime;
    this._maxTrackTime = options.maxTrackTime;
}