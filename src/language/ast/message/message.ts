import { SourceFile } from '../../../agnostic/scanner';

/**
 * Represents a static message reported during parsing or analysis.
 */
export class StaticMessage extends Error {
  constructor(
    public readonly source: SourceFile,
    public readonly offset: number,
    public readonly length: number,
    public readonly code: StaticMessageCode
  ) {
    super(
      `[${code.severity}] ${source.sourceUrl ||
        '<Unknown>'}:${source.computeLine(offset)}:${source.computeColumn(
        offset
      )}: ${code.name}`
    );
  }
}

/**
 * A type of static message.
 */
export enum StaticMessageSeverity {
  Error = 'ERROR',
  Warning = 'WARNING',
  Hint = 'HINT',
  Tip = 'TIP',
}

export class StaticMessageCode {
  public static readonly SYNTAX_INVALID_OPERATOR = new StaticMessageCode(
    'SYNTAX_INVALID_OPERATOR',
    StaticMessageSeverity.Error
  );

  public static readonly SYNTAX_UNEXPECTED_TOKEN = new StaticMessageCode(
    'SYNTAX_UNEXPECTED_TOKEN',
    StaticMessageSeverity.Error
  );

  public static readonly SYNTAX_EXPECTED_IDENTIFIER = new StaticMessageCode(
    'SYNTAX_EXPECTED_IDENTIFIER',
    StaticMessageSeverity.Error
  );

  public static readonly SYNTAX_EXPECTED_PARENTHESES = new StaticMessageCode(
    'SYNTAX_EXPECTED_PARENTHESES',
    StaticMessageSeverity.Error
  );

  public static readonly SYNTAX_EXPECTED_COMMA = new StaticMessageCode(
    'SYNTAX_EXPECTED_COMMA',
    StaticMessageSeverity.Error
  );

  private constructor(
    public readonly name: string,
    public readonly severity: StaticMessageSeverity
  ) {}
}
