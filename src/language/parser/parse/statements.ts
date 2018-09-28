import { TokenKind } from "../../lexer";
import { Statement } from "../nodes/nodes";
import { ReturnStatement, VariableDeclarationStatement } from "../nodes/statements";
import { ExpressionParser } from "./expressions";

export class StatementParser extends ExpressionParser {
  public parseStatement() : Statement {
    if (this.match(TokenKind.RETURN)) {
      return this.parseReturn();
    }
    if (this.match(TokenKind.LET)) {
      return this.parseVariable();
    }
    return this.parseExpression();
  }

  private parseReturn() : ReturnStatement {
    return this.factory.createReturnStatement(
      this.peek(-1),
      this.hasNext ? this.parseExpression() : undefined,
    );
  }

  private parseVariable() : VariableDeclarationStatement {
    // TODO: Add assertions to check token contents.
    return this.factory.createVariableDeclarationStatement(
      this.peek(-1),
      this.parseIdentifier(),
      this.advance(),
      this.parseExpression(),
    );
  }
}
