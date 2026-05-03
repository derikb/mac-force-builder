import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import AuxUnitPlay from './AuxUnitPlay.js';
import MACPlay from './MACPlay.js';
import MAC from '../models/MAC.js';
import { INITIATIVE_VALUES } from '../data/initiatives.js';

export default class ForcePlay extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            overflow: hidden;
            flex: 1;
            height: 100%;
            max-height: 100%;
        }
        :host > div {
            display: flex;
            flex-direction: column;
            height: 100%;
            max-height: 100%;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
        }
        .header h1 {
            font-size: 1.5rem;
            margin: 0;
            padding: 0;
        }
        .header .suit-select {
            width: auto;
        }
        .header .suit-select.red {
            color: red;
        }
        .header a {
            display: block;
        }

        .tabs {
            padding: 0;
            width: 100%;
            max-width: 100%;
            overflow-x: scroll;
        }
        :host main {
            display: flex;
            overflow: hidden;
            flex: 1;
        }
        :host main > div {
            flex: 1;
            padding: 1rem;
            overflow: auto;
            border-right: 1px solid gray;
            margin-bottom: 1rem;
        }
        :host main > div.active {

        }
        :host main > div:last-child {
            border-right: none;
        }

        .tabs {
            display: none;
        }

        .tabs ul {
            padding: 0 .5rem 0 .5rem;
            margin: 0;
            list-style-type: none;
            border-width: 0 0 2px 0;
            border-color: var(--app-border-color);
            border-style: solid;
            white-space: nowrap;
            min-width: fit-content;
        }
        .tabs li {
            margin: 0;
            padding: 0;
            text-align: center;
            border-style: solid;
            border-color: var(--app-border-color);
            border-width: 1px 4px 0px 1px;
            border-radius: 0;
            background-color: var(--app-tab-color-inactive);
            display: inline-block;
        }
        .tabs li.active {
            background-color: var(--app-tab-color-active);
            border-bottom: 0;
            bottom: 1px;
            transform: translateY(2px);
        }
        .tabs li a {
            text-decoration: none;
            padding: .5rem 1rem;
            display: inline-block;
            width: 100%;
            color: inherit;
        }
        .tabs li.active a {
            color: var(--app-tab-link-color-active);
        }
        .tabs li:last-of-type {
            margin-right: .5rem;
        }

        :host main {
            display: block;
            overflow: auto;
        }

        details > summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: .75rem 1rem;
            cursor: pointer;
            background-color: var(--app-tab-color-inactive);
            border-top: 1px solid var(--app-border-color);
            border-bottom: 1px solid var(--app-border-color);
            font-size: 1rem;
            list-style: none;
        }
        details > summary::-webkit-details-marker {
            display: none;
        }
        details[open] > div {
            overflow: auto;
            padding: 1rem;
        }
        details[open] > summary {
            background-color: var(--app-tab-color-active);
            color: var(--app-tab-link-color-active);
        }

        @media (min-width: 768px) {
            details > summary {
                display: none;
            }
            .tabs {
                display: block;
            }
        }        `
    ];

    constructor ({ force }) {
        super();
        this.setAttribute('role', 'main');
        this.force = force;
        this._macPlays = force.macs.map((mac) => new MACPlay({ mac, force }));
        this.force.aus.forEach((auxunit) => {
            this._macPlays.push(new AuxUnitPlay({ auxunit, force }));
        });
        this.activeTab = force.macs.find(() => true)?.uuid ?? force.aus.find(() => true)?.uuid;

        const initiatives = INITIATIVE_VALUES;
        [...force.macs, ...force.aus].forEach((unit, i) => {
            unit.initiative = initiatives[i] ?? '';
        });
    }

    #onInitiativeChange = () => this.requestUpdate();

    #onCommanderChange = (ev) => {
        const { uuid } = ev.detail;
        this.force.macs.forEach((mac) => {
            if (mac.uuid !== uuid) {
                mac.commander = false;
            }
        });
        this._macPlays.forEach((play) => {
            if (play instanceof MACPlay) {
                play.requestUpdate();
            }
        });
        this.requestUpdate();
    };

    connectedCallback () {
        super.connectedCallback();
        this.addEventListener('mac-initiative-change', this.#onInitiativeChange);
        this.addEventListener('mac-division-change', this.#onInitiativeChange);
        this.addEventListener('mac-destroyed-change', this.#onInitiativeChange);
        this.addEventListener('mac-commander-change', this.#onCommanderChange);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        this.removeEventListener('mac-initiative-change', this.#onInitiativeChange);
        this.removeEventListener('mac-division-change', this.#onInitiativeChange);
        this.removeEventListener('mac-destroyed-change', this.#onInitiativeChange);
        this.removeEventListener('mac-commander-change', this.#onCommanderChange);
    }

    #changeTab (ev) {
        ev.preventDefault();
        const a = ev.currentTarget;
        const col = a.dataset.col || '';
        this.#switchToTab(col);
    }

    #switchToTab (which) {
        this.activeTab = which;
        this.requestUpdate();
    }

    #onSummaryClick (ev) {
        ev.preventDefault();
        const details = ev.currentTarget.closest('details');
        const unitId = details.dataset.unit;
        this.activeTab = this.activeTab === unitId ? null : unitId;
        this.requestUpdate();
    }

    #changeSuit (ev) {
        this.force.suit = ev.target.value;
        this.requestUpdate();
    }

    #suitSymbol () {
        return { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }[this.force.suit] ?? '';
    }

    #getDivisionErrors () {
        const allUnits = [...this.force.macs, ...this.force.aus];
        const totalUnits = allUnits.length;
        const maxPerDivision = Math.floor(totalUnits / 2);

        const errors = [];

        if (this.force.macs.length < 3) {
            errors.push(`Force must have at least 3 MACs (currently ${this.force.macs.length})`);
        }

        if (this.force.aus.length > this.force.macs.length) {
            errors.push(`Too many AuxUnits: maximum 1 per MAC (${this.force.aus.length} AUs for ${this.force.macs.length} MACs)`);
        }

        const byDivision = {};
        for (const unit of allUnits) {
            const d = unit.division;
            if (!d || d === '--') {
                continue;
            }
            if (!byDivision[d]) {
                byDivision[d] = { macs: 0, total: 0 };
            }
            byDivision[d].total++;
            if (unit instanceof MAC) {
                byDivision[d].macs++;
            }
        }

        for (const [div, counts] of Object.entries(byDivision)) {
            if (counts.macs === 0) {
                errors.push(`Division ${div} has no MACs`);
            }
            if (counts.total > maxPerDivision) {
                errors.push(`Division ${div} has too many units (${counts.total} of ${totalUnits} total)`);
            }
        }
        return errors;
    }

    #renderValidation () {
        const errors = this.#getDivisionErrors();
        if (errors.length === 0) {
            return '';
        }
        return html`<div class="alert alert-warning mx-2 py-2" role="alert">
            <ul class="mb-0 ps-3">
                ${errors.map((e) => html`<li>${e}</li>`)}
            </ul>
        </div>`;
    }

    #renderTabTitle(unit) {
        const symbol = this.#suitSymbol();
        const isRed = ['hearts', 'diamonds'].includes(this.force.suit);
        const card = unit.initiative ? html`<span class="me-2" style="color:${isRed ? 'red' : 'inherit'}">${symbol}${unit.initiative}</span>` : '';
        const division = unit.division ? html`<strong class="ms-2">${unit.division}</strong> ` : '';
        const commander = unit.commander ? '*' : '';
        const content = html`<span>${card}${unit.name}${commander}</span>${division}`;
        return unit.destroyed ? html`<s>${content}</s>` : content;
    }

    render () {
        const units = [...this.force.macs, ...this.force.aus];
        return html`<div>
        <div class="header">
        <h1>${this.force.name}</h1>
        <select class="form-select form-select-sm suit-select ${['hearts', 'diamonds'].includes(this.force.suit) ? 'red' : ''}" aria-label="Choose initiative card suit" @change=${this.#changeSuit} autocomplete="off">
            <option value="" ?selected=${!this.force.suit}>Init.</option>
            <option value="spades" ?selected=${this.force.suit === 'spades'}>♠</option>
            <option value="hearts" ?selected=${this.force.suit === 'hearts'}>♥</option>
            <option value="diamonds" ?selected=${this.force.suit === 'diamonds'}>♦</option>
            <option value="clubs" ?selected=${this.force.suit === 'clubs'}>♣   </option>
        </select>
        <a href="/index.html">Back</a>
        </div>
        ${this.#renderValidation()}
        <div class="tabs">
            <ul>
                ${this.force.macs.map((mac) => {
                    return html`<li class="${this.activeTab == mac.uuid ? 'active' : ''}"><a href="#" data-col=${mac.uuid} @click=${this.#changeTab}>${this.#renderTabTitle(mac)}</a></li>`;
                })}${this.force.aus.map((au) => {
                    return html`<li class="${this.activeTab == au.uuid ? 'active' : ''}"><a href="#" data-col="${au.uuid}" @click=${this.#changeTab}>${this.#renderTabTitle(au)}</a></li>`;
                })}
            </ul>
        </div>
    <main>
    ${this._macPlays.map((el, i) => {
        const unit = units[i];
        const isActive = this.activeTab == el.id;
        return html`<details id="col-${el.id}" data-unit=${el.id} ?open=${isActive}>
            <summary @click=${this.#onSummaryClick}>${this.#renderTabTitle(unit)}</summary>
            <div>${el}</div>
        </details>`;
    })}
    </main>
    </div>`;
    }
}

if (!window.customElements.get('mac-play-page')) {
    window.customElements.define('mac-play-page', ForcePlay);
}
