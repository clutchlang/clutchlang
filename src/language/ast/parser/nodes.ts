import * as lexer from '../lexer';

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
  public abstract get firstToken(): lexer.Token;

  /**
   * Last token that represents this AST node.
   */
  public abstract get lastToken(): lexer.Token;
}

/**
 * Represents a simple AST node that originates from a single token.
 */
export abstract class SimpleNode extends AstNode {
  constructor(protected readonly token: lexer.Token) {
    super();
  }

  public get firstToken(): lexer.Token {
    return this.token;
  }

  public get lastToken(): lexer.Token {
    return this.token;
  }
}

export enum OperatorType {
  Property,
  PrefixIncrement,
  PrefixDecrement,
  UnaryNegative,
  UnaryPositive,
  LogicalNot,
  PostfixIncrement,
  PostfixDecrement,
  Multiplication,
  Division,
  Remainder,
  BitwiseShiftLeft,
  BitwiseShiftRight,
  Addition,
  Subtraction,
  LessThan,
  GreaterThan,
  LessThanOrEqual,
  GreaterThanOrEqual,
  Equality,
  Inequality,
  Identity,
  Unidentity,
  LogicalAnd,
  LogicalOr,
  Assign,
  AssignIncreasedBy,
  AssignDecreasedBy,
  AssignMultipliedBy,
  AssignDividedBy,
  AssignRemainderBy,
  InvalidOrError,
}

/**
 * Unexpected operator type.
 */
export type InvalidOperatorType = OperatorType.InvalidOrError;

/**
 * Valid binary operator types.
 */
export type BinaryOperatorType =
  | OperatorType.Property
  | OperatorType.Division
  | OperatorType.Multiplication
  | OperatorType.Remainder
  | OperatorType.Addition
  | OperatorType.Subtraction
  | OperatorType.BitwiseShiftLeft
  | OperatorType.BitwiseShiftRight
  | OperatorType.LessThan
  | OperatorType.LessThanOrEqual
  | OperatorType.GreaterThan
  | OperatorType.GreaterThanOrEqual
  | OperatorType.Equality
  | OperatorType.Inequality
  | OperatorType.Identity
  | OperatorType.Unidentity
  | OperatorType.LogicalAnd
  | OperatorType.LogicalOr
  | OperatorType.Assign
  | OperatorType.AssignIncreasedBy
  | OperatorType.AssignDecreasedBy
  | OperatorType.AssignMultipliedBy
  | OperatorType.AssignDividedBy
  | OperatorType.AssignRemainderBy
  | OperatorType.InvalidOrError;

/**
 * Valid prefix operator types.
 */
export type PrefixOperatorType =
  | OperatorType.PrefixIncrement
  | OperatorType.PrefixDecrement
  | OperatorType.UnaryNegative
  | OperatorType.UnaryPositive
  | OperatorType.LogicalNot
  | OperatorType.InvalidOrError;

/**
 * Valid postfix operator types.
 */
export type PostfixOperatorType =
  | OperatorType.PostfixDecrement
  | OperatorType.PostfixIncrement
  | OperatorType.InvalidOrError;

/**
 * Represents an operator node parsed from a single token.
 */
export class Operator<T extends OperatorType> extends SimpleNode {
  constructor(token: lexer.Token, public readonly type: T) {
    super(token);
  }

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
  constructor(protected readonly token: lexer.Token) {
    super();
  }

  public get firstToken(): lexer.Token {
    return this.token;
  }

  public get lastToken(): lexer.Token {
    return this.token;
  }
}

/**
 * Represents an expression that utilizes an operator.
 */
export abstract class OperatorExpression<
  T extends OperatorType
> extends Expression {
  constructor(
    public readonly operator: Operator<T>,
    public readonly target: Expression
  ) {
    super();
  }
}

/**
 * Represents an expression in the form of `<OP><EXPR>`.
 */
export class PrefixExpression extends OperatorExpression<PrefixOperatorType> {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitPrefixExpression(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.operator.firstToken;
  }

