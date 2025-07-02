import { type OauthToken } from '../../../../domain/usecases/oauth/token'
import { badRequest, serverError, ok, unauthorized } from '../../../helpers/http/http-helper'
import { type Controller, type HttpRequest, type HttpResponse } from '../../../protocols'
import type { Validation } from '../../../protocols/validation'

export class TokenController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly authToken: OauthToken
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const { code, clientId, clientSecret, redirectUri, codeVerifier, grantType, refreshToken, scope } = httpRequest.body
      const tokenResponse = await this.authToken.token({
        code,
        clientId,
        clientSecret,
        redirectUri,
        codeVerifier,
        grantType,
        refreshToken,
        scope
      })
      if (!tokenResponse) {
        return unauthorized()
      }
      return ok(tokenResponse)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
