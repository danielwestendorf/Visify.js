//Copyright (c) 2010 Daniel Westendorf

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function( $ ) {
  
  function ByteMe(size) {
    this.byteForm = parseFloat(size);  
    this.Nearest(); 
  };

  ByteMe.prototype.ToKB = function() {
    return this.byteForm / 1024.0;
  };

  ByteMe.prototype.ToMB = function() {
    return this.byteForm / Math.pow(1024.0, 2);
  };

  ByteMe.prototype.ToGB = function() {
    return this.byteForm / Math.pow(1024.0, 3);
  };

  ByteMe.prototype.ToTB = function() {
    return this.byteForm / Math.pow(1024.0, 4);
  };

  ByteMe.prototype.ToPB = function() {
    return this.byteForm / Math.pow(1024.0, 5);
  };

  ByteMe.prototype.ToXB = function() {
    return this.byteForm / Math.pow(1024.0, 6);
  };

  ByteMe.prototype.Nearest = function() {
    switch (true) {
      case (this.byteForm > 0.0 && this.byteForm < 1024.0): this.nearestiUnitSize = this.byteForm; this.nearestUnit = "B"; break;
      case (this.byteForm > 1024.0 && this.byteForm < (Math.pow(1024.0, 2) - 1)): this.nearestUnitSize = this.ToKB(); this.nearestUnit = "KB"; break;
      case (this.byteForm > (Math.pow(1024.0, 2)) && this.byteForm < (Math.pow(1024.0, 3) - 1)): this.nearestUnitSize = this.ToMB(); this.nearestUnit = "MB"; break;
      case (this.byteForm > (Math.pow(1024.0, 3)) && this.byteForm < (Math.pow(1024.0, 4) - 1)): this.nearestUnitSize = this.ToGB(); this.nearestUnit = "GB"; break;
      case (this.byteForm > (Math.pow(1024.0, 4)) && this.byteForm < (Math.pow(1024.0, 5) - 1)): this.nearestUnitSize = this.ToTB(); this.nearestUnit = "TB"; break;
      case (this.byteForm > (Math.pow(1024.0, 5)) && this.byteForm < (Math.pow(1024.0, 6) - 1)): this.nearestUnitSize = this.ToPB(); this.nearestUnit = "PB"; break;
      default : this.nearestUnitSize = this.ToXB(); this.nearestUnit = "XB"; break;
    };
  };

  ByteMe.prototype.Round = function() {
    return Math.round(this.nearestUnitSize * 100) / 100;
  }

  ByteMe.prototype.ConvertTo = function(target) {
    switch(target) {
      case "B" : return this.byteForm; break;
      case "KB" : return this.ToKB(); break;
      case "MB" : return this.ToMB(); break;
      case "GB" : return this.ToGB(); break;
      case "TB" : return this.ToTB(); break;
      case "PB" : return this.ToPB(); break;
      default : return this.ToXB(); break;
    }
  }

  $.fn.visify = function(data, subjectTitle, dataTitles, options) {

    var settings = {
      'barWidth'        : 50,
      'barSpacing'      : 55,
      'backgroundColor' : this.css("background-color"),
      'fontSize'        : parseInt(this.css("font-size")),
      'fontFamily'      : this.css("font-family"),
      'colors'          : [{"R": 210, "G": 49, "B": 42}, {"R": 45, "G": 146, "B": 255}, {"R": 249, "G": 159, "B": 0}, {"R": 105, "G": 151, "B": 47}],
      'graphLines'      : 5,
      'rounder'         : 1
    }

    return this.each(function() {
      if (options) { 
        $.extend(settings, options); //merge the options
      }
      containerDiv = $(this); 
      //plugin code
     
      var barWidth = settings['barWidth'], barSpacing = settings['barSpacing'], backgroundColor = settings['backgroundColor'], fontSize = settings['fontSize'], fontFamily = settings['fontFamily'], colors = settings['colors'], graphLines = settings['graphLines'], rounder = settings['rounder']; //set the settings to variables

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
      
    
      maxConverted = new ByteMe(max); //We use this to scale every other value to the maximum's unit. This allows for appropriate scale
      max = maxConverted.nearestUnitSize;

      var graphLeftBound = 60, graphTopBound = 10,graphHeight = parseInt(containerDiv .height() - 80), graphWidth = parseInt(containerDiv.width() - 90);
    
      var multiplier = graphHeight / (max + (max * 0.1)); //calculate what we need to multiply every other value to, so that it is proportional to the MAX
      var graphIncrement = 0; //value that the graph lines and markers should be incremented
      do {
        graphIncrement = Math.round((max / graphLines) * rounder) / rounder; //split the graph into however many lines you want to show
        rounder = rounder * 10;
      } while (graphIncrement == 0);//auotmatically caluclate how many decimal places are needed. If all the values are under 1, then we should show at least one tenth of one

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
      
      //prep canvas style etc to draw the graph lines
      canvasCxt.font = fontSize + 'px "' + fontFamily + '"';
      canvasCxt.textAlign = "right";
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
            var byteObject = new ByteMe(data[i][dataTitles[ii]]).ConvertTo(maxConverted.nearestUnit); //gather the converted size
            total += byteObject; //keep a total tally for the label
            var calculatedHeight = (byteObject * multiplier) - barsBelow; //actual pix placement on the canvas. decrement if there is a bar below so that it its on top of the other bar
            var barTop = barBottom - calculatedHeight; //draw from the topleft to the bottom right
            canvasCxt.fillStyle = backgroundColor; //color in the back of the bar. comment out this line to make the bars transparent
            canvasCxt.fillRect(barLeft, barTop, barWidth, barBottom - barTop);//color in the back of the bar. comment out this line to make the bars transparent
            canvasCxt.lineWidth = 2;
            canvasCxt.strokeStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.95)'; //bar's bounding box style
            canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.65)'; //bar's fill style
            canvasCxt.fillRect(barLeft, barTop, barWidth, barBottom - barTop);//fill it up with color
            canvasCxt.strokeRect(barLeft, barTop, barWidth, barBottom - barTop);//outline it
            var label = Math.round(byteObject * 100) / 100 + maxConverted.nearestUnit; //generate the label
            canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 1.0)'; //style the label
            canvasCxt.font = 'bold ' + fontSize + 'px "' + fontFamily + '"';
            if (canvasCxt.measureText(label).width < (barBottom - barTop) - 10) { //check to see if the label will fit within the bar segment with space to spare (5px on each side)
              canvasCxt.rotate(-90 * Math.PI / 180); //rotate the canvas 90 degress so we have vertical text
              canvasCxt.textAlign = "center"; //center the text
              canvasCxt.textBaseline = "middle";
              canvasCxt.fillText(label , -(barBottom - (calculatedHeight/2)), barLeft + barWidth/2);//write the text in the middle of the bar segment
              canvasCxt.rotate(90 * Math.PI / 180); //rotate the canvas back to 0 degrees for futher drawing
              canvasCxt.textBaseline = "alphabetic";
            }
            barBottom -= calculatedHeight + 2; //decrement the bar bottom to be the top of the previous segment plus 2 to compensate for the bar border
            barsBelow = 2; //set the barsBelow variable to the width of the bar border below it
          }
        } 
        var title = data[i][subjectTitle]; //get the subject title
        canvasCxt.fillStyle = "#000";
        canvasCxt.font = 'normal ' + fontSize + 'px "' + fontFamily + '"';
        canvasCxt.fillText(title, barLeft + barWidth / 2, graphHeight + fontSize + 4); //write the subject title
        canvasCxt.fillText("Total: " + (Math.round(total * 100) / 100) + maxConverted.nearestUnit, barLeft + barWidth / 2, graphHeight + (fontSize * 2) + 8); //write the total
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
      var canvasBottom = containerDiv.height();
      for (var i = 0; i < dataTitles.length; i += 1) {  
        var color = colors[i]; //get the same color as used in the respective bar segment
        canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 1)';
        canvasCxt.fillText(dataTitles[i], leftAdjust, canvasBottom - 4); //write the dataTitle
        leftAdjust -= canvasCxt.measureText(dataTitles[i]).width + 8; //adjust for the dataTitle text width
        canvasCxt.strokeStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.95)';
        canvasCxt.fillStyle = 'rgba(' + color["R"] + ', ' + color["G"] + ', ' + color["B"] + ', 0.65)';
        canvasCxt.fillRect(leftAdjust, canvasBottom - 2, -(fontSize + 2), -(fontSize + 2)); // fill the rectangle
        canvasCxt.strokeRect(leftAdjust, canvasBottom - 1, -(fontSize + 2), -(fontSize + 2)); //draw the rectangle
        leftAdjust -= (fontSize + 30);//space between key items
      }
      canvasCxt.closePath();
   
    }); // end return

  }; //end plugin function


})( jQuery);
