// Generated from CEL.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CELParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CELVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `MemberExpr`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberExpr?: (ctx: MemberExprContext) => Result;

	/**
	 * Visit a parse tree produced by the `LogicalNot`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogicalNot?: (ctx: LogicalNotContext) => Result;

	/**
	 * Visit a parse tree produced by the `Negate`
	 * labeled alternative in `CELParser.unary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegate?: (ctx: NegateContext) => Result;

	/**
	 * Visit a parse tree produced by the `Int`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInt?: (ctx: IntContext) => Result;

	/**
	 * Visit a parse tree produced by the `Uint`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUint?: (ctx: UintContext) => Result;

	/**
	 * Visit a parse tree produced by the `Double`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDouble?: (ctx: DoubleContext) => Result;

	/**
	 * Visit a parse tree produced by the `String`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitString?: (ctx: StringContext) => Result;

	/**
	 * Visit a parse tree produced by the `Bytes`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBytes?: (ctx: BytesContext) => Result;

	/**
	 * Visit a parse tree produced by the `BoolTrue`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolTrue?: (ctx: BoolTrueContext) => Result;

	/**
	 * Visit a parse tree produced by the `BoolFalse`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolFalse?: (ctx: BoolFalseContext) => Result;

	/**
	 * Visit a parse tree produced by the `Null`
	 * labeled alternative in `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNull?: (ctx: NullContext) => Result;

	/**
	 * Visit a parse tree produced by the `PrimaryExpr`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimaryExpr?: (ctx: PrimaryExprContext) => Result;

	/**
	 * Visit a parse tree produced by the `Select`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSelect?: (ctx: SelectContext) => Result;

	/**
	 * Visit a parse tree produced by the `MemberCall`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberCall?: (ctx: MemberCallContext) => Result;

	/**
	 * Visit a parse tree produced by the `Index`
	 * labeled alternative in `CELParser.member`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndex?: (ctx: IndexContext) => Result;

	/**
	 * Visit a parse tree produced by the `IdentOrGlobalCall`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentOrGlobalCall?: (ctx: IdentOrGlobalCallContext) => Result;

	/**
	 * Visit a parse tree produced by the `Nested`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNested?: (ctx: NestedContext) => Result;

	/**
	 * Visit a parse tree produced by the `CreateList`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCreateList?: (ctx: CreateListContext) => Result;

	/**
	 * Visit a parse tree produced by the `CreateStruct`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCreateStruct?: (ctx: CreateStructContext) => Result;

	/**
	 * Visit a parse tree produced by the `CreateMessage`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCreateMessage?: (ctx: CreateMessageContext) => Result;

	/**
	 * Visit a parse tree produced by the `ConstantLiteral`
	 * labeled alternative in `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstantLiteral?: (ctx: ConstantLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.start`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStart?: (ctx: StartContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpr?: (ctx: ExprContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.conditionalOr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditionalOr?: (ctx: ConditionalOrContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.conditionalAnd`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditionalAnd?: (ctx: ConditionalAndContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.relation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRelation?: (ctx: RelationContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.calc`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCalc?: (ctx: CalcContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.unary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnary?: (ctx: UnaryContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.member`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMember?: (ctx: MemberContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.primary`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimary?: (ctx: PrimaryContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.exprList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExprList?: (ctx: ExprListContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.listInit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListInit?: (ctx: ListInitContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.fieldInitializerList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFieldInitializerList?: (ctx: FieldInitializerListContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.optField`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOptField?: (ctx: OptFieldContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.mapInitializerList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMapInitializerList?: (ctx: MapInitializerListContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.optExpr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOptExpr?: (ctx: OptExprContext) => Result;

	/**
	 * Visit a parse tree produced by `CELParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;
}

