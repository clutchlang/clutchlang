/**
 * A type is a restrictions on the values that parts of a program may accept.
 */
abstract class Type {
  /**
   * Whether this type is assignable to a declaration of the other type.
   * @param other The other type object.
   */
  public abstract isAssignableTo(other: Type): boolean;

  /**
   * A user-readable name for the type.
   */
  public abstract get name(): string;
}

/**
 * A type that is only assignable to identical type objects.
 */
class ExactType extends Type {
  constructor(public readonly name: string) {
    super();
  }

  public isAssignableTo(other: Type): boolean {
    return other === this;
  }
}

/**
 * The type of Strings.
 */
export const STRING_TYPE: Type = new ExactType('String');

/**
 * The type of Numbers.
 */
export const NUMBER_TYPE: Type = new ExactType('Number');

/**
 * The type of Booleans.
 */
export const BOOLEAN_TYPE: Type = new ExactType('Boolean');

/**
 * The Void type.
 *
 * This represents "no value."
 */
export const VOID_TYPE: Type = new ExactType('()');

/**
 * The bottom type.
 *
 * This represents a program failure or exception.
 */
export const BOTTOM_TYPE: Type = new ExactType('⊥');

/**
 * A type of a function.
 *
 * Function types are structural.
 */
export class FunctionType extends Type {
  constructor(
    public readonly parameterTypes: Type[],
    public readonly returnType: Type
  ) {
    super();
  }

  public get name(): string {
    return `(${this.parameterTypes.map(type => type.name).join(', ')}) -> ${
      this.returnType.name
    }`;
  }

  public isAssignableTo(other: Type): boolean {
    if (other instanceof FunctionType) {
      if (!this.returnType.isAssignableTo(other.returnType)) {
        return false;
      }
      if (this.parameterTypes.length !== other.parameterTypes.length) {
        return false;
      }
      for (let i = 0; i < this.parameterTypes.length; i++) {
        if (!this.parameterTypes[i].isAssignableTo(other.parameterTypes[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}
