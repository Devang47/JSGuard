# JavaScript Parser - Syntax Analysis and AST Construction

## What is a Parser and Why Do We Need It?

A **parser** is the second phase of compilation that takes a stream of tokens from the lexer and builds an **Abstract Syntax Tree (AST)** - a hierarchical representation of the program's structure.

### The Problem Parsers Solve

Consider these tokens from the lexer:
```
[Token(IDENTIFIER,"x"), Token(ASSIGNMENT,"="), Token(NUMBER,"5"), Token(ARITHMETIC,"+"), Token(NUMBER,"3")]
```

Multiple interpretations are possible:
- `(x = 5) + 3` - assignment returns a value, then add 3
- `x = (5 + 3)` - add first, then assign to x

The parser uses **grammar rules** and **operator precedence** to choose the correct interpretation and build a tree structure that represents the program's intended meaning.

### Parsing Theory Fundamentals

#### Context-Free Grammars (CFG)

JavaScript's syntax is defined by a **Context-Free Grammar** - rules that describe how tokens combine to form valid programs:

```
Program → Statement*
Statement → VariableDeclaration | ExpressionStatement | FunctionDeclaration
VariableDeclaration → ("let" | "const" | "var") Identifier ("=" Expression)? ";"
Expression → AssignmentExpression
AssignmentExpression → LogicalOrExpression ("=" AssignmentExpression)?
LogicalOrExpression → LogicalAndExpression ("||" LogicalAndExpression)*
```

#### Recursive Descent Parsing

Our parser uses **Recursive Descent** - each grammar rule becomes a function that calls other rule functions:

```javascript
// Grammar: Expression → AssignmentExpression
parseExpression() {
  return this.parseAssignmentExpression();
}

// Grammar: AssignmentExpression → LogicalOrExpression ("=" AssignmentExpression)?
parseAssignmentExpression() {
  const left = this.parseLogicalOrExpression();
  if (this.match(TokenType.ASSIGNMENT)) {
    const operator = this.currentToken().value;
    this.advance();
    const right = this.parseAssignmentExpression(); // Right-associative
    return new AssignmentExpression(operator, left, right);
  }
  return left;
}
```

#### Operator Precedence and Associativity

JavaScript operators have different **precedence levels** (which operations happen first) and **associativity** (left-to-right vs right-to-left for same precedence):

```javascript
// Precedence (highest to lowest):
// 1. Member access: obj.prop, obj[prop]
// 2. Function calls: func()
// 3. Unary: !, ~, ++, --
// 4. Multiplicative: *, /, %
// 5. Additive: +, -
// 6. Relational: <, >, <=, >=
// 7. Equality: ==, !=, ===, !==
// 8. Logical AND: &&
// 9. Logical OR: ||
// 10. Assignment: =, +=, -=

// Examples:
x = y + z * w    // Parsed as: x = (y + (z * w))
a && b || c      // Parsed as: (a && b) || c
x = y = z        // Parsed as: x = (y = z) [right-associative]
```

## AST Node Design Philosophy

### Node Type Hierarchy

```javascript
export const NodeType = {
  // Program structure
  PROGRAM: 'Program',                    // Root of every AST
  
  // Statements (perform actions)
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  VARIABLE_DECLARATION: 'VariableDeclaration',
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  RETURN_STATEMENT: 'ReturnStatement',
  IF_STATEMENT: 'IfStatement',
  BLOCK_STATEMENT: 'BlockStatement',
  
  // Expressions (produce values)
  BINARY_EXPRESSION: 'BinaryExpression',
  UNARY_EXPRESSION: 'UnaryExpression',
  ASSIGNMENT_EXPRESSION: 'AssignmentExpression',
  CALL_EXPRESSION: 'CallExpression',
  MEMBER_EXPRESSION: 'MemberExpression',
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  ARRAY_EXPRESSION: 'ArrayExpression',
  OBJECT_EXPRESSION: 'ObjectExpression'
};
```

