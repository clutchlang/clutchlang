import { StringBuffer } from '../../../agnostic/strings';
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
} from '../../parser';
import { AstNode, FileRoot, FunctionDeclaration } from '../nodes/nodes';
import {
  ReturnStatement,
  StatementBlock,
  VariableDeclarationStatement,
} from '../nodes/statements';
import { AstVisitor } from './abstract';

export class PrintTreeVisitor extends AstVisitor<string, StringBuffer> {
  constructor(private readonly indent = 2) {
    super();
  }

  public visitFileRoot(node: FileRoot, writer = new StringBuffer()): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Elements:', writer, () => {
        node.topLevelElements.forEach(e => e.accept(this, writer));
      });
    });
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

  public visitGroupExpression(
    node: GroupExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Expression:', writer, () =>
        node.expression.accept(this, writer)
      );
    });
  }

  public visitConditionalExpression(
    node: ConditionalExpression,
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
      if (node.elseBody) {
        this.writeIndented('Else:', writer, () => {
          /* istanbul ignore next */
          const body =
            node.elseBody instanceof StatementBlock
              ? node.elseBody.statements
              : [node.elseBody];
          body.forEach(e => e!.accept(this, writer));
        });
      }
    });
  }

  public visitInvokeExpression(
    node: InvokeExpression,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      this.writeIndented('Target:', writer, () =>
        node.target.accept(this, writer)
      );
      this.writeIndented('Parameters:', writer, () => {
        node.parameters.forEach(e => e.accept(this, writer));
      });
    });
  }

  public visitLiteralBoolean(
    node: LiteralBoolean,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`LiteralBoolean: ${node.value}`);
    return writer.toString();
  }

  public visitLiteralNumber(
    node: LiteralNumber,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`LiteralNumber: ${node.value}`);
    return writer.toString();
  }

  public visitLiteralString(
    node: LiteralString,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`LiteralString: '${node.value}'`);
    return writer.toString();
  }

  public visitSimpleName(
    node: LiteralIdentifier,
    writer = new StringBuffer()
  ): string {
    writer.writeLine(`SimpleName: ${node.name}`);
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
      writer.writeLine(
        `Operator: ${node.operatorToken.lexeme} ${
          node.isPrefix ? '(Prefix)' : '(Postfix)'
        }`
      );
    });
  }

  public visitReturnStatement(
    node: ReturnStatement,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      if (node.expression) {
        this.writeIndented('Return:', writer, () => {
          node.expression!.accept(this, writer);
        });
      }
    });
  }

  public visitVariableDeclarationStatement(
    node: VariableDeclarationStatement,
    writer = new StringBuffer()
  ): string {
    return this.visitNode(node, writer, () => {
      writer.writeLine(`Name: ${node.name.name}`);
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
