import { existsSync, rmSync } from 'node:fs';
import { Vault } from '@aifacet/vault';
import { getConfigPath, initConfigIfNeeded, loadConfig, saveConfig } from './config.js';
import { serverStatus, startServer, stopServer } from './daemon.js';
import { SEED_CONSTITUTION, SEED_FACETS, SEED_POLICIES } from './seed-data.js';

function resetVault(vaultPath: string): void {
  if (existsSync(vaultPath)) {
    rmSync(vaultPath, { recursive: true, force: true });
    console.log(`Vault destroyed: ${vaultPath}`);
  } else {
    console.log(`No vault found at: ${vaultPath}`);
  }
}

function seedVault(vault: Vault): void {
  for (const facet of SEED_FACETS) {
    vault.addFacet(facet);
  }
  for (const rule of SEED_CONSTITUTION) {
    vault.addConstitutionalRule(rule);
  }
  for (const policy of SEED_POLICIES) {
    vault.addPolicy(policy);
  }

  const ctx = vault.getContext();
  console.log('Vault seeded successfully:');
  console.log(`  Facets:       ${ctx.facets.length}`);
  console.log(`  Constitution: ${ctx.constitution.length} rules`);
  console.log(`  Policies:     ${ctx.policies.length}`);

  const categories = [...new Set(ctx.facets.map((f) => f.category))];
  for (const cat of categories) {
    const count = ctx.facets.filter((f) => f.category === cat).length;
    console.log(`    ${cat}: ${count} facets`);
  }
}

function openVault(argv: string[]): Vault {
  const config = loadConfig(argv);
  return Vault.open({ storagePath: config.vaultPath, passphrase: config.passphrase });
}

function printHelp(): void {
  console.log('Usage: aifacet <command>');
  console.log('');
  console.log('Server:');
  console.log('  start                        Start the MCP server (background)');
  console.log('  stop                         Stop the MCP server');
  console.log('  restart                      Restart the MCP server');
  console.log('');
  console.log('Vault:');
  console.log('  status                       Show vault and server status');
  console.log('  facets [category]            List facets (optionally by category)');
  console.log('  check <provider>             Show what a provider is authorized to see');
  console.log('  add <category> <key> <value> Add a facet');
  console.log('  seed [--reset]               Load sample profile into vault');
  console.log('  reset                        Destroy and recreate empty vault');
  console.log('');
  console.log('Config:');
  console.log('  config                       Show current configuration');
  console.log('  config set <key> <value>     Update a configuration value');
  console.log('');
  console.log('Config keys: passphrase, vaultPath, port, https, tlsCert, tlsKey, logFile');
}

function handleStatus(args: string[]): void {
  const vault = openVault(args);
  const ctx = vault.getContext();
  console.log('AIFacet Context Vault');
  console.log(`  ID:           ${ctx.id}`);
  console.log(`  Version:      ${ctx.version}`);
  console.log(`  Facets:       ${ctx.facets.length}`);
  console.log(`  Policies:     ${ctx.policies.length}`);
  console.log(`  Constitution: ${ctx.constitution.length}`);
  console.log(`  Created:      ${ctx.createdAt}`);
  console.log(`  Updated:      ${ctx.updatedAt}`);
  console.log('');
  serverStatus();
}

function handleAdd(args: string[]): void {
  const category = args[1];
  const key = args[2];
  const value = args[3];
  if (!category || !key || !value) {
    console.error('Usage: aifacet add <category> <key> <value>');
    process.exit(1);
  }
  const vault = openVault(args);
  vault.addFacet({
    category,
    key,
    value,
    meta: {
      updatedAt: new Date().toISOString(),
      source: 'self-reported',
      confidence: 1.0,
      accessLevel: 'full',
    },
  });
  console.log(`Added facet: ${category}/${key}`);
}

