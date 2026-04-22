import { html, css } from 'lit';
import AuxUnitEdit from './AuxUnitEdit.js';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';

export default class AuxUnitList extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            container-type: inline-size;
        }

        li.list-group-item > div:first-child {
            margin-bottom: 1rem;
        }
        li.list-group-item > div:last-child {
            text-align: right;
        }

        @container (width > 375px) {
            li.list-group-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            li.list-group-item > div:first-child {
                margin-bottom: 0;
            }
        }
        `
    ];

    /** @prop {AuxUnit} */
    auxunit = null;
    constructor ({
        auxunit,
        force
    }) {
        super();
        this.auxunit = auxunit;
        this.force = force;

        this.updateHandler = this.#auUpdated.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();
        emitter.on('auxunit:update', this.updateHandler);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('auxunit:update', this.updateHandler);
    }

    #auUpdated ({ uuid }) {
        if (uuid === this.auxunit.uuid) {
            this.requestUpdate();
        }
    }

    delete () {
        this.dispatchEvent(new CustomEvent('auxdelete', { bubbles: true, composed: true, detail: { uuid: this.auxunit.uuid } }));
    }

    openEdit () {
        const page = document.querySelector('mac-force-page');
        if (page) {
            const el = new AuxUnitEdit({ auxunit: this.auxunit, force: this.force });
            page.clearColumns(true, true);
            page.fillColumn(
                el,
                2,
                'Auxiliary Unit'
            );
        }
    }

    render () {
        return html`<li class="list-group-item">
            <div>${this.auxunit.name || 'Unnamed'}</div>
            <div>
                <button type="button" class="btn btn-secondary btn-sm" @click="${this.openEdit}">Edit</button>
                <button type="button" class="btn btn-danger btn-sm" @click=${this.delete}>Delete</button>
            </dv>
        </li>`;
    }
}

if (!window.customElements.get('mac-au-list')) {
    window.customElements.define('mac-au-list', AuxUnitList);
}
