function show_addNewWorldInput(state){
  document.getElementById("newWorldForm").hidden= !state;
  if(state==true)
    //document.getElementById("newWorldBtn").style.visibility = "hidden";
    document.getElementById("newWorldBtn").style.display = "none";
  else if(state==false)
    //document.getElementById("newWorldBtn").style.visibility = "visible";
    document.getElementById("newWorldBtn").style.display = "inline";
}

function show_shareUrlBox(state){
  document.getElementById("shareUrlBox").hidden= !state;
  if(state==true)
    //document.getElementById("newWorldBtn").style.visibility = "hidden";
    document.getElementById("newWorldBtn").style.display = "none";
  else if(state==false)
    //document.getElementById("newWorldBtn").style.visibility = "visible";
    document.getElementById("newWorldBtn").style.display = "inline";
}


