// This is a parser, and it makes less sense to sort keys here.
//
// tslint:disable:object-literal-sort-keys

import { compile } from 'moo';

export const lexer = compile({
  // Keywords:
  keyword: ['let', 'return'],

  // Basics:
  whitespace: /[ \t]+/,
  linebreak: { match: /\n/, lineBreaks: true },
  comment: /\/\/.*?$/,
  identifier: {
    match: /[a-zA-Z_][a-zA-Z0-9]*/,
  },

  // Literals:
  number: /0|[1-9][0-9]*/,
  string: /(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/,
  boolean: /true|false/,

  // Punctuation:
  lparen: '(',
  rparen: ')',
  lcurly: '{',
  rcurly: '}',
  arrow: '=>',
  dot: '.',
  colon: ':',

  // Operators:
  assign: /(?<!=)=(?!=)/,
  equals: /(?<!=)==(?!=)/,
  identical: /(?<!=)===(?!=)/,
});
