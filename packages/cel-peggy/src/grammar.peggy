{{
import { ExprBuilder } from "./builder.js";
import { ParsedExpr } from "./pb/cel/expr/syntax_pb.js";
const builder = new ExprBuilder();
}}

Expr            = @ConditionalOr S !"?"
                / condition:ConditionalOr S "?" t:ConditionalOr S ":" f:Expr S
                  { return builder.newCallExpr(offset(), "_?_:_", [condition, t, f]) }

ConditionalOr   = @ConditionalAnd !(S "||")
                / value:ConditionalAnd|2.., S "||"|
                  { return builder.newCallExpr(offset(), "_||_", value) }

ConditionalAnd  = @Relation !(S "&&")
                / value:Relation|2.., S "&&"|
                  { return builder.newCallExpr(offset(), "_&&_", value) }

Relation        = @Addition !(S Relop)
                / firstExpr:Addition
                  operations:(
                    S operator:Relop nextExpr:Addition
                    { return (prevExpr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr]) }
                  )+
                  { return operations.reduce((expr, op) => op(expr), firstExpr); }

Relop           = (
                    operator:("<=" / "<" / ">=" / ">" / "==" / "!=")
                    { return `_${operator}_` }
                  )
                  / "in" { return "@in" }

Addition        = @Multiplication !(S [+-])
                / firstExpr:Multiplication
                  operations:(
                    S operator:( o:[+-] { return `_${o}_` } ) nextExpr:Multiplication
                    { return (prevExpr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr]) }
                  )+
                  { return operations.reduce((expr, op) => op(expr), firstExpr); }

Multiplication  = @Unary !(S [*/%])
                / firstExpr:Unary
                  operations:(
                    S operator:( o:[*/%] { return `_${o}_` } ) nextExpr:Unary
                    { return (prevExpr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr]) }
                  )+
                  { return operations.reduce((expr, op) => op(expr), firstExpr); }

Unary           = Member
                / S ops:( "!"+ / "-"+ ) expr:Member
                  {
                    if (ops.length % 2 === 0) {
                      return expr;
                    } else {
                      return builder.newCallExpr(offset(), `${ops[0]}_`, [expr]);
                    }
                  }

Member          = S @Primary !(S [.[])
                / S firstExpr:Primary selects:(S @Access)+
                  { return selects.reduce((expr, op) => op(expr), firstExpr); }

Access          = "." S field:IDENT S ![([]
                  { return prevExpr => builder.newSelectExpr(offset(), prevExpr, field) }
                / "." S ident:IDENT S "(" args:ExprList ")"
                  { return prevExpr => builder.newMemberCallExpr(offset(), prevExpr, ident, args) }
                / "[" index:Expr "]"
                  { return prevExpr => builder.newCallExpr(offset(), "_[_]", [prevExpr, index]) }

Primary         = LITERAL
                / "."? S name:IDENT !(S [({]) !("." IDENT|1.., "."| "{")
                  { return builder.newIdentExpr(offset(), name) }
                / "."? S ident:IDENT S "(" args:ExprList ")"
                  { return builder.newCallExpr(offset(), ident, args) }
                / "."? name:$IDENT|1.., "."| S "{" entries:FieldInits (",")? "}"
                  { return builder.newStructExpr(offset(), entries, name) }
                / "(" @Expr ")"
                / elements:("[" @ExprList (",")? "]")
                  { return builder.newListExpr(offset(), elements) }
                / entries:("{" @MapInits (",")? "}")
                  { return builder.newStructExpr(offset(), entries) }

ExprList        = Expr|0.., ","|

FieldInits      = (
                    S ident:IDENT S ":" value:Expr
                    { return builder.newStructEntry(offset(), ident, value) }
                  )|0.., ","|

MapInits        = (
                    key:Expr ":" value:Expr
                    { return builder.newMapEntry(offset(), key, value) }
                  )|0.., ","|

IDENT           = !RESERVED
                  @$([_a-zA-Z][_a-zA-Z0-9]*)

LITERAL         = FLOAT_LIT / UINT_LIT / INT_LIT / STRING_LIT / BYTES_LIT / BOOL_LIT / NULL_LIT

INT_LIT         = digits:$("-"? ("0x" HEXDIGIT+ / DIGIT+))
                  { return builder.newInt64Expr(offset(), digits) }

UINT_LIT        = digits:$("0x" HEXDIGIT+ / DIGIT+) [uU]
                  { return builder.newUnsignedInt64Expr(offset(), digits) }

FLOAT_LIT       = digits:$("-"? DIGIT* "." DIGIT+ EXPONENT? / "-"? DIGIT+ EXPONENT)
                  { return builder.newDoubleExpr(offset(), digits) }

DIGIT           = [0-9]

HEXDIGIT        = [0-9abcdefABCDEF]

EXPONENT        = [eE] [+-]? DIGIT+

STRING_LIT      = bytes:CHAR_SEQ
                  { return builder.newStringExpr(offset(), bytes) }

BYTES_LIT       = [bB] bytes:CHAR_SEQ
                  { return builder.newBytesExpr(offset(), bytes) }

CHAR_SEQ        = [rR] @( '"""'  @(!'"""' @.)*                          '"""'
                        / "'''"  @(!"'''" @.)*                          "'''"
                        / '"'    @(!( '"' / NEWLINE ) @.)*              '"'
                        / "'"    @(!( "'" / NEWLINE ) @.)*              "'")
                /       ( '"""'  @(ESCAPE / $(!'"""' @.))*              '"""'
                        / "'''"  @(ESCAPE / $(!"'''" @.))*              "'''"
                        / '"'    @(ESCAPE / $(!( '"' / NEWLINE ) @.))*  '"'
                        / "'"    @(ESCAPE / $(!( "'" / NEWLINE ) @.))*  "'")

ESCAPE          = BYTE_SEQ
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
                }
                / "\\" @$[\"\'\`\\?]

BYTE_SEQ        = value:BYTES+
                  { return value.flat() }

BYTES           = "\\x" value:$BYTE|1|            { return parseInt(value, 16) }
                / "\\u" value:$BYTE|2|            { return parseInt(value, 16) }
                / "\\U" value:$BYTE|4|            { return parseInt(value, 16) }
                / "\\" value:$([0-3] [0-7] [0-7]) { return parseInt(value, 8) }

BYTE            = value:$(HEXDIGIT HEXDIGIT)

NEWLINE         = "\r\n" / "\r" / "\n"

BOOL_LIT        = keyword:("true" / "false")

                  { return builder.newBoolExpr(offset(), keyword) }

NULL_LIT        = "null" ![_a-zA-Z0-9]
                  { return builder.newNullExpr(offset()) }

RESERVED        = (BOOL_LIT / NULL_LIT / "in"
                / "as" / "break" / "const" / "continue" / "else"
                / "for" / "function" / "if" / "import" / "let"
                / "loop" / "package" / "namespace" / "return"
                / "var" / "void" / "while") ![_a-zA-Z0-9]

S               = WHITESPACE?

WHITESPACE      = [\t\n\f\r ]+

COMMENT         = '//' !NEWLINE* NEWLINE
