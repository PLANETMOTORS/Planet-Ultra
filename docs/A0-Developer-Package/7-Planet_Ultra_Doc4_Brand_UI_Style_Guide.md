# 7 — Planet Ultra Doc4 Brand UI Style Guide

## Brand Intent
Build a trust-first modern automotive experience: clear pricing, clear condition, clear next step.

## Visual System
- Use design tokens (CSS variables) as source of truth.
- Keep strong contrast and readable typography.
- Button hierarchy:
  - Primary: conversion actions (`Apply`, `Reserve`, `Continue`)
  - Secondary: utility actions (`Save`, `Compare`)
  - Tertiary: low-priority actions

## Component Standards
- Cards: consistent spacing, price prominence, clear CTA.
- Forms: single responsibility per step, inline validation, accessible labels.
- Tables/lists: responsive, keyboard-navigable, clear empty states.
- Alerts: success/warn/error states with plain-language instructions.

## Content Voice
- Transparent, no bait language.
- Confidence without hype.
- Explain finance/deposit outcomes in plain terms.

## Trust Modules (Required on VDP)
- Condition/inspection summary.
- History/report link.
- All-in pricing summary.
- Delivery/pickup expectations.
- Return/cancellation policy summary.

## Accessibility
- WCAG AA baseline.
- Keyboard navigation on all core flows.
- Focus states visible.
- Error messages tied to fields and screen-reader friendly.

## Performance UX Rules
- Avoid layout shift in image-heavy areas.
- Progressive media loading with explicit placeholders.
- Keep primary conversion actions above fold on mobile.
