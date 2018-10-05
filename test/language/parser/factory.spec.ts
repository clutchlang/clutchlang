// tslint:disable:no-magic-numbers

import * as ast from '../../../src/ast';
import {
  AstNodeFactory,
  Operator,
  ParameterDeclaration,
  PrintTreeVisitor,
} from '../../../src/language/parser';

function toToken(type: ast.ITokenTypes): ast.Token {
  return new ast.Token(
    0,
    type,
    [],
    type.kind !== 'literal' && type.kind !== 'marker' ? type.lexeme : ''
  );
}

describe('AstNodeFactory', () => {
  const factory = new AstNodeFactory();
  const visitor = new PrintTreeVisitor();

  const a = factory.createLiteralIdentifier(
    new ast.Token(0, ast.$Identifier, [], 'a')
  );

  const b = factory.createLiteralIdentifier(
    new ast.Token(0, ast.$Identifier, [], 'b')
  );

  it('should create a file root', () => {
    const $arrow = toToken(ast.$DashRightAngle);
    const $function = factory.createFunctionDeclaration(
      a,
      [],
      undefined,
      $arrow,
      b,
      false
    );
    const fileRoot = factory.createFileRoot([$function]);
    expect(fileRoot.firstToken).toEqual($function.firstToken);
    expect(fileRoot.lastToken).toEqual($function.lastToken);
    expect(fileRoot.topLevelElements).toEqual([$function]);
    expect(fileRoot.accept(visitor).toString()).toMatchSnapshot();
  });

  it('should create a function', () => {
    const $arrow = new ast.Token(0, ast.$DashRightAngle, [], '->');
    const $function = factory.createFunctionDeclaration(
      a,
      [new ParameterDeclaration(b)],
      undefined,
      $arrow,
      b,
      false
    );
    expect($function.arrowToken).toEqual($arrow);
    expect($function.body).toEqual(b);
    expect($function.firstToken).toEqual(a.firstToken);
    expect($function.lastToken).toEqual(b.lastToken);
    expect($function.name).toEqual(a);
    expect($function.parameters).toEqual([new ParameterDeclaration(b)]);
    expect($function.accept(visitor).toString()).toMatchSnapshot();
  });

  describe('<Expression>', () => {
    it('should create BinaryExpression', () => {
      const $plus = toToken(ast.$Plus);
      const expr = factory.createBinaryExpression(
        a,
        Operator.Addition,
        $plus,
        b
      );
      expect(expr.firstToken).toBe(a.firstToken);
      expect(expr.lastToken).toBe(b.lastToken);
      expect(expr.left).toBe(a);
      expect(expr.operator).toBe(Operator.Addition);
      expect(expr.right).toBe(b);
      expect(expr.target).toBe(a);
      expect(expr.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should create prefix UnaryExpression', () => {
      const $negate = toToken(ast.$Exclaim);
      const expr = factory.createUnaryExpression(
        a,
        Operator.UnaryNegative,
        $negate,
        true
      );
      expect(expr.firstToken).toBe($negate);
      expect(expr.lastToken).toBe(a.lastToken);
      expect(expr.operator).toEqual(Operator.UnaryNegative);
      expect(expr.target).toBe(a);
      expect(expr.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should create postfix UnaryExpression', () => {
      const $accessor = toToken(ast.$Period);
      const expr = factory.createUnaryExpression(
        a,
        Operator.MemberAccess,
        $accessor,
        false
      );
      expect(expr.firstToken).toBe(a.firstToken);
      expect(expr.lastToken).toBe($accessor);
      expect(expr.operator).toEqual(Operator.MemberAccess);
      expect(expr.target).toBe(a);
      expect(expr.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should create GroupExpression', () => {
      const $lp = toToken(ast.$LeftParen);
      const $rp = toToken(ast.$RightParen);
      const expr = factory.createGroupExpression($lp, $rp, a);
      expect(expr.expression).toEqual(a);
      expect(expr.firstToken).toEqual($lp);
      expect(expr.lastToken).toEqual($rp);
      expect(expr.accept(visitor).toString()).toMatchSnapshot();
    });

    describe('should create IfExpression', () => {
      const $if = toToken(ast.$If);
      const $then = toToken(ast.$Then);

      it('', () => {
        const expr = factory.createConditionalExpression($if, a, $then, b);
        expect(expr.body).toEqual(b);
        expect(expr.condition).toEqual(a);
        expect(expr.elseBody).toBeUndefined();
        expect(expr.elseToken).toBeUndefined();
        expect(expr.firstToken).toEqual($if);
        expect(expr.ifToken).toBe($if);
        expect(expr.lastToken).toBe(b.lastToken);
        expect(expr.accept(visitor).toString()).toMatchSnapshot();
      });

      it('with else', () => {
        const $else = toToken(ast.$Else);
        const expr = factory.createConditionalExpression(
          $if,
          a,
          $then,
          b,
          $else,
          a
        );
        expect(expr.body).toEqual(b);
        expect(expr.condition).toEqual(a);
        expect(expr.elseBody).toEqual(a);
        expect(expr.elseToken).toEqual($else);
        expect(expr.firstToken).toEqual($if);
        expect(expr.ifToken).toBe($if);
        expect(expr.lastToken).toBe(a.lastToken);
        expect(expr.accept(visitor).toString()).toMatchSnapshot();
      });
    });
  });

  describe('Statement', () => {
    it('should create a block', () => {
      const $lc = toToken(ast.$LeftCurly);
      const $rc = toToken(ast.$RightCurly);
      const stmt = factory.createStatementBlock($lc, [], $rc);
      expect(stmt.firstToken).toEqual($lc);
      expect(stmt.statements).toEqual([]);
      expect(stmt.lastToken).toEqual($rc);
    });

    it('should create a return statement', () => {
      const $return = toToken(ast.$Return);
      const stmt = factory.createReturnStatement($return, a);
      expect(stmt.expression).toEqual(a);
      expect(stmt.firstToken).toEqual($return);
      expect(stmt.lastToken).toEqual(a.lastToken);
      expect(stmt.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should create a let statement', () => {
      const $let = toToken(ast.$Let);
      const $eq = toToken(ast.$EqualsEquals);
      const stmt = factory.createVariableDeclarationStatement(
        $let,
        a,
        $eq,
        b,
        false
      );
      expect(stmt.assignToken).toEqual($eq);
      expect(stmt.expression).toEqual(b);
      expect(stmt.firstToken).toEqual($let);
      expect(stmt.lastToken).toEqual(b.lastToken);
      expect(stmt.name).toEqual(a);
      expect(stmt.accept(visitor).toString()).toMatchSnapshot();
    });
  });

  it('should create an invoke expression', () => {
    const $open = toToken(ast.$LeftParen);
    const $close = toToken(ast.$RightParen);
    const expr = factory.createFunctionCallExpression(a, $open, [], $close);
    expect(expr.closeToken).toEqual($close);
    expect(expr.firstToken).toEqual(a.firstToken);
    expect(expr.lastToken).toEqual($close);
    expect(expr.openToken).toEqual($open);
    expect(expr.parameters).toEqual([]);
    expect(expr.target).toEqual(a);
    expect(expr.accept(visitor).toString()).toMatchSnapshot();
  });

  describe('LiteralBoolean', () => {
    it('should evaluate true', () => {
      const token = toToken(ast.$True);
      const $true = factory.createLiteralBoolean(token);
      expect($true.firstToken).toBe(token);
      expect($true.lastToken).toBe(token);
      expect($true.value).toBe(true);
      expect($true.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should evaluate false', () => {
      const token = toToken(ast.$False);
      const $false = factory.createLiteralBoolean(token);
      expect($false.firstToken).toBe(token);
      expect($false.lastToken).toBe(token);
      expect($false.value).toBe(false);
      expect($false.accept(visitor).toString()).toMatchSnapshot();
    });
  });

  describe('LiteralNumber', () => {
    it('should evaluate int', () => {
      const token = new ast.Token(0, ast.$Number, [], '1');
      const $1 = factory.createLiteralNumber(token);
      expect($1.firstToken).toBe(token);
      expect($1.lastToken).toBe(token);
      expect($1.value).toBe(1);
      expect($1.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should evaluate float', () => {
      const token = new ast.Token(0, ast.$Number, [], '1.5');
      const $1 = factory.createLiteralNumber(token);
      expect($1.firstToken).toBe(token);
      expect($1.lastToken).toBe(token);
      expect($1.value).toBe(1.5);
      expect($1.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should evaluate hex', () => {
      const token = new ast.Token(0, ast.$Number, [], '0xFFF');
      const $0xFFF = factory.createLiteralNumber(token);
      expect($0xFFF.firstToken).toBe(token);
      expect($0xFFF.lastToken).toBe(token);
      expect($0xFFF.value).toBe(0xfff);
      expect($0xFFF.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should evaluate exponential', () => {
      const token = new ast.Token(0, ast.$Number, [], '2e6');
      const $2e6 = factory.createLiteralNumber(token);
      expect($2e6.firstToken).toBe(token);
      expect($2e6.lastToken).toBe(token);
      expect($2e6.value).toBe(2e6);
      expect($2e6.accept(visitor).toString()).toMatchSnapshot();
    });
  });

  describe('LiteralString', () => {
    it('should evaluate an empty string', () => {
      const token = new ast.Token(0, ast.$String, [], '');
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('');
      expect(empty.accept(visitor).toString()).toMatchSnapshot();
    });

    it('should evaluate a single-line string', () => {
      const token = new ast.Token(0, ast.$String, [], 'Hello');
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('Hello');
    });

    it('should evaluate a single-line string with escaped newlines', () => {
      const token = new ast.Token(
        0,
        ast.$String,
        [],
        String.raw`Hello\nWorld`
      );
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('Hello\nWorld');
    });

    it('should evaluate a multi-line string', () => {
      const token = new ast.Token(
        0,
        ast.$String,
        [],
        `
        <html>
          <body></body>
        </html>
        `
      );
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('<html>\n  <body></body>\n</html>\n');
    });
  });

  it('SimpleName should implement AstNode', () => {
    const token = new ast.Token(0, ast.$Identifier, [], 'fooBar');
    const fooBar = factory.createLiteralIdentifier(token);
    expect(fooBar.firstToken).toBe(token);
    expect(fooBar.lastToken).toBe(token);
    expect(fooBar.name).toBe('fooBar');
    expect(fooBar.accept(visitor).toString()).toMatchSnapshot();
  });
});
