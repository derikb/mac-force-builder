import hardware from '../data/hardware.js';
import Hardware from '../models/Hardware.js';

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

export {
    getHardware,
    getAllHardware,
    getHardwareName,
};
