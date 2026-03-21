# Command Guardrail (GEMINI.md)

## Purpose
This MCP server acts as a defensive layer to prevent the execution of problematic shell commands, particularly focusing on common pitfalls in PowerShell and Git.

## Usage for Agents
- **Highly Recommended**: Before executing any complex command with `run_shell_command`, use `validate_command` to check for common syntax errors (e.g., using `&&` in PowerShell).
- This tool helps reduce trial-and-error by catching obvious mistakes before they reach the system.

## Guardrail Priorities
- Detect and flag `&&` in PowerShell contexts.
- Validate `git` and `npm` command arguments for common misuse.
- Ensure `gh` CLI commands have necessary non-interactive flags.
