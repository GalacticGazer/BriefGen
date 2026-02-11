import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e7ff",
          200: "#b8d1ff",
          300: "#8eb2ff",
          400: "#5f8bff",
          500: "#1a56db",
          600: "#174dc4",
          700: "#133ea0",
          800: "#102f7a",
          900: "#0d235b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
};

export default config;
