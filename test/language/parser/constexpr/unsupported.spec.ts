// tslint:disable:no-magic-numbers
import { tokenize } from '../../../../src/language/lexer';
import { ClutchParser } from '../../../../src/language/parser';
import { evaluateConstExpression } from '../../../../src/language/parser/evaluator/constexpr';

function expr(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseExpression();
  evaluateConstExpression(expression, new Map());
}

function statement(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseStatement();
  evaluateConstExpression(expression, new Map());
}

function file(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseFileRoot();
  evaluateConstExpression(expression, new Map());
}

function declare(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseFileRoot();
  evaluateConstExpression(expression.topLevelElements[0], new Map());
}

describe('ConstExpr', () => {
  it('conditional expression type error', () => {
    expect(() => expr("if ('true') then 4 else 5")).toThrow();
  });

  it('conditional expression type', () => {
    expect(() => statement('if (1 > 2) { 4 } else { 5 }')).toThrow();
  });

  it('undefined function invocation unsupported', () => {
    expect(() => expr('fib(2)')).toThrow();
  });

  it('function declarations unsupported', () => {
    expect(() =>
      declare('fib(n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)')
    ).toThrow();
  });

  it('boolean type error', () => {
    expect(() => expr('true + false')).toThrow();
  });

  it('boolean type error 2', () => {
    expect(() => expr('true + 2')).toThrow();
  });

  it('boolean type error 3', () => {
    expect(() => expr('3 - false')).toThrow();
  });

  it('numeric type error', () => {
    expect(() => expr('2 && 3')).toThrow();
  });

  it('numeric type error 2', () => {
    expect(() => expr('2 && true')).toThrow();
  });

  it('numeric unary type error', () => {
    expect(() => expr('!2')).toThrow();
  });

  it('boolean unary type error', () => {
    expect(() => expr('-true')).toThrow();
  });

  it('boolean unary type error 2', () => {
    expect(() => expr('++true')).toThrow();
  });

  it('numeric unary type error', () => {
    expect(() => expr("-'1232'")).toThrow();
  });

  it('simple name unsupported', () => {
    expect(() => expr('foo')).toThrow();
  });

  it('variable declarations unsupported', () => {
    expect(() => statement("let message = 'Hello'")).toThrow();
  });

  it('return statement unsupported', () => {
    expect(() => statement('return 2')).toThrow();
  });

  it('file root unsupported', () => {
    expect(() => file('main() -> {}')).toThrow();
  });
});
