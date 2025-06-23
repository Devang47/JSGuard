import { tokenizeJavaScript } from './lexer.js';

const code = `
function greet(name) {
  return "Hello, " + name;
}
`;

const tokens = tokenizeJavaScript(code);
tokens.forEach(token => console.log(token.toString()));