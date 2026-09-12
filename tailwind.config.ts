import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#060606",
        charcoal: "#121212",
        bone: "#EDEAE3",
        ash: "#8A8781",
        hairline: "#242422",
        rust: "#7A2E2E",
      },
      fontFamily: {
        sans: [
          "Helvetica Neue",
          "Arial",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
        wider2: "0.18em",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
