import * as ast from '../../parser';

/**
 * A pattern that may be used to visit an AST structure.
 */
export abstract class AstVisitor<R, C> {
  // Expressions
  public abstract visitBinaryExpression(
    node: ast.BinaryExpression,
    context?: C
  ): R;
  public abstract visitIfExpression(node: ast.IfExpression, context?: C): R;
  public abstract visitInvokeExpression(
    node: ast.InvokeExpression,
    context?: C
  ): R;
  public abstract visitLiteralBoolean(node: ast.LiteralBoolean, context?: C): R;
  public abstract visitLiteralNumber(node: ast.LiteralNumber, context?: C): R;
  public abstract visitLiteralString(node: ast.LiteralString, context?: C): R;
  public abstract visitSimpleName(node: ast.SimpleName, context?: C): R;
  public abstract visitUnaryExpression(
    node: ast.UnaryExpression,
    context?: C
  ): R;

  // Statements
  public abstract visitJumpStatement(node: ast.JumpStatement, context?: C): R;
  public abstract visitVariableStatement(
    node: ast.VariableStatement,
    context?: C
  ): R;

  // Top Level
  public abstract visitFunctionDeclaration(
    node: ast.FunctionDeclaration,
    context?: C
  ): R;
}
