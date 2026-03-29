import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { exportForces, getAllForcesLocal } from '../services/ForceService.js';

export default class GangExport extends BaseElement {
    static styles = [
        super.styles,
        css`
        legend {
            font-size: 1.125rem;
        }`
    ];

    #fileLink = '';
    #emailLink = '';
    #copyText = '';

    constructor () {
        super();
        this.gangs = getAllForcesLocal();
    }
    close () {
        document.querySelector('mac-force-page')?.clearColumns();
        this.remove();
    }

    #handleFileLink (ev) {
        setTimeout(() => {
            window.URL.revokeObjectURL(this.#fileLink);
            this.close();
        }, 0);
    }

    #exportGangs (ev) {
        ev.preventDefault();
        const form = ev.target;
        const formData = new FormData(form);
        const format = formData.get('format').toString();
        const uuids = formData.getAll('gangs');
        const data = exportForces(uuids, format);
        const nameList = data.map((g) => g.name).join(', ');

        if (format === 'email') {
            const date = new Date();
            const body = `Below is the backup data for your gangs: ${nameList}.

To use this data, go to: ${window.location.href} and click the "Import Gang" button. Then paste the text below into the box.

---

${JSON.stringify(data)}`;

            const url = `mailto:?subject=${encodeURIComponent(`Gang backup: ${nameList} (${date.toLocaleString()})`)}&body=${encodeURIComponent(body)}`;

            this.#emailLink = url;
        } else if (format === 'paste' || typeof window.Blob !== 'function') {
            this.#copyText = JSON.stringify(data);
        } else {
            const file = new Blob([JSON.stringify(data)], { type: 'application/json' });
            this.#fileLink = URL.createObjectURL(file);
        }
        this.requestUpdate();
    }

    #renderGangItem (gang) {
        return html`<div class="form-check">
        <input class="form-check-input" type="checkbox" name="gangs" value="${gang.uuid}" id="gang_${gang.uuid}">
        <label class="form-check-label" for="gang_${gang.uuid}">
          ${gang.name}
        </label>
      </div>`;
    }

    #renderForm () {
        if (this.#copyText || this.#fileLink || this.#emailLink) {
            return '';
        }
        return html`
        <form id="form_backup" target="_self" @submit=${this.#exportGangs}>
            <fieldset>
                <legend tabindex="-1">Pick gangs</legend>
                <ul class="gang_downloads">
                ${this.gangs.map(this.#renderGangItem.bind(this))}
                </ul>
            </fieldset>
            <fieldset class="mb-3">
                <legend>Pick a format</legend>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="format" id="format_1" value="file" checked=checked>
                    <label class="form-check-label" for="format_1">
                        File download <small class="ms-3">Will not work on most mobile devices.</small>
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="format" id="format_2" value="email">
                    <label class="form-check-label" for="format_2">
                    Email data
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="format" id="format_3" value="paste">
                    <label class="form-check-label" for="format_3">
                    Copy and Paste data
                    </label>
                </div>
            </fieldset>
            <button type="submit" class="btn btn-primary">Export</button>
            <button type="button" class="btn btn-secondary" @click=${this.close}>Close</button>
        </form>`;
    }

    #renderLinks () {
        if (this.#fileLink) {
            const date = new Date();
            return html`<p>
            <a href="${this.#fileLink}" download="deadbylead_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}" @click=${this.#handleFileLink}>Download Export</a>
            </p>`;
        }
        if (this.#emailLink) {
            return html`
            <p><a href="${this.#emailLink}" target="_blank" @click=${this.close}>Open new message in default email client.</a></p>`;
        }
        if (this.#copyText) {
            return html`
            <p>Your current browser/os does not support direct file downloads, so here is the data for you to copy/paste.</p>
            <textarea class="form-control mb-3" rows="10">${this.#copyText}</textarea>
            <button type="button" class="btn btn-secondary" @click=${this.close}>Close</button>`;
        }
    }

    render () {
        return html`<h2>Export Gangs</h2>
            ${this.#renderForm()}
            ${this.#renderLinks()}
        `;
    }
}

if (!window.customElements.get('mac-gang-export')) {
    window.customElements.define('mac-gang-export', GangExport);
}
