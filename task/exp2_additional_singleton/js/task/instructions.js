// global instruction iterator information. Change as needed

let instructions = {
  // contains the interator for each instruction block, default 1
  iterator: {
    "prac1-1": 1, "prac1-2": 1, "prac2": 1, "prac3": 1, "main1": 1
  },
  // contains the max value of each instruction iteration. iteration will STOP at max and display exit response
  max: {
    "prac1-1": 4, "prac1-2": 6, "prac2": 5, "prac2": 7, "prac3": 7, "main1": 6
  },
  // what does instruction section end with?
  // #nextSectionButton, #startExpButton, keyPressNextSection, keyPressStartTask
  exitResponse: {
    "prac1-1": '#nextSectionButton',
    "prac1-2": 'keyPressStartTask',
    "prac2": 'keyPressStartTask',
    "prac3": 'keyPressStartTask',
    "main1": 'keyPressStartTask'
  }
}
let iterateAgain = false, task;

function navigateInstructionPath(repeat = false){
  // defines the path from one experiment stage to the next
  if (repeat == true) {
    // if multi stage instructions, ensures it goes back to first not second
    // switch (expStage){
    //   case "prac1-1":
    //   case "prac1-2":
    //     expStage = "prac1-1";
    //     break;
    // }
    runInstructions();
  } else {
    switch (expStage){
      case "prac1-1":
        expStage = "prac1-2";
        break;
      case "prac1-2":
        expStage = "prac2";
        break;
      case "prac2":
        expStage = "prac3";
        break;
      case "prac3":
        expStage = "main1";
        break;
      case "main1":
        expStage = "final";
        experimentFlow();
        return;
    }
    runInstructions();
  }
}

function displayDefaults(stage){
  // default values of instruction blocks. add any special cases
  // main functionalities are displaying the first line of instruction automatically with showFirst()
  // and showing or hiding the instruction header
  // these are both default unless specified otherwise
  switch(stage){
    case "final":
      showFirst();
      $('.instruction-header').hide();
      break;
    case "main1":
       // showFirst();
    default:
      showFirst();
      $('.instruction-header').show();
      break;
  }
}

