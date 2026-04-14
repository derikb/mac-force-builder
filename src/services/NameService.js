import RandomNameGenerator from 'rpg-table-randomizer/src/RandomNameGenerator.js';
import RandomNameType from 'rpg-table-randomizer/src/RandomNameType.js';
import names from '../data/names.js';
import weaponNames from '../data/weaponNames.js';

// Format name data
const nameTypes = [
    new RandomNameType(names)
];
// Create a default name generator.
const defaultNameGenerator = new RandomNameGenerator({ namedata: nameTypes });

const weaponNameTypes = [
    new RandomNameType(weaponNames)
];
const weaponNameGenerator = new RandomNameGenerator({ namedata: weaponNameTypes });

const randomLetters = function () {
    const count = Math.random() < 0.5 ? 2 : 3;
    let result = '';
    for (let i = 0; i < count; i++) {
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return result;
};

const getName = function (classOrType = '') {
    const letters = randomLetters();
    const base = defaultNameGenerator.selectSurname('mac');
    return classOrType
        ? `${letters}-${classOrType} ${base}`
        : `${letters} ${base}`;
};

const getWeaponName = function () {
    return weaponNameGenerator.selectSurname('weapon');
};

export {
    getName,
    getWeaponName
};
