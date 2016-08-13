var session;
function Session(key, sessionName, filter) {
    this._key = key;
    this._sessionName = sessionName;
    this._filter = filter;
    this._users = [];
}

function User(name) {
    this._name = name;
}

function hostSever(sessionName, usename, filter) {
    console.log(sessionName);
    var key = getData('/host&name=' + sessionName + '&filter=' + filter, function (key) {
        getData('/user&name=' + usename + '&key=' + key, function (message) {
            if (JSON.parse(message).response == 'free') {
                session = new Session(key, sessionName, filter);
                session._users.push(new User(usename));
                //Save data
                localStorage.setItem('session', JSON.stringify(session));
                window.location.href ='http://localhost:8000/session.html'
            }
            else
                alert('There was an error trying to add your user');
        });
    });
}

function loadSession(){
    session = JSON.parse(localStorage.getItem('session'));
    if(!session){
        window.location.href = 'http://localhost:8000/index.html';
        return;
    }
    createSession(session._sessionName, session._users[0]._name);
}

function getData(url, callback) {
    $.get(url).done(callback);
}