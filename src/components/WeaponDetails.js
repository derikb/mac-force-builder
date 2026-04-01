import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';
import Ranges from '../data/Ranges.js';
import WeaponTypes from '../data/WeaponTypes.js';
import WeaponSubtypes from '../data/WeaponSubtypes.js';
import Weapon from '../models/Weapon.js';

export default class WeaponDetails extends BaseElement {
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
        mac,
        moduleId,
        selected = false,
    }) {
        super();
        this.mac = mac;
        this.moduleId = moduleId;
        const module = this.mac.getModule(moduleId);
        this.weapon = module.weapon ?? new Weapon({});
        this.selected = selected;
        if (this.selected) {
            this.setAttribute('selected', 'true');
        }
    }

    handleSelect (ev) {
        ev.preventDefault();
        const data = new FormData(ev.target);
        this.weapon.fromForm(data);
        emitter.trigger('mac:module:update', { weapon: this.weapon, macUuid: this.mac.uuid, moduleId: this.moduleId });
    }

    #calcWeaponPowerOptions() {
        const mClass = this.mac.mClass;
        const maxPower = this.moduleId === 1
            ? mClass + 1
            : mClass;
        return Array.from({ length: maxPower }, (_, i) => i + 1);
    }

    render () {
        return html`<li class="list-group-item">
            <h4>Weapon</h4>
            <form @submit=${this.handleSelect}>
                <div class="row mb-3">
                    <label class="col-form-label col-sm-3" for="weapon_name">Name</label>
                    <div class="col-sm-9">
                        <input type="text" id="weapon_name" class="form-control" name="weapon_name" value="${this.weapon.name}" />
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-form-label col-sm-2" for="weapon_power">Power</label>
                    <div class="col-sm-4">
                        <select id="weapon_power" name="weapon_power" class="form-select">
                            ${this.#calcWeaponPowerOptions().map((p) => {
                                return html`<option value="${p}" ?selected=${this.weapon.power == p}>${p}</option>`;
                            })}
                        </select>
                    </div>
                    <label class="col-form-label col-sm-2" for="weapon_range">Range</label>
                    <div class="col-sm-4">
                        <select id="weapon_range" name="weapon_range" class="form-select">
                            ${Ranges.map((r) => {
                                return html`<option value="${r.id}" ?selected=${this.weapon.range == r.id}>${r.label}</option>`;
                            })}
                        </select>
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-form-label col-sm-2" for="weapon_type">Type</label>
                    <div class="col-sm-4">
                    <select id="weapon_type" name="weapon_type" class="form-select">
                        ${WeaponTypes.map((r) => {
                            return html`<option value="${r.id}" ?selected=${this.weapon.type == r.id}>${r.label}</option>`;
                        })}
                    </select>
                    </div>
                    <label class="col-form-label col-sm-2" for="weapon_subtype">Subtype</label>
                    <div class="col-sm-4">
                    <select id="weapon_subtype" name="weapon_subtype" class="form-select">
                        ${WeaponSubtypes.map((r) => {
                            return html`<option value="${r.id}" ?selected=${this.weapon.subtype == r.id}>${r.label}</option>`;
                        })}
                    </select>
                    </div>
                </div>
                <div class="row mb-3">
                <div class="col-sm-6">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" id="weapon_brawl" name="weapon_brawl" ?checked=${this.weapon.brawl}>
                        <label class="form-check-label" for="weapon_brawl">Brawl</label>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" id="weapon_x" name="weapon_x" ?checked=${this.weapon.expendable}>
                        <label class="form-check-label" for="weapon_x">Expendable</label>
                    </div>
                </div>
                </div>
                <button type="submit" class="btn btn-primary">Choose Weapon</button>
            </form>
        </li>`;
    }
}

if (!window.customElements.get('mac-weapon-details')) {
    window.customElements.define('mac-weapon-details', WeaponDetails);
}
