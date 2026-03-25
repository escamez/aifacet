import { existsSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Vault } from '@aime/vault';
import { SEED_CONSTITUTION, SEED_FACETS, SEED_POLICIES } from './seed-data.js';

const DEFAULT_VAULT_PATH = join(homedir(), '.aime', 'vault');

function getVaultConfig(): { passphrase: string; vaultPath: string } {
  return {
    passphrase: process.env.AIME_PASSPHRASE ?? 'default-dev-passphrase',
    vaultPath: process.env.AIME_VAULT_PATH ?? DEFAULT_VAULT_PATH,
  };
}

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
  console.log(`Vault seeded successfully:`);
  console.log(`  Facets:       ${ctx.facets.length}`);
  console.log(`  Constitution: ${ctx.constitution.length} rules`);
  console.log(`  Policies:     ${ctx.policies.length}`);

  const categories = [...new Set(ctx.facets.map((f) => f.category))];
  for (const cat of categories) {
    const count = ctx.facets.filter((f) => f.category === cat).length;
    console.log(`    ${cat}: ${count} facets`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];
  const { passphrase, vaultPath } = getVaultConfig();

  switch (command) {
    case 'status': {
      const vault = Vault.open({ storagePath: vaultPath, passphrase });
      const ctx = vault.getContext();
      console.log(`AIME Context Vault`);
      console.log(`  ID:           ${ctx.id}`);
      console.log(`  Version:      ${ctx.version}`);
      console.log(`  Facets:       ${ctx.facets.length}`);
      console.log(`  Policies:     ${ctx.policies.length}`);
      console.log(`  Constitution: ${ctx.constitution.length}`);
      console.log(`  Created:      ${ctx.createdAt}`);
      console.log(`  Updated:      ${ctx.updatedAt}`);
      break;
    }
    case 'facets': {
      const vault = Vault.open({ storagePath: vaultPath, passphrase });
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
      const vault = Vault.open({ storagePath: vaultPath, passphrase });
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
      const doReset = args.includes('--reset');
      if (doReset) {
        resetVault(vaultPath);
      }
      const vault = Vault.open({ storagePath: vaultPath, passphrase });
      seedVault(vault);
      break;
    }
    case 'reset': {
      resetVault(vaultPath);
      Vault.open({ storagePath: vaultPath, passphrase });
      console.log(`Empty vault created at: ${vaultPath}`);
      break;
    }
    default:
      console.log('Usage: aime <command>');
      console.log('');
      console.log('Commands:');
      console.log('  status                       Show vault status');
      console.log('  facets [category]            List facets (optionally by category)');
      console.log('  add <category> <key> <value> Add a facet');
      console.log('  seed [--reset]               Load sample profile into vault');
      console.log('  reset                        Destroy and recreate empty vault');
      break;
  }
}

main();
