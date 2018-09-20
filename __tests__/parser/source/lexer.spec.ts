import { Lexer } from '../../../src/parser/source/lexer';
import { SourceScanner } from '../../../src/parser/source/scanner';
import {
  RegExpToken,
  StringToken,
  SymbolToken,
  TokenKind,
} from '../../../src/parser/source/tokens';

function token(
  kind: SymbolToken | StringToken
): {
  kind: TokenKind;
  value: string;
};
function token(
  kind: RegExpToken,
  value: string
): {
  kind: TokenKind;
  value: string;
};
function token(
  kind: TokenKind,
  value?: string
): {
  kind: TokenKind;
  value: string;
} {
  return {
    kind,
    value: value || kind.name,
  };
}

it('should lex an empty program', () => {
  const scanner = new SourceScanner(`
    main => {}
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    token(RegExpToken.Identifier, 'main'),
    token(StringToken.Arrow),
    token(SymbolToken.LCurly),
    token(SymbolToken.RCurly),
  ]);
});

it('should lex a simple program', () => {
  const scanner = new SourceScanner(`
    main => {
      print('Hello World')
    }
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    token(RegExpToken.Identifier, 'main'),
    token(StringToken.Arrow),
    token(SymbolToken.LCurly),
    token(RegExpToken.Identifier, 'print'),
    token(SymbolToken.LParen),
    token(RegExpToken.LiteralString, "'Hello World'"),
    token(SymbolToken.RParen),
    token(SymbolToken.RCurly),
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
        token(RegExpToken.Identifier, 'returnsFalse'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralBoolean, 'false'),
      ]);
    });

    it('true', () => {
      const scanner = new SourceScanner(`
        returnsTrue => true
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        token(RegExpToken.Identifier, 'returnsTrue'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralBoolean, 'true'),
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
        token(RegExpToken.Identifier, 'returns1'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralNumber, '1'),
      ]);
    });

    it('-1', () => {
      const scanner = new SourceScanner(`
        returnsN1 => -1
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        token(RegExpToken.Identifier, 'returnsN1'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralNumber, '-1'),
      ]);
    });

    it('1.0', () => {
      const scanner = new SourceScanner(`
        returns1Dot0 => 1.0
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        token(RegExpToken.Identifier, 'returns1Dot0'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralNumber, '1.0'),
      ]);
    });

    it('-1.0', () => {
      const scanner = new SourceScanner(`
        returnsN1Dot0 => -1.0
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        token(RegExpToken.Identifier, 'returnsN1Dot0'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralNumber, '-1.0'),
      ]);
    });

    it('0xDEADBEEF', () => {
      const scanner = new SourceScanner(`
        returnsDeadBeef => 0xDEADBEEF
      `);
      const lexer = new Lexer(scanner);
      expect(Array.from(lexer)).toMatchObject([
        token(RegExpToken.Identifier, 'returnsDeadBeef'),
        token(StringToken.Arrow),
        token(RegExpToken.LiteralNumber, '0xDEADBEEF'),
      ]);
    });
  });

  it('string', () => {
    const scanner = new SourceScanner(`
      returnsHello => 'Hello'
    `);
    const lexer = new Lexer(scanner);
    expect(Array.from(lexer)).toMatchObject([
      token(RegExpToken.Identifier, 'returnsHello'),
      token(StringToken.Arrow),
      token(RegExpToken.LiteralString, "'Hello'"),
    ]);
  });
});

it('should lex a function returning an identifier', () => {
  const scanner = new SourceScanner(`
    returnsName => name
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    token(RegExpToken.Identifier, 'returnsName'),
    token(StringToken.Arrow),
    token(RegExpToken.Identifier, 'name'),
  ]);
});

it('should lex a function returning a paranethesized expression', () => {
  const scanner = new SourceScanner(`
    returns1P => (1)
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    token(RegExpToken.Identifier, 'returns1P'),
    token(StringToken.Arrow),
    token(SymbolToken.LParen),
    token(RegExpToken.LiteralNumber, '1'),
    token(SymbolToken.RParen),
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
      0xAABBCC
      'Hello'
    }
  `);
  const lexer = new Lexer(scanner);
  expect(Array.from(lexer)).toMatchObject([
    token(RegExpToken.Identifier, 'expressionBlock'),
    token(StringToken.Arrow),
    token(SymbolToken.LCurly),
    token(RegExpToken.LiteralBoolean, 'true'),
    token(RegExpToken.LiteralBoolean, 'false'),
    token(RegExpToken.LiteralNumber, '1'),
    token(RegExpToken.LiteralNumber, '1.0'),
    token(RegExpToken.LiteralNumber, '-1'),
    token(RegExpToken.LiteralNumber, '-1.0'),
    token(RegExpToken.LiteralNumber, '0xAABBCC'),
    token(RegExpToken.LiteralString, "'Hello'"),
    token(SymbolToken.RCurly),
  ]);
});

describe('should catch lexing errors', () => {
  it('expected identifier', () => {
    const scanner = new SourceScanner('$ => {}');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('invalid identifier (keyword: true)', () => {
    const scanner = new SourceScanner('true => true');
    const lexer = new Lexer(scanner);
    expect(() => Array.from(lexer)).toThrowError(SyntaxError);
  });

  it('invalid identifier (keyword: false)', () => {
    const scanner = new SourceScanner('false => false');
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