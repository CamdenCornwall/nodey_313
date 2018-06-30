const cool = require('cool-ascii-faces');
const express = require('express');
var http = require('http').Server(express);
var io = require('socket.io').listen(http);
const path = require('path');
var url = require('url');
const PORT = process.env.PORT || 5000;




express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .engine('html', require('ejs').renderFile)
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/chat', (req, res) => res.render('pages/chathtml.html'))
  .get('/submit-postage', function(req, res) {postageCalc(req, res);})
  .get('/postage', (req, res) => res.render('pages/postage'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
  
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});
















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