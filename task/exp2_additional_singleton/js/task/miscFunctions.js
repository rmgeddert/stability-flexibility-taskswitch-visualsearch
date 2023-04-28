function randIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Fisher-Yates shuffle
function shuffle(array){
  for(let j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
  return array;
}

function isEven(n) {return n % 2 == 0;}
// let isEven = (n) => n % 2 == 0;

function getRandomInt(max){
  return Math.floor(Math.random() * Math.floor(max));
}

function showCanvas(){
  canvas.style.display = "inline-block";
  $(".canvasas").show();
}

function hideCanvas(){
  $(".canvasas").hide();
}

function hideCursor(){
    document.body.style.cursor = 'none';
}

function prepareTaskCanvas(){
  canvas = document.getElementById('taskCanvas');
  ctx = canvas.getContext('2d');
  ctx.font = "bold 60px Arial";
  ctx.textBaseline= "middle";
  ctx.textAlign="center";
}

function showCursor(){
  document.body.style.cursor = 'auto';
}

function changeScreenBackgroundTo(color){
  window.document.body.style.backgroundColor = color;
}

function prepareCanvas(font, fillStyle, clear = True){
  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  ctx.font = font;
  ctx.fillStyle = fillStyle;
}

// checks if array with two things has equal numbers of them
function equalCounts(arr){
  map = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
  return [...map.values()][0] == [...map.values()][1];
}

function decimalToPercent(decimal){
  return Math.round(decimal * 100 * 100) / 100;
}
