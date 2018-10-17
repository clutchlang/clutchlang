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
  public static readonly INVALID_OPERATOR = new StaticMessageCode(
    'INVALID_OPERATOR',
    StaticMessageSeverity.Error
  );

  public static readonly UNEXPECTED_TOKEN = new StaticMessageCode(
    'UNEXPECTED_TOKEN',
    StaticMessageSeverity.Error
  );

  private constructor(
    public readonly name: string,
    public readonly severity: StaticMessageSeverity
  ) {}
}
