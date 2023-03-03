// // import Focus from "./Class/Focus";
// import FocusTimer from "./Class/FocusTimer";
//
// let focusContainer = document.querySelector('section#focus');
// // document.focusApp = new Focus(focusContainer);
//
// document.focusTimer = new FocusTimer(document.querySelector('#focus-timer'));

import Timer from "./Class/Timer";
import Sfx from "./Class/Sfx";

let focusEl = document.querySelector('#focus');
let timerEl = focusEl.querySelector('.timer');
let sfxEl = focusEl.querySelector('.sfx');
let fullScreenHandle = focusEl.querySelector('.control-fullscreen');

document.timer = new Timer(timerEl);

document.sfxs = [];
for (let toggle of sfxEl.querySelectorAll('.sfx-toggles .toggle')) {
    let sfx = new Sfx(toggle);
    document.sfxs.push(sfx);
}

fullScreenHandle.addEventListener('click', () => {
    focusEl.requestFullscreen();
});
