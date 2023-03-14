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

        this.data = {
            state: STATES.STOPPED,
            displayMode: DISPLAY_MODES.REMAINING,
            duration: INITIAL_DURATION * 60 * 1000,
            remaining: undefined,
            timeStart: undefined,
            timeStop: undefined,
        };

        this.anchors = {
            clock: el.querySelector('.clock'),
            controlAddMinute: el.querySelector('.control-add-minute'),
            controlSubMinute: el.querySelector('.control-sub-minute'),
            controlsSetMinutes: el.querySelectorAll('.control-set-minutes'),

            controlStart: el.querySelector('.control-start'),
            controlPause: el.querySelector('.control-pause'),
            controlResume: el.querySelector('.control-resume'),
            controlReset: el.querySelector('.control-reset'),

            dinger: el.querySelector('.dinger'),
        };

        this.interval = undefined;

        this.initEventListeners();

        this.draw();

        this.loop();
    }

    start() {
        if (this.getState() !== STATES.STOPPED) {
            return;
        }

        let now = dayjs();
        this
            .setTimeStart(now)
            .setTimeStop(now.add(this.getDuration(), 'ms'))
            .setState(STATES.TICKING)
        ;
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
    }

    reset() {
        this
            .setState(STATES.STOPPED)
            .setRemaining(undefined)
            .setTimeStart(undefined)
            .setTimeStop(undefined)
        ;

        this.draw();
    }

    finish() {
        // todo notification
        this.reset();
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

        console.debug('Event listeners initialized.');
    }

    draw() {
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

        return this;
    }

    loop() {
        this.interval = setInterval(() => {
            if (this.getState() === STATES.TICKING) {
                this
                    .updateRemaining()
                    .draw()
                ;

                if (Math.round(this.getRemaining() / 1000) === 5) {
                    this.anchors.dinger.volume = 0.5;
                    this.anchors.dinger.play();
                }

                if (this.getRemaining() <= 0) {
                    this.finish();
                }
            }
        }, 1000);
    }
}
