import { splitLines, unescapeString } from '../../agnostic/strings';
import { IToken } from '../lexer';
import { Expression, Operator } from '../parser';
import {
  BinaryExpression,
  ConditionalExpression,
  GroupExpression,
  InvokeExpression,
  LiteralBoolean,
  LiteralIdentifier,
  LiteralNumber,
  LiteralString,
  UnaryExpression,
} from './nodes/expressions';
import {
  FileRoot,
  FunctionDeclaration,
  Statement,
  TopLevelElement,
} from './nodes/nodes';
import {
  JumpStatement,
  StatementBlock,
  VariableStatement,
} from './nodes/statements';

/**
 * Factory class for creating @class {AstNode} instances.
 */
export class AstNodeFactory {
  public createFileRoot(topLevelElements: TopLevelElement[]): FileRoot {
    return new FileRoot(topLevelElements);
  }

  public createFunctionDeclaration(
    name: LiteralIdentifier,
    parameters: LiteralIdentifier[],
    arrowToken: IToken,
    body: Expression | StatementBlock
  ): FunctionDeclaration {
    return new FunctionDeclaration(name, parameters, arrowToken, body);
  }

  public createUnaryExpression(
    target: Expression,
    operator: Operator,
    operatorToken: IToken,
    isPrefix: boolean
  ): UnaryExpression {
    return new UnaryExpression(target, operator, operatorToken, isPrefix);
  }

  public createBinaryExpression(
    left: Expression,
    operator: Operator,
    operatorToken: IToken,
    right: Expression
  ): BinaryExpression {
    return new BinaryExpression(left, operator, operatorToken, right);
  }

  public createGroupExpression(
    leftParen: IToken,
    rightParen: IToken,
    expression: Expression
  ): GroupExpression {
    return new GroupExpression(leftParen, rightParen, expression);
  }

  public createConditionalExpression(
    ifToken: IToken,
    condition: Expression,
    thenToken: IToken,
    body: Expression | StatementBlock,
    elseToken?: IToken,
    elseBody?: Expression | StatementBlock
  ): ConditionalExpression {
    return new ConditionalExpression(
      ifToken,
      condition,
      thenToken,
      body,
      elseToken,
      elseBody
    );
  }

  public createFunctionCallExpression(
    target: Expression,
    openToken: IToken,
    parameters: Expression[],
    closeToken: IToken
  ): InvokeExpression {
    return new InvokeExpression(target, openToken, parameters, closeToken);
  }

  public createStatementBlock(
    start: IToken,
    statements: Statement[],
    end: IToken
  ) {
    return new StatementBlock(start, statements, end);
  }

  public createJumpStatement(keyword: IToken, expression: Expression) {
    return new JumpStatement(keyword, expression);
  }

  public createVariableStatement(
    start: IToken,
    name: LiteralIdentifier,
    assign: IToken,
    expression: Expression
  ) {
    return new VariableStatement(start, name, assign, expression);
  }

  public createLiteralIdentifier(token: IToken): LiteralIdentifier {
    return new LiteralIdentifier(token, token.lexeme);
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
