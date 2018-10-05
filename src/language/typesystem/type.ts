/**
 * A type is a restrictions on the values that parts of a program may accept.
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
  isAssignableTo(other: IType): boolean;

  /**
   * Whether this type is a subtype of the other type.
   * @param other The other type object.
   */
  isSubtypeOf(other: IType): boolean;

  /**
   * Whether this type is a supertype of the other type.
   * @param other the other type object.
   */
  isSupertypeOf(other: IType): boolean;
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
}

/**
 * The union of different type representations.
 */
export type Type = Nothing | Something | ConcreteType | FunctionType;

/**
 * The bottom type.
 *
 * There are no valid values of Nothing, instead it represents a program failure.
 */
class Nothing implements IType {

  public readonly name = 'Nothing';
  public readonly kind = TypeKind.Nothing;
  public isAssignableTo(_: IType): boolean {
    return true;
  }

  public isSubtypeOf(_: IType): boolean {
    return true;
  }

  public isSupertypeOf(_: IType): boolean {
    return false;
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
  public isAssignableTo(other: IType): boolean {
    return other === this;
  }

  public isSubtypeOf(_: IType): boolean {
    return false;
  }

  public isSupertypeOf(_: IType): boolean {
    return true;
  }
}

/**
 * The singleton instance of the Something type.
 */
export const SOMETHING_TYPE: Type = new Something();

/**
 * A concrete type has no parameters and exactly one supertype (Something) and
 *  exactly one subtype (Nothing);
 */
export class ConcreteType implements IType {

  public readonly methods: FunctionType[] = [];
  public readonly kind = TypeKind.Concrete;
  constructor(public readonly name: string) {}

  public isSubtypeOf(other: IType): boolean {
    return other === this || other === SOMETHING_TYPE;
  }

  public isSupertypeOf(other: IType): boolean {
    return other === NOTHING_TYPE;
  }

  public isAssignableTo(other: IType): boolean {
    return this.isSubtypeOf(other);
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

  public isSubtypeOf(other: IType): boolean {
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

  public isSupertypeOf(other: IType): boolean {
    return other === NOTHING_TYPE;
  }

  public isAssignableTo(other: IType): boolean {
    return this.isSubtypeOf(other);
  }
}

/**
 * The Void type.
 *
 * This represents "no value."
 */
export const VOID_TYPE: Type = new ConcreteType('()');
