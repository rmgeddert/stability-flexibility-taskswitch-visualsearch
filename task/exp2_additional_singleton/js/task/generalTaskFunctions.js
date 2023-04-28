function fixationScreen(){
  prepareCanvas("85px Arial", "black", true);
  ctx.fillText("+",canvas.width/2,canvas.height/2);
  setTimeout(stimScreen, fixInterval);
}

function stimScreen(){
  stimOnset = new Date().getTime() - runStart;
  prepareCanvas("45px Arial", "black", true)

  // prepare for response
  keyListener = 1; acc = NaN, respTime = NaN, partResp = NaN, respOnset = NaN;

  // draw stimuli for this trial
  stimFunc()

  //proceed to iti after delay
  stimTimeout = setTimeout(itiScreen, stimInterval);
}

function itiScreen(){
  if (keyListener == 1) { // participant didn't respond
    keyListener = 0;
  } else if (keyListener == 2) { //participant still holding down response key
    keyListener = 3;
  }

  // log data
  if (sectionType == "practiceTask") {
    logPracticeTask();
  } else {
    logAdditionalSingletonTask();
  }

  // display feedback
  prepareCanvas("60px Arial", "black", true);
  ctx.fillText(accFeedback(),canvas.width/2,canvas.height/2);

  // trial finished. iterate and proceed to next
  trialCount++; blockTrialCount++;
  setTimeout(taskFunc, itiInterval(itiMin, itiMax, itiStep));
}

function practiceTrialFunc(){
  // (re)set sectionType (might have been changed to block break)
  sectionType = "practiceTask";

  // if task is over, proceed back to next instruction
  if (trialCount > nPracticeTrials) {
    if (decimalToPercent(accCount / nPracticeTrials) >= practiceAccCutoff) {
      navigateInstructionPath();
    } else {
      practiceAccuracyFeedback(decimalToPercent(accCount / nPracticeTrials));
    }
    return;
  }

  // person is still holding down key from previous trial, tell them to let go
  if (keyListener == 3){
    promptLetGo();
    return;
  }

  // if they minimized the screen, tell them its too small.
  if (!screenSizeIsOk()){
    promptScreenSize();
    return;
  }

  // none of the above happened, proceed to trial
  breakOn = false;
  fixationScreen();
}

function drawShape(shape, coords){
  if (shape == 'c'){
    drawCircle(...coords);
  } else if (shape == 's'){
    drawSquare(...coords);
  } else if (shape == 'h') {
    drawHexagon(...coords);
  }
}

function drawSquare(x, y, radius){
  // width = average width of circumscribed circle/square and vice versa
  let width = ((2 * radius / Math.sqrt(2)) + radius * 2) / 2
  ctx.beginPath();
  ctx.rect(x - width/2, y - width/2, width,  width)
  ctx.closePath();
  ctx.stroke();
}

