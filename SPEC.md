# SPEC

Source of truth for theclearpath-portal (Next.js `/app` directory). Follow these rules for every change.

## Core Principles
- Follow this spec only; no redesigns or scope creep. Keep diffs minimal and isolate edits to one file per change.
- Use Tailwind design tokens only. Do not add inline styles or raw hex values.
- Public marketing pages: `/`, `/intake`, `/plans`, `/login`. Guard `/patient|/therapist|/admin` routes via `auth_jwt` in middleware.

## Brand Tokens
- Primary surface colour token: `#1F4142`.
- Surface tokens: `#DFD6C7` (surface) and `#D1C2AF` (surface2).

## Layout & Spacing
- Standard section wrapper: `max-w-6xl` with `px-6 py-16` and `gap-12` between major blocks.
- Hero must be a two-column layout with `/public/hero.jpg` in `aspect-[16/9]` and generous copy spacing.

## Header
- Logo renders at `200x55`. Navigation links: `Get started` → `/intake`, `Plans` → `/plans`.
- Right aligned CTA: show `Portal` when `auth_jwt` is present, otherwise `Login`. Header is sticky with `bg-surface` and focus-visible rings.

## Footer
- Background uses `surface2` token with larger typography. Provide links to `Privacy` (`/legal/privacy-policy`) and `Contact` (`/support`).

## Survey (Intake)
- User-facing name is “Survey”; URLs remain `/intake`.
- Intake CTA enables only when all nine fields are non-empty: `anxiety`, `sleep`, `country`, `language`, `therapistGender`, `dob`, `priorTherapy`, `risk`, `goal`. When complete, navigate to `/plans`.
- Each field requires a `name` attribute matching its key.

## Plans Page
- Present the recommended plan with a “Why this plan” section and a link to `/patient/sessions`.
- Do not include refund or VAT text.

## Metadata
- Set canonical URLs on public pages. OpenGraph and Twitter metadata should reference `/public/og.jpg` (1200×630).
