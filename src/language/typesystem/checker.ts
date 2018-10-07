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
import { Expression, ParameterDeclaration } from '../parser/nodes/nodes';
import { StatementBlock } from '../parser/nodes/statements';
import { CORE_MODULE } from './core';
import { ModuleDeclarationElement } from './element';
import {
  AssignmentError,
  MissingIdentifier,
  NoSuchMethodError,
  ParameterLengthError,
} from './errors';
import { SOMETHING_TYPE, Type, TypeKind, VOID_TYPE } from './type';

interface ITypeCheckerContext {
  module: ModuleDeclarationElement;
  scope: LocalScope;
}

const STRING_TYPE = CORE_MODULE.resolveType('String')!;
const BOOLEAN_TYPE = CORE_MODULE.resolveType('Boolean')!;
const NUMBER_TYPE = CORE_MODULE.resolveType('Number')!;

export class TypeCheckingVisitor extends AstVisitor<Type, ITypeCheckerContext> {
  public visitFileRoot(node: FileRoot, context: ITypeCheckerContext): Type {
    for (const element of node.topLevelElements) {
      element.accept(this, context);
    }
    return VOID_TYPE;
  }

  public visitBinaryExpression(
    node: BinaryExpression,
    context: ITypeCheckerContext
  ): Type {
    const left = node.left.accept(this, context);
    const right = node.right.accept(this, context);
    switch (left.kind) {
      case TypeKind.Concrete: {
        const method = left.resolveMethod(node.operator.name);
        if (method === null || method === undefined) {
          throw new NoSuchMethodError(node.operator.name, left);
        }
        if (!right.isAssignableTo(method.parameterTypes[0])) {
          throw new AssignmentError(method.parameterTypes[0], right);
        }
        return method.returnType;
      }
      case TypeKind.Function:
      case TypeKind.Something:
      case TypeKind.Nothing:
      case TypeKind.Void:
        /* istanbul ignore next */
        throw new Error('Unreachable');
    }
  }

  public visitGroupExpression(
    node: GroupExpression,
    context: ITypeCheckerContext
  ): Type {
    return node.expression.accept(this, context);
  }

  public visitConditionalExpression(
    node: ConditionalExpression,
    context: ITypeCheckerContext
  ): Type {
    const ifType = node.condition.accept(this, context);
    if (!ifType.isAssignableTo(BOOLEAN_TYPE)) {
      throw new AssignmentError(BOOLEAN_TYPE, ifType);
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
    return SOMETHING_TYPE;
  }

  public visitInvokeExpression(
    node: InvokeExpression,
    context: ITypeCheckerContext
  ): Type {
    const result: Type = node.target.accept(this, context);
    switch (result.kind) {
      case TypeKind.Function: {
        const argumentTypes = node.parameters.map(param =>
          param.accept(this, context)
        );
        if (argumentTypes.length !== result.parameterTypes.length) {
          throw new ParameterLengthError(
            result.name,
            result.parameterTypes.length,
            argumentTypes.length
          );
        }
        for (let i = 0; i < argumentTypes.length; i++) {
          if (!argumentTypes[i].isAssignableTo(result.parameterTypes[i])) {
            throw new AssignmentError(
              result.parameterTypes[i],
              argumentTypes[i]
            );
          }
        }
        return result.returnType;
      }
      case TypeKind.Concrete:
      case TypeKind.Nothing:
      case TypeKind.Something:
      case TypeKind.Void:
        /* istanbul ignore next */
        throw new Error('Unreachable');
    }
  }

  public visitLiteralBoolean(_: LiteralBoolean, __: ITypeCheckerContext): Type {
    return BOOLEAN_TYPE;
  }

  public visitLiteralNumber(_: LiteralNumber, __: ITypeCheckerContext): Type {
    return NUMBER_TYPE;
  }

  public visitLiteralString(_: LiteralString, __: ITypeCheckerContext): Type {
    return STRING_TYPE;
  }

  public visitSimpleName(
    node: LiteralIdentifier,
    context: ITypeCheckerContext
  ): Type {
    const result =
      context.scope.lookup(node.name) || context.module.resolveType(node.name);
    if (result === null) {
      throw new MissingIdentifier(node.name);
    }
    return result;
  }

  public visitUnaryExpression(
    node: UnaryExpression,
    context: ITypeCheckerContext
  ): Type {
    const target = node.target.accept(this, context)!;
    switch (target.kind) {
      case TypeKind.Concrete: {
        const method = target.resolveMethod(node.operator.name);
        if (method === null || method === undefined) {
          throw new NoSuchMethodError(node.operator.name, target);
        }
        return method.returnType;
      }
      case TypeKind.Something:
      case TypeKind.Nothing:
      case TypeKind.Function:
      case TypeKind.Void:
        /* istanbul ignore next */
        throw new Error('Unreachable');
    }
  }

  public visitReturnStatement(
    node: ReturnStatement,
    context: ITypeCheckerContext
  ): Type {
    if (node.expression !== null && node.expression !== undefined) {
      const result = node.expression.accept(this, context);
      return result;
    }
    return VOID_TYPE;
  }

  public visitVariableDeclarationStatement(
    node: VariableDeclarationStatement,
    context: ITypeCheckerContext
  ): Type {
    context.scope.store(node.name.name, node.expression.accept(this, context));
    return VOID_TYPE;
  }

  public visitFunctionDeclaration(
    node: FunctionDeclaration,
    context: ITypeCheckerContext
  ): Type {
    const functionType = context.module.resolveType(node.name.name)!;
    switch (functionType.kind) {
      case TypeKind.Function: {
        const scope = new LocalScope();
        for (const param of node.parameters) {
          const paramType =
            param.type === undefined
              ? SOMETHING_TYPE
              : context.module.resolveType(param.type.name);
          if (paramType === null) {
            throw new Error('5');
          }
          scope.store(param.name.name, paramType);
        }
        if (node.body instanceof Expression) {
          const actualRetunType = node.body.accept(this, {
            module: context.module,
            scope,
          });
          if (!actualRetunType.isAssignableTo(functionType.returnType)) {
            throw new AssignmentError(functionType.returnType, actualRetunType);
          }
        } else {
          /* istanbul ignore next */
          throw new Error('Unsupported');
        }
        return VOID_TYPE;
      }
      case TypeKind.Concrete:
      case TypeKind.Something:
      case TypeKind.Nothing:
      case TypeKind.Void:
        /* istanbul ignore next */
        throw new Error('Unreachable');
    }
  }

  public visitParameterDeclaration(
    _: ParameterDeclaration,
    __: ITypeCheckerContext
  ): Type {
    // NOTE: only the element tree handles parameter declarations.
    /* istanbul ignore next */
    throw new Error('Unreachable');
  }
}

/**
 * A scope for tracking the types of local variables and type promotions.
 */
export class LocalScope {
  private readonly cache: Map<string, Type> = new Map();
  constructor(private readonly parent?: LocalScope | undefined) {}

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
