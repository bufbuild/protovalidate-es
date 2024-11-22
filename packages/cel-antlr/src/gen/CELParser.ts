// Generated from CEL.g4 by ANTLR 4.9.0-SNAPSHOT

// picked from 530c1b6, before peggy was added

/* eslint-disable */

import { ATN } from "antlr4ts/atn/ATN.js";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer.js";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException.js";
// @ts-expect-error
import { NotNull } from "antlr4ts/Decorators.js";
import { NoViableAltException } from "antlr4ts/NoViableAltException.js";
// @ts-expect-error
import { Override } from "antlr4ts/Decorators.js";
import { Parser } from "antlr4ts/Parser.js";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext.js";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator.js";
// @ts-expect-error
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener.js";
// @ts-expect-error
import type { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor.js";
import { RecognitionException } from "antlr4ts/RecognitionException.js";
import { RuleContext } from "antlr4ts/RuleContext.js";
//import { RuleVersion } from "antlr4ts/RuleVersion.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";
import { Token } from "antlr4ts/Token.js";
import type {TokenStream} from "antlr4ts/TokenStream.js";
import type {Vocabulary} from "antlr4ts/Vocabulary.js";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl.js";

import * as Utils from "antlr4ts/misc/Utils.js";

import type {CELListener} from "./CELListener.js";
import type {CELVisitor} from "./CELVisitor.js";


export class CELParser extends Parser {
	public static readonly EQUALS = 1;
	public static readonly NOT_EQUALS = 2;
	public static readonly IN = 3;
	public static readonly LESS = 4;
	public static readonly LESS_EQUALS = 5;
	public static readonly GREATER_EQUALS = 6;
	public static readonly GREATER = 7;
	public static readonly LOGICAL_AND = 8;
	public static readonly LOGICAL_OR = 9;
	public static readonly LBRACKET = 10;
	public static readonly RPRACKET = 11;
	public static readonly LBRACE = 12;
	public static readonly RBRACE = 13;
	public static readonly LPAREN = 14;
	public static readonly RPAREN = 15;
	public static readonly DOT = 16;
	public static readonly COMMA = 17;
	public static readonly MINUS = 18;
	public static readonly EXCLAM = 19;
	public static readonly QUESTIONMARK = 20;
	public static readonly COLON = 21;
	public static readonly PLUS = 22;
	public static readonly STAR = 23;
	public static readonly SLASH = 24;
	public static readonly PERCENT = 25;
	public static readonly CEL_TRUE = 26;
	public static readonly CEL_FALSE = 27;
	public static readonly NUL = 28;
	public static readonly WHITESPACE = 29;
	public static readonly COMMENT = 30;
	public static readonly NUM_FLOAT = 31;
	public static readonly NUM_INT = 32;
	public static readonly NUM_UINT = 33;
	public static readonly STRING = 34;
	public static readonly BYTES = 35;
	public static readonly IDENTIFIER = 36;
	public static readonly RULE_start = 0;
	public static readonly RULE_expr = 1;
	public static readonly RULE_conditionalOr = 2;
	public static readonly RULE_conditionalAnd = 3;
	public static readonly RULE_relation = 4;
	public static readonly RULE_calc = 5;
	public static readonly RULE_unary = 6;
	public static readonly RULE_member = 7;
	public static readonly RULE_primary = 8;
	public static readonly RULE_exprList = 9;
	public static readonly RULE_listInit = 10;
	public static readonly RULE_fieldInitializerList = 11;
	public static readonly RULE_optField = 12;
	public static readonly RULE_mapInitializerList = 13;
	public static readonly RULE_optExpr = 14;
	public static readonly RULE_literal = 15;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"start", "expr", "conditionalOr", "conditionalAnd", "relation", "calc",
		"unary", "member", "primary", "exprList", "listInit", "fieldInitializerList",
		"optField", "mapInitializerList", "optExpr", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'=='", "'!='", "'in'", "'<'", "'<='", "'>='", "'>'", "'&&'",
		"'||'", "'['", "']'", "'{'", "'}'", "'('", "')'", "'.'", "','", "'-'",
		"'!'", "'?'", "':'", "'+'", "'*'", "'/'", "'%'", "'true'", "'false'",
		"'null'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "EQUALS", "NOT_EQUALS", "IN", "LESS", "LESS_EQUALS", "GREATER_EQUALS",
		"GREATER", "LOGICAL_AND", "LOGICAL_OR", "LBRACKET", "RPRACKET", "LBRACE",
		"RBRACE", "LPAREN", "RPAREN", "DOT", "COMMA", "MINUS", "EXCLAM", "QUESTIONMARK",
		"COLON", "PLUS", "STAR", "SLASH", "PERCENT", "CEL_TRUE", "CEL_FALSE",
		"NUL", "WHITESPACE", "COMMENT", "NUM_FLOAT", "NUM_INT", "NUM_UINT", "STRING",
		"BYTES", "IDENTIFIER",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CELParser._LITERAL_NAMES, CELParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CELParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "CEL.g4"; }

	// @Override
	public get ruleNames(): string[] { return CELParser.ruleNames; }

	// @Override
	public override get serializedATN(): string { return CELParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(CELParser._ATN, this);
	}
	// @RuleVersion(0)
	public start(): StartContext {
		let _localctx: StartContext = new StartContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CELParser.RULE_start);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 32;
			_localctx._e = this.expr();
			this.state = 33;
			this.match(CELParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expr(): ExprContext {
		let _localctx: ExprContext = new ExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CELParser.RULE_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 35;
			_localctx._e = this.conditionalOr();
			this.state = 41;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === CELParser.QUESTIONMARK) {
				{
				this.state = 36;
				_localctx._op = this.match(CELParser.QUESTIONMARK);
				this.state = 37;
				_localctx._e1 = this.conditionalOr();
				this.state = 38;
				this.match(CELParser.COLON);
				this.state = 39;
				_localctx._e2 = this.expr();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public conditionalOr(): ConditionalOrContext {
		let _localctx: ConditionalOrContext = new ConditionalOrContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, CELParser.RULE_conditionalOr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 43;
			_localctx._e = this.conditionalAnd();
			this.state = 48;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CELParser.LOGICAL_OR) {
				{
				{
				this.state = 44;
				_localctx._s9 = this.match(CELParser.LOGICAL_OR);
				_localctx._ops.push(_localctx._s9);
				this.state = 45;
				_localctx._conditionalAnd = this.conditionalAnd();
				_localctx._e1.push(_localctx._conditionalAnd);
				}
				}
				this.state = 50;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public conditionalAnd(): ConditionalAndContext {
		let _localctx: ConditionalAndContext = new ConditionalAndContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CELParser.RULE_conditionalAnd);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 51;
			_localctx._e = this.relation(0);
			this.state = 56;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CELParser.LOGICAL_AND) {
				{
				{
				this.state = 52;
				_localctx._s8 = this.match(CELParser.LOGICAL_AND);
				_localctx._ops.push(_localctx._s8);
				this.state = 53;
				_localctx._relation = this.relation(0);
				_localctx._e1.push(_localctx._relation);
				}
				}
				this.state = 58;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public relation(): RelationContext;
	public relation(_p: number): RelationContext;
	// @RuleVersion(0)
	public relation(_p?: number): RelationContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: RelationContext = new RelationContext(this._ctx, _parentState);
    // @ts-expect-error
		let _prevctx: RelationContext = _localctx;
		let _startState: number = 8;
		this.enterRecursionRule(_localctx, 8, CELParser.RULE_relation, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 60;
			this.calc(0);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 67;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 3, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					{
					_localctx = new RelationContext(_parentctx, _parentState);
					this.pushNewRecursionContext(_localctx, _startState, CELParser.RULE_relation);
					this.state = 62;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 63;
					_localctx._op = this._input.LT(1);
					_la = this._input.LA(1);
					if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CELParser.EQUALS) | (1 << CELParser.NOT_EQUALS) | (1 << CELParser.IN) | (1 << CELParser.LESS) | (1 << CELParser.LESS_EQUALS) | (1 << CELParser.GREATER_EQUALS) | (1 << CELParser.GREATER))) !== 0))) {
						_localctx._op = this._errHandler.recoverInline(this);
					} else {
						if (this._input.LA(1) === Token.EOF) {
							this.matchedEOF = true;
						}

						this._errHandler.reportMatch(this);
						this.consume();
					}
					this.state = 64;
					this.relation(2);
					}
					}
				}
				this.state = 69;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 3, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public calc(): CalcContext;
	public calc(_p: number): CalcContext;
	// @RuleVersion(0)
	public calc(_p?: number): CalcContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: CalcContext = new CalcContext(this._ctx, _parentState);
    // @ts-expect-error
		let _prevctx: CalcContext = _localctx;
		let _startState: number = 10;
		this.enterRecursionRule(_localctx, 10, CELParser.RULE_calc, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 71;
			this.unary();
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 81;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 79;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
					case 1:
						{
						_localctx = new CalcContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CELParser.RULE_calc);
						this.state = 73;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 74;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CELParser.STAR) | (1 << CELParser.SLASH) | (1 << CELParser.PERCENT))) !== 0))) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 75;
						this.calc(3);
						}
						break;

					case 2:
						{
						_localctx = new CalcContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CELParser.RULE_calc);
						this.state = 76;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 77;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CELParser.MINUS || _la === CELParser.PLUS)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 78;
						this.calc(2);
						}
						break;
					}
					}
				}
				this.state = 83;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unary(): UnaryContext {
		let _localctx: UnaryContext = new UnaryContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CELParser.RULE_unary);
		let _la: number;
		try {
			let _alt: number;
			this.state = 97;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				_localctx = new MemberExprContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 84;
				this.member(0);
				}
				break;

			case 2:
				_localctx = new LogicalNotContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 86;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 85;
					(_localctx as LogicalNotContext)._s19 = this.match(CELParser.EXCLAM);
					(_localctx as LogicalNotContext)._ops.push((_localctx as LogicalNotContext)._s19);
					}
					}
					this.state = 88;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la === CELParser.EXCLAM);
				this.state = 90;
				this.member(0);
				}
				break;

			case 3:
				_localctx = new NegateContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 92;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 91;
						(_localctx as NegateContext)._s18 = this.match(CELParser.MINUS);
						(_localctx as NegateContext)._ops.push((_localctx as NegateContext)._s18);
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 94;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				this.state = 96;
				this.member(0);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public member(): MemberContext;
	public member(_p: number): MemberContext;
	// @RuleVersion(0)
	public member(_p?: number): MemberContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: MemberContext = new MemberContext(this._ctx, _parentState);
    // @ts-expect-error
		let _prevctx: MemberContext = _localctx;
		let _startState: number = 14;
		this.enterRecursionRule(_localctx, 14, CELParser.RULE_member, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			{
			_localctx = new PrimaryExprContext(_localctx);
			this._ctx = _localctx;
			_prevctx = _localctx;

			this.state = 100;
			this.primary();
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 126;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 13, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 124;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
					case 1:
						{
						_localctx = new SelectContext(new MemberContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CELParser.RULE_member);
						this.state = 102;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 103;
						(_localctx as SelectContext)._op = this.match(CELParser.DOT);
						this.state = 105;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === CELParser.QUESTIONMARK) {
							{
							this.state = 104;
							(_localctx as SelectContext)._opt = this.match(CELParser.QUESTIONMARK);
							}
						}

						this.state = 107;
						(_localctx as SelectContext)._id = this.match(CELParser.IDENTIFIER);
						}
						break;

					case 2:
						{
						_localctx = new MemberCallContext(new MemberContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CELParser.RULE_member);
						this.state = 108;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 109;
						(_localctx as MemberCallContext)._op = this.match(CELParser.DOT);
						this.state = 110;
						(_localctx as MemberCallContext)._id = this.match(CELParser.IDENTIFIER);
						this.state = 111;
						(_localctx as MemberCallContext)._open = this.match(CELParser.LPAREN);
						this.state = 113;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (((((_la - 10)) & ~0x1F) === 0 && ((1 << (_la - 10)) & ((1 << (CELParser.LBRACKET - 10)) | (1 << (CELParser.LBRACE - 10)) | (1 << (CELParser.LPAREN - 10)) | (1 << (CELParser.DOT - 10)) | (1 << (CELParser.MINUS - 10)) | (1 << (CELParser.EXCLAM - 10)) | (1 << (CELParser.CEL_TRUE - 10)) | (1 << (CELParser.CEL_FALSE - 10)) | (1 << (CELParser.NUL - 10)) | (1 << (CELParser.NUM_FLOAT - 10)) | (1 << (CELParser.NUM_INT - 10)) | (1 << (CELParser.NUM_UINT - 10)) | (1 << (CELParser.STRING - 10)) | (1 << (CELParser.BYTES - 10)) | (1 << (CELParser.IDENTIFIER - 10)))) !== 0)) {
							{
							this.state = 112;
							(_localctx as MemberCallContext)._args = this.exprList();
							}
						}

						this.state = 115;
						this.match(CELParser.RPAREN);
						}
						break;

					case 3:
						{
						_localctx = new IndexContext(new MemberContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CELParser.RULE_member);
						this.state = 116;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 117;
						(_localctx as IndexContext)._op = this.match(CELParser.LBRACKET);
						this.state = 119;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === CELParser.QUESTIONMARK) {
							{
							this.state = 118;
							(_localctx as IndexContext)._opt = this.match(CELParser.QUESTIONMARK);
							}
						}

						this.state = 121;
						(_localctx as IndexContext)._index = this.expr();
						this.state = 122;
						this.match(CELParser.RPRACKET);
						}
						break;
					}
					}
				}
				this.state = 128;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 13, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public primary(): PrimaryContext {
		let _localctx: PrimaryContext = new PrimaryContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, CELParser.RULE_primary);
		let _la: number;
		try {
			this.state = 180;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 25, this._ctx) ) {
			case 1:
				_localctx = new IdentOrGlobalCallContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 130;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.DOT) {
					{
					this.state = 129;
					(_localctx as IdentOrGlobalCallContext)._leadingDot = this.match(CELParser.DOT);
					}
				}

				this.state = 132;
				(_localctx as IdentOrGlobalCallContext)._id = this.match(CELParser.IDENTIFIER);
				this.state = 138;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
				case 1:
					{
					this.state = 133;
					(_localctx as IdentOrGlobalCallContext)._op = this.match(CELParser.LPAREN);
					this.state = 135;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 10)) & ~0x1F) === 0 && ((1 << (_la - 10)) & ((1 << (CELParser.LBRACKET - 10)) | (1 << (CELParser.LBRACE - 10)) | (1 << (CELParser.LPAREN - 10)) | (1 << (CELParser.DOT - 10)) | (1 << (CELParser.MINUS - 10)) | (1 << (CELParser.EXCLAM - 10)) | (1 << (CELParser.CEL_TRUE - 10)) | (1 << (CELParser.CEL_FALSE - 10)) | (1 << (CELParser.NUL - 10)) | (1 << (CELParser.NUM_FLOAT - 10)) | (1 << (CELParser.NUM_INT - 10)) | (1 << (CELParser.NUM_UINT - 10)) | (1 << (CELParser.STRING - 10)) | (1 << (CELParser.BYTES - 10)) | (1 << (CELParser.IDENTIFIER - 10)))) !== 0)) {
						{
						this.state = 134;
						(_localctx as IdentOrGlobalCallContext)._args = this.exprList();
						}
					}

					this.state = 137;
					this.match(CELParser.RPAREN);
					}
					break;
				}
				}
				break;

			case 2:
				_localctx = new NestedContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 140;
				this.match(CELParser.LPAREN);
				this.state = 141;
				(_localctx as NestedContext)._e = this.expr();
				this.state = 142;
				this.match(CELParser.RPAREN);
				}
				break;

			case 3:
				_localctx = new CreateListContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 144;
				(_localctx as CreateListContext)._op = this.match(CELParser.LBRACKET);
				this.state = 146;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 10)) & ~0x1F) === 0 && ((1 << (_la - 10)) & ((1 << (CELParser.LBRACKET - 10)) | (1 << (CELParser.LBRACE - 10)) | (1 << (CELParser.LPAREN - 10)) | (1 << (CELParser.DOT - 10)) | (1 << (CELParser.MINUS - 10)) | (1 << (CELParser.EXCLAM - 10)) | (1 << (CELParser.QUESTIONMARK - 10)) | (1 << (CELParser.CEL_TRUE - 10)) | (1 << (CELParser.CEL_FALSE - 10)) | (1 << (CELParser.NUL - 10)) | (1 << (CELParser.NUM_FLOAT - 10)) | (1 << (CELParser.NUM_INT - 10)) | (1 << (CELParser.NUM_UINT - 10)) | (1 << (CELParser.STRING - 10)) | (1 << (CELParser.BYTES - 10)) | (1 << (CELParser.IDENTIFIER - 10)))) !== 0)) {
					{
					this.state = 145;
					(_localctx as CreateListContext)._elems = this.listInit();
					}
				}

				this.state = 149;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.COMMA) {
					{
					this.state = 148;
					this.match(CELParser.COMMA);
					}
				}

				this.state = 151;
				this.match(CELParser.RPRACKET);
				}
				break;

			case 4:
				_localctx = new CreateStructContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 152;
				(_localctx as CreateStructContext)._op = this.match(CELParser.LBRACE);
				this.state = 154;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 10)) & ~0x1F) === 0 && ((1 << (_la - 10)) & ((1 << (CELParser.LBRACKET - 10)) | (1 << (CELParser.LBRACE - 10)) | (1 << (CELParser.LPAREN - 10)) | (1 << (CELParser.DOT - 10)) | (1 << (CELParser.MINUS - 10)) | (1 << (CELParser.EXCLAM - 10)) | (1 << (CELParser.QUESTIONMARK - 10)) | (1 << (CELParser.CEL_TRUE - 10)) | (1 << (CELParser.CEL_FALSE - 10)) | (1 << (CELParser.NUL - 10)) | (1 << (CELParser.NUM_FLOAT - 10)) | (1 << (CELParser.NUM_INT - 10)) | (1 << (CELParser.NUM_UINT - 10)) | (1 << (CELParser.STRING - 10)) | (1 << (CELParser.BYTES - 10)) | (1 << (CELParser.IDENTIFIER - 10)))) !== 0)) {
					{
					this.state = 153;
					(_localctx as CreateStructContext)._entries = this.mapInitializerList();
					}
				}

				this.state = 157;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.COMMA) {
					{
					this.state = 156;
					this.match(CELParser.COMMA);
					}
				}

				this.state = 159;
				this.match(CELParser.RBRACE);
				}
				break;

			case 5:
				_localctx = new CreateMessageContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 161;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.DOT) {
					{
					this.state = 160;
					(_localctx as CreateMessageContext)._leadingDot = this.match(CELParser.DOT);
					}
				}

				this.state = 163;
				(_localctx as CreateMessageContext)._IDENTIFIER = this.match(CELParser.IDENTIFIER);
				(_localctx as CreateMessageContext)._ids.push((_localctx as CreateMessageContext)._IDENTIFIER);
				this.state = 168;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CELParser.DOT) {
					{
					{
					this.state = 164;
					(_localctx as CreateMessageContext)._s16 = this.match(CELParser.DOT);
					(_localctx as CreateMessageContext)._ops.push((_localctx as CreateMessageContext)._s16);
					this.state = 165;
					(_localctx as CreateMessageContext)._IDENTIFIER = this.match(CELParser.IDENTIFIER);
					(_localctx as CreateMessageContext)._ids.push((_localctx as CreateMessageContext)._IDENTIFIER);
					}
					}
					this.state = 170;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 171;
				(_localctx as CreateMessageContext)._op = this.match(CELParser.LBRACE);
				this.state = 173;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.QUESTIONMARK || _la === CELParser.IDENTIFIER) {
					{
					this.state = 172;
					(_localctx as CreateMessageContext)._entries = this.fieldInitializerList();
					}
				}

				this.state = 176;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.COMMA) {
					{
					this.state = 175;
					this.match(CELParser.COMMA);
					}
				}

				this.state = 178;
				this.match(CELParser.RBRACE);
				}
				break;

			case 6:
				_localctx = new ConstantLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 179;
				this.literal();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public exprList(): ExprListContext {
		let _localctx: ExprListContext = new ExprListContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, CELParser.RULE_exprList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 182;
			_localctx._expr = this.expr();
			_localctx._e.push(_localctx._expr);
			this.state = 187;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CELParser.COMMA) {
				{
				{
				this.state = 183;
				this.match(CELParser.COMMA);
				this.state = 184;
				_localctx._expr = this.expr();
				_localctx._e.push(_localctx._expr);
				}
				}
				this.state = 189;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public listInit(): ListInitContext {
		let _localctx: ListInitContext = new ListInitContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, CELParser.RULE_listInit);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 190;
			_localctx._optExpr = this.optExpr();
			_localctx._elems.push(_localctx._optExpr);
			this.state = 195;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 27, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 191;
					this.match(CELParser.COMMA);
					this.state = 192;
					_localctx._optExpr = this.optExpr();
					_localctx._elems.push(_localctx._optExpr);
					}
					}
				}
				this.state = 197;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 27, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldInitializerList(): FieldInitializerListContext {
		let _localctx: FieldInitializerListContext = new FieldInitializerListContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, CELParser.RULE_fieldInitializerList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 198;
			_localctx._optField = this.optField();
			_localctx._fields.push(_localctx._optField);
			this.state = 199;
			_localctx._s21 = this.match(CELParser.COLON);
			_localctx._cols.push(_localctx._s21);
			this.state = 200;
			_localctx._expr = this.expr();
			_localctx._values.push(_localctx._expr);
			this.state = 208;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 201;
					this.match(CELParser.COMMA);
					this.state = 202;
					_localctx._optField = this.optField();
					_localctx._fields.push(_localctx._optField);
					this.state = 203;
					_localctx._s21 = this.match(CELParser.COLON);
					_localctx._cols.push(_localctx._s21);
					this.state = 204;
					_localctx._expr = this.expr();
					_localctx._values.push(_localctx._expr);
					}
					}
				}
				this.state = 210;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public optField(): OptFieldContext {
		let _localctx: OptFieldContext = new OptFieldContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, CELParser.RULE_optField);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 212;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === CELParser.QUESTIONMARK) {
				{
				this.state = 211;
				_localctx._opt = this.match(CELParser.QUESTIONMARK);
				}
			}

			this.state = 214;
			this.match(CELParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public mapInitializerList(): MapInitializerListContext {
		let _localctx: MapInitializerListContext = new MapInitializerListContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, CELParser.RULE_mapInitializerList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 216;
			_localctx._optExpr = this.optExpr();
			_localctx._keys.push(_localctx._optExpr);
			this.state = 217;
			_localctx._s21 = this.match(CELParser.COLON);
			_localctx._cols.push(_localctx._s21);
			this.state = 218;
			_localctx._expr = this.expr();
			_localctx._values.push(_localctx._expr);
			this.state = 226;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 30, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 219;
					this.match(CELParser.COMMA);
					this.state = 220;
					_localctx._optExpr = this.optExpr();
					_localctx._keys.push(_localctx._optExpr);
					this.state = 221;
					_localctx._s21 = this.match(CELParser.COLON);
					_localctx._cols.push(_localctx._s21);
					this.state = 222;
					_localctx._expr = this.expr();
					_localctx._values.push(_localctx._expr);
					}
					}
				}
				this.state = 228;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 30, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public optExpr(): OptExprContext {
		let _localctx: OptExprContext = new OptExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, CELParser.RULE_optExpr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 230;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === CELParser.QUESTIONMARK) {
				{
				this.state = 229;
				_localctx._opt = this.match(CELParser.QUESTIONMARK);
				}
			}

			this.state = 232;
			_localctx._e = this.expr();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, CELParser.RULE_literal);
		let _la: number;
		try {
			this.state = 248;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
			case 1:
				_localctx = new IntContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 235;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.MINUS) {
					{
					this.state = 234;
					(_localctx as IntContext)._sign = this.match(CELParser.MINUS);
					}
				}

				this.state = 237;
				(_localctx as IntContext)._tok = this.match(CELParser.NUM_INT);
				}
				break;

			case 2:
				_localctx = new UintContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 238;
				(_localctx as UintContext)._tok = this.match(CELParser.NUM_UINT);
				}
				break;

			case 3:
				_localctx = new DoubleContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 240;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CELParser.MINUS) {
					{
					this.state = 239;
					(_localctx as DoubleContext)._sign = this.match(CELParser.MINUS);
					}
				}

				this.state = 242;
				(_localctx as DoubleContext)._tok = this.match(CELParser.NUM_FLOAT);
				}
				break;

			case 4:
				_localctx = new StringContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 243;
				(_localctx as StringContext)._tok = this.match(CELParser.STRING);
				}
				break;

			case 5:
				_localctx = new BytesContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 244;
				(_localctx as BytesContext)._tok = this.match(CELParser.BYTES);
				}
				break;

			case 6:
				_localctx = new BoolTrueContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 245;
				(_localctx as BoolTrueContext)._tok = this.match(CELParser.CEL_TRUE);
				}
				break;

			case 7:
				_localctx = new BoolFalseContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 246;
				(_localctx as BoolFalseContext)._tok = this.match(CELParser.CEL_FALSE);
				}
				break;

			case 8:
				_localctx = new NullContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 247;
				(_localctx as NullContext)._tok = this.match(CELParser.NUL);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public override sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 4:
			return this.relation_sempred(_localctx as RelationContext, predIndex);

		case 5:
			return this.calc_sempred(_localctx as CalcContext, predIndex);

		case 7:
			return this.member_sempred(_localctx as MemberContext, predIndex);
		}
		return true;
	}
	private relation_sempred(_localctx: RelationContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private calc_sempred(_localctx: CalcContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return this.precpred(this._ctx, 2);

		case 2:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private member_sempred(_localctx: MemberContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return this.precpred(this._ctx, 3);

		case 4:
			return this.precpred(this._ctx, 2);

		case 5:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03&\xFD\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x03\x02\x03\x02\x03" +
		"\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03,\n\x03\x03" +
		"\x04\x03\x04\x03\x04\x07\x041\n\x04\f\x04\x0E\x044\v\x04\x03\x05\x03\x05" +
		"\x03\x05\x07\x059\n\x05\f\x05\x0E\x05<\v\x05\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x07\x06D\n\x06\f\x06\x0E\x06G\v\x06\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x07\x07R\n\x07" +
		"\f\x07\x0E\x07U\v\x07\x03\b\x03\b\x06\bY\n\b\r\b\x0E\bZ\x03\b\x03\b\x06" +
		"\b_\n\b\r\b\x0E\b`\x03\b\x05\bd\n\b\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x05\tl\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x05\tt\n\t\x03\t\x03" +
		"\t\x03\t\x03\t\x05\tz\n\t\x03\t\x03\t\x03\t\x07\t\x7F\n\t\f\t\x0E\t\x82" +
		"\v\t\x03\n\x05\n\x85\n\n\x03\n\x03\n\x03\n\x05\n\x8A\n\n\x03\n\x05\n\x8D" +
		"\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\x95\n\n\x03\n\x05\n\x98" +
		"\n\n\x03\n\x03\n\x03\n\x05\n\x9D\n\n\x03\n\x05\n\xA0\n\n\x03\n\x03\n\x05" +
		"\n\xA4\n\n\x03\n\x03\n\x03\n\x07\n\xA9\n\n\f\n\x0E\n\xAC\v\n\x03\n\x03" +
		"\n\x05\n\xB0\n\n\x03\n\x05\n\xB3\n\n\x03\n\x03\n\x05\n\xB7\n\n\x03\v\x03" +
		"\v\x03\v\x07\v\xBC\n\v\f\v\x0E\v\xBF\v\v\x03\f\x03\f\x03\f\x07\f\xC4\n" +
		"\f\f\f\x0E\f\xC7\v\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07" +
		"\r\xD1\n\r\f\r\x0E\r\xD4\v\r\x03\x0E\x05\x0E\xD7\n\x0E\x03\x0E\x03\x0E" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F" +
		"\xE3\n\x0F\f\x0F\x0E\x0F\xE6\v\x0F\x03\x10\x05\x10\xE9\n\x10\x03\x10\x03" +
		"\x10\x03\x11\x05\x11\xEE\n\x11\x03\x11\x03\x11\x03\x11\x05\x11\xF3\n\x11" +
		"\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x05\x11\xFB\n\x11\x03" +
		"\x11\x02\x02\x05\n\f\x10\x12\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02" +
		"\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02" +
		" \x02\x02\x05\x03\x02\x03\t\x03\x02\x19\x1B\x04\x02\x14\x14\x18\x18\x02" +
		"\u011B\x02\"\x03\x02\x02\x02\x04%\x03\x02\x02\x02\x06-\x03\x02\x02\x02" +
		"\b5\x03\x02\x02\x02\n=\x03\x02\x02\x02\fH\x03\x02\x02\x02\x0Ec\x03\x02" +
		"\x02\x02\x10e\x03\x02\x02\x02\x12\xB6\x03\x02\x02\x02\x14\xB8\x03\x02" +
		"\x02\x02\x16\xC0\x03\x02\x02\x02\x18\xC8\x03\x02\x02\x02\x1A\xD6\x03\x02" +
		"\x02\x02\x1C\xDA\x03\x02\x02\x02\x1E\xE8\x03\x02\x02\x02 \xFA\x03\x02" +
		"\x02\x02\"#\x05\x04\x03\x02#$\x07\x02\x02\x03$\x03\x03\x02\x02\x02%+\x05" +
		"\x06\x04\x02&\'\x07\x16\x02\x02\'(\x05\x06\x04\x02()\x07\x17\x02\x02)" +
		"*\x05\x04\x03\x02*,\x03\x02\x02\x02+&\x03\x02\x02\x02+,\x03\x02\x02\x02" +
		",\x05\x03\x02\x02\x02-2\x05\b\x05\x02./\x07\v\x02\x02/1\x05\b\x05\x02" +
		"0.\x03\x02\x02\x0214\x03\x02\x02\x0220\x03\x02\x02\x0223\x03\x02\x02\x02" +
		"3\x07\x03\x02\x02\x0242\x03\x02\x02\x025:\x05\n\x06\x0267\x07\n\x02\x02" +
		"79\x05\n\x06\x0286\x03\x02\x02\x029<\x03\x02\x02\x02:8\x03\x02\x02\x02" +
		":;\x03\x02\x02\x02;\t\x03\x02\x02\x02<:\x03\x02\x02\x02=>\b\x06\x01\x02" +
		">?\x05\f\x07\x02?E\x03\x02\x02\x02@A\f\x03\x02\x02AB\t\x02\x02\x02BD\x05" +
		"\n\x06\x04C@\x03\x02\x02\x02DG\x03\x02\x02\x02EC\x03\x02\x02\x02EF\x03" +
		"\x02\x02\x02F\v\x03\x02\x02\x02GE\x03\x02\x02\x02HI\b\x07\x01\x02IJ\x05" +
		"\x0E\b\x02JS\x03\x02\x02\x02KL\f\x04\x02\x02LM\t\x03\x02\x02MR\x05\f\x07" +
		"\x05NO\f\x03\x02\x02OP\t\x04\x02\x02PR\x05\f\x07\x04QK\x03\x02\x02\x02" +
		"QN\x03\x02\x02\x02RU\x03\x02\x02\x02SQ\x03\x02\x02\x02ST\x03\x02\x02\x02" +
		"T\r\x03\x02\x02\x02US\x03\x02\x02\x02Vd\x05\x10\t\x02WY\x07\x15\x02\x02" +
		"XW\x03\x02\x02\x02YZ\x03\x02\x02\x02ZX\x03\x02\x02\x02Z[\x03\x02\x02\x02" +
		"[\\\x03\x02\x02\x02\\d\x05\x10\t\x02]_\x07\x14\x02\x02^]\x03\x02\x02\x02" +
		"_`\x03\x02\x02\x02`^\x03\x02\x02\x02`a\x03\x02\x02\x02ab\x03\x02\x02\x02" +
		"bd\x05\x10\t\x02cV\x03\x02\x02\x02cX\x03\x02\x02\x02c^\x03\x02\x02\x02" +
		"d\x0F\x03\x02\x02\x02ef\b\t\x01\x02fg\x05\x12\n\x02g\x80\x03\x02\x02\x02" +
		"hi\f\x05\x02\x02ik\x07\x12\x02\x02jl\x07\x16\x02\x02kj\x03\x02\x02\x02" +
		"kl\x03\x02\x02\x02lm\x03\x02\x02\x02m\x7F\x07&\x02\x02no\f\x04\x02\x02" +
		"op\x07\x12\x02\x02pq\x07&\x02\x02qs\x07\x10\x02\x02rt\x05\x14\v\x02sr" +
		"\x03\x02\x02\x02st\x03\x02\x02\x02tu\x03\x02\x02\x02u\x7F\x07\x11\x02" +
		"\x02vw\f\x03\x02\x02wy\x07\f\x02\x02xz\x07\x16\x02\x02yx\x03\x02\x02\x02" +
		"yz\x03\x02\x02\x02z{\x03\x02\x02\x02{|\x05\x04\x03\x02|}\x07\r\x02\x02" +
		"}\x7F\x03\x02\x02\x02~h\x03\x02\x02\x02~n\x03\x02\x02\x02~v\x03\x02\x02" +
		"\x02\x7F\x82\x03\x02\x02\x02\x80~\x03\x02\x02\x02\x80\x81\x03\x02\x02" +
		"\x02\x81\x11\x03\x02\x02\x02\x82\x80\x03\x02\x02\x02\x83\x85\x07\x12\x02" +
		"\x02\x84\x83\x03\x02\x02\x02\x84\x85\x03\x02\x02\x02\x85\x86\x03\x02\x02" +
		"\x02\x86\x8C\x07&\x02\x02\x87\x89\x07\x10\x02\x02\x88\x8A\x05\x14\v\x02" +
		"\x89\x88\x03\x02\x02\x02\x89\x8A\x03\x02\x02\x02\x8A\x8B\x03\x02\x02\x02" +
		"\x8B\x8D\x07\x11\x02\x02\x8C\x87\x03\x02\x02\x02\x8C\x8D\x03\x02\x02\x02" +
		"\x8D\xB7\x03\x02\x02\x02\x8E\x8F\x07\x10\x02\x02\x8F\x90\x05\x04\x03\x02" +
		"\x90\x91\x07\x11\x02\x02\x91\xB7\x03\x02\x02\x02\x92\x94\x07\f\x02\x02" +
		"\x93\x95\x05\x16\f\x02\x94\x93\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02" +
		"\x95\x97\x03\x02\x02\x02\x96\x98\x07\x13\x02\x02\x97\x96\x03\x02\x02\x02" +
		"\x97\x98\x03\x02\x02\x02\x98\x99\x03\x02\x02\x02\x99\xB7\x07\r\x02\x02" +
		"\x9A\x9C\x07\x0E\x02\x02\x9B\x9D\x05\x1C\x0F\x02\x9C\x9B\x03\x02\x02\x02" +
		"\x9C\x9D\x03\x02\x02\x02\x9D\x9F\x03\x02\x02\x02\x9E\xA0\x07\x13\x02\x02" +
		"\x9F\x9E\x03\x02\x02\x02\x9F\xA0\x03\x02\x02\x02\xA0\xA1\x03\x02\x02\x02" +
		"\xA1\xB7\x07\x0F\x02\x02\xA2\xA4\x07\x12\x02\x02\xA3\xA2\x03\x02\x02\x02" +
		"\xA3\xA4\x03\x02\x02\x02\xA4\xA5\x03\x02\x02\x02\xA5\xAA\x07&\x02\x02" +
		"\xA6\xA7\x07\x12\x02\x02\xA7\xA9\x07&\x02\x02\xA8\xA6\x03\x02\x02\x02" +
		"\xA9\xAC\x03\x02\x02\x02\xAA\xA8\x03\x02\x02\x02\xAA\xAB\x03\x02\x02\x02" +
		"\xAB\xAD\x03\x02\x02\x02\xAC\xAA\x03\x02\x02\x02\xAD\xAF\x07\x0E\x02\x02" +
		"\xAE\xB0\x05\x18\r\x02\xAF\xAE\x03\x02\x02\x02\xAF\xB0\x03\x02\x02\x02" +
		"\xB0\xB2\x03\x02\x02\x02\xB1\xB3\x07\x13\x02\x02\xB2\xB1\x03\x02\x02\x02" +
		"\xB2\xB3\x03\x02\x02\x02\xB3\xB4\x03\x02\x02\x02\xB4\xB7\x07\x0F\x02\x02" +
		"\xB5\xB7\x05 \x11\x02\xB6\x84\x03\x02\x02\x02\xB6\x8E\x03\x02\x02\x02" +
		"\xB6\x92\x03\x02\x02\x02\xB6\x9A\x03\x02\x02\x02\xB6\xA3\x03\x02\x02\x02" +
		"\xB6\xB5\x03\x02\x02\x02\xB7\x13\x03\x02\x02\x02\xB8\xBD\x05\x04\x03\x02" +
		"\xB9\xBA\x07\x13\x02\x02\xBA\xBC\x05\x04\x03\x02\xBB\xB9\x03\x02\x02\x02" +
		"\xBC\xBF\x03\x02\x02\x02\xBD\xBB\x03\x02\x02\x02\xBD\xBE\x03\x02\x02\x02" +
		"\xBE\x15\x03\x02\x02\x02\xBF\xBD\x03\x02\x02\x02\xC0\xC5\x05\x1E\x10\x02" +
		"\xC1\xC2\x07\x13\x02\x02\xC2\xC4\x05\x1E\x10\x02\xC3\xC1\x03\x02\x02\x02" +
		"\xC4\xC7\x03\x02\x02\x02\xC5\xC3\x03\x02\x02\x02\xC5\xC6\x03\x02\x02\x02" +
		"\xC6\x17\x03\x02\x02\x02\xC7\xC5\x03\x02\x02\x02\xC8\xC9\x05\x1A\x0E\x02" +
		"\xC9\xCA\x07\x17\x02\x02\xCA\xD2\x05\x04\x03\x02\xCB\xCC\x07\x13\x02\x02" +
		"\xCC\xCD\x05\x1A\x0E\x02\xCD\xCE\x07\x17\x02\x02\xCE\xCF\x05\x04\x03\x02" +
		"\xCF\xD1\x03\x02\x02\x02\xD0\xCB\x03\x02\x02\x02\xD1\xD4\x03\x02\x02\x02" +
		"\xD2\xD0\x03\x02\x02\x02\xD2\xD3\x03\x02\x02\x02\xD3\x19\x03\x02\x02\x02" +
		"\xD4\xD2\x03\x02\x02\x02\xD5\xD7\x07\x16\x02\x02\xD6\xD5\x03\x02\x02\x02" +
		"\xD6\xD7\x03\x02\x02\x02\xD7\xD8\x03\x02\x02\x02\xD8\xD9\x07&\x02\x02" +
		"\xD9\x1B\x03\x02\x02\x02\xDA\xDB\x05\x1E\x10\x02\xDB\xDC\x07\x17\x02\x02" +
		"\xDC\xE4\x05\x04\x03\x02\xDD\xDE\x07\x13\x02\x02\xDE\xDF\x05\x1E\x10\x02" +
		"\xDF\xE0\x07\x17\x02\x02\xE0\xE1\x05\x04\x03\x02\xE1\xE3\x03\x02\x02\x02" +
		"\xE2\xDD\x03\x02\x02\x02\xE3\xE6\x03\x02\x02\x02\xE4\xE2\x03\x02\x02\x02" +
		"\xE4\xE5\x03\x02\x02\x02\xE5\x1D\x03\x02\x02\x02\xE6\xE4\x03\x02\x02\x02" +
		"\xE7\xE9\x07\x16\x02\x02\xE8\xE7\x03\x02\x02\x02\xE8\xE9\x03\x02\x02\x02" +
		"\xE9\xEA\x03\x02\x02\x02\xEA\xEB\x05\x04\x03\x02\xEB\x1F\x03\x02\x02\x02" +
		"\xEC\xEE\x07\x14\x02\x02\xED\xEC\x03\x02\x02\x02\xED\xEE\x03\x02\x02\x02" +
		"\xEE\xEF\x03\x02\x02\x02\xEF\xFB\x07\"\x02\x02\xF0\xFB\x07#\x02\x02\xF1" +
		"\xF3\x07\x14\x02\x02\xF2\xF1\x03\x02\x02\x02\xF2\xF3\x03\x02\x02\x02\xF3" +
		"\xF4\x03\x02\x02\x02\xF4\xFB\x07!\x02\x02\xF5\xFB\x07$\x02\x02\xF6\xFB" +
		"\x07%\x02\x02\xF7\xFB\x07\x1C\x02\x02\xF8\xFB\x07\x1D\x02\x02\xF9\xFB" +
		"\x07\x1E\x02\x02\xFA\xED\x03\x02\x02\x02\xFA\xF0\x03\x02\x02\x02\xFA\xF2" +
		"\x03\x02\x02\x02\xFA\xF5\x03\x02\x02\x02\xFA\xF6\x03\x02\x02\x02\xFA\xF7" +
		"\x03\x02\x02\x02\xFA\xF8\x03\x02\x02\x02\xFA\xF9\x03\x02\x02\x02\xFB!" +
		"\x03\x02\x02\x02%+2:EQSZ`cksy~\x80\x84\x89\x8C\x94\x97\x9C\x9F\xA3\xAA" +
		"\xAF\xB2\xB6\xBD\xC5\xD2\xD6\xE4\xE8\xED\xF2\xFA";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CELParser.__ATN) {
			CELParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CELParser._serializedATN));
		}

		return CELParser.__ATN;
	}

}

