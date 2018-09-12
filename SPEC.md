_This in a work-in-progress._

# Grammar

`COMPILATION_UNIT` ::=
  * `FUNCTION`+ <sup>Optional</sup>

`FUNCTION` ::=
  * `IDENTIFIER`
  * `PARAMETERS` <sup>Optional</sup>
  * `=>`
  * `EXPRESSION` | `BLOCK`

`IDENTIFIER` ::= **TODO:** Fill in.

`PARAMETERS` ::=
  * `(`
  * `PARAMETER`+
  * `)`

`PARAMETER` ::=
  * `IDENTIFIER`
  * `:` `IDENTIFIER` <sup>Optional</sub>
  * `,` <sup>Optional for last<sup>

`EXPRESSION` ::=
  * `LITERAL`

`LITERAL` ::=
  * `NUMBER` | `BOOLEAN` | `STRING`

`BLOCK` ::=
  * `{`
  * `STATEMENT`+
  * `}`

`STATEMENT` ::=
  * `EXPRESSION`

# Examples

## Variables

```
main => {
  let name = 'Matan'
}
```

## Invocations

```
main => {
  let cat = Cat()
  cat.name = 'Snowball'
  cat.meow()
}
```

## Functions

```
// Top-level function named main.
//
// Implicit:
// * Returns void.
// * No parameters.
main => {
  
}

// Top-level function named check.
//
// Implicit:
// * Returns bool (true).
// * No parameters.
check => true

// Top-level function named capitalize.
capitalize (word: string) => string {
  return // ...
}
```

## Types

```
main => {
  // Inferred type.
  let dog = Dog()

  // Explicit type.
  let cat: Cat = Cat()
}
```
