// tslint:disable:no-magic-numbers
import {
  SourceFile,
  SourceLocation,
  SourceScanner,
  SourceSpan,
} from '../../../../src/parser/source/tokenizer/scanner';

describe('SourceScanner', () => {
  let scanner: SourceScanner;
  const contents = 'ABC';
  const $A = contents.codePointAt(0)!;
  const $B = contents.codePointAt(1)!;
  const $C = contents.codePointAt(2)!;

  beforeEach(() => (scanner = new SourceScanner(contents)));

  it('should reflect the position state via isDone', () => {
    expect(scanner.isDone).toBe(false);
    scanner.position = contents.length;
    expect(scanner.isDone).toBe(true);
  });

  it('should throw if the position is out of bounds', () => {
    expect(() => (scanner.position = contents.length + 1)).toThrowError(
      RangeError
    );
  });

  it('should peek and read character codes', () => {
    expect(scanner.peek()).toBe($A);
    expect(scanner.peek()).toBe($A);
    expect(scanner.peek(1)).toBe($B);
    expect(scanner.read()).toBe($A);
    expect(scanner.read()).toBe($B);
    expect(scanner.read()).toBe($C);
    expect(() => scanner.peek()).toThrowError(RangeError);
  });

  it('should scan character code patterns', () => {
    expect(scanner.scan($C)).toBe(false);
    expect(scanner.scan($A)).toBe(true);
    expect(scanner.peek()).toBe($B);
  });

  it('should scan substrings', () => {
    expect(scanner.scan('CCC')).toBe(false);
    expect(scanner.scan('AB')).toBe(true);
    expect(scanner.peek()).toBe($C);
  });

  it('should scan regular expressions', () => {
    expect(scanner.scan(/(C|B)/)).toBe(false);
    expect(scanner.scan(/(A|B)/)).toBe(true);
  });

  it('should update lastMatch during scanning', () => {
    expect(scanner.scan('A')).toBe(true);
    expect(scanner.lastMatch![0]).toBe('A');
    expect(scanner.scan(/B/)).toBe(true);
    expect(scanner.lastMatch![0]).toBe('B');
    expect(scanner.scan($C)).toBe(true);
    expect(scanner.lastMatch![0]).toBe('C');
  });

  it('should update span during scanning', () => {
    scanner.scan('A');
    let span = scanner.span;
    expect(span.start.offset).toBe(0);
    expect(span.end.offset).toBe(1);
    expect(span.text).toBe('A');

    scanner.scan(/B/);
    span = scanner.span;
    expect(span.start.offset).toBe(1);
    expect(span.end.offset).toBe(2);
    expect(span.text).toBe('B');

    scanner.scan($C);
    span = scanner.span;
    expect(span.start.offset).toBe(2);
    expect(span.end.offset).toBe(3);
    expect(span.text).toBe('C');
  });
});

