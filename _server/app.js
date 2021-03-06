var usersManager = function () {
    this.users = [];
};

usersManager.prototype.add = function(id) {
    this.users[id] = {
        id: id,
        x: 10,
        y: 10
    };
};

usersManager.prototype.get = function(id) {
    if (!id) {
        return this.users;
    }

    return this.users[id];
};

usersManager.prototype.set = function(id, x, y) {
    this.users[id] = {
        x: x,
        y: y,
        id: id
    };
};

usersManager.prototype.delete = function(id) {
    delete this.users[id];
};


/*********************************/
/*********************************/
/*********************************/


var io = require('socket.io')(8080);
var users = new usersManager();

io.on('connection', function (socket) {

    // On envoie au nouvel utilisateur
    // les joueurs deja presents
    for (var player in users.get()) {
        if (
            users.get(player).id == socket.id ||
            users.get(player) == false
        ) {
            continue;
        }

        socket.emit('newUser', users.get(player));
    }

    // On ajoute l'utilisateur
    users.add(socket.id);

    // On notifie les autres joueurs du
    // nouvel utilisateur
    socket.broadcast.emit('newUser', users.get(socket.id));



    /********************/
    /** EVENT LISTENER **/
    /********************/

    // Lorsqu'un joueur bouge
    socket.on('setPosition', function (event) {
        // On met a jour x & y
        users.set(socket.id, event.x, event.y);

        // On met a jour le perso sur les autres joueurs
        socket.broadcast.emit('interact', {
            id: socket.id,
            event: event.name
        });

    });


    // Lors de la deconnexion
    socket.on('disconnect', function () {
        users.delete(socket.id);
        socket.broadcast.emit('logOut', socket.id);
    });

});