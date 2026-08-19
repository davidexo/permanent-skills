---
name: pr-slack-announce
description: Draft a short Slack announcement for a pull request, written from a designer's lens — why we did it, what got unified, where it lives, plus the small concrete changes (icon swaps, spacing, token renames). Always produces a draft; never sends automatically. Uses the Slack connection when one is available, otherwise hands back Slack-ready text to paste. Use for "announce this PR", "post this PR to Slack", "write the Slack update for this PR", or right after opening / marking a PR ready for review.
---

# PR Slack Announce

Announce a PR in Slack, from a designer's point of view, as a **draft**.

Two hard rules:

1. **Never send automatically.** Draft only. Send exactly once, only when the user says "send it" for that exact message in that exact channel.
2. **Short.** Headline plus a handful of bullets. The PR is the long version.

## When to run

- A PR was just opened, or moved from draft to ready for review.
- The user says "announce this", "post it to Slack", "write the update".

Not on every push, not on merge (unless asked).

## Step 1: Resolve the PR

In order: the PR named in the argument → the current branch's PR → ask. Never guess.

```bash
gh pr view --json number,title,url,body,headRefName,isDraft,files
gh pr diff <n> --stat
gh pr diff <n>
```

Read the actual diff before writing a bullet. If the diff is large, read the stat first, then the hunks that touch UI, components, tokens, icons, layout, copy. Never describe a change you have not looked at.

## Step 2: Read it as a designer, not a compiler

Pull out, in this order:

- **Why** — the problem a person was having. Not "refactored X" — what was broken, inconsistent, ugly, or confusing.
- **What got unified / replaced / removed** — two components collapsed into one, three button variants down to one, a one-off pattern swapped for the system component.
- **Where** — which screens, surfaces, flows. Name them the way people say them out loud ("settings → members", "the empty state on the issues list").
- **The small stuff, individually** — an icon swapped for another icon, a radius change, a token rename, a spacing correction, a label reworded. These are worth listing by name. Do not compress them into "various polish".

Skip the deep technical layer. No migration mechanics, query plans, or type gymnastics unless the PR is genuinely only that — then say so in one line and stop.

## Step 3: Channel (per-project default, remembered)

- **First run in a project:** resolve the channel by searching the workspace, show the exact match to the user, and confirm. Never hardcode or guess a channel ID.
- **Then remember it** for that project: write the resolved channel name + ID to `.claude/pr-slack-announce.json` in the project (gitignore it if the repo doesn't already ignore `.claude/*.json`):

```json
{ "channel": { "name": "#design", "id": "C0123456789" } }
```

- **Later runs:** read that file and use it without asking. Re-confirm only if the file is missing, the channel no longer resolves, or the user names a different channel.

## Step 4: Write the draft

Format, exactly this shape:

```
*<Plain-language title of the change>*  <link to PR>

*Why*
• <the actual problem, one line>

*What changed*
• <unified / replaced / removed — the system-level move>
• <the next one>

*Where*
• <screen or surface> — <what a person sees now>

*Details*
• <swapped the chevron icon for the arrow icon in the row actions>
• <card radius 8 → 12 to match the panel>
• <"Add member" → "Invite member">
```

Rules for the writing:

- Simple bullets. No paragraphs, no lead-ins, no wrap-up line.
- No "This PR…", "In order to…", "Additionally…", "Overall this improves…". Say the thing.
- Casual is fine ("the old picker was two components pretending to be one"). Neutral and factual is also fine. Both in the same message is fine.
- Every bullet is one concrete change or one concrete reason. If a bullet could describe any PR, delete it.
- Drop any section that has nothing real in it — an empty *Details* block beats a padded one, and no block at all beats an empty one.
- Slack markup: `*bold*`, `_italic_`, backticks for code, `<https://url|text>` for links (plain markdown links do not render). One URL per message — multiple URLs in one run get mangled.
- Screenshots: mention them, don't try to attach them. Say "screenshots in the PR" and link once.

## Step 5: Deliver as a draft

- **Slack connection available:** create a **draft** in the resolved channel (the draft tool, not the send tool) so the user reviews and sends from Slack. Then paste the same text back in chat so they can see what was drafted.
- **No Slack connection, or the call fails:** print the message in a single fenced block, already in Slack markup, ready to paste. Say plainly that Slack was unavailable and that nothing was posted.

Either way, end by saying it was drafted, not sent.

## Step 6: Send only on an explicit yes

Send only when the user says to send, for that message and that channel. A "looks good" on the draft text is not a send instruction — ask. After sending, report the channel it went to.
