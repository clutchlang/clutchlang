import {
  AstVisitor,
  BinaryExpression,
  ConditionalExpression,
  FileRoot,
  FunctionDeclaration,
  GroupExpression,
  InvokeExpression,
  LiteralBoolean,
  LiteralIdentifier,
  LiteralNumber,
  LiteralString,
  ReturnStatement,
  UnaryExpression,
  VariableDeclarationStatement,
} from '../parser';
import { ParameterDeclaration } from '../parser/nodes/nodes';
import { StatementBlock } from '../parser/nodes/statements';
import {
  BOOLEAN_DECLARATION,
  BOOLEAN_TYPE,
  FunctionType,
  NUMBER_DECLARATION,
  NUMBER_TYPE,
  STRING_TYPE,
  Type,
  VOID_TYPE,
} from './type';

/**
 *  The expected number of parameters for a binary operator.
 */
const BINARY_OPERATOR_LENGTH = 2;

/**
 * The expected number of parameters for a unary operator.
 */
const UNARY_OPERATOR_LENGTH = 1;

export class TypeChecker extends AstVisitor<Type, TypeScope> {
  private readonly declarations = new Map([
    [BOOLEAN_TYPE, BOOLEAN_DECLARATION],
    [NUMBER_TYPE, NUMBER_DECLARATION],
  ]);

  /* istanbul ignore next */
  public visitFileRoot(node: FileRoot, context: TypeScope): Type {
    const scope = new TypeScope(context);
    for (const element of node.topLevelElements) {
      element.accept(this, scope);
    }
    return VOID_TYPE;
  }

  public visitBinaryExpression(
    node: BinaryExpression,
    context: TypeScope
  ): Type {
    const left = node.left.accept(this, context);
    const right = node.right.accept(this, context);
    const declaration = this.declarations.get(left)!;
    const method = declaration.methods[node.operator.name];
    if (method === null || method === undefined) {
      throw new Error(
        `No such method: No method ${node.operator.name} found on ${left.name}`
      );
    }
    /* istanbul ignore if */
    if (method.parameterTypes.length !== BINARY_OPERATOR_LENGTH) {
      throw new Error(
        `Mismatched parameters: requires: ${method.parameterTypes
          .map(p => p.name)
          .join(', ')} found (${left.name},${right.name})}`
      );
    }
    const second = method.parameterTypes[BINARY_OPERATOR_LENGTH - 1]!;
    if (!right.isAssignableTo(second)) {
      throw new Error(
        `Mismatched types: cannot assign ${right.name} to ${second.name}`
      );
    }
    return method.returnType;
  }

  public visitGroupExpression(node: GroupExpression, context: TypeScope): Type {
    return node.expression.accept(this, context);
  }

  public visitConditionalExpression(
    node: ConditionalExpression,
    context: TypeScope
  ): Type {
    const ifType = node.condition.accept(this, context);
    if (!ifType.isAssignableTo(BOOLEAN_TYPE)) {
      throw new Error(
        `Type error: boolean expression expected found ${ifType.name}`
      );
    }
    let ifBranchType: Type;
    let elseBranchType: Type;
    // not currently supported.
    /* istanbul ignore next */
    if (node.body instanceof StatementBlock) {
      ifBranchType = node.body.statements.map(stmt =>
        stmt.accept(this, context)
      )[node.body.statements.length - 1];
    } else {
      ifBranchType = node.body.accept(this, context);
    }
    // not currently supported.
    /* istanbul ignore next */
    if (node.elseBody === null || node.elseBody === undefined) {
      elseBranchType = VOID_TYPE;
      // not currently supported.
      /* istanbul ignore next */
    } else if (node.elseBody instanceof StatementBlock) {
      elseBranchType = node.elseBody.statements.map(stmt =>
        stmt.accept(this, context)
      )[node.elseBody.statements.length - 1];
    } else {
      elseBranchType = node.elseBody.accept(this, context);
    }
    if (ifBranchType.isAssignableTo(elseBranchType)) {
      return ifBranchType;
    }
    throw new Error(
      `Incompatible branch types: if branch returned ${
        ifBranchType.name
      } but else branch returned ${elseBranchType.name}`
    );
  }

