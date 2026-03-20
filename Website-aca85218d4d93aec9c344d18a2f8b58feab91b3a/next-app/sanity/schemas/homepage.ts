// ── Schema: homepage (singleton) ─────────────────────────────
import { defineType, defineField } from 'sanity';

export default defineType({
  name:  'homepage',
  title: 'Homepage',
  type:  'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name:  'hero',
      title: 'Hero Section',
      type:  'object',
      fields: [
        { name: 'headline',    title: 'Headline',    type: 'string' },
        { name: 'subheadline', title: 'Subheadline', type: 'text', rows: 2 },
        {
          name: 'ctaPrimary', title: 'Primary CTA', type: 'object',
          fields: [
            { name: 'label', title: 'Button Label', type: 'string' },
            { name: 'url',   title: 'URL',          type: 'string' },
          ],
        },
        {
          name: 'ctaSecondary', title: 'Secondary CTA', type: 'object',
          fields: [
            { name: 'label', title: 'Button Label', type: 'string' },
            { name: 'url',   title: 'URL',          type: 'string' },
          ],
        },
        {
          name: 'backgroundImage', title: 'Background Image', type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }],
        },
      ],
    }),
    defineField({
      name:  'trustBadges',
      title: 'Trust Badges',
      type:  'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'icon',  title: 'Icon (emoji or SVG name)', type: 'string' },
          { name: 'label', title: 'Label',                    type: 'string' },
          { name: 'value', title: 'Value / Stat',             type: 'string' },
        ],
      }],
    }),
    defineField({
      name:        'featuredVehicleStockNumbers',
      title:       'Featured Vehicle Stock Numbers',
      description: 'Up to 6 stock numbers to pin on the homepage inventory section.',
      type:        'array',
      of:          [{ type: 'string' }],
      validation:  r => r.max(6),
    }),
    defineField({
      name:  'promoBanner',
      title: 'Promo Banner',
      type:  'object',
      fields: [
        { name: 'enabled',  title: 'Show Banner', type: 'boolean' },
        { name: 'headline', title: 'Headline',    type: 'string' },
        { name: 'body',     title: 'Body Text',   type: 'text', rows: 2 },
        { name: 'ctaLabel', title: 'CTA Label',   type: 'string' },
        { name: 'ctaUrl',   title: 'CTA URL',     type: 'string' },
        { name: 'bgColor',  title: 'Background Color (hex)', type: 'string' },
      ],
    }),
    defineField({
      name:  'testimonials',
      title: 'Testimonials',
      type:  'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name',   title: 'Customer Name', type: 'string' },
          { name: 'rating', title: 'Rating (1–5)',  type: 'number', validation: r => r.min(1).max(5) },
          { name: 'body',   title: 'Review Text',   type: 'text', rows: 3 },
          { name: 'date',   title: 'Date',          type: 'date' },
        ],
        preview: { select: { title: 'name', subtitle: 'body' } },
      }],
    }),
    defineField({
      name:  'faqHighlights',
      title: 'FAQ Highlights (on homepage)',
      type:  'array',
      of:    [{ type: 'reference', to: [{ type: 'faqItem' }] }],
      validation: r => r.max(6),
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
});
