// tslint:disable:no-magic-numbers
import { Operator } from '../../../src/language/parser';

describe('Operator precedence should', () => {
  const allKnownOperators: Operator[] = [];
  const precedenceToOperator = new Map<number, Operator[]>([
    [0, [Operator.UnaryIncrement, Operator.UnaryDecrement, Operator.Accessor]],
    [
      1,
      [
        Operator.Subtract,
        Operator.Add,
        Operator.Increment,
        Operator.Decrement,
        Operator.UnaryNegation,
      ],
    ],
    [2, [Operator.Multiply, Operator.Divide, Operator.Modulus]],
    [3, [Operator.Add, Operator.Subtract]],
    [
      4,
      [
        Operator.Less,
        Operator.Greater,
        Operator.LessOrEqual,
        Operator.GreaterOrEqual,
      ],
    ],
    [
      5,
      [
        Operator.Equal,
        Operator.NotEqual,
        Operator.Identical,
        Operator.NotIdentical,
      ],
    ],
    [6, [Operator.And]],
    [7, [Operator.Or]],
    [
      8,
      [
        Operator.Assign,
        Operator.AddAssign,
        Operator.SubtractAssign,
        Operator.MultiplyAssign,
        Operator.DivideAssign,
        Operator.ModulusAssign,
      ],
    ],
  ]);

  beforeAll(() => {
    for (const field in Operator) {
      if (field in Operator) {
        // tslint:disable-next-line:no-any
        allKnownOperators.push((Operator as any)[field]);
      }
    }
  });

  it('match the visible operators', () => {
    const operatorsInMap: Operator[] = [];
    for (const entries of precedenceToOperator.values()) {
      for (const e of entries) {
        operatorsInMap.push(e);
      }
    }
    expect(operatorsInMap).toHaveLength(allKnownOperators.length);
  });
});
