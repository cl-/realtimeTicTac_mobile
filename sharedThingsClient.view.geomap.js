var map;

//var geomap = new GeoMap();
// function GeoMap(){
// }

function showGeoMap(){
  document.getElementById("layeredCanvasContainer").hidden = false;
}
function hideGeoMap(){
  document.getElementById("layeredCanvasContainer").hidden = true;  
}


function clearPlayerGeoMap(playerId){
  var canvas = document.getElementById(playerId);
  if(canvas != null){
    var ctx = canvas.getContext("2d");
    ctx.clearRect();
  }
}

function initializeGoogleMap(){
  window.currLoc = {}; //do not name it as location
  //=========================
  window.onload = function() {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
      }else{
          console.error("Browser:: No geolocation support.");
      }
  };

  var geoLocWatchID = navigator.geolocation.watchPosition(drawOverworldGeoMapWrapper, geoError, geoOptions);

  // var exit=false;
  // if (exit){
  //   navigator.geolocation.clearWatch(geoLocWatchID);
  // }
  // drawOverworldGeoMapWrapper(0);

}
google.maps.event.addDomListener(window, 'load', initializeGoogleMap);

//=========================
  function geoSuccess(position){
    currLoc.lat = position.coords.latitude;
    currLoc.lng = position.coords.longitude;
    currLoc.acc = position.coords.accuracy;
    currLoc.agl = position.coords.heading; //Angle from North
    currLoc.spd = position.coords.speed;
    console.log("AAAAAAAAAAA")
    console.log(currLoc);
  }
  function geoError(posError) {
    console.error("Error occurred. Error code:: " + posError.code);         
  }
  var geoOptions = {
    timeout:5000, //MUST HAVE FREAKING TIMEOUT!!
    maximumAge: 5000, //Allow a cache time of less than 5000 milliseconds
    enableHighAccuracy: false //to counter Error code 3. //http://stackoverflow.com/questions/12680444/navigator-geolocation-getcurrentposition-always-get-a-error-code-3-timeout-expi
  };



//=========================
//http://gis.stackexchange.com/questions/7430/google-maps-zoom-level-ratio#answer-7443
//http://wiki.openstreetmap.org/wiki/FAQ#What_is_the_map_scale_for_a_particular_zoom_level_of_the_map.3F
//http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
//Zoom 18 --> 1 screen cm is 21.2 m --> 37.79527559055pixels
//Zoom 17 --> 1 screen cm is 42.3 m --> 37.79527559055pixels
function drawOverworldGeoMapWrapper(geoPosition){
  // console.log(geoPosition);
  drawOverworldGeoMap(geoPosition.coords.latitude, geoPosition.coords.longitude);
}

function drawOverworldGeoMap(centerPtLatitude, centerPtLongtitude){
  var referenceCanvas = document.getElementById("referenceCanvas");
  var overworldDiv = document.getElementById("map-div");
  overworldDiv.className = "layeredDivMapOpaque";
  overworldDiv.style.top = referenceCanvas.style.top;
  overworldDiv.style.left = referenceCanvas.style.left;
  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(centerPtLatitude, centerPtLongtitude),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-div'),
      mapOptions);

  var populationOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: new google.maps.LatLng(centerPtLatitude, centerPtLongtitude),
      radius: 200
  };
  cityCircle = new google.maps.Circle(populationOptions);
}


