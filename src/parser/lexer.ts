import { Scanner, Token } from '../parser';

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

  /**
   * Throws a terminal error at the current scanner position.
   *
   * @param message
   */
  protected fail(message: string): never {
    throw message;
  }

  protected *scanCompilationUnit(): Iterable<Token> {
    yield* this.scanFunction();
  }

  protected *scanFunction(): Iterable<Token> {
    yield this.scanIdentifier() || this.fail('Expected identifier');
  }

  protected scanIdentifier(): Token | undefined {
    if (this.scanner.scan(/[_a-zA-Z][_a-zA-Z0-9]{0,30}/)) {
      return new Token(this.scanner.lastMatch![0]);
    }
    return undefined;
  }
}
