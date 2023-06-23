import { useState } from 'react';
import './App.css'
import Parser from 'web-tree-sitter';
import { syntax_pb } from '@bufbuild/cel-es-proto';
import { CelParser, CelEnv } from '@bufbuild/cel-es';

await Parser.init();
const parser = new Parser;
const CEL = await Parser.Language.load('tree-sitter-cel.wasm');
parser.setLanguage(CEL);

class ParseContext {
  prevId = 0;
  readonly sourceInfo = new syntax_pb.SourceInfo();

  nextId(): number {
    return ++this.prevId;
  }

  newExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const expr = new syntax_pb.Expr();
    expr.id = BigInt(this.nextId());
    this.sourceInfo.positions[String(expr.id)] = node.startIndex;
    return expr;
  }

  parseIntLiteral(node: Parser.SyntaxNode): bigint {
    return BigInt(node.text);
  }

  parseBinaryExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const callExpr = new syntax_pb.Expr_Call();
    const opNode = node.child(1)!;
    callExpr.function = `_${opNode.text}_`;
    callExpr.args.push(this.parseExpr(node.child(0)!));
    callExpr.args.push(this.parseExpr(node.child(2)!));
    const expr = this.newExpr(opNode);
    expr.exprKind = {
      case: "callExpr",
      value: callExpr,
    }
    return expr;
  }

  parseSelectExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const selectExpr = new syntax_pb.Expr_Select();
    selectExpr.operand = this.parseExpr(node.child(0)!);
    selectExpr.field = node.child(2)!.text;
    const expr = this.newExpr(node.child(1)!);
    expr.exprKind = {
      case: "selectExpr",
      value: selectExpr,
    };
    return expr;
  }

  parseCallExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const callExpr = new syntax_pb.Expr_Call();
    callExpr.function = node.childForFieldName("function")!.text;
    const expr = this.newExpr(node);
    const args = node.childForFieldName("arguments")!;
    for (let i = 0; i < args.namedChildCount; i++) {
      const arg = args.namedChild(i)!;
      const argExpr = this.parseExpr(arg);
      callExpr.args.push(argExpr);
    }
    const operand = node.childForFieldName("operand");
    if (operand !== null) {
      callExpr.target = this.parseExpr(operand);
    }
    expr.exprKind = {
      case: "callExpr",
      value: callExpr,
    }
    return expr;
  }

  parseExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    switch (node.type) {
      case "binary_expression":
        return this.parseBinaryExpr(node);
      case "select_expression":
        return this.parseSelectExpr(node);
      case "identifier": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "identExpr",
          value: new syntax_pb.Expr_Ident({
            name: node.text,
          })
        }
        return expr;
      }
      case "call_expression":
        return this.parseCallExpr(node);
      case "member_call_expression":
        return this.parseCallExpr(node);
      case "int_literal": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new syntax_pb.Constant({
            constantKind: {
              case: "int64Value",
              value: this.parseIntLiteral(node),
            }
          })
        }
        return expr;
      }
      default:
        throw new Error(`unhandled node type: ${node.type}`);
    }
  }
}

function parse(tree: Parser.Tree): syntax_pb.ParsedExpr {
  const parsedExpr = new syntax_pb.ParsedExpr();
  const ctx = new ParseContext();
  if (tree.rootNode.firstChild !== null) {
    parsedExpr.expr = ctx.parseExpr(tree.rootNode.firstChild)
  }
  parsedExpr.sourceInfo = ctx.sourceInfo;
  return parsedExpr;
}

class TreeSitterCelParser implements CelParser {
  parse(input: string): syntax_pb.ParsedExpr {
    const tree = parser.parse(input);
    return parse(tree);
  }
}

function App() {
  const env = new CelEnv(new TreeSitterCelParser());
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    {
      input: string;
      output: Parser.Tree;
    }[]
  >([]);
  return <>
    <ol>
      {messages.map((msg, index) => (
        <li key={index}>
          {`${msg.input} => ${env.parse(msg.input).toJsonString()}`}
        </li>
      ))}
    </ol>
    <form onSubmit={async (e) => {
      e.preventDefault();
      // Clear inputValue since the user has submitted.
      setInputValue("");
      // Store the inputValue in the chain of messages and
      // mark this message as coming from "me"
      setMessages((prev) => [
        ...prev,
        {
          input: inputValue,
          output: parser.parse(inputValue),
        },
      ]);
    }}>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  </>;
}

export default App
