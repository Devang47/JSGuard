# JSGuard: JavaScript Static Code Analyzer

JSGuard is a static code analyzer for JavaScript designed to detect potential security vulnerabilities, coding errors, performance bottlenecks, style inconsistencies, and code complexity issues. It provides both a command-line interface (CLI) for local analysis and an API for integration into other tools or services, along with a web-based frontend for interactive code analysis.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Command-Line Usage](#command-line-usage)
- [API Endpoints](#api-endpoints)
- [Frontend Usage](#frontend-usage)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

JSGuard identifies a variety of issues in JavaScript code:

- **Security Vulnerabilities**
  - Detects common XSS (Cross-Site Scripting) sinks such as `element.innerHTML`, `element.outerHTML`, and `element.insertAdjacentHTML`.
  - Flags DOM-based vulnerabilities like `document.write()` and `document.writeln()`.
  - Warns against unsafe code execution via `eval()`, `new Function()`, and `setTimeout`/`setInterval` with string arguments.
  - Identifies insecure HTTP requests (e.g., `XMLHttpRequest.open` using `http://` instead of `https://`).
- **Coding Errors**
  - Detects implicit global variable declarations.
  - Flags unsafe equality comparisons (`==` or `!=`) and suggests using strict equality (`===` or `!==`).
- **Performance Issues**
  - Identifies unused variables.
  - Suggests using modern array methods (e.g., `forEach`, `map`, `filter`) over traditional `for` loops for arrays.
- **Style Violations**
  - Warns against the use of `var` and recommends `let` or `const` for better scoping.
- **Complexity Warnings**
  - Flags functions with a high number of statements (currently >30 statements) as potentially too complex and needing refactoring.
- **API Usage**
  - Detects insecure API usage patterns (if specific rules are implemented).

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd JSGuard
    ```
2.  Install dependencies for the main project:
    ```bash
    pnpm install
    ```
3.  Install dependencies for the frontend:
    ```bash
    cd frontend
    pnpm install
    cd ..
    ```

## Project Structure

```
JSGuard/
├── frontend/               # React-based frontend application
│   ├── public/
│   ├── src/
│   │   ├── App.jsx         # Main frontend component
│   │   └── main.jsx        # Frontend entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── src/                    # Source code for the analyzer and API
│   ├── api.js              # Express API server
│   ├── cli.js              # Command-line interface logic
│   ├── main.js             # Core analysis logic
│   └── types.js            # JSDoc type definitions (formerly TypeScript types)
├── .gitignore
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── sample.json             # Sample JSON payload for API testing
├── testing.js              # Sample JavaScript file for CLI testing
└── tsconfig.json
```

## Command-Line Usage

The CLI allows you to analyze JavaScript files directly from your terminal.

```bash
# Analyze a file and print results to stdout
jsguard path/to/your/file.js

# Analyze a file and save results to an output file
jsguard path/to/your/file.js -o report.txt
```

Example using the provided test file:

```bash
jsguard testing.js
```

## API Endpoints

JSGuard exposes an API for programmatic analysis.

### `POST /analyze`

Analyzes the provided JavaScript code.

**Request JSON:**

```json
{
  "code": "<JavaScript source code as a string>"
}
```

**Response JSON (Success):**

```json
{
  "issues": [
    {
      "type": "security", // e.g., "security", "error", "performance", "style", "complexity"
      "severity": "high", // e.g., "high", "medium", "low"
      "message": "Potential XSS vulnerability using innerHTML",
      "line": 10,
      "column": 5
    }
    // ... more issues
  ]
}
```

**Response JSON (Error):**

```json
{
  "error": "Error message describing the issue"
}
```

The API server runs on `http://localhost:3000` by default.

## Frontend Usage

JSGuard includes a React-based frontend for an interactive code analysis experience.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Start the Vite development server:
    ```bash
    pnpm run dev
    ```
3.  Open your browser and go to the URL provided by Vite (usually `http://localhost:5173`).

The frontend allows you to paste JavaScript code, send it to the backend API for analysis, and view the results categorized by issue type and severity.

## Development

To run the JSGuard components in development mode with hot-reloading:

1.  **API Server:**
    From the project root directory:

    ```bash
    pnpm run dev:api
    ```

    This will start the API server using `nodemon` on `http://localhost:3000`, directly running `src/api.js`.

2.  **CLI:**
    To test CLI changes, you can run it directly with `nodemon` (or `node` for a single run):

    ```bash
    pnpm run dev -- path/to/your/test.js
    ```

    This executes `src/cli.js` via the `dev` script in `package.json`.

3.  **Frontend:**
    Navigate to the `frontend` directory and run:
    ```bash
    pnpm run dev
    ```

## Testing

1.  **API Testing:**

    - Start the API server: `pnpm run dev:api`
    - Send a POST request to the `/analyze` endpoint. You can use `curl` with the `sample.json` file:
      ```bash
      curl -X POST http://localhost:3000/analyze \
        -H "Content-Type: application/json" \
        -d @sample.json
      ```

2.  **CLI Testing:**

    - Use the `dev` script to run the CLI with a test file:
      ```bash
      pnpm run dev -- testing.js
      ```
    - Verify the output in the console or the specified output file.

3.  **Frontend Testing:**
    - Run the frontend development server (`cd frontend && pnpm run dev`).
    - Open the frontend in your browser.
    - Paste code from `testing.js` or other samples into the editor and click "Analyze Code".
    - Verify that the results are displayed correctly.

## Contributing

Contributions are welcome! Please refer to the contribution guidelines (TODO: create CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
