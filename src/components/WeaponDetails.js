import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';

export default class WeaponDetails extends BaseElement {
    static styles = [
        super.styles,
        css`
    :host li {
        transition: background-color .25s linear;
    }
    :host li.clicked {
        background-color: goldenrod;
    }
    `
    ];

    constructor ({
        weapon,
        charId = 0
    }) {
        super();
        this.weapon = weapon;
        this.charId = charId;
    }

    handleSelect (ev) {
        const li = ev.target.closest('li');
        if (li.classList.contains('clicked')) {
            return;
        }
        li.classList.add('clicked');
        emitter.trigger('mac:weapon:add', { weaponId: this.weapon.id, charId: this.charId });
        setTimeout(() => {
            li.classList.remove('clicked');
        }, 500);
    }

    render () {
        return html`<li class="list-group-item" @click=${this.handleSelect}>
            <h4>${this.weapon.name}</h4>
            <div>Cost: $${this.weapon.cost}</div>
            <dl class="attributes">
                <dt>Range</dt>
                <dd>${this.weapon.range === '' ? '-' : this.weapon.range}</dd>
                <dt>Damage</dt>
                <dd>${this.weapon.damage}</dd>
                <dt>Ammo</dt>
                <dd>${this.weapon.ammo}</dd>
            </dl>
            <div><strong>Tags:</strong> ${this.weapon.tags.join('; ')}</dov>
        </li>`;
    }
}

if (!window.customElements.get('mac-weapon-details')) {
    window.customElements.define('mac-weapon-details', WeaponDetails);
}
