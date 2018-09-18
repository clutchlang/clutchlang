![Clutch Logo](https://user-images.githubusercontent.com/168174/45592313-6d608680-b91e-11e8-8edd-f12ee6e74824.png)

[![Build Status](https://travis-ci.org/clutchlang/clutchlang.svg?branch=master)][1]
[![Coverage Status](https://coveralls.io/repos/github/clutchlang/clutchlang/badge.svg?branch=master)][2]
[![License is MIT](https://img.shields.io/github/license/mashape/apistatus.svg)][3]

[1]: https://travis-ci.org/clutchlang/clutchlang
[2]: https://coveralls.io/github/clutchlang/clutchlang?branch=master
[3]: https://choosealicense.com/licenses/mit/

# Clutch

_Clutch_ is a compile-to-JS expression-oriented and object-oriented modern programming.

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

### `EXPRESSION`

::= 
  [`LITERAL`](#literal) |
 `(` [`EXPRESSION`](#expression) `)`

#### `LITERAL`

::=
 [`NUMBER`](#number) |
 [`BOOLEAN`](#boolean) |
 [`STRING`](#string)

##### `NUMBER`

::= `/-?\d+\.?\d*/` | `/0[xX][0-9a-fA-F]+/`

##### `BOOLEAN`

::= `/true|false/`

##### `STRING`

::= `/(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/`
