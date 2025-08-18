/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
     colors: {
  'primary': '#800080',  // deep purple
  'primary-light': '#D8BFD8', // lighter purple (for backgrounds, hover, etc.)
  'background': '#F4F4F4', // light gray background
  'card': '#FFFFFF',      // card background
}
    },
  },
  plugins: [],
}

