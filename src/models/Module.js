export default class Module {
    // 1 - 6 location on MAC
    id = 0;
    name = '';
    type = 0;
    hardware_id = 0;
    weapon = null;

    constructor({
        id = 0,
        name = '',
        type = 0,
        hardware_id = 0,
        weapon = null,
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.hardware_id = hardware_id;
        this.weapon = weapon;
    }
};
