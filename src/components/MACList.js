import { html, css } from 'lit';
import MACEdit from './MACEdit.js';
import BaseElement from './BaseElement.js';
import { emitter } from '../services/ForceService.js';

export default class MACList extends BaseElement {
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

    /** @prop {MAC} */
    mac = null;
    constructor ({
        mac,
        force
    }) {
        super();
        this.mac = mac;
        this.force = force;

        this.updateHandler = this.#macUpdated.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();
        emitter.on('mac:update', this.updateHandler);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('mac:update', this.updateHandler);
    }

    #macUpdated ({ id }) {
        if (id === this.mac.id) {
            this.requestUpdate();
        }
    }

    delete () {
        this.dispatchEvent(new CustomEvent('macdelete', { bubbles: true, composed: true, detail: { uuid: this.mac.uuid } }));
    }

    openEdit () {
        const page = document.querySelector('mac-force-page');
        if (page) {
            const el = new MACEdit({ mac: this.mac, force: this.force });
            page.clearColumns(true, true);
            page.fillColumn(
                el,
                2,
                'MAC'
            );
        }
    }

    render () {
        return html`<li class="list-group-item">
            <div>${this.mac.name || 'Unnamed'}</div>
            <div>
                <button type="button" class="btn btn-secondary btn-sm" @click="${this.openEdit}">Edit</button>
                <button type="button" class="btn btn-danger btn-sm" @click=${this.delete}>Delete</button>
            </dv>
        </li>`;
    }
}

if (!window.customElements.get('mac-mac-list')) {
    window.customElements.define('mac-mac-list', MACList);
}
