const STATES = {
    'ON': 'on',
    'OFF': 'off',
};

const INITIAL_VOLUME = 0.5;

export default class Sfx {

    constructor(togglesEl, sfxPath, iconClass) {
        this.togglesEl = togglesEl;
        this.sfxPath = sfxPath;
        this.iconClass = iconClass;

        this.el = undefined;

        this.buildDOM();

        this.state = STATES.OFF;

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

    buildDOM() {
        let toggle = document.createElement('div');
        toggle.className = 'toggle';
        toggle.dataset.path = this.sfxPath;

        this.icon = document.createElement('div');
        this.icon.className = `toggle-icon fa-solid ${this.iconClass}`;
        toggle.appendChild(this.icon);

        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = 0;
        this.volumeSlider.max = 1;
        this.volumeSlider.step = 0.1;
        this.volumeSlider.value = INITIAL_VOLUME;
        toggle.appendChild(this.volumeSlider);

        this.audio = document.createElement('audio');
        this.audio.src = `./sfx/${this.sfxPath}`;
        this.audio.volume = INITIAL_VOLUME;
        this.audio.loop = true;
        toggle.appendChild(this.audio);

        this.el = toggle;
        this.togglesEl.appendChild(this.el);
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
