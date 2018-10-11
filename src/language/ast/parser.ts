import * as tokens from './token';

/**
 * Represents an unresolved node in the abstract syntax tree.
 */
export abstract class AstNode {
  public abstract accept<R, C>(
    visitor: AstVisitor<R, C>,
    context?: C
  ): R | undefined;

  /**
   * First token that represents this AST node.
   */
  public abstract get first(): tokens.Token;

  /**
   * Last token that represents this AST node.
   */
  public abstract get last(): tokens.Token;
}

/**
 * Represents a simple AST node that originates from a single token.
 */
export abstract class SimpleNode extends AstNode {
  constructor(protected readonly token: tokens.Token) {
    super();
  }

  public get first(): tokens.Token {
    return this.token;
  }

  public get last(): tokens.Token {
    return this.token;
  }
}

/**
 * Represents an operator node parsed from a single token.
 */
export class Operator extends SimpleNode {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitOperator(this, context);
  }
}

/**
 * Represents a marker type of AST node for all statements.
 */
export abstract class Statement extends AstNode {}

/**
 * Represents a marker type of AST node for all expressions.
 */
export abstract class Expression extends Statement {}

/**
 * Represents a simple AST node that is also an expression.
 */
export abstract class SimpleExpression extends Expression {
  constructor(protected readonly token: tokens.Token) {
    super();
  }

  public get first(): tokens.Token {
    return this.token;
  }

  public get last(): tokens.Token {
    return this.token;
  }
}

/**
 * Represents an expression that utilizes an operator.
 */
export abstract class OperatorExpression extends Expression {
  constructor(
    public readonly operator: Operator,
    public readonly target: Expression
  ) {
    super();
  }
}

/**
 * Represents an expression in the form of `<OP><EXPR>`.
 */
export class PrefixExpression extends OperatorExpression {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitPrefixExpression(this, context);
  }

  public get first(): tokens.Token {
    return this.operator.first;
  }

  public get last(): tokens.Token {
    return this.target.last;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP>`.
 */
export class PostfixExpression extends OperatorExpression {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitPostfixExpression(this, context);
  }

  public get first(): tokens.Token {
    return this.target.first;
  }

  public get last(): tokens.Token {
    return this.operator.last;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP><EXPR>`.
 */
export class BinaryExpression extends OperatorExpression {
  constructor(
    operator: Operator,
    public readonly left: Expression,
    public readonly right: Expression
  ) {
    super(operator, left);
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitBinaryExpression(this, context);
  }

  public get first(): tokens.Token {
    return this.left.first;
  }

  public get last(): tokens.Token {
    return this.right.last;
  }
}

/**
 * Represents an expression in the form of `<TARGET>.<PROPERTY>`.
 */
export class PropertyExpression extends Expression {
  constructor(
    public readonly target: Expression,
    public readonly property: Identifier
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitPropertyExpression(this, context);
  }

  public get first(): tokens.Token {
    return this.target.first;
  }

  public get last(): tokens.Token {
    return this.property.last;
  }
}

/**
 * Represents a list of arguments passed to a function call.
 */
export class ArgumentList extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly args: Expression[],
    public readonly last: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitArgumentList(this, context);
  }
}

/**
 * Represents an expression for a function call.
 *
 * May _optionally_ contain a @member target.
 */
export class CallExpression extends Expression {
  constructor(
    public readonly name: Identifier,
    public readonly args: ArgumentList,
    public readonly target?: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitCallExpression(this, context);
  }

  public get first(): tokens.Token {
    return (this.target || this.name).first;
  }

  public get last(): tokens.Token {
    return this.args.last;
  }
}

export class ConditionalExpression extends Expression {
  constructor(
    public readonly first: tokens.Token,
    public readonly condition: Expression,
    public readonly body: Expression | StatementBlock,
    public readonly elseCondition?: Expression,
    public readonly elseBody?: Expression | StatementBlock
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitConditionalExpression(this, context);
  }

  public get last(): tokens.Token {
    return (this.elseBody || this.body).last;
  }
}

export class GroupExpression extends Expression {
  constructor(
    public readonly first: tokens.Token,
    public readonly expression: Expression,
    public readonly last: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitGroupExpression(this, context);
  }
}

/**
 * Represents an expression for a literal identifier (name).
 */
