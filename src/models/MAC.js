import Module from './Module.js';

export default class MAC {
    uuid = '';
    name = '';
    mClass = 1;
    /** @var {Array<Module>} */
    modules = [];
    division = '';
    initiative = '';
    destroyed = false;

    constructor ({
        uuid = '',
        name = '',
        mClass = 1,
        modules = [],
    }) {
        if (!uuid) {
            this.uuid = crypto.randomUUID();
        } else {
            this.uuid = uuid;
        }
        this.name = name;
        this.mClass = mClass;
        if (Array.isArray(modules)) {
            modules.forEach((m) => {
                this.modules.push(new Module(m));
            });
        }
    }

    getModule(id) {
        return this.modules.find((m) => {
            return m.id === id;
        }) ?? new Module({ id });
    }

    setModule(module) {
        const id = module.id;
        const index = this.modules.findIndex((m) => m.id === id);
        if (index > -1) {
            this.modules[index] = module;
        } else {
            this.modules.push(module);
        }
        this.modules.sort((a, b) => {
            return a.id - b.id;
        });
    }

    getPlayLabel() {
        return `${this.division !== '' ? `${this.division} ` : ''}${this.name}`;
    }
}
