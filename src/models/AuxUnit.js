export default class AuxUnit {
    uuid = '';
    name = '';
    type = '';
    /** @var {Array<Weapon>} */
    weapons = [];
    /** @var {Array<Hardware>} */
    hardware = [];

    constructor ({
        uuid = '',
        name = '',
        type = '',
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
            // return new Weapon(obj);
        });
        this.hardware = hardware.map((obj) => {
            // return new Hardware(obj);
        });
    }
}
