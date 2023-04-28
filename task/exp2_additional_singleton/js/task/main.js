"use strict"

// QOL parameters
let expStage = "prac1-1"; //first expStage, see instructions.js
let speed = "normal"; //speed of experiment: fast or normal

// ----- Global Variables  ----- //
let stimInterval = (speed == "fast") ? 10 : 2500;
let fixInterval = (speed == "fast") ? 10 : 500;
let itiMin = (speed == "fast") ? 10 : 1200;
let itiMax = (speed == "fast") ? 10 : 1400;
let itiStep = 50;
let nBlocks = 4;
let trialsPerBlock = 160; // (multiples of 16)
let nLocations = 6; //number of locations in distractor circle
let nSequenceTypes = 4;
let nSequenceReps = 4;
let sequenceLength = 4;
let nSequenceTrials = nSequenceTypes * nSequenceReps * sequenceLength;
let nSequenceFlips = Math.ceil((nSequenceTypes * nSequenceReps) / 2);
let nSequenceNotFlips = (nSequenceTypes * nSequenceReps) - nSequenceFlips;
let nFillers = trialsPerBlock - nSequenceTrials - nSequenceFlips - nSequenceNotFlips;
let minFillerLength = 3;
let maxFillerLength = 5;
// shapes ([C]ircle, [S]quare, [D]iamond, [H]exagon)
let shape1 = "h"
let shape2 = "s"
let circle_rad = 75
let line_proportion = 0.8
// dict to switch shapes, useful to have
let shapeSwitcher = {}
shapeSwitcher[shape1] = shape2;
shapeSwitcher[shape2] = shape1;
// global variables for data logging for attentional singleton task
let distractorLineDirection, targetShape, nonTargetShape;

let taskSequences = {
  1: [['s', 'd', 's', 1, 1], ['r', 'n', 's', 1, 2], ['s', 'd', 's', 1, 3], ['r', 'n', 's', 1, 4]],
  2: [['r', 'n', 's', 2, 1], ['r', 'n', 's', 2, 2], ['s', 'd', 's', 2, 3], ['s', 'd', 's', 2, 4]],
  3: [['r', 'd', 's', 3, 1], ['s', 'n', 's', 3, 2], ['r', 'd', 's', 3, 3], ['s', 'n', 's', 3, 4]],
  4: [['s', 'n', 's', 4, 1], ['s', 'n', 's', 4, 2], ['r', 'd', 's', 4, 3], ['r', 'd', 's', 4, 4]]
}

let blockTypeFillers = {
  'A': ['r', 'd', 'f', NaN, NaN],
  'B': ['s', 'd', 'f', NaN, NaN],
  'C': ['r', 'n', 'f', NaN, NaN],
  'D': ['s', 'n', 'f', NaN, NaN]
}

let flipBlockType = {
  'A': 'D',
  'B': 'C',
  'C': 'B',
  'D': 'A'
}

// for practice task
let nPracticeTrials = 16;
let practiceAccCutoff = 80; // 85 acc% = 7/8

// trial level information (default to lowest value)
let trialCount = 1, blockTrialCount = 1, block = 1, accCount = 0;

//global task arrays
let targetShapeArr = [], distractionArr = [], taskSequenceArr = [], targetLocationArr = [], distractorLocationArr = [], lineDirectionArr = [];
let sequenceTypeArr, sequenceKindArr, sequencePositionArr;

//other global vars
let canvas, ctx; // global canvas variable
let taskFunc, transitionFunc, stimFunc, taskName;
let acc, stimOnset, respOnset, respTime, partResp, runStart;
let stimTimeout, breakOn = false, repeatNecessary = false, data=[];
let sectionStart, sectionEnd, sectionType, sectionTimer;
let keyListener = 0; // see below

let blockOrder = getBlockOrder(randIntFromInterval(1,4));
// see counterbalancing.js for block order stuff

let taskMapping = randIntFromInterval(1,2);
// console.log("taskMapping", taskMapping);
  // case 1: target shape 1: hexagon, target shape 2: square
  // case 1: target shape 1: square, target shape 2: hexagon