### Design Principles

1. **Uniform Interface**: All nodes extend ASTNode with type, line, column
2. **Semantic Clarity**: Node types reflect meaning, not syntax
3. **Composition**: Complex structures built from simple nodes
4. **Source Mapping**: Every node tracks its source location

### Key Node Structures

#### Expression Nodes (Values)

```javascript
// Binary operations: x + y, a === b, p && q
class BinaryExpression extends ASTNode {
  constructor(operator, left, right, line, column) {
    this.operator = operator; // "+", "===", "&&"
    this.left = left;         // Left operand
    this.right = right;       // Right operand
  }
}

// Function calls: func(arg1, arg2)
class CallExpression extends ASTNode {
  constructor(callee, args, line, column) {
    this.callee = callee;     // Function being called
    this.arguments = args;    // Array of argument expressions
  }
}

// Property access: obj.prop or obj[key]
class MemberExpression extends ASTNode {
  constructor(object, property, computed, line, column) {
    this.object = object;     // Object being accessed
    this.property = property; // Property name/expression
    this.computed = computed; // true for obj[key], false for obj.prop
  }
}
```

#### Statement Nodes (Actions)

```javascript
// Variable declarations: let x = 5;
class VariableDeclaration extends ASTNode {
  constructor(kind, declarations, line, column) {
    this.kind = kind;             // "let", "const", "var"
    this.declarations = declarations; // Array of VariableDeclarator nodes
  }
}

// Function declarations: function name(params) { body }
class FunctionDeclaration extends ASTNode {
  constructor(id, params, body, line, column) {
    this.id = id;       // Function name
    this.params = params; // Parameter list
    this.body = body;   // Function body (BlockStatement)
  }
}
```

## Recursive Descent Implementation

### Parser State Management

```javascript
class JavaScriptParser {
  constructor(tokens) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.NEWLINE && 
      token.type !== TokenType.COMMENT
    );
    this.position = 0;
    this.errors = [];
  }
  
  currentToken() {
    return this.position < this.tokens.length 
      ? this.tokens[this.position] 
      : { type: TokenType.EOF };
  }
  
  advance() {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }
}
```

### Expression Parsing with Precedence

The parser implements precedence through a **precedence climbing** technique where lower precedence expressions call higher precedence parsers:

```javascript
// Lowest precedence: assignment (right-associative)
parseAssignmentExpression() {
  const left = this.parseLogicalOrExpression();
  
  if (this.currentToken().type === TokenType.ASSIGNMENT) {
    const operator = this.currentToken().value;
    this.advance();
    // Right-associative: parse another assignment expression
    const right = this.parseAssignmentExpression();
    return new AssignmentExpression(operator, left, right);
  }
  
  return left;
}

// Medium precedence: logical OR (left-associative)
parseLogicalOrExpression() {
  let left = this.parseLogicalAndExpression();
  
  // Left-associative: build left-leaning tree
  while (this.match(TokenType.LOGICAL, '||')) {
    const operator = this.currentToken().value;
    this.advance();
    const right = this.parseLogicalAndExpression();
    left = new BinaryExpression(operator, left, right);
  }
  
  return left;
}

// Higher precedence: multiplicative operations
parseMultiplicativeExpression() {
  let left = this.parseUnaryExpression();
  
  while (this.currentToken().type === TokenType.ARITHMETIC && 
         ['*', '/', '%'].includes(this.currentToken().value)) {
    const operator = this.currentToken().value;
    this.advance();
    const right = this.parseUnaryExpression();
    left = new BinaryExpression(operator, left, right);
  }
  
  return left;
}
```

### Statement Parsing

#### Variable Declarations

