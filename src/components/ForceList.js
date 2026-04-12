import { getAllForcesLocal, emitter } from '../services/ForceService.js';
import { html, css } from 'lit';
import BaseElement from './BaseElement.js';

export default class ForceList extends BaseElement {
    static styles = [
        super.styles,
        css`
        @media (max-width: 600px) {
            .d-flex {
                display: block !important;
            }
            .d-flex > div {
                margin-top: .5rem;
            }
        }
        `
    ];

    forces = [];

    constructor () {
        super();

        this.updateHandler = this.#forceUpdate.bind(this);
        this.deleteHandler = this.#forceDelete.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();

        this.forces = getAllForcesLocal();

        emitter.on('force:edit', this.updateHandler);
        emitter.on('force:remove', this.deleteHandler);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('force:edit', this.updateHandler);
        emitter.off('force:remove', this.deleteHandler);
    }

    #forceUpdate () {
        this.forces = getAllForcesLocal();
        this.requestUpdate();
    }

    #forceDelete ({ uuid = '' }) {
        this.renderRoot.querySelector(`li[data-uuid="${uuid}"]`)?.remove();
    }

    showCreate () {
        this.getRootNode().host?.clearColumns(true, true);
        emitter.trigger('force:show:edit', {});
    }

    showImport () {
        emitter.trigger('force:show:import');
    }

    showExport () {
        emitter.trigger('force:show:export');
    }

    showEdit (ev) {
        this.getRootNode().host?.clearColumns(true, true);
        const btn = ev.target;
        const uuid = btn.closest('li')?.dataset?.uuid || '';
        emitter.trigger('force:show:edit', { uuid });
    }

    #renderForceItem (force) {
        return html`<li class="list-group-item d-flex justify-content-between align-items-center" data-uuid="${force.uuid}">
            ${force.name}
            <div>
                <button type="button" class="btn btn-secondary btn-sm me-2" @click="${this.showEdit}">Edit</button>
                <!-- <a href="/print.html?force_id=${force.uuid}" class="btn btn-secondary btn-sm me-2" target="_blank">Print</a> -->
                <a href="/play.html?force_id=${force.uuid}" class="btn btn-secondary btn-sm" target="_blank">Play</a>
            </div>
        </li>`;
    }

    render () {
        return html`<div class="d-flex justify-content-between align-items-center">
            <h2>Saved Forces</h2>
            <div>
                <button type="button" class="btn btn-primary btn-sm me-2" @click=${this.showCreate}>Create</button>
                <button type="button" class="btn btn-primary btn-sm" @click=${this.showImport}>Import</button>
                <button type="button" class="btn btn-primary btn-sm" @click=${this.showExport}>Export</button>
            </div>
        </div>
        <p class="small mt-3">Warning: Forces are saved to your current browser only. Make backups using the "Export" button to avoid data loss.</p>
        <ul class="list-group mb-4">
            ${this.forces.map(this.#renderForceItem.bind(this))}
        </ul>`;
    }
}

if (!window.customElements.get('mac-force-list')) {
    window.customElements.define('mac-force-list', ForceList);
}
