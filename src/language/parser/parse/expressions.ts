import * as tokens from '../../ast/lexer/token';
import { Operator } from '../../parser';
import { LiteralIdentifier } from '../nodes/expressions';
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

  public parseIdentifier(): LiteralIdentifier {
    if (this.match(tokens.$Identifier)) {
      return this.factory.createLiteralIdentifier(this.peek(-1));
    }
    /* istanbul ignore next */
    throw new SyntaxError(
      `Unexpected token: "${this.peek().lexeme}" @ ${this.peek().offset}.`
    );
  }

  private parseAssignment(): Expression {
    return this.parseBinary(
      () => this.parseConditional(),
      tokens.$Equals,
      tokens.$PlusEquals,
      tokens.$DashEquals,
      tokens.$StarEquals,
      tokens.$SlashEquals,
      tokens.$PercentEquals
    );
  }

  private parseConditional(): Expression {
    if (this.match(tokens.$If)) {
      const ifToken = this.peek(-1);
      const ifBody = this.parseLogicalOr();
      const thenToken = this.advance();
      const thenBody = this.parseLogicalOr();
      const elseToken = this.match(tokens.$Else) ? this.peek(-1) : undefined;
      const elseBody = elseToken ? this.parseLogicalOr() : undefined;
      return this.factory.createConditionalExpression(
        ifToken,
        ifBody,
        thenToken,
        thenBody,
        elseToken,
        elseBody
      );
    }
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Expression {
    return this.parseBinary(() => this.parseLogicalAnd(), tokens.$PipePipe);
  }

  private parseLogicalAnd(): Expression {
    return this.parseBinary(() => this.parseEquality(), tokens.$AndAnd);
  }

  private parseEquality(): Expression {
    return this.parseBinary(
      () => this.parseComparison(),
      tokens.$EqualsEquals,
      tokens.$ExclaimEquals,
      tokens.$EqualsEqualsEquals,
      tokens.$ExclaimEqualsEquals
    );
  }

  private parseComparison(): Expression {
    return this.parseBinary(
      () => this.parseBitwiseShift(),
      tokens.$LeftAngle,
      tokens.$RightAngle,
      tokens.$LeftAngleEquals,
      tokens.$RightAngleEquals
    );
  }

  private parseBitwiseShift(): Expression {
    return this.parseBinary(
      () => this.parseAdditive(),
      tokens.$LeftAngleLeftAngle,
      tokens.$RightAngleRightAngle
    );
  }

  private parseAdditive(): Expression {
    return this.parseBinary(
      () => this.parseMultiplicative(),
      tokens.$Plus,
      tokens.$Dash
    );
  }

  private parseMultiplicative(): Expression {
    return this.parseBinary(
      () => this.parseUnaryPrefix(),
      tokens.$Star,
      tokens.$Slash,
      tokens.$Percent
    );
  }

  private parseUnaryPrefix(): Expression {
    return this.parsePrefix(
      () => this.parseUnaryPostfix(),
      tokens.$Dash,
      tokens.$Plus,
      tokens.$PlusPlus,
      tokens.$DashDash,
      tokens.$Exclaim
    );
  }

  private parseUnaryPostfix(): Expression {
    return this.parsePostfix(
      () => this.parseFunctionCall(),
      tokens.$PlusPlus,
      tokens.$DashDash
    );
  }

  private parseFunctionCall(): Expression {
    let expression = this.parseMemberAccess();
    // tslint:disable-next-line:no-constant-condition
    while (true) {
      if (this.match(tokens.$LeftParen)) {
        expression = this.finishFunctionCall(expression);
      } else {
        break;
      }
    }
    return expression;
  }

  private finishFunctionCall(target: Expression): Expression {
    const args: Expression[] = [];
    const leftParen = this.peek(-1);
    while (!this.match(tokens.$RightParen)) {
      args.push(this.parseExpression());
    }
    return this.factory.createFunctionCallExpression(
      target,
      leftParen,
      args,
      this.peek(-1)
    );
  }

  private parseMemberAccess(): Expression {
    return this.parseBinary(() => this.parseGroup(), tokens.$Period);
  }

  private parseGroup(): Expression {
    if (this.match(tokens.$LeftParen)) {
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
    if (this.match(tokens.$Number)) {
      return this.factory.createLiteralNumber(this.peek(-1));
    }
    if (this.match(tokens.$String)) {
      return this.factory.createLiteralString(this.peek(-1));
    }
    if (this.match(tokens.$False, tokens.$True)) {
      return this.factory.createLiteralBoolean(this.peek(-1));
    }
    return this.parseIdentifier();
  }

  private parseBinary(
    parseNext: () => Expression,
    ...kinds: tokens.ITokenTypes[]
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
    ...kinds: tokens.ITokenTypes[]
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
    ...kinds: tokens.ITokenTypes[]
  ): Expression {
    const operator = this.peek(1);
    if (kinds.some(e => e === operator.type)) {
      const expr = this.factory.createUnaryExpression(
        parseNext(),
        this.parsePostfixOp(operator),
        operator,
        false
      );
      this.advance();
      return expr;
    }
    return parseNext();
  }

  private parseBinaryOp(token: tokens.Token): Operator {
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

  private parsePrefixOp(token: tokens.Token): Operator {
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
        return Operator.LogicalNot;
      default:
        // TODO: Test.
        /* istanbul ignore next */
        throw new SyntaxError(`Unexpected operator: "${token.lexeme}".`);
    }
  }

  private parsePostfixOp(token: tokens.Token): Operator {
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
