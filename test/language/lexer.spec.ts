// tslint:disable:no-magic-numbers
// tslint:disable:object-literal-sort-keys

import * as ast from '../../src/ast';
import { ClutchLexer, tokenize } from '../../src/language/lexer';

/**
 * A structural representation of @see Token without an offset.
 */
interface ITokenWithoutOffset {
  readonly text: string;
  readonly type: ast.ITokenTypes;
}

/**
 * Creates a simple structural representation of @param token.
 */
function toSimpleToken(token: ast.Token): ITokenWithoutOffset {
  return {
    text: token.lexeme,
    type: token.type,
  };
}

/**
 * A simple version of @see tokenize that returns @see ITokenWithoutOffset.
 */
function simpleTokenize(program: string): ITokenWithoutOffset[] {
  return tokenize(program).map(toSimpleToken);
}

it('should tokenize with a correct offset, comments, lexeme', () => {
  const program = `
    // Welcome!
    main => {}
  `;
  const scanned = tokenize(program);
  expect(scanned[0].offset).toBe(program.indexOf('main'));
  expect(scanned[0].type).toBe(ast.$Identifier);
  expect(scanned[0].lexeme).toBe('main');
  expect(scanned[0].length).toBe('main'.length);
  expect(scanned[0].isOperator).toBe(false);
  expect(scanned[0].isLiteral).toBe(true);
  expect(scanned[0].isKeyword).toBe(false);
  expect(scanned[0].isIdentifier).toBe(true);
  expect(scanned[0].isEndOfFile).toBe(false);
  expect(scanned[0].end).toBe(program.indexOf('main') + 'main'.length);
  expect(scanned[0].comments.map(toSimpleToken)).toMatchObject([
    {
      text: '// Welcome!',
      type: ast.$Comment,
    },
  ]);
});

it('should tokenize EOF', () => {
  const scanned = tokenize('');
  expect(scanned[0].isEndOfFile).toBe(true);
});

it('should tokenize function declaration', () => {
  const scanned = simpleTokenize(`
    main() -> {} 
  `);
  expect(scanned).toMatchObject([
    {
      text: 'main',
      type: ast.$Identifier,
    },
    {
      text: '(',
      type: ast.$LeftParen,
    },
    {
      text: ')',
      type: ast.$RightParen,
    },
    {
      text: '->',
      type: ast.$DashRightAngle,
    },
    {
      text: '{',
      type: ast.$LeftCurly,
    },
    {
      text: '}',
      type: ast.$RightCurly,
    },
    {
      text: '',
      type: ast.$EOF,
    },
  ]);
});

it('should tokenize external type declaration', () => {
  const scanned = simpleTokenize(`
    external type Foo {
      bar()
    }
  `);
  expect(scanned).toMatchObject([
    {
      text: 'external',
      type: ast.$External,
    },
    {
      text: 'type',
      type: ast.$Type,
    },
    {
      text: 'Foo',
      type: ast.$Identifier,
    },
    {
      text: '{',
      type: ast.$LeftCurly,
    },
    {
      text: 'bar',
      type: ast.$Identifier,
    },
    {
      text: '(',
      type: ast.$LeftParen,
    },
    {
      text: ')',
      type: ast.$RightParen,
    },
    {
      text: '}',
      type: ast.$RightCurly,
    },
    {
      text: '',
      type: ast.$EOF,
    },
  ]);
});

describe('keywords', () => {
  for (const name of Object.keys(ClutchLexer.keywords)) {
    it(`should tokenize "${name}"`, () => {
      const keyword = ClutchLexer.keywords[name];
      expect(name).toBeTruthy();
      const results: ITokenWithoutOffset[] = [
        {
          text: keyword.lexeme,
          type: keyword,
        },
        {
          text: '',
          type: ast.$EOF,
        },
      ];
      expect(simpleTokenize(name)).toMatchObject(results);
    });
  }
});

