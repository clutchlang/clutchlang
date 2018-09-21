import { parse } from '../../../../src/parser/parse';
import { PrintTreeVisitor } from '../../../../src/parser/source/ast/visitor';

describe('PrintTreeVisitor', () => {
  it('should emit a readable structure for a program', () => {
    const visitor = new PrintTreeVisitor();
    const program = parse(`
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
    `);
    expect(program.visit(visitor)).toMatchSnapshot();
  });
});
