import * as tokens from './token';

/**
 * Represents an unresolved node in the abstract syntax tree.
 */
export abstract class AstNode {
  /**
   * First token that represents this AST node.
   */
  public abstract get first(): tokens.Token;

  /**
   * Last token that represents this AST node.
   */
  public abstract get last(): tokens.Token;
}

/**
 * Represents a simple AST node that originates from a single token.
 */
export abstract class SimpleNode extends AstNode {
  constructor(protected readonly token: tokens.Token) {
    super();
  }

  public get first(): tokens.Token {
    return this.token;
  }

  public get last(): tokens.Token {
    return this.token;
  }
}

/**
 * Represents an operator node parsed from a single token.
 */
export class Operator extends SimpleNode {}

/**
 * Represents a marker type of AST node for all statements.
 */
export abstract class Statement extends AstNode {}

/**
 * Represents a marker type of AST node for all expressions.
 */
export abstract class Expression extends Statement {}

/**
 * Represents a simple AST node that is also an expression.
 */
export abstract class SimpleExpression extends Expression {
  constructor(protected readonly token: tokens.Token) {
    super();
  }

  public get first(): tokens.Token {
    return this.token;
  }

  public get last(): tokens.Token {
    return this.token;
  }
}

/**
 * Represents an expression that utilizes an operator.
 */
export abstract class OperatorExpression extends Expression {
  constructor(
    public readonly operator: Operator,
    public readonly target: Expression
  ) {
    super();
  }
}

/**
 * Represents an expression in the form of `<OP><EXPR>`.
 */
export class PrefixExpression extends OperatorExpression {
  public get first(): tokens.Token {
    return this.operator.first;
  }

  public get last(): tokens.Token {
    return this.target.last;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP>`.
 */
export class PostfixExpression extends OperatorExpression {
  public get first(): tokens.Token {
    return this.target.first;
  }

  public get last(): tokens.Token {
    return this.operator.last;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP><EXPR>`.
 */
export class BinaryExpression extends OperatorExpression {
  constructor(
    operator: Operator,
    public readonly left: Expression,
    public readonly right: Expression
  ) {
    super(operator, left);
  }

  public get first(): tokens.Token {
    return this.left.first;
  }

  public get last(): tokens.Token {
    return this.right.last;
  }
}

/**
 * Represents an expression in the form of `<TARGET>.<PROPERTY>`.
 */
export class PropertyExpression extends Expression {
  constructor(
    public readonly target: Expression,
    public readonly property: Identifier
  ) {
    super();
  }

  public get first(): tokens.Token {
    return this.target.first;
  }

  public get last(): tokens.Token {
    return this.property.last;
  }
}

/**
 * Represents a list of arguments passed to a function call.
 */
export class ArgumentList extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly args: Expression[],
    public readonly last: tokens.Token
  ) {
    super();
  }
}

/**
 * Represents an expression for a function call.
 *
 * May _optionally_ contain a @member target.
 */
export class CallExpression extends Expression {
  constructor(
    public readonly name: Identifier,
    public readonly args: ArgumentList,
    public readonly target?: Expression
  ) {
    super();
  }

  public get first(): tokens.Token {
    return (this.target || this.name).first;
  }

  public get last(): tokens.Token {
    return this.args.last;
  }
}

/**
 * Represents an expression for a literal identifier (name).
 */
export class Identifier extends SimpleExpression {
  public get name(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents an expression for a literal boolean.
 */
export class LiteralBoolean extends SimpleExpression {
  public get value(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents an expression for a literal number.
 */
export class LiteralNumber extends SimpleExpression {
  public get value(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents an expression for a literal string.
 */
export class LiteralString extends SimpleExpression {
  public get value(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents a variable declared anywhere in scope.
 */
export class VariableDeclaration extends AstNode {
  constructor(
    public readonly name: Identifier,
    public readonly type?: Identifier,
    public readonly value?: Expression
  ) {
    super();
  }

  public get first(): tokens.Token {
    return this.name.first;
  }

  public get last(): tokens.Token {
    return (this.value || this.type || this.name).last;
  }
}

/**
 * Represents a list of parameters for a function or closure definition.
 */
export class ParameterList extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly params: VariableDeclaration[],
    public readonly last: tokens.Token
  ) {
    super();
  }
}

/**
 * Represents a series of statements.
 */
export class StatementBlock extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly statements: Statement[],
    public readonly last: tokens.Token
  ) {
    super();
  }
}

/**
 * Represents a function declared anywhere in scope.
 */
export class FunctionDeclaration extends AstNode {
  constructor(
    public readonly name: Identifier,
    public readonly params: ParameterList,
    public readonly body: Expression | StatementBlock,
    public readonly returnType?: Identifier
  ) {
    super();
  }

  public get first(): tokens.Token {
    return this.name.first;
  }

  public get last(): tokens.Token {
    return this.body.last;
  }
}

/**
 * Represents a type declared anywhere in scope.
 */
export class TypeDeclaration extends AstNode {
  constructor(
    public readonly modifiers: tokens.Token[],
    public readonly name: Identifier,
    public readonly members: Array<FunctionDeclaration | VariableDeclaration>,
    public readonly last: tokens.Token
  ) {
    super();
  }

  public get first(): tokens.Token {
    return this.modifiers.length ? this.modifiers[0] : this.name.first;
  }
}

export class AstParser {}

/**
 * Interface for visiting every known concrete implementation of @see AstNode.
 *
 * May optionally pass around a contextual object "C", and return an "R".
 */
export interface IAstVisitor<R, C> {
  visitArgumentList(node: ArgumentList, context?: C): R;
  visitCallExpression(node: CallExpression, context?: C): R;
  visitFunctionDeclaration(node: FunctionDeclaration, context?: C): R;
  visitIdentifier(node: Identifier, context?: C): R;
  visitLiteralBoolean(node: LiteralBoolean, context?: C): R;
  visitLiteralNumber(node: LiteralNumber, context?: C): R;
  visitLiteralString(node: LiteralString, context?: C): R;
  visitParameterList(node: ParameterList, context?: C): R;
  visitPrefixExpression(node: PrefixExpression, context?: C): R;
  visitPostfixExpression(node: PostfixExpression, context?: C): R;
  visitPropertyExpression(node: PropertyExpression, context?: C): R;
  visitTypeDeclaration(node: TypeDeclaration, context?: C): R;
  visitVariableDeclaration(node: VariableDeclaration, context?: C): R;
}
