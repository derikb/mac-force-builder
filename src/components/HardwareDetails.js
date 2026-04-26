import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';

export default class HardwareDetails extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            cursor: pointer;
        }
    :host([selected]) div.list-group-item {
        background-color: var(--app-selected-color);
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
        auUuid = '',
        moduleId = 0,
    }) {
        super();
        this.hardware = hardware;
        this.selected = selected;
        if (this.selected) {
            this.setAttribute('selected', 'true');
        }
        this.macUuid = macUuid;
        this.auUuid = auUuid;
        this.moduleId = moduleId;
        this.role = 'listitem';
    }

    #handleSelect () {
        if (this.macUuid) {
            emitter.trigger('mac:module:update', { hardware: this.hardware, macUuid: this.macUuid, moduleId: this.moduleId });
        }
        if (this.auUuid) {
            emitter.trigger('auxunit:hardware:update', { hardware: this.hardware, auUuid: this.auUuid, moduleId: this.moduleId });
        }
    }

    render () {
        return html`<div class="list-group-item" @click=${this.#handleSelect}>
            <h4>${this.hardware.name} (${this.hardware.type.join(', ')})</h4>
            ${this.hardware.description !== '' ? html`<p>${this.hardware.description}</p>` : ''}
        </div>`;
    }
}

if (!window.customElements.get('mac-hardware-details')) {
    window.customElements.define('mac-hardware-details', HardwareDetails);
}