describe('expressions', () => {
  describe('prefix', () => {
    const operators: {
      [index: string]: ast.IOperatorTokenType;
    } = {
      '!': ast.$Exclaim,
      '~': ast.$Tilde,
      '+': ast.$Plus,
      '-': ast.$Dash,
      '++': ast.$PlusPlus,
      '--': ast.$DashDash,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "${name}x"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: name,
            type: operator,
          },
          {
            text: 'x',
            type: ast.$Identifier,
          },
          {
            text: '',
            type: ast.$EOF,
          },
        ];
        expect(simpleTokenize(`${name}x`)).toMatchObject(results);
      });
    }
  });

  describe('binary', () => {
    const operators: {
      [index: string]: ast.IOperatorTokenType;
    } = {
      '.': ast.$Period,
      '*': ast.$Star,
      '/': ast.$Slash,
      '%': ast.$Percent,
      '+': ast.$Plus,
      '-': ast.$Dash,
      '<<': ast.$LeftAngleLeftAngle,
      '>>': ast.$RightAngleRightAngle,
      '<': ast.$LeftAngle,
      '<=': ast.$LeftAngleEquals,
      '>': ast.$RightAngle,
      '>=': ast.$RightAngleEquals,
      '==': ast.$EqualsEquals,
      '!=': ast.$ExclaimEquals,
      '===': ast.$EqualsEqualsEquals,
      '!==': ast.$ExclaimEqualsEquals,
      '&&': ast.$AndAnd,
      '||': ast.$PipePipe,
      '=': ast.$Equals,
      '+=': ast.$PlusEquals,
      '-=': ast.$DashEquals,
      '*=': ast.$StarEquals,
      '/=': ast.$SlashEquals,
      '%=': ast.$PercentEquals,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "x${name}y"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: 'x',
            type: ast.$Identifier,
          },
          {
            text: name,
            type: operator,
          },
          {
            text: 'y',
            type: ast.$Identifier,
          },
          {
            text: '',
            type: ast.$EOF,
          },
        ];
        expect(simpleTokenize(`x${name}y`)).toMatchObject(results);
      });
    }
  });

  describe('postfix', () => {
    const operators: {
      [index: string]: ast.IOperatorTokenType;
    } = {
      '++': ast.$PlusPlus,
      '--': ast.$DashDash,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "x${name}"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: 'x',
            type: ast.$Identifier,
          },
          {
            text: name,
            type: operator,
          },
          {
            text: '',
            type: ast.$EOF,
          },
        ];
        expect(simpleTokenize(`x${name}`)).toMatchObject(results);
      });
    }
  });

  it('should tokenize grouping', () => {
    const results: ITokenWithoutOffset[] = [
      {
        text: '(',
        type: ast.$LeftParen,
      },
      {
        text: 'a',
        type: ast.$Identifier,
      },
      {
        text: '+',
        type: ast.$Plus,
      },
      {
        text: 'b',
        type: ast.$Identifier,
      },
      {
        text: ')',
        type: ast.$RightParen,
      },
      {
        text: '*',
        type: ast.$Star,
      },
      {
        text: 'c',
        type: ast.$Identifier,
      },
      {
        text: '',
        type: ast.$EOF,
      },
    ];
    expect(
      simpleTokenize(`
      (a + b) * c
    `)
    ).toMatchObject(results);
  });

  describe('should tokenize literal', () => {
    describe('numbers', () => {
      ['1', '1.0', '1.5', '3.14', '31.4', '0xAAA', '2e6'].forEach(n => {
        it(n, () => {
          expect(simpleTokenize(n)).toMatchObject([
            {
              text: n,
              type: ast.$Number,
            },
            {
              text: '',
              type: ast.$EOF,
            },
          ]);
        });
      });
    });

    describe('strings', () => {
      it('single line', () => {
        expect(
          simpleTokenize(`
          'Hello World'
        `)
        ).toMatchObject([
          {
            text: 'Hello World',
            type: ast.$String,
          },
          {
            text: '',
            type: ast.$EOF,
          },
        ]);
      });

      it('multiple lines', () => {
        expect(
          simpleTokenize(`
          '
            1
            2
            3
          '
        `)
        ).toMatchObject([
          {
            text: '\n            1\n            2\n            3\n          ',
            type: ast.$String,
          },
          {
            text: '',
            type: ast.$EOF,
          },
        ]);
      });
    });

    describe('identifiers', () => {
      ['fooBar', 'foo_Bar', '_fooBar'].forEach(n => {
        it(n, () => {
          expect(simpleTokenize(n)).toMatchObject([
            {
              text: n,
              type: ast.$Identifier,
            },
            {
              text: '',
              type: ast.$EOF,
            },
          ]);
        });
      });
    });
  });
});
