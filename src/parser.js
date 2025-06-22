import { TokenType, JavaScriptLexer } from './lexer.js';

/**
 * AST Node types
 */
export const NodeType = {
  // Program
  PROGRAM: 'Program',
  
  // Statements
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  VARIABLE_DECLARATION: 'VariableDeclaration',
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  RETURN_STATEMENT: 'ReturnStatement',
  IF_STATEMENT: 'IfStatement',
  WHILE_STATEMENT: 'WhileStatement',
  FOR_STATEMENT: 'ForStatement',
  BLOCK_STATEMENT: 'BlockStatement',
  
  // Expressions
  BINARY_EXPRESSION: 'BinaryExpression',
  UNARY_EXPRESSION: 'UnaryExpression',
  ASSIGNMENT_EXPRESSION: 'AssignmentExpression',
  CALL_EXPRESSION: 'CallExpression',
  MEMBER_EXPRESSION: 'MemberExpression',
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  ARRAY_EXPRESSION: 'ArrayExpression',
  OBJECT_EXPRESSION: 'ObjectExpression',
  
  // Other
  VARIABLE_DECLARATOR: 'VariableDeclarator',
  PROPERTY: 'Property',
  PARAMETER: 'Parameter'
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
 * Unary Expression node
 */
export class UnaryExpression extends ASTNode {
  constructor(operator, argument, prefix = true, line = 1, column = 1) {
    super(NodeType.UNARY_EXPRESSION, line, column);
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
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
 * Return Statement node
 */
export class ReturnStatement extends ASTNode {
  constructor(argument = null, line = 1, column = 1) {
    super(NodeType.RETURN_STATEMENT, line, column);
    this.argument = argument;
  }
}

/**
 * If Statement node
 */
export class IfStatement extends ASTNode {
  constructor(test, consequent, alternate = null, line = 1, column = 1) {
    super(NodeType.IF_STATEMENT, line, column);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

/**
 * Array Expression node
 */
export class ArrayExpression extends ASTNode {
  constructor(elements = [], line = 1, column = 1) {
    super(NodeType.ARRAY_EXPRESSION, line, column);
    this.elements = elements;
  }
}

/**
 * Object Expression node
 */
export class ObjectExpression extends ASTNode {
  constructor(properties = [], line = 1, column = 1) {
    super(NodeType.OBJECT_EXPRESSION, line, column);
    this.properties = properties;
  }
}

/**
 * Property node (for object literals)
 */
export class Property extends ASTNode {
  constructor(key, value, kind = 'init', line = 1, column = 1) {
    super(NodeType.PROPERTY, line, column);
    this.key = key;
    this.value = value;
    this.kind = kind;
  }
}

/**
 * JavaScript Parser class
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

  /**
   * Get current token
   */
  currentToken() {
    if (this.position >= this.tokens.length) {
      return { type: TokenType.EOF, value: '', line: 1, column: 1 };
    }
    return this.tokens[this.position];
  }

  /**
   * Peek at next token
   */
  peekToken(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.tokens.length) {
      return { type: TokenType.EOF, value: '', line: 1, column: 1 };
    }
    return this.tokens[pos];
  }

  /**
   * Advance to next token
   */
  advance() {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }

  /**
   * Check if current token matches expected type and value
   */
  match(type, value = null) {
    const token = this.currentToken();
    return token.type === type && (value === null || token.value === value);
  }

  /**
   * Consume token if it matches, otherwise throw error
   */
  consume(type, value = null, errorMessage = null) {
    if (this.match(type, value)) {
      const token = this.currentToken();
      this.advance();
      return token;
    }
    
    const expected = value ? `${type}(${value})` : type;
    const actual = this.currentToken();
    const message = errorMessage || `Expected ${expected}, got ${actual.type}(${actual.value}) at line ${actual.line}:${actual.column}`;
    this.errors.push(message);
    throw new Error(message);
  }

  /**
   * Parse the entire program
   */
  parse() {
    const body = [];
    
    while (!this.match(TokenType.EOF)) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          body.push(stmt);
        }
      } catch (error) {
        // Error recovery - skip to next statement
        this.synchronize();
      }
    }
    
    return new Program(body, 1, 1);
  }

  /**
   * Synchronize after error for error recovery
   */
  synchronize() {
    this.advance();
    
    while (!this.match(TokenType.EOF)) {
      if (this.match(TokenType.SEMICOLON)) {
        this.advance();
        return;
      }
      
      const token = this.currentToken();
      if (token.type === TokenType.KEYWORD && 
          ['function', 'var', 'let', 'const', 'if', 'while', 'for', 'return'].includes(token.value)) {
        return;
      }
      
      this.advance();
    }
  }

  /**
   * Parse statement
   */
  parseStatement() {
    const token = this.currentToken();
    
    if (token.type === TokenType.KEYWORD) {
      switch (token.value) {
        case 'var':
        case 'let':
        case 'const':
          return this.parseVariableDeclaration();
        case 'function':
          return this.parseFunctionDeclaration();
        case 'return':
          return this.parseReturnStatement();
        case 'if':
          return this.parseIfStatement();
        case 'while':
          return this.parseWhileStatement();
        case 'for':
          return this.parseForStatement();
      }
    }
    
    if (this.match(TokenType.LBRACE)) {
      return this.parseBlockStatement();
    }
    
    return this.parseExpressionStatement();
  }

  /**
   * Parse variable declaration
   */
  parseVariableDeclaration() {
    const token = this.consume(TokenType.KEYWORD);
    const kind = token.value;
    const declarations = [];
    
    do {
      const id = new Identifier(
        this.consume(TokenType.IDENTIFIER).value,
        this.currentToken().line,
        this.currentToken().column
      );
      
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
    
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
    
    return new VariableDeclaration(kind, declarations, token.line, token.column);
  }

  /**
   * Parse function declaration
   */
  parseFunctionDeclaration() {
    const token = this.consume(TokenType.KEYWORD, 'function');
    const id = new Identifier(
      this.consume(TokenType.IDENTIFIER).value,
      this.currentToken().line,
      this.currentToken().column
    );
    
    this.consume(TokenType.LPAREN);
    const params = [];
    
    if (!this.match(TokenType.RPAREN)) {
      do {
        params.push(new Identifier(
          this.consume(TokenType.IDENTIFIER).value,
          this.currentToken().line,
          this.currentToken().column
        ));
        
        if (this.match(TokenType.COMMA)) {
          this.advance();
        } else {
          break;
        }
      } while (true);
    }
    
    this.consume(TokenType.RPAREN);
    const body = this.parseBlockStatement();
    
    return new FunctionDeclaration(id, params, body, token.line, token.column);
  }

  /**
   * Parse block statement
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
   * Parse return statement
   */
  parseReturnStatement() {
    const token = this.consume(TokenType.KEYWORD, 'return');
    let argument = null;
    
    if (!this.match(TokenType.SEMICOLON) && !this.match(TokenType.EOF)) {
      argument = this.parseExpression();
    }
    
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
    
    return new ReturnStatement(argument, token.line, token.column);
  }

  /**
   * Parse if statement
   */
  parseIfStatement() {
    const token = this.consume(TokenType.KEYWORD, 'if');
    this.consume(TokenType.LPAREN);
    const test = this.parseExpression();
    this.consume(TokenType.RPAREN);
    const consequent = this.parseStatement();
    
    let alternate = null;
    if (this.match(TokenType.KEYWORD, 'else')) {
      this.advance();
      alternate = this.parseStatement();
    }
    
    return new IfStatement(test, consequent, alternate, token.line, token.column);
  }

  /**
   * Parse while statement
   */
  parseWhileStatement() {
    const token = this.consume(TokenType.KEYWORD, 'while');
    this.consume(TokenType.LPAREN);
    const test = this.parseExpression();
    this.consume(TokenType.RPAREN);
    const body = this.parseStatement();
    
    return new IfStatement(test, body, null, token.line, token.column); // Reusing IfStatement structure
  }

  /**
   * Parse for statement (simplified)
   */
  parseForStatement() {
    const token = this.consume(TokenType.KEYWORD, 'for');
    this.consume(TokenType.LPAREN);
    
    // Simplified - just consume tokens until closing paren
    let parenCount = 1;
    while (parenCount > 0 && !this.match(TokenType.EOF)) {
      if (this.match(TokenType.LPAREN)) parenCount++;
      if (this.match(TokenType.RPAREN)) parenCount--;
      this.advance();
    }
    
    const body = this.parseStatement();
    return new ExpressionStatement(body, token.line, token.column);
  }

  /**
   * Parse expression statement
   */
  parseExpressionStatement() {
    const expr = this.parseExpression();
    
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
    
    return new ExpressionStatement(expr, expr.line, expr.column);
  }

  /**
   * Parse expression
   */
  parseExpression() {
    return this.parseAssignmentExpression();
  }

  /**
   * Parse assignment expression
   */
  parseAssignmentExpression() {
    const left = this.parseLogicalOrExpression();
    
    if (this.currentToken().type === TokenType.ASSIGNMENT) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseExpression();
      return new AssignmentExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse logical OR expression
   */
  parseLogicalOrExpression() {
    let left = this.parseLogicalAndExpression();
    
    while (this.match(TokenType.LOGICAL, '||')) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseLogicalAndExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse logical AND expression
   */
  parseLogicalAndExpression() {
    let left = this.parseEqualityExpression();
    
    while (this.match(TokenType.LOGICAL, '&&')) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseEqualityExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse equality expression
   */
  parseEqualityExpression() {
    let left = this.parseRelationalExpression();
    
    while (this.currentToken().type === TokenType.COMPARISON && 
           ['==', '!=', '===', '!=='].includes(this.currentToken().value)) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseRelationalExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse relational expression
   */
  parseRelationalExpression() {
    let left = this.parseAdditiveExpression();
    
    while (this.currentToken().type === TokenType.COMPARISON && 
           ['<', '>', '<=', '>='].includes(this.currentToken().value)) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseAdditiveExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse additive expression
   */
  parseAdditiveExpression() {
    let left = this.parseMultiplicativeExpression();
    
    while (this.currentToken().type === TokenType.ARITHMETIC && 
           ['+', '-'].includes(this.currentToken().value)) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseMultiplicativeExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse multiplicative expression
   */
  parseMultiplicativeExpression() {
    let left = this.parseUnaryExpression();
    
    while (this.currentToken().type === TokenType.ARITHMETIC && 
           ['*', '/', '%'].includes(this.currentToken().value)) {
      const operator = this.currentToken().value;
      this.advance();
      const right = this.parseUnaryExpression();
      left = new BinaryExpression(operator, left, right, left.line, left.column);
    }
    
    return left;
  }

  /**
   * Parse unary expression
   */
  parseUnaryExpression() {
    if (this.currentToken().type === TokenType.UNARY) {
      const operator = this.currentToken().value;
      const token = this.currentToken();
      this.advance();
      const argument = this.parseUnaryExpression();
      return new UnaryExpression(operator, argument, true, token.line, token.column);
    }
    
    return this.parsePostfixExpression();
  }

  /**
   * Parse postfix expression (member access, function calls)
   */
  parsePostfixExpression() {
    let left = this.parsePrimaryExpression();
    
    while (true) {
      if (this.match(TokenType.DOT)) {
        this.advance();
        const property = new Identifier(
          this.consume(TokenType.IDENTIFIER).value,
          this.currentToken().line,
          this.currentToken().column
        );
        left = new MemberExpression(left, property, false, left.line, left.column);
      } else if (this.match(TokenType.LBRACKET)) {
        this.advance();
        const property = this.parseExpression();
        this.consume(TokenType.RBRACKET);
        left = new MemberExpression(left, property, true, left.line, left.column);
      } else if (this.match(TokenType.LPAREN)) {
        this.advance();
        const args = [];
        
        if (!this.match(TokenType.RPAREN)) {
          do {
            args.push(this.parseExpression());
            if (this.match(TokenType.COMMA)) {
              this.advance();
            } else {
              break;
            }
          } while (true);
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
   * Parse primary expression
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
    
    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayExpression();
    }
    
    if (this.match(TokenType.LBRACE)) {
      return this.parseObjectExpression();
    }
    
    throw new Error(`Unexpected token ${token.type}(${token.value}) at line ${token.line}:${token.column}`);
  }

  /**
   * Parse array expression
   */
  parseArrayExpression() {
    const token = this.consume(TokenType.LBRACKET);
    const elements = [];
    
    if (!this.match(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
        if (this.match(TokenType.COMMA)) {
          this.advance();
        } else {
          break;
        }
      } while (true);
    }
    
    this.consume(TokenType.RBRACKET);
    return new ArrayExpression(elements, token.line, token.column);
  }

  /**
   * Parse object expression
   */
  parseObjectExpression() {
    const token = this.consume(TokenType.LBRACE);
    const properties = [];
    
    if (!this.match(TokenType.RBRACE)) {
      do {
        let key;
        if (this.match(TokenType.IDENTIFIER)) {
          key = new Identifier(this.currentToken().value, this.currentToken().line, this.currentToken().column);
          this.advance();
        } else if (this.match(TokenType.STRING)) {
          key = new Literal(this.currentToken().value, this.currentToken().value, this.currentToken().line, this.currentToken().column);
          this.advance();
        } else {
          throw new Error(`Expected property name at line ${this.currentToken().line}:${this.currentToken().column}`);
        }
        
        // Expect colon after property name
        this.consume(TokenType.COLON);
        
        const value = this.parseExpression();
        
        properties.push(new Property(key, value, 'init', key.line, key.column));
        
        if (this.match(TokenType.COMMA)) {
          this.advance();
        } else {
          break;
        }
      } while (true);
    }
    
    this.consume(TokenType.RBRACE);
    return new ObjectExpression(properties, token.line, token.column);
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
