function fullGridPracticeTask(){
  // set taskName for data logging
  taskName = "fullGridPracticeTask";
  nPracticeTrials = 8;

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
  // borrowing from lineDirectionPracticeTask here
  buildLineDirectionPracticeTaskArray();

  // start task after countdown (calls taskFunc)
  countDown(3);
}
