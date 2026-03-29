export default class Weapon {
    uuid = '';
    name = '';
    range = '';
    type = '';
    subtype = '';
    power = 0;
    expendable = false;

    constructor ({
        uuid = '',
        name = '',
        range = '',
        type = '',
        subtype = '',
        power = 0,
        expendable = false,
    }) {
        if (!uuid) {
            this.uuid = crypto.randomUUID();
        } else {
            this.uuid = uuid;
        }
        this.name = name;
        this.range = range;
        this.type = type;
        this.subtype = subtype;
        this.power = Number(power);
        this.expendable = Boolean(expendable);
    }

    get label() {
        return `${this.range}${this.type}${this.power}${this.subtype !== '' || this.expendable ? '-' : ''}${this.subtype}${this.expendable ? 'X' : ''} ${this.name}`;
    }
}
