export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
}

export const logger: Logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  }
}

export default logger