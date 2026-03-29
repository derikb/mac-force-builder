export default class Hardware {
    id = 0;
    name = '';
    description = '';
    type = [];

    constructor ({
        id = 0,
        name = '',
        description = '',
        type = [],
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
    }
}
