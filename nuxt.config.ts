// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: 
  [
    '@nuxtjs/tailwindcss' ,
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@nuxt/icon',
  ],
  css: 
  [
    '@/assets/css/activity-post-dots.css', // <-- NEW: Import the dot styles
  ],
  runtimeConfig: 
  {
    public: {
      // Must match the API_BASE_URL defined in your /frontend/.env file
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
    }
  },
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './app/assets/my-icons'
      },
    ],
  }
})