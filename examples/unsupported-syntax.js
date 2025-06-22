// ❌ These JavaScript features are NOT supported by the minimal parser
// The parser will either skip them or treat them as unknown tokens

// Arrow functions - not supported
const arrow = () => {
  return "not parsed correctly";
};

// Classes - not supported  
class MyClass {
  constructor() {
    this.value = 42;
  }
  
  method() {
    return this.value;
  }
}

// Template literals - not supported
const template = `Hello ${name}, you have ${count} messages`;

// Destructuring - not supported
const {name, age} = person;
const [first, second] = array;

// Spread operator - not supported
const newArray = [...oldArray, newItem];
const newObj = {...oldObj, newProp: value};

// Object/Array literals - not supported
const obj = {
  key1: "value1",
  key2: "value2",
  method: function() { return "hello"; }
};

const arr = [1, 2, 3, "hello", true];

// For/while loops - simplified parsing only
for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}

while (condition) {
  doSomething();
}

// Try/catch - not supported
try {
  riskyOperation();
} catch (error) {
  handleError(error);
} finally {
  cleanup();
}

// Switch statements - not supported
switch (value) {
  case 1:
    return "one";
  case 2:
    return "two";
  default:
    return "other";
}

// If/else statements - not supported
if (condition) {
  doSomething();
} else if (otherCondition) {
  doOtherThing();
} else {
  doDefault();
}

// Return statements - not supported
function example() {
  return value;
}

// Modern ES6+ features - not supported
async function asyncExample() {
  const result = await fetch(url);
  return result.json();
}

function* generator() {
  yield 1;
  yield 2;
  yield 3;
}

// Import/export - not supported
import { something } from './module.js';
export default myFunction;
export { namedExport };

// Regular expressions - not supported
const regex = /pattern/gi;
const match = text.match(regex);

// This operator - not supported 
const result = condition ? valueIfTrue : valueIfFalse;
