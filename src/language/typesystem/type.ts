import { TypeDeclarationElement } from './element';

/**
 * An internal interface that all members of the Type union should implement.
 */
interface IType {
  /**
   * A user-readable name for the type.
   */
  name: string;

  /**
   * The kind of type this represents.
   */
  kind: TypeKind;
  /**
   * Whether this type is assignable to a declaration of the other type.
   * @param other The other type object.
   */
  isAssignableTo(other: Type): boolean;

  /**
   * Whether this type is a subtype of the other type.
   * @param other The other type object.
   */
  isSubtypeOf(other: Type): boolean;
}

/**
 * The discriminant for the Type union.
 */
export enum TypeKind {
  /**
   * A type representhing nothing.
   */
  Nothing = 'Nothing',
  /**
   * A type representing anything.
   */
  Something = 'Something',
  /**
   * A type of a function.
   */
  Function = 'Function',
  /**
   * A Type with only one implementation.
   */
  Concrete = 'Concrete',
  /**
   * A Type meant to be unused.
   */
  Void = '()',
}

/**
 * The union of different type representations.
 */
export type Type = Nothing | Something | Void | ConcreteType | FunctionType;

/**
 * The bottom type.
 *
 * There are no valid values of Nothing, instead it represents a program failure.
 */
class Nothing implements IType {
  public readonly name = 'Nothing';
  public readonly kind = TypeKind.Nothing;

  public isAssignableTo(_: Type): boolean {
    return true;
  }

  public isSubtypeOf(_: Type): boolean {
    return true;
  }
}

/**
 * The singleton instance of the Nothing type.
 */
export const NOTHING_TYPE: Type = new Nothing();

/**
 * The top type.
 *
 * Any value is a valid value of Something.
 */
class Something implements IType {
  public readonly name = 'Something';
  public readonly kind = TypeKind.Something;

  public isAssignableTo(other: Type): boolean {
    return other === this;
  }

  public isSubtypeOf(other: Type): boolean {
    return other === this;
  }
}

/**
 * The singleton instance of the Something type.
 */
export const SOMETHING_TYPE: Type = new Something();

/**
 * A top type with no values that is meant to be unused.
 */
class Void implements IType {
  public readonly name = '()';
  public readonly kind = TypeKind.Void;

  public isAssignableTo(other: Type): boolean {
    return other === this;
  }

  public isSubtypeOf(_: Type): boolean {
    return false;
  }
}

/**
 * The singleton instance of the void type.
 */
export const VOID_TYPE: Type = new Void();

/**
 * A concrete type has no parameters and exactly one supertype (Something) and
 *  exactly one subtype (Nothing);
 */
export class ConcreteType implements IType {
  public readonly kind = TypeKind.Concrete;

  constructor(
    public readonly name: string,
    private readonly element: TypeDeclarationElement
  ) {}

  public isSubtypeOf(other: Type): boolean {
    return other === this || other === SOMETHING_TYPE;
  }

  public isAssignableTo(other: Type): boolean {
    return this.isSubtypeOf(other);
  }

  /**
   * @param name the name of the method.
   */
  public resolveMethod(name: string): FunctionType | null {
    return this.element.resolveMethod(name);
  }
}

/**
 * A type of a function.
 *
 * Function types are structural.
 */
export class FunctionType implements IType {
  public get name(): string {
    return `(${this.parameterTypes.map(type => type.name).join(', ')}) -> ${
      this.returnType.name
    }`;
  }

  public readonly kind = TypeKind.Function;
  constructor(
    public readonly parameterTypes: Type[],
    public readonly returnType: Type
  ) {}

  public isSubtypeOf(other: Type): boolean {
    if (other instanceof FunctionType) {
      if (!this.returnType.isSubtypeOf(other.returnType)) {
        return false;
      }
      if (this.parameterTypes.length !== other.parameterTypes.length) {
        return false;
      }
      for (let i = 0; i < this.parameterTypes.length; i++) {
        if (!this.parameterTypes[i].isSubtypeOf(other.parameterTypes[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  public isAssignableTo(other: Type): boolean {
    return this.isSubtypeOf(other);
  }
}
