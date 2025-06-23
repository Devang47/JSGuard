
// Test file for JSGuard static code analyzer

// Security issues
function securityIssues() {
  // XSS vulnerabilities
  document.getElementById("output").innerHTML = location.hash;
  element.outerHTML = "<div>" + userInput + "</div>";
  element.insertAdjacentHTML("beforeend", data);

  // Unsafe code execution
  eval("console.log('This is unsafe')");
  new Function("a", "b", "return a + b")();
  setTimeout("alert('Hello')", 100);

  // DOM-based vulnerabilities
  document.write("<script>" + userInput + "</script>");
}

// Coding errors
function codingErrors() {
  // Implicit global variables
  x = 10;

  // Unsafe comparisons
  if (userId == 123) {
    authorized = true;
  }

  if (role != "admin") {
    deny();
  }

  // Potential TypeError
  const user = getUserData();
  const name = user.name;
}

// Performance issues
function performanceIssues() {
  // Unused variables
  var unused = "This variable is never used";

  // Inefficient string concatenation in loop
  var result = "";
  for (var i = 0; i < 1000; i++) {
    result += "Item " + i;
  }

  // Traditional for loop instead of array methods
  for (var j = 0; j < array.length; j++) {
    console.log(array[j]);
  }
}

// Style issues
function styleIssues() {
  // Using var instead of let/const
  var message = "Hello world";

  for (var k = 0; k < 10; k++) {
    var insideLoop = k;
  }
}

// Extra large function to trigger complexity warning
function veryLargeFunction() {
  let x = 1;
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  console.log(x++);
  return x;
}

// Insecure HTTP requests
function makeRequest() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://example.com/api/data", true);
  xhr.send();
}

// This function is never called
function unusedFunction() {
  console.log("This function is never used");
}
