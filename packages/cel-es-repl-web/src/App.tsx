import { useState } from "react";
import "./App.css";
import {
  CelEnv,
  CelError,
  CelResult,
  CelUnknown,
  NATIVE_ADAPTER,
  makeStringExtFuncRegistry,
} from "@bufbuild/cel-es";
import { TreeSitterParser, loadCelParser } from "@bufbuild/cel-es-web";
import { Timestamp } from "@bufbuild/protobuf";
import yaml from "yaml";

const APP_ENV = new CelEnv();
let PARSER: TreeSitterParser | undefined = undefined;
APP_ENV.addFuncs(makeStringExtFuncRegistry());
loadCelParser("tree-sitter-cel.wasm").then((parser) => {
  PARSER = parser;
  APP_ENV.setParser(parser);
});

function processLet(env: CelEnv, args: string): CelResult {
  const [name, expr] = args.split("=");
  let result;
  try {
    result = env.run(expr);
  } catch (e) {
    result = new CelError(0, String(e));
  }
  env.set(name.trim(), result);
  return result;
}

function processInput(env: CelEnv, input: string, data: string): string {
  env.set("now", Timestamp.now());
  const lines = data.split(";");
  for (const line of lines) {
    processLet(env, line);
  }
  let result;
  try {
    result = env.run(input);
  } catch (e) {
    result = new CelError(0, String(e));
  }
  if (result instanceof CelError) {
    return `Error: ${result.message}`;
  } else if (result instanceof CelUnknown) {
    return `Unknown: ${result.ids}`;
  }
  const native = NATIVE_ADAPTER.fromCel(result);
  return yaml.stringify(native, (_, value) => {
    switch (typeof value) {
      case "object":
        if (value instanceof Map) {
          return Object.fromEntries(value);
        }
        return value;
      default:
        return value;
    }
  });
}

function highlightText(input: string): JSX.Element {
  const highlights = PARSER?.highlight(input) ?? [];
  // A list of (offset, tag) pairs.
  const elems: [number, string][] = [];
  const ends: number[] = [];
  let lastStart = -1;
  for (const highlight of highlights) {
    if (highlight.end <= lastStart) {
      continue;
    }
    const text = `<span class="highlight-${highlight.type}">`;
    if (highlight.start === lastStart) {
      // Prepend to the last element.
      const last = elems[elems.length - 1];
      last[1] = text + last[1];
    } else {
      lastStart = highlight.start;
      // Close any tags that have ended.
      while (ends.length > 0 && ends[0] <= lastStart) {
        elems.push([ends.shift()!, "</span>"]);
      }
      // Start a new element.
      elems.push([lastStart, text]);
    }
    ends.push(highlight.end);
    ends.sort((a, b) => a - b);
  }
  while (ends.length > 0) {
    elems.push([ends.shift()!, "</span>"]);
  }
  let result = "";
  let last = 0;
  for (const [offset, tag] of elems) {
    result += input.slice(last, offset);
    result += tag;
    last = offset;
  }
  result += input.slice(last);
  return <div dangerouslySetInnerHTML={{ __html: result }} />;
}

function App() {
  const [inputExpr, setInputExpr] = useState("");
  const [inputEnv, setInputEnv] = useState("");
  const [outputValue, setOutputValue] = useState("");
  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">cel-es-web</h1>
        </header>
        <div className="App-body">
          <div className="App-left">
            <textarea
              className="App-input-textarea"
              value={inputExpr}
              onChange={(e) => {
                setInputExpr(e.target.value);
                setOutputValue(processInput(APP_ENV, e.target.value, inputEnv));
              }}
            />
            <div className="App-highlight">{highlightText(inputExpr)}</div>
          </div>
          <div className="App-right">
            <textarea
              className="App-env-textarea"
              value={inputEnv}
              onChange={(e) => {
                setInputEnv(e.target.value);
                setOutputValue(
                  processInput(APP_ENV, inputExpr, e.target.value)
                );
              }}
            />
            <textarea
              className="App-output-textarea"
              value={outputValue}
              readOnly
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
