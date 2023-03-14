import Timer from "./Class/Timer";
import SfxBox from "./Class/SfxBox";

let focusEl = document.querySelector('#focus');
let timerEl = focusEl.querySelector('.timer');
let sfxEl = focusEl.querySelector('.sfx');
let fullScreenHandle = focusEl.querySelector('.control-fullscreen');
let scrollHandle = focusEl.querySelector('.control-more');

document.timer = new Timer(timerEl);
document.sfxBox = new SfxBox(sfxEl, './sfx/manifest.json');

fullScreenHandle.addEventListener('click', () => {
    if (focusEl.requestFullscreen) {
        focusEl.requestFullscreen();
    } else if (focusEl.webkitRequestFullScreen) {
        focusEl.webkitRequestFullScreen();
    }
});

scrollHandle.addEventListener('click', () => {
    window.scrollTo({
        left: 0,
        top: focusEl.clientHeight,
        behavior: 'smooth'
    });
});
