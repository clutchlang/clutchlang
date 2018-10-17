// tslint:disable:no-magic-numbers
import { tokenize } from '../../../../src/language/ast/lexer/tokenizer';
import {
  ClutchParser,
  FunctionDeclaration,
  LiteralNumber,
} from '../../../../src/language/parser';
import { evaluateConstExpression } from '../../../../src/language/parser/evaluator/constexpr';

function expr(source: string, declare: string): number {
  const parsedDeclaration = new ClutchParser(tokenize(declare)).parseFileRoot()
    .topLevelElements[0] as FunctionDeclaration;
  const globalContext = new Map<string, FunctionDeclaration>();
  globalContext.set(parsedDeclaration.name.name, parsedDeclaration);
  const constexpr = new ClutchParser(tokenize(source)).parseExpression();
  const result = evaluateConstExpression(constexpr, globalContext);
  return (result as LiteralNumber).value;
}

describe('ConstExpr', () => {
  const fib = 'fib(n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)';

  it('Can recur', () => {
    expect(expr('fib(10)', fib)).toEqual(55);
  });

  it('Handles mismatched parameters', () => {
    expect(() => expr('fib()', fib)).toThrow();
  });

  it('Has a maximum depth', () => {
    expect(() => expr('fib(100)', fib)).toThrow();
  });
});
