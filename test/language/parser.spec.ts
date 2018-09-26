// tslint:disable:no-magic-numbers

import { TokenKind } from '../../src/language/lexer';
import {
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  SimpleName,
} from '../../src/language/parser';

describe('LiteralBoolean', () => {
  it('should evaluate true', () => {
    const token = {
      comments: [],
      kind: TokenKind.TRUE,
      lexeme: 'true',
      offset: 0,
    };
    const $true = new LiteralBoolean(token);
    expect($true.firstToken).toBe(token);
    expect($true.lastToken).toBe(token);
    expect($true.value).toBe(true);
  });

  it('should evaluate false', () => {
    const token = {
      comments: [],
      kind: TokenKind.TRUE,
      lexeme: 'false',
      offset: 0,
    };
    const $true = new LiteralBoolean(token);
    expect($true.firstToken).toBe(token);
    expect($true.lastToken).toBe(token);
    expect($true.value).toBe(false);
  });
});

describe('LiteralNumber', () => {
  it('should evaluate int', () => {
    const token = {
      comments: [],
      kind: TokenKind.NUMBER,
      lexeme: '1',
      offset: 0,
    };
    const $1 = new LiteralNumber(token);
    expect($1.firstToken).toBe(token);
    expect($1.lastToken).toBe(token);
    expect($1.value).toBe(1);
  });

  it('should evaluate float', () => {
    const token = {
      comments: [],
      kind: TokenKind.NUMBER,
      lexeme: '1.5',
      offset: 0,
    };
    const $1 = new LiteralNumber(token);
    expect($1.firstToken).toBe(token);
    expect($1.lastToken).toBe(token);
    expect($1.value).toBe(1.5);
  });

  it('should evaluate hex', () => {
    const token = {
      comments: [],
      kind: TokenKind.NUMBER,
      lexeme: '0xFFF',
      offset: 0,
    };
    const $0xFFF = new LiteralNumber(token);
    expect($0xFFF.firstToken).toBe(token);
    expect($0xFFF.lastToken).toBe(token);
    expect($0xFFF.value).toBe(0xfff);
  });

  it('should evaluate exponential', () => {
    const token = {
      comments: [],
      kind: TokenKind.NUMBER,
      lexeme: '2e6',
      offset: 0,
    };
    const $2e6 = new LiteralNumber(token);
    expect($2e6.firstToken).toBe(token);
    expect($2e6.lastToken).toBe(token);
    expect($2e6.value).toBe(2e6);
  });
});

describe('LiteralString', () => {
  it('should evaluate an empty string', () => {
    const token = {
      comments: [],
      kind: TokenKind.STRING,
      lexeme: '',
      offset: 0,
    };
    const empty = new LiteralString(token);
    expect(empty.firstToken).toBe(token);
    expect(empty.lastToken).toBe(token);
    expect(empty.value).toBe('');
  });

  it('should evaluate a single-line string', () => {
    const token = {
      comments: [],
      kind: TokenKind.STRING,
      lexeme: 'Hello',
      offset: 0,
    };
    const empty = new LiteralString(token);
    expect(empty.firstToken).toBe(token);
    expect(empty.lastToken).toBe(token);
    expect(empty.value).toBe('Hello');
  });

  it('should evaluate a single-line string with escaped newlines', () => {
    const token = {
      comments: [],
      kind: TokenKind.STRING,
      lexeme: String.raw`Hello\nWorld`,
      offset: 0,
    };
    const empty = new LiteralString(token);
    expect(empty.firstToken).toBe(token);
    expect(empty.lastToken).toBe(token);
    expect(empty.value).toBe('Hello\nWorld');
  });

  it('should evaluate a multi-line string', () => {
    const token = {
      comments: [],
      kind: TokenKind.STRING,
      lexeme: `
        <html>
          <body></body>
        </html>
      `,
      offset: 0,
    };
    const empty = new LiteralString(token);
    expect(empty.firstToken).toBe(token);
    expect(empty.lastToken).toBe(token);
    expect(empty.value).toBe('<html>\n  <body></body>\n</html>\n');
  });
});

it('SimpleName should implement AstNode', () => {
  const token = {
    comments: [],
    kind: TokenKind.IDENTIFIER,
    lexeme: 'fooBar',
    offset: 0,
  };
  const fooBar = new SimpleName(token);
  expect(fooBar.firstToken).toBe(token);
  expect(fooBar.lastToken).toBe(token);
  expect(fooBar.name).toBe('fooBar');
});
