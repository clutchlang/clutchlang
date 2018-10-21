import * as lexer from '../../lexer';
import { StaticMessageCode } from '../../message/message';
import * as ast from '../../parser';
import { StatementParser } from './statement';

/**
 * Parses the root of modules for Clutch.
 */
export class ModuleParser extends StatementParser {
  public parseModuleRoot(): ast.ModuleRoot {
    return this.factory.createModuleRoot([this.parseModuleDeclaration()]);
  }

  private parseModuleDeclaration(): ast.ModuleDeclaration {
    const nodes: Array<
      ast.FunctionDeclaration | ast.TypeDeclaration | ast.VariableDeclaration
    > = [];
    let external: lexer.Token | undefined;
    while (this.hasNext) {
      external = this.match(lexer.$External) ? this.previous() : undefined;
      if (this.match(lexer.$Type)) {
        nodes.push(this.parseTypeDeclaration(this.previous(), external));
        continue;
      }
      if (this.match(lexer.$Let)) {
        if (external) {
          this.reporter.reportToken(
            external,
            StaticMessageCode.SYNTAX_INVALID_MODIFIER
          );
        }
        nodes.push(this.parseVariableDeclaration(this.previous()));
        continue;
      }
      nodes.push(
        this.parseFunctionDeclaration(this.parseIdentifier(), external)
      );
    }
    return this.factory.createModuleDeclaration(nodes);
  }

  private parseTypeDeclaration(
    _: lexer.Token,
    external?: lexer.Token
  ): ast.TypeDeclaration {
    const name = this.parseIdentifier();
    let leftCurly = this.advance();
    if (leftCurly.type !== lexer.$LeftCurly) {
      this.reporter.reportToken(
        leftCurly,
        StaticMessageCode.SYNTAX_EXPECTED_CURLY
      );
      leftCurly = leftCurly.toErrorToken('{');
    }
    const members: ast.FunctionDeclaration[] = [];
    while (!this.match(lexer.$RightCurly)) {
      external = this.match(lexer.$External) ? this.previous() : undefined;
      members.push(this.parseFunctionDeclaration(this.parseIdentifier()));
    }
    const rightCurly = this.previous();
    return this.factory.createTypeDeclaration(
      name,
      !!external,
      members,
      rightCurly
    );
  }

  private parseVariableDeclaration(
    keyword: lexer.Token
  ): ast.VariableDeclaration {
    return this.parseVariable(keyword);
  }

  private parseFunctionDeclaration(
    name: ast.Identifier,
    external?: lexer.Token
  ): ast.FunctionDeclaration {
    // TODO: Allow putting functions inside of statements/expressions?
    let leftParen!: lexer.Token;
    if (this.match(lexer.$LeftParen)) {
      leftParen = this.previous();
    }
    return this.factory.createFunctionDeclaration(
      name,
      !!external,
      leftParen ? this.parseParameterList(leftParen) : undefined,
      this.match(lexer.$Colon) ? this.parseIdentifier() : undefined,
      this.match(lexer.$DashRightAngle)
        ? this.parseStatementBlockOrExpression()
        : undefined
    );
  }

  private parseParameterList(leftParen: lexer.Token): ast.ParameterList {
    const params: ast.VariableDeclaration[] = [];
    while (this.hasNext && !this.match(lexer.$RightParen)) {
      params.push(this.parseParameter());
      if (!this.match(lexer.$Comma, lexer.$RightParen)) {
        this.reporter.reportToken(
          this.peek(),
          StaticMessageCode.SYNTAX_EXPECTED_COMMA
        );
      } else {
        if (this.previous().type === lexer.$RightParen) {
          break;
        }
      }
    }
    let rightParen = this.previous();
    if (rightParen.type !== lexer.$RightParen) {
      this.reporter.reportToken(
        rightParen,
        StaticMessageCode.SYNTAX_EXPECTED_PARENTHESES
      );
      rightParen = rightParen.toErrorToken(')');
    }
    rightParen = this.previous();
    return this.factory.createParameterList(leftParen, params, rightParen);
  }

  private parseParameter(): ast.VariableDeclaration {
    return this.parseVariable(undefined, false);
  }

  private parseStatementBlockOrExpression():
    | ast.StatementBlock
    | ast.Expression {
    if (this.match(lexer.$LeftCurly)) {
      return this.parseStatementBlock(this.previous());
    }
    return this.parseExpression();
  }

  private parseStatementBlock(first: lexer.Token): ast.StatementBlock {
    const statements: Array<ast.Expression | ast.Statement> = [];
    while (!this.match(lexer.$RightCurly)) {
      statements.push(this.parseStatement());
    }
    return this.factory.createStatementBlock(
      first,
      statements,
      this.previous()
    );
  }
}
