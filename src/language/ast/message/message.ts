import { SourceFile } from "../../../agnostic/scanner";

/**
 * Represents a static message reported during parsing or analysis.
 */
export class StaticMessage extends Error {
  constructor(
    public readonly source: SourceFile,
    public readonly offset: number,
    public readonly length: number,
    public readonly type: StaticMessageType,
    public readonly message: string,
  ) {
    super(`[${type}] ${source.sourceUrl || '<Unknown>'}:${source.computeLine(offset)}:${source.computeColumn(offset)}: ${message}`);
  }
}

/**
 * A type of static message.
 */
export enum StaticMessageType {
  Error = 'ERROR',
  Warning = 'WARNING',
  Hint = 'HINT',
  Tip = 'TIP',
}
