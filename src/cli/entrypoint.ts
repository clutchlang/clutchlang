import * as fs from 'fs';
import { tokenize } from '../language/ast/lexer/tokenizer';
import { ClutchParser } from '../language/parser/parser';
import { PrintTreeVisitor } from '../language/parser/visitors/printer';
import { SimpleJsTranspiler } from '../transpiler/transpiler';

export interface IOptions {
  format: 'parse' | 'js';
  worker: boolean;
  input?: string;
  output?: string;
}

/**
 * Parses @param args int @see {Options}.
 */
export function parseOptions(args: string[]): IOptions {
  if (args.length < 1) {
    process.stderr.write('Missing expected arguments\n');
    process.exit(1);
  }
  let worker = false;
  if (args.some(e => e === '-worker' || e === '-w')) {
    worker = true;
  }
  let format: 'parse' | 'js' = 'js';
  if (args.some(e => e === '--parse' || e === '-p')) {
    format = 'parse';
  }
  let input: string | undefined;
  let output: string | undefined;
  for (const a of args) {
    if (a.startsWith('--output') || a.startsWith('-o')) {
      output = a.split('=')[1];
      break;
    }
  }
  if (!worker) {
    input = args[0];
  }
  if (!output && input) {
    output = `${input}.js`;
  }
  return {
    format,
    input,
    output,
    worker,
  };
}

/**
 * Runs the CLI using the provided @param options.
 */
export function run(options: IOptions): void {
  const visitor =
    options.format === 'parse' ? PrintTreeVisitor : SimpleJsTranspiler;
  if (options.worker) {
    process.stdin.setEncoding('utf8');
    let buffer = '';
    process.stdin.on('data', chunk => {
      buffer += chunk;
      if (buffer.endsWith('\n\n')) {
        try {
          const tokens = tokenize(buffer);
          const output = new ClutchParser(tokens)
            .parseFileRoot()
            .accept(new visitor());
          process.stdout.write(output.toString());
          process.stdout.write('\n');
        } catch (e) {
          if (e instanceof SyntaxError) {
            process.stderr.write((e as Error).message);
            process.stderr.write('\n');
            process.stderr.write('\n');
          } else {
            throw e;
          }
        } finally {
          buffer = '';
        }
      }
    });
    process.on('SIGINT', () => {
      process.exit(0);
    });
  } else {
    const file = options.input!;
    if (!fs.existsSync(file)) {
      process.stderr.write(`Could not read input file "${file}".\n`);
      process.exit(1);
    }
    const input = fs.readFileSync(options.input!, 'utf8');
    const tokens = tokenize(input);
    const output = new ClutchParser(tokens)
      .parseFileRoot()
      .accept(new visitor());
    if (options.format === 'parse') {
      process.stdout.write(`${output}\n`);
      return;
    }
    const data = output.toString();
    fs.writeFileSync(options.output!, data);
    process.stdout.write(`Wrote ${data.length} bytes to ${options.output}.\n`);
  }
}

// tslint:disable-next-line:no-magic-numbers
run(parseOptions(process.argv.slice(2)));
