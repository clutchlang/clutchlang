import * as prettier from 'prettier';
import {
  AstCompilationUnit,
  AstFunctionDeclaration,
  AstIfExpression,
  AstInvocationExpression,
  AstLiteralBoolean,
  AstLiteralIdentifier,
  AstLiteralNumber,
  AstLiteralString,
  AstParenthesizedExpression,
  AstReturnStatement,
  AstStatement,
  AstVariableDeclaration,
} from '../parser/source/ast/node';
import { AstVisitor } from '../parser/source/ast/visitor';

/**
 * A basic "compiler" that does a literal translation to JavaScript.
 *
 * It does *not*:
 * - Implement the Clutch language specification.
 * - Perform validation, type-checking, or any other error checking.
 *
 * This is a stop-gap output type until the pipeline is more complete.
 */
export class JsOutputTranspiler extends AstVisitor {
  public visitCompilationUnit(node: AstCompilationUnit): string {
    const output = node.functions.map(e => e.visit(this)).join('\n');
    return prettier.format(output, { parser: 'babylon' });
  }

  public visitFunctionDeclaration(node: AstFunctionDeclaration): string {
    return `
      function ${node.name}(${node.parameters.map(e => e.name).join(', ')}) {
      ${this.visitExpressionBody(node.body)}
      }
      ${node.name === 'main' ? 'main();' : ''}
    `;
  }

  public visitVariableDeclaration(node: AstVariableDeclaration): string {
    return `let ${node.name} = ${node.value.visit(this)}`;
  }

  public visitLiteralBoolean(node: AstLiteralBoolean): string {
    return node.value.toString();
  }

  public visitLiteralNumber(node: AstLiteralNumber): string {
    return node.value.toString();
  }

  public visitLiteralString(node: AstLiteralString): string {
    return `'${node.value.toString()}'`;
  }

  public visitLiteralIdentifier(node: AstLiteralIdentifier): string {
    return node.name.toString();
  }

  public visitIfExpression(node: AstIfExpression): string {
    return ` (function () {
        if (${node.ifExpression.visit(this)}) {
          ${this.visitExpressionBody(node.ifBody)}
        }${
          node.elseBody.length
            ? ` else {\n          ${this.visitExpressionBody(node.elseBody)}\n}`
            : ''
        }
      })()
    `;
  }

  public visitInvocationExpression(node: AstInvocationExpression): string {
    const target = node.target;
    // Special cased for now.
    if (target instanceof AstLiteralIdentifier && target.name === 'print') {
      return `console.log(${node.args[0].visit(this)})`;
    }
    return `${target.visit(this)}(${node.args
      .map(e => e.visit(this))
      .join(', ')})`;
  }

  public visitParenthesizedExpression(
    node: AstParenthesizedExpression
  ): string {
    return `(${node.body.map(e => e.visit(this)).join(', ')})`;
  }

  public visitReturnStatement(node: AstReturnStatement): string {
    return `return ${node.value.visit(this)}`;
  }

  private isStatementOnly(node: AstStatement): boolean {
    // TODO: Find a better way of doing this.
    return (
      node instanceof AstReturnStatement ||
      node instanceof AstVariableDeclaration
    );
  }

  private visitExpressionBody(nodes: AstStatement[]): string {
    let buffer = '';
    for (let i = 0; i < nodes.length; i++) {
      // Implicit return.
      if (i === nodes.length - 1 && !this.isStatementOnly(nodes[i])) {
        buffer += 'return  ';
      }
      buffer += nodes[i].visit(this) + ';\n';
    }
    return buffer;
  }
}
