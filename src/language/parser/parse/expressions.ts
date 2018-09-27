import { IToken, TokenKind } from '../../lexer';
import { Operator } from '../../parser';
import { Expression } from '../nodes/nodes';
import { AbstractParser } from './abstract';

/**
 * Partially implements parsing just for expressions.
 */
export class ExpressionParser extends AbstractParser {
  /**
   * Parses and returns an expression.
   *
   * Uses [recursive descent parsing][1].
   *
   * [1]: http://craftinginterpreters.com/parsing-expressions.html#recursive-descent-parsing
   */
  public parseExpression(): Expression {
    return this.parseAssignment();
  }

  private parseAssignment(): Expression {
    return this.parseBinary(
      () => this.parseDisjunction(),
      TokenKind.ASSIGN,
      TokenKind.PLUS_BY,
      TokenKind.MINUS_BY,
      TokenKind.STAR_BY,
      TokenKind.SLASH_BY,
      TokenKind.MODULUS_BY
    );
  }

  private parseDisjunction(): Expression {
    return this.parseBinary(() => this.parseConjunction(), TokenKind.OR);
  }

  private parseConjunction(): Expression {
    return this.parseBinary(() => this.parseEquality(), TokenKind.AND);
  }

  private parseEquality(): Expression {
    return this.parseBinary(
      () => this.parseComparison(),
      TokenKind.EQUALS,
      TokenKind.NOT_EQUALS,
      TokenKind.IDENTICAL,
      TokenKind.NOT_IDENTICAL
    );
  }

  private parseComparison(): Expression {
    return this.parseBinary(
      () => this.parseAdditive(),
      TokenKind.LESS_THAN,
      TokenKind.GREATER_THAN,
      TokenKind.LESS_THAN_OR_EQUAL,
      TokenKind.GREATER_THAN_OR_EQUAL
    );
  }

  private parseAdditive(): Expression {
    return this.parseBinary(
      () => this.parseMultiplicative(),
      TokenKind.PLUS,
      TokenKind.MINUS
    );
  }

  private parseMultiplicative(): Expression {
    return this.parseBinary(
      () => this.parseUnaryPrefix(),
      TokenKind.STAR,
      TokenKind.SLASH,
      TokenKind.MODULUS
    );
  }

  private parseUnaryPrefix(): Expression {
    return this.parsePrefix(
      () => this.parseAccessor(),
      TokenKind.MINUS,
      TokenKind.PLUS,
      TokenKind.INCREMENT,
      TokenKind.DECREMENT,
      TokenKind.NEGATE
    );
  }

  private parseAccessor(): Expression {
    return this.parseBinary(() => this.parseUnaryPostfix(), TokenKind.PERIOD);
  }

  private parseUnaryPostfix(): Expression {
    return this.parsePostfix(
      () => this.parseInvocation(),
      TokenKind.INCREMENT,
      TokenKind.DECREMENT
    );
  }

  private parseInvocation(): Expression {
    const operator = this.peek(1);
    if (operator.lexeme === TokenKind.LEFT_PAREN) {
      let expression = this.parseGroup();
      // tslint:disable-next-line:no-constant-condition
      while (true) {
        if (this.match(TokenKind.LEFT_PAREN)) {
          expression = this.finishInvocation(expression);
        } else {
          break;
        }
      }
      return expression;
    }
    return this.parseGroup();
  }

  private finishInvocation(target: Expression): Expression {
    const args: Expression[] = [];
    const leftParen = this.peek(-1);
    while (!this.match(TokenKind.RIGHT_PAREN)) {
      args.push(this.parseExpression());
    }
    return this.factory.createInvokeExpression(
      target,
      leftParen,
      args,
      this.peek(-1)
    );
  }

  private parseGroup(): Expression {
    if (this.match(TokenKind.LEFT_PAREN)) {
      const leftParen = this.peek(-1);
      const expression = this.parseExpression();
      const rightParen = this.advance();
      return this.factory.createGroupExpression(
        leftParen,
        rightParen,
        expression
      );
    }
    return this.parseLiteral();
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
    if (this.match(TokenKind.IDENTIFIER)) {
      return this.factory.createSimpleName(this.peek(-1));
    }
    /* istanbul ignore next */
    throw new SyntaxError(`Unexpected token: "${this.peek().lexeme}".`);
  }

  private parseBinary(
    parseNext: () => Expression,
    ...kinds: TokenKind[]
  ): Expression {
    let expr = parseNext();
    while (this.match(...kinds)) {
      const operator = this.peek(-1);
      expr = this.factory.createBinaryExpression(
        expr,
        this.parseBinaryOp(operator),
        operator,
        parseNext()
      );
    }
    return expr;
  }

  private parsePrefix(
    parseNext: () => Expression,
    ...kinds: TokenKind[]
  ): Expression {
    if (this.match(...kinds)) {
      const operator = this.peek(-1);
      return this.factory.createUnaryExpression(
        parseNext(),
        this.parsePrefixOp(operator),
        operator,
        true
      );
    }
    return parseNext();
  }

  private parsePostfix(
    parseNext: () => Expression,
    ...kinds: TokenKind[]
  ): Expression {
    const operator = this.peek(1);
    if (kinds.some(e => e === operator.lexeme)) {
      return this.factory.createUnaryExpression(
        parseNext(),
        this.parsePostfixOp(operator),
        operator,
        false
      );
    }
    return parseNext();
  }

  private parseBinaryOp(token: IToken): Operator {
    switch (token.lexeme) {
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
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }

  private parsePrefixOp(token: IToken): Operator {
    switch (token.lexeme) {
      case '++':
        return Operator.UnaryIncrement;
      case '--':
        return Operator.UnaryDecrement;
      case '-':
        return Operator.UnaryNegative;
      case '+':
        return Operator.UnaryPositive;
      case '!':
        return Operator.UnaryNegation;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }

  private parsePostfixOp(token: IToken): Operator {
    switch (token.lexeme) {
      case '++':
        return Operator.Increment;
      case '--':
        return Operator.Decrement;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }
}
