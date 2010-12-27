//Copyright (c) 2010 Daniel Westendorf

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


(function( $ ) {
  
  function NothingMe(size) {
    //Initialize at the bottom of the class so it is called when all the methods are available 
    this.ToNothing = function() {
      return this.passedValue;
    };

    this.Nearest = function() {
      switch (true) {
        case this.passedValue > 0.0 : this.nearestUnitSize = this.ToNothing(); this.nearestUnit = ""; break;
        default : this.nearestUnitSize = this.ToNothing(); this.nearestUnit = ""; break;
      };
    };

    this.Round = function() {
      return Math.round(this.nearestUnitSize * 100) / 100;
    };

    this.ConvertTo = function(target) {
      switch(target) {
        case "" : return this.ToNothing(); break;
        default : return this.ToNothing(); break;
      };
    };
  
    //initialize
    this.passedValue = parseFloat(size);  
    this.Nearest(); 

  };

  $.fn.visify = function(data, subjectTitle, dataTitles, options) {

    var settings = {
      'barWidth'        : 50,
      'barSpacing'      : 55,
      'backgroundColor' : this.css("background-color"),
      'fontSize'        : parseInt(this.css("font-size")),
      'fontFamily'      : this.css("font-family"),
      'colors'          : [{"R": 210, "G": 49, "B": 42}, {"R": 45, "G": 146, "B": 255}, {"R": 249, "G": 159, "B": 0}, {"R": 105, "G": 151, "B": 47}],
      'graphLines'      : 5,
      'rounder'         : 1,
      'converter'       : NothingMe
    };

    return this.each(function() {
      if (options) { 
        $.extend(settings, options); //merge the options
      };
      containerDiv = $(this); 
      //plugin code
     
      var barWidth = settings['barWidth'], barSpacing = settings['barSpacing'], backgroundColor = settings['backgroundColor'], fontSize = settings['fontSize'], fontFamily = settings['fontFamily'], colors = settings['colors'], graphLines = settings['graphLines'], rounder = settings['rounder'], Converter = settings['converter']; //set the settings to variables
      
      if ($.browser.msie == true) { //make compatible with excanvas.js for IE
        var canvas = document.createElement('canvas');
        $(canvas).height(containerDiv.height()).width(containerDiv .width());
        containerDiv .append(canvas);
        G_vmlCanvasManager.initElement(canvas);
        var canvasCxt = canvas.getContext('2d');        
      } else { //use this on ever other browser
        var canvas = $('<canvas id="' + containerDiv.attr('id') + '_canvas" width="' + containerDiv.width() + '" height="' + containerDiv.height() + '"></canvas>');
        containerDiv.append(canvas);
        var canvasCxt = document.getElementById(containerDiv.attr('id') + '_canvas').getContext('2d');
      }

      //find the max value
      var maxArray = [];
      for (var i = 0; i < data.length; i += 1) {
        var total = 0;
        for (var ii = 0; ii < dataTitles.length; ii += 1 ) {
          total += data[i][dataTitles[ii]];
        };
        maxArray.push(total);
      };
      var max = Math.max.apply(Math, maxArray);
 
      maxConverted = new Converter(max); //We use this to scale every other value to the maximum's unit. This allows for appropriate scale
      max = maxConverted.nearestUnitSize;

      var graphTopBound = fontSize + 10, graphHeight = parseInt(containerDiv .height() - 80);
    
      var multiplier = graphHeight / (max + (max * 0.1)); //calculate what we need to multiply every other value to, so that it is proportional to the MAX
      var graphIncrement = 0; //value that the graph lines and markers should be incremented
      do {
        graphIncrement = Math.round((max / graphLines) * rounder) / rounder; //split the graph into however many lines you want to show
        rounder = rounder * 10;
      } while (graphIncrement == 0);//auotmatically caluclate how many decimal places are needed. If all the values are under 1, then we should show at least one tenth of one

      //prep canvas style etc to draw the graph lines
      canvasCxt.font = fontSize + 'px "' + fontFamily + '"';
      canvasCxt.textAlign = "right";
      var graphLeftBound = canvasCxt.measureText(Math.round(graphIncrement * 2 * (graphLines + 1) * rounder)/rounder + maxConverted.nearestUnit).width + 8, graphWidth = parseInt(containerDiv.width()) - (graphLeftBound + graphLeftBound/2);
      
      currentPosition = graphHeight - graphIncrement * multiplier;
      graphMark = graphIncrement; // label for the first line mark above zero
      canvasCxt.lineWidth = 2;
      canvasCxt.strokeStyle = "rgba(51,51,51,0.3)"; //set the opacity for the line marks

      canvasCxt.beginPath();
      do { //draw the marker lines
        canvasCxt.moveTo(graphLeftBound, currentPosition); // move to the left bound
        canvasCxt.lineTo(graphLeftBound + graphWidth, currentPosition); //draw to the bar right of the allowable graph size
        canvasCxt.fillText(graphMark + maxConverted.nearestUnit, graphLeftBound - 4, currentPosition + fontSize / 2 -2); //label the graph mark
        currentPosition -= graphIncrement * multiplier; //decrement (going bottom to top) the new position
        graphMark = Math.round((graphMark + graphIncrement) * rounder) / rounder; //new label after adding the increment
      } while (currentPosition > graphTopBound);//do this until the we'll be writing off the top of the canvas
      canvasCxt.stroke();
      canvasCxt.closePath();

      //draw the graphs
      var barLeft = graphLeftBound + barSpacing/2; //start the first bar half of the total barspacing from the left of the graph
      canvasCxt.beginPath();
  
      for (var i = 0; i < data.length; i += 1) { //go through each object with values
          var barBottom = graphHeight;
          var total = 0;
          var barsBelow = 0;
        for (var ii = 0; ii < dataTitles.length; ii += 1) { //go through each value of the given object
          var color = colors[ii]; //grab the color out of the color array
          if (data[i][dataTitles[ii]] > 0) {
            var convertedObject = new Converter(data[i][dataTitles[ii]]).ConvertTo(maxConverted.nearestUnit); //gather the converted size
            total += convertedObject; //keep a total tally for the label
            var calculatedHeight = (convertedObject * multiplier) - barsBelow; //actual pix placement on the canvas. decrement if there is a bar below so that it its on top of the other bar
            var barTop = barBottom - calculatedHeight; //draw from the topleft to the bottom right
            canvasCxt.fillStyle = backgroundColor; //color in the back of the bar. comment out this line to make the bars transparent
            canvasCxt.fillRect(barLeft, barTop, barWidth, barBottom - barTop);//color in the back of the bar. comment out this line to make the bars transparent
            canvasCxt.lineWidth = 2;
            canvasCxt.strokeStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.95)'; //bar's bounding box style
            canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.65)'; //bar's fill style
            canvasCxt.fillRect(barLeft, barTop, barWidth, barBottom - barTop);//fill it up with color
            canvasCxt.strokeRect(barLeft, barTop, barWidth, barBottom - barTop);//outline it
            var label = Math.round(convertedObject * 100) / 100 + maxConverted.nearestUnit; //generate the label
            canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 1.0)'; //style the label
            canvasCxt.font = 'bold ' + fontSize + 'px "' + fontFamily + '"';
            if (canvasCxt.measureText(label).width < (barBottom - barTop) - 10) { //check to see if the label will fit within the bar segment with space to spare (5px on each side)
              canvasCxt.rotate(-90 * Math.PI / 180); //rotate the canvas 90 degress so we have vertical text
              canvasCxt.textAlign = "center"; //center the text
              canvasCxt.textBaseline = "middle";
              canvasCxt.fillText(label , -(barBottom - (calculatedHeight/2) + 2), barLeft + barWidth/2);//write the text in the middle of the bar segment + 2 for the top border stroke width
              canvasCxt.rotate(90 * Math.PI / 180); //rotate the canvas back to 0 degrees for futher drawing
              canvasCxt.textBaseline = "alphabetic";
            }
            barBottom -= calculatedHeight + 2; //decrement the bar bottom to be the top of the previous segment plus 2 to compensate for the bar border
            barsBelow = 2; //set the barsBelow variable to the width of the bar border below it
          }
        } 
        var title = data[i][subjectTitle]; //get the subject title
        canvasCxt.fillStyle = "#000000";
        canvasCxt.font = 'normal ' + fontSize + 'px "' + fontFamily + '"';
        var cursor = graphHeight + fontSize + 4;
        if (canvasCxt.measureText(title).width > (barSpacing + barWidth + 5)) {
          var testString = "";
          var maxCharacters = 0;
          for (var c = 0; c < title.length; c += 1) {
            if (canvasCxt.measureText(testString).width < (barSpacing + barWidth - 5)) {
              testString += title.charAt(c);
              maxCharacters += 1;
            }
          };
    
          var lines = [];
          var tempString = title;
          do {
            var count = maxCharacters;
            while (count > 1 && tempString.charAt(count) !== " ") {
              count -= 1;
            };
            lines.push(tempString.slice(0, count));
            tempString = tempString.slice(count, tempString.length);
        
          } while (canvasCxt.measureText(tempString).width > (barSpacing + barWidth + 5));
          lines.push(tempString)
          for (var line = 0; line < lines.length; line += 1) {
            canvasCxt.fillText(lines[line], barLeft + barWidth / 2, cursor, barSpacing + barWidth + 5); //write the subject title line 1
            cursor += fontSize + 4;
          }
        } else {
          canvasCxt.fillText(title, barLeft + barWidth / 2, cursor, barSpacing + barWidth + 5); //write the subject title
          cursor += fontSize + 4;
        }
        canvasCxt.fillStyle = "#000000";
        canvasCxt.fillText("Total: " + (Math.round(total * 100) / 100) + maxConverted.nearestUnit, barLeft + barWidth / 2, cursor, barSpacing + barWidth + 10); //write the total
        barLeft += barWidth + barSpacing; //increment the spacing before moving on to the next object
      }
      canvasCxt.closePath();
      
      canvasCxt.beginPath();
      canvasCxt.strokeStyle = "rgba(51,51,51,1)";
      canvasCxt.textAlign = "right";
      canvasCxt.moveTo(graphLeftBound, 0); //draw leftbound of graph
      canvasCxt.lineTo(graphLeftBound, graphHeight);//draw leftbound of graph
      canvasCxt.lineTo(graphLeftBound + graphWidth, graphHeight); //draw the bottom bound of graph
      canvasCxt.fillText("0" + maxConverted.nearestUnit, graphLeftBound - 4, graphHeight + fontSize / 2 -2); //give the bottom bound a label
      canvasCxt.stroke();
      canvasCxt.closePath();
    
      //draw the Key
      canvasCxt.beginPath();
      canvasCxt.textAlign = "right";
      canvasCxt.font = 'bold ' + fontSize + 'px "' + fontFamily + '"';
      var leftAdjust = graphLeftBound + graphWidth;
      for (var i = 0; i < dataTitles.length; i += 1) {  
        var color = colors[i]; //get the same color as used in the respective bar segment
        canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 1)';
        canvasCxt.fillText(dataTitles[i], leftAdjust, fontSize + 2); //write the dataTitle
        leftAdjust -= canvasCxt.measureText(dataTitles[i]).width + 8; //adjust for the dataTitle text width
        canvasCxt.strokeStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.95)';
        canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.65)';
        canvasCxt.fillRect(leftAdjust, 2, -(fontSize + 2), (fontSize + 2)); // fill the rectangle
        canvasCxt.strokeRect(leftAdjust, 2, -(fontSize + 2), (fontSize + 2)); //draw the rectangle
        leftAdjust -= (fontSize + 30);//space between key items
      }
      canvasCxt.closePath();
   
    }); // end return

  }; //end plugin function


})( jQuery );
