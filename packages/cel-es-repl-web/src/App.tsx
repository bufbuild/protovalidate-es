import { useState } from 'react';
import './App.css'
import Parser from 'web-tree-sitter';
import { CelEnv, CelError, CelResult, CelUnknown, NATIVE_ADAPTER, makeStringExtFuncRegistry } from '@bufbuild/cel-es';
import { newCelParser } from '@bufbuild/cel-es-parse-web';
import { Timestamp } from '@bufbuild/protobuf'

await Parser.init();
const parser = new Parser;
const CEL = await Parser.Language.load('tree-sitter-cel.wasm');
parser.setLanguage(CEL);
const CEL_PARSER = newCelParser(parser);

function processLet(env: CelEnv, args: string): CelResult {
  const [name, expr] = args.split('=');
  const result = env.run(expr);
  env.set(name.trim(), result);
  return result;
}

function processInput(env: CelEnv, input: string): string {
  env.set('now', Timestamp.now());
  let result : CelResult;
  if (input[0] === '%') {
    const pos = input.indexOf(' ');
    const command = input.slice(1, pos > 0 ? pos : undefined);
    const args = pos > 0  ? input.slice(pos + 1): '';
    switch (command) {
      case 'let':
        result = processLet(env, args);
        break;
      case 'env': {
        let output = "\n"
        for (const [name, value] of Object.entries(env.data)) {
          output += `${name} = ${value}\n`;
        }
        return output;
      }
      default:
        return `Unknown command: ${command}`;
    }
  } else {
    result = env.run(input);
  }
  if (result instanceof CelError) {
    return `Error: ${result.message}`;
  } else if (result instanceof CelUnknown) {
    return `Unknown: ${result.ids}`;
  }
  return String(NATIVE_ADAPTER.fromCel(result));
}

const APP_ENV = new CelEnv(CEL_PARSER);
APP_ENV.addFuncs(makeStringExtFuncRegistry());

function App() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    {
      input: string;
      output: string;
    }[]
  >([]);
  return <>
    <ol>
      {messages.map((msg, index) => (
        <li key={index}>
          <code>{msg.input}{` => `}{msg.output}</code>
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
          output: processInput(APP_ENV, inputValue)
        },
      ]);
    }}>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  </>;
}

export default App
