import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        panel: "#ffffff",
        surface: "#f6f7f9",
        line: "#e4e7ec",
        brand: "#1b6b68",
        accent: "#b95f1d",
        signal: "#2364aa"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17, 24, 39, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
