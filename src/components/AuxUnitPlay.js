import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { INITIATIVE_VALUES } from '../data/initiatives.js';
import AuxUnitTypes from '../data/AuxUnitTypes.js';
import { getHardware } from '../services/HardwareService.js';

export default class AuxUnitPlay extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            padding: 0;
        }

    .module-list li {
        margin: 0;
    }
    .module-name {
        flex: 1 1 auto;
    }
    .module-name.destroyed {
        text-decoration: line-through;
    }

    .input-group {
        width: auto;
    }

    .input-group > .form-select {
        width: auto;
        flex: 0 1 auto;
    }

    input[type="checkbox"] {
        font-size: 2rem;
        height: 2rem;
        width: 2rem;
    }

    ul, ol { margin: 0; padding: 0; }
    li { margin: 0; padding: 0; margin-left: 1rem;}
    `
    ];

    /** @prop {AuxUnit} */
    auxunit = null;
    constructor ({
        auxunit,
        force
    }) {
        super();
        this.auxunit = auxunit;
        this.force = force;
        this.id = this.auxunit.uuid;
    }

    #markDestroyed(ev) {
        this.auxunit.destroyed = ev.target.checked;
        this.dispatchEvent(new CustomEvent('mac-destroyed-change', { bubbles: true, composed: true }));
        this.requestUpdate();
    }

    #setDivision(ev) {
        this.auxunit.division = ev.target.value;
        this.dispatchEvent(new CustomEvent('mac-division-change', { bubbles: true, composed: true }));
    }

    #setInitiative(ev) {
        this.auxunit.initiative = ev.target.value;
        this.dispatchEvent(new CustomEvent('mac-initiative-change', { bubbles: true, composed: true }));
    }

    #getWeapons() {
        return this.auxunit.weapons.map((weapon) => {
            return html`<li>
            <div class="input-group">
                <span class="input-group-text module-name">${weapon.label}</span>
            </div>
            </li>`;
        });
    }

    #getHardware() {
        return this.auxunit.hardware.map((id, index) => {
            const hardware = getHardware(id);
            if (!hardware) {
                return '';
            }
            const popoverId = `au-${this.auxunit.uuid}-hw-${index}-popover`;
            return html`<li>
            <div class="input-group">
                <span class="input-group-text module-name">${hardware.name}</span>
                ${hardware.description ? html`
                    <button class="btn btn-outline-secondary px-4" type="button" popovertarget="${popoverId}" style="anchor-name: --${popoverId}" aria-label="Show ${hardware.name} description">?</button>
                    <div id="${popoverId}" popover style="position-anchor: --${popoverId}">${hardware.description}</div>
                ` : ''}
            </div>
            </li>`;
        });
    }

    #getUnitChecks() {
        const checks = [];
        for (let i = 1; i <= this.auxunit.units; i++) {
            const isLast = i === this.auxunit.units;
            checks.push(html`<span class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" value="1" aria-label="Mark unit destroyed" @click=${isLast ? this.#markDestroyed : null} />`);
        }
        return checks;
    }

    #getUnitType() {
        const type = AuxUnitTypes.find((el) => {
            return el.id === this.auxunit.type;
        });
        return type?.label ?? '--';
    }

    render () {
        return html`<div>
            <div class="row mb-3 align-items-center">
                <div class="input-group">
                    <span class="input-group-text"><strong>Type</strong></span>
                    <span class="input-group-text">${this.#getUnitType()}</span>
                </div>
                <div class="input-group">
                    <label for="division" class="input-group-text">Division</label>
                    <select name="division" class="form-select" @change=${this.#setDivision}>
                        ${['--', 'A','B','C'].map((v) => html`<option value="${v}" ?selected=${this.auxunit.division === v}>${v}</option>`)}</select>
                </div>
                <div class="input-group">
                    <label for="initiative" class="input-group-text">Initiative</label>
                    <select name="initiative" class="form-select" @change=${this.#setInitiative}>
                        ${['--', ...INITIATIVE_VALUES].map((v) => html`<option value="${v}" ?selected=${this.auxunit.initiative === v}>${v}</option>`)}</select>
                </div>
            </div>
        </div>
            <div>
                <ol class="list-unstyled module-list mb-3">
                    ${this.#getWeapons()}
                    ${this.#getHardware()}
                </ol>
                <div class="input-group">
                    <span class="input-group-text">Units</span>
                    ${this.#getUnitChecks()}
                </div>
            </div>
        `;
    }
}

if (!window.customElements.get('mac-au-play')) {
    window.customElements.define('mac-au-play', AuxUnitPlay);
}
