import { Token } from '../tokenizer/tokens';
import { AstVisitor } from './visitor';

export abstract class AstNode {
  public abstract visit(visitor: AstVisitor): void;

  /**
   * Offset from the beginning of the file to the first character.
   */
  public get offset(): number {
    /* istanbul ignore next */
    return this.beginToken.span.start.offset;
  }

  /**
   * Number of characters in the syntactic entity's source range.
   */
  public get length(): number {
    /* istanbul ignore next */
    return this.beginToken.span.end.offset - this.endToken.span.start.offset;
  }

  public abstract get beginToken(): Token;
  public abstract get endToken(): Token;
}

export class AstCompilationUnit extends AstNode {
  constructor(public readonly functions: AstFunctionDeclaration[]) {
    super();
  }

  public get beginToken(): Token {
    /* istanbul ignore next */
    return this.functions[0].beginToken;
  }

  public get endToken(): Token {
    /* istanbul ignore next */
    return this.functions[this.functions.length - 1].endToken;
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

export abstract class AstLiteralExpression extends AstNode {
  constructor(protected readonly token: Token) {
    super();
  }

  public get beginToken(): Token {
    /* istanbul ignore next */
    return this.token;
  }

  public get endToken(): Token {
    /* istanbul ignore next */
    return this.token;
  }
}

export class AstLiteralIdentifier extends AstLiteralExpression {
  public get name(): string {
    return this.token.value;
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralIdentifier(this);
  }
}

export class AstLiteralBoolean extends AstLiteralExpression {
  public get value(): boolean {
    return this.token.value === 'true';
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralBoolean(this);
  }
}

export class AstLiteralNumber extends AstLiteralExpression {
  public get value(): number {
    return parseFloat(this.token.value);
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralNumber(this);
  }
}

export class AstLiteralString extends AstLiteralExpression {
  public get value(): string {
    return this.token.value.substring(1, this.token.value.length - 1);
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitLiteralString(this);
  }
}

export class AstInvocationExpression extends AstNode {
  constructor(
    public readonly beginToken: Token,
    public readonly endToken: Token,
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
  constructor(
    public readonly beginToken: Token,
    public readonly endToken: Token,
    public readonly body: AstExpression[]
  ) {
    super();
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitParenthesizedExpression(this);
  }
}

export class AstFunctionDeclaration extends AstNode {
  constructor(
    public readonly beginToken: Token,
    public readonly endToken: Token,
    public readonly parameters: AstLiteralIdentifier[],
    public readonly body: AstExpression[]
  ) {
    super();
  }

  public get name(): string {
    return this.beginToken.value;
  }

  public visit(visitor: AstVisitor): void {
    return visitor.visitFunctionDeclaration(this);
  }
}
