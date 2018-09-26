import { tokenize } from '../../../src/language/lexer';
import {
  BinaryExpression,
  ClutchParser,
  Expression,
  PrintTreeVisitor,
} from '../../../src/language/parser';

describe('ClutchParser', () => {
  function parseExpression(expression: string): Expression {
    const tokens = tokenize(expression);
    return new ClutchParser(tokens).parseExpression();
  }

  describe('should parse and print', () => {
    describe('literal', () => {
      [
        "'Hello'",
        `
          Hello
          World!
        `,
        '1',
        '1.5',
        '3.14',
        '30.4',
        'true',
        'false',
        'fooBar',
      ].forEach(t => {
        it(t, () => {
          const expr = parseExpression(t);
          expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
        });
      });
    });

    describe('binary', () => {
      [
        '*',
        '/',
        '%',
        '+',
        '-',
        '<',
        '>',
        '<=',
        '>=',
        '==',
        '!=',
        '===',
        '!==',
        '&&',
        '||',
        '=',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
      ].forEach(t => {
        const text = `a ${t} b`;
        it(text, () => {
          const expr = parseExpression(`a ${t} b`);
          expect(expr).toBeInstanceOf(BinaryExpression);
          expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
        });
      });
    });
  });
});
