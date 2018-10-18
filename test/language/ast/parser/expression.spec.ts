// tslint:disable:no-magic-numbers

import { SourceFile } from '../../../../src/agnostic/scanner';
import * as lexer from '../../../../src/language/ast/lexer';
import {
  StaticMessage,
  StaticMessageCode,
  StaticMessageReporter,
} from '../../../../src/language/ast/message';
import * as ast from '../../../../src/language/ast/parser';

function parseExpression<E extends ast.Expression>(text: string): E {
  // TODO: Move the following block into a common test-infra area.
  const source = new SourceFile(text, 'expression.spec.ts');
  const reporter = new StaticMessageReporter(source);
  const tokens = lexer.tokenize(text, (offset, length) => {
    reporter.reportOffset(
      offset,
      length,
      StaticMessageCode.SYNTAX_UNEXPECTED_TOKEN
    );
  });
  const parser = new ast.ExpressionParser(tokens, reporter);
  return parser.parseExpression() as E;
}

describe('parsePrefixOperator', () => {
  new Map<string, ast.PrefixOperatorType>([
    ['-', ast.OperatorType.UnaryNegative],
    ['+', ast.OperatorType.UnaryPositive],
    ['++', ast.OperatorType.PrefixIncrement],
    ['--', ast.OperatorType.PrefixDecrement],
    ['!', ast.OperatorType.LogicalNot],
  ]).forEach((operator, text) => {
    test(`should parse "${text}a`, () => {
      const e = parseExpression<ast.PrefixExpression>(`${text}a`);
      expect(e.operator.type).toEqual(operator);
    });
  });
});

describe('parsePostfixExpression', () => {
  new Map<string, ast.PostfixOperatorType>([
    ['++', ast.OperatorType.PostfixIncrement],
    ['--', ast.OperatorType.PostfixDecrement],
  ]).forEach((operator, text) => {
    test(`should parse "a${text}`, () => {
      const e = parseExpression<ast.PostfixExpression>(`a${text}`);
      expect(e.operator.type).toEqual(operator);
    });
  });
});

describe('parsePropertyOrCall', () => {
  test('should parse a property', () => {
    const e = parseExpression<ast.PropertyExpression<ast.Identifier>>('a.b');
    expect(e.target.name).toEqual('a');
    expect(e.property.name).toEqual('b');
  });

  test('should parse multiple properties', () => {
    const e = parseExpression<
      ast.PropertyExpression<ast.PropertyExpression<ast.Identifier>>
    >('a.b.c');
    expect(e.target.target.name).toEqual('a');
    expect(e.target.property.name).toEqual('b');
    expect(e.property.name).toEqual('c');
  });

  test('should fail parsing a property missing an identifier', () => {
    expect(() => parseExpression('a.')).toThrowError(StaticMessage);
  });

  test('should fail parsing a property with an invalid identifier', () => {
    expect(() => parseExpression('a.#')).toThrowError(StaticMessage);
  });

  test('should parse a function call with no arguments', () => {
    const e = parseExpression<ast.CallExpression<ast.Identifier>>('a.b()');
    expect(e.target!.name).toEqual('a');
    expect(e.name.name).toEqual('b');
    expect(e.args.args).toHaveLength(0);
  });

  test('should parse a function call with 1 argument', () => {
    const e = parseExpression<ast.CallExpression<ast.Identifier>>('a.b(c)');
    expect(e.target!.name).toEqual('a');
    expect(e.name.name).toEqual('b');
    expect(e.args.args).toHaveLength(1);
    expect((e.args.args[0] as ast.Identifier).name).toEqual('c');
  });

  test('should parse a function call with 2 arguments', () => {
    const e = parseExpression<ast.CallExpression<ast.Identifier>>('a.b(c, d)');
    expect(e.target!.name).toEqual('a');
    expect(e.name.name).toEqual('b');
    expect(e.args.args).toHaveLength(2);
    expect((e.args.args[0] as ast.Identifier).name).toEqual('c');
    expect((e.args.args[1] as ast.Identifier).name).toEqual('d');
  });

  test('should parse a function call with a trailing comma', () => {
    const e = parseExpression<ast.CallExpression<ast.Identifier>>(
      'a.b(c, d, )'
    );
    expect(e.target!.name).toEqual('a');
    expect(e.name.name).toEqual('b');
    expect(e.args.args).toHaveLength(2);
    expect((e.args.args[0] as ast.Identifier).name).toEqual('c');
    expect((e.args.args[1] as ast.Identifier).name).toEqual('d');
  });

  test('should fail parsing a function call with a missing end', () => {
    expect(() => parseExpression('a.b(')).toThrowError(StaticMessage);
  });

  test('should fail parsing a function call with a missing comma', () => {
    expect(() => parseExpression('a.b(c d)')).toThrowError(StaticMessage);
  });

  test('should parse a combination of property and function calls', () => {
    const e = parseExpression<
      ast.CallExpression<ast.PropertyExpression<ast.Identifier>>
    >('a.b.c()');
    expect(e.name.name).toEqual('c');
    expect(e.target!.property.name).toEqual('b');
    expect(e.target!.target.name).toEqual('a');
  });
});

describe('parseGroup', () => {
  test('should parse wrapping a literal', () => {
    const e = parseExpression<ast.GroupExpression<ast.LiteralNumber>>('(42)');
    expect(e.expression.value).toEqual('42');
  });

  test('should parse another group wrapping a literal', () => {
    const e = parseExpression<
      ast.GroupExpression<ast.GroupExpression<ast.LiteralNumber>>
    >('((42))');
    expect(e.expression.expression.value).toEqual('42');
  });

  test('should fail if a closing parentheses is omited', () => {
    expect(() => parseExpression('(42]')).toThrowError(StaticMessage);
  });
});

describe('parseLiteral', () => {
  test('should parse a number', () => {
    const e = parseExpression<ast.LiteralNumber>('42');
    expect(e.value).toEqual('42');
  });

  test('should parse a string', () => {
    const e = parseExpression<ast.LiteralString>("'Hello World'");
    expect(e.value).toEqual('Hello World');
  });

  test('should parse booleans', () => {
    expect(parseExpression<ast.LiteralBoolean>('true').value).toEqual('true');
    expect(parseExpression<ast.LiteralBoolean>('false').value).toEqual('false');
  });
});

describe('parseIdentifier', () => {
  describe('should parse a valid identifier', () => {
    ['foo', 'fooBar', '_fooBar', 'foo_bar'].forEach(i => {
      test(`"${i}"`, () => {
        const e = parseExpression<ast.Identifier>(i);
        expect(e.name).toEqual(i);
      });
    });
  });

  test('should fail on invalid identifiers', () => {
    expect(() => parseExpression('#notAnExpression#')).toThrowError(
      StaticMessage
    );
  });
});
