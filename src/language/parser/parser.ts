import { IToken, TokenKind } from '../lexer';
import { AstNodeFactory } from './factory';
import { GroupExpression } from './nodes/expressions';
import { Expression } from './nodes/nodes';
import { Operator, Precedence } from './nodes/operators';

export class ClutchParser {
  /**
   * Position within @member tokens.
   */
  private position = 0;

  constructor(
    private readonly tokens: IToken[],
    private readonly factory = new AstNodeFactory()
  ) {}

  /**
   * Parses and returns an expression.
   *
   * Uses [recursive descent parsing][1].
   *
   * [1]: http://craftinginterpreters.com/parsing-expressions.html#recursive-descent-parsing
   */
  public parseExpression(precedence = Precedence.Assignment): Expression {
    let expr!: Expression;
    let operator!: IToken;

    // An inline helper for parsing binary expressions.
    const parseBinary = (kinds: TokenKind[], next?: Precedence): Expression => {
      expr = this.parseExpression(next);
      while (this.match(...kinds)) {
        operator = this.peek(-1);
        expr = this.factory.createBinaryExpression(
          expr,
          this.parseBinaryOperator(operator.lexeme),
          operator,
          this.parseExpression(next)
        );
      }
      return expr;
    };

    // An inline helper for parsing unary expressions.
    const parseUnary = (
      prefix: boolean,
      kinds: TokenKind[],
      next?: Precedence
    ): Expression => {
      if (!prefix) {
        // Special case postfix.
        operator = this.peek(1);
        if (kinds.some(e => e === operator.lexeme)) {
          return this.factory.createUnaryExpression(
            this.parseExpression(next),
            this.parseUnaryOperator(operator.lexeme, prefix),
            operator,
            prefix
          );
        }
      }
      if (this.match(...kinds)) {
        operator = this.peek(-1);
        return this.factory.createUnaryExpression(
          this.parseExpression(next),
          this.parseUnaryOperator(operator.lexeme, prefix),
          operator,
          prefix
        );
      }
      return this.parseExpression(next);
    };

    switch (precedence) {
      case Precedence.Assignment:
        return parseBinary(
          [
            TokenKind.ASSIGN,
            TokenKind.PLUS_BY,
            TokenKind.MINUS_BY,
            TokenKind.STAR_BY,
            TokenKind.SLASH_BY,
            TokenKind.MODULUS_BY,
          ],
          Precedence.Disjunction
        );
      case Precedence.Disjunction:
        return parseBinary([TokenKind.OR], Precedence.Conjunction);
      case Precedence.Conjunction:
        return parseBinary([TokenKind.AND], Precedence.Equality);
      case Precedence.Equality:
        return parseBinary(
          [
            TokenKind.EQUALS,
            TokenKind.NOT_EQUALS,
            TokenKind.IDENTICAL,
            TokenKind.NOT_IDENTICAL,
          ],
          Precedence.Comparison
        );
      case Precedence.Comparison:
        return parseBinary(
          [
            TokenKind.LESS_THAN,
            TokenKind.GREATER_THAN,
            TokenKind.LESS_THAN_OR_EQUAL,
            TokenKind.GREATER_THAN_OR_EQUAL,
          ],
          Precedence.Additive
        );
      case Precedence.Additive:
        return parseBinary(
          [TokenKind.PLUS, TokenKind.MINUS],
          Precedence.Multiplicative
        );
      case Precedence.Multiplicative:
        return parseBinary(
          [TokenKind.STAR, TokenKind.SLASH, TokenKind.MODULUS],
          Precedence.Prefix
        );
      case Precedence.Prefix:
        return parseUnary(
          true,
          [
            TokenKind.MINUS,
            TokenKind.PLUS,
            TokenKind.INCREMENT,
            TokenKind.DECREMENT,
            TokenKind.NEGATE,
          ],
          Precedence.Accessor
        );
      case Precedence.Accessor:
        return parseBinary([TokenKind.PERIOD], Precedence.Postfix);
      case Precedence.Postfix:
        return parseUnary(
          false,
          [TokenKind.INCREMENT, TokenKind.DECREMENT],
          Precedence.Literal
        );
      default:
        if (this.match(TokenKind.LEFT_PAREN)) {
          return this.parseGroupExpression();
        }
        return this.parseLiteral();
    }
  }

