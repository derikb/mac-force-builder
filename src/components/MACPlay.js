import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { INITIATIVE_VALUES } from '../data/initiatives.js';
import { getHardware } from '../services/HardwareService.js';

export default class MACPlay extends BaseElement {
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

    /** @prop {MAC} */
    mac = null;
    constructor ({
        mac,
        force
    }) {
        super();
        this.mac = mac;
        this.force = force;
        this.id = this.mac.uuid;
    }

    #markMACDestroyed(ev) {
        this.mac.destroyed = ev.target.checked;
        this.dispatchEvent(new CustomEvent('mac-destroyed-change', { bubbles: true, composed: true }));
        this.requestUpdate();
    }

    #markDestroyed(ev) {
        const moduleId = Number(ev.target.value);
        const module = this.mac.getModule(moduleId);
        module.destroyed = ev.target.checked;
        this.requestUpdate();
    }

    #setDivision(ev) {
        this.mac.division = ev.target.value;
        this.dispatchEvent(new CustomEvent('mac-division-change', { bubbles: true, composed: true }));
    }

    #setInitiative(ev) {
        this.mac.initiative = ev.target.value;
        this.dispatchEvent(new CustomEvent('mac-initiative-change', { bubbles: true, composed: true }));
    }

    #getModuleFields() {
        return [1,2,3,4,5,6].map((id) => {
            const module = this.mac.getModule(id);
            const hardware = module.hardware_id ? getHardware(module.hardware_id) : null;
            const popoverId = `mac-${this.mac.uuid}-mod-${id}-popover`;
            return html`<li data-mid="${id}">
            <div class="input-group">
                <span class="input-group-text">${id}</span>
                <span class="input-group-text module-name ${module.destroyed ? 'destroyed' : ''}">${module.label ? module.label : '[Empty]'}</span>
                ${hardware?.description ? html`
                    <button class="btn btn-outline-secondary px-4" type="button" popovertarget="${popoverId}" style="anchor-name: --${popoverId}" aria-label="Show ${hardware.name} description">?</button>
                    <div id="${popoverId}" popover style="position-anchor: --${popoverId}">${hardware.description}</div>
                ` : ''}
                <span class="input-group-text">
                    <input class="form-check-input mt-0" type="checkbox" value="1" aria-label="Mark damaged">
                    <input class="form-check-input mt-0 ms-3" type="checkbox" value="${id}" aria-label="Mark destroyed" @click=${this.#markDestroyed}>
                </span>
            </div>
            </li>`;
        });
    }

    #getInternalChecks() {
        const checks = [];
        for (let i = 1; i <= this.mac.mClass; i++) {
            const isLast = i === this.mac.mClass;
            checks.push(html`<span class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" value="1" aria-label="Mark ${isLast ? 'destroyed' : 'damaged'}" @click=${isLast ? this.#markMACDestroyed : null} />
            </span>`);
        }
        return checks;
    }

    render () {
        return html`<div>
            <div class="row mb-3 align-items-center g-3">
                <div class="input-group">
                    <span class="input-group-text"><strong>Class</strong></span>
                    <span class="input-group-text">${this.mac.mClass}</span>
                </div>
                <div class="input-group">
                    <label for="division" class="input-group-text">Division</label>
                    <select name="division" class="form-select" @change=${this.#setDivision}>
                        ${['--', 'A','B','C'].map((v) => html`<option value="${v}" ?selected=${this.mac.division === v}>${v}</option>`)}</select>
                </div>
                <div class="input-group">
                    <label for="initiative" class="input-group-text">Initiative</label>
                    <select name="initiative" class="form-select" @change=${this.#setInitiative}>
                        ${['--', ...INITIATIVE_VALUES].map((v) => html`<option value="${v}" ?selected=${this.mac.initiative === v}>${v}</option>`)}</select>
                </div>
            </div>
        </div>
            <div>
                <ol class="list-unstyled module-list mb-3">
                    ${this.#getModuleFields()}
                </ol>
                <div class="input-group">
                    <span class="input-group-text">Internal Damage</span>
                    ${this.#getInternalChecks()}
                </div>
            </div>
        `;
    }
}

if (!window.customElements.get('mac-mac-play')) {
    window.customElements.define('mac-mac-play', MACPlay);
}
