import * as lexer from '../../lexer';
import { StaticMessageCode } from '../../message/message';
import * as ast from '../../parser';
import { AbstractParser } from './abstract';

/**
 * Partially implements parsing just for operators.
 */
export class OperatorParser extends AbstractParser {
  /**
   * Parse and returns a binary operator from @param token.
   *
   * If the token provided is not a valid binary operator, an error may be
   * reported and the operator is replaced with a synthetic one to allow parsing
   * to continue.
   */
  public parseBinaryOperator(
    token: lexer.Token
  ): ast.Operator<ast.BinaryOperatorType> {
    return this.createOperator(token, this.findBinaryOperator(token));
  }

  /**
   * Parse and returns a prefix operator from @param token.
   *
   * If the token provided is not a valid binary operator, an error may be
   * reported and the operator is replaced with a synthetic one to allow parsing
   * to continue.
   */
  public parsePrefixOperator(
    token: lexer.Token
  ): ast.Operator<ast.PrefixOperatorType> {
    return this.createOperator(token, this.findPrefixOperator(token));
  }

  /**
   * Parse and returns a postfix operator from @param token.
   *
   * If the token provided is not a valid binary operator, an error may be
   * reported and the operator is replaced with a synthetic one to allow parsing
   * to continue.
   */
  public parsePostfixOperator(
    token: lexer.Token
  ): ast.Operator<ast.PostfixOperatorType> {
    return this.createOperator(token, this.findPostfixOperator(token));
  }

  private findBinaryOperator(token: lexer.Token): ast.BinaryOperatorType {
    switch (token.lexeme) {
      case '.':
        return ast.OperatorType.Property;
      case '*':
        return ast.OperatorType.Multiplication;
      case '/':
        return ast.OperatorType.Division;
      case '%':
        return ast.OperatorType.Remainder;
      case '+':
        return ast.OperatorType.Addition;
      case '-':
        return ast.OperatorType.Subtraction;
      case '<':
        return ast.OperatorType.LessThan;
      case '>':
        return ast.OperatorType.GreaterThan;
      case '<=':
        return ast.OperatorType.LessThanOrEqual;
      case '>=':
        return ast.OperatorType.GreaterThanOrEqual;
      case '==':
        return ast.OperatorType.Equality;
      case '!=':
        return ast.OperatorType.Inequality;
      case '===':
        return ast.OperatorType.Identity;
      case '!==':
        return ast.OperatorType.Unidentity;
      case '&&':
        return ast.OperatorType.LogicalAnd;
      case '||':
        return ast.OperatorType.LogicalOr;
      case '=':
        return ast.OperatorType.Assign;
      case '+=':
        return ast.OperatorType.AssignIncreasedBy;
      case '-=':
        return ast.OperatorType.AssignDecreasedBy;
      case '*=':
        return ast.OperatorType.AssignMultipliedBy;
      case '/=':
        return ast.OperatorType.AssignDividedBy;
      case '%=':
        return ast.OperatorType.AssignRemainderBy;
      default:
        return this.invalidOperator(token);
    }
  }

  private findPrefixOperator(token: lexer.Token): ast.PrefixOperatorType {
    switch (token.lexeme) {
      case '++':
        return ast.OperatorType.PrefixIncrement;
      case '--':
        return ast.OperatorType.PrefixDecrement;
      case '-':
        return ast.OperatorType.UnaryNegative;
      case '+':
        return ast.OperatorType.UnaryPositive;
      case '!':
        return ast.OperatorType.LogicalNot;
      default:
        return this.invalidOperator(token);
    }
  }

  private findPostfixOperator(token: lexer.Token): ast.PostfixOperatorType {
    switch (token.lexeme) {
      case '++':
        return ast.OperatorType.PostfixIncrement;
      case '--':
        return ast.OperatorType.PostfixDecrement;
      default:
        return this.invalidOperator(token);
    }
  }

  private createOperator<T extends ast.OperatorType>(
    token: lexer.Token,
    type: T
  ): ast.Operator<T> {
    if (type === ast.OperatorType.InvalidOrError) {
      token = token.toSyntheticToken();
    }
    return this.factory.createOperator(token, type);
  }

  private invalidOperator(token: lexer.Token): ast.InvalidOperatorType {
    this.reporter.reportToken(token, StaticMessageCode.INVALID_OPERATOR);
    return ast.OperatorType.InvalidOrError;
  }
}
