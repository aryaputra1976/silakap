import { ZodError } from 'zod'
import { AppError } from './app-error'

const formatZodErrors = (error: ZodError): Record<string, string[]> => {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path.join('.') || 'root'
    acc[field] = acc[field] ?? []
    acc[field].push(issue.message)
    return acc
  }, {})
}

export class ValidationError extends AppError {
  constructor(error: ZodError | Record<string, string[]>, message = 'Validasi gagal') {
    super(message, 422, error instanceof ZodError ? formatZodErrors(error) : error)
    this.name = 'ValidationError'
  }
}

export { formatZodErrors }
