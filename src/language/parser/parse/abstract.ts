import { IToken, TokenKind } from '../../lexer';
import { AstNodeFactory } from '../factory';

/**
 * Base parser implementation that includes helper functionality.
 */
export abstract class AbstractParser {
  /**
   * Position within @member tokens.
   */
  private position = 0;

  constructor(
    private readonly tokens: IToken[],
    protected readonly factory = new AstNodeFactory()
  ) {}

  /**
   * Returns whether any of the provided @param kinds are seen in order.
   */
  protected match(...kinds: TokenKind[]): boolean {
    return kinds.some(e => {
      if (this.check(e)) {
        this.advance();
        return true;
      }
      return false;
    });
  }

  /**
   * Returns whether the next token is of type @param kind.
   */
  protected check(kind: TokenKind): boolean {
    return this.hasNext ? this.peek().kind === kind : false;
  }

  /**
   * Returns the next token.
   */
  protected advance(): IToken {
    if (this.hasNext) {
      this.position++;
    }
    return this.peek(-1);
  }

  /**
   * Returns whether at least one more token remains for parsing.
   */
  protected get hasNext(): boolean {
    return this.tokens[this.position].kind !== TokenKind.EOF;
  }

  /**
   * Returns the token at @member position + @param offset.
   */
  protected peek(offset = 0): IToken {
    return this.tokens[this.position + offset];
  }
}
