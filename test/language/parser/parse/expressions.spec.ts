import { tokenize } from '../../../../src/language/lexer';
import {
  BinaryExpression,
  ClutchParser,
  Expression,
  InvokeExpression,
  PrintTreeVisitor,
  UnaryExpression,
} from '../../../../src/language/parser';

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
          expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
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
          expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
          expect(expr).toBeInstanceOf(BinaryExpression);
        });
      });
    });

    describe('unary (prefix)', () => {
      ['++', '--', '-', '+', '!'].forEach(t => {
        const text = `${t} a`;
        it(text, () => {
          const expr = parseExpression(text);
          expect(expr).toBeInstanceOf(UnaryExpression);
          expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
        });
      });
    });

    describe('unary (postfix)', () => {
      ['++', '--'].forEach(t => {
        const text = `a ${t}`;
        it(text, () => {
          const expr = parseExpression(text);
          expect(expr).toBeInstanceOf(UnaryExpression);
          expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
        });
      });
    });
  });

  describe('parenthesized', () => {
    it('simple', () => {
      const text = `(a)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('extra parens', () => {
      const text = `((a))`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('with a binary expression', () => {
      const text = `(a + b)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('with a prefix expression', () => {
      const text = `(--a)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('with a postfix expression', () => {
      const text = `(a--)`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });

  describe('invocation', () => {
    it('simple', () => {
      const text = `fn()`;
      const expr = parseExpression(text);
      expect(expr).toBeInstanceOf(InvokeExpression);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('simple with parameter', () => {
      const text = `fn(a)`;
      const expr = parseExpression(text);
      expect(expr).toBeInstanceOf(InvokeExpression);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('simple with multiple parameters', () => {
      const text = `fn(a b)`;
      const expr = parseExpression(text);
      expect(expr).toBeInstanceOf(InvokeExpression);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('chained', () => {
      const text = `fn()()`;
      const expr = parseExpression(text);
      expect(expr).toBeInstanceOf(InvokeExpression);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('accessor', () => {
      const text = `a.fn()`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('accessor and chained', () => {
      const text = `a.fn().b()`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('complex', () => {
      const text = `fn(a() 1 + 1 b.c())`;
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });

  describe('conditional', () => {
    it('simple', () => {
      const text = 'if a then b';
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('with else', () => {
      const text = 'if a then b else c';
      const expr = parseExpression(text);
      expect(expr.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });
});