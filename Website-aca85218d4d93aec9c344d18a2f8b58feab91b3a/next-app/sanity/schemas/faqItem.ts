// ── Schema: faqItem ──────────────────────────────────────────
import { defineType, defineField } from 'sanity';

export default defineType({
  name:  'faqItem',
  title: 'FAQ',
  type:  'document',
  icon: () => '❓',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: r => r.required() }),
    defineField({ name: 'answer',   title: 'Answer',   type: 'text',   rows: 4, validation: r => r.required() }),
    defineField({
      name:    'category',
      title:   'Category',
      type:    'string',
      options: {
        list: [
          { title: 'Buying Process',    value: 'buying-process' },
          { title: 'Financing',         value: 'financing' },
          { title: 'Delivery',          value: 'delivery' },
          { title: 'Returns',           value: 'returns' },
          { title: 'EV / Electric',     value: 'ev' },
          { title: 'Protection Plans',  value: 'protection' },
          { title: 'General',           value: 'general' },
        ],
      },
    }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' },
  },
  orderings: [{
    title: 'Sort Order',
    name:  'orderAsc',
    by:    [{ field: 'order', direction: 'asc' }],
  }],
});
