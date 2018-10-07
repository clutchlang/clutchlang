// tslint:disable: object-literal-sort-keys
import { Operator } from '../parser';
import { ModuleDeclarationElement } from './element';

// The definition of the "js_core" module which defines the minimum externs to
// run a program.
export const CORE_MODULE: ModuleDeclarationElement = ModuleDeclarationElement.fromJSON(
  {
    name: 'core',
    variables: [],
    functions: [
      {
        name: 'print',
        isConst: false,
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
            name: Operator.PostfixDecrement.name,
            isConst: false,
            type: {
              parameterTypes: [],
              returnType: 'Number',
            },
          },
          {
            name: Operator.PrefixDecrement.name,
            isConst: false,
            type: {
              parameterTypes: [],
              returnType: 'Number',
            },
          },
          {
            name: Operator.PostfixIncrement.name,
            isConst: false,
            type: {
              parameterTypes: [],
              returnType: 'Number',
            },
          },
          {
            name: Operator.PrefixIncrement.name,
            isConst: false,
            type: {
              parameterTypes: [],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Addition.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Subtraction.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Multiplication.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Division.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Remainder.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Number',
            },
          },
          {
            name: Operator.Equality.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.Inequality.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.GreaterThan.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.GreaterThanOrEqual.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LessThan.name,
            isConst: false,
            type: {
              parameterTypes: ['Number'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LessThanOrEqual.name,
            isConst: false,
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
            name: Operator.Inequality.name,
            isConst: false,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.Equality.name,
            isConst: false,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LogicalAnd.name,
            isConst: false,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LogicalOr.name,
            isConst: false,
            type: {
              parameterTypes: ['Boolean'],
              returnType: 'Boolean',
            },
          },
          {
            name: Operator.LogicalNot.name,
            isConst: false,
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
            isConst: false,
            type: {
              parameterTypes: [],
              returnType: 'String',
            },
          },
          {
            name: 'toUpperCase',
            isConst: false,
            type: {
              parameterTypes: [],
              returnType: 'String',
            },
          },
          {
            name: 'charAt',
            isConst: false,
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
