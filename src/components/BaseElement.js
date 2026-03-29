import { LitElement } from 'lit';
import { bootstrap } from '../styleLoad.js';

export default class BaseElement extends LitElement {
    static styles = [
        bootstrap
    ];
}
