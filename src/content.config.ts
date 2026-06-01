import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const videos = defineCollection({
  loader: file('src/data/videos.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    meta: z.string().optional(),
    views: z.string().optional(),
  }),
});

export const collections = { videos };
