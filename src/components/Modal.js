import { html, css } from 'lit';
import BaseElement from './BaseElement.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

class Modal extends BaseElement {
    static styles = [
        super.styles,
        css`
        :host {
            margin: 1rem auto;
            padding: 1.5rem;
            border: 2px solid rgb(207,0,15);
            border-radius: 4px;
            background-color: #fefefe;
            box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.5);
            width: auto;
            z-index: 100;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            min-width: 80%;
            top: 2rem;
        }
        @media (min-width: 50.0rem) {
            :host {
                margin: 2rem auto;
                padding: 1.5rem 3rem;
                min-width: 40%;
                max-width: 70rem;
                left: 50%;
                transform: translateX(-50%);
            }
        }
        :host([hidden]) {
            display: none
        }
        h2 {
            font-weight: bold;
            font-size: 1.25rem;
            line-height: 1.75rem;
            margin: 0rem 0 1.25rem 0;
        }
        /* Close button */
        button.close {
            float: right;
            margin: 1rem 0 0 1rem;
        }
        form button.close {
            float: none;
            margin: 0 0 0 2rem;
        }
        `
    ];

    #header = '';
    #content = '';

    constructor () {
        super();

        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-labelledby', 'modal-label');

        this.boundOutsideClickClose = function () {};
        this.boundKeyboardEvents = function () {};
        this.opener = null;
    }

    get header () {
        return this.#header;
    }
    set header (html) {
        this.#header = html;
    }
    /**
     * Is the modal open or not
     */
    get isOpen () {
        return !this.hidden;
    }

