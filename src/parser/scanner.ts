import { outOfRange } from './errors/range';

/**
 * Incrementally scans string contents, matching against patterns.
 *
 * This class is intended to be _low-level_, agnostic string-based scanner to
 * be used to tokenize within the compiler and static analysis tools, and is
 * _stateful_.
 */
export class Scanner {
  private mLastMatch?: {[key: string]: string};
  private mPosition = 0;

  /**
   * Creates a new scanner of the provided contents.
   *
   * @param contents String to scan.
   */
  constructor(public readonly contents: string) {}

  private get length(): number {
    return this.contents.length;
  }

  /**
   * Whether the @member position cursor is at the end of @member contents.
   */
  public get isDone(): boolean {
    return this.position === this.length;
  }

  /**
   * Returns the last match as a result of @member scan.
   */
  public get lastMatch(): {[key: string]: string} | undefined {
    return this.mLastMatch;
  }

  /**
   * Returns the character code of the character at an offset.
   *
   * @param offset Offset from @member position.
   */
  public peek(offset = 0): number {
    const position = this.position + offset;
    const result = this.contents.codePointAt(position);
    if (result === undefined) {
      throw outOfRange(position, this.length);
    }
    return result;
  }

  /**
   * Returns and consumes the character code at the current @member position.
   */
  public read(): number {
    const result = this.contents.codePointAt(this.position++)!;
    this.mLastMatch = undefined;
    return result;
  }

  /**
   * If the scanner matches a @param pattern, returns true, and consumes it.
   */
  public scan(pattern: number | string | RegExp): boolean {
    if (typeof pattern === 'number') {
      if (this.peek() === pattern) {
        this.position++;
        this.mLastMatch = undefined;
        return true;
      }
      return false;
    }
    const substring = this.contents.substring(this.position);
    if (typeof pattern === 'string') {
      if (substring.startsWith(pattern)) {
        this.position += pattern.length;
        this.mLastMatch = [pattern];
        return true;
      }
      return false;
    }
    const regexp = new RegExp(`^${pattern.source}`);
    const matches = substring.match(regexp);
    if (matches) {
      this.position += matches[0].length;
      this.mLastMatch = matches;
      return true;
    }
    return false;
  }

  /**
   * Position of the scanner within @member contents.
   */
  public get position(): number {
    return this.mPosition;
  }

  /**
   * Sets the position of the scanner within @member contents.
   */
  public set position(position: number) {
    if (position > this.length) {
      throw outOfRange(position, this.length);
    }
    this.mPosition = position;
  }
}
