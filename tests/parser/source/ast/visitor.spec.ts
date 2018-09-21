import { AstCompilationUnit } from '../../../../src/parser/source/ast/node';
import { AstParser } from '../../../../src/parser/source/ast/parser';
import { TokenScanner } from '../../../../src/parser/source/ast/scanner';
import { PrintTreeVisitor } from '../../../../src/parser/source/ast/visitor';
import { Lexer } from '../../../../src/parser/source/tokenizer/lexer';
import { SourceScanner } from '../../../../src/parser/source/tokenizer/scanner';

function parse(program: string): AstCompilationUnit {
  const scanner = new SourceScanner(program);
  const lexer = new Lexer(scanner);
  const tokens = Array.from(lexer);
  const parser = new AstParser(new TokenScanner(tokens));
  return parser.parseCompilationUnit();
}

describe(`${PrintTreeVisitor}`, () => {
  it('should emit a readable structure for a program', () => {
    const visitor = new PrintTreeVisitor();
    expect(
      visitor.visitCompilationUnit(
        parse(`
      emptyFunction => {}
      returnsLiteral => true
      hasExpressionBody => {
        1
        2
        3
      }
      hasInvocationBody => {
        print('Hello World')
      }
    `)
      )
    ).toMatchSnapshot();
  });
});
