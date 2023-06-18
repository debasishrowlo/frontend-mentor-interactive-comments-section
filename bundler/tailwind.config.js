const defaultTheme = require('tailwindcss/defaultTheme')
const globEntries = require('webpack-glob-entries-extended')

const paths = require("./paths.js")

// NOTE: Required because webpack does not support extended globs
const content = Object.values(globEntries(paths.src + "/**/*.{html,js,jsx,ts,tsx}"))

const fontSizes = {}
const minFontSize = 12
const maxFontSize = 50
let i = minFontSize
while (i <= maxFontSize) {
  fontSizes[i] = `${i / 16}rem`
  i = i + 2
}

module.exports = {
  content: content,
  theme: {
    fontSize: { ...fontSizes },
    extend: {
      fontFamily: {
        'rubik': ['Rubik', ...defaultTheme.fontFamily.sans],
      },
      fontWeight: {
        "weight-400": 400,
        "weight-500": 500,
        "weight-700": 700,
      },
      colors: {
        "light-grayish-blue": "hsl(239, 57%, 85%)",
        "grayish-blue": "hsl(211, 10%, 45%)",

        "moderate-blue": "hsl(238, 40%, 52%)",
        "dark-blue": "hsl(212, 24%, 26%)",

        "pale-red": "hsl(357, 100%, 86%)",
        "soft-red": "hsl(358, 79%, 66%)",

        "very-light-gray": "hsl(228, 33%, 97%)",
        "light-gray": "hsl(223, 19%, 93%)",

        "white": "hsl(0, 0%, 100%)",
      },
    },
  },
  plugins: [],
}