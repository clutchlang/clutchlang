import { StringScanner } from '../../../agnostic/scanner';
import {
  Characters,
  isDigit,
  isHexadecimal,
  isLetter,
  isWhiteSpace,
} from '../../../agnostic/strings';
import * as tokens from './token';

function isIdentifier(character: number): boolean {
  return isIdentifierStart(character) || isDigit(character);
}

function isIdentifierStart(character: number): boolean {
  return isLetter(character) || character === Characters.$_;
}

/**
 * Tokenizes and returns @param program as a series of @see Token.
 */
export function tokenize(
  program: string,
  onError?: InvalidTokenReporter
): tokens.Token[] {
  return new ClutchLexer().scanProgram(new StringScanner(program), onError);
}

/**
 * Reports a @param message at the provided @param span.
 */
export type InvalidTokenReporter = (offset: number, length: number) => void;

/**
 * A language-level lexer that yields tokens understood by the grammar.
 */
export class ClutchLexer {
  public static readonly keywords: {
    [index: string]: tokens.IKeywordTokenType;
  } = {
    const: tokens.$Const,
    else: tokens.$Else,
    external: tokens.$External,
    false: tokens.$False,
    if: tokens.$If,
    let: tokens.$Let,
    return: tokens.$Return,
    then: tokens.$Then,
    true: tokens.$True,
    type: tokens.$Type,
  };

  private program!: StringScanner;
  private onError!: InvalidTokenReporter;
  private position!: number;
  private lastComments: tokens.Token[] = [];

  public scanProgram(
    program: StringScanner,
    onError: InvalidTokenReporter = (offset, length) => {
      const span = this.program.source.span(offset, offset + length);
      throw new SyntaxError(
        `Invalid token "${span.text}" at ${span.line}:${span.column}`
      );
    }
  ): tokens.Token[] {
    this.position = 0;
    this.program = program;
    this.onError = onError;
    const scanned: tokens.Token[] = [];
    while (program.hasNext()) {
      const token = this.scanToken();
      if (token) {
        scanned.push(token);
      }
    }
    scanned.push(this.createToken(tokens.$EOF, ''));
    return scanned;
  }

