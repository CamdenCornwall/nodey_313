//////////////////////////////////////////////////////////
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const cool = require('cool-ascii-faces');
var url = require('url');

var port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.get('/cool', (req, res) => res.send(cool()));
app.get('/submit-postage', function(req, res) {postageCalc(req, res);});
app.get('/postage', (req, res) => res.render('pages/postage'));
// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
//////////////////////////////////////////////////////////////////////

//const cool = require('cool-ascii-faces');
//var url = require('url');
//const PORT = process.env.PORT || 5000;

//express()
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
//  .engine('html', require('ejs').renderFile)
//  .set('view engine', 'ejs')
//  .get('/', (req, res) => res.render('pages/index'))
//  .get('/submit-postage', function(req, res) {postageCalc(req, res);})
//  .get('/postage', (req, res) => res.render('pages/postage'))
//  .get('/cool', (req, res) => res.send(cool()));
  //.listen(port, () => console.log(`Listening on ${ port }`));
  
/////////////////////////////////////////////////////////////////////////////
function postageCalc(request, response){
    var requestUrl = url.parse(request.url, true);
	console.log("Query parameters: " + JSON.stringify(requestUrl.query));
        var cost = 0;
        var weight = Number(requestUrl.query.weight);
	var mail = requestUrl.query.mail;
        
        
        
        if(mail == "stamped") {
            cost += 5;
        }
        else if(mail == "metered") {
            cost += 10;
        }
        else if(mail == "flats") {
            cost += 15;
        }
        else if(mail == "retail") {
            cost += 20;
        }
        var result = weight * 5;
        var result2 = result + cost;
        
        var param = {mail: mail, weight: weight, totalCost: result2};
        
        response.render('pages/postage_total', param);
        

}