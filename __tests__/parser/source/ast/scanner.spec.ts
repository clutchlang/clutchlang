// tslint:disable:no-magic-numbers

import { TokenScanner } from '../../../../src/parser/source/ast/scanner';
import {
  RegExpToken,
  StringToken,
  SymbolToken,
  Token,
} from '../../../../src/parser/source/tokenizer/tokens';
import { token } from '../common';

describe(`${TokenScanner}`, () => {
  it('should peek a token', () => {
    const scanner = new TokenScanner([
      new Token(RegExpToken.Identifier, 0, 'main'),
    ]);
    expect(scanner.position).toBe(0);
    expect(scanner.peek()).toMatchObject(token(RegExpToken.Identifier, 'main'));
    expect(scanner.position).toBe(0);
  });

  it('should read tokens', () => {
    const scanner = new TokenScanner([
      new Token(RegExpToken.Identifier, 0, 'main'),
      new Token(StringToken.Arrow, 0, '=>'),
    ]);
    expect(scanner.position).toBe(0);
    expect(scanner.read()).toMatchObject(token(RegExpToken.Identifier, 'main'));
    expect(scanner.lastMatch).toMatchObject([
      token(RegExpToken.Identifier, 'main'),
    ]);
    expect(scanner.position).toBe(1);
    expect(scanner.read()).toMatchObject(token(StringToken.Arrow));
    expect(scanner.lastMatch).toMatchObject([token(StringToken.Arrow)]);
    expect(scanner.position).toBe(2);
  });

  it('should scan 1 token', () => {
    const scanner = new TokenScanner([
      new Token(RegExpToken.Identifier, 0, 'main'),
      new Token(StringToken.Arrow, 0, '=>'),
    ]);
    expect(scanner.position).toBe(0);
    expect(scanner.scan(RegExpToken.Identifier)).toBe(true);
    expect(scanner.position).toBe(1);
    expect(scanner.lastMatch).toMatchObject([
      token(RegExpToken.Identifier, 'main'),
    ]);
    expect(scanner.isDone).toBe(false);
  });

  it('should scan 2 tokens', () => {
    const scanner = new TokenScanner([
      new Token(RegExpToken.Identifier, 0, 'main'),
      new Token(StringToken.Arrow, 0, '=>'),
    ]);
    expect(scanner.position).toBe(0);
    expect(scanner.scan(RegExpToken.Identifier, StringToken.Arrow)).toBe(true);
    expect(scanner.position).toBe(2);
    expect(scanner.lastMatch).toMatchObject([
      token(RegExpToken.Identifier, 'main'),
      token(StringToken.Arrow),
    ]);
    expect(scanner.isDone).toBe(true);
  });

  it('should not scan 2 tokens', () => {
    const scanner = new TokenScanner([
      new Token(RegExpToken.Identifier, 0, 'main'),
      new Token(StringToken.Arrow, 0, '=>'),
    ]);
    expect(scanner.position).toBe(0);
    expect(scanner.scan(RegExpToken.Identifier, SymbolToken.LCurly)).toBe(
      false
    );
    expect(scanner.position).toBe(0);
    expect(scanner.lastMatch).toHaveLength(0);
    expect(scanner.isDone).toBe(false);
  });
});
