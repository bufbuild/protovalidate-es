// Copyright 2024 Dan Hudlow
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

{{
  import type { Expr } from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";
  import Builder from "./builder.js";
  const builder = new Builder();
}}

Expr
  = or:ConditionalOr S
    tail:TernaryTail?
    {
      /* : Expr */
      if (tail === null) {
        return or;
      } else {
        return builder.newCallExpr(offset(), "_?_:_", [or, ...tail]);
      }
    }

TernaryTail
  = "?" t:ConditionalOr S ":" f:Expr S
    {
      /* : [Expr, Expr] */
      return [t, f];
    }

ConditionalOr
  = and:ConditionalAnd|1.., $(S "||")|
    {
      /* : Expr */
      if (and.length === 1) {
        return and[0];
      } else {
        return builder.newCallExpr(offset(), "_||_", and);
      }
    }

ConditionalAnd
  = relation:Relation|1.., $(S "&&")|
    {
      /* : Expr */
      if (relation.length === 1) {
        return relation[0];
      } else {
        return builder.newCallExpr(offset(), "_&&_", relation);
      }
    }

Relation
  = addition:Addition tail:RelationTail?
    {
      /* : Expr */
      if (tail === null) {
        return addition;
      } else {
        return tail.reduce((expr, op) => op(expr), addition);
      }
    }

