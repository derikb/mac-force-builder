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

        this.handleUpdate = this.#handleUpdate.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();
        emitter.on('auxunit:weapon:update', this.handleUpdate);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('auxunit:weapon:update', this.handleUpdate);
    }

    #handleUpdate () {
        this.getRootNode().host?.clearColumns(false, true);
    }

    render () {
        return html`<ul class="list-group">
            ${new WeaponDetails({ auxunit: this.auxunit, moduleId: this.moduleId })}
        </ul>`;
    }
}

if (!window.customElements.get('mac-weapon-au-list')) {
    window.customElements.define('mac-weapon-au-list', WeaponAUPane);
}