function handleSeed(args: string[]): void {
  const seedConfig = loadConfig(args);
  if (args.includes('--reset')) {
    resetVault(seedConfig.vaultPath);
  }
  const vault = openVault(args);
  seedVault(vault);
}

function handleReset(args: string[]): void {
  const config = loadConfig(args);
  resetVault(config.vaultPath);
  Vault.open({ storagePath: config.vaultPath, passphrase: config.passphrase });
  console.log(`Empty vault created at: ${config.vaultPath}`);
}

function handleConfigSet(args: string[]): void {
  const key = args[2];
  const value = args[3];
  if (!key || value === undefined) {
    console.error('Usage: aifacet config set <key> <value>');
    process.exit(1);
  }
  const config = loadConfig();
  if (!(key in config)) {
    console.error(`Unknown config key: ${key}`);
    console.error('Valid keys: passphrase, vaultPath, port, https, tlsCert, tlsKey, logFile');
    process.exit(1);
  }
  const record = config as unknown as Record<string, unknown>;
  if (key === 'port') {
    record[key] = Number(value);
  } else if (key === 'https') {
    record[key] = value === 'true';
  } else {
    record[key] = value;
  }
  saveConfig(config);
  console.log(`Config updated: ${key} = ${value}`);
}

function handleConfigShow(): void {
  const config = loadConfig();
  console.log(`AIFacet Configuration (${getConfigPath()})`);
  console.log('');
  for (const [k, v] of Object.entries(config)) {
    const display = k === 'passphrase' ? '********' : String(v);
    console.log(`  ${k}: ${display}`);
  }
}

function handleConfig(args: string[]): void {
  if (args[1] === 'set') {
    handleConfigSet(args);
  } else {
    handleConfigShow();
  }
}

function handleCheck(args: string[]): void {
  const providerId = args[1];
  if (!providerId) {
    console.error('Usage: aifacet check <provider>');
    console.error('Example: aifacet check chatgpt');
    process.exit(1);
  }
  const vault = openVault(args);
  const all = vault.getFacets();
  const authorized = vault.getAuthorizedFacets(providerId);
  const blocked = all.filter(
    (f) => !authorized.some((a) => a.category === f.category && a.key === f.key),
  );

  const categories = (facets: ReadonlyArray<{ category: string; key: string }>) => {
    const grouped: Record<string, string[]> = {};
    for (const f of facets) {
      const list = grouped[f.category] ?? [];
      list.push(f.key);
      grouped[f.category] = list;
    }
    return grouped;
  };

  console.log(`Provider: ${providerId}`);
  console.log(
    `Total facets: ${all.length} | Visible: ${authorized.length} | Blocked: ${blocked.length}`,
  );
  console.log('');

  const visible = categories(authorized);
  if (Object.keys(visible).length > 0) {
    console.log('VISIBLE:');
    for (const [cat, keys] of Object.entries(visible)) {
      console.log(`  ${cat}: ${keys.join(', ')}`);
    }
  }

  console.log('');
  const hidden = categories(blocked);
  if (Object.keys(hidden).length > 0) {
    console.log('BLOCKED:');
    for (const [cat, keys] of Object.entries(hidden)) {
      console.log(`  ${cat}: ${keys.join(', ')}`);
    }
  }
}

const commands: Record<string, (args: string[]) => void> = {
  start: (args) => startServer(args),
  stop: () => stopServer(),
  restart: (args) => {
    stopServer();
    setTimeout(() => startServer(args), 500);
  },
  status: handleStatus,
  facets: (args) => {
    const vault = openVault(args);
    console.log(JSON.stringify(vault.getFacets(args[1]), null, 2));
  },
  check: handleCheck,
  add: handleAdd,
  seed: handleSeed,
  reset: handleReset,
  config: handleConfig,
};

function main(): void {
  const args = process.argv.slice(2);
  initConfigIfNeeded();

  const handler = commands[args[0] ?? ''];
  if (handler) {
    handler(args);
  } else {
    printHelp();
  }
}

main();
