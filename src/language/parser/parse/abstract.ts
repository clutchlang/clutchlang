import * as ast_tokens from '../../ast/lexer/token';
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
    private readonly tokens: ast_tokens.Token[],
    protected readonly factory = new AstNodeFactory()
  ) {}

  /**
   * Returns whether any of the provided @param kinds are seen in order.
   */
  protected match(...kinds: ast_tokens.ITokenTypes[]): boolean {
    return kinds.some(e => {
      if (this.check(e)) {
        this.advance();
        return true;
      }
      return false;
    });
  }

  /**
   * Returns whether the next token is of type @param type.
   */
  protected check(type: ast_tokens.ITokenTypes): boolean {
    return this.hasNext ? this.peek().type === type : false;
  }

  /**
   * Returns the next token.
   */
  protected advance(): ast_tokens.Token {
    if (this.hasNext) {
      this.position++;
    }
    return this.peek(-1);
  }

  /**
   * Returns whether at least one more token remains for parsing.
   */
  protected get hasNext(): boolean {
    return !this.tokens[this.position].isEndOfFile;
  }

  /**
   * Returns the token at @member position + @param offset.
   */
  protected peek(offset = 0): ast_tokens.Token {
    return this.tokens[this.position + offset];
  }
}
