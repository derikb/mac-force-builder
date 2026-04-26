import { html, css } from 'lit';
import { emitter, validateAuxUnit } from '../services/ForceService.js';
import HardwareList from './HardwareList.js';
import WeaponAUPane from './WeaponAUPane.js';
import { calcAuxUnitCost } from '../CostCalculator.js';
import BaseElement from './BaseElement.js';
import { getName } from '../services/NameService.js';
import AuxUnitTypes from '../data/AuxUnitTypes.js';
import { getHardwareName } from '../services/HardwareService.js';

export default class AuxUnitEdit extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host > div {
            container-type: inline-size;
        }
        .col-form-label {
            width: 34%;
        }
        .col-form-input {
            width: 66%;
        }
        .col-form-input:has(.input-group) {
            width: 100%;
        }
        .col-form-input + .col-form-label,
        .col-form-input + .col-form-label + .col-form-input {
            margin-top: 1rem;
        }
        .module-name {
            flex: 1 1 auto;
        }

        @container (width > 375px) {
            .col-form-label {
                width: 16.667%;
            }
            .col-form-input {
                width: 33.333%;
            }
            .col-form-input:has(.input-group) {
                width: 75%;
            }
            .col-form-input + .col-form-label,
            .col-form-input + .col-form-label + .col-form-input {

                margin-top: 0;
            }
        }
        `
    ];

    /** @prop {AuxUnit} */
    auxunit = null;
    constructor ({
        auxunit,
        force
    }) {
        super();
        this.auxunit = auxunit;
        this.force = force;

        this.dataset.uuid = this.auxunit.uuid;

        this.weaponHandler = this.#handleWeaponUpdate.bind(this);
        this.hardwareHandler = this.#handleHardwareUpdate.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();
        emitter.on('auxunit:hardware:update', this.hardwareHandler);
        emitter.on('auxunit:weapon:update', this.weaponHandler);
        emitter.on('force:edit', () => {
            this.requestUpdate();
        });
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('auxunit:hardware:update', this.hardwareHandler);
        emitter.off('auxunit:weapon:update', this.weaponHandler);
    }

    #triggerAuxUnitUpdate () {
        emitter.trigger('auxunit:update', { uuid: this.auxunit.uuid });
    }

    #handleWeaponUpdate ({ auUuid, moduleId, weapon }) {
        if (auUuid !== this.auxunit.uuid) {
            return;
        }
        this.auxunit.weapons[moduleId] = weapon;
        this.requestUpdate();
        this.#triggerAuxUnitUpdate();
    }

    #handleHardwareUpdate ({ auUuid, moduleId, hardware = null }) {
        if (auUuid !== this.auxunit.uuid) {
            return;
        }
        this.auxunit.hardware[moduleId] = hardware?.id ?? null;
        this.requestUpdate();
        this.#triggerAuxUnitUpdate();
    }

    saveName (ev) {
        this.auxunit.name = ev.target.value;
        this.#triggerAuxUnitUpdate();
    }

    saveType (ev) {
        this.auxunit.type = ev.target.value;
        // reset units since it could now be invalid
        this.auxunit.units = 1;
        this.requestUpdate();
        this.#triggerAuxUnitUpdate();
    }

    #saveUnits (ev) {
        this.auxunit.units = Number(ev.target.value);
        this.requestUpdate();
        this.#triggerAuxUnitUpdate();
    }

    close () {
        document.querySelector('mac-force-page')?.clearColumns(true, true);
    }

    showWeapon (ev) {
        ev.preventDefault();
        const moduleId = Number(ev.target.dataset.wid ?? 0);
        document.querySelector('mac-force-page')?.fillColumn(
            new WeaponAUPane({ auxunit: this.auxunit, moduleId }),
            3,
            'Weapon'
        );
    }

    showHardware (ev) {
        ev.preventDefault();
        const moduleId = Number(ev.target.dataset.hid ?? 0);
        if (moduleId < 0) {
            return;
        }
        document.querySelector('mac-force-page')?.fillColumn(
            new HardwareList({ auxunit: this.auxunit, moduleId }),
            3,
            'Hardware'
        );
    }

    #createName () {
        this.auxunit.name = getName(this.auxunit.type);
        this.requestUpdate();
        this.#triggerAuxUnitUpdate();
    }

    #getTypeOptions () {
        const options = AuxUnitTypes.map(({ id, label }) => {
            return html`<option value="${id}" ?selected=${this.auxunit.type == id}>${label}</option>`;
        });
        return options;
    }

    #getUnitOptions() {
        const type = AuxUnitTypes.find((t) => t.id === this.auxunit.type);
        const options = [];
        for (let i = 1; i <= type.maxunits; i++) {
            options.push(html`<option value="${i}" ?selected=${this.auxunit.units == i}>${i}</option>`);
        }
        return options;
    }

    #getErrors() {
        const errors = validateAuxUnit(this.auxunit);
        if (errors.length === 0) { return ''; }
        return html`<ul class="alert alert-danger mb-3">
            ${errors.map((e) => html`<li>${e}</li>`)}
        </ul>`;
    }

    #getWeaponFields() {
        const weapons = this.auxunit.weapons;
        return [0, 1].map((id) => {
            const weapon = weapons[id];
            return html`<li>
            <div class="input-group">
                <span class="input-group-text">${id + 1}</span>
                <span class="input-group-text module-name">${weapon?.label ?? '[Empty]'}</span>
                <button type="button" class="btn btn-secondary" data-wid="${id}" @click=${this.showWeapon}>Edit</button>
            </div>
            </li>`;
        });
    }

    #hardWareInput(id = 0, hardware = 0) {
        const name = getHardwareName(hardware);
        return html`<li>
        <div class="input-group">
            <span class="input-group-text module-name">${name ?? '[Empty]'}</span>
            <button type="button" class="btn btn-secondary" data-hid="${id}" @click=${this.showHardware}>Edit</button>
        </div>
        </li>`;
    }

    #getHardwareFields() {
        const hardware = this.auxunit.hardware;
        if (hardware.length == 0) {
            hardware.push(null);
        }
        return html`${hardware.map((h, id) => {
            return this.#hardWareInput(id, h);
        })}`;
    }

    #addHardware() {
        this.auxunit.hardware.push(null);
        this.requestUpdate();
        this.#triggerAuxUnitUpdate();
    }

    render () {
        return html`<div>
        <div class="row mb-3 align-items-center">
            <label for="auname" class="col-sm-3 col-form-label">Name</label>
            <div class="col-form-input col-sm-9">
                <div class="input-group">
                    <input type="text" id="auname" name="auname" class="form-control" value="${this.auxunit.name}" @blur=${this.saveName} autocomplete="off" />
                    <button type="button" class="btn btn-secondary btn-sm" @click=${this.#createName}>Generate Name</button>
                </div>
            </div>
        </div>

        <div class="row mb-3 align-items-center">
            <label for="autype" class="col-sm-3 col-form-label">Type</label>
            <div class="col-form-input col-sm-8">
                <select id="autype" class="form-select" @change=${this.saveType} autocomplete="off">
                    ${this.#getTypeOptions()}
                </select>
            </div>
        </div>
        <div class="row mb-3 align-items-center">
            <label for="auunits" class="col-sm-3 col-form-label"># Units</label>
            <div class="col-form-input col-sm-3">
                <select id="auunits" class="form-select" @change=${this.#saveUnits} autocomplete="off">
                    ${this.#getUnitOptions()}
                </select>
            </div>

            <div class="col-form-label col-sm-3"><strong>Points</strong>
            </div>
            <div class="col-form-input">
                ${calcAuxUnitCost(this.auxunit, this.force)}
            </div>
        </div>

        ${this.#getErrors()}
        <div class="mb-4">
            <h3>Weapons</h3>
            <ol class="list-unstyled">
                ${this.#getWeaponFields()}
            </ol>
        </div>

        <div class="mb-4">
            <h3>Hardware</h3>
            <ol class="list-unstyled hardware-list">
                ${this.#getHardwareFields()}
            </ol>
            <button type="button" class="btn btn-secondary" @click=${this.#addHardware}>Add Hardware</button>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>`;
    }
}

if (!window.customElements.get('mac-au-edit')) {
    window.customElements.define('mac-au-edit', AuxUnitEdit);
}
