import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1600px',
        '4xl': '1920px',
        '5xl': '2560px',
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // サンプルファイルの配色に合わせたカスタムカラー
        cream: {
          50: "#fefefe",
          100: "#fdf6e3",
          200: "#f7f0d9",
          300: "#e8e0c0",
          400: "#d4b494",
          500: "#c4a484",
          600: "#b39474",
          700: "#a28464",
          800: "#917454",
          900: "#806444",
        },
        warm: {
          50: "#fefefe",
          100: "#fdf6e3",
          200: "#f7f0d9",
          300: "#e8e0c0",
          400: "#d4b494",
          500: "#c4a484",
          600: "#b39474",
          700: "#a28464",
          800: "#917454",
          900: "#806444",
        },
        text: {
          primary: "#5a6c7d",
          secondary: "#7a8a9b",
          muted: "#7a8a9b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Noto Sans"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          '"Meiryo"',
          "sans-serif"
        ],
        japanese: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Noto Sans"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          '"Meiryo"',
          "sans-serif"
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1.125rem', { lineHeight: '1.7' }], // 基本サイズを18px相当に
        'lg': ['1.25rem', { lineHeight: '1.6' }],
        'xl': ['1.5rem', { lineHeight: '1.4' }],
        '2xl': ['1.875rem', { lineHeight: '1.3' }],
        '3xl': ['2.25rem', { lineHeight: '1.2' }],
        '4xl': ['3rem', { lineHeight: '1.1' }],
        '5xl': ['3.75rem', { lineHeight: '1' }],
        '6xl': ['4.5rem', { lineHeight: '1' }],
        '7xl': ['6rem', { lineHeight: '1' }],
        '8xl': ['8rem', { lineHeight: '1' }],
        '9xl': ['9rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
