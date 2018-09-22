import {
  AstCompilationUnit,
  AstFunctionDeclaration,
  AstInvocationExpression,
  AstLiteralBoolean,
  AstLiteralIdentifier,
  AstLiteralNumber,
  AstLiteralString,
  AstParenthesizedExpression,
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
    return node.functions.map(e => e.visit(this)).join('\n');
  }

  public visitFunctionDeclaration(node: AstFunctionDeclaration): string {
    return `
      function ${node.name}(${node.parameters.map(e => e.name).join(', ')}) {
        ${node.body.map(e => `${e.visit(this)};`).join('\n')}
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
}
