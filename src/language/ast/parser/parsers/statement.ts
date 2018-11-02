import * as lexer from '../../lexer';
import { StaticMessageCode } from '../../message/message';
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

  protected parseVariable(
    _?: lexer.Token,
    allowValues = true
  ): ast.VariableDeclaration {
    const allModifiers: lexer.Token[] = [];
    while (this.match(lexer.$Const)) {
      allModifiers.push(this.previous());
    }
    function hasModifier(keyword: lexer.IKeywordTokenType): boolean {
      for (const modifier of allModifiers) {
        if (modifier.lexeme === keyword.lexeme) {
          return true;
        }
      }
      return false;
    }
    const name = this.parseIdentifier();
    const type = this.match(lexer.$Colon) ? this.parseIdentifier() : undefined;
    const value =
      allowValues && this.match(lexer.$Equals)
        ? this.parseExpression()
        : undefined;
    const astNode = this.factory.createVariableDeclaration(
      name,
      hasModifier(lexer.$Const),
      type,
      value
    );
    if (allModifiers.length > 1) {
      this.reporter.reportNode(
        astNode,
        StaticMessageCode.SYNTAX_TOO_MANY_MODIFIERS
      );
    }
    return astNode;
  }

  private parseReturn(keyword: lexer.Token): ast.ReturnStatement {
    return this.factory.createReturnStatement(
      keyword,
      this.hasNext && !this.check(lexer.$RightCurly)
        ? this.parseExpression()
        : undefined
    );
  }
}
