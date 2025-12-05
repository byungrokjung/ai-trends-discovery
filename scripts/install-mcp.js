#!/usr/bin/env node
/**
 * MCP auto-installation helper.
 *
 * The script follows operational guidelines documented in AGENTS.md:
 *  - Detect the current execution environment (OS/WSL) before acting.
 *  - Surface official documentation links before attempting any installation.
 *  - Run the appropriate installation routine for the detected environment.
 *  - Provide config.toml scaffolding with placeholder API keys when required.
 *  - Suggest post-install verification (`codex "/mcp"`).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');
const TOML = require('@iarna/toml');

const MCP_REGISTRY = {
  playwright: {
    displayName: 'Playwright MCP',
    docsUrl: 'https://github.com/microsoft/playwright-mcp',
    packageName: '@playwright/mcp',
    configKey: 'playwright',
    config: {
      command: 'npx',
      args: ['@playwright/mcp@latest']
    },
    env: {},
    install: {
      linux: {
        command: 'npm',
        args: ['install', '-g', '@playwright/mcp']
      },
      darwin: {
        command: 'npm',
        args: ['install', '-g', '@playwright/mcp']
      }
    },
    verify: {
      command: 'npx',
      args: ['@playwright/mcp', '--help']
    }
  },
  brightdata: {
    displayName: 'Bright Data MCP',
    docsUrl: 'https://github.com/brightdata/mcp',
    packageName: '@brightdata/mcp',
    configKey: 'brightData',
    config: {
      command: 'npx',
      args: ['-y', '@brightdata/mcp']
    },
    env: {
      API_TOKEN: 'bd_your_api_key_here'
    },
    install: {
      linux: {
        command: 'npm',
        args: ['install', '-g', '@brightdata/mcp']
      },
      darwin: {
        command: 'npm',
        args: ['install', '-g', '@brightdata/mcp']
      }
    },
    verify: {
      command: 'npx',
      args: ['@brightdata/mcp', '--help']
    }
  }
};

async function main() {
  const { target, options } = parseArgs(process.argv.slice(2));
  if (!target) {
    printUsage();
    process.exit(1);
  }

  const mcp = MCP_REGISTRY[target];
  if (!mcp) {
    console.error(`❌ Unknown MCP "${target}". Supported options: ${Object.keys(MCP_REGISTRY).join(', ')}`);
    process.exit(1);
  }

  const environment = detectEnvironment();
  console.log('📟 Environment detection');
  console.log(`  • Platform: ${environment.platform}`);
  console.log(`  • Architecture: ${environment.arch}`);
  console.log(`  • WSL: ${environment.isWSL ? 'yes' : 'no'}`);

  const installTarget = environment.isWSL ? 'linux' : environment.platform;
  const installInstruction = mcp.install[installTarget];
  if (!installInstruction) {
    console.error(`❌ ${mcp.displayName} does not have an installation recipe for platform "${installTarget}".`);
    process.exit(1);
  }

  await confirmOfficialDocs(mcp.docsUrl, options);

  if (options['dry-run']) {
    console.log('🧪 Dry-run enabled. Installation command will not execute.');
  } else {
    runCommand(installInstruction.command, installInstruction.args, {
      stdio: 'inherit',
      env: process.env
    }, `${mcp.displayName} installation failed.`);
  }

  if (!options['skip-config']) {
    updateCodexConfig(mcp, options);
  } else {
    console.log('⚙️  Skipping config.toml update due to --skip-config flag.');
  }

  if (!options['dry-run']) {
    tryVerification(mcp);
  }

  console.log('✅ MCP auto-install routine completed.');
  console.log('ℹ️  After installation you can verify the Codex integration manually with:');
  console.log('    $ env RUST_LOG="codex=debug" codex "/mcp"');
}

function parseArgs(argv) {
  const options = {};
  const positional = [];

  argv.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value === undefined ? true : value;
    } else {
      positional.push(arg.toLowerCase());
    }
  });

  const target = positional[0];
  return { target, options };
}

function printUsage() {
  console.log('Usage: npm run mcp:install -- <mcp-name> [--dry-run] [--skip-config] [--force] [--set-ENV=value]');
  console.log('\nExamples:');
  console.log('  npm run mcp:install -- playwright');
  console.log('  npm run mcp:install -- brightdata --set-API_TOKEN=bd_real_key');
  console.log('  npm run mcp:install -- playwright --dry-run');
}

function detectEnvironment() {
  const platform = os.platform();
  const arch = os.arch();
  let isWSL = false;

  if (platform === 'linux') {
    try {
      const release = fs.readFileSync('/proc/version', 'utf8');
      if (release.toLowerCase().includes('microsoft')) {
        isWSL = true;
      }
    } catch (_) {
      // ignore
    }
  }

  return { platform, arch, isWSL };
}

async function confirmOfficialDocs(url, options) {
  console.log('📚 Official documentation');
  console.log(`  • ${url}`);

  if (options.force) {
    console.log('  • --force flag detected. Skipping interactive confirmation.');
    return;
  }

  const answer = await promptYesNo('Have you reviewed the official installation guide above? (yes/no) ');
  if (!answer) {
    console.log('Please review the documentation before retrying.');
    process.exit(0);
  }
}

function promptYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

function runCommand(command, args, options, errorMessage) {
  console.log(`🛠️  Executing: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, options);
  if (result.status !== 0) {
    console.error(`❌ ${errorMessage}`);
    process.exit(result.status || 1);
  }
}

function updateCodexConfig(mcp, options) {
  const home = os.homedir();
  const codexDir = path.join(home, '.codex');
  const configPath = path.join(codexDir, 'config.toml');

  if (!fs.existsSync(codexDir)) {
    fs.mkdirSync(codexDir, { recursive: true, mode: 0o700 });
  }

  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      config = TOML.parse(raw);
    } catch (error) {
      console.warn(`⚠️  Unable to parse existing config.toml (${error.message}). A new one will be created.`);
      config = {};
    }
  }

  if (!config.mcp_servers) {
    config.mcp_servers = {};
  }

  const envOverrides = extractEnvOverrides(options);
  const envConfig = Object.keys(mcp.env).length
    ? Object.fromEntries(Object.entries(mcp.env).map(([key, value]) => [key, envOverrides[key] || value]))
    : undefined;

  const serverConfig = {
    command: mcp.config.command,
    args: mcp.config.args
  };

  if (envConfig) {
    serverConfig.env = envConfig;
    Object.entries(mcp.env).forEach(([key, placeholder]) => {
      if (!envOverrides[key]) {
        console.log(`🔑 ${key} is set to placeholder value (${placeholder}). Replace it with your real credential.`);
      }
    });
  }

  config.mcp_servers[mcp.configKey] = serverConfig;

  const serialized = TOML.stringify(config);
  fs.writeFileSync(configPath, serialized, { mode: 0o600 });
  console.log(`📝 Codex config updated: ${configPath}`);
}

function extractEnvOverrides(options) {
  const overrides = {};
  Object.entries(options)
    .filter(([key]) => key.startsWith('set-'))
    .forEach(([key, value]) => {
      const envKey = key.replace(/^set-/i, '').toUpperCase();
      overrides[envKey] = value;
    });
  return overrides;
}

function tryVerification(mcp) {
  if (!mcp.verify) return;

  console.log('🔍 Running MCP binary sanity check...');
  const result = spawnSync(mcp.verify.command, mcp.verify.args, {
    stdio: 'inherit',
    env: process.env
  });

  if (result.status === 0) {
    console.log('✅ MCP binary responded successfully.');
  } else {
    console.warn('⚠️  MCP binary check exited with a non-zero code. Review the logs above.');
  }
}

main().catch(error => {
  console.error('❌ Unexpected failure:', error);
  process.exit(1);
});
