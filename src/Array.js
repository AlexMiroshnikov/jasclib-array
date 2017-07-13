'use strict';

/**
 * @param {String} str
 * @returns {RegExp}
 */
const makePregFromString = str => {
    const parts = str.split('/');

    if (parts[2] && /[^gimuy]/.test(parts[2])) {
        throw new Error('Unexpected preg flags');
    }

    return new RegExp(parts[1], parts[2] || undefined);
};

/**
 * @param {Object|undefined} input
 * @param {Array} keys
 * @returns {Object|undefined}
 */
const cleanUp = (input, keys) => {
    if (input) {
        if (input instanceof Array) {
            input = input.filter(val => val !== undefined);
        } else {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                if (input[key] === undefined) {
                    delete input[key];
                }
            }
        }
    }

    return input;
};

/**
 * @param {Object} arr
 * @param {Object} map
 * @param {Array} mapStack
 * @returns {Object}
 */
export const cutByWhiteList = (arr, map, mapStack = []) => {
    mapStack.push(map);

    const keys = Object.keys(arr);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = arr[key];

        if (typeof map[key] !== 'undefined') {
            if (typeof map[key] === 'object' && typeof value === 'object') {
                arr[key] = cutByWhiteList(value, map[key], mapStack);
            } else if (typeof map[key] === 'function') {
                const res = map[key](value, arr);

                if (res instanceof Array) {
                    if (res[0] === '$_ref') {
                        arr[key] = cutByWhiteList(value, mapStack[0], mapStack);
                    } else if (res[0] === '$_unset') {
                        arr = undefined;
                        break;
                    } else {
                        arr[key] = res;
                    }
                } else {
                    arr[key] = res;
                }
            }
        } else {
            let unset = true;
            const mapKeys = Object.keys(map);

            for (let i = 0; i < mapKeys.length; i++) {
                const mapKey = mapKeys[i];

                if (/^\/.+\/[gimuy]*$/.test(mapKey) && makePregFromString(mapKey).test(key)) {
                    if (typeof map[mapKey] === 'object') {
                        arr[key] = cutByWhiteList(value, map[mapKey], mapStack);
                    } else if (typeof map[mapKey] === 'function') {
                        const res = map[mapKey](value, arr);

                        if (res instanceof Array) {
                            if (res[0] === '$_ref') {
                                arr[key] = cutByWhiteList(value, mapStack[0], mapStack);
                            } else if (res[0] === '$_unset') {
                                arr = undefined;
                                break;
                            } else {
                                arr[key] = res;
                            }
                        } else {
                            arr[key] = res;
                        }
                    }

                    unset = false;
                    break;
                }
            }

            if (unset) {
                delete arr[key];
            }
        }
    }

    mapStack.length && mapStack.pop();
    arr = cleanUp(arr, keys);
    return arr;
};

/**
 * @param {Object} arr
 * @param {Object} map
 * @returns {Object}
 */
export const cutByBlackList = (arr, map, mapStack = []) => {
    mapStack.push(map);

    if (arr !== undefined) {
        const keys = Object.keys(arr);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = arr[key];
            let unset = false;

            if (map[key]) {
                if (typeof map[key] === 'object') {
                    arr[key] = cutByBlackList(value, map[key], mapStack);
                } else if (typeof map[key] === 'function') {
                    const res = map[key](value, arr);

                    if (res instanceof Array) {
                        if (res[0] === '$_ref') {
                            arr[key] = cutByBlackList(value, mapStack[0], mapStack);
                        } else if (res[0] === '$_unset') {
                            arr = undefined;
                            break;
                        } else {
                            arr[key] = res;
                        }
                    } else {
                        arr[key] = res;
                    }
                } else {
                    unset = true;
                }
            } else {
                const mapKeys = Object.keys(map);

                for (let i = 0; i < mapKeys.length; i++) {
                    const mapKey = mapKeys[i];

                    if (/^\/.+\/[gimuy]*$/.test(mapKey) && makePregFromString(mapKey).test(key)) {
                        if (typeof map[mapKey] === 'object') {
                            arr[key] = cutByBlackList(value, map[mapKey], mapStack);
                        } else if (typeof map[mapKey] === 'function') {
                            const res = map[mapKey](value, arr);

                            if (res instanceof Array) {
                                if (res[0] === '$_ref') {
                                    arr[key] = cutByBlackList(value, mapStack[0], mapStack);
                                } else if (res[0] === '$_unset') {
                                    arr = undefined;
                                    break;
                                } else {
                                    arr[key] = res;
                                }
                            } else {
                                arr[key] = res;
                            }
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
        }

        arr = cleanUp(arr, keys);
    }

    mapStack.length && mapStack.pop();
    return arr;
};

export default {
    cutByWhiteList,
    cutByBlackList,
};
