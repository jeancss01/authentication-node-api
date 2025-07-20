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
        expiresAt: new Date(Date.now() + 100 * 1000), // 100 seconds expiration
        createdAt: new Date()
      })
      console.log('Login - codeChallenge salvo:', codeChallenge)
      console.log('Login - Token gerado:', code)

      return ok({
        code: authCode.code,
        redirect_uri: `${redirectUri}?code=${authCode.code}`,
        expiresIn: 100 // 100 seconds
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
