import { parseJavaScript, NodeType } from './parser.js';

/**
 * Analyzes JavaScript code for potential issues
 */
function analyzeCode(jsCode) {
  const ast = parseJavaScript(jsCode);
  
  if (!ast) return [];

  const issues = [];

  function walkNode(node, parent = null) {
    if (!node || typeof node !== 'object') return;

    // Detect implicit globals (simplified)
    if (node.type === NodeType.ASSIGNMENT_EXPRESSION && 
        node.left.type === NodeType.IDENTIFIER) {
      issues.push({
        type: "error",
        severity: "high",
        message: `Potential implicit global variable: ${node.left.name}`,
        line: node.line,
        column: node.column
      });
    }

    // Detect unsafe equality comparisons
    if (node.type === NodeType.BINARY_EXPRESSION && 
        (node.operator === "==" || node.operator === "!=")) {
      issues.push({
        type: "error",
        severity: "medium",
        message: `Unsafe equality comparison using ${node.operator} instead of ${node.operator}=`,
        line: node.line,
        column: node.column
      });
    }

    // Detect potential XSS vulnerabilities
    if (node.type === NodeType.MEMBER_EXPRESSION && 
        node.property.type === NodeType.IDENTIFIER) {
      const propertyName = node.property.name;
      if (["innerHTML", "outerHTML"].includes(propertyName)) {
        issues.push({
          type: "security",
          severity: "high",
          message: `Potential XSS vulnerability using ${propertyName}`,
          line: node.line,
          column: node.column
        });
      }
    }

    // Detect dangerous function calls
    if (node.type === NodeType.CALL_EXPRESSION && 
        node.callee.type === NodeType.IDENTIFIER) {
      const calleeName = node.callee.name;
      if (["eval", "Function", "execScript"].includes(calleeName)) {
        issues.push({
          type: "security",
          severity: "high",
          message: `Unsafe use of ${calleeName}() - can execute arbitrary code`,
          line: node.line,
          column: node.column
        });
      }

      if (["setTimeout", "setInterval"].includes(calleeName) && 
          node.arguments.length > 0 && 
          node.arguments[0].type === NodeType.LITERAL && 
          typeof node.arguments[0].value === 'string') {
        issues.push({
          type: "security",
          severity: "high",
          message: `Unsafe use of ${calleeName} with string argument - similar to eval()`,
          line: node.line,
          column: node.column
        });
      }
    }

    // Detect insecure DOM methods like document.write
    if (node.type === NodeType.CALL_EXPRESSION &&
        node.callee.type === NodeType.MEMBER_EXPRESSION &&
        node.callee.object.type === NodeType.MEMBER_EXPRESSION &&
        node.callee.object.object.type === NodeType.IDENTIFIER &&
        node.callee.object.object.name === "document" &&
        node.callee.property.type === NodeType.IDENTIFIER &&
        ["write", "writeln"].includes(node.callee.property.name)) {
      issues.push({
        type: "security",
        severity: "high",
        message: `Insecure use of document.${node.callee.property.name}() - can enable XSS attacks`,
        line: node.line,
        column: node.column
      });
    }

    // Detect potentially insecure HTTP requests
    if (node.type === NodeType.CALL_EXPRESSION &&
        node.callee.type === NodeType.MEMBER_EXPRESSION &&
        node.callee.property.type === NodeType.IDENTIFIER &&
        node.callee.property.name === "open" &&
        node.arguments.length >= 2 &&
        node.arguments[1].type === NodeType.LITERAL &&
        typeof node.arguments[1].value === 'string' &&
        node.arguments[1].value.startsWith("http://")) {
      issues.push({
        type: "security",
        severity: "medium",
        message: "Using insecure HTTP protocol instead of HTTPS",
        line: node.line,
        column: node.column
      });
    }

    // Detect var usage
    if (node.type === NodeType.VARIABLE_DECLARATION && node.kind === "var") {
      issues.push({
        type: "style",
        severity: "medium",
        message: "Use of 'var' keyword - consider using 'let' or 'const' instead for better scoping",
        line: node.line,
        column: node.column
      });
    }

    // Function complexity
    if (node.type === NodeType.FUNCTION_DECLARATION && node.body && node.body.body) {
      const statementCount = countStatements(node.body);
      if (statementCount > 30) {
        issues.push({
          type: "complexity",
          severity: "medium",
          message: `Function is too large (${statementCount} statements) - consider refactoring for better maintainability`,
          line: node.line,
          column: node.column
        });
      }
    }

    // Detect inefficient string concatenation in loops
    if (node.type === NodeType.ASSIGNMENT_EXPRESSION &&
        node.operator === "+=" &&
        node.right.type === NodeType.LITERAL &&
        typeof node.right.value === 'string' &&
        isInsideLoop(node, parent)) {
      issues.push({
        type: "performance",
        severity: "medium",
        message: "Inefficient string concatenation in loop - consider using array.join() instead",
        line: node.line,
        column: node.column
      });
    }

    // Detect unused variables (simplified - checks for declarations without usage)
    if (node.type === NodeType.VARIABLE_DECLARATOR &&
        node.id.type === NodeType.IDENTIFIER &&
        !isVariableUsed(node.id.name, ast)) {
      issues.push({
        type: "performance",
        severity: "low",
        message: `Unused variable: ${node.id.name}`,
        line: node.line,
        column: node.column
      });
    }

    // Recursively walk child nodes
    for (const key in node) {
      if (key === 'line' || key === 'column' || key === 'type') continue;
      
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(childNode => walkNode(childNode, node));
      } else if (child && typeof child === 'object') {
        walkNode(child, node);
      }
    }
  }

  function countStatements(blockNode) {
    if (!blockNode || !blockNode.body) return 0;
    
    let count = 0;
    blockNode.body.forEach(stmt => {
      count++;
      if (stmt.type === NodeType.BLOCK_STATEMENT) {
        count += countStatements(stmt);
      }
    });
    return count;
  }

  function isInsideLoop(node, parent) {
    // Simplified loop detection - check if we're inside a while statement
    let current = parent;
    while (current) {
      if (current.type === NodeType.WHILE_STATEMENT || 
          current.type === NodeType.FOR_STATEMENT) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function isVariableUsed(varName, astNode) {
    // Simplified usage check - walk the AST to find identifier references
    function findUsage(node) {
      if (!node || typeof node !== 'object') return false;
      
      if (node.type === NodeType.IDENTIFIER && node.name === varName) {
        return true;
      }
      
      for (const key in node) {
        if (key === 'line' || key === 'column' || key === 'type') continue;
        
        const child = node[key];
        if (Array.isArray(child)) {
          if (child.some(childNode => findUsage(childNode))) return true;
        } else if (child && typeof child === 'object') {
          if (findUsage(child)) return true;
        }
      }
      return false;
    }
    
    return findUsage(astNode);
  }

  walkNode(ast);
  return issues;
}

function formatIssues(issues) {
  if (issues.length === 0) {
    return "No issues detected.";
  }

  return issues
    .map((issue) => {
      const location = issue.line && issue.column 
        ? ` at line ${issue.line}, column ${issue.column}`
        : '';
      return `[${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}${location}`;
    })
    .join("\n");
}

/**
 * Get analysis summary
 */
function getAnalysisSummary(issues) {
  const summary = {
    total: issues.length,
    security: issues.filter(i => i.type === 'security').length,
    performance: issues.filter(i => i.type === 'performance').length,
    style: issues.filter(i => i.type === 'style').length,
    complexity: issues.filter(i => i.type === 'complexity').length,
    error: issues.filter(i => i.type === 'error').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length
  };
  
  return summary;
}

export { parseJavaScript, analyzeCode, formatIssues, getAnalysisSummary };
