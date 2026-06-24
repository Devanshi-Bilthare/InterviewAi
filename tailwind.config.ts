import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text-primary)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-text-primary)",
        },
        popover: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-text-primary)",
        },
        primary: {
          DEFAULT: "var(--color-accent-primary)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--color-accent-secondary)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--color-border)",
          foreground: "var(--color-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-accent-primary)",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "#FFFFFF",
        },
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-accent-primary)",
        deep: {
          bg: "#0A0F1E",
          card: "#111827",
          border: "#1F2937",
        },
        intelligence: {
          primary: "#6366F1",
          secondary: "#8B5CF6",
          violet: "#A78BFA",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        "text-primary": "#F9FAFB",
        "text-secondary": "#9CA3AF",
        chart: {
          "1": "var(--color-accent-primary)",
          "2": "var(--color-accent-secondary)",
          "3": "#10B981",
          "4": "#F59E0B",
          "5": "#EF4444",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "scale(1.08)",
            opacity: "0.2",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gradient-border": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "gradient-border": "gradient-border 3s ease infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-intelligence":
          "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.35)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.45)",
        "glow-violet": "0 0 24px rgba(139, 92, 246, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
