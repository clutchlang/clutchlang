import { splitLines } from '../../src/agnostic/strings';

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
