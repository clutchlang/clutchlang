// tslint:disable:no-magic-numbers

import { StringBuffer } from '../agnostic/strings';
import * as ast from '../language/parser';

// TODO: Refactor out a RecursiveAstVisitor, GeneralizingAstVisitor.

/**
 * Implements a simple/non-compliant Clutch-to-JS transpiler.
 *
 * It does not perform any semantic analysis, and is not able to support the
 * entire language, and instead is intended as an (early) demo and a way to test
 * the parser.
 */
export class SimpleJsTranspiler extends ast.AstVisitor<
  StringBuffer,
  StringBuffer
> {
  public visitFileRoot(
    node: ast.FileRoot,
    context = new StringBuffer()
  ): StringBuffer {
    node.topLevelElements.forEach(e => e.accept(this, context));
    return context;
  }

  public visitBinaryExpression(
    node: ast.BinaryExpression,
    context = new StringBuffer()
  ): StringBuffer {
    node.left.accept(this, context);
    context.write(` ${node.operatorToken.lexeme} `);
    node.right.accept(this, context);
    return context;
  }

  public visitGroupExpression(
    node: ast.GroupExpression,
    context = new StringBuffer()
  ): StringBuffer {
    context.write('(');
    node.expression.accept(this, context);
    context.write(')');
    return context;
  }

  public visitConditionalExpression(
    node: ast.ConditionalExpression,
    context = new StringBuffer()
  ): StringBuffer {
    // TODO: Support statement blocks?
    node.condition.accept(this, context);
    context.write(' ? ');
    (node.body as ast.Expression).accept(this, context);
    if (node.elseToken) {
      context.write(' : ');
      (node.elseBody as ast.Expression).accept(this, context);
    }
    return context;
  }

  public visitInvokeExpression(
    node: ast.InvokeExpression,
    context = new StringBuffer()
  ): StringBuffer {
    node.target.accept(this, context);
    context.write('(');
    node.parameters.forEach((e, i) => {
      e.accept(this, context);
      if (i < node.parameters.length - 1) {
        context.write(', ');
      }
    });
    context.write(')');
    return context;
  }

  public visitLiteralBoolean(
    node: ast.LiteralBoolean,
    context = new StringBuffer()
  ): StringBuffer {
    context.write(node.value);
    return context;
  }

  public visitLiteralNumber(
    node: ast.LiteralNumber,
    context = new StringBuffer()
  ): StringBuffer {
    context.write(node.value);
    return context;
  }

  public visitLiteralString(
    node: ast.LiteralString,
    context = new StringBuffer()
  ): StringBuffer {
    context.write("'");
    context.write(node.value);
    context.write("'");
    return context;
  }

  public visitSimpleName(
    node: ast.LiteralIdentifier,
    context = new StringBuffer()
  ): StringBuffer {
    context.write(node.name);
    return context;
  }

  public visitUnaryExpression(
    node: ast.UnaryExpression,
    context = new StringBuffer()
  ): StringBuffer {
    if (node.isPrefix) {
      context.write(node.operatorToken.lexeme);
      node.target.accept(this, context);
    } else {
      node.target.accept(this, context);
      context.write(node.operatorToken.lexeme);
    }
    return context;
  }

  public visitReturnStatement(
    node: ast.ReturnStatement,
    context = new StringBuffer()
  ): StringBuffer {
    context.write('return ');
    if (node.expression) {
      node.expression.accept(this, context);
    }
    return context;
  }

  public visitVariableDeclarationStatement(
    node: ast.VariableDeclarationStatement,
    context = new StringBuffer()
  ): StringBuffer {
    context.write('let ');
    node.name.accept(this, context);
    context.write(' = ');
    node.expression.accept(this, context);
    return context;
  }

  public visitFunctionDeclaration(
    node: ast.FunctionDeclaration,
    context = new StringBuffer()
  ): StringBuffer {
    context.write('function ');
    node.name.accept(this, context);
    context.write('(');
    node.parameters.forEach((e, i, a) => {
      const last = i === a.length - 1;
      e.accept(this, context);
      if (!last) {
        context.write(', ');
      }
    });
    context.write(') ');
    context.indent(2);
    context.writeLine('{');
    if (node.body instanceof ast.StatementBlock) {
      node.body.statements.forEach((e, i, a) => {
        const last = i === a.length - 1;
        if (last && e instanceof ast.Expression) {
          context.writeIndented('return ');
        } else {
          context.writeIndented();
        }
        e.accept(this, context);
        context.write(';\n');
      });
    } else {
      context.writeIndented('return ');
      node.body.accept(this, context);
      context.write(';\n');
    }
    context.indent(-2);
    context.writeLine('}');
    return context;
  }
}
