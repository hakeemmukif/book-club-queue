import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf4f3",
          100: "#fce8e6",
          200: "#f9d5d2",
          300: "#f4b5af",
          400: "#ec8b81",
          500: "#e06355",
          600: "#cb4538",
          700: "#aa372c",
          800: "#8d3129",
          900: "#762e28",
          950: "#401411",
        },
      },
    },
  },
  plugins: [],
};

export default config;
