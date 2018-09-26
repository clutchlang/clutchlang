import { tokenize } from '../../../src/language/lexer';
import {
  ClutchParser,
  Expression,
  PrintTreeVisitor,
} from '../../../src/language/parser';

describe('ClutchParser', () => {
  function parseExpression(expression: string): Expression {
    const tokens = tokenize(expression);
    return new ClutchParser(tokens).parseExpression();
  }

  function printExpressionTree(expression: string): string {
    return parseExpression(expression).accept(new PrintTreeVisitor());
  }

  describe('should parse and print', () => {
    describe('literals', () => {
      it('string', () => {
        expect(printExpressionTree("'foo'")).toMatchSnapshot();
      });

      it('number', () => {
        expect(printExpressionTree('1')).toMatchSnapshot();
      });

      it('boolean [false]', () => {
        expect(printExpressionTree('false')).toMatchSnapshot();
      });

      it('boolean [true]', () => {
        expect(printExpressionTree('true')).toMatchSnapshot();
      });

      it('variable', () => {
        expect(printExpressionTree('foo')).toMatchSnapshot();
      });
    });

    describe('additive', () => {
      it.only('+', () => {
        expect(printExpressionTree('a + b')).toMatchSnapshot();
      });
    });
  });
});