export class StartContext extends ParserRuleContext {
	public _e!: ExprContext;
	public EOF(): TerminalNode { return this.getToken(CELParser.EOF, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	public override get ruleIndex(): number { return CELParser.RULE_start; }
	public override enterRule(listener: CELListener): void {
		if (listener.enterStart) {
			listener.enterStart(this);
		}
	}
	public override exitRule(listener: CELListener): void {
		if (listener.exitStart) {
			listener.exitStart(this);
		}
	}
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitStart) {
			return visitor.visitStart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	public _e!: ConditionalOrContext;
	public _op!: Token;
	public _e1!: ConditionalOrContext;
	public _e2!: ExprContext;
	public conditionalOr(): ConditionalOrContext[];
	public conditionalOr(i: number): ConditionalOrContext;
	public conditionalOr(i?: number): ConditionalOrContext | ConditionalOrContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ConditionalOrContext);
		} else {
			return this.getRuleContext(i, ConditionalOrContext);
		}
	}
	public COLON(): TerminalNode | undefined { return this.tryGetToken(CELParser.COLON, 0); }
	public QUESTIONMARK(): TerminalNode | undefined { return this.tryGetToken(CELParser.QUESTIONMARK, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_expr; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterExpr) {
			listener.enterExpr(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitExpr) {
			listener.exitExpr(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitExpr) {
			return visitor.visitExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConditionalOrContext extends ParserRuleContext {
	public _e!: ConditionalAndContext;
	public _s9!: Token;
	public _ops: Token[] = [];
	public _conditionalAnd!: ConditionalAndContext;
	public _e1: ConditionalAndContext[] = [];
	public conditionalAnd(): ConditionalAndContext[];
	public conditionalAnd(i: number): ConditionalAndContext;
	public conditionalAnd(i?: number): ConditionalAndContext | ConditionalAndContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ConditionalAndContext);
		} else {
			return this.getRuleContext(i, ConditionalAndContext);
		}
	}
	public LOGICAL_OR(): TerminalNode[];
	public LOGICAL_OR(i: number): TerminalNode;
	public LOGICAL_OR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.LOGICAL_OR);
		} else {
			return this.getToken(CELParser.LOGICAL_OR, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	public override get ruleIndex(): number { return CELParser.RULE_conditionalOr; }
	public override enterRule(listener: CELListener): void {
		if (listener.enterConditionalOr) {
			listener.enterConditionalOr(this);
		}
	}
	public override exitRule(listener: CELListener): void {
		if (listener.exitConditionalOr) {
			listener.exitConditionalOr(this);
		}
	}
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitConditionalOr) {
			return visitor.visitConditionalOr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConditionalAndContext extends ParserRuleContext {
	public _e!: RelationContext;
	public _s8!: Token;
	public _ops: Token[] = [];
	public _relation!: RelationContext;
	public _e1: RelationContext[] = [];
	public relation(): RelationContext[];
	public relation(i: number): RelationContext;
	public relation(i?: number): RelationContext | RelationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RelationContext);
		} else {
			return this.getRuleContext(i, RelationContext);
		}
	}
	public LOGICAL_AND(): TerminalNode[];
	public LOGICAL_AND(i: number): TerminalNode;
	public LOGICAL_AND(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.LOGICAL_AND);
		} else {
			return this.getToken(CELParser.LOGICAL_AND, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_conditionalAnd; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterConditionalAnd) {
			listener.enterConditionalAnd(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitConditionalAnd) {
			listener.exitConditionalAnd(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitConditionalAnd) {
			return visitor.visitConditionalAnd(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RelationContext extends ParserRuleContext {
	public _op!: Token;
	public calc(): CalcContext | undefined {
		return this.tryGetRuleContext(0, CalcContext);
	}
	public relation(): RelationContext[];
	public relation(i: number): RelationContext;
	public relation(i?: number): RelationContext | RelationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RelationContext);
		} else {
			return this.getRuleContext(i, RelationContext);
		}
	}
	public LESS(): TerminalNode | undefined { return this.tryGetToken(CELParser.LESS, 0); }
	public LESS_EQUALS(): TerminalNode | undefined { return this.tryGetToken(CELParser.LESS_EQUALS, 0); }
	public GREATER_EQUALS(): TerminalNode | undefined { return this.tryGetToken(CELParser.GREATER_EQUALS, 0); }
	public GREATER(): TerminalNode | undefined { return this.tryGetToken(CELParser.GREATER, 0); }
	public EQUALS(): TerminalNode | undefined { return this.tryGetToken(CELParser.EQUALS, 0); }
	public NOT_EQUALS(): TerminalNode | undefined { return this.tryGetToken(CELParser.NOT_EQUALS, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(CELParser.IN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_relation; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterRelation) {
			listener.enterRelation(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitRelation) {
			listener.exitRelation(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitRelation) {
			return visitor.visitRelation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CalcContext extends ParserRuleContext {
	public _op!: Token;
	public unary(): UnaryContext | undefined {
		return this.tryGetRuleContext(0, UnaryContext);
	}
	public calc(): CalcContext[];
	public calc(i: number): CalcContext;
	public calc(i?: number): CalcContext | CalcContext[] {
		if (i === undefined) {
			return this.getRuleContexts(CalcContext);
		} else {
			return this.getRuleContext(i, CalcContext);
		}
	}
	public STAR(): TerminalNode | undefined { return this.tryGetToken(CELParser.STAR, 0); }
	public SLASH(): TerminalNode | undefined { return this.tryGetToken(CELParser.SLASH, 0); }
	public PERCENT(): TerminalNode | undefined { return this.tryGetToken(CELParser.PERCENT, 0); }
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(CELParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(CELParser.MINUS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_calc; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterCalc) {
			listener.enterCalc(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitCalc) {
			listener.exitCalc(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitCalc) {
			return visitor.visitCalc(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnaryContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_unary; }
	public override copyFrom(ctx: UnaryContext): void {
		super.copyFrom(ctx);
	}
}
export class MemberExprContext extends UnaryContext {
	public member(): MemberContext {
		return this.getRuleContext(0, MemberContext);
	}
	constructor(ctx: UnaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterMemberExpr) {
			listener.enterMemberExpr(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitMemberExpr) {
			listener.exitMemberExpr(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitMemberExpr) {
			return visitor.visitMemberExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LogicalNotContext extends UnaryContext {
	public _s19!: Token;
	public _ops: Token[] = [];
	public member(): MemberContext {
		return this.getRuleContext(0, MemberContext);
	}
	public EXCLAM(): TerminalNode[];
	public EXCLAM(i: number): TerminalNode;
	public EXCLAM(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.EXCLAM);
		} else {
			return this.getToken(CELParser.EXCLAM, i);
		}
	}
	constructor(ctx: UnaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterLogicalNot) {
			listener.enterLogicalNot(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitLogicalNot) {
			listener.exitLogicalNot(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitLogicalNot) {
			return visitor.visitLogicalNot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NegateContext extends UnaryContext {
	public _s18!: Token;
	public _ops: Token[] = [];
	public member(): MemberContext {
		return this.getRuleContext(0, MemberContext);
	}
	public MINUS(): TerminalNode[];
	public MINUS(i: number): TerminalNode;
	public MINUS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.MINUS);
		} else {
			return this.getToken(CELParser.MINUS, i);
		}
	}
	constructor(ctx: UnaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterNegate) {
			listener.enterNegate(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitNegate) {
			listener.exitNegate(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitNegate) {
			return visitor.visitNegate(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MemberContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_member; }
	public override copyFrom(ctx: MemberContext): void {
		super.copyFrom(ctx);
	}
}
export class PrimaryExprContext extends MemberContext {
	public primary(): PrimaryContext {
		return this.getRuleContext(0, PrimaryContext);
	}
	constructor(ctx: MemberContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterPrimaryExpr) {
			listener.enterPrimaryExpr(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitPrimaryExpr) {
			listener.exitPrimaryExpr(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitPrimaryExpr) {
			return visitor.visitPrimaryExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SelectContext extends MemberContext {
	public _op!: Token;
	public _opt!: Token;
	public _id!: Token;
	public member(): MemberContext {
		return this.getRuleContext(0, MemberContext);
	}
	public DOT(): TerminalNode { return this.getToken(CELParser.DOT, 0); }
	public IDENTIFIER(): TerminalNode { return this.getToken(CELParser.IDENTIFIER, 0); }
	public QUESTIONMARK(): TerminalNode | undefined { return this.tryGetToken(CELParser.QUESTIONMARK, 0); }
	constructor(ctx: MemberContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterSelect) {
			listener.enterSelect(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitSelect) {
			listener.exitSelect(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitSelect) {
			return visitor.visitSelect(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MemberCallContext extends MemberContext {
	public _op!: Token;
	public _id!: Token;
	public _open!: Token;
	public _args!: ExprListContext;
	public member(): MemberContext {
		return this.getRuleContext(0, MemberContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(CELParser.RPAREN, 0); }
	public DOT(): TerminalNode { return this.getToken(CELParser.DOT, 0); }
	public IDENTIFIER(): TerminalNode { return this.getToken(CELParser.IDENTIFIER, 0); }
	public LPAREN(): TerminalNode { return this.getToken(CELParser.LPAREN, 0); }
	public exprList(): ExprListContext | undefined {
		return this.tryGetRuleContext(0, ExprListContext);
	}
	constructor(ctx: MemberContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterMemberCall) {
			listener.enterMemberCall(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitMemberCall) {
			listener.exitMemberCall(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitMemberCall) {
			return visitor.visitMemberCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IndexContext extends MemberContext {
	public _op!: Token;
	public _opt!: Token;
	public _index!: ExprContext;
	public member(): MemberContext {
		return this.getRuleContext(0, MemberContext);
	}
	public RPRACKET(): TerminalNode { return this.getToken(CELParser.RPRACKET, 0); }
	public LBRACKET(): TerminalNode { return this.getToken(CELParser.LBRACKET, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public QUESTIONMARK(): TerminalNode | undefined { return this.tryGetToken(CELParser.QUESTIONMARK, 0); }
	constructor(ctx: MemberContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterIndex) {
			listener.enterIndex(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitIndex) {
			listener.exitIndex(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitIndex) {
			return visitor.visitIndex(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PrimaryContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_primary; }
	public override copyFrom(ctx: PrimaryContext): void {
		super.copyFrom(ctx);
	}
}
export class IdentOrGlobalCallContext extends PrimaryContext {
	public _leadingDot!: Token;
	public _id!: Token;
	public _op!: Token;
	public _args!: ExprListContext;
	public IDENTIFIER(): TerminalNode { return this.getToken(CELParser.IDENTIFIER, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(CELParser.RPAREN, 0); }
	public DOT(): TerminalNode | undefined { return this.tryGetToken(CELParser.DOT, 0); }
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(CELParser.LPAREN, 0); }
	public exprList(): ExprListContext | undefined {
		return this.tryGetRuleContext(0, ExprListContext);
	}
	constructor(ctx: PrimaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterIdentOrGlobalCall) {
			listener.enterIdentOrGlobalCall(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitIdentOrGlobalCall) {
			listener.exitIdentOrGlobalCall(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitIdentOrGlobalCall) {
			return visitor.visitIdentOrGlobalCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NestedContext extends PrimaryContext {
	public _e!: ExprContext;
	public LPAREN(): TerminalNode { return this.getToken(CELParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(CELParser.RPAREN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: PrimaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterNested) {
			listener.enterNested(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitNested) {
			listener.exitNested(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitNested) {
			return visitor.visitNested(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CreateListContext extends PrimaryContext {
	public _op!: Token;
	public _elems!: ListInitContext;
	public RPRACKET(): TerminalNode { return this.getToken(CELParser.RPRACKET, 0); }
	public LBRACKET(): TerminalNode { return this.getToken(CELParser.LBRACKET, 0); }
	public COMMA(): TerminalNode | undefined { return this.tryGetToken(CELParser.COMMA, 0); }
	public listInit(): ListInitContext | undefined {
		return this.tryGetRuleContext(0, ListInitContext);
	}
	constructor(ctx: PrimaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterCreateList) {
			listener.enterCreateList(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitCreateList) {
			listener.exitCreateList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitCreateList) {
			return visitor.visitCreateList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CreateStructContext extends PrimaryContext {
	public _op!: Token;
	public _entries!: MapInitializerListContext;
	public RBRACE(): TerminalNode { return this.getToken(CELParser.RBRACE, 0); }
	public LBRACE(): TerminalNode { return this.getToken(CELParser.LBRACE, 0); }
	public COMMA(): TerminalNode | undefined { return this.tryGetToken(CELParser.COMMA, 0); }
	public mapInitializerList(): MapInitializerListContext | undefined {
		return this.tryGetRuleContext(0, MapInitializerListContext);
	}
	constructor(ctx: PrimaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterCreateStruct) {
			listener.enterCreateStruct(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitCreateStruct) {
			listener.exitCreateStruct(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitCreateStruct) {
			return visitor.visitCreateStruct(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CreateMessageContext extends PrimaryContext {
	public _leadingDot!: Token;
	public _IDENTIFIER!: Token;
	public _ids: Token[] = [];
	public _s16!: Token;
	public _ops: Token[] = [];
	public _op!: Token;
	public _entries!: FieldInitializerListContext;
	public RBRACE(): TerminalNode { return this.getToken(CELParser.RBRACE, 0); }
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.IDENTIFIER);
		} else {
			return this.getToken(CELParser.IDENTIFIER, i);
		}
	}
	public LBRACE(): TerminalNode { return this.getToken(CELParser.LBRACE, 0); }
	public COMMA(): TerminalNode | undefined { return this.tryGetToken(CELParser.COMMA, 0); }
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.DOT);
		} else {
			return this.getToken(CELParser.DOT, i);
		}
	}
	public fieldInitializerList(): FieldInitializerListContext | undefined {
		return this.tryGetRuleContext(0, FieldInitializerListContext);
	}
	constructor(ctx: PrimaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterCreateMessage) {
			listener.enterCreateMessage(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitCreateMessage) {
			listener.exitCreateMessage(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitCreateMessage) {
			return visitor.visitCreateMessage(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConstantLiteralContext extends PrimaryContext {
	public literal(): LiteralContext {
		return this.getRuleContext(0, LiteralContext);
	}
	constructor(ctx: PrimaryContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterConstantLiteral) {
			listener.enterConstantLiteral(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitConstantLiteral) {
			listener.exitConstantLiteral(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitConstantLiteral) {
			return visitor.visitConstantLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprListContext extends ParserRuleContext {
	public _expr!: ExprContext;
	public _e: ExprContext[] = [];
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.COMMA);
		} else {
			return this.getToken(CELParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_exprList; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterExprList) {
			listener.enterExprList(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitExprList) {
			listener.exitExprList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitExprList) {
			return visitor.visitExprList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListInitContext extends ParserRuleContext {
	public _optExpr!: OptExprContext;
	public _elems: OptExprContext[] = [];
	public optExpr(): OptExprContext[];
	public optExpr(i: number): OptExprContext;
	public optExpr(i?: number): OptExprContext | OptExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptExprContext);
		} else {
			return this.getRuleContext(i, OptExprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.COMMA);
		} else {
			return this.getToken(CELParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_listInit; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterListInit) {
			listener.enterListInit(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitListInit) {
			listener.exitListInit(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitListInit) {
			return visitor.visitListInit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldInitializerListContext extends ParserRuleContext {
	public _optField!: OptFieldContext;
	public _fields: OptFieldContext[] = [];
	public _s21!: Token;
	public _cols: Token[] = [];
	public _expr!: ExprContext;
	public _values: ExprContext[] = [];
	public optField(): OptFieldContext[];
	public optField(i: number): OptFieldContext;
	public optField(i?: number): OptFieldContext | OptFieldContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptFieldContext);
		} else {
			return this.getRuleContext(i, OptFieldContext);
		}
	}
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.COLON);
		} else {
			return this.getToken(CELParser.COLON, i);
		}
	}
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.COMMA);
		} else {
			return this.getToken(CELParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_fieldInitializerList; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterFieldInitializerList) {
			listener.enterFieldInitializerList(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitFieldInitializerList) {
			listener.exitFieldInitializerList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitFieldInitializerList) {
			return visitor.visitFieldInitializerList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptFieldContext extends ParserRuleContext {
	public _opt!: Token;
	public IDENTIFIER(): TerminalNode { return this.getToken(CELParser.IDENTIFIER, 0); }
	public QUESTIONMARK(): TerminalNode | undefined { return this.tryGetToken(CELParser.QUESTIONMARK, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_optField; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterOptField) {
			listener.enterOptField(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitOptField) {
			listener.exitOptField(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitOptField) {
			return visitor.visitOptField(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MapInitializerListContext extends ParserRuleContext {
	public _optExpr!: OptExprContext;
	public _keys: OptExprContext[] = [];
	public _s21!: Token;
	public _cols: Token[] = [];
	public _expr!: ExprContext;
	public _values: ExprContext[] = [];
	public optExpr(): OptExprContext[];
	public optExpr(i: number): OptExprContext;
	public optExpr(i?: number): OptExprContext | OptExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptExprContext);
		} else {
			return this.getRuleContext(i, OptExprContext);
		}
	}
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.COLON);
		} else {
			return this.getToken(CELParser.COLON, i);
		}
	}
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CELParser.COMMA);
		} else {
			return this.getToken(CELParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_mapInitializerList; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterMapInitializerList) {
			listener.enterMapInitializerList(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitMapInitializerList) {
			listener.exitMapInitializerList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitMapInitializerList) {
			return visitor.visitMapInitializerList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptExprContext extends ParserRuleContext {
	public _opt!: Token;
	public _e!: ExprContext;
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public QUESTIONMARK(): TerminalNode | undefined { return this.tryGetToken(CELParser.QUESTIONMARK, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_optExpr; }
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterOptExpr) {
			listener.enterOptExpr(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitOptExpr) {
			listener.exitOptExpr(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitOptExpr) {
			return visitor.visitOptExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return CELParser.RULE_literal; }
	public override copyFrom(ctx: LiteralContext): void {
		super.copyFrom(ctx);
	}
}
export class IntContext extends LiteralContext {
	public _sign!: Token;
	public _tok!: Token;
	public NUM_INT(): TerminalNode { return this.getToken(CELParser.NUM_INT, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(CELParser.MINUS, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterInt) {
			listener.enterInt(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitInt) {
			listener.exitInt(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitInt) {
			return visitor.visitInt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UintContext extends LiteralContext {
	public _tok!: Token;
	public NUM_UINT(): TerminalNode { return this.getToken(CELParser.NUM_UINT, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterUint) {
			listener.enterUint(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitUint) {
			listener.exitUint(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitUint) {
			return visitor.visitUint(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DoubleContext extends LiteralContext {
	public _sign!: Token;
	public _tok!: Token;
	public NUM_FLOAT(): TerminalNode { return this.getToken(CELParser.NUM_FLOAT, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(CELParser.MINUS, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterDouble) {
			listener.enterDouble(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitDouble) {
			listener.exitDouble(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitDouble) {
			return visitor.visitDouble(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringContext extends LiteralContext {
	public _tok!: Token;
	public STRING(): TerminalNode { return this.getToken(CELParser.STRING, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterString) {
			listener.enterString(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitString) {
			listener.exitString(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BytesContext extends LiteralContext {
	public _tok!: Token;
	public BYTES(): TerminalNode { return this.getToken(CELParser.BYTES, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterBytes) {
			listener.enterBytes(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitBytes) {
			listener.exitBytes(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitBytes) {
			return visitor.visitBytes(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolTrueContext extends LiteralContext {
	public _tok!: Token;
	public CEL_TRUE(): TerminalNode { return this.getToken(CELParser.CEL_TRUE, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterBoolTrue) {
			listener.enterBoolTrue(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitBoolTrue) {
			listener.exitBoolTrue(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitBoolTrue) {
			return visitor.visitBoolTrue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolFalseContext extends LiteralContext {
	public _tok!: Token;
	public CEL_FALSE(): TerminalNode { return this.getToken(CELParser.CEL_FALSE, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterBoolFalse) {
			listener.enterBoolFalse(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitBoolFalse) {
			listener.exitBoolFalse(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitBoolFalse) {
			return visitor.visitBoolFalse(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NullContext extends LiteralContext {
	public _tok!: Token;
	public NUL(): TerminalNode { return this.getToken(CELParser.NUL, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public override enterRule(listener: CELListener): void {
		if (listener.enterNull) {
			listener.enterNull(this);
		}
	}
	// @Override
	public override exitRule(listener: CELListener): void {
		if (listener.exitNull) {
			listener.exitNull(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: CELVisitor<Result>): Result {
		if (visitor.visitNull) {
			return visitor.visitNull(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


