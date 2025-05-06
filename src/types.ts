/**
 * Represents a detected issue in the code
 */
export interface CodeIssue {
  type: "security" | "error" | "performance" | "style";
  severity: "low" | "medium" | "high";
  message: string;
  line: number;
  column: number;
}
