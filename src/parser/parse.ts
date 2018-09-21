import { AstCompilationUnit } from './source/ast/node';
import { AstParser } from './source/ast/parser';
import { TokenScanner } from './source/ast/scanner';
import { Lexer } from './source/tokenizer/lexer';
import { SourceScanner } from './source/tokenizer/scanner';

export function parse(program: string): AstCompilationUnit {
  const scanner = new SourceScanner(program);
  const lexer = new Lexer(scanner);
  const tokens = Array.from(lexer);
  const parser = new AstParser(new TokenScanner(tokens));
  return parser.parseCompilationUnit();
}
