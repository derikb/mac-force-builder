import { removeForceLocal, saveForce, emitter, validateForce, cloneMac, cloneAuxUnit } from '../services/ForceService.js';
import { html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import MAC from '../models/MAC.js';
import MACEdit from './MACEdit.js';
import MACList from './MACList.js';
import AuxUnitList from './AuxUnitList.js';
import AuxUnit from '../models/AuxUnit.js';
import AuxUnitEdit from './AuxUnitEdit.js';
import BaseElement from './BaseElement.js';
import { calcForceCost } from '../CostCalculator.js';

export default class ForceEdit extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host > div {
            container-type: inline-size;
        }

        .flex-row > div:first-child {
            margin-bottom: 1rem;
        }
        .flex-row > *:last-child {
            text-align: right;
        }

        @container (width > 375px) {
            .flex-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .flex-row > *:first-child {
                margin-bottom: 0;
            }
        }

        `
    ];

    #unsaved = false;
    #errors = '';

    constructor ({
        force = null
    }) {
        super();
        this.force = force;
        this.macUpdateHandler = this.#macUpdated.bind(this);
        this.auUpdateHandler = this.#auUpdated.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();

        emitter.on('mac:update', this.macUpdateHandler);
        emitter.on('auxunit:update', this.auUpdateHandler);
    }

    disconnectedCallback () {
        super.disconnectedCallback();

        emitter.off('mac:update', this.macUpdateHandler);
        emitter.off('auxunit:update', this.auUpdateHandler);
    }

    #macUpdated () {
        this.#unsaved = true;
        this.requestUpdate();
    }

    #auUpdated () {
        this.#unsaved = true;
        this.requestUpdate();
    }

    save (ev) {
        ev.preventDefault();
        this.#errors = '';
        const formData = new FormData(ev.target);
        this.force.name = formData.get('force-name').toString();
        try {
            // Confirm new cost won't mean cash goes below zero
            // And a few other things.
            validateForce(this.force);
            saveForce(this.force);
            this.#unsaved = false;
        } catch (err) {
            this.#errors = err.message;
        }
        this.requestUpdate();
    }

    close () {
        if (this.#unsaved && !confirm('You have unsaved changes. Are you sure you want to cancel them?')) {
            return;
        }
        document.querySelector('mac-force-page')?.clearColumns();
        this.remove();
    }

    deleteForce () {
        if (!confirm('Are you sure?')) {
            return;
        }
        removeForceLocal(this.force.uuid);
        this.close();
    }

    addMac () {
        const mac = new MAC({});
        this.force.addMac(mac);
        this.#unsaved = true;
        this.requestUpdate();

        const page = document.querySelector('mac-force-page');
        if (page) {
            page.clearColumns(true, true);
            page.fillColumn(
                new MACEdit({ mac, force: this.force }),
                2,
                'Mac'
            );
        }
    }

    cloneMac (ev) {
        const uuid = ev.detail?.uuid || '';
        const original = this.force.macs.find((m) => m.uuid === uuid);
        if (original) {
            const clone = cloneMac(original);
            this.force.addMac(clone);
            this.#unsaved = true;
            this.requestUpdate();
        }
    }

    deleteMac (ev) {
        const uuid = ev.detail?.uuid || '';
        if (uuid !== '') {
            this.force.removeMac(uuid);
            this.#unsaved = true;
            this.requestUpdate();
            emitter.trigger('mac:remove', { uuid });
        }
    }

    addAuxUnit () {
        const auxunit = new AuxUnit({});
        this.force.addAuxUnit(auxunit);
        this.#unsaved = true;
        this.requestUpdate();

        const page = document.querySelector('mac-force-page');
        if (page) {
            page.clearColumns(true, true);
            page.fillColumn(
                new AuxUnitEdit({ auxunit, force: this.force }),
                2,
                'Aux Unit'
            );
        }
    }

    cloneAux (ev) {
        const uuid = ev.detail?.uuid || '';
        const original = this.force.aus.find((a) => a.uuid === uuid);
        if (original) {
            const clone = cloneAuxUnit(original);
            this.force.addAuxUnit(clone);
            this.#unsaved = true;
            this.requestUpdate();
        }
    }

    deleteAux (ev) {
        const uuid = ev.detail?.uuid || '';
        if (uuid !== '') {
            this.force.removeAux(uuid);
            this.#unsaved = true;
            this.requestUpdate();
            emitter.trigger('aux:remove', { uuid });
        }
    }

    #updateName (ev) {
        const input = ev.target;
        if (this.force.name !== input.value) {
            this.#unsaved = true;
            this.force.name = input.value;
            this.requestUpdate();
        }
    }

    render () {
        return html`<div><div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Edit Force</h2>
            <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
        </div>
        <div class="alert alert-danger mb-0 p-2 ${this.#unsaved ? '' : 'invisible'}">
            <p>Unsaved Changes</p>
        </div>
        <div class="card ${this.#unsaved ? 'border-danger-subtle' : ''}">
        <div class="card-body">
            <form @submit="${this.save}" class="mb-4">
                <div class="row mb-3">
                    <label for="force-name" class="col-sm-4 col-form-label">Force Name</label>
                    <div class="col">
                    <input type="text" id="force-name" name="force-name" class="form-control" value="${this.force.name}" @blur=${this.#updateName} autocomplete="off" />
                    </div>
                </div>
                <div class="flex-row mb-3">
                    <div>
                        <strong>Points:</strong> ${calcForceCost(this.force)}
                    </div>
                    <div>
                        <button type="submit" class="btn btn-primary me-2">Save</button>
                        <button type="button" class="btn btn-danger btn-sm" @click=${this.deleteForce}>Delete</button>
                    </div>
                </div>
                ${this.#errors !== '' ? html`<p class="alert alert-danger">${unsafeHTML(this.#errors)}</p>` : ''}
            </form>
            <div class="flex-row mb-4">
                <h3>MACs</h3>
                <div><button type="button" class="btn btn-primary btn-sm" @click=${this.addMac}>Add MAC</button></div>
            </div>
            <ul id="macs" class="list-group mb-3" @macclone=${this.cloneMac} @macdelete=${this.deleteMac}>
                ${this.force.macs.map((mac) => new MACList({ mac, force: this.force }))}
            </ul>

            <div class="flex-row mb-4">
                <h3>Auxiliary Units</h3>
                <div><button type="button" class="btn btn-primary btn-sm" @click=${this.addAuxUnit}>Add AU</button></div>
            </div>
            <ul id="auxs" class="list-group" @auxclone=${this.cloneAux} @auxdelete=${this.deleteAux}>
                ${this.force.aus.map((auxunit) => new AuxUnitList({ auxunit, force: this.force }))}
            </ul>
        </div></div>
        </div>`;
    }
}

if (!window.customElements.get('mac-force-edit')) {
    window.customElements.define('mac-force-edit', ForceEdit);
}
