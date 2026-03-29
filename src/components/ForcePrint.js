import { html, css } from 'lit';
import AnimalPrint from './AnimalPrint.js';
import CharacterPrint from './CharacterPrint.js';
import RivalPrint from './RivalPrint.js';
import BaseElement from './BaseElement.js';
import { calcGangCost } from '../CostCalculator.js';

export default class GangPrint extends BaseElement {
    static styles = [
        super.styles,
        css`
        .character-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: .5rem;
        }`
    ];

    constructor ({
        gang = null
    }) {
        super();
        this.gang = gang;
    }

    render () {
        return html`<div class="d-flex justify-content-between mb-1">
            <div><strong>Gang Name</strong> ${this.gang.name}</div>
            ${this.gang.rival
        ? ''
        : html`<div><strong>Player Name</strong> ${this.gang.player_name}</div>
            <div><strong>Cost</strong> ${calcGangCost(this.gang)}</div>
            <div><strong>Cache</strong> ${this.gang.cash}</div>`}

        </div>
        <div class="character-list">
        ${this.gang.characters.map((character) => {
        if (character.rival) {
            return new RivalPrint({ character, gang: this.gang });
        }
        return new CharacterPrint({ character, gang: this.gang });
    })}
        <div>
        ${this.gang.animals.map((animal) => new AnimalPrint({ animal, gang: this.gang }))}
        </div>
        `;
    }
}

if (!window.customElements.get('mac-gang-print')) {
    window.customElements.define('mac-gang-print', GangPrint);
}
