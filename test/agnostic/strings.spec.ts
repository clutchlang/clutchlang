import {
  isDigit,
  isLetter,
  isNewLine,
  isWhiteSpace,
  splitLines,
} from '../../src/agnostic/strings';

describe('splitLines', () => {
  it('should split an empty string', () => {
    expect(splitLines('')).toEqual([]);
  });

  it('should split a string with no terminating characters', () => {
    expect(splitLines('Hello')).toEqual(['Hello']);
  });

  it('should split a string with a LF', () => {
    expect(splitLines('1\n2')).toEqual(['1', '2']);
  });

  it('should split a string ending with a LF', () => {
    expect(splitLines('1\n')).toEqual(['1']);
  });

  it('should split a string with a CR', () => {
    expect(splitLines('1\r2')).toEqual(['1', '2']);
  });

  it('should split a string ending with a CR', () => {
    expect(splitLines('1\r')).toEqual(['1']);
  });

  it('should split a string with a CR+LF (DOS-style)', () => {
    expect(splitLines('1\r\n2')).toEqual(['1', '2']);
  });

  it('should split a string ending with a CR+LF (DOS-style)', () => {
    expect(splitLines('1\r\n')).toEqual(['1']);
  });
});

describe('', () => {
  function toChars(text: string): number[] {
    const characters: number[] = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
      characters[i] = text.charCodeAt(i);
    }
    return characters;
  }

  test('isDigit should find digits', () => {
    expect(Array.from(toChars('1234567890A').map(isDigit))).toEqual([
      true, // 1
      true, // 2
      true, // 3
      true, // 4
      true, // 5
      true, // 6
      true, // 7
      true, // 8
      true, // 9
      true, // 0
      false, // A
    ]);
  });

  test('isDigit should find letters', () => {
    expect(Array.from(toChars('ABCabc1').map(isLetter))).toEqual([
      true, // A
      true, // B
      true, // C
      true, // a
      true, // b
      true, // c
      false, // 1
    ]);
  });

  test('isWhiteSpace should find letters', () => {
    expect(Array.from(toChars(' \t\n\rA').map(isWhiteSpace))).toEqual([
      true, //
      true, // \t
      true, // \n
      true, // \r
      false, // A
    ]);
  });

  test('isNewLine should find new lines', () => {
    expect(Array.from(toChars('\n\r\t').map(isNewLine))).toEqual([
      true, // \n
      true, // \r
      false, // \t
    ]);
  });
});
