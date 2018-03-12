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
            'inc': 1,
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
            '/inc/': val => (val + 1),
        };

        const output = JasclibArray.cutByWhiteList(Object.assign({}, input), map);

        assert.strictEqual(Object.keys(output).length, 3);
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
                'inc': 2,
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
            'func': 2,
            'nested': {
                'keep': true,
                'unset': false,
                'substring': 'string',
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
            'func': val => (val - 1),
            '/nested/': {
                'unset': true,
                '/sub/': true,
            },
        };

        const output = JasclibArray.cutByBlackList(input, map);

        assert.strictEqual(Object.keys(output).length, 3);
        assert.deepStrictEqual({
            'black': {
                '1': 'one',
                '3': {
                    '1': 2,
                    '2': 3,
                },
            },
            'func': 1,
            'nested': {
                'keep': true,
            },
        }, output);
    });

    it('handles invalid preg', () => {
        const input = {a: 1};
        const map = {'/inva/lid/': true};
        assert.throws(
            () => JasclibArray.cutByWhiteList(input, map),
            /Unexpected preg flags/
        );
    });

    it('supports recursion', () => {
        const input = [
            {
                id: 1,
                attr: 'correct',
                children: [
                    {
                        id: 101,
                        attr: 'incorrect',
                        children: [
                            {
                                id: 1001,
                                attr: 'correct',
                                children: [
                                    {
                                        id: 10001,
                                    },
                                    {
                                        id: 10002,
                                        attr: 'correct',
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        id: 102,
                        attr: 'correct',
                        children: [
                            {
                                id: 2001,
                                attr: 'correct',
                                children: [
                                    {
                                        id: 20001,
                                    },
                                    {
                                        id: 20002,
                                        attr: 'correct',
                                    }
                                ],
                            },
                            {
                                id: 2002,
                                attr: 'incorrect',
                                children: [
                                    {
                                        id: 22001,
                                    },
                                    {
                                        id: 22002,
                                        attr: 'correct',
                                    }
                                ],
                            }
                        ],
                    },
                ],
            },
            {
                id: 2,
                attr: 'incorrect',
                children: [],
            },
        ];

        let map = {
            '/^\\d+$/': {
                id: (arg, container) => {
                    if (!container.attr || container.attr !== 'correct') {
                        return ['$_unset'];
                    }

                    return arg;
                },
                attr: arg => {
                    if (arg !== 'correct') {
                        return ['$_unset'];
                    }

                    return arg;
                },
                children: arg => {
                    return ['$_ref', arg];
                },
            },
        };

        let output = JasclibArray.cutByWhiteList(input.slice(), map);

        assert.deepStrictEqual(output, [
            {
                id: 1,
                attr: 'correct',
                children: [
                    {
                        id: 102,
                        attr: 'correct',
                        children: [
                            {
                                id: 2001,
                                attr: 'correct',
                                children: [
                                    {
                                        id: 20002,
                                        attr: 'correct',
                                    }
                                ],
                            },
                        ],
                    },
                ],
            },
        ]);

        output = JasclibArray.cutByBlackList(input.slice(), map);

        assert.deepStrictEqual(output, [
            {
                id: 1,
                attr: 'correct',
                children: [
                    {
                        id: 102,
                        attr: 'correct',
                        children: [
                            {
                                id: 2001,
                                attr: 'correct',
                                children: [
                                    {
                                        id: 20002,
                                        attr: 'correct',
                                    }
                                ],
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('supports recursion (extended whitelist codecov)', () => {
        const input = {
            'pregCorrect': {
                'pregCorrect': {
                    'val1': 11,
                    'val2': 12,
                    'pregCorrect': {
                        'unsetTrigger': 123,
                    },
                    'unsetTrigger': [456],
                },
                'another': {
                    'val1': 21,
                    'val2': 22,
                },
            },
            'gerpIncorrect': 'invalid',
        };

        const map = {
            '/^preg/': arg => {
                return ['$_ref', arg];
            },
            'val1': true,
            '/unsetTrigger/': arg => {
                if (arg === 123) {
                    return ['$_unset'];
                }

                return arg;
            },
        };

        const output = JasclibArray.cutByWhiteList(input, map);

        assert.deepStrictEqual(output, {
            pregCorrect: {
                pregCorrect: {
                    val1: 11,
                    unsetTrigger: [456],
                },
            },
        });
    });

    it('supports recursion (extended blacklist codecov)', () => {
        const input = {
            'keep': [123],
            'pregAnother': {
                'noKey': [789],
            },
            'pregCorrect': {
                'ref': true,
                'pregCorrect': {
                    'unset': true,
                },
            },
        };

        const map = {
            'keep': arg => arg.concat([456]),
            '/^preg/': arg => {
                if (arg.ref) {
                    return ['$_ref'];
                }
                if (arg.unset) {
                    return ['$_unset'];
                }
                return [arg];
            },
            'noKey': true,
        };

        const output = JasclibArray.cutByBlackList(input, map);

        assert.deepStrictEqual(output, {
            keep: [123, 456],
            pregAnother: [{noKey: [789]}],
        });
    });

});
