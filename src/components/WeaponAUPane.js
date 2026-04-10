import { html } from 'lit';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';
import WeaponDetails from './WeaponDetails.js';

export default class WeaponAUPane extends BaseElement {
    constructor ({
        auxunit,
        moduleId = 0,
    }) {
        super();
        this.auxunit = auxunit;
        this.moduleId = moduleId;
    }

    connectedCallback () {
        super.connectedCallback();
    }

    disconnectedCallback () {
        super.disconnectedCallback();
    }

    close () {
        this.getRootNode().host?.clearColumns(false, true);
    }

    render () {
        return html`<div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Choose Weapon</h3>
            <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>
        <ul class="list-group">
            ${new WeaponDetails({ auxunit: this.auxunit, moduleId: this.moduleId })}
        </ul>`;
    }
}

if (!window.customElements.get('mac-weapon-au-list')) {
    window.customElements.define('mac-weapon-au-list', WeaponAUPane);
}
