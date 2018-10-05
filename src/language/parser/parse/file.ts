import * as tokens from '../../ast/token';
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
    if (this.match(tokens.$Const)) {
      isConst = true;
    }
    return this.factory.createFunctionDeclaration(
      this.parseIdentifier(),
      this.parseParameterList(),
      this.match(tokens.$Colon) ? this.parseIdentifier() : undefined,
      this.advance(),
      this.parseBody(),
      isConst
    );
  }

  private parseBody(): Expression | StatementBlock {
    if (this.match(tokens.$LeftCurly)) {
      const leftCurly = this.peek(-1);
      const statements: Statement[] = [];
      while (!this.match(tokens.$RightCurly)) {
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
    if (this.match(tokens.$LeftParen)) {
      const parameters: ParameterDeclaration[] = [];
      while (!this.match(tokens.$RightParen)) {
        parameters.push(
          this.factory.createParameterDeclaration(
            this.parseIdentifier(),
            this.match(tokens.$Colon) ? this.parseIdentifier() : undefined
          )
        );
      }
      return parameters;
    }
    return [];
  }
}