    get content () {
        return this.#content;
    }
    /**
     * Adapted from https://github.com/salesforce/kagekiri
     * Get children of a node, including getting slotted content.
     * @param {HTMLElement} node
     * @returns HTMLCollection|HTMLElement[]
     */
    getChildren (node) {
        // is it a slot.
        if (typeof node.assignedElements === 'function') {
            const assigned = node.assignedElements();
            // slotted content or the default
            return assigned.length ? assigned : node.children;
        } else {
            return node.children;
        }
    }
    /**
     * Is an element focusable.
     * This probably doesn't cover ALL possibilities, but its a decent start.
     * @param {HTMLElement} element
     * @param {Boolean} keyboardOnly Are we only looking for tabbable focus.
     */
    isFocusable (element, keyboardOnly = false) {
        const tagName = element.tagName;
        // Just in case.
        if (tagName === undefined) {
            return false;
        }
        // Will be false-y if not set/available.
        const disabled = element.disabled;
        // Convert to integer or NaN if tabindex is not set.
        const tabIndex = parseInt(element.getAttribute('tabindex'), 10);
        const contentEditable = element.getAttribute('contenteditable');

        switch (tagName) {
            case 'INPUT':
            case 'TEXTAREA':
            case 'SELECT':
            case 'BUTTON':
            case 'A':
                if (tabIndex === -1) {
                    return false;
                }
                if (disabled) {
                    return false;
                }
                if (tagName === 'A' && !element.href) {
                    return false;
                }
                return true;
            default:
                if (keyboardOnly && tabIndex >= 0) {
                    return true;
                } else if (!keyboardOnly && tabIndex >= -1) {
                    return true;
                }
                if (contentEditable === 'true') {
                    return true;
                }
        }
        return false;
    }
    /**
     * Get focusable elements recursively.
     * @param {HTMLElement} element
     * @param {Boolean} keyboardOnly Only tabbable elements?
     * @param {Boolean} single Only get the first one.
     * @returns
     */
    getFocusableChildren (element, keyboardOnly = false, single = false) {
        let focusables = [];
        const children = Array.from(this.getChildren(element));
        if (children.length === 0) {
            return focusables;
        }
        for (const child of children) {
            // check if element is focusable.
            if (this.isFocusable(child, keyboardOnly)) {
                focusables.push(child);
                if (single) {
                    return focusables;
                }
            }
            const childFocusables = this.getFocusableChildren(child, keyboardOnly, single);
            if (single && childFocusables.length === 1) {
                return childFocusables;
            }
            focusables = focusables.concat(childFocusables);
        }
        return focusables;
    }
    /**
     * Get focusable elements in the component
     * Shadow DOM and slotted elements
     * Theoretically in the correct order.
     * @param {Boolean} keyboardOnly Only tabbable elements?
     * @param {Boolean} single Only get the first one.
     * @returns {HTMLElement[]}
     */
    findFocusables (keyboardOnly = false, single = false) {
        return this.getFocusableChildren(this.renderRoot, keyboardOnly, single);
    }
    /**
     * Get the first focusable element in the modal.
     * @returns {HTMLElement|null}
     */
    findFirstFocusable () {
        return this.findFocusables(false, true).shift();
    }
    /**
     * Get the first tabbing focusable element in the modal.
     * @returns {HTMLElement|null}
     */
    findFirstTabFocusable () {
        return this.findFocusables(true, true).shift();
    }
    /**
     * Return last focusable element in the modal.
     * @returns {HTMLElement|null}
     */
    findLastTabFocusable () {
        const focusables = this.findFocusables(true);
        return focusables[focusables.length - 1];
    }
    /**
     * Find first focusable element in modal and focus on it.
     */
    focusFirst () {
        const focusable = this.findFirstFocusable();
        if (focusable) {
            focusable.focus();
        }
    }
    /**
     * Handler: Clicks outside modal close the modal.
     * Bound to this then listens on document.
     * @param {MouseEvent} ev Click event.
     */
    outsideClickClose (ev) {
        const close = ev.target.closest('modal-mib');
        if (close === null) {
            if (ev.target.classList.contains('btn-dialog')) {
                return;
            }
            // Hide the help.
            this.close();
            this.clear();
        }
    }
    /**
     * Get focused element.
     */
    deepActiveElement () {
        let a = document.activeElement;
        while (a && a.shadowRoot && a.shadowRoot.activeElement) {
            a = a.shadowRoot.activeElement;
        }
        return a;
    }
    /**
     * Handler: Keyboard events to:
     * - Close on Esc
     * - Trap tab focus into modal.
     * @param {KeyboardEvent} ev Keydown event
     */
    keyboardEvents (ev) {
        if (ev.key === 'Escape') {
            this.close();
            return;
        }
        if (ev.key !== 'Tab') {
            return;
        }
        // Get current active/focused element.
        const currentEl = this.deepActiveElement();
        if (ev.shiftKey) {
            // Shift tab, only concerned with first element.
            if (currentEl === this.findFirstFocusable() || currentEl === this.findFirstTabFocusable()) {
                // Go to the last element in the modal.
                const focusable = this.findLastTabFocusable();
                if (focusable) {
                    ev.preventDefault();
                    focusable.focus();
                }
            }
            return;
        }
        // Tab (no shift), only concerned with last element.
        if (currentEl === this.findLastTabFocusable()) {
            // Go to the first element in the modal.
            const focusable = this.findFirstTabFocusable();
            if (focusable) {
                ev.preventDefault();
                focusable.focus();
            }
        }
    }
    /**
     * Open/show Modal
     */
    open () {
        if (this.isOpen) {
            return;
        }
        /**
         * Get the opener trigger (usually a button/link).
         */
        this.opener = this.deepActiveElement();
        this.hidden = false;
        this.focusFirst();
        // We need to do this to be able to remove the listener later.
        this.boundOutsideClickClose = this.outsideClickClose.bind(this);
        document.addEventListener('click', this.boundOutsideClickClose, true);
        this.boundKeyboardEvents = this.keyboardEvents.bind(this);
        document.addEventListener('keydown', this.boundKeyboardEvents, true);
    }
    /**
     * Close the modal.
     * Return focus to whatever opened it.
     */
    close () {
        this.hidden = true;
        // Remove click handler to close modal.
        document.removeEventListener('click', this.boundOutsideClickClose, true);
        document.removeEventListener('keydown', this.boundKeyboardEvents, true);
        if (this.opener) {
            this.opener.focus();
        }
        this.remove();
    }
    /**
     * Clear the modal, by removing the slotted elements in the light DOM
     * Leaves the shadow DOM alone so we can reslot.
     */
    clear () {
        this.content = '';
    }
    /**
     * Close and clear contents.
     */
    closeClear () {
        this.close();
        this.clear();
    }
    /**
     * Add content to modal.
     * @param {String} content
     */
    set content (content) {
        this.#content = content;
        this.requestUpdate();
    }

    render () {
        return html`
        <h2 id="modal-label" tabindex="-1">${this.header}</h2>
        ${unsafeHTML(this.content)}
        <button type="button" class="btn btn-secondary close" @click=${this.closeClear}>Close</button>
`;
    }
}

if (!window.customElements.get('modal-mib')) {
    window.customElements.define('modal-mib', Modal);
}

export default Modal;
