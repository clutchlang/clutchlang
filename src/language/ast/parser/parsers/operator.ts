import * as lexer from '../../lexer';
import { StaticMessageType } from '../../message/message';
import * as ast from '../../parser';
import { AbstractParser } from "./abstract";

/**
 * Partially implements parsing just for operators.
 */
export class OperatorParser extends AbstractParser {
  public parseOperator(token: lexer.Token, type: ast.OperatorType): ast.Operator {
    if (type === ast.OperatorType.UnexpectedOrError) {
      token = new lexer.Token(
        token.offset,
        token.type,
        token.comments,
        token.lexeme,
        true,
      );
    }
    return this.factory.createOperator(token, type);
  }

  public findBinaryOperator(token: lexer.Token): ast.OperatorType {
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
        return this.unexpectedOperator(token);
    }
  }

  public findPrefixOperator(token: lexer.Token): ast.OperatorType {
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
        return this.unexpectedOperator(token);
    }
  }

  public findPostfixOperator(token: lexer.Token): ast.OperatorType {
    switch (token.lexeme) {
      case '++':
        return ast.OperatorType.PostfixIncrement;
      case '--':
        return ast.OperatorType.PostfixDecrement;
      default:
        return this.unexpectedOperator(token);
    }
  }

  private unexpectedOperator(token: lexer.Token): ast.OperatorType {
    this.reporter.reportToken(token, StaticMessageType.Error, 'Unexpected operator');
    return ast.OperatorType.UnexpectedOrError;
  }
}
