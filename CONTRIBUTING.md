# Contributing to AIFacet

Thank you for your interest in contributing to AIFacet. This project aims to give individuals ownership and cryptographic control over their personal AI context. Every contribution strengthens this mission.

## License

AIFacet is licensed under the [European Union Public Licence v1.2 (EUPL-1.2)](./LICENSE). By contributing, you agree that your contributions will be licensed under the same terms.

## Developer Certificate of Origin (DCO)

All contributions must be signed off using the [Developer Certificate of Origin](https://developercertificate.org/) (DCO). This certifies that you have the right to submit the contribution under the project's licence.

Add a sign-off line to every commit:

```
Signed-off-by: Your Name <your.email@example.com>
```

You can do this automatically with `git commit -s`.

If you forget, you can amend your last commit:

```bash
git commit --amend -s
```

## Getting Started

```bash
# Fork and clone the repository
git clone https://github.com/<your-user>/aifacet.git
cd aifacet

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
AIFACET_PASSPHRASE=test pnpm test

# Lint
pnpm lint
```

## Development Workflow

1. **Create a branch** from `main` for your work
2. **Make your changes** following the code standards below
3. **Write tests** for new functionality
4. **Run the full test suite** before submitting
5. **Open a pull request** with a clear description of the change

## Code Standards

- **Language**: TypeScript (strict mode), no `any` types
- **Testing**: [Vitest](https://vitest.dev/) with **GIVEN/WHEN/THEN** pattern
- **Linting**: [Biome](https://biomejs.dev/) — run `pnpm lint` before committing
- **Encryption**: AES-256-GCM with random IV/salt per write — do not weaken cryptographic guarantees
- **Code and documentation**: English
- **Commits**: concise, imperative mood (e.g., "Add consent filter for health facets")

### Test Pattern

```typescript
describe('given a vault with consent policies', () => {
  describe('when requesting facets for an unauthorized provider', () => {
    it('then it should return an empty list', () => {
      // ...
    });
  });
});
```

### Pre-commit Hook

The project uses Husky to run `biome check` before every commit. If the hook fails, fix the reported issues before committing.

## What to Contribute

- Bug fixes and security improvements
- New facet categories or schema extensions
- MCP transport improvements
- CLI enhancements
- Documentation improvements
- Integration tests with additional AI providers
- Translations (the EUPL-1.2 licence is available in 23 EU languages)

## Reporting Issues

Open an issue on GitHub with:

- A clear title describing the problem
- Steps to reproduce (if applicable)
- Expected vs. actual behaviour
- Your environment (OS, Node.js version, pnpm version)

## Security Vulnerabilities

If you discover a security vulnerability, **do not open a public issue**. Instead, contact the maintainers privately at the email address listed in the repository. We will acknowledge receipt within 48 hours and work with you on a fix before public disclosure.

## Code of Conduct

Be respectful, constructive, and inclusive. We are building a tool that protects people's personal data and fundamental rights — the community around it should reflect those values.
