import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const INITIAL_DURATION = 30;
const STATES = {
    'STOPPED': 'stopped',
    'TICKING': 'ticking',
    'PAUSED': 'paused',
};
const DISPLAY_MODES = {
    'REMAINING': 'remaining',
    'ELAPSED': 'elapsed'
}
const BASE_TITLE = 'Focus by ideaspot.tv';


export default class Timer {

    constructor(el) {
        this.el = el;

        this.data = this.load();
        if (!this.data) {
            this.data = {
                state: STATES.STOPPED,
                displayMode: DISPLAY_MODES.REMAINING,
                duration: INITIAL_DURATION * 60 * 1000,
                remaining: undefined,
                timeStart: undefined,
                timeStop: undefined,
                goal: "",
            };
        }

        this.anchors = {
            clock: el.querySelector('.clock'),
            controlAddMinute: el.querySelector('.control-add-minute'),
            controlSubMinute: el.querySelector('.control-sub-minute'),
            controlsSetMinutes: el.querySelectorAll('.control-set-minutes'),

            controlStart: el.querySelector('.control-start'),
            controlPause: el.querySelector('.control-pause'),
            controlResume: el.querySelector('.control-resume'),
            controlReset: el.querySelector('.control-reset'),

            goal: el.querySelector('.goal textarea'),

            dinger: el.querySelector('.dinger'),
        };

        this.interval = undefined;

        this.initEventListeners();

        this.draw(true);

        this.loop();
    }

    start() {
        if (this.getState() !== STATES.STOPPED) {
            return;
        }

        if (Notification.permission !== 'granted' && Notification.permission !== 'blocked') {
            Notification.requestPermission();
        }

        let now = dayjs();
        this
            .setTimeStart(now)
            .setTimeStop(now.add(this.getDuration(), 'ms'))
            .setState(STATES.TICKING)
        ;

        this.save();

        this.el.dispatchEvent(new Event('start'));
    }

    resume() {
        if (this.getState() !== STATES.PAUSED) {
            return;
        }

        let now = dayjs();
        this
            .setTimeStop(now.add(this.getRemaining()))
            .setTimeStart(this.getTimeStop().subtract(this.getDuration()))
            .setState(STATES.TICKING)
        ;

        this.draw();

        this.save();

        this.el.dispatchEvent(new Event('resume'));
    }

    pause() {
        if (this.getState() !== STATES.TICKING) {
            return;
        }

        this
            .setState(STATES.PAUSED)
            .setTimeStart(undefined)
            .setTimeStop(undefined)
        ;

        this.draw();

        this.save();

        this.el.dispatchEvent(new Event('pause'));
    }

    reset() {
        this
            .setState(STATES.STOPPED)
            .setRemaining(undefined)
            .setTimeStart(undefined)
            .setTimeStop(undefined)
        ;

        this.draw();

        this.save();

        this.el.dispatchEvent(new Event('reset'));
    }

