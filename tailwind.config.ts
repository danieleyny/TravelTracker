import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",
        paper: "#F7F7F5",
        accent: "#0F5132",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
