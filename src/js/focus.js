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

timerEl.addEventListener('start', (event) => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'blocked') {
        Notification.requestPermission();
    }
});

const notify = function (durationString, goal) {
    const title = 'Focus by ideaspot.tv';
    const message = `Good job keeping focus for ${durationString}${goal ? (' on ' + goal) : ''}!`;
    new Notification(title, {
        body: message,
        icon: 'focus-260.png'
    });
};
timerEl.addEventListener('finish', (event) => {
    console.debug(event);

    if (Notification.permission === 'granted') {
        notify(event.detail.durationString, event.detail.goal);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (Notification.permission === 'granted') {
                notify(event.detail.durationString, event.detail.goal);
            }
        })
    }

    document.sfxBox.toggleAllOff();
});
