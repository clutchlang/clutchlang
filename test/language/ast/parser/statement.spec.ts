// tslint:disable:no-magic-numbers

import { SourceFile } from '../../../../src/agnostic/scanner';
import * as lexer from '../../../../src/language/ast/lexer';
import {
  StaticMessage,
  StaticMessageCode,
  StaticMessageReporter,
} from '../../../../src/language/ast/message';
import * as ast from '../../../../src/language/ast/parser';

function parseStatement<E extends ast.Statement>(text: string): E {
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
  const parser = new ast.StatementParser(tokens, reporter);
  return parser.parseStatement() as E;
}

describe('parseVariable', () => {
  test('should parse a simple variable', () => {
    const s = parseStatement<ast.VariableDeclaration>('let name');
    expect(s.name.name).toEqual('name');
    expect(s.type).toBeUndefined();
    expect(s.value).toBeUndefined();
    expect(s.isConst).toEqual(false);
  });

  test('should parse a variable with a type', () => {
    const s = parseStatement<ast.VariableDeclaration>('let name: Foo');
    expect(s.name.name).toEqual('name');
    expect(s.type!.name).toEqual('Foo');
    expect(s.value).toBeUndefined();
    expect(s.isConst).toEqual(false);
  });

  test('should parse a variable with a value', () => {
    const s = parseStatement<ast.VariableDeclaration>("let name = 'Hello'");
    expect(s.name.name).toEqual('name');
    expect(s.type).toBeUndefined();
    expect((s.value as ast.LiteralString).value).toEqual('Hello');
    expect(s.isConst).toEqual(false);
  });

  test('should parse a variable with a type and value', () => {
    const s = parseStatement<ast.VariableDeclaration>(
      "let name: String = 'Hello'"
    );
    expect(s.name.name).toEqual('name');
    expect(s.type!.name).toEqual('String');
    expect((s.value as ast.LiteralString).value).toEqual('Hello');
    expect(s.isConst).toEqual(false);
  });

  test('should parse a variable with a const modifier', () => {
    const s = parseStatement<ast.VariableDeclaration>('let const name');
    expect(s.name.name).toEqual('name');
    expect(s.type).toBeUndefined();
    expect(s.value).toBeUndefined();
    expect(s.isConst).toEqual(true);
  });

  test('should fail parsing a variable with multiple modifiers', () => {
    expect(() => parseStatement('let const const name')).toThrowError(
      StaticMessage
    );
  });
});

describe('parseReturn', () => {
  test('should parse a return statement', () => {
    const s = parseStatement<ast.ReturnStatement>('return');
    expect(s.expression).toBeUndefined();
  });

  test('should parse a return statement with an expression', () => {
    const s = parseStatement<ast.ReturnStatement>('return true');
    expect((s.expression as ast.LiteralBoolean).value).toEqual('true');
  });
});
