import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';

export default class HardwareDetails extends BaseElement {
    static styles = [
        super.styles,
        css`
    :host([selected]) li.list-group-item {
        background-color: lightgoldenrodyellow;
        border-width: 3px;
    }
    `
    ];

    static properties = {
        selected: { type: Boolean }
    };

    constructor ({
        hardware,
        selected = false,
        macUuid = '',
        moduleId = 0,
    }) {
        super();
        this.hardware = hardware;
        this.selected = selected;
        if (this.selected) {
            this.setAttribute('selected', 'true');
        }
        this.macUuid = macUuid;
        this.moduleId = moduleId;
    }

    handleSelect (ev) {
        emitter.trigger('mac:module:update', { hardware: this.hardware, macUuid: this.macUuid, moduleId: this.moduleId });
    }

    render () {
        return html`<li class="list-group-item" @click=${this.handleSelect}>
            <h4>${this.hardware.name} (${this.hardware.type.join(', ')})</h4>
            <p>Description: ${this.hardware.description}</p>
        </li>`;
    }
}

if (!window.customElements.get('mac-hardware-details')) {
    window.customElements.define('mac-hardware-details', HardwareDetails);
}
