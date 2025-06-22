# JavaScript Lexer - Complete Theory and Implementation Guide

## What is a Lexer and Why Do We Need It?

A **lexer** (also called a tokenizer or scanner) is the first phase of any compiler or interpreter. It transforms raw source code (a string of characters) into a stream of **tokens** - meaningful units that the parser can understand.

### The Problem Lexers Solve

Consider this JavaScript code:
```javascript
let x = 42;
```

To a computer, this is just a sequence of characters: `'l','e','t',' ','x',' ','=',' ','4','2',';'`

A human understands this as:
- `let` - a keyword for variable declaration
- `x` - an identifier (variable name)
- `=` - an assignment operator
- `42` - a numeric literal
- `;` - a statement terminator

The lexer bridges this gap by converting the character stream into tokens that represent these semantic units.

### Lexical Analysis Theory

**Lexical Analysis** operates on **regular languages** - patterns that can be described by regular expressions. Each token type corresponds to a regular expression:

- **Identifiers**: `[a-zA-Z_$][a-zA-Z0-9_$]*`
- **Numbers**: `[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?`
- **Strings**: `"[^"]*"` or `'[^']*'`
- **Keywords**: Exact matches like `let`, `const`, `function`

### Finite State Machines

Internally, lexers use **Finite State Machines (FSM)** to recognize patterns:

```
Reading "let":
START → 'l' → L_STATE → 'e' → LE_STATE → 't' → LET_STATE → (end) → KEYWORD_TOKEN
```

## TokenType Enumeration - The Language Vocabulary

```javascript
export const TokenType = {
  // Literals - represent values
  IDENTIFIER: 'IDENTIFIER',     // Variable/function names
  NUMBER: 'NUMBER',             // Numeric values
  STRING: 'STRING',             // Text values
  BOOLEAN: 'BOOLEAN',           // true/false
  NULL: 'NULL',                 // null value
  UNDEFINED: 'UNDEFINED',       // undefined value

  // Keywords - reserved words with special meaning
  KEYWORD: 'KEYWORD',

  // Operators - perform operations
  ASSIGNMENT: 'ASSIGNMENT',     // =, +=, -=
  ARITHMETIC: 'ARITHMETIC',     // +, -, *, /
  COMPARISON: 'COMPARISON',     // ==, !=, <, >
  LOGICAL: 'LOGICAL',           // &&, ||
  UNARY: 'UNARY',              // !, ~, ++, --

  // Punctuation - structure the code
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  DOT: 'DOT',
  COLON: 'COLON',

  // Brackets - group expressions
  LPAREN: 'LPAREN', RPAREN: 'RPAREN',       // ( )
  LBRACE: 'LBRACE', RBRACE: 'RBRACE',       // { }
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET', // [ ]

  // Special tokens
  EOF: 'EOF',                   // End of file marker
  UNKNOWN: 'UNKNOWN'            // Unrecognized characters
};
```

**Design Decision**: We categorize operators by their semantic role rather than syntax. This helps the parser understand operator precedence and associativity.

## Token Class - Metadata Container

```javascript
export class Token {
  constructor(type, value, line = 1, column = 1) {
    this.type = type;      // What kind of token
    this.value = value;    // The actual text
    this.line = line;      // Source location for error reporting
    this.column = column;  // Precise position for IDEs
  }
}
```

**Why Location Tracking?**
- **Error Reporting**: "Syntax error at line 42, column 15"
- **IDE Integration**: Highlighting, go-to-definition
- **Debugging**: Stack traces with source positions

## JavaScriptLexer - The Core Engine

### Architecture Overview

The lexer follows a **single-pass, character-by-character** scanning approach:

```
Input: "let x = 42;"
       ↓
[Character Stream] → [Lexer] → [Token Stream]
                              ↓
                         [Token(KEYWORD,"let"),
                          Token(IDENTIFIER,"x"),
                          Token(ASSIGNMENT,"="),
                          Token(NUMBER,"42"),
                          Token(SEMICOLON,";")]
```

### Core Scanning Algorithm

