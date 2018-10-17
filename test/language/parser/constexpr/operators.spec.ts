// tslint:disable:no-magic-numbers
import { tokenize } from '../../../../src/language/ast/lexer/tokenizer';
import {
  ClutchParser,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
} from '../../../../src/language/parser';
import { evaluateConstExpression } from '../../../../src/language/parser/evaluator/constexpr';

function evaluate(source: string): number | boolean | string {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseExpression();
  const node = evaluateConstExpression(expression, new Map());
  if (
    node instanceof LiteralNumber ||
    node instanceof LiteralBoolean ||
    node instanceof LiteralString
  ) {
    return node.value;
  }
  throw new Error('Not a value');
}

describe('ConstExpr', () => {
  it('arithmetic', () => {
    const table: Array<[string, number]> = [
      ['1 + 1', 2],
      ['100 + -5', 95],
      ['1 - 1', 0],
      ['10 - 5', 5],
      ['2 * 3', 6],
      ['1 / 2', 1 / 2],
      ['-1 * 20', -20],
      ['1 / 0', Number.POSITIVE_INFINITY],
      ['1 % 2', 1],
      ['6 % 2', 0],
      ['6 + 4 * 3 - 10 / 5', 16],
      ['(5 + 2) * 3', 21],
      ['++1', 2],
      ['--2', 1],
      ['1++', 1],
      ['1--', 1],
    ];
    for (const [question, answer] of table) {
      expect(evaluate(question)).toEqual(answer);
    }
  });

  it('numeric comparison', () => {
    const table: Array<[string, boolean]> = [
      ['1 == 1', true],
      ['1 == 2', false],
      ['1 != 1', false],
      ['1 != 2', true],
      ['1 > 2', false],
      ['1 > 0', true],
      ['1 < 0', false],
      ['1 < 2', true],
      ['1 <= 1', true],
      ['1 <= 2', true],
      ['1 <= 0', false],
      ['1 >= 1', true],
      ['1 >= 0', true],
      ['1 >= 2', false],
      ['(1 > 2)', false],
    ];
    for (const [question, answer] of table) {
      expect(evaluate(question)).toEqual(answer);
    }
  });

  it('boolean logic', () => {
    const table: Array<[string, boolean]> = [
      ['true && true', true],
      ['true && false', false],
      ['true || false', true],
      ['false || false', false],
      ['!true', false],
      ['!false', true],
      ['true != true', false],
      ['false == false', true],
    ];
    for (const [question, answer] of table) {
      expect(evaluate(question)).toEqual(answer);
    }
  });

  it('strings', () => {
    const table: Array<[string, string]> = [["'hello'", 'hello']];
    for (const [question, answer] of table) {
      expect(evaluate(question)).toEqual(answer);
    }
  });

  it('conditionals', () => {
    const table: Array<[string, number | string]> = [
      ['if (1 > 2) then 3 else 4', 4],
      ["if (true == (1 > 0)) then '5' else '6'", '5'],
    ];
    for (const [question, answer] of table) {
      expect(evaluate(question)).toEqual(answer);
    }
  });
});
