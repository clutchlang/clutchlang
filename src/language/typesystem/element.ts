import { FileRoot, FunctionDeclaration } from '../parser/nodes/nodes';
import { VariableDeclarationStatement } from '../parser/nodes/statements';

import {
  ConcreteType,
  FunctionType,
  NOTHING_TYPE,
  SOMETHING_TYPE,
  Type,
  VOID_TYPE,
} from './type';

interface IModuleJSON {
  name: string;
  functions: IFunctionJSON[];
  variables: IVariableJSON[];
  types: ITypeJSON[];
}

interface IFunctionJSON {
  name: string;
  isConst: boolean;
  type: {
    parameterTypes: string[];
    returnType: string;
  };
}

interface IVariableJSON {
  name: string;
  type: string;
  isConst: boolean;
}

interface ITypeJSON {
  name: string;
  methods: IFunctionJSON[];
}

/**
 * Create an outline of a clutch file.
 * @param root
 * @param name
 */
export function outline(
  root: FileRoot,
  name: string
): ModuleDeclarationElement {
  const parent = new ModuleDeclarationElement(name);
  root.topLevelElements.forEach(node => {
    if (node instanceof FunctionDeclaration) {
      parent.functions.push(FunctionDeclarationElement.fromNode(node, parent));
    } else if (node instanceof VariableDeclarationStatement) {
      parent.variables.push(VariableDeclarationElement.fromNode(node, parent));
    }
  });
  return parent;
}

/**
 * Represents all of the top level declarations of a module.
 */
export class ModuleDeclarationElement implements Element {
  /**
   * Create an element tree from a JSON summary.
   * @param object The JSON summary.
   */
  public static fromJSON(object: IModuleJSON): ModuleDeclarationElement {
    const module = new ModuleDeclarationElement(object.name);
    for (const fn of object.functions) {
      const deserialized = FunctionDeclarationElement.fromJSON(fn, module);
      module.functions.push(deserialized);
    }
    for (const type of object.types) {
      const deserialized = TypeDeclarationElement.fromJSON(type, module);
      module.types.push(deserialized);
    }
    for (const variable of object.variables) {
      const deserialized = VariableDeclarationElement.fromJSON(
        variable,
        module
      );
      module.variables.push(deserialized);
    }
    return module;
  }

  public readonly imports: ModuleDeclarationElement[] = [];
  public readonly functions: FunctionDeclarationElement[] = [];
  public readonly types: TypeDeclarationElement[] = [];
  public readonly variables: VariableDeclarationElement[] = [];

  /**
   * Cached lookups for all type information.
   * TODO: make this work for real once we have type declarations.
   */
  private readonly typeCache: Map<string, Type> = new Map([
    ['()', VOID_TYPE],
    ['Nothing', NOTHING_TYPE],
    ['Something', SOMETHING_TYPE],
  ]);
  constructor(public readonly name: string) {}

  /**
   * Given a name of a type, return the Type object.
   *
   * Reutrn null if the type could not be resolved.
   * @param name the name of a type.
   */
  public resolveType(name: string): Type | null {
    const cachedType = this.typeCache.get(name);
    if (cachedType !== null && cachedType !== undefined) {
      return cachedType;
    }
    // Currently this could only be a function type.
    for (const fn of this.functions) {
      if (name === fn.name) {
        const resultType = fn.computeType();
        this.typeCache.set(name, resultType);
        return resultType;
      }
    }
    for (const variable of this.variables) {
      if (name === variable.name) {
        const resultType = variable.computeType();
        this.typeCache.set(name, resultType);
        return resultType;
      }
    }
    for (const type of this.types) {
      if (name === type.name) {
        this.typeCache.set(name, type.type);
        return type.type;
      }
    }
    for (const module of this.imports) {
      const result = module.resolveType(name);
      if (result !== null) {
        this.typeCache.set(name, result);
        return result;
      }
    }
    return null;
  }

  public toJSON() {
    return {
      functions: this.functions.map(fn => fn.toJSON),
      imports: this.imports.map(im => im.name),
      name: this.name,
      types: this.types.map(tp => tp.toJSON),
      variable: this.variables.map(vr => vr.toJSON),
    };
  }
}

/**
 * A semantic unit of code.
 *
 * An element is part of the semantic representation of clutch code, along with
 * types. As opposed to the AST, which is the syntactic representation. Not all
 * AST nodes have a corresponding element, but all elements have a corresponding
 * AST node.
 */
export abstract class Element {
  /**
   * Create a JSON representation of this element.
   */
  public abstract toJSON(): object;
}

/**
 * Represents a top level variable within a module.
 */
export class VariableDeclarationElement implements Element {
  /**
   * Create a variable declaration from an AST node.
   */
  public static fromNode(
    node: VariableDeclarationStatement,
    parent: ModuleDeclarationElement
  ): VariableDeclarationElement {
    // TODO: canonicalize names across modules (mod1::name).
    const name = node.name.name;
    const result = new VariableDeclarationElement(
      parent,
      name,
      '', // TODO: should top level variables require an explicit type?
      node.isConst
    );
    parent.variables.push(result);
    return result;
  }

  /**
   * Create a variable declaration from a JSON summary.
   * @param object The partial JSON summary
   * @param parent the parent module
   */
  public static fromJSON(
    object: IVariableJSON,
    parent: ModuleDeclarationElement
  ): VariableDeclarationElement {
    return new VariableDeclarationElement(
      parent,
      object.name,
      object.type,
      object.isConst
    );
  }

  /**
   * The cached value of the computed type.
   */
  private computedType: Type | null = null;
  private constructor(
    public readonly parent: ModuleDeclarationElement,
    public readonly name: string,
    public readonly type: string,
    public readonly isConst: boolean
  ) {}

