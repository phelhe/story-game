var socket;

//record to hold information about the major when the server sends it
let globalMajorRecord = {};

//holds a list of divs so that the connectClasses function can use their offsets to connect them
let divs = [];
//holds the elective divs
let elecDivs = [];


// Start a socket connection to the server
//change this when we host it somewhere else?
socket = io.connect('http://localhost:3000');//io.connect('http://cslab1.bc.edu:8150'); //http://cslab1.bc.edu/~phelpsh/
//socket = io.connect('10.0.0.32:3000'); //change this to switcht the host

let myColor = '';
let myName = '';
let myTurn = 0;
let myChoice = 'a';
let letterDivs = [];
let startedNewWord = 0;
//***************socket events --- receiving stuff from the server
//recieved when they go back from class choices
socket.on('youConnected',
  function(color){
    myColor = color;
    console.log("My color: " + myColor);
    view('userName');
  }
);

socket.on('enterGame',
  function(){
    view('gamePage');
  }
);

socket.on('newUser',
  function(users){
    newUser(users);
  }
);

socket.on('yourTurn',
  function(){
    myTurn = 1;
    console.log('it is your turn');
    let area = document.getElementById('userInputArea');
    area.style.backgroundColor = 'red';
  }
);

socket.on('notYourTurn',
  function(){
    myTurn = 0;
    startedNewWord = 0;
    console.log('it is not your turn');
    let area = document.getElementById('userInputArea');
    area.style.backgroundColor = '#0eb79b';
  }
);

socket.on('updateWord',
  function(word){
    let story = document.getElementById('story');
    story.innerHTML = '';
    word.forEach(function(letter){
      story.innerHTML+=letter;
    });
    console.log(word);
  }
);

socket.on('serverMessage', function(messageInfo){
  console.log(messageInfo);
  let messDiv = document.createElement('div');
  messDiv.classList.add('messDiv');
  messDiv.innerHTML = messageInfo;
  let messageArea = document.getElementById('messageArea');
  messageArea.appendChild(messDiv);
});

socket.on('newMessage', function(messageInfo){
  console.log(messageInfo);
  let messDiv = document.createElement('div');
  messDiv.classList.add('messDiv');
  messDiv.innerHTML = messageInfo.name + ": " + messageInfo.message;
  messDiv.style.backgroundColor = messageInfo.color;
  let messageArea = document.getElementById('messageArea');
  messageArea.appendChild(messDiv);
});

function view(page){

  let container = document.getElementById('container');
  while(container.firstChild){ //clear the container
    container.removeChild(container.firstChild);
  }

  switch (page) {
    case 'userName':
      renderNamePick();
      break;
    case 'gamePage':
      renderGamePage();
      break;
    default:

  }
}

function newUser(users){
  let userList = document.getElementById('userList');
  while(userList.firstChild){ //clear the container
    userList.removeChild(userList.firstChild);
  }
  users.forEach(function(user){
    let oneUser = document.createElement('div');
    oneUser.innerHTML = user.name;
    oneUser.style.background = user.color;
    oneUser.classList.add('userPanel');
    oneUser.style.border = 'solid 2px ' + user.color;
    userList.appendChild(oneUser);
  });
}

