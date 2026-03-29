// import weapons from '../data/weapons.js';
import Weapon from '../models/Weapon.js';

const rivalWeapons = [1, 2, 3, 4, 6];

const models = [];
// weapons.map((w) => {
//    return new Weapon(w);
// });

const getWeapon = function (id) {
    return models.find((obj) => {
        return obj.id === id;
    });
};

const getWeapons = function (rival = false) {
    if (rival) {
        return models.filter((w) => {
            return rivalWeapons.includes(w.id);
        });
    }
    return models;
};

const getWeaponCost = function (id) {
    return getWeapon(id)?.cost || 0;
};

export {
    getWeapon,
    getWeapons,
    getWeaponCost,
    rivalWeapons
};
