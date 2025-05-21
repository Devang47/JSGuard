/**
 * Types of issues that can be detected in code
 */
export type IssueType = "security" | "error" | "performance" | "style";

/**
 * Severity levels for detected issues
 */
export type IssueSeverity = "high" | "medium" | "low";

/**
 * Interface representing a detected code issue
 */
export interface CodeIssue {
  /**
   * Type of issue (security, error, performance, style)
   */
  type: IssueType;

  /**
   * Severity of the issue (high, medium, low)
   */
  severity: IssueSeverity;

  /**
   * Human-readable description of the issue
   */
  message: string;

  /**
   * Line number where the issue was found
   */
  line: number;

  /**
   * Column number where the issue was found
   */
  column: number;
}
