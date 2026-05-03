export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2D3748',
      }
    },
  },
  plugins: [],
  rules: {
    "react/jsx-uses-vars": "error",
    "react/jsx-uses-react": "error"
  }
}