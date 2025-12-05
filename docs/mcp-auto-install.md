# MCP Auto-Installation Helper

The project ships with `scripts/install-mcp.js`, a guided installer that satisfies the automation guidelines outlined in `AGENTS.md`.

## Prerequisites
- Node.js 18+
- npm available in your shell
- Ensure dependencies are installed (`npm install`) so `@iarna/toml` is available to the script.

## Command
```bash
npm run mcp:install -- <mcp-name> [options]
```

### Supported MCP targets
| Target | Package | Official guide |
| ------ | ------- | -------------- |
| `playwright` | `@playwright/mcp` | https://github.com/microsoft/playwright-mcp |
| `brightdata` | `@brightdata/mcp` | https://github.com/brightdata/mcp |

The script can be extended by editing `MCP_REGISTRY` inside `scripts/install-mcp.js`.

## What the script does
1. Detects your operating system and whether you are running inside WSL.
2. Prints the official documentation URL and asks you to confirm you have reviewed it (`--force` skips the prompt).
3. Runs the platform-specific installation command (defaults cover Linux/WSL and macOS for now).
4. Updates `~/.codex/config.toml` with the correct `[mcp_servers.*]` entry. If the MCP needs credentials, placeholder values are written unless you pass real ones via `--set-ENV=value`.
5. Runs a basic sanity check on the installed MCP binary (e.g. `npx @playwright/mcp --help`).
6. Reminds you to run `env RUST_LOG="codex=debug" codex "/mcp"` to verify Codex integration manually.

## Options
| Option | Description |
| ------ | ----------- |
| `--dry-run` | Show all steps without executing the installation command. |
| `--skip-config` | Skip writing `~/.codex/config.toml`. |
| `--force` | Bypass the confirmation prompt for official docs (useful for CI). |
| `--set-ENV=value` | Override placeholder environment variables in the config (e.g. `--set-API_TOKEN=bd_real_key`). |

## Credential placeholders
For MCPs that require API keys (e.g. Bright Data), the script writes placeholder values such as `bd_your_api_key_here`. Replace them with valid credentials before using the MCP in Codex.

## Post-install checks
After the script succeeds:
1. Inspect the console output for the verification command’s status.
2. Run `env RUST_LOG="codex=debug" codex "/mcp"` to confirm Codex sees the new server.
3. Update environment variables in your shell or `.env` files so that subsequent sessions pick up real API keys.
