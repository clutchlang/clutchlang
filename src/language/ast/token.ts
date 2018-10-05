/**
 * Represents a scanned token during the lexing phase.
 */
export class Token {
  /**
   * Create a new token.
   *
   * @param offset Offset from the beginning of the file to the first character.
   * @param type Type of the token.
   * @param comments Precedencing comments before the token.
   * @param lexeme Lexeme representing this token.
   */
  constructor(
    public readonly offset: number,
    public readonly type: ITokenTypes,
    public readonly comments: Token[],
    public readonly lexeme: string
  ) {}

  /**
   * Offset from the beginning of the file to the last character here.
   */
  public get end(): number {
    return this.offset + this.length;
  }

  /**
   * Length of the @member lexeme.
   */
  public get length(): number {
    return this.lexeme.length;
  }

  /**
   * Whether this is an end-of-file token.
   */
  public get isEndOfFile(): boolean {
    return this.type.kind === 'marker' && this.type.name === '<EOF>';
  }

  /**
   * Whether this is an identifier token.
   */
  public get isIdentifier(): boolean {
    return (
      this.isLiteral && (this.type as ILiteralTokenType).name === 'Identifier'
    );
  }

  /**
   * Whether this is a keyword token.
   */
  public get isKeyword(): boolean {
    return this.type.kind === 'keyword';
  }

  /**
   * Whether this is a literal token.
   */
  public get isLiteral(): boolean {
    return this.type.kind === 'literal';
  }

  /**
   * Whether this is an operator token.
   */
  public get isOperator(): boolean {
    return this.type.kind === 'operator';
  }
}

/**
 * Union of all known @see ITokenType.
 */
export type ITokenTypes =
  | ILiteralTokenType
  | IKeywordTokenType
  | IMarkerTokenType
  | IOperatorTokenType
  | IPairTokenType
  | ISymbolTokenType;

/**
 * Base token type for all token types.
 */
export interface ITokenType {
  readonly kind:
    | 'comment'
    | 'literal'
    | 'keyword'
    | 'marker'
    | 'operator'
    | 'pair'
    | 'symbol';
}

/**
 * Token type for literals to be parsed from user input.
 *
 * This encapsulates names (identifiers), strings, and numbers.
 */
export interface ILiteralTokenType extends ITokenType {
  readonly kind: 'literal';
  readonly name: 'Comment' | 'Identifier' | 'String' | 'Number';
}

/**
 * Token type for keywords.
 */
export interface IKeywordTokenType extends ITokenType {
  readonly kind: 'keyword';
  readonly lexeme:
    | 'const'
    | 'else'
    | 'external'
    | 'false'
    | 'if'
    | 'let'
    | 'return'
    | 'then'
    | 'true'
    | 'type';
}

/**
 * Token type for a marker (no lexeme of any kind).
 */
export interface IMarkerTokenType extends ITokenType {
  readonly kind: 'marker';
  readonly name: '<EOF>';
}

/**
 * Token type for operators.
 */
export interface IOperatorTokenType extends ITokenType {
  readonly kind: 'operator';
  readonly lexeme:
    | '.'
    | '+'
    | '-'
    | '*'
    | '/'
    | '%'
    | '='
    | '+='
    | '-='
    | '*='
    | '/='
    | '%='
    | '=='
    | '!='
    | '==='
    | '!=='
    | '>'
    | '>='
    | '<'
    | '<='
    | '|'
    | '||'
    | '&'
    | '&&'
    | '^'
    | '!'
    | '~'
    | '++'
    | '--'
    | '<<'
    | '>>';
}

/**
 * Token type for pair sets.
 */
export interface IPairTokenType extends ITokenType {
  readonly kind: 'pair';
  readonly lexeme: '(' | ')' | '{' | '}';
  readonly start: boolean;
}

/**
 * Token type for symbols.
 */
export interface ISymbolTokenType extends ITokenType {
  readonly kind: 'symbol';
  readonly lexeme: '->' | ':' | '//';
}

// Every exported top-level field in this file is intentionally prefixed with $.
//
// This is in order to avoid conflicts with existing top-level members, such as
// "Number" or "String". It's not expected for token types to be referred to
// often enough anyway.

// Literals
////////////////////////////////////////////////////////////////////////////////

export const $Comment: ILiteralTokenType = {
  kind: 'literal',
  name: 'Comment',
};

export const $Identifier: ILiteralTokenType = {
  kind: 'literal',
  name: 'Identifier',
};

export const $String: ILiteralTokenType = {
  kind: 'literal',
  name: 'String',
};

export const $Number: ILiteralTokenType = {
  kind: 'literal',
  name: 'Number',
};

// Keywords
////////////////////////////////////////////////////////////////////////////////

export const $Const: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'const',
};

export const $Else: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'else',
};

export const $External: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'external',
};

export const $False: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'false',
};

export const $If: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'if',
};

export const $Let: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'let',
};

export const $Return: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'return',
};

export const $Then: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'then',
};

export const $True: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'true',
};

export const $Type: IKeywordTokenType = {
  kind: 'keyword',
  lexeme: 'type',
};

// Markers
////////////////////////////////////////////////////////////////////////////////

export const $EOF: IMarkerTokenType = {
  kind: 'marker',
  name: '<EOF>',
};

// Operators
////////////////////////////////////////////////////////////////////////////////

export const $Period: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '.',
};

export const $PlusPlus: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '++',
};

export const $DashDash: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '--',
};

export const $Exclaim: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '!',
};

export const $Tilde: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '~',
};

export const $Plus: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '+',
};

export const $Dash: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '-',
};

export const $Star: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '*',
};

export const $Slash: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '/',
};

export const $Percent: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '%',
};

export const $LeftAngleLeftAngle: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '<<',
};

export const $RightAngleRightAngle: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '>>',
};

export const $LeftAngle: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '<',
};

export const $RightAngle: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '>',
};

export const $LeftAngleEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '<=',
};

export const $RightAngleEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '>=',
};

export const $Equals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '=',
};

export const $EqualsEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '==',
};

export const $ExclaimEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '!=',
};

export const $EqualsEqualsEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '===',
};

export const $ExclaimEqualsEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '!==',
};

export const $Pipe: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '|',
};

export const $PipePipe: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '||',
};

export const $And: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '&',
};

export const $AndAnd: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '&&',
};

export const $Caret: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '^',
};

export const $PlusEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '+=',
};

export const $DashEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '-=',
};

export const $StarEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '*=',
};

export const $SlashEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '/=',
};

export const $PercentEquals: IOperatorTokenType = {
  kind: 'operator',
  lexeme: '%=',
};

// Pairs
////////////////////////////////////////////////////////////////////////////////

export const $LeftParen: IPairTokenType = {
  kind: 'pair',
  lexeme: '(',
  start: true,
};

export const $RightParen: IPairTokenType = {
  kind: 'pair',
  lexeme: ')',
  start: false,
};

export const $LeftCurly: IPairTokenType = {
  kind: 'pair',
  lexeme: '{',
  start: true,
};

export const $RightCurly: IPairTokenType = {
  kind: 'pair',
  lexeme: '}',
  start: false,
};

// Symbols
////////////////////////////////////////////////////////////////////////////////

export const $DashRightAngle: ISymbolTokenType = {
  kind: 'symbol',
  lexeme: '->',
};

export const $Colon: ISymbolTokenType = {
  kind: 'symbol',
  lexeme: ':',
};

export const $SlashSlash: ISymbolTokenType = {
  kind: 'symbol',
  lexeme: '//',
};
