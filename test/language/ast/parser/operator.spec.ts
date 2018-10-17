import { SourceFile } from '../../../../src/agnostic/scanner';
import * as lexer from '../../../../src/language/ast/lexer';
import {
  StaticMessage,
  StaticMessageCode,
  StaticMessageReporter,
} from '../../../../src/language/ast/message';
import * as ast from '../../../../src/language/ast/parser';

function parseOperator<T extends ast.OperatorType>(
  text: string,
  parse: (parser: ast.OperatorParser, token: lexer.Token) => ast.Operator<T>
): T {
  const source = new SourceFile(text, 'operator.spec.ts');
  const reporter = new StaticMessageReporter(source);
  const tokens = lexer.tokenize(text, (offset, length) => {
    reporter.reportOffset(offset, length, StaticMessageCode.UNEXPECTED_TOKEN);
  });
  const parser = new ast.OperatorParser(tokens, reporter);
  return parse(parser, tokens[0]).type;
}

describe('parseBinaryOperator', () => {
  const operators = new Map<ast.BinaryOperatorType, string>([
    [ast.OperatorType.Property, '.'],
    [ast.OperatorType.Multiplication, '*'],
    [ast.OperatorType.Division, '/'],
    [ast.OperatorType.Remainder, '%'],
    [ast.OperatorType.Addition, '+'],
    [ast.OperatorType.Subtraction, '-'],
    [ast.OperatorType.LessThan, '<'],
    [ast.OperatorType.LessThanOrEqual, '<='],
    [ast.OperatorType.GreaterThan, '>'],
    [ast.OperatorType.GreaterThanOrEqual, '>='],
    [ast.OperatorType.Equality, '=='],
    [ast.OperatorType.Inequality, '!='],
    [ast.OperatorType.Identity, '==='],
    [ast.OperatorType.Unidentity, '!=='],
    [ast.OperatorType.LogicalAnd, '&&'],
    [ast.OperatorType.LogicalOr, '||'],
    [ast.OperatorType.Assign, '='],
    [ast.OperatorType.AssignIncreasedBy, '+='],
    [ast.OperatorType.AssignDecreasedBy, '-='],
    [ast.OperatorType.AssignMultipliedBy, '*='],
    [ast.OperatorType.AssignDividedBy, '/='],
    [ast.OperatorType.AssignRemainderBy, '%='],
  ]);
  operators.forEach((text, type) => {
    test(`should parse "${text}"`, () => {
      expect(parseOperator(text, (p, t) => p.parseBinaryOperator(t))).toEqual(
        type
      );
    });
  });
});

describe('parsePrefixOperator', () => {
  const operators = new Map<ast.PrefixOperatorType, string>([
    [ast.OperatorType.PrefixIncrement, '++'],
    [ast.OperatorType.PrefixDecrement, '--'],
    [ast.OperatorType.UnaryNegative, '-'],
    [ast.OperatorType.UnaryPositive, '+'],
    [ast.OperatorType.LogicalNot, '!'],
  ]);
  operators.forEach((text, type) => {
    test(`should parse "${text}"`, () => {
      expect(parseOperator(text, (p, t) => p.parsePrefixOperator(t))).toEqual(
        type
      );
    });
  });
});

describe('parsePostfixOperator', () => {
  const operators = new Map<ast.PostfixOperatorType, string>([
    [ast.OperatorType.PostfixIncrement, '++'],
    [ast.OperatorType.PostfixDecrement, '--'],
  ]);
  operators.forEach((text, type) => {
    test(`should parse "${text}"`, () => {
      expect(parseOperator(text, (p, t) => p.parsePostfixOperator(t))).toEqual(
        type
      );
    });
  });
});

describe('should fail parsing an invalid', () => {
  test('invalid operator entirely', () => {
    expect(() =>
      parseOperator('#', (p, t) => p.parseBinaryOperator(t))
    ).toThrowError(StaticMessage);
  });

  test('unsupported binary operator', () => {
    expect(() =>
      parseOperator('--', (p, t) => p.parseBinaryOperator(t))
    ).toThrowError(StaticMessage);
  });

  test('unsupported prefix operator', () => {
    expect(() =>
      parseOperator('*', (p, t) => p.parsePrefixOperator(t))
    ).toThrowError(StaticMessage);
  });

  test('unsupported postfix operator', () => {
    expect(() =>
      parseOperator('*', (p, t) => p.parsePostfixOperator(t))
    ).toThrowError(StaticMessage);
  });
});
