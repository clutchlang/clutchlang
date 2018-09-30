_Clutch_ has a simple _module_ and _packaging_ system that enforces sane
defaults that encourage good practices, fast incremental compilation, and stays
out of the way for most users.

# Modules

_Modules_ are units of code _reuse_, and allow importing _other_ modules'
functions, fields, and types while enforcing what of your own functions, fields,
and types are visible to other modules.

By default, code is scoped to an implicit _default_ module that is inaccessible
to other modules in any manner. This allows creating a simple single-file script
or application without having to create modules at all:

```
// Default module. Nobody else can see or import "main".
main => print('Hello World')
```

## Defining

To define a _new_ module, just use the `module` keyword:

```
// src/server.cl; Name of this module is implicitly "server".
module
```

It's possible to create multiple modules in a single file using module _blocks_:

```
// src/lib.cl
module server {
  // server.*
}

module client {
  // client.*
}
```

Or to use the file system to define multiple modules:

```
├── /src
    └── server.cl
    └── client.cl
```

To create a hierachy of modules in a single file, use `module <name> { … }`:

```
module network {
  // network.*

  module client {
    // network.client.*
  }

  module server {
    // network.server.*
  }
}
```

Or to use the file system to define multiple modules:

```
├── /src
    └── network.cl
    └── /network
        └── client.cl
        └── server.cl
```

## Importing

The `import` keyword can be used to import other modules into scope:

```
import network:Connection
//     ^^^^^^^ ^^^^^^^^^^
//     Module  (Class, Function, or Field)
```

To import _multiple_ items from a single module:

```
import network {
  Connection
  ConnectionPool
}
```

To import modules _within_ the current package root (`src/**`):

```
import ::network.Connection
```

To import modules accessible via a package _alias_:

```
import @vendor::network.Connection
       ^^^^^^   ^^^^^^^
       Name     Dependency package containing this module
```

## Visibility

By _default_, all modules and their contents are considered _private_ - that is:

* A _module root_ is a set of modules under a _package_ (in `src/*`).
* A private module `M` is not visible outside of its containing package.
* A private module `M` is visible from its parent module `P` and `P`'s children.

The `export` keyword can be added to make a module _public_:

```
export module
```

More precise control can be controlled using `export … to …`, where `to` may be:

* `*`: (Default)
* `name, …`: A set of additional module names to make the module visible to.

# Packages

As mentioned previously above, _modules_ are used for incremental compilation
and for code reuse, while _packages_ are used for versioning and publishing
sets of modules. Packages are entirely _optional_, and in fact it is possible to
create your _own_ package system.

_**TODO**: Explain package management options when they exist._
