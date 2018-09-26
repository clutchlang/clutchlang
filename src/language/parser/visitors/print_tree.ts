import { StringBuffer } from '../../../agnostic/strings';
import {
  BinaryExpression,
  IfExpression,
  InvokeExpression,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  SimpleName,
  UnaryExpression,
} from '../../parser';
import { AstNode, FunctionDeclaration } from '../nodes';
import {
  JumpStatement,
  StatementBlock,
  VariableStatement,
} from '../statements';
import { AstVisitor } from './abstract';

export class PrintTreeVisitor extends AstVisitor<string, StringBuffer> {
  constructor(private readonly indent = 2) {
    super();
  }

  public visitBinaryExpression(
    node: BinaryExpression,
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
    node: IfExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('If:', writer, () =>
        node.condition.accept(this, writer)
      );
      this.writeIndented('Body:', writer, () => {
        /* istanbul ignore next */
        const body =
          node.body instanceof StatementBlock
            ? node.body.statements
            : [node.body];
        body.forEach(e => e.accept(this, writer));
      });
    });
  }

  public visitInvokeExpression(
    node: InvokeExpression,
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
    node: LiteralBoolean,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<${node.value}>`);
    return writer.toString();
  }

  public visitLiteralNumber(
    node: LiteralNumber,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<${node.value}>`);
    return writer.toString();
  }

  public visitLiteralString(
    node: LiteralString,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<${node.value}>`);
    return writer.toString();
  }

  public visitSimpleName(
    node: SimpleName,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`<#${node.name}>`);
    return writer.toString();
  }

  public visitUnaryExpression(
    node: UnaryExpression,
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
    node: JumpStatement,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Return:', writer, () =>
        node.expression.accept(this, writer)
      );
    });
  }

  public visitVariableStatement(
    node: VariableStatement,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Assign:', writer, () =>
        node.expression.accept(this, writer)
      );
    });
  }

  public visitFunctionDeclaration(
    node: FunctionDeclaration,
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
          node.body instanceof StatementBlock
            ? node.body.statements
            : [node.body];
        body.forEach(e => e.accept(this, writer));
      });
    });
  }

  protected visitNode(
    node: AstNode,
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
