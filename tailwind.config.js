export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    borderRadius: {
      none: "0px",
      sm: "0px",
      DEFAULT: "0px",
      md: "0px",
      lg: "0px",
      xl: "0px",
      "2xl": "0px",
      "3xl": "0px",
      full: "0px"
    },
    extend: {
      colors: {
        // Мягкий “медицинский” primary (сине-циановый уклон)
        primary: {
          50: "#eef7ff",
          100: "#d9eeff",
          200: "#baddff",
          300: "#89c7ff",
          400: "#4eaaff",
          500: "#268bff",
          600: "#1a6fe6",
          700: "#1659c2",
          800: "#174c9c",
          900: "#173f7d"
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b"
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f"
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d"
        }
      }
    }
  },
  plugins: []
};