import { randomUUID } from 'node:crypto';
import type { ConsentPolicy, ConstitutionalRule, Facet, HumanContext } from '@aifacet/schema';
import { createEmptyContext } from '@aifacet/schema';
import { EncryptedStorage } from './storage.js';

const CONTEXT_FILENAME = 'context.vault';

export interface VaultOptions {
  readonly storagePath: string;
  readonly passphrase: string;
}

/**
 * The Vault is the primary interface for managing a user's context.
 * It handles encrypted persistence, facet management, and consent enforcement.
 */
export class Vault {
  private readonly storage: EncryptedStorage;
  private readonly passphrase: string;
  private context: HumanContext;

  private constructor(storage: EncryptedStorage, passphrase: string, context: HumanContext) {
    this.storage = storage;
    this.passphrase = passphrase;
    this.context = context;
  }

  /**
   * Opens an existing vault or creates a new one.
   */
  static async open(options: VaultOptions): Promise<Vault> {
    const storage = new EncryptedStorage({ basePath: options.storagePath });

    let context: HumanContext;
    if (storage.exists(CONTEXT_FILENAME)) {
      const raw = await storage.read(CONTEXT_FILENAME, options.passphrase);
      context = JSON.parse(raw) as HumanContext;
    } else {
      const id = randomUUID();
      context = createEmptyContext(id);
      await storage.write(CONTEXT_FILENAME, JSON.stringify(context), options.passphrase);
    }

    return new Vault(storage, options.passphrase, context);
  }

  getContext(): HumanContext {
    return this.context;
  }

  /**
   * Adds a facet to the context. If a facet with the same category+key
   * already exists, it is replaced.
   */
  async addFacet(facet: Facet): Promise<void> {
    const filtered = this.context.facets.filter(
      (f) => !(f.category === facet.category && f.key === facet.key),
    );
    this.context = {
      ...this.context,
      facets: [...filtered, facet],
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
  }

  /**
   * Removes a facet by category and key.
   */
  async removeFacet(category: string, key: string): Promise<boolean> {
    const before = this.context.facets.length;
    const filtered = this.context.facets.filter((f) => !(f.category === category && f.key === key));
    if (filtered.length === before) return false;

    this.context = {
      ...this.context,
      facets: filtered,
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
    return true;
  }

  /**
   * Returns all facets, optionally filtered by category.
   */
  getFacets(category?: string): ReadonlyArray<Facet> {
    if (!category) return this.context.facets;
    return this.context.facets.filter((f) => f.category === category);
  }

  /**
   * Adds a consent policy.
   */
  async addPolicy(policy: ConsentPolicy): Promise<void> {
    this.context = {
      ...this.context,
      policies: [...this.context.policies, policy],
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
  }

  /**
   * Adds a constitutional rule (immutable user-defined meta-policy).
   */
  async addConstitutionalRule(rule: ConstitutionalRule): Promise<void> {
    this.context = {
      ...this.context,
      constitution: [...this.context.constitution, rule],
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
  }

  /**
   * Returns facets visible to a given provider, applying consent policies
   * and constitutional rules.
   */
  getAuthorizedFacets(providerId: string): ReadonlyArray<Facet> {
    return this.context.facets.filter((facet) => {
      const constitutionalBlock = this.context.constitution.some(
        (rule) => rule.facetCategory === facet.category && rule.maxAccessLevel === 'hidden',
      );
      if (constitutionalBlock) return false;

      const denied = this.context.policies.some(
        (p) =>
          p.facetCategory === facet.category &&
          (p.grantedTo === providerId || p.grantedTo === undefined) &&
          (p.accessLevel === 'denied' || p.accessLevel === 'hidden'),
      );
      if (denied) return false;

      if (facet.meta.accessLevel === 'hidden' || facet.meta.accessLevel === 'denied') {
        return false;
      }

      return true;
    });
  }

  private async persist(): Promise<void> {
    await this.storage.write(CONTEXT_FILENAME, JSON.stringify(this.context), this.passphrase);
  }
}
