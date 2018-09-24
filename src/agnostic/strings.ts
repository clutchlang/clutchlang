/**
 * Character codes that will be frequently referred to across the program.
 */
export const enum Characters {
  CR = 13,
  LF = 10,
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
    if (currentChar !== Characters.CR) {
      if (currentChar !== Characters.LF) {
        continue;
      }
      if (previousChar === Characters.CR) {
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
