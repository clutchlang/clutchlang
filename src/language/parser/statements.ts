import { IToken } from '../lexer';
import { SimpleName } from './expressions';
import { AstNode, Expression, Statement } from './nodes';

export class StatementBlock extends AstNode {
  constructor(
    public readonly firstToken: IToken,
    public readonly statements: Statement[],
    public readonly lastToken: IToken
  ) {
    super();
  }
}

export class JumpStatement extends Statement {
  constructor(
    public readonly firstToken: IToken,
    public readonly expression: Expression
  ) {
    super();
  }

  public get lastToken(): IToken {
    return this.expression.lastToken;
  }
}

export class VariableStatement extends Statement {
  constructor(
    public readonly firstToken: IToken,
    public readonly name: SimpleName,
    public readonly assignToken: IToken,
    public readonly expression: Expression
  ) {
    super();
  }

  public get lastToken(): IToken {
    return this.expression.lastToken;
  }
}
