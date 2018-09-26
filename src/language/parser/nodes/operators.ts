/**
 * Valid categories for operators, ordered by precedence.
 */
export enum Precedence {
  Postfix,
  Accessor,
  Prefix,
  Multiplicative,
  Additive,
  Comparison,
  Equality,
  Conjunction,
  Disjunction,
  Assignment,
  Literal,
}

/**
 * Valid operators.
 */
export class Operator {
  public static readonly Increment = new Operator(Precedence.Postfix);
  public static readonly Decrement = new Operator(Precedence.Postfix);

  public static readonly Accessor = new Operator(Precedence.Accessor);

  public static readonly UnaryNegative = new Operator(Precedence.Prefix);
  public static readonly UnaryPositive = new Operator(Precedence.Prefix);
  public static readonly UnaryIncrement = new Operator(Precedence.Prefix);
  public static readonly UnaryDecrement = new Operator(Precedence.Prefix);
  public static readonly UnaryNegation = new Operator(Precedence.Prefix);

  public static readonly Multiply = new Operator(Precedence.Multiplicative);
  public static readonly Divide = new Operator(Precedence.Multiplicative);
  public static readonly Modulus = new Operator(Precedence.Multiplicative);

  public static readonly Add = new Operator(Precedence.Additive);
  public static readonly Subtract = new Operator(Precedence.Additive);

  public static readonly Less = new Operator(Precedence.Comparison);
  public static readonly Greater = new Operator(Precedence.Comparison);
  public static readonly LessOrEqual = new Operator(Precedence.Comparison);
  public static readonly GreaterOrEqual = new Operator(Precedence.Comparison);

  public static readonly Equal = new Operator(Precedence.Equality);
  public static readonly NotEqual = new Operator(Precedence.Equality);
  public static readonly Identical = new Operator(Precedence.Equality);
  public static readonly NotIdentical = new Operator(Precedence.Equality);

  public static readonly And = new Operator(Precedence.Conjunction);
  public static readonly Or = new Operator(Precedence.Disjunction);

  public static readonly Assign = new Operator(Precedence.Assignment);
  public static readonly AddAssign = new Operator(Precedence.Assignment);
  public static readonly SubtractAssign = new Operator(Precedence.Assignment);
  public static readonly MultiplyAssign = new Operator(Precedence.Assignment);
  public static readonly DivideAssign = new Operator(Precedence.Assignment);
  public static readonly ModulusAssign = new Operator(Precedence.Assignment);

  private constructor(public readonly kind: Precedence) {}
}
