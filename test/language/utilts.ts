import { SourceFile } from '../../src/agnostic/scanner';
import * as lexer from '../../src/language/ast/lexer';
import {
  StaticMessageCode,
  StaticMessageReporter,
} from '../../src/language/ast/message';
import * as ast from '../../src/language/ast/parser';

/**
 * Parses @param text and returns as a module root.
 */
export function parseFile(text: string): ast.ModuleRoot {
  const source = new SourceFile(text, 'test.ts');
  const reporter = new StaticMessageReporter(source);
  const tokens = lexer.tokenize(text, (offset, length) => {
    reporter.reportOffset(
      offset,
      length,
      StaticMessageCode.SYNTAX_UNEXPECTED_TOKEN
    );
  });
  const parser = new ast.ModuleParser(tokens, reporter);
  return parser.parseModuleRoot();
}
