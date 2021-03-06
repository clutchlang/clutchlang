// tslint:disable:no-magic-numbers

import {
  isDigit,
  isHexadecimal,
  isLetter,
  isNewLine,
  isWhiteSpace,
  splitLines,
  StringBuffer,
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
    expect(
      Array.from(toChars('0123ABCDEFGabcdefg').map(isHexadecimal))
    ).toEqual([
      true, // 0
      true, // 1
      true, // 2
      true, // 3
      true, // A
      true, // B
      true, // C
      true, // D
      true, // E
      true, // F
      false, // G
      true, // a
      true, // b
      true, // c
      true, // d
      true, // e
      true, // f
      false, // g
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

it('StringBuffer should create a formatted string', () => {
  const buffer = new StringBuffer();
  buffer.writeLine('<html>');
  buffer.indent(2);
  buffer.writeLine('<body>');
  buffer.writeLine('</body>');
  buffer.indent(-2);
  buffer.writeLine('</html>');
  expect(buffer.toString()).toEqual('<html>\n  <body>\n  </body>\n</html>\n');
});

it('StringBuffer should create a formatted list of items', () => {
  const buffer = new StringBuffer();
  buffer.write('[');
  buffer.writeAll([1, 2, 3], ', ');
  buffer.write(']');
  expect(buffer.toString()).toEqual('[1, 2, 3]');
});
