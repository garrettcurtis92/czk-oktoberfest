// tailwind.config.cjs
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Fraunces", "serif"],
      },
      colors: {
        sand: "#FFF5E9",
        charcoal: "#2F3440",
        team: {
          red: "#E45757",
          orange: "#F39B2B",
          yellow: "#F3D23B",
          green: "#36B37E",
          blue: "#2F80ED",
          purple: "#8C59D9",
        },
      },
    },
  },
  plugins: [],
};
