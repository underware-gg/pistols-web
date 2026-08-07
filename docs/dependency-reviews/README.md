# Dependency Reviews

This directory records deliberate direct dependency, package-manager, and
dependency-tool updates.

## Policy

- New direct dependencies, dependency tools, and directly updated packages use
  exact versions. Existing ranges are converted when their package is next
  reviewed and updated.
- Candidate versions must be at least seven days old, unless a documented
  exception is necessary.
- Git, file, and URL-style transitive dependencies are blocked.
- Dependency lifecycle scripts require an explicit, reviewed allow-list.
- Production and CI installs use `pnpm install --frozen-lockfile`.

## Review Records

Create `YYYY-MM-DD-short-subject.md` before changing a direct dependency,
package manager, install policy, or dependency tool.

Each record must include:

1. Summary
2. Classification
3. Targets
4. Release Age
5. Advisory Review
6. Source / Upstream Review
7. Lifecycle Scripts
8. Commands Run
9. Outcome
10. Follow-ups

For an update, build a candidate lockfile with lifecycle scripts disabled,
audit both candidate and final lockfiles, inspect registry metadata for the
exact targets, and run the relevant verification suite.
