import { html } from 'lit';
import HardwareDetails from './HardwareDetails.js';
import { getAllHardware } from '../services/HardwareService.js';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';
import Ranges from '../data/Ranges.js';
import WeaponTypes from '../data/WeaponTypes.js';
import WeaponSubtypes from '../data/WeaponSubtypes.js';

export default class HardwareList extends BaseElement {
    constructor ({
        macUuid = '',
        moduleId = 0,
        module,
    }) {
        super();
        this.macUuid = macUuid;
        this.moduleId = moduleId;
        this.module = module;

        this.handlerUpdate = this.#handleUpdate.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();

        // @todo think there's a better way to do that
        emitter.on('mac:module:update', this.handlerUpdate);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('mac:module:update', this.handlerUpdate);
    }

    close () {
        this.getRootNode().host?.clearColumns(false, true);
    }

    #handleUpdate ({ hardware, macUuid, moduleId }) {
        this.renderRoot.querySelectorAll('mac-hardware-details').forEach((el) => {
            if (el?.hardware?.id === hardware.id) {
                el.setAttribute('selected', true);
            } else {
                el.removeAttribute('selected');
            }
        });
    }

    render () {
        return html`<div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Choose Weapon</h3><button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>

        <form>
            <div class="row mb-3">
                <label class="col-form-label col-sm-3" for="weapon_name">Name</label>
                <div class="col-sm-9">
                    <input type="text" id="weapon_name" class="form-control" name="weapon_name" value="" />
                </div>
            </div>
            <div class="row mb-3">
                <label class="col-form-label col-sm-2" for="weapon_power">Power</label>
                <div class="col-sm-4">
                    <select id="weapon_power" name="weapon_power" class="form-select">
                        ${[1, 2, 3, 4].map((p) => {
                            return html`<option value="${p}">${p}</option>`;
                        })}
                    </select>
                </div>
                <label class="col-form-label col-sm-2" for="weapon_range">Range</label>
                <div class="col-sm-4">
                    <select id="weapon_range" name="weapon_range" class="form-select">
                        ${Ranges.map((r) => {
                            return html`<option value="${r.id}">${r.label}</option>`;
                        })}
                    </select>
                </div>
            </div>
            <div class="row mb-3">
                <label class="col-form-label col-sm-2" for="weapon_type">Type</label>
                <div class="col-sm-4">
                <select id="weapon_type" name="weapon_type" class="form-select">
                    ${WeaponTypes.map((r) => {
                        return html`<option value="${r.id}">${r.label}</option>`;
                    })}
                </select>
                </div>
                <label class="col-form-label col-sm-2" for="weapon_subtype">Subtype</label>
                <div class="col-sm-4">
                <select id="weapon_subtype" name="weapon_subtype" class="form-select">
                    ${WeaponSubtypes.map((r) => {
                        return html`<option value="${r.id}">${r.label}</option>`;
                    })}
                </select>
                </div>
            </div>
            <div class="row mb-3">
            <div class="form-check col-sm-6 offset-sm-6">
                <input class="form-check-input" type="checkbox" value="1" id="weapon_x">
                <label class="form-check-label" for="weapon_x">Expendable</label>
            </div>
            </div>
        </form>

        <h3>Choose Hardware</h3>

        <ul class="list-group">
            ${getAllHardware().map((hw) => {
        return new HardwareDetails({ hardware: hw, selected: hw.id == this.module.hardware_id, macUuid: this.macUuid, moduleId: this.moduleId });
    })}
        `;
    }
}

if (!window.customElements.get('mac-hardware-list')) {
    window.customElements.define('mac-hardware-list', HardwareList);
}
