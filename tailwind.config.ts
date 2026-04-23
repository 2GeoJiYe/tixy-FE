import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--color-muted-foreground) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--color-primary-foreground) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
      },
      borderRadius: {
        card: "1rem",
        button: "0.85rem",
        input: "0.85rem",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.05)",
        panel: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "\"Noto Sans KR\"",
          "\"Apple SD Gothic Neo\"",
          "\"Malgun Gothic\"",
          "sans-serif",
        ],
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
