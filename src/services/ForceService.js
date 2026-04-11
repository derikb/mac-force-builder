import Storage from '../store/Storage.js';
import EventEmitter from '../models/EventEmitter.js';
import Force from '../models/Force.js';
import { getHardware } from './HardwareService.js';
import AuxUnitTypes from '../data/AuxUnitTypes.js';

const appVersion = '1.0';

const emitter = new EventEmitter();

/**
 * Return UTC datetime string for right now
 * @return {String}
 */
const currentTimestamp = function () {
    const d = new Date();
    return d.toUTCString();
};

/**
 * Set a force model
 * @param {Object} force_obj
 * @returns Force
 */
const setForceModel = function (force_obj) {
    return new Force(force_obj);
};

/**
 * @param {String} uuid.
 * @returns {Force|null}
 */
const getForce = function (uuid) {
    if (!uuid) {
        return null;
    }
    const obj = Storage.get(uuid);
    if (!obj || !obj.uuid) {
        return null;
    }
    return setForceModel(obj);
};
/**
 * @param {Force} force
 * @returns {Boolean}
 */
const saveForce = function (force) {
    // Update saved timestamp
    force.updated = currentTimestamp();
    force.version = appVersion;
    Storage.set(force.uuid, force);
    emitter.trigger('force:edit');
};
/**
 * Remove from the store.
 * @param {String} uuid
 */
const removeForceLocal = function (uuid) {
    Storage.remove(uuid);
    emitter.trigger('force:remove', {
        uuid
    });
};
/**
 * Get all saved locally.
 * @returns {Force[]}
 */
const getAllForcesLocal = function () {
    const forces = [];
    Storage.getAll().forEach((force_obj) => {
        const model = setForceModel(force_obj);
        forces.push(model);
    });
    return forces;
};
/**
 * Import/save a force from an obj and return the model.
 * @param {Object} force_obj Force data from backup (we hope).
 * @returns {Force}
 * @throws {Error}
 */
const importForce = function (force_obj) {
    if (typeof force_obj !== 'object' || !force_obj.uuid) {
        throw new Error(`Data appears to be invalid. Try removing any text that isn't part of the backup (i.e. email introduction).`);
    }
    const newForce = setForceModel(force_obj);
    const existingForce = getForce(force_obj.uuid);
    if (existingForce && existingForce.name !== '' && existingForce.name !== newForce.name) {
        // existing uuid but different name
        if (!newForce.uuid_prev) {
            newForce.uuid_prev = newForce.uuid;
            newForce.uuid = crypto.randomUUID();
        } else {
            const temp_uuid = newForce.uuid_prev;
            newForce.uuid_prev = newForce.uuid;
            newForce.uuid = temp_uuid;
        }
    }
    saveForce(newForce);
    return newForce;
};
/**
 * Set prefix for LocalStorage keys.
 * @param {String} prefix
 */
const setLocalStoragePrefix = function (prefix) {
    if (!prefix) {
        throw Error('LocalStorage prefix is empty.');
    }
    Storage.setPrefix(prefix);
};

const validateMac = function (mac) {
    const errors = [];
    if (!mac.mClass === 0) {
        errors.push('Mac must have a class.');
    }
    if (Object.keys(mac.modules).length !== 6) {
        errors.push(`Macs must have 6 modules.`);
    }

    // @todo check dupes and brawl weapons etc.
    return errors;
};

