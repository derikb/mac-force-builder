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

    .form-check {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    `
    ];

    static properties = {
        selected: { type: Boolean },
        _isBrawl: { type: Boolean, state: true },
    };

    constructor ({
        mac = null,
        auxunit = null,
        moduleId = 0,
        selected = false,
    }) {
        super();
        this.mac = mac;
        this.auxunit = auxunit;
        this.moduleId = moduleId;
        if (this.mac) {
            const module = this.mac.getModule(moduleId);
            this.weapon = module.weapon ?? new Weapon({});
        }
        if (this.auxunit) {
            this.weapon = this.auxunit.weapons[this.moduleId] ?? new Weapon({});
        }
        this.selected = selected;
        this._isBrawl = this.weapon.brawl;
        if (this.selected) {
            this.setAttribute('selected', 'true');
        }
    }

    handleSelect (ev) {
        ev.preventDefault();
        const data = new FormData(ev.target);
        this.weapon.fromForm(data);
        if (this.weapon.brawl) {
            this.weapon.power = 2;
            const existingBrawl = this.#getExistingBrawlWeapon();
            if (existingBrawl) {
                this.weapon.name = existingBrawl.name;
                this.weapon.type = existingBrawl.type;
                this.weapon.subtype = existingBrawl.subtype;
                this.weapon.expendable = existingBrawl.expendable;
            }
        }
        if (this.mac) {
            emitter.trigger('mac:module:update', { weapon: this.weapon, macUuid: this.mac.uuid, moduleId: this.moduleId });
        }
        if (this.auxunit) {
            emitter.trigger('auxunit:weapon:update', { weapon: this.weapon, auUuid: this.auxunit.uuid, moduleId: this.moduleId });
        }
    }

    handleBrawlChange (ev) {
        this._isBrawl = ev.target.checked;
    }

    #countOtherBrawlWeapons() {
        if (this.auxunit) {
            return this.auxunit.weapons.filter((weapon, id) => id !== this.moduleId && weapon?.brawl).length;
        }
        return this.mac.modules.filter((m) => m.id !== this.moduleId && m.weapon?.brawl).length;
    }

    #getExistingBrawlWeapon() {
        if (this.auxunit) {
            return this.auxunit.weapons.find((weapon, id) => id !== this.moduleId && weapon?.brawl) ?? null;
        }
        return this.mac.modules.find((m) => m.id !== this.moduleId && m.weapon?.brawl)?.weapon ?? null;
    }

    #calcWeaponPowerOptions() {
        let maxPower = 0;
        if (this.mac) {
            const mClass = this.mac.mClass;
            maxPower = this.moduleId === 1
                ? mClass + 1
                : mClass;
        }
        if (this.auxunit) {
            maxPower = this.auxunit.type === 'I'
                ? 1
                : 2;
        }
        return Array.from({ length: maxPower }, (_, i) => i + 1);
    }

    render () {
        const brawlLimitReached = this.#countOtherBrawlWeapons() >= 2 && !this._isBrawl;
        const existingBrawl = this._isBrawl ? this.#getExistingBrawlWeapon() : null;
        return html`<li class="list-group-item">
            <h4>Weapon</h4>
            <form @submit=${this.handleSelect}>
                <div class="row mb-3">
                    <label class="col-form-label col-sm-3" for="weapon_name">Name</label>
                    <div class="col-sm-9">
                        <input type="text" id="weapon_name" class="form-control" name="weapon_name"
                            .value=${existingBrawl ? existingBrawl.name : this.weapon.name}
                            ?readonly=${!!existingBrawl} />
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-form-label col-sm-2" for="weapon_power">Power</label>
                    <div class="col-sm-4">
                        <select id="weapon_power" name="weapon_power" class="form-select" ?disabled=${this._isBrawl}>
                            ${this._isBrawl
                                    ? html`<option value="2" selected>2</option>`
                                    : this.#calcWeaponPowerOptions().map((p) => {
                                        return html`<option value="${p}" ?selected=${this.weapon.power == p}>${p}</option>`;
                                    })
                            }
                        </select>
                    </div>
                    <label class="col-form-label col-sm-2" for="weapon_range">Range</label>
                    <div class="col-sm-4">
                        <select id="weapon_range" name="weapon_range" class="form-select" ?disabled=${this._isBrawl}>
                            ${Ranges.map((r) => {
                                return html`<option value="${r.id}" ?selected=${this.weapon.range == r.id}>${r.label}</option>`;
                            })}
                        </select>
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-form-label col-sm-2" for="weapon_type">Type</label>
                    <div class="col-sm-4">
                    <select id="weapon_type" name="weapon_type" class="form-select" ?disabled=${!!existingBrawl}>
                        ${WeaponTypes.map((r) => {
                            const selected = existingBrawl ? r.id === existingBrawl.type : this.weapon.type == r.id;
                            return html`<option value="${r.id}" ?selected=${selected}>${r.label}</option>`;
                        })}
                    </select>
                    </div>
                    <label class="col-form-label col-sm-2" for="weapon_subtype">Subtype</label>
                    <div class="col-sm-4">
                    <select id="weapon_subtype" name="weapon_subtype" class="form-select" ?disabled=${!!existingBrawl}>
                        ${WeaponSubtypes.map((r) => {
                            const selected = existingBrawl ? r.id === existingBrawl.subtype : this.weapon.subtype == r.id;
                            return html`<option value="${r.id}" ?selected=${selected}>${r.label}</option>`;
                        })}
                    </select>
                    </div>
                </div>
                <div class="row mb-3">
                <div class="col-sm-6">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" id="weapon_brawl" name="weapon_brawl"
                            ?checked=${this._isBrawl}
                            ?disabled=${brawlLimitReached}
                            @change=${this.handleBrawlChange}>
                        <label class="form-check-label" for="weapon_brawl">Brawl${brawlLimitReached ? ' (limit reached)' : ''}</label>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" id="weapon_x" name="weapon_x"
                            ?checked=${existingBrawl ? existingBrawl.expendable : this.weapon.expendable}
                            ?disabled=${!!existingBrawl}>
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
