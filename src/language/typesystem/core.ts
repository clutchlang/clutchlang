// tslint:disable: object-literal-sort-keys
import { Operator } from '../parser';
import { ModuleDeclarationElement } from './element';

// The definition of the "js_core" module which defines the minimum externs to
// run a program.
export const CORE_MODULE: ModuleDeclarationElement = ModuleDeclarationElement.fromJSON(
  {
    name: 'core',
    functions: [
      {
        name: 'print',
        type: {
          parameterTypes: ['Something'],
          returnType: '()',
        },
      },
    ],
    types: [
      {
        name: 'Number',
        methods: [
          {
            name: Operator.Addition,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Subtraction,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Multiplication,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Division,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Remainder,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Equality,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.Inequality,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.GreaterThan,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.GreaterThanOrEqual,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LessThan,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LessThanOrEqual,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
        ],
      },
      {
        name: 'Boolean',
        methods: [
          {
            name: Operator.Inequality,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.Equality,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LogicalAnd,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LogicalOr,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LogicalNot,
            type: {
              parameterTypes: [],
              returnType: 'Boolean',
            },
          },
        ],
      },
      {
        name: 'String',
        methods: [
          {
            name: 'toLowerCase',
            type: {
              parameterTypes: [],
              returnType: 'String',
            },
          },
          {
            name: 'toUpperCase',
            type: {
              parameterTypes: [],
              returnType: 'String',
            },
          },
          {
            name: 'charAt',
            type: {
              parameterTypes: ['Number'],
              returnType: 'String',
            },
          },
        ],
      },
    ],
  }
);
