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
    const codeUnit = this.peek();
    this.mLastMatch = [String.fromCharCode(codeUnit)];
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

  /**
   * Returns a @see {SourceSpan} representing the latest scanned positions.
   */
  public get span(): SourceSpan {
    const match = this.mLastMatch![0];
    const start = this.mSourceFile.location(this.position - match.length);
    const end = this.mSourceFile.location(this.position);
    return new SourceSpan(start, end, match);
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

  constructor(
    public readonly contents: string,
    public readonly source?: string
  ) {}

  /**
   * Returns the line number given @param offset.
   */
  public computeLine(offset: number): number {
    this.assertValidOffset(offset);
    if (offset < this.lineStarts[0]) {
      return 0;
    }
    if (offset >= this.lineStarts[this.lineStarts.length - 1]) {
      return this.lineStarts.length;
    }
    return this.binarySearch(offset);
  }

  /**
   * Returns the column number given @param offset.
   */
  public computeColumn(offset: number): number {
    this.assertValidOffset(offset);
    const line = this.computeLine(offset) - 1;
    const start = this.lineStarts[line] || 0;
    return offset - start;
  }

  /**
   * Returns a pointer to the provided @param offset in this file.
   */
  public location(offset: number): SourceLocation {
    return new FileLocation(this, offset);
  }

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

  private assertValidOffset(offset: number): void {
    if (offset < 0) {
      throw new RangeError(`Offset may not be negative, was ${offset}.`);
    }
    if (offset > this.length) {
      throw new RangeError(
        `Offset ${offset} must not be greater than the length ${this.length}`
      );
    }
  }

  /**
   * Binary search of @member lineStarts to find cooresponding @param offset.
   */
  private binarySearch(offset: number): number {
    let min = 0;
    let max = this.lineStarts.length - 1;
    while (min < max) {
      // tslint:disable-next-line:no-magic-numbers
      const half = Math.floor(min + (max - min) / 2);
      if (this.lineStarts[half] > offset) {
        max = half;
      } else {
        min = half + 1;
      }
    }
    return max;
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

export class SourceLocation {
  /**
   * Source containing this location.
   */
  public readonly source: string | undefined;

  /**
   * 0-based line of this location in @member source.
   */
  public readonly line: number;

  /**
   * 0-based column of this location in @member source.
   */
  public readonly column: number;

  constructor(
    public readonly offset: number,
    options: {
      source?: string;
      line?: number;
      column?: number;
    } = {}
  ) {
    this.source = options.source;
    this.line = options.line || 0;
    this.column = options.column || offset;
  }
}

export class SourceSpan {
  constructor(
    public readonly start: SourceLocation,
    public readonly end: SourceLocation,
    public readonly text: string
  ) {
    if (start.offset < 0) {
      throw new RangeError(`Invalid start offset: ${start.offset}`);
    }
    if (end.offset <= start.offset) {
      throw new RangeError(
        `Invalid end offset: ${end.offset} for start ${start.offset}`
      );
    }
    if (start.source !== end.source) {
      throw new Error('Source URLs must be the same');
    }
    if (text.length !== end.offset - start.offset) {
      throw new RangeError(
        `Invalid length of text ${text.length} for offset ${start.offset} -> ${
          end.offset
        }`
      );
    }
  }
}

/**
 * An internal @see {SourceLocation} that computes line/column lazily.
 */
export class FileLocation implements SourceLocation {
  constructor(
    private readonly file: SourceFile,
    public readonly offset: number
  ) {}

  public get column(): number {
    return this.file.computeColumn(this.offset);
  }

  public get line(): number {
    return this.file.computeLine(this.offset);
  }

  public get source(): string | undefined {
    return this.file.source;
  }
}
