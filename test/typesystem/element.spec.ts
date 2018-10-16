import { CORE_MODULE } from '../../src/language/typesystem/core';
import { ModuleDeclarationElement } from '../../src/language/typesystem/element';
import { ConcreteType, FunctionType } from '../../src/language/typesystem/type';

const STRING_TYPE = CORE_MODULE.resolveType('String')!;
const NUMBER_TYPE = CORE_MODULE.resolveType('Number')!;

describe('element tree', () => {
  it('can be (de)serialized from json', () => {
    const raw = {
      functions: [
        {
          isConst: false,
          name: 'B',
          type: { parameterTypes: [], returnType: 'Number' },
        },
      ],
      imports: [],
      name: 'test',
      types: [
        {
          methods: [
            {
              isConst: false,
              name: 'bar',
              type: { parameterTypes: ['Boolean'], returnType: '()' },
            },
          ],
          name: 'A',
        },
      ],
      variables: [{ name: 'C', type: 'String', isConst: false }],
    };
    const mod = ModuleDeclarationElement.fromJSON(raw);
    mod.imports.push(CORE_MODULE);

    expect(mod.resolveType('C')!.isAssignableTo(STRING_TYPE)).toBe(true);
    expect(
      mod.resolveType('B')!.isAssignableTo(new FunctionType([], NUMBER_TYPE))
    ).toBe(true);
    expect(mod.resolveType('A')).toBeInstanceOf(ConcreteType);

    expect(mod.variables[0].toJSON()).toMatchObject({
      isConst: false,
      name: 'C',
      type: 'String',
    });
    expect(mod.functions[0].toJSON()).toMatchObject({
      isConst: false,
      name: 'B',
      type: { parameterTypes: [], returnType: 'Number' },
    });
    expect(mod.types[0].toJSON()).toMatchObject({
      methods: [
        {
          isConst: false,
          name: 'bar',
          type: { parameterTypes: ['Boolean'], returnType: '()' },
        },
      ],
      name: 'A',
    });
    expect(mod.toJSON()).toMatchObject({
      imports: ['core'],
      name: 'test',
    });
  });
});
