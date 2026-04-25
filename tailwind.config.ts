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
        card: "0.5rem",
        button: "999px",
        input: "999px",
      },
      boxShadow: {
        card: "0 14px 36px rgba(24, 24, 27, 0.045)",
        panel: "0 22px 55px rgba(24, 24, 27, 0.08)",
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
