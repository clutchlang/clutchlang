// tslint:disable:no-magic-numbers

import {
  SourceFile,
  StringSpan,
  Token,
  UnexpectedTokenError,
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

describe('UnexpectedTokenError', () => {
  it('should be supported without context', () => {
    const error = new UnexpectedTokenError(new Token());
    expect(error.message).toBe('Unexpected "token".');
  });

  it('should be supported with context', () => {
    const error = new UnexpectedTokenError(new Token(), 'Context');
    expect(error.message).toBe('Unexpected "token" in Context.');
  });
});
