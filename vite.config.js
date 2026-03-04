import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set base to repo name for GitHub Pages deployment
  // Change 'EMR-Jotform-Wrapper' to match your actual GitHub repo name
  base: '/EMR-JotForm-Wrapper/',
})
