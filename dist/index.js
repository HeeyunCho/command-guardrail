import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({ name: "command-guardrail", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "validate_command",
                description: "Validates a shell command for common syntax errors and parameter mistakes to save time and prevent failed executions.",
                inputSchema: {
                    type: "object",
                    properties: {
                        command: { type: "string", description: "The full command string to validate." }
                    },
                    required: ["command"],
                },
            }
        ],
    };
});
function checkCommand(fullCommand) {
    const cmd = fullCommand.trim();
    // Check for PowerShell specific && error
    if (cmd.includes(" && ")) {
        return {
            isValid: false,
            reason: "PowerShell does not support '&&' as a command separator by default.",
            suggestion: "Use ';' or execute commands separately."
        };
    }
    // Git checks
    if (cmd.startsWith("git ")) {
        if (cmd.includes(" -rf ")) {
            return { isValid: false, reason: "Git 'rm' uses '-r' but not usually '-rf' in standard workflows, check if you meant 'rm -rf' outside git.", suggestion: "git rm -r <path>" };
        }
        if (cmd.includes("push") && !cmd.includes("origin") && !cmd.includes("HEAD")) {
            return { isValid: true, reason: "Command looks okay but ensure remote and branch are specified if not using tracking branches." };
        }
    }
    // gh checks
    if (cmd.includes("gh ") || cmd.includes("gh.exe")) {
        if (cmd.includes("repo create") && !cmd.includes("--public") && !cmd.includes("--private")) {
            return { isValid: false, reason: "GitHub CLI 'repo create' usually requires visibility flag (--public or --private) when run non-interactively.", suggestion: "Add --public or --private flag." };
        }
    }
    // npm checks
    if (cmd.startsWith("npm ")) {
        if (cmd.includes("install") && cmd.includes("-rf")) {
            return { isValid: false, reason: "npm install does not use -rf.", suggestion: "Did you mean 'rm -rf node_modules && npm install'?" };
        }
    }
    return { isValid: true };
}
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "validate_command") {
        const command = request.params.arguments.command;
        const result = checkCommand(command);
        if (result.isValid) {
            return {
                content: [{ type: "text", text: `✅ Command "${command}" passed basic guardrail checks.${result.reason ? ` Note: ${result.reason}` : ""}` }]
            };
        }
        else {
            return {
                content: [{ type: "text", text: `❌ Command Error Detected:\nCommand: "${command}"\nReason: ${result.reason}\nSuggestion: ${result.suggestion}` }],
                isError: true
            };
        }
    }
    throw new Error("Tool not found");
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