  private scanToken(): tokens.Token | undefined {
    const character = this.program.advance();
    switch (character) {
      case Characters.$LPAREN: // "("
        return this.createToken(tokens.$LeftParen);
      case Characters.$RPAREN: // ")"
        return this.createToken(tokens.$RightParen);
      case Characters.$LCURLY: // "{"
        return this.createToken(tokens.$LeftCurly);
      case Characters.$RCURLY: // "}"
        return this.createToken(tokens.$RightCurly);
      case Characters.$COLON: // ":"
        return this.createToken(tokens.$Colon);
      case Characters.$PERIOD: // "."
        return this.createToken(tokens.$Period);
      case Characters.$PLUS: // "+" or "+=" or "++"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? tokens.$PlusEquals
            : this.program.match(Characters.$PLUS)
              ? tokens.$PlusPlus
              : tokens.$Plus
        );
      case Characters.$MINUS: // "-" or "--" or "-=" or "->"
        return this.createToken(
          this.program.match(Characters.$RANGLE)
            ? tokens.$DashRightAngle
            : this.program.match(Characters.$EQUALS)
              ? tokens.$DashEquals
              : this.program.match(Characters.$MINUS)
                ? tokens.$DashDash
                : tokens.$Dash
          // Code coverage considers the `);` to be a missed line :(
          /* istanbul ignore next */
        );
      case Characters.$STAR: // "*" or "*="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? tokens.$StarEquals
            : tokens.$Star
        );
      case Characters.$PERCENT: // "*" or "*="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? tokens.$PercentEquals
            : tokens.$Percent
        );
      case Characters.$EQUALS: // "=" or "==" or "==="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? this.program.match(Characters.$EQUALS)
              ? tokens.$EqualsEqualsEquals
              : tokens.$EqualsEquals
            : tokens.$Equals
        );
      case Characters.$LANGLE: // "<" or "<=" or "<<"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? tokens.$LeftAngleEquals
            : this.program.match(Characters.$LANGLE)
              ? tokens.$LeftAngleLeftAngle
              : tokens.$LeftAngle
        );
      case Characters.$RANGLE: // ">" or ">=" or ">>"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? tokens.$RightAngleEquals
            : this.program.match(Characters.$RANGLE)
              ? tokens.$RightAngleRightAngle
              : tokens.$RightAngle
        );
      case Characters.$SLASH: // "/" or "//" or "/="
        return this.scanSlash();
      case Characters.$SQUOTE: // "'"
        return this.scanString();
      case Characters.$PIPE: // "|" or "||"
        return this.createToken(
          this.program.match(Characters.$PIPE) ? tokens.$PipePipe : tokens.$Pipe
        );
      case Characters.$AND: // "&" or "&&"
        return this.createToken(
          this.program.match(Characters.$AND) ? tokens.$AndAnd : tokens.$And
        );
      case Characters.$TILDE: // "~"
        return this.createToken(tokens.$Tilde);
      case Characters.$CARET: // "^"
        return this.createToken(tokens.$Caret);
      case Characters.$EXCLAIM: // "!" or "!=" or "!==""
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? this.program.match(Characters.$EQUALS)
              ? tokens.$ExclaimEqualsEquals
              : tokens.$ExclaimEquals
            : tokens.$Exclaim
        );
      default:
        if (isWhiteSpace(character)) {
          this.position = this.program.position;
          break;
        }
        if (isDigit(character)) {
          return this.scanNumber(character);
        }
        if (isIdentifierStart(character)) {
          return this.scanIdentifierOrKeyword();
        }
        this.reportError();
    }
    return;
  }

  /**
   * Scans a string, returning `undefined` if there was no string.
   */
  private scanString(): tokens.Token {
    while (this.program.hasNext()) {
      if (this.program.match(Characters.$SQUOTE)) {
        this.position++;
        let lexeme = this.substring();
        lexeme = lexeme.substring(0, lexeme.length - 1);
        return this.createToken(tokens.$String, lexeme);
      }
      this.program.advance();
    }
    this.reportError();
    this.position++;
    return this.createToken(tokens.$String);
  }

  /**
   * Scans any tokens that are valid numeric literals
   */
  private scanNumber(starting: number): tokens.Token {
    if (starting === Characters.$0) {
      if (
        this.program.match(Characters.$X) ||
        this.program.match(Characters.$x)
      ) {
        return this.scanHexNumber();
      }
    }
    if (
      this.program.match(Characters.$E) ||
      this.program.match(Characters.$e)
    ) {
      return this.scanDigits();
    }
    while (this.program.hasNext()) {
      const next = this.program.peek();
      if (this.program.match(Characters.$PERIOD)) {
        break;
      }
      if (!isDigit(next)) {
        break;
      }
      this.program.advance();
    }
    return this.scanDigits();
  }

  /**
   * Scans any tokens that are valid hexadecimel digits, returning a number.
   */
  private scanHexNumber(): tokens.Token {
    this.scanPredicate(isHexadecimal);
    return this.createToken(tokens.$Number);
  }

  /**
   * Scans any tokens that are valid digits, returning a number.
   */
  private scanDigits(): tokens.Token {
    this.scanPredicate(isDigit);
    return this.createToken(tokens.$Number);
  }

  /**
   * Scans any tokens that are valid identifiers.
   */
  private scanIdentifierOrKeyword(): tokens.Token {
    this.scanPredicate(isIdentifier);
    const identifierOrKeyword = this.substring();
    return new tokens.Token(
      this.position - identifierOrKeyword.length,
      ClutchLexer.keywords[identifierOrKeyword] || tokens.$Identifier,
      this.clearComments(),
      identifierOrKeyword
    );
  }

  /**
   * Scans tokens preceding with "/".
   */
  private scanSlash(): tokens.Token | undefined {
    // "//"
    if (this.program.match(Characters.$SLASH)) {
      this.advanceToEOL();
      this.lastComments.push(
        new tokens.Token(
          this.position,
          tokens.$Comment,
          [],
          this.substring().trim()
        )
      );
      return;
    }
    // "/" or "/="
    return this.createToken(
      this.program.match(Characters.$EQUALS)
        ? tokens.$SlashEquals
        : tokens.$Slash
    );
  }

  /**
   * Scans until the EOF or until @param predicate returns false.
   */
  private scanPredicate(predicate: (character: number) => boolean): void {
    while (this.program.hasNext()) {
      const peek = this.program.peek();
      if (!predicate(peek)) {
        break;
      }
      this.program.advance();
    }
  }

  /**
   * Advances the position of the scanner until either EOF or EOL.
   *
   * **NOTE**: Treats `CR+LF` as a DOS-stlye line ending, not two lines.
   */
  private advanceToEOL(): void {
    while (this.program.hasNext()) {
      // "\n" (LF)
      if (this.program.match(Characters.$LF)) {
        return;
      }
      // "\r" (CR)
      if (this.program.match(Characters.$CR)) {
        // "\r\n" (CR+LF)
        this.program.match(Characters.$LF);
        return;
      }
      this.program.advance();
    }
  }

  /**
   * Returns a new token with a @param kind and the current substring.
   */
  private createToken(
    kind: tokens.ITokenTypes,
    content = this.substring()
  ): tokens.Token {
    return new tokens.Token(
      this.position - content.length,
      kind,
      this.clearComments(),
      content
    );
  }

  /**
   * Clear and retrieve comments lexed.
   */
  private clearComments(): tokens.Token[] {
    const comments = this.lastComments;
    this.lastComments = [];
    return comments;
  }

  /**
   * Returns the current substring, advancing the position counter.
   */
  private substring(): string {
    const start = this.position;
    const end = this.program.position;
    this.position = end;
    return this.program.substring(start, end);
  }

  /**
   * Reports a lexical @param error occurring at @param offset.
   */
  private reportError(offset = this.position, length = 1): void {
    this.onError(offset, length);
  }
}
