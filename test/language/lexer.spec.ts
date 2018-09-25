import { ClutchLexer, tokenize, TokenKind } from '../../src/language/lexer';

/**
 * Tokenizes @param program as simple JS objects for testing.
 */
function tokenizeKinds(program: string): TokenKind[] {
  return tokenize(program).map(t => t.kind);
}

describe('tokenize', () => {
  it('should scan an empty file', () => {
    expect(tokenizeKinds('')).toEqual([TokenKind.EOF]);
  });

  it('should scan a file of completely whitespace', () => {
    expect(tokenizeKinds('  \n  \n\r  \r  ')).toEqual([TokenKind.EOF]);
  });

  it('should scan parentheses', () => {
    expect(
      tokenizeKinds(`
      (
        (
          ()
        )
      )
    `)
    ).toEqual([
      TokenKind.LEFT_PAREN,
      TokenKind.LEFT_PAREN,
      TokenKind.LEFT_PAREN,
      TokenKind.RIGHT_PAREN,
      TokenKind.RIGHT_PAREN,
      TokenKind.RIGHT_PAREN,
      TokenKind.EOF,
    ]);
  });

  it('should scan curlies', () => {
    expect(
      tokenizeKinds(`
      {
        {
          {}
        }
      }
    `)
    ).toEqual([
      TokenKind.LEFT_CURLY,
      TokenKind.LEFT_CURLY,
      TokenKind.LEFT_CURLY,
      TokenKind.RIGHT_CURLY,
      TokenKind.RIGHT_CURLY,
      TokenKind.RIGHT_CURLY,
      TokenKind.EOF,
    ]);
  });

  it('should scan operators', () => {
    expect(
      tokenizeKinds(`
      .
      +
      -
      *
      =
      ->
      ==
      ===
      >
      >=
      <
      <=
      /
    `)
    ).toEqual([
      TokenKind.PERIOD,
      TokenKind.PLUS,
      TokenKind.MINUS,
      TokenKind.STAR,
      TokenKind.ASSIGNMENT,
      TokenKind.ARROW,
      TokenKind.EQUALITY,
      TokenKind.IDENTITY,
      TokenKind.GREATER_THAN,
      TokenKind.GREATER_THAN_OR_EQUAL,
      TokenKind.LESS_THAN,
      TokenKind.LESS_THAN_OR_EQUAL,
      TokenKind.SLASH,
      TokenKind.EOF,
    ]);
  });

  it('should scan all valid number literals', () => {
    expect(
      tokenize(`
      0
      1
      1.5
      -1
      -1.5
      3.14
      31.4
      0xAAA
      0XAAA
      0xaaa
      0Xaaa
      0x123
      0X123
      2e123
    `).map(t => [t.kind, t.lexeme])
    ).toEqual([
      [TokenKind.NUMBER, '0'],
      [TokenKind.NUMBER, '1'],
      [TokenKind.NUMBER, '1.5'],
      [TokenKind.NUMBER, '-1'],
      [TokenKind.NUMBER, '-1.5'],
      [TokenKind.NUMBER, '3.14'],
      [TokenKind.NUMBER, '31.4'],
      [TokenKind.NUMBER, '0xAAA'],
      [TokenKind.NUMBER, '0XAAA'],
      [TokenKind.NUMBER, '0xaaa'],
      [TokenKind.NUMBER, '0Xaaa'],
      [TokenKind.NUMBER, '0x123'],
      [TokenKind.NUMBER, '0X123'],
      [TokenKind.NUMBER, '2e123'],
      [TokenKind.EOF, ''],
    ]);
  });

  it('should scan strings', () => {
    expect(
      tokenize(`
      'Hello'
      'Hello World'
      'Hello
        World
          !'
    `).map(t => t.lexeme)
    ).toEqual([
      'Hello',
      'Hello World',
      'Hello\n        World\n          !',
      '',
    ]);
  });

  it('should scan strings without a terminator', () => {
    expect(() => tokenize("'Hello")).toThrowError(SyntaxError);
  });

  it('should scan an invalid character', () => {
    expect(() => tokenize('5 $ 2')).toThrowError(SyntaxError);
  });

  it('should scan strings with error recovery', () => {
    expect(
      tokenize("'Hello", (_, __) => {
        /* Intentional */
      }).map(t => t.lexeme)
    ).toEqual(['Hello', '']);
  });

  it('should scan comments', () => {
    expect(
      tokenize(`
      // One A
      // One B
      1
      2 // Two
      3
      // Three
    `).map(t => {
        return [t.kind, t.comments.map(c => c.lexeme)];
      })
    ).toEqual([
      [TokenKind.NUMBER, ['// One A', '// One B']],
      [TokenKind.NUMBER, []],
      [TokenKind.NUMBER, ['// Two']],
      [TokenKind.EOF, ['// Three']],
    ]);
  });

  it('should scan comments with DOS-style line endings', () => {
    expect(
      tokenize(`a // A\n\rb // B\rc // C\n`).map(t => {
        return [t.kind, t.comments.map(c => c.lexeme)];
      })
    ).toEqual([
      [TokenKind.IDENTIFIER, []],
      [TokenKind.IDENTIFIER, ['// A']],
      [TokenKind.IDENTIFIER, ['// B']],
      [TokenKind.EOF, ['// C']],
    ]);
  });

  it('should scan identifiers', () => {
    expect(
      tokenize(`
      arg1
      fooBar
      x_thing
    `).map(t => t.lexeme)
    ).toEqual(['arg1', 'fooBar', 'x_thing', '']);
  });

  it('should scan all valid keywords', () => {
    expect(
      tokenizeKinds(`
    ${Object.keys(ClutchLexer.keywords).join('  \n')}
    `)
    ).toEqual(Object.values(ClutchLexer.keywords).concat(TokenKind.EOF));
  });
});
