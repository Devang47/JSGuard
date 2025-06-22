// Variable declarations - all supported
var oldStyle = "should avoid";
let modernStyle = "preferred";
const CONSTANT = 42;

// Multiple declarations
var a = 1, b = 2, c;
let x, y = "hello", z = true;

// Function declarations - fully supported
function simpleFunction() {
  return "basic function";
}

function withParameters(param1, param2, param3) {
  var result = param1 + param2;
  return result;
}

// Function calls - all patterns supported
simpleFunction();
withParameters(1, 2, 3);

// Member access - dot notation
console.log("debug message");
document.write("dangerous");
element.innerHTML = userInput;

// Member access - bracket notation  
obj["property"];
array[0];
data[key];

// Binary expressions - left-to-right parsing
var sum = 5 + 3;
var comparison = x == y;  // Will be flagged
var strictComparison = x === y;
var logical = a && b || c;

// Assignment expressions
x = 42;
obj.prop = "value"; 
arr[0] = newValue;

// String concatenation (will be flagged in loops)
result += "text";

// Dangerous patterns that will be detected
eval(userCode);
setTimeout("malicious()", 1000);
new Function("return alert('xss')")();

// XSS vulnerabilities
document.getElementById("target").innerHTML = untrustedData;
element.outerHTML = htmlString;

// Insecure HTTP
xhr.open("GET", "http://insecure-api.com/data");

// Block statements
{
  let blockScoped = "works";
  var functionScoped = "also works";
}

// Nested function calls and member access
obj.method().property;
data.items[0].name;
api.fetch("url").then(callback);

// Complex expressions the parser handles
var complex = obj.data[key].method(arg1, arg2).result;
target.style.display = visible ? "block" : "none";

// Parenthesized expressions
var calculated = (a + b) * (c - d);
var condition = (x > 0) && (y < 100);

// Mixed patterns
function processData(input) {
  var processed = "";
  var item = input.data[0];
  
  if (item.validate()) {
    processed = item.name + ": " + item.value;
    logger.info(processed);
  }
  
  return processed;
}

// Security issues the analyzer will catch
function vulnerableCode() {
  // Code injection
  eval("user input");
  
  // XSS vulnerabilities  
  document.body.innerHTML = userContent;
  
  // Insecure DOM methods
  document.write(htmlContent);
  
  // String-based timers
  setTimeout("executeCode()", delay);
}

// Performance issues that will be flagged
function performanceIssues() {
  var result = "";
  
  // This would be flagged if inside a loop context
  result += "concatenation";
  
  // Unused variable (will be detected)
  var unused = "never referenced";
}

// Style issues
function styleIssues() {
  var oldWay = "flagged";  // Use let/const instead
  
  if (value == "5") {      // Use === instead
    return true;
  }
  
  return false;
}

// Complex function (will be flagged if >30 statements)
function largeFunction() {
  var stmt1 = 1;
  var stmt2 = 2;
  var stmt3 = 3;
  // ... would need 30+ statements to trigger complexity warning
}
