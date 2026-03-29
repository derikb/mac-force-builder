import { html } from 'lit';
import WeaponDetails from '../components/WeaponDetails.js';
import BaseElement from './BaseElement.js';
import { getWeapons } from '../services/WeaponService.js';

export default class WeaponList extends BaseElement {
    constructor ({ charId = 0, rival = false }) {
        super();
        this.charId = charId;
        this.rival = rival;
    }

    close () {
        this.getRootNode().host?.clearColumns(false, true);
    }

    render () {
        return html`<div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Choose Weapons</h3>
        <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>
        <ul class="list-group">
            ${getWeapons(this.rival).map((weapon) => {
        return new WeaponDetails({ weapon, charId: this.charId });
    })}
        `;
    }
}

if (!window.customElements.get('mac-weapon-list')) {
    window.customElements.define('mac-weapon-list', WeaponList);
}
