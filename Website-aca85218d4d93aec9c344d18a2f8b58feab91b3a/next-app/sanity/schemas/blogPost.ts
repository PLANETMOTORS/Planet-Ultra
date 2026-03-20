// ── Schema: blogPost ─────────────────────────────────────────
import { defineType, defineField } from 'sanity';

export default defineType({
  name:  'blogPost',
  title: 'Blog Post',
  type:  'document',
  icon: () => '📝',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({
      name:    'slug',
      title:   'Slug',
      type:    'slug',
      options: { source: 'title', maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'excerpt',  title: 'Excerpt',  type: 'text', rows: 3 }),
    defineField({
      name:    'category',
      title:   'Category',
      type:    'string',
      options: {
        list: [
          { title: 'EV Tips',        value: 'ev-tips' },
          { title: 'Buying Guides',  value: 'buying-guides' },
          { title: 'News',           value: 'news' },
          { title: 'Planet Motors',  value: 'planet-motors' },
        ],
      },
    }),
    defineField({
      name:    'coverImage',
      title:   'Cover Image',
      type:    'image',
      options: { hotspot: true },
      fields:  [{ name: 'alt', title: 'Alt Text', type: 'string' }],
    }),
    defineField({
      name:  'author',
      title: 'Author',
      type:  'object',
      fields: [
        { name: 'name', title: 'Name', type: 'string' },
        { name: 'bio',  title: 'Bio',  type: 'text', rows: 2 },
        {
          name: 'avatar', title: 'Avatar', type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }],
        },
      ],
    }),
    defineField({
      name:  'body',
      title: 'Body',
      type:  'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt',     title: 'Alt Text',   type: 'string' },
            { name: 'caption', title: 'Caption',    type: 'string' },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' },
  },
  orderings: [{
    title: 'Published (newest first)',
    name:  'publishedAtDesc',
    by:    [{ field: 'publishedAt', direction: 'desc' }],
  }],
});
