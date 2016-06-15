
var http = require('http');
var fs = require("fs");

var servers = [];

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

var server = function(name, key){
    console.log("Server created with the server key: " + key + " and the servername: " + name);
    this.serverName = name;
    this.serverKey = key;
    this.hasBeenPinged = true;
    this.users = [];
    this.restartingNames = [];
    this.serverIteration = 0;
    this.stopedServer = false;
    this.filterExplicit = false;
};

var user = function (userName) {
    this.userName = userName;
    this.hasChosen = false;
    this.hasVoted = false;
    this.chosenSongId = "-1";
    this.votedSongId = "-1";
};

var track = function (track_id) {
    this.track_id = track_id;
    this.votes = 0;
};


//404 response
function send404Response(response){
    response.writeHead(404, {"Context-Type": "text/plain"});
    response.write("Error 404 page not found");
    console.log("error");
    response.end();
}

//Handle a user request
function onRequest(request, response){


    var index = request.url.split("/")[1].split("&")[0];

    if(index == 'ping'){
        response.writeHead(202, {"Context-Type": "text/plain"});
        response.write('pong');
    }

    if(index == 'servercheck'){
        var serverKey = request.url.split("&key=")[1];
        var exists = false;
        for(i in servers){
            var s = servers[i];
            if(s.serverKey == serverKey){
                s.hasBeenPinged = true;
                exists = true;
            }
        }

        response.writeHead(202, {"Context-Type": "text/plain"});
        response.write(exists.toString());
    }

    if(index == 'host') {
        var  serverName = request.url.split("=")[1];
        for(var i  =0; i < serverName.length; i++){
            if(serverName.charAt(i) == '+')
                serverName =  serverName.replace('+', ' ');
        }

        var key = getKey();
        servers.push(new server(serverName, key));
        console.log("New server added with name: " + serverName);

        response.writeHead(202, {"Context-Type": "text/plain"});
        response.write(key);
    }

    if(index == 'filter'){
        var serverKey = request.url.split("&key=")[1];
        for(i in servers){
            var s = servers[i];
            if(s.serverKey == serverKey){
                var explicit = request.url.split("&explicit=")[1].split("&key=")[0];
                if(explicit == "true")
                    s.filterExplicit = true;
                else
                    s.filterExplicit = false;
            }



        }
    }

    if(index == 'user') {
        var  username = request.url.split("=")[1].split("&")[0];

        for(var i  =0; i < username.length; i++){
            if(username.charAt(i) == '+')
                username = username.replace('+', ' ');
        }

        var serverKey = request.url.split("&key=")[1];
        for(i in servers){
            var s = servers[i];
            if(s.serverKey == serverKey){
                response.writeHead(202, {"Context-Type": "text/plain"});
                var hasBeenTaken = false;
                for(x in s.users){
                    var u = s.users[x];
                    if(u.userName == username)
                        hasBeenTaken = true;
                }
                if(hasBeenTaken)
                    response.write("ht");
                else
                    response.write("gg" + " &ITE=" + s.serverIteration + "&SES=" + s.serverName);

                s.hasBeenPinged = true;
                console.log("New user requested with the username: " + username + " and the serverkey: " + serverKey);
                s.users.push(new user(username));
            }
        }


    }

    if(index == 'userschosensong'){
        var name = request.url.split("=")[1].split("&")[0];
        for(var i  =0; i < name.length; i++){
            if(name.charAt(i) == '+')
                name = name.replace('+', ' ');
        }

        var trackId = request.url.split("&id=")[1].split("&key=")[0];

        var serverKey = request.url.split("&key=")[1];
        console.log("The name is: " + name);
        console.log("The serverkey is: " + serverKey);
        for(i in servers){
            var s = servers[i];
            console.log("Checking serverkey: " + s.serverKey);
            if(s.serverKey ==  serverKey){
                //Selected server
                console.log("Found the server when trying to push track");
                s.hasBeenPinged = true;
                console.log("User size: " + s.users.length);
                for(x in s.users){
                    var u = s.users[x];
                    console.log("Checking user with name: " + u.userName);
                    if(u.userName == name){
                        u.chosenSongId = trackId + "ITE" + s.serverIteration;
                        console.log("Added users chosen song with the the name: " + u.userName + "and the chosen song id: " + u.chosenSongId);
                    }
                }
            }
        }
    }

    if(index == 'getchosensongs'){
        response.writeHead(202, {"Context-Type": "text/plain"});
        var serverKey = request.url.split("&key=")[1];
        for(i in servers){
            var s = servers[i];
            if(s.serverKey == serverKey){
                s.hasBeenPinged = true;
                for(x in s.users){
                    var u = s.users[x];

                    if(u.chosenSongId)
                        response.write(u.chosenSongId + ",");
                }
            }
        }
    }

    if(index == 'uservotedsong'){
        var name = request.url.split("=")[1].split("&")[0];
        for(var i  =0; i < name.length; i++){
            if(name.charAt(i) == '+')
                name = name.replace('+', ' ');
        }

        var trackId = request.url.split("&id=")[1].split("&key=")[0];

        var serverKey = request.url.split("&key=")[1];
        console.log("The name is: " + name);
        console.log("The serverkey is: " + serverKey);
        for(i in servers){
            var s = servers[i];
            console.log("Checking serverkey: " + s.serverKey);
            if(s.serverKey ==  serverKey){
                s.hasBeenPinged = true;
                //Selected server
                console.log("Found the server when trying to push track");
                console.log("User size: " + s.users.length);
                for(x in s.users){
                    var u = s.users[x];
                    console.log("Checking user with name: " + u.username);
                    if(u.userName == name){
                        u.votedSongId = trackId
                        console.log("Added users voted song with the the name: " + u.userName + "and the voted song id: " + u.chosenSongId);
                    }
                }
            }
        }
    }

    if(index == 'getvotes'){
        var serverKey = request.url.split("&key=")[1];
        response.writeHead(202, {"Context-Type": "text/plain"});
        for(i in servers){
            var s = servers[i];
            if(s.serverKey == serverKey){
                for(x in s.users){
                    var u = s.users[x];
                    if(u.votedSongId)
                        response.write(u.votedSongId.toString() + ",");
                }
            }
        }
    }

    if(index == 'restart'){
        var wroteSomething = false;
        response.writeHead(202, {"Context-Type": "text/plain"});
        var serverKey = request.url.split("&key=")[1];
        var name = request.url.split("=")[1].split("&")[0];
        var isServer = request.url.split("&server=")[1].split("&key=")[0];
        console.log("Restarting with the serverkey: " + serverKey + ' and the username: ' + name + " and isServer is: " + isServer);
        for(i in servers){
            var s = servers[i];
            if(s.serverKey == serverKey){
                if(isServer == 'true')
                    s.serverIteration++;
                s.hasBeenPinged = true;
                for(x in s.users){
                    var u = s.users[x];
                    if(isServer == 'true'){
                        s.restartingNames.push(u.userName);
                        if(u.userName == name){
                            u.chosenSongId = "-1";
                            u.votedSongId = "-1";
                            u.hasChosen = false;
                            u.hasVoted = false;
                        }
                    }
                    else{
                        for(z = 0; z <  s.restartingNames.length; z++){
                            var restartName = s.restartingNames[z];
                            if(restartName == u.userName){
                                u.chosenSongId = "-1";
                                u.votedSongId = "-1";
                                u.hasChosen = false;
                                u.hasVoted = false;
                                s.restartingNames.splice(z, 1);
                                z--;
                                wroteSomething = true;
                                break;
                            }
                        }
                    }
                }
                if(isServer != 'true'){
                    if(s.stopedServer){
                        response.write('stoped');
                    } else{
                        if(wroteSomething)
                            response.write('restart ' + "&ITE=" + s.serverIteration);
                        else
                            response.write("Don't restart");
                    }


                }
            }

        }
    }

    if(index == 'stopsession'){
        for(i in servers){
            var s = servers[i];
            console.log("Checking serverkey: " + s.serverKey);
            var serverKey = request.url.split("&key=")[1];
            if(s.serverKey ==  serverKey){
                s.hasBeenPinged = true;
                //Selected server
                s.stopedServer = true;
            }
        }
    }

    if(index == 'serverinfo'){
        for(i in servers){
            var s = servers[i];
            console.log("Checking serverkey: " + s.serverKey);
            var serverKey = request.url.split("&key=")[1];
            if(s.serverKey ==  serverKey){
                response.writeHead(202, {"Context-Type": "text/plain"});
                var obj = new Object();
                obj.serverName = s.serverName;
                obj.serverKey = s.serverKey;
                obj.usercount = s.users.length;
                obj.stoped = s.stopedServer;
                obj.serverIteration = s.serverIteration;
                obj.filterExplicit = s.filterExplicit;
                obj.users = s.users;
                response.write(JSON.stringify(obj));
            }
        }
    }

    response.end();
}

function getKey(){
    var text = "";

    for( var i=0; i < 5; i++ )
        text += letters.charAt(Math.floor(Math.random() * letters.length));

    var isFound = false;

    for(i in servers){
        var s = servers[i];
        if(s.serverKey == text)
            isFound = true;
    }

    if(isFound)
        return getKey();
    else
        return text;
}

setInterval(function(){
    for(i in servers){
        var s = servers[i];
        if(!s.hasBeenPinged){
            console.log("Getting rid of server due to inactivity with the key: " + s.serverKey);
            servers.splice(i, 1);
        }
        else{
            s.hasBeenPinged = false;
        }
    }


},300000);
var port = Number(process.env.PORT || 8000);
http.createServer(onRequest).listen(port);
console.log("The server is running");
