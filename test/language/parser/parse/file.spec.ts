import { tokenize } from '../../../../src/language/lexer';
import {
  ClutchParser,
  FileRoot,
  PrintTreeVisitor,
} from '../../../../src/language/parser';

describe('ClutchParser should parse statement', () => {
  function parseFile(file: string): FileRoot {
    const tokens = tokenize(file);
    return new ClutchParser(tokens).parseFileRoot();
  }

  it('should parse a basic program', () => {
    const file = parseFile(`
      main -> print('Hello World')
    `);
    expect(file.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
  });

  it('should parse a basic program with a function with parameters', () => {
    const file = parseFile(`
      fib(n) -> if n <= 2 then fib(n - 1) else fib(n - 2)
    `);
    expect(file.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
  });

  it('should parse a basic program with a constexpr function with parameters', () => {
    const file = parseFile(`
      const fib(n) -> if n <= 2 then fib(n - 1) else fib(n - 2)
    `);
    expect(file.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
  });

  it('should parse a basic program with a function with statements', () => {
    const file = parseFile(`
      main -> {
        let message = 'Hello'
        print(message)
        return message
      }
    `);
    expect(file.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
  });
});
