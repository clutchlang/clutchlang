/**
 * A type within the type system.
 */
export abstract class Type {
  /**
   * Returns whether this type is exactly the same as @param other.
   */
  public isExact(other: Type): boolean {
    return other === this;
  }
}

/**
 * A type that is synthetic to the language and cannot be constructed elsewhere.
 */
export class BuiltInType extends Type {
  /**
   * Represents the _bottom_ type.
   */
  public static readonly Nothing = new BuiltInType();

  /**
   * Represents the _top_ type.
   */
  public static readonly Something = new BuiltInType();

  private constructor() {
    super();
  }
}

/**
 * A type that is external to the language.
 */
export class ExternalType extends Type {
  /**
   * Represents the top-level `Boolean` system type.
   */
  public static readonly Boolean = new ExternalType('Boolean');

  /**
   * Represents the top-level `Number` system type.
   */
  public static readonly Number = new ExternalType('Number');

  /**
   * Represents the top-level `String` system type.
   */
  public static readonly String = new ExternalType('String');

  public constructor(
    public readonly name: string,
    public readonly source?: string
  ) {
    super();
  }

  public isExact(other: Type): boolean {
    return (
      other instanceof ExternalType &&
      other.name === this.name &&
      other.source === this.source
    );
  }
}
