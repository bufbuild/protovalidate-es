// Generated from CEL.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { MemberExprContext } from "./CELParser";
import { LogicalNotContext } from "./CELParser";
import { NegateContext } from "./CELParser";
import { IntContext } from "./CELParser";
import { UintContext } from "./CELParser";
import { DoubleContext } from "./CELParser";
import { StringContext } from "./CELParser";
import { BytesContext } from "./CELParser";
import { BoolTrueContext } from "./CELParser";
import { BoolFalseContext } from "./CELParser";
import { NullContext } from "./CELParser";
import { PrimaryExprContext } from "./CELParser";
import { SelectContext } from "./CELParser";
import { MemberCallContext } from "./CELParser";
import { IndexContext } from "./CELParser";
import { IdentOrGlobalCallContext } from "./CELParser";
import { NestedContext } from "./CELParser";
import { CreateListContext } from "./CELParser";
import { CreateStructContext } from "./CELParser";
import { CreateMessageContext } from "./CELParser";
import { ConstantLiteralContext } from "./CELParser";
import { StartContext } from "./CELParser";
import { ExprContext } from "./CELParser";
import { ConditionalOrContext } from "./CELParser";
import { ConditionalAndContext } from "./CELParser";
import { RelationContext } from "./CELParser";
import { CalcContext } from "./CELParser";
import { UnaryContext } from "./CELParser";
import { MemberContext } from "./CELParser";
import { PrimaryContext } from "./CELParser";
import { ExprListContext } from "./CELParser";
import { ListInitContext } from "./CELParser";
import { FieldInitializerListContext } from "./CELParser";
import { OptFieldContext } from "./CELParser";
import { MapInitializerListContext } from "./CELParser";
import { OptExprContext } from "./CELParser";
import { LiteralContext } from "./CELParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `CELParser`.
 */
