# jasclib-array
[![npm version](https://badge.fury.io/js/jasclib-array.svg)](https://badge.fury.io/js/jasclib-array)
[![Build Status](https://travis-ci.org/AlexMiroshnikov/jasclib-array.svg?branch=master)](https://travis-ci.org/AlexMiroshnikov/jasclib-array)
[![Coverage Status](https://coveralls.io/repos/github/AlexMiroshnikov/jasclib-array/badge.svg?branch=master)](https://coveralls.io/github/AlexMiroshnikov/jasclib-array?branch=master)

Configurable array/object helpers for JavaScript

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
### Conditional unset of the entire node
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

### Applying rules recursively
Predefined operator **`$_unset`**

