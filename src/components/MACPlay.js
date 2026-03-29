import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { getWeapon } from '../services/WeaponService.js';

export default class MACPlay extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            padding: 0;
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
        grid-template-columns: 1fr 1fr;
        gap: .5rem;
        align-items: center;
    }
    dl.attributes dt {
        font-weight: bold;
    }
    dl.attributes dd {
        margin: 0;
    }
    #attr-luck-check, dl.attributes hr {
        grid-column: span 2;
    }
    dl.attributes hr {
        margin: 0.25rem 0;
    }

    input[type="checkbox"] {
        font-size: 2rem;
        height: 2rem;
        width: 2rem;
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
        height: 2rem;
        width: 2rem;
        border: 1px solid black;
        text-align: center;
        font-size: 1.5rem;
        line-height: 2rem;
        border-radius: 1rem;
    }

    input[type="number"] {
        width: 100%;
        height: 2rem;
        font-size: 1.5rem;
        border: 1px solid black;
        text-align: center;
        border-radius: 5px;
        max-width: 10rem;
    }

    .small { font-size: .8rem; }

    .hit-locations {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .25rem;
        align-items: center;
    }
    .location {
        white-space: nowrap;
    }
    .location strong {
        font-size: 1.25rem;
    }
    .hit-locations .small {
        grid-column: span 2;
        padding-left: .25rem;
        text-align: right;
    }
    .hit-locations .small.highlight {
        color: red;
    }
    .hit-locations .wounds {
        text-align: right;
    }

    .equipment-list:has(ul:empty) h3 {
        display: none;
    }

    .boxes-checks {
        gap: 1rem;
        flex-wrap: wrap;
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
        <td>${weapon.tags.join('; ')}</td>
        </tr>`;
    }

    render () {
        return html`<div class="grid-col-2">
                <div>
                ${this._attributeList()}
                </div>
            </div>
            <div>
                <table class="weapons">
                    <thead>
                        <tr>
                        <th>Weapon</th><th>Range</th><th>Dam.</th><th>Tags</th>
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

if (!window.customElements.get('mac-mac-play')) {
    window.customElements.define('mac-mac-play', MACPlay);
}
