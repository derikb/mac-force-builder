import Weapon from './Weapon.js';

export default class AuxUnit {
    uuid = '';
    name = '';
    type = 'I';
    /** @var {Array<Weapon>} */
    weapons = [];
    /** @var {Array<Number>} hardware ids */
    hardware = [];
    units = 1;
    division = '';
    initiative = '';
    destroyed = false;

    constructor ({
        uuid = '',
        name = '',
        type = 'I',
        weapons = [],
        hardware = [],
        units = 1,
    }) {
        if (!uuid) {
            this.uuid = crypto.randomUUID();
        } else {
            this.uuid = uuid;
        }
        this.name = name;
        this.type = type;
        this.weapons = weapons.map((obj) => {
            if (obj) {
                return new Weapon(obj);
            }
        });
        this.hardware = hardware;
        this.units = units;
    }
}
