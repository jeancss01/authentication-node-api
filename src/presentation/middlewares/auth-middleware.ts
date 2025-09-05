import { type LoadAccountByToken } from '../../domain/usecases/load-account-by-token'
import { AccessDeniedError } from '../errors/access-denied-error'
import { forbidden, ok, serverError, unauthorized } from '../helpers/http/http-helper'
import type { HttpRequest, HttpResponse } from '../protocols/http'
import type { Middleware } from '../protocols/middleware'

export class AuthMiddleware implements Middleware {
  constructor (
    private readonly loadAccountByToken: LoadAccountByToken,
    private readonly role?: string
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { headers } = httpRequest
      let token: string | undefined
      const authHeader = headers.authorization || headers.Authorization
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim()
      }
      if (token) {
        console.log('Token received:', token)
        const account = await this.loadAccountByToken.load(token, this.role)
        console.log('Account loaded:', account)
        if (account) {
          return ok({ accountId: account.id })
        }
      }
      return forbidden(new AccessDeniedError())
    } catch (error) {
      const err = error as Error
      if (err.message === 'jwt expired') {
        console.error('Token expired22222:', err)
        return unauthorized()
      } else {
        console.error('Error in AuthMiddleware:', err)
      }
      return serverError(err)
    }
  }
}
