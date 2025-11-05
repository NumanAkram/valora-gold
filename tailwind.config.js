/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Exact colors from screenshot
        'banner-green': '#4a7c59', // Exact green from screenshot
        'logo-green': '#1a4d1a',   // Dark green for logo
        'light-green': '#4a7c59',  // Same as banner
        'text-gray': '#374151',    // Dark gray for text
        'light-gray': '#f3f4f6',   // Light gray
        'search-gray': '#e5e7eb',  // Search bar gray
        'red-accent': '#dc2626'    // Red for offers
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
