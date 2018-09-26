import {
  BinaryExpression,
  IfExpression,
  InvokeExpression,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  SimpleName,
  UnaryExpression,
} from '../parser';
import { FunctionDeclaration } from './nodes';
import { JumpStatement, VariableStatement } from './statements';

/**
 * A pattern that may be used to visit an AST structure.
 */
export abstract class AstVisitor<R> {
  // Expressions
  public abstract visitBinaryExpression(node: BinaryExpression): R;
  public abstract visitIfExpression(node: IfExpression): R;
  public abstract visitInvokeExpression(node: InvokeExpression): R;
  public abstract visitLiteralBoolean(node: LiteralBoolean): R;
  public abstract visitLiteralNumber(node: LiteralNumber): R;
  public abstract visitLiteralString(node: LiteralString): R;
  public abstract visitSimpleName(node: SimpleName): R;
  public abstract visitUnaryExpression(node: UnaryExpression): R;

  // Statements
  public abstract visitJumpStatement(node: JumpStatement): R;
  public abstract visitVariableStatement(node: VariableStatement): R;

  // Top Level
  public abstract visitFunctionDeclaration(node: FunctionDeclaration): R;
}
