import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'

const logger = createLogger('info', { prefix: '[vite]' })
const originalInfo = logger.info
logger.info = (msg, options) => {
  // Silence HMR update and page reload messages to keep terminal clean
  if (msg.includes('hmr update') || msg.includes('page reload')) return
  originalInfo(msg, options)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  customLogger: logger,
})
