// tslint:disable:no-magic-numbers
// tslint:disable:object-literal-sort-keys

import * as lexer from '../../src/language/ast/lexer';

/**
 * A structural representation of @see Token without an offset.
 */
interface ITokenWithoutOffset {
  readonly text: string;
  readonly type: lexer.ITokenTypes;
}

/**
 * Creates a simple structural representation of @param token.
 */
function toSimpleToken(token: lexer.Token): ITokenWithoutOffset {
  return {
    text: token.lexeme,
    type: token.type,
  };
}

/**
 * A simple version of @see tokenize that returns @see ITokenWithoutOffset.
 */
function simpleTokenize(program: string): ITokenWithoutOffset[] {
  return lexer.tokenize(program).map(toSimpleToken);
}

it('should tokenize with a correct offset, comments, lexeme', () => {
  const program = `
    // Welcome!
    main => {}
  `;
  const scanned = lexer.tokenize(program);
  expect(scanned[0].offset).toBe(program.indexOf('main'));
  expect(scanned[0].type).toBe(lexer.$Identifier);
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
      type: lexer.$Comment,
    },
  ]);
});

it('should tokenize EOF', () => {
  const scanned = lexer.tokenize('');
  expect(scanned[0].isEndOfFile).toBe(true);
});

it('should tokenize function declaration', () => {
  const scanned = simpleTokenize(`
    main() -> {} 
  `);
  expect(scanned).toMatchObject([
    {
      text: 'main',
      type: lexer.$Identifier,
    },
    {
      text: '(',
      type: lexer.$LeftParen,
    },
    {
      text: ')',
      type: lexer.$RightParen,
    },
    {
      text: '->',
      type: lexer.$DashRightAngle,
    },
    {
      text: '{',
      type: lexer.$LeftCurly,
    },
    {
      text: '}',
      type: lexer.$RightCurly,
    },
    {
      text: '',
      type: lexer.$EOF,
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
      type: lexer.$External,
    },
    {
      text: 'type',
      type: lexer.$Type,
    },
    {
      text: 'Foo',
      type: lexer.$Identifier,
    },
    {
      text: '{',
      type: lexer.$LeftCurly,
    },
    {
      text: 'bar',
      type: lexer.$Identifier,
    },
    {
      text: '(',
      type: lexer.$LeftParen,
    },
    {
      text: ')',
      type: lexer.$RightParen,
    },
    {
      text: '}',
      type: lexer.$RightCurly,
    },
    {
      text: '',
      type: lexer.$EOF,
    },
  ]);
});

describe('keywords', () => {
  for (const name of Object.keys(lexer.ClutchLexer.keywords)) {
    it(`should tokenize "${name}"`, () => {
      const keyword = lexer.ClutchLexer.keywords[name];
      expect(name).toBeTruthy();
      const results: ITokenWithoutOffset[] = [
        {
          text: keyword.lexeme,
          type: keyword,
        },
        {
          text: '',
          type: lexer.$EOF,
        },
      ];
      expect(simpleTokenize(name)).toMatchObject(results);
    });
  }
});

describe('expressions', () => {
  describe('prefix', () => {
    const operators: {
      [index: string]: lexer.IOperatorTokenType;
    } = {
      '!': lexer.$Exclaim,
      '~': lexer.$Tilde,
      '+': lexer.$Plus,
      '-': lexer.$Dash,
      '++': lexer.$PlusPlus,
      '--': lexer.$DashDash,
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
            type: lexer.$Identifier,
          },
          {
            text: '',
            type: lexer.$EOF,
          },
        ];
        expect(simpleTokenize(`${name}x`)).toMatchObject(results);
      });
    }
  });

  describe('binary', () => {
    const operators: {
      [index: string]: lexer.IOperatorTokenType;
    } = {
      '.': lexer.$Period,
      '*': lexer.$Star,
      '/': lexer.$Slash,
      '%': lexer.$Percent,
      '+': lexer.$Plus,
      '-': lexer.$Dash,
      '<<': lexer.$LeftAngleLeftAngle,
      '>>': lexer.$RightAngleRightAngle,
      '<': lexer.$LeftAngle,
      '<=': lexer.$LeftAngleEquals,
      '>': lexer.$RightAngle,
      '>=': lexer.$RightAngleEquals,
      '==': lexer.$EqualsEquals,
      '!=': lexer.$ExclaimEquals,
      '===': lexer.$EqualsEqualsEquals,
      '!==': lexer.$ExclaimEqualsEquals,
      '&&': lexer.$AndAnd,
      '||': lexer.$PipePipe,
      '=': lexer.$Equals,
      '+=': lexer.$PlusEquals,
      '-=': lexer.$DashEquals,
      '*=': lexer.$StarEquals,
      '/=': lexer.$SlashEquals,
      '%=': lexer.$PercentEquals,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "x${name}y"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: 'x',
            type: lexer.$Identifier,
          },
          {
            text: name,
            type: operator,
          },
          {
            text: 'y',
            type: lexer.$Identifier,
          },
          {
            text: '',
            type: lexer.$EOF,
          },
        ];
        expect(simpleTokenize(`x${name}y`)).toMatchObject(results);
      });
    }
  });

  describe('postfix', () => {
    const operators: {
      [index: string]: lexer.IOperatorTokenType;
    } = {
      '++': lexer.$PlusPlus,
      '--': lexer.$DashDash,
    };

    for (const name of Object.keys(operators)) {
      it(`should tokenize "x${name}"`, () => {
        const operator = operators[name];
        expect(operator).toBeTruthy();
        const results: ITokenWithoutOffset[] = [
          {
            text: 'x',
            type: lexer.$Identifier,
          },
          {
            text: name,
            type: operator,
          },
          {
            text: '',
            type: lexer.$EOF,
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
        type: lexer.$LeftParen,
      },
      {
        text: 'a',
        type: lexer.$Identifier,
      },
      {
        text: '+',
        type: lexer.$Plus,
      },
      {
        text: 'b',
        type: lexer.$Identifier,
      },
      {
        text: ')',
        type: lexer.$RightParen,
      },
      {
        text: '*',
        type: lexer.$Star,
      },
      {
        text: 'c',
        type: lexer.$Identifier,
      },
      {
        text: '',
        type: lexer.$EOF,
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
              type: lexer.$Number,
            },
            {
              text: '',
              type: lexer.$EOF,
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
            type: lexer.$String,
          },
          {
            text: '',
            type: lexer.$EOF,
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
            type: lexer.$String,
          },
          {
            text: '',
            type: lexer.$EOF,
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
              type: lexer.$Identifier,
            },
            {
              text: '',
              type: lexer.$EOF,
            },
          ]);
        });
      });
    });
  });
});
