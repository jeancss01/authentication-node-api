import { ServerError, UnauthorizedError } from '../../errors'
import { NotFound } from '../../errors/not-found-error'
import type { HttpResponse } from '../../protocols/http'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: new ServerError(error.stack)
})

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})

export const unauthorized = (): HttpResponse => ({
  statusCode: 401,
  body: new UnauthorizedError()
})

export const notFound = (): HttpResponse => ({
  statusCode: 404,
  body: new NotFound()
})

export const forbidden = (error: Error): HttpResponse => ({
  statusCode: 403,
  body: error
})
