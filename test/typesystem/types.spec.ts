import {
  BOOLEAN_TYPE,
  BOTTOM_TYPE,
  FunctionType,
  NUMBER_TYPE,
  STRING_TYPE,
  VOID_TYPE,
} from '../../src/language/typesystem/type';

describe('', () => {
  it('Exact types are exact', () => {
    expect(STRING_TYPE.isAssignableTo(STRING_TYPE)).toBe(true);
    expect(BOOLEAN_TYPE.isAssignableTo(BOOLEAN_TYPE)).toBe(true);
    expect(NUMBER_TYPE.isAssignableTo(NUMBER_TYPE)).toBe(true);
    expect(VOID_TYPE.isAssignableTo(VOID_TYPE)).toBe(true);
    expect(BOTTOM_TYPE.isAssignableTo(BOTTOM_TYPE)).toBe(true);

    expect(STRING_TYPE.name).toBe('String');
    expect(BOOLEAN_TYPE.name).toBe('Boolean');
    expect(NUMBER_TYPE.name).toBe('Number');
    expect(VOID_TYPE.name).toBe('()');

    expect(STRING_TYPE.isAssignableTo(BOOLEAN_TYPE)).toBe(false);
    expect(STRING_TYPE.isAssignableTo(NUMBER_TYPE)).toBe(false);
    expect(STRING_TYPE.isAssignableTo(VOID_TYPE)).toBe(false);
    expect(STRING_TYPE.isAssignableTo(BOTTOM_TYPE)).toBe(false);
  });

  it('function types are structural', () => {
    const left = new FunctionType([BOOLEAN_TYPE], STRING_TYPE);
    const right = new FunctionType([BOOLEAN_TYPE], STRING_TYPE);

    expect(left.isAssignableTo(right)).toBe(true);
    expect(right.isAssignableTo(left)).toBe(true);
    expect(left.isAssignableTo(STRING_TYPE)).toBe(false);
  });

  it('parameter length difference', () => {
    const left = new FunctionType([NUMBER_TYPE], STRING_TYPE);
    const right = new FunctionType([], STRING_TYPE);

    expect(left.isAssignableTo(right)).toBe(false);
    expect(right.isAssignableTo(left)).toBe(false);
  });

  it('parameter type difference', () => {
    const left = new FunctionType([NUMBER_TYPE], STRING_TYPE);
    const right = new FunctionType([BOOLEAN_TYPE], STRING_TYPE);

    expect(left.isAssignableTo(right)).toBe(false);
    expect(right.isAssignableTo(left)).toBe(false);
  });

  it('return type difference', () => {
    const left = new FunctionType([NUMBER_TYPE], STRING_TYPE);
    const right = new FunctionType([NUMBER_TYPE], BOOLEAN_TYPE);

    expect(left.isAssignableTo(right)).toBe(false);
    expect(right.isAssignableTo(left)).toBe(false);
  });

  it('formats the name correctly', () => {
    const fn = new FunctionType([NUMBER_TYPE, BOOLEAN_TYPE], STRING_TYPE);

    expect(fn.name).toBe('(Number, Boolean) -> String');
  });
});
