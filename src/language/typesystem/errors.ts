import { Type } from './type';

/**
 * An error thrown when attempting to assign a type that is not assignable.
 */
/* istanbul ignore next */
export class AssignmentError {
  constructor(public readonly expected: Type, public readonly actual: Type) {}

  public toString() {
    return `AssignmentError: Cannot assign type ${this.actual.name} to ${
      this.expected.name
    }`;
  }
}

/**
 * An error thrown when attempting to invoke a method that does not exist on
 * a type.
 */
/* istanbul ignore next */
export class NoSuchMethodError {
  constructor(public readonly method: string, public readonly target: Type) {}

  public toString() {
    return `NoSuchMethodError: Method ${this.method} does not exist on type ${
      this.target.name
    }`;
  }
}

/**
 * An error thrown when invoking a method or operator with the wrong number of
 * parameters.
 */
/* istanbul ignore next */
export class ParameterLengthError {
  constructor(
    public readonly method: string,
    public readonly expected: number,
    public readonly actual: number
  ) {}

  public toString() {
    return `ParameterLengthError: Method ${this.method} has ${
      this.expected
    } parameters but was invoked with ${this.actual}.`;
  }
}

/**
 * An error thrown when attempting to reference an identifier that isn't
 * defined.
 */
/* istanbul ignore next */
export class MissingIdentifier {
  constructor(public readonly identifier: string) {}

  public toString() {
    return `MissingIdentifier: No identifier ${this.identifier} defined`;
  }
}
