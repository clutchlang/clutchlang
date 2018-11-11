import { ElementNode, ExternalType } from './types';

/**
 * Represents a parsed field definition.
 */
export class FieldElement extends ElementNode {}

/**
 * Represents a parsed function definition.
 */
export class FunctionElement extends ElementNode {}

/**
 * Represents a parsed `type` definition, if applicable.
 *
 * Not every type in the type system has a cooresponding @see TypeElement but
 * ones that are defined by the user or built-in SDK may.
 */
export class TypeElement extends ExternalType implements ElementNode {
  public constructor(name: string, source?: string) {
    super(name, source);
  }

  public get element(): ElementNode {
    return this;
  }
}
