import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { getWeapon } from '../services/WeaponService.js';

export default class MACPrint extends BaseElement {
    static styles = [
        css`
        :host {
            border: 2px solid black;
            padding: 1rem;
        }
        .grid-col-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: .5rem;
        }
    dl {
        margin:0;
        padding: 0;
    }
    dl.attributes {
        display: grid;
        grid-template-columns: 1fr 1fr 4fr;
        gap: .5rem;
        align-items: top;
    }
    dl.attributes dt {
        font-weight: bold;
    }
    dl.attributes dd {
        margin: 0;
        grid-column: 2 / span 2
    }
    #attr-luck, #attr-handed {
        grid-column: 2;
    }
    #attr-luck-check {
        grid-column: 3;
        grid-row: span 2;

    }


    input[type="checkbox"] {
        margin-inline: 1px;
    }

    table.weapons {
        border: 1px solid black;
        border-collapse: collapse;
        width: 100%;
        text-align: left;
        margin-bottom: .5rem;
    }
    table.weapons th, table.weapons td{
        border: 1px solid black;
        padding: 0 .25rem;
    }

    h3 {
        font-size: 1rem;
        margin: 0;
        padding: 0;
        margin-bottom: .5rem;
    }
    ul, ol { margin: 0; padding: 0; }
    li { margin: 0; padding: 0; margin-left: 1rem;}

    .fill-in-box {
        display: inline-block;
        height: 1.5rem;
        width: 1.5rem;
        border: 1px solid black;
        text-align: center;
    }

    .small { font-size: .8rem; }

    .hit-locations {
        display: grid;
        grid-template-columns: 1fr 1fr 5fr;
        gap: .5rem;
        align-items: center;
    }
    .location {
        white-space: nowrap;
    }

    .equipment-list:has(ul:empty) h3 {
        display: none;
    }
    `
    ];

    /** @prop {MAC} */
    mac = null;
    constructor ({
        mac,
        force
    }) {
        super();
        this.mac = mac;
        this.force = force;
    }

    #weaponList (weaponId) {
        const weapon = getWeapon(weaponId);
        return html`<tr>
        <td>${weapon.name}</td>
        <td>${weapon.fullRange}</td>
        <td>${weapon.damage}</td>
        <td>${weapon.ammo}</td>
        <td>${weapon.tags.join('; ')}</td>
        </tr>`;
    }

    render () {
        return html`<div class="grid-col-2">
            <div>
                <table class="weapons">
                    <thead>
                        <tr>
                        <th>Weapon</th><th>Range</th><th>Dam.</th><th>Ammo</th><th>Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${this.mac.weapons.map((id) => this.#weaponList(id))}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }
}

if (!window.customElements.get('mac-mac-print')) {
    window.customElements.define('mac-mac-print', MACPrint);
}
