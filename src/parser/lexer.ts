import { Scanner, Token, Tokens } from '../parser';

/**
 * Produces a stream of tokens from the @member scanner.
 *
 * Implements @type {Iterable<Token>}.
 */
export class Lexer implements Iterable<Token> {
  constructor(private readonly scanner: Scanner) {}

  public *[Symbol.iterator](): Iterator<Token> {
    while (!this.scanner.isDone) {
      yield* this.scanCompilationUnit();
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

  protected *scanCompilationUnit(): Iterable<Token> {
    yield* this.scanFunction();
  }

  protected *scanExpression(): Iterable<Token> {
    this.consumeWhitespace();
    return [];
  }

  protected *scanFunction(): Iterable<Token> {
    this.consumeWhitespace();
    yield this.scanIdentifier() || this.fail('Expected identifier');
    this.consumeWhitespace();
    if (!this.scanner.scan('=>')) {
      this.fail('Expected =>');
    }
    yield new Token(Tokens.Arrow, '=>');
    this.consumeWhitespace();
    if (!this.scanner.scan('{')) {
      this.fail('Expected {');
    }
    yield new Token(Tokens.RCurly, '{');
    yield* this.scanExpression();
    this.consumeWhitespace();
    if (!this.scanner.scan('}')) {
      this.fail('Expected }');
    }
    yield new Token(Tokens.LCurly, '}');
    this.consumeWhitespace();
  }

  protected scanIdentifier(): Token | undefined {
    if (this.scanner.scan(/[_a-zA-Z][_a-zA-Z0-9]{0,30}/)) {
      return new Token(Tokens.Identifier, this.scanner.lastMatch![0]);
    }
    return undefined;
  }
}
