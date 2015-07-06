var socket; //Exercise2
var objectState = []; //Exercise7
var objectLastMovedTime = []; //Exercise7ver2
var currentWorld = "default"; //Exercise8 //replaces selectedWorld

var myMobileObject = new MobileObject(); //Exercise9
var player = "testPlayer"; //Exercise9

//==================================================
//Exercise 8 - allow participants to choose the world they want to share
function Message(opCode){
  this.opCode = opCode;
  this.ObjectChanged = "";
  this.ObjectXCoor = 0;
  this.ObjectYCoor = 0;
  this.World = "";
  this.TimeStamp = 0;

  this.Message = ""; //Exercise9
  this.PlayerName = ""; //Exercise9
}

function updateWorldWrapper(worldName){
  window.location.hash = "#"+worldName;
  updateWorld();
}

function updateWorld(){
  //selected a new world ==> so update current world to new world
  //currentWorld = $("#currWorldName").val();
  $("#currWorldName").text(getCurrWorldName()); //OPTIONAL code
  updateShareURL();
  currentWorld = $("#currWorldName").text();
  var messageToSend = new Message("GetMyWorldState"); //Get new world state
  messageToSend.World = currentWorld;
  console.log(messageToSend);
  send(JSON.stringify(messageToSend));

  //Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
  //Update player's world in server side
  var messageToSend = new Message("ChangePlayerWorld");
  messageToSend.World = currentWorld;
  messageToSend.PlayerName = player;
  send(JSON.stringify(messageToSend));
  //^^^^^ End of Part of Ex9
}

//=========================
//Additonal Features
function getCurrWorldName(){
  //var worldparam = window.location.search.replace( "?", "" );
  var worldparam = window.location.hash.replace( "#", "" );
  if (worldparam != "")
    currentWorld = worldparam;
  else
    currentWorld = "default";
  return currentWorld;
}

