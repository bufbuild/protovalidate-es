import { useState } from 'react';
import './App.css'
import Parser from 'web-tree-sitter';
import { CelEnv } from '@bufbuild/cel-es';
import { newCelParser } from '@bufbuild/cel-es-parse-web';

await Parser.init();
const parser = new Parser;
const CEL = await Parser.Language.load('tree-sitter-cel.wasm');
parser.setLanguage(CEL);
const CEL_PARSER = newCelParser(parser);


function App() {
  const env = new CelEnv(CEL_PARSER);
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
          {`${msg.input} => ${env.run(msg.input)}`}
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
