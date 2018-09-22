// tslint:disable:no-magic-numbers

import { parse } from '../../../../src/parser/parse';
import {
  AstCompilationUnit,
  AstFunctionDeclaration,
  AstInvocationExpression,
  AstLiteralBoolean,
  AstLiteralIdentifier,
  AstLiteralNumber,
  AstLiteralString,
  AstNode,
  AstParenthesizedExpression,
} from '../../../../src/parser/source/ast/node';
import { AstVisitor } from '../../../../src/parser/source/ast/visitor';
import { Token } from '../../../../src/parser/source/tokenizer/tokens';

describe('AstParser', () => {
  it('should parse a blank program with two functions', () => {
    const unit = parse(`
      one => {}
      two => {}
    `);
    expect(unit.functions).toHaveLength(2);
    expect(unit.functions[0].name).toBe('one');
    expect(unit.functions[0].body).toHaveLength(0);
    expect(unit.functions[1].name).toBe('two');
    expect(unit.functions[1].body).toHaveLength(0);
  });

  it('should parse a lambda-style function', () => {
    const unit = parse(`
      main => true
    `);
    expect(unit.functions).toHaveLength(1);
  });

  it('should parse an expression-body function', () => {
    const unit = parse(`
      main => {
        1
        1.5
        -1
        -1.5
        'Hello'
        true
        false
        foobar
      }
    `);
    expect(unit.functions).toHaveLength(1);
    // Poor man's stringify.
    // TODO: Remove and replace with a visitor/humanizer.
    expect(
      unit.functions[0].body.map(e => {
        if (e instanceof AstLiteralIdentifier) {
          return e.name;
        }
        if (e instanceof AstInvocationExpression) {
          return `${e.target}(...)`;
        }
        if (e instanceof AstParenthesizedExpression) {
          return `(...)`;
        }
        return e.value;
      })
    ).toEqual([1, 1.5, -1, -1.5, 'Hello', true, false, 'foobar']);
  });

  it('should parse a function with an invocation', () => {
    const unit = parse(`
      main => {
        print('Hello World')
      }
    `);
    expect(unit.functions).toHaveLength(1);
  });

  it('should parse a function with parameters', () => {
    const unit = parse(`
      two(a b) => {
        print(a)
        print(b)
      }
    `);
    expect(unit.functions[0].parameters.map(e => e.name)).toEqual(['a', 'b']);
  });
});

it('AstNode.beginToken/endToken should be set', () => {
  const unit = parse(`
    main => {
      rfn()
      fn1(a)
      fn2(a b)
    }

    rfn => true

    fn1(a) => {
      true
      false
      -1.5
      -1
      0
      1
      1.5
      0xAABBCC
      'Hello World'
      "Hello World"
      fooBar
      (false true)
      (true false)
    }

    fn2(a b) => {
      a
      b
    }
  `);
  const tokens: Token[] = [];
  unit.visit(new WalkTokensVisitor(tokens));
  expect(
    Array.from(
      tokens.map(t => {
        return {
          kind: t.kind.name,
          offset: `${t.span.start.offset} -> ${t.span.end.offset}`,
          value: t.value,
        };
      })
    )
  ).toMatchSnapshot();
});

/**
 * A custom visitor that invokes beginToken/endToken.
 */
class WalkTokensVisitor extends AstVisitor {
  constructor(public readonly tokens: Token[]) {
    super();
  }

  public visitCompilationUnit(node: AstCompilationUnit): void {
    this.visitTokens(node);
    super.visitCompilationUnit(node);
  }

  public visitFunctionDeclaration(node: AstFunctionDeclaration): void {
    this.visitTokens(node);
    super.visitFunctionDeclaration(node);
  }

  public visitLiteralBoolean(node: AstLiteralBoolean): void {
    this.visitTokens(node);
  }

  public visitLiteralNumber(node: AstLiteralNumber): void {
    this.visitTokens(node);
  }

  public visitLiteralString(node: AstLiteralString): void {
    this.visitTokens(node);
  }

  public visitLiteralIdentifier(node: AstLiteralIdentifier): void {
    this.visitTokens(node);
  }

  public visitParenthesizedExpression(node: AstParenthesizedExpression): void {
    this.visitTokens(node);
    super.visitParenthesizedExpression(node);
  }

  public visitInvocationExpression(node: AstInvocationExpression): void {
    this.visitTokens(node);
    super.visitInvocationExpression(node);
  }

  private visitTokens(node: AstNode): void {
    this.tokens.push(node.beginToken);
    this.tokens.push(node.endToken);
  }
}
