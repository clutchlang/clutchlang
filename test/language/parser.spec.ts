// tslint:disable:no-magic-numbers

import { TokenKind } from '../../src/language/lexer';
import { AstNodeFactory, Operator } from '../../src/language/parser';

describe('Operator precedence should', () => {
  const allKnownOperators: Operator[] = [];
  const precedenceToOperator = new Map<number, Operator[]>([
    [0, [Operator.UnaryIncrement, Operator.UnaryDecrement, Operator.Accessor]],
    [
      1,
      [
        Operator.Subtract,
        Operator.Add,
        Operator.Increment,
        Operator.Decrement,
        Operator.UnaryNegation,
      ],
    ],
    [2, [Operator.Multiply, Operator.Divide, Operator.Modulus]],
    [3, [Operator.Add, Operator.Subtract]],
    [
      4,
      [
        Operator.Less,
        Operator.Greater,
        Operator.LessOrEqual,
        Operator.GreaterOrEqual,
      ],
    ],
    [
      5,
      [
        Operator.Equal,
        Operator.NotEqual,
        Operator.Identical,
        Operator.NotIdentical,
      ],
    ],
    [6, [Operator.And]],
    [7, [Operator.Or]],
    [
      8,
      [
        Operator.Assign,
        Operator.AddAssign,
        Operator.SubtractAssign,
        Operator.MultiplyAssign,
        Operator.DivideAssign,
        Operator.ModulusAssign,
      ],
    ],
  ]);

  beforeAll(() => {
    for (const field in Operator) {
      if (field in Operator) {
        // tslint:disable-next-line:no-any
        allKnownOperators.push((Operator as any)[field]);
      }
    }
  });

  it('match the visible operators', () => {
    const operatorsInMap: Operator[] = [];
    for (const entries of precedenceToOperator.values()) {
      for (const e of entries) {
        operatorsInMap.push(e);
      }
    }
    expect(operatorsInMap).toHaveLength(allKnownOperators.length);
  });
});

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
