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
      TokenKind.EQUALS,
      TokenKind.PLUS_EQUALS,
      TokenKind.MINUS_EQUALS,
      TokenKind.STAR_EQUALS,
      TokenKind.SLASH_EQUALS,
      TokenKind.MODULUS_EQUALS
    );
  }

  private parseDisjunction(): Expression {
    return this.parseBinary(() => this.parseConjunction(), TokenKind.PIPE_PIPE);
  }

  private parseConjunction(): Expression {
    return this.parseBinary(() => this.parseEquality(), TokenKind.AND_AND);
  }

  private parseEquality(): Expression {
    return this.parseBinary(
      () => this.parseComparison(),
      TokenKind.EQUALS_EQUALS,
      TokenKind.EXCLAIM_EQUALS,
      TokenKind.EQUALS_EQUALS_EQUALS,
      TokenKind.EXCLAIM_EQUALS_EQUALS
    );
  }

  private parseComparison(): Expression {
    return this.parseBinary(
      () => this.parseAdditive(),
      TokenKind.LEFT_ANGLE,
      TokenKind.RIGHT_ANGLE,
      TokenKind.LEFT_ANGLE_EQUALS,
      TokenKind.RIGHT_ANGLE_EQUALS
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
      TokenKind.PLUS_PLUS,
      TokenKind.MINUS_MINUS,
      TokenKind.EXCLAIM
    );
  }

  private parseAccessor(): Expression {
    return this.parseBinary(() => this.parseUnaryPostfix(), TokenKind.PERIOD);
  }

  private parseUnaryPostfix(): Expression {
    return this.parsePostfix(
      () => this.parseInvocation(),
      TokenKind.PLUS_PLUS,
      TokenKind.MINUS_MINUS
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
        return Operator.MemberAccess;
      case '*':
        return Operator.Multiplication;
      case '/':
        return Operator.Division;
      case '%':
        return Operator.Remainder;
      case '+':
        return Operator.Addition;
      case '-':
        return Operator.Subtraction;
      case '<':
        return Operator.LessThan;
      case '>':
        return Operator.GreaterThan;
      case '<=':
        return Operator.LessThanOrEqual;
      case '>=':
        return Operator.GreaterThanOrEqual;
      case '==':
        return Operator.Equality;
      case '!=':
        return Operator.Inequality;
      case '===':
        return Operator.Identity;
      case '!==':
        return Operator.Unidentity;
      case '&&':
        return Operator.LogicalAnd;
      case '||':
        return Operator.LogicalOr;
      case '=':
        return Operator.Assign;
      case '+=':
        return Operator.AssignIncreasedBy;
      case '-=':
        return Operator.AssignDecreasedBy;
      case '*=':
        return Operator.AssignMultipliedBy;
      case '/=':
        return Operator.AssignDividedBy;
      case '%=':
        return Operator.AssignRemainderBy;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }

  private parsePrefixOp(token: IToken): Operator {
    switch (token.lexeme) {
      case '++':
        return Operator.PrefixIncrement;
      case '--':
        return Operator.PrefixDecrement;
      case '-':
        return Operator.UnaryNegative;
      case '+':
        return Operator.UnaryPositive;
      case '!':
        return Operator.UnaryNegative;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }

  private parsePostfixOp(token: IToken): Operator {
    switch (token.lexeme) {
      case '++':
        return Operator.PostfixIncrement;
      case '--':
        return Operator.PostfixDecrement;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }
}
