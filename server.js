
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , path = require('path')
  , fs = require('fs')
  , canto1 = require('./divinecomedy.js').canto1;

// Configure socket.io to always use WebSockets.

io.configure(function() {
    io.set('transports', [ 'websocket' ]);
});

// Regular HTTP requests return the index-socketio.html. The page
// connects back to the server over WebSockets using socketio 
// and displays messages the server sends to the client.

function handler (req, res) {
    fs.readFile(path.resolve(__dirname, 'index-socketio.html'),
        function (err, data) {
            if (err) {
              res.writeHead(500);
              return res.end('Error loading index-socketio.html');
            }

            res.writeHead(200);
            res.end(data);
        }
    );
}

// WebSocket requests to the server are handled by sending Dante's
// Divine Comedy back to the client over the WebSocket connection, 
// one stanza every 2 seconds. 

io.sockets.on('connection', function (socket) {
    function schedule(line) {
        if (line < canto1.length) 
            setTimeout(function() {
                if (socket) {
                    socket.emit('divinecomedy', canto1[line]);
                    schedule(line + 1);
                }
            }, 2000);
        else if (socket) {
            socket.disconnect();
            socket = null;
        }
    }

    socket.emit('divinecomedy', canto1[0]);
    schedule(1);
});

app.listen(process.env.PORT || 8888);
