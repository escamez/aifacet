import { homedir } from 'node:os';
import { join } from 'node:path';
import { Vault } from '@aime/vault';

const DEFAULT_VAULT_PATH = join(homedir(), '.aime', 'vault');

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];
  const passphrase = process.env.AIME_PASSPHRASE ?? 'default-dev-passphrase';
  const vaultPath = process.env.AIME_VAULT_PATH ?? DEFAULT_VAULT_PATH;

  const vault = Vault.open({ storagePath: vaultPath, passphrase });

  switch (command) {
    case 'status': {
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
    default:
      console.log('Usage: aime <command>');
      console.log('');
      console.log('Commands:');
      console.log('  status          Show vault status');
      console.log('  facets [cat]    List facets (optionally by category)');
      console.log('  add <cat> <key> <value>  Add a facet');
      break;
  }
}

main();
