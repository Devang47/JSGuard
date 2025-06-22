/**
 * Token types enumeration
 */
export const TokenType = {
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
  UNDEFINED: 'UNDEFINED',

  // Keywords
  KEYWORD: 'KEYWORD',
  
  // Operators
  ASSIGNMENT: 'ASSIGNMENT',
  ARITHMETIC: 'ARITHMETIC',
  COMPARISON: 'COMPARISON',
  LOGICAL: 'LOGICAL',
  UNARY: 'UNARY',
  
  // Punctuation
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  DOT: 'DOT',
  COLON: 'COLON',
  
  // Brackets
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  
  // Special
  NEWLINE: 'NEWLINE',
  WHITESPACE: 'WHITESPACE',
  COMMENT: 'COMMENT',
  EOF: 'EOF',
  UNKNOWN: 'UNKNOWN'
};

/**
 * JavaScript keywords
 */
const KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
  'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new',
  'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
  'void', 'while', 'with', 'yield', 'async', 'await', 'of'
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
 * JavaScript Lexer class
 */
export class JavaScriptLexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  /**
   * Get current character
   */
  currentChar() {
    if (this.position >= this.input.length) {
      return null;
    }
    return this.input[this.position];
  }

  /**
   * Peek at next character without advancing position
   */
  peekChar(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.input.length) {
      return null;
    }
    return this.input[pos];
  }

  /**
   * Advance position and update line/column tracking
   */
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

  /**
   * Skip whitespace characters
   */
  skipWhitespace() {
    while (this.currentChar() && /\s/.test(this.currentChar()) && this.currentChar() !== '\n') {
      this.advance();
    }
  }

  /**
   * Read identifier or keyword
   */
  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    while (this.currentChar() && /[a-zA-Z0-9_$]/.test(this.currentChar())) {
      value += this.currentChar();
      this.advance();
    }

    const type = KEYWORDS.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    
    // Handle special literals
    if (value === 'true' || value === 'false') {
      return new Token(TokenType.BOOLEAN, value, startLine, startColumn);
    }
    if (value === 'null') {
      return new Token(TokenType.NULL, value, startLine, startColumn);
    }
    if (value === 'undefined') {
      return new Token(TokenType.UNDEFINED, value, startLine, startColumn);
    }

    return new Token(type, value, startLine, startColumn);
  }

  /**
   * Read numeric literal
   */
  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    let hasDecimal = false;

    while (this.currentChar() && (/\d/.test(this.currentChar()) || this.currentChar() === '.')) {
      if (this.currentChar() === '.') {
        if (hasDecimal) break; // Second decimal point, stop
        hasDecimal = true;
      }
      value += this.currentChar();
      this.advance();
    }

    // Handle scientific notation
    if (this.currentChar() && (this.currentChar() === 'e' || this.currentChar() === 'E')) {
      value += this.currentChar();
      this.advance();
      if (this.currentChar() && (this.currentChar() === '+' || this.currentChar() === '-')) {
        value += this.currentChar();
        this.advance();
      }
      while (this.currentChar() && /\d/.test(this.currentChar())) {
        value += this.currentChar();
        this.advance();
      }
    }

    return new Token(TokenType.NUMBER, value, startLine, startColumn);
  }

  /**
   * Read string literal
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

    return new Token(TokenType.STRING, value, startLine, startColumn);
  }

  /**
   * Read single-line comment
   */
  readSingleLineComment() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    // Skip '//'
    this.advance();
    this.advance();

    while (this.currentChar() && this.currentChar() !== '\n') {
      value += this.currentChar();
      this.advance();
    }

    return new Token(TokenType.COMMENT, value.trim(), startLine, startColumn);
  }

  /**
   * Read multi-line comment
   */
  readMultiLineComment() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    // Skip '/*'
    this.advance();
    this.advance();

    while (this.currentChar()) {
      if (this.currentChar() === '*' && this.peekChar() === '/') {
        this.advance(); // Skip '*'
        this.advance(); // Skip '/'
        break;
      }
      value += this.currentChar();
      this.advance();
    }

    return new Token(TokenType.COMMENT, value.trim(), startLine, startColumn);
  }

  /**
   * Read operator
   */
  readOperator() {
    const startLine = this.line;
    const startColumn = this.column;
    const char = this.currentChar();
    const nextChar = this.peekChar();

    // Two-character operators
    const twoChar = char + (nextChar || '');
    const threeChar = twoChar + (this.peekChar(2) || '');

    // Three-character operators
    if (['===', '!==', '>>>', '<<=', '>>='].includes(threeChar)) {
      this.advance();
      this.advance();
      this.advance();
      return new Token(TokenType.COMPARISON, threeChar, startLine, startColumn);
    }

    // Two-character operators
    const twoCharOps = {
      '==': TokenType.COMPARISON, '!=': TokenType.COMPARISON,
      '<=': TokenType.COMPARISON, '>=': TokenType.COMPARISON,
      '&&': TokenType.LOGICAL, '||': TokenType.LOGICAL,
      '++': TokenType.UNARY, '--': TokenType.UNARY,
      '+=': TokenType.ASSIGNMENT, '-=': TokenType.ASSIGNMENT,
      '*=': TokenType.ASSIGNMENT, '/=': TokenType.ASSIGNMENT,
      '%=': TokenType.ASSIGNMENT, '&=': TokenType.ASSIGNMENT,
      '|=': TokenType.ASSIGNMENT, '^=': TokenType.ASSIGNMENT,
      '<<': TokenType.ARITHMETIC, '>>': TokenType.ARITHMETIC,
      '**': TokenType.ARITHMETIC
    };

    if (twoCharOps[twoChar]) {
      this.advance();
      this.advance();
      return new Token(twoCharOps[twoChar], twoChar, startLine, startColumn);
    }

    // Single-character operators
    const singleCharOps = {
      '+': TokenType.ARITHMETIC, '-': TokenType.ARITHMETIC,
      '*': TokenType.ARITHMETIC, '/': TokenType.ARITHMETIC,
      '%': TokenType.ARITHMETIC, '=': TokenType.ASSIGNMENT,
      '<': TokenType.COMPARISON, '>': TokenType.COMPARISON,
      '!': TokenType.UNARY, '~': TokenType.UNARY,
      '&': TokenType.ARITHMETIC, '|': TokenType.ARITHMETIC,
      '^': TokenType.ARITHMETIC
    };

    if (singleCharOps[char]) {
      this.advance();
      return new Token(singleCharOps[char], char, startLine, startColumn);
    }

    // If not recognized as operator, return as unknown
    this.advance();
    return new Token(TokenType.UNKNOWN, char, startLine, startColumn);
  }

  /**
   * Get next token
   */
  nextToken() {
    while (this.currentChar()) {
      const char = this.currentChar();
      const line = this.line;
      const column = this.column;

      // Skip whitespace (except newlines)
      if (/[ \t\r]/.test(char)) {
        this.skipWhitespace();
        continue;
      }

      // Newline
      if (char === '\n') {
        this.advance();
        return new Token(TokenType.NEWLINE, '\\n', line, column);
      }

      // Comments
      if (char === '/' && this.peekChar() === '/') {
        return this.readSingleLineComment();
      }
      if (char === '/' && this.peekChar() === '*') {
        return this.readMultiLineComment();
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
        ':': TokenType.COLON,
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
      if (/[+\-*/%=<>!&|^~]/.test(char)) {
        return this.readOperator();
      }

      // Unknown character
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
      tokens.push(token);
    } while (token.type !== TokenType.EOF);

    return tokens;
  }

  /**
   * Get all tokens (excluding whitespace and comments by default)
   */
  getTokens(includeWhitespace = false, includeComments = false) {
    const tokens = this.tokenize();
    return tokens.filter(token => {
      if (!includeWhitespace && token.type === TokenType.WHITESPACE) return false;
      if (!includeComments && token.type === TokenType.COMMENT) return false;
      return true;
    });
  }
}

/**
 * Convenience function to tokenize JavaScript code
 */
export function tokenizeJavaScript(code, options = {}) {
  const lexer = new JavaScriptLexer(code);
  return lexer.getTokens(options.includeWhitespace, options.includeComments);
}
