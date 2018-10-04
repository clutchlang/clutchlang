import { Operator } from '../parser';

/**
 * A method is defined as a function where the first argument is typed
 * as the reciever.
 */
interface IMethodTable {
  [index: string]: FunctionType;
}

/**
 * A type is a restrictions on the values that parts of a program may accept.
 */
export abstract class Type {
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
 * The defined interface of a type.
 */
export class TypeDeclaration {
  constructor(
    public readonly type: Type,
    public readonly methods: IMethodTable
  ) {}
}

/**
 * A type that is only assignable to identical type objects.
 */
export class ExactType extends Type {
  constructor(public readonly name: string) {
    super();
  }

  public isAssignableTo(other: Type): boolean {
    return other === this;
  }
}

/**
 * A type of a function.
 *
 * Function types are structural.
 */
export class FunctionType extends Type {
  public get name(): string {
    return `(${this.parameterTypes.map(type => type.name).join(', ')}) -> ${
      this.returnType.name
    }`;
  }
  public methods: IMethodTable = {};
  constructor(
    public readonly parameterTypes: Type[],
    public readonly returnType: Type
  ) {
    super();
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
 * The declaration of the Boolean type.
 */
export const BOOLEAN_DECLARATION = new TypeDeclaration(BOOLEAN_TYPE, {
  [Operator.LogicalAnd.name]: new FunctionType(
    [BOOLEAN_TYPE, BOOLEAN_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.LogicalAnd.name]: new FunctionType(
    [BOOLEAN_TYPE, BOOLEAN_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.LogicalNot.name]: new FunctionType([BOOLEAN_TYPE], BOOLEAN_TYPE),
  [Operator.Equality.name]: new FunctionType(
    [BOOLEAN_TYPE, BOOLEAN_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.Inequality.name]: new FunctionType(
    [BOOLEAN_TYPE, BOOLEAN_TYPE],
    BOOLEAN_TYPE
  ),
});

/**
 * The declaration of the number type.
 */
export const NUMBER_DECLARATION = new TypeDeclaration(NUMBER_TYPE, {
  [Operator.PrefixIncrement.name]: new FunctionType([NUMBER_TYPE], NUMBER_TYPE),
  [Operator.PostfixIncrement.name]: new FunctionType(
    [NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.PrefixDecrement.name]: new FunctionType([NUMBER_TYPE], NUMBER_TYPE),
  [Operator.PostfixDecrement.name]: new FunctionType(
    [NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.Addition.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.Subtraction.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.Multiplication.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.Division.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.Remainder.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    NUMBER_TYPE
  ),
  [Operator.Equality.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.Inequality.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.LessThan.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.GreaterThan.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.LessThanOrEqual.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    BOOLEAN_TYPE
  ),
  [Operator.GreaterThanOrEqual.name]: new FunctionType(
    [NUMBER_TYPE, NUMBER_TYPE],
    BOOLEAN_TYPE
  ),
});
