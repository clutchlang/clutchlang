# const

A const function allows limited compile-time computation of values. The set of allowed statements is much less than the full clutchlang language, but in return we can remove the runtime cost entirely.

### Restrictions on const functions
- A const function is an expression composed of primitive operations on numbers and/or booleans.
- A const function may invoke other const functions.
- A const function may not access static scope or externs.
- A const function may not depend on user-defined types.

### API guidelines
- Removing the 'const' from a function declaration is considered a breaking change.

### Usage guidelines
- A const function  must declare that it is a const and the invoaction of this function may declare that it is const.
- A const function may be invoked without a corresponding const, in which case it will not be evaluated until runtime.
- Non-optimized builds may choose to skip const evaluation for a faster compile.

## Supported operators

| Type          | Operators                                   |
| ------------- |---------------------------------------------|
| number        | +, -, *, /, %, >, >=, <=, <, ==, !=, ++, -- |
| boolean       | &&, ||, !, ==, !=                           |

## Example

```
// declare a const function.
const fib(n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)

// invoke a const function.
let const value = fib(3)
```

This will be compiled to

```javascript
const value = 3;
```