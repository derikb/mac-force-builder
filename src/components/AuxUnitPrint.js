import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import AuxUnitTypes from '../data/AuxUnitTypes.js';
import { getHardware } from '../services/HardwareService.js';

export default class AuxUnitPrint extends BaseElement {
    static styles = [
        css`
        :host {
            border: 2px solid black;
            padding: 1rem;
        }
        .grid-col-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: .5rem;
        }
    dl {
        margin:0;
        padding: 0;
    }
    dl.attributes {
        display: grid;
        grid-template-columns: 1fr 1fr 4fr;
        gap: .5rem;
        align-items: top;
    }
    dl.attributes dt {
        font-weight: bold;
    }
    dl.attributes dd {
        margin: 0;
        grid-column: 2 / span 2
    }
    #attr-luck, #attr-handed {
        grid-column: 2;
    }
    #attr-luck-check {
        grid-column: 3;
        grid-row: span 2;

    }


    input[type="checkbox"] {
        margin-inline: 1px;
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
        height: 1.5rem;
        width: 1.5rem;
        border: 1px solid black;
        text-align: center;
    }

    .small { font-size: .8rem; }

    .hit-locations {
        display: grid;
        grid-template-columns: 1fr 1fr 5fr;
        gap: .5rem;
        align-items: center;
    }
    .location {
        white-space: nowrap;
    }

    .equipment-list:has(ul:empty) h3 {
        display: none;
    }
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
    }

    #getUnitType() {
        const type = AuxUnitTypes.find((el) => {
            return el.id === this.auxunit.type;
        });
        return type?.label ?? '--';
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
        return this.auxunit.hardware.map((id) => {
            const hardware = getHardware(id);
            if (!hardware) {
                return '';
            }
            return html`<li>
            <div class="input-group">
                <span class="input-group-text module-name">${hardware.name}</span>
            </div>
            </li>`;
        });
    }

    #getUnitChecks() {
        const checks = [];
        for (let i = 1; i <= this.auxunit.units; i++) {
            checks.push(html`<span class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" value="1" />`);
        }
        return checks;
    }

    render () {
        return html`<div class="grid-col-2">
            <div class="row mb-3 align-items-center">
                <div class="input-group">
                    <span class="input-group-text"><strong>Type</strong></span>
                    <span class="input-group-text">${this.#getUnitType()}</span>
                </div>
                <div class="input-group">
                    <label for="division" class="input-group-text">Division</label>
                    <span class="input-group-text">&nbsp;</span>
                </div>
                <div class="input-group">
                    <label for="initiative" class="input-group-text">Initiative</label>
                    <span class="input-group-text">&nbsp;</span>
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
        </div>
        `;
    }
}

if (!window.customElements.get('mac-au-print')) {
    window.customElements.define('mac-au-print', AuxUnitPrint);
}
