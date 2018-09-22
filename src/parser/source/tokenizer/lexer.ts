import { Characters } from './characters';
import { SourceScanner } from './scanner';
import {
  RegExpToken,
  StringToken,
  SymbolToken,
  Token,
  TokenKind,
} from './tokens';

/**
 * Produces a stream of tokens from the @member scanner.
 *
 * Implements @type {Iterable<Token>}.
 */
export class Lexer implements Iterable<Token> {
  /**
   * Invalid identifiers.
   */

  private static readonly keywords = new Set(['true', 'false']);

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
    throw new SyntaxError(this.scanner.span.highlight(message));
  }

  protected scanOptional(kind: TokenKind): Token | undefined {
    this.consumeWhitespace();
    const result = this.scanner.scan(kind.pattern);
    return result
      ? new Token(kind, this.scanner.lastSpan(), this.scanner.lastMatch![0])
      : undefined;
  }

  protected scanRequired(kind: TokenKind): Token {
    this.consumeWhitespace();
    const result = this.scanner.scan(kind.pattern);
    if (!result) {
      let pattern = kind.pattern;
      /* istanbul ignore next */
      if (typeof pattern === 'number') {
        /* istanbul ignore next */
        pattern = String.fromCharCode(pattern);
      } else if (pattern instanceof RegExp) {
        /* istanbul ignore next */
        pattern = pattern.source;
      }
      this.fail(`Expected ${pattern}, got "${this.substring}"`);
    }
    return new Token(kind, this.scanner.lastSpan(), this.scanner.lastMatch![0]);
  }

  protected scanCompilationUnit(): Iterable<Token> {
    return this.scanFunction();
  }

  protected *scanExpression(): Iterable<Token> {
    const literal = this.scanLiteral();
    if (literal) {
      yield literal;
      return;
    }
    const identifier = this.scanOptional(RegExpToken.Identifier);
    if (identifier) {
      yield identifier;
    }
    if (this.scanner.peek() === Characters.LParen) {
      yield* this.scanParantheses();
    } else if (!identifier) {
      const substring = this.substring;
      this.scanner.read();
      this.consumeWhitespace();
      return this.fail(`Expected expression, got "${substring}"`);
    }
  }

  protected *scanExpressionOrBlock(): Iterable<Token> {
    this.consumeWhitespace();
    if (this.scanner.peek() === Characters.LCurly) {
      yield this.scanRequired(SymbolToken.LCurly);
      let checkRCurly = true;
      while (
        !this.scanner.isDone &&
        this.scanner.peek() !== Characters.RCurly
      ) {
        this.consumeWhitespace();
        const endedBlock = this.scanOptional(SymbolToken.RCurly);
        if (endedBlock) {
          yield endedBlock;
          checkRCurly = false;
          break;
        }
        yield* this.scanExpression();
      }
      if (checkRCurly) {
        yield this.scanRequired(SymbolToken.RCurly);
      }
    } else {
      yield* this.scanExpression();
    }
  }

  protected *scanFunction(): Iterable<Token> {
    yield this.scanIdentifier();
    this.consumeWhitespace();
    const lparen = this.scanOptional(SymbolToken.LParen);
    if (lparen) {
      yield lparen;
      let param = this.scanOptional(RegExpToken.Identifier);
      while (param) {
        yield param;
        param = this.scanOptional(RegExpToken.Identifier);
      }
      yield this.scanRequired(SymbolToken.RParen);
    }
    this.consumeWhitespace();
    yield this.scanRequired(StringToken.Arrow);
    yield* this.scanExpressionOrBlock();
  }

  protected scanIdentifier(): Token {
    const identifier = this.scanRequired(RegExpToken.Identifier);
    if (Lexer.keywords.has(identifier.value)) {
      return this.fail(`Invalid identifier: ${identifier.value} (Keyword)`);
    }
    return identifier;
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
    while (!this.scanOptional(SymbolToken.RParen)) {
      yield* this.scanExpression();
    }
    yield new Token(SymbolToken.RParen, this.scanner.lastSpan(), ')');
  }
}