  public visitInvokeExpression(
    node: InvokeExpression,
    context: TypeScope
  ): Type {
    const result = node.target.accept(this, context);
    if (result instanceof FunctionType) {
      const parameterTypes = node.parameters.map(param =>
        param.accept(this, context)
      );
      if (parameterTypes.length !== result.parameterTypes.length) {
        const required = result.parameterTypes.map(p => p.name).join(', ');
        const provided = parameterTypes.map(p => p.name).join(', ');
        throw new Error(
          `Mismatched parameters: requires: ${required} found ${provided}`
        );
      }
      for (let i = 0; i < parameterTypes.length; i++) {
        if (!parameterTypes[i].isAssignableTo(result.parameterTypes[i])) {
          throw new Error(
            `Mismatched parameters: requires: ${result.parameterTypes
              .map(p => p.name)
              .join(', ')} found ${parameterTypes.map(p => p.name).join(', ')}`
          );
        }
      }
      return result.returnType;
    }
    throw new Error(`Invoke error: Cannot invoke non-function ${result.name}`);
  }

  public visitLiteralBoolean(_: LiteralBoolean, __: TypeScope): Type {
    return BOOLEAN_TYPE;
  }

  public visitLiteralNumber(_: LiteralNumber, __: TypeScope): Type {
    return NUMBER_TYPE;
  }

  public visitLiteralString(_: LiteralString, __: TypeScope): Type {
    return STRING_TYPE;
  }

  public visitSimpleName(node: LiteralIdentifier, scope: TypeScope): Type {
    const result = scope.lookup(node.name);
    if (result === null) {
      throw new Error(`Missing identifier: ${node.name} is not defined`);
    }
    return result;
  }

  public visitUnaryExpression(node: UnaryExpression, context: TypeScope): Type {
    const target = node.target.accept(this, context);
    const declaration = this.declarations.get(target)!;
    const method = declaration.methods[node.operator.name];
    if (method === null || method === undefined) {
      throw new Error(
        `No such method: No method ${node.operator.name} found on ${
          target.name
        }`
      );
    }
    /* istanbul ignore if */
    if (method.parameterTypes.length !== UNARY_OPERATOR_LENGTH) {
      throw new Error(
        `Mismatched parameters: requires: ${method.parameterTypes
          .map(p => p.name)
          .join(', ')} found ${target.name}`
      );
    }
    return method.returnType;
  }

  public visitReturnStatement(node: ReturnStatement, context: TypeScope): Type {
    if (node.expression !== null && node.expression !== undefined) {
      const result = node.expression.accept(this, context);
      return result;
    }
    return VOID_TYPE;
  }

  public visitVariableDeclarationStatement(
    node: VariableDeclarationStatement,
    context: TypeScope
  ): Type {
    context.store(node.name.name, node.expression.accept(this, context));
    return VOID_TYPE;
  }

  /* istanbul ignore next */
  public visitFunctionDeclaration(_: FunctionDeclaration, __: TypeScope): Type {
    throw new Error('Not supported');
  }

  /* istanbul ignore next */
  public visitParameterDeclaration(_: ParameterDeclaration, __: TypeScope): Type {
    throw new Error('Not supported');
  }
}

export class TypeScope {
  private readonly cache: Map<string, Type> = new Map();
  constructor(private readonly parent: TypeScope | null) {}

  public lookup(id: string): Type | null {
    const type = this.cache.get(id);
    if (type !== null && type !== undefined) {
      return type;
    }
    /* istanbul ignore next */
    if (this.parent !== null && this.parent !== undefined) {
      return this.parent.lookup(id);
    }
    return null;
  }

  public store(id: string, type: Type): void {
    this.cache.set(id, type);
  }
}
