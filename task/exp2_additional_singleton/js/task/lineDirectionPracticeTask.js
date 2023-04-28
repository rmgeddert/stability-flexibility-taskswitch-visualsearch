function lineDirectionPracticeTask(){

  // set taskName for data logging
  taskName = "lineDirectionPracticeTask";
  nPracticeTrials = 8;

  // prepare for task
  hideInstructions();
  showCanvas();
  hideCursor();
  changeScreenBackgroundTo("lightgrey");

  // global variables for functions
  taskFunc = practiceTrialFunc;
  transitionFunc = itiScreen;
  stimFunc = drawShapeAndLine;

  //create task arrays
  buildLineDirectionPracticeTaskArray();

  // start task after countdown (calls taskFunc)
  countDown(3);
}

function drawShapeAndLine(){
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
  nonTargetShape = NaN;
  distractorLineDirection = NaN;
  let coords = positions[targetLocationArr[trialCount - 1]];

  // draw the shape and arrow
  defaultStyle();
  drawShape(targetShape, coords);
  drawLine(...coords, line_proportion, lineDirectionArr[trialCount - 1])
}

function buildLineDirectionPracticeTaskArray(){
  // create sequence of switches and repeats (half of each)
  let nSwitchTrials = Math.floor(nPracticeTrials/2);
  let nRepeatTrials = nPracticeTrials - nSwitchTrials;
  switchRepeatArr = shuffle(new Array(nSwitchTrials).fill('s').concat(new Array(nRepeatTrials).fill('r')));
  switchRepeatArr[0] = 'n' //first trial isn't switch or repeat

  // get shape of target on each trial
  targetShapeArr = [];
  switchRepeatArr.forEach((taskSequence, index, array) => {
    switch(taskSequence){
      case "n":
        targetShapeArr.push(Math.random() > 0.5 ? shape1 : shape2);
        break
      case "r":
        targetShapeArr.push(targetShapeArr[index - 1]);
        break
      case "s":
        targetShapeArr.push(shapeSwitcher[targetShapeArr[index - 1]]);
        break
    }
  });

  // get location of each target
  targetLocationArr = buildTargetLocationArr(nPracticeTrials);

  // get arrow direction at that location
  lineDirectionArr = buildLineDirectionArray(nPracticeTrials);

  // get distraction array (no distractions)
  distractionArr = new Array(nPracticeTrials).fill("n");
}
