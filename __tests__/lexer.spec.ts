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

test('should tokenize a simple program', () => {
  lexer.reset('main => {\n' + '}\n');
  expect(tokenize('main => {}')).toMatchSnapshot();
});
