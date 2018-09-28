import { IToken, TokenKind } from '../../lexer';
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
    public readonly firstToken: IToken,
    public readonly statements: Statement[],
    public readonly lastToken: IToken
  ) {}
}

/**
 * Represenst a _jump_ from the current location in the program.
 */
export class JumpStatement extends Statement {
  constructor(
    public readonly firstToken: IToken,
    public readonly expression: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitJumpStatement(this, context);
  }

  public get lastToken(): IToken {
    return this.expression.lastToken;
  }

  /**
   * Whether this represents a `return` statement.
   */
  public get isReturn(): boolean {
    return this.firstToken.lexeme === TokenKind.RETURN;
  }
}

/**
 * Represents the creation of a variable and initial expression assignment.
 */
export class VariableDeclarationStatement extends Statement {
  constructor(
    public readonly firstToken: IToken,
    public readonly name: LiteralIdentifier,
    public readonly assignToken: IToken,
    public readonly expression: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitVariableStatement(this, context);
  }

  public get lastToken(): IToken {
    return this.expression.lastToken;
  }
}
