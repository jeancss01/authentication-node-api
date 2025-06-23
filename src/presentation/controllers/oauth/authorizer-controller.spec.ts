import { badRequest, ok, unauthorized, serverError } from '../../helpers/http/http-helper'
import type { Authorization } from '../../../domain/usecases/authorization'
import type { Validation } from '../../protocols/validation'
import { AuthorizerController } from './authorizer-controller'
import type { HttpRequest } from '../../protocols'

const makeFakeRequest = (): HttpRequest => ({
  query: {
    clientId: 'any_client_id',
    redirectUri: 'any_redirect_uri',
    email: 'any_email@email.com',
    password: 'any_password',
    codeChallenge: 'any_code_challenge',
    codeChallengeMethod: 'any_code_challenge_method'
  }
})

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

const makeAuthorization = (): Authorization => {
  class AuthorizationStub implements Authorization {
    async authorize (input: any): Promise<string | null> {
      return 'any_redirect_uri'
    }
  }
  return new AuthorizationStub()
}

interface SutTypes {
  sut: AuthorizerController
  validation: Validation
  authorization: Authorization
}

const makeSut = (): SutTypes => {
  const validationStub = makeValidation()
  const authorizationStub = makeAuthorization()
  const sut = new AuthorizerController(validationStub, authorizationStub)
  return {
    sut,
    validation: validationStub,
    authorization: authorizationStub
  }
}

describe('Authorizer Controller', () => {
  test('should return 400 if validation fails', async () => {
    const { sut, validation } = makeSut()
    jest.spyOn(validation, 'validate').mockReturnValueOnce(new Error('Invalid param'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new Error('Invalid param')))
  })

  test('should return 401 if authorization fails', async () => {
    const { sut, authorization } = makeSut()
    jest.spyOn(authorization, 'authorize').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('should return 200 if authorization succeeds', async () => {
    const { sut, authorization } = makeSut()
    jest.spyOn(authorization, 'authorize').mockReturnValueOnce(Promise.resolve('any_redirect_uri'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({ redirectForUri: 'any_redirect_uri', isRedirect: true }))
  })

  test('should return 500 if an error occurs', async () => {
    const { sut, authorization } = makeSut()
    jest.spyOn(authorization, 'authorize').mockImplementationOnce(() => {
      throw new Error('any_error')
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error('any_error')))
  })
})
