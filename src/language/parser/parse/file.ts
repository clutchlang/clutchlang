import { TokenKind } from '../../lexer';
import { LiteralIdentifier } from '../nodes/expressions';
import {
  Expression,
  FileRoot,
  FunctionDeclaration,
  Statement,
} from '../nodes/nodes';
import { StatementBlock } from '../nodes/statements';
import { StatementParser } from './statements';

export class FileParser extends StatementParser {
  public parseFileRoot(): FileRoot {
    const functions: FunctionDeclaration[] = [];
    while (this.hasNext) {
      functions.push(this.parseFunctionDeclaration());
    }
    return this.factory.createFileRoot(functions);
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
    // TODO: Assert tokens are valid.
    let isConst = false;
    if (this.match(TokenKind.CONST)) {
      isConst = true;
    }
    return this.factory.createFunctionDeclaration(
      this.parseIdentifier(),
      this.parseParameterList(),
      this.advance(),
      this.parseBody(),
      isConst
    );
  }

  private parseBody(): Expression | StatementBlock {
    if (this.match(TokenKind.LEFT_CURLY)) {
      const leftCurly = this.peek(-1);
      const statements: Statement[] = [];
      while (!this.match(TokenKind.RIGHT_CURLY)) {
        statements.push(this.parseStatement());
      }
      const rightCurly = this.peek(-1);
      return this.factory.createStatementBlock(
        leftCurly,
        statements,
        rightCurly
      );
    }
    return this.parseExpression();
  }

  private parseParameterList(): LiteralIdentifier[] {
    if (this.match(TokenKind.LEFT_PAREN)) {
      const parameters: LiteralIdentifier[] = [];
      while (!this.match(TokenKind.RIGHT_PAREN)) {
        parameters.push(this.parseIdentifier());
      }
      return parameters;
    }
    return [];
  }
}
