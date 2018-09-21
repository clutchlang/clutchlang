import { Token, TokenKind } from '../tokenizer/tokens';

/**
 * A class that scans through tokens.
 */
export class TokenScanner {
  private mLastMatch: Token[] = [];
  private mPosition = 0;

  constructor(private readonly tokens: Token[]) {}

  private get length(): number {
    return this.tokens.length;
  }

  /**
   * Returns the next token at an offset.
   *
   * @param offset Offset from @member position.
   */
  public peek(offset = 0): Token {
    const position = this.position + offset;
    const token = this.tokens[position];
    // TODO: Add bounds check.
    return token;
  }

  public read(): Token {
    const token = this.peek();
    this.mLastMatch = [token];
    this.position++;
    return token;
  }

  public scan(...tokens: TokenKind[]): boolean {
    let offset = 0;
    for (const token of tokens) {
      if (this.peek(offset++).kind.kind !== token.kind) {
        this.mLastMatch = [];
        return false;
      }
    }
    this.mLastMatch = this.tokens.slice(
      this.position,
      (this.position += tokens.length)
    );
    return true;
  }

  public get isDone(): boolean {
    return this.position === this.length;
  }

  public get lastMatch(): Token[] {
    return this.mLastMatch;
  }

  public get position(): number {
    return this.mPosition;
  }

  public set position(position: number) {
    // TODO: Add bounds check.
    this.mPosition = position;
  }
}
