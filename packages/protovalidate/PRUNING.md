# Plan pruning

This note describes how the planner removes dead code from a message's
validation plan. The implementation lives in `planner.ts` (`Planner.pruneGraph`)
and `eval.ts` (`collectLiveness` / `pruneCyclic` and the `childLiveness` /
`childPrune` / `collectPlanLiveness` / `prunePlan` helpers).

## Background: what a plan is

`createValidator().validate(schema, message)` does not interpret the descriptor
directly. The planner first walks a `DescMessage` and builds a tree of `Eval`
nodes — one evaluator per slice of validation semantics (`EvalField`,
`EvalListItems`, `EvalMapEntries`, the CEL and native rule evaluators, etc.) —
grouped under an `EvalMany`. That `EvalMany` is the message's **plan**, and it is
cached once per `DescMessage` in `Planner.messageCache`.

Two facts drive the pruning design:

1. **Plans are shared and cyclic.** A message-typed field references the child
   message's plan directly: `message()` builds an `EvalMany` wrapper that
   contains `this.plan(childDesc)` as a member. Because the same plan object is
   reused everywhere a type appears, recursive and mutually recursive schemas
   produce a **cyclic graph of plan nodes**, not a tree. The cached per-message
   `EvalMany` nodes are the only cycle boundaries; everything else hanging off a
   plan (field evaluators, wrappers, rule evaluators) is acyclic.

2. **Most nodes are no-ops.** A field with no rules, a CEL program that compiled
   to nothing, a message field whose type carries no rules anywhere in its
   subtree — all of these evaluate to nothing. Pruning removes them so that
   `eval` does not descend into subtrees that can never report a violation. This
   is what keeps validation cost proportional to the rules that exist, not to the
   shape of the data (e.g. a `google.protobuf.Struct` field with no rules must
   not cause the validator to walk the entire Struct value).

So pruning is **dead-code elimination over a cyclic graph**. "Dead" means
"can never produce a violation."

## Why it is not a simple recursive prune

The obvious approach — each node has `prune(): boolean` ("am I a no-op?"), and a
plan prunes itself by recursively pruning its children — fails on cycles, and the
failures are subtle:

- **Pruning too early drops live validation.** The planner caches an *empty*
  plan placeholder before building a message's rules, so recursive references can
  resolve to it. If a plan is pruned while a mutually recursive ancestor is still
  an empty placeholder, the back-reference to that ancestor looks like dead code
  and is removed permanently; the ancestor's later completion does not restore
  it. Every rule reachable only through that back-edge is then silently skipped —
  a validation bypass. (This was the original bug the deferred-prune PR fixed.)

- **A constant answer on cycle re-entry is wrong for rule-free cycles.** If prune
  runs after the whole graph is built but still recurses, it needs an answer when
  it re-enters a node that is already on the stack. Returning "keep" (live) makes
  **every** cycle survive, including rule-free ones like
  `Struct`/`Value`/`ListValue` — so the validator walks them. Returning "dead"
  would wrongly drop live mutually recursive back-edges. Neither constant is
  correct: a cycle is live iff *some* node reachable within it has a real rule,
  which is a fixpoint, not a constant.

- **Recursion without memoization is exponential.** With only a per-node
  "currently pruning" reentrancy guard, pruning from the root re-descends every
  distinct path through the field graph. For densely interconnected types this is
  exponential in the number of types (minutes, or non-termination, on the first
  `validate`).

The fix separates **deciding what is dead** from **removing it**, and decides
deadness with a proper fixpoint over the plan graph.

## The algorithm

`Planner.pruneGraph()` runs once, from the outermost `plan()` call, after the
whole graph for that call is built (tracked by `buildingDepth`). It has two
phases over the cached plans.

The key move in both phases is to **cut traversal at plan-node boundaries**. A
plan node is never recursed into as part of another node's computation; instead
it is treated as an edge whose value comes from the fixpoint. `childLiveness` and
`childPrune` implement the cut via `PruneContext.isPlan`.

### Phase 1 — decide liveness (non-mutating)

For each node we compute a `Liveness = { localLive, edges }`:

- `localLive` — can this subtree produce a violation **without** going through a
  plan edge (i.e. from a rule it directly contains)?
- `edges` — the plan nodes this subtree reaches. The subtree is also live if any
  of those plans is live.

The per-node rules (`collectLiveness`) mirror each node's own `eval`/`prune`
semantics:

