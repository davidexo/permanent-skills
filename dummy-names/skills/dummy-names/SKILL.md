---
name: dummy-names
description: Use this fixed roster of 13 names for ALL placeholder/dummy people in any user interface — UI mockups, prototypes, sample data, tables, lists, avatars, comments, chat threads, notification previews, or any component that shows a person's name. Trigger this whenever you need a stand-in person's name, email, avatar, or profile in a design or sample dataset, even if the user doesn't say "use my names" — never invent generic placeholders like "John Doe", "Jane Smith", "User 1", or random names. Also use for full personas (name + email + role + avatar initials).
---

# Dummy Names

The single source of truth for placeholder people in David's designs. Whenever a UI needs a fake person — a name in a table row, an avatar, a comment author, a chat participant, a "assigned to" field, a notification like "X mentioned you" — pull from this roster instead of inventing names.

## The roster (use in this exact spelling)

1. Adam Whitfield
2. Albert Zimtea
3. Alexa Reichhart
4. Antoine Plu
5. Christian Bollmann
6. David Bielenberg
7. Hugo Díaz
8. Leon Guaiana
9. Niclas Ernst
10. Paolo Sabatella
11. Suleiman Zakari Mohammed
12. Théau Sarr
13. Will DiMondi

## How to use them

**Order:** Don't march down the list 1→13 every time. Shuffle / pick to fit the context so mockups feel realistic (e.g. a "recent activity" feed shouldn't be alphabetical). Keep any single mockup internally consistent — the same person keeps the same email and initials everywhere they appear.

**Never** substitute, translate, shorten, or "correct" the spelling. `Théau Sarr`, `Hugo Díaz`, and `Suleiman Zakari Mohammed` keep their exact accents and length. These edge cases are deliberate — they stress-test truncation, wrapping, and diacritic rendering in a real design system.

**How many:** Use as many as the UI needs. If a component needs more than 13 rows, reuse the roster rather than inventing new names, unless the design specifically requires unique names beyond 13 — in that case, flag it to David.

## Deriving full personas

When the UI needs more than a bare name, derive the extra fields deterministically from the roster so they're stable across a design:

- **Avatar initials:** first letter of first + last name — `AW`, `AZ`, `AR`, `AP`, `CB`, `DB`, `HD`, `LG`, `NE`, `PS`, `SM`, `TS`, `WD`. (For `Suleiman Zakari Mohammed`, use `SM`.)
- **Email:** `firstname@permanent.is`, lowercased, accents stripped. E.g. `theau@permanent.is`, `hugo@permanent.is`, `suleiman@permanent.is`. These people work at PERMANENT, so default to the `@permanent.is` domain. Only swap the domain if the mockup depicts a different company's users (e.g. customer accounts), keeping the local part.
- **Roles / titles:** don't use a fixed list — invent roles on the fly to fit the product and screen being designed. A team-settings page for a dev tool wants "Engineering Lead" / "Frontend Engineer"; a CRM wants "Account Executive" / "Sales Ops"; a hospital admin panel wants "Attending Physician" / "Nurse Manager". Match the role set to whatever the mockup depicts. Keep a person's role consistent within one mockup.
- **Avatar images:** don't hotlink real photos. Use initials-on-colored-background avatars, or a neutral placeholder service. Assign each person a stable background color if the design uses colored avatars.

See `references/personas.md` for a ready-made table with every derived field filled in, if you want to copy values directly rather than deriving them.
