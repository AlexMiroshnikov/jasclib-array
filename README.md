# jasclib-array
[![npm version](https://badge.fury.io/js/jasclib-array.svg)](https://badge.fury.io/js/jasclib-array)
[![Build Status](https://travis-ci.org/AlexMiroshnikov/jasclib-array.svg?branch=master)](https://travis-ci.org/AlexMiroshnikov/jasclib-array)

Configurable array/object helpers for JavaScript

### Install
`npm i --save jasclib-array`

### Usage
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
