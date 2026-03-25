import { existsSync, rmSync } from 'node:fs';
import { Vault } from '@aime/vault';
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
  console.log('Usage: aime <command>');
  console.log('');
  console.log('Server:');
  console.log('  start                        Start the MCP server (background)');
  console.log('  stop                         Stop the MCP server');
  console.log('  restart                      Restart the MCP server');
  console.log('');
  console.log('Vault:');
  console.log('  status                       Show vault and server status');
  console.log('  facets [category]            List facets (optionally by category)');
  console.log('  add <category> <key> <value> Add a facet');
  console.log('  seed [--reset]               Load sample profile into vault');
  console.log('  reset                        Destroy and recreate empty vault');
  console.log('');
  console.log('Config:');
  console.log('  config                       Show current configuration');
  console.log('  config set <key> <value>     Update a configuration value');
  console.log('');
  console.log('Config keys: passphrase, vaultPath, port, https, tlsCert, tlsKey');
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  // Ensure config file exists on first run
  initConfigIfNeeded();

  switch (command) {
    // --- Server commands ---
    case 'start': {
      startServer(args);
      break;
    }
    case 'stop': {
      stopServer();
      break;
    }
    case 'restart': {
      stopServer();
      setTimeout(() => startServer(args), 500);
      break;
    }

    // --- Vault commands ---
    case 'status': {
      const vault = openVault(args);
      const ctx = vault.getContext();
      console.log('AIME Context Vault');
      console.log(`  ID:           ${ctx.id}`);
      console.log(`  Version:      ${ctx.version}`);
      console.log(`  Facets:       ${ctx.facets.length}`);
      console.log(`  Policies:     ${ctx.policies.length}`);
      console.log(`  Constitution: ${ctx.constitution.length}`);
      console.log(`  Created:      ${ctx.createdAt}`);
      console.log(`  Updated:      ${ctx.updatedAt}`);
      console.log('');
      serverStatus();
      break;
    }
    case 'facets': {
      const vault = openVault(args);
      const category = args[1];
      const facets = vault.getFacets(category);
      console.log(JSON.stringify(facets, null, 2));
      break;
    }
    case 'add': {
      const category = args[1];
      const key = args[2];
      const value = args[3];
      if (!category || !key || !value) {
        console.error('Usage: aime add <category> <key> <value>');
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
      break;
    }
    case 'seed': {
      const seedConfig = loadConfig(args);
      const doReset = args.includes('--reset');
      if (doReset) {
        resetVault(seedConfig.vaultPath);
      }
      const vault = openVault(args);
      seedVault(vault);
      break;
    }
    case 'reset': {
      const resetConfig = loadConfig(args);
      resetVault(resetConfig.vaultPath);
      Vault.open({ storagePath: resetConfig.vaultPath, passphrase: resetConfig.passphrase });
      console.log(`Empty vault created at: ${resetConfig.vaultPath}`);
      break;
    }

    // --- Config commands ---
    case 'config': {
      const subcommand = args[1];
      if (subcommand === 'set') {
        const key = args[2];
        const value = args[3];
        if (!key || value === undefined) {
          console.error('Usage: aime config set <key> <value>');
          process.exit(1);
        }
        const config = loadConfig();
        if (!(key in config)) {
          console.error(`Unknown config key: ${key}`);
          console.error('Valid keys: passphrase, vaultPath, port, https, tlsCert, tlsKey');
          process.exit(1);
        }
        // Type coercion for non-string fields
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
      } else {
        const config = loadConfig();
        console.log(`AIME Configuration (${getConfigPath()})`);
        console.log('');
        for (const [k, v] of Object.entries(config)) {
          const display = k === 'passphrase' ? '********' : String(v);
          console.log(`  ${k}: ${display}`);
        }
      }
      break;
    }

    default:
      printHelp();
      break;
  }
}

main();
