import { IToken } from '../../lexer';
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
import { AstNode, FileRoot, FunctionDeclaration } from '../nodes/nodes';
import { Operator } from '../nodes/precedence';
import { AstVisitor } from '../visitors/abstract';

export function evaluateConstExpression(node: AstNode): AstNode {
  return node.accept(new ConstExpressionVisitor(), {});
}

// defeat typescript checking.
let token: IToken;

enum ConstExprErrorMessage {
  DEFAULT_ERROR_STRING = 'Unsupported constexpr',
  MAXIMUM_DEPTH = 'Maximum depth reached',
  FILE_ROOT_UNSUPPORTED = 'Fileroot not supported',
  IDENTIFIER_UNSUPPORTED = 'Identifiers not supported',
  VARIABLE_DECLARATION_UNSUPPORTED = 'Cannot declare variables',
  FUNCTION_DECLARATION_UNSUPPORTED = 'Cannot declare functions',
  CONDITIONAL_UNSUPPORTED = 'Cannot evaluate conditionals',
  INVOKE_UNSUPPORTED = 'Cannot invoke functions',
  RETURN_STATEMENT_ERROR = 'Cannot early return',
}

interface Context {}

class ConstExpressionVisitor extends AstVisitor<AstNode, Context> {
  public visitFileRoot(_: FileRoot, __: Context): AstNode {
    throw new Error(ConstExprErrorMessage.FILE_ROOT_UNSUPPORTED);
  }

  public visitBinaryExpression(
    node: BinaryExpression,
    context: Context
  ): AstNode {
    const left: AstNode = node.left.accept(this, context);
    const right: AstNode = node.right.accept(this, context);
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
          return new LiteralBoolean(token, left.value == right.value);
        case Operator.GreaterThan:
          return new LiteralBoolean(token, left.value > right.value);
        case Operator.GreaterThanOrEqual:
          return new LiteralBoolean(token, left.value >= right.value);
        case Operator.LessThan:
          return new LiteralBoolean(token, left.value < right.value);
        case Operator.LessThanOrEqual:
          return new LiteralBoolean(token, left.value <= right.value);
        case Operator.Inequality:
          return new LiteralBoolean(token, left.value != right.value);
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
          return new LiteralBoolean(token, left.value == right.value);
        case Operator.Inequality:
          return new LiteralBoolean(token, left.value != right.value);
      }
    }
    throw new Error(ConstExprErrorMessage.DEFAULT_ERROR_STRING);
  }

  public visitUnaryExpression(
    node: UnaryExpression,
    context: Context
  ): AstNode {
    const target: AstNode = node.target.accept(this, context);
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
    context: Context
  ): AstNode {
    return node.expression.accept(this, context);
  }

  public visitConditionalExpression(
    _: ConditionalExpression,
    __: Context
  ): AstNode {
    throw new Error(ConstExprErrorMessage.CONDITIONAL_UNSUPPORTED);
  }

  public visitInvokeExpression(_: InvokeExpression, __: Context): AstNode {
    throw new Error(ConstExprErrorMessage.INVOKE_UNSUPPORTED);
  }

  public visitLiteralBoolean(node: LiteralBoolean, __: Context): AstNode {
    return node;
  }

  public visitLiteralNumber(node: LiteralNumber, __: Context): AstNode {
    return node;
  }

  public visitLiteralString(node: LiteralString, __: Context): AstNode {
    return node;
  }

  public visitSimpleName(_: LiteralIdentifier, __: Context): AstNode {
    throw new Error(ConstExprErrorMessage.IDENTIFIER_UNSUPPORTED);
  }

  public visitReturnStatement(_: ReturnStatement, __: Context): AstNode {
    throw new Error(ConstExprErrorMessage.RETURN_STATEMENT_ERROR);
  }

  public visitVariableDeclarationStatement(
    _: VariableDeclarationStatement
  ): AstNode {
    // Cannot declare variables.
    throw new Error(ConstExprErrorMessage.VARIABLE_DECLARATION_UNSUPPORTED);
  }

  public visitFunctionDeclaration(_: FunctionDeclaration): AstNode {
    throw new Error(ConstExprErrorMessage.FUNCTION_DECLARATION_UNSUPPORTED);
  }
}
