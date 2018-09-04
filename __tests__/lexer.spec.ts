import { Token } from 'moo';
import { lexer } from '../src/parser';

function tokenize(program: string): Token[] {
  lexer.reset(program);
  const results: Token[] = [];
  for (const token of lexer) {
    results.push(token);
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
