import {
  RegExpToken,
  StringToken,
  SymbolToken,
  TokenKind,
} from '../../../src/parser/source/tokenizer/tokens';

export function token(
  kind: SymbolToken | StringToken
): {
  kind: TokenKind;
  value: string;
};
export function token(
  kind: RegExpToken,
  value: string
): {
  kind: TokenKind;
  value: string;
};
export function token(
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
