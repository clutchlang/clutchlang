import {
  AstCompilationUnit,
  AstFunctionDeclaration,
  AstInvocationExpression,
  AstLiteralBoolean,
  AstLiteralIdentifier,
  AstLiteralNumber,
  AstLiteralString,
  AstParenthesizedExpression,
} from './node';

export abstract class AstVisitor {
  public visitCompilationUnit(node: AstCompilationUnit): void {
    for (const f of node.functions) {
      f.visit(this);
    }
  }

  public visitFunctionDeclaration(node: AstFunctionDeclaration): void {
    for (const e of node.body) {
      e.visit(this);
    }
  }

  public abstract visitLiteralBoolean(node: AstLiteralBoolean): void;
  public abstract visitLiteralNumber(node: AstLiteralNumber): void;
  public abstract visitLiteralString(node: AstLiteralString): void;
  public abstract visitLiteralIdentifier(node: AstLiteralIdentifier): void;

  public visitParenthesizedExpression(node: AstParenthesizedExpression): void {
    for (const e of node.body) {
      e.visit(this);
    }
  }

  public visitInvocationExpression(node: AstInvocationExpression): void {
    for (const a of node.args) {
      a.visit(this);
    }
  }
}

/**
 * Outputs an indented string tree of the AST structure.
 */
export class PrintTreeVisitor extends AstVisitor {
  private output = '';
  private indent = 0;

  constructor(private readonly indentBy = 2) {
    super();
  }

  public visitCompilationUnit(node: AstCompilationUnit): string {
    this.write('CompilationUnit');
    this.indentMore();
    super.visitCompilationUnit(node);
    this.indentLess();
    return this.output;
  }

  public visitFunctionDeclaration(node: AstFunctionDeclaration): void {
    this.write(`FunctionDeclaration (name = ${node.name})`);
    this.indentMore();
    super.visitFunctionDeclaration(node);
    this.indentLess();
  }

  public visitLiteralBoolean(node: AstLiteralBoolean): void {
    this.write(`LiteralBoolean: ${node.value}`);
  }

  public visitLiteralNumber(node: AstLiteralNumber): void {
    this.write(`LiteralNumber: ${node.value}`);
  }

  public visitLiteralString(node: AstLiteralString): void {
    this.write(`LiteralString: ${node.value}`);
  }

  public visitLiteralIdentifier(node: AstLiteralIdentifier): void {
    this.write(`LiteralIdentifier: ${node.name}`);
  }

  public visitInvocationExpression(node: AstInvocationExpression) {
    this.write(`InvocationExpression:`);
    this.indentMore();
    this.write(`Target:`);
    this.indentMore();
    node.target.visit(this);
    this.indentLess();
    this.write(`Args:`);
    this.indentMore();
    super.visitInvocationExpression(node);
    this.indentLess();
  }

  public visitParenthesizedExpression(node: AstParenthesizedExpression) {
    this.write(`ParenthesizedExpression:`);
    this.indentMore();
    super.visitParenthesizedExpression(node);
    this.indentLess();
  }

  private indentMore(): void {
    this.indent += this.indentBy;
  }

  private indentLess(): void {
    this.indent -= this.indentBy;
  }

  private write(message: string): void {
    const indent = ' '.repeat(this.indent);
    this.output += `${indent}${message}\n`;
  }
}
