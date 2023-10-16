// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: 'https://cdn.jsdelivr.net/npm/@hotwired/turbo@latest' }],
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag.startsWith('turbo'),
    },
  },
  vite: process.env.DEV ? {
    resolve: {
      alias: {
        '@miii/turbo-multiple-frame-targeting': '../src'
      }
    }
  } : {},
})
