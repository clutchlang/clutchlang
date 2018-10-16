import { Operator } from '../../src/language/parser';
import { CORE_MODULE } from '../../src/language/typesystem/core';
import { ConcreteType } from '../../src/language/typesystem/type';

describe('CORE_MODULE', () => {
  it('has a Number type', () => {
    expect(CORE_MODULE.resolveType('Number')).toBeDefined();
  });

  it('has a Boolean type', () => {
    expect(CORE_MODULE.resolveType('Boolean')).toBeDefined();
  });

  it('has a String type', () => {
    expect(CORE_MODULE.resolveType('String')).toBeDefined();
  });

  it('has a print statement', () => {
    expect(CORE_MODULE.resolveType('print')).toBeDefined();
  });

  it('has basic math methods on Number', () => {
    const NUMBER_TYPE = CORE_MODULE.resolveType('Number')! as ConcreteType;
    expect(NUMBER_TYPE.resolveMethod(Operator.Addition.name)).toBeDefined();
  });
});
