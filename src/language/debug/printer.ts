import { StringBuffer } from "../../agnostic/strings";
import * as ast from "../ast/parser";

export class PrintTreeVisitor extends ast.AstVisitor<StringBuffer, StringBuffer> {
  constructor(private readonly indent = 2) {
    super();
  }

  public visitBinaryExpression(
    node: ast.BinaryExpression, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      'BinaryExpression',
      buffer, [
        ['Left', node.left],
        ['Operator', node.operator],
        ['Right', node.right],
      ],
    );
  }

  public visitCallExpression(
    node: ast.CallExpression<ast.Expression>, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      'CallExpression',
      buffer, [
        ['Target', node.target],
        ['Arguments', node.args],
      ],
    );
  }
  
  public visitConditionalExpression(
    node: ast.ConditionalExpression, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      'ConditionalExpression',
      buffer, [
        ['If', node.condition],
        ['Then', node.body],
        ['Else', node.elseBody],
      ],
    );
  }

  public visitFunctionDeclaration(
    node: ast.FunctionDeclaration, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      'FunctionDeclaration',
      buffer, [
        ['Name', node.name],
        ['External', node.isExternal],
        ['Parameters', node.params],
        ['Returns', node.returnType],
        ['Body', node.body],
      ],
    );
  }

  public visitGroupExpression(
    node: ast.GroupExpression<ast.Expression>, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      'GroupExpression',
      buffer, [
        ['Expression', node.expression],
      ],
    );
  } 

  public visitIdentifier(
    node: ast.Identifier, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `Identifier {${node.name}}`,
      buffer,
    );
  }

  public visitLiteralBoolean(
    node: ast.LiteralBoolean, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `LiteralBoolean {${node.value}}`,
      buffer,
    );
  }

  public visitLiteralNumber(
    node: ast.LiteralNumber, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `LiteralNumber {${node.value}}`,
      buffer,
    );
  }
  
  public visitLiteralString(
    node: ast.LiteralString, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `LiteralString {${node.value}}`,
      buffer,
    );
  }

  public visitModuleDeclaration(
    node: ast.ModuleDeclaration, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `ModuleDeclaration`,
      buffer,
      [
        ['Declarations', node.declarations]
      ],
    );
  }

  public visitModuleRoot(
    node: ast.ModuleRoot, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `ModuleRoot`,
      buffer,
      [
        ['Modules', node.modules]
      ],
    );
  }

  public visitOperator(
    node: ast.Operator<ast.OperatorType>, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `Operator {${node.type}: "${node.firstToken.lexeme}"}`,
      buffer,
    );
  }

  public visitParameterList(
    node: ast.ParameterList, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `ParameterList`,
      buffer,
      [
        ['Parameters', node.params]
      ],
    );
  }

  public visitPrefixExpression(
    node: ast.PrefixExpression, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `PrefixExpression`,
      buffer,
      [
        ['Operator', node.operator],
        ['Target', node.target]
      ],
    );
  }

  public visitPostfixExpression(
    node: ast.PostfixExpression, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `PostfixExpression`,
      buffer,
      [
        ['Target', node.target],
        ['Operator', node.operator],
      ],
    );
  }

  public visitPropertyExpression(
    node: ast.PropertyExpression<ast.Expression>, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `PropertyExpression`,
      buffer,
      [
        ['Target', node.target],
        ['Property', node.property],
      ],
    );
  }

  public visitReturnStatement(
    node: ast.ReturnStatement, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `ReturnStatement`,
      buffer,
      [
        ['Expression', node.expression],
      ],
    );
  }

  public visitStatementBlock(
    node: ast.StatementBlock, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `StatementBlock`,
      buffer,
      [
        ['Statements', node.statements],
      ],
    );
  }

  public visitTypeDeclaration(
    node: ast.TypeDeclaration, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `TypeDeclaration`,
      buffer,
      [
        ['Name', node.name],
        ['External', node.isExternal],
        ['Members', node.members]
      ],
    );
  }

  public visitVariableDeclaration(
    node: ast.VariableDeclaration, 
    buffer = new StringBuffer(),
  ): StringBuffer {
    return this.visitAll(
      `VariableDeclaration`,
      buffer,
      [
        ['Name', node.name],
        ['Type', node.type],
        ['Value', node.value]
      ],
    );
  }

  private visitAll(
    name: string, 
    buffer: StringBuffer, 
    children: ReadonlyArray<[string, ast.AstNode | ast.AstNode[] | undefined | boolean | string]> = [],
  ): StringBuffer {
    buffer.writeLine(`${name}:`);
    for (const child of children) {
      const title = child[0];
      const value = child[1];
      if (value === undefined) {
        continue;
      }
      if (typeof value === 'boolean' || typeof value === 'string') {
        buffer.writeLine(`${title}: ${value}`);
        continue;
      }
      buffer.writeLine(`${title}:`);
      if (value instanceof Array) {
        value.forEach(n => this.visitWithIndent(n, buffer));
      } else {
        this.visitWithIndent(value, buffer);
      }
    }
    return buffer;
  }

  private visitWithIndent(node: ast.AstNode, buffer: StringBuffer): void {
    buffer.indent(this.indent);
    node.accept(this, buffer);
    buffer.indent(-this.indent);
  }
}
