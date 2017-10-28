//use express
var express = require('express');
//create app
var app = express();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

// Set up the server
var server = app.listen(3000, listen); //8150 -- phelpsh@cslab1.bc.edu with Eagle ID as pw

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


// WebSocket Portion
var io = require('socket.io')(server);


let colors2 = ["#7AD334", "#88aaff", "#F0A000", "#DAD320", "#dd9999", "#ffaa88", "#ddaacc", "#62f79b", "#ff5151", "#a975ff"];

let users = [];
let word = [];
let turnQueue = [];

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {

    console.log("We have a new client: " + socket.id); //USE THIS SOCKET ID TO EMIT A MESSAGE BACK!!

    let myColor = chooseColor();

    //socket.broadcast.to(socket.id).emit('chooseMajor', 'hello');
    io.to(socket.id).emit('youConnected', myColor);

    //should emit the choosmajor event to the client!!!

    //need to figure out how to submit to just one user

    //should emit chooseMajor to the client
    //should be recieved when the user goes back from the class choice part
    socket.on('sentName',
      function(record) {
        users.push({
          name: record.myName,
          color: record.myColor,
          id: socket.id
        });
        turnQueue.push({
          name: record.myName,
          color: record.myColor,
          id: socket.id
        });
        console.log(users);
        io.to(socket.id).emit('enterGame'); //send them back to the choose major page
        users.forEach(function(user){
          io.to(user.id).emit('newUser', users);
          io.to(user.id).emit('serverMessage', record.myName + " has joined the game!");
        });

        if(users.length == 1){
          io.to(socket.id).emit('serverMessage', "It is now " + users[0].name + "'s turn!");
          io.to(socket.id).emit('yourTurn');
        }

        if(word.length > 0){
          io.to(socket.id).emit('updateWord', word);
        }
    });

    socket.on('chatMessage', function(messageInfo){
      console.log(messageInfo.name + ": " + messageInfo.message);
      console.log(messageInfo);
      users.forEach(function(user){
        sendMessage(user.id, messageInfo.name, messageInfo.message, messageInfo.color);
        /*io.to(user.id).emit('newMessage',
          messageInfo.name + ": " + messageInfo.message,
          messageInfo.color
        );*/
      });
    });

    function sendMessage(user, name,message,color){
      io.to(user).emit('newMessage', {
        name,
        message,
        color
      });
    }

    socket.on('sentLetter', function(letter){
      word.push(letter);
      console.log(word);
      users.forEach(function(user){
        io.to(user.id).emit('updateWord', word);
        io.to(user.id).emit('notYourTurn');
      });

      var index = Math.floor(Math.random()*users.length);
      var choice = users[index];
      turnQueue.push(turnQueue.shift());
      users.forEach(function(user){
        io.to(user.id).emit('serverMessage', "It is now " + turnQueue[0].name + "'s turn!");
      });
      console.log("TURNQUEUE--------------");
      console.log(turnQueue);
      console.log("------------------------");
      io.to(turnQueue[0].id).emit('yourTurn');
    });

    socket.on('addPunctuation', function(punctuation){
      console.log('punctiation added');
      //word.push(letter);
      word[word.length-1] = word[word.length-1].substring(0,word[word.length-1].length-1) + punctuation;
      console.log(word);
      word.push(' ');
      users.forEach(function(user){
        io.to(user.id).emit('updateWord', word);
      });
    });

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
      for(var i = 0; i<users.length; i++){
        if(users[i].id == socket.id){
          users.forEach(function(user){
            io.to(user.id).emit('serverMessage', users[i].name + " has left the game.");
          });
          users.splice(i,1);
        }
      }
      for(var i = 0; i<turnQueue.length; i++){
        if(turnQueue[i].id == socket.id){
          turnQueue.splice(i,1);
        }
      }
      users.forEach(function(user){
        io.to(user.id).emit('newUser', users);
        io.to(user.id).emit('serverMessage', "It is now " + turnQueue[0].name + "'s turn!");
      });
      console.log(turnQueue);
      if(turnQueue.length>0){
        io.to(turnQueue[0].id).emit('yourTurn');
      }
    });
  }
);


//class tree functions

function chooseColor(){
  //console.log("choosing a color...");
  var index = Math.floor(Math.random()*colors2.length);
  var choice = colors2[index];
  //colors.splice(index,1);
  //console.log(choice);
  return choice;
}
