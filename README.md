![Clutch Logo](https://user-images.githubusercontent.com/168174/45592313-6d608680-b91e-11e8-8edd-f12ee6e74824.png)

[![Build Status](https://travis-ci.org/clutchlang/clutchlang.svg?branch=master)][1]
[![Coverage Status](https://coveralls.io/repos/github/clutchlang/clutchlang/badge.svg?branch=master)][2]
[![License is MIT](https://img.shields.io/github/license/mashape/apistatus.svg)][3]

[1]: https://travis-ci.org/clutchlang/clutchlang
[2]: https://coveralls.io/github/clutchlang/clutchlang?branch=master
[3]: https://choosealicense.com/licenses/mit/

# Clutch

_Clutch_ is an expression-oriented and object-oriented modern programming that compiles to JavaScript.

```cl
fib(n: Number): Number -> if n < 2 then n else fib(n - 1) + fib(n - 2)
```

```js
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
```

_Clutch_'s goals:

* Make functional programming a delight but keep aproachable to traditional use
* Defaults that prefer immutability and optimizations
* Low overhead compilation and interpoability to and with JavaScript

**STATUS**: _Highly experimental_. Currently is a [CoffeScript][1]-like tool
that does a 1:1 transpilation of most of Clutch's syntax to the equivalent in
JavaScript. The goal, of course, is to become a complete static language, so we
are pretty far from that!

[1]: https://coffeescript.org/

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

## Learn more

* [Grammar](docs/grammar.md)
* [Semantics](docs/semantics.md)
