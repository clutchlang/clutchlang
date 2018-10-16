import { Token } from '../token';
import * as ast from './nodes';

/**
 * Indirection interface for creating AST nodes.
 */
export class AstFactory {
  public createOperator(token: Token, type: ast.OperatorType): ast.Operator {
    return new ast.Operator(token, type);
  }

  public createPrefixExpression(
    operator: ast.Operator,
    target: ast.Expression
  ): ast.PrefixExpression {
    return new ast.PrefixExpression(operator, target);
  }

  public createPostfixExpression(
    operator: ast.Operator,
    target: ast.Expression
  ): ast.PostfixExpression {
    return new ast.PostfixExpression(operator, target);
  }

  public createBinaryExpression(
    operator: ast.Operator,
    left: ast.Expression,
    right: ast.Expression
  ): ast.BinaryExpression {
    return new ast.BinaryExpression(operator, left, right);
  }

  public createPropertyExpression(
    target: ast.Expression,
    property: ast.Identifier
  ): ast.PropertyExpression {
    return new ast.PropertyExpression(target, property);
  }

  public createArgumentList(
    first: Token,
    args: ast.Expression[],
    last: Token
  ): ast.ArgumentList {
    return new ast.ArgumentList(first, args, last);
  }

  public createCallExpression(
    name: ast.Identifier,
    args: ast.ArgumentList,
    target?: ast.Expression
  ): ast.CallExpression {
    return new ast.CallExpression(name, args, target);
  }

  public createConditionalExpression(
    first: Token,
    condition: ast.Expression,
    body: ast.Expression | ast.StatementBlock,
    elseCondition?: ast.Expression,
    elseBody?: ast.Expression | ast.StatementBlock
  ): ast.ConditionalExpression {
    return new ast.ConditionalExpression(
      first,
      condition,
      body,
      elseCondition,
      elseBody
    );
  }

  public createGroupExpression(
    first: Token,
    expression: ast.Expression,
    last: Token
  ): ast.GroupExpression {
    return new ast.GroupExpression(first, expression, last);
  }

  public createIdentifier(token: Token): ast.Identifier {
    return new ast.Identifier(token);
  }

  public createLiteralBoolean(token: Token): ast.LiteralBoolean {
    return new ast.LiteralBoolean(token);
  }

  public createLiteralNumber(token: Token): ast.LiteralNumber {
    return new ast.LiteralNumber(token);
  }

  public createLiteralString(token: Token): ast.LiteralString {
    return new ast.LiteralString(token);
  }

  public createVariableDeclaration(
    name: ast.Identifier,
    type?: ast.Identifier,
    value?: ast.Expression
  ): ast.VariableDeclaration {
    return new ast.VariableDeclaration(name, type, value);
  }

  public createParameterList(
    first: Token,
    params: ast.VariableDeclaration[],
    last: Token
  ): ast.ParameterList {
    return new ast.ParameterList(first, params, last);
  }

  public createStatementBlock(
    first: Token,
    statements: ast.Statement[],
    last: Token
  ): ast.StatementBlock {
    return new ast.StatementBlock(first, statements, last);
  }

  public createReturnStatement(
    first: Token,
    expression?: ast.Expression
  ): ast.ReturnStatement {
    return new ast.ReturnStatement(first, expression);
  }

  public createFunctionDeclaration(
    name: ast.Identifier,
    params?: ast.ParameterList,
    body?: ast.Expression | ast.StatementBlock,
    returnType?: ast.Identifier
  ): ast.FunctionDeclaration {
    return new ast.FunctionDeclaration(name, params, body, returnType);
  }

  public createModuleDeclaration(
    declarations: Array<
      ast.FunctionDeclaration | ast.TypeDeclaration | ast.VariableDeclaration
    >
  ): ast.ModuleDeclaration {
    return new ast.ModuleDeclaration(declarations);
  }
}
