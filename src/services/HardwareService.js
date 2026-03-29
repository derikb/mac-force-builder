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

const getAllHardware = function () {
    return models;
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
