import { Lexer, Scanner, Token, Tokens } from '../src/parser';

it('should lex a simple program', () => {
  const scanner = new Scanner(`
    main => {}
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    new Token(Tokens.Identifier, 'main'),
    new Token(Tokens.Arrow, '=>'),
    new Token(Tokens.LCurly, '{'),
    new Token(Tokens.RCurly, '}'),
  ]);
});

describe('should catch lexing errors', () => {
  it('expected identifier', () => {
    const scanner = new Scanner('$ => {}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected =>', () => {
    const scanner = new Scanner('main $ {}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected {', () => {
    const scanner = new Scanner('main => $}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected }', () => {
    const scanner = new Scanner('main => {$');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected } after new line', () => {
    const scanner = new Scanner('main => {\n$\n$');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });
});