function drawHexagon(x, y, radius){
  // includes +10%radius adjustment
  let a = 2 * Math.PI / 6;
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(x + (radius * 1.1) * Math.cos(a * i), y + (radius * 1.1) * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.stroke();
}

function drawCircle(x, y, radius){
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

function defaultStyle(){
  prepareCanvas("45px Arial", "black", false)
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 2
}

function drawLine(x, y, radius, line_proportion, line_direction){
  // how much to adjust x1, y1 and x2, y2
  let x1_adj, y1_adj, x2_adj, y2_adj;
  if (line_direction == "r") { //right facing line
    x1_adj = -(line_proportion / Math.sqrt(2)) * radius
    y1_adj = (line_proportion / Math.sqrt(2)) * radius
    x2_adj = (line_proportion / Math.sqrt(2)) * radius
    y2_adj = -(line_proportion / Math.sqrt(2)) * radius
  } else { // left facing line
    x1_adj = -(line_proportion / Math.sqrt(2)) * radius
    y1_adj = -(line_proportion / Math.sqrt(2)) * radius
    x2_adj = (line_proportion / Math.sqrt(2)) * radius
    y2_adj = (line_proportion / Math.sqrt(2)) * radius
  }

  // draw the line
  ctx.beginPath()
  ctx.moveTo(x + x1_adj, y + y1_adj)
  ctx.lineTo(x + x2_adj, y + y2_adj)
  ctx.stroke()
}

function accFeedback(){
  if (acc == 1){
    return "Correct";
  } else if (acc == 0) {
    return "Incorrect";
  } else {
    return "Too Slow";
  }
}

function accFeedbackColor(){
  if (acc == 1){
    return "green";
  } else if (acc == 0) {
    return "red";
  } else {
    return "black";
  }
}

function itiInterval(min, max, jitter){
  // creates random ITI interval in range from min to max (inclusive) with step size jitter
  let itiMin = (speed == "fast") ? 20 : min; //1200
  let itiMax = (speed == "fast") ? 20 : max; //1400
  let itiStep = jitter; //step size
  // random number between itiMin and Max by step size
  return itiMin + (Math.floor( Math.random() * ( Math.floor( (itiMax - itiMin) / itiStep ) + 1 ) ) * itiStep);
}

function countDown(seconds){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "bold 80px Arial";
  if (seconds > 0){
    ctx.fillText(seconds,canvas.width/2,canvas.height/2)
    setTimeout(function(){countDown(seconds - 1)},1000);
  } else {
    taskFunc();
  }
}

function bigBlockScreen(){
  // block break with countdown so they don't pause too long
  let minutesBreak = 3;
  sectionType = "blockBreak";
  sectionStart = new Date().getTime() - runStart;
  keyListener = 0;
  setTimeout(function(){keyListener = 7},1000);

  // display break screen (With timer)
  drawBreakScreen("0" + minutesBreak,"00", minutesBreak);
  blockBreakFunction(minutesBreak,0,minutesBreak);

  function blockBreakFunction(minutes, seconds, max){
    let time = minutes*60 + seconds;
    ctx.fillStyle = "black";
    sectionTimer = setInterval(function(){
      if (time < 0) {return}
      ctx.fillStyle = (time <= 60) ? "red" : "black";
      let minutes = Math.floor(time / 60);
      if (minutes < 10) minutes = "0" + minutes;
      let seconds = Math.floor(time % 60);
      if (seconds < 10) seconds = "0" + seconds;
      drawBreakScreen(minutes, seconds, max);
      time--;
    }, 1000);
  }
}

function drawBreakScreen(minutes, seconds, max){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw timer (with color from previous function)
  ctx.font = "bold 45px Arial";
  ctx.fillText(minutes + ":" + seconds,canvas.width/2,canvas.height/2 - 100);

  // display miniblock text
  ctx.fillStyle = "black";
  ctx.font = "25px Arial";
  ctx.fillText("This is a short break. Please don't pause for more than " + max + " minutes.",canvas.width/2,canvas.height/2 - 150);
  if (nBlocks - block > 1) {
    ctx.fillText("You are finished with block " + block + ". You have " + (nBlocks - block) + " blocks left.",canvas.width/2,canvas.height/2);
  } else {
    ctx.fillText("You are finished with block " + block + ". You have " + (nBlocks - block) + " block left.",canvas.width/2,canvas.height/2);
  }
  ctx.fillText("Your overall accuracy so far is " + Math.round((accCount/trialCount)*100) + "%.",canvas.width/2,canvas.height/2+50);
  ctx.font = "bold 25px Arial";
  ctx.fillText("Press any button to continue.",canvas.width/2,canvas.height/2 + 200);
}

function practiceAccuracyFeedback(accuracy){
  sectionStart = new Date().getTime() - runStart;
  sectionType = "pracFeedback";

  // prepare canvas
  prepareCanvas("30px Arial", "black", true)
  keyListener = 5;
  repeatNecessary = true;

  // display feedback text
  ctx.fillText("You got " + accuracy + "% correct in this practice block.",canvas.width/2,canvas.height/2 - 50);
  ctx.fillText("Remember, you need to get >" + practiceAccCutoff + "%.",canvas.width/2,canvas.height/2);
  ctx.fillText("Press any button to go back ",canvas.width/2,canvas.height/2 + 80);
  ctx.fillText("to the instructions and try again.",canvas.width/2,canvas.height/2 + 110);
}

function getAccuracy(accValue){
  //normalizes accuracy values into 0 or 1 (NaN becomes 0)
  return accValue == 1 ? 1 : 0;
}

function promptLetGo(){
  //prepare canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";

  // show warning
  ctx.fillText("Please release key",canvas.width/2,canvas.height/2);
  ctx.fillText("immediately after responding.",canvas.width/2,canvas.height/2 + 30);

  // key listener
  keyListener = 4;
}

function screenSizeIsOk(){
  // attempts to check window width and height, using first base JS then jquery.
  // if both fail, returns TRUE
  let w, h, minWidth = 800, midHeight = 600;
  try {
    // base javascript
    w = window.innerWidth;
    h = window.innerHeight;
    if (w == null | h == null) {throw "window.innerWidth/innerHeight failed.";}
  } catch (err) {
    try{
      // jquery
      w = $(window).width();
      h = $(window).height();
      if (w == null | h == null) {throw "$(window).width/height failed.";}
    } catch (err2) {
      // failure mode, returns true if both screen checks failed
      return true;
    }
  }
  // return dimension check if values are defined
  return w >= minWidth && h >= midHeight;
};

let screenSizePromptCount = 0;
let nScreenSizeWarnings = 2;
function promptScreenSize(){
  // set key press experiment type
  keyListener = 4;

  // prepare canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "25px Arial";

  // allows up to two warnings before terminating experiment
  if (screenSizePromptCount < nScreenSizeWarnings) {
    screenSizePromptCount++;

    // display screen size prompt
    ctx.font = "25px Arial";
    ctx.fillText("Your screen is not full screen or the",canvas.width/2,canvas.height/2);
    ctx.fillText("screen size on your device is too small.",canvas.width/2,(canvas.height/2) + 40);
    ctx.fillText("If this issue persists, you will need",canvas.width/2,(canvas.height/2)+160);
    ctx.fillText("to restart the experiment and will ",canvas.width/2,(canvas.height/2)+200);
    ctx.fillText("not be paid for your previous time.",canvas.width/2,(canvas.height/2)+240);
    ctx.font = "bold 25px Arial";
    ctx.fillText("Please correct this and press any button to continue.",canvas.width/2,(canvas.height/2)+100);

  } else {

    // display screen size prompt
    ctx.fillText("Your screen is not full screen",canvas.width/2,canvas.height/2);
    ctx.fillText("or the screen size on your device is too small.",canvas.width/2,(canvas.height/2)+50);
    ctx.font = "bold 25px Arial";
    ctx.fillText("Please refresh the page to restart the experiment.",canvas.width/2,(canvas.height/2)+100);

  }
}
