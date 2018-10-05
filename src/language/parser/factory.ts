import { splitLines, unescapeString } from '../../agnostic/strings';
import * as ast from '../../ast';
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
    arrowToken: ast.Token,
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
    operatorToken: ast.Token,
    isPrefix: boolean
  ): UnaryExpression {
    return new UnaryExpression(target, operator, operatorToken, isPrefix);
  }

  public createBinaryExpression(
    left: Expression,
    operator: Operator,
    operatorToken: ast.Token,
    right: Expression
  ): BinaryExpression {
    return new BinaryExpression(left, operator, operatorToken, right);
  }

  public createGroupExpression(
    leftParen: ast.Token,
    rightParen: ast.Token,
    expression: Expression
  ): GroupExpression {
    return new GroupExpression(leftParen, rightParen, expression);
  }

  public createConditionalExpression(
    ifToken: ast.Token,
    condition: Expression,
    thenToken: ast.Token,
    body: Expression | StatementBlock,
    elseToken?: ast.Token,
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
    openToken: ast.Token,
    parameters: Expression[],
    closeToken: ast.Token
  ): InvokeExpression {
    return new InvokeExpression(target, openToken, parameters, closeToken);
  }

  public createStatementBlock(
    start: ast.Token,
    statements: Statement[],
    end: ast.Token
  ) {
    return new StatementBlock(start, statements, end);
  }

  public createReturnStatement(keyword: ast.Token, expression?: Expression) {
    return new ReturnStatement(keyword, expression);
  }

  public createVariableDeclarationStatement(
    start: ast.Token,
    name: LiteralIdentifier,
    assign: ast.Token,
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

  public createLiteralIdentifier(token: ast.Token): LiteralIdentifier {
    return new LiteralIdentifier(token, token.lexeme);
  }

  public createLiteralBoolean(token: ast.Token): LiteralBoolean {
    return new LiteralBoolean(token, token.lexeme === 'true');
  }

  public createLiteralNumber(token: ast.Token): LiteralNumber {
    return new LiteralNumber(token, this.parseLiteralNumberValue(token.lexeme));
  }

  public createLiteralString(token: ast.Token): LiteralString {
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
