// tslint:disable:no-magic-numbers

import {
  SourceSpan,
  Token,
  UnexpectedTokenError,
} from '../../src/agnostic/scanner';

describe('SourceSpan', () => {
  describe('should throw on an invalid', () => {
    it('offset', () => {
      expect(() => new SourceSpan(-1, 0, 0, '')).toThrowError(RangeError);
    });

    it('column', () => {
      expect(() => new SourceSpan(0, -1, 0, '')).toThrowError(RangeError);
    });

    it('line', () => {
      expect(() => new SourceSpan(0, 0, -1, '')).toThrowError(RangeError);
    });
  });

  it('should support a single-line span', () => {
    const span = new SourceSpan(0, 1, 2, 'Hello World');
    expect(span.offset).toBe(0);
    expect(span.column).toBe(1);
    expect(span.line).toBe(2);
    expect(span.text).toBe('Hello World');
    expect(span.length).toBe('Hello World'.length);
    expect(span.isMultiLine).toBe(false);
    expect(span.lines).toEqual([{ line: 2, text: 'Hello World' }]);
  });

  it('should support a multi-line span', () => {
    const span = new SourceSpan(0, 0, 0, 'Hello\nWorld');
    expect(span.isMultiLine).toBe(true);
    expect(span.lines).toEqual([
      { line: 0, text: 'Hello' },
      { line: 1, text: 'World' },
    ]);
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