| node | liveness |
|------|----------|
| leaf rule evaluator | `{ localLive: !prune(), edges: [] }` — live iff it has a rule |
| plan node (reached as a child) | `{ localLive: false, edges: [thatPlan] }` — the cut |
| `EvalMany` | OR of children's `localLive`; union of their `edges` |
| `EvalField` | `required`/`legacy_required` → `{true, []}`; else `condition.never` → `{false, []}`; else the `pass`'s liveness |
| `EvalListItems` | `condition.never` → `{false, []}`; else the `pass`'s liveness |
| `EvalMapEntries` | union of the key and value parts (each dead if its condition is `never`) |

`collectPlanLiveness(plan)` computes a plan's own liveness by descending into it
(not treating the root plan as a boundary); nested plan nodes it reaches are
still cut.

Then the **least fixpoint** over plans:

```
live(P) = liveness(P).localLive OR any( live(Q) for Q in liveness(P).edges )
```

Start every plan `dead` and iterate to convergence. Liveness is monotone (a plan
only ever goes dead → live), so this converges in at most one pass per plan.
Rule-free cycles never acquire a `localLive` source, so they stay dead; a cycle
that reaches any rule becomes live and propagates liveness back around the cycle.

### Phase 2 — remove dead code (mutating, once per plan)

With `live` final, prune each not-yet-pruned plan exactly once (`pruneCyclic`,
dispatched through `childPrune`). The formulas are the existing prune formulas,
with the plan-boundary cut replacing recursion:

| node | removed (dead) iff |
|------|--------------------|
| plan node (reached as a child) | `!live(thatPlan)` — no recursion |
| `EvalMany` | after filtering dead children, `many` is empty |
| `EvalField` | `(condition.never OR passDead) AND NOT required AND NOT legacy_required` |
| `EvalListItems` | `passDead OR condition.never` |
| `EvalMapEntries` | key part dead AND value part dead |
| leaf | its own `prune()` |

Because a plan reference resolves to `!live` in O(1) instead of recursing, each
plan's `EvalMany` is filtered once and the whole phase is linear in the graph.

### Running once per plan, across calls

`Planner.pruned` (a `WeakSet`) records plans already pruned so each is pruned at
most once over the validator's lifetime. Pruning only ever removes no-op
children, and removing a no-op never changes any node's liveness, so re-running
the fixpoint on a partly-pruned graph yields identical results — the `WeakSet` is
an optimization, not a correctness requirement. Every entry is also held by
`messageCache`, so it is never collected early.

## Worked example

```proto
message Root {
  A      a    = 1;
  C      c    = 2;
  string name = 3 [(buf.validate.field).string.min_len = 1];
}
message A { B b = 1; }                                   // live cycle (A <-> B)
message B { A a = 1; int32 v = 2 [(buf.validate.field).int32.gt = 100]; }
message C { D d = 1; }                                   // rule-free cycle (C <-> D)
message D { C c = 1; }
```

The plan graph (plan nodes and the message-field edges between them):

```
Root ──a──▶ A ──b──▶ B ──a──▶ A        (B also has the leaf rule v > 100)
  │
  └──c──▶ C ──d──▶ D ──c──▶ C          (no rules anywhere in C/D)

Root also holds the leaf rule  name.min_len = 1
```

### Phase 1a — per-plan liveness (`collectLiveness`, cutting at plan nodes)

| plan | `localLive` | `edges` | why |
|------|-------------|---------|-----|
| `B`    | **true**  | `[A]`   | holds the `int32.gt` rule on `v`; its `a` field is an edge to `A` |
| `A`    | false     | `[B]`   | only a message field `b` → edge to `B` |
| `D`    | false     | `[C]`   | only a message field `c` → edge to `C` |
| `C`    | false     | `[D]`   | only a message field `d` → edge to `D` |
| `Root` | **true**  | `[A, C]`| holds the `string.min_len` rule on `name`; `a`/`c` are edges |

### Phase 1b — least fixpoint

Start all dead; iterate `live(P) = localLive(P) OR any(live(edge))`. Liveness
propagates one hop per pass, so with plans in cache order (`Root, A, B, C, D`)
`A` goes live the pass after `B` does:

| pass | Root | A | B | C | D |
|------|------|---|---|---|---|
| start | dead | dead | dead | dead | dead |
| 1 | **live** (localLive) | dead (`B` not yet live) | **live** (localLive) | dead | dead |
| 2 | live | **live** (edge→`B`) | live | dead | dead |
| 3 | live | live | live | dead | dead | ← no change, converged |

`B`, `A`, `Root` are live; `C`, `D` stay dead — the rule-free cycle never found a
rule to make it live. (The final result is independent of plan order; only the
number of passes varies.)

### Phase 2 — prune

- **`Root`**: `name`'s rule is live (kept); `a` → `A` is live (kept); `c` → `C`
  is dead, so the `c` field's wrapper prunes to empty and the `EvalField` for `c`
  is removed.