```javascript
nextToken() {
  while (this.currentChar()) {
    // Skip whitespace but preserve newlines
    if (isWhitespace(char)) continue;
    
    // Dispatch to specific token readers
    if (isLetter(char)) return this.readIdentifier();
    if (isDigit(char)) return this.readNumber();
    if (isQuote(char)) return this.readString();
    if (isOperator(char)) return this.readOperator();
    // ... handle other cases
  }
  return EOF_TOKEN;
}
```

### Identifier Recognition - Keywords vs Variables

```javascript
readIdentifier() {
  let value = '';
  while (isAlphaNumeric(this.currentChar())) {
    value += this.currentChar();
    this.advance();
  }
  
  // Keyword lookup in constant time
  const type = KEYWORDS.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
  
  // Handle special literals
  if (value === 'true' || value === 'false') return new Token(TokenType.BOOLEAN, value);
  if (value === 'null') return new Token(TokenType.NULL, value);
  
  return new Token(type, value, this.line, this.column);
}
```

**Theory**: We use a **HashSet** for keyword lookup because it provides O(1) average-case performance vs O(log n) for sorted arrays.

### Number Parsing - Handling Complex Formats

JavaScript supports multiple numeric formats:
- Integers: `42`, `0`, `-5`
- Floats: `3.14`, `.5`, `2.`
- Scientific: `1e5`, `2.5e-3`, `1E+10`

```javascript
readNumber() {
  let value = '';
  let hasDecimal = false;
  
  // Read digits and optional decimal point
  while (isDigit(this.currentChar()) || this.currentChar() === '.') {
    if (this.currentChar() === '.') {
      if (hasDecimal) break; // Second decimal = end of number
      hasDecimal = true;
    }
    value += this.currentChar();
    this.advance();
  }
  
  // Handle scientific notation
  if (this.currentChar() === 'e' || this.currentChar() === 'E') {
    value += this.currentChar();
    this.advance();
    
    // Optional sign
    if (this.currentChar() === '+' || this.currentChar() === '-') {
      value += this.currentChar();
      this.advance();
    }
    
    // Exponent digits
    while (isDigit(this.currentChar())) {
      value += this.currentChar();
      this.advance();
    }
  }
  
  return new Token(TokenType.NUMBER, value);
}
```

### String Parsing - Escape Sequences

```javascript
readString(quote) {
  let value = '';
  this.advance(); // Skip opening quote
  
  while (this.currentChar() && this.currentChar() !== quote) {
    if (this.currentChar() === '\\') {
      this.advance(); // Skip backslash
      // Store escape sequence as-is for parser to handle
      if (this.currentChar()) {
        value += '\\' + this.currentChar();
        this.advance();
      }
    } else {
      value += this.currentChar();
      this.advance();
    }
  }
  
  if (this.currentChar() === quote) {
    this.advance(); // Skip closing quote
  }
  
  return new Token(TokenType.STRING, value);
}
```

**Design Choice**: We store escape sequences literally (`\\n`) rather than interpreting them (`\n`). This preserves the original source and lets the parser handle interpretation.

### Operator Parsing - Maximal Munch Principle

JavaScript has overlapping operator prefixes:
- `=` vs `==` vs `===`
- `+` vs `++` vs `+=`
- `<` vs `<<` vs `<=` vs `<<=`

We use the **Maximal Munch** principle: always consume the longest possible token.

```javascript
readOperator() {
  const char = this.currentChar();
  const twoChar = char + this.peekChar();
  const threeChar = twoChar + this.peekChar(2);
  
  // Check three-character operators first
  if (['===', '!==', '>>>', '<<=', '>>='].includes(threeChar)) {
    this.advance(); this.advance(); this.advance();
    return new Token(TokenType.COMPARISON, threeChar);
  }
  
  // Then two-character operators
  if (twoCharOperators[twoChar]) {
    this.advance(); this.advance();
    return new Token(twoCharOperators[twoChar], twoChar);
  }
  
  // Finally single-character operators
  if (singleCharOperators[char]) {
    this.advance();
    return new Token(singleCharOperators[char], char);
  }
  
  return new Token(TokenType.UNKNOWN, char);
}
```

### Comment Handling - Preserving Intent