function drawPlayerGeoMap(playerId, centerPtLatitude,centerPtLongtitude, otherPlayerId, otherPlayerLatitude,otherPlayerLongtitude){
  // if(playerId==otherPlayerId){
  //   return; //dont 
  // }
  var mapRadiusLimit = document.getElementById("geoMapRadius").value;
  var pt1 = new LatLon(centerPtLatitude, centerPtLongtitude);
  var pt2 = new LatLon(otherPlayerLatitude, otherPlayerLongtitude);
  var ptDistance = Math.abs(pt1.distanceTo(pt2)*1000); //distanceTo gives distance in kilometers. we want meters.
  console.log("ptDistance");
  console.log(ptDistance);
  if( true || ptDistance <= mapRadiusLimit){
    var canvas = document.getElementById(otherPlayerId);
    if(canvas == null){
      var referenceCanvas = document.getElementById("referenceCanvas");
      canvas = document.createElement("canvas");
      canvas.id = otherPlayerId;
      canvas.className = referenceCanvas.className;
      canvas.width = 400;
      canvas.height = 400;
      canvas.style.top = referenceCanvas.style.top;
      canvas.style.left = referenceCanvas.style.left;
      referenceCanvas.parentElement.appendChild(canvas);
    }

    //https://sg.answers.yahoo.com/question/index?qid=20080211182008AAMdUe8
    //Negative Latitude is south. 
    //Negative Longitude is West. 
    var polaritySigns = getPolaritySigns({"x":centerPtLongtitude,"y":centerPtLatitude},
                                         {"x":otherPlayerLongtitude,"y":otherPlayerLatitude});
    var scaleProportion = ptDistance/mapRadiusLimit;
    var maxHoriFromOrigin = canvas.width/2;
    var maxVertFromOrigin = canvas.height/2;
    var coord = {
      x: calcProportionalPositionFromOrigin(canvas.width, scaleProportion*polaritySigns.x),
      y: calcProportionalPositionFromOrigin(canvas.height, scaleProportion*polaritySigns.y)
    };
    console.log("COORD");
    console.log(coord);

    var context = canvas.getContext("2d");
    var radius = 6;
    context.beginPath();
    context.arc(coord.x, coord.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    // context.lineWidth = 5;
    // context.strokeStyle = '#003300';
    // context.stroke();
  }//end of if
}//end of drawPLayerGeoMap

function getPolaritySigns(originCoord, anotherCoord){
  var polaritySigns = {};
  for(var dim in originCoord){
    if((anotherCoord[dim]-originCoord[dim])>=0)
      polaritySigns[dim] = 1;
    else
      polaritySigns[dim] = -1;
  }
  return polaritySigns;
}

function calcProportionalPositionFromOrigin(maxLengthInDimension, scaleProportion){
  console.log(maxLengthInDimension);
  var proportionalPosition = calcProportionalPosition(maxLengthInDimension, scaleProportion);
  var proportionalPositionFromOrigin = (maxLengthInDimension/2) + (proportionalPosition/2);
  return proportionalPositionFromOrigin;
}
function calcProportionalPosition(maxLengthInDimension, scaleProportion){
  return scaleProportion*maxLengthInDimension;
}




/**
 * Creates a point on the earth's surface at the supplied latitude / longitude
 *
 * @constructor
 * @param {Number} lat: latitude in numeric degrees
 * @param {Number} lon: longitude in numeric degrees
 * @param {Number} [rad=6371]: radius of earth if different value is required from standard 6,371km
 */
function LatLon(lat, lon, rad) {
  if (typeof(rad) == 'undefined') rad = 6371;  // earth's mean radius in km
  // only accept numbers or valid numeric strings
  this._lat = typeof(lat)=='number' ? lat : typeof(lat)=='string' && lat.trim()!='' ? +lat : NaN;
  this._lon = typeof(lon)=='number' ? lon : typeof(lon)=='string' && lon.trim()!='' ? +lon : NaN;
  this._radius = typeof(rad)=='number' ? rad : typeof(rad)=='string' && trim(lon)!='' ? +rad : NaN;


/**
 * Returns the distance from this point to the supplied point, in km 
 * (using Haversine formula)
 *
 * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
 *       Sky and Telescope, vol 68, no 2, 1984
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @param   {Number} [precision=4]: no of significant digits to use for returned value
 * @returns {Number} Distance in km between this point and destination point
 */
  this.distanceTo = function(point, precision) {
    // default 4 sig figs reflects typical 0.3% accuracy of spherical model
    if (typeof precision == 'undefined') precision = 4;
    
    var R = this._radius;
    var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
    var lat2 = point._lat.toRad(), lon2 = point._lon.toRad();
    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d.toPrecisionFixed(precision);
  }

}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ---- extend Number object with methods for converting degrees/radians

/** Converts numeric degrees to radians */
if (typeof Number.prototype.toRad == 'undefined') {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

/** Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDeg == 'undefined') {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  }
}

/** 
 * Formats the significant digits of a number, using only fixed-point notation (no exponential)
 * 
 * @param   {Number} precision: Number of significant digits to appear in the returned string
 * @returns {String} A string representation of number which contains precision significant digits
 */
if (typeof Number.prototype.toPrecisionFixed == 'undefined') {
  Number.prototype.toPrecisionFixed = function(precision) {
    
    // use standard toPrecision method
    var n = this.toPrecision(precision);
    
    // ... but replace +ve exponential format with trailing zeros
    n = n.replace(/(.+)e\+(.+)/, function(n, sig, exp) {
      sig = sig.replace(/\./, '');       // remove decimal from significand
      l = sig.length - 1;
      while (exp-- > l) sig = sig + '0'; // append zeros from exponent
      return sig;
    });
    
    // ... and replace -ve exponential format with leading zeros
    n = n.replace(/(.+)e-(.+)/, function(n, sig, exp) {
      sig = sig.replace(/\./, '');       // remove decimal from significand
      while (exp-- > 1) sig = '0' + sig; // prepend zeros from exponent
      return '0.' + sig;
    });
    
    return n;
  }
}

/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
  String.prototype.trim = function() {
    return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }
}
