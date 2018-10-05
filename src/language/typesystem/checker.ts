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
import { CORE_MODULE } from './core';
import { ModuleDeclarationElement, outline } from './element';
import {
  FunctionType,
  SOMETHING_TYPE,
  Type,
  TypeKind,
  VOID_TYPE,
} from './type';

interface ITypeCheckerContext {
  module: ModuleDeclarationElement;
  scope: LocalScope;
}

export class TypeCheckingVisitor extends AstVisitor<Type, ITypeCheckerContext> {
  public visitFileRoot(node: FileRoot, context: ITypeCheckerContext): Type {
    context.module = outline(node, 'main');
    context.module.imports.push(CORE_MODULE);
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
        const method = left.methods.find(m => m.name === node.operator.name);
        if (method === null || method === undefined) {
          throw new Error('');
        }
        // TODO: refactor this into a separate type checker.
        if (!right.isAssignableTo(method.parameterTypes[1])) {
          throw new Error('');
        }
        return method.returnType;
      }
      case TypeKind.Function:
      case TypeKind.Something:
      case TypeKind.Nothing:
        throw new Error('');
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
    if (!ifType.isAssignableTo(context.module.resolveType('Boolean')!)) {
      throw new Error('');
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
    throw new Error('');
  }

  public visitInvokeExpression(
    node: InvokeExpression,
    context: ITypeCheckerContext
  ): Type {
    const result = node.target.accept(this, context);
    if (result instanceof FunctionType) {
      const parameterTypes = node.parameters.map(param =>
        param.accept(this, context)
      );
      if (parameterTypes.length !== result.parameterTypes.length) {
        throw new Error('');
      }
      for (let i = 0; i < parameterTypes.length; i++) {
        if (!parameterTypes[i].isAssignableTo(result.parameterTypes[i])) {
          throw new Error('');
        }
      }
      return result.returnType;
    }
    throw new Error('');
  }

  public visitLiteralBoolean(
    _: LiteralBoolean,
    context: ITypeCheckerContext
  ): Type {
    return context.module.resolveType('Boolean')!;
  }

  public visitLiteralNumber(
    _: LiteralNumber,
    context: ITypeCheckerContext
  ): Type {
    return context.module.resolveType('Number')!;
  }

  public visitLiteralString(
    _: LiteralString,
    context: ITypeCheckerContext
  ): Type {
    return context.module.resolveType('String')!;
  }

  public visitSimpleName(
    node: LiteralIdentifier,
    context: ITypeCheckerContext
  ): Type {
    const result = context.scope.lookup(node.name);
    if (result === null) {
      throw new Error('');
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
        const method = target.methods.find(m => m.name === node.operator.name);
        if (method === null || method === undefined) {
          throw new Error('');
        }
        return method.returnType;
      }
      case TypeKind.Something:
      case TypeKind.Nothing:
      case TypeKind.Function:
        throw new Error('');
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
            throw new Error('');
          }
          scope.store(param.name.name, paramType);
        }
      }
      case TypeKind.Concrete:
      case TypeKind.Something:
      case TypeKind.Nothing:
        throw new Error('');
    }
    return VOID_TYPE;
  }

  public visitParameterDeclaration(
    node: ParameterDeclaration,
    context: ITypeCheckerContext
  ): Type {
    if (node.type === undefined) {
      return SOMETHING_TYPE;
    }
    const type = context.module.resolveType(node.name.name);
    if (type === null) {
      throw new Error('');
    }
    return type;
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
