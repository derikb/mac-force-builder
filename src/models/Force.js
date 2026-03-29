import MAC from './MAC.js';
import AuxUnit from './AuxUnit.js';

export default class Force {
    uuid = '';
    name = '';
    faction = '';
    /** @var {Array<MAC>} */
    macs = [];
    /** @var {Array<AuxUnit>} */
    aus = [];
    points = 0;

    constructor ({
        uuid = '',
        name = '',
        faction = '',
        macs = [],
        aus = [],
        points = 0,
    }) {
        if (!uuid) {
            this.uuid = crypto.randomUUID();
        } else {
            this.uuid = uuid;
        }
        this.name = name;
        this.faction = faction;
        this.macs = macs.map((obj) => {
            return new MAC(obj);
        });
        this.aus = aus.map((obj) => {
            return new AuxUnit(obj);
        });
        this.points = points;
    }

    addMac (mac) {
        this.macs.push(mac);
    }

    removeMac (uuid) {
        const index = this.macs.findIndex(
            (a) => {
                return a.uuid === uuid;
            }
        );
        if (index > -1) {
            this.macs.splice(index, 1);
        }
    }

    removeAux (uuid) {
        const index = this.aus.findIndex(
            (a) => {
                return a.uuid === uuid;
            }
        );
        if (index > -1) {
            this.aus.splice(index, 1);
        }
    }
}
