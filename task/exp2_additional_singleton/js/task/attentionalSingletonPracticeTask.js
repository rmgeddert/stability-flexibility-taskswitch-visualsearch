function attentionalSingletonPracticeTask(){
  // set taskName for data logging
  taskName = "attentionalSingletonPracticeTask";
  nPracticeTrials = 16;

  // prepare for task
  hideInstructions();
  showCanvas();
  hideCursor();
  changeScreenBackgroundTo("lightgrey");

  // global variables for functions
  taskFunc = practiceTrialFunc;
  transitionFunc = itiScreen;
  stimFunc = drawStimGrid;

  //create task arrays
  buildAttentionalSingletonPracticeTaskArray();

  // start task after countdown (calls taskFunc)
  countDown(3);
}

function buildAttentionalSingletonPracticeTaskArray() {
  // copies standard practice task creation
  buildLineDirectionPracticeTaskArray();

  // except then modifies distraction array so there are distractors
  // create sequence of switches and repeats (half of each)
  let nDistractors = Math.floor(nPracticeTrials * 0.75); // mostly distractor
  let nNoDistractors = nPracticeTrials - nDistractors;
  distractionArr = shuffle(new Array(nDistractors).fill('d').concat(new Array(nNoDistractors).fill('n')));

  // and figure out where each distractor will show up
  distractorLocationArr = buildDistractorLocationArr(targetLocationArr);
}