function renderGamePage(){
  console.log("ENTERED GAME");
  let container = document.getElementById('container');
  let userSpace = document.createElement('div');
  userSpace.classList.add('userInteraction');
  let userList = document.createElement('div');
  userList.classList.add('userList');
  userList.id = "userList";

  let chatArea = document.createElement('div');
  chatArea.classList.add('chatArea');
  let submitButton = document.createElement('div');
  let messageInput = document.createElement('input');
  submitButton.classList.add('submitButton');
  submitButton.innerHTML = 'Send Message';
  submitButton.style.backgroundColor = '#12D2B2';
  submitButton.style.marginLeft = '5%';

  messageInput.addEventListener('keydown', function(e){
    if(e.code == 'Enter'){
      if(messageInput.value){
        sendMessage(messageInput.value, myName, myColor);
      }
      else{
        alert("please enter a message");
      }
      messageInput.value = '';
    }
  });

  submitButton.addEventListener('click', function(event){
    if(messageInput.value){
      sendMessage(messageInput.value, myName, myColor);
    }
    else{
      alert("please enter a message");
    }
    messageInput.value = '';
  });
  submitButton.addEventListener('mouseover', function(event){
    submitButton.style.background = shadeColor('#12D2B2', 35);
  });

  submitButton.addEventListener('mouseout', function(event){
    submitButton.style.background = '#12D2B2';
  });

  let messages = document.createElement('div');
  messages.classList.add('messageArea');
  messages.id = 'messageArea';
  chatArea.appendChild(submitButton);
  chatArea.appendChild(messageInput);
  chatArea.appendChild(messages);

  let gameArea = document.createElement('div');
  gameArea.classList.add('gameArea');

  let story = document.createElement('div');
  story.classList.add('story');
  story.id = 'story';

  gameArea.appendChild(story);


  let playButton = document.createElement('div');
  playButton.classList.add('submitButton');
  playButton.innerHTML = "Play Word";

  playButton.addEventListener('click', function(event){
    if(myTurn){
      if(myInput.value.length < 30){
        playWord(myInput.value + ' ');
        myInput.value = '';
      }
      else{
        alert("please enter a valid word (no spaces and less than 30 chars)");
      }
    }
    else{
      alert("wait your turn");
    }
  });
  playButton.addEventListener('mouseover', function(event){
    playButton.style.background = shadeColor("#12D2B2", 35);
  });

  playButton.addEventListener('mouseout', function(event){
    playButton.style.background = '#12D2B2';
  });

  //restrict input to alphabet
  let myInput = document.createElement('input');
  myInput.classList.add('myInput');
  myInput.addEventListener('keyup', function(event){
    var key = event.keyCode;
    console.log(key);
    if(!((key >= 65 && key <= 90) || key == 8 || key == 222 || key == 13)){
      myInput.value = myInput.value.substring(0,(myInput.value.length - 1)) ;
    }
    if(key==13){
      if(myTurn){
        if(myInput.value.length < 30){
          playWord(myInput.value + ' ');
          myInput.value = '';
        }
        else{
          alert("please enter a valid word (no spaces and less than 30 chars)");
        }
      }
      else{
        alert("wait your turn");
      }
    }
  });


  let letterHolder = document.createElement('div');
  letterHolder.classList.add('letterHolder');
  let alpha = ['.','?','!',',',';'];
  alpha.forEach(function(letter){
    let current = document.createElement('div');
    current.classList.add('letter');
    current.innerHTML = letter;
    if(letter == 'a'){
      current.style.border = 'solid black 2px';
    }
    else{
      current.style.border = 'solid white 2px';
    }
    current.addEventListener('click', function(event){
      letterDivs.forEach(function(div){
        div.div.style.border = 'solid white 2px';
      });
      current.style.border = 'solid 2px black';
      myChoice = letter;
      console.log('you chose: ' + myChoice);
    });
    current.addEventListener('mouseover', function(event){
      current.style.background = 'grey';
    });

    current.addEventListener('mouseout', function(event){
      current.style.background = 'white';
    });
    if(letter == '.'){
      letterDivs.push({letter:letter, div: current, picked: 1});
    }
    else{
      letterDivs.push({letter:letter, div: current, picked: 0});
    }
    letterHolder.appendChild(current);
  });

  console.log(letterDivs);

  let addPunctuation = document.createElement('div');
  addPunctuation.classList.add('submitButton');
  addPunctuation.innerHTML = 'Punctuate';

  addPunctuation.addEventListener('click', function(event){
    if(myTurn && !startedNewWord){
      socket.emit('addPunctuation', myChoice);
      startedNewWord = 1;
    }
    else{
      alert("you cannot start a new sentence again you idiot");
    }
  });
  addPunctuation.addEventListener('mouseover', function(event){
    addPunctuation.style.background = shadeColor("#12D2B2", 35);
  });

  addPunctuation.addEventListener('mouseout', function(event){
    addPunctuation.style.background = '#12D2B2';
  });

  //make it so that the play button and the input are on the same line so it looks better
  let userInputArea = document.createElement('div');
  userInputArea.classList.add('userInputArea');
  userInputArea.id = 'userInputArea';
  userInputArea.appendChild(myInput);
  userInputArea.appendChild(playButton);
  userInputArea.appendChild(letterHolder);
  userInputArea.appendChild(addPunctuation);
  gameArea.appendChild(userInputArea);

  userSpace.appendChild(userList);
  userSpace.appendChild(chatArea);
  container.appendChild(userSpace);
  container.appendChild(gameArea);
}

function renderNamePick(){ //show the page where they enter their name
  let container = document.getElementById('container');
  let holder = document.createElement('div');
  holder.classList.add('holder');
  let label = document.createElement('div');
  label.classList.add('label');
  label.innerHTML = 'Enter a name:';
  holder.appendChild(label);
  let input = document.createElement('input');
  input.classList.add('usernameIn');
  holder.appendChild(input);
  let submitButton = document.createElement('div');
  submitButton.classList.add('submitButton');
  submitButton.innerHTML = "Enter game";
  submitButton.style.width = '33%';
  submitButton.addEventListener('click', function(event){
    if(input.value){
      sendName(input.value, myColor);
      myName = input.value;
    }
    else{
      alert("please enter a name");
    }
  });

  input.addEventListener('keydown', function(e){
    if(e.code == 'Enter'){
      if(input.value){
        sendName(input.value, myColor);
        myName = input.value;
      }
      else{
        alert("please enter a name");
      }
    }
  });

  submitButton.addEventListener('mouseover', function(event){
    submitButton.style.background = shadeColor("#12D2B2", 35);
  });

  submitButton.addEventListener('mouseout', function(event){
    submitButton.style.background = '#12D2B2';
  });
  holder.appendChild(submitButton);
  container.appendChild(holder);
}



//sending stuff to the server

//called when the user selects their major and presses the submit button
//emits chooseClasses to the server and just sends the major choice so the server can respond
//server responds with a majorRecord -- a record holding the name of the major, a list of its classes, and a tree of its classes
function sendName(myName, myColor){
  socket.emit('sentName', {myName, myColor});
}

function sendMessage(message, name, color){
  socket.emit('chatMessage', {
    message,
    name,
    color
  });
}

function playWord(word){
  socket.emit('sentLetter', word);
}

function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}
