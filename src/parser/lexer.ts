import { Characters } from './source/characters';
import { SourceScanner } from './source/scanner';
import {
  RegExpToken,
  StringToken,
  SymbolToken,
  Token,
  TokenKind,
} from './source/tokens';

/**
 * Produces a stream of tokens from the @member scanner.
 *
 * Implements @type {Iterable<Token>}.
 */
export class Lexer implements Iterable<Token> {
  constructor(private readonly scanner: SourceScanner) {}

  private get substring() {
    let substring = this.scanner.substring;
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
    throw new SyntaxError(this.scanner.span.message(message));
  }

  protected scanOptional(kind: TokenKind): Token | undefined {
    this.consumeWhitespace();
    const result = this.scanner.scan(kind.pattern);
    return result
      ? new Token(kind, this.scanner.lastPosition, this.scanner.lastMatch![0])
      : undefined;
  }

  protected scanRequired(kind: TokenKind): Token {
    this.consumeWhitespace();
    const result = this.scanner.scan(kind.pattern);
    if (!result) {
      this.fail(`Expected ${kind.pattern}, got "${this.substring}"`);
    }
    return new Token(
      kind,
      this.scanner.lastPosition,
      this.scanner.lastMatch![0]
    );
  }

  protected scanCompilationUnit(): Iterable<Token> {
    return this.scanFunction();
  }

  protected scanExpression(): Iterable<Token> {
    const expression =
      this.scanLiteral() || this.scanOptional(RegExpToken.Identifier);
    if (!expression) {
      if (this.scanner.peek() === Characters.LParen) {
        return this.scanParantheses();
      }
      return this.fail(`Expected expression, got "${this.substring}"`);
    }
    return [expression];
  }

  protected *scanExpressionOrBlock(): Iterable<Token> {
    this.consumeWhitespace();
    if (this.scanner.peek() === Characters.LCurly) {
      yield this.scanRequired(SymbolToken.LCurly);
      while (
        !this.scanner.isDone &&
        this.scanner.peek() !== Characters.RCurly
      ) {
        this.consumeWhitespace();
        const endedBlock = this.scanOptional(SymbolToken.RCurly);
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
    yield this.scanRequired(StringToken.Arrow);
    yield* this.scanExpressionOrBlock();
  }

  protected scanIdentifier(): Token {
    return this.scanRequired(RegExpToken.Identifier);
  }

  protected scanLiteral(): Token | undefined {
    return (
      this.scanOptional(RegExpToken.LiteralBoolean) ||
      this.scanOptional(RegExpToken.LiteralNumber) ||
      this.scanOptional(RegExpToken.LiteralString)
    );
  }

  protected *scanParantheses(): Iterable<Token> {
    yield this.scanRequired(SymbolToken.LParen);
    yield* this.scanExpression();
    yield this.scanRequired(SymbolToken.RParen);
  }
}
