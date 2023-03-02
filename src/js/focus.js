// // import Focus from "./Class/Focus";
// import FocusTimer from "./Class/FocusTimer";
//
// let focusContainer = document.querySelector('section#focus');
// // document.focusApp = new Focus(focusContainer);
//
// document.focusTimer = new FocusTimer(document.querySelector('#focus-timer'));

import Timer from "./Class/Timer";

let focusEl = document.querySelector('#focus');
let timerEl = focusEl.querySelector('.timer');
let fullScreenHandle = focusEl.querySelector('.control-fullscreen');

document.timer = new Timer(timerEl);

fullScreenHandle.addEventListener('click', () => {
    focusEl.requestFullscreen();
});