describe('SourceFile', () => {
  it('should calculate number of lines', () => {
    const file = new SourceFile('aaa\nbbbbb\r\nccc\n\r');
    const lines = file.lines;
    expect(lines).toBe(4);
    expect(lines).toEqual(file.lines);
  });

  it('should read a specific line in the file', () => {
    const file = new SourceFile('aaa\nbbbbb\r\nccc\n\r');
    expect(file.readLine(0)).toBe('aaa');
    expect(file.readLine(1)).toBe('bbbbb');
    expect(file.readLine(2)).toBe('');
    expect(file.readLine(3)).toBe('ccc');
  });

  describe('should compute the line number of an offset', () => {
    it('and throw when < 0', () => {
      const file = new SourceFile('');
      expect(() => {
        file.computeLine(-1);
      }).toThrowError(RangeError);
    });

    it('and throw with >= length', () => {
      const file = new SourceFile('');
      expect(() => {
        file.computeLine(1);
      }).toThrowError(RangeError);
    });

    describe('on line', () => {
      const file = new SourceFile(['111', '222', '333'].join('\n'));

      it('0', () => {
        expect(file.computeLine(2)).toBe(0);
      });

      it('1', () => {
        expect(file.computeLine(6)).toBe(1);
      });

      it('2', () => {
        expect(file.computeLine(10)).toBe(2);
      });
    });

    it('in a larget file', () => {
      const file = new SourceFile(
        ['123456789', '12345', '12345678', '1234', '12'].join('\n')
      );
      expect(file.computeLine(1)).toBe(0);
      expect(file.computeLine(24)).toBe(2);
    });
  });

  describe('should compute the column number of an offset', () => {
    it('and throw when < 0', () => {
      const file = new SourceFile('');
      expect(() => {
        file.computeColumn(-1);
      }).toThrowError(RangeError);
    });

    it('and throw with >= length', () => {
      const file = new SourceFile('');
      expect(() => {
        file.computeColumn(1);
      }).toThrowError(RangeError);
    });

    describe('on line/column', () => {
      const file = new SourceFile(['111', '222', '333'].join('\n'));

      it('2', () => {
        expect(file.computeColumn(2)).toBe(2);
      });

      it('6', () => {
        expect(file.computeColumn(6)).toBe(2);
      });

      it('10', () => {
        expect(file.computeColumn(10)).toBe(2);
      });
    });

    it('should create a location pointer', () => {
      const file = new SourceFile(['111', '222', '333'].join('\n'), 'foo.txt');
      const point = file.location(6);
      expect(point.line).toBe(1);
      expect(point.column).toBe(2);
      expect(point.source).toBe('foo.txt');
    });
  });
});

it('SourceLocation should have sensible defaults', () => {
  const a = new SourceLocation(6, {
    column: 2,
    line: 1,
    source: 'foo.txt',
  });
  expect(a.offset).toBe(6);
  expect(a.column).toBe(2);
  expect(a.line).toBe(1);
  expect(a.source).toBe('foo.txt');

  const b = new SourceLocation(6);
  expect(b.offset).toBe(6);
  expect(b.column).toBe(6);
  expect(b.line).toBe(0);
  expect(b.source).toBeUndefined();
});

describe('SourceSpan', () => {
  it('should disallow a negative start', () => {
    expect(() => {
      return new SourceSpan(
        new SourceLocation(-1),
        new SourceLocation(1),
        'ab'
      );
    }).toThrowError(RangeError);
  });

  it('should disallow an end not greater than start', () => {
    expect(() => {
      return new SourceSpan(new SourceLocation(1), new SourceLocation(0), 'a');
    }).toThrowError(RangeError);
  });

  it('should disallow text of an invalid size', () => {
    expect(() => {
      return new SourceSpan(
        new SourceLocation(0),
        new SourceLocation(4),
        'abcde'
      );
    }).toThrowError(RangeError);
  });

  it('should disallow different source URLs', () => {
    expect(() => {
      return new SourceSpan(
        new SourceLocation(0, { source: 'foo.txt' }),
        new SourceLocation(4, { source: 'foo.dat' }),
        'abcd'
      );
    }).toThrowError();
  });

  it('should return a formatted message', () => {
    const span = new SourceSpan(
      new SourceLocation(12, { source: 'names.json' }),
      new SourceLocation(15, { source: 'names.json' }),
      // {"names": ["Abe", "George"]}
      //             ^^^
      'Abe'
    );
    expect(span.message('Invalid name')).toBe(
      'line 1, column 13 of names.json: Invalid name'
    );
  });

  it('should return a highlighted message from 1 line', () => {
    const file = new SourceFile('{"names": ["Abe", "George"]}');
    const span = file.span(12, 15);
    // {"names": ["Abe", "George"]}
    //             ^^^
    expect(span.highlight('Invalid name')).toBe(
      'Line 1:\n' +
      '  {"names": ["Abe", "George"]}\n' +
      '              ^^^\n' +
      'Invalid name'
    );
  });

  it('should return a highlighted message from >1 line', () => {
    const file = new SourceFile('[\n  1,\n  2,\n]');
    const span = file.span(0, file.contents.length);
    expect(span.highlight('Bad data')).toBe(
      '1: [\n' +
      '2:   1,\n' +
      '3:   2,\n' +
      '4: ]\n' +
      '\n' +
      'Bad data'
    );
  });
});
