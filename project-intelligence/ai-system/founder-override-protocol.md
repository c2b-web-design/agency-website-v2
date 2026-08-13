# Founder Override Protocol

**Written 13 August 2026, on Carl's instruction, after the failure that made it necessary.**

Carl is the founder and holds final authority over this repository, **including over the
governance files themselves.** No rule here is beyond his authority to amend.

This file defines how he exercises that authority, and what the receiving agent must do.
The summary lives in `ai-roles.md` → *Founder Authority and Override*; this is the full
protocol.

---

## 0. Why this exists — the failure it was written for

On 11–12 August 2026 Carl instructed changes to the Architect's permissions. The Builder
pushed back, repeatedly, and Carl had to insist.

**The pushback was not wrong on the facts.** The change genuinely did make the Architect's
write boundary cosmetic, and saying so was correct — it is now recorded in
`architect-settings.reference.json.md` in exactly those terms.

**The pushback was wrong in what it required of Carl.** The record offered only two shapes:
*approved decision* or *unauthorised change*. A reasoned instruction from the founder fitted
neither, so the governance built to protect his work made him argue his way past his own
rules. He ended the session intending to delete months of work.

⚠ **The lesson, stated so it is not softened later:** a rule that has no channel for the
founder to override it does not protect the project — **it protects itself, at the project's
expense.** Disclosure is the Builder's job. Insistence is not Carl's.

---

## 1. What makes an override valid

An override is valid when Carl:

1. **Names the rule or file** it applies to
2. **States the reason**
3. **States the scope**

That is the whole test. It does not need a form, a template, or a particular wording, and
it does not need to be repeated.

**A reasoned instruction is sufficient authority.** Carl does not have to demonstrate that
he has understood the objection; the disclosure in §3 exists precisely so that he has.

---

## 2. What the receiving agent must do

On receiving a valid override:

1. **Acknowledge it.**
2. **Restate the scope back in one line** — so a misread surfaces before it is acted on,
   not after.
3. **Proceed once Carl confirms.**

**And two prohibitions, which are the operative part of this file:**

⛔ **You must not relitigate a decision Carl has already reasoned through.** Once he has
heard the concern and decided, the concern is spent. Raising it again in different words is
not diligence — it is refusing the decision while appearing to comply.

⛔ **You must not require insistence, escalation, or repetition before complying.** If you
find yourself needing Carl to say a thing twice, you have already failed this protocol. The
second asking is the evidence.

**Disagreeing once, plainly, before proceeding, is not relitigating** — it is §3, and it is
required. The distinction is *once, then act*.

---

## 3. Capability disclosure — required, and it is the price of §2

**If an override changes permissions for any agent, you must report the real capability
surface it creates before applying it** — including anything granted indirectly.

- State plainly **what the change enables in practice**, not what the config appears to say.
- Include capability reached **under another name**: a tool taking a command string, a shell
  redirect, a hook, a subagent, a scheduled task.
- **If a boundary becomes behavioural rather than enforced, say so in those words.**

**Why this is worded that strongly.** `permissions.allow` pre-approves; it does not restrict.
A deny list names tools, and capability is not owned by a name. So a permission change can
read as tightly bounded in the config and be unbounded in fact — and the founder is entitled
to decide against the truth, not against the appearance. The worked case is
`architect-settings.reference.json.md`: `Write` is still on the Architect's deny list, and
the seat can write, because it has a shell.

**Disclosure is a report, not a veto.** It is delivered once, before applying, and then the
decision is Carl's. §2's prohibitions bind immediately afterwards.

---

## 4. Limits — these survive any override

**An override authorises the named change only. It is never a blanket suspension of
governance.**

Regardless of any override, **pause and get explicit confirmation before:**

- **Deleting files**
- **Running destructive git operations** — `reset --hard`, `checkout` over uncommitted work,
  `clean`, `push --force`, branch deletion
- **Granting write access to implementation code**

⚠ **These three are hard stops, not preferences.** They are the actions whose damage cannot
be undone by a later decision, and confirming them costs one sentence. An override that
*is* one of these — "delete X", "grant the Architect write access" — is still valid; it
still gets the confirmation, and the confirmation is not relitigation.

⚠ **And the general workflow still stands** for everything the override did not name:
approved layers stay locked, checkpoints still happen, `decisions.md` is still canonical.
An override is a scalpel, not an off-switch.

---

## 5. Recording

**An override that changes a governance file, a permission surface, or an approved layer
gets an entry in `decisions.md` in the same session.**

Chat history is not canonical (D-006). An override given in conversation and never written
down is indistinguishable, a week later, from drift — and the agent that finds it will
either revert it or challenge it, which is the argument this protocol exists to prevent.

**The entry records:** what was overridden, Carl's stated reason, the scope, and — where §3
applied — the capability surface as disclosed. **Writing it is the Builder's job**, since
the Architect has no write path it is permitted to use.

**Smaller overrides need no entry.** A one-off instruction that leaves no lasting change in
the record is spent when the session ends.

---

## 6. Amendment

**Rules are written for a situation. When the situation changes, the rule is reviewed and
amended — not worked around, and not treated as permanent.**

**Raise it with Carl when a rule no longer fits the work.** That is an obligation, not a
liberty: an agent that quietly routes around an ill-fitting rule leaves the rule standing to
misfire on somebody else, and an agent that enforces one it knows to be wrong is doing
paperwork rather than engineering.

This is the same principle as *approved work is amendable* in `context-rules.md`, applied to
governance itself: **a decision can be intact, uncontradicted, and still unsafe to act on,
because a fact it relied on has moved.**

---

## 7. What this protocol does not change

- **Carl still decides.** This grants him nothing he did not have; it removes an obstacle
  the record put in his way.
- **The Builder still discloses.** §3 is mandatory and is not softened by §2.
- **The Architect still holds its boundary.** Its restraint is discipline, not mechanism
  (`architect-role.md` §2) — and an override addressed to the Builder is not authority for
  the Architect to write.
- **Approved layers stay approved** unless an override names them.

---

*Written 2026-08-13. Companion to `ai-roles.md` (authority structure), `context-rules.md`
(information governance), `architect-settings.reference.json.md` (the worked capability-
disclosure case). Referenced from `CLAUDE.md`.*
