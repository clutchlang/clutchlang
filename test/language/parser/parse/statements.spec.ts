import { tokenize } from '../../../../src/language/lexer';
import {
  ClutchParser,
  PrintTreeVisitor,
  ReturnStatement,
  Statement,
  VariableDeclarationStatement,
} from '../../../../src/language/parser';

describe('ClutchParser should parse statement', () => {
  function parseStatement(expression: string): Statement {
    const tokens = tokenize(expression);
    return new ClutchParser(tokens).parseStatement();
  }

  describe('return', () => {
    it('', () => {
      const stmt = parseStatement('return');
      expect(stmt).toBeInstanceOf(ReturnStatement);
      expect(stmt.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('with an expression', () => {
      const stmt = parseStatement('return a');
      expect(stmt).toBeInstanceOf(ReturnStatement);
      expect(stmt.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });

    it('with a parenthesized expression', () => {
      const stmt = parseStatement('return (a)');
      expect(stmt).toBeInstanceOf(ReturnStatement);
      expect(stmt.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });

  describe('variable', () => {
    it('', () => {
      const stmt = parseStatement('let a = b');
      expect(stmt).toBeInstanceOf(VariableDeclarationStatement);
      expect(stmt.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });
});
