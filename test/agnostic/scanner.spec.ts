// tslint:disable:no-magic-numbers

import {
  SourceFile,
  StringScanner,
  StringSpan,
  StringLexer,
} from '../../src/agnostic/scanner';

describe('StringSpan', () => {
  describe('should throw on an invalid', () => {
    it('offset', () => {
      expect(() => new StringSpan(-1, 0, 0, '')).toThrowError(RangeError);
    });

    it('column', () => {
      expect(() => new StringSpan(0, -1, 0, '')).toThrowError(RangeError);
    });

    it('line', () => {
      expect(() => new StringSpan(0, 0, -1, '')).toThrowError(RangeError);
    });
  });

  it('should support a single-line span', () => {
    const span = new StringSpan(0, 1, 2, 'Hello World');
    expect(span.offset).toBe(0);
    expect(span.column).toBe(1);
    expect(span.line).toBe(2);
    expect(span.text).toBe('Hello World');
    expect(span.length).toBe('Hello World'.length);
    expect(span.isMultiLine).toBe(false);
    expect(span.lines()).toEqual([{ line: 2, text: 'Hello World' }]);
  });

  it('should support a multi-line span', () => {
    const span = new StringSpan(0, 0, 0, 'Hello\nWorld');
    expect(span.isMultiLine).toBe(true);
    expect(span.lines()).toEqual([
      { line: 0, text: 'Hello' },
      { line: 1, text: 'World' },
    ]);
  });
});

describe('SourceFile', () => {
  it('should support an empty file', () => {
    const file = new SourceFile('', 'EMPTY');
    expect(file.contents).toBe('');
    expect(file.length).toBe(0);
    expect(file.sourceUrl).toBe('EMPTY');
  });

  it('should prevent invalid offsets', () => {
    const file = new SourceFile('test');
    expect(() => file.computeColumn(-1)).toThrowError(RangeError);
    expect(() => file.computeLine(-1)).toThrowError(RangeError);
    expect(() => file.computeColumn(5)).toThrowError(RangeError);
    expect(() => file.computeLine(5)).toThrowError(RangeError);
    expect(() => file.span(2, 1)).toThrowError(RangeError);
  });

  it('should support computing span information', () => {
    const file = new SourceFile('aaaa\nbbbb\rcccc\r\ndddd');
    const aaaa = file.span(0, 3);
    expect(aaaa.column).toBe(0);
    expect(aaaa.line).toBe(0);
    const bbb = file.span(6, 8);
    expect(bbb.column).toBe(1);
    expect(bbb.line).toBe(1);
    const cc = file.span(12, 14);
    expect(cc.column).toBe(2);
    expect(cc.line).toBe(2);
    const d = file.span(19, 20);
    expect(d.column).toBe(3);
    expect(d.line).toBe(3);
  });
});

describe('StringScanner', () => {
  it('should return the length of the underlying data', () => {
    const scanner = new StringScanner('123');
    expect(scanner.length).toBe(3);
  });

  it('should return the position, and allow mutation', () => {
    const scanner = new StringScanner('123');
    expect(scanner.position).toBe(0);
    scanner.position++;
    expect(scanner.position).toBe(1);
    scanner.position++;
    expect(scanner.position).toBe(2);
    scanner.position++;
    expect(scanner.position).toBe(3);
    expect(() => scanner.position++).toThrowError(RangeError);
    expect(scanner.position).toBe(3);
  });

  it('should return a substring of the underlying data', () => {
    const scanner = new StringScanner('123');
    expect(scanner.substring()).toBe('123');
    expect(scanner.substring(1)).toBe('23');
    expect(scanner.substring(1, 2)).toBe('2');
  });

  it('should return if there are remaining matching characters', () => {
    const $1 = 49;
    const $2 = 50;
    const $3 = 51;
    const scanner = new StringScanner('123');
    expect(scanner.hasNext()).toBe(true);
    expect(scanner.hasNext($1)).toBe(true);
    expect(scanner.hasNext($2)).toBe(false);
    scanner.advance();
    expect(scanner.hasNext($2)).toBe(true);
    expect(scanner.hasNext($3)).toBe(false);
    scanner.advance();
    scanner.advance();
    expect(scanner.hasNext()).toBe(false);
  });

  it('should return if there are remaining strings', () => {
    const scanner = new StringScanner('122333');
    expect(scanner.hasNext('1')).toBe(true);
    scanner.position = 1;
    expect(scanner.hasNext('3')).toBe(false);
    expect(scanner.hasNext('22')).toBe(true);
    scanner.position = 3;
    expect(scanner.hasNext('3333')).toBe(false);
    expect(scanner.hasNext('333')).toBe(true);
  });

  it('should reset the scanner', () => {
    const scanner = new StringScanner('A');
    expect(scanner.position).toBe(0);
    scanner.advance();
    expect(scanner.position).toBe(1);
    scanner.reset();
    expect(scanner.position).toBe(0);
  });
});

it('StringLexer should scan and fetch tokens', () => {
  const lexer = new StringLexer(new StringScanner('AAA111if'));
  expect(lexer.scanWhiteSpace()).toBe(false);
  expect(lexer.scanLetters()).toBe(true);
  expect(lexer.nextToken).toBe('AAA');
  expect(lexer.scanDigits()).toBe(true);
  expect(lexer.nextToken).toBe('111');
  expect(lexer.scanExactly('else')).toBe(false);
  expect(lexer.scanExactly('if')).toBe(true);
  expect(lexer.nextToken).toBe('if');
});
