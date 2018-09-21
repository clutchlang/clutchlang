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
      }
    `);
    const visitor = new JsOutputTranspiler();
    expect(program.visit(visitor)).toMatchSnapshot();
  });
});
