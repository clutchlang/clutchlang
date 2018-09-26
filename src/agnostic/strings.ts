/**
 * Character codes that will be frequently referred to across the program.
 */
export const enum Characters {
  // Numbers
  $0 = 48,
  $1 = 49,
  $2 = 50,
  $3 = 51,
  $4 = 52,
  $5 = 53,
  $6 = 54,
  $7 = 55,
  $8 = 56,
  $9 = 57,

  // Letters
  $A = 65,
  $E = 69,
  $F = 70,
  $X = 88,
  $Z = 90,
  $a = 97,
  $e = 101,
  $f = 102,
  $x = 120,
  $z = 122,

  // Symbols
  $_ = 95,
  $EQUALS = 61,
  $LANGLE = 60,
  $RANGLE = 62,
  $LPAREN = 40,
  $RPAREN = 41,
  $LCURLY = 123,
  $RCURLY = 125,
  $PERIOD = 46,
  $MINUS = 45,
  $PLUS = 43,
  $SLASH = 47,
  $STAR = 42,
  $SQUOTE = 39,
  $EXCLAIM = 33,
  $PIPE = 124,
  $AND = 38,
  $CARET = 94,
  $TILDE = 126,

  // Misc
  $CR = 13,
  $LF = 10,
  $SPACE = 32,
  $TAB = 9,
}

/**
 * Returns whether @param character is considered a digit.
 */
export function isDigit(character: number): boolean {
  return character >= Characters.$0 && character <= Characters.$9;
}

/**
 * Returns whether @param character is a hexadecimal digit.
 */
export function isHexadecimal(character: number): boolean {
  return (
    (character >= Characters.$A && character <= Characters.$F) ||
    (character >= Characters.$a && character <= Characters.$f) ||
    isDigit(character)
  );
}

/**
 * Returns whether @param character is considered a letter.
 */
export function isLetter(character: number): boolean {
  return (
    (character >= Characters.$A && character <= Characters.$Z) ||
    (character >= Characters.$a && character <= Characters.$z)
  );
}

/**
 * Returns whether @param character is considered a new line terminator.
 */
export function isNewLine(character: number): boolean {
  return character === Characters.$CR || character === Characters.$LF;
}

/**
 * Returns whether @param character is considered whitespace.
 */
export function isWhiteSpace(character: number): boolean {
  return (
    character === Characters.$SPACE ||
    character === Characters.$TAB ||
    isNewLine(character)
  );
}

/**
 * Splits a string @param text into individual lines.
 *
 * A line is considered "terminated" by either a CR (U+000D), a LF (U+OOOA), a
 * CR+LF (DOS line ending), and a final non-empty line can be ended simply by
 * the end of the string.
 *
 * The returned lines do not contain any line terminators.
 */
export function splitLines(text: string): string[] {
  const lines: string[] = [];
  const length = text.length;
  let sliceStart = 0;
  let currentChar = 0;
  for (let i = 0; i < length; i++) {
    const previousChar = currentChar;
    currentChar = text.codePointAt(i)!;
    if (currentChar !== Characters.$CR) {
      if (currentChar !== Characters.$LF) {
        continue;
      }
      if (previousChar === Characters.$CR) {
        sliceStart = i + 1;
        continue;
      }
    }
    lines.push(text.substring(sliceStart, i));
    sliceStart = i + 1;
  }
  if (sliceStart < length) {
    lines.push(text.substring(sliceStart, length));
  }
  return lines;
}

// TODO: Actually implement.
export function unescapeString(raw: string): string {
  return raw.replace('\\n', '\n');
}

/**
 * Aids in incrementally writing a string, including proper indentation.
 */
export class StringBuffer {
  private indents = '';

  constructor(private buffer = '') {}

  public write(object: unknown): void {
    this.buffer += `${this.indents}${object}`;
  }

  public writeAll(objects: Iterable<unknown>, seperator = '') {
    let first = true;
    for (const e of objects) {
      if (!first) {
        this.buffer += seperator;
      }
      this.write(e);
      first = false;
    }
  }

  public writeLine(object: unknown = ''): void {
    this.buffer += `${this.indents}${object}\n`;
  }

  public indent(amount = 0): number {
    if (amount >= 0) {
      this.indents += ' '.repeat(amount);
    } else {
      this.indents = this.indents.substring(-amount);
    }
    return this.indents.length;
  }

  public toString(): string {
    return this.buffer;
  }
}
