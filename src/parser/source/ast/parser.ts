import {
  RegExpToken,
  StringToken,
  SymbolToken,
  Token,
  TokenKind,
} from '../tokenizer/tokens';
import {
  AstCompilationUnit,
  AstExpression,
  AstFunctionDeclaration,
} from './node';
import { TokenScanner } from './scanner';

export class AstParser {
  constructor(private readonly scanner: TokenScanner) {}

  public parseCompilationUnit(): AstCompilationUnit {
    const results: AstFunctionDeclaration[] = [];
    while (!this.scanner.isDone) {
      if (this.scanner.scan(RegExpToken.Identifier)) {
        results.push(this.parseFunctionDeclaration());
      }
    }
    return new AstCompilationUnit(results);
  }

  private parseExpression(): AstExpression | undefined {
    const token = this.scanner.peek();
    switch (token.kind) {
      case RegExpToken.Identifier:
        break;
      case RegExpToken.LiteralBoolean:
        break;
      case RegExpToken.LiteralNumber:
        break;
      case RegExpToken.LiteralString:
        break;
    }
  }

  private parseFunctionDeclaration(): AstFunctionDeclaration {
    const identifier = this.scanner.lastMatch[0];
    this.scanRequired(StringToken.Arrow);
    if (this.scanOptional(SymbolToken.LCurly)) {
    } else {
    }
    return new AstFunctionDeclaration(identifier, []);
  }

  private scanOptional(token: TokenKind): Token | undefined {
    if (this.scanner.scan(token)) {
      return this.scanner.lastMatch[0];
    }
    return undefined;
  }

  private scanRequired(token: TokenKind): void {
    if (!this.scanner.scan(token)) {
      const next = this.scanner.peek().kind;
      throw new SyntaxError(`Expected ${token.name} got ${next}.`);
    }
  }
}
