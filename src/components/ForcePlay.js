import { html, css } from 'lit';
// import AuxUnitPlay from './AuxUnitPlay.js';
import BaseElement from './BaseElement.js';
import MACPlay from './MACPlay.js';

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

        ul {
            padding: 0 .5rem 0 .5rem;
            margin: 0;
            list-style-type: none;
            border-width: 0 0 1px 0;
            border-color: black;
            border-style: solid;
            white-space: nowrap;
        }
        li {
            margin: 0;
            padding: 0;
            text-align: center;
            border: 1px solid grey;
            border-width: 1px 1px 0px 1px;
            border-radius: .5rem .5rem 0 0;
            background-color: #eee;
            display: inline-block;
        }
        li.active {
            background-color: white;
            border-bottom: 0;
            bottom: 1px;
            transform: translateY(1px);
        }
        li a {
            text-decoration: none;
            padding: .5rem 1rem;
            display: inline-block;
            width: 100%;
            color: inherit;
        }
        li.active a {
            color: black;
        }
        li:last-of-type {
            margin-right: .5rem;
        }

            :host main {
                display: block;
                overflow: auto;
            }
            :host main > div {
                border: none;
                width: 100%;
                background-color: white;
                display: none;
            }
            :host main > div.active {
                display: block;
            }

        `
    ];

    constructor ({ force }) {
        super();
        this.setAttribute('role', 'main');
        this.force = force;
    }

    connectedCallback () {
        super.connectedCallback();
    }

    disconnectedCallback () {
        super.disconnectedCallback();
    }

    #changeTab (ev) {
        ev.preventDefault();
        const a = ev.currentTarget;
        const col = a.dataset.col || 1;
        this.#switchToTab(col);
    }

    #switchToTab (which) {
        const column = this.renderRoot.querySelector(`#col-${which}`);
        if (!column) {
            return;
        }
        if (column.innerHTML === '') {
            return;
        }
        this.renderRoot.querySelectorAll('li').forEach((el) => el.classList.remove('active'));
        this.renderRoot.querySelector(`li:has(a[data-col="${which}"])`)?.classList.add('active');

        this.renderRoot.querySelectorAll('main > div').forEach((el) => el.classList.remove('active'));
        column.classList.add('active');
    }

    #changeSuit (ev) {
        this.force.suit = ev.target.value;
        this.requestUpdate();
    }

    #renderMAC(mac) {
        return new MACPlay({ mac, force: this.force });
    }

    #renderAuxUnit(auxunit) {
        // return new AuxUnitPlay({ auxunit, force: this.force });
    }

    render () {
        return html`<div>
        <div class="header">
        <h1>${this.force.name}</h1>
        <select class="form-select form-select-sm suit-select ${['hearts', 'diamonds'].includes(this.force.suit) ? 'red' : ''}" aria-label="Choose initiative card suit" @change=${this.#changeSuit}>
            <option value="" ?selected=${!this.force.suit}>Initiative suit</option>
            <option value="spades" ?selected=${this.force.suit === 'spades'}>♠</option>
            <option value="hearts" ?selected=${this.force.suit === 'hearts'}>♥</option>
            <option value="diamonds" ?selected=${this.force.suit === 'diamonds'}>♦</option>
            <option value="clubs" ?selected=${this.force.suit === 'clubs'}>♣   </option>
        </select>
        <a href="/index.html">Back</a>
        </div>
        <div class="tabs">
            <ul>
                ${this.force.macs.map((mac, i) => {
        return html`<li class="${i === 0 ? 'active' : ''}"><a href="#" data-col=${i} @click=${this.#changeTab}>${mac.getPlayLabel()}</a></li>`;
    })}
                ${this.force.aus.map((au, i) => {
        return html`<li class=""><a href="#" data-col="a${i}" @click=${this.#changeTab}>${au.name}</a></li>`;
    })}
            </ul>
        </div>
    <main>
    ${this.force.macs.map((mac, i) => {
        return html`<div id="col-${i}" class="${i === 0 ? 'active' : ''}">${this.#renderMAC(mac)}</div>`;
    })}
    ${this.force.aus.map((au, i) => {
        return html`<div id="col-a${i}" class="">${this.#renderAuxUnit(au)}</div>`;
    })}
    </main>
    </div>`;
    }
}

if (!window.customElements.get('mac-play-page')) {
    window.customElements.define('mac-play-page', ForcePlay);
}