  public get lastToken(): lexer.Token {
    return this.target.lastToken;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP>`.
 */
export class PostfixExpression extends OperatorExpression<PostfixOperatorType> {
  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitPostfixExpression(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.target.firstToken;
  }

  public get lastToken(): lexer.Token {
    return this.operator.lastToken;
  }
}

/**
 * Represents an expression in the form of `<EXPR><OP><EXPR>`.
 */
export class BinaryExpression extends OperatorExpression<BinaryOperatorType> {
  constructor(
    operator: Operator<BinaryOperatorType>,
    public readonly left: Expression,
    public readonly right: Expression
  ) {
    super(operator, left);
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitBinaryExpression(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.left.firstToken;
  }

  public get lastToken(): lexer.Token {
    return this.right.lastToken;
  }
}

/**
 * Represents an expression in the form of `<TARGET>.<PROPERTY>`.
 */
export class PropertyExpression<T extends Expression> extends Expression {
  constructor(public readonly target: T, public readonly property: Identifier) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitPropertyExpression(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.target.firstToken;
  }

  public get lastToken(): lexer.Token {
    return this.property.lastToken;
  }
}

/**
 * Represents an expression for a function call.
 *
 * May _optionally_ contain a @member target.
 */
export class CallExpression<E extends Expression> extends Expression {
  constructor(
    public readonly target: E,
    public readonly args: Expression[],
    public readonly lastToken: lexer.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitCallExpression(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.target.firstToken;
  }
}

export class ConditionalExpression extends Expression {
  constructor(
    public readonly firstToken: lexer.Token,
    public readonly condition: Expression,
    public readonly body: Expression | StatementBlock,
    public readonly elseBody?: Expression | StatementBlock
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitConditionalExpression(this, context);
  }

  public get lastToken(): lexer.Token {
    return (this.elseBody || this.body).lastToken;
  }
}

export class GroupExpression<E extends Expression> extends Expression {
  constructor(
    public readonly firstToken: lexer.Token,
    public readonly expression: E,
    public readonly lastToken: lexer.Token
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
    public readonly isConst: boolean,
    public readonly type?: Identifier,
    public readonly value?: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitVariableDeclaration(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.name.firstToken;
  }

  public get lastToken(): lexer.Token {
    return (this.value || this.type || this.name).lastToken;
  }
}

/**
 * Represents a list of parameters for a function or closure definition.
 */
export class ParameterList extends AstNode {
  constructor(
    public readonly firstToken: lexer.Token,
    public readonly params: VariableDeclaration[],
    public readonly lastToken: lexer.Token
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
    public readonly firstToken: lexer.Token,
    public readonly statements: Statement[],
    public readonly lastToken: lexer.Token
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
    public readonly firstToken: lexer.Token,
    public readonly expression?: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitReturnStatement(this, context);
  }

  public get lastToken(): lexer.Token {
    return this.expression ? this.expression.lastToken : this.firstToken;
  }
}

/**
 * Represents a function declared anywhere in scope.
 */
export class FunctionDeclaration extends AstNode {
  constructor(
    public readonly name: Identifier,
    public readonly params?: ParameterList,
    public readonly body?: Expression | StatementBlock,
    public readonly returnType?: Identifier
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitFunctionDeclaration(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.name.firstToken;
  }

  public get lastToken(): lexer.Token {
    return (this.body || this.returnType || this.params || this.name).lastToken;
  }
}

/**
 * Represents a type declared anywhere in scope.
 */
export class TypeDeclaration extends AstNode {
  constructor(
    public readonly modifiers: lexer.Token[],
    public readonly name: Identifier,
    public readonly members: Array<FunctionDeclaration | VariableDeclaration>,
    public readonly lastToken: lexer.Token
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitTypeDeclaration(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.modifiers.length ? this.modifiers[0] : this.name.firstToken;
  }
}

/**
 *
 */
export class ModuleDeclaration extends AstNode {
  constructor(
    public readonly declarations: Array<
      FunctionDeclaration | TypeDeclaration | VariableDeclaration
    >
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R | undefined {
    return visitor.visitModuleDeclaration(this, context);
  }

  public get firstToken(): lexer.Token {
    return this.declarations[0].firstToken;
  }

  public get lastToken(): lexer.Token {
    return this.declarations[this.declarations.length - 1].lastToken;
  }
}

/**
 * A dispatch mechanism for visiting AST nodes.
 *
 * For every concrete type of AST node, a `visitX` method exists that will be
 * invoked for that node, including an optional context parameter, and returning
 * a computed value.
 */
export abstract class AstVisitor<R, C> {
  public abstract visitBinaryExpression(node: BinaryExpression, context?: C): R;
  public abstract visitCallExpression(
    node: CallExpression<Expression>,
    context?: C
  ): R;
  public abstract visitConditionalExpression(
    node: ConditionalExpression,
    context?: C
  ): R;
  public abstract visitFunctionDeclaration(
    node: FunctionDeclaration,
    context?: C
  ): R;
  public abstract visitGroupExpression(
    node: GroupExpression<Expression>,
    context?: C
  ): R;
  public abstract visitIdentifier(node: Identifier, context?: C): R;
  public abstract visitLiteralBoolean(node: LiteralBoolean, context?: C): R;
  public abstract visitLiteralNumber(node: LiteralNumber, context?: C): R;
  public abstract visitLiteralString(node: LiteralString, context?: C): R;
  public abstract visitModuleDeclaration(
    node: ModuleDeclaration,
    context?: C
  ): R;
  public abstract visitOperator(node: Operator<OperatorType>, context?: C): R;
  public abstract visitParameterList(node: ParameterList, context?: C): R;
  public abstract visitPrefixExpression(node: PrefixExpression, context?: C): R;
  public abstract visitPostfixExpression(
    node: PostfixExpression,
    context?: C
  ): R;
  public abstract visitPropertyExpression(
    node: PropertyExpression<Expression>,
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
