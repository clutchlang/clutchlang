import * as lexer from '../../lexer';
import { StaticMessageCode } from '../../message/message';
import * as ast from '../../parser';
import { OperatorParser } from './operator';

type Literals =
  | ast.LiteralBoolean
  | ast.LiteralNumber
  | ast.LiteralString
  | ast.Identifier;

/**
 * Partially implements parsing for expressions.
 *
 * Exists soley to be standalone testable, as well as extended by the statement
 * parser, which needs the capability to parse expressions.
 */
export class ExpressionParser extends OperatorParser {
  /**
   * Parses and returns an expression.
   *
   * If the next token(s) provided is not a valid expression, an error may be
   * reported and the expression replaced with a synthetic one to allow parsing
   * to continue.
   */
  public parseExpression(): ast.Expression {
    return this.parseConditional();
  }

  private parseConditional():
    | ast.ConditionalExpression
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    if (this.match(lexer.$If)) {
      const ifToken = this.previous();
      const ifCondition = this.parseExpression();
      const thenToken = this.advance();
      if (thenToken.type !== lexer.$Then) {
        this.reporter.reportToken(
          thenToken,
          StaticMessageCode.SYNTAX_EXPECTED_THEN
        );
      }
      const thenBody = this.parseExpression();
      const elseToken = this.match(lexer.$Else) ? this.previous() : undefined;
      const elseBody = elseToken ? this.parseExpression() : undefined;
      return this.factory.createConditionalExpression(
        ifToken,
        ifCondition,
        thenBody,
        elseBody
      );
    }
    return this.parseLogicalOr();
  }

  private parseLogicalOr():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(
      () => this.parseLogicalAnd(),
      lexer.$PipePipe
    );
  }

  private parseLogicalAnd():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(() => this.parseEquality(), lexer.$AndAnd);
  }

  private parseEquality():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(
      () => this.parseComparison(),
      lexer.$EqualsEquals,
      lexer.$ExclaimEquals,
      lexer.$EqualsEqualsEquals,
      lexer.$ExclaimEqualsEquals
    );
  }

  private parseComparison():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(
      () => this.parseBitwiseShift(),
      lexer.$LeftAngle,
      lexer.$RightAngle,
      lexer.$LeftAngleEquals,
      lexer.$RightAngleEquals
    );
  }

  private parseBitwiseShift():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(
      () => this.parseAdditive(),
      lexer.$LeftAngleLeftAngle,
      lexer.$RightAngleRightAngle
    );
  }

  private parseAdditive():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(
      () => this.parseMultiplicative(),
      lexer.$Plus,
      lexer.$Dash
    );
  }

  private parseMultiplicative():
    | ast.BinaryExpression
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parseBinaryHelper(
      () => this.parsePrefixExpression(),
      lexer.$Star,
      lexer.$Slash,
      lexer.$Percent
    );
  }

  private parseBinaryHelper<E extends ast.Expression>(
    parseNext: () => E,
    ...kinds: lexer.ITokenTypes[]
  ): E {
    let expr = parseNext();
    while (this.match(...kinds)) {
      const operator = this.parseBinaryOperator(this.previous());
      expr = (this.factory.createBinaryExpression(
        operator,
        expr,
        parseNext()
      ) as unknown) as E;
    }
    return expr;
  }

  private parsePrefixExpression():
    | ast.PrefixExpression
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parsePrefixHelper(
      () => this.parsePostfixExpression(),
      lexer.$Dash,
      lexer.$Plus,
      lexer.$DashDash,
      lexer.$PlusPlus,
      lexer.$Exclaim
    );
  }

  private parsePrefixHelper<E extends ast.Expression>(
    parseNext: () => E,
    ...kinds: lexer.ITokenTypes[]
  ): E {
    if (this.match(...kinds)) {
      const operator = this.parsePrefixOperator(this.previous());
      return (this.factory.createPrefixExpression(
        operator,
        parseNext()
      ) as unknown) as E;
    }
    return parseNext();
  }

  private parsePostfixExpression():
    | ast.PostfixExpression
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    return this.parsePostfixHelper(
      () => this.parsePropertyOrCall(),
      lexer.$PlusPlus,
      lexer.$DashDash
    );
  }

  private parsePostfixHelper<E extends ast.Expression>(
    parseNext: () => E,
    ...kinds: lexer.ITokenTypes[]
  ): E {
    const operatorToken = this.peek(1);
    if (kinds.some(e => e === operatorToken.type)) {
      const expr = this.factory.createPostfixExpression(
        this.parsePostfixOperator(operatorToken),
        parseNext()
      );
      this.advance();
      return (expr as unknown) as E;
    }
    return parseNext();
  }

  private parsePropertyOrCall():
    | ast.PropertyExpression<ast.Expression>
    | ast.CallExpression<ast.Expression>
    | ast.GroupExpression<ast.Expression>
    | Literals {
    let expr:
      | ast.PropertyExpression<ast.Expression>
      | ast.CallExpression<ast.Expression>
      | ast.GroupExpression<ast.Expression>
      | Literals = this.parseGroup();
    while (this.hasNext && this.match(lexer.$Period)) {
      const name = this.parseIdentifier();
      if (this.check(lexer.$LeftParen)) {
        const args = this.parseArgumentList();
        expr = this.factory.createCallExpression(name, args, expr);
      } else {
        expr = this.factory.createPropertyExpression(expr, name);
      }
    }
    return expr;
  }

  private parseArgumentList(): ast.ArgumentList {
    let leftParen = this.advance();
    if (leftParen.type !== lexer.$LeftParen) {
      this.reporter.reportToken(
        leftParen,
        StaticMessageCode.SYNTAX_EXPECTED_PARENTHESES
      );
      leftParen = leftParen.toErrorToken('(');
    }
    const args: ast.Expression[] = [];
    while (this.hasNext && !this.match(lexer.$RightParen)) {
      args.push(this.parseExpression());
      if (!this.match(lexer.$Comma, lexer.$RightParen)) {
        this.reporter.reportToken(
          this.peek(),
          StaticMessageCode.SYNTAX_EXPECTED_COMMA
        );
      } else {
        if (this.previous().type === lexer.$RightParen) {
          break;
        }
      }
    }
    let rightParen = this.previous();
    if (rightParen.type !== lexer.$RightParen) {
      this.reporter.reportToken(
        rightParen,
        StaticMessageCode.SYNTAX_EXPECTED_PARENTHESES
      );
      rightParen = rightParen.toErrorToken(')');
    }
    return this.factory.createArgumentList(leftParen, args, rightParen);
  }

  private parseGroup(): ast.GroupExpression<ast.Expression> | Literals {
    if (this.match(lexer.$LeftParen)) {
      const first = this.previous();
      const expr = this.parseExpression();
      let last = this.advance();
      if (last.type !== lexer.$RightParen) {
        this.reporter.reportToken(
          last,
          StaticMessageCode.SYNTAX_EXPECTED_PARENTHESES
        );
        last = last.toErrorToken(')');
      }
      return this.factory.createGroupExpression(first, expr, last);
    }
    return this.parseLiteral();
  }

  /**
   * Parses and returns a literal or identifier.
   */
  private parseLiteral(): Literals {
    if (this.match(lexer.$Number)) {
      return this.factory.createLiteralNumber(this.previous());
    }
    if (this.match(lexer.$String)) {
      return this.factory.createLiteralString(this.previous());
    }
    if (this.match(lexer.$False, lexer.$True)) {
      return this.factory.createLiteralBoolean(this.previous());
    }
    return this.parseIdentifier();
  }

  /**
   * Parses an identifier, or reports an error and returns a synthetic identifier.
   */
  private parseIdentifier(): ast.Identifier {
    if (this.match(lexer.$Identifier)) {
      return this.factory.createIdentifier(this.previous());
    }
    return this.fatalExpectedIdentifier(this.advance());
  }

  private fatalExpectedIdentifier(token: lexer.Token): ast.Identifier {
    this.reporter.reportToken(
      token,
      StaticMessageCode.SYNTAX_EXPECTED_IDENTIFIER
    );
    return this.factory.createIdentifier(token.toErrorToken());
  }
}
