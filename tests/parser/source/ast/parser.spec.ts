// tslint:disable:no-magic-numbers

import {
  AstCompilationUnit,
  AstInvocationExpression,
  AstLiteralIdentifier,
} from '../../../../src/parser/source/ast/node';
import { AstParser } from '../../../../src/parser/source/ast/parser';
import { TokenScanner } from '../../../../src/parser/source/ast/scanner';
import { Lexer } from '../../../../src/parser/source/tokenizer/lexer';
import { SourceScanner } from '../../../../src/parser/source/tokenizer/scanner';

function parse(program: string): AstCompilationUnit {
  const scanner = new SourceScanner(program);
  const lexer = new Lexer(scanner);
  const tokens = Array.from(lexer);
  const parser = new AstParser(new TokenScanner(tokens));
  return parser.parseCompilationUnit();
}

describe('AstParser', () => {
  it('should parse a blank program with two functions', () => {
    const unit = parse(`
      one => {}
      two => {}
    `);
    expect(unit.functions).toHaveLength(2);
    expect(unit.functions[0].name).toBe('one');
    expect(unit.functions[0].body).toHaveLength(0);
    expect(unit.functions[1].name).toBe('two');
    expect(unit.functions[1].body).toHaveLength(0);
  });

  it('should parse a lambda-style function', () => {
    const unit = parse(`
      main => true
    `);
    expect(unit.functions).toHaveLength(1);
  });

  it('should parse an expression-body function', () => {
    const unit = parse(`
      main => {
        1
        1.5
        -1
        -1.5
        'Hello'
        true
        false
        foobar
      }
    `);
    expect(unit.functions).toHaveLength(1);
    // Poor man's stringify.
    // TODO: Remove and replace with a visitor/humanizer.
    expect(
      unit.functions[0].body.map(e => {
        if (e instanceof AstLiteralIdentifier) {
          return e.name;
        }
        if (e instanceof AstInvocationExpression) {
          return `${e.target}(...)`;
        }
        return e.value;
      })
    ).toEqual([1, 1.5, -1, -1.5, 'Hello', true, false, 'foobar']);
  });

  it('should parse a function with an invocation', () => {
    const unit = parse(`
      main => {
        print('Hello World')
      }
    `);
    expect(unit.functions).toHaveLength(1);
  });
});
