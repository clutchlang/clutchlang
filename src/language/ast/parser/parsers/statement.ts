import * as lexer from '../../lexer';
import * as ast from '../../parser';
import { ExpressionParser } from './expression';

/**
 * Partially implements parsing for statements.
 *
 * Exists soley to be standalone testable, as well as extended by the file
 * parser, which needs the capability to parse expressions.
 */
export class StatementParser extends ExpressionParser {
  public parseStatement(): ast.Statement {
    if (this.match(lexer.$Return)) {
      return this.parseReturn(this.previous());
    }
    if (this.match(lexer.$Let)) {
      return this.parseVariable(this.previous());
    }
    return this.parseExpression();
  }

  private parseReturn(keyword: lexer.Token): ast.ReturnStatement {
    return this.factory.createReturnStatement(
      keyword,
      this.hasNext ? this.parseExpression() : undefined
    );
  }

  private parseVariable(_: lexer.Token): ast.VariableDeclaration {
    // TODO: Add support for modifiers (i.e. "const").
    const name = this.parseIdentifier();
    const type = this.match(lexer.$Colon) ? this.parseIdentifier() : undefined;
    const value = this.match(lexer.$Equals)
      ? this.parseExpression()
      : undefined;
    return this.factory.createVariableDeclaration(name, type, value);
  }
}
