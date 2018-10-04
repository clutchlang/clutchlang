import { IToken, TokenKind } from '../../lexer';
import {
  BinaryExpression,
  ConditionalExpression,
  GroupExpression,
  InvokeExpression,
  LiteralBoolean,
  LiteralIdentifier,
  LiteralNumber,
  LiteralString,
  ReturnStatement,
  UnaryExpression,
  VariableDeclarationStatement,
} from '../../parser';
import {
  AstNode,
  Expression,
  FileRoot,
  FunctionDeclaration,
  ParameterDeclaration,
} from '../nodes/nodes';
import { Operator } from '../nodes/precedence';
import { StatementBlock } from '../nodes/statements';
import { AstVisitor } from '../visitors/abstract';

export function evaluateConstExpression(
  node: AstNode,
  declarations: Map<string, FunctionDeclaration>
): AstNode {
  const result = node.accept(new ConstExpressionVisitor(), {
    globalDeclarations: declarations,
    recursionDepth: 0,
    scope: [],
  });
  return result!;
}

// default token for synthetic nodes.
const token: IToken = {
  comments: [],
  kind: TokenKind.EOF,
  lexeme: '',
  offset: -1,
};

/**
 * The maximum recursion depth for `constexpr` evaluation.
 */
const MAXIMUM_DEPTH = 1000;

interface IConstExpressionContext {
  /**
   * A global map of all `constexpr` functions availible.
   */
  globalDeclarations: Map<string, FunctionDeclaration>;

  /**
   * The current recursion depth.
   */
  recursionDepth: number;

  /**
   * The variable scope.
   */
  scope: Array<Map<string, AstNode>>;
}

enum ConstExprErrorMessage {
  DEFAULT_ERROR_STRING = 'Unsupported constexpr',
  MAXIMUM_DEPTH = 'Maximum depth reached',
  FILE_ROOT_UNSUPPORTED = 'Fileroot not supported',
  IDENTIFIER_OUT_OF_SCOPE = 'Identifiers not in scope.',
  VARIABLE_DECLARATION_UNSUPPORTED = 'Cannot declare variables',
  FUNCTION_DECLARATION_UNSUPPORTED = 'Cannot declare functions',
  CONDITIONAL_UNSUPPORTED = 'Cannot evaluate conditional',
  INVOKE_UNSUPPORTED = 'Cannot invoke non-constexpr',
  INVOKE_MISMATCH = 'Mismatched parameter length',
  RETURN_STATEMENT_ERROR = 'Cannot early return',
  MAXIMUM_DEPTH_REACHED = 'Maximum depth reached',
}

class ConstExpressionVisitor extends AstVisitor<
  AstNode | null,
  IConstExpressionContext
