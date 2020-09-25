class Detector {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.powerOfSound = 0;
  }

  draw() {
    var circle = new Path2D();

    circle.arc(this.positionX, this.positionY, detectorRadiusSize, 0, 2 * Math.PI);
    var percent = 0;
    // var thePowerOfSound = treshold - this.distance ?? 0;
    if (this.powerOfSound < treshold) {
      percent = Math.floor(255 * (this.powerOfSound / treshold));
      ctx.fillStyle = `rgb(${percent}, 0, 0)`;
    } else {
      ctx.fillStyle = `rgb(0, 0, 0)`;
    }
    ctx.fill(circle);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(this.powerOfSound, this.positionX + detectorRadiusSize, this.positionY,);
  
    var waveCircle = new Path2D();
    var hearRadius = this.powerOfSound > 0 ? treshold - this.powerOfSound : 0;
    waveCircle.arc(this.positionX, this.positionY, hearRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.stroke(waveCircle);
  }

  addPowerOfSound(value) {
    this.powerOfSound = value;
  }
}
class Noize {
  constructor(positionX, positionY, single) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.single = single;
    this.distance = 0;
    this.speed = 330;
  }

  draw() {
    var circle = new Path2D();
    circle.arc(this.positionX, this.positionY, detectorRadiusSize, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(0, 200, 100)";
    ctx.fill(circle);
  }

  drawWave() {
    if (this.distance < forrestHeight && this.distance < forrestWidth) {
      var waveCircle = new Path2D();
      this.distance += this.speed / frames;
      waveCircle.arc(this.positionX, this.positionY, this.distance, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgb(250, 250, 250)';
      ctx.stroke(waveCircle);

      detectors.forEach(el => {
        if (doesDetectorHear(el, this)) {
          var power = treshold - this.distance;
          power = power < 0 ? 0 : power;
          el.addPowerOfSound(power);
          if (soundWindow.length == soundWindowSize) {
            soundWindow.shift();
          }
          soundWindow.push(power);
        }
      })
    }
  }
}

class PossibleNoize {
  constructor(positionX, positionY, single) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.single = single;
    this.distance = 0;
    this.speed = 330;
  }

  draw() {
    var circle = new Path2D();
    circle.arc(this.positionX, this.positionY, detectorRadiusSize, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(0, 200, 200)";
    ctx.fill(circle);
  }
}
var frames = 60;
var detectorsStep = 50;
var forrestHeight = 800;
var forrestWidth = 800;
var detectorRadiusSize = 10;
var treshold = 200;
var noizes = [];
var detectors = [];
var soundWindow = [];
const soundWindowSize = 50; 
const soundWindowHeight = 50; 
const soundItemWidth = 2; 

function detectNoize() {
  for (var i = 0; i < soundWindow.length; i++) {
    drawBars(i, soundWindow[i]);
  }
}

function drawBars(index, value) {
  var bar = new Path2D();
  var heightInPercent = soundWindowHeight * value / treshold;
  bar.rect(index * soundItemWidth, 0, soundItemWidth, heightInPercent);
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fill(bar);
}

function handleTreshold() {
  var field = document.querySelector('.treshold');
  treshold = parseInt(field.value);
  field.addEventListener('change', function(e){
    console.log(e.target.value);
    treshold = parseInt(e.target.value);
  });
}

var canvas, ctx;
function initCanvas() {
  canvas = document.getElementById('forrest');
  if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    // drawing code here
  } else {
    // canvas-unsupported code here
  }
}

function drawDetectors() {
  detectors.forEach(el => {
    el.draw();
  });
}
function drawForrest() {
  var forrest = new Path2D();
  forrest.rect(0, 0, forrestWidth, forrestHeight);
  ctx.fillStyle = 'rgb(55, 175, 65)';
  ctx.fill(forrest);
}

function getDistanceFromNoize(detector) {
  if (noize != null && noize != undefined) {
    var result = Math.sqrt(Math.pow((detector.positionX - noize.positionX), 2) +
      Math.pow((detector.positionY - noize.positionY), 2));
    return Math.floor(result);
  }
  else return forrestHeight;
}

function doesDetectorHear(detector, noize) {
  // x^2 + y^2 = r^2;
  var distanceBetweenNoizeAndDetector = Math.sqrt(Math.pow((detector.positionX - noize.positionX), 2) +
    Math.pow((detector.positionY - noize.positionY), 2));
  return (noize.distance >= distanceBetweenNoizeAndDetector - detectorRadiusSize)
    && (noize.distance <= distanceBetweenNoizeAndDetector + detectorRadiusSize)
  // return Math.floor(result);
}


function drawNoize() {
  noizes.forEach(el => {
    el.draw();
    el.drawWave();
  });
}
var raf
function render() {
  ctx.clearRect(0, 0, forrestWidth, forrestHeight);
  drawForrest();
  drawNoize();
  drawDetectors();
  detectNoize();
  raf = window.requestAnimationFrame(render);
}

function addNoizeWave(){

}
function handleAddNoize(e) {
  var noize = new Noize(e.offsetX, e.offsetY);
  noizes = [noize];
}
function handleAddDetector(e) {
  var detector = new Detector(e.offsetX, e.offsetY);
  detectors.push(detector);
}
function handleCLick() {
  canvas.addEventListener('click', function (e) {
    var radios = document.getElementsByName('clickType');
    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        switch (radios[i].value) {
          case '1':
            handleAddDetector(e);
            break;
          case '2':
            handleAddNoize(e);
            break;
        }
        break;
      }
    }
  });
}

function initReset() {
  var reset = document.querySelector('#reset');
  reset.addEventListener('click', function(){
    detectors = [];
    noizes = [];
  });
}


function start() {
  initCanvas();
  render();
  handleCLick();
  initReset();
  handleTreshold();
}

start();