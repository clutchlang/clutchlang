import { tokenize } from '../../src/language/lexer';
import { ClutchParser, FileRoot } from '../../src/language/parser';
import { SimpleJsTranspiler } from '../../src/transpiler/transpiler';

function parse(program: string): FileRoot {
  const tokens = tokenize(program);
  return new ClutchParser(tokens).parseFileRoot();
}

describe('JsOutputTranspiler', () => {
  it('should support "Hello World"', () => {
    const program = parse(`
      main -> {
        print('Hello World')
      }
    `);
    const visitor = new SimpleJsTranspiler();
    expect(program.accept(visitor).toString()).toMatchSnapshot();
  });

  it('should support most ast nodes', () => {
    const program = parse(`
      example -> {
        true
        1
        'Hello'
        foobar
        method(false)
        f(1 2)
        -1
        +1
        !true
        --1
        1++
        true && false
        false || true
      }
      explicit -> {
        return true
      }
      implicit -> {
        true
      }
      noReturn -> {
        let variable = 5
      }
      withIf -> if true then 1
      withIfElse -> if true then 1 else 2
      withIfStatement -> {
        if true then 
          print(1) 
        else
          print(2)
      }
      ternary(a b c) -> if a then b else c
    `);
    const visitor = new SimpleJsTranspiler();
    expect(program.accept(visitor).toString()).toMatchSnapshot();
  });

  it('should support parenthesized ast nodes', () => {
    const program = parse(`
      example -> {
        (true)
      }
    `);
    const visitor = new SimpleJsTranspiler();
    expect(program.accept(visitor).toString()).toMatchSnapshot();
  });

  it('should support functions with parameters', () => {
    const program = parse(`
      print2(a: String b: String): void -> {
        print(a)
        print(b)
      }
    `);
    const visitor = new SimpleJsTranspiler();
    expect(program.accept(visitor).toString()).toMatchSnapshot();
  });
});
