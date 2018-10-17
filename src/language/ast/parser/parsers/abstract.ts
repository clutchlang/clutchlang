import * as lexer from '../../lexer';
import { StaticMessageReporter } from '../../message';
import { AstFactory } from '../factory';

/**
 * Base parser implementation including only helper functionality.
 */
export abstract class AbstractParser {
  protected position = 0;

  constructor(
    protected readonly tokens: lexer.Token[],
    protected readonly reporter: StaticMessageReporter,
    protected readonly factory = new AstFactory(),
  ) {}

  /**
   * Returns whether at least one more token remains for parsing.
   */
  protected get hasNext(): boolean {
    return !this.tokens[this.position].isEndOfFile;
  }

  /**
   * Returns the token at @member position + @param offset.
   */
  protected peek(offset = 0): lexer.Token {
    return this.tokens[this.position + offset];
  }

  /**
   * Returns whether any of the provided @param kinds are seen in order.
   */
  protected match(...kinds: lexer.ITokenTypes[]): boolean {
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
  protected check(type: lexer.ITokenTypes): boolean {
    return this.hasNext ? this.peek().type === type : false;
  }

  /**
   * Returns the next token.
   */
  protected advance(): lexer.Token {
    if (this.hasNext) {
      this.position++;
    }
    return this.peek(-1);
  }
}
