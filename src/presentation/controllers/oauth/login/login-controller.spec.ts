import { badRequest, unauthorized, ok, serverError } from '../../../helpers/http/http-helper'
import type { Validation } from '../../../protocols/validation'
import { LoginController } from './login-controller'
import type { HttpRequest } from '../../../protocols'
import type { OauthLogin } from '../../../../domain/usecases/oauth/login'
import type { AddAuthCode } from '../../../../domain/usecases/add-auth-code'
import { type Hasher } from '../../../../data/protocols/criptography/hasher'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    login: 'any_login',
    password: 'any_password',
    clientId: 'any_client_id',
    redirectUri: 'any_redirect_uri',
    codeChallenge: 'any_code_challenge',
    codeChallengeMethod: 'any_code_challenge_method'
  },
  query: {}
})
const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

const makeOauthLogin = (): OauthLogin => {
  class OauthLoginStub implements OauthLogin {
    async auth (input: any): Promise<string | null> {
      return 'any_account_id'
    }
  }
  return new OauthLoginStub()
}
const makeAddAuthCode = (): AddAuthCode => {
  class AddAuthCodeStub implements AddAuthCode {
    async add (input: any): Promise<any> {
      return {
        code: 'hashed_code',
        clientId: input.clientId,
        accountId: input.accountId,
        codeChallenge: input.codeChallenge,
        codeChallengeMethod: input.codeChallengeMethod,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiration
        createdAt: new Date()
      }
    }
  }
  return new AddAuthCodeStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return 'hashed_value'
    }

    async createHash (value: string): Promise<string> {
      return 'hashed_value'
    }
  }
  return new HasherStub()
}

interface SutTypes {
  sut: LoginController
  validation: Validation
  oauthLogin: OauthLogin
  hasher: Hasher
  addAuthCode: AddAuthCode
}

const makeSut = (): SutTypes => {
  const validation = makeValidation()
  const oauthLogin = makeOauthLogin()
  const addAuthCode = makeAddAuthCode()
  const hasher = makeHasher()
  const sut = new LoginController(validation, oauthLogin, addAuthCode, hasher)
  return {
    sut,
    validation,
    oauthLogin,
    addAuthCode,
    hasher
  }
}
describe('LoginController', () => {
  test('should return 400 if validation fails', async () => {
    const { sut, validation } = makeSut()
    jest.spyOn(validation, 'validate').mockReturnValueOnce(new Error('Invalid param'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new Error('Invalid param')))
  })

  test('should return 401 if auth fails', async () => {
    const { sut, oauthLogin } = makeSut()
    jest.spyOn(oauthLogin, 'auth').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('should return 200 if auth succeeds', async () => {
    const { sut, oauthLogin, addAuthCode, hasher } = makeSut()
    jest.spyOn(oauthLogin, 'auth').mockReturnValueOnce(Promise.resolve('any_account_id'))
    jest.spyOn(hasher, 'hash').mockReturnValueOnce(Promise.resolve('hashed_code'))
    const addSpy = jest.spyOn(addAuthCode, 'add')
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      code: 'hashed_code',
      redirect_uri: 'any_redirect_uri?code=hashed_code',
      expires_in: 900 // 15 minutes
    }))
    expect(addSpy).toHaveBeenCalledWith({
      code: 'hashed_code',
      clientId: 'any_client_id',
      accountId: 'any_account_id',
      codeChallenge: 'any_code_challenge',
      codeChallengeMethod: 'any_code_challenge_method',
      expiresAt: expect.any(Date),
      createdAt: expect.any(Date)
    })
  })

  test('should return 500 if an error occurs', async () => {
    const { sut, oauthLogin } = makeSut()
    jest.spyOn(oauthLogin, 'auth').mockImplementationOnce(() => {
      throw new Error('any_error')
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error('any_error')))
  })
})
