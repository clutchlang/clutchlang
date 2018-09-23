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
        let isTrue = true
      }
      hasInvocationBody => {
        print('Hello World')
      }
      hasIfExpression(a) => if a true else false
      hasIfStatements => {
        if (true) {
          print(1)
        } else {
          print(2)
        }
        if false 3
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
      returnsExplicit => {
        return true
      }
    `);
    expect(program.visit(visitor)).toMatchSnapshot();
  });
});
