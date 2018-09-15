// tslint:disable:no-magic-numbers
import { Scanner } from '../src/parser';
import { equal } from 'assert';

describe(`${Scanner}`, () => {
  let scanner: Scanner;
  const contents = 'ABC';
  const $A = contents.codePointAt(0)!;
  const $B = contents.codePointAt(1)!;
  const $C = contents.codePointAt(2)!;

  beforeEach(() => (scanner = new Scanner(contents)));

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
    scanner.scan('A');
    expect(scanner.lastMatch![0]).toBe('A');
    scanner.scan(/B/);
    expect(scanner.lastMatch![0]).toBe('B')
    scanner.scan($C);
    expect(scanner.lastMatch).toBeUndefined();
  });
});
