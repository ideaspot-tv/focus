
import Sfx from "./Sfx";

export default class SfxBox {

    constructor(el, manifestPath) {
        this.el = el;
        this.sfxs = [];

        this.buildDOM();

        fetch(manifestPath)
            .then((response) => response.json())
            .then((data) => {
                console.debug('JS manifest fetch successfull with data', data);
                this.updateSFXs(data);
            });
    }

    buildDOM() {
        this.el.innerHTML = '';

        let toggles = document.createElement('div');
        toggles.className = 'sfx-toggles';
        this.el.appendChild(toggles);

        let controls = document.createElement('div');
        controls.className = 'sfx-controls';
        this.el.appendChild(controls);

        let muter = document.createElement('button');
        muter.className = 'control control-clear';
        muter.innerHTML = 'mute all';
        controls.appendChild(muter);

        muter.addEventListener('click', () => {
            this.toggleAllOff();
        });
    }

    updateSFXs(items) {
        this.sfxs = [];
        for (let sfx of items) {
            this.sfxs.push(new Sfx(document.querySelector('.sfx-toggles'), sfx.sfx, sfx.icon));
        }
    }

    toggleAllOff() {
        for (let sfx of this.sfxs) {
            sfx.toggleOff();
        }
    }
}
