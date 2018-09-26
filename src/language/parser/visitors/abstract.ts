import {
  BinaryExpression,
  IfExpression,
  InvokeExpression,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  SimpleName,
  UnaryExpression,
} from '../../parser';
import { FunctionDeclaration } from '../nodes';
import { JumpStatement, VariableStatement } from '../statements';

/**
 * A pattern that may be used to visit an AST structure.
 */
export abstract class AstVisitor<R, C> {
  // Expressions
  public abstract visitBinaryExpression(node: BinaryExpression, context?: C): R;
  public abstract visitIfExpression(node: IfExpression, context?: C): R;
  public abstract visitInvokeExpression(node: InvokeExpression, context?: C): R;
  public abstract visitLiteralBoolean(node: LiteralBoolean, context?: C): R;
  public abstract visitLiteralNumber(node: LiteralNumber, context?: C): R;
  public abstract visitLiteralString(node: LiteralString, context?: C): R;
  public abstract visitSimpleName(node: SimpleName, context?: C): R;
  public abstract visitUnaryExpression(node: UnaryExpression, context?: C): R;

  // Statements
  public abstract visitJumpStatement(node: JumpStatement, context?: C): R;
  public abstract visitVariableStatement(
    node: VariableStatement,
    context?: C
  ): R;

  // Top Level
  public abstract visitFunctionDeclaration(
    node: FunctionDeclaration,
    context?: C
  ): R;
}
