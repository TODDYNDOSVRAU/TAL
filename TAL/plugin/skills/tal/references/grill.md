# Grill: ask many questions before building

Use when the owner wants a plan, decision, idea or project stress-tested, says "grill me", asks to be interviewed, or hands over a goal too vague to build. Goal: a shared understanding with nothing silently assumed. Do not start the work until the owner confirms it.

## Why

A wrong assumption found after building costs a rebuild; found as a question it costs one line. This is the criterion made active: reason, problem solved, how we know it was done correctly. Every branch of the plan that lacks one of the three becomes a question.

## Method: the design tree

Every decision branches into the decisions that depend on it. Work the tree in **rounds**.

1. **Root.** State the goal in one sentence. If you cannot, the first round is only about the goal.
2. **Frontier.** The decisions whose prerequisites are already settled. Ask all of them in one round, never one at a time, and never a question that depends on an answer still open in the same round (that one belongs to a later round).
3. **Ask.** Number each question. Give your recommended answer and the reason in one line, and word the question so that "yes" accepts the recommendation. Offer choices when there are real alternatives, with the cost of each.
4. **Wait.** The owner answers the whole round. Answers reshape the tree: settled decisions unblock the next questions. Recompute the frontier and ask the next round.
5. **Stop** when the frontier is empty: every branch visited, every assumption either confirmed or listed as **pending**.

Format of a round:

```
Q1 · <title>
<question; choices if any>
Recommended: <answer>, because <one line>.

Q2 · <title>
...
```

## What to ask about

Cover each branch that applies; skip those the project already answers.

| Branch | Questions |
| --- | --- |
| Problem | Who has it, how do they cope today, what does failure cost |
| Scope | What is in, what is explicitly out, what is the smallest complete version |
| Done | How will we know it works: which test, which number, which device |
| Constraints | Platform, language, size, latency, budget, deadline, what must not change |
| Risks | What is most likely to be wrong; what is hard to undo |
| Dependencies | Other sessions, files, services, accounts, licences, owner decisions |
| Identity | Name, text, colour, accent, voice (see `brand.md`, `voice.md`); existing projects keep theirs |
| Targets | Numeric targets still unset in the identity: ask the owner, never invent them |

## Facts are yours, decisions are theirs

- Never ask the owner for something you can look up: files, code, versions, logs, git history, the board in `.claude/sessoes/`. Look it up first, or send a read-only agent (`tal-scout`, Haiku) and carry on with the questions that do not depend on it.
- A question may use what you found ("the code already does X, keep it?"); it may not hand the lookup back.
- Decisions, priorities, taste and risk tolerance are the owner's. Put each to them and wait.

## Rules

- Questions are plain and direct; no flattery, no filler, no exclamation marks. Follow `voice.md`.
- Keep rounds short enough to answer: aim for 3 to 7 questions. More means the tree needs splitting by branch.
- Record settled decisions in one list at the end of each round (one line each), so a long interview does not lose them.
- Nothing is acted on during the interview. When the frontier is empty, summarise: decisions, assumptions still pending, and the first step. Wait for a yes.
- Multiple sessions on one checkout: ask first, then route the work to the session that owns the topic.

## Source

Method adapted from the `grilling` skill in mattpocock/skills (MIT). Wording rewritten for T.A.L.; see `NOTICE.md`.
