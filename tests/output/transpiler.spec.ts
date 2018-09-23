import { JsOutputTranspiler } from '../../src/output/transpiler';
import { parse } from '../../src/parser/parse';

describe('JsOutputTranspiler', () => {
  it('should support "Hello World"', () => {
    const program = parse(`
      main => {
        print('Hello World')
      }
    `);
    const visitor = new JsOutputTranspiler();
    expect(program.visit(visitor)).toMatchSnapshot();
  });

  it('should support most ast nodes', () => {
    const program = parse(`
      example => {
        true
        1
        'Hello'
        foobar
        method(false)
        f(1 2)
      }

      explicit => {
        return true
      }

      implicit => {
        true
      }

      noReturn => {
        let variable = 5
      }

      withIf => if true 1

      withIfElse => if true 1 else 2

      withIfStatement => {
        if (true) {
          print(1)
        } else {
          print(2)
        }
      }

      ternary(a b c) => if a b else c
    `);
    const visitor = new JsOutputTranspiler();
    expect(program.visit(visitor)).toMatchSnapshot();
  });

  it('should support parenthesized ast nodes', () => {
    const program = parse(`
      example => {
        (true false)
        (false true)
      }
    `);
    const visitor = new JsOutputTranspiler();
    expect(program.visit(visitor)).toMatchSnapshot();
  });

  it('should support functions with parameters', () => {
    const program = parse(`
      print2(a b) => {
        print(a)
        print(b)
      }
    `);
    const visitor = new JsOutputTranspiler();
    expect(program.visit(visitor)).toMatchSnapshot();
  });
});
