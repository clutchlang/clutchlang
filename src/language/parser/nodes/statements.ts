import * as ast from '../../../ast';
import { AstVisitor } from '../visitors';
import { LiteralIdentifier } from './expressions';
import { Expression, Statement } from './nodes';

/**
 * Represents a collection of @see Statement or @see Expression elements:
 *
 * ```
 * {
 *   (statement | expression)*
 * }
 * ```
 *
 * **NOTE**: If the last element is an @see Expression then there is an implicit
 * `return` statement returing the value of that expression:
 *
 * ```
 * {
 *   1 // implicit return
 * }
 * ```
 */
export class StatementBlock {
  constructor(
    public readonly firstToken: ast.Token,
    public readonly statements: Statement[],
    public readonly lastToken: ast.Token
  ) {}
}

/**
 * Represenst a `return` from the current location in the program.
 */
export class ReturnStatement extends Statement {
  constructor(
    public readonly firstToken: ast.Token,
    public readonly expression?: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitReturnStatement(this, context);
  }

  public get lastToken(): ast.Token {
    return this.expression ? this.expression.lastToken : this.firstToken;
  }
}

/**
 * Represents the creation of a variable and initial expression assignment.
 */
export class VariableDeclarationStatement extends Statement {
  constructor(
    public readonly firstToken: ast.Token,
    public readonly name: LiteralIdentifier,
    public readonly assignToken: ast.Token,
    public readonly expression: Expression,
    public readonly isConst: boolean
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitVariableDeclarationStatement(this, context);
  }

  public get lastToken(): ast.Token {
    return this.expression.lastToken;
  }
}