export interface CELListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `MemberExpr`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	enterMemberExpr?: (ctx: MemberExprContext) => void;
	/**
	 * Exit a parse tree produced by the `MemberExpr`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	exitMemberExpr?: (ctx: MemberExprContext) => void;

	/**
	 * Enter a parse tree produced by the `LogicalNot`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	enterLogicalNot?: (ctx: LogicalNotContext) => void;
	/**
	 * Exit a parse tree produced by the `LogicalNot`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	exitLogicalNot?: (ctx: LogicalNotContext) => void;

	/**
	 * Enter a parse tree produced by the `Negate`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	enterNegate?: (ctx: NegateContext) => void;
	/**
	 * Exit a parse tree produced by the `Negate`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	exitNegate?: (ctx: NegateContext) => void;

	/**
	 * Enter a parse tree produced by the `Int`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterInt?: (ctx: IntContext) => void;
	/**
	 * Exit a parse tree produced by the `Int`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitInt?: (ctx: IntContext) => void;

	/**
	 * Enter a parse tree produced by the `Uint`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterUint?: (ctx: UintContext) => void;
	/**
	 * Exit a parse tree produced by the `Uint`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitUint?: (ctx: UintContext) => void;

	/**
	 * Enter a parse tree produced by the `Double`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterDouble?: (ctx: DoubleContext) => void;
	/**
	 * Exit a parse tree produced by the `Double`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitDouble?: (ctx: DoubleContext) => void;

	/**
	 * Enter a parse tree produced by the `String`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterString?: (ctx: StringContext) => void;
	/**
	 * Exit a parse tree produced by the `String`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitString?: (ctx: StringContext) => void;

	/**
	 * Enter a parse tree produced by the `Bytes`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterBytes?: (ctx: BytesContext) => void;
	/**
	 * Exit a parse tree produced by the `Bytes`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitBytes?: (ctx: BytesContext) => void;

	/**
	 * Enter a parse tree produced by the `BoolTrue`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterBoolTrue?: (ctx: BoolTrueContext) => void;
	/**
	 * Exit a parse tree produced by the `BoolTrue`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitBoolTrue?: (ctx: BoolTrueContext) => void;

	/**
	 * Enter a parse tree produced by the `BoolFalse`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterBoolFalse?: (ctx: BoolFalseContext) => void;
	/**
	 * Exit a parse tree produced by the `BoolFalse`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitBoolFalse?: (ctx: BoolFalseContext) => void;

	/**
	 * Enter a parse tree produced by the `Null`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterNull?: (ctx: NullContext) => void;
	/**
	 * Exit a parse tree produced by the `Null`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitNull?: (ctx: NullContext) => void;

	/**
	 * Enter a parse tree produced by the `PrimaryExpr`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	enterPrimaryExpr?: (ctx: PrimaryExprContext) => void;
	/**
	 * Exit a parse tree produced by the `PrimaryExpr`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	exitPrimaryExpr?: (ctx: PrimaryExprContext) => void;

	/**
	 * Enter a parse tree produced by the `Select`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	enterSelect?: (ctx: SelectContext) => void;
	/**
	 * Exit a parse tree produced by the `Select`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	exitSelect?: (ctx: SelectContext) => void;

	/**
	 * Enter a parse tree produced by the `MemberCall`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	enterMemberCall?: (ctx: MemberCallContext) => void;
	/**
	 * Exit a parse tree produced by the `MemberCall`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	exitMemberCall?: (ctx: MemberCallContext) => void;

	/**
	 * Enter a parse tree produced by the `Index`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	enterIndex?: (ctx: IndexContext) => void;
	/**
	 * Exit a parse tree produced by the `Index`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 */
	exitIndex?: (ctx: IndexContext) => void;

	/**
	 * Enter a parse tree produced by the `IdentOrGlobalCall`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterIdentOrGlobalCall?: (ctx: IdentOrGlobalCallContext) => void;
	/**
	 * Exit a parse tree produced by the `IdentOrGlobalCall`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitIdentOrGlobalCall?: (ctx: IdentOrGlobalCallContext) => void;

	/**
	 * Enter a parse tree produced by the `Nested`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterNested?: (ctx: NestedContext) => void;
	/**
	 * Exit a parse tree produced by the `Nested`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitNested?: (ctx: NestedContext) => void;

	/**
	 * Enter a parse tree produced by the `CreateList`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterCreateList?: (ctx: CreateListContext) => void;
	/**
	 * Exit a parse tree produced by the `CreateList`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitCreateList?: (ctx: CreateListContext) => void;

	/**
	 * Enter a parse tree produced by the `CreateStruct`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterCreateStruct?: (ctx: CreateStructContext) => void;
	/**
	 * Exit a parse tree produced by the `CreateStruct`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitCreateStruct?: (ctx: CreateStructContext) => void;

	/**
	 * Enter a parse tree produced by the `CreateMessage`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterCreateMessage?: (ctx: CreateMessageContext) => void;
	/**
	 * Exit a parse tree produced by the `CreateMessage`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitCreateMessage?: (ctx: CreateMessageContext) => void;

	/**
	 * Enter a parse tree produced by the `ConstantLiteral`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterConstantLiteral?: (ctx: ConstantLiteralContext) => void;
	/**
	 * Exit a parse tree produced by the `ConstantLiteral`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitConstantLiteral?: (ctx: ConstantLiteralContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.start`.
	 * @param ctx the parse tree
	 */
	enterStart?: (ctx: StartContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.start`.
	 * @param ctx the parse tree
	 */
	exitStart?: (ctx: StartContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.conditionalOr`.
	 * @param ctx the parse tree
	 */
	enterConditionalOr?: (ctx: ConditionalOrContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.conditionalOr`.
	 * @param ctx the parse tree
	 */
	exitConditionalOr?: (ctx: ConditionalOrContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.conditionalAnd`.
	 * @param ctx the parse tree
	 */
	enterConditionalAnd?: (ctx: ConditionalAndContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.conditionalAnd`.
	 * @param ctx the parse tree
	 */
	exitConditionalAnd?: (ctx: ConditionalAndContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.relation`.
	 * @param ctx the parse tree
	 */
	enterRelation?: (ctx: RelationContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.relation`.
	 * @param ctx the parse tree
	 */
	exitRelation?: (ctx: RelationContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.calc`.
	 * @param ctx the parse tree
	 */
	enterCalc?: (ctx: CalcContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.calc`.
	 * @param ctx the parse tree
	 */
	exitCalc?: (ctx: CalcContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	enterUnary?: (ctx: UnaryContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.unary`.
	 * @param ctx the parse tree
	 */
	exitUnary?: (ctx: UnaryContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.member`.
	 * @param ctx the parse tree
	 */
	enterMember?: (ctx: MemberContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.member`.
	 * @param ctx the parse tree
	 */
	exitMember?: (ctx: MemberContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	enterPrimary?: (ctx: PrimaryContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.primary`.
	 * @param ctx the parse tree
	 */
	exitPrimary?: (ctx: PrimaryContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.exprList`.
	 * @param ctx the parse tree
	 */
	enterExprList?: (ctx: ExprListContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.exprList`.
	 * @param ctx the parse tree
	 */
	exitExprList?: (ctx: ExprListContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.listInit`.
	 * @param ctx the parse tree
	 */
	enterListInit?: (ctx: ListInitContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.listInit`.
	 * @param ctx the parse tree
	 */
	exitListInit?: (ctx: ListInitContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.fieldInitializerList`.
	 * @param ctx the parse tree
	 */
	enterFieldInitializerList?: (ctx: FieldInitializerListContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.fieldInitializerList`.
	 * @param ctx the parse tree
	 */
	exitFieldInitializerList?: (ctx: FieldInitializerListContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.optField`.
	 * @param ctx the parse tree
	 */
	enterOptField?: (ctx: OptFieldContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.optField`.
	 * @param ctx the parse tree
	 */
	exitOptField?: (ctx: OptFieldContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.mapInitializerList`.
	 * @param ctx the parse tree
	 */
	enterMapInitializerList?: (ctx: MapInitializerListContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.mapInitializerList`.
	 * @param ctx the parse tree
	 */
	exitMapInitializerList?: (ctx: MapInitializerListContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.optExpr`.
	 * @param ctx the parse tree
	 */
	enterOptExpr?: (ctx: OptExprContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.optExpr`.
	 * @param ctx the parse tree
	 */
	exitOptExpr?: (ctx: OptExprContext) => void;

	/**
	 * Enter a parse tree produced by `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	enterLiteral?: (ctx: LiteralContext) => void;
	/**
	 * Exit a parse tree produced by `CELParser.literal`.
	 * @param ctx the parse tree
	 */
	exitLiteral?: (ctx: LiteralContext) => void;
}

