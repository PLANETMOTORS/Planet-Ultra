// ── Schema: siteSettings (singleton) ────────────────────────
import { defineType, defineField } from 'sanity';

export default defineType({
  name:  'siteSettings',
  title: 'Site Settings',
  type:  'document',
  icon: () => '⚙️',
  fields: [
    defineField({ name: 'dealerName', title: 'Dealer Name', type: 'string' }),
    defineField({ name: 'phone',      title: 'Phone',       type: 'string' }),
    defineField({ name: 'email',      title: 'Email',       type: 'string' }),
    defineField({ name: 'address',    title: 'Street Address', type: 'string' }),
    defineField({ name: 'city',       title: 'City',        type: 'string' }),
    defineField({ name: 'province',   title: 'Province',    type: 'string' }),
    defineField({ name: 'postalCode', title: 'Postal Code', type: 'string' }),
    defineField({ name: 'lat',        title: 'Latitude',    type: 'number' }),
    defineField({ name: 'lng',        title: 'Longitude',   type: 'number' }),
    defineField({ name: 'omvicNumber', title: 'OMVIC Registration #', type: 'string' }),
    defineField({
      name:  'hours',
      title: 'Business Hours',
      type:  'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'day',   title: 'Day',   type: 'string' },
          { name: 'hours', title: 'Hours', type: 'string' },
        ],
      }],
    }),
    defineField({
      name:  'socialLinks',
      title: 'Social Links',
      type:  'object',
      fields: [
        { name: 'facebook',  title: 'Facebook URL',  type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'twitter',   title: 'X / Twitter URL', type: 'url' },
        { name: 'youtube',   title: 'YouTube URL',   type: 'url' },
      ],
    }),
    defineField({ name: 'googleMapsEmbedUrl', title: 'Google Maps Embed URL', type: 'url' }),
    defineField({
      name:  'announcementBar',
      title: 'Announcement Bar',
      type:  'object',
      fields: [
        { name: 'enabled', title: 'Show bar', type: 'boolean' },
        { name: 'message', title: 'Message',  type: 'string' },
        { name: 'link',    title: 'Link URL', type: 'url' },
      ],
    }),
  ],
  preview: { select: { title: 'dealerName' } },
});
