import { html } from 'lit';
import BaseElement from './BaseElement.js';
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

    render () {
        return html`<ul class="list-group">
            ${new WeaponDetails({ auxunit: this.auxunit, moduleId: this.moduleId })}
        </ul>`;
    }
}

if (!window.customElements.get('mac-weapon-au-list')) {
    window.customElements.define('mac-weapon-au-list', WeaponAUPane);
}
