// tslint:disable:no-magic-numbers

import { SourceFile } from '../../../src/agnostic/scanner';
import * as lexer from '../../../src/language/ast/lexer';
import {
  StaticMessageCode,
  StaticMessageReporter,
} from '../../../src/language/ast/message';
import * as ast from '../../../src/language/ast/parser';
import { PrintTreeVisitor } from '../../../src/language/debug/printer';

function parseModuleRoot(text: string): ast.ModuleRoot {
  // TODO: Move the following block into a common test-infra area.
  const source = new SourceFile(text, 'printer.spec.ts');
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

test('should print expressions', () => {
  expect(parseModuleRoot(`
    main -> {
      // Binary
      1 + 1
      // Call
      call()
      // Conditional
      if a then b else c
      // Group
      (1 + 1)
      // Literals
      fooBar
      true
      false
      42
      'Hello World'
      // Prefix
      -1
      // Postfix
      n++
      // Property
      a.b

    }
  `).accept(new PrintTreeVisitor())).toMatchSnapshot();
});

test('should print other nodes', () => {
  expect(parseModuleRoot(`
    type Foo {
      bar -> {
        return true
      }
      baz -> {
        return
      }
    }

    let x: String = 'Hello'
  `).accept(new PrintTreeVisitor())).toMatchSnapshot();
});
