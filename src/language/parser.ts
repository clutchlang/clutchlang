import { splitLines, unescapeString } from '../agnostic/strings';
import { IToken } from './lexer';

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
  public readonly value: boolean;

  constructor(token: IToken) {
    super(token);
    this.value = token.lexeme === 'true';
  }
}

/**
 * A literal number compatible with JavaScript.
 */
export class LiteralNumber extends SimpleNode {
  public readonly value: number;

  constructor(token: IToken) {
    super(token);
    this.value = /^0(x|X)/.test(token.lexeme)
      ? parseInt(token.lexeme, 16)
      : parseFloat(token.lexeme);
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
  private static parseString(raw: string): string {
    const lines = splitLines(raw);
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

  public readonly value: string;

  constructor(token: IToken) {
    super(token);
    this.value = LiteralString.parseString(token.lexeme);
  }
}

/**
 * Represents a reference to some identifier by name.
 */
export class SimpleName extends SimpleNode {
  public readonly name: string;

  constructor(token: IToken) {
    super(token);
    this.name = token.lexeme;
  }
}
