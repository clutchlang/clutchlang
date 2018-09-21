import { Token } from '../tokenizer/tokens';

export abstract class AstNode {}

export class AstCompilationUnit extends AstNode {
  constructor(public readonly functions: AstFunctionDeclaration[]) {
    super();
  }
}

export type AstExpression = AstLiteralBoolean;

export class AstLiteralBoolean extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): boolean {
    return this.token.value === 'true';
  }
}

export class AstFunctionDeclaration extends AstNode {
  constructor(
    private readonly token: Token,
    public readonly body: AstExpression[]
  ) {
    super();
  }

  public get name(): string {
    return this.token.value;
  }
}
