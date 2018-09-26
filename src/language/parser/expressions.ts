import { IToken } from '../lexer';
import { Expression, SimpleNode } from './nodes';
import { Operator } from './operators';
import { StatementBlock } from './statements';
import { AstVisitor } from './visitors';

/**
 * An expression formed with an @member operator and a @member target.
 */
export abstract class OperatorExpression extends Expression {
  constructor(
    public readonly target: Expression,
    public readonly operator: Operator,
    protected readonly operatorToken: IToken
  ) {
    super();
  }
}

/**
 * An expression of the former `<OP><EXPR>` or `<EXPR><OP>`.
 */
export class UnaryExpression extends OperatorExpression {
  constructor(
    target: Expression,
    operator: Operator,
    operatorToken: IToken,
    protected readonly isPrefix: boolean
  ) {
    super(target, operator, operatorToken);
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitUnaryExpression(this);
  }

  public get firstToken(): IToken {
    return this.isPrefix ? this.operatorToken : this.target.firstToken;
  }

  public get lastToken(): IToken {
    return this.isPrefix ? this.target.lastToken : this.operatorToken;
  }
}

/**
 * An expression of the former `<LEFT><OPERATOR><RIGHT>`.
 */
export class BinaryExpression extends OperatorExpression {
  constructor(
    public readonly left: Expression,
    operator: Operator,
    operatorToken: IToken,
    public readonly right: Expression
  ) {
    super(left, operator, operatorToken);
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitBinaryExpression(this);
  }

  public get firstToken(): IToken {
    return this.left.firstToken;
  }

  public get lastToken(): IToken {
    return this.right.lastToken;
  }
}

/**
 * Represents an `if` expression.
 */
export class IfExpression extends Expression {
  public readonly firstToken: IToken;
  public readonly lastToken: IToken;

  constructor(
    public readonly ifToken: IToken,
    public readonly condition: Expression,
    public readonly body: Expression | StatementBlock,
    public readonly elseToken?: IToken,
    public readonly elseBody?: Expression | StatementBlock
  ) {
    super();
    this.firstToken = ifToken;
    this.lastToken = elseBody ? elseBody.lastToken : body.lastToken;
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitIfExpression(this);
  }
}

export class InvokeExpression extends Expression {
  constructor(
    public readonly target: Expression,
    public readonly openToken: IToken,
    public readonly parameters: Expression[],
    public readonly closeToken: IToken
  ) {
    super();
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitInvokeExpression(this);
  }

  public get firstToken(): IToken {
    return this.target.firstToken;
  }

  public get lastToken(): IToken {
    return this.closeToken;
  }
}

/**
 * A literal boolean compatible with JavaScript.
 */
export class LiteralBoolean extends SimpleNode implements Expression {
  constructor(token: IToken, public readonly value: boolean) {
    super(token);
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitLiteralBoolean(this);
  }
}

/**
 * A literal number compatible with JavaScript.
 */
export class LiteralNumber extends SimpleNode implements Expression {
  constructor(token: IToken, public readonly value: number) {
    super(token);
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitLiteralNumber(this);
  }
}

/**
 * A literal string compatible with JavaScript.
 *
 * Strings in Clutch are supported single and multi-line. A multi-line string
 * automatically has baseline indentation normalization. For example, the
 * following:
 * ```
 * let x = '
 *   Hello
 *     World!
 * '
 * ```
 *
 * ... is identical to:
 * ```
 * 'Hello\n  World!'
 * ```
 */
export class LiteralString extends SimpleNode implements Expression {
  constructor(token: IToken, public readonly value: string) {
    super(token);
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitLiteralString(this);
  }
}

/**
 * Represents a reference to some identifier by name.
 */
export class SimpleName extends SimpleNode implements Expression {
  constructor(token: IToken, public readonly name: string) {
    super(token);
  }

  public accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitSimpleName(this);
  }
}
