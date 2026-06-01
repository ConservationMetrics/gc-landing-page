import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Twilight-tinted neutral. Hue ~250 (between indigo and violet),
        // low saturation so it reads as a neutral surface rather than "purple",
        // matched in luminance to Tailwind `slate` so existing elevation steps
        // (body 900 / card 800 / raised 700 / hover 600) still hold.
        dusk: {
          50: "#f5f3fb",
          100: "#e6e2f3",
          200: "#c8c1e0",
          300: "#a299c4",
          400: "#786e9e",
          500: "#574e7a",
          600: "#3f3957",
          700: "#2a2640",
          800: "#1c1830",
          900: "#131022",
          950: "#08060f",
        },
      },
    },
  },
};
