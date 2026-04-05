import { html } from 'lit';
import HardwareDetails from './HardwareDetails.js';
import { getAllHardware } from '../services/HardwareService.js';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';
import WeaponDetails from './WeaponDetails.js';
import Hardware from '../models/Hardware.js';

export default class HardwareList extends BaseElement {
    constructor ({
        mac = null,
        auxunit = null,
        moduleId = 0,
    }) {
        super();
        this.mac = mac;
        this.auxunit = auxunit;
        this.moduleId = moduleId;
        this.module = this.mac?.getModule(moduleId) ?? null;

        this.handleUpdate = this.#handleUpdate.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();

        // @todo think there's a better way to do that
        emitter.on('mac:module:update', this.handleUpdate);
        emitter.on('auxunit:hardware:update', this.handleUpdate);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('mac:module:update', this.handleUpdate);
        emitter.off('auxunit:hardware:update', this.handleUpdate);
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

    #getCurrentHardwareId() {
        if (this.mac) {
            return this.module.hardware_id;
        }
        return this.auxunit.hardware[this.moduleId] ?? 0;
    }

    #getHardwareOptions() {
        const allHardware = getAllHardware();
        const filteredHardware = allHardware.filter((hw) => {
            if (this.mac) {
                return hw.type.includes('M') || hw.type.includes('A');
            }
            if (this.auxunit) {
                return hw.type.includes(this.auxunit.type) || hw.type.includes('A');
            }
        });
        return filteredHardware.map((hw) => {
            return new HardwareDetails({ hardware: hw, selected: hw.id == this.#getCurrentHardwareId(), macUuid: this.mac?.uuid, moduleId: this.moduleId, auUuid: this.auxunit?.uuid });
        });
    }

    render () {
        return html`<div class="d-flex justify-content-between align-items-center mb-3">
            <h3>${this.mac ? 'Choose Weapon/Hardware' : 'Choose Hardware'}</h3>
            <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>
        <ul class="list-group">
            ${this.mac ? new WeaponDetails({ mac: this.mac, moduleId: this.moduleId, selected: this.module.weapon }) : ''}
            ${this.#getHardwareOptions()}
        </ul>`;
    }
}

if (!window.customElements.get('mac-hardware-list')) {
    window.customElements.define('mac-hardware-list', HardwareList);
}
