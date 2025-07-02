import type { OauthLogin } from '../../../../domain/usecases/oauth/login'
import type { AddAuthCode } from '../../../../domain/usecases/add-auth-code'
import { badRequest, ok, serverError, unauthorized } from '../../../helpers/http/http-helper'
import type { Controller, HttpRequest, HttpResponse } from '../../../protocols'
import type { Validation } from '../../../protocols/validation'
import type { Hasher } from '../../../../data/protocols/criptography/hasher'

export class LoginController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly oauthLogin: OauthLogin,
    private readonly addAuthCode: AddAuthCode,
    private readonly hasher: Hasher

  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const { email, password, clientId, redirectUri, codeChallenge, codeChallengeMethod } = httpRequest.body
      const accountId = await this.oauthLogin.auth({
        email,
        password
      })

      if (!accountId) {
        return unauthorized()
      }

      const code = await this.hasher.hash('')
      const authCode = await this.addAuthCode.add({
        code,
        clientId,
        accountId,
        codeChallenge,
        codeChallengeMethod,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiration
        createdAt: new Date()
      })

      return ok({
        code: authCode.code,
        redirect_uri: `${redirectUri}?code=${authCode.code}`,
        expires_in: 900 // 15 minutos
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