  /**
   * Compute the type of this variable.
   */
  public computeType(): Type {
    /* istanbul ignore if */
    if (this.computedType !== null) {
      return this.computedType;
    }
    this.computedType = this.parent.resolveType(this.type) || NOTHING_TYPE;
    return this.computedType;
  }

  public toJSON(): IVariableJSON {
    return {
      isConst: this.isConst,
      name: this.name,
      type: this.type,
    };
  }
}

/**
 * Represents the declaration of a function.
 */
export class FunctionDeclarationElement implements Element {
  /**
   * Create a function declaration from an AST node.
   */
  public static fromNode(
    node: FunctionDeclaration,
    parent: ModuleDeclarationElement
  ): FunctionDeclarationElement {
    const name = node.name.name;
    const parameterTypes = node.parameters.map(
      param => (param.type === undefined ? 'Something' : param.type.name)
    );
    const returnType =
      node.returnType === undefined ? VOID_TYPE.name : node.returnType.name;
    const isConst = node.isConst;
    const result = new FunctionDeclarationElement(
      parent,
      isConst,
      name,
      parameterTypes,
      returnType
    );
    parent.functions.push(result);
    return result;
  }

  /**
   * Create a function declaration from a JSON summary.
   * @param object The partial JSON summary
   * @param parent the parent module
   */
  public static fromJSON(
    object: IFunctionJSON,
    parent: ModuleDeclarationElement
  ): FunctionDeclarationElement {
    return new FunctionDeclarationElement(
      parent,
      object.isConst,
      object.name,
      object.type.parameterTypes,
      object.type.returnType
    );
  }

  private computedType: FunctionType | null = null;
  private constructor(
    public readonly parent: ModuleDeclarationElement,
    public readonly isConst: boolean,
    public readonly name: string,
    private readonly parameterTypes: string[],
    private readonly returnType: string
  ) {}

  public toJSON(): IFunctionJSON {
    return {
      isConst: this.isConst,
      name: this.name,
      type: {
        parameterTypes: this.parameterTypes,
        returnType: this.returnType,
      },
    };
  }

  /**
   * Compute the type defined by this function declaration.
   */
  public computeType(): FunctionType {
    /* istanbul ignore if */
    if (this.computedType !== null) {
      return this.computedType;
    }
    const parameters = this.parameterTypes.map(
      param => this.parent.resolveType(param) || NOTHING_TYPE
    );
    const returnType = this.parent.resolveType(this.returnType) || NOTHING_TYPE;
    this.computedType = new FunctionType(parameters, returnType);
    return this.computedType;
  }
}

/**
 * Represents the declaration of a type.
 */
export class TypeDeclarationElement implements Element {
  /**
   * Create a type declaration from a JSON summary.
   * @param object The partial summary object.
   * @param parent The parent module.
   */
  public static fromJSON(
    object: ITypeJSON,
    parent: ModuleDeclarationElement
  ): TypeDeclarationElement {
    const deserialized = new TypeDeclarationElement(parent, object.name, false);
    for (const method of object.methods) {
      deserialized.methods.push(
        MethodDeclarationElement.fromJSON(method, deserialized)
      );
    }
    return deserialized;
  }

  public readonly methods: MethodDeclarationElement[] = [];
  public readonly type: ConcreteType;
  private constructor(
    public readonly parent: ModuleDeclarationElement,
    public readonly name: string,
    public readonly isExternal: boolean
  ) {
    this.type = new ConcreteType(name, this);
  }

  public resolveType(name: string): Type {
    return this.parent.resolveType(name) || NOTHING_TYPE;
  }

  /**
   * Resolve the type of the method.
   * @param name the name of the method.
   */
  public resolveMethod(name: string): FunctionType | null {
    const method = this.methods.find(m => m.name === name);
    if (method === undefined) {
      return null;
    }
    return method.computeType();
  }

  public toJSON(): object {
    return {
      isExternal: this.isExternal,
      methods: this.methods.map(method => method.toJSON()),
      name: this.name,
    };
  }
}

/**
 * Represents the declaration of a method on a Type.
 */
export class MethodDeclarationElement implements Element {
  /**
   * Create a method declaration from a JSON summary.
   * @param object The partial summary object.
   * @param parent The parent Type this is contained in.
   */
  public static fromJSON(
    object: IFunctionJSON,
    parent: TypeDeclarationElement
  ): MethodDeclarationElement {
    return new MethodDeclarationElement(
      parent,
      object.name,
      object.type.parameterTypes,
      object.type.returnType
    );
  }

  private computedType: FunctionType | null = null;
  /**
   * constructs a new method declaration element.
   * @param parent The TypeDeclaration this is contained in.
   * @param name The name of the method.
   * @param parameterTypes The local declared type names of the formal parameters.
   * @param returnType The local declared return type name.
   */
  private constructor(
    public readonly parent: TypeDeclarationElement,
    public readonly name: string,
    public readonly parameterTypes: string[],
    public readonly returnType: string
  ) {}

  /**
   * Compute the type of this method.
   */
  public computeType(): FunctionType {
    if (this.computedType !== null) {
      return this.computedType;
    }
    const parameters = this.parameterTypes.map(param =>
      this.parent.resolveType(param)
    );
    const returnType = this.parent.resolveType(this.returnType);
    this.computedType = new FunctionType(parameters, returnType);
    return this.computedType;
  }

  public toJSON(): IFunctionJSON {
    return {
      isConst: false,
      name: this.name,
      type: {
        parameterTypes: this.parameterTypes,
        returnType: this.returnType,
      },
    };
  }
}
