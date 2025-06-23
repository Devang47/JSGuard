/**
 * Minimal Token types for essential JavaScript constructs
 */
export const TokenType = {
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',

  // Keywords
  KEYWORD: 'KEYWORD',
  
  // Operators
  ASSIGNMENT: 'ASSIGNMENT',
  ARITHMETIC: 'ARITHMETIC',
  COMPARISON: 'COMPARISON',
  LOGICAL: 'LOGICAL',
  
  // Punctuation
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  DOT: 'DOT',
  
  // Brackets
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  
  // Special
  EOF: 'EOF',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Essential JavaScript keywords for static analysis
 */
const KEYWORDS = new Set([
  'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while'
]);

/**
 * Token class representing a single token
 */
export class Token {
  constructor(type, value, line = 1, column = 1) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, "${this.value}", ${this.line}:${this.column})`;
  }
}

/**
 * Minimal JavaScript Lexer - handles only essential constructs
 */
export class JavaScriptLexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  currentChar() {
    if (this.position >= this.input.length) {
      return null;
    }
    return this.input[this.position];
  }

  peekChar() {
    const pos = this.position + 1;
    if (pos >= this.input.length) {
      return null;
    }
    return this.input[pos];
  }

  advance() {
    if (this.position < this.input.length) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  skipWhitespace() {
    while (this.currentChar() && /\s/.test(this.currentChar())) {
      this.advance();
    }
  }

  /**
   * Read identifier or keyword - simplified
   */
  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    while (this.currentChar() && /[a-zA-Z0-9_$]/.test(this.currentChar())) {
      value += this.currentChar();
      this.advance();
    }

    // Handle special literals
    if (value === 'true' || value === 'false') {
      return new Token(TokenType.BOOLEAN, value, startLine, startColumn);
    }
    if (value === 'null') {
      return new Token(TokenType.NULL, value, startLine, startColumn);
    }

    // Check if it's a keyword
    const type = KEYWORDS.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    return new Token(type, value, startLine, startColumn);
  }

  /**
   * Read numeric literal - simplified
   */
  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    let hasDecimal = false;

    while (this.currentChar() && (/\d/.test(this.currentChar()) || this.currentChar() === '.')) {
      if (this.currentChar() === '.') {
        if (hasDecimal) break;
        hasDecimal = true;
      }
      value += this.currentChar();
      this.advance();
    }

    return new Token(TokenType.NUMBER, value, startLine, startColumn);
  }

  /**
   * Read string literal - simplified
   */
  readString(quote) {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    
    this.advance(); // Skip opening quote

    while (this.currentChar() && this.currentChar() !== quote) {
      if (this.currentChar() === '\\') {
        this.advance(); // Skip backslash
        if (this.currentChar()) {
          value += this.currentChar(); // Don't store escape sequence
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

    return new Token(TokenType.STRING, value, startLine, startColumn);
  }

  /**
   * Read operator - simplified
   */
  readOperator() {
    const startLine = this.line;
    const startColumn = this.column;
    const char = this.currentChar();
    const nextChar = this.peekChar();
    const twoChar = char + (nextChar || '');

    // Two-character operators
    const twoCharOps = {
      '==': TokenType.COMPARISON,
      '!=': TokenType.COMPARISON,
      '<=': TokenType.COMPARISON,
      '>=': TokenType.COMPARISON,
      '===': TokenType.COMPARISON,
      '!==': TokenType.COMPARISON,
      '&&': TokenType.LOGICAL,
      '||': TokenType.LOGICAL,
      '+=': TokenType.ASSIGNMENT
    };

    if (twoCharOps[twoChar]) {
      this.advance();
      this.advance();
      return new Token(twoCharOps[twoChar], twoChar, startLine, startColumn);
    }

    // Three-character operators (===, !==)
    if (twoChar === '==' || twoChar === '!=') {
      const thirdChar = this.peekChar();
      if (thirdChar === '=') {
        this.advance();
        this.advance();
        this.advance();
        return new Token(TokenType.COMPARISON, char + nextChar + thirdChar, startLine, startColumn);
      }
    }

    // Single-character operators
    const singleCharOps = {
      '+': TokenType.ARITHMETIC,
      '-': TokenType.ARITHMETIC,
      '*': TokenType.ARITHMETIC,
      '/': TokenType.ARITHMETIC,
      '%': TokenType.ARITHMETIC,
      '=': TokenType.ASSIGNMENT,
      '<': TokenType.COMPARISON,
      '>': TokenType.COMPARISON
    };

    if (singleCharOps[char]) {
      this.advance();
      return new Token(singleCharOps[char], char, startLine, startColumn);
    }

    // Unknown operator
    this.advance();
    return new Token(TokenType.UNKNOWN, char, startLine, startColumn);
  }

  /**
   * Get next token - simplified
   */
  nextToken() {
    while (this.currentChar()) {
      const char = this.currentChar();
      const line = this.line;
      const column = this.column;

      // Skip whitespace
      if (/\s/.test(char)) {
        this.skipWhitespace();
        continue;
      }

      // Skip comments
      if (char === '/' && this.peekChar() === '/') {
        // Skip single-line comment
        while (this.currentChar() && this.currentChar() !== '\n') {
          this.advance();
        }
        continue;
      }

      if (char === '/' && this.peekChar() === '*') {
        // Skip multi-line comment
        this.advance(); // Skip '/'
        this.advance(); // Skip '*'
        while (this.currentChar()) {
          if (this.currentChar() === '*' && this.peekChar() === '/') {
            this.advance(); // Skip '*'
            this.advance(); // Skip '/'
            break;
          }
          this.advance();
        }
        continue;
      }

      // String literals
      if (char === '"' || char === "'" || char === '`') {
        return this.readString(char);
      }

      // Numbers
      if (/\d/.test(char)) {
        return this.readNumber();
      }

      // Identifiers and keywords
      if (/[a-zA-Z_$]/.test(char)) {
        return this.readIdentifier();
      }

      // Punctuation
      const punctuation = {
        ';': TokenType.SEMICOLON,
        ',': TokenType.COMMA,
        '.': TokenType.DOT,
        '(': TokenType.LPAREN,
        ')': TokenType.RPAREN,
        '{': TokenType.LBRACE,
        '}': TokenType.RBRACE,
        '[': TokenType.LBRACKET,
        ']': TokenType.RBRACKET
      };

      if (punctuation[char]) {
        this.advance();
        return new Token(punctuation[char], char, line, column);
      }

      // Operators
      if (/[+\-*/%=<>!&|]/.test(char)) {
        return this.readOperator();
      }

      // Unknown character - skip it
      this.advance();
      return new Token(TokenType.UNKNOWN, char, line, column);
    }

    return new Token(TokenType.EOF, '', this.line, this.column);
  }

  /**
   * Tokenize entire input
   */
  tokenize() {
    const tokens = [];
    let token;

    do {
      token = this.nextToken();
      if (token.type !== TokenType.UNKNOWN) { // Skip unknown tokens
        tokens.push(token);
      }
    } while (token.type !== TokenType.EOF);

    return tokens;
  }
}

/**
 * Convenience function to tokenize JavaScript code
 */
export function tokenizeJavaScript(code) {
  const lexer = new JavaScriptLexer(code);
  return lexer.tokenize();
}
