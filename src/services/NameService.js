import RandomNameGenerator from 'rpg-table-randomizer/src/RandomNameGenerator.js';
import RandomNameType from 'rpg-table-randomizer/src/RandomNameType.js';
import names from 'rpg-table-randomizer/sample/names.js';

// Format name data
const nameTypes = [];
names.forEach((data) => {
    nameTypes.push(new RandomNameType(data));
});
// Create a default name generator.
const defaultNameGenerator = new RandomNameGenerator({ namedata: nameTypes });

const getName = function () {
    return defaultNameGenerator.selectPersonalName();
};

export {
    getName
};
