import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { INITIATIVE_VALUES } from '../data/initiatives.js';

export default class MACPlay extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            padding: 0;
        }
        .grid-col-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: .5rem;
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

    label {
        font-weight: bold;
    }

    .input-group {
        width: auto;
    }

    .input-group > .form-select {
        width: auto;
        flex: 0 1 auto;
    }

    dl {
        margin:0;
        padding: 0;
    }
    dl.attributes {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .5rem;
        align-items: center;
    }
    dl.attributes dt {
        font-weight: bold;
    }
    dl.attributes dd {
        margin: 0;
    }
    #attr-luck-check, dl.attributes hr {
        grid-column: span 2;
    }
    dl.attributes hr {
        margin: 0.25rem 0;
    }

    input[type="checkbox"] {
        font-size: 2rem;
        height: 2rem;
        width: 2rem;
    }

    table.weapons {
        border: 1px solid black;
        border-collapse: collapse;
        width: 100%;
        text-align: left;
        margin-bottom: .5rem;
    }
    table.weapons th, table.weapons td{
        border: 1px solid black;
        padding: 0 .25rem;
    }

    h3 {
        font-size: 1rem;
        margin: 0;
        padding: 0;
        margin-bottom: .5rem;
    }
    ul, ol { margin: 0; padding: 0; }
    li { margin: 0; padding: 0; margin-left: 1rem;}

    .fill-in-box {
        display: inline-block;
        height: 2rem;
        width: 2rem;
        border: 1px solid black;
        text-align: center;
        font-size: 1.5rem;
        line-height: 2rem;
        border-radius: 1rem;
    }

    input[type="number"] {
        width: 100%;
        height: 2rem;
        font-size: 1.5rem;
        border: 1px solid black;
        text-align: center;
        border-radius: 5px;
        max-width: 10rem;
    }

    .small { font-size: .8rem; }

    .hit-locations {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .25rem;
        align-items: center;
    }
    .location {
        white-space: nowrap;
    }
    .location strong {
        font-size: 1.25rem;
    }
    .hit-locations .small {
        grid-column: span 2;
        padding-left: .25rem;
        text-align: right;
    }
    .hit-locations .small.highlight {
        color: red;
    }
    .hit-locations .wounds {
        text-align: right;
    }

    .equipment-list:has(ul:empty) h3 {
        display: none;
    }

    .boxes-checks {
        gap: 1rem;
        flex-wrap: wrap;
    }
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
            return html`<li data-mid="${id}">
            <div class="input-group">
                <span class="input-group-text">${id}</span>
                <span class="input-group-text module-name ${module.destroyed ? 'destroyed' : ''}">${module.label ? module.label : '[Empty]'}</span>
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
                <input class="form-check-input mt-0" type="checkbox" value="1" aria-label="Mark ${isLast ? 'destroyed' : 'damaged'}" ${isLast ? `@click=${this.#markMACDestroyed}` : ''} />
            </span>`);
        }
        return checks;
    }

    render () {
        return html`<div class="grid-col-2">
            <div class="row mb-3 align-items-center">
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
