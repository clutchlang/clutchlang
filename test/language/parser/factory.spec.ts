// tslint:disable:no-magic-numbers

import { TokenKind } from '../../../src/language/lexer';
import { AstNodeFactory, Operator } from '../../../src/language/parser';

describe('AstNodeFactory', () => {
  const factory = new AstNodeFactory();

  describe('<Expression>', () => {
    const a = factory.createSimpleName({
      comments: [],
      kind: TokenKind.IDENTIFIER,
      lexeme: 'a',
      offset: 0,
    });
    const b = factory.createSimpleName({
      comments: [],
      kind: TokenKind.IDENTIFIER,
      lexeme: 'b',
      offset: 0,
    });

    it('should create BinaryExpression', () => {
      const $plus = {
        comments: [],
        kind: TokenKind.PLUS,
        lexeme: '+',
        offset: 0,
      };
      const expr = factory.createBinaryExpression(a, Operator.Add, $plus, b);
      expect(expr.firstToken).toBe(a.firstToken);
      expect(expr.lastToken).toBe(b.lastToken);
      expect(expr.left).toBe(a);
      expect(expr.operator).toBe(Operator.Add);
      expect(expr.right).toBe(b);
      expect(expr.target).toBe(a);
    });

    it('should create prefix UnaryExpression', () => {
      const $negate = {
        comments: [],
        kind: TokenKind.NEGATE,
        lexeme: '!',
        offset: 0,
      };
      const expr = factory.createUnaryExpression(
        a,
        Operator.UnaryNegative,
        $negate,
        true
      );
      expect(expr.firstToken).toBe($negate);
      expect(expr.lastToken).toBe(a.lastToken);
      expect(expr.operator).toEqual(Operator.UnaryNegation);
      expect(expr.target).toBe(a);
    });

    it('should create postfix UnaryExpression', () => {
      const $accessor = {
        comments: [],
        kind: TokenKind.PERIOD,
        lexeme: '!',
        offset: 0,
      };
      const expr = factory.createUnaryExpression(
        a,
        Operator.Accessor,
        $accessor,
        false
      );
      expect(expr.firstToken).toBe(a.firstToken);
      expect(expr.lastToken).toBe($accessor);
      expect(expr.operator).toEqual(Operator.Accessor);
      expect(expr.target).toBe(a);
    });

    describe('should create IfExpression', () => {
      const $if = {
        comments: [],
        kind: TokenKind.IF,
        lexeme: 'if',
        offset: 0,
      };

      it('', () => {
        const expr = factory.createIfExpression($if, a, b);
        expect(expr.body).toEqual(b);
        expect(expr.condition).toEqual(a);
        expect(expr.elseBody).toBeUndefined();
        expect(expr.elseToken).toBeUndefined();
        expect(expr.firstToken).toEqual($if);
        expect(expr.ifToken).toBe($if);
        expect(expr.lastToken).toBe(b.lastToken);
      });

      it('with else', () => {
        const $else = {
          comments: [],
          kind: TokenKind.ELSE,
          lexeme: 'else',
          offset: 0,
        };
        const expr = factory.createIfExpression($if, a, b, $else, a);
        expect(expr.body).toEqual(b);
        expect(expr.condition).toEqual(a);
        expect(expr.elseBody).toEqual(a);
        expect(expr.elseToken).toEqual($else);
        expect(expr.firstToken).toEqual($if);
        expect(expr.ifToken).toBe($if);
        expect(expr.lastToken).toBe(a.lastToken);
      });
    });
  });

  describe('LiteralBoolean', () => {
    it('should evaluate true', () => {
      const token = {
        comments: [],
        kind: TokenKind.TRUE,
        lexeme: 'true',
        offset: 0,
      };
      const $true = factory.createLiteralBoolean(token);
      expect($true.firstToken).toBe(token);
      expect($true.lastToken).toBe(token);
      expect($true.value).toBe(true);
    });

    it('should evaluate false', () => {
      const token = {
        comments: [],
        kind: TokenKind.TRUE,
        lexeme: 'false',
        offset: 0,
      };
      const $true = factory.createLiteralBoolean(token);
      expect($true.firstToken).toBe(token);
      expect($true.lastToken).toBe(token);
      expect($true.value).toBe(false);
    });
  });

  describe('LiteralNumber', () => {
    it('should evaluate int', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '1',
        offset: 0,
      };
      const $1 = factory.createLiteralNumber(token);
      expect($1.firstToken).toBe(token);
      expect($1.lastToken).toBe(token);
      expect($1.value).toBe(1);
    });

    it('should evaluate float', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '1.5',
        offset: 0,
      };
      const $1 = factory.createLiteralNumber(token);
      expect($1.firstToken).toBe(token);
      expect($1.lastToken).toBe(token);
      expect($1.value).toBe(1.5);
    });

    it('should evaluate hex', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '0xFFF',
        offset: 0,
      };
      const $0xFFF = factory.createLiteralNumber(token);
      expect($0xFFF.firstToken).toBe(token);
      expect($0xFFF.lastToken).toBe(token);
      expect($0xFFF.value).toBe(0xfff);
    });

    it('should evaluate exponential', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '2e6',
        offset: 0,
      };
      const $2e6 = factory.createLiteralNumber(token);
      expect($2e6.firstToken).toBe(token);
      expect($2e6.lastToken).toBe(token);
      expect($2e6.value).toBe(2e6);
    });
  });

  describe('LiteralString', () => {
    it('should evaluate an empty string', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: '',
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('');
    });

    it('should evaluate a single-line string', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: 'Hello',
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('Hello');
    });

    it('should evaluate a single-line string with escaped newlines', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: String.raw`Hello\nWorld`,
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('Hello\nWorld');
    });

    it('should evaluate a multi-line string', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: `
        <html>
          <body></body>
        </html>
      `,
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('<html>\n  <body></body>\n</html>\n');
    });
  });

  it('SimpleName should implement AstNode', () => {
    const token = {
      comments: [],
      kind: TokenKind.IDENTIFIER,
      lexeme: 'fooBar',
      offset: 0,
    };
    const fooBar = factory.createSimpleName(token);
    expect(fooBar.firstToken).toBe(token);
    expect(fooBar.lastToken).toBe(token);
    expect(fooBar.name).toBe('fooBar');
  });
});
