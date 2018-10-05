import * as ast from '../../../ast';
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
    if (this.match(ast.$Identifier)) {
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
      ast.$Equals,
      ast.$PlusEquals,
      ast.$DashEquals,
      ast.$StarEquals,
      ast.$SlashEquals,
      ast.$PercentEquals
    );
  }

  private parseConditional(): Expression {
    if (this.match(ast.$If)) {
      const ifToken = this.peek(-1);
      const ifBody = this.parseLogicalOr();
      const thenToken = this.advance();
      const thenBody = this.parseLogicalOr();
      const elseToken = this.match(ast.$Else) ? this.peek(-1) : undefined;
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
    return this.parseBinary(() => this.parseLogicalAnd(), ast.$PipePipe);
  }

  private parseLogicalAnd(): Expression {
    return this.parseBinary(() => this.parseEquality(), ast.$AndAnd);
  }

  private parseEquality(): Expression {
    return this.parseBinary(
      () => this.parseComparison(),
      ast.$EqualsEquals,
      ast.$ExclaimEquals,
      ast.$EqualsEqualsEquals,
      ast.$ExclaimEqualsEquals
    );
  }

  private parseComparison(): Expression {
    return this.parseBinary(
      () => this.parseBitwiseShift(),
      ast.$LeftAngle,
      ast.$RightAngle,
      ast.$LeftAngleEquals,
      ast.$RightAngleEquals
    );
  }

  private parseBitwiseShift(): Expression {
    return this.parseBinary(
      () => this.parseAdditive(),
      ast.$LeftAngleLeftAngle,
      ast.$RightAngleRightAngle
    );
  }

  private parseAdditive(): Expression {
    return this.parseBinary(
      () => this.parseMultiplicative(),
      ast.$Plus,
      ast.$Dash
    );
  }

  private parseMultiplicative(): Expression {
    return this.parseBinary(
      () => this.parseUnaryPrefix(),
      ast.$Star,
      ast.$Slash,
      ast.$Percent
    );
  }

  private parseUnaryPrefix(): Expression {
    return this.parsePrefix(
      () => this.parseUnaryPostfix(),
      ast.$Dash,
      ast.$Plus,
      ast.$PlusPlus,
      ast.$DashDash,
      ast.$Exclaim
    );
  }

  private parseUnaryPostfix(): Expression {
    return this.parsePostfix(
      () => this.parseFunctionCall(),
      ast.$PlusPlus,
      ast.$DashDash
    );
  }

  private parseFunctionCall(): Expression {
    let expression = this.parseMemberAccess();
    // tslint:disable-next-line:no-constant-condition
    while (true) {
      if (this.match(ast.$LeftParen)) {
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
    while (!this.match(ast.$RightParen)) {
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
    return this.parseBinary(() => this.parseGroup(), ast.$Period);
  }

  private parseGroup(): Expression {
    if (this.match(ast.$LeftParen)) {
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
    if (this.match(ast.$Number)) {
      return this.factory.createLiteralNumber(this.peek(-1));
    }
    if (this.match(ast.$String)) {
      return this.factory.createLiteralString(this.peek(-1));
    }
    if (this.match(ast.$False, ast.$True)) {
      return this.factory.createLiteralBoolean(this.peek(-1));
    }
    return this.parseIdentifier();
  }

  private parseBinary(
    parseNext: () => Expression,
    ...kinds: ast.ITokenTypes[]
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
    ...kinds: ast.ITokenTypes[]
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
    ...kinds: ast.ITokenTypes[]
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

  private parseBinaryOp(token: ast.Token): Operator {
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

  private parsePrefixOp(token: ast.Token): Operator {
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

  private parsePostfixOp(token: ast.Token): Operator {
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
