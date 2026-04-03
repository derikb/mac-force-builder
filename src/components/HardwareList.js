import { html } from 'lit';
import HardwareDetails from './HardwareDetails.js';
import { getAllHardware } from '../services/HardwareService.js';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';
import WeaponDetails from './WeaponDetails.js';

export default class HardwareList extends BaseElement {
    constructor ({
        mac,
        moduleId = 0,
    }) {
        super();
        this.mac = mac;
        this.moduleId = moduleId;
        this.module = this.mac.getModule(moduleId);

        this.handleUpdate = this.#handleUpdate.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();

        // @todo think there's a better way to do that
        emitter.on('mac:module:update', this.handleUpdate);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('mac:module:update', this.handleUpdate);
    }

    close () {
        this.getRootNode().host?.clearColumns(false, true);
    }

    #handleUpdate ({ hardware, weapon, macUuid, moduleId }) {
        this.renderRoot.querySelectorAll('mac-hardware-details, mac-weapon-details').forEach((el) => {
            if (el.tagName === 'MAC-WEAPON-DETAILS') {
                if (weapon) {
                    el.setAttribute('selected', true);
                } else {
                    el.removeAttribute('selected');
                }
                return;
            }
            if (el?.hardware?.id === hardware?.id) {
                el.setAttribute('selected', true);
            } else {
                el.removeAttribute('selected');
            }
        });
    }

    render () {
        return html`<div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Choose Weapon/Hardware</h3>
            <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>
        <ul class="list-group">
            ${new WeaponDetails({ mac: this.mac, moduleId: this.moduleId, selected: this.module.weapon })}
            ${getAllHardware().map((hw) => {
                return new HardwareDetails({ hardware: hw, selected: hw.id == this.module.hardware_id, macUuid: this.mac.uuid, moduleId: this.moduleId });
            })}
        </ul>`;
    }
}

if (!window.customElements.get('mac-hardware-list')) {
    window.customElements.define('mac-hardware-list', HardwareList);
}
