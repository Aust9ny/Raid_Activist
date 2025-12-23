// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {},
  },
  // --- FIX FOR DYNAMIC DOTS ---
  safelist: [
    // Colors used dynamically in the polka dots
    { pattern: /bg-(pink|indigo|yellow|teal)-(400)/ }, 
    // Sizes used dynamically for dot width/height (w-2, w-3, w-4, h-2, h-3, h-4)
    { pattern: /w-(2|3|4)/ }, 
    { pattern: /h-(2|3|4)/ }, 
  ],
  // ---------------------------
  plugins: [],
}