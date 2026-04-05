import Weapon from './Weapon.js';

export default class AuxUnit {
    uuid = '';
    name = '';
    type = 'I';
    /** @var {Array<Weapon>} */
    weapons = [];
    /** @var {Array<Number> hardware ids} */
    hardware = [];

    constructor ({
        uuid = '',
        name = '',
        type = 'I',
        weapons = [],
        hardware = [],
    }) {
        if (!uuid) {
            this.uuid = crypto.randomUUID();
        } else {
            this.uuid = uuid;
        }
        this.name = name;
        this.type = type;
        this.weapons = weapons.map((obj) => {
            return new Weapon(obj);
        });
        this.hardware = hardware;
    }
}
