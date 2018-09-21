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

## Running

There is a simple script, `npm run clc`, which supports an experimental CLI:

```bash
# Compiles and outputs path/to/file.cl.js
$ npm run clc -- path/to/file.cl
```

To print the debug AST tree instead of JavaScript, add `--parse` or `-p`:

```bash
# Prints to stdout
$ npm run clc -- path/to/file.cl -p
```

To run in _worker-mode_, i.e. run the CLI and continously receive input:

```bash
# Write on stdin. Two newline characters triggers a compile
$ npm run clc -- -w
```

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
  [`PARENTHESIZED`](#parenthesized) |
  [`INVOCATION`](#invocation)

#### `PARENTHESIZED`

::=
  `(` [`EXPRESSION`](#expression)+ `)`

#### `INVOCATION`

::=
 [`EXPRESSION`](#expression) `(` [`EXPRESSION`](#expression)+ `)`

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

## Specification

_The following section is **aspirational**, and not yet implemented._

### Pipeline

The following steps are performed during compilation:
1. **Lexing** of a file to a stream of tokens.
  - Some invalid grammar is caught and reported.

2. **Parsing** of tokens to an unresolved AST.
  - At this point the entire grammar has been validated.

3. **Resolving** of the AST into a semantic module.
  - At this point the individual modules are valid.

4. **Linking** of semantic modules into a program.
  - At this point the entire program is valid.

5. **Outputing** as a runnable format (i.e. JavaScript).

### Modules

A `module` enable information hiding, code sharing, and separate compilation.

#### Inspiration

* https://nim-lang.org/docs/manual.html#modules
* https://crystal-lang.org/docs/syntax_and_semantics/modules.html
* https://doc.rust-lang.org/book/first-edition/crates-and-modules.html
* https://www.typescriptlang.org/docs/handbook/module-resolution.html
* https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html

#### Important

Modules should be ...

* _incrementally_ compile-able.
* _optimizable_.
* _hermetic_ with a well-defined structure and traversal.
* _friendly_ to common visibility/accessor patterns in static languages.

Modules should not ...

* Create an import _cycle_.

### Type System

TBD.

### Runtime

TBD.
