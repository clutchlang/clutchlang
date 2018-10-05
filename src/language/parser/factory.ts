import { splitLines, unescapeString } from '../../agnostic/strings';
import * as tokens from '../ast/token';
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
  ParameterDeclaration,
  Statement,
  TopLevelElement,
} from './nodes/nodes';
import {
  ReturnStatement,
  StatementBlock,
  VariableDeclarationStatement,
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
    parameters: ParameterDeclaration[],
    type: LiteralIdentifier | undefined,
    arrowToken: tokens.Token,
    body: Expression | StatementBlock,
    isConst: boolean
  ): FunctionDeclaration {
    return new FunctionDeclaration(
      name,
      parameters,
      type,
      arrowToken,
      body,
      isConst
    );
  }

  public createParameterDeclaration(
    name: LiteralIdentifier,
    type: LiteralIdentifier | undefined
  ): ParameterDeclaration {
    return new ParameterDeclaration(name, type);
  }

  public createUnaryExpression(
    target: Expression,
    operator: Operator,
    operatorToken: tokens.Token,
    isPrefix: boolean
  ): UnaryExpression {
    return new UnaryExpression(target, operator, operatorToken, isPrefix);
  }

  public createBinaryExpression(
    left: Expression,
    operator: Operator,
    operatorToken: tokens.Token,
    right: Expression
  ): BinaryExpression {
    return new BinaryExpression(left, operator, operatorToken, right);
  }

  public createGroupExpression(
    leftParen: tokens.Token,
    rightParen: tokens.Token,
    expression: Expression
  ): GroupExpression {
    return new GroupExpression(leftParen, rightParen, expression);
  }

  public createConditionalExpression(
    ifToken: tokens.Token,
    condition: Expression,
    thenToken: tokens.Token,
    body: Expression | StatementBlock,
    elseToken?: tokens.Token,
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
    openToken: tokens.Token,
    parameters: Expression[],
    closeToken: tokens.Token
  ): InvokeExpression {
    return new InvokeExpression(target, openToken, parameters, closeToken);
  }

  public createStatementBlock(
    start: tokens.Token,
    statements: Statement[],
    end: tokens.Token
  ) {
    return new StatementBlock(start, statements, end);
  }

  public createReturnStatement(keyword: tokens.Token, expression?: Expression) {
    return new ReturnStatement(keyword, expression);
  }

  public createVariableDeclarationStatement(
    start: tokens.Token,
    name: LiteralIdentifier,
    assign: tokens.Token,
    expression: Expression,
    isConst: boolean
  ) {
    return new VariableDeclarationStatement(
      start,
      name,
      assign,
      expression,
      isConst
    );
  }

  public createLiteralIdentifier(token: tokens.Token): LiteralIdentifier {
    return new LiteralIdentifier(token, token.lexeme);
  }

  public createLiteralBoolean(token: tokens.Token): LiteralBoolean {
    return new LiteralBoolean(token, token.lexeme === 'true');
  }

  public createLiteralNumber(token: tokens.Token): LiteralNumber {
    return new LiteralNumber(token, this.parseLiteralNumberValue(token.lexeme));
  }

  public createLiteralString(token: tokens.Token): LiteralString {
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
