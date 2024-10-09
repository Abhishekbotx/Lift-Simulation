let lifts = [];
let liftQueue = [];
let floorsInput = document.getElementById("input-floors");
let liftsInput = document.getElementById("input-lifts");
let classConatiner = document.querySelector('.class_container');

let numberOfFloors;
let numberOfLifts;
let liftIntervalId;

let floorLiftStops = {}; 

let formElement = document.getElementById("form");
formElement.addEventListener("click", function (e) {
  e.preventDefault();
});

function createLifts(numLifts) {
  lifts = [];
  for (let i = 1; i <= numLifts; i++) {
    let lift = document.createElement("div");
    lift.className = "lift";
    lift.id = "lift" + i;

    let leftDoor = document.createElement("div");
    let rightDoor = document.createElement("div");
    leftDoor.classList.add("lift-door", "lift-door-left");
    rightDoor.classList.add("lift-door", "lift-door-right");
    leftDoor.id = "left-door" + i;
    rightDoor.id = "right-door" + i;

    lift.style.left = `${10 + 10 * i}%`;

    lift.appendChild(leftDoor);
    lift.appendChild(rightDoor);

    let liftObject = {
      id: i,
      element: lift,
      currentFloor: 1,
      moving: false,
    };
    lifts.push(liftObject);
  }

  classConatiner.classList.add("hidden");
}

function createFloor(floorNumber) {
  let container = document.getElementById("container");

  let floorDiv = document.createElement("div");
  floorDiv.className = "floor";
  floorDiv.id = "floor" + floorNumber;

  let upButton = document.createElement("button");
  let downButton = document.createElement("button");

  upButton.classList.add("control-btn", "control-btn-up");
  downButton.classList.add("control-btn", "control-btn-down");

  upButton.id = "up" + floorNumber;
  downButton.id = "down" + floorNumber;

  upButton.textContent = "Up";
  downButton.textContent = "Down";

  let floorTextSpan = document.createElement("span");
  floorTextSpan.className = "floor-number";
  floorTextSpan.textContent = `Floor ${floorNumber}`;

  let hr = document.createElement("hr");
  hr.className = "hr-divider";
  hr.id = "floor" + floorNumber;

  floorDiv.appendChild(upButton);
  floorDiv.appendChild(document.createElement("br"));
  floorDiv.appendChild(downButton);
  floorDiv.appendChild(floorTextSpan);
  floorDiv.appendChild(hr);
  container.insertBefore(floorDiv, container.childNodes[0]);
}

function initializeFloors() {
  let container = document.getElementById("container");
  container.innerHTML = "";
  numberOfFloors = floorsInput.value;

  floorLiftStops = {};
  for (let i = 1; i <= numberOfFloors; i++) {
    createFloor(i);
    floorLiftStops[i] = 0; 
  }
}

function moveLift(lift, destinationFloor) {
  
  if (floorLiftStops[destinationFloor] >= 2) {
    console.log(`Skipping: More than 2 lifts are stopping at floor ${destinationFloor}`);
    return;
  }

  
  let distance = -1 * (destinationFloor - 1) * 100;
  let liftNo = lift.id;
  let startFloor = lift.currentFloor;
  lift.currentFloor = destinationFloor;
  lift.moving = true;
  let liftElement = lift.element;
  liftElement.addEventListener("webkitTransitionEnd", animateLiftDoors);
  liftElement.style.transform = `translateY(${distance}%)`;

  
  floorLiftStops[destinationFloor]++;
  console.log(`Lift ${liftNo} assigned to floor ${destinationFloor}. Lifts stopping here: ${floorLiftStops[destinationFloor]}`);

  
  let travelTime = 2.5 * Math.abs(startFloor - destinationFloor);
  if (travelTime === 0) {
    let e = {};
    e.target = {};
    e.target.id = `lift${liftNo}`;
    animateLiftDoors(e);
  }
  liftElement.style.transitionDuration = `${travelTime}s`;

  console.log(
    `Lift Number: ${liftNo} \n Floor: \n From: ${startFloor} To: ${destinationFloor} \n Time: ${travelTime} sec`
  );
}

