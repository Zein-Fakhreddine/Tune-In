
function searchTracks(trackName, offset, limit, callback){
    $.get('api.spotify.com/v1/search?query=' + trackName.split(' ').join('%20') + '&offset=' + offset + '&limit=' + limit + '&type=track').done(callback);
}