# Dependency Review: supply-chain policy adoption

## Summary

- Date: 2026-08-07
- Scope: establish repository-owned pnpm install controls and the dependency
  review process before framework updates.

## Classification

- Elevated-risk.
- The change controls which future packages and lifecycle scripts may enter
  the dependency graph.

## Targets

- `pnpm` -> `10.34.4` (exact package-manager pin)

## Release Age

- Minimum policy: seven days (`minimumReleaseAge: 10080`).
- Result: pass. pnpm 10.34.4 predates this policy by substantially more than
  seven days.

## Advisory Review

- Sources checked: npm registry metadata, GitHub Advisory Database package
  advisories, and `pnpm audit --json` for the existing lockfile.
- pnpm 10.34.4 is outside every current pnpm advisory range. Earlier 10.x
  releases, including 10.17.0 and 10.26.0, are not accepted because they are
  affected by later pnpm advisories.
- The baseline audit has existing findings, including one critical and forty
  high findings. This policy-only change does not update application
  dependencies; the framework update must review and remediate applicable
  findings before release.

## Source / Upstream Review

- The exact pnpm package has an npm integrity hash and registry signature.
- Its published scripts are development scripts, not install lifecycle
  scripts.
- Existing `pnpm-lock.yaml` entries contain no Git, file, link, or URL-style
  dependency sources.

## Lifecycle Scripts

- `strictDepBuilds` is enabled before dependency updates.
- A frozen install identified two blocked scripts. The reviewed allow-list is:
  - `@parcel/watcher` -> its native watcher is used by Sass, which is a
    production dependency of the Next build path.
  - `unrs-resolver` -> its resolver is used by the TypeScript ESLint resolver
    in the development lint path.
- No other package is approved to run a lifecycle script.

## Commands Run

```bash
pnpm view pnpm@10.34.4 dist deprecated scripts --json
pnpm audit --json
curl -L -s 'https://api.github.com/advisories?ecosystem=npm&affects=pnpm&per_page=100'
rg -n '(^\\s*(git|file|link):|resolution:.*(git\\+|github\\.com|gitlab\\.com|bitbucket\\.org|file:|link:|directory:|tarball:))' pnpm-lock.yaml
pnpm install --lockfile-only --ignore-scripts
pnpm install --frozen-lockfile
pnpm why unrs-resolver
pnpm why @parcel/watcher
```

## Outcome

- Added an exact, advisory-patched pnpm version pin.
- Added a repository-owned seven-day release-age gate, exotic dependency
  blocking, strict build-script approval, and exact-version saves.
- Approved only `@parcel/watcher` and `unrs-resolver` lifecycle scripts after
  tracing them to the build and lint paths.
- Added the dependency-review convention.

## Follow-ups

- Apply this process to every future direct dependency and dependency-tool
  update.
