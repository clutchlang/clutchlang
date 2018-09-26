import { StringBuffer } from '../../../agnostic/strings';
import * as ast from '../../parser';

export class PrintTreeVisitor extends ast.AstVisitor<string, StringBuffer> {
  constructor(private readonly indent = 2) {
    super();
  }

  public visitBinaryExpression(
    node: ast.BinaryExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Left:', writer, () => node.left.accept(this, writer));
      writer.writeLine(`Operator: ${node.operatorToken.lexeme}`);
      this.writeIndented('Right:', writer, () =>
        node.right.accept(this, writer)
      );
    });
  }

  public visitIfExpression(
    node: ast.IfExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('If:', writer, () =>
        node.condition.accept(this, writer)
      );
      this.writeIndented('Body:', writer, () => {
        /* istanbul ignore next */
        const body =
          node.body instanceof ast.StatementBlock
            ? node.body.statements
            : [node.body];
        body.forEach(e => e.accept(this, writer));
      });
    });
  }

  public visitInvokeExpression(
    node: ast.InvokeExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Target:', writer, () => node.target);
      this.writeIndented('Parameters:', writer, () => {
        node.parameters.forEach(e => e.accept(this, writer));
      });
    });
  }

  public visitLiteralBoolean(
    node: ast.LiteralBoolean,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<${node.value}>`);
    return writer.toString();
  }

  public visitLiteralNumber(
    node: ast.LiteralNumber,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<${node.value}>`);
    return writer.toString();
  }

  public visitLiteralString(
    node: ast.LiteralString,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<${node.value}>`);
    return writer.toString();
  }

  public visitSimpleName(
    node: ast.SimpleName,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<#${node.name}>`);
    return writer.toString();
  }

  public visitUnaryExpression(
    node: ast.UnaryExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Target:', writer, () =>
        node.target.accept(this, writer)
      );
      writer.writeLine(`Operator: ${node.operatorToken.lexeme}`);
    });
  }

  public visitJumpStatement(
    node: ast.JumpStatement,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Return:', writer, () =>
        node.expression.accept(this, writer)
      );
    });
  }

  public visitVariableStatement(
    node: ast.VariableStatement,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Assign:', writer, () =>
        node.expression.accept(this, writer)
      );
    });
  }

  public visitFunctionDeclaration(
    node: ast.FunctionDeclaration,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Name:', writer, () => node.name.accept(this, writer));
      this.writeIndented('Parameters:', writer, () => {
        node.parameters.forEach(e => e.accept(this, writer));
      });
      this.writeIndented('Body:', writer, () => {
        /* istanbul ignore next */
        const body =
          node.body instanceof ast.StatementBlock
            ? node.body.statements
            : [node.body];
        body.forEach(e => e.accept(this, writer));
      });
    });
  }

  protected visitNode(
    node: ast.AstNode,
    writer: StringBuffer,
    children: () => void
  ): string {
    writer.writeLine(`${node.constructor.name}:`);
    writer.indent(this.indent);
    children();
    writer.indent(-this.indent);
    return writer.toString();
  }

  private writeIndented(
    message: string,
    writer: StringBuffer,
    fn: () => void
  ): void {
    writer.writeLine(message);
    writer.indent(this.indent);
    fn();
    writer.indent(-this.indent);
  }
}