function closeLiftDoors(e) {
  let targetId = e.target.id;
  let liftNo = targetId[targetId.length - 1];
  let leftDoor = document.getElementById("left-door" + liftNo);
  let rightDoor = document.getElementById("right-door" + liftNo);
  rightDoor.removeEventListener("webkitTransitionEnd", closeLiftDoors);
  leftDoor.style.transform = `translateX(0)`;
  rightDoor.style.transform = `translateX(0)`;
  leftDoor.style.transition = `transform 1s ease-out`;
  rightDoor.style.transition = `transform 1.5s ease-out`;

 
  for (let lift of lifts) {
    if (lift.id == liftNo) {
      let floor = lift.currentFloor;
      floorLiftStops[floor]--;
      console.log(`Lift ${liftNo} left floor ${floor}. Lifts stopping here: ${floorLiftStops[floor]}`);
    }
  }

  setTimeout(() => {
    stopLift(liftNo);
  }, 2500);
}

function stopLift(liftNo) {
  for (let lift of lifts) {
    if (lift.id == liftNo) {
      lift.moving = false;
    }
  }
}

function animateLiftDoors(e) {
  let targetId = e.target.id;
  let liftNo = targetId[targetId.length - 1];
  let lift = document.getElementById("lift" + liftNo);
  lift.removeEventListener("webkitTransitionEnd", animateLiftDoors);
  let leftDoor = document.getElementById("left-door" + liftNo);
  let rightDoor = document.getElementById("right-door" + liftNo);
  leftDoor.removeEventListener("webkitTransitionEnd", animateLiftDoors);
  rightDoor.removeEventListener("webkitTransitionEnd", animateLiftDoors);
  rightDoor.addEventListener("webkitTransitionEnd", closeLiftDoors);
  leftDoor.style.transform = `translateX(-100%)`;
  rightDoor.style.transform = `translateX(100%)`;
  leftDoor.style.transition = `all 1.5s ease-out`;
  rightDoor.style.transition = `all 1.5s ease-out`;
}

function scheduledLift(floor) {
  let selectedLift;
  let minDistance = Infinity;

  for (let lift of lifts) {
    if (!lift.moving && Math.abs(floor - lift.currentFloor) < minDistance) {
      minDistance = Math.abs(floor - lift.currentFloor);
      selectedLift = lift;
    }
  }
  return selectedLift;
}

function checkLiftQueue() {
  if (liftQueue.length === 0) return;
  let floor = liftQueue.shift();
  let selectedLift = scheduledLift(floor);
  if (!selectedLift) {
    liftQueue.unshift(floor);
    return;
  }
  moveLift(selectedLift, floor);
}

function saveButtonClick(e) {
  let clickedId = e.target.id;
  let floorNumber;
  if (clickedId.startsWith("up"))
    floorNumber = Number(clickedId.substring(2, clickedId.length));
  else if (clickedId.startsWith("down"))
    floorNumber = Number(clickedId.substring(4, clickedId.length));
  liftQueue.push(floorNumber);
}

function assignButtonClickEvents() {
  let upButtons = document.getElementsByClassName("control-btn-up");
  let downButtons = document.getElementsByClassName("control-btn-down");

  for (let upButton of upButtons) {
    upButton.addEventListener("click", saveButtonClick);
  }
  for (let downButton of downButtons) {
    downButton.addEventListener("click", saveButtonClick);
  }
}

function initializeLifts() {
  numberOfLifts = liftsInput.value;
  createLifts(numberOfLifts);
  for (let lift of lifts) {
    let liftElement = lift.element;
    liftElement.style.transform = null;
    liftElement.style.transitionDuration = null;
  }
}

function placeLifts() {
  let firstFloor = document.getElementById("floor1");
  for (let lift of lifts) {
    firstFloor.appendChild(lift.element);
  }
}


let back=document.createElement('p')

const liftTop=document.querySelector('.lift_top')
function AddBack(){
back.className='back_btn'
back.innerText='Back'
liftTop.appendChild(back)

}


function startLiftSystem() {
  initializeFloors();
  initializeLifts();
  placeLifts();
  assignButtonClickEvents();
  // AddBack()
  liftIntervalId = setInterval(checkLiftQueue, 100);
}

function BackFunction(){
  
}

let startButton = document.getElementById("input-btn");
startButton.addEventListener("click", startLiftSystem);
