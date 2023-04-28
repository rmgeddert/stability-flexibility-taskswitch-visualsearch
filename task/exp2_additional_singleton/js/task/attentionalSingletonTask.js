function attentionalSingletonTask(){

  // set taskName for data logging
  taskName = "additionalSingletonTask";
  blockType = blockOrder[block - 1];

  // prepare for task
  hideInstructions();
  showCanvas();
  hideCursor();
  changeScreenBackgroundTo("lightgrey");

  // global variables for functions
  taskFunc = attentionalSingletonTrial;
  transitionFunc = itiScreen;
  stimFunc = drawStimGrid;

  //create task arrays
  buildTaskArray();

  // start task after countdown (calls taskFunc)
  countDown(3);
}

function attentionalSingletonTrial(){

    // (re)set sectionType (might have been changed to block break)
    sectionType = "mainTask";

    // if task is over, proceed back to next instruction (or end of experiment)
    if (trialCount > nBlocks * trialsPerBlock) {
      navigateInstructionPath();
      return;
    }

    // if block break, go to block break
    if ((trialCount - 1) % trialsPerBlock == 0 && !breakOn && (trialCount - 1) != 0) {
      breakOn = true;
      bigBlockScreen();
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

function drawStimGrid(){
  let horz_offset = 180
  let vert_offset = 210

  let positions = {
    1: [canvas.width/2, canvas.height/2 - vert_offset, circle_rad],
    2: [canvas.width/2 - horz_offset, canvas.height/2 - vert_offset/2, circle_rad],
    3: [canvas.width/2 + horz_offset, canvas.height/2 - vert_offset/2, circle_rad],
    4: [canvas.width/2 - horz_offset, canvas.height/2 + vert_offset/2, circle_rad],
    5: [canvas.width/2 + horz_offset, canvas.height/2 + vert_offset/2, circle_rad],
    6: [canvas.width/2, canvas.height/2 + vert_offset, circle_rad]
  }

  targetShape = targetShapeArr[trialCount - 1];
  nonTargetShape = shapeSwitcher[targetShape];

  for (let [loc, coords] of Object.entries(positions)) {

    // if target, draw target and continue
    if (loc == targetLocationArr[trialCount - 1]) {
      defaultStyle();
      drawShape(targetShape, coords);
      drawLine(...coords, line_proportion, lineDirectionArr[trialCount - 1])
      continue;
    }

    // if distractor, draw but red
    if (distractionArr[trialCount - 1] == "d") {
      if (loc == distractorLocationArr[trialCount - 1]) {
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 4
        drawShape(nonTargetShape, coords);
        defaultStyle();
        distractorLineDirection = Math.random() > 0.5 ? "l" : "r";
        drawLine(...coords, line_proportion, distractorLineDirection);
        continue;
      }
    }

    // if neither (or no distractor trial), draw non target shape
    defaultStyle()
    drawShape(nonTargetShape, coords);
    drawLine(...coords, line_proportion, Math.random() > 0.5 ? "l" : "r")
  }
}

function buildTaskArray(){
  //create order of inserted sequences (nSequenceTypes * nSequenceReps many)
  let sequenceOrderArr = shuffle(new Array(nSequenceReps).fill(_.range(1, nSequenceTypes + 1)).flat());

  // for each block in block order, create a block of trials based on above sequence order (sequence order is the same for each block).
  // repeat making block array until it has exactly 50% of each target stimulus
  let taskArray = [];
  let targetShapes = []
  blockOrder.forEach(blockLetter => {
    let blockArr, blockTaskArr;
    do {
      blockArr = buildBlockArr(sequenceOrderArr, blockLetter);
      blockTargetArr = getTargetArr(blockArr);
    } while (!equalCounts(blockTargetArr));
    taskArray = taskArray.concat(blockArr);
    targetShapes = targetShapes.concat(blockTargetArr);
  });

  // split final task array into its constituent parts (just for ease of use later)
  switchRepeatArr = taskArray.map(arr => arr[0]);
  distractionArr = taskArray.map(arr => arr[1]);
  sequenceTypeArr = taskArray.map(arr => arr[2]);
  sequenceKindArr = taskArray.map(arr => arr[3]);
  sequencePositionArr = taskArray.map(arr => arr[4]);
  targetShapeArr = targetShapes;

  // figure out at which of 6 locations the target will appear on each trial, do it in block batches so each block is closer to perfectly 50/50. Also figure out distractor in same step
  for (let i = 0; i < nBlocks; i++) {
    let locArr = buildTargetLocationArr(trialsPerBlock);
    targetLocationArr = targetLocationArr.concat(locArr);
    distractorLocationArr = distractorLocationArr.concat(buildDistractorLocationArr(locArr));
  }

  // figure out which line will appear for the target on each trial, do it in block batches so each block is closer to perfectly 50/50
  for (let i = 0; i < nBlocks; i++) {
    lineDirectionArr = lineDirectionArr.concat(buildLineDirectionArray(trialsPerBlock));
  }
}

function buildDistractorLocationArr(targetArr){
  return targetArr.map(n => _.sample(_.range(1,nLocations + 1).filter(m => m != n)));
}

function buildTargetLocationArr(nTrials){
  let locationArr = new Array(Math.floor(nTrials/nLocations)).fill(_.range(1,nLocations + 1)).flat();
  locationArr = locationArr.concat(_.range(1, (nTrials % nLocations)+1));
  return shuffle(locationArr);
}

function buildLineDirectionArray(nTrials){
  let lineArr = new Array(Math.floor(nTrials/2)).fill("l");
  lineArr = lineArr.concat(new Array(nTrials - lineArr.length).fill("r"));
  return shuffle(lineArr);
}

function buildBlockArr(seqOrder, blockType){
  // get filler order of n sequences + 1
  let nFillerBlocks = nSequenceTypes * nSequenceReps + 1;

  // figure out how long each filler block is (stretch of fillers between sequences)
  let fillers = new Array(nFillerBlocks).fill(minFillerLength);
  let remainingFillers = nFillers - (fillers.length * minFillerLength)
  while (remainingFillers > 0) {
    let randIdx = Math.floor(Math.random() * fillers.length)
    if (fillers[randIdx] == maxFillerLength) {
      continue;
    } else {
      fillers[randIdx] = fillers[randIdx] + 1;
      remainingFillers--;
    }
  }

  // get sequence flips
  let sequenceFlips = shuffle(new Array(nSequenceFlips).fill('f').concat(new Array(nSequenceNotFlips).fill('n')));

  //build final task array of sequences and fillers
  let blockArr = [];
  // for each filler block
  for (let i = 0; i < nFillerBlocks; i++) {

    // first add all the filler trials
    for (let j = 0; j < fillers[i]; j++) {
      // add each filler trials for that block type
      if (i == 0 && j == 0) {
        blockArr = blockArr.concat([['n', blockTypeFillers[blockType][1], blockTypeFillers[blockType][2], NaN, NaN]])
      } else {
        blockArr = blockArr.concat([blockTypeFillers[blockType]])
      }
    }

    if (i == nFillerBlocks - 1) {
      break;
    }

    // next add the sequence (except last iteration)
    blockArr = blockArr.concat(taskSequences[seqOrder[i]]);

    // finally add the random 50/50 sequence flipper
    if (sequenceFlips[i] == 'n') {
      blockArr = blockArr.concat([blockTypeFillers[blockType]]);
    } else {
      blockArr = blockArr.concat([blockTypeFillers[flipBlockType[blockType]]]);
    }
  }

  return blockArr;
}

function getTargetArr(blockArr){
  let targetsArr = [];

  // fill targetsArr
  for (let i = 0; i < blockArr.length; i++) {
    // if first in block, randomly pick shape1 or 2
    if (i == 0) {
      targetsArr.push((Math.random() > 0.5) ? shape1 : shape2);
      continue;
    }

    // if repeat use same shape, if switch use shapeSwitcher
    if (blockArr[i][0] == "r") {
      targetsArr.push(targetsArr[i - 1]);
    } else {
      targetsArr.push(shapeSwitcher[targetsArr[i - 1]]);
    }
  }

  return targetsArr;
}
