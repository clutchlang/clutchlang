import { assertMin, assertMax, assertRange } from "../../src/agnostic/errors";

describe('assertMin', () => {
  it('should not throw on 0', () => {
    expect(() => assertMin('example', 0)).not.toThrowError();
  });

  it('should not throw on 1', () => {
    expect(() => assertMin('example', 1)).not.toThrowError();
  });

  it('should not throw on min', () => {
    expect(() => assertMin('example', 2, 2)).not.toThrowError();
  });
  
  it('should throw on -1', () => {
    expect(() => assertMin('example', -1)).toThrowError(RangeError);
  });
});

describe('assertMax', () => {
  it('should not throw on max', () => {
    expect(() => assertMax('example', 2, 2)).not.toThrowError();
  });

  it('should throw > max', () => {
    expect(() => assertMax('example', 2, 1)).toThrowError(RangeError);
  });
});

describe('assertRange', () => {
  it('should not throw if valid', () => {
    expect(() => assertRange('example', 1, 0, 2)).not.toThrowError(RangeError);
  });
  
  it('should throw if invalid', () => {
    expect(() => assertRange('example', 3, 1, 2)).toThrowError(RangeError);
    expect(() => assertRange('example', 0, 1, 2)).toThrowError(RangeError);
  });
});
