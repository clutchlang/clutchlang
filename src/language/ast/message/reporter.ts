import { SourceFile } from "../../../agnostic/scanner";
import { Token } from "../lexer/token";
import { AstNode } from "../parser";
import { StaticMessage, StaticMessageType } from "./message";

/**
 * 
 */
export class StaticMessageReporter {
  private static throwMessages(message: StaticMessage): never {
    throw message;
  }

  constructor(
    private readonly source: SourceFile,
    private readonly listener = StaticMessageReporter.throwMessages,
  ) {}

  public reportNode(node: AstNode, type: StaticMessageType, message: string): void {
    const start = node.firstToken.offset;
    const end = node.lastToken.offset + node.lastToken.length;
    return this.reportOffset(start, end - start, type, message);
  }

  public reportToken(token: Token, type: StaticMessageType, message: string): void {
    return this.reportOffset(token.offset, token.length, type, message);
  }

  private reportOffset(offset: number, length: number, type: StaticMessageType, message: string): void {
    this.listener(new StaticMessage(this.source, offset, length, type, message));
    return;
  }
}
