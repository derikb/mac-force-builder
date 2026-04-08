import { html, css } from 'lit';
import AuxUnitPrint from './AuxUnitPrint.js';
import MACPrint from './MACPrint.js';
import BaseElement from './BaseElement.js';
import { calcForceCost } from '../CostCalculator.js';

export default class ForcePrint extends BaseElement {
    static styles = [
        super.styles,
        css`
        .mac-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: .5rem;
        }`
    ];

    constructor ({
        force = null
    }) {
        super();
        this.force = force;
    }

    render () {
        return html`<div class="d-flex justify-content-between mb-1">
            <div><strong>Force Name</strong> ${this.force.name}</div>
            <div><strong>Player Name</strong> ${this.force.player_name}</div>
            <div><strong>Points</strong> ${calcForceCost(this.force)}</div>
        </div>
        <div class="mac-list">
        ${this.force.macs.map((mac) => {
            return new MACPrint({ mac, force: this.force });
        })}
        ${this.force.aus.map((au) => {
            return new AuxUnitPrint({ auxunit: au, force: this.force });
        })}
        <div>
        </div>
        `;
    }
}

if (!window.customElements.get('mac-force-print')) {
    window.customElements.define('mac-force-print', ForcePrint);
}
