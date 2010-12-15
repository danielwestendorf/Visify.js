//Copyright (c) 2010 Daniel Westendorf

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

function ByteMe(size) {
  //Initialize at the bottom of the class so it is called when all the methods are available
   
  this.ToKB = function() {
    return this.byteForm / 1024.0;
  };

  this.ToMB = function() {
    return this.byteForm / Math.pow(1024.0, 2);
  };

  this.ToGB = function() {
    return this.byteForm / Math.pow(1024.0, 3);
  };

  this.ToTB = function() {
    return this.byteForm / Math.pow(1024.0, 4);
  };

  this.ToPB = function() {
    return this.byteForm / Math.pow(1024.0, 5);
  };

  this.ToXB = function() {
    return this.byteForm / Math.pow(1024.0, 6);
  };

  this.Nearest = function() {
    switch (true) {
      case (this.byteForm > 0.0 && this.byteForm < 1024.0): this.nearestUnitSize = this.byteForm; this.nearestUnit = "B"; break;
      case (this.byteForm > 1024.0 && this.byteForm < (Math.pow(1024.0, 2) - 1)): this.nearestUnitSize = this.ToKB(); this.nearestUnit = "KB"; break;
      case (this.byteForm > (Math.pow(1024.0, 2)) && this.byteForm < (Math.pow(1024.0, 3) - 1)): this.nearestUnitSize = this.ToMB(); this.nearestUnit = "MB"; break;
      case (this.byteForm > (Math.pow(1024.0, 3)) && this.byteForm < (Math.pow(1024.0, 4) - 1)): this.nearestUnitSize = this.ToGB(); this.nearestUnit = "GB"; break;
      case (this.byteForm > (Math.pow(1024.0, 4)) && this.byteForm < (Math.pow(1024.0, 5) - 1)): this.nearestUnitSize = this.ToTB(); this.nearestUnit = "TB"; break;
      case (this.byteForm > (Math.pow(1024.0, 5)) && this.byteForm < (Math.pow(1024.0, 6) - 1)): this.nearestUnitSize = this.ToPB(); this.nearestUnit = "PB"; break;
      default : this.nearestUnitSize = this.ToXB(); this.nearestUnit = "XB"; break;
    };
  };

  this.Round = function() {
    return Math.round(this.nearestUnitSize * 100) / 100;
  };

  this.ConvertTo = function(target) {
    switch(target) {
      case "B" : return this.byteForm; break;
      case "KB" : return this.ToKB(); break;
      case "MB" : return this.ToMB(); break;
      case "GB" : return this.ToGB(); break;
      case "TB" : return this.ToTB(); break;
      case "PB" : return this.ToPB(); break;
      default : return this.ToXB(); break;
    };
  };

  //initialize
  this.byteForm = parseFloat(size);  
  this.Nearest();

};
