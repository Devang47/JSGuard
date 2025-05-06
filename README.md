# JS Guard

JSGuard is a static code analyzer for JavaScript that detects potential security vulnerabilities, coding errors, performance issues, style violations, complexity warnings, and insecure API usage.

## Features

- **Security Vulnerabilities**

  - XSS sinks: `innerHTML`, `outerHTML`, `insertAdjacentHTML`
  - DOM-based risks: `document.write`, `writeln`
  - Unsafe code execution: `eval`, `Function` constructor, `setTimeout`/`setInterval` with strings
  - Insecure HTTP requests: use of `http://` in `XMLHttpRequest.open`

- **Coding Errors**

  - Implicit global variables
  - Unsafe comparisons: `==`/`!=`
  - Potential `TypeError`: unchecked member access

- **Performance Issues**

  - Inefficient string concatenation inside loops
  - Unused variables
  - Traditional `for` loops over arrays instead of `.forEach()`, `.map()`, etc.

- **Style Violations**

  - Usage of `var` instead of `let`/`const`

- **Complexity Warnings**
  - Functions with over 30 statements flagged for refactoring

## Command-Line Usage

```bash
# analyze a file and print to stdout
jsguard path/to/file.js

# save results to an output file
jsguard src/index.js -o report.txt
```

## API Endpoints

POST `/analyze`

Request JSON:

```json
{
  "code": "<JavaScript source as string>"
}
```

Response JSON:

```json
{
  "issues": [
    {
      "type": "security",
      "severity": "high",
      "message": "Potential XSS vulnerability using innerHTML",
      "line": 10,
      "column": 5
    },
    ...
  ]
}
```

## Testing

1. Start the API server in dev mode:
   ```bash
   npm run dev:api
   ```
2. Send a sample payload:
   ```bash
   curl -X POST http://localhost:3000/analyze \
     -H "Content-Type: application/json" \
     -d @sample.json
   ```
3. Run CLI tests:
   ```bash
   pnpm run dev -- path/to/your/test.js
   ```
4. Verify output and summary printed in console or saved file.
