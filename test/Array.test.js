"use strict";

import assert from 'assert';
import JasclibArray from '../src/Array';

describe('JasclibArray', () => {

    it('filters by white list', () => {
        const input = {
            'white': {
                '1': 'Number one',
                'preg1': {
                    '1': 'Preg - 1',
                    '2': 'Preg - 2',
                },
                'notPreg': {
                    '1': 'notPreg - 1',
                    '2': 'notPreg - 2',
                },
            },
            'black': {
                'some': 'value',
            },
            'func': [
                {'good': true},
                {'good': false},
            ],
        };

        const map = {
            'white': {
                '1': true,
                '/preg/': {
                    '2': true,
                },
            },
            'func': val => {
                return val.filter(item => {
                    if (!item.good) {
                        return false;
                    }
                    return true;
                });
            },
        };

        const output = JasclibArray.cutByWhiteList(Object.assign({}, input), map);

        assert.strictEqual(Object.keys(output).length, 2);
        assert.deepStrictEqual(
            output,
            {
                'white': {
                    '1': 'Number one',
                    'preg1': {
                        '2': 'Preg - 2',
                    },
                },
                'func': [
                    {'good': true},
                ],
            },
        );
    });

    it('filters by black list', () => {
        const input = {
            'black': {
                '1': 'one',
                '2': 'two',
                '3': {
                    '1': 1,
                    '2': 2,
                    'noDigit': 3,
                },
            },
            'white': {
                'some': 'thing',
            },
        };

        const map = {
            'black': {
                '2': true,
                '3': {
                    '/^\\d+$/': val => {
                        return val + 1;
                    },
                    'noDigit': true,
                },
            },
            'white': true,
        };

        const output = JasclibArray.cutByBlackList(input, map);

        assert.strictEqual(Object.keys(output).length, 1);
        assert.deepStrictEqual({
            'black': {
                '1': 'one',
                '3': {
                    '1': 2,
                    '2': 3,
                },
            },
        }, output);
    });
});
