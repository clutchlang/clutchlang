// tslint:disable:no-magic-numbers
import { SourceFile, SourceScanner } from '../../../src/parser/source/scanner';

describe(`${SourceScanner}`, () => {
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
    expect(scanner.lastMatch).toBeUndefined();
  });
});

describe(`${SourceFile}`, () => {
  it('should calculate lines', () => {
    const file = new SourceFile('aaa\nbbbbb\r\nccc\n\r');
    const lines = file.lines;
    expect(lines).toBe(4);
    expect(lines).toEqual(file.lines);
  });
});
