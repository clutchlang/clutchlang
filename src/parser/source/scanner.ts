/**
 * Represents a type of matchable context.
 */
export type Pattern = number | string | RegExp;

/**
 * A class that scans through a string using @see {Pattern}.
 */
export class SourceScanner {
  private readonly mSourceFile: SourceFile;

  private mLastMatch?: RegExpMatchArray;
  private mPosition = 0;

  constructor(private readonly contents: string) {
    this.mSourceFile = new SourceFile(contents);
  }

  /**
   * Returns the character code of the character at an offset.
   *
   * @param offset Offset from @member position.
   */
  public peek(offset = 0): number {
    const position = this.position + offset;
    const codeUnit = this.contents.codePointAt(position);
    if (codeUnit === undefined) {
      return this.throwOutOfRange(position, this.length);
    }
    return codeUnit;
  }

  /**
   * Returns and consumes the character code at the current @member position.
   */
  public read(): number {
    this.mLastMatch = undefined;
    const codeUnit = this.peek();
    this.position++;
    return codeUnit;
  }

  /**
   * Returns whether @param pattern is matched, and consumes it for so.
   */
  public scan(pattern: Pattern): boolean {
    if (typeof pattern === 'number') {
      if (this.peek() === pattern) {
        this.read();
        return true;
      }
      return false;
    }
    const substring = this.substring;
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

  public get substring(): string {
    return this.contents.substring(this.position);
  }

  private get length(): number {
    return this.mSourceFile.length;
  }

  private throwOutOfRange(value: number, max: number): never {
    throw new RangeError(`Out of range: ${value} of ${max}`);
  }

  public get isDone(): boolean {
    return this.position === this.length;
  }

  /**
   * Returns the last match as a result of @member scan.
   */
  public get lastMatch(): RegExpMatchArray | undefined {
    return this.mLastMatch;
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
      this.throwOutOfRange(position, this.length);
    }
    this.mPosition = position;
  }
}

export class SourceFile {
  private static readonly CR = 10;
  private static readonly LF = 13;

  /**
   * An array of offsets for each line beginning in the file.
   *
   * Each offset refers to the first character *after* the newline. If the
   * source file has a trailing newline, the final offset won't actually be in
   * the file.
   */
  private readonly mLineStarts: number[] = [];
  private mLineStartsComputed = false;

  constructor(public readonly contents: string) {}

  /**
   * Length of the file in characters.
   */
  public get length(): number {
    return this.contents.length;
  }

  /**
   * Number of lines in the file.
   */
  public get lines(): number {
    return this.lineStarts.length;
  }

  private computeLineStarts(): void {
    if (this.mLineStartsComputed) {
      return;
    }
    for (let i = 0; i < this.length; i++) {
      let c = this.contents.charCodeAt(i);
      if (c === SourceFile.CR) {
        const j = i + 1;
        if (j >= this.length || this.contents.charCodeAt(j) !== SourceFile.LF) {
          c = SourceFile.LF;
        }
      }
      if (c === SourceFile.LF) {
        this.mLineStarts.push(i + 1);
      }
    }
    this.mLineStartsComputed = true;
  }

  private get lineStarts(): number[] {
    this.computeLineStarts();
    return this.mLineStarts;
  }
}