  private parseGroupExpression(): GroupExpression {
    const leftParen = this.peek(-1);
    const expression = this.parseExpression();
    const rightParen = this.advance();
    return new GroupExpression(leftParen, rightParen, expression);
  }

  private parseLiteral(): Expression {
    if (this.match(TokenKind.NUMBER)) {
      return this.factory.createLiteralNumber(this.peek(-1));
    }
    if (this.match(TokenKind.STRING)) {
      return this.factory.createLiteralString(this.peek(-1));
    }
    if (this.match(TokenKind.FALSE, TokenKind.TRUE)) {
      return this.factory.createLiteralBoolean(this.peek(-1));
    }
    if (!this.match(TokenKind.IDENTIFIER)) {
      // TODO: Test.
      /* istanbul ignore next */
      throw new SyntaxError(
        `Expected literal got "${this.peek().lexeme}" (${this.peek().kind}).`
      );
    }
    const token = this.peek(-1);
    return this.factory.createSimpleName(token);
  }

  private parseBinaryOperator(lexeme: string): Operator {
    switch (lexeme) {
      case '.':
        return Operator.Accessor;
      case '*':
        return Operator.Multiply;
      case '/':
        return Operator.Divide;
      case '%':
        return Operator.Modulus;
      case '+':
        return Operator.Add;
      case '-':
        return Operator.Subtract;
      case '<':
        return Operator.Less;
      case '>':
        return Operator.Greater;
      case '<=':
        return Operator.LessOrEqual;
      case '>=':
        return Operator.GreaterOrEqual;
      case '==':
        return Operator.Equal;
      case '!=':
        return Operator.NotEqual;
      case '===':
        return Operator.Identical;
      case '!==':
        return Operator.NotIdentical;
      case '&&':
        return Operator.And;
      case '||':
        return Operator.Or;
      case '=':
        return Operator.Assign;
      case '+=':
        return Operator.AddAssign;
      case '-=':
        return Operator.SubtractAssign;
      case '*=':
        return Operator.MultiplyAssign;
      case '/=':
        return Operator.DivideAssign;
      case '%=':
        return Operator.ModulusAssign;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${lexeme}".`);
    }
  }

  private parseUnaryOperator(lexeme: string, prefix: boolean): Operator {
    switch (lexeme) {
      case '++':
        return prefix ? Operator.UnaryIncrement : Operator.Increment;
      case '--':
        return prefix ? Operator.UnaryDecrement : Operator.Decrement;
      case '-':
        return Operator.UnaryNegative;
      case '+':
        return Operator.UnaryPositive;
      case '!':
        return Operator.UnaryNegation;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${lexeme}".`);
    }
  }

  /**
   * Returns whether any of the provided @param kinds are seen in order.
   */
  private match(...kinds: TokenKind[]): boolean {
    return kinds.some(e => {
      if (this.check(e)) {
        this.advance();
        return true;
      }
      return false;
    });
  }

  /**
   * Returns whether the next token is of type @param kind.
   */
  private check(kind: TokenKind): boolean {
    return this.hasNext ? this.peek().kind === kind : false;
  }

  /**
   * Returns the next token.
   */
  private advance(): IToken {
    if (this.hasNext) {
      this.position++;
    }
    return this.peek(-1);
  }

  /**
   * Returns whether at least one more token remains for parsing.
   */
  private get hasNext(): boolean {
    return this.tokens[this.position].kind !== TokenKind.EOF;
  }

  /**
   * Returns the token at @member position + @param offset.
   */
  private peek(offset = 0): IToken {
    return this.tokens[this.position + offset];
  }
}
