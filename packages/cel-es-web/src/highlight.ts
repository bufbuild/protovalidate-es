import Parser from "web-tree-sitter";

const HIGHLIGHT_Q = `
; Operators

[
  "-"
  "!"
  "*"
  "/"
  "&&"
  "%"
  "+"
  "<"
  "<="
  "=="
  "!="
  ">"
  ">="
  "||"
] @operator

; Keywords

[
"in"
] @keyword

; Function calls

(call_expression
  function: (identifier) @function)

(member_call_expression
  function: (identifier) @function)

; Identifiers

(identifier) @property

; Literals

[
  (double_quote_string_literal)
  (single_quoted_string_literal)
  (triple_double_quote_string_literal)
  (triple_single_quoted_string_literal)
] @string

[
  (int_literal)
  (uint_literal)
  (float_literal)
] @number

[
  (true)
  (false)
  (null)
] @constant.builtin

(comment) @comment
`;

export class Highlight {
  constructor(public start: number, public end: number, public type: string) {}
}

export function highlightCel(expr: string, parser: Parser) {
  const tree = parser.parse(expr);
  const highlights: Highlight[] = [];
  parser
    .getLanguage()
    .query(HIGHLIGHT_Q)
    .captures(tree.rootNode)
    .forEach((capture) => {
      highlights.push(
        new Highlight(
          capture.node.startIndex,
          capture.node.endIndex,
          capture.name
        )
      );
    });
  return highlights;
}
