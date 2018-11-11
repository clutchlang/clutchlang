// tslint:disable:no-magic-numbers

import { StaticMessage } from '../../../../src/language/ast/message';
import * as ast from '../../../../src/language/ast/parser';
import { parseFile } from '../../utilts';

describe('parseFunctionDeclaration', () => {
  test('should parse a simple function declaration', () => {
    const d = parseFile(`
      main: void -> {}
    `).modules[0].declarations[0] as ast.FunctionDeclaration;
    expect(d.isExternal).toEqual(false);
    expect(d.name.name).toEqual('main');
    expect(d.params).toBeUndefined();
    expect(d.returnType!.name).toEqual('void');
    expect(d.body).toBeInstanceOf(ast.StatementBlock);
  });

  test('should parse a function declaration with no params', () => {
    const d = parseFile(`
      main() -> {}
    `).modules[0].declarations[0] as ast.FunctionDeclaration;
    expect(d.isExternal).toEqual(false);
    expect(d.name.name).toEqual('main');
    expect(d.params!.params).toHaveLength(0);
    expect(d.returnType).toBeUndefined();
    expect(d.body).toBeInstanceOf(ast.StatementBlock);
  });

  test('should parse a function declaration with 1 param', () => {
    const d = parseFile(`
      identity(n) -> n
    `).modules[0].declarations[0] as ast.FunctionDeclaration;
    expect(d.name.name).toEqual('identity');
    expect(d.params!.params).toHaveLength(1);
    expect(d.params!.params[0].name.name).toEqual('n');
    const e = d.body as ast.Identifier;
    expect(e.name).toEqual('n');
  });

  test('should parse a function declaration with types', () => {
    const d = parseFile(`
      a(b: Foo, c: Foo,): Foo -> b
    `).modules[0].declarations[0] as ast.FunctionDeclaration;
    expect(d.params!.params).toHaveLength(2);
    expect(d.params!.params[0].name.name).toEqual('b');
    expect(d.params!.params[0].type!.name).toEqual('Foo');
    expect(d.params!.params[1].name.name).toEqual('c');
    expect(d.params!.params[1].type!.name).toEqual('Foo');
    expect(d.returnType!.name).toEqual('Foo');
    const e = d.body as ast.Identifier;
    expect(e.name).toEqual('b');
  });

  test('should parse a function declaration with statements', () => {
    const d = parseFile(`
      main -> {
        print('Hello')
        print('World')
        return
      }
    `).modules[0].declarations[0] as ast.FunctionDeclaration;
    const b = d.body! as ast.StatementBlock;
    expect(b.statements).toHaveLength(3);
  });

  test('should parse external functions', () => {
    const d = parseFile(`
      external xFn
    `).modules[0].declarations[0] as ast.FunctionDeclaration;
    expect(d.name.name).toEqual('xFn');
    expect(d.isExternal).toEqual(true);
  });

  test('should fail parsing external functions with a body', () => {
    expect(() => parseFile('external xFn => 1')).toThrowError(StaticMessage);
  });
});

describe('parseTypeDeclaration', () => {
  test('should parse an empty type', () => {
    const t = parseFile(`
      type Foo {}
    `).modules[0].declarations[0] as ast.TypeDeclaration;
    expect(t.name.name).toEqual('Foo');
    expect(t.isExternal).toEqual(false);
    expect(t.members).toHaveLength(0);
  });

  test('should parse an empty external type', () => {
    const t = parseFile(`
      external type Foo {}
    `).modules[0].declarations[0] as ast.TypeDeclaration;
    expect(t.name.name).toEqual('Foo');
    expect(t.isExternal).toEqual(true);
    expect(t.members).toHaveLength(0);
  });

  test('should parse a type with members', () => {
    const t = parseFile(`
      type Foo {
        returnsBar -> 'Bar'
      }
    `).modules[0].declarations[0] as ast.TypeDeclaration;
    expect(t.members).toHaveLength(1);
    const returnsBar = t.members[0] as ast.FunctionDeclaration;
    expect(returnsBar.name.name).toEqual('returnsBar');
    expect((returnsBar.body! as ast.LiteralString).value).toEqual('Bar');
  });
});
