import { outOfRange } from './errors/range';

/**
 * Incrementally scans string contents, matching against patterns.
 *
 * This class is intended to be _low-level_, agnostic string-based scanner to
 * be used to tokenize within the compiler and static analysis tools, and is
 * _stateful_.
 */
export class Scanner {
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
    return this.contents.codePointAt(this.position++)!;
  }

  /**
   * If the scanner matches a @param pattern, returns true, and consumes it.
   */
  public scan(pattern: number | string): boolean {
    if (typeof pattern === 'string') {
      const substring = this.contents.substring(this.position);
      if (substring.startsWith(pattern)) {
        this.position += pattern.length;
        return true;
      }
    }
    if (this.peek() === pattern) {
      this.position++;
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
