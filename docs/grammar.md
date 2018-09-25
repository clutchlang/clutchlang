# Grammar

## Notation

This section informally explains the grammar notation used below.

### Symbols and naming

_Terminal symbol_ names start with an uppercase letter, e.g. `Identifier`.<br>
_Nonterminal symbol_ names start with a lowercase leter, e.g. `clutchFile`.<br>
Each _production_ starts with a colon (`:`).<br>
Symbol _definitions_ may have many productions terminated by a semicolon (`;`).<br>
Symbol definitions may be prepended with _attributes_, e.g. `start`.

### EBNF expressions

Operator `|` denotes _alternative_.<br>
Operator `*` denotes _iteration_ (zero or more).<br>
Operator `+` denotes _iteration_ (one or more).<br>
Operator `?` denotes _option_ (zero or one).<br>
alpha `{` beta `}` denotes a nonempty _beta_-seperated list of _alpha_'s.<br>
Operator `++` means that no space or comment is allowed between operands.

## A note on whitespace

Clutch does not require or support semicolons, and instead relies on whitespace
as significant for terminating expressions and statements. Most of the time this
is fairly intuitive. We currently are exploring strategies for the following:

* `fn(foo (bar))`: Is this (as JS) `fn(foo, (bar))` or `fn(foo(bar))`?
* `fn(foo -bar)`: Is this (as JS) `fn(foo, -bar)` or `fn(foo - bar)`?

See ["Design Note: Implicit Semiclons"][1] in _Crafting Interpreters_ for more.

[1]: http://craftinginterpreters.com/scanning.html#design-note

## Syntax

start<br>
**clutchFile**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`topLevelElement*`<br>
&nbsp;&nbsp;;

*topLevelElement**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`class`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`function`<br>
&nbsp;&nbsp;;

### Functions

**function**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;... TBD ...<br>
&nbsp;&nbsp;;

### Classes

**class**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;... TBD ...<br>
&nbsp;&nbsp;;

### Expressions

#### Precedence

| Precedence | Title          | Symbols               |
|------------|----------------|-----------------------|
| Highest    | Postfix        | ++, --, .             |
|            | Prefix         | -, +, ++, --, !       |
|            | Multiplicative | *, /, %               |
|            | Additive       | +, -                  |
|            | Comparison     | <, >, <=, >=          |
|            | Equality       | ==, !=, ===, !==      |
|            | Conjunction    | &&                    |
|            | Disjunction    | ||                    |
| Lowest     | Assignment     | =, +=, -=, *=, /=, %= |

#### Rules

... TBD ...

### Literals

... TBD ...
