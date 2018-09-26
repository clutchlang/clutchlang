import { IToken } from '../lexer';

/**
 * Base class for anything in the syntax tree.
 */
export abstract class AstNode {
  /**
   * The first token that was scanned to form this node.
   */
  public abstract get firstToken(): IToken;

  /**
   * The last token that was scanned to form this node.
   */
  public abstract get lastToken(): IToken;
}

/**
 * Base class for any expression.
 */
export abstract class Expression extends AstNode implements Statement {}

/**
 * Base class for any statement.
 */
export abstract class Statement extends AstNode {}

export abstract class StatementBlock extends AstNode {}

/**
 * An AST node that was formed from a single @interface IToken.
 */
export abstract class SimpleNode extends AstNode {
  constructor(private readonly token: IToken) {
    super();
  }

  public get firstToken() {
    return this.token;
  }

  public get lastToken() {
    return this.token;
  }
}
