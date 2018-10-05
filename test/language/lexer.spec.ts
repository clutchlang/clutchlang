// tslint:disable:no-magic-numbers
// tslint:disable:object-literal-sort-keys

import * as tokens from '../../src/language/ast/token';
import { ClutchLexer, tokenize } from '../../src/language/lexer';

/**
 * A structural representation of @see Token without an offset.
 */
interface ITokenWithoutOffset {
  readonly text: string;
  readonly type: tokens.ITokenTypes;
}

/**
 * Creates a simple structural representation of @param token.
 */
function toSimpleToken(token: tokens.Token): ITokenWithoutOffset {
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
  expect(scanned[0].type).toBe(tokens.$Identifier);
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
      type: tokens.$Comment,
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
      type: tokens.$Identifier,
    },
    {
      text: '(',
      type: tokens.$LeftParen,
    },
    {
      text: ')',
      type: tokens.$RightParen,
    },
    {
      text: '->',
      type: tokens.$DashRightAngle,
    },
    {
      text: '{',
      type: tokens.$LeftCurly,
    },
    {
      text: '}',
      type: tokens.$RightCurly,
    },
    {
      text: '',
      type: tokens.$EOF,
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
      type: tokens.$External,
    },
    {
      text: 'type',
      type: tokens.$Type,
    },
    {
      text: 'Foo',
      type: tokens.$Identifier,
    },
    {
      text: '{',
      type: tokens.$LeftCurly,
    },
    {
      text: 'bar',
      type: tokens.$Identifier,
    },
    {
      text: '(',
      type: tokens.$LeftParen,
    },
    {
      text: ')',
      type: tokens.$RightParen,
    },
    {
      text: '}',
      type: tokens.$RightCurly,
    },
    {
      text: '',
      type: tokens.$EOF,
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
          type: tokens.$EOF,
        },
      ];
      expect(simpleTokenize(name)).toMatchObject(results);
    });
  }
});

describe('expressions', () => {
  describe('prefix', () => {
    const operators: {
      [index: string]: tokens.IOperatorTokenType;
    } = {
      '!': tokens.$Exclaim,
      '~': tokens.$Tilde,
      '+': tokens.$Plus,
      '-': tokens.$Dash,
      '++': tokens.$PlusPlus,
      '--': tokens.$DashDash,
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
            type: tokens.$Identifier,
          },
          {
            text: '',
            type: tokens.$EOF,
          },
        ];
        expect(simpleTokenize(`${name}x`)).toMatchObject(results);
      });
    }
  });

  describe('binary', () => {
    const operators: {
      [index: string]: tokens.IOperatorTokenType;
    } = {
      '.': tokens.$Period,
      '*': tokens.$Star,
      '/': tokens.$Slash,
      '%': tokens.$Percent,
      '+': tokens.$Plus,
      '-': tokens.$Dash,
      '<<': tokens.$LeftAngleLeftAngle,
      '>>': tokens.$RightAngleRightAngle,
      '<': tokens.$LeftAngle,
      '<=': tokens.$LeftAngleEquals,
      '>': tokens.$RightAngle,
      '>=': tokens.$RightAngleEquals,
      '==': tokens.$EqualsEquals,
      '!=': tokens.$ExclaimEquals,
      '===': tokens.$EqualsEqualsEquals,
      '!==': tokens.$ExclaimEqualsEquals,
      '&&': tokens.$AndAnd,
      '||': tokens.$PipePipe,
      '=': tokens.$Equals,
      '+=': tokens.$PlusEquals,
      '-=': tokens.$DashEquals,
      '*=': tokens.$StarEquals,
      '/=': tokens.$SlashEquals,
      '%=': tokens.$PercentEquals,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "x${name}y"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: 'x',
            type: tokens.$Identifier,
          },
          {
            text: name,
            type: operator,
          },
          {
            text: 'y',
            type: tokens.$Identifier,
          },
          {
            text: '',
            type: tokens.$EOF,
          },
        ];
        expect(simpleTokenize(`x${name}y`)).toMatchObject(results);
      });
    }
  });

  describe('postfix', () => {
    const operators: {
      [index: string]: tokens.IOperatorTokenType;
    } = {
      '++': tokens.$PlusPlus,
      '--': tokens.$DashDash,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "x${name}"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: 'x',
            type: tokens.$Identifier,
          },
          {
            text: name,
            type: operator,
          },
          {
            text: '',
            type: tokens.$EOF,
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
        type: tokens.$LeftParen,
      },
      {
        text: 'a',
        type: tokens.$Identifier,
      },
      {
        text: '+',
        type: tokens.$Plus,
      },
      {
        text: 'b',
        type: tokens.$Identifier,
      },
      {
        text: ')',
        type: tokens.$RightParen,
      },
      {
        text: '*',
        type: tokens.$Star,
      },
      {
        text: 'c',
        type: tokens.$Identifier,
      },
      {
        text: '',
        type: tokens.$EOF,
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
              type: tokens.$Number,
            },
            {
              text: '',
              type: tokens.$EOF,
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
            type: tokens.$String,
          },
          {
            text: '',
            type: tokens.$EOF,
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
            type: tokens.$String,
          },
          {
            text: '',
            type: tokens.$EOF,
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
              type: tokens.$Identifier,
            },
            {
              text: '',
              type: tokens.$EOF,
            },
          ]);
        });
      });
    });
  });
});
