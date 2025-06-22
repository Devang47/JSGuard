import { TokenType, JavaScriptLexer } from './lexer.js';

/**
 * Minimal AST Node types for essential JavaScript constructs
 */
export const NodeType = {
  // Program
  PROGRAM: 'Program',
  
  // Statements
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  VARIABLE_DECLARATION: 'VariableDeclaration',
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  BLOCK_STATEMENT: 'BlockStatement',
  
  // Expressions
  BINARY_EXPRESSION: 'BinaryExpression',
  ASSIGNMENT_EXPRESSION: 'AssignmentExpression',
  CALL_EXPRESSION: 'CallExpression',
  MEMBER_EXPRESSION: 'MemberExpression',
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  
  // Other
  VARIABLE_DECLARATOR: 'VariableDeclarator'
};

/**
 * Base AST Node class
 */
export class ASTNode {
  constructor(type, line = 1, column = 1) {
    this.type = type;
    this.line = line;
    this.column = column;
  }
}

/**
 * Program node - root of AST
 */
export class Program extends ASTNode {
  constructor(body = [], line = 1, column = 1) {
    super(NodeType.PROGRAM, line, column);
    this.body = body;
  }
}

/**
 * Identifier node
 */
export class Identifier extends ASTNode {
  constructor(name, line = 1, column = 1) {
    super(NodeType.IDENTIFIER, line, column);
    this.name = name;
  }
}

/**
 * Literal node
 */
export class Literal extends ASTNode {
  constructor(value, raw, line = 1, column = 1) {
    super(NodeType.LITERAL, line, column);
    this.value = value;
    this.raw = raw;
  }
}

/**
 * Binary Expression node
 */
