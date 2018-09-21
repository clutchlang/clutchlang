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
  AstInvocationExpression,
  AstLiteralBoolean,
  AstLiteralIdentifier,
  AstLiteralNumber,
  AstLiteralString,
  AstParenthesizedExpression,
} from './node';
import { TokenScanner } from './scanner';

export class AstParser {
  constructor(private readonly scanner: TokenScanner) {}

  public parseCompilationUnit(): AstCompilationUnit {
    const results: AstFunctionDeclaration[] = [];
    while (!this.scanner.isDone) {
      // TODO: Loosen once alternatives are supported.
      this.scanRequired(RegExpToken.Identifier);
      results.push(this.parseFunctionDeclaration());
    }
    return new AstCompilationUnit(results);
  }

  /**
   * Returns a parsed expression, or undefined if there is none.
   */
  private parseExpression(): AstExpression | undefined {
    const token = this.scanner.peek();
    switch (token.kind) {
      case SymbolToken.LParen:
        this.scanRequired(SymbolToken.LParen);
        const expressions = this.parseExpressions();
        this.scanRequired(SymbolToken.RParen);
        return new AstParenthesizedExpression(expressions);
      case RegExpToken.Identifier:
        if (this.scanner.peek(1).kind === SymbolToken.LParen) {
          const identifier = this.scanner.read();
          this.scanRequired(SymbolToken.LParen);
          const invocation = new AstInvocationExpression(
            new AstLiteralIdentifier(identifier),
            this.parseExpressions()
          );
          this.scanRequired(SymbolToken.RParen);
          return invocation;
        }
        return new AstLiteralIdentifier(this.scanner.read());
      case RegExpToken.LiteralBoolean:
        return new AstLiteralBoolean(this.scanner.read());
      case RegExpToken.LiteralNumber:
        return new AstLiteralNumber(this.scanner.read());
      case RegExpToken.LiteralString:
        return new AstLiteralString(this.scanner.read());
      default:
        return undefined;
    }
  }

  private parseFunctionDeclaration(): AstFunctionDeclaration {
    const identifier = this.scanner.lastMatch[0];
    this.scanRequired(StringToken.Arrow);
    if (this.scanOptional(SymbolToken.LCurly)) {
      const fn = new AstFunctionDeclaration(
        identifier,
        this.parseExpressions()
      );
      this.scanRequired(SymbolToken.RCurly);
      return fn;
    }
    const expression = this.parseExpression()!;
    return new AstFunctionDeclaration(identifier, [expression]);
  }

  private parseExpressions(): AstExpression[] {
    const expressions: AstExpression[] = [];
    let expression = this.parseExpression();
    while (expression) {
      expressions.push(expression);
      expression = this.parseExpression();
    }
    return expressions;
  }

  private scanOptional(token: TokenKind): Token | undefined {
    if (this.scanner.scan(token)) {
      return this.scanner.lastMatch[0];
    }
    return undefined;
  }

  private scanRequired(token: TokenKind): void {
    /* istanbul ignore next */
    if (!this.scanner.scan(token)) {
      // The lexer should prevent this happening in a typical program.
      /* istanbul ignore next */
      const next = this.scanner.peek().kind;
      /* istanbul ignore next */
      throw new SyntaxError(`Expected ${token.name} got ${next.name}.`);
    }
  }
}
