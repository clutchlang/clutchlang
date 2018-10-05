import { ISourceSpan, StringScanner } from '../agnostic/scanner';
import {
  Characters,
  isDigit,
  isHexadecimal,
  isLetter,
  isWhiteSpace,
} from '../agnostic/strings';
import * as token from './ast/token';

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
  onError?: ErrorReporter
): token.Token[] {
  return new ClutchLexer().scanProgram(new StringScanner(program), onError);
}

/**
 * Reports a @param message at the provided @param span.
 */
export type ErrorReporter = (span: ISourceSpan, error: string) => void;

/**
 * A language-level lexer that yields tokens understood by the grammar.
 */
export class ClutchLexer {
  public static readonly keywords: {
    [index: string]: token.ITokenTypes;
  } = {
    const: token.$Const,
    else: token.$Else,
    false: token.$False,
    if: token.$If,
    let: token.$Else,
    return: token.$Return,
    then: token.$Then,
    true: token.$True,
    type: token.$Type,
  };

  private program!: StringScanner;
  private onError!: ErrorReporter;
  private position!: number;
  private lastComments: token.Token[] = [];

  public scanProgram(
    program: StringScanner,
    onError: ErrorReporter = (span, message) => {
      throw new SyntaxError(
        `${message} "${span.text}" at ${span.line}:${span.column}`
      );
    }
  ): token.Token[] {
    this.position = 0;
    this.program = program;
    this.onError = onError;
    const tokens: token.Token[] = [];
    while (program.hasNext()) {
      const t = this.scanToken();
      if (t) {
        tokens.push(t);
      }
    }
    tokens.push(this.createToken(token.$EOF, ''));
    return tokens;
  }

  private scanToken(): token.Token | undefined {
    const character = this.program.advance();
    switch (character) {
      case Characters.$LPAREN: // "("
        return this.createToken(token.$LeftParen);
      case Characters.$RPAREN: // ")"
        return this.createToken(token.$RightParen);
      case Characters.$LCURLY: // "{"
        return this.createToken(token.$LeftCurly);
      case Characters.$RCURLY: // "}"
        return this.createToken(token.$RightCurly);
      case Characters.$COLON: // ":"
        return this.createToken(token.$Colon);
      case Characters.$PERIOD: // "."
        return this.createToken(token.$Period);
      case Characters.$PLUS: // "+" or "+=" or "++"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? token.$PlusEquals
            : this.program.match(Characters.$PLUS)
              ? token.$PlusPlus
              : token.$Plus
        );
      case Characters.$MINUS: // "-" or "--" or "-=" or "->"
        return this.createToken(
          this.program.match(Characters.$RANGLE)
            ? token.$DashRightAngle
            : this.program.match(Characters.$EQUALS)
              ? token.$DashEquals
              : this.program.match(Characters.$MINUS)
                ? token.$DashDash
                : token.$Dash
          // Code coverage considers the `);` to be a missed line :(
          /* istanbul ignore next */
        );
      case Characters.$STAR: // "*" or "*="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? token.$StarEquals
            : token.$Star
        );
      case Characters.$PERCENT: // "*" or "*="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? token.$PercentEquals
            : token.$Percent
        );
      case Characters.$EQUALS: // "=" or "==" or "==="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? this.program.match(Characters.$EQUALS)
              ? token.$EqualsEqualsEquals
              : token.$EqualsEquals
            : token.$Equals
        );
      case Characters.$LANGLE: // "<" or "<=" or "<<"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? token.$LeftAngleEquals
            : this.program.match(Characters.$LANGLE)
              ? token.$LeftAngleLeftAngle
              : token.$LeftAngle
        );
      case Characters.$RANGLE: // ">" or ">=" or ">>"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? token.$RightAngleEquals
            : this.program.match(Characters.$RANGLE)
              ? token.$RightAngleRightAngle
              : token.$RightAngle
        );
      case Characters.$SLASH: // "/" or "//" or "/="
        return this.scanSlash();
      case Characters.$SQUOTE: // "'"
        return this.scanString();
      case Characters.$PIPE: // "|" or "||"
        return this.createToken(
          this.program.match(Characters.$PIPE) ? token.$PipePipe : token.$Pipe
        );
      case Characters.$AND: // "&" or "&&"
        return this.createToken(
          this.program.match(Characters.$AND) ? token.$AndAnd : token.$And
        );
      case Characters.$TILDE: // "~"
        return this.createToken(token.$Tilde);
      case Characters.$CARET: // "^"
        return this.createToken(token.$Caret);
      case Characters.$EXCLAIM: // "!" or "!=" or "!==""
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? this.program.match(Characters.$EQUALS)
              ? token.$ExclaimEqualsEquals
              : token.$ExclaimEquals
            : token.$Exclaim
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
        this.reportError(
          `Unexpected character "${String.fromCharCode(character)}"`
        );
    }
    return;
  }

  /**
   * Scans a string, returning `undefined` if there was no string.
   */
  private scanString(): token.Token {
    while (this.program.hasNext()) {
      if (this.program.match(Characters.$SQUOTE)) {
        this.position++;
        let lexeme = this.substring();
        lexeme = lexeme.substring(0, lexeme.length - 1);
        return this.createToken(token.$String, lexeme);
      }
      this.program.advance();
    }
    this.reportError('Unterminated string');
    this.position++;
    return this.createToken(token.$String);
  }

  /**
   * Scans any tokens that are valid numeric literals
   */
  private scanNumber(starting: number): token.Token {
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
  private scanHexNumber(): token.Token {
    this.scanPredicate(isHexadecimal);
    return this.createToken(token.$Number);
  }

  /**
   * Scans any tokens that are valid digits, returning a number.
   */
  private scanDigits(): token.Token {
    this.scanPredicate(isDigit);
    return this.createToken(token.$Number);
  }

  /**
   * Scans any tokens that are valid identifiers.
   */
  private scanIdentifierOrKeyword(): token.Token {
    this.scanPredicate(isIdentifier);
    const identifierOrKeyword = this.substring();
    return new token.Token(
      this.position - identifierOrKeyword.length,
      ClutchLexer.keywords[identifierOrKeyword] || token.$Identifier,
      this.clearComments(),
      identifierOrKeyword
    );
  }

  /**
   * Scans tokens preceding with "/".
   */
  private scanSlash(): token.Token | undefined {
    // "//"
    if (this.program.match(Characters.$SLASH)) {
      this.advanceToEOL();
      this.lastComments.push(
        new token.Token(
          this.position,
          token.$Comment,
          [],
          this.substring().trim()
        )
      );
      return;
    }
    // "/" or "/="
    return this.createToken(
      this.program.match(Characters.$EQUALS) ? token.$SlashEquals : token.$Slash
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
    kind: token.ITokenTypes,
    content = this.substring()
  ): token.Token {
    return new token.Token(
      this.position - content.length,
      kind,
      this.clearComments(),
      content
    );
  }

  /**
   * Clear and retrieve comments lexed.
   */
  private clearComments(): token.Token[] {
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
  private reportError(error: string, offset = this.position): void {
    this.onError(this.program.source.span(offset, offset + 1), error);
  }
}
