import { html, css } from 'lit';
import { emitter } from '../services/ForceService.js';
import HardwareList from './HardwareList.js';
import { calcMACCost } from '../CostCalculator.js';
import BaseElement from './BaseElement.js';
import { getName } from '../services/NameService.js';

export default class MACEdit extends BaseElement {
    static styles = [
        super.styles,
        css`
        .module-name {
            flex: 1 1 auto;
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

        this.dataset.uuid = this.mac.uuid;

        this.moduleHandler = this.#handleModuleUpdate.bind(this);
    }

    connectedCallback () {
        super.connectedCallback();
        emitter.on('mac:module:update', this.moduleHandler);
        emitter.on('force:edit', () => {
            this.requestUpdate();
        });
    }

    disconnectedCallback () {
        super.disconnectedCallback();
        emitter.off('mac:module:update', this.moduleHandler);
    }

    #triggerMacUpdate () {
        emitter.trigger('mac:update', { uuid: this.mac.uuid  });
    }

    #handleModuleUpdate ({ macUuid, moduleId, hardware = null, weapon = null}) {
        console.log(arguments);
        if (macUuid !== this.mac.uuid) {
            return;
        }
        const module = this.mac.getModule(moduleId);
        module.name = hardware?.name ?? weapon?.label ?? '';
        module.hardware_id = hardware?.id ?? 0;
        module.weapon = weapon;
        this.mac.setModule(module);
        this.requestUpdate();
        this.#triggerMacUpdate();
    }

    saveName (ev) {
        this.mac.name = ev.target.value;
        this.#triggerMacUpdate();
    }

    saveClass (ev) {
        this.mac.mClass = Number(ev.target.value);
        // @todo revalidate weapon classes
        this.requestUpdate();
        this.#triggerMacUpdate();
    }

    close () {
        document.querySelector('mac-force-page')?.clearColumns(true, true);
    }

    showHardware (ev) {
        ev.preventDefault();
        const moduleId = Number(ev.target.dataset.mid ?? 0);
        document.querySelector('mac-force-page')?.fillColumn(
            new HardwareList({ mac: this.mac, moduleId }),
            3,
            'Hardware/Weapons'
        );
    }

    #createName () {
        this.mac.name = getName();
        this.requestUpdate();
        this.#triggerMacUpdate();
    }

    #getClassOptions () {
        const options = [1,2,3].map((i) => {
            return html`<option value="${i}" ?selected=${this.mac.mClass == i}>${i}</option>`;
        });
        return options;
    }

    #getModuleFields() {
        return [1,2,3,4,5,6].map((id) => {
            const module = this.mac.getModule(id);
            return html`<li>
            <div class="input-group">
                <span class="input-group-text">${id}</span>
                <span class="input-group-text module-name">${module.label ? module.label : '[Empty]'}</span>
                <button type="button" class="btn btn-secondary" data-mid="${id}" @click=${this.showHardware}>Edit</button>
            </div>
            </li>`;
        });
    }

    render () {
        return html`<div class="row mb-3 align-items-center">
            <label for="macname" class="col-sm-3 col-form-label">Name</label>
            <div class="input-group col-sm-9">
                <input type="text" id="macname" name="macname" class="form-control" value="${this.mac.name}" @blur=${this.saveName} />
                <button type="button" class="btn btn-secondary btn-sm" @click=${this.#createName}>Generate Name</button>
            </div>
        </div>

        <div class="row mb-3 align-items-center">
            <div class="col-sm-3"><strong>Class</strong></div>
            <div class="col-sm-6">
                <select class="form-select" @change=${this.saveClass}>
                    ${this.#getClassOptions()}
                </select>
            </div>

            <div class="col-sm-3"><strong>Points</strong> ${calcMACCost(this.mac, this.force)}</div>
            </div>
        </div>

        <div class="mb-4">
            <h3>Modules</h3>
            <ol class="list-unstyled">
                ${this.#getModuleFields()}
            </ol>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click=${this.close}>Close</button>`;
    }
}

if (!window.customElements.get('mac-mac-edit')) {
    window.customElements.define('mac-mac-edit', MACEdit);
}
