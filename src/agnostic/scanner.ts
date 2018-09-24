import { splitLines } from './strings';

/**
 * Represents a section of @member text.
 *
 * Contains enough information in order to represent actionable error or
 * informational messages. Some members in some implementations may be lazy.
 */
export class SourceSpan {
  private static readonly matchNewLine = /\n|\r/;

  constructor(
    public readonly offset: number,
    public readonly column: number,
    public readonly line: number,
    public readonly text: string
  ) {
    if (offset < 0) {
      throw new RangeError(`Invalid offset: ${offset}`);
    }
    if (column < 0) {
      throw new RangeError(`Invalid column: ${column}`);
    }
    if (line < 0) {
      throw new RangeError(`Invalid line: ${line}`);
    }
  }

  /**
   * Length of the span of information.
   */
  public get length(): number {
    return this.text.length;
  }

  /**
   * All lines, separated by line number and text, present in @member text.
   *
   * **NOTE**: `\n\r` is interpreted as a single line break, not two.
   */
  public get lines(): Array<{ line: number; text: string }> {
    return this.isMultiLine
      ? this.computeMultiLines()
      : [
          {
            line: this.line,
            text: this.text,
          },
        ];
  }

  /**
   * Whether the @member text spans over multiple lines.
   *
   * When true, @member lines will represent multiple line numbers.
   */
  public get isMultiLine(): boolean {
    return SourceSpan.matchNewLine.test(this.text);
  }

  private computeMultiLines(): Array<{ line: number; text: string }> {
    return Array.from(
      splitLines(this.text).map((text, index) => {
        return {
          line: this.line + index,
          text,
        };
      })
    );
  }
}

/**
 * A function that handles receiving a @param span and @param error.
 *
 * May optionally return token(s) to recover from the error. Otherwise it is
 * expected the error reporting was fatal and that parsing should be immediately
 * stopped.
 */
export type ErrorReporter = (
  span: SourceSpan,
  error: ScanningError
) => Token | Token[] | void;

/**
 * Error types that may be provided to a @see ErrorReporter.
 */
export type ScanningError = UnexpectedTokenError;

/**
 * A syntax error that occurs as a result of an unexpected @member token.
 *
 * Optionally contains a @member context, or what was being parsed when the
 * error ocurrred, i.e. "argument list" or "function body". May be omitted if
 * the context is not clear or provided.
 */
export class UnexpectedTokenError extends SyntaxError {
  constructor(public readonly token: Token, public readonly context?: string) {
    super(`Unexpected "token"${context ? ` in ${context}` : ''}.`);
  }
}

/**
 * A token that was scanned.
 */
export class Token {}
