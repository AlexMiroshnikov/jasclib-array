'use strict';

/**
 * @param {String} str
 * @returns {RegExp}
 */
const makePregFromString = str => {
    const parts = str.split('/');

    if (parts.length < 3) {
        throw new Error('Unexpected preg source');
    }

    return new RegExp(parts[1], parts[2] || undefined);
};

/**
 *
 * @param {Object} arr
 * @param {Object} map
 * @returns {Object}
 */
export const cutByWhiteList = (arr, map) => {
    Object.keys(arr).map(key => {
        const value = arr[key];

    if (typeof map[key] !== 'undefined') {
        if (typeof map[key] === 'object' && typeof value === 'object') {
            arr[key] = cutByWhiteList(value, map[key]);
        } else if (typeof map[key] === 'function') {
            arr[key] = map[key](value);
        }
    } else {
        let unset = true;
        const mapKeys = Object.keys(map);

        for (let i = 0; i < mapKeys.length; i++) {
            const mapKey = mapKeys[i];

            if (/^\/.+\/[siu]*$/.test(mapKey) && makePregFromString(mapKey).test(key)) {
                if (typeof map[mapKey] === 'object') {
                    arr[key] = cutByWhiteList(value, map[mapKey]);
                } else if (typeof map[mapKey] === 'function') {
                    arr[key] = map[mapKey](value);
                }

                unset = false;
                break;
            }
        }

        if (unset) {
            delete arr[key];
        }
    }
});

    return arr;
};

/**
 *
 * @param {Object} arr
 * @param {Object} map
 * @returns {Object}
 */
export const cutByBlackList = (arr, map) => {
    Object.keys(arr).map(key => {
        const value = arr[key];
    let unset = false;

    if (map[key]) {
        if (typeof map[key] === 'object') {
            arr[key] = cutByBlackList(value, map[key]);
        } else if (typeof map[key] === 'function') {
            arr[key] = map[key](value);
        } else {
            unset = true;
        }
    } else {
        const mapKeys = Object.keys(map);

        for (let i = 0; i < mapKeys.length; i++) {
            const mapKey = mapKeys[i];

            if (/^\/.+\/[siu]*$/.test(mapKey) && makePregFromString(mapKey).test(key)) {
                if (typeof map[mapKey] === 'object') {
                    arr[key] = cutByBlackList(value, map[mapKey]);
                } else if (typeof map[mapKey] === 'function') {
                    arr[key] = map[mapKey](value);
                } else {
                    unset = true;
                }
                break;
            }
        }
    }

    if (unset) {
        delete arr[key];
    }
});

    return arr;
};

export default {
    cutByWhiteList,
    cutByBlackList,
};
