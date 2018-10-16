import * as tokens from './token';

/**
 * Represents an unresolved node in the abstract syntax tree.
 */
export abstract class AstNode {
  /**
   * Vitis this node using the @param visitor interface/
   */
  public abstract accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R;

  /**
   * First token that represents this AST node.
   */
  public abstract get firstToken(): tokens.Token;

  /**
   * Last token that represents this AST node.
   */
  public abstract get lastToken(): tokens.Token;
}

/**
 * Represents a simple AST node that originates from a single token.
 */
export abstract class SimpleNode extends AstNode {
  constructor(protected readonly token: tokens.Token) {
    super();
  }

  public get firstToken(): tokens.Token {
    return this.token;
  }

  public get lastToken(): tokens.Token {
    return this.token;
  }
}

/**
 * Represents an operator node parsed from a single token.
 */
export class Operator extends SimpleNode {
  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
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

  public get firstToken(): tokens.Token {
    return this.token;
  }

  public get lastToken(): tokens.Token {
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
  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitPrefixExpression(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.operator.firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.target.lastToken;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP>`.
 */
export class PostfixExpression extends OperatorExpression {
  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitPostfixExpression(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.target.firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.operator.lastToken;
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

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitBinaryExpresion(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.left.firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.right.lastToken;
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

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitPropertyExpression(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.target.firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.property.lastToken;
  }
}

/**
 * Represents a list of arguments passed to a function call.
 */
export class ArgumentList extends AstNode {
  constructor(
    public readonly firstToken: tokens.Token,
    public readonly args: Expression[],
    public readonly lastToken: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
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

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitCallExpression(this, context);
  }

  public get firstToken(): tokens.Token {
    return (this.target || this.name).firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.args.lastToken;
  }
}

/**
 * Represents an expression for a literal identifier (name).
 */
export class Identifier extends SimpleExpression {
  public get name(): string {
    return this.token.lexeme;
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitIdentifier(this, context);
  }
}

/**
 * Represents an expression for a literal boolean.
 */
export class LiteralBoolean extends SimpleExpression {
  public get value(): string {
    return this.token.lexeme;
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitLiteralBoolean(this, context);
  }
}

/**
 * Represents an expression for a literal number.
 */
export class LiteralNumber extends SimpleExpression {
  public get value(): string {
    return this.token.lexeme;
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitLiteralNumber(this, context);
  }
}

/**
 * Represents an expression for a literal string.
 */
export class LiteralString extends SimpleExpression {
  public get value(): string {
    return this.token.lexeme;
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitLiteralString(this, context);
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

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitVariableDeclaration(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.name.firstToken;
  }

  public get lastToken(): tokens.Token {
    return (this.value || this.type || this.name).lastToken;
  }
}

/**
 * Represents a list of parameters for a function or closure definition.
 */
export class ParameterList extends AstNode {
  constructor(
    public readonly firstToken: tokens.Token,
    public readonly params: VariableDeclaration[],
    public readonly lastToken: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitParameterList(this, context);
  }
}

/**
 * Represents a series of statements.
 */
export class StatementBlock extends AstNode {
  constructor(
    public readonly firstToken: tokens.Token,
    public readonly statements: Statement[],
    public readonly lastToken: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitStatementBlock(this, context);
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

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitFunctionDeclaration(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.name.firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.body.lastToken;
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
    public readonly lastToken: tokens.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitTypeDeclaration(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.modifiers.length ? this.modifiers[0] : this.name.firstToken;
  }
}

/**
 * Represents a module declared in a file.
 */
export class ModuleDeclaration extends AstNode {
  constructor(
    public readonly members: Array<FunctionDeclaration | TypeDeclaration | VariableDeclaration>,
  ) {
    super();
  }

  public accept<R, C>(visitor: IAstVisitor<R, C>, context?: C): R {
    return visitor.visitModuleDeclaration(this, context);
  }

  public get firstToken(): tokens.Token {
    return this.members[0].firstToken;
  }

  public get lastToken(): tokens.Token {
    return this.members[this.members.length - 1].lastToken;
  }
}

export class AstParser {}

/**
 * Interface for visiting every known concrete implementation of @see AstNode.
 *
 * May optionally pass around a contextual object "C", and return an "R".
 */
export interface IAstVisitor<R, C> {
  visitArgumentList(node: ArgumentList, context?: C): R;
  visitBinaryExpresion(node: BinaryExpression, context?: C): R;
  visitCallExpression(node: CallExpression, context?: C): R;
  visitFunctionDeclaration(node: FunctionDeclaration, context?: C): R;
  visitIdentifier(node: Identifier, context?: C): R;
  visitLiteralBoolean(node: LiteralBoolean, context?: C): R;
  visitLiteralNumber(node: LiteralNumber, context?: C): R;
  visitLiteralString(node: LiteralString, context?: C): R;
  visitModuleDeclaration(node: ModuleDeclaration, context?: C): R;
  visitOperator(node: Operator, context?: C): R;
  visitParameterList(node: ParameterList, context?: C): R;
  visitPrefixExpression(node: PrefixExpression, context?: C): R;
  visitPostfixExpression(node: PostfixExpression, context?: C): R;
  visitPropertyExpression(node: PropertyExpression, context?: C): R;
  visitStatementBlock(node: StatementBlock, context?: C): R;
  visitTypeDeclaration(node: TypeDeclaration, context?: C): R;
  visitVariableDeclaration(node: VariableDeclaration, context?: C): R;
}
