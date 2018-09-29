import { ISourceSpan, StringScanner } from '../agnostic/scanner';
import {
  Characters,
  isDigit,
  isHexadecimal,
  isLetter,
  isWhiteSpace,
} from '../agnostic/strings';

function isIdentifier(character: number): boolean {
  return isIdentifierStart(character) || isDigit(character);
}

function isIdentifierStart(character: number): boolean {
  return isLetter(character) || character === Characters.$_;
}

/**
 * Tokenizes and returns @param program as a series of @see Token.
 */
export function tokenize(program: string, onError?: ErrorReporter): Token[] {
  return new ClutchLexer().scanProgram(new StringScanner(program), onError);
}

/**
 * Reports a @param message at the provided @param span.
 */
export type ErrorReporter = (span: ISourceSpan, error: string) => void;

export enum TokenKind {
  // Literals
  IDENTIFIER = 'Identifier',
  STRING = 'String',
  NUMBER = 'Number',

  // Keywords
  CLASS = 'class',
  ELSE = 'else',
  FALSE = 'false',
  FOR = 'for',
  IF = 'if',
  LET = 'let',
  RETURN = 'return',
  SUPER = 'super',
  THEN = 'then',
  THIS = 'this',
  TRUE = 'true',
  WHILE = 'while',

  // Symbols
  ARROW = '->',
  LEFT_PAREN = '(',
  RIGHT_PAREN = ')',
  LEFT_CURLY = '{',
  RIGHT_CURLY = '}',

  // Operators
  PERIOD = '.',
  PLUS = '+',
  PLUS_EQUALS = '+=',
  MINUS = '-',
  MINUS_EQUALS = '-=',
  STAR = '*',
  STAR_EQUALS = '*=',
  SLASH = '/',
  SLASH_EQUALS = '/=',
  MODULUS = '%',
  MODULUS_EQUALS = '%=',
  EQUALS = '=',
  EQUALS_EQUALS = '==',
  EXCLAIM_EQUALS = '!=',
  EQUALS_EQUALS_EQUALS = '===',
  EXCLAIM_EQUALS_EQUALS = '!==',
  RIGHT_ANGLE = '>',
  RIGHT_ANGLE_EQUALS = '>=',
  LEFT_ANGLE = '<',
  LEFT_ANGLE_EQUALS = '<=',
  PIPE = '|',
  PIPE_PIPE = '||',
  AND = '&',
  AND_AND = '&&',
  CARET = '^',
  EXCLAIM = '!',
  TILDE = '~',
  PLUS_PLUS = '++',
  MINUS_MINUS = '--',
  LEFT_ANGLE_LEFT_ANGLE = '<<',
  RIGHT_ANGLE_RIGHT_ANGLE = '>>',

  // Misc
  EOF = '<EOF>',
}

/**
 * A language-level lexer that yields tokens understood by the grammar.
 */
export class ClutchLexer {
  public static readonly keywords: {
    [index: string]: TokenKind;
  } = {
    class: TokenKind.CLASS,
    else: TokenKind.ELSE,
    false: TokenKind.FALSE,
    for: TokenKind.FOR,
    if: TokenKind.IF,
    let: TokenKind.LET,
    return: TokenKind.RETURN,
    super: TokenKind.SUPER,
    this: TokenKind.THIS,
    true: TokenKind.TRUE,
    while: TokenKind.WHILE,
  };

  private program!: StringScanner;
  private onError!: ErrorReporter;
  private position!: number;
  private lastComments: IComment[] = [];

  public scanProgram(
    program: StringScanner,
    onError: ErrorReporter = (span, message) => {
      throw new SyntaxError(
        `${message} "${span.text}" at ${span.line}:${span.column}`
      );
    }
  ): Token[] {
    this.position = 0;
    this.program = program;
    this.onError = onError;
    const tokens: Token[] = [];
    while (program.hasNext()) {
      const token = this.scanToken();
      if (token) {
        tokens.push(token);
      }
    }
    tokens.push(this.createToken(TokenKind.EOF, ''));
    return tokens;
  }

