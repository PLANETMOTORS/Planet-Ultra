// ── Schema: promotion ────────────────────────────────────────
import { defineType, defineField } from 'sanity';

export default defineType({
  name:  'promotion',
  title: 'Promotion',
  type:  'document',
  icon: () => '🎯',
  fields: [
    defineField({ name: 'title',    title: 'Internal Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'active',   title: 'Active',         type: 'boolean', initialValue: true }),
    defineField({ name: 'headline', title: 'Headline',       type: 'string' }),
    defineField({ name: 'body',     title: 'Body Text',      type: 'text', rows: 3 }),
    defineField({ name: 'ctaLabel', title: 'CTA Button Label', type: 'string' }),
    defineField({ name: 'ctaUrl',   title: 'CTA URL',          type: 'string' }),
    defineField({
      name:    'image',
      title:   'Image',
      type:    'image',
      options: { hotspot: true },
      fields:  [{ name: 'alt', title: 'Alt Text', type: 'string' }],
    }),
    defineField({
      name:        'pages',
      title:       'Show on Pages',
      description: 'Leave empty to show everywhere.',
      type:        'array',
      of:          [{ type: 'string' }],
      options: {
        list: [
          { title: 'Home',        value: 'home' },
          { title: 'Inventory',   value: 'inventory' },
          { title: 'Finance',     value: 'finance' },
          { title: 'Sell',        value: 'sell' },
          { title: 'About',       value: 'about' },
          { title: 'Contact',     value: 'contact' },
          { title: 'FAQ',         value: 'faq' },
          { title: 'Protection',  value: 'protection' },
          { title: 'Blog',        value: 'blog' },
        ],
      },
    }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'active', media: 'image' },
    prepare: ({ title, subtitle, media }: { title: string; subtitle: boolean; media: unknown }) => ({
      title,
      subtitle: subtitle ? 'Active' : 'Inactive',
      media,
    }),
  },
});
