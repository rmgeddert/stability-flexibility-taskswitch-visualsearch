// data logging for sections
// instructions, break screens, etc
function logSectionData(){
  data.push([expStage, sectionType, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, sectionStart, sectionEnd, sectionEnd - sectionStart]);
  console.log(data);
}

function logAdditionalSingletonTask(){
  let distractorLocation = (distractionArr[trialCount - 1] == "d") ? distractorLocationArr[trialCount - 1] : NaN;

  data.push([taskName, sectionType, block, blockType, trialCount, blockTrialCount, stimOnset, respOnset, respTime, getAccuracy(acc), targetShape, nonTargetShape, targetLocationArr[trialCount - 1], lineDirectionArr[trialCount - 1], distractionArr[trialCount - 1], distractorLineDirection, distractorLocation, switchRepeatArr[trialCount - 1], sequenceTypeArr[trialCount - 1], sequenceKindArr[trialCount - 1], sequencePositionArr[trialCount - 1], NaN, NaN, NaN]);
  console.log(data)
}

function logPracticeTask(){
  let distractorLocation = (distractionArr[trialCount - 1] == "d") ? distractorLocationArr[trialCount - 1] : NaN;

  data.push([taskName, sectionType, block, NaN, trialCount, NaN, stimOnset, respOnset, respTime, getAccuracy(acc), targetShape, nonTargetShape, targetLocationArr[trialCount - 1], lineDirectionArr[trialCount - 1], distractionArr[trialCount - 1], distractorLineDirection, distractorLocation, switchRepeatArr[trialCount - 1], NaN, NaN, NaN, NaN, NaN, NaN]);
  console.log(data)
}