export class BinaryExpression extends ASTNode {
  constructor(operator, left, right, line = 1, column = 1) {
    super(NodeType.BINARY_EXPRESSION, line, column);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

/**
 * Assignment Expression node
 */
export class AssignmentExpression extends ASTNode {
  constructor(operator, left, right, line = 1, column = 1) {
    super(NodeType.ASSIGNMENT_EXPRESSION, line, column);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

/**
 * Call Expression node
 */
export class CallExpression extends ASTNode {
  constructor(callee, args = [], line = 1, column = 1) {
    super(NodeType.CALL_EXPRESSION, line, column);
    this.callee = callee;
    this.arguments = args;
  }
}

/**
 * Member Expression node
 */
export class MemberExpression extends ASTNode {
  constructor(object, property, computed = false, line = 1, column = 1) {
    super(NodeType.MEMBER_EXPRESSION, line, column);
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
}

/**
 * Variable Declaration node
 */
export class VariableDeclaration extends ASTNode {
  constructor(kind, declarations = [], line = 1, column = 1) {
    super(NodeType.VARIABLE_DECLARATION, line, column);
    this.kind = kind; // 'var', 'let', 'const'
    this.declarations = declarations;
  }
}

/**
 * Variable Declarator node
 */
export class VariableDeclarator extends ASTNode {
  constructor(id, init = null, line = 1, column = 1) {
    super(NodeType.VARIABLE_DECLARATOR, line, column);
    this.id = id;
    this.init = init;
  }
}

/**
 * Function Declaration node
 */
export class FunctionDeclaration extends ASTNode {
  constructor(id, params = [], body, line = 1, column = 1) {
    super(NodeType.FUNCTION_DECLARATION, line, column);
    this.id = id;
    this.params = params;
    this.body = body;
  }
}

/**
 * Block Statement node
 */
export class BlockStatement extends ASTNode {
  constructor(body = [], line = 1, column = 1) {
    super(NodeType.BLOCK_STATEMENT, line, column);
    this.body = body;
  }
}

/**
 * Expression Statement node
 */
export class ExpressionStatement extends ASTNode {
  constructor(expression, line = 1, column = 1) {
    super(NodeType.EXPRESSION_STATEMENT, line, column);
    this.expression = expression;
  }
}

/**
 * Minimal JavaScript Parser - handles only essential constructs
 */
export class JavaScriptParser {
  constructor(tokens) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.NEWLINE && 
      token.type !== TokenType.COMMENT
    );
    this.position = 0;
    this.errors = [];
  }

  currentToken() {
    if (this.position >= this.tokens.length) {
      return { type: TokenType.EOF, value: '', line: 1, column: 1 };
    }
    return this.tokens[this.position];
  }

  advance() {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }

  match(type, value = null) {
    const token = this.currentToken();
    return token.type === type && (value === null || token.value === value);
  }

  consume(type, value = null) {
    if (this.match(type, value)) {
      const token = this.currentToken();
      this.advance();
      return token;
    }
    
    // Skip error recovery for minimal parser
    this.advance();
    return { type: TokenType.UNKNOWN, value: '', line: 1, column: 1 };
  }

  /**
   * Parse the entire program
   */
  parse() {
    const body = [];
    
    while (!this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
    }
    
    return new Program(body, 1, 1);
  }

  /**
   * Parse statement - minimal set
   */
  parseStatement() {
    const token = this.currentToken();
    
    // Variable declarations
    if (token.type === TokenType.KEYWORD && ['var', 'let', 'const'].includes(token.value)) {
      return this.parseVariableDeclaration();
    }
    
    // Function declarations
    if (token.type === TokenType.KEYWORD && token.value === 'function') {
      return this.parseFunctionDeclaration();
    }
    
    // Block statements
    if (this.match(TokenType.LBRACE)) {
      return this.parseBlockStatement();
    }
    
    // Everything else is an expression statement
    return this.parseExpressionStatement();
  }

  /**
   * Parse variable declaration: var/let/const x = value;
   */
  parseVariableDeclaration() {
    const token = this.consume(TokenType.KEYWORD);
    const kind = token.value;
    const declarations = [];
    
    do {
      const id = new Identifier(this.consume(TokenType.IDENTIFIER).value, token.line, token.column);
      
      let init = null;
      if (this.match(TokenType.ASSIGNMENT, '=')) {
        this.advance();
        init = this.parseExpression();
      }
      
      declarations.push(new VariableDeclarator(id, init, id.line, id.column));
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    } while (true);
    
    // Optional semicolon
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
    
    return new VariableDeclaration(kind, declarations, token.line, token.column);
  }

  /**
   * Parse function declaration: function name() { }
   */
  parseFunctionDeclaration() {
    const token = this.consume(TokenType.KEYWORD, 'function');
    const id = new Identifier(this.consume(TokenType.IDENTIFIER).value, token.line, token.column);
    
    this.consume(TokenType.LPAREN);
    const params = [];
    
    // Simple parameter parsing
    while (!this.match(TokenType.RPAREN) && !this.match(TokenType.EOF)) {
      if (this.match(TokenType.IDENTIFIER)) {
        params.push(new Identifier(this.currentToken().value, this.currentToken().line, this.currentToken().column));
        this.advance();
      }
      if (this.match(TokenType.COMMA)) {
        this.advance();
      }
    }
    
    this.consume(TokenType.RPAREN);
    const body = this.parseBlockStatement();
    
    return new FunctionDeclaration(id, params, body, token.line, token.column);
  }

  /**
   * Parse block statement: { statements... }
   */
  parseBlockStatement() {
    const token = this.consume(TokenType.LBRACE);
    const body = [];
    
    while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
    }
    
    this.consume(TokenType.RBRACE);
    return new BlockStatement(body, token.line, token.column);
  }

  /**
   * Parse expression statement: expression;
   */
  parseExpressionStatement() {
    const expr = this.parseExpression();
    
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
    
    return new ExpressionStatement(expr, expr.line, expr.column);
  }

  /**
   * Parse expression - simplified precedence
   */
  parseExpression() {
    return this.parseAssignmentExpression();
  }

  /**
   * Parse assignment: left = right
   */
  parseAssignmentExpression() {
    const left = this.parseBinaryExpression();
    
    if (this.currentToken().type === TokenType.ASSIGNMENT) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseExpression();
      return new AssignmentExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse binary expressions - simplified (no precedence handling)
   */
  parseBinaryExpression() {
    let left = this.parsePostfixExpression();
    
    // Simple left-to-right parsing for all binary operators
    while (this.currentToken().type === TokenType.ARITHMETIC || 
           this.currentToken().type === TokenType.COMPARISON ||
           this.currentToken().type === TokenType.LOGICAL) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parsePostfixExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse postfix expressions: obj.prop, obj[prop], func()
   */
  parsePostfixExpression() {
    let left = this.parsePrimaryExpression();
    
    while (true) {
      if (this.match(TokenType.DOT)) {
        // obj.property
        this.advance();
        if (this.match(TokenType.IDENTIFIER)) {
          const property = new Identifier(this.currentToken().value, this.currentToken().line, this.currentToken().column);
          this.advance();
          left = new MemberExpression(left, property, false, left.line, left.column);
        }
      } else if (this.match(TokenType.LBRACKET)) {
        // obj[expression]
        this.advance();
        const property = this.parseExpression();
        this.consume(TokenType.RBRACKET);
        left = new MemberExpression(left, property, true, left.line, left.column);
      } else if (this.match(TokenType.LPAREN)) {
        // function(args)
        this.advance();
        const args = [];
        
        while (!this.match(TokenType.RPAREN) && !this.match(TokenType.EOF)) {
          args.push(this.parseExpression());
          if (this.match(TokenType.COMMA)) {
            this.advance();
          }
        }
        
        this.consume(TokenType.RPAREN);
        left = new CallExpression(left, args, left.line, left.column);
      } else {
        break;
      }
    }
    
    return left;
  }

  /**
   * Parse primary expressions: identifiers, literals, parentheses
   */
  parsePrimaryExpression() {
    const token = this.currentToken();
    
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return new Identifier(token.value, token.line, token.column);
    }
    
    if ([TokenType.NUMBER, TokenType.STRING, TokenType.BOOLEAN, TokenType.NULL].includes(token.type)) {
      this.advance();
      let value = token.value;
      
      // Convert literal values
      if (token.type === TokenType.NUMBER) {
        value = parseFloat(token.value);
      } else if (token.type === TokenType.BOOLEAN) {
        value = token.value === 'true';
      } else if (token.type === TokenType.NULL) {
        value = null;
      }
      
      return new Literal(value, token.value, token.line, token.column);
    }
    
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN);
      return expr;
    }
    
    // Unknown token - create placeholder
    this.advance();
    return new Identifier('unknown', token.line, token.column);
  }
}

/**
 * Convenience function to parse JavaScript code
 */
export function parseJavaScript(code) {
  const lexer = new JavaScriptLexer(code);
  const tokens = lexer.tokenize();
  const parser = new JavaScriptParser(tokens);
  return parser.parse();
}

