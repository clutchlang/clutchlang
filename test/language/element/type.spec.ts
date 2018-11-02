import { BuiltInType, ExternalType } from '../../../src/language/element/type';

test('should support exactness for built-ins', () => {
  expect(BuiltInType.Nothing.isExact(BuiltInType.Nothing)).toEqual(true);
  expect(BuiltInType.Nothing.isExact(BuiltInType.Something)).toEqual(false);
  expect(BuiltInType.Something.isExact(BuiltInType.Nothing)).toEqual(false);
});

test('should support exactness for external types', () => {
  expect(ExternalType.Boolean.isExact(ExternalType.Boolean)).toEqual(true);
  expect(ExternalType.Number.isExact(ExternalType.Number)).toEqual(true);
  expect(ExternalType.String.isExact(ExternalType.String)).toEqual(true);
});