```javascript
// Single-line comments: // text until newline
readSingleLineComment() {
  this.advance(); this.advance(); // Skip '//'
  let value = '';
  while (this.currentChar() && this.currentChar() !== '\n') {
    value += this.currentChar();
    this.advance();
  }
  return new Token(TokenType.COMMENT, value.trim());
}

// Multi-line comments: /* text until */
readMultiLineComment() {
  this.advance(); this.advance(); // Skip '/*'
  let value = '';
  while (this.currentChar()) {
    if (this.currentChar() === '*' && this.peekChar() === '/') {
      this.advance(); this.advance(); // Skip '*/'
      break;
    }
    value += this.currentChar();
    this.advance();
  }
  return new Token(TokenType.COMMENT, value.trim());
}
```

## Error Handling Philosophy

### Robust Recovery Strategy

Rather than crashing on invalid input, our lexer continues processing:

```javascript
// Unknown character encountered
if (!recognizedCharacter) {
  this.advance();
  return new Token(TokenType.UNKNOWN, char);
}
```

**Benefits**:
- **IDE Integration**: Show errors but keep analyzing
- **Partial Analysis**: Extract what we can from broken code
- **Better UX**: Multiple error messages instead of stopping at first error

### Position Tracking for Debugging

```javascript
advance() {
  if (this.input[this.position] === '\n') {
    this.line++;
    this.column = 1;
  } else {
    this.column++;
  }
  this.position++;
}
```

Accurate position tracking enables:
- Precise error messages
- IDE features (hover info, diagnostics)
- Source map generation

## Performance Characteristics

### Time Complexity: O(n)
- **Single Pass**: Each character read exactly once
- **Constant Time Operations**: Character classification, hash lookups
- **Linear Growth**: Processing time proportional to input size

### Space Complexity: O(n)
- **Token Storage**: One token per language unit
- **Minimal Overhead**: Only essential metadata stored
- **Memory Efficiency**: Tokens created on-demand

### Optimization Strategies

1. **Character Classification**: Use lookup tables instead of multiple comparisons
2. **Keyword Recognition**: Hash table O(1) vs linear search O(k)
3. **Lookahead Caching**: Peek without advancing multiple times

## Integration with Parser

The lexer produces a token stream that the parser consumes:

```javascript
// Lexer outputs tokens
const tokens = lexer.tokenize();
// [Token(KEYWORD,"function"), Token(IDENTIFIER,"add"), ...]

// Parser consumes tokens
const parser = new JavaScriptParser(tokens);
const ast = parser.parse();
```

**Interface Contract**:
- Lexer guarantees valid token sequence ending with EOF
- Parser expects specific token types in specific contexts
- Error recovery coordinated between both phases

## Real-World Applications

### Code Editors
- **Syntax Highlighting**: Different colors for different token types
- **Auto-completion**: Suggest based on current token context
- **Error Squiggles**: Show lexical errors in real-time

### Build Tools
- **Minification**: Remove comments and whitespace tokens
- **Transpilation**: Convert modern syntax to older versions
- **Bundle Analysis**: Track imports/exports through tokens

### Static Analysis
- **Security Scanning**: Find dangerous patterns in token sequences
- **Code Quality**: Detect style violations
- **Metrics**: Count complexity based on token types

## Extending the Lexer

### Adding New Token Types

1. **Define the Pattern**: What character sequence represents this token?
2. **Add Recognition Logic**: Where in the scanning loop to detect it?
3. **Update TokenType Enum**: Give it a semantic name
4. **Test Edge Cases**: How does it interact with existing tokens?

### Example: Adding Template Literals

```javascript
// 1. Add token type
TEMPLATE_LITERAL: 'TEMPLATE_LITERAL'

// 2. Add recognition
if (char === '`') return this.readTemplateLiteral();

// 3. Implement reader
readTemplateLiteral() {
  let value = '';
  this.advance(); // Skip opening `
  
  while (this.currentChar() && this.currentChar() !== '`') {
    if (this.currentChar() === '\\') {
      value += this.currentChar();
      this.advance();
      if (this.currentChar()) {
        value += this.currentChar();
        this.advance();
      }
    } else {
      value += this.currentChar();
      this.advance();
    }
  }
  
  if (this.currentChar() === '`') {
    this.advance(); // Skip closing `
  }
  
  return new Token(TokenType.TEMPLATE_LITERAL, value);
}
```

This lexer forms the foundation of JSGuard's analysis capabilities by providing a clean, structured representation of JavaScript source code that higher-level components can process reliably.
