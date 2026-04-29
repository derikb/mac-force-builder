import hardware from '../data/hardware.js';
import Hardware from '../models/Hardware.js';
import Weapon from '../models/Weapon.js';
import Ranges from '../data/Ranges.js';
import WeaponTypes from '../data/WeaponTypes.js';
import WeaponSubtypes from '../data/WeaponSubtypes.js';
import { getWeaponName } from './NameService.js';

const models = hardware.map((p) => {
    return new Hardware(p);
});

const getHardware = function (id) {
    return models.find((obj) => {
        return obj.id === id;
    });
};

/**
 * Get all hardware optionally filtered by mac or au type
 */
const getAllHardware = function ({ mac = null, auxunit = null }) {
    return models.filter((hw) => {
        if (mac) {
            return hw.type.includes('M') || hw.type.includes('A');
        }
        if (auxunit) {
            return hw.type.includes(auxunit.type) || hw.type.includes('A');
        }
        return true;
    });
};

const getHardwareName = function (id) {
    const ware = getHardware(id);
    return ware?.name || '';
};

const calcWeaponPowerOptions = function ({ mac = null, moduleId = 0, auxunit = null }) {
    let maxPower = 0;
    if (mac) {
        maxPower = moduleId === 1 ? mac.mClass + 1 : mac.mClass;
    }
    if (auxunit) {
        maxPower = auxunit.type === 'I' ? 1 : 2;
    }
    return Array.from({ length: maxPower }, (_, i) => i + 1);
};

const pick = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

const makeRandomWeapon = function ({ maxPower, allowBrawl = false, existingBrawl = null }) {
    const powers = Array.from({ length: maxPower }, (_, i) => i + 1);
    const weapon = new Weapon({
        name: getWeaponName(),
        range: pick(Ranges).id,
        type: pick(WeaponTypes).id,
        subtype: pick(WeaponSubtypes).id,
        power: pick(powers),
        expendable: Math.random() < 0.125,
    });
    if (allowBrawl && Math.random() < 0.25) {
        weapon.brawl = true;
        weapon.power = 2;
        if (existingBrawl) {
            weapon.name = existingBrawl.name;
            weapon.type = existingBrawl.type;
            weapon.subtype = existingBrawl.subtype;
            weapon.expendable = existingBrawl.expendable;
        }
    }
    return weapon;
};

export {
    getHardware,
    getAllHardware,
    getHardwareName,
    calcWeaponPowerOptions,
    makeRandomWeapon,
};
