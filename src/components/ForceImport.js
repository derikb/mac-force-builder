import { html } from 'lit';
import BaseElement from './BaseElement.js';
import { importForces } from '../services/ForceService.js';

export default class GangImport extends BaseElement {
    close () {
        document.querySelector('mac-force-page')?.clearColumns();
        this.remove();
    }

    #importGang (ev) {
        ev.preventDefault();
        const form = ev.target;
        const input_file = form.querySelector('input[type=file]');
        const input = form.querySelector('textarea');
        if (input_file.files && input_file.files.length > 0) {
            Array.from(input_file.files).forEach((f) => {
                const reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = ((theFile) => {
                    return (e) => {
                        importForces(e.target.result);
                    };
                })(f);
                reader.readAsText(f);
            });
        } else if (input.value !== '') {
            importForces(input.value);
        }
        this.close();
    }

    render () {
        return html`<h3>Import Gangs</h3>
        <p>Importing data with identical unique id and name to a Gang you already have saved will overwrite the saved Gang's data.</p>
        <form id="form_backup_restore" target="_self" @submit=${this.#importGang}>
            <div class="row mb-3">
                <label for="g-files" class="col-sm-4 col-form-label">Restore from File</label>
                <div class="col">
                <input type="file" id="g-files" name="g-files" class="form-control" />
                </div>
            </div>
            <div class="mt-3 mb-3>or</div>
            <div class="row mb-3">
                <label for="g-data" class="col-sm-4 col-form-label">Paste Backup Data</label>
                <div class="col">
                <textarea id="g-data" name="g-data" class="form-control"></textarea>
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <button type="submit" class="btn btn-primary me-4">Import</button>
                <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>
            </div>
        </form>`;
    }
}

if (!window.customElements.get('mac-gang-import')) {
    window.customElements.define('mac-gang-import', GangImport);
}