function updateShareURL(){
  var shareurl = window.location.href;
  var param = getCurrWorldName();
  //if (param != selectedWorld){
  if (param != currentWorld){
    shareurl = window.location.href.replace( /\#\S+/, "" )  +"#"+selectedWorld;
    window.location.href = shareurl;
  }
  
  //Add bitly integration if there's time. It requires edits to backend php.
  $("#shareurl-span").text(shareurl);
}
function selectShareURL(){
  var pResponse = window.prompt("Copy to clipboard: Ctrl+C, Enter", $("#shareurl-span").text() );
  if (pResponse == true){ //DOESNT WORK: (pResponse == true || pResponse == false)
    closeShareURL();
  }
  else{
    closeShareURL();
  }
}

function showShareURL(){
  $(".shareurl").show();
}
function closeShareURL(){
  $(".shareurl").hide();
}


//==================================================
//Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
function MobileObject(){
  this.World = "";
  this.Player = "";
  this.LinearAccelerometerX = "";
  this.LinearAccelerometerY = "";
  this.LinearAccelerometerZ = "";
  this.AccelerometerIncludingGravityX = "";
  this.AccelerometerIncludingGravityY = "";
  this.AccelerometerIncludingGravityZ = "";
  this.GyroscopeX = "";
  this.GyroscopeY = "";
  this.GyroscopeZ = "";
  this.GPSLatitude = "";
  this.GPSLongtitude = "";
  //The current orientation of the device around the Z axis; that is, how far the device is rotated around a line perpendicular to the device.
  this.alpha = "";
  //The current orientation of the device around the X axis; that is, how far the device is tipped forward or backward.
  this.beta = "";
  //The current orientation of the device around the Y axis; that is, how far the device is turned left or right.
  this.gamma = "";
}

//-------------------------
//Exercise 8 - allow participants to choose the world they want to share
function logDrag(event, ui){
  // //console.log(JSON.stringify(ui.position) + " " + event.target.id);
  // var images = $(".draggable");
  // var world = {};
  // $.each(images, function(key, value){
  //  world[value.id]={x:$(this).offset().left, y:$(this).offset().top};  
  // });
  // //console.log(JSON.stringify(world));
  // send(JSON.stringify(world));
  objectLastMovedTime[event.target.id] = (new Date()).getTime();
  var messageToSend = new Message("UpdateWorldState");
  messageToSend.ObjectChanged = event.target.id;
  messageToSend.ObjectXCoor = ui.position.left;
  messageToSend.ObjectYCoor = ui.position.top;
  messageToSend.World = currentWorld;
  messageToSend.TimeStamp = (new Date()).getTime();
  send(JSON.stringify(messageToSend));
}

//==================================================
//Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
function joinWorld(playerName, worldName){
  var messageToSend = new Message("JoinWorld");
  messageToSend.World = worldName;
  messageToSend.PlayerName = playerName;
  send(JSON.stringify(messageToSend));
}
function getAllPlayersInWorld(worldName){
  // the reply will come in message with opCode "ResultGetPlayersInWorld"
  var messageToSend = new Message("GetPlayersInWorld");
  messageToSend.World = worldName;
  send(JSON.stringify(messageToSend));
  console.log(messageToSend);
}

//==================================================
//Exercise 2 - send world state to server
function setupWebSocket(){
  socket = new WebSocket("ws://cp3101b-1.comp.nus.edu.sg:"+port);
  socket.onopen = function (event) {
    console.log("connected");

    //Exercise 8 - allow participants to choose the world they want to share
    //On connected get your current world state
    var messageToSend = new Message("GetMyWorldState");
    messageToSend.World = currentWorld;
    send(JSON.stringify(messageToSend));

    //Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
    // send join world command with anonymous player name
    var randomPlayerName = "abc" + (new Date()).getTime();
    playerId = randomPlayerName;
    joinWorld(randomPlayerName, currentWorld);
    getAllPlayersInWorld(currentWorld);
    //^^^^^ End of Part of Ex9

    // Then get list of all worlds
    var messageToSend = new Message("GetListOfWorlds");
    send(JSON.stringify(messageToSend));
    //^^^^^````` End of Part of Ex8
  };
  socket.onclose = function (event) {
    alert("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
  };
  socket.onmessage = function (event) {
    //console.log(event.data); //Exercise4
    //$('#messages').append("<br/>"+event.data);

    //Exercise 5 - update the positions of the images on display
    //var data = JSON.parse(event.data);
    var incomingData = JSON.parse(event.data); //Exercise8

    //Exercise 8 - allow participants to choose the world they want to share
    if(incomingData.opCode == "FirstConnection"){
      //Not in use
      console.log(incomingData);
    }
    //Update a single object
    else if(incomingData.opCode == "UpdateWorldState"){
      //Check if is our world
      if(currentWorld == incomingData.World){
        if(objectLastMovedTime[incomingData.ObjectChanged] >= incomingData.TimeStamp){
          //Local copy is newer so do nothing
        }else{
          $("#"+incomingData.ObjectChanged).offset({top:incomingData.ObjectYCoor, left: incomingData.ObjectXCoor});
        }
      }
    }
    //Update the whole world objects
    else if(incomingData.opCode == "UpdateWholeWorldState"){
      // Check is it a successful message=
      if(incomingData.message.resultStatus == "NoSuchWorld"){
        //You asked for a world that did not exist=
      }else{
        $.each(incomingData.message.world.worldState, function(key, value){
          //Exercise 7 - create usable, polished, glitchless version of system - simplify code & fix issues on  usability, performance, scalability (usable, minimize load)
          $("#"+key).offset({top:value.y, left: value.x}); //Exercise5..
          //^^^^^^^^^^ End of Part of Ex7
          //console.log(value);
        });
      }
    }
    else if(incomingData.opCode == "NewWorldCreated"){
      if(incomingData.message.resultStatus == "WorldAlreadyExist"){
        alert("World Already Exists. Please use another name.");
        console.log("World Already Exists. Please use another name.");
      }else{
        // Did i just created this new world?
        if(incomingData.message.worldName == currentWorld){
          // get new whole world object
          var messageToSend = new Message("GetMyWorldState");
          messageToSend.World = currentWorld;
          send(JSON.stringify(messageToSend));
        }
        //update world list is sufficient
        var messageToSend = new Message("GetListOfWorlds");
        send(JSON.stringify(messageToSend));
      }

    }
    else if(incomingData.opCode == "ListOfWorlds"){
      //$("#worldList").empty(); //DONT empty #worldList - it contains other things - remove all .worldListing instead.
      $(".worldListing").remove();
      $.each(incomingData.message.list, function(key, value){
        //$("#worldList").append(new Option(value, value));
        //$("#worldListDivider").before(value);
        addWorldListLi(value);
      });
      //$("#worldList").val("Some World Name");
      $("#currWorldName").text(getCurrWorldName());
      updateShareURL();
    }
    else if(incomingData.opCode == "ResultGetPlayersInWorld"){
      //var locOfPlayerOnThisDevice = incomingData.message.PlayerList[playerId]; //WRONG FORMAT
      var dataOfDeviceOwner;
      $.each(incomingData.message.PlayerList, function(key, value){
        if(value.Name == playerId)
          dataOfDeviceOwner = value;
      });
      var centerPt = dataOfDeviceOwner;
      drawOverworldGeoMap(centerPt.GPSLatitude, centerPt.GPSLongtitude);
      $.each(incomingData.message.PlayerList, function(key, value){
        clearPlayerGeoMap(value.Name);
        drawPlayerGeoMap(centerPt.Name, centerPt.GPSLatitude, centerPt.GPSLongtitude,
            value.Name, value.GPSLatitude, value.GPSLongtitude);
      });
    }

    function addWorldListLi(worldName){
      var li = $('<li/>')
          .addClass('worldListing')
          .click(function(){ updateWorldWrapper(worldName); });
          //.appendTo(ulObj);
      var aa = $('<a/>')
          .attr('href', '#'+worldName)
          .text(worldName)
          .appendTo(li);
      $("#worldListDivider").before( li );
    }
    //^^^^^````` End of Part of Ex8
    //^^^^^^^^^^^^^^^ End of Part of Ex5

  };// end of socket.onmessage(event)
}
function send(text){
  socket.send(text);
}

//==================================================
//Exercise 7 - create usable, polished, glitchless version of system - simplify code & fix issues on  usability, performance, scalability (usable, minimize load)
function logStart(event, ui){
  //objectState[event.target.id] = "moving";
}
function logStop(event, ui){
  //objectState[event.target.id] = "";

  //For checking win condition
  // boardTracker.updateGridPositions();
  // if(boardTracker.isWonBy("x") && winMessage){
  //   alert("Congratulations: X won!");
  //   winMessage = false;
  // }
  // else if(boardTracker.isWonBy("o") && winMessage){
  //   alert("Congratulations: O won!");
  //   winMessage = false;
  // }
}
//^^^^^^^^^^ End of Part of Ex7

//==================================================
//Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
function handleMotionEvent(event){
  var messageToSend = new Message("MotionMessage");
  if(event.type == "deviceorientation"){
    //DeviceOrientationEvent
    myMobileObject.alpha = event.alpha;
    myMobileObject.beta = event.beta;
    myMobileObject.gamma = event.gamma;
  }else if(event.type = "devicemotion"){
    myMobileObject.AccelerometerIncludingGravityX = event.accelerationIncludingGravity.x;
    myMobileObject.AccelerometerIncludingGravityY = event.accelerationIncludingGravity.y;
    myMobileObject.AccelerometerIncludingGravityZ = event.accelerationIncludingGravity.z;    
    myMobileObject.GyroscopeX = event.rotationRate.alpha;
    myMobileObject.GyroscopeY = event.rotationRate.beta;
    myMobileObject.GyroscopeZ = event.rotationRate.gamma;
    myMobileObject.LinearAccelerometerX = event.acceleration.x;
    myMobileObject.LinearAccelerometerY = event.acceleration.y;
    myMobileObject.LinearAccelerometerZ = event.acceleration.z;
  }

  // Send motion to sever if needed
  //messageToSend.Message = {"MobileObject": myMobileObject, "dataType": event.type};
  //send(JSON.stringify(messageToSend));
}
function resetWorldState(){
  var messageToSend = new Message("ResetMyWorldState");
  messageToSend.World = currentWorld;
  send(JSON.stringify(messageToSend));
}


function testFunction(){
  var messageToSend = new Message("MotionMessage");
  // Update player name and world
  myMobileObject.Player = player;
  myMobileObject.World = "default";
  messageToSend.Message = {"MobileObject": myMobileObject, "dataType": "Geolocation"};
  send(JSON.stringify(messageToSend));
}
function handleGeolocation(pos){
  myMobileObject.GPSLatitude = pos.coords.latitude;
  myMobileObject.GPSLongtitude = pos.coords.longitude;
  
  //Send location to server 
  var messageToSend = new Message("MotionMessage");
  // Update player name and world
  myMobileObject.Player = player;
  myMobileObject.World = currentWorld;
  messageToSend.Message = {"MobileObject": myMobileObject, "dataType": "Geolocation"};

  //Only send if there is player information
  if(player == "testPlayer"){
    //dont send
  }else{
   send(JSON.stringify(messageToSend));
  }
}
function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};

//==================================================
$(function() { 
  $("#world img").draggable({containment: '#world', scroll:true}); 
  $("#world img").on("dragstart", function(event, ui) { logStart(event, ui); });
  $("#world img").on("dragstop" , function(event, ui) { logStop(event, ui); });
  $("#world img").on("drag"     , function(event, ui) { logDrag(event, ui); });

  //Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
  // setup mobile listeners
  window.addEventListener("devicemotion", handleMotionEvent, false);
  window.addEventListener("deviceorientation", handleMotionEvent, false);
  var options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
  };
  navigator.geolocation.watchPosition(handleGeolocation, null, options);
  //^^^^^ End of Part of Ex9

  //Exercise 8 - allow participants to choose the world they want to share
  updateShareURL();
  window.onhashchange = updateShareURL;

  $("#worldList").change(function(){
    updateWorld();
  });

  // This creates a new world
  $("#newWorldForm").submit(function(event){
    event.preventDefault();
    if($("#newWorld").val()==""){
      return;
    }
    //update current world to new world
    currentWorld = $("#newWorld").val();
    var messageToSend = new Message("CreateNewWorld");
    messageToSend.World = $("#newWorld").val();
    send(JSON.stringify(messageToSend));
  });
  //^^^^^````` End of Part of Ex8
  setupWebSocket();

});

function upcomingFeature(){
  alert("This feature will be available shortly.");
}
