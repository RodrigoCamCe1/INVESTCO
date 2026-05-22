import type { Config } from "tailwindcss";

const config: Config = {
  // ====================================================================
  // DARK MODE
  // ====================================================================
  darkMode: ["class"],

  // ====================================================================
  // RUTAS DE CONTENIDO
  // ====================================================================
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // ====================================================================
  // TEMA (Extensible)
  // ====================================================================
  theme: {
    extend: {
      // ================================================================
      // COLORES PERSONALIZADOS
      // ================================================================
      colors: {
        // Brand colors
        brand: {
          primary: "#0066CC",
          secondary: "#6B7280",
          accent: "#F59E0B",
          danger: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
          info: "#3B82F6",
        },

        // Neutral palette
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
          950: "#030712",
        },

        // Status colors (para ERP)
        status: {
          active: "#10B981",
          pending: "#F59E0B",
          completed: "#3B82F6",
          cancelled: "#EF4444",
          on_hold: "#8B5CF6",
        },
      },

      // ================================================================
      // TYPOGRAFÍA
      // ================================================================
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        mono: ["Fira Code", "Monaco", "Courier New", "monospace"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },

      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      // ================================================================
      // ESPACIADO
      // ================================================================
      spacing: {
        0.5: "0.125rem",
        1.5: "0.375rem",
        2.5: "0.625rem",
        3.5: "0.875rem",
        4.5: "1.125rem",
        5.5: "1.375rem",
        6.5: "1.625rem",
        7.5: "1.875rem",
        8.5: "2.125rem",
        9.5: "2.375rem",
        10.5: "2.625rem",
        11.5: "2.875rem",
        12.5: "3.125rem",
        13: "3.25rem",
        14: "3.5rem",
        15: "3.75rem",
        16: "4rem",
        18: "4.5rem",
        20: "5rem",
        24: "6rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        40: "10rem",
        44: "11rem",
        48: "12rem",
        52: "13rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
        72: "18rem",
        80: "20rem",
        96: "24rem",
      },

      // ================================================================
      // BREAKPOINTS (Responsive)
      // ================================================================
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
        "4xl": "2560px",
      },

      // ================================================================
      // SOMBRAS
      // ================================================================
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        elevated: "0 10px 40px -10px rgb(0 0 0 / 0.2)",
      },

      // ================================================================
      // BORDES Y RADIO
      // ================================================================
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        base: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
      },

      // ================================================================
      // TRANSICIONES Y ANIMACIONES
      // ================================================================
      transitionDuration: {
        DEFAULT: "300ms",
        0: "0ms",
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },

      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        shimmer: "shimmer 2s infinite",
        fade: "fadeIn 0.3s ease-in",
        slideUp: "slideUp 0.3s ease-out",
        slideDown: "slideDown 0.3s ease-out",
      },

      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },

      // ================================================================
      // Z-INDEX
      // ================================================================
      zIndex: {
        0: "0",
        auto: "auto",
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        backdrop: "1040",
        offcanvas: "1050",
        modal: "1060",
        popover: "1070",
        tooltip: "1080",
        notification: "2000",
      },
    },
  },

  // ====================================================================
  // PLUGINS
  // ====================================================================
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],

  // ====================================================================
  // OPTIMIZACIONES DE COMPILACIÓN
  // ====================================================================
  safelist: [
    // Para status colors dinámicos
    {
      pattern: /^(bg|text|border|ring)-(status|brand|neutral|red|green|blue|yellow|purple)/,
    },
  ],
};

export default config;
