import { tokenize } from '../../../src/language/lexer';
import {
  BinaryExpression,
  ClutchParser,
  Expression,
  PrintTreeVisitor,
  UnaryExpression,
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
        '.',
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
          const expr = parseExpression(text);
          expect(expr).toBeInstanceOf(BinaryExpression);
          expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
        });
      });
    });

    describe('unary (prefix)', () => {
      ['++', '--', '-', '+', '!'].forEach(t => {
        const text = `${t} a`;
        it(text, () => {
          const expr = parseExpression(text);
          expect(expr).toBeInstanceOf(UnaryExpression);
          expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
        });
      });
    });

    describe('unary (postfix)', () => {
      ['++', '--'].forEach(t => {
        const text = `a ${t}`;
        it(text, () => {
          const expr = parseExpression(text);
          expect(expr).toBeInstanceOf(UnaryExpression);
          expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
        });
      });
    });
  });

  describe('parenthesized', () => {
    it('simple', () => {
      const text = `(a)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
    });

    it('extra parens', () => {
      const text = `((a))`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
    });

    it('with a binary expression', () => {
      const text = `(a + b)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
    });

    it('with a prefix expression', () => {
      const text = `(--a)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
    });

    it('with a postfix expression', () => {
      const text = `(a--)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor())).toMatchSnapshot();
    });
  });
});
