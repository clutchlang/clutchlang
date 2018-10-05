// tslint:disable:no-magic-numbers
import { tokenize } from '../../src/language/lexer';

describe('keywords', () => {
  [
    'const',
    'else',
    'false',
    'if',
    'let',
    'return',
    'then',
    'true',
    'type',
  ].forEach(k => {
    it(`should tokenize "${k}"`, () => {
      const result = tokenize(k);
      expect(result).toHaveLength(2);

      const keyword = result[0];
      expect(keyword.comments).toHaveLength(0);
      expect(keyword.type.kind).toEqual('keyword');
      expect(keyword.lexeme).toEqual(k);
      expect(keyword.offset).toEqual(0);

      const endOfFile = result[1];
      expect(endOfFile.comments).toHaveLength(0);
      expect(endOfFile.type.kind).toEqual('marker');
    });
  });
});
