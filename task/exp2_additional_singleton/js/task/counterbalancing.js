function getBlockOrder(blockOrderNum){
  // Latin square counterbalancing
  // controls for all possible
  // block transitions equally
  switch (blockOrderNum) {
    case 1:
      return ["A", "B", "D", "C"];
    case 2:
      return ["B", "C", "A", "D"];
    case 3:
      return ["C", "D", "B", "A"];
    case 4:
      return ["D", "A", "C", "B"];
  }
}

function getBlockCongruencies(blockLetter) {
  switch (blockLetter){
    case "A":
      return {
        switch: 0.25,
        repeat: 0.75,
        no_distractor: 0.25,
        distractor: 0.75
      };
    case "B":
      return {
        switch: 0.75,
        repeat: 0.25,
        no_distractor: 0.25,
        distractor: 0.75
      };
    case "C":
      return {
        switch: 0.25,
        repeat: 0.75,
        no_distractor: 0.75,
        distractor: 0.25
      };
    case "D":
      return {
        switch: 0.75,
        repeat: 0.25,
        no_distractor: 0.75,
        distractor: 0.25
      };
  }
}
