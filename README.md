# jasclib-array
Configurable array/object helpers for JavaScript

[![npm version](https://badge.fury.io/js/jasclib-array.svg)](https://badge.fury.io/js/jasclib-array)
[![Build Status](https://travis-ci.org/AlexMiroshnikov/jasclib-array.svg?branch=master)](https://travis-ci.org/AlexMiroshnikov/jasclib-array)
[![Coverage Status](https://coveralls.io/repos/github/AlexMiroshnikov/jasclib-array/badge.svg?branch=master)](https://coveralls.io/github/AlexMiroshnikov/jasclib-array?branch=master)


**ZERO dependencies!**

## Install
`npm i --save jasclib-array`

## Usage
```javascript
// Load
const JasclibArray = require('jasclib-array');

// Prepare input data
const a = {
    white: {
        leave: 'Left in white',
        unset: 'Unset me',
    },
    black: {
        leave: 'Left in black',
        unset: 'Unset me',
    },
};

const b = Object.assign({}, a);

// Filter by white-list pattern
const white = JasclibArray.cutByWhiteList(a, {
    white: {
        leave: true,
    },
});

console.log(white); // { white: { leave: 'Left in white' } }

// Filter by black-list pattern
const black = JasclibArray.cutByBlackList(b, {
    white: true,
    black: {
        unset: true,
    },
});

console.log(black); // { black: { leave: 'Left in black' } }
```

## Advanced usage
Several operators over the objects are predefined and help you with complex filtering and allow to make filtering more flexible

### Applying rules recursively 
Predefined operator **`$_ref`**

If you have unknown or deep nesting level of and you don't want to repeat yourself, you can define the filter rules once and apply them on each level. 
Example: 
```javascript
const JasclibArray = require('../src/Array');

const obj = [{
    someKey: 'parent level',
    skipKey: 'skip key',
    children: [{
        someKey: 'some value',
        anotherKey: 'value 1',
        children: [
            {
                someKey: 'another value',
                anotherKey: 'value 2',
            },
            {
                anotherKey: 'value 3',
                children: [{
                    someKey: 'bottom level',
                }],
            },
        ],
    }],
}];

const map = {
    '/^\\d+$/': {   // Define the top level key - numeric key (since arrays in JS has numeric keys)
        someKey: true,  // Specify that key "someKey" must be kept
        // Now define the recursive key map - the "map" filter will be applied for each memeber of the "children" field on each level
        children: _ => ['$_ref', _],
    },
};

const result = JasclibArray.cutByWhiteList(obj, map);   // Apply whitelist filtering

/* result:
[{
    "someKey": "parent level",
    "children": [{
        "someKey": "some value",
        "children": [
            {
                "someKey": "another value"
            },
            {
                "children": [{
                    "someKey": "bottom level"
                }]
            }
        ]
    }]
}]
//*/

// Note that only "someKey" and "children" keys left on each nest level, while the filter map was defined only once. 
```

### Conditional unset of the entire node
Predefined operator **`$_unset`**

Sometimes you may be not sure if you have to keep or delete the entire node before you get and check the data somewhere (deep) inside the node. 
With the `$_unset` operator you can conditionally keep/remove the entire node depending on the data somewhere in the node. 
Example:
```javascript
const JasclibArray = require('../src/Array');

const obj = {
    data: {
        a: {
            year: 2018,
            income: {},
            keepMe: true,
        },
        b: {
            year: 2018,
            income: {},
        },
        c: {
            year: 2017,
            income: {
                gross: 500,
                net: 100,
            },
        },
        d: {
            year: 2017,
            income: {
                gross: 600,
                net: 20,
            },
        },
    },
};

const map = {
    data: {
        '/.+/': {
            year: true, // Include "year" field into result
            // "income" field will be processed with a function where 1st arg "arg" is the value of the "income" field itself and
            // "container" is the entire parent of the node where the "income" is, e.g. {year: 2017, income: {gross: 500, net: 100}}
            income: (arg, container) => {
                if (!container.keepMe && container.year !== 2017) { // Unset the entire node if "keepMe" is not set or "year" is not 2017
                    return ['$_unset'];
                }

                if (arg.net < 50) { // Unset the entire node if "income.net" is lesser than 50
                    return ['$_unset'];
                }

                return arg; // Include the "income" node with its children into result
            },
        },
    },
};

const result = JasclibArray.cutByWhiteList(obj, map);   // Apply whitelist filtering

/* result:
{"data": {
    "a": {  // left because of "keepMe"
        "year": 2018,
        "income": {}
    },
    "c": {  // left because of "income.net" >= 50
        "year":2017,
        "income": {
            "gross": 500,
            "net": 100
        }
    }
}}
//*/
```
