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
        (true false)
        (false true)
      }
      hasInvocationBody => {
        print('Hello World')
      }
    `);
    expect(program.visit(visitor)).toMatchSnapshot();
  });

  it('should emit a few more functions', () => {
    const visitor = new PrintTreeVisitor();
    const program = parse(`
      returnsA => a
      returnsF0 => f()
      returnsF1 => f(1)
      returnsF2 => f(1 2)
      returnsPF => (f)
      returnsPF0 => (f())
    `);
    expect(program.visit(visitor)).toMatchSnapshot();
  });
});
