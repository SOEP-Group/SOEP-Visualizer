/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}", "./views/**/*.ejs"],

  theme: {
    screens: {
      sm: '640px',
      md: '768px',
    },
    extend: {
      backgroundImage: {
        "loading-screen": "url('/images/background/earth-from-space.jpg')",
      },
      spacing: {
        '9/10': '90%',
      },
    },
  },
  ripple: (theme) => ({
    colors: theme("colors"),
  }),
  plugins: [require("tailwind-hamburgers")],
};
