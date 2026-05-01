import colors from "tailwindcss/colors";

const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Green as primary, red as danger/alerts
        primary: colors.emerald,
        danger: colors.red,
      },
    },
  },
  plugins: [],
};

export default config;
