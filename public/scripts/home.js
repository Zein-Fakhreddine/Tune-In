function host() {
    var sessionName = $('#hName').val();
    var name = $('#hUser').val();
    var filter = ($('#filter').is(':checked'));
    if (sessionName.length == 0 || name.length == 0) {
        alert('Please make sure to fill in the session name and the users name');
        return;
    }

    hostSever(sessionName, name, filter);
}