_This in a work-in-progress._

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
