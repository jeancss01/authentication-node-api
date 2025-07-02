import { badRequest, ok, unauthorized, serverError } from '../../../helpers/http/http-helper'
import type { Validation } from '../../../protocols/validation'
import { TokenController } from './token-controller'
import type { HttpRequest } from '../../../protocols'
import type { OauthToken, OauthTokenModel, OauthTokenResponse } from '../../../../domain/usecases/oauth/token'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    code: 'any_code',
    clientId: 'any_client_id',
    clientSecret: 'any_client_secret',
    redirectUri: 'any_redirect_uri',
    codeVerifier: 'any_code_verifier',
    grantType: 'authorization_code',
    refreshToken: 'any_refresh_token'
  }
})

const makeFakeTokenResponse = (): OauthTokenResponse => ({
  accessToken: 'any_access_token',
  refreshToken: 'any_refresh_token',
  expiresIn: 3600,
  tokenType: 'Bearer'
})

const makeToken = (): OauthToken => {
  class OauthTokenStub implements OauthToken {
    async token (input: OauthTokenModel): Promise<OauthTokenResponse | null> {
      return makeFakeTokenResponse()
    }
  }
  return new OauthTokenStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

interface SutTypes {
  sut: TokenController
  validationStub: Validation
  authTokenStub: OauthToken
}

const makeSut = (): SutTypes => {
  const validationStub = makeValidation()
  const authTokenStub = makeToken()
  const sut = new TokenController(validationStub, authTokenStub)
  return {
    sut,
    validationStub,
    authTokenStub
  }
}

describe('TokenController', () => {
  // Add your tests here
  test('should return 400 if validation fails', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error('Invalid field'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new Error('Invalid field')))
  })

  test('should return 500 if validation throws', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('should return 401 if authentication fails', async () => {
    const { sut, authTokenStub } = makeSut()
    jest.spyOn(authTokenStub, 'token').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('should return 200 if authentication succeeds', async () => {
    const { sut, authTokenStub } = makeSut()
    jest.spyOn(authTokenStub, 'token').mockReturnValueOnce(Promise.resolve(makeFakeTokenResponse()))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeTokenResponse()))
  })
})
