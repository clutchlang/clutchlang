import { Lexer, Token, Tokens } from '../src/parser';
import { SourceScanner } from '../src/parser/source/scanner';

it('should lex a simple program', () => {
  const scanner = new SourceScanner(`
    main => {
      print('Hello World')
    }
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    new Token(Tokens.Identifier, 'main'),
    new Token(Tokens.Arrow, '=>'),
    new Token(Tokens.LCurly, '{'),
    new Token(Tokens.Identifier, 'print'),
    new Token(Tokens.LParen, '('),
    new Token(Tokens.String, "'Hello World'"),
    new Token(Tokens.RParen, ')'),
    new Token(Tokens.RCurly, '}'),
  ]);
});

describe('should lex a function returning a literal', () => {
  describe('boolean', () => {
    it('false', () => {
      const scanner = new SourceScanner(`
        returnsFalse => false
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returnsFalse'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Boolean, 'false'),
      ]);
    });

    it('true', () => {
      const scanner = new SourceScanner(`
        returnsTrue => true
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returnsTrue'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Boolean, 'true'),
      ]);
    });
  });

  describe('number', () => {
    it('1', () => {
      const scanner = new SourceScanner(`
        returns1 => 1
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returns1'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Number, '1'),
      ]);
    });

    it('-1', () => {
      const scanner = new SourceScanner(`
        returnsN1 => -1
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returnsN1'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Number, '-1'),
      ]);
    });

    it('1.0', () => {
      const scanner = new SourceScanner(`
        returns1DotO => 1.0
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returns1DotO'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Number, '1.0'),
      ]);
    });

    it('-1.0', () => {
      const scanner = new SourceScanner(`
        returnsN1DotO => -1.0
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returnsN1DotO'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Number, '-1.0'),
      ]);
    });

    it('0xDEADBEEF', () => {
      const scanner = new SourceScanner(`
        returnsDeadBeef => 0xDEADBEEF
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        new Token(Tokens.Identifier, 'returnsDeadBeef'),
        new Token(Tokens.Arrow, '=>'),
        new Token(Tokens.Number, '0xDEADBEEF'),
      ]);
    });
  });

  it('string', () => {
    const scanner = new SourceScanner(`
      returnsHello => 'Hello'
    `);
    const lexer = new Lexer(scanner);
    expect(Array.from(lexer)).toMatchObject([
      new Token(Tokens.Identifier, 'returnsHello'),
      new Token(Tokens.Arrow, '=>'),
      new Token(Tokens.String, "'Hello'"),
    ]);
  });
});

it('should lex a function returning an identifier', () => {
  const scanner = new SourceScanner(`
    returnsName => name
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    new Token(Tokens.Identifier, 'returnsName'),
    new Token(Tokens.Arrow, '=>'),
    new Token(Tokens.Identifier, 'name'),
  ]);
});

it('should lex a function returning a paranethesized expression', () => {
  const scanner = new SourceScanner(`
    returns1P => (1)
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    new Token(Tokens.Identifier, 'returns1P'),
    new Token(Tokens.Arrow, '=>'),
    new Token(Tokens.LParen, '('),
    new Token(Tokens.Number, '1'),
    new Token(Tokens.RParen, ')'),
  ]);
});

it('should lex a function with an expression block', () => {
  const scanner = new SourceScanner(`
    expressionBlock => {
      true
      false
      1
      1.0
      -1
      -1.0
      'Hello'
    }
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    new Token(Tokens.Identifier, 'expressionBlock'),
    new Token(Tokens.Arrow, '=>'),
    new Token(Tokens.LCurly, '{'),
    new Token(Tokens.Boolean, 'true'),
    new Token(Tokens.Boolean, 'false'),
    new Token(Tokens.Number, '1'),
    new Token(Tokens.Number, '1.0'),
    new Token(Tokens.Number, '-1'),
    new Token(Tokens.Number, '-1.0'),
    new Token(Tokens.String, "'Hello'"),
    new Token(Tokens.RCurly, '}'),
  ]);
});

describe('should catch lexing errors', () => {
  it('expected identifier', () => {
    const scanner = new SourceScanner('$ => {}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected =>', () => {
    const scanner = new SourceScanner('main $ {}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected {', () => {
    const scanner = new SourceScanner('main => $}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected }', () => {
    const scanner = new SourceScanner('main => {$');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('expected } after new line', () => {
    const scanner = new SourceScanner('main => {\n$\n$');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });
});