  private scanToken(): Token | undefined {
    const character = this.program.advance();
    switch (character) {
      case Characters.$LPAREN: // "("
        return this.createToken(TokenKind.LEFT_PAREN);
      case Characters.$RPAREN: // ")"
        return this.createToken(TokenKind.RIGHT_PAREN);
      case Characters.$LCURLY: // "{"
        return this.createToken(TokenKind.LEFT_CURLY);
      case Characters.$RCURLY: // "}"
        return this.createToken(TokenKind.RIGHT_CURLY);
      case Characters.$PERIOD: // "."
        return this.createToken(TokenKind.PERIOD);
      case Characters.$PLUS: // "+" or "+=" or "++"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? TokenKind.PLUS_EQUALS
            : this.program.match(Characters.$PLUS)
              ? TokenKind.PLUS_PLUS
              : TokenKind.PLUS
        );
      case Characters.$MINUS: // "-" or "--" or "-=" or "->"
        return this.createToken(
          this.program.match(Characters.$RANGLE)
            ? TokenKind.ARROW
            : this.program.match(Characters.$EQUALS)
              ? TokenKind.MINUS_EQUALS
              : this.program.match(Characters.$MINUS)
                ? TokenKind.MINUS_MINUS
                : TokenKind.MINUS
          // Code coverage considers the `);` to be a missed line :(
          /* istanbul ignore next */
        );
      case Characters.$STAR: // "*" or "*="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? TokenKind.STAR_EQUALS
            : TokenKind.STAR
        );
      case Characters.$PERCENT: // "*" or "*="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? TokenKind.MODULUS_EQUALS
            : TokenKind.MODULUS
        );
      case Characters.$EQUALS: // "=" or "==" or "==="
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? this.program.match(Characters.$EQUALS)
              ? TokenKind.EQUALS_EQUALS_EQUALS
              : TokenKind.EQUALS_EQUALS
            : TokenKind.EQUALS
        );
      case Characters.$LANGLE: // "<" or "<=" or "<<"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? TokenKind.LEFT_ANGLE_EQUALS
            : this.program.match(Characters.$LANGLE)
              ? TokenKind.LEFT_ANGLE_LEFT_ANGLE
              : TokenKind.LEFT_ANGLE
        );
      case Characters.$RANGLE: // ">" or ">=" or ">>"
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? TokenKind.RIGHT_ANGLE_EQUALS
            : this.program.match(Characters.$RANGLE)
              ? TokenKind.RIGHT_ANGLE_RIGHT_ANGLE
              : TokenKind.RIGHT_ANGLE
        );
      case Characters.$SLASH: // "/" or "//" or "/="
        return this.scanSlash();
      case Characters.$SQUOTE: // "'"
        return this.scanString();
      case Characters.$PIPE: // "|" or "||"
        return this.createToken(
          this.program.match(Characters.$PIPE)
            ? TokenKind.PIPE_PIPE
            : TokenKind.PIPE
        );
      case Characters.$AND: // "&" or "&&"
        return this.createToken(
          this.program.match(Characters.$AND)
            ? TokenKind.AND_AND
            : TokenKind.AND
        );
      case Characters.$TILDE: // "~"
        return this.createToken(TokenKind.TILDE);
      case Characters.$CARET: // "^"
        return this.createToken(TokenKind.CARET);
      case Characters.$EXCLAIM: // "!" or "!=" or "!==""
        return this.createToken(
          this.program.match(Characters.$EQUALS)
            ? this.program.match(Characters.$EQUALS)
              ? TokenKind.EXCLAIM_EQUALS_EQUALS
              : TokenKind.EXCLAIM_EQUALS
            : TokenKind.EXCLAIM
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
  private scanString(): Token {
    while (this.program.hasNext()) {
      if (this.program.match(Characters.$SQUOTE)) {
        this.position++;
        let lexeme = this.substring();
        lexeme = lexeme.substring(0, lexeme.length - 1);
        return this.createToken(TokenKind.STRING, lexeme);
      }
      this.program.advance();
    }
    this.reportError('Unterminated string');
    this.position++;
    return this.createToken(TokenKind.STRING);
  }

  /**
   * Scans any tokens that are valid numeric literals
   */
  private scanNumber(starting: number): Token {
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
  private scanHexNumber(): Token {
    this.scanPredicate(isHexadecimal);
    return this.createToken(TokenKind.NUMBER);
  }

  /**
   * Scans any tokens that are valid digits, returning a number.
   */
  private scanDigits(): Token {
    this.scanPredicate(isDigit);
    return this.createToken(TokenKind.NUMBER);
  }

  /**
   * Scans any tokens that are valid identifiers.
   */
  private scanIdentifierOrKeyword(): Token {
    this.scanPredicate(isIdentifier);
    const identifierOrKeyword = this.substring();
    return new Token(
      ClutchLexer.keywords[identifierOrKeyword] || TokenKind.IDENTIFIER,
      identifierOrKeyword,
      this.clearComments(),
      this.position - identifierOrKeyword.length
    );
  }

  /**
   * Scans tokens preceding with "/".
   */
  private scanSlash(): Token | undefined {
    // "//"
    if (this.program.match(Characters.$SLASH)) {
      this.advanceToEOL();
      this.lastComments.push({
        lexeme: this.substring().trim(),
        offset: this.position,
      });
      return;
    }
    // "/" or "/="
    return this.createToken(
      this.program.match(Characters.$EQUALS)
        ? TokenKind.SLASH_EQUALS
        : TokenKind.SLASH
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
  private createToken(kind: TokenKind, content = this.substring()): Token {
    return new Token(
      kind,
      content,
      this.clearComments(),
      this.position - content.length
    );
  }

  /**
   * Clear and retrieve comments lexed.
   */
  private clearComments(): IComment[] {
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

/**
 * A scanned token from @function tokenize.
 */
export interface IToken {
  readonly kind: TokenKind;
  readonly lexeme: string;
  readonly comments: IComment[];
  readonly offset: number;
}

/**
 * Implementation of @interface IToken private to @function tokenize.
 */
class Token implements IToken {
  constructor(
    public readonly kind: TokenKind,
    public readonly lexeme: string,
    public readonly comments: IComment[],
    public readonly offset: number
  ) {}
}

export interface IComment {
  readonly lexeme: string;
  readonly offset: number;
}
