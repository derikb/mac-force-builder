export default class Weapon {
    uuid = '';
    name = '';
    range = '';
    type = '';
    subtype = '';
    power = 0;
    expendable = false;
    brawl = false;

    constructor ({
        uuid = '',
        name = '',
        range = '',
        type = '',
        subtype = '',
        power = 0,
        expendable = false,
        brawl = false,
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
        this.brawl = Boolean(brawl);
    }

    get label() {
        return `${this.range ?? ''}${this.type}${this.power}${this.subtype !== '' || this.expendable ? '-' : ''}${this.subtype}${this.expendable ? 'X' : ''} ${this.name}${this.brawl ? ' (Brawl)' : ''}`;
    }

    fromForm(data) {
        this.name = data.get('weapon_name');
        this.range = data.get('weapon_range');
        this.type = data.get('weapon_type');
        this.subtype = data.get('weapon_subtype');
        this.power = Number(data.get('weapon_power'));
        this.expendable = data.get('weapon_x') === '1';
        this.brawl = data.get('weapon_brawl') === '1';
    }
}
