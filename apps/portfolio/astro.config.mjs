// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// CareerOS portfolio (module #1). Static, islands-free for now; the only
// future hydrated island will be the pokeable Kuwahara shader hero.
export default defineConfig({
  site: 'https://brianlee.dev',
  // hover-prefetch internal pages so card → case-study navigation feels instant
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  vite: {
    plugins: [tailwindcss()],
  },
});
