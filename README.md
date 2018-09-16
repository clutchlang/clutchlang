_Clutch_ is an experimental compile-to-JS language.

[![Build Status](https://travis-ci.org/clutchlang/clutchlang.svg?branch=master)][1]
[![Coverage Status](https://coveralls.io/repos/github/clutchlang/clutchlang/badge.svg?branch=master)][2]
[![License is MIT](https://img.shields.io/github/license/mashape/apistatus.svg)][3]

[1]: https://travis-ci.org/clutchlang/clutchlang
[2]: https://coveralls.io/github/clutchlang/clutchlang?branch=master
[3]: https://choosealicense.com/licenses/mit/

## Overview

_Clutch_ is an expression-oriented and object-oriented modern programming
language that compiles to idiomatic _JavaScript_ for execution within a browser
or NodeJS.

```
main => print('Hello World)
```

_Clutch_'s goals:

* Make functional programming a delight but keep aproachable to traditional use
* Defaults that prefer immutability and optimizations
* Low overhead compilation and interpoability to and with JavaScript

## Grammar

### `COMPILATION_UNIT`

::= [`FUNCTION`](#function)+

### `FUNCTION`

::= 
 [`IDENTIFIER`](#identifier) `=>`
 [`EXPRESSION`](#expression) | `{` [`EXPRESSION`](#expression)+ `}`

### `IDENTIFIER`

::= `/[_a-zA-Z][_a-zA-Z0-9]{0,30}/`

### `EXPERSSION`

::= 
 [`LITERAL`](#literal) |
 `(` [`EXPRESSION`](#expression) `)`

#### `LITERAL`

::=
[`NUMBER`](#number) |
 [`BOOLEAN`](#boolean) |
 [`STRING`](#string)

##### `NUMBER`

::= `/-?\d+\.?\d*/`

##### `BOOLEAN`

::= `/true|false/`

##### `STRING`

::= `/(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/`
