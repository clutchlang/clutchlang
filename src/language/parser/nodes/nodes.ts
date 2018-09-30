import { IToken } from '../../lexer';
import { AstVisitor } from '../visitors';
import { LiteralIdentifier } from './expressions';
import { StatementBlock } from './statements';

/**
 * Base class for anything in the syntax tree.
 */
export abstract class AstNode {
  /**
   * Try the node through the provided @param visitor.
   */
  public abstract accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R;

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
 * Root element in the AST.
 */
export class FileRoot extends AstNode {
  constructor(public readonly topLevelElements: TopLevelElement[]) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitFileRoot(this, context);
  }

  public get firstToken(): IToken {
    return this.topLevelElements[0].firstToken;
  }

  public get lastToken(): IToken {
    return this.topLevelElements[this.topLevelElements.length - 1].lastToken;
  }
}

/**
 * Represents an element that can live at the top-level of a file.
 */
export abstract class TopLevelElement extends AstNode {}

/**
 * Represents either a top-level, class-level, or local function.
 */
export class FunctionDeclaration extends TopLevelElement {
  constructor(
    public readonly name: LiteralIdentifier,
    public readonly parameters: LiteralIdentifier[],
    public readonly arrowToken: IToken,
    public readonly body: Expression | StatementBlock,
    public readonly isConstexpr: boolean
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitFunctionDeclaration(this, context);
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