function experimentFlow(){
  trialCount = 1;
  blockTrialCount = 1;
  if (!repeatNecessary) {
    block = 1;
  } else {
    block++;
  }
  accCount = 0;
  repeatNecessary = false;

  if (expStage.indexOf("prac1") != -1){
    lineDirectionPracticeTask();
  } else if (expStage.indexOf("prac2") != -1){
    fullGridPracticeTask();
  } else if (expStage.indexOf("prac3") != -1){
    attentionalSingletonPracticeTask();
  } else if (expStage.indexOf("main1") != -1){
    attentionalSingletonTask();
  } else if (expStage.indexOf("final") != -1) {
    endOfExperiment();
  }
}

function startExperiment(){
  prepareTaskCanvas();

  // create key press listener
  $("body").keypress(
    function(event){keyPressListener(event)}
  );

  // create key release listener
  $("body").keyup(
    function(event){keyReleaseListener(event)}
  );

  // start experiment
  runStart = new Date().getTime();
  runInstructions();
}

function endOfExperiment(){
  // hide stuff, show cursor
  hideInstructions();
  hideCanvas();
  showCursor();

  // upload data to menu.html's DOM element
  $("#RTs").val(data.join(";"));

  // show debriefing script from experimentWrapper.js
  updateMainMenu(nextForm());
}

function keyPressListener(event){
  // unnecessary key press
  if (keyListener == 0) {
    keyListener = 3;
    return
  }

  //key press during task when expected
  if (keyListener == 1) {
    keyListener = 2;
    partResp = event.which;
    respOnset = new Date().getTime() - runStart;
    getAccuracyAndRT(partResp);
  }
}

function getAccuracyAndRT(partResp){
  // determine reaction time
  respTime = respOnset - stimOnset;

  // determine accuracy
  if (lineDirectionArr[trialCount - 1] == "l") {
    acc = ([90, 122].indexOf(event.which) != -1) ? 1 : 0;
  } else {
    acc = ([77, 109].indexOf(event.which) != -1) ? 1 : 0;
  }

  // update acc count
  if (acc == 1){accCount++;}
}

function keyReleaseListener(event){
  // expected key press during task
  if (keyListener == 2){
    keyListener = 0;
    clearTimeout(stimTimeout);
    transitionFunc();
    return;
  }

  // key press that was held too long
  if (keyListener == 3) {
    keyListener = 0;
    return;
  }

  // returning to task after holding down key too long or getting a screen size warning
  if (keyListener == 4) {
    keyListener = 0;
    countDown(3);
  }

  // after practice task feedback
  if (keyListener == 5) {
    keyListener = 0;
    sectionEnd = new Date().getTime() - runStart;
    logSectionData();
    navigateInstructionPath(repeatNecessary);
  }

  // block break
  if (keyListener == 7) {
    clearInterval(sectionTimer);
    sectionEnd = new Date().getTime() - runStart;
    logSectionData();
    keyListener = 0;

    // increment block information before beginning next block
    block++;
    blockType = blockOrder[block - 1];
    blockTrialCount = 1;
    countDown(3);
  }

  if (keyListener == 8) { // press button to start task
    keyListener = 0;
    sectionEnd = new Date().getTime() - runStart;
    logSectionData();
    experimentFlow();
    return
  }

  // if (keyListener == 9) { // 9: "press button to start next section"
  //   // log how much time was spent in this section
  //   sectionEnd = new Date().getTime() - runStart;
  //   logSectionData()
  //   // reset keyListener and proceed to next section
  //   keyListener = 0;
  //   navigateInstructionPath(repeatNecessary);
  // } else if (keyListener == 11) { // repeat instructions
  //   // log how much time was spent in this section
  //   sectionEnd = new Date().getTime() - runStart;
  //   logSectionData()
  //   // iterate block and go back to instructions
  //   keyListener = 0;
  //   if (repeatNecessary) {
  //     block++;
  //   } else {
  //     block = 1;
  //   }
  //   navigateInstructionPath(repeatNecessary);
  // }
}
