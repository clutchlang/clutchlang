import { Token } from '../tokenizer/tokens';

export abstract class AstNode {}

export class AstCompilationUnit extends AstNode {
  constructor(public readonly functions: AstFunctionDeclaration[]) {
    super();
  }
}

export type AstExpression =
  | AstLiteralBoolean
  | AstLiteralNumber
  | AstLiteralString
  | AstIdentifier
  | AstInvocation;

export class AstIdentifier extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get name(): string {
    return this.token.value;
  }
}

export class AstInvocation extends AstNode {
  constructor(
    public readonly target: AstExpression,
    public readonly args: AstExpression[]
  ) {
    super();
  }
}

export class AstLiteralBoolean extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): boolean {
    return this.token.value === 'true';
  }
}

export class AstLiteralNumber extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): number {
    return parseFloat(this.token.value);
  }
}

export class AstLiteralString extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): string {
    return this.token.value.substring(1, this.token.value.length - 1);
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
