import { Tokens } from '../parser';

export class Token {
  constructor(public readonly type: Tokens, public readonly value: string) {}
}
