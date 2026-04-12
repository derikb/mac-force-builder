import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { emitter, getForce } from '../services/ForceService.js';
import Force from '../models/Force';
import ForceEdit from './ForceEdit.js';
import ForceExport from './ForceExport.js';
import ForceImport from './ForceImport.js';

export default class ForcePage extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            overflow: hidden;
            flex: 1;
            height: 100%;
            max-height: 100%;
            font-family: var(--bs-font-monospace);
        }
        :host > div {
            display: flex;
            flex-direction: column;
            height: 100%;
            max-height: 100%;
        }
        :host > div > div {
            flex: 0;
            padding: 0;
            width: 100%;
            max-width: 100%;
        }
        :host main {
            display: flex;
            overflow: hidden;
            flex: 1;
        }
        :host main > div {
            flex: 1;
            padding: 1rem 2rem;
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
            display: grid;
            gap: .5rem;
            grid-template-columns: repeat(3, 1fr);
            list-style-type: none;
            border-width: 0 0 2px 0;
            border-color: black;
            border-style: solid;
        }
        li {
            margin: 0;
            padding: 0;
            text-align: center;
            border-style: solid;
            border-color: var(--app-border-color);
            border-width: 1px 4px 0px 1px;
            border-radius: 0;
            background-color: #eee;
            display: flex;
        }
        li.active {
            background-color: white;
            border-bottom: 0;
            bottom: 1px;
            transform: translateY(2px);
        }
        li a {
            text-decoration: none;
            padding: .5rem 1rem;
            display: inline-block;
            width: 100%;
            color: inherit;
        }
        li > a + a {
            flex: 0 10 auto;
            border-inline-start: 4px solid black;
            border-color: inherit;
        }
        li.active a {
            color: black;
        }

        /* Empty columns cause tabs to be invisible */
        div:has(#col-2:empty) li:has(a[data-col="2"]) {
            background-color: transparent;
            border-color: transparent;
            color: transparent;
            pointer-events: none;
        }
        div:has(#col-3:empty) li:has(a[data-col="3"]) {
            background-color: transparent;
            border-color: transparent;
            color: transparent;
            pointer-events: none;
        }

        /** Hide the force list when the edit form is showing */
        main:has(mac-force-edit) mac-force-list {
            display: none;
        }

        @media(width <= 1000px) {
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
        }
        `
    ];

    constructor () {
        super();
        this.setAttribute('role', 'main');

        this.showCreateHandler = this.#showCreate.bind(this);
        this.showImportHandler = this.#showImport.bind(this);
        this.showExportHandler = this.#showExport.bind(this);
        this.forceSaveHandler = this.#handleForceSave.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();

        emitter.on('force:show:edit', this.showCreateHandler);
        emitter.on('force:show:import', this.showImportHandler);
        emitter.on('force:show:export', this.showExportHandler);
        emitter.on('force:edit', this.forceSaveHandler);
        emitter.on('force:remove', () => {
            this.clearColumns();
        });
        emitter.on('mac:remove', ({ uuid }) => {
            this.#removeMAC(uuid);
        });
        emitter.on('aux:remove', ({ uuid }) => {
            this.#removeAuxUnit(uuid);
        });
    }

    disconnectedCallback () {
        super.disconnectedCallback();

        emitter.off('force:show:edit', this.showCreateHandler);
        emitter.off('force:show:import', this.showImportHandler);
        emitter.off('force:show:export', this.showExportHandler);
        emitter.off('force:edit', this.forceSaveHandler);
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

    #closeTab(ev) {
        ev.preventDefault();
        const a = ev.currentTarget;
        const col = Number(a.dataset.col || 1);
        if (col === 2) {
            this.clearColumns(true, true);
        }
        if (col === 3) {
            this.clearColumns(false, true);
        }
    }

    clearColumns (col2 = true, col3 = true) {
        if (col3) {
            this.renderRoot.querySelector('#col-3').innerHTML = '';
        }
        if (col2) {
            this.renderRoot.querySelector('#col-2').innerHTML = '';
        }
        if (col2 && col3) {
            this.#switchToTab(1);
            return;
        }
        this.#switchToTab(2);
    }

    fillColumn (el, which = 2, title = '') {
        this.clearColumns(which === 2, which === 3);
        this.renderRoot.querySelector(`#col-${which}`)?.append(el);
        this.renderRoot.querySelector(`a[data-col="${which}"]`).innerText = title;
        this.#switchToTab(which);
    }

    clearFirstColumn () {
        this.renderRoot.querySelector('#col-1 > div').innerHTML = '';
    }

    fillFirstColumn (el) {
        this.renderRoot.querySelector('#col-1 > div').append(el);
    }

    #showCreate ({ uuid = '' }) {
        this.clearColumns(true, true);
        this.clearFirstColumn();
        let force;
        if (uuid === '') {
            force = new Force({});
        } else {
            force = getForce(uuid);
            if (!force) {
                return;
            }
        }
        const form = new ForceEdit({ force });
        this.fillFirstColumn(form);
    }

    #showImport () {
        this.clearColumns(true, true);
        this.clearFirstColumn();
        const form = new ForceImport({});
        this.fillFirstColumn(form);
    }

    #showExport () {
        this.clearColumns(true, true);
        this.clearFirstColumn();
        const form = new ForceExport({});
        this.fillFirstColumn(form);
    }

    #handleForceSave () {
        this.clearColumns(true, true);
    }

    #removeMAC (uuid) {
        const mac = this.renderRoot.querySelector(`#col-2 mac-mac-edit[data-uuid="${uuid}"]`);
        if (mac) {
            mac.remove();
        }
    }

    #removeAuxUnit (uuid) {
        const auxunit = this.renderRoot.querySelector(`#col-2 mac-au-edit[data-uuid="${uuid}"]`);
        if (auxunit) {
            auxunit.remove();
        }
    }

    render () {
        return html`<div>
        <div>
            <ul>
                <li class="active"><a href="#" data-col=1 @click=${this.#changeTab}>Forces</a></li>
                <li>
                    <a href="#" data-col=2 @click=${this.#changeTab}>MAC</a>
                    <a href="#" data-col=2 @click=${this.#closeTab}>X</a>
                </li>
                <li>
                    <a href="#" data-col=3 @click=${this.#changeTab}>XXX</a>
                    <a href="#" data-col=3 @click=${this.#closeTab}>X</a>
                </li>
            </ul>
        </div>
    <main>
        <div id="col-1" class="active">
            <mac-force-list></mac-force-list>
            <div></div>
        </div>
        <div id="col-2"></div>
        <div id="col-3"></div>
    </main>
    </div>`;
    }
}

if (!window.customElements.get('mac-force-page')) {
    window.customElements.define('mac-force-page', ForcePage);
}
