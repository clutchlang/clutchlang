import * as ast from '../ast/parser';
import * as element from './nodes';

export class Resolver /*extends AstVisitor<ElementNode, void>*/ {
  public visitFieldDeclaration(
    _: ast.VariableDeclaration,
    __?: void
  ): element.FieldElement {
    return new element.FieldElement();
  }

  public visitFunctionDeclaration(
    _: ast.FunctionDeclaration,
    __?: void
  ): element.FunctionElement {
    return new element.FunctionElement();
  }

  public visitTypeDeclaration(
    node: ast.TypeDeclaration,
    __?: void
  ): element.TypeElement {
    return new element.TypeElement(node.name.name);
  }
}
