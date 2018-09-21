import { Token } from '../tokenizer/tokens';
import { AstVisitor } from './visitor';

export abstract class AstNode {
  public abstract visit(visitor: AstVisitor): void;
}

export class AstCompilationUnit extends AstNode {
  constructor(public readonly functions: AstFunctionDeclaration[]) {
    super();
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitCompilationUnit(this);
  }
}

export type AstExpression =
  | AstLiteralBoolean
  | AstLiteralNumber
  | AstLiteralString
  | AstLiteralIdentifier
  | AstInvocationExpression
  | AstParenthesizedExpression;

export class AstLiteralIdentifier extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get name(): string {
    return this.token.value;
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralIdentifier(this);
  }
}

export class AstInvocationExpression extends AstNode {
  constructor(
    public readonly target: AstExpression,
    public readonly args: AstExpression[]
  ) {
    super();
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitInvocationExpression(this);
  }
}

export class AstParenthesizedExpression extends AstNode {
  constructor(public readonly body: AstExpression[]) {
    super();
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitParenthesizedExpression(this);
  }
}

export class AstLiteralBoolean extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): boolean {
    return this.token.value === 'true';
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralBoolean(this);
  }
}

export class AstLiteralNumber extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): number {
    return parseFloat(this.token.value);
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralNumber(this);
  }
}

export class AstLiteralString extends AstNode {
  constructor(private readonly token: Token) {
    super();
  }

  public get value(): string {
    return this.token.value.substring(1, this.token.value.length - 1);
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralString(this);
  }
}

export class AstFunctionDeclaration extends AstNode {
  constructor(
    private readonly token: Token,
    public readonly parameters: AstLiteralIdentifier[],
    public readonly body: AstExpression[]
  ) {
    super();
  }

  public get name(): string {
    return this.token.value;
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitFunctionDeclaration(this);
  }
}
