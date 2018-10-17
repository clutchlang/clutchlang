import { tokenize } from '../../../../src/language/ast/lexer/tokenizer';
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
      expect(stmt).toHaveProperty('isConst', false);
      expect(stmt.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });

  describe('constant', () => {
    it('', () => {
      const stmt = parseStatement('let const a = fn()');
      expect(stmt).toBeInstanceOf(VariableDeclarationStatement);
      expect(stmt).toHaveProperty('isConst', true);
      expect(stmt.accept(new PrintTreeVisitor()).toString()).toMatchSnapshot();
    });
  });
});
