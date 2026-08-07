# Dependency Review: Next 15 security update

## Summary

- Date: 2026-08-07
- Scope: upgrade the Pages Router framework and resolve the current npm
  advisory set without changing the application routing model or React major.

## Classification

- Elevated-risk.
- The update changes the production framework, its build toolchain, and
  audited transitive resolutions.

## Targets

- `next` -> `15.5.21`
- `eslint-config-next` -> `15.5.21`
- `@types/node` -> `20.19.43`
- `vite` -> `8.1.0` (reviewed override for the Vitest peer dependency)
- Security overrides: `postcss` -> `8.5.25`, `sharp` -> `0.35.3`,
  `immutable` -> `5.1.8`, `lodash` and `lodash-es` -> `4.18.0`,
  `ajv` -> `6.14.0`, `flatted` -> `3.4.2`, `js-yaml` -> `4.3.1`,
  `yaml` -> `1.10.3`, `picomatch` -> `2.3.2`, `minimatch` -> `3.1.4`
  and `9.0.7`, and `brace-expansion` -> `1.1.18` and `2.1.4`.

## Release Age

- Minimum policy: seven days (`minimumReleaseAge: 10080`).
- All targets passed, except `js-yaml@4.3.1`, which was approximately eight
  hours short of the threshold.
- Exception: explicitly approved on 2026-08-07 because it fixes a high
  severity advisory in the ESLint-only path. The exception was used only while
  resolving the lockfile; it is not present in `pnpm-workspace.yaml` and does
  not relax future updates.

## Advisory Review

- Baseline lockfile audit: 1 critical, 40 high, 29 moderate, and 6 low
  findings.
- Candidate and final lockfile audit: zero findings at every severity.
- The Next 13 critical middleware authorization-bypass advisory is removed.
- Overrides keep patched, same-major versions for the remaining direct and
  transitive advisory paths.

## Source / Upstream Review

- `next@15.5.21`, `eslint-config-next@15.5.21`, `vite@8.1.0`, and
  `@types/node@20.19.43` have npm integrity hashes and registry signatures;
  the first three also publish npm provenance attestations where available.
- Next 15 supports the Pages Router with React 18, so React remains at 18.3.1
  for this update.
- The reviewed direct packages have no install lifecycle scripts.

## Lifecycle Scripts

- A frozen install completed under `strictDepBuilds` without introducing a new
  build-script approval.
- The existing reviewed approvals remain limited to `@parcel/watcher` and
  `unrs-resolver`.

## Commands Run

```bash
pnpm view next@15.5.21 dist deprecated scripts peerDependencies --json
pnpm view eslint-config-next@15.5.21 dist deprecated scripts peerDependencies --json
pnpm view vite@8.1.0 dist deprecated scripts peerDependencies --json
pnpm view @types/node@20.19.43 dist deprecated scripts --json
pnpm install --lockfile-only --ignore-scripts
pnpm audit --json
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test:coverage
pnpm run test:e2e
pnpm run build
```

## Outcome

- Upgraded from unsupported Next 13.5.6 to Next 15.5.21.
- Preserved the Pages Router and React 18 application behaviour.
- Replaced deprecated `next lint` invocation with the equivalent ESLint CLI.
- The final npm audit is clean and all verification passes.

## Follow-ups

- Consider a separately reviewed React 19 and ESLint 9 migration.
- Keep the Sass `math.random()` API when modifying affected styles; the global
  Sass helper is deprecated.
