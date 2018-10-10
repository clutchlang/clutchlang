import * as tokens from "./token";

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
 * Represents an operator.
 */
export class Operator extends SimpleNode {}

/**
 * Represents a marker type of AST node for all expressions.
 */
export abstract class Expression extends AstNode {}

/**
 * Represents a simple AST node that is also an expression.
 */
export abstract class SimpleExpression extends Expression {
  constructor( 
    private readonly token: tokens.Token,
  ) {
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
    public readonly target: Expression,
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
    public readonly right: Expression,
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
export abstract class PropertyExpression extends Expression {
  constructor(
    public readonly target: Expression,
    public readonly property: Identifier
  ) {
    super();
  }
}

export class AstParser {

}

export class AstVisitor {

}
