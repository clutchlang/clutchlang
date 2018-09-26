import { IToken } from '../lexer';
import { SimpleName } from './expressions';
import { StatementBlock } from './statements';

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

export abstract class TopLevelElement extends AstNode {}

export class FunctionDeclaration extends TopLevelElement {
  constructor(
    public readonly name: SimpleName,
    public readonly parameters: SimpleName[],
    public readonly arrowToken: IToken,
    public readonly body: Expression | StatementBlock
  ) {
    super();
  }

  public get firstToken(): IToken {
    return this.name.firstToken;
  }

  public get lastToken(): IToken {
    return this.body.lastToken;
  }
}

/**
 * Base class for any statement.
 */
export abstract class Statement extends AstNode {}

/**
 * Base class for any expression.
 */
export abstract class Expression extends Statement {}

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
