import { lexer } from '../src/parser';
import { IToken } from '../src/parser/scanner';

function tokenize(program: string): IToken[] {
  lexer.reset(program);
  const results: IToken[] = [];
  for (const token of lexer) {
    results.push(token as IToken);
  }
  return results;
}

test('should tokenize a variable assignment', () => {
  expect(tokenize("let name = 'Matan'")).toMatchSnapshot();
});

test('should tokenize invocation', () => {
  expect(tokenize('cat.meow()')).toMatchSnapshot();
});

test('should tokenize a blank program', () => {
  expect(tokenize('main => {}')).toMatchSnapshot();
});

test('should tokenize two top-level functions', () => {
  expect(tokenize('one => 1\ntwo => 2')).toMatchSnapshot();
});

test('should tokenize a function that returns true', () => {
  expect(tokenize('check => true')).toMatchSnapshot();
});

test('should tokenize a function with parameters and a return type', () => {
  expect(
    tokenize('capitalize (word: string) => string { return word }')
  ).toMatchSnapshot();
});