> {
  public visitFileRoot(_: FileRoot, __: IConstExpressionContext): AstNode {
    throw new Error(ConstExprErrorMessage.FILE_ROOT_UNSUPPORTED);
  }

  public visitBinaryExpression(
    node: BinaryExpression,
    context: IConstExpressionContext
  ): AstNode {
    const left: AstNode = node.left.accept(this, context)!;
    const right: AstNode = node.right.accept(this, context)!;
    if (left instanceof LiteralNumber && right instanceof LiteralNumber) {
      switch (node.operator) {
        case Operator.Addition:
          return new LiteralNumber(token, left.value + right.value);
        case Operator.Subtraction:
          return new LiteralNumber(token, left.value - right.value);
        case Operator.Multiplication:
          return new LiteralNumber(token, left.value * right.value);
        case Operator.Division:
          return new LiteralNumber(token, left.value / right.value);
        case Operator.Remainder:
          return new LiteralNumber(token, left.value % right.value);
        case Operator.Equality:
          return new LiteralBoolean(token, left.value === right.value);
        case Operator.GreaterThan:
          return new LiteralBoolean(token, left.value > right.value);
        case Operator.GreaterThanOrEqual:
          return new LiteralBoolean(token, left.value >= right.value);
        case Operator.LessThan:
          return new LiteralBoolean(token, left.value < right.value);
        case Operator.LessThanOrEqual:
          return new LiteralBoolean(token, left.value <= right.value);
        case Operator.Inequality:
          return new LiteralBoolean(token, left.value !== right.value);
      }
    } else if (
      left instanceof LiteralBoolean &&
      right instanceof LiteralBoolean
    ) {
      switch (node.operator) {
        case Operator.LogicalAnd:
          return new LiteralBoolean(token, left.value && right.value);
        case Operator.LogicalOr:
          return new LiteralBoolean(token, left.value || right.value);
        case Operator.Equality:
          return new LiteralBoolean(token, left.value === right.value);
        case Operator.Inequality:
          return new LiteralBoolean(token, left.value !== right.value);
      }
    }
    throw new Error(ConstExprErrorMessage.DEFAULT_ERROR_STRING);
  }

  public visitUnaryExpression(
    node: UnaryExpression,
    context: IConstExpressionContext
  ): AstNode {
    const target: AstNode = node.target.accept(this, context)!;
    if (target instanceof LiteralNumber) {
      const value: number = target.value;
      switch (node.operator) {
        case Operator.PostfixDecrement:
          return new LiteralNumber(token, value);
        case Operator.PostfixIncrement:
          return new LiteralNumber(token, value);
        case Operator.PrefixIncrement:
          return new LiteralNumber(token, value + 1);
        case Operator.PrefixDecrement:
          return new LiteralNumber(token, value - 1);
        case Operator.UnaryNegative:
          return new LiteralNumber(token, -value);
      }
    } else if (target instanceof LiteralBoolean) {
      switch (node.operator) {
        case Operator.LogicalNot:
          return new LiteralBoolean(token, !target.value);
      }
    }
    throw new Error(ConstExprErrorMessage.DEFAULT_ERROR_STRING);
  }

  public visitGroupExpression(
    node: GroupExpression,
    context: IConstExpressionContext
  ): AstNode | null {
    return node.expression.accept(this, context);
  }

  public visitConditionalExpression(
    node: ConditionalExpression,
    context: IConstExpressionContext
  ): AstNode | null {
    const condition: AstNode = node.condition.accept(this, context)!;
    if (condition instanceof LiteralBoolean) {
      const body: Expression | StatementBlock | undefined =
        condition.value === true ? node.body : node.elseBody;
      if (body === undefined || body instanceof StatementBlock) {
        throw new Error(ConstExprErrorMessage.CONDITIONAL_UNSUPPORTED);
      }
      return body.accept(this, context);
    }
    throw new Error(ConstExprErrorMessage.CONDITIONAL_UNSUPPORTED);
  }

  public visitInvokeExpression(
    node: InvokeExpression,
    context: IConstExpressionContext
  ): AstNode | null {
    if (context.recursionDepth > MAXIMUM_DEPTH) {
      throw new Error(ConstExprErrorMessage.MAXIMUM_DEPTH_REACHED);
    }
    context.recursionDepth += 1;
    const identifer = node.target as LiteralIdentifier;
    if (!context.globalDeclarations.has(identifer.name)) {
      throw new Error(ConstExprErrorMessage.INVOKE_UNSUPPORTED);
    }
    const declaration: FunctionDeclaration = context.globalDeclarations.get(
      identifer.name
    )!;
    if (declaration.parameters.length !== node.parameters.length) {
      throw new Error(ConstExprErrorMessage.INVOKE_MISMATCH);
    }
    this.pushScope(context);
    for (let index = 0; index < declaration.parameters.length; index++) {
      const argument = node.parameters[index]!.accept(this, context)!;
      const parameter = declaration.parameters[index]!;
      this.store(parameter.name.name, argument, context);
    }
    const result = (declaration.body as Expression).accept(this, context);
    this.popScope(context);
    return result;
  }

  public visitLiteralBoolean(
    node: LiteralBoolean,
    __: IConstExpressionContext
  ): AstNode | null {
    return node;
  }

  public visitLiteralNumber(
    node: LiteralNumber,
    __: IConstExpressionContext
  ): AstNode | null {
    return node;
  }

  public visitLiteralString(
    node: LiteralString,
    __: IConstExpressionContext
  ): AstNode | null {
    return node;
  }

  public visitSimpleName(
    node: LiteralIdentifier,
    context: IConstExpressionContext
  ): AstNode | null {
    const result = this.lookup(node.name, context);
    if (result === null) {
      throw new Error(ConstExprErrorMessage.IDENTIFIER_OUT_OF_SCOPE);
    }
    return result;
  }

  public visitReturnStatement(
    _: ReturnStatement,
    __: IConstExpressionContext
  ): AstNode | null {
    throw new Error(ConstExprErrorMessage.RETURN_STATEMENT_ERROR);
  }

  public visitVariableDeclarationStatement(
    _: VariableDeclarationStatement,
    __: IConstExpressionContext
  ): AstNode | null {
    throw new Error(ConstExprErrorMessage.VARIABLE_DECLARATION_UNSUPPORTED);
  }

  public visitFunctionDeclaration(
    _: FunctionDeclaration,
    __: IConstExpressionContext
  ): AstNode {
    throw new Error(ConstExprErrorMessage.FUNCTION_DECLARATION_UNSUPPORTED);
  }

  public visitParameterDeclaration(
    _: ParameterDeclaration,
    __: IConstExpressionContext
  ): AstNode {
    throw new Error(ConstExprErrorMessage.VARIABLE_DECLARATION_UNSUPPORTED);
  }

  /**
   * Lookup a bound value.
   * @param name the name of the identifier.
   * @param context the current context.
   */
  private lookup(
    name: string,
    context: IConstExpressionContext
  ): AstNode | null {
    for (let i = context.scope.length - 1; i >= 0; i--) {
      if (context.scope[i].has(name)) {
        return context.scope[i].get(name)!;
      }
    }
    return null;
  }

  /**
   * Store a value in the current scope.
   * @param name the name of the identifier.
   * @param value the value of the identifier.
   * @param context the current context.
   */
  private store(
    name: string,
    value: AstNode,
    context: IConstExpressionContext
  ): void {
    const index = context.scope.length - 1;
    context.scope[index]!.set(name, value);
  }

  /**
   * Pop the last scope.
   * @param context the current context.
   */
  private popScope(context: IConstExpressionContext): void {
    context.scope.pop();
  }

  /**
   * Push a new scope.
   * @param context the current context.
   */
  private pushScope(context: IConstExpressionContext): void {
    context.scope.push(new Map());
  }
}
