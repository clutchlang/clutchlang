import * as ast from '../../../ast';
import {
  Expression,
  FileRoot,
  FunctionDeclaration,
  ParameterDeclaration,
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
    if (this.match(ast.$Const)) {
      isConst = true;
    }
    return this.factory.createFunctionDeclaration(
      this.parseIdentifier(),
      this.parseParameterList(),
      this.match(ast.$Colon) ? this.parseIdentifier() : undefined,
      this.advance(),
      this.parseBody(),
      isConst
    );
  }

  private parseBody(): Expression | StatementBlock {
    if (this.match(ast.$LeftCurly)) {
      const leftCurly = this.peek(-1);
      const statements: Statement[] = [];
      while (!this.match(ast.$RightCurly)) {
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

  private parseParameterList(): ParameterDeclaration[] {
    if (this.match(ast.$LeftParen)) {
      const parameters: ParameterDeclaration[] = [];
      while (!this.match(ast.$RightParen)) {
        parameters.push(
          this.factory.createParameterDeclaration(
            this.parseIdentifier(),
            this.match(ast.$Colon) ? this.parseIdentifier() : undefined
          )
        );
      }
      return parameters;
    }
    return [];
  }
}
