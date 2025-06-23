import type { Authorization } from '../../../domain/usecases/authorization'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http/http-helper'
import type { Controller, HttpRequest, HttpResponse } from '../../protocols'
import type { Validation } from '../../protocols/validation'

export class AuthorizerController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly authorization: Authorization
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.query)
      if (error) {
        return badRequest(error)
      }
      const { clientId, redirectUri, email, password, codeChallenge, codeChallengeMethod } = httpRequest.query
      const redirectForUri = await this.authorization.authorize({
        clientId,
        redirectUri,
        email,
        password,
        codeChallenge,
        codeChallengeMethod
      })
      if (!redirectForUri) {
        return unauthorized()
      }
      return ok({ redirectForUri, isRedirect: true })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
