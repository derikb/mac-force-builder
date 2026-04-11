import { html, css } from 'lit';
import BaseElement from './BaseElement.js';

export default class MACPrint extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            border: 2px solid black;
            padding: 1rem;
        }
        .input-group {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            width: auto;
        }
        .input-group-text {
            display: flex;
            align-items: center;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            color: black;
            text-align: center;
            white-space: nowrap;
            background-color: var(--bs-tertiary-bg);
            border: var(--bs-border-width) solid var(--bs-border-color);
            border-radius: var(--bs-border-radius);
        }
        .empty-fill {
            width: 4rem;
        }
        .module-name {
            flex: 1 1 auto;
        }

        .grid-col-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: .5rem;
        }

    .fill-in-box {
        display: inline-block;
        height: 1.5rem;
        width: 1.5rem;
        border: 1px solid black;
        text-align: center;
    }
    .fill-in-box + .fill-in-box {
        margin-inline-start: 1rem;
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
    }

    #getModuleFields() {
        return [1,2,3,4,5,6].map((id) => {
            const module = this.mac.getModule(id);
            return html`<li data-mid="${id}">
            <div class="input-group">
                <span class="input-group-text">${id}</span>
                <span class="input-group-text module-name ${module.destroyed ? 'destroyed' : ''}">${module.label ? module.label : '[Empty]'}</span>
                <span class="input-group-text">
                    <div class="fill-in-box"></div>
                    <div class="fill-in-box"></div>
                </span>
            </div>
            </li>`;
        });
    }

    #getInternalChecks() {
        const checks = [];
        for (let i = 1; i <= this.mac.mClass; i++) {
            checks.push(html`<span class="input-group-text">
                <div class="fill-in-box"></div>
            </span>`);
        }
        return checks;
    }

    render () {
        return html`
        <div class="row mb-3 align-items-center justify-content-between">
            <div class="input-group">
                <span class="input-group-text"><strong>Class</strong></span>
                <span class="input-group-text">${this.mac.mClass}</span>
            </div>
            <div class="input-group">
                <label for="division" class="input-group-text"><strong>Division</strong></label>
                <span class="input-group-text empty-fill">&nbsp;</span>
            </div>
            <div class="input-group">
                <label for="initiative" class="input-group-text"><strong>Initiative</strong></label>
                <span class="input-group-text empty-fill">&nbsp;</span>
            </div>
        </div>
        <div>
            <ol class="list-unstyled module-list mb-3">
                ${this.#getModuleFields()}
            </ol>
            <div class="input-group">
                <span class="input-group-text"><strong>Internal Damage</strong></span>
                ${this.#getInternalChecks()}
            </div>
        </div>
        `;
    }
}

if (!window.customElements.get('mac-mac-print')) {
    window.customElements.define('mac-mac-print', MACPrint);
}
