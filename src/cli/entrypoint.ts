import * as fs from 'fs';
import { JsOutputTranspiler } from '../output/transpiler';
import { parse } from '../parser/parse';
import { PrintTreeVisitor } from '../parser/source/ast/visitor';

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
    options.format === 'parse' ? PrintTreeVisitor : JsOutputTranspiler;
  if (options.worker) {
    process.stdin.setEncoding('utf8');
    let buffer = '';
    process.stdin.on('data', chunk => {
      buffer += chunk;
      if (buffer.endsWith('\n\n')) {
        const output = parse(buffer).visit(new visitor());
        // tslint:disable-next-line:no-any
        process.stdout.write(output as any);
        process.stdout.write('\n');
        buffer = '';
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
    // tslint:disable-next-line:no-any
    const output = parse(input).visit(new visitor()) as any;
    if (options.format === 'parse') {
      process.stdout.write(`${output}\n`);
      return;
    }
    fs.writeFileSync(options.output!, output);
    process.stdout.write(
      `Wrote ${output.length} bytes to ${options.output}.\n`
    );
  }
}

// tslint:disable-next-line:no-magic-numbers
run(parseOptions(process.argv.slice(2)));
