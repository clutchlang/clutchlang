import { SourceFile } from '../../../agnostic/scanner';
import { Token } from '../lexer/token';
import { AstNode } from '../parser';
import { StaticMessage, StaticMessageCode } from './message';

/**
 *
 */
export class StaticMessageReporter {
  private static throwMessages(message: StaticMessage): never {
    throw message;
  }

  constructor(
    private readonly source: SourceFile,
    private readonly listener = StaticMessageReporter.throwMessages
  ) {}

  public reportNode(node: AstNode, code: StaticMessageCode): void {
    const start = node.firstToken.offset;
    const end = node.lastToken.offset + node.lastToken.length;
    return this.reportOffset(start, end - start, code);
  }

  public reportToken(token: Token, code: StaticMessageCode): void {
    return this.reportOffset(token.offset, token.length, code);
  }

  public reportOffset(
    offset: number,
    length: number,
    code: StaticMessageCode
  ): void {
    this.listener(new StaticMessage(this.source, offset, length, code));
    return;
  }
}
