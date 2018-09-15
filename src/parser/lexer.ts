import { Codes, Scanner, Token, Tokens } from '../parser';

/**
 * Produces a stream of tokens from the @member scanner.
 *
 * Implements @type {Iterable<Token>}.
 */
export class Lexer implements Iterable<Token> {
  private static readonly matchIdentifier = /[_a-zA-Z][_a-zA-Z0-9]{0,30}/;

  constructor(private readonly scanner: Scanner) {}

  public *[Symbol.iterator](): Iterator<Token> {
    this.consumeWhitespace();
    while (!this.scanner.isDone) {
      yield* this.scanCompilationUnit();
      this.consumeWhitespace();
    }
  }

  protected consumeWhitespace(): void {
    this.scanner.scan(/\s+/);
  }

  /**
   * Throws a terminal error at the current scanner position.
   *
   * @param message
   */
  protected fail(message: string): never {
    throw new SyntaxError(`${this.scanner.position}: ${message}`);
  }

  protected scanOrFailExpecting(
    token: Tokens,
    pattern: number | string | RegExp
  ): Token {
    this.consumeWhitespace();
    const result = this.scanner.scan(pattern);
    if (!result) {
      let substring = this.scanner.contents.substring(this.scanner.position);
      const newLine = substring.indexOf('\n');
      if (newLine !== -1) {
        substring = substring.substring(0, newLine);
      }
      this.fail(`Expected ${pattern}, got "${substring}"`);
    }
    return new Token(token, this.scanner.lastMatch![0]);
  }

  protected scanCompilationUnit(): Iterable<Token> {
    return this.scanFunction();
  }

  protected *scanExpression(): Iterable<Token> {
    return [];
  }

  protected *scanExpressionOrBlock(): Iterable<Token> {
    this.consumeWhitespace();
    if (this.scanner.peek() === Codes.LCurly) {
      yield this.scanOrFailExpecting(Tokens.LCurly, '{');
      // Then 0 to N expressions (until we hit a '}').
      while (!this.scanner.isDone && this.scanner.peek() !== Codes.RCurly) {
        const before = this.scanner.position;
        this.consumeWhitespace();
        yield* this.scanExpression();
        if (before === this.scanner.position) {
          return this.scanOrFailExpecting(Tokens.RCurly, '}');
        }
      }
      yield this.scanOrFailExpecting(Tokens.RCurly, '}');
    } else {
      return this.scanExpression();
    }
  }

  protected *scanFunction(): Iterable<Token> {
    yield this.scanIdentifier();
    yield this.scanOrFailExpecting(Tokens.Arrow, '=>');
    yield* this.scanExpressionOrBlock();
  }

  protected scanIdentifier(): Token {
    return this.scanOrFailExpecting(Tokens.Identifier, Lexer.matchIdentifier);
  }
}