export class Identifier extends SimpleExpression {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitIdentifier(this, context);
  }

  public get name(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents an expression for a literal boolean.
 */
export class LiteralBoolean extends SimpleExpression {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitLiteralBoolean(this, context);
  }

  public get value(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents an expression for a literal number.
 */
export class LiteralNumber extends SimpleExpression {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitLiteralNumber(this, context);
  }

  public get value(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents an expression for a literal string.
 */
export class LiteralString extends SimpleExpression {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitLiteralString(this, context);
  }

  public get value(): string {
    return this.token.lexeme;
  }
}

/**
 * Represents a variable declared anywhere in scope.
 */
export class VariableDeclaration extends AstNode {
  constructor(
    public readonly name: Identifier,
    public readonly type?: Identifier,
    public readonly value?: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitVariableDeclaration(this, context);
  }

  public get first(): tokens.Token {
    return this.name.first;
  }

  public get last(): tokens.Token {
    return (this.value || this.type || this.name).last;
  }
}

/**
 * Represents a list of parameters for a function or closure definition.
 */
export class ParameterList extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly params: VariableDeclaration[],
    public readonly last: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitParameterList(this, context);
  }
}

/**
 * Represents a series of statements.
 */
export class StatementBlock extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly statements: Statement[],
    public readonly last: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitStatementBlock(this, context);
  }
}

/**
 * Represents a return statement.
 */
export class ReturnStatement extends AstNode {
  constructor(
    public readonly first: tokens.Token,
    public readonly expression?: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitReturnStatement(this, context);
  }

  public get last(): tokens.Token {
    return this.expression ? this.expression.last : this.first;
  }
}

/**
 * Represents a function declared anywhere in scope.
 */
export class FunctionDeclaration extends AstNode {
  constructor(
    public readonly name: Identifier,
    public readonly params: ParameterList,
    public readonly body: Expression | StatementBlock,
    public readonly returnType?: Identifier
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitFunctionDeclaration(this, context);
  }

  public get first(): tokens.Token {
    return this.name.first;
  }

  public get last(): tokens.Token {
    return this.body.last;
  }
}

/**
 * Represents a type declared anywhere in scope.
 */
export class TypeDeclaration extends AstNode {
  constructor(
    public readonly modifiers: tokens.Token[],
    public readonly name: Identifier,
    public readonly members: Array<FunctionDeclaration | VariableDeclaration>,
    public readonly last: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitTypeDeclaration(this, context);
  }

  public get first(): tokens.Token {
    return this.modifiers.length ? this.modifiers[0] : this.name.first;
  }
}

/**
 *
 */
export class ModuleRoot extends AstNode {
  constructor(
    public readonly declarations: Array<
      FunctionDeclaration | TypeDeclaration | VariableDeclaration
    >
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitModuleRoot(this, context);
  }

  public get first(): tokens.Token {
    return this.declarations[0].first;
  }

  public get last(): tokens.Token {
    return this.declarations[this.declarations.length - 1].last;
  }
}

export class AstParser {}

/**
 * A dispatch mechanism for visiting AST nodes.
 */
export abstract class AstVisitor<R, C> {
  public abstract visitArgumentList(node: ArgumentList, context?: C): R;
  public abstract visitBinaryExpression(node: BinaryExpression, context?: C): R;
  public abstract visitCallExpression(node: CallExpression, context?: C): R;
  public abstract visitConditionalExpression(
    node: ConditionalExpression,
    context?: C
  ): R;
  public abstract visitFunctionDeclaration(
    node: FunctionDeclaration,
    context?: C
  ): R;
  public abstract visitGroupExpression(node: GroupExpression, context?: C): R;
  public abstract visitIdentifier(node: Identifier, context?: C): R;
  public abstract visitLiteralBoolean(node: LiteralBoolean, context?: C): R;
  public abstract visitLiteralNumber(node: LiteralNumber, context?: C): R;
  public abstract visitLiteralString(node: LiteralString, context?: C): R;
  public abstract visitModuleRoot(node: ModuleRoot, context?: C): R;
  public abstract visitOperator(node: Operator, context?: C): R;
  public abstract visitParameterList(node: ParameterList, context?: C): R;
  public abstract visitPrefixExpression(node: PrefixExpression, context?: C): R;
  public abstract visitPostfixExpression(
    node: PostfixExpression,
    context?: C
  ): R;
  public abstract visitPropertyExpression(
    node: PropertyExpression,
    context?: C
  ): R;
  public abstract visitReturnStatement(node: ReturnStatement, context?: C): R;
  public abstract visitStatementBlock(node: StatementBlock, context?: C): R;
  public abstract visitTypeDeclaration(node: TypeDeclaration, context?: C): R;
  public abstract visitVariableDeclaration(
    node: VariableDeclaration,
    context?: C
  ): R;
}
