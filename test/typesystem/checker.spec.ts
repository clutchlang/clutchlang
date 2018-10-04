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
  VOID_TYPE,
} from '../../src/language/typesystem/type';

function checkExpr(source: string, scope?: TypeScope): Type {
  const node = new ClutchParser(tokenize(source)).parseExpression();
  return node.accept(
    new TypeChecker(),
    scope === undefined ? new TypeScope(null) : scope
  );
}

function checkStatement(source: string, scope?: TypeScope): Type {
  const node = new ClutchParser(tokenize(source)).parseStatement();
  return node.accept(
    new TypeChecker(),
    scope === undefined ? new TypeScope(null) : scope
  );
}

describe('typechecker', () => {
  it('can type literals', () => {
    expect(checkExpr("'test'")).toBe(STRING_TYPE);
    expect(checkExpr('123')).toBe(NUMBER_TYPE);
    expect(checkExpr('true')).toBe(BOOLEAN_TYPE);
  });

  it('can check basic expressions', () => {
    expect(checkExpr('(123)')).toBe(NUMBER_TYPE);
    expect(checkExpr('2 + 3')).toBe(NUMBER_TYPE);
    expect(checkExpr('true && false')).toBe(BOOLEAN_TYPE);
    expect(checkExpr('++1')).toBe(NUMBER_TYPE);
  });

  it('can check type errors', () => {
    expect(() => checkExpr('123 + true')).toThrow();
    expect(() => checkExpr('true == 2')).toThrow();
  });

  it('can check declared operators', () => {
    expect(() => checkExpr('true + false')).toThrow();
    expect(() => checkExpr('++true')).toThrow();
  });

  it('can check identifiers', () => {
    expect(() => checkExpr('1 + foo')).toThrow();

    const scope = new TypeScope(null);
    scope.store('foo', NUMBER_TYPE);

    expect(checkExpr('1 + foo', scope)).toBe(NUMBER_TYPE);
  });

  it('can check invocations', () => {
    const fib = new FunctionType([NUMBER_TYPE], NUMBER_TYPE);
    const long = new FunctionType(
      [BOOLEAN_TYPE, NUMBER_TYPE, BOOLEAN_TYPE, STRING_TYPE],
      STRING_TYPE
    );
    const scope = new TypeScope(null);
    scope.store('foo', fib);
    scope.store('bar', NUMBER_TYPE);
    scope.store('long', long);

    expect(checkExpr('foo(2)', scope)).toBe(NUMBER_TYPE);
    expect(() => checkExpr('foo(true)', scope)).toThrow(); // type error.
    expect(() => checkExpr('foo()', scope)).toThrow(); // mismatched parameters.
    expect(() => checkExpr('bar()', scope)).toThrow(); // cannot invoke non-function.
    expect(() => checkExpr('long(1, 1, 1, 1)', scope)).toThrow();
  });

  describe('if', () => {
    it('', () => {
      expect(checkExpr('if (true) then 2 else 3')).toBe(NUMBER_TYPE);
    });

    it('incompatible branches', () => {
      expect(() => checkExpr('if (true) then 2 else true')).toThrow();
    });

    it('requires boolean condition', () => {
      expect(() => checkExpr('if (2) then 3 else 5')).toThrow();
    });
  });

  describe('assignment', () => {
    it('can assign literals', () => {
      expect(checkStatement('let a = 2')).toBe(VOID_TYPE);
    });
  });

  describe('return', () => {
    it('can type returns', () => {
      expect(checkStatement('return')).toBe(VOID_TYPE);
      expect(checkStatement('return 2')).toBe(NUMBER_TYPE);
    });
  });
});