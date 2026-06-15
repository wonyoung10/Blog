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
        ink: "#1f2933",
        paper: "#fbfaf7",
        moss: "#3f5f45",
        rust: "#a14f2b",
        steel: "#3b5f7a"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 41, 51, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
