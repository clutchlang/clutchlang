import * as ast from './nodes';

/**
 * A dispatch mechanism that visits every AST node, recursively.
 */
export class RecursiveAstVisitor<R, C> extends ast.AstVisitor<void, C> {
  public visitArgumentList(node: ast.ArgumentList, context?: C): R | void {
    node.args.forEach(e => e.accept(this, context));
  }

  public visitBinaryExpression(
    node: ast.BinaryExpression,
    context?: C
  ): R | void {
    node.left.accept(this, context);
    node.operator.accept(this, context);
    node.right.accept(this, context);
  }

  public visitCallExpression(node: ast.CallExpression, context?: C): R | void {
    if (node.target) {
      node.target.accept(this, context);
    }
    node.name.accept(this, context);
    node.args.accept(this, context);
  }

  public visitConditionalExpression(
    node: ast.ConditionalExpression,
    context?: C
  ): R | void {
    node.condition.accept(this, context);
    node.body.accept(this, context);
    if (node.elseCondition) {
      node.elseCondition.accept(this, context);
      node.elseBody!.accept(this, context);
    }
  }

  public visitFunctionDeclaration(
    node: ast.FunctionDeclaration,
    context?: C
  ): R | void {
    node.name.accept(this, context);
    if (node.params) {
      node.params.accept(this, context);
    }
    if (node.returnType) {
      node.returnType.accept(this, context);
    }
    if (node.body) {
      node.body.accept(this, context);
    }
  }

  public visitGroupExpression(
    node: ast.GroupExpression,
    context?: C
  ): R | void {
    node.expression.accept(this, context);
  }

  public visitIdentifier(_: ast.Identifier, __?: C): R | void {
    // No children.
  }

  public visitLiteralBoolean(_: ast.LiteralBoolean, __?: C): R | void {
    // No children.
  }

  public visitLiteralNumber(_: ast.LiteralNumber, __?: C): R | void {
    // No children.
  }

  public visitLiteralString(_: ast.LiteralString, __?: C): R | void {
    // No children.
  }

  public visitModuleDeclaration(
    node: ast.ModuleDeclaration,
    context?: C
  ): R | void {
    node.declarations.forEach(e => e.accept(this, context));
  }

  public visitOperator(_: ast.Operator, __?: C): R | void {
    // No children.
  }

  public visitParameterList(node: ast.ParameterList, context?: C): R | void {
    node.params.forEach(e => e.accept(this, context));
  }

  public visitPrefixExpression(
    node: ast.PrefixExpression,
    context?: C
  ): R | void {
    node.operator.accept(this, context);
    node.target.accept(this, context);
  }

  public visitPostfixExpression(
    node: ast.PostfixExpression,
    context?: C
  ): R | void {
    node.target.accept(this, context);
    node.operator.accept(this, context);
  }

  public visitPropertyExpression(
    node: ast.PropertyExpression,
    context?: C
  ): R | void {
    node.target.accept(this, context);
    node.property.accept(this, context);
  }

  public visitReturnStatement(
    node: ast.ReturnStatement,
    context?: C
  ): R | void {
    if (node.expression) {
      node.expression.accept(this, context);
    }
  }

  public visitStatementBlock(node: ast.StatementBlock, context?: C): R | void {
    node.statements.forEach(e => e.accept(this, context));
  }

  public visitTypeDeclaration(
    node: ast.TypeDeclaration,
    context?: C
  ): R | void {
    node.members.forEach(e => e.accept(this, context));
  }

  public visitVariableDeclaration(
    node: ast.VariableDeclaration,
    context?: C
  ): R | void {
    node.name.accept(this, context);
    if (node.type) {
      node.type.accept(this, context);
    }
    if (node.value) {
      node.value.accept(this, context);
    }
  }
}
