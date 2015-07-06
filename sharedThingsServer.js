// Remember to require config.js for the port number
/* Run this in the current directory via 

nodejs e2server.js

I have the websockets libraries installed in node_modules */
var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
//var messages=[];
//var database = []; //Exercise3
var database = new Database(); //Exercise8

//==================================================
//Exercise 8 - allow the participants to choose the world they want to share
function Database(){
	//Array consist of World objects defined below
	this.worlds = [new World("default")];
	// worldPlayers is an array of Player object;
	this.worldPlayers = []; //Exercise9
}

function World(worldName){
	this.worldName = worldName;
	this.worldState = setupNewWorld();
}

function setupNewWorld(){
	var worldState = {};
	var left = 50;
	var top = 100;
	var itemsToInsert = [
		["x1", "x2", "x3", "x4", "x5"],
		["o1", "o2", "o3", "o4", "o5"],
		["tttboard"]
	];
	var xCoords = [
		100,
		200,
		330,
	];
	console.log(itemsToInsert);
	
	for(var setNum=0; setNum<itemsToInsert.length; ++setNum){
		var currItemsSet = itemsToInsert[setNum];
		top = 100;
		for(var itemName in currItemsSet){
			worldState[currItemsSet[itemName]] = new WorldObject(xCoords[setNum], top);
			top += 60;
		}
	}
	return worldState;
}
function WorldObject(xCoord, yCoord){
	this.x = xCoord;
	this.y = yCoord;
	this.timeStamp = 0;
}

//==================================================
//Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
function Player(name){
	this.Name = name;
	this.GPSLatitude = 0;
	this.GPSLongtitude = 0;
	this.WorldPlaying ="";
}

function addPlayerToUniverse(world, playerName){
	var tPlayer = new Player(playerName);
	tPlayer.WorldPlaying = world;
	database.worldPlayers.push(tPlayer);			
}
function removePlayerFromUniverse(playerName){
	for(var i in database.worldPlayers){
		if(database.worldPlayers[i].Name == playerName){
			database.worlds[i].worldPlayers.splice(j, 1);
			break;
		}
	}
}

function updatePlayerWorld(world, playerName){
	for(var i in database.worldPlayers){
		if(database.worldPlayers[i].Name == playerName){
			database.worldPlayers[i].WorldPlaying = world;
			break;
		}
	}
}
function updatePlayerLocation(world, playerName, latitude, longtitude){
	//search for world in db
	for(var i in database.worldPlayers){
		if(database.worldPlayers[i].Name == playerName){
			database.worldPlayers[i].GPSLatitude = latitude;
			database.worldPlayers[i].GPSLongtitude = longtitude;
			break;
		}
	}				
}

function getPlayersFromWorld(world, playerlist){
	for(var i in database.worldPlayers){
		if(database.worldPlayers[i].WorldPlaying == world){
			playerlist.push(database.worldPlayers[i]);
			
		}
	}	
}

//==================================================
wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

//==================================================
//Exercise 8 - allow participants to choose the world they want to share
function Message(opCode, message){
	this.opCode = opCode;
	this.message = message;
}

wss.on('connection', function(ws) {
	//On first log-on, we send the whole database to the participant's client
	var messageToSend = new Message("FirstConnection", database);
	ws.send(JSON.stringify(messageToSend));

	ws.on('message', function(message) {
    //console.log('received: %s', JSON.stringify(database["world"]));
    //database["world"] = JSON.parse(message); //Exercise3
		var data = JSON.parse(message);
		
		if(data["opCode"] == "UpdateWorldState"){
			for(var i in database.worlds){
				if(database.worlds[i].worldName == data.World){
					database.worlds[i].worldState[data.ObjectChanged].x = data.ObjectXCoor;
					database.worlds[i].worldState[data.ObjectChanged].y = data.ObjectYCoor;
					database.worlds[i].worldState[data.ObjectChanged].timeStamp = data.TimeStamp;
				}
			}
			//Forwards the message to other clients
			wss.broadcast(message); //Exercise4
		}
		else if(data["opCode"] == "NewWorld"){
			createNewWorld(data["worldName"], message);
			// and send new world's map over
			wss.broadcast(JSON.stringify(database));
		}
		else if(data["opCode"] == "GetMyWorldState"){
			//Send the requested world state only
			var worldExist = false;

			for(var i in database.worlds){
				if(database.worlds[i].worldName == data.World){
					var messageToSend = new Message("UpdateWholeWorldState", {"resultStatus":"WorldExist", "world": database.worlds[i]});
					ws.send(JSON.stringify(messageToSend));
					worldExist = true;
				}
			}
			if(!worldExist){
				var messageToSend = new Message("UpdateWholeWorldState", {"resultStatus": "NoSuchWorld"});
				ws.send(JSON.stringify(messageToSend));
			}

		}
		else if(data["opCode"] == "CreateNewWorld"){
			//Check if new world name already exist
			var isExist = false;
			for(var i in database.worlds){
				if(database.worlds[i].worldName == data.World){
					isExist = true;
				}
			}

			//Creates a new world in DB if does not exist
			if(!isExist){
				database.worlds.push(new World(data.World));
			}else{
				//inform client who asked that world already exist
				var messageToSend = new Message("NewWorldCreated", {"resultStatus":"WorldAlreadyExist"});
				ws.send(JSON.stringify(messageToSend));
			}

			// Sends new world to all clients
			// Clients who created an existing world will still get this to refresh their world
			var messageToSend = new Message("NewWorldCreated", {worldName : data.World});
			wss.broadcast(JSON.stringify(messageToSend));
		}
		else if(data["opCode"] == "GetListOfWorlds"){
			var list = [];
			for(var i in database.worlds){
				list.push(database.worlds[i].worldName);
			}
			var messageToSend = new Message("ListOfWorlds", {"list":list});
			ws.send(JSON.stringify(messageToSend));
		}


		//Exercise 9 - Bootstrap User Interface + Addnl instructions pages + Mobile Features
		else if(data["opCode"] == "MotionMessage"){
			if(data.Message.dataType== "Geolocation"){
				var mobileObject = data.Message.MobileObject;
				updatePlayerLocation(mobileObject.World, mobileObject.Player, mobileObject.GPSLatitude, mobileObject.GPSLongtitude);
			}else if(data["dataType"] == "devicemotion"){
			}else if(data["dataType"] == "deviceorientation"){
			}
		}
		else if(data["opCode"] == "JoinWorld"){
			var tPlayer = new Player(data.PlayerName);
			tPlayer.WorldPlaying = data.World;
			database.worldPlayers.push(tPlayer);	
		}
		else if(data["opCode"]=="ChangePlayerWorld"){
			updatePlayerWorld(data.World, data.PlayerName);
		}
		else if(data["opCode"]== "GetPlayersInWorld"){
			var playersList = [];
			getPlayersFromWorld(data.World, playersList);
			var messageToSend = new Message("ResultGetPlayersInWorld", {"PlayerList": playersList});
			ws.send(JSON.stringify(messageToSend));
		}
		else if(data["opCode"]== "ResetMyWorldState"){
		
			for(var i in database.worlds){
				if(database.worlds[i].worldName == data.World){
					database.worlds[i] = new World(data.World);
				}
			}
			
		}
		
		//^^^^^ End of Part of Ex9

	}); //end of ws.on('message',())
});