- **`A`**: `b` → `B` is live (kept).
- **`B`**: the `v` rule is kept; `a` → `A` is live (kept), so the back-edge
  survives and deep recursion is validated at every level.
- **`C`, `D`**: every child is a dead plan edge, so each prunes to an empty
  `EvalMany`. Nothing references them anymore (Root dropped `c`), so they are
  simply unreachable.

### Result

Validating a `Root` checks `name`, then descends `a → b → v` recursively to any
depth, and **never touches `c`** — the `C`/`D` subgraph is gone. This is exactly
the two behaviors the design must get right at once:

- the `A`/`B` back-edge is **kept** (no validation bypass, even though `A` itself
  has no direct rule — it is live purely by reaching `B`), and
- the rule-free `C`/`D` cycle is **removed** (a `Struct`-like field is not walked).

## Complexity

Let *N* be the number of plan nodes and *E* the message-field edges among them,
and *S* the total size of the acyclic subtrees.

- Phase 1a visits every node once: O(N + S).
- Phase 1b is a monotone fixpoint over the plan graph: O(N · E) worst case, with
  *N* and *E* bounded by the schema, never by the data.
- Phase 2 prunes each plan once: O(N + S).

All of it runs on the first `validate` of a type (then the plan is cached), and
is independent of message size.

## Invariants

- A plan is live **iff** it contains a rule of its own or reaches a live plan.
  Equivalently, a plan is dead iff no violation is reachable from it.
- Pruning removes only dead (no-op) subtrees, so it never changes a verdict: a
  removed node could not have produced a violation.
- Traversal terminates on any cyclic graph because it never recurses through a
  plan node — plan nodes are resolved from the precomputed `live` map.

## Classification

This pass is **dead-code elimination (DCE)** driven by a **monotone data-flow
analysis** solved by **iterative least-fixpoint (worklist / chaotic) iteration**
— the classical framework of Kildall [1] (textbook treatments: Aho, Lam, Sethi &
Ullman, ch. 9 [2]; Nielson, Nielson & Hankin [3]). The property it computes is a
**backward "may-reach" reachability**: a plan is *needed* iff it can reach a node
that emits a violation. Over the two-point lattice `dead ⊏ live`, successors are
combined with ∨ (a *may* analysis), so the answer is the **least fixpoint**,
reached by propagating `live` backward along edges until stable. What the code
calls *liveness* is this neededness/reachability — not classical live-variable
analysis [2, §9.2.5], which is about whether a variable's value is used before
being redefined.

Two equivalent formulations:

- **Mark-and-sweep.** Phase 1 *marks* every plan that can reach a rule (reverse
  reachability from the rule nodes); phase 2 *sweeps* the unmarked. This is
  structurally the mark-sweep collector of McCarthy [4] (modern reference: Jones,
  Hosking & Moss [5]), with "reaches a violation" in place of "reachable from a
  root."
- **SCC condensation.** Condensing the plan graph's strongly connected components
  into a DAG [6] lets neededness be computed in one reverse-topological pass (a
  plan is needed iff its SCC is self-needed or reaches a needed SCC) — the
  linear-time alternative to iterating to a fixpoint. We iterate instead because
  the graph is schema-sized and the fixpoint is simpler to implement.

The overall "analyze, then rewrite" shape — settle the fixpoint before removing
anything — is the standard structure of an optimizing compiler pass [2].

### References

1. G. A. Kildall. "A Unified Approach to Global Program Optimization." *Proc. 1st
   ACM SIGACT–SIGPLAN Symposium on Principles of Programming Languages (POPL)*,
   1973, pp. 194–206. doi:10.1145/512927.512945.
2. A. V. Aho, M. S. Lam, R. Sethi, J. D. Ullman. *Compilers: Principles,
   Techniques, and Tools*, 2nd ed. Addison-Wesley, 2006. Ch. 9
   ("Machine-Independent Optimizations": data-flow analysis, iterative
   frameworks, dead-code elimination; live-variable analysis in §9.2.5).
3. F. Nielson, H. R. Nielson, C. Hankin. *Principles of Program Analysis*.
   Springer, 1999. (Monotone frameworks, the MFP solution, the worklist
   algorithm.)
4. J. McCarthy. "Recursive Functions of Symbolic Expressions and Their
   Computation by Machine, Part I." *Communications of the ACM* 3(4), 1960, pp.
   184–195. doi:10.1145/367177.367199. (Origin of mark-and-sweep.)
5. R. Jones, A. Hosking, E. Moss. *The Garbage Collection Handbook: The Art of
   Automatic Memory Management*. CRC Press, 2011.
6. R. E. Tarjan. "Depth-First Search and Linear Graph Algorithms." *SIAM Journal
   on Computing* 1(2), 1972, pp. 146–160. doi:10.1137/0201010.
