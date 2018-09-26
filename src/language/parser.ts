import { splitLines, unescapeString } from '../agnostic/strings';
import { IToken } from './lexer';

export class AstNodeFactory {
  public createUnaryExpression(
    target: Expression,
    operator: Operator,
    operatorToken: IToken,
    isPrefix: boolean
  ) {
    return new UnaryExpression(target, operator, operatorToken, isPrefix);
  }

  public createBinaryExpression(
    left: Expression,
    operator: Operator,
    operatorToken: IToken,
    right: Expression
  ) {
    return new BinaryExpression(left, operator, operatorToken, right);
  }

  public createSimpleName(token: IToken): SimpleName {
    return new SimpleName(token, token.lexeme);
  }

  public createLiteralBoolean(token: IToken): LiteralBoolean {
    return new LiteralBoolean(token, token.lexeme === 'true');
  }

  public createLiteralNumber(token: IToken): LiteralNumber {
    return new LiteralNumber(token, this.parseLiteralNumberValue(token.lexeme));
  }

  public createLiteralString(token: IToken): LiteralString {
    return new LiteralString(token, this.parseLiteralStringValue(token.lexeme));
  }

  protected parseLiteralNumberValue(lexeme: string) {
    return /^0(x|X)/.test(lexeme) ? parseInt(lexeme, 16) : parseFloat(lexeme);
  }

  protected parseLiteralStringValue(lexeme: string): string {
    const lines = splitLines(lexeme);
    if (lines.length === 0) {
      return '';
    }
    if (lines.length === 1) {
      return unescapeString(lines[0]);
    }
    const buffer: string[] = [];
    let l = 1;
    let line = unescapeString(lines[l]);
    const baseline = line.length - line.trimLeft().length;
    l--;
    while (l++ < lines.length - 1) {
      line = unescapeString(lines[l]);
      buffer.push(line.substring(baseline));
    }
    return buffer.join('\n');
  }
}

/**
 * Base class for anything in the syntax tree.
 */
export abstract class AstNode {
  /**
   * The first token that was scanned to form this node.
   */
  public abstract get firstToken(): IToken;

  /**
   * The last token that was scanned to form this node.
   */
  public abstract get lastToken(): IToken;
}

/**
 * Base class for any statement.
 */
export abstract class Statement extends AstNode {}

/**
 * Base class for any expression.
 */
export abstract class Expression extends AstNode implements Statement {}

/**
 * Valid categories for operators, ordered by precedence.
 */
export enum Precedence {
  Postfix,
  Prefix,
  Multiplicative,
  Additive,
  Comparison,
  Equality,
  Conjunction,
  Disjunction,
  Assignment,
}

/**
 * Valid operators.
 */
export class Operator {
  public static readonly Increment = new Operator(Precedence.Postfix);
  public static readonly Decrement = new Operator(Precedence.Postfix);
  public static readonly Accessor = new Operator(Precedence.Postfix);

  public static readonly UnaryNegative = new Operator(Precedence.Prefix);
  public static readonly UnaryPositive = new Operator(Precedence.Prefix);
  public static readonly UnaryIncrement = new Operator(Precedence.Prefix);
  public static readonly UnaryDecrement = new Operator(Precedence.Prefix);
  public static readonly UnaryNegation = new Operator(Precedence.Prefix);

  public static readonly Multiply = new Operator(Precedence.Multiplicative);
  public static readonly Divide = new Operator(Precedence.Multiplicative);
  public static readonly Modulus = new Operator(Precedence.Multiplicative);

  public static readonly Add = new Operator(Precedence.Additive);
  public static readonly Subtract = new Operator(Precedence.Additive);

  public static readonly Less = new Operator(Precedence.Comparison);
  public static readonly Greater = new Operator(Precedence.Comparison);
  public static readonly LessOrEqual = new Operator(Precedence.Comparison);
  public static readonly GreaterOrEqual = new Operator(Precedence.Comparison);

  public static readonly Equal = new Operator(Precedence.Equality);
  public static readonly NotEqual = new Operator(Precedence.Equality);
  public static readonly Identical = new Operator(Precedence.Equality);
  public static readonly NotIdentical = new Operator(Precedence.Equality);

  public static readonly And = new Operator(Precedence.Conjunction);
  public static readonly Or = new Operator(Precedence.Disjunction);

  public static readonly Assign = new Operator(Precedence.Assignment);
  public static readonly AddAssign = new Operator(Precedence.Assignment);
  public static readonly SubtractAssign = new Operator(Precedence.Assignment);
  public static readonly MultiplyAssign = new Operator(Precedence.Assignment);
  public static readonly DivideAssign = new Operator(Precedence.Assignment);
  public static readonly ModulusAssign = new Operator(Precedence.Assignment);

  private constructor(public readonly kind: Precedence) {}
}

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

  public get firstToken(): IToken {
    return this.left.firstToken;
  }

  public get lastToken(): IToken {
    return this.right.lastToken;
  }
}

/**
 * An AST node that was formed from a single @interface IToken.
 */
export abstract class SimpleNode extends AstNode {
  constructor(private readonly token: IToken) {
    super();
  }

  public get firstToken() {
    return this.token;
  }

  public get lastToken() {
    return this.token;
  }
}

/**
 * A literal boolean compatible with JavaScript.
 */
export class LiteralBoolean extends SimpleNode {
  constructor(token: IToken, public readonly value: boolean) {
    super(token);
  }
}

/**
 * A literal number compatible with JavaScript.
 */
export class LiteralNumber extends SimpleNode {
  constructor(token: IToken, public readonly value: number) {
    super(token);
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
export class LiteralString extends SimpleNode {
  constructor(token: IToken, public readonly value: string) {
    super(token);
  }
}

/**
 * Represents a reference to some identifier by name.
 */
export class SimpleName extends SimpleNode {
  constructor(token: IToken, public readonly name: string) {
    super(token);
  }
}
