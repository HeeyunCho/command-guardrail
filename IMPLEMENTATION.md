# IMPLEMENTATION: Command Guardrail

## Overview
A validation server that uses static command analysis to identify potential issues before execution.

## Tools (Methods)

### 1. `validate_command`
**Description**: Analyzes a command string against a set of rules.
- **Parameters**:
  - `command` (string): The full command string.
- **Returns**: A validation result with `isValid`, `reason`, and `suggestion`.

## Validation Logic
- **PowerShell**: Flags usage of `&&`, recommending `;` or separate execution.
- **Git**: Warns about unconventional `git rm -rf` and missing push targets.
- **GitHub CLI (gh)**: Detects missing visibility flags in `repo create`.
- **NPM**: Identifies incorrect flag combinations (e.g., `npm install -rf`).
