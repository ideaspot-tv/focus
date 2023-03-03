const STATES = {
    'ON': 'on',
    'OFF': 'off',
};

const INITIAL_VOLUME = 0.5;

export default class Sfx {

    constructor(el) {
        this.el = el;
        this.icon = el.querySelector('.toggle-icon');
        this.volumeSlider = el.querySelector('input');

        this.state = STATES.OFF;
        this.path = this.el.dataset.path;

        this.volumeSlider.min = 0;
        this.volumeSlider.max = 1;
        this.volumeSlider.step = 0.1;
        this.volumeSlider.value = INITIAL_VOLUME;

        this.audio = document.createElement('audio');
        this.audio.src = `./sfx/${this.path}`;
        this.audio.volume = INITIAL_VOLUME;
        this.audio.loop = true;

        this.initEventListeners();

        this.updateDOM();
    }

    initEventListeners() {
        let icon = this.el.querySelector('.toggle-icon');
        icon.addEventListener('click', () => {
            this.toggle();
        });

        this.volumeSlider.addEventListener('input', () => {
            this.setVolume(this.volumeSlider.value);
        });
    }

    isOn() {
        return (this.state === STATES.ON);
    }

    toggle() {
        if (!this.isOn()) {
            this.toggleOn();
        } else {
            this.toggleOff();
        }
    }

    toggleOn() {
        this.state = STATES.ON;
        this.updateDOM();
    }

    toggleOff() {
        this.state = STATES.OFF;
        this.updateDOM();
    }

    setVolume(volume) {
        this.audio.volume = volume;

        return this;
    }

    getVolume() {
        return this.audio.volume;
    }

    updateDOM() {
        switch (this.state) {
            case STATES.OFF:
                this.audio.muted = true;
                this.el.className = 'toggle off';
                this.audio.pause();
                break;
            case STATES.ON:
                this.audio.muted = false;
                this.el.className = 'toggle on';
                this.audio.play();
                break;
        }
    }
}