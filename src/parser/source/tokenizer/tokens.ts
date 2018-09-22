import { Characters } from './characters';
import { SourceSpan } from './scanner';

export class Token {
  public readonly value: string;

  constructor(
    public readonly kind: TokenKind,
    public readonly span: SourceSpan,
    value: string
  ) {
    this.value = value;
  }
}

export type TokenKind = SymbolToken | StringToken | RegExpToken;

export class SymbolToken {
  public static readonly LCurly = new SymbolToken(Characters.LCurly);
  public static readonly RCurly = new SymbolToken(Characters.RCurly);
  public static readonly LParen = new SymbolToken(Characters.LParen);
  public static readonly RParen = new SymbolToken(Characters.RParen);

  public readonly kind = 'Symbol';

  private constructor(public readonly pattern: Characters) {}

  public get name() {
    return String.fromCharCode(this.pattern);
  }
}

export class StringToken {
  public static readonly Arrow = new StringToken('=>');

  public readonly kind = 'String';

  private constructor(public readonly pattern: string) {}

  public get name() {
    return this.pattern;
  }
}

export class RegExpToken {
  public static readonly Identifier = new RegExpToken(
    /[_a-zA-Z][_a-zA-Z0-9]{0,30}/,
    'Identifier'
  );
  public static readonly LiteralBoolean = new RegExpToken(
    /(true|false)/,
    'Boolean'
  );
  public static readonly LiteralNumber = new RegExpToken(
    /((0[xX][0-9a-fA-F]+)|(-?\d+\.?\d*))/,
    'Number'
  );
  public static readonly LiteralString = new RegExpToken(
    /(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/,
    'String'
  );

  public readonly kind = 'RegExp';

  private constructor(
    public readonly pattern: RegExp,
    public readonly name: string
  ) {}
}