    finish() {
        if (Notification.permission === 'granted') {
            this.notify();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (Notification.permission === 'granted') {
                    this.notify();
                }
            })
        }

        this.anchors.dinger.volume = 0.5;
        this.anchors.dinger.play();

        this.reset();

        this.el.dispatchEvent(new Event('finish'));
    }

    notify() {
        const title = 'Focus by ideaspot.tv';
        const message = `Good job keeping focus for ${this.getDurationString()}!`;
        new Notification(title, {
            body: message,
            icon: 'focus-260.png'
        });
    }

    getState() {
        return this.data.state;
    }

    setState(state) {
        this.data.state = state;

        return this;
    }

    getDisplayMode() {
        return this.data.displayMode;
    }

    setDisplayMode(displayMode) {
        this.data.displayMode = displayMode;

        return this;
    }

    toggleDisplayMode() {
        this.setDisplayMode(this.getDisplayMode() === DISPLAY_MODES.REMAINING ? DISPLAY_MODES.ELAPSED : DISPLAY_MODES.REMAINING);
        this.save();
    }

    setDurationMinutes(minutes) {
        this.data.duration = minutes * 60 * 1000;

        return this;
    }

    addMinute() {
        this.data.duration += 60 * 1000;
    }

    subMinute() {
        const oneMinute = 60 * 1000;
        this.data.duration -= oneMinute;
        if (this.data.duration < oneMinute) {
            this.data.duration = oneMinute;
        }
    }

    getDuration() {
        return this.data.duration;
    }

    getDurationString() {
        let ms = this.getDuration();
        let interval = dayjs.duration(ms, 'ms');
        return Math.floor(interval.asMinutes()).toString().padStart(2, '0') + ':' + interval.format('ss');
    }

    getRemaining() {
        return this.data.remaining;
    }

    getRemainingString() {
        let ms = this.getRemaining();
        let interval = dayjs.duration(ms, 'ms');
        return Math.floor(interval.asMinutes()).toString().padStart(2, '0') + ':' + interval.format('ss');
    }

    getElapased() {
        return this.getDuration() - this.getRemaining();
    }

    getElapsedString() {
        let ms = this.getElapased();
        let interval = dayjs.duration(ms, 'ms');
        return Math.floor(interval.asMinutes()).toString().padStart(2, '0') + ':' + interval.format('ss');
    }

    setRemaining(ms) {
        this.data.remaining = ms;

        return this;
    }

    updateRemaining() {
        let timeStop = this.getTimeStop();
        if (timeStop) {
            let now = dayjs();
            let remaining = timeStop.diff(now);
            this.setRemaining(remaining);
        } else {
            this.setRemaining(this.getDuration());
        }

        return this;
    }

    getTimeStart() {
        return this.data.timeStart;
    }

    setTimeStart(obj) {
        this.data.timeStart = obj;

        return this;
    }

    getTimeStop() {
        return this.data.timeStop;
    }

    setTimeStop(obj) {
        this.data.timeStop = obj;

        return this;
    }

    getGoal() {
        return this.data.goal;
    }

    setGoal(obj) {
        this.data.goal = obj;

        return this;
    }

    initEventListeners() {
        let self = this;
        for (let control of this.anchors.controlsSetMinutes) {
            control.addEventListener('click', function () {
                self.setDurationMinutes(this.dataset.minutes);
                self.reset();
            });
        }

        this.anchors.controlAddMinute.addEventListener('click', function () {
            self.addMinute();
            self.reset();
        });

        this.anchors.controlSubMinute.addEventListener('click', function () {
            self.subMinute();
            self.reset();
        });

        this.anchors.controlStart.addEventListener('click', function () {
            self.start();
        });

        this.anchors.controlPause.addEventListener('click', function () {
            self.pause();
        });

        this.anchors.controlResume.addEventListener('click', function () {
            self.resume();
        });

        this.anchors.controlReset.addEventListener('click', function () {
            self.reset();
        });

        this.anchors.clock.addEventListener('click', function () {
            if (self.getState() === STATES.TICKING) {
                self.toggleDisplayMode();
                self.draw();
            }
        });

        this.anchors.goal.addEventListener('change', function () {
            self.updateGoal();
        });

        console.debug('Event listeners initialized.');
    }

    updateGoal(goal) {
        this.setGoal(this.anchors.goal.value);
        this.save();
    }

    draw(isInitial = false) {
        let state = this.data.state;
        switch (state) {
            case STATES.STOPPED:
                this.anchors.clock.innerText = this.getDurationString();
                break;
            case STATES.PAUSED:
            case STATES.TICKING:
                this.anchors.clock.innerText = (this.getDisplayMode() === DISPLAY_MODES.REMAINING)
                    ? this.getRemainingString()
                    : this.getElapsedString()
                ;
                break;
        }

        this.el.dataset.state = state;
        document.title = (state === STATES.TICKING) ? `${this.getRemainingString()} - ${BASE_TITLE}` : BASE_TITLE;

        if (isInitial) {
            this.anchors.goal.value = this.getGoal();
        }

        return this;
    }

    loop() {
        this.interval = setInterval(() => {
            if (this.getState() === STATES.TICKING) {
                this
                    .updateRemaining()
                    .draw()
                ;

                if (this.getRemaining() <= 0) {
                    this.finish();
                }
            }
        }, 1000);
    }

    save() {
        localStorage.setItem('focus-timer', JSON.stringify(this.data));

        return this;
    }

    load() {
        let loaded = JSON.parse(localStorage.getItem('focus-timer'));
        if (loaded) {
            if (loaded.timeStart) {
                loaded.timeStart = dayjs(loaded.timeStart);
            }
            if (loaded.timeStop) {
                loaded.timeStop = dayjs(loaded.timeStop);
            }
        }

        return loaded;
    }
}
