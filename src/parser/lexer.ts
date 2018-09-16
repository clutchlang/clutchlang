import { Codes, Scanner, Token, Tokens } from '../parser';

/**
 * Produces a stream of tokens from the @member scanner.
 *
 * Implements @type {Iterable<Token>}.
 */
export class Lexer implements Iterable<Token> {
  private static readonly matchIdentifier = /[_a-zA-Z][_a-zA-Z0-9]{0,30}/;
  private static readonly matchLiteralBool = /true|false/;
  private static readonly matchLiteralNumber = /-?\d+\.?\d*/;
  private static readonly matchLiteralString = /(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/;

  constructor(private readonly scanner: Scanner) {}

  private get substring() {
    let substring = this.scanner.contents.substring(this.scanner.position);
    const newLine = substring.indexOf('\n');
    if (newLine !== -1) {
      substring = substring.substring(0, newLine);
    }
    return substring;
  }

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

  protected scanOptional(
    token: Tokens,
    pattern: number | string | RegExp
  ): Token | undefined {
    this.consumeWhitespace();
    const result = this.scanner.scan(pattern);
    return result ? new Token(token, this.scanner.lastMatch![0]) : undefined;
  }

  protected scanRequired(
    token: Tokens,
    pattern: number | string | RegExp
  ): Token {
    this.consumeWhitespace();
    const result = this.scanner.scan(pattern);
    if (!result) {
      this.fail(`Expected ${pattern}, got "${this.substring}"`);
    }
    return new Token(token, this.scanner.lastMatch![0]);
  }

  protected scanCompilationUnit(): Iterable<Token> {
    return this.scanFunction();
  }

  protected scanExpression(): Iterable<Token> {
    const expression =
      this.scanLiteral() ||
      this.scanOptional(Tokens.Identifier, Lexer.matchIdentifier);
    if (!expression) {
      if (this.scanner.peek() === Codes.LParen) {
        return this.scanParantheses();
      }
      return this.fail(`Expected expression, got "${this.substring}"`);
    }
    return [expression];
  }

  protected *scanExpressionOrBlock(): Iterable<Token> {
    this.consumeWhitespace();
    if (this.scanner.peek() === Codes.LCurly) {
      yield this.scanRequired(Tokens.LCurly, '{');
      while (!this.scanner.isDone && this.scanner.peek() !== Codes.RCurly) {
        this.consumeWhitespace();
        const endedBlock = this.scanOptional(Tokens.RCurly, '}');
        if (endedBlock) {
          yield endedBlock;
          break;
        }
        yield* this.scanExpression();
      }
    } else {
      yield* this.scanExpression();
    }
  }

  protected *scanFunction(): Iterable<Token> {
    yield this.scanIdentifier();
    yield this.scanRequired(Tokens.Arrow, '=>');
    yield* this.scanExpressionOrBlock();
  }

  protected scanIdentifier(): Token {
    return this.scanRequired(Tokens.Identifier, Lexer.matchIdentifier);
  }

  protected scanLiteral(): Token | undefined {
    return (
      this.scanOptional(Tokens.Boolean, Lexer.matchLiteralBool) ||
      this.scanOptional(Tokens.Number, Lexer.matchLiteralNumber) ||
      this.scanOptional(Tokens.String, Lexer.matchLiteralString)
    );
  }

  protected *scanParantheses(): Iterable<Token> {
    yield this.scanRequired(Tokens.LParen, '(');
    yield* this.scanExpression();
    yield this.scanRequired(Tokens.RParen, ')');
  }
}
