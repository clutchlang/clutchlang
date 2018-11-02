import * as lexer from '../../lexer';
import { StaticMessageReporter } from '../../message';
import { AstFactory } from '../factory';

/**
 * Base parser implementation including only helper functionality.
 */
export abstract class AbstractParser {
  private position = 0;

  constructor(
    private readonly tokens: lexer.Token[],
    protected readonly reporter: StaticMessageReporter,
    protected readonly factory = new AstFactory()
  ) {}

  /**
   * Returns whether the next token is of type @param type.
   */
  protected check(type: lexer.ITokenTypes): boolean {
    return this.hasNext ? this.peek().type === type : false;
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
  protected peek(offset = 0): lexer.Token {
    return this.tokens[this.position + offset];
  }

  /**
   * Returns the next token.
   */
  protected advance(): lexer.Token {
    this.position++;
    return this.peek(-1);
  }

  /**
   * Returns the previously scanned token.
   */
  protected previous(): lexer.Token {
    return this.peek(-1);
  }

  /**
   * Returns whether if any of the following @param types are matched.
   *
   * If true is returned, this position was also advanced by one.
   */
  protected match(...types: lexer.ITokenTypes[]): boolean {
    return types.some(e => {
      if (this.check(e)) {
        this.position++;
        return true;
      }
      return false;
    });
  }
}