// Put Instruction Text Here
function getInstructionText(slideNum, expStage){
/* use the following options when modifying text appearance
    -  iterateAgain = true;
    -  changeTextFormat('#instructions' + slideNum,'font-weight','bold');
    -  changeTextFormat('#instructions' + slideNum,'font-size','60px');
    -  changeTextFormat('#instructions' + slideNum,'color','red');
    -  changeTextFormat('#instructions' + slideNum,'margin-top', '20px');
    -  changeTextFormat('#instructions' + slideNum,'margin-bottom', '20px');
    - $("<img src='../pics/finalpics/M33.jpg' class='insertedImage'>").insertAfter( "#instructions" + slideNum);
*/
  switch (expStage){
    case "prac1-1":
      switch (slideNum){
        case 1:
          return "Welcome to the experiment, thank you for your participation!";
        case 2:
          return "In this experiment, you will perform a task where you must find the unique shape among a grid of shapes, and then indicate the direction of a line within that shape. You will begin with some practice tasks to familiarize you with the task. The experiment is expected to take approximately 30 to 40 minutes.";
        case 3:
          return "Please enlarge this window to its maximum size and sit a comfortable distance from your computer screen.";
        case 4:
          return "Please respond as quickly and as accurately as possible throughout the tasks.";
      }
    case "prac1-2":
      switch (slideNum){
        case 1:
          return "In this first practice task, you will indicate the direction of the tilt of the line within the shape.";
        case 2:
          $( getImageText(instructionImages[2])).insertBefore( "#instructions" + slideNum);
          return "Press the 'Z' key if the line is tilted to the left."
        case 3:
          $( getImageText(instructionImages[3])).insertBefore( "#instructions" + slideNum);
          return "Press the 'M' key if the line is tilted to the right."
        case 4:
          return "You will need to get a least " + practiceAccCutoff + "% correct on this task in order to move onto the next section, otherwise you will need to repeat the practice.";
        case 5:
            $( getImageText(instructionImages[1])).insertAfter( "#instructions" + slideNum);
            iterateAgain = true;
            return "This block contains 8 trials. Please place your hands on the 'Z' and 'M' keys as shown.";
        case 6:
          changeTextFormat('#instructions' + slideNum,'font-weight','bold');
          return "Press any button to start the task.";
      }
    case "prac2":
      switch (slideNum){
        case 1:
          return "Great job! In the second practice task, you will see 6 shapes. 5 of the shapes will be same (e.g., all squares), while one of the shapes will be different (e.g., a hexagon).";
        case 2:
          return "Use the 'Z' and 'M' keys to indicate the direction of the line <b>in the shape that is different than the other shapes.</b>"
        case 3:
          $( getImageText(instructionImages[2])).insertBefore( "#instructions" + slideNum);
          return "Press the 'Z' key if the line is tilted to the left."
        case 4:
          $( getImageText(instructionImages[3])).insertBefore( "#instructions" + slideNum);
          return "Press the 'M' key if the line is tilted to the right."
        case 5:
          return "You will need to get a least " + practiceAccCutoff + "% correct on this task in order to move onto the next section, otherwise you will need to repeat the practice.";
        case 6:
          $( getImageText(instructionImages[1])).insertAfter( "#instructions" + slideNum);
          iterateAgain = true;
          return "This block contains 8 trials. Please place your hands on the 'Z' and 'M' keys as shown.";
        case 7:
          changeTextFormat('#instructions' + slideNum,'font-weight','bold');
          return "Press any button to start the task.";
      }
    case "prac3":
      switch (slideNum){
        case 1:
          return "Great job! In the final practice task, you will again see 6 shapes. Just as before, use the 'Z' and 'M' keys to indicate the direction of the line <b>in the shape that is different than the other shapes.</b>";
        case 2:
          return "This time, however, one of the other shapes (not the one you are responding to) will be highlighted in red. Do not respond to this highlighted shape. Just respond identically as the last practice, based on the shape that is different than the rest."
        case 3:
          $( getImageText(instructionImages[2])).insertBefore( "#instructions" + slideNum);
          return "Remember, press the 'Z' key if the line is tilted to the left."
        case 4:
          $( getImageText(instructionImages[3])).insertBefore( "#instructions" + slideNum);
          return "Press the 'M' key if the line is tilted to the right."
        case 5:
          return "You will need to get a least " + practiceAccCutoff + "% correct on this task in order to move onto the next section, otherwise you will need to repeat the practice.";
        case 6:
            $( getImageText(instructionImages[1])).insertAfter( "#instructions" + slideNum);
            iterateAgain = true;
            return "This block contains 16 trials. Please place your hands on the 'Z' and 'M' keys as shown.";
        case 7:
          changeTextFormat('#instructions' + slideNum,'font-weight','bold');
          return "Press any button to start the task.";
      }
      case "main1":
        switch (slideNum){
            case 1:
              return "Great job! You are now ready to begin the main experiment.";
            case 2:
              return "This experiment consists of 4 sections, with each section lasting about 8 minutes. You will get short breaks in between each section.";
            case 3:
              return "Remember to respond as quickly and as accuractely as possible on each trial.";
            case 4:
              return "Remember, use the 'Z' and 'M' keys to indicate the direction of the line in the shape that is different than the other shapes. Ignore the highlighted shape as best as you can.";
            case 5:
                $( getImageText(instructionImages[1])).insertAfter( "#instructions" + slideNum);
                iterateAgain = true;
                return "Please place your hands on the 'Z' and 'M' keys as shown before proceeding.";
            case 6:
              changeTextFormat('#instructions' + slideNum,'font-weight','bold');
              return "Press any button to start the task.";
          }
  }
}

// ###########################
// INSTRUCTION.JS CODE BELOW
// DON'T TOUCH

