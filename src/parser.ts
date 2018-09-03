// This is a parser, and it makes less sense to sort keys here.
//
// tslint:disable:object-literal-sort-keys

import { compile } from 'moo';

export const lexer = compile({
  // Basics:
  whitespace: /[ \t]+/,
  comment: /\/\/.*?$/,
  identifier: {
    match: /[a-zA-Z_][a-zA-Z0-9]*/,
  },

  // Literals:
  number: /0|[1-9][0-9]*/,
  string: /"(?:\\["\\]|[^\n"\\])*"/,
  boolean: /true|false/,

  // Punctuation:
  lparen: '(',
  rparen: ')',
  lcurly: '{',
  rcurly: '}',
  arrow: '=>',
});
