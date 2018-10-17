// tslint:disable:no-magic-numbers
import { tokenize } from '../../src/language/ast/lexer/tokenizer';
import { ClutchParser } from '../../src/language/parser';
import {
  LocalScope,
  TypeCheckingVisitor,
} from '../../src/language/typesystem/checker';
import { CORE_MODULE } from '../../src/language/typesystem/core';
import {
  ModuleDeclarationElement,
  outline,
} from '../../src/language/typesystem/element';
import {
  FunctionType,
  SOMETHING_TYPE,
  Type,
  VOID_TYPE,
} from '../../src/language/typesystem/type';

function checkExpr(source: string): Type {
  const node = new ClutchParser(tokenize(source)).parseExpression();
  const module = new ModuleDeclarationElement('main');
  module.imports.push(CORE_MODULE);
  return node.accept(new TypeCheckingVisitor(), {
    module,
    scope: new LocalScope(),
  });
}

function checkStatement(source: string): Type {
  const node = new ClutchParser(tokenize(source)).parseStatement();
  const module = new ModuleDeclarationElement('main');
  module.imports.push(CORE_MODULE);
  return node.accept(new TypeCheckingVisitor(), {
    module,
    scope: new LocalScope(),
  });
}

function checkFile(source: string): ModuleDeclarationElement {
  const node = new ClutchParser(tokenize(source)).parseFileRoot();
  const module = outline(node, 'main');
  module.imports.push(CORE_MODULE);
  node.accept(new TypeCheckingVisitor(), {
    module,
    scope: new LocalScope(),
  });
  return module;
}

const STRING_TYPE = CORE_MODULE.resolveType('String')!;
const NUMBER_TYPE = CORE_MODULE.resolveType('Number')!;
const BOOLEAN_TYPE = CORE_MODULE.resolveType('Boolean')!;

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

  it('looks up types', () => {
    expect(checkFile('').resolveType('Number')).toBe(NUMBER_TYPE);
    expect(checkFile('').resolveType('Nmber')).toBe(null);
  });

  it('can check invocations', () => {
    const mod = `
    foo(n: Number): Number -> 2
    long(b1: Boolean n1: Number b2: Boolean s1: String): String -> 'hello'
    `;
    expect(() => checkFile(mod + '\nmain() -> foo(true)')).toThrow(); // type error.
    expect(() => checkFile(mod + '\nmain() -> foo()')).toThrow(); // mismatched parameters.
    expect(() => checkFile(mod + '\nmain() -> bar()')).toThrow(); // cannot invoke non-function.
    expect(() => checkFile(mod + '\nmain() -> long(1, 1, 1, 1)')).toThrow();
  });

  describe('if', () => {
    it('basic support', () => {
      expect(checkExpr('if (true) then 2 else 3')).toBe(NUMBER_TYPE);
    });

    it('incompatible branches become Something', () => {
      expect(checkExpr('if (true) then 2 else true')).toEqual(SOMETHING_TYPE);
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
    it('can check returns', () => {
      expect(checkStatement('return')).toBe(VOID_TYPE);
      expect(checkStatement('return 2')).toBe(NUMBER_TYPE);
    });
  });

  describe('functions', () => {
    it('can check functions', () => {
      const mod = checkFile(
        'fib(n: Number): Number -> if n <= 2 then fib(n - 1) else fib(n - 2)'
      );
      const expected = new FunctionType([NUMBER_TYPE], NUMBER_TYPE);
      expect(mod.resolveType('fib')!.isAssignableTo(expected)).toBe(true);
    });

    it('infers Something as the missing type of parameters', () => {
      const mod = checkFile(
        'fib(n: Number b): Number -> if n <= 2 then fib(n - 1 b) else fib(n - 2 b)'
      );
      const expected = new FunctionType(
        [NUMBER_TYPE, SOMETHING_TYPE],
        NUMBER_TYPE
      );
      expect(mod.resolveType('fib')!.isAssignableTo(expected)).toBe(true);
    });

    it('only infers void return type', () => {
      const mod = checkFile('foob(n: Number) -> print(n)');
      expect(
        mod
          .resolveType('foob')!
          .isAssignableTo(new FunctionType([NUMBER_TYPE], VOID_TYPE))
      );
    });

    it('does not handle mistyped annotations', () => {
      expect(() =>
        checkFile(
          'fib(n: Nmber): Number -> if n <= 2 then fib(n - 1) else fib(n - 2)'
        )
      ).toThrow();
    });

    it('catches mismatched return type', () => {
      expect(() => checkFile('fib(n: Number): Number -> true')).toThrow();
    });
  });
});
