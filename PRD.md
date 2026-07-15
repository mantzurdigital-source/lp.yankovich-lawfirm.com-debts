# PRD — Adv. Haim Yankovich Landing Page

## Goals
Primary conversion: lead form submission. Secondary: phone call / WhatsApp click. Success = qualified visitors (people with real, unresolved debt situations) reaching out.

## Audience
Israeli adults with unresolved debt / execution-office (הוצאה לפועל) proceedings / creditor pressure, unsure which legal path fits their situation. See `brief.md` for emotional profile.

## Tone
Calm authority. Discreet, personal guidance from an experienced lawyer — not a sales funnel. "There's more than one path, let's find yours" rather than "we'll erase your debt."

## Visual / Color Direction
Client's real brand colors (sampled from their live logo/site), not a generic template palette:

- `--navy`: #14213D (primary text / header background accents)
- `--navy-2`: #1F2E4D (secondary dark)
- `--gold`: #A6824F (accent — CTAs, headings, icons)
- `--gold-d`: #8C6B3E (hover state)
- `--gold-l`: #F3ECDD (light tint backgrounds, card fills)
- `--cream`: #FAF9F5 (section background alternation)
- White base background, dark navy text on white — light page, not dark-mode.

Typography: Heebo (Hebrew-optimized, matches the quality bar reference page).

Reference for build quality/structure: `liorcaspi/liorcaspi-diagnostic` (light, card-based, restrained, real photography) — NOT `liorcaspi_landingpage` (that one is the dark-luxury variant; do not use dark+gold background here per workspace rule against defaulting to that palette).

## Sections
1. Sticky header — logo monogram, firm name, phone number CTA
2. Hero — headline + subheadline + real portrait + primary CTA (scroll to form) + soft secondary CTA
3. Recognition — "you're not alone" section, plain-language situations
4. Three paths comparison (core differentiator, real content from client's guide)
5. Authority / about Adv. Yankovich — 25+ years, personal/discreet approach, portrait
6. Why choose us — icon grid
7. Lead form — name, phone, short note (optional)
8. FAQ
9. Footer — contact details, address, sitemap-lite
10. Sticky WhatsApp floating button (explicit client request) + phone always visible in header

## Out of scope for v1
Interactive diagnostic questionnaire (like Lior Caspi's) — decided against for this build to keep scope tight. Revisit if the static page converts well.
