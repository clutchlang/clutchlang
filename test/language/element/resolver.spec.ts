import * as ast from '../../../src/language/ast/parser';
import { Resolver } from '../../../src/language/element/resolver';
import { parseFile } from '../utilts';

describe('Resolver', () => {
  let resolver!: Resolver;

  beforeEach(() => {
    resolver = new Resolver();
  });

  test('should resolve fields', () => {
    const file = parseFile(`
      let maybe: Boolean
    `);
    const variable = file.modules[0].declarations[0] as ast.VariableDeclaration;
    const element = resolver.visitFieldDeclaration(variable);
    expect(element).toBeDefined();
  });

  test('should resolve functions', () => {
    const file = parseFile(`
      fib(n) -> n
    `);
    const func = file.modules[0].declarations[0] as ast.FunctionDeclaration;
    const element = resolver.visitFunctionDeclaration(func);
    expect(element).toBeDefined();
  });

  test('should resolve types', () => {
    const file = parseFile(`
      type Foo {}
    `);
    const type = file.modules[0].declarations[0] as ast.TypeDeclaration;
    const element = resolver.visitTypeDeclaration(type);
    expect(element.name).toEqual('Foo');
    expect(element.element).toBe(element);
  });
});