const validateAuxUnit = function (auxunit) {
    const errors = [];
    const maxPower = auxunit.type === 'I' ? 1 : 2;
    const typeName = auxunit.type === 'I' ? 'Infantry' : 'Vehicle';

    const actualWeapons = auxunit.weapons.filter((w) => w?.type);
    if (actualWeapons.length > 2) {
        errors.push('Max 2 weapons allowed.');
    }

    actualWeapons.forEach((w) => {
        if (w.power > maxPower) {
            errors.push(`Weapon "${w.label}" exceeds max Power ${maxPower} for ${typeName}.`);
        }
    });

    const hwCounts = {};
    auxunit.hardware.forEach((id) => {
        if (id == null) { return; }
        hwCounts[id] = (hwCounts[id] ?? 0) + 1;
    });
    Object.entries(hwCounts).forEach(([id, count]) => {
        if (count > 2) {
            const hw = getHardware(Number(id));
            errors.push(`Cannot have more than 2 of "${hw?.name ?? id}".`);
        }
    });

    auxunit.hardware.forEach((id) => {
        if (id == null) { return; }
        const hw = getHardware(id);
        if (hw && !hw.type.includes(auxunit.type) && !hw.type.includes('A')) {
            errors.push(`Hardware "${hw.name}" is not compatible with ${typeName}.`);
        }
    });

    const typeData = AuxUnitTypes.find((t) => t.id === auxunit.type);
    if (typeData && auxunit.units > typeData.maxunits) {
        errors.push(`${typeData.label} max formation size is ${typeData.maxunits}.`);
    }

    return errors;
};

const validateForce = function (force) {
    let errors = [];
    if (!force.name) {
        errors.push('Force must have a name.');
    }
    force.macs.forEach((mac) => {
        errors = errors.concat(validateMac(mac));
    });
    force.aus.forEach((auxunit) => {
        errors = errors.concat(validateAuxUnit(auxunit));
    });
    if (errors.length > 0) {
        throw new Error(errors.join('<br/>'));
    }
};

/**
 * Get force data for export.
 * @param {String[]} uuids
 * @returns {Force[]}
 */
const exportForces = function (uuids) {
    const data = [];
    uuids.forEach((uuid) => {
        data.push(getForce(uuid));
    });
    return data;
};

/**
 * JSON data from the file or text
 * @param {String} data JSON
 */
const importForces = function (data) {
    try {
        // look for the start of the JSON string Array of Objects
        let start = data.indexOf('[{');
        let end = data.lastIndexOf('}]');
        // make sure it's not :[{, an array of objects inside one of the objects
        const check = data.indexOf(':[{');
        if (check !== -1 && check < start) {
            // if so start over
            start = -1;
        }
        if (start === -1) {
            start = data.indexOf('{');
            end = data.lastIndexOf('}');
            data = data.substring(start);
            data = data.substring(0, end + 1);
        } else {
            data = data.substring(start);
            data = data.substring(0, end + 2);
        }
        data = data.trim(); // just in case

        // convert linebreaks to html br else JSON.parse breaks
        // first make sure it's not a break between objects...
        data = data.replace(/\},[\r\n]+\{/g, '},{');
        data = data.replace(/(?:\r\n|\r|\n)/g, '<br/>');
        let backups = JSON.parse(data);
        // make it an array
        if (!Array.isArray(backups)) {
            backups = [backups];
        }

        backups.forEach((force_obj) => {
            if (typeof force_obj !== 'object' || !force_obj.uuid) {
                throw new Error(`Data appears to be invalid. Try removing any text that isn't part of the backup (i.e. email introduction).`);
            }
            const newForce = setForceModel(force_obj);
            // do we have this force key already
            const existingForce = getForce(force_obj.uuid);
            if (existingForce && existingForce.name !== '' && existingForce.name !== newForce.name) {
                // existing key but different name
                alert(`You have a force with that unique id but a different name than "${newForce.name}". Import aborted. Edit the uuid in the import or rename/delete the existing Force`);
                return;
            }
            saveForce(newForce);
            alert(`Imports: "${newForce.name}"`);
        });
        emitter.trigger('force:edit');
    } catch (e) {
        alert(`Error processing backup data: ${e.message}`);
    }
};

export {
    emitter,
    getForce,
    saveForce,
    validateForce,
    validateAuxUnit,
    removeForceLocal,
    getAllForcesLocal,
    importForce,
    setLocalStoragePrefix,
    exportForces,
    importForces
};
