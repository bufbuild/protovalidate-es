# AGENTS.md

Instructions for AI coding agents and automated reviewers (Claude Code, Codex CLI, CodeRabbit, and similar) working in this repository.
Humans should read [CONTRIBUTING.md](.github/CONTRIBUTING.md) first; everything here applies to you too.
Before opening a pull request, read [REVIEW.md](REVIEW.md). It lists the invariants reviewers check, and your PR will be held to them.

This guide is distilled from the repository's pull request and review history (PRs #3 through #217, April 2025 to November 2026).
Rules carry links to the PRs and review comments that established them.
Where the evidence is a single comment rather than a repeated pattern, the rule says so.
The primary maintainer is Timo Stamm (`timostamm`), who authored most of the runtime and reviewed most contributions; his feedback is treated as the primary source of review standards here.

## Non-negotiable rules

1. **A human is accountable for every change.** The person submitting the PR must understand it, have run the checks below, and have signed the [CLA](https://cla-assistant.io/bufbuild/protovalidate-es).
2. **Never hand-edit generated or vendored code.** See [Files you must not hand-edit](#files-you-must-not-hand-edit). CI regenerates and fails on drift ([#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5397455781)).
3. **The conformance suite must pass in strict mode on both the native and the CEL path.** Never add to `expected-failures.yaml` to make it pass.
4. **Violations are a contract.** Do not change violation IDs, messages, or field and rule paths unless upstream protovalidate does ([#196](https://github.com/bufbuild/protovalidate-es/pull/196), [#107](https://github.com/bufbuild/protovalidate-es/issues/107)).
5. **Do not add dependencies to `@bufbuild/protovalidate`.** It depends on `@bufbuild/cel` and `@bufbuild/re2`, pinned exactly, plus a peer dependency on `@bufbuild/protobuf` ([#39](https://github.com/bufbuild/protovalidate-es/pull/39#discussion_r2125787252), [#54](https://github.com/bufbuild/protovalidate-es/pull/54#discussion_r2167551109)).
6. **Every public API change is called out in the PR description.** New exported APIs are discussed in a GitHub issue first ([#27](https://github.com/bufbuild/protovalidate-es/pull/27), [#151](https://github.com/bufbuild/protovalidate-es/issues/151)).
7. **Keep PRs small and focused.** Do not mix refactors, formatting, or dependency bumps into a functional change. Update `@bufbuild/protobuf` in its own PR ([#69](https://github.com/bufbuild/protovalidate-es/pull/69), [#70](https://github.com/bufbuild/protovalidate-es/pull/70)).
8. **Do not "clean up" code you were not asked to change.** Do not leave process artifacts (plan references, "phase 3", "review follow-up") in code or comments ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374030709)).
9. **Regular expressions from schemas go through RE2, never the JavaScript `RegExp` engine.** Validation runs on untrusted input and must stay linear in the size of the message ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3881326955)).

## Repository map

| Path | What it is | Notes |
|---|---|---|
| `packages/protovalidate` | `@bufbuild/protovalidate`, the published runtime | Dual ESM/CJS. Browser, Node.js, Deno, Bun. Bundle size matters. |
| `packages/protovalidate/src/native` | Hand-written implementations of standard rules | Must be equivalent to the CEL expressions in `validate.proto` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162)). |
| `packages/protovalidate/src/lib.ts`, `func.ts` | CEL custom functions (`isEmail`, `isIp`, `unique`, ...) | Methods on CEL types declared with `celMethod`, so they take `this` ([#188](https://github.com/bufbuild/protovalidate-es/issues/188)). |
| `packages/protovalidate/proto` | `buf/validate/validate.proto`, copied from upstream | Changes only with `packages/upstream/version.txt`. |
| `packages/protovalidate-testing` | Conformance executor against the upstream suite | Runs `protovalidate-conformance --strict_message --strict_error`. |
| `packages/protovalidate-bench` | Benchmarks mirroring `protovalidate-go` | Private. tinybench. Results go in PR descriptions ([#149](https://github.com/bufbuild/protovalidate-es/pull/149), [#186](https://github.com/bufbuild/protovalidate-es/pull/186)). |
| `packages/upstream` | Scripts that fetch protos, the conformance binary, and README snippets at the pinned upstream version | `version.txt` is the single source of truth ([#65](https://github.com/bufbuild/protovalidate-es/pull/65#discussion_r2210144483)). |
| `packages/example` | User-facing examples referenced from the README | Treated as documentation; keep it simple ([#68](https://github.com/bufbuild/protovalidate-es/pull/68)). |

Only Protobuf-ES messages are supported. Other Protobuf runtimes are out of scope ([#17](https://github.com/bufbuild/protovalidate-es/pull/17)).

## Environment

- Node.js version from `.nvmrc`, npm version from `package.json` (`packageManager`), and a current Go toolchain for the conformance runner.
  Use `npm ci`, never `npm install` without a reason.
- Supported Node.js releases are the maintained ones; CI runs 22, 24, and 26 ([#198](https://github.com/bufbuild/protovalidate-es/pull/198)).
- Tasks run through turborepo. Scope to a package with `-F`, for example `npx turbo run test -F @bufbuild/protovalidate`.
- `npm run all` does effectively the same thing as CI ([#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5397455781)).

## Commands

| Task | Command |
|---|---|
| Install | `npm ci` |
| Test and lint (run before every PR) | `npx turbo run test lint` |
| Everything CI runs | `npm run all` |
| Typecheck | `npx turbo run typecheck` |
| Format | `npx turbo run format` |
| Regenerate generated code | `npx turbo run generate` |
| License headers | `npx turbo run license-header` |
| Conformance | `npx turbo run test -F @bufbuild/protovalidate-testing` |
| Conformance, CEL only | `PROTOVALIDATE_DISABLE_NATIVE_RULES=1 npx turbo run test -F @bufbuild/protovalidate-testing` |
| Type exports check | `npx turbo run attw` |
| Benchmarks | `npx turbo run bench -F @bufbuild/protovalidate-bench` |

CI fails if regenerated, reformatted, or re-headered output differs from what is committed.
Run the relevant command and commit the result.

## Files you must not hand-edit

- Anything under `packages/*/src/gen`: generated by `protoc-gen-es`. Change the `.proto` input, then regenerate.
  A hand edit is overwritten by `buf generate` and fails the CI diff check ([#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5397455781)).
- `packages/protovalidate/proto`: copied from upstream protovalidate at the version in `packages/upstream/version.txt`. Do not edit it here.
- `packages/upstream/version.txt`: bumping the upstream version is a maintainer task. It changes the protos, the conformance suite, and the README.
  To test against an unreleased upstream change, `version.txt` accepts a branch name. Open a throwaway PR titled for the purpose and say "not intended to be merged" ([#65](https://github.com/bufbuild/protovalidate-es/pull/65), [#131](https://github.com/bufbuild/protovalidate-es/pull/131), [#132](https://github.com/bufbuild/protovalidate-es/pull/132)).
- `packages/protovalidate-testing/expected-failures.yaml`: adding an entry hides a conformance regression. Fix the bug instead.
- `package-lock.json` beyond what `npm ci` and intentional dependency changes produce.

## Architecture in brief

Read this before touching `planner.ts`, `eval.ts`, `cel.ts`, or `src/native`.

- `createValidator()` builds a `Validator` holding a `Planner` and a `CelManager`.
  `validate()` reflects the message, asks the planner for a cached plan for the message type, and evaluates it with a `Cursor` that tracks the field path and collects violations.
- **The planner over-builds and relies on pruning.** It attaches evaluators (for example an `EvalCustomCel` for every field) whether or not rules exist, then `prune()` removes dead nodes.
  Pruning must recurse through the whole tree, or dead evaluators run per field per call ([#186](https://github.com/bufbuild/protovalidate-es/pull/186)).
- **Plans are cached per message type and may be cyclic.** A plan is inserted into the cache in a "building" state before its fields are planned so recursive references resolve.
  Pruning must not treat a still-building plan as dead ([#211](https://github.com/bufbuild/protovalidate-es/pull/211), replacing [#206](https://github.com/bufbuild/protovalidate-es/pull/206)).
  A compilation error must evict every partially built plan from the cache, and must be re-raised for any root message that depends on it, regardless of planning order ([#137](https://github.com/bufbuild/protovalidate-es/pull/137), [#212](https://github.com/bufbuild/protovalidate-es/pull/212)).
- **Native rules replace CEL for most standard rules.** `tryBuildNative` in `src/native/dispatcher.ts` returns an evaluator plus the set of handled rule fields; the planner enrolls the remaining fields in CEL.
  `createValidator({ disableNativeRules: true })` forces everything through CEL. Behavior must be identical either way ([#160](https://github.com/bufbuild/protovalidate-es/pull/160), [#162](https://github.com/bufbuild/protovalidate-es/pull/162)).
- **Rule ordering is observable.** Violations come out in the order rules are planned, which must match `validate.proto` and protovalidate-go ([#196](https://github.com/bufbuild/protovalidate-es/pull/196)).
  A violated `required` rule stops evaluation of the other field rules ([#108](https://github.com/bufbuild/protovalidate-es/pull/108)).
- **Unknown predefined rules are a compilation error**, not silently ignored. Users register extensions through the `registry` option ([#106](https://github.com/bufbuild/protovalidate-es/pull/106)).
- **Violation collection is bounded.** `maxViolations` defaults to `defaultMaxViolations` (1000); `failFast` stops at one ([#205](https://github.com/bufbuild/protovalidate-es/pull/205)).
- **`now` is computed lazily**, once per `validate()` call, through a getter on the CEL bindings ([#187](https://github.com/bufbuild/protovalidate-es/pull/187#discussion_r3932808390)).
- **Regex.** `regex.ts` wraps `@bufbuild/re2` with a bounded compile cache. The `regexMatch` option is the bring-your-own-engine hook and applies to every schema-supplied pattern.
  The library's own fixed formats (`string.uuid`, `string.ulid`, and so on) are constants, not input, and are matched with the platform `RegExp` by design (see the `regexMatch` TSDoc in `validator.ts`).
- **Standard Schema.** `createStandardSchema` and `createStandardSchemaInit` adapt a validator to the Standard Schema v1 interface. Issue paths use `localName`, and a field inside a `oneof` maps to `[oneofLocalName, "value"]` ([#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510588298)).

## Code standards

Biome enforces formatting and lint. Do not argue with it or disable rules inline. Beyond that:

### Package constraints

- **Dependencies.** `@bufbuild/protovalidate` depends only on `@bufbuild/cel` and `@bufbuild/re2`, pinned to exact versions, plus a peer dependency on `@bufbuild/protobuf`.
  Do not add dependencies without maintainer agreement. Do not use `@bufbuild/protobuf` APIs newer than the peer dependency range; bump the range in its own PR with the reason ([#66](https://github.com/bufbuild/protovalidate-es/pull/66)).
- **Imports.** Relative imports use the `.js` extension, even in `.ts` files. Type-only imports use `import type` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374240321)). No default exports.
- **Dual ESM and CommonJS.** The package ships both. Do not use `import.meta`, top-level `await`, or anything else that breaks the CJS build, including in tests ([#104](https://github.com/bufbuild/protovalidate-es/pull/104#discussion_r2535337784)).
  `attw` must pass, including Node10 resolution. New entry points need an `exports` entry with the `.js` extension and a `typesVersions` entry for Node10; `attw` does not support wildcard exports ([#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5428247548), [#151](https://github.com/bufbuild/protovalidate-es/issues/151#issuecomment-5397402620)).
- **No side effects.** The package declares `"sideEffects": false`. Module top level must not mutate globals, register anything, or do work beyond defining constants, functions, and classes.
- **Portability.** The runtime must work in baseline browsers, all maintained Node.js releases, Deno, and Bun.
  Do not use `node:*` imports, `Buffer`, or `process` in `packages/protovalidate/src` outside of tests.
  The compile target is ES2020. Do not rely on newer lib types in public signatures; for example, `Error` options are typed as `{ cause?: unknown }` instead of `ErrorOptions` ([#12](https://github.com/bufbuild/protovalidate-es/pull/12), [#30](https://github.com/bufbuild/protovalidate-es/pull/30#discussion_r2099944076)).
- **Bundle size.** The package is used in browsers. Treat added code as a cost the change must earn.
  Prefer structural typing over generated tables of constants ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374199478)); prefer thin wrappers over parallel code paths ([#169](https://github.com/bufbuild/protovalidate-es/pull/169#issuecomment-5527428731)); a new dependency is called out in the PR and release notes ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3880966679)).
- **Test-only code must not be reachable from `src/index.ts`**, so it never ships. `tsconfig.json` includes only `src/index.ts`; tests are typechecked by `tsconfig.test.json`.
- **License header.** Every new source file needs the Apache 2.0 header. `npx turbo run license-header` adds it.

### TypeScript idioms the maintainers ask for

These come up repeatedly in review. Apply them before asking for review.

- **No unnecessary `as` casts.** If a cast is needed, the types are wrong. Accept the union of the concrete types and let a `switch` on the discriminator (for example `rules.$typeName`) narrow. Spelling out each type costs nothing at runtime and adds nothing to the bundle ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3396858192), [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3373946287), [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3396751979)).
- **Use the narrowing helpers Protobuf-ES provides** (`isWrapperDesc`, `isMessage`, `isFieldSet`) instead of re-checking by hand and throwing on the impossible branch ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3917039841), [#50](https://github.com/bufbuild/protovalidate-es/pull/50#discussion_r2144533918)).
- **Pass only what a function needs.** Accept arguments with the shape the function requires; call sites pass whatever fits structurally ([#50](https://github.com/bufbuild/protovalidate-es/pull/50#discussion_r2144501029), [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374231996)).
- **Prefer constructs the type system can see.** A getter in an object literal over `Object.defineProperty` ([#187](https://github.com/bufbuild/protovalidate-es/pull/187#discussion_r3932808390)); a `Date` field serialized by `JSON.stringify` over manual formatting ([#161](https://github.com/bufbuild/protovalidate-es/pull/161#discussion_r3350697426)); a record keyed by name over an array when names are unique ([#161](https://github.com/bufbuild/protovalidate-es/pull/161#issuecomment-4620668082)).
- **Keep hot paths monomorphic.** Add state as a field on the existing class rather than a subclass or wrapper where the call site is hot ([#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343)).
- **Only the smallest special case that is needed.** Remove a dedicated branch unless it is required for correctness or measured faster ([#208](https://github.com/bufbuild/protovalidate-es/pull/208#discussion_r4335091120)). Drop redundant conditions ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3880985094)).
- **Error messages interpolate descriptors directly.** `DescMessage` and the other `Desc*` types implement `toString()` as kind plus qualified name, so write `` `... for the ${message}` ``, not `` `... for the message ${message}` `` ([#48](https://github.com/bufbuild/protovalidate-es/pull/48#discussion_r2141964881)).
- **Internal scripts are TypeScript.** Vanilla JS exists in some Buf repositories only where the build forces it. In a private package without build artifacts, write TS ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3311772322)).
- **An npm script does something useful with no arguments**, especially the primary script of a package ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3342961162)).
- **Do not reach for `node:util` `parseArgs` reflexively.** In review it made a 28-line argument parser 45 lines; weigh it case by case ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3343033594)). This is a single comment, not a ban.
- **Be consistent across Buf repositories** for build configuration (tsconfig options, `types: ["node"]`, how deprecations are ignored). Check protobuf-es and connect-es before inventing a new way ([#191](https://github.com/bufbuild/protovalidate-es/pull/191#discussion_r4063943402), [#191](https://github.com/bufbuild/protovalidate-es/pull/191#discussion_r4063223514), [#3](https://github.com/bufbuild/protovalidate-es/pull/3)).

### Comments and TSDoc

- Exported symbols get TSDoc comments in the style of their neighbors. Keep the doc comment directly above the declaration it documents; inserting a constant between them silently detaches it ([#205](https://github.com/bufbuild/protovalidate-es/pull/205#discussion_r4261778895)).
- Match neighboring code in which JSDoc tags you use. Internal helpers use none (except `@internal`); `{@link}` was asked to be removed from internal docs ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3373957769), [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3989404047)).
- **State intent, not measurements.** "Keep a single `EvalMany` shape on the hot `eval()` path", not "made it ~9% slower" ([#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343)).
- **Do not write comments that will go stale**: references to project phases, plans, other repositories' internals, or "do not fix in isolation" notes ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374030709), [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374080325), [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3979938965)).
- No comment blocks above the import section; IDEs collapse them. Let the code speak ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3311275758)).
- Document unspecified behavior explicitly, for example that `unique()` supports only homogeneous lists ([#208](https://github.com/bufbuild/protovalidate-es/pull/208#discussion_r4323363466)).
- README and docs: less is more. A short description of what something is and how to run it suffices ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3342961162)).

## Validation correctness

protovalidate-es passes the upstream protovalidate conformance suite in strict mode. Every change must keep it that way.

- **Sources of truth, in order:**
  1. The upstream conformance suite at the version in `packages/upstream/version.txt`.
  2. The rule definitions and their CEL expressions in `packages/protovalidate/proto/buf/validate/validate.proto`.
  3. Behavior of [protovalidate-go](https://github.com/bufbuild/protovalidate-go), the reference implementation ([#110](https://github.com/bufbuild/protovalidate-es/pull/110), [#196](https://github.com/bufbuild/protovalidate-es/pull/196), [#211](https://github.com/bufbuild/protovalidate-es/pull/211)).
  4. The CEL spec, for CEL functions this package provides. For example, `unique()` compares `bytes` by content because the CEL conformance tests say so ([#208](https://github.com/bufbuild/protovalidate-es/pull/208#discussion_r4335091120)).

  Never resolve an ambiguity by intuition. If the spec and upstream behavior disagree, upstream behavior wins; say so in the PR.
- **Native rules and CEL must agree.** Both paths must produce the same violations, including rule IDs, messages, and field and rule paths.
  When the two paths share logic, extract one implementation and call it from both rather than maintaining two ([#207](https://github.com/bufbuild/protovalidate-es/pull/207), [#208](https://github.com/bufbuild/protovalidate-es/pull/208)).
  Where CEL and Go disagree (for example float formatting), the native path matches cel-es, because the native path is tested for equivalence with CEL ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374957884)).
- **Patterns in native rules are RE2 syntax.** RE2 does not support `\u` escapes; a pattern that compiles with `RegExp` may throw with `@bufbuild/re2` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3916989368)).
- **New behavior wants a conformance test.** If upstream lacks one, say so and link the upstream issue or PR ([#50](https://github.com/bufbuild/protovalidate-es/pull/50#discussion_r2144533918), [#110](https://github.com/bufbuild/protovalidate-es/pull/110)).
- **Validation runs on untrusted input.** Keep evaluation cost linear in the size of the message. Respect the bound on collected violations. Bound any cache keyed by input ([`regex.ts`](packages/protovalidate/src/regex.ts)).

## Public API and compatibility

- Public API is `src/index.ts`, the `gen/buf/validate/validate_pb.js` export, and the `package.json` `exports` map.
- A breaking change is announced at the top of the PR description with an `> [!IMPORTANT]` admonition, explains what changes and why, and is repeated in the release notes ([#27](https://github.com/bufbuild/protovalidate-es/pull/27), [#37](https://github.com/bufbuild/protovalidate-es/pull/37), [#67](https://github.com/bufbuild/protovalidate-es/pull/67)).
- Do not export types that exist only to satisfy an external spec. The Standard Schema interface is copied in, per that spec's FAQ, and only `createStandardSchema` and `createStandardSchemaInit` are exported ([#54](https://github.com/bufbuild/protovalidate-es/pull/54#discussion_r2167551109)).
- Widening an input type can break consumers because the Standard Schema input parameter is covariant. Add a sibling function instead of changing an existing signature ([#169](https://github.com/bufbuild/protovalidate-es/pull/169)).
- Users generate `validate_pb.js` from the exported copy with the `map_imports` plugin option so a single copy lands in their bundle. Keep `packages/example` and `packages/protovalidate-bench` using it ([#184](https://github.com/bufbuild/protovalidate-es/pull/184), [#185](https://github.com/bufbuild/protovalidate-es/pull/185), [#151](https://github.com/bufbuild/protovalidate-es/issues/151#issuecomment-5700526638)).
- Releases: a `Release x.y.z` PR with generated notes states which upstream protovalidate version it is compatible with ([#87](https://github.com/bufbuild/protovalidate-es/pull/87), [#190](https://github.com/bufbuild/protovalidate-es/pull/190)). Releases are a maintainer task.

## Performance

- Benchmarks live in `packages/protovalidate-bench` and mirror protovalidate-go so deltas stay comparable cross-language.
  A PR that claims a performance improvement includes before and after results from this package in its description ([#186](https://github.com/bufbuild/protovalidate-es/pull/186), [#187](https://github.com/bufbuild/protovalidate-es/pull/187)).
- Profile before optimizing, and name the measured cost in the PR, not the code ([#186](https://github.com/bufbuild/protovalidate-es/pull/186), [#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343)).
- Hash-based or linear algorithms replace quadratic ones for collection rules: `repeated.unique` uses a `Set` past a small threshold, `bytes.contains` uses KMP for long needles ([#208](https://github.com/bufbuild/protovalidate-es/pull/208), [#207](https://github.com/bufbuild/protovalidate-es/pull/207)).
- Benchmark tooling: tinybench, after mitata was tried and reverted because forced GC and lack of process isolation made results order-dependent and noisy ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3318703717)). Do not switch benchmark frameworks without reproducing that discussion.
- The conformance executor reuses one validator across cases; do not construct validators per case ([#26](https://github.com/bufbuild/protovalidate-es/pull/26)).

## Tests

See the Tests section of [REVIEW.md](REVIEW.md) for the invariants. In short:

- **Framework.** `node:test` (`suite`, `test`) and `node:assert`, run via `tsx --test`. Do not introduce Jest, Vitest, or other test dependencies.
- **Location.** Next to the code as `*.test.ts`. Shared helpers for native rule tests are in `src/native/testing.ts` (`native`, `cel`, `diff`, `compile`, `assertRuleIdOrder`).
- **Native rules.** Use `diff()` to assert the native and CEL validators produce the same result. Compare every field of `Violation`, not just the string form; `rule` and `forKey` are not in `toString()` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3917154010)).
- **Message fixtures.** Use generated messages or compile an inline proto with `compile()`. Never hand-construct descriptor objects.
  Note that `create()` ignores unknown keys in its init argument; a typo produces a passing test for the wrong reason ([#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510611774)).
- **Keep tests concise.** One field is enough to exercise one behavior; do not pad schemas with extra fields ([#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510643490), [#104](https://github.com/bufbuild/protovalidate-es/pull/104)).
  Prefer a simple direct assertion over a helper that re-implements the thing under test; a third-party package is acceptable if it is well tested, but none was found ([#104](https://github.com/bufbuild/protovalidate-es/pull/104#discussion_r2535346919)).
- **Do not duplicate the conformance suite.** General behavior such as "a message without rules is valid" is covered there; unit tests cover what conformance cannot ([#104](https://github.com/bufbuild/protovalidate-es/pull/104#discussion_r2534943638)).
- **Regressions.** Bug fixes need a test that fails without the fix. If the bug has an issue, reference it in the test name ([#137](https://github.com/bufbuild/protovalidate-es/pull/137), [#212](https://github.com/bufbuild/protovalidate-es/pull/212)).
- **Type-level behavior** (Valid types, Standard Schema input and output types) is tested with `expect-type` or a snippet that fails to compile if the type is wrong ([#54](https://github.com/bufbuild/protovalidate-es/pull/54#discussion_r2167577444)).
- Keep assertion messages plain ([#137](https://github.com/bufbuild/protovalidate-es/pull/137#discussion_r3112149550)).

## Pull requests

- **Title:** start with a capitalized verb in the imperative ("Add", "Fix", "Remove"), first word not ending in "s" or "ing", no trailing punctuation, no contractions. Conventional-commit prefixes like `feat:` or `fix:` fail CI.
- **Description:** what changed, why, and how it was tested. Link the issue.
  Call out any public API change, violation change, dependency change, or new expected failure explicitly. For performance changes, include benchmark results.
  When the implementation changes during review, update the description to match before merge ([#212](https://github.com/bufbuild/protovalidate-es/pull/212)).
- A multi-step change is best reviewed commit by commit; say so in the description and keep commits meaningful ([#161](https://github.com/bufbuild/protovalidate-es/pull/161), [#6](https://github.com/bufbuild/protovalidate-es/pull/6)).
- Address a review comment by changing the code, then reply with the commit. "removed" or "resolved" with a link is the norm ([#162](https://github.com/bufbuild/protovalidate-es/pull/162)).
- Do not add the `Emergency Bypass Review` label. It is for maintainers only.
- Dependency bumps: Biome 2.x and TypeScript 7 are intentionally not taken (see [Intentional deviations](#intentional-deviations-from-conventional-practice)). Do not reopen them.

## Intentional deviations from conventional practice

Each entry names the guarantee being protected. Generic language or ecosystem advice does not override these.

### Guarantee: users never receive a breaking change through a transitive dependency

- **Convention:** caret ranges (`^0.6.1`) on dependencies.
- **Here:** `@bufbuild/cel` and `@bufbuild/re2` are pinned to exact versions in `packages/protovalidate/package.json`.
- **Why:** "We're pinning to an exact version because we do not want breaking changes to affect users of protovalidate" ([#39](https://github.com/bufbuild/protovalidate-es/pull/39#discussion_r2125787252)). Both packages are pre-1.0, so minor bumps can break.
- **Failure mode if reverted:** a user's lockfile resolves a newer cel-es with changed semantics; conformance that passed here fails in their app.
- **Rule:** any change to `dependencies` in that file that introduces `^`, `~`, or a range is a review objection. Bump the pin in a dedicated PR and run conformance.

### Guarantee: linear-time validation on untrusted input

- **Convention:** use the built-in `RegExp`; it is faster and has zero bundle cost.
- **Here:** every schema-supplied pattern (`string.pattern`, `bytes.pattern`, CEL `matches()`) goes through `@bufbuild/re2`. The README documents the ReDoS rationale and the `regexMatch` hook for other engines.
- **Why:** RE2 executes in linear time; the ~16 KB cost was judged "the right tradeoff" for a validation library ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3881326955), [#43](https://github.com/bufbuild/protovalidate-es/pull/43)). Earlier versions translated RE2 to `RegExp` and could not provide the guarantee.
- **Nuance:** the library's own constant patterns (`string.uuid`, `string.ulid`, well-known regexes) use `RegExp`, because they are not input. Do not "unify" these onto RE2, and do not route input patterns through `RegExp` for speed.
- **Failure mode if reverted:** a user-controlled pattern or value causes catastrophic backtracking; one request pins a CPU.
- **Rule:** `new RegExp(` or a regex literal applied to a value that originates in a schema rule or a message is an objection. A pattern literal that fails to compile under RE2 (`\u` escapes, lookaround, backreferences) is a bug ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3916989368)).

### Guarantee: the package works for CommonJS and Node10-resolution consumers

- **Convention:** ESM only; `import.meta.dirname` in tests; drop `moduleResolution: node10`; take TypeScript 7 and Biome 2 as they ship.
- **Here:** dual ESM and CJS output. No `import.meta` anywhere, including tests ("we're also compiling to CJS", [#104](https://github.com/bufbuild/protovalidate-es/pull/104#discussion_r2535337784)).
  The CJS build uses `moduleResolution node10` with the TS 6 deprecation ignored ([#191](https://github.com/bufbuild/protovalidate-es/pull/191)). TypeScript 7 is excluded in `dependabot.yaml` because it removes node10 resolution ([#199](https://github.com/bufbuild/protovalidate-es/pull/199)).
  New `exports` entries must resolve under Node10 via `typesVersions` and use the `.js` extension ([#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5428247548), [#151](https://github.com/bufbuild/protovalidate-es/issues/151#issuecomment-5397402620)).
  Biome stays on 1.9.x; the 2.x major bumps were closed by the maintainer ([#193](https://github.com/bufbuild/protovalidate-es/pull/193#issuecomment-6085428731), [#167](https://github.com/bufbuild/protovalidate-es/pull/167)). The reason is not spelled out in review; `.coderabbit.yaml` notes the version mismatch with CodeRabbit's Biome. Treat as "ask a maintainer", not "upgrade".
- **Failure mode if reverted:** `attw` fails; `require("@bufbuild/protovalidate")` breaks; older TypeScript projects lose types for subpath exports.
- **Rule:** flag `import.meta`, top-level `await`, `exports` entries without `typesVersions`, wildcard `exports`, and any dependency bump to TypeScript 7 or Biome 2.
  "TS 7 support is a different bridge to cross" ([#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5428247548)).

### Guarantee: ES2020 consumers compile without lib errors

- **Convention:** use the newest lib types (`ErrorOptions`, ES2022 features).
- **Here:** target and lib are ES2020. The one exception is `Error.cause`, which is set for information but never read outside tests, so public signatures use `{ cause?: unknown }` ([#12](https://github.com/bufbuild/protovalidate-es/pull/12), [#30](https://github.com/bufbuild/protovalidate-es/pull/30#discussion_r2099944076)).
- **Failure mode if reverted:** users targeting ES2020 get type errors from our declaration files.
- **Rule:** flag ES2021+ types in exported signatures, and changes to `target` or `lib` in `tsconfig.base.json`.

### Guarantee: zero runtime dependencies beyond cel and re2

- **Convention:** depend on `@standard-schema/spec` for the interface; add small utility packages.
- **Here:** the Standard Schema types are copied into `standard-schema.ts` (the spec's FAQ permits this), and the interface type is not exported ([#54](https://github.com/bufbuild/protovalidate-es/pull/54#discussion_r2167551109)). `date-fns` was removed early in the project's history.
- **Failure mode if reverted:** every user installs and bundles another package; the exported type becomes API we must maintain.
- **Rule:** any addition to `dependencies` or `peerDependencies` in `packages/protovalidate/package.json` is an objection unless a maintainer agreed in an issue.

### Guarantee: bundle size

- **Convention:** generate lookup tables and typed wrappers for clarity; extract abstractions eagerly.
- **Here:** structural typing is preferred over const tables (`Int32RulesSchema.field` instead of a generated `int32Descs`, which removed a whole file, [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374199478)); a new function wraps the existing one instead of duplicating its code path ([#169](https://github.com/bufbuild/protovalidate-es/pull/169#issuecomment-5527428731)); `map_imports` keeps one copy of `validate_pb.js` in user bundles, cutting the example by ~9% raw ([#185](https://github.com/bufbuild/protovalidate-es/pull/185)).
- **Known debt:** `src/native` duplicates some logic from `lib.ts` because `lib.ts` functions are CEL methods that take `this`. This is tracked in [#188](https://github.com/bufbuild/protovalidate-es/issues/188) and deduplicated incrementally ([#207](https://github.com/bufbuild/protovalidate-es/pull/207), [#208](https://github.com/bufbuild/protovalidate-es/pull/208)). Do not add new duplicates; do not force an abstraction that adds indirection to the CEL functions.
- **Rule:** flag new modules that mostly re-export or tabulate existing descriptors, and duplicate implementations of a function that already exists in `lib.ts` or `src/native`.

### Guarantee: identical behavior on the native and CEL paths

- **Convention:** a fast path may differ slightly from the reference as long as tests pass.
- **Here:** the native implementation of a rule must produce the same violations, IDs, messages, and paths as the CEL expression in `validate.proto`. CI runs conformance twice, once with `PROTOVALIDATE_DISABLE_NATIVE_RULES=1`.
  Where cel-es and cel-go differ, the native path follows cel-es ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374957884)).
- **Failure mode if reverted:** a user who flips `disableNativeRules` sees different results; conformance passes on one path and fails on the other.
- **Rule:** a change under `src/native` without a `diff()`-style equivalence test, or a change to `planner.ts` rule ordering without a conformance run on both paths, is an objection.

### Guarantee: a validation bypass is never silent

- **Convention:** cache aggressively; ignore unknown extensions; prune eagerly.
- **Here:** unknown predefined rules raise a `CompilationError` ([#106](https://github.com/bufbuild/protovalidate-es/pull/106)); a failed compilation evicts partial plans and re-raises for dependent roots ([#137](https://github.com/bufbuild/protovalidate-es/pull/137), [#212](https://github.com/bufbuild/protovalidate-es/pull/212)); pruning never removes a plan that is still being built ([#211](https://github.com/bufbuild/protovalidate-es/pull/211)).
- **Failure mode if reverted:** a message validates as `valid` because its rules were dropped during planning. [#206](https://github.com/bufbuild/protovalidate-es/pull/206) and [#212](https://github.com/bufbuild/protovalidate-es/pull/212) describe real instances.
- **Rule:** any change to plan caching, pruning, or error handling in `planner.ts` or `eval.ts` needs a test with mutually recursive message types and a test where planning fails partway through.

### Guarantee: hot paths stay monomorphic

- **Convention:** model states with subclasses or wrapper objects.
- **Here:** `EvalMany` carries its plan state as a field "to keep a single `EvalMany` shape on the hot `eval()` path" ([#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343)). Dead evaluators are pruned out of the tree rather than skipped at runtime ([#186](https://github.com/bufbuild/protovalidate-es/pull/186)).
- **Failure mode if reverted:** `eval()` becomes megamorphic. Removing per-call overhead of this kind sped up every benchmark by 4 to 29 percent in the recursive pruning PR, so adding it back costs the same.
- **Rule:** a subclass or wrapper introduced on `Eval` implementations, or work added to `EvalMany.eval()` or `EvalField.eval()`, needs benchmark results in the PR.

### Guarantee: test and benchmark code is first-class TypeScript

- **Convention:** small `scripts/*.js` helpers are fine.
- **Here:** internal packages without build artifacts write TypeScript; vanilla JS in Buf repositories exists "not by choice" ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3311772322)). The root `scripts/` directory is vanilla JS for repository-setup reasons shared with protobuf-es; leave it as it is.
- **Rule:** a new `.js` file under `packages/` is an objection.

## Recurring expectations from the primary maintainer

Timo Stamm's reviews are short and concrete. The patterns below recur across PRs; treat them as the bar.

1. **Truthful types.** Remove casts that are not needed ("Would be more truthful to remove it", [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3373946287)). Accept unions and narrow with a `switch` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3396858192)). Use `import type` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374240321)).
2. **Bundle size is a review criterion.** "Bundle size matters. It would be better to make use of TypeScript's structural matching here" ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374199478)). Thin wrappers over new code paths ([#169](https://github.com/bufbuild/protovalidate-es/pull/169#issuecomment-5527428731)). No unneeded dependencies ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3342748444)).
3. **No process residue in the code.** "What's this comment?" on a "Review follow-up" marker ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3373926019)); "What's the phase-3 port? Does this information belong into a code comment?" ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374030709)); notes likely to go stale ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374080325)).
4. **Comments state intent.** ([#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343)); no comment blocks above imports ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3311275758)); keep JSDoc consistent with neighbors ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3373957769)); doc comments stay attached ([#205](https://github.com/bufbuild/protovalidate-es/pull/205#discussion_r4261778895)).
5. **Idiomatic over clever.** Getter in an object literal, not `Object.defineProperty` ([#187](https://github.com/bufbuild/protovalidate-es/pull/187#discussion_r3932808390)); lean on `JSON.stringify` for `Date` ([#161](https://github.com/bufbuild/protovalidate-es/pull/161#discussion_r3350697426)); records when keys are unique ([#161](https://github.com/bufbuild/protovalidate-es/pull/161#issuecomment-4620668082)); `isWrapperDesc` narrows, so no manual check ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3917039841)).
6. **Simplify, then simplify again.** He will push follow-up commits to a contributor's branch that remove indirection ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3989217039), [#161](https://github.com/bufbuild/protovalidate-es/pull/161)). "I believe that the benchmarking harness could be heavily streamlined if they aren't needed" ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3342898142)). Unused exports are flagged ([#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3342932145)).
7. **Tests are concise and compare the right thing.** One field per behavior ([#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510643490)); compare all `Violation` fields ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3917154010)); conformance is the better home for general behavior ([#104](https://github.com/bufbuild/protovalidate-es/pull/104#discussion_r2534943638)); "We should have conformance tests for this behavior" ([#50](https://github.com/bufbuild/protovalidate-es/pull/50#discussion_r2144533918)).
8. **Protobuf-ES semantics are checked precisely.** Oneof fields are not plain properties ([#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510588298)); `create()` ignores unknown init keys ([#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510611774)); `isFieldSet` takes a field descriptor ([#50](https://github.com/bufbuild/protovalidate-es/pull/50#discussion_r2144533918)); `MessageInitShape` already covers partial messages ([#169](https://github.com/bufbuild/protovalidate-es/pull/169#issuecomment-5527428731)).
9. **Consistency across Buf repositories.** tsconfig and build flags should match protobuf-es and connect-es ([#191](https://github.com/bufbuild/protovalidate-es/pull/191#discussion_r4063943402)); env var names follow the protobuf-es `turbo.json` pattern and are listed in `globalPassThroughEnv` ([#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3917303400)); release scripts are "Same as in protobuf-es and connect-es" ([#3](https://github.com/bufbuild/protovalidate-es/pull/3)).
10. **Check the upstream project's recommended approach before adding machinery here**, and say so when a first instinct was wrong ("I was wrong, the getter is already the recommended approach", [#187](https://github.com/bufbuild/protovalidate-es/pull/187#discussion_r3932808390)).
11. **PR hygiene.** Separate unrelated dependency updates ([#69](https://github.com/bufbuild/protovalidate-es/pull/69)); update the description when the code changes ([#212](https://github.com/bufbuild/protovalidate-es/pull/212)); flag side effects of tool upgrades to the affected author ([#182](https://github.com/bufbuild/protovalidate-es/pull/182#discussion_r3924974271)).

Other reviewers whose feedback recurs: Jon Bodner (`jonbodner-buf`, native rules, benchmarks, planner), Sri Krishna (`srikrsna-buf`, CEL and upstream updates), Kevin McDonald (`sudorandom`, bundle size and stale comments, [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3979938965)), and Paul Sachs (`paul-sachs`, Standard Schema and type-level tests, [#54](https://github.com/bufbuild/protovalidate-es/pull/54#discussion_r2164883397)).

## Automated-review heuristics

For CodeRabbit and similar tools. Each row is a pattern that has drawn a review objection, with the objection and its source. Formatting and lint are Biome's job; do not comment on style.

| Pattern in diff | Objection | Source |
|---|---|---|
| `^` or `~` on `@bufbuild/cel` or `@bufbuild/re2` in `packages/protovalidate/package.json` | Pins must be exact | [#39](https://github.com/bufbuild/protovalidate-es/pull/39#discussion_r2125787252) |
| New key under `dependencies` or `peerDependencies` in `packages/protovalidate/package.json` | No new dependencies without maintainer agreement | [#54](https://github.com/bufbuild/protovalidate-es/pull/54#discussion_r2167551109) |
| `new RegExp(`, `.test(`, `.match(` applied to a value from a rule or message in `packages/protovalidate/src` | Must use RE2 | [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3881326955) |
| `import.meta`, top-level `await`, `node:` import, `Buffer`, `process` in `packages/protovalidate/src` (tests included for `import.meta`) | Breaks CJS build or portability | [#104](https://github.com/bufbuild/protovalidate-es/pull/104#discussion_r2535337784) |
| `exports` entry without matching `typesVersions`, or a wildcard `exports` key | `attw` Node10 resolution fails | [#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5428247548) |
| Edit under `packages/*/src/gen` or `packages/protovalidate/proto` without a `.proto` or `version.txt` change | Generated or vendored; CI diff check fails | [#152](https://github.com/bufbuild/protovalidate-es/pull/152#issuecomment-5397455781) |
| New entry in `expected-failures.yaml` | Hides a conformance regression | [REVIEW.md](REVIEW.md) |
| ` as ` cast in `src/native` or `planner.ts` | Accept the union and narrow with `switch` | [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3396858192) |
| `import { ... }` of a type used only in type positions | Use `import type` | [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374240321) |
| Comment containing "phase", "plan", "follow-up", "TODO after", or a reference to another repository's internals | Process residue, will go stale | [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3374030709) |
| Comment stating a percentage or measurement | State the intent instead | [#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343) |
| `{@link ...}` or other JSDoc tags in internal (non-exported) helpers | Keep tags consistent with neighbors | [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3373957769) |
| A declaration inserted between a `/** */` block and the symbol it documented | Detaches the doc comment | [#205](https://github.com/bufbuild/protovalidate-es/pull/205#discussion_r4261778895) |
| `Object.defineProperty` on an object with a static type | Use a getter in the literal | [#187](https://github.com/bufbuild/protovalidate-es/pull/187#discussion_r3932808390) |
| New `class ... extends` an `Eval` implementation, or a wrapper around `EvalMany` | Hot path must stay monomorphic; needs benchmarks | [#211](https://github.com/bufbuild/protovalidate-es/pull/211#discussion_r4341261343) |
| Change to `src/native/*.ts` without a corresponding `*.test.ts` change using `diff()` | Native and CEL equivalence untested | [#162](https://github.com/bufbuild/protovalidate-es/pull/162#discussion_r3917154010) |
| Change to `planner.ts` cache, `EvalMany.prune`, or `planState` without a recursive-type test | Validation bypass risk | [#211](https://github.com/bufbuild/protovalidate-es/pull/211), [#212](https://github.com/bufbuild/protovalidate-es/pull/212) |
| Reordering of rule evaluation in `planner.ts` or `src/native` | Violation order is observable; must match `validate.proto` and Go | [#196](https://github.com/bufbuild/protovalidate-es/pull/196) |
| A function in `src/native` that re-implements one in `lib.ts` (or vice versa) | Known debt; share one implementation | [#188](https://github.com/bufbuild/protovalidate-es/issues/188) |
| New `.js` file under `packages/` | Internal code is TypeScript | [#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3311772322) |
| PR description claims faster or slower without numbers from `protovalidate-bench` | Needs before and after results | [#186](https://github.com/bufbuild/protovalidate-es/pull/186) |
| Diff touches `src/index.ts`, the `exports` map, or an exported signature, and the description does not mention it | Public API change must be called out | [#27](https://github.com/bufbuild/protovalidate-es/pull/27) |
| Dependency bump to `@biomejs/biome` 2.x or `typescript` 7.x | Intentionally held back | [#193](https://github.com/bufbuild/protovalidate-es/pull/193#issuecomment-6085428731), [#199](https://github.com/bufbuild/protovalidate-es/pull/199) |
| Functional change mixed with a dependency bump or formatting-only changes | Split the PR | [#69](https://github.com/bufbuild/protovalidate-es/pull/69) |
| Test schema with several fields where one would do | Keep tests concise | [#100](https://github.com/bufbuild/protovalidate-es/pull/100#discussion_r2510643490) |
| Unused export or unreachable subcommand | Remove it | [#149](https://github.com/bufbuild/protovalidate-es/pull/149#discussion_r3342932145) |

## When to inspect existing patterns or ask

Inspect before writing:

- **Adding a native rule or changing one:** read the CEL expression for the rule in `validate.proto`, the existing implementation for a sibling rule type in `src/native`, and its test. Match rule ID order and message text exactly.
- **Touching Standard Schema:** read `standard-schema.ts` and the Protobuf-ES docs on oneof and `MessageInitShape` before changing path mapping or types ([#100](https://github.com/bufbuild/protovalidate-es/pull/100), [#169](https://github.com/bufbuild/protovalidate-es/pull/169)).
- **Build or tooling changes:** look at how protobuf-es and connect-es do it and copy that ([#191](https://github.com/bufbuild/protovalidate-es/pull/191#discussion_r4063943402)).
- **Anything involving `@bufbuild/cel`:** check cel-es's examples for the recommended approach before adding a workaround here ([#187](https://github.com/bufbuild/protovalidate-es/pull/187#discussion_r3932808390)).

Ask (open an issue or leave a question on the PR) instead of assuming when:

- The spec, the conformance suite, and protovalidate-go disagree, or none of them covers the case. Say which you followed.
- A change would alter a violation ID, message, or path.
- A change adds a dependency, an export, a `package.json` `exports` entry, or a breaking change.
- You want to bump `version.txt`, Biome, or TypeScript majors.
- You are unsure whether a behavior should be a `CompilationError`, a `RuntimeError`, or a violation.
- A performance change would restructure `Eval` classes.

Do not ask about things the code already answers (which test helper to use, how to run conformance, what the ignore semantics are). Read the neighbors.

## Pre-submission checklist

- [ ] `npm run all` passes locally (format, lint, typecheck, attw, build, license-header, update-readme, test).
- [ ] Conformance passes with native rules and with `PROTOVALIDATE_DISABLE_NATIVE_RULES=1`. No new entries in `expected-failures.yaml`.
- [ ] Generated code regenerated with `npx turbo run generate`; nothing under `src/gen` hand-edited.
- [ ] No new dependencies; exact pins unchanged; no `@bufbuild/protobuf` API beyond the peer range.
- [ ] No `import.meta`, top-level `await`, `node:*`, `Buffer`, or `process` in runtime code.
- [ ] Schema-supplied regexes go through RE2; pattern literals compile under RE2.
- [ ] No unnecessary `as` casts; `import type` for types; no process residue in comments; intent-stating comments.
- [ ] Public API change, violation change, or dependency change is called out in the PR description. Breaking changes carry an `> [!IMPORTANT]` note.
- [ ] Bug fix has a regression test that fails without the fix; native rule change has a native-vs-CEL equivalence test.
- [ ] Performance claim has `protovalidate-bench` results before and after.
- [ ] PR title is imperative, capitalized, no prefix, no trailing punctuation. Description is current with the final code.
- [ ] Unrelated refactors, formatting, and dependency bumps are in separate PRs.

## Evidence and limitations

- This guide was built from all 196 pull requests in `bufbuild/protovalidate-es` (#3 to #217, April 29, 2025 to November 1, 2026), including 164 merged, 28 closed, and 4 open, with their reviews, inline review comments, and discussion comments, plus linked issues #151 and #188.
- Commits before April 2025 were imported from `bufbuild/cel-es`; their `(#NNN)` suffixes refer to that repository's PRs, which were not reviewed here.
- Timo Stamm authored 95 reviews and 65 inline comments, more than any other participant, which is why his feedback anchors the sections above.
- Where a rule rests on a single comment (`parseArgs`, record-vs-array, assertion wording), the text says so. Where the reason for a decision is not stated in review (Biome 2.x being held back), the text says so rather than inventing one.
- Resolved review threads and comments on force-pushed commits are preserved by the GitHub API, so none were inaccessible. Review comments with deleted authors appear with no login and were read but not attributed.