function runInstructions(){
  showCursor();
  changeScreenBackgroundTo("white")

  //set up for data logging
  sectionStart = new Date().getTime() - runStart;
  sectionType = "instructions";

  // hide/clear everything, just in case
  hideInstructions();

  // hide canvas
  hideCanvas();
  // if (showNavButtons) {
  //   $("#navButtons").show();
  // }

  // if need to repeat instructions (e.g., participant failed to meet accuracy requirement), then reshow all instructions
  if (instructions["iterator"][expStage] >= instructions["max"][expStage]){

    // loop through instructions and show
    for (var i = 1; i <= instructions["max"][expStage]; i++) {
      $('#instructions' + i).html( getInstructionText( i, expStage ));
    }

    // reset iterateAgain in case looping turned it on by accident
    iterateAgain = false;

    // display instructions and prepare exit response mapping
    $('#instructionsDiv').show();
    displayDefaults(expStage);
    exitResponse();

  } else {

    // remove any previous click listeners, if any
    $(document).off("click","#nextInstrButton");
    $(document).off("click","#startExpButton");
    $(document).off("click","#nextSectionButton");

    // clear all previous instructions, reset styles, and remove pictures
    for (let i = 1; i <= 8; i++) {
      $('#instructions' + i).text("");
      resetDefaultStyles('#instructions' + i);
      clearInsertedContent();
    }

    // display proper instruction components, in case they are hidden
    $('#instructionsDiv').show();
    $('#nextInstrButton').show();
    $('#nextSectionButton').hide();
    $('#startExpButton').hide();
    displayDefaults(expStage);
  }

  /* code for "Next" button click during instruction display
        if running from Atom, need to use $(document).on, if through Duke Public Home Directory, either works.
        https://stackoverflow.com/questions/19237235/jquery-button-click-event-not-firing
  */
  $(document).on("click", "#nextInstrButton", function(){
  // $("#nextInstrButton").on('click', function(){
    iterateInstruction();
  });

  // code for click startExperiment button
  $(document).on('click', '#startExpButton', function(){
    // update data logger on time spent in section
    sectionEnd = new Date().getTime() - runStart;
    logSectionData();

    $('#instructionsDiv').hide();
    $('#startExpButton').hide();
    clearInsertedContent();

    // clear all button press listeners
    $(document).off("click","#nextInstrButton");
    $(document).off("click","#startExpButton");
    $(document).off("click","#nextSectionButton");
    experimentFlow();
  });

  $(document).on('click', '#nextSectionButton', function(){
    // update data logger on time spent in section
    sectionEnd = new Date().getTime() - runStart;
    logSectionData();

    // clear all button press listeners
    $(document).off("click","#nextInstrButton");
    $(document).off("click","#startExpButton");
    $(document).off("click","#nextSectionButton");
    navigateInstructionPath();
  });
};

function iterateInstruction(){
  let instrNum = instructions["iterator"][expStage];
  $('#instructions' + instrNum).html( getInstructionText( instrNum, expStage));

  // iterate as appropriate or allow next phase
  if (instrNum < instructions["max"][expStage]){
    instructions["iterator"][expStage]++;
  } else{
    exitResponse();
  }

  if (iterateAgain == true) {
    iterateAgain = false;
    iterateInstruction();
  }
}

function exitResponse(){
  $('#nextInstrButton').hide();
  if (instructions["exitResponse"][expStage] == "#startExpButton"){
    $('#startExpButton').show();
  } else if (instructions["exitResponse"][expStage] == "#nextSectionButton") {
    $('#nextSectionButton').show();
  } else if (instructions["exitResponse"][expStage] == "keyPressStartTask"){
    setTimeout(function(){keyListener = 8}, 500);
  } //else if (instructions["exitResponse"][expStage] == "buttonPressNextSection"){
    //keyListener = 6;
  //}
}

function getImageText(imageURL){
  return "<img src='" + imageURL + "' class='insertedImage'>";
}

function showFirst() {
  iterateInstruction();
}

function changeTextFormat(elementName, property ,changeTo){
  $(elementName).css( property , changeTo );
}

function clearInsertedContent(){
  $('.insertedImage').remove();
  $('.insertedContent').remove();
}

function hideInstructions(){
  // remove any previous click listeners, if any
  $(document).off("click","#nextInstrButton");
  $(document).off("click","#startExpButton");
  $(document).off("click","#nextSectionButton");

  // hide instruction DOMs
  $('#instructionsDiv').hide();
  $('#startExpButton').hide();
  $('#nextSectionButton').hide();

  // clear text from instruction DOMs
  for (let i = 1; i <= 8; i++) {
    $('#instructions' + i).text("");
    resetDefaultStyles('#instructions' + i);
    clearInsertedContent();
  }
}

function resetDefaultStyles(domObject){
  $(domObject).css('font-weight','');
  $(domObject).css('font-size','');
  $(domObject).css('color','');
  $(domObject).css('margin-top','');
  $(domObject).css('margin-bottom','');
}
