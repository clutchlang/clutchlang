import { splitLines, unescapeString } from '../agnostic/strings';
import { IToken } from './lexer';

export class AstNodeFactory {
  public createSimpleName(token: IToken): SimpleName {
    return new SimpleName(token, token.lexeme);
  }

  public createLiteralBoolean(token: IToken): LiteralBoolean {
    return new LiteralBoolean(token, token.lexeme === 'true');
  }

  public createLiteralNumber(token: IToken): LiteralNumber {
    return new LiteralNumber(token, this.parseLiteralNumberValue(token.lexeme));
  }

  public createLiteralString(token: IToken): LiteralString {
    return new LiteralString(token, this.parseLiteralStringValue(token.lexeme));
  }

  protected parseLiteralNumberValue(lexeme: string) {
    return /^0(x|X)/.test(lexeme) ? parseInt(lexeme, 16) : parseFloat(lexeme);
  }

  protected parseLiteralStringValue(lexeme: string): string {
    const lines = splitLines(lexeme);
    if (lines.length === 0) {
      return '';
    }
    if (lines.length === 1) {
      return unescapeString(lines[0]);
    }
    const buffer: string[] = [];
    let l = 1;
    let line = unescapeString(lines[l]);
    const baseline = line.length - line.trimLeft().length;
    l--;
    while (l++ < lines.length - 1) {
      line = unescapeString(lines[l]);
      buffer.push(line.substring(baseline));
    }
    return buffer.join('\n');
  }
}

/**
 * Base class for anything in the syntax tree.
 */
export abstract class AstNode {
  /**
   * The first token that was scanned to form this node.
   */
  public abstract get firstToken(): IToken;

  /**
   * The last token that was scanned to form this node.
   */
  public abstract get lastToken(): IToken;
}

/**
 * An AST node that was formed from a single @interface IToken.
 */
export abstract class SimpleNode extends AstNode {
  constructor(private readonly token: IToken) {
    super();
  }

  public get firstToken() {
    return this.token;
  }

  public get lastToken() {
    return this.token;
  }
}

/**
 * A literal boolean compatible with JavaScript.
 */
export class LiteralBoolean extends SimpleNode {
  constructor(token: IToken, public readonly value: boolean) {
    super(token);
  }
}

/**
 * A literal number compatible with JavaScript.
 */
export class LiteralNumber extends SimpleNode {
  constructor(token: IToken, public readonly value: number) {
    super(token);
  }
}

/**
 * A literal string compatible with JavaScript.
 *
 * Strings in Clutch are supported single and multi-line. A multi-line string
 * automatically has baseline indentation normalization. For example, the
 * following:
 * ```
 * let x = '
 *   Hello
 *     World!
 * '
 * ```
 *
 * ... is identical to:
 * ```
 * 'Hello\n  World!'
 * ```
 */
export class LiteralString extends SimpleNode {
  constructor(token: IToken, public readonly value: string) {
    super(token);
  }
}

/**
 * Represents a reference to some identifier by name.
 */
export class SimpleName extends SimpleNode {
  constructor(token: IToken, public readonly name: string) {
    super(token);
  }
}
