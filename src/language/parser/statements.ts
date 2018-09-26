import { IToken } from '../lexer';
import { SimpleName } from './expressions';
import { Expression, Statement } from './nodes';
import { AstVisitor } from './visitors';

export class StatementBlock {
  constructor(
    public readonly firstToken: IToken,
    public readonly statements: Statement[],
    public readonly lastToken: IToken
  ) {}
}

export class JumpStatement extends Statement {
  constructor(
    public readonly firstToken: IToken,
    public readonly expression: Expression
  ) {
    super();
  }

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitJumpStatement(this, context);
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

  public accept<R, C>(visitor: AstVisitor<R, C>, context?: C): R {
    return visitor.visitVariableStatement(this, context);
  }

  public get lastToken(): IToken {
    return this.expression.lastToken;
  }
}
