export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (message: string, ...args: Record<string, unknown>[]) => void
  info: (message: string, ...args: Record<string, unknown>[]) => void
  warn: (message: string, ...args: Record<string, unknown>[]) => void
  error: (message: string, ...args: Record<string, unknown>[]) => void
}

export const logger: Logger = {
  debug: (message: string, ...args: Record<string, unknown>[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },

  info: (message: string, ...args: Record<string, unknown>[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: Record<string, unknown>[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },

  error: (message: string, ...args: Record<string, unknown>[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
}

export default logger
