// tslint:disable:no-magic-numbers

/**
 * Defines the precedence of operators in expressions (enum-like).
 *
 * Any sub-type of @see Precedence must be one of the static members.
 */
export class Precedence {
  public static readonly Grouping = new Precedence('Grouping', 14);
  public static readonly MemberAccess = new Precedence('Member Access', 13);
  public static readonly FunctionCall = new Precedence('Function Call', 12);
  public static readonly Postfix = new Precedence('Assignment', 11);
  public static readonly Prefix = new Precedence('Assignment', 10);
  public static readonly Multiplicative = new Precedence('Assignment', 9);
  public static readonly Additive = new Precedence('Assignment', 8);
  public static readonly BitwiseShift = new Precedence('Bitwise Shift', 7);
  public static readonly Comparison = new Precedence('Comparison', 6);
  public static readonly Equality = new Precedence('Equality', 5);
  public static readonly LogicalAnd = new Precedence('Logical And', 4);
  public static readonly LogicalOr = new Precedence('Logical Or', 3);
  public static readonly Conditional = new Precedence('Conditional', 2);
  public static readonly Assignment = new Precedence('Assignment', 1);

  private constructor(
    public readonly name: string,
    public readonly order: number
  ) {}
}

/**
 * Rules of @see Operator association.
 */
export enum Associativity {
  /**
   * An operator that occurs between two expressions.
   */
  Binary,

  /**
   * An operator that occurs before an expression.
   */
  Prefix,

  /**
   * An operator that occurs after an expression.
   */
  Postfix,

  /**
   * An operator that has rules not encompassed by other associations.
   */
  Other,
}

/**
 * Defines an operator understood by the language syntax.
 */
export class Operator {
  public static readonly Grouping = new Operator(
    'Grouping',
    '( … )',
    Precedence.Grouping,
    Associativity.Other
  );

  public static readonly MemberAccess = new Operator(
    'Member Access',
    '… . …',
    Precedence.MemberAccess,
    Associativity.Binary
  );

  public static readonly FunctionCall = new Operator(
    'Function Call',
    '… . ( …* )',
    Precedence.FunctionCall,
    Associativity.Other
  );

  public static readonly PostfixIncrement = new Operator(
    'Postfix Increment',
    '… ++',
    Precedence.Postfix,
    Associativity.Postfix
  );

  public static readonly PostfixDecrement = new Operator(
    'Postfix Decrement',
    '… --',
    Precedence.Postfix,
    Associativity.Postfix
  );

  public static readonly LogicalNot = new Operator(
    'Logical Not',
    '! …',
    Precedence.Prefix,
    Associativity.Prefix
  );

  public static readonly BitwiseNot = new Operator(
    'Bitwise Not',
    '~ …',
    Precedence.Prefix,
    Associativity.Prefix
  );

  public static readonly UnaryPositive = new Operator(
    'Unary Positive',
    '+ …',
    Precedence.Prefix,
    Associativity.Prefix
  );

  public static readonly UnaryNegative = new Operator(
    'Unary Negative',
    '- …',
    Precedence.Prefix,
    Associativity.Prefix
  );

  public static readonly PrefixIncrement = new Operator(
    'Prefix Increment',
    '++ …',
    Precedence.Prefix,
    Associativity.Prefix
  );

  public static readonly PrefixDecrement = new Operator(
    'Prefix Decrement',
    '-- …',
    Precedence.Prefix,
    Associativity.Prefix
  );

  public static readonly Multiplication = new Operator(
    'Multiplication',
    '… * …',
    Precedence.Multiplicative,
    Associativity.Binary
  );

  public static readonly Division = new Operator(
    'Division',
    '… / …',
    Precedence.Multiplicative,
    Associativity.Binary
  );

  public static readonly Remainder = new Operator(
    'Remainder',
    '… % …',
    Precedence.Multiplicative,
    Associativity.Binary
  );

  public static readonly Addition = new Operator(
    'Addition',
    '… + …',
    Precedence.Additive,
    Associativity.Binary
  );

  public static readonly Subtraction = new Operator(
    'Subtraction',
    '… - …',
    Precedence.Additive,
    Associativity.Binary
  );

  public static readonly BitwiseLeftShift = new Operator(
    'Bitwise Left Shift',
    '… << …',
    Precedence.BitwiseShift,
    Associativity.Binary
  );

  public static readonly BitwiseRightShift = new Operator(
    'Bitwise Right Shift',
    '… >> …',
    Precedence.BitwiseShift,
    Associativity.Binary
  );

  public static readonly LessThan = new Operator(
    'Less Than',
    '… < …',
    Precedence.Comparison,
    Associativity.Binary
  );

  public static readonly LessThanOrEqual = new Operator(
    'Less Than',
    '… <= …',
    Precedence.Comparison,
    Associativity.Binary
  );

  public static readonly GreaterThan = new Operator(
    'Greater Than',
    '… > …',
    Precedence.Comparison,
    Associativity.Binary
  );

  public static readonly GreaterThanOrEqual = new Operator(
    'Greater Than Or Equal',
    '… >= …',
    Precedence.Comparison,
    Associativity.Binary
  );

  public static readonly Equality = new Operator(
    'Equality',
    '… == …',
    Precedence.Equality,
    Associativity.Binary
  );

  public static readonly Inequality = new Operator(
    'Inequality',
    '… != …',
    Precedence.Equality,
    Associativity.Binary
  );

  public static readonly Identity = new Operator(
    'Identity',
    '… === …',
    Precedence.Equality,
    Associativity.Binary
  );

  public static readonly Unidentity = new Operator(
    'Unidentity',
    '… !== …',
    Precedence.Equality,
    Associativity.Binary
  );

  public static readonly LogicalAnd = new Operator(
    'Logical And',
    '… && …',
    Precedence.LogicalAnd,
    Associativity.Binary
  );

  public static readonly LogicalOr = new Operator(
    'Logical Or',
    '… || …',
    Precedence.LogicalOr,
    Associativity.Binary
  );

  public static readonly Conditional = new Operator(
    'Conditional',
    'if … then …',
    Precedence.Conditional,
    Associativity.Other
  );

  public static readonly Assign = new Operator(
    'Assign',
    '… = …',
    Precedence.Assignment,
    Associativity.Binary
  );

  public static readonly AssignIncreasedBy = new Operator(
    'Assign Increased By',
    '… += …',
    Precedence.Assignment,
    Associativity.Binary
  );

  public static readonly AssignDecreasedBy = new Operator(
    'Assign Increased By',
    '… -= …',
    Precedence.Assignment,
    Associativity.Binary
  );

  public static readonly AssignMultipliedBy = new Operator(
    'Assign Increased By',
    '… *= …',
    Precedence.Assignment,
    Associativity.Binary
  );

  public static readonly AssignDividedBy = new Operator(
    'Assign Increased By',
    '… /= …',
    Precedence.Assignment,
    Associativity.Binary
  );

  public static readonly AssignRemainderBy = new Operator(
    'Assign Remainder By',
    '… %= …',
    Precedence.Assignment,
    Associativity.Binary
  );

  /**
   * @param name: Name of the operator, used for debugging.
   * @param pattern: Pattern for the operator to be matched. Any occurrence of
   * the unicode character `…` is expected to be another expression.
   * @param precedence: Precedence of the operator.
   * @param associativity: Associativity of the operator.
   */
  private constructor(
    public readonly name: string,
    public readonly pattern: string,
    public readonly precedence: Precedence,
    public readonly associativity: Associativity
  ) {}
}
