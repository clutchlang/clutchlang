import { splitLines, unescapeString } from '../../agnostic/strings';
import { IToken } from '../lexer';
import { Expression, Operator, StatementBlock } from '../parser';
import {
  BinaryExpression,
  IfExpression,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  SimpleName,
  UnaryExpression,
} from './expressions';

/**
 * Factory class for creating @class {AstNode} instances.
 */
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

  public createIfExpression(
    ifToken: IToken,
    condition: Expression,
    body: Expression | StatementBlock,
    elseToken?: IToken,
    elseBody?: Expression | StatementBlock
  ) {
    return new IfExpression(ifToken, condition, body, elseToken, elseBody);
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
