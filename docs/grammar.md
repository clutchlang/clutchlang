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

**topLevelElement**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`class`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`function`<br>
&nbsp;&nbsp;;

### Elements

**function**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`SimpleName`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`parameterList?`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`"->"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;( `expression` | `block` )<br>
&nbsp;&nbsp;;

**parameterList**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"("`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`identifier*`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`")"`<br>
&nbsp;&nbsp;;

**property**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"let"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`SimpleName`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`"="`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

### Statements

**block**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"{"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`statement*`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`"}"`<br>
&nbsp;&nbsp;;

**return**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"return"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression?`<br>
&nbsp;&nbsp;;

### Expressions

#### Precedence

| Precedence | Title                        | Symbols                           |
|------------|------------------------------|-----------------------------------|
| _Highest_  |                              |                                   |
|            | _Literals_                   |                                   |
|            | Number                       |                                   |
|            | String                       |                                   |
|            | Boolean                      |                                   |
|            | Identifier                   |                                   |
| 14         | Grouping                     | `( … )`                           |
| 13         | Member Access                | `… . …`                           |
| 12         | Function Call                | `… ( …* )`                        |
| 11         | _Postfix_                    |                                   |
|            | Postfix Increment            | `… ++`                            |
|            | Postfix Decrement            | `… --`                            |
| 10         | _Prefix_                     |                                   |
|            | Logical Not                  | `! …`                             |
|            | Bitwise Not                  | `~ …`                             |
|            | Unary Positive               | `+ …`                             |
|            | Unary Negative               | `- …`                             |
|            | Prefix Increment             | `++ …`                            |
|            | Prefix Decrement             | `-- …`                            |
| 9          | _Multiplicative_             |                                   |
|            | Mulitplication               | `… * …`                           |
|            | Division                     | `… / …`                           |
|            | Remainder                    | `… % …`                           |
| 8          | _Additive_                   |                                   |
|            | Addition                     | `… + …`                           |
|            | Subtraction                  | `… - …`                           |
| 7          | _Bitwise Shift_              |                                   |
|            | Bitwise Left Shift           | `… << …`                          |
|            | Bitwise Right Shift          | `… >> …`                          |
| 6          | _Comparison_                 |                                   |
|            | Less Than                    | `… < …`                           |
|            | Less Than Or Equal           | `… <= …`                          |
|            | Greater Than                 | `… > …`                           |
|            | Greater Than Or Equal        | `… >= …`                          |
| 5          | _Equality_                   |                                   |
|            | Equality                     | `… == …`                          |
|            | Inequality                   | `… != …`                          |
|            | Identity                     | `… === …`                         |
|            | Unidentity                   | `… !== …`                         |
| 4          | Logical And                  | `… && …`                          |
| 3          | Logical Or                   | <code>… &#124;&#124; …</code>     |
| 2          | Conditional                  | `if … then …`                     |
| 1          | _Assignment_                 |                                   |
|            | Assign                       | `… = …`                           |
|            | Assign Increased By          | `… += …`                          |
|            | Assign Decreased By          | `… -= …`                          |
|            | Assign Multiplied By         | `… *= …`                          |
|            | Assign Divided By            | `… /= …`                          |
|            | Assign Remainder By          | `… %= …`                          |

#### Rules

**conditional**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"if"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp; &nbsp;&nbsp;( `expression` | `statementBlock` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`"else"?`<br>
&nbsp;&nbsp; &nbsp;&nbsp;( `expression` | `statementBlock` )<br>
&nbsp;&nbsp;;

**parenthesized**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"("`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`")"`<br>
&nbsp;&nbsp;;

**prefix**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"-"` | `"+"` | `"++"` | `"--"` | `"!"` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**postfix**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"++"` | `"--"` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**multiplicative**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"*"` |`"/"` | `"%"` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**additive**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"+"` |`"-"` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**comparison**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"<"` |`">"` | `"<="` | `">="` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**equality**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"=="` |`"!="` | `"==="` | `"!=="` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**conjunction**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"&&"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**disjunction**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"||"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**assignment**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"="` |`"+="` | `"-="` | `"*="` | `"/="` | `"%="` )<br>
&nbsp;&nbsp; &nbsp;&nbsp;`expression`<br>
&nbsp;&nbsp;;

**literalConstant**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`LiteralBoolean`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`LiteralNumber`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`LiteralString`<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`LiteralIdentifier`<br>
&nbsp;&nbsp;;

### Literals

**LiteralBoolean**:<br>
&nbsp;&nbsp;:&nbsp;&nbsp;( `"true"` | `"false"` )<br>
&nbsp;&nbsp;;

**LiteralNumber**: ~Roughly JavaScript (To be expanded).

**LiteralString**<br>
&nbsp;&nbsp;:&nbsp;&nbsp;`"'"`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`<any character other than "'">`<br>
&nbsp;&nbsp; &nbsp;&nbsp;`"'"`<br>
&nbsp;&nbsp;;

**LiteralIdentifier**: ~Roughly JavaScript (To be expanded).
