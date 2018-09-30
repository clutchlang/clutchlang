// tslint:disable:no-magic-numbers
import { tokenize } from '../../../../src/language/lexer';
import { ClutchParser } from '../../../../src/language/parser';
import { evaluateConstExpression } from '../../../../src/language/parser/evaluator/constexpr';

function expression(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseExpression();
  evaluateConstExpression(expression);
}

function statement(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseStatement();
  evaluateConstExpression(expression);
}

function file(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseFileRoot();
  evaluateConstExpression(expression);
}

function declare(source: string): void {
  const tokens = tokenize(source);
  const expression = new ClutchParser(tokens).parseFileRoot();
  evaluateConstExpression(expression.topLevelElements[0]);
}

describe('ConstExpr', () => {
  it('conditional expressions unsupported', () => {
    expect(() => expression('if (1 > 2) { 4 } else { 5 }')).toThrow();
  });

  it('conditional statement unsupported', () => {
    expect(() => statement('if (1 > 2) { 4 } else { 5 }')).toThrow();
  });
  it('function invocation unsupported', () => {
    expect(() => expression('fib(2)')).toThrow();
  });

  it('function declarations unsupported', () => {
    expect(() =>
      declare('fib(n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)')
    ).toThrow();
  });

  it('boolean type error', () => {
    expect(() => expression('true + false')).toThrow();
  });

  it('boolean type error 2', () => {
    expect(() => expression('true + 2')).toThrow();
  });

  it('boolean type error 3', () => {
    expect(() => expression('3 - false')).toThrow();
  });

  it('numeric type error', () => {
    expect(() => expression('2 && 3')).toThrow();
  });

  it('numeric type error 2', () => {
    expect(() => expression('2 && true')).toThrow();
  });

  it('numeric unary type error', () => {
    expect(() => expression('!2')).toThrow();
  });

  it('boolean unary type error', () => {
    expect(() => expression('-true')).toThrow();
  });

  it('boolean unary type error 2', () => {
    expect(() => expression('++true')).toThrow();
  });

  it('numeric unary type error', () => {
    expect(() => expression("-'1232'")).toThrow();
  });

  it('simple name unsupported', () => {
    expect(() => expression('foo')).toThrow();
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