```javascript
parseVariableDeclaration() {
  const token = this.consume(TokenType.KEYWORD); // "let", "const", "var"
  const kind = token.value;
  const declarations = [];
  
  do {
    // Parse identifier
    const id = new Identifier(this.consume(TokenType.IDENTIFIER).value);
    
    // Optional initializer
    let init = null;
    if (this.match(TokenType.ASSIGNMENT, '=')) {
      this.advance();
      init = this.parseExpression();
    }
    
    declarations.push(new VariableDeclarator(id, init));
    
    // Handle multiple declarations: let a = 1, b = 2;
    if (this.match(TokenType.COMMA)) {
      this.advance();
    } else {
      break;
    }
  } while (true);
  
  return new VariableDeclaration(kind, declarations);
}
```

#### Function Declarations

```javascript
parseFunctionDeclaration() {
  this.consume(TokenType.KEYWORD, 'function');
  
  // Function name
  const id = new Identifier(this.consume(TokenType.IDENTIFIER).value);
  
  // Parameter list
  this.consume(TokenType.LPAREN);
  const params = [];
  
  if (!this.match(TokenType.RPAREN)) {
    do {
      params.push(new Identifier(this.consume(TokenType.IDENTIFIER).value));
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    } while (true);
  }
  
  this.consume(TokenType.RPAREN);
  
  // Function body
  const body = this.parseBlockStatement();
  
  return new FunctionDeclaration(id, params, body);
}
```

### Complex Expression Parsing

#### Member Expressions and Function Calls

```javascript
parsePostfixExpression() {
  let left = this.parsePrimaryExpression();
  
  // Chain member access and function calls
  while (true) {
    if (this.match(TokenType.DOT)) {
      // obj.property
      this.advance();
      const property = new Identifier(this.consume(TokenType.IDENTIFIER).value);
      left = new MemberExpression(left, property, false); // not computed
      
    } else if (this.match(TokenType.LBRACKET)) {
      // obj[expression]
      this.advance();
      const property = this.parseExpression();
      this.consume(TokenType.RBRACKET);
      left = new MemberExpression(left, property, true); // computed
      
    } else if (this.match(TokenType.LPAREN)) {
      // function(args)
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
      left = new CallExpression(left, args);
      
    } else {
      break; // No more postfix operations
    }
  }
  
  return left;
}
```

#### Object and Array Literals

```javascript
parseObjectExpression() {
  this.consume(TokenType.LBRACE);
  const properties = [];
  
  if (!this.match(TokenType.RBRACE)) {
    do {
      // Property key (identifier or string)
      let key;
      if (this.match(TokenType.IDENTIFIER)) {
        key = new Identifier(this.currentToken().value);
        this.advance();
      } else if (this.match(TokenType.STRING)) {
        key = new Literal(this.currentToken().value, this.currentToken().value);
        this.advance();
      } else {
        throw new Error('Expected property name');
      }
      
      // Colon separator
      this.consume(TokenType.COLON);
      
      // Property value
      const value = this.parseExpression();
      
      properties.push(new Property(key, value, 'init'));
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    } while (true);
  }
  
  this.consume(TokenType.RBRACE);
  return new ObjectExpression(properties);
}
```

## Error Handling and Recovery

### Panic Mode Recovery

When the parser encounters an unexpected token, it uses **panic mode recovery**:

```javascript
synchronize() {
  this.advance(); // Skip the problematic token
  
  // Look for statement boundaries
  while (!this.match(TokenType.EOF)) {
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
      return; // Found statement end
    }
    
    // Look for statement starters
    const token = this.currentToken();
    if (token.type === TokenType.KEYWORD && 
        ['function', 'var', 'let', 'const', 'if', 'while', 'for', 'return'].includes(token.value)) {
      return; // Found next statement
    }
    
    this.advance();
  }
}
```

### Error Reporting Strategy

