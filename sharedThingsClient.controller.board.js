    var selectedWorld = "";
    var boardTracker = new board();
    var winMessage = true;
    
    //=== Class: grid =========================
    function grid(top,left){ //,width,height
      this.top = top;
      this.left = left;
      //Store in board since width and height is same for all grids.
      //Dont store width height here.
      // this.w = width;
      // this.h = height;
    }

    //=== Class: board =========================
    function board(){
      this.grids = [];
      this.grids[0] = false;
      for(var i=0+1; i<9+1; ++i){
        this.grids[i] = new grid( 0,0 );
      }

      this.updateGridPositions = function(){
        this.top = $("#tttboard").offset().top;//style.top;
        this.left = $("#tttboard").offset().left;//style.left;
        this.widthUnit = $("#tttboard").width()/3;
        this.heightUnit = $("#tttboard").height()/3;
        for(var clm=0; clm<3; ++clm){
          for(var row=0; row<3; ++row){
            var num = (row*3)+(clm+1);
            //console.log(this.top +" "+(row*this.heightUnit));
            var gridTop = this.top+ (row*this.heightUnit);
            var gridLeft = this.left+ (clm*this.widthUnit);
            this.grids[num].top = gridTop;
            this.grids[num].left = gridLeft;
          }
        }

      }
      this.logGridPositions = function(){
        //console.log("The TTT Board has been shifted.");
        console.log("T"+this.top+" L-"+this.left+" "+this.widthUnit+" "+this.heightUnit);
        console.log(this.grids);
      }

      //--- Grid Tracking ----------
      this.isOverlapGrid=function(num, x,y){ //Note: num not arrayIdx
        if ( y>this.grids[num].top  && y<(this.grids[num].top +this.heightUnit)
          && x>this.grids[num].left && x<(this.grids[num].left +this.widthUnit)  )
          return true;
        else
          return false;
      }
      this.testisOverlapGrid = function(num, x,y){
        console.log(num +" "+x +" "+ y);
        console.log(this.grids[num].top);
        console.log(this.grids[num].left);
        console.log(y>this.grids[num].top);
        console.log(y<(this.grids[num].top+this.heightUnit));
        console.log(x>this.grids[num].left);
        console.log(x<(this.grids[num].left+this.widthUnit));
      }

      this.whichGridNum = function(x,y){
        for(var num=0+1; num<9+1; ++num){
          //console.log(num);
          if (this.isOverlapGrid(num, x,y))
            return num;
        }
        //else if nothing is found after looping through all elements
        return 0;
      }

      //--- Win Verification ----------
      var WIN_COMBI = [
        [1,2,3], [4,5,6], [7,8,9],
        [1,4,7], [2,5,8], [3,6,9],
        [1,5,9], [3,5,7]
      ];
      var WIN_COMBI_DICT = {};
      for(var i=0; i<WIN_COMBI.length; ++i){
        //encode
        WIN_COMBI_DICT[""] = true;
      }

      function isWinCombi(combiArray){
        var flag = false;
        for(var i=0; i<WIN_COMBI.length; ++i){
          var count=0;
          for(var j=0; j<WIN_COMBI[i].length; ++j){
            if(combiArray[j]==WIN_COMBI[i][j])
              count = count+1;
          }
          if(count==3)
            flag=true;
        }
        return flag;
      }

      function isWinCombi_v2(combiArray){ //this is not working yet. this was not submitted.
        var flag = false;
        for(var i=0; i<WIN_COMBI.length; ++i){
          var count=0;
          var k=0;
          for(var j=0; j<WIN_COMBI[i].length; ++j){
            console.log("-----");
            console.log(WIN_COMBI[i][j]);
            console.log(k+" "+combiArray[k]);
            console.log("=====");
            if(combiArray[k]==WIN_COMBI[i][j]){
              count = count+1;
            }
            if (combiArray.length==3)
              k += 1;
            else if (combiArray.length>3){
              var tryNext=0;
              while ((j+tryNext+1)<combiArray.length){
                tryNext+=1;
                if(combiArray[j+tryNext]==WIN_COMBI[i][j]){
                  //console.log(combiArray[j+tryNext]);
                  k+=tryNext;
                  break;
                }
              }
            }

          }
          if(count==3)
            flag=true;
        }
        return flag;
      }

      //--- Winner Determination ----------
      this.isWonBy = function(xo){
        var currCombi = [];
        xo_widthHalf = $("#"+xo+1).width()/2;
        xo_heightHalf = $("#"+xo+1).height()/2;
        for(var i=0+1; i<5+1; ++i){
          var posx = $("#"+xo+i).offset().left + xo_widthHalf;
          var posy = $("#"+xo+i).offset().top + xo_heightHalf;
          var gridNum = this.whichGridNum(posx,posy);
          //console.log(gridNum);
          if(gridNum !=0) //remove 0 from currCombi
            currCombi.push( gridNum );
        }
        currCombi.sort();
        console.log(currCombi);
        if (isWinCombi(currCombi))
          return true;
        else
          return false;
      }

      //--- Exposed Functions ----------
      this.winnerSide = function(){
        if (isWonBy("x"))
          return "x";
        else if (isWonBy("o"))
          return "o";
        else
          return "";
      }
      this.isWon = function(){
        if (isWonBy("x")){
          return true;}
        else if(isWonBy("o")){
          return true;}
        else{
          return false;}
      }

    }//endof class board
    