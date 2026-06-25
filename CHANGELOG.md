# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Added release-readiness validation for package metadata, CI placeholder cleanup, and package smoke coverage.
### Added

- Fixture-driven CLI smoke checks for inspect, run, summary, JSONL, baseline regression, generated packs, and expected failure cases.
- Release-candidate package allowlist that includes the deterministic fixture packs used by README quickstart commands.
- CI coverage for the package release check and validation script.

### Notes

- V1 is a local-first smoke harness. It does not call model providers unless a future adapter is explicitly added and configured.
