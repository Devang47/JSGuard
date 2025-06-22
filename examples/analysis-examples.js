// This file demonstrates code patterns that JSGuard will analyze and flag

// ========================================
// SECURITY ISSUES (HIGH SEVERITY)
// ========================================

// Code injection vulnerabilities
function securityIssues() {
  // eval() usage - FLAGGED
  eval("alert('dangerous')");
  
  // Function constructor - FLAGGED  
  new Function("return alert('xss')")();
  
  // setTimeout with string - FLAGGED
  setTimeout("maliciousCode()", 1000);
  
  // setInterval with string - FLAGGED
  setInterval("executeEverySecond()", 1000);
}

// XSS vulnerabilities
function xssVulnerabilities() {
  var userInput = getUserInput();
  
  // innerHTML assignment - FLAGGED
  document.getElementById("content").innerHTML = userInput;
  
  // outerHTML assignment - FLAGGED  
  element.outerHTML = htmlContent;
  
  // document.write usage - FLAGGED
  document.write(userContent);
  
  // document.writeln usage - FLAGGED
  document.writeln(moreContent);
}

// Insecure network requests
function networkSecurity() {
  var xhr = new XMLHttpRequest();
  
  // HTTP instead of HTTPS - FLAGGED
  xhr.open("GET", "http://api.example.com/data");
  
  // This would be OK (not flagged)
  xhr.open("GET", "https://secure-api.example.com/data");
}

// ========================================
// CODING ERRORS (MEDIUM SEVERITY)  
// ========================================

// Unsafe equality comparisons
function equalityIssues() {
  var x = "5";
  var y = 5;
  
  // Type-coercing equality - FLAGGED
  if (x == y) {
    console.log("This will be flagged");
  }
  
  // Type-coercing inequality - FLAGGED  
  if (x != y) {
    console.log("This will also be flagged");
  }
  
  // Strict equality - OK (not flagged)
  if (x === y) {
    console.log("This is fine");
  }
}

// Implicit global variables
function implicitGlobals() {
  // Assignment without declaration - FLAGGED
  undeclaredVariable = "creates global";
  
  // Property assignment to undeclared - FLAGGED
  someObject.property = "might be global";
}

// ========================================
// STYLE VIOLATIONS (MEDIUM SEVERITY)
// ========================================

// Variable declaration style
function styleIssues() {
  // var usage - FLAGGED (should use let/const)
  var oldStyle = "avoid this";
  
  // Preferred modern style - OK
  let newStyle = "better";
  const CONSTANT_VALUE = "best for constants";
}

// ========================================
// PERFORMANCE ISSUES (LOW-MEDIUM SEVERITY)
// ========================================

// Unused variables
function unusedVariables() {
  var used = "this is referenced";
  var unused = "this is never used"; // FLAGGED
  
  console.log(used); // This makes 'used' not flagged
}

// String concatenation (would be flagged if in loop)
function stringConcatenation() {
  var result = "";
  
  // This assignment pattern would be flagged if inside a loop
  result += "appended text";
  
  return result;
}

// ========================================
// COMPLEXITY ISSUES (MEDIUM SEVERITY)
// ========================================

// Large function (would be flagged if >30 statements)
function largeFunction() {
  // This function would need more than 30 statements
  // to trigger the complexity warning
  
  var statement1 = 1;
  var statement2 = 2;
  var statement3 = 3;
  var statement4 = 4;
  var statement5 = 5;
  
  // ... continue with more statements to reach the threshold
  
  return "complex function";
}

// ========================================
// REAL-WORLD VULNERABLE PATTERNS
// ========================================

// Typical XSS vulnerability
function renderUserContent(userData) {
  var container = document.getElementById("user-content");
  
  // DANGEROUS: Direct HTML injection - FLAGGED
  container.innerHTML = "<h1>Welcome " + userData.name + "</h1>";
  
  // SAFER: Use textContent instead
  // container.textContent = "Welcome " + userData.name;
}

// Typical code injection vulnerability  
function dynamicCodeExecution(userFormula) {
  var result;
  
  // DANGEROUS: User input to eval - FLAGGED
  result = eval("calculate(" + userFormula + ")");
  
  return result;
}

// Mixed security and style issues
function mixedIssues() {
  // Style issue: var usage - FLAGGED
  var userInput = prompt("Enter code");
  
  // Security issue: eval usage - FLAGGED  
  eval(userInput);
  
  // Error issue: unsafe equality - FLAGGED
  if (userInput == "admin") {
    // Security issue: innerHTML - FLAGGED
    document.body.innerHTML = "<h1>Admin Panel</h1>";
  }
}

// ========================================
// PATTERNS THAT WON'T BE FLAGGED
// ========================================

function goodPractices() {
  // Modern variable declarations - OK
  const API_URL = "https://secure-api.com";
  let userData = null;
  
  // Strict equality - OK
  if (userData === null) {
    userData = fetchUserData();
  }
  
  // Safe DOM manipulation - OK
  const element = document.getElementById("safe");
  element.textContent = "Safe content";
  
  // Secure network request - OK
  fetch(API_URL).then(response => response.json());
  
  // Function calls without dangerous patterns - OK
  console.log("Debugging info");
  Math.random();
  parseInt("123", 10);
}
