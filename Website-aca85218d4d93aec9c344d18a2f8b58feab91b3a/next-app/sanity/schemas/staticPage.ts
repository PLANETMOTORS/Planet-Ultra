// ── Schema: staticPage ───────────────────────────────────────
import { defineType, defineField } from 'sanity';

export default defineType({
  name:  'staticPage',
  title: 'Static Page',
  type:  'document',
  icon: () => '📄',
  fields: [
    defineField({ name: 'title', title: 'Page Title',  type: 'string', validation: r => r.required() }),
    defineField({
      name:    'slug',
      title:   'Slug',
      type:    'slug',
      options: {
        source: 'title',
        slugify: (input: string) => input.toLowerCase().replace(/\s+/g, '-').slice(0, 96),
      },
      validation: r => r.required(),
    }),
    defineField({ name: 'seoTitle',       title: 'SEO Title (overrides page title)', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description',                  type: 'text', rows: 2 }),
    defineField({
      name:  'body',
      title: 'Body Content',
      type:  'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt',     title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption',  type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name:  'sections',
      title: 'Sections',
      type:  'array',
      of: [
        {
          type: 'object',
          name: 'contentSection',
          title: 'Content Section',
          fields: [
            { name: 'headline', title: 'Headline', type: 'string' },
            { name: 'body',     title: 'Body',     type: 'text', rows: 4 },
            {
              name: 'image', title: 'Image', type: 'image',
              options: { hotspot: true },
              fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }],
            },
            {
              name: 'items', title: 'List Items', type: 'array',
              of: [{
                type: 'object',
                fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                  { name: 'value', title: 'Value', type: 'string' },
                  { name: 'icon',  title: 'Icon',  type: 'string' },
                ],
                preview: { select: { title: 'label', subtitle: 'value' } },
              }],
            },
          ],
          preview: { select: { title: 'headline' } },
        },
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
