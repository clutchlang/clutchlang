// tslint:disable:no-magic-numbers
import { tokenize } from '../../src/language/lexer';
import { ClutchParser } from '../../src/language/parser';
import { TypeChecker, TypeScope } from '../../src/language/typesystem/checker';
import {
  BOOLEAN_TYPE,
  FunctionType,
  NUMBER_TYPE,
  STRING_TYPE,
  Type,
} from '../../src/language/typesystem/type';

function check(source: string, scope?: TypeScope): Type {
  const node = new ClutchParser(tokenize(source)).parseExpression();
  return node.accept(
    new TypeChecker(),
    scope === undefined ? new TypeScope(null) : scope
  );
}

describe('typechecker', () => {
  it('can type literals', () => {
    expect(check("'test'")).toBe(STRING_TYPE);
    expect(check('123')).toBe(NUMBER_TYPE);
    expect(check('true')).toBe(BOOLEAN_TYPE);
  });

  it('can check basic expressions', () => {
    expect(check('(123)')).toBe(NUMBER_TYPE);
    expect(check('2 + 3')).toBe(NUMBER_TYPE);
    expect(check('true && false')).toBe(BOOLEAN_TYPE);
    expect(check('++1')).toBe(NUMBER_TYPE);
  });

  it('can check type errors', () => {
    expect(() => check('123 + true')).toThrow();
    expect(() => check('true == 2')).toThrow();
  });

  it('can check identifiers', () => {
    expect(() => check('1 + foo')).toThrow();

    const scope = new TypeScope(null);
    scope.store('foo', NUMBER_TYPE);

    expect(check('1 + foo', scope)).toBe(NUMBER_TYPE);
  });

  it('can check invocations', () => {
    const fib = new FunctionType([NUMBER_TYPE], NUMBER_TYPE);
    const scope = new TypeScope(null);
    scope.store('foo', fib);

    expect(check('foo(2)', scope)).toBe(NUMBER_TYPE);
    expect(() => check('foo(true)', scope)).toThrow(); // type error.
    expect(() => check('foo()', scope)).toThrow(); // mismatched parameters.
  });
});
