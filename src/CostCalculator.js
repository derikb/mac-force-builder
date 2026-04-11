const getClassCost = function (mClass) {
    const costs = {
        1: 12,
        2: 16,
        3: 20,
    };
    return costs[mClass] ?? 0;
};

/**
 * @param {MAC} mac
 * @param {Force} force
 */
const calcMACCost = function (mac) {
    if (!mac) {
        return 0;
    }
    let total = getClassCost(mac.mClass);
    const frameworks = mac.modules.filter((m) => {
        return m.hardware_id === 15; // frame
    });
    total = total - frameworks.length;
    return total;
};

const calcAuxUnitCost = function (auxunit) {
    if (!auxunit) {
        return 0;
    }
    let total = auxunit.type === 'I' ? 1 : 2;
    total += auxunit.hardware.reduce((accumulator, hardwareId) => {
        return accumulator + (hardwareId > 0 ? 1 : 0);
    }, 0);
    total += auxunit.weapons.reduce((accumulator, weapon) => {
        return accumulator + (weapon?.power ?? 0);
    }, 0);
    return total * auxunit.units;
};

/**
 * @param {Force} force
 * @returns {Number}
 */
const calcForceCost = function (force) {
    let total = 0;
    force.macs.forEach((c) => {
        total += calcMACCost(c, force);
    });
    force.aus.forEach((a) => {
        total += calcAuxUnitCost(a, force);
    });
    return total;
};

export {
    calcMACCost,
    calcForceCost,
    calcAuxUnitCost,
};
