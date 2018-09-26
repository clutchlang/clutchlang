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
import { FileRoot, FunctionDeclaration } from '../nodes/nodes';
import { JumpStatement, VariableStatement } from '../nodes/statements';

/**
 * A pattern that may be used to visit an AST structure.
 */
export abstract class AstVisitor<R, C> {
  // Misc
  public abstract visitFileRoot(node: FileRoot, context?: C): R;
  
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