```javascript
consume(expectedType, expectedValue = null, errorMessage = null) {
  if (this.match(expectedType, expectedValue)) {
    const token = this.currentToken();
    this.advance();
    return token;
  }
  
  // Generate informative error message
  const actual = this.currentToken();
  const expected = expectedValue ? `${expectedType}(${expectedValue})` : expectedType;
  const message = errorMessage || 
    `Expected ${expected}, got ${actual.type}(${actual.value}) at line ${actual.line}:${actual.column}`;
  
  this.errors.push(message);
  throw new Error(message);
}
```

## AST Design for Analysis

### Why This AST Structure?

The AST design prioritizes **analysis-friendly** structures:

1. **Uniform Node Interface**: Every node has type, line, column for consistent processing
2. **Semantic Grouping**: Expressions vs statements clearly separated
3. **Rich Metadata**: Source locations enable precise error reporting
4. **Compositional**: Complex structures decompose into simpler parts

### Example AST for `let x = 5 + 3;`

```javascript
Program {
  body: [
    VariableDeclaration {
      kind: "let",
      declarations: [
        VariableDeclarator {
          id: Identifier { name: "x" },
          init: BinaryExpression {
            operator: "+",
            left: Literal { value: 5 },
            right: Literal { value: 3 }
          }
        }
      ]
    }
  ]
}
```

This structure makes it easy for the analyzer to:
- Find all variable declarations
- Analyze expressions for security issues
- Track data flow through the program
- Generate meaningful error messages

## Integration with Static Analysis

### AST Traversal Patterns

The parser's AST enables powerful analysis through tree traversal:

```javascript
function analyzeNode(node) {
  // Pattern matching on node types
  switch (node.type) {
    case NodeType.CALL_EXPRESSION:
      if (node.callee.name === 'eval') {
        reportSecurityIssue('Dangerous eval() call', node.line);
      }
      break;
      
    case NodeType.BINARY_EXPRESSION:
      if (node.operator === '==' || node.operator === '!=') {
        reportStyleIssue('Use === instead of ==', node.line);
      }
      break;
  }
  
  // Recursively analyze child nodes
  traverseChildren(node, analyzeNode);
}
```

### Context-Sensitive Analysis

The AST structure preserves context for sophisticated analysis:

```javascript
function isInsideLoop(node, parent) {
  while (parent) {
    if (parent.type === NodeType.WHILE_STATEMENT || 
        parent.type === NodeType.FOR_STATEMENT) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}
```

## Performance and Scalability

### Time Complexity: O(n)
- **Single Pass**: Each token consumed exactly once
- **Linear Grammar**: No backtracking required
- **Predictive Parsing**: Next action determined by current token

### Space Complexity: O(d)
- **Call Stack**: Depth equals maximum expression nesting
- **AST Size**: Proportional to input program size
- **Memory Efficiency**: Minimal per-node overhead

### Optimization Strategies

1. **Token Filtering**: Remove comments/whitespace during construction
2. **Operator Tables**: Constant-time precedence lookups
3. **Error Recovery**: Continue parsing after errors for better IDE experience

## Extending the Parser

### Adding New Language Features

To add support for arrow functions (`() => {}`):

1. **Extend Grammar**:
   ```
   ArrowFunction → "(" ParameterList? ")" "=>" (Expression | BlockStatement)
   ```

2. **Add Node Type**:
   ```javascript
   ARROW_FUNCTION: 'ArrowFunction'
   ```

3. **Create Node Class**:
   ```javascript
   class ArrowFunction extends ASTNode {
     constructor(params, body, line, column) {
       super(NodeType.ARROW_FUNCTION, line, column);
       this.params = params;
       this.body = body;
     }
   }
   ```

4. **Implement Parser Method**:
   ```javascript
   parseArrowFunction() {
     this.consume(TokenType.LPAREN);
     const params = this.parseParameterList();
     this.consume(TokenType.RPAREN);
     this.consume(TokenType.ARROW); // New token type
     const body = this.parseArrowBody();
     return new ArrowFunction(params, body);
   }
   ```

This parser forms the semantic foundation that enables JSGuard to understand JavaScript code structure and perform sophisticated static analysis.
