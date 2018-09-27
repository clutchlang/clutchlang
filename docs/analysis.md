# Static Analysis

The _compiler_ and other _static analysis tools_, such as IDE and command-line
analysis, must issue a variety of static diagnostic messages, some of which are
fatal, and others that may be ignored.

## Categories

| Category | False positives | Can ignore | Can ignore to **run** an _app_ | Can ignore to **publish** a _library_ |
|----------|-----------------|------------|--------------------------------|---------------------------------------|
| Error    | None            | No         | No                             | No                                    |
| Warning  | None            | Yes        | Yes                            | No                                    |
| Hint     | <1%             | Yes        | Yes                            | Yes                                   |
| Tip      | <5%             | Yes        | Yes                            | Yes                                   |

### Errors

**Fatal** conditions in either _parsing_ or _resolving_ source inputs, that
prohibit compilation. An error is considered a _violation_ of the language,
invalid or unsupported syntax, or other factors that make compilation
impossible.

Adding (or removing) _errors_ is considered a **breaking change**.

Some examples:

* Syntax errors; e.g. invalid or misplaced characters or tokens.
* Static errors; e.g. undefined or twice-defined elements.
* Type errors; e.g. a violation of the type system or inheritance.
* Semantic errors; e.g. would statically violate semantics of the language.

### Warnings

**Non-fatal** conditions that normally occur in _resolving_ source inputs that
do _not_ prohibit compilation but may indicate either undefined or undesired
behavior, such as a guaranteed runtime error. _Most_ production programs will
want and may consider warnings fatal.

Adding (or removing) _warnings_ is **not** a breaking change, as it will not
effect existing published libraries or production apps, though they will need to
be resolved to continue publishing libraries, and should be only be added
without bumping the major version when they add high value.

The goal of all warnings should be to be eventually promoted to an _error_,
otherwise the _hint_ category may be a better fit as an indication that code
is _likely_ incorrect.

Some examples:

* _New_ syntax, static, type, or semantic issues that still allow compilation.
* API usage that will be removed or modified in the immediate future.

### Hints

**Non-fatal** conditions that normally occur in _resolving_ source inputs that
do _not_ prohibit compilation but usually indicate undesired behavior, unused or
unneeded code, potentially with a very small chance of false positives (< 1%).

Adding (or removing) _hints_ are **not** a breaking change, and will not effect
existing or developing libraries or apps, though they likely require attention
from developers. It is possible to add non-specification (opt-out) checks.

Some examples:

* An _usused_ local member or private or module-private element.
* Local or module-local dead code or unncessary branch analysis.
* API usage that will be removed or modified in the near future.
* Frameworks custom highlighting code that they consider an error/warning/hint.

### Tips

**Non-fatal** conditions that are _suggestions_ for code health, stylistic
issues, that are meant to guide and assist code reviews and consistency to use
of _idiomatic_ language syntax and semantics, potentially with a small chance of
false positives (< 5%).

Adding (or removing) _tips_ are **not** a breaking change, and will not effect
existing or developing libraries or apps. It is a recommended workflow option to
_only_ show tips on _new_ or _modified_ lines of code - a sort of "hey you might
have meant X" or "did you consider Y?".

Some examples:

* Not using idiomatic language or libraries.
* Not using suggested formatting and the automated formttter.
* A high but possibly incorrect analysis of a branch of code.
