/**
 * Represents a statically analyazed node.
 *
 * Elements sometimes but do not always link back to a parsed AST node, and can
 * be either synthetic or a higher-level construct that does not exist purely in
 * source code.
 */
export abstract class ElementNode {
  // NOTE: This class exists in "types.ts", not "nodes.ts" to avoid circularity.
}

/**
 * A type within the type system.
 */
export abstract class Type {
  /**
   * Origin of the type within the element tree, if any.
   */
  public abstract get element(): ElementNode | undefined;

  /**
   * Returns whether this type is exactly the same as @param other.
   */
  public isExact(other: Type): boolean {
    return other === this;
  }
}

/**
 * A type that is synthetic to the language and cannot be constructed elsewhere.
 *
 * Built-in types do not have a `type` definition, and are meant to be used in
 * precise areas where having a specialized type is important to static analysis
 * or type inference.
 *
 * All known built-in types are:
 * - @see Nothing
 * - @see Something
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

  /**
   * Built-in types do not have elements.
   */
  public element = undefined;

  private constructor() {
    super();
  }
}

/**
 * A type that is _external_ to the language, that is, may be defined elsewhere.
 *
 * External types are canonicalized based on two properties:
 * - @member name, or the name of the type, such as `Foo`.
 * - @member source, or the source module of the type. A blank source is legal
 *   when there is no import required to locate the external type, such as the
 *   top-level `String` type in the JavaScript SDK.
 *
 * For convenience, some external types are predefined in the SDK:
 * - @see Boolean
 * - @see Number
 * - @see String
 *
 * However, all external types can be declared using `external type` notation:
 * ```
 * external type Foo {
 *   // ...
 * }
 * ```
 */
export class ExternalType extends Type {
  /**
   * Represents the top-level `Boolean` SDK type.
   */
  public static readonly Boolean = new ExternalType('Boolean');

  /**
   * Represents the top-level `Number` SDK type.
   */
  public static readonly Number = new ExternalType('Number');

  /**
   * Represents the top-level `String` SDK type.
   */
  public static readonly String = new ExternalType('String');

  public constructor(
    public readonly name: string,
    public readonly source?: string
  ) {
    super();
  }

  public get element(): ElementNode | undefined {
    return undefined;
  }

  public isExact(other: Type): boolean {
    return (
      other instanceof ExternalType &&
      other.name === this.name &&
      other.source === this.source
    );
  }
}
