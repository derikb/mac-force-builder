import RandomNameGenerator from 'rpg-table-randomizer/src/RandomNameGenerator.js';
import RandomNameType from 'rpg-table-randomizer/src/RandomNameType.js';
import names from '../data/names.js';

// Format name data
const nameTypes = [
    new RandomNameType(names)
];
// names.forEach((data) => {
//     nameTypes.push(new RandomNameType(data));
// });
// Create a default name generator.
const defaultNameGenerator = new RandomNameGenerator({ namedata: nameTypes });

const getName = function () {
    return defaultNameGenerator.selectSurname('mac');
};

export {
    getName
};
