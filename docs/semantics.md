**WARNING**: This is a _working_ document, and is not currently accepted. Some
syntax is entirely hypothetical, or borrowed from other languages in order to
make the examples understandable.

## Types

... TBD ...

## Methods

### Tearoffs

... TBD ...

### Extension Methods

_Extension methods_ allows users to seemingly "patch" existing APIs by giving
an ergonmic and discoverable way to interact with older APIs. It works well for
compilation to JavaScript because extension methods _must_ be monomorphically
dispatched, and can be desugared:

```
main {
  a.someExtension()
}
```

_... compiles to:_

```js
function main() {
  someExtension(a);
}
```

* Kotlin: https://kotlinlang.org/docs/reference/extensions.html
* Swift: https://docs.swift.org/swift-book/LanguageGuide/Extensions.html
* C#: https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods

```
class A {
  name: String
}

extends A {
  get firstName => name.split(' ')[0]
}

main {
  let a = A(
    name = 'Tom Riddle'
  )
  print(a.name)       // Tom Riddle
  print(a.firstName)  // Tom
}
```

**Open questions:**

1. Should you be able to _overload_ with extension methods?
  ```
  class A {
    foo() -> {}
  }

  extends A {
    foo(name: String) -> {}
  }

  main {
    let a = A()
    a.foo()
    a.foo('Bar')
  }
  ```

2. Should you be able to hide or shadow an existing member?
  ```
  class A {
    foo() -> print('foo1')
  }

  extends A {
    foo() -> print('foo2')
  }

  main {
    let a = A()
    a.foo() // foo2
  }
  ```

### Overloaded Methods

_Overloaded methods_ allows API designers to focus on terse APIs that can take
a variety of parameters (and parameter types) and interact differently.

* Java: https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html
* TypeScript: https://www.typescriptlang.org/docs/handbook/functions.html
* C#: https://msdn.microsoft.com/en-us/library/5dhe1hce.aspx

```
class A {
  write (text: String) -> print('String: $text')
  write (text: Number) -> print('Number: $text')
}

main {
  let a = A()
  a.write('ABC') // String: ABC
  a.write(12345) // Number: 12345
}
```

### Operator Overloads

... TBD ...

## Equality

JavaScript has _historically_ confusing equality semantics:

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness

> * Abstract Equality Comparison (`==`)
> * Strict Equality Comparison (`===`)
> * SameValue (`Object.is`)

However, deviating too far from built-in equality semantics or trying to define
custom ones (like Dart) means that the most common operations (`==`) ends up
becoming potentially expensive and have too much impact for dead code
elimination.

It's accepted there should be a strict (identity) based equality comparison
(i.e. `===`), but it's less clear if there should be a different or
user-implementable comparison (`==`). If we did add `==`, we'd want it to have
the following properties:

* Reflexivity: If `a == b`, `b == a`, if `a != b`, `b != a`.
* Transitivty: If `a == b && b == c`, `a == c`.

**Open question:** What semantics should Clutch have?

### Only identity-based equality

That is, _only_ `===`, or change `==` to compile to `===`:

```
main => {
  print(1 == '1')
  print(1 == 1)
}
```

... compiles to:

```js
function main() {
  print(1 === '1');
  print(1 === 1);
}
```

### Equality requires monomorphic dispatch and precise types

We could allow `==` only on _precise_ types (i.e. types that are statically
exactly the same and do not rely on polymorphism at all). For example, in the
following snippet:

```
main => {
  print(1 == 1)   // OK: true
  print(1 == '1') // ERROR: Cannot compare Number to String
}
```

Upcasting would also be prohibited:

```
main => {
  let a: Object = 1
  let b: Object = '1'
  print(a == b)   // ERROR: Cannot compare polymorphic types
}
```

And likely we would need a way to enforce precise types in signatures:

```
compare (
  a: precise Animal
  b: precise Animal
) => {
  print(a == b)  // OK
}

main => {
  ...
}
```

A custom `HashMap<K, V>` would have to be `HashMap<precise K, V>`, but could
also have good performance and code-size when compiled to JavaScript due to the
restricted set of semantics.

**Upsides**:

* Strictly enforces, at compile-time, _reflexivity_ and _transitivity_ rules.
* Optimal JS; primitives compile to `==`, objects compile to `target.$eq(...)`.
* Could be easily auto-generated for value/data/record immutable classes.

**Downsides**:

* Extremely strict, makes polymorphism incovenient.
* Some users will likely still need to make their own `equals(...)` method.
* Not clear if provides enough to be more useful than `===` on its own.
