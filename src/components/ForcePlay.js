import { html, css } from 'lit';
import AnimalPlay from './AnimalPlay.js';
import BaseElement from './BaseElement.js';
import CharacterPlay from './CharacterPlay.js';
import RivalPlay from './RivalPlay.js';

export default class GangPlay extends BaseElement {
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

    constructor ({ gang }) {
        super();
        this.setAttribute('role', 'main');
        this.gang = gang;
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

    #renderCharacter(character) {
        if (character.rival) {
            return new RivalPlay({ character, gang: this.gang });
        }
        return new CharacterPlay({ character, gang: this.gang });
    }

    #renderAnimal(animal) {
        return new AnimalPlay({ animal, gang: this.gang });
    }

    render () {
        return html`<div>
        <div class="header">
        <h1>${this.gang.name}</h1>
        <a href="/index.html">Back</a>
        </div>
        <div class="tabs">
            <ul>
                ${this.gang.characters.map((char, i) => {
        return html`<li class="${i === 0 ? 'active' : ''}"><a href="#" data-col=${i} @click=${this.#changeTab}>${char.name}</a></li>`;
    })}
                ${this.gang.animals.map((char, i) => {
        return html`<li class=""><a href="#" data-col="a${i}" @click=${this.#changeTab}>${char.name}</a></li>`;
    })}
            </ul>
        </div>
    <main>
    ${this.gang.characters.map((char, i) => {
        return html`<div id="col-${i}" class="${i === 0 ? 'active' : ''}">${this.#renderCharacter(char)}</div>`;
    })}
    ${this.gang.animals.map((char, i) => {
        return html`<div id="col-a${i}" class="">${this.#renderAnimal(char)}</div>`;
    })}
    </main>
    </div>`;
    }
}

if (!window.customElements.get('mac-play-page')) {
    window.customElements.define('mac-play-page', GangPlay);
}
