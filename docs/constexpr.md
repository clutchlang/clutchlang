# constexpr

constexpr allows limited compile-time computation of values. The set of allowed statements is much less than the full clutchlang language, but in return we can remove the runtime cost entirely.

### Restrictions on constexpr
- A constexpr is an expression composed of primitive operations on numbers and/or booleans.
- A constexpr may invoke other constexpr functions.
- A constexpr may not access static scope or externs.
- A constexpr may not depend on user-defined types.

### API guidelines
- Removing the 'constexpr' from a function declaration is considered a breaking change.

### Usage guidelines
- A function must declare that it is a constexpr and the evaluation of this constexpr must declare that it is const.
- A constexpr may be invoked without a corresponding const, in which case it will not be evaluated until runtime.
- Non-optimized builds may choose to skip const evaluation for a faster compile.

## Supported operators

| Type          | Operators                                   |
| ------------- |---------------------------------------------|
| number        | +, -, *, /, %, >, >=, <=, <, ==, !=, ++, -- |
| boolean       | &&, ||, !, ==, !=                           |

## Example

```
// declare a constexpr.
constexpr fib(n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)

// invoke a constexpr
const value = fib(3)
```

This will be compiled to

```javascript
const value = 3;
```