RelationTail
  = (
      S operator:Relop nextExpr:Addition
      { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
    )+

Relop "relational operator"
  = (
      operator:$("<=" / "<" / ">=" / ">" / "==" / "!=")
      { return `_${operator}_` }
    )
    / "in" { return "@in" }

Addition
  = multiplication:Multiplication tail:AdditionTail?
    {
      /* : Expr */
      if (tail === null) {
        return multiplication;
      } else {
        return tail.reduce((expr, op) => op(expr), multiplication);
      }
    }

AdditionTail
  = (
      S operator:( o:[+-] { return `_${o}_` } ) nextExpr:Multiplication
      { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
    )+

Multiplication
  = unary:Unary tail:MultiplicationTail?
    {
      /* : Expr */
      if (tail === null) {
        return unary;
      } else {
        return tail.reduce((expr, op) => op(expr), unary);
      }
    }

MultiplicationTail
  = (
      S operator:( o:[*/%] { return `_${o}_` } ) nextExpr:Unary
      { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
    )+

Unary
  = Member
  / S ops:$( "!"+ / "-"+ ) expr:Member
    {
      /* : Expr */
      if (ops.length % 2 === 0) {
        return expr;
      } else if (expr.exprKind.case === "callExpr" && expr.exprKind.value.function === `${ops[0]}_`) {
        return expr.exprKind.value.args[0];
      } else {
        return builder.newCallExpr(offset(), `${ops[0]}_`, [expr]);
      }
    }

Member
  = S primary:Primary tail:MemberTail
    {
      /* : Expr */
      if (tail.length === 0) {
        return primary;
      } else {
        return tail.reduce((expr, op) => op(expr), primary);
      }
    }

MemberTail
  = (S @Access)*

Access
  = "." S field:Identifier S ![(]
    { return ((prevExpr: Expr) => builder.newSelectExpr(offset(), prevExpr, field)) }
  / "." S identifier:Identifier S "(" args:ExprList ")"
    { return ((prevExpr: Expr) => builder.newMemberCallExpr(offset(), prevExpr, identifier, args)) }
  / "[" index:Expr "]"
    { return ((prevExpr: Expr) => builder.newCallExpr(offset(), "_[_]", [prevExpr, index])) }

Primary
  = Literal
  / "."? S name:Identifier !(S [({]) !("." Identifier|1.., "."| "{")
    { return builder.newIdentExpr(offset(), name) }
  / "."? S identifier:Identifier S "(" args:ExprList ")"
    { return builder.newCallExpr(offset(), identifier, args) }
  / "."? name:$Identifier|1.., "."| S "{" entries:FieldInits (",")? S "}"
    { return builder.newStructExpr(offset(), entries, name) }
  / "(" @Expr ")"
  / elements:("[" @ExprList (",")? S "]")
    { return builder.newListExpr(offset(), elements) }
  / entries:("{" @MapInits $((",")? S "}"))
    { return builder.newStructExpr(offset(), entries) }

ExprList
  = Expr|0.., ","|

FieldInits
  = (
      S key:Identifier $(S ":") value:Expr
      { return builder.newStructEntry(offset(), key, value) }
    )|0.., ","|

MapInits
  = (
      key:Expr ":" value:Expr
      { return builder.newMapEntry(offset(), key, value) }
    )|0.., ","|

Identifier "identifier"
  = id:$([_a-zA-Z][_a-zA-Z0-9]*)
    {
      if ([
        "true", "false", "null", "in", "as", "break", "const", "continue", "else",
        "for", "function", "if", "import", "let", "loop", "package", "namespace",
        "return", "var", "void", "while"
      ].includes(id)) {
        error("reserved identifier");
      }

      return id;
    }

Literal
  = FloatLiteral / UnsignedIntLiteral / IntLiteral / StringLiteral / BytesLiteral / BooleanLiteral / NullLiteral

IntLiteral "integer literal"
  = digits:$("-"? ("0x" HexDigit+ / Digit+))
  { return builder.newInt64Expr(offset(), digits) }

UnsignedIntLiteral "unsigned integer literal"
  = digits:$("0x" HexDigit+ / Digit+) [uU]
  { return builder.newUnsignedInt64Expr(offset(), digits) }

FloatLiteral "float literal"
  = digits:$("-"? Digit* "." Digit+ Exponent? / "-"? Digit+ Exponent)
  { return builder.newDoubleExpr(offset(), digits) }

Digit "digit"
  = [0-9]

HexDigit "hex digit"
  = [0-9abcdefABCDEF]

Exponent "exponent"
  = [eE] [+-]? Digit+

StringLiteral "string literal"
  = bytes:CharacterSequence
    { return builder.newStringExpr(offset(), bytes) }

BytesLiteral "bytes literal"
  = [bB] bytes:CharacterSequence
    { return builder.newBytesExpr(offset(), bytes) }

CharacterSequence "quoted character sequence"
  = [rR] @( '"""'  @(!'"""' @.)*                  '"""'
  / "'''"  @(!"'''" @.)*                          "'''"
  / '"'    @(!( '"' / NewLine ) @.)*              '"'
  / "'"    @(!( "'" / NewLine ) @.)*              "'")
  /       ( '"""'  @(Escape / $(!'"""' @.))*      '"""'
  / "'''"  @(Escape / $(!"'''" @.))*              "'''"
  / '"'    @(Escape / $(!( '"' / NewLine ) @.))*  '"'
  / "'"    @(Escape / $(!( "'" / NewLine ) @.))*  "'")

Escape "escaped character"
  = ByteSequence
  / "\\" value:[abfnrtv]
    {
      switch(value) {
        case 'a': return "\x07";
        case 'b': return "\b";
        case 'f': return "\f";
        case 'n': return "\n";
        case 'r': return "\r";
        case 't': return "\t";
        case 'v': return "\v";
      }

      throw new Error();
    }
  / "\\" @$[\"\'\`\\?]

ByteSequence "byte sequence"
  = Bytes+

Bytes "escaped bytes"
  = "\\" [xX] value:$Byte|1|        { return parseInt(value, 16) }
  / "\\u" value:$Byte|2|            { return parseInt(value, 16) }
  / "\\U" value:$Byte|4|            { return parseInt(value, 16) }
  / "\\" value:$([0-3] [0-7] [0-7]) { return parseInt(value, 8) }

Byte "byte value"
  = $(HexDigit HexDigit)

NewLine "new line"
  = "\r\n" / "\r" / "\n"

BooleanLiteral "boolean literal"
  = keyword:("true" / "false")
    { return builder.newBoolExpr(offset(), keyword) }

NullLiteral "null literal"
  = "null" ![_a-zA-Z0-9]
    { return builder.newNullExpr(offset()) }

S
  = WhiteSpace?

WhiteSpace "whitespace"
  = $([\t\n\f\r ]+)

Comment "comment"
  = '//' !NewLine* NewLine